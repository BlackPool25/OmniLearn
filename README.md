# OmniLearn

[![npm version](https://img.shields.io/npm/v/omnilearn-workflow.svg?style=flat-square)](https://www.npmjs.com/package/omnilearn-workflow)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/BlackPool25/OmniLearn.svg?style=flat-square)](https://github.com/BlackPool25/OmniLearn/stargazers)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg?style=flat-square)](https://nodejs.org)

**AI-powered adaptive learning workflows for [OpenCode](https://opencode.ai).** Multi-agent orchestration that creates personalized learning roadmaps, generates hands-on assignments with automated quality review, and tracks progress across any skill — all from your terminal.

```bash
# One-command install
npx omnilearn-workflow

# Then in OpenCode:
/omnilearn-init                            # Set up your learning directory
/omnilearn-roadmap I want to learn Rust    # Create a personalized roadmap
/omnilearn-start Rust                      # Start learning with hands-on assignments
```

## Features

| Feature | Description |
|---------|-------------|
| 🧠 Level-adaptive | Skips what you know, integrates your existing skills |
| 🤖 Multi-agent orchestration | Parallel subagents research, create, and quality-review content |
| ✅ Automated quality review | Every topic and assignment is critically reviewed before you see it |
| 🎯 Doubt? Get a task | Micro-exercises target confusing concepts instead of more text |
| 📊 Progress tracking | Every session logged in `topic-progress.md`, committed to git |
| 🔄 Cross-skill integration | Python + FastAPI, algorithms + backend — skills combine naturally |

## Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [How It Works](#how-it-works)
- [Commands](#commands)
- [Architecture](#architecture)
- [IDE Integration](#ide-integration)
- [Project Structure](#project-structure)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## Quick Start

```bash
# Install OmniLearn (one command, interactive)
npx omnilearn-workflow

# Open OpenCode
opencode

# Create your first roadmap
/omnilearn-roadmap I want to learn Rust

# Start learning
/omnilearn-start Rust
```

---

## Installation

```bash
npx omnilearn-workflow
```

The installer will:
- Check for OpenCode (install if missing)
- Copy 6 command files to `~/.config/opencode/command/`
- Configure Context7 MCP for documentation lookups
- Check for oh-my-openagent (multi-agent orchestration)
- Optionally set up your learning directory

### Prerequisites

- **OpenCode** — The AI coding assistant (installer can auto-install)
- **Oh-My-OpenAgent** — Multi-agent orchestration plugin (required for subagent workflows)
- **Node.js >= 18** — For the npm installer

### Verify Installation

In OpenCode, type `/` — you should see OmniLearn commands:

```
/omnilearn-init
/omnilearn-roadmap
/omnilearn-roadmap-edit
/omnilearn-start
/omnilearn-refine
/omnilearn-research
```

Run the health check anytime:

```bash
npx omnilearn-workflow --check
```

---

## How It Works

OmniLearn turns OpenCode into an adaptive learning tutor. Instead of reading tutorials, you learn by **doing** — solving real-world problems with automated tests, guided by AI that adapts to your level.

| Step | Command | What Happens |
|------|---------|-------------|
| 1 | `/omnilearn-init` | Configure where learning materials are stored |
| 2 | `/omnilearn-roadmap <skill>` | 3 parallel subagents research + synthesize a personalized roadmap |
| 3 | `/omnilearn-start <skill>` | Pick a topic → get a hands-on assignment with test + scaffold + solution guide |
| 4 | *(solve the assignment)* | Write code, run tests, ask questions |
| 5 | *(repeat)* | Next assignment at higher difficulty, new topics, progress tracked |

### Key Features

- **Level-adaptive** — Skips what you already know. Checks your existing skills and integrates them.
- **Cross-skill integration** — Already know Python? Learning FastAPI? Your roadmap uses Python throughout.
- **Learn by doing** — Every topic has hands-on assignments with real-world scenarios.
- **Automated quality review** — Every topic roadmap, explanation, and assignment is critically reviewed by an oracle subagent with web research before you see it. BLOCKER and MAJOR issues are fixed automatically.
- **Doubt? Get a task, not an explanation** — When stuck, you get a focused micro-exercise that isolates the confusing concept.
- **Progress tracking** — Every assignment, session, and skill is logged in `topic-progress.md`.
- **Self-learning preferences** — Global + per-skill preferences learned organically from your interactions.

### Architecture

```
.omnilearn/                          ← In your configured learning directory
├── UserPreferences.md               ← Global preferences (auto-learned)
└── <skill>/
    ├── roadmap.md                   ← Master roadmap (level-adaptive)
    ├── SkillPreferences.md          ← Per-skill preferences
    ├── progress-index.md            ← Overview index
    ├── runs/                        ← Action logs only
    └── topics/<topic>/
        ├── topic-overview.md        ← Big picture orientation
        ├── topic-roadmap.md         ← Detailed subtopic plan
        ├── topic-progress.md        ← 🔑 Progress lives here
        ├── critic-review.md         ← Auto-generated quality review (every topic)
        ├── subtopics/<n>-<name>/
        │   ├── subtopic-explanation.md  ← Deep theory for ONE concept
        │   ├── critic-review.md         ← Quality review
        │   ├── subtopic-progress.md     ← Per-subtopic tracking
        │   └── assignments/<n>-<name>/
        │       ├── question.md          ← Real-world scenario
        │       ├── critic-review.md     ← Quality review
        │       ├── test.<ext>           ← Automated test script
        │       ├── scaffold/            ← Starter code
        │       └── solution-guide.md    ← Reference solution
        └── runs/                    ← Session action logs
```

---

## Requirements

- **[OpenCode](https://opencode.ai)** — The AI coding assistant (terminal-based)
- **[Oh-My-OpenAgent](https://github.com/code-yeongyu/oh-my-openagent)** — Multi-agent orchestration plugin (installed via `bunx oh-my-openagent install`)
- **Node.js >= 18** — For the npx installer
- **Internet connection** — For web search + Context7 documentation lookups

OpenCode must have these MCPs configured (they're used by the subagents):
- `context7` — For official library/framework documentation
- Web search tools — For research (available via OpenCode's built-in tools)

### Recommended OpenCode Configuration

Your `~/.config/opencode/oh-my-openagent.jsonc` should have these agents configured:

```jsonc
{
  "agents": {
    "sisyphus": { "model": "opencode-go/deepseek-v4-flash" },
    "explore": { "model": "opencode-go/deepseek-v4-flash" },
    "librarian": { "model": "opencode-go/deepseek-v4-flash" }
  },
  "categories": {
    "unspecified-high": { "model": "opencode-go/deepseek-v4-flash" },
    "deep": { "model": "opencode-go/deepseek-v4-flash" },
    "writing": { "model": "opencode-go/deepseek-v4-flash" }
  }
}
```

---

## Installation

### One-Command Install (All IDEs)

```bash
npx omnilearn-workflow
```

This copies the 5 command files to `~/.config/opencode/command/`, making them available as global `/omnilearn-*` commands in OpenCode.

### Manual Install

```bash
# Clone the repo
git clone https://github.com/BlackPool25/OmniLearn.git
cd OmniLearn

# Copy commands to OpenCode
cp packages/omnilearn-workflow/commands/omnilearn-*.md ~/.config/opencode/command/
```

### Verify Installation

In OpenCode, type `/` and you should see the OmniLearn commands in the autocomplete:

```
/omnilearn-init
/omnilearn-roadmap
/omnilearn-roadmap-edit
/omnilearn-start
/omnilearn-refine
```

---

## Quick Start Guide

### Step 1: Initialize

```bash
# In OpenCode:
/omnilearn-init
```

This asks where to store your learning materials. Choose:
1. **Current directory** — Everything stays in your project folder
2. **Home directory** (`~/OmniLearn`) — Accessible from any project
3. **Custom path** — You specify

Config is saved to `~/.config/opencode/omnilearn.json`.

### Step 2: Create a Roadmap

```bash
/omnilearn-roadmap I want to learn Rust
```

The orchestrator spawns:
- **Subagent A**: Researches everything needed for real-world proficiency
- **Subagent B**: Researches optimal learning paths and common pitfalls
- **Subagent C**: Synthesizes everything into a personalized roadmap

The roadmap skips topics you already know and integrates your existing skills.

### Step 3: Start Learning

```bash
/omnilearn-start Rust
```

1. Pick a topic (or continue where you left off)
2. Read `question.md` — a real-world scenario
3. Use the scaffold to write your solution
4. Run the test script to verify
5. When done, say "I'm done" — get feedback and the next assignment
6. Stuck? Ask a question — get a focused micro-exercise, not just an explanation

### Step 4: Track Progress

Progress is automatically tracked in `topic-progress.md` inside each topic directory. The `progress-index.md` at the skill level provides an overview. Each learning session is committed to git.

---

## Commands Reference

### `/omnilearn-init`

Initialize the learning environment. Sets up config, creates base directory structure.

```
/omnilearn-init
/omnilearn-init /absolute/path/to/learning
```

### `/omnilearn-roadmap <skill>`

Create a comprehensive, research-backed learning roadmap.

```
/omnilearn-roadmap I want to learn Rust
/omnilearn-roadmap Machine Learning for production systems
/omnilearn-roadmap React with TypeScript
```

### `/omnilearn-roadmap-edit <skill> <changes>`

Edit an existing roadmap without losing progress.

```
/omnilearn-roadmap-edit Rust Add more systems programming focus
/omnilearn-roadmap-edit React I want more emphasis on testing patterns
```

### `/omnilearn-start <skill> [topic]`

Start an interactive learning session.

```
/omnilearn-start Rust
/omnilearn-start React Continue where I left off
/omnilearn-start Python I want to learn about decorators
```

### `/omnilearn-refine <skill> <topic> <question>`

Get help with a specific concept or refine a topic's roadmap.

```
/omnilearn-refine Rust ownership I'm confused about borrowing rules
/omnilearn-refine Python decorators Can you add more depth?
```

### `/omnilearn-research <topic>`

Deep multi-agent research on any topic. Uses parallel subagents with literature review, hypothesis testing, and structured evidence synthesis.

```
/omnilearn-research Best practices for Rust async patterns 2026
/omnilearn-research Modern authentication methods for FastAPI
```

---

## IDE Integration

### OpenCode (Primary)

Commands are auto-discovered from `~/.config/opencode/command/`. Type `/` to see all available commands.

### VS Code / Cursor / Windsurf

While these IDEs don't natively support OpenCode commands, you can:

1. **Use the OpenCode CLI** alongside your IDE:
   ```bash
   # Terminal 1: Your IDE
   code .
   
   # Terminal 2: OpenCode for learning
   opencode
   ```

2. **Or use OpenCode as your primary coding environment** during learning sessions. OpenCode has full file editing capabilities.

### Claude Code / Codex CLI

These support similar command patterns. The `.md` command files can be adapted — but they're designed for OpenCode's agent orchestration system. For the best experience, use OpenCode.

### GitHub Copilot / Cline / Continue

These don't support the multi-agent orchestration pattern. OpenCode + Oh-My-OpenAgent is required for the full workflow.

---

## Project Structure

```
OmniLearn/
├── README.md                           # This file
├── .gitignore
└── packages/
    └── omnilearn-workflow/             # npm package for distribution
        ├── package.json                # npm metadata
        ├── README.md                   # Package-specific README
        ├── bin/
        │   └── install.js              # CLI installer (npx omnilearn-workflow)
        └── commands/                   # The actual workflow definitions
            ├── omnilearn-init.md
            ├── omnilearn-roadmap.md
            ├── omnilearn-roadmap-edit.md
            ├── omnilearn-start.md
            └── omnilearn-refine.md
```

---

## Development

```bash
# Clone
git clone https://github.com/BlackPool25/OmniLearn.git
cd OmniLearn

# Install locally for testing
cp packages/omnilearn-workflow/commands/omnilearn-*.md ~/.config/opencode/command/

# Make changes to .md files, then re-copy
# Test in OpenCode with the modified commands

# Publish to npm
cd packages/omnilearn-workflow
npm publish
```

---

## Publishing to npm

```bash
cd packages/omnilearn-workflow
npm publish --access public
```

Users can then install with:
```bash
npx omnilearn-workflow
```

---

## Contributing

1. Fork the repo and create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes to the command files in `packages/omnilearn-workflow/commands/`
3. Test locally: copy updated commands to `~/.config/opencode/command/` and use them in OpenCode
4. Run the test suite: `node test/test-install.mjs`
5. Open a pull request with a clear description of your change

### Development Setup

```bash
git clone git@github.com:BlackPool25/OmniLearn.git
cd OmniLearn/packages/omnilearn-workflow
npm install
# Copy commands for local testing
cp commands/*.md ~/.config/opencode/command/
```

## License

MIT © BlackPool25
