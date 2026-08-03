# CRITICAL REVIEW v2: install.js — OmniLearn Workflow Installer

**Reviewer**: AI Code Review
**Date**: 2026-08-03
**File**: `packages/omnilearn-workflow/bin/install.js`
**Scope**: Fresh audit of the CURRENT state (post-v1 fixes), with live command verification against oh-my-openagent CLI + SearXNG research. Focus: dependency installation correctness and command validity.

---

## EXECUTIVE SUMMARY

**1 BLOCKER and 3 MAJOR issues found, all fixed in this commit.** The blocker would have silently broken `--yes` installs for every user: the oh-my-openagent non-interactive command failed CLI validation (hidden by `2>/dev/null`), and the Bun install dance was entirely unnecessary. The v1 fixes (JSONC-safe config, remote Context7) are confirmed good. **Verdict: ship-ready after these fixes.**

---

## LIVE VERIFICATION (what was actually tested)

All commands below were executed in a sandbox `HOME` (`/tmp/omotest*`) with the real oh-my-openagent@4.19.4 CLI:

| Command | Result |
|---|---|
| `bunx oh-my-openagent install --no-tui --platform=opencode --skip-auth` (OLD, in v1.3.2) | ❌ **Validation failed**: `--claude` required, `--gemini` required, `--copilot` required |
| `bunx oh-my-openagent install --no-tui --platform=opencode --claude=no --openai=no --gemini=no --copilot=no --skip-auth` | ✅ Exit 0, plugin `oh-my-openagent@latest` registered |
| `npx -y oh-my-openagent@latest install --no-tui --platform=opencode --claude=no --openai=no --gemini=no --copilot=no --skip-auth` | ✅ Exit 0, same result — **no Bun required** |

---

## FINDINGS

### 🔴 BLOCKER 1 (FIXED): `--no-tui` requires provider flags the script never passed

**Location**: `ensureOhMyOpenAgent()` → `execSync` call

**What was wrong**: The v1 fix changed `--yes` → `--no-tui --platform=opencode --skip-auth`, but oh-my-openagent's non-interactive validation ([cli-installer.ts](https://github.com/code-yeongyu/oh-my-openagent/blob/fbcdeab6/src/cli/cli-installer.ts)) **requires `--claude`, `--gemini`, and `--copilot`** whenever `--no-tui` is set. The script's `2>/dev/null` hid the validation error, and the catch block blamed "interactive input needed".

**Evidence**: Live run reproduced `[X] Validation failed: --claude is required / --gemini is required / --copilot is required`. Confirmed against the CLI source: `Usage: bunx oh-my-openagent install --no-tui --claude=<no|yes|max20> --gemini=<no|yes> --copilot=<no|yes>`.

**Fix applied**:
```js
execSync(
  'npx -y oh-my-openagent@latest install --no-tui --platform=opencode --claude=no --openai=no --gemini=no --copilot=no --skip-auth',
  { stdio: 'inherit', timeout: 180000, maxBuffer: 10 * 1024 * 1024 },
);
```
- `--claude=no --gemini=no --copilot=no` satisfy the validator without binding any subscription (providers are configured later in OpenCode).
- `2>/dev/null` removed so real errors surface.
- Locked by a new test assertion (test-install.mjs) so this regression cannot return.

### 🟠 MAJOR 1 (FIXED): Bun install step was unnecessary — removed entirely

**What was wrong**: The script installed Bun (`curl -fsSL https://bun.sh/install | bash`) purely to run `bunx oh-my-openagent`. Per [oh-my-openagent docs](https://github.com/code-yeongyu/oh-my-openagent/blob/HEAD/docs/guide/installation.md): `npx oh-my-openagent install` is the documented alternative to `bunx`, and "the CLI ships with standalone binaries for all major platforms — no runtime (Bun/Node.js) is required for CLI execution after installation."

**Impact of removing it**:
- Deletes a `curl | bash` supply-chain step (the most dangerous class of command in the script).
- Deletes the whole PATH-refresh failure mode (v1 MAJOR 4: freshly-installed Bun not on PATH).
- Node.js is guaranteed (the user is running the installer via `npx`), so `npx -y oh-my-openagent@latest install` always works.
- Simplifies: `isBunAvailable()`, the Bun health-check entry, and ~60 lines removed.

### 🟠 MAJOR 2 (FIXED): `PKG_VERSION` hardcoded `'1.1.0'` while package.json was `1.3.2`

**What was wrong**: `--version` printed a stale version. The constant had drifted two releases behind and would keep drifting.

**Fix applied**: Read from package.json at load:
```js
const PKG_VERSION = JSON.parse(fs.readFileSync(path.join(PKG_DIR, 'package.json'), 'utf-8')).version;
```

### 🟠 MAJOR 3 (FIXED): `bin/install-critic-review.md` was shipping in the npm tarball

**What was wrong**: `npm pack --dry-run` showed `bin/install-critic-review.md` (16.8 kB) inside the published package — an internal review document no consumer needs.

**Fix applied**: Moved to `docs/install-critic-review-v1.md` (repo-level, not in the package `files` allowlist).

### ℹ️ MINOR notes (accepted / already correct)

- **Context7 remote MCP** (v1 MAJOR 1/2/5 fix) — confirmed correct: `{"type": "remote", "url": "https://mcp.context7.com/mcp", "enabled": true}` is the recommended no-API-key configuration per OpenCode docs. ✅
- **`--platform=opencode`** is technically redundant (defaults to `opencode`) but kept for explicitness. ✅
- **Package name**: the npm package is `oh-my-openagent` (docs commit f940cb4 explicitly recommends `bunx oh-my-openagent install` over the `oh-my-opencode` binary name; `npx` is the documented alternative). The script now uses `npx oh-my-openagent@latest`, matching the canonical package. ✅
- **Dependencies**: `@clack/prompts ^1.7.0` (latest), `picocolors ^1.1.0` (bump to `^1.1.1`), `boxen ^8.0.0` (bump to `^8.0.1`). Node >= 18 requirement is correct for ESM-only `boxen@8`.
- **Health check** still covers: OpenCode, command files, Context7 MCP, oh-my-openagent plugin, learning directory. Bun check removed (no longer relevant).

---

## WHAT WORKS WELL (unchanged, verified)

- JSONC-safe config read/write (`readOpenCodeConfigSafe` / `writeOpenCodeConfigSafe`) with comment-loss warning. ✅
- `confirmRemoteScript` supply-chain confirmation before any `curl | bash`. ✅
- Post-copy verification + `--check` health diagnostics. ✅
- Clean CLI arg parsing (`--yes`, `--help`, `--version`, `--check`). ✅
- Test suite (21 tests) — now includes regression locks for the required flags + npx usage.

---

## SUMMARY TABLE

| # | Severity | Area | Issue | Status |
|---|----------|------|-------|--------|
| 1 | 🔴 BLOCKER | oh-my-openagent | `--no-tui` without required `--claude/--gemini/--copilot` → install fails; `2>/dev/null` hid it | ✅ Fixed + test-locked |
| 2 | 🟠 MAJOR | Bun | Whole Bun-install step unnecessary (npx works; docs say no runtime needed) | ✅ Removed |
| 3 | 🟠 MAJOR | Versioning | `PKG_VERSION` hardcoded 1.1.0 vs package.json 1.3.2 | ✅ Reads package.json |
| 4 | 🟠 MAJOR | Packaging | `install-critic-review.md` shipped in tarball | ✅ Moved to docs/ |
| 5 | ℹ️ INFO | Context7 | Remote MCP config correct | ✅ No change |
| 6 | ℹ️ INFO | Deps | picocolors ^1.1.1, boxen ^8.0.1 | ⚠️ Bumped in package.json |

---

*Review methodology: live sandbox execution of every install command against oh-my-openagent@4.19.4 + SearXNG research on the official CLI reference, installation guide, and CLI source (cli-installer.ts / cli-program.ts).*
