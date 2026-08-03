# OmniLearn Architecture

> How OmniLearn's six commands are structured, how they orchestrate agents, and how the pieces fit together. Read this before modifying the commands.

## Overview

OmniLearn is a set of **OpenCode commands** (markdown files installed to `~/.config/opencode/command/`) that turn an interactive coding agent into a learning system. Each command is a self-contained prompt that the OpenCode agent executes: it reads context files, orchestrates research, writes structured learning artifacts, and updates progress tracking.

There are no binaries or services. The only executable code is the npm installer (`bin/install.js`) that places the commands on disk.

## The six commands

| Command | Purpose | Flow shape |
|---|---|---|
| `omnilearn-init` | Set up the learning directory + global preferences | Linear (no delegation) |
| `omnilearn-roadmap` | Research + synthesize a personalized roadmap for a skill | Research **team** → single synthesizer delegate |
| `omnilearn-roadmap-edit` | Revise an existing roadmap without losing progress | Progress inventory → research **team** → single update delegate |
| `omnilearn-start` | Interactive learning sessions with assignments + tests | Research **team** per topic → main agent creates content → `oracle` critic |
| `omnilearn-refine` | Deep-dive or answer questions on a subtopic | QUESTION: single diagnostic delegate · REFINE: research **team** → single update delegate |
| `omnilearn-research` | Popperian multi-agent deep research | Lit-review **team** → single hypothesis delegate → **adversarial evidence team** → single synthesis delegate |

## Orchestration model

### Teams (parallel research)

Any phase with **2+ independent research/analysis agents** runs as a **team** (`team_create` with an inline spec). Team members are category-routed workers whose prompts are fully self-contained: read context → research → write deliverable file (or report findings) → report to the lead.

The lifecycle per team:

1. **Create** — `team_create({ inline_spec: { name, members: [...] } })`
2. **Track** — `team_task_create` one task per deliverable; `team_send_message` dispatches each member (claim → execute → `completed` → report)
3. **Wait** — `team_task_list` until every task is terminal (members run in parallel; no polling)
4. **Close** — the **Closure Contract**: once all tasks are `completed`/`failed`, shut down every member (`team_shutdown_request` → `team_approve_shutdown`) and `team_delete`

Member dependencies are expressible via `blockedBy` (used by `omnilearn-research` Phase 1: the merge member waits on the two angle reviewers).

**Fallback**: if the `team_*` tools are unavailable (team mode disabled), commands fall back to `task()` background delegates with identical prompts — behavior degrades gracefully, parallelism is lost, correctness is not.

### Delegates (serial work)

Single-deliverable, serial steps stay individual `task()` calls — a one-member team is ceremony, not value. Examples: roadmap synthesis, roadmap update, diagnostic-task creation, hypothesis formation, final synthesis.

### Oracle critics (never teams)

Quality review (`omnilearn-start`, `omnilearn-roadmap`) uses `oracle` agents — **`oracle` is not a team-eligible agent type**, so critics always run as individual background delegates that read created content and write `critic-review.md`. This is a hard constraint, not a preference.

## The learning directory

```
{learningDirectory}/
├── .omnilearn/            # config + global UserPreferences.md (managed by omnilearn-init)
├── <skill>/               # one folder per skill at the root
│   ├── roadmap.md
│   ├── SkillPreferences.md
│   ├── progress-index.md
│   ├── runs/              # agent logs + research artifacts (YYYY-MM-DD-HHMMSS-<activity>/)
│   └── topics/            # per-topic: topic-roadmap.md, topic-progress.md, assignments/, runs/
```

**Communication between agents is via markdown files** — a research member writes findings to `runs/<...>/research-*.md`, the synthesizer reads those files. No information is lost to summarization. Progress lives in `topic-progress.md` files; `runs/` holds only action logs.

## The installer (`bin/install.js`)

`npx omnilearn-workflow`:

1. Ensures OpenCode is installed (with a supply-chain confirmation before any `curl | bash`)
2. Configures **Context7 MCP** in remote mode (no API key) in the OpenCode config — JSONC-safe read/write
3. Installs **oh-my-openagent** non-interactively (`npx oh-my-openagent@latest install --no-tui --platform=opencode --claude=no --gemini=no --copilot=no --skip-auth` — note: `--no-tui` *requires* those provider flags; all `no` binds no subscription)
4. Copies the six command files to `~/.config/opencode/command/`
5. Optionally configures the learning directory

`--check` runs a health check across: OpenCode, command files, Context7 MCP, oh-my-openagent plugin, learning directory.

## Testing

`test/test-install.mjs` runs against a sandbox (`/tmp/omnilearn-test/repo` copy) so real configs are never touched. It covers CLI flags, command-file presence + frontmatter, the JSONC parser, the health check, package.json validity, and — critically — regression locks on the oh-my-openagent install command (required flags, no stderr masking, npx usage).

See `docs/install-critic-review-v1.md` and `docs/install-critic-review-v2.md` for the installer's audit history.
