# CRITICAL REVIEW: install.js — OmniLearn Workflow Installer

**Reviewer**: AI Code Review
**Date**: 2026-07-27
**File**: `packages/omnilearn-workflow/bin/install.js` (815 lines)
**Scope**: Full install script audit + external research on oh-my-openagent, Context7 MCP, OpenCode config, and Node.js execSync behavior.

---

## EXECUTIVE SUMMARY

The script has **2 BLOCKER** and **5 MAJOR** issues that will cause install failures for real users. The two blockers (wrong oh-my-openagent flag, JSONC corruption) will cause either a hung/interactive install when `--yes` is used, or data loss in existing OpenCode configurations. The Context7 OAuth-based setup cannot complete via `execSync` with `stdio: 'pipe'`, making the auto-configure path dead on arrival.

**Overall assessment: DO NOT ship in current state. Fix blockers first, then majors.**

---

## FINDINGS

### 🔴 BLOCKER 1: Wrong flag for oh-my-openagent non-interactive install

**Location**: Line 503  
**What's written**: `bunx oh-my-openagent install --yes`  
**What's correct**: `bunx oh-my-openagent install --no-tui`  

**Evidence**: The [oh-my-openagent CLI reference](https://github.com/code-yeongyu/oh-my-openagent/blob/8fe6674e/docs/reference/cli.md) lists `--no-tui` as the flag for non-interactive mode. There is no `--yes` flag in the CLI. The TUI/interactive mode (`install`) does use `@clack/prompts` internally, not a `--yes` flag.

**Impact**: When `--yes` (auto-install mode) is used:
1. `bunx oh-my-openagent install --yes 2>/dev/null` runs — `--yes` is silently ignored, the TUI launches
2. TUI waits for stdin input → hangs forever in `execSync` (blocking the Node process), OR if stdin is a TTY the TUI displays but expects interactive answers, defeating `--yes` mode
3. After timeout (120s), falls through to `|| bunx oh-my-openagent install` — same problem again
4. The catch block on line 521 catches the timeout and prints "installer needs interactive input" — the true error is the wrong flag, not the installer itself

**Fix**: Replace `--yes` with `--no-tui --platform=opencode`. Add provider flags if available, or `--skip-auth` to minimize interactivity:
```js
execSync('bunx oh-my-openagent install --no-tui --platform=opencode --skip-auth 2>/dev/null', {
  stdio: 'inherit',
  timeout: 120000,
});
```

---

### 🔴 BLOCKER 2: JSONC parsing failure destroys config file

**Location**: Lines 127-144 (read + write)

**The problem**: `JSON.parse()` cannot parse JSON with comments (JSONC). If the user has `opencode.jsonc` (which is the standard format for OpenCode config with comments), the `readOpenCodeConfig` function on line 136 will:
1. Read the file successfully
2. Call `JSON.parse(raw)` which throws on comments
3. Catch block returns `{ path: configPath, data: null }`
4. Downstream code treats this as "no config found" and either skips or writes new config

**Worse**: `writeOpenCodeConfig` (line 143) does `JSON.stringify(data, null, 2)` which **destroys all comments** in the file. If the config path is a `.jsonc` file, writing back will strip every comment.

**Impact**:
- User has `opencode.jsonc` with comments + oh-my-openagent configuration
- Script silently fails to detect existing oh-my-openagent plugin (returns null config)
- Falls through to install oh-my-openagent again (duplicate)
- When writing the Context7 config back, all comments in `opencode.jsonc` are destroyed
- The post-install refresh on line 510 also writes back, amplifying corruption

**Fix options** (pick one):
1. **Preferred**: Add a JSONC parser (e.g., `strip-json-comments` or `jsonc-parser` npm package — check if already a dependency). Use it to safely parse and preserve comments.
2. **Minimum viable**: When writing back, if the original file is `.jsonc`, use `jsonc-parser` to modify only the `mcp` key in-place rather than stringifying the whole object. If no JSONC parser is available, **refuse to write** to `.jsonc` files and warn the user.
3. **Workaround**: Always prefer `opencode.json` for writing. If only `opencode.jsonc` exists and no JSONC parser is available, log a clear warning and skip auto-config.

---

### 🟠 MAJOR 1: `npx ctx7 setup --opencode` requires interactive OAuth — cannot run via execSync(pipe)

**Location**: Lines 392-399

**What happens**: `execSync('npx ctx7 setup --opencode 2>/dev/null', { stdio: 'pipe', timeout: 30000 })`

**Why it breaks**:
- The `ctx7 setup` command [performs OAuth authentication](https://context7.com/docs/clients/opencode) — it opens a browser, waits for user authorization, then generates an API key
- With `stdio: 'pipe'`, the OAuth URL prompt and browser-open instructions are hidden
- With `2>/dev/null`, even error messages are silenced
- With a 30s timeout, the OAuth flow (which requires user action) will almost always time out
- When it times out, the catch block on line 400 runs the manual fallback — but the manual fallback writes config **without an API key**

**Impact**: The "auto-setup" path will always fail in non-interactive/pipe mode. Users will always fall through to manual config, which writes an MCP entry **without** `CONTEXT7_API_KEY` configured. The resulting MCP server will fail at runtime with auth errors.

**Fix**: Either:
1. **Skip `ctx7 setup` entirely in non-interactive mode**. Go straight to manual config with instructions for the user to get an API key.
2. **Use `stdio: 'inherit'` and remove `2>/dev/null`** so the user can see the OAuth instructions. But this still won't be truly non-interactive.
3. **Use the remote MCP mode instead** (no API key needed for basic usage):
   ```json
   {
     "context7": {
       "type": "remote",
       "url": "https://mcp.context7.com/mcp"
     }
   }
   ```
   Per [OpenCode's Context7 docs](https://opencode.ai/docs/mcp-servers/#context7), remote mode with no API key works with rate limits and is the recommended configuration.

---

### 🟠 MAJOR 2: Manual Context7 MCP fallback writes config without API key

**Location**: Lines 406-412

**The problem**: The manual config object writes:
```js
config.mcp.context7 = {
  type: 'local',
  command: ['npx', '-y', '@upstash/context7-mcp@latest'],
  enabled: true,
};
```

This has no API key. Per the [Context7 OpenCode setup docs](https://upstash-context7.mintlify.app/mcp/opencode), local mode requires either `--api-key` flag or `CONTEXT7_API_KEY` environment variable. Without it, the MCP process will fail.

Additionally, this writes to the **`mcp`** key in `opencode.json`, but for local servers, OpenCode expects the `environment` key for env vars (not `env`). There's no environment block provided.

**Fix**:
```js
config.mcp.context7 = {
  type: 'local',
  command: ['npx', '-y', '@upstash/context7-mcp'],
  environment: {
    CONTEXT7_API_KEY: '{env:CONTEXT7_API_KEY}',
  },
  enabled: true,
};
```
Or better, use remote mode:
```js
config.mcp.context7 = {
  type: 'remote',
  url: 'https://mcp.context7.com/mcp',
  enabled: true,
};
```
(Remote mode with no API key works with rate limits; with API key: add headers block.)

---

### 🟠 MAJOR 3: `execSync` pipe buffer can deadlock on large output

**Location**: Lines 254, 393, 484, 503

**The problem**: All `execSync` calls use `{ stdio: 'pipe' }` without setting `maxBuffer`. Node.js docs warn:

> "These pipes have limited (and platform-specific) capacity. If the subprocess writes to stdout in excess of that limit without the output being captured, the subprocess blocks."

The default `maxBuffer` is 1MB (1024 × 1024 bytes). The `bunx oh-my-openagent install` and `curl -fsSL https://bun.sh/install | bash` commands can produce substantial output (progress bars, npx/bunx download logs, install script verbose output).

For `npx ctx7 setup --opencode` (line 393), a 30s timeout with interactive OAuth means it almost always times out — but even if it didn't, the npx first-run download could exceed the 1MB buffer, causing `ENOBUFS` error.

**Impact**: Intermittent `spawnSync /bin/sh ENOBUFS` failures that are hard to reproduce, especially on slow connections or large npx downloads.

**Fix**: Add `maxBuffer: 10 * 1024 * 1024` (10MB) to all `execSync` calls. For the curl-pipe-bash calls (lines 254, 484), consider `stdio: 'inherit'` instead since the output should be visible to the user anyway:
```js
execSync('curl -fsSL https://opencode.ai/install | bash', {
  stdio: 'inherit',
  timeout: 120000,
});
```

---

### 🟠 MAJOR 4: Bun PATH not available after curl-install via execSync

**Location**: Lines 463-497

**The problem**: If Bun is not installed, the script installs it via `execSync('curl -fsSL https://bun.sh/install | bash', { stdio: 'pipe' })`.

The Bun install script typically appends to `~/.bashrc` / `~/.zshrc` and adds to PATH for **future** shells. But `execSync` spawns a **new non-login non-interactive shell** (`/bin/sh -c`) which does NOT source `~/.bashrc` / `~/.zshrc`. So immediately after installation, the next `execSync('bunx oh-my-openagent install --yes...')` on line 503 will try to run `bunx` — but `bun` may not be in PATH because:
1. The Bun install script added `export PATH="$HOME/.bun/bin:$PATH"` to `~/.bashrc`
2. `/bin/sh -c` does not source `~/.bashrc`
3. `which bun` would fail, `bunx` would fail with "command not found"

The `isBunAvailable()` check on line 118 runs immediately after the install attempt, but uses the same shell environment — it would also fail for the same reason, yet the code doesn't re-check after installation. It assumes installation succeeded and proceeds directly to `bunx`.

**Impact**: After installing Bun, the subsequent `bunx oh-my-openagent install` command fails because `bun` is not in the shell PATH. The error catch (line 521) blames oh-my-openagent rather than the actual PATH issue.

**Fix options**:
1. After Bun install, detect the Bun binary location (usually `~/.bun/bin/bun`) and use its full path
2. Set PATH explicitly before running bunx:
   ```js
   const bunPath = path.join(os.homedir(), '.bun', 'bin');
   execSync('bunx oh-my-openagent install --no-tui --platform=opencode', {
     stdio: 'inherit',
     timeout: 120000,
     env: { ...process.env, PATH: `${bunPath}:${process.env.PATH}` },
   });
   ```
3. Re-check `isBunAvailable()` after install and handle failure with a clear error.

---

### 🟠 MAJOR 5: Context7 setup path writes to wrong config file (mcp.json vs opencode.json)

**Location**: Lines 389-431

**Evidence from research**:
- The `npx ctx7 setup --opencode` command writes to [`~/.config/opencode/mcp.json`](https://upstash-context7.mintlify.app/cli/setup) — a **separate** file from `opencode.json`
- The script's manual fallback writes to `opencode.json` or `opencode.jsonc` under the `mcp` key
- OpenCode merges both, but if both files define a `context7` MCP entry, one may silently override the other depending on merge order
- The Context7 CLI writes `mcpServers` format (like Claude Code), while OpenCode uses `mcp` format — these are **different schemas**

**Impact**: If the user runs both the script and `ctx7 setup` separately, they end up with conflicting Context7 configurations in two files. Debugging which one wins is non-trivial.

**Fix**: After calling `npx ctx7 setup --opencode`, verify the resulting config. Or skip `ctx7 setup` entirely and write directly to `opencode.json` using the correct OpenCode `mcp` format, which the script already does in the fallback.

---

### 🟡 MINOR 1: Context7 should use remote mode, not local

**Location**: Lines 408-412

Per [OpenCode's official MCP docs](https://opencode.ai/docs/mcp-servers/#context7), the **recommended** Context7 setup uses **remote** mode — no local Node.js runtime required, no npx overhead, no API key needed for basic usage:
```json
{
  "context7": {
    "type": "remote",
    "url": "https://mcp.context7.com/mcp"
  }
}
```

The script always configures local mode which requires Node.js 18+ on the user's system — an unnecessary dependency.

**Fix**: Default to remote mode. Offer local mode as a secondary option or skip it entirely.

---

### 🟡 MINOR 2: `which` check is not portable

**Location**: Lines 111, 120, 225

The `which` command has different behavior across platforms:
- On some systems, `which` exits non-zero even when the binary exists (if the binary is a shell built-in or alias)
- `command -v` is POSIX and more reliable
- Alpine Linux uses BusyBox `which` which has different exit codes

**Fix**: Replace `which opencode 2>/dev/null` with `command -v opencode 2>/dev/null`.

---

### 🟡 MINOR 3: Dead code — duplicate `isBunInstalled` function

**Location**: Lines 223-230

`isBunInstalled()` is identical to `isBunAvailable()` (lines 118-125) and is never called anywhere in the script. Remove it.

---

### 🟡 MINOR 4: Plugin version mismatch in fallback push

**Location**: Lines 514-515

The fallback pushes `'oh-my-openagent@latest'` to the `plugin` array, but oh-my-openagent's own installer writes just `'oh-my-openagent'` (no `@latest` suffix). Both work, but inconsistency could confuse users examining their config.

**Fix**: Push `'oh-my-openagent'` (without `@latest`) to match what oh-my-openagent's installer writes.

---

### ℹ️ INFO 1: OpenCode install URL is correct

**Confirmed**: `https://opencode.ai/install` is the official and correct URL. Verified against:
- [opencode.ai/docs](https://opencode.ai/docs) — "The easiest way to install OpenCode is through the install script: `curl -fsSL https://opencode.ai/install | bash`"
- [GitHub README](https://github.com/anomalyco/opencode) — same URL
- [install script source](https://github.com/anomalyco/opencode/blob/main/install) — is the actual script

**Status**: ✅ No change needed.

---

### ℹ️ INFO 2: Plugin detection logic is mostly correct

The `isOhMyOpenAgentInstalled` function checks `config.plugin` array for entries containing `oh-my-openagent` or `oh-my-opencode`. This covers both the current name and the legacy name. The CLI installer source confirms the plugin is registered as `"oh-my-openagent"` in `opencode.json`'s `plugin` array.

However, the detection fails silently when `readOpenCodeConfig` returns null due to JSONC parsing issues (see 🔴 BLOCKER 2).

---

## SUMMARY TABLE

| # | Severity | Area | Issue | Fix complexity |
|---|----------|------|-------|----------------|
| 1 | 🔴 BLOCKER | oh-my-openagent | `--yes` flag doesn't exist; should be `--no-tui` | 1 line change |
| 2 | 🔴 BLOCKER | Config file | `JSON.parse` can't parse JSONC; `JSON.stringify` destroys comments | Medium (add JSONC parser) |
| 3 | 🟠 MAJOR | Context7 | `npx ctx7 setup --opencode` requires interactive OAuth; will always hang/fail with `stdio: 'pipe'` | Medium (skip or use remote) |
| 4 | 🟠 MAJOR | Context7 | Manual fallback writes MCP config without API key | 1 line change |
| 5 | 🟠 MAJOR | execSync | Pipe buffer can deadlock on large output; no `maxBuffer` set | Add `maxBuffer` + use `inherit` |
| 6 | 🟠 MAJOR | Bun | PATH not refreshed after curl-install of Bun | Re-check + use full path |
| 7 | 🟠 MAJOR | Context7 | `ctx7 setup` writes to `mcp.json` while script fallback writes to `opencode.json` — conflict | Medium |
| 8 | 🟡 MINOR | Context7 | Uses local mode (requires Node.js) instead of simpler remote mode | 1 line change |
| 9 | 🟡 MINOR | Portability | `which` not POSIX-portable; use `command -v` | 3 lines change |
| 10 | 🟡 MINOR | Dead code | `isBunInstalled()` duplicates `isBunAvailable()`; never called | Remove function |
| 11 | 🟡 MINOR | oh-my-openagent | Fallback pushes `oh-my-openagent@latest`; installer writes `oh-my-openagent` | 1 line change |
| 12 | ℹ️ INFO | OpenCode URL | `https://opencode.ai/install` is correct | No change needed |

---

## RECOMMENDED FIX ORDER

1. **(BLOCKER)** Fix `--yes` → `--no-tui` for oh-my-openagent install
2. **(BLOCKER)** Fix JSONC parsing — add a `jsonc-parser` dependency or switch to `opencode.json` only with clearer docs
3. **(MAJOR)** Replace Context7 `npx ctx7 setup` interactive OAuth path with direct remote MCP config
4. **(MAJOR)** Add API key / env block to Context7 manual config
5. **(MAJOR)** Fix Bun PATH issue — use full path to bun binary
6. **(MAJOR)** Add `maxBuffer` to all `execSync` calls; use `stdio: 'inherit'` for user-facing installs
7. **(MINOR)** Clean up remaining minor issues

## WHAT WORKS WELL

- Clean CLI argument parsing (`--yes`, `--help`, `--version`, `--check`)
- Good UX with `@clack/prompts`, `picocolors`, and `boxen`
- `confirmRemoteScript` is a thoughtful supply-chain security measure
- Post-copy verification step (lines 340-349) is solid
- Health check command (`--check`) provides useful diagnostics
- Sensible use of timeout values (30s-120s)
- Good separation of concerns with async step functions
- Error messages include actionable next steps
