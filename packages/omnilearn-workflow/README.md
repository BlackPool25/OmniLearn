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

## Flags

| Flag | What it does |
|---|---|
| `--yes` | Non-interactive install with defaults |
| `--check` | Verify install health |
| `--version` | Show package version |
| `--help` | Show usage help |

## Requirements

- Node.js >= 18
- OpenCode (installer can auto-install)
- Oh-My-OpenAgent (required for multi-agent. Install: `bunx oh-my-openagent install`)

## License

MIT
