# OmniLearn Workflow

[![npm version](https://img.shields.io/npm/v/omnilearn-workflow.svg?style=flat-square)](https://www.npmjs.com/package/omnilearn-workflow)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-BlackPool25%2FOmniLearn-blue.svg?style=flat-square)](https://github.com/BlackPool25/OmniLearn)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg?style=flat-square)](https://nodejs.org)

**AI-powered adaptive learning workflows for [OpenCode](https://opencode.ai).** Multi-agent orchestration that creates personalized learning roadmaps, generates hands-on assignments with automated quality review, and tracks progress across any skill.

> This is the npm installer package. Full documentation: [github.com/BlackPool25/OmniLearn](https://github.com/BlackPool25/OmniLearn)

## Quick Start

```bash
# One-command install (interactive)
npx omnilearn-workflow

# Auto-install with defaults:
npx omnilearn-workflow --yes

# Then open OpenCode and start learning:
opencode
/omnilearn-roadmap I want to learn Rust
```

## Available Commands

| Command | Purpose |
|---------|---------|
| `/omnilearn-init` | Set up your learning directory and config |
| `/omnilearn-roadmap` | Create a personalized, research-backed learning roadmap |
| `/omnilearn-roadmap-edit` | Edit an existing roadmap without losing progress |
| `/omnilearn-start` | Interactive learning: hands-on assignments, Q&A, progress tracking |
| `/omnilearn-refine` | Deep-dive questions and subtopic refinements |
| `/omnilearn-research` | Multi-agent deep research on any topic |

## How It Works

OmniLearn uses **multi-agent orchestration** (Sisyphus → subagents) to:

1. **Research** — Parallel subagents use web search + Context7 to research everything needed
2. **Adapt** — Scans your existing skills and preferences, skips what you already know
3. **Integrate** — Combines skills you already have with new ones
4. **Generate** — Creates hands-on assignments with real-world scenarios
5. **Review** — Every topic and assignment is critically reviewed by an oracle subagent before you see it
6. **Track** — Every session is logged in `topic-progress.md` and committed to git

## Requirements

- **OpenCode** — AI coding assistant (installer can auto-install)
- **Oh-My-OpenAgent** — Multi-agent orchestration plugin (required)
- **Node.js >= 18**

## CLI Flags

| Flag | Description |
|------|-------------|
| `--yes`, `-y` | Auto-install with defaults (non-interactive) |
| `--help`, `-h` | Show usage help |
| `--version`, `-v` | Show package version |
| `--check`, `-c` | Verify install health and detect issues |

## License

MIT
