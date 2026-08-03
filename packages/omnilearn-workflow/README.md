# omnilearn-workflow

[![npm version](https://img.shields.io/npm/v/omnilearn-workflow.svg)](https://www.npmjs.com/package/omnilearn-workflow)
[![License: MIT](https://img.shields.io/github/license/BlackPool25/OmniLearn.svg)](LICENSE)

Installer package for OmniLearn — multi-agent learning workflows for OpenCode.

```bash
npx omnilearn-workflow
```

Full docs: [github.com/BlackPool25/OmniLearn](https://github.com/BlackPool25/OmniLearn)

## What you get

Six commands installed to `~/.config/opencode/command/`:

- `/omnilearn-init` — configure your learning directory
- `/omnilearn-roadmap` — research + generate a learning roadmap
- `/omnilearn-roadmap-edit` — modify a roadmap without losing progress
- `/omnilearn-start` — hands-on learning with assignments and tests
- `/omnilearn-refine` — dig deeper into a specific concept
- `/omnilearn-research` — multi-agent deep research on any topic

All research phases run as **agent teams** (parallel category-routed members with task tracking), and serial synthesis steps run as individual delegates. This is the default orchestration in every command — no extra configuration needed.

## Flags

| Flag | What it does |
|---|---|
| `--yes` | Non-interactive install with defaults |
| `--check` | Verify install health |
| `--version` | Show package version |
| `--help` | Show usage help |

## Requirements

- **Node.js >= 18** — no Bun needed
- **OpenCode** (installer can auto-install)
- **oh-my-openagent** — required for multi-agent orchestration. Install: `npx oh-my-openagent@latest install` (the installer does this for you)

## What the installer does

1. Checks OpenCode is installed (offers to install if missing)
2. Configures the **Context7 MCP** (remote mode — no API key needed) for documentation lookups
3. Installs **oh-my-openagent** non-interactively (`npx oh-my-openagent@latest install --no-tui --platform=opencode --claude=no --gemini=no --copilot=no --skip-auth`) — providers are configured later in OpenCode
4. Copies the 6 command files to `~/.config/opencode/command/`
5. Optionally configures your learning directory

Run `npx omnilearn-workflow --check` anytime to verify the install.

## License

MIT
