# OmniLearn Workflow

**AI-powered adaptive learning workflows for [OpenCode](https://opencode.ai).** Uses multi-agent orchestration to create personalized learning roadmaps, generate hands-on assignments, and track progress across any skill.

**GitHub:** https://github.com/BlackPool25/OmniLearn

## Quick Start

```bash
# Install the workflow commands
npx omnilearn-workflow

# Open OpenCode
opencode

# Set up your learning directory
/omnilearn-init

# Create your first roadmap
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

## How It Works

OmniLearn uses **multi-agent orchestration** (Sisyphus → subagents) to:

1. **Research** — Parallel subagents use web search + Context7 to find everything needed for real-world proficiency
2. **Adapt** — Scans your existing skills, reads your preferences, and skips what you already know
3. **Integrate** — Combines skills you already have with new ones (e.g., Python + FastAPI = full-stack ML API)
4. **Generate** — Creates hands-on assignments at 3 difficulty levels: Basic → Intermediate → Real-World
5. **Track** — Every assignment completion and session is logged in `topic-progress.md`

## Architecture

```
.omnilearn/                          ← In your configured learning directory
├── UserPreferences.md               ← Global preferences (auto-learned)
└── <skill>/
    ├── roadmap.md                   ← Master roadmap
    ├── SkillPreferences.md          ← Per-skill preferences
    ├── progress-index.md            ← Overview index
    ├── runs/                        ← Action logs only
    └── topics/<topic>/
        ├── topic-roadmap.md         ← Detailed subtopic plan
        ├── topic-progress.md        ← 🔑 Progress lives here
        ├── assignments/             ← Hands-on tasks with tests
        └── runs/                    ← Session action logs
```

## Requirements

- [OpenCode](https://opencode.ai) with [Oh-My-OpenAgent](https://github.com/code-yeongyu/oh-my-openagent) installed
- Node.js >= 18

## Configuration

OmniLearn stores its config at `~/.config/opencode/omnilearn.json`:

```json
{
  "learningDirectory": "/absolute/path/to/learning",
  "setupDate": "2026-07-04",
  "version": "1"
}
```

Run `/omnilearn-init` in OpenCode to configure.

## License

MIT
