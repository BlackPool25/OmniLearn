---
description: Initialize OmniLearn — set your learning directory, create the base structure, and configure global preferences. Run this before using any other omnilearn-* command.
---

# /omnilearn-init — Initialize OmniLearn Learning Environment

## Usage
```
/omnilearn-init
/omnilearn-init /absolute/path/to/learning/materials
/omnilearn-init ./my-learning
```

## What This Does

1. Checks if OmniLearn is already configured (reads `~/.config/opencode/omnilearn.json`)
2. If not configured: asks the user where to store learning materials, saves config
3. Creates the base `.omnilearn/` directory structure at the configured path
4. Creates initial `UserPreferences.md` (empty — populated organically)
5. Confirms setup is complete

## Config File

OmniLearn stores its configuration in `~/.config/opencode/omnilearn.json`:

```json
{
  "learningDirectory": "/absolute/path/to/learning",
  "setupDate": "2026-07-04",
  "version": "1"
}
```

This global location is always accessible regardless of which project directory you're in. All commands read this file at startup.

## Directory Structure Created

```
{learningDirectory}/
├── .omnilearn/                  ← ONLY configuration and global preferences
│   ├── config.json              ← Mirror of the global config (for reference)
│   └── UserPreferences.md       ← Global user preferences (auto-populated)
│
├── <skill>/                     ← Skills live at the ROOT of learning directory
│   ├── roadmap.md
│   ├── SkillPreferences.md
│   ├── SkillConventions.md
│   ├── progress-index.md
│   ├── runs/
│   └── topics/
│
└── <another-skill>/             ← Each skill is its own top-level folder
    └── ...
```

## Phase 0: CHECK EXISTING CONFIG

### 0.1 Check if Already Configured

```bash
OMNILEARN_CONFIG="$HOME/.config/opencode/omnilearn.json"

if [ -f "$OMNILEARN_CONFIG" ]; then
  echo "OmniLearn is already configured."
  LEARNING_DIR=$(jq -r '.learningDirectory' "$OMNILEARN_CONFIG")
  echo "Learning directory: $LEARNING_DIR"
  echo ""
  echo "To change it, run: /omnilearn-init <new-path>"
  echo "Or continue using the existing setup with any omnilearn-* command."
  exit 0
fi
```

If the user provided a path as an argument, use it directly (skip Phase 1).

### 0.2 Read Argument (if provided)

```bash
if [ -n "$ARG1" ]; then
  LEARNING_DIR=$(realpath "$ARG1" 2>/dev/null || echo "$ARG1")
  # Proceed to Phase 2
fi
```

## Phase 1: ASK USER FOR LEARNING DIRECTORY

If no argument was provided and no config exists:

> "Welcome to OmniLearn! 🎉
>
> I need a directory where all your learning materials will be stored.
> This is where skill roadmaps, assignments, progress tracking, and run logs live.
>
> Where would you like to set up your learning directory?"
>
> Options:
> 1. **Current directory** ({cwd}) — simplest, everything stays in this project
> 2. **Home directory** (~/OmniLearn) — accessible from any project
> 3. **Custom path** — you specify

Use the `question` tool to present these options. For "Custom path", collect the user's typed path.

```bash
# Make the path absolute
LEARNING_DIR=$(realpath "$LEARNING_DIR" 2>/dev/null || echo "$LEARNING_DIR")
```

## Phase 2: CREATE CONFIG & DIRECTORY STRUCTURE

### 2.1 Save Global Config

```bash
mkdir -p "$HOME/.config/opencode"

cat > "$OMNILEARN_CONFIG" << 'CONFIG'
{
  "learningDirectory": "LEARNING_DIR_PLACEHOLDER",
  "setupDate": "DATE_PLACEHOLDER",
  "version": "1"
}
CONFIG

# Replace placeholders
sed -i "s|LEARNING_DIR_PLACEHOLDER|$LEARNING_DIR|g" "$OMNILEARN_CONFIG"
sed -i "s|DATE_PLACEHOLDER|$(date +%Y-%m-%d)|g" "$OMNILEARN_CONFIG"
```

### 2.2 Create Base Directory Structure

```bash
# Create .omnilearn in the learning directory (config only)
# Skills will be created as top-level directories at $LEARNING_DIR
OMNILEARN_DIR="$LEARNING_DIR/.omnilearn"
mkdir -p "$OMNILEARN_DIR"

# Create a local config mirror (for reference when browsing)
cat > "$OMNILEARN_DIR/config.json" << 'CONFIG'
{
  "learningDirectory": "LEARNING_DIR_PLACEHOLDER",
  "setupDate": "DATE_PLACEHOLDER",
  "version": "1"
}
CONFIG
sed -i "s|LEARNING_DIR_PLACEHOLDER|$LEARNING_DIR|g" "$OMNILEARN_DIR/config.json"
sed -i "s|DATE_PLACEHOLDER|$(date +%Y-%m-%d)|g" "$OMNILEARN_DIR/config.json"
```

### 2.3 Create Initial UserPreferences.md

```bash
cat > "$OMNILEARN_DIR/UserPreferences.md" << 'EOF'
# Global User Preferences

_This file is auto-managed by OmniLearn. Preferences are learned organically from interactions — never from forms or questionnaires._

## Learning Style
<!-- Preferences about how the user learns best, inferred from behavior -->

## Technical Background
<!-- The user's demonstrated experience level, preferred tools, and known technologies -->

## Goals
<!-- Career, personal, or academic goals related to learning -->

## Preference Log

### {setupDate}: OmniLearn initialized
- Learning directory set to: {learningDirectory}
- OmniLearn v1 initialized
- User preferences file created — will grow organically with use
EOF
```

## Phase 3: CONFIRM SETUP

```markdown
┌──────────────────────────────────────────────────────────────────┐
│  ✅ OmniLearn Initialized                                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Learning directory: {learningDirectory}                           │
│  Config: {OMNILEARN_CONFIG}                                        │
│                                                                   │
│  All omnilearn-* commands are now ready to use:                   │
│                                                                   │
│  /omnilearn-roadmap <skill>      — Create a learning roadmap       │
│  /omnilearn-roadmap-edit <skill> — Edit an existing roadmap        │
│  /omnilearn-start <skill>        — Start learning                  │
│  /omnilearn-refine <skill>       — Refine a subtopic               │
│                                                                   │
│  Get started:                                                      │
│  /omnilearn-roadmap I want to learn Rust                          │
└──────────────────────────────────────────────────────────────────┘
```

## Quality Gates

| Check | Phase | Action if Failed |
|-------|-------|-----------------|
| Config file written | 2 | Check permissions on ~/.config/opencode/ |
| Learning directory exists | 2 | Create if not exists |
| .omnilearn/ created inside learning directory | 2 | mkdir -p |
| UserPreferences.md created | 2 | Write default template |
| Config readable by shell | 2 | Test: `jq` or `grep` the file |
| User confirmed the path is correct | 1 | Re-ask if wrong |

## Error Recovery

| Situation | Action |
|-----------|--------|
| Config already exists | Show current config, exit |
| User provides invalid path | Ask again with validation |
| ~/.config/opencode/ not writable | Suggest `sudo` or manual setup |
| jq not available | Use `grep` + `sed` to parse JSON instead |
| User wants to change directory later | Re-run /omnilearn-init <new-path> |
