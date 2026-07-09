---
description: Start an interactive learning session. Generates hands-on assignments with increasing difficulty, guides the user through practice, adapts to their progress, and updates the learning record.
---

# /omnilearn-start — Start Learning a Skill

## Usage
```
/omnilearn-start Rust
/omnilearn-start React Continue where I left off
/omnilearn-start Python I want to work on decorators
/omnilearn-start Machine Learning Start the neural networks topic
/omnilearn-start JavaScript help me with closures
```

## Core Learning Philosophy

**Learning happens in the Zone of Proximal Development (ZPD)**: just beyond what the user can do alone, but achievable with scaffolding. The goal is NOT to test them — it's to TEACH them through calibrated challenge.

### Key Principles (Backed by Research)

| Principle | What It Means |
|-----------|---------------|
| **Zone of Proximal Development** | Tasks should be just above current ability + supported by hints, scaffolds, and guidance. Never drop someone into the deep end alone. |
| **Desirable Difficulty** | Productive struggle grows skills — but only when scaffolding exists. Challenge without support = frustration. |
| **85% Rule** | Optimal learning happens when ~85% of the task is familiar and ~15% is new. Calibrate so the user succeeds most of the time but has to stretch. |
| **Flow State** | Challenge must match skill level. Too easy → boredom. Too hard → anxiety. The agent's job is to keep the user in flow by adjusting difficulty dynamically. |
| **Scaffolding & Fading** | Start with strong support (detailed hints, guided steps). Fade support as the user gains competence. |
| **Immediate Feedback** | Automated tests give instant signal. Use test results to detect struggle early and adjust. |

### What Every Topic Produces

1. **`topic-overview.md`** — Big picture orientation: why this topic matters, subtopic dependency map, prerequisites. 5-minute read that gives the lay of the land before diving deep.
2. **`topic-roadmap.md`** — Index of subtopics with dependency ordering, estimated effort, and links to each subtopic's explanation and assignments.
3. **Per-subtopic `subtopic-explanation.md`** — Expert-grade theory explainer for ONE concept. Uses progressive layers (simple→complex→production) with annotated examples, misconceptions, and checkpoints. Each subtopic is self-contained — no cramming multiple concepts together.
4. **Per-subtopic hands-on assignments** — calibrated difficulty: baseline → adjusted based on performance. Each subtopic gets its own assignments so the user demonstrates mastery of ONE concept before moving on.
5. **Cross-subtopic integration assignments** — optional final assignments that combine multiple subtopics into real-world scenarios.
6. **Test scripts** — immediate feedback so the user knows if they're on track.
7. **Scaffold code** — starter files so they jump straight into coding, not boilerplate.
8. **Solution guides** — reference implementations with explanation.

The goal metric: **Can the user apply what they learned to real-world problems they haven't seen before?**

## Directory Structure

```
{learningDirectory}/
├── .omnilearn/                              ← Config only (config.json, UserPreferences.md)
│
└── <skill>/                                  ← Skills at learning root
    ├── roadmap.md
    ├── SkillPreferences.md
    ├── SkillConventions.md                  ← 🔑 Setup conventions: package manager, project structure, deps, testing (auto-learned)
    ├── progress-index.md                   ← Overview index: links to topic-progress.md per topic
    ├── runs/                                   ← Skill-level run logs (action logs only, NOT progress)
│   └── YYYY-MM-DD-HHMMSS-learning-<topic>/
│       ├── agent-log.md                    ← What happened this run: decisions, actions taken
│       ├── interaction-1.md                ← User Q&A interaction record
│       ├── interaction-2.md
│       └── ...
└── topics/
    └── <topic-name>/                       ← e.g., "error-handling", "neural-networks"
        ├── topic-overview.md               ← ← 🔑 BIG PICTURE: why this topic matters, subtopic dependency map, prerequisites (5 min read)
        ├── topic-roadmap.md                ← INDEX linking to each subtopic with dependency order
        ├── topic-progress.md               ← 🔑 PROGRESS: per-subtopic status (overall + subtopic-level)
        │
        ├── subtopics/                      ← NEW: each subtopic is a focused, self-contained unit
        │   ├── 01-<subtopic-name>/          ← e.g., "01-python-version-management"
        │   │   ├── subtopic-explanation.md ← ← 🔑 DEEP explanation for ONE subtopic (all 3 layers, no cramming)
        │   │   ├── subtopic-progress.md    ← Progress for this single subtopic
        │   │   ├── assignments/
        │   │   │   ├── 01-<concept>/
        │   │   │   │   ├── question.md     ← Real-world scenario assignment brief
        │   │   │   │   ├── test.<ext>      ← Automated test script
        │   │   │   │   ├── scaffold/       ← Starter code
        │   │   │   │   └── solution-guide.md
        │   │   │   └── 02-...              ← More assignments for this subtopic (if needed)
        │   │   └── runs/                   ← Per-subtopic action logs
        │   │       └── YYYY-MM-DD-HHMMSS-<activity>/
        │   │           └── agent-log.md
        │   ├── 02-<subtopic-name>/
        │   └── ...
        │
        └── assignments/                    ← Cross-subtopic integration assignments
            └── 01-<integration-name>/
                ├── question.md
                ├── test.<ext>
                ├── scaffold/
                └── solution-guide.md
```

## Current Date Context (CRITICAL — Must Pass to ALL Subagents)

```bash
CURRENT_DATE=$(date +%Y-%m-%d)
CURRENT_YEAR=$(date +%Y)
```

**Every subagent that does research or content generation MUST receive the current date and be told to prioritize current information over deprecated or outdated resources.**

## MCP Tool Call Semantics (CRITICAL — Subagents Frequently Get This Wrong)

All subagents that use MCP tools MUST follow these exact calling conventions:

### `context7_resolve-library-id` + `context7_query-docs`
1. **ALWAYS call `context7_resolve-library-id` FIRST** with the library name to get the correct library ID.
2. Use the returned library ID (format: `/org/package`) as the `libraryId` parameter in `context7_query-docs`.
3. Do NOT guess or hardcode library IDs.
4. Max 3 calls per question.

### `google_search` / `websearch_web_search_exa`
- Use specific, well-formed queries — not keywords, but describe the ideal page.
- Good: `"current state of Rust async patterns 2025"`
- Bad: `"Rust async"`
- Pass `query` as a plain string, not wrapped in an object.

### General Rules
- Match tool call parameter names EXACTLY as defined in the tool schema.
- Do NOT wrap string parameters in extra objects or arrays.
- Do NOT nest tool calls unless the API explicitly requires it.
- If a tool call fails, verify parameter names match before retrying.

## MANDATORY TOOLS

| Tool | When | Why |
|------|------|-----|
| `task(category="unspecified-high", background/poll)` | Content creation | Topic roadmaps, assignments, explanations |
| `task(category="deep", background)` | Complex autonomous | Full topic roadmap creation (sub-agents within) |
| `task(category="writing")` | Content writing | Topic explanations, solution guides |
| `task(category="unspecified-high", ["programming"])` | Technical work | Test scripts, scaffold code |
| `google_search` / `websearch_web_search_exa` | Research | Learning resources, topic best practices |
| `context7_query-docs` | Tech skills | Official docs for languages/frameworks |
| `question` tool | User interaction | Present topic choices, ask for preferences |
| `read`, `write`, `edit`, `bash`, `grep`, `glob` | Every phase | File operations |
| `bash(git ...)` | Completion | Commit progress |

## Phase 0: INTENT GATE — Parse & Validate

### 0.1 Parse Input

Extract the skill name and any optional topic/request from the user's message:
- "/omnilearn-start Rust" → skill: `Rust`, no specific topic
- "/omnilearn-start React Continue where I left off" → skill: `React`, action: continue
- "/omnilearn-start Python I want to learn about decorators" → skill: `Python`, topic: decorators

### 0.2 Verify Skill Exists

```bash
OMNILEARN_CONFIG="$HOME/.config/opencode/omnilearn.json"

if [ ! -f "$OMNILEARN_CONFIG" ]; then
  echo "OmniLearn is not configured yet."
  echo ""
  echo "Run this first:"
  echo "  /omnilearn-init"
  exit 1
fi

LEARNING_DIR=$(grep -o '"learningDirectory"[[:space:]]*:[[:space:]]*"[^"]*"' "$OMNILEARN_CONFIG" | sed 's/"learningDirectory"[[:space:]]*:[[:space:]]*"//' | sed 's/"$//')
OMNILEARN_DIR="$LEARNING_DIR/.omnilearn"
SKILL_DIR="$LEARNING_DIR/<skill>"
ROADMAP="$SKILL_DIR/roadmap.md"
PROGRESS_INDEX="$SKILL_DIR/progress-index.md"
TOPICS_DIR="$SKILL_DIR/topics"
SKILL_PREFS="$SKILL_DIR/SkillPreferences.md"
GLOBAL_PREFS="$OMNILEARN_DIR/UserPreferences.md"

if [ ! -d "$SKILL_DIR" ] || [ ! -f "$ROADMAP" ]; then
  echo "No roadmap found for '{skill}'. Create one first:"
  echo ""
  echo "  /omnilearn-roadmap {skill}"
  echo ""
  exit 1
fi
```

### 0.3 Read Progress, Preferences, Conventions & Cross-Skill Inventory

Read these files to understand the current state:
- `UserPreferences.md` (if exists) — learning style, experience level, goals
- `SkillPreferences.md` — per-skill state, preferences
- **`SkillConventions.md`** — 🔑 **Setup conventions: package manager, project structure, deps, testing preferences. Read this BEFORE generating any scaffold or assignment — it ensures consistency.**
  
  **AUTO-CREATION**: If `SkillConventions.md` does NOT exist when generating the first scaffold/assignment:
  1. Read `SkillPreferences.md` to extract: package manager, test framework, linter, formatter, type checker
  2. Create `SkillConventions.md` at `{SKILL_DIR}/SkillConventions.md` with concrete, actionable conventions
  3. Include: project naming scheme, directory structure template, test command, lint command, type-check command
  4. The subagents that generate scaffolds then use THIS file as their source of truth
  5. Format: see existing `SkillConventions.md` in other skills if available; otherwise use the template below:
  
  ```markdown
  # {Skill Name} — Conventions
  
  ## Package Manager
  - [uv / npm / cargo / etc.]
  
  ## Project Structure
  - [src/ layout or flat layout]
  
  ## Dependencies
  - [pyproject.toml / package.json / Cargo.toml]
  
  ## Test Command
  - [uv run pytest / npm test / cargo test]
  
  ## Lint Command
  - [uv run ruff check / npx eslint / cargo clippy]
  
  ## Type Check Command
  - [uv run basedpyright / npx tsc --noEmit]
  
  ## Naming Convention
  - [kebab-case for project name, underscores for import package]
  ```
  
- `progress-index.md` — overview of topic statuses

**For any topics marked 🔵 In Progress**, read their `topic-progress.md` files to get the detailed state:
- Which assignment are they on?
- What was the last session's outcome?
- What concepts are they struggling with?

**Cross-skill inventory** — Scan the learning directory for other skills the user has learned:
```bash
ls -d "$LEARNING_DIR"/*/ 2>/dev/null | while read dir; do
  skill_name=$(basename "$dir")
  [ "$skill_name" = ".omnilearn" ] && continue
  if [ "$skill_name" != "$SKILL_NAME" ] && [ -f "$dir/progress-index.md" ]; then
    echo "Related skill: $skill_name — can integrate with $SKILL_NAME"
  fi
done
```
This context helps the learning agent design assignments that reference or integrate related skills.

### 0.4 Check Current Topic Status

From `progress-index.md` and the individual `topic-progress.md` files, determine:
- Is there a currently in-progress topic? → note it, read its topic-progress.md
- Which topics are completed? → note them
- Which topics are not started? → list them

## Phase 1: TOPIC SELECTION — Let User Choose

### 1.1 Present Options to the User

If there's an in-progress topic:
> "You were working on **{topic}** in {skill}. You can:
> 1. Continue **{topic}** — pick up where you left off
> 2. Start a **new topic** — choose from available topics
> 3. Specify a topic — tell me which one"

If there's a specific topic mentioned by the user, verify it exists in the roadmap:
> "I see '{user_topic}' in the {skill} roadmap. Shall we start learning that?"

If the user mentioned a specific topic that is NOT in the roadmap:
> "'{user_topic}' isn't currently in the {skill} roadmap. Would you like to:
> 1. **Add it to the roadmap** — I'll research and add it
> 2. **Pick from existing topics** — here are the available ones..."

**Use the `question` tool** to present options when there are multiple choices.

### 1.2 If User Chooses "Continue" an In-Progress Topic

Jump to Phase 2 to check the topic roadmap.

### 1.3 If User Chooses a Topic Without a Topic Roadmap

Proceed to Phase 1.4 to create the topic roadmap first.

### 1.4 Create Topic Roadmap (Autonomous Subagent)

If the chosen topic doesn't have a `topic-roadmap.md`, spawn a DEEP autonomous subagent:

```typescript
task(category="deep", run_in_background=false, timeout=600000, prompt="
1. TASK: Create a nested subtopic learning architecture for '{topic}' within the skill '{skill}'.
2. EXPECTED OUTCOME:
   - topic-overview.md — Big picture orientation (5 min read)
   - topic-roadmap.md — Index linking to each subtopic
   - For the FIRST subtopic (rest on-demand):
     * subtopic-explanation.md — Deep, focused explanation of ONE concept
     * First assignment with question, test, scaffold, solution guide
   - topic-progress.md with per-subtopic tracking

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, context7_resolve-library-id, context7_query-docs, read, write, bash, grep

4. MUST DO — Step-by-Step:
   - **CURRENT DATE: {CURRENT_DATE}** — ONLY research current information. Prioritize resources from the last 1-2 years. Check for deprecation warnings. Prefer latest stable versions of any library/framework/tool. If older resources reference superseded tools (e.g. CRA → Vite, pip → uv), flag and use the current standard.

   STEP 1 — EXHAUSTIVE Research for Real-World Proficiency:
   - Read the main roadmap to understand how this topic fits: {ROADMAP}
   - Read user preferences: {GLOBAL_PREFS} (if exists), {SKILL_PREFS} (if exists)
   - Use google_search / websearch EXTENSIVELY (5-15 queries minimum) to research:
     * What EXACTLY does a professional need to know about this topic to build production software?
     * What are the MUST-KNOW concepts vs nice-to-have?
     * What are the most common mistakes beginners make?
     * What industry-standard tools and practices exist in 2026?
     * What are the prerequisites — what must be understood first before this makes sense?
     * Search for actual job requirements, real-world projects, and production codebases that use this topic
   - Research each potential subtopic individually:
     * What specific sub-skills does it contain?
     * What are the failure modes and edge cases?
     * What is the minimum viable understanding to be productive?
     * What are the deeper patterns that separate beginners from professionals?
   - If it's a tech topic, use context7 for official documentation
   - DOCUMENT your research — capture URLs, key findings, and decisions. Research quality directly determines roadmap quality.

   STEP 2 — Create topic-roadmap.md at:
     {TOPICS_DIR}/{topic}/topic-roadmap.md
   
   This is an INDEX, NOT a detailed document. Structure:
   
   # {topic} — Learning Path
   
   ## Prerequisites
   - What the user should know before starting
   
   ## Learning Objectives
   - By the end, what the user will be able to do
   
   ## Subtopic Dependency Map
   - Show how subtopics connect: which must come first, which can be parallel
   - Use a simple arrow notation: 01 → 02 → 03, or 01 → 02, 01 → 03 (parallel)
   
   ## Subtopics (ordered by dependency)
   ### 1. {subtopic name}
   - What this subtopic covers (1 sentence)
   - Why it matters in real-world (1 sentence)
   - Estimated time: {X} min
   - Link to subtopic: subtopics/01-{name}/subtopic-explanation.md
   
   ### 2. ...
   
   ## Cross-Subtopic Integration
   - How subtopics combine into real-world scenarios
   - Optional integration assignments listed here

   STEP 3 — Create topic-overview.md at:
     {TOPICS_DIR}/{topic}/topic-overview.md
   
   This is the BIG PICTURE — what the user reads FIRST to orient themselves.
   It is NOT the deep dive (each subtopic gets its own deep dive).
   Keep it to 5 minutes of reading. Structure:
   
   # {topic}
   
   ⏱️ Estimated reading time: 5 minutes
   
   ## Why This Topic Matters
   Start with a problem the reader has felt. A concrete situation that hooks them.
   Keep it to 2-3 paragraphs — this is the MOTIVATION, not the lesson.
   
   ## What You'll Learn
   - Bullet list of the subtopics (brief, 1 line each)
   - What you'll be able to do after each subtopic
   
   ## How These Subtopics Fit Together
   Dependency diagram in text form:
   ```
   01. Python Version Management ──┐
                                   ├── 04. Git Basics ──┐
   02. Package Management ─────────┘                    │
                                   ├── 05. Docker ──────┤── 06. Full Setup
   03. VS Code Tooling ────────────┘                    │
                                   └── Integration
   ```
   Or a simple ordered list with dependency notes.
   
   ## Prerequisites
   Brief checklist (should be concise — details live in each subtopic)

   STEP 4 — Create the FIRST SUBTOPIC at:
     {TOPICS_DIR}/{topic}/subtopics/01-{subtopic-name}/
   
   Create ONLY the first subtopic now. Rest are generated on-demand as user progresses.
   
   4a) Create subtopic-explanation.md at:
     {TOPICS_DIR}/{topic}/subtopics/01-{subtopic-name}/subtopic-explanation.md
   
   This is the THEORETICAL FOUNDATION for ONE specific subtopic.
   ONLY the first subtopic gets created now.
   
   **CRITICAL PEDAGOGY RULES** (based on cognitive load theory + expert teaching research):
   - **ONE concept per document**. This file MUST cover exactly ONE subtopic. If you find yourself explaining multiple distinct concepts, you need to split them into separate subtopics.
   - **One-Level-Down Rule**: Start one level simpler than you think the user needs. You can always go deeper; you cannot undo confusion once it sets in. Each layer must be a correct (if simplified) mental model.
   - **Unpack → Complexity → Repack**: Deconstruct the concept to its essence, progressively add real-world constraints, then reconstruct into a coherent mental model the user can carry forward.
   - **Assume Nothing**: Make ALL prerequisites explicit.
   - **One New Idea at a Time**: Working memory holds ~4 chunks. Never introduce multiple new concepts in the same paragraph.
   - **Concrete Before Abstract**: Show the full working example FIRST, then explain why it works.
   - **Address Misconceptions Proactively**: For every concept, anticipate the 2-3 most common confusions and address them BEFORE the user gets confused.
   - **Active > Passive**: Embed quick checkpoints.
   - **The Completeness Test**: Each layer must give a correct mental model IN ISOLATION.
   - **Depth over breadth**: 200-400 lines per subtopic-explanation.md. If shorter, you're skipping depth. If longer, you're cramming multiple subtopics.
   
   Use this format:
   
   # {subtopic name}
   
   ⏱️ Estimated reading time: {X}-{Y} minutes
   
   ## Why This Matters
   Same hook pattern, but scoped to THIS subtopic only. The user just read the topic overview — now they're diving deeper into ONE piece.
   
   ## Prerequisites
   Only what's needed for THIS subtopic. If it needs another subtopic first, link to it.
   
   ## Layer 1: The Core Idea (One Level Down)
   The simplest correct explanation for THIS ONE concept. 1-2 paragraphs max.
   
   ## Layer 2: How It Actually Works
   Commands, examples, code, real interactions. Researched against current (2026) docs.
   Include annotated code blocks with WHY comments.
   100-250 lines of focused, practical content. No tangents into other topics.
   
   ## Layer 3: Real-World Production Context
   - **Common Misconceptions** (2-3, specific to THIS concept)
   - **Edge Cases & Failure Modes** specific to THIS subtopic
   - **Trade-offs** relevant to THIS decision
   - **Production Patterns** for THIS specific skill
   
   ## Learning Checkpoints
   3-5 questions testing ONLY this subtopic's concepts.
   
   ## Ready to Practice?
   → Assignment: {TOPICS_DIR}/{topic}/subtopics/01-{name}/assignments/01-{concept}/
   
   4b) Create Assignment 1 for this subtopic at:
     {TOPICS_DIR}/{topic}/subtopics/01-{subtopic-name}/assignments/01-{concept}/
   
   Create these files:
   
   a) question.md — Assignment brief specific to THIS subtopic
      - Clear learning objective matching THIS subtopic's concepts
      - Problem description (real-world scenario)
      - Requirements/Specifications (numbered list)
      - Hints section (hidden behind spoiler or at bottom)
      - Expected output/behavior description
      - References to subtopic-explanation.md sections
   
   b) test.{ext} — Automated test script for THIS subtopic
      - Tests that validate ONLY this subtopic's learning objectives
      - Edge case tests
      - Clear error messages on failure
      - Must be runnable without modification
   
   c) scaffold/ directory with starter files - SAME GOLDEN RULE as before
      (Follow the uv-native scaffold structure from the existing conventions)
   
   d) solution-guide.md — Must be researched and accurate
      (Same structure as before, but references this subtopic's explanation)
   
   4c) Create subtopic-progress.md at:
     {TOPICS_DIR}/{topic}/subtopics/01-{subtopic-name}/subtopic-progress.md
   
   Structure:
   # Progress: {subtopic name}
   
   ## Status
   - Overall: 🔵 In Progress
   - Started: {date}
   
   ## Assignments
   1. **01-{concept}** — 🟢 Not Started
   
   ## Learning Sessions
   | Date | Activity | Run Log |
   
   ## Skills Demonstrated

   STEP 5 — Create topic-progress.md at:
     {TOPICS_DIR}/{topic}/topic-progress.md

   This tracks progress at BOTH topic level and subtopic level:

   # Progress: {topic}

   ## Status
   - Overall: 🔵 In Progress
   - Started: {date}
   - Last activity: {date}
   - Subtopics: 1/{total_subtopics} started

   ## Subtopic Progress
   | # | Subtopic | Status | Assignments | Link |
   |---|----------|--------|-------------|------|
   | 1 | **01-{name}** | 🔵 In Progress | 0/1 completed | subtopics/01-{name}/subtopic-progress.md |
   | 2 | **02-{name}** | 🟢 Not Started | — | — |
   | ... | ... | ... | ... | ... |

   ## Learning Sessions
   | Date | Activity | Run Log |
   |------|----------|---------|
   | {date} | Topic started, first subtopic created | runs/{run-id}/agent-log.md |

   ## Skills Demonstrated
   
   Also update progress-index.md at the skill level to point to this topic.

5. MUST NOT DO:
   - Do NOT create a single massive topic-explanation.md covering all subtopics — this violates chunking and cognitive load principles. Each subtopic gets its own focused explanation.
   - Do NOT create all subtopics upfront — only the first. Subsequent subtopics are generated on-demand as the user progresses through them.
   - Do NOT create all assignments at once — only the first subtopic's first assignment. More are generated adaptively.
   - Do NOT skip scaffolds — the user needs a starting point.
   - Do NOT make topic-overview.md longer than ~5 min read — it's an orientation, not a lesson.
   - Do NOT let any subtopic-explanation.md cover multiple concepts — if it does, split into more subtopics.
   - Do NOT make assignments purely theoretical — use real-world scenarios.
   - Do NOT use `pip install`, `python -m venv`, or `requirements.txt` in Python scaffolds — use `uv sync` and `pyproject.toml`.
   - Do NOT name the project "app" or any generic name — use the skill-derived naming rules.
   - Do NOT generate scaffolds with flat layout (`app/` at root) — use `src/` layout.
   - Do NOT write solutions without researching first — use google_search or context7 to verify.
   - Do NOT guess — if unsure about API syntax, look it up via context7.

6. CONTEXT:
   - Skill: {skill} — DERIVE PROJECT NAMES FROM THIS
   - Topic: {topic}
   - Topics directory: {TOPICS_DIR}/{topic}/
   - Subtopics directory: {TOPICS_DIR}/{topic}/subtopics/
   - User experience level: {from preferences}
   - User learning style: {from preferences}
   - Skill conventions: {from SkillConventions.md — read before generating scaffold. If missing, read SkillPreferences.md}
   - Cross-skill context: {from cross-skill inventory}
")

After completion, verify:
- topic-overview.md exists — big picture orientation (5 min read)
- topic-roadmap.md exists — index with subtopic list
- subtopics/01-{name}/subtopic-explanation.md exists with all layers
- subtopics/01-{name}/assignments/01-{concept}/ exists with question.md, test, scaffold, solution-guide.md
- subtopics/01-{name}/subtopic-progress.md exists
- topic-progress.md tracks at subtopic level
- Test script is syntactically valid

If anything is missing, fix via session continuation: `task(task_id="<session_id>", prompt="Fix: {missing element}")"

## Phase 1.5: READINESS GATE — Orient Then Dive Deep

**The user MUST read the theory before touching assignments.** This is non-negotiable.
However, they do NOT read everything at once. They follow a CYCLE: read topic overview → pick a subtopic → read that subtopic's explanation → do that subtopic's assignment.

### Step 1: Present the Topic Overview (Big Picture)

Present `topic-overview.md`:

> "Before we dive into details, here's the big picture.
>
> 📖 **{SKILL_DIR}/topics/{topic}/topic-overview.md**
>
> This will give you the lay of the land: what we'll learn, how the subtopics fit together, and what you'll build. About 5 minutes to read.
>
> Let me know when you've finished, and I'll guide you through the first subtopic."

### Step 2: Present the First Subtopic

After the user confirms, present the first subtopic:

> "Now let's dive deep into **{subtopic name}**, the first building block.
>
> 📖 **{SKILL_DIR}/topics/{topic}/subtopics/01-{name}/subtopic-explanation.md**
>
> This covers: Why This Matters → Prerequisites → Core Idea → How It Works → Production Context → Checkpoints
> About {X}-{Y} minutes to read.
>
> After this, you'll jump straight into a hands-on assignment for this exact subtopic.
>
> Let me know when you're ready, or ask any questions!"

### Step 3: Wait for Confirmation

- If they ask questions → answer them (using diagnostic task pattern from Phase 3 if needed)
- If they say "I already know this" → ask 2 quick concept-checking questions to verify. If they pass, skip the explanation. If they fail, tell them to read it.
- If they say "ready" → proceed to Phase 2.

### Learning Flow (Cyclic)

The user cycles through subtopics one at a time:

```
topic-overview.md  →  subtopic-1 explanation  →  assignment-1  → 
                      subtopic-2 explanation  →  assignment-2  →
                      subtopic-3 explanation  →  assignment-3  →
                      cross-subtopic integration assignment
```

Each subtopic follows: **Read explanation → Do assignment → Advance to next subtopic**.
This spaced, chunked approach produces dramatically better retention than cramming all theory upfront.

## Phase 2: ASSIGNMENT PRESENTATION

### 2.1 Read the Current Assignment

Read the assignment files for the current subtopic:
- Read the subtopic's `subtopic-explanation.md` — to understand the theory context
- Read `question.md` — to understand what to present
- Check if any work has already been done (are there user files in the assignment directory?)

Determine which subtopic the user is on by reading `topic-progress.md`:
- Which subtopic is 🔵 In Progress?
- Which assignment within that subtopic are they on?
- If no subtopic is in progress, they should start with subtopic 01.

### 2.2 Present the Assignment to the User

```markdown
┌──────────────────────────────────────────────────────────────────┐
│  📚 Topic: {topic}                                               │
│  📂 Subtopic: {subtopic-name} ({subtopic-n}/{subtopic-total})     │
│  📝 Assignment: {assignment-name} ({n}/{total})                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  {brief description of the assignment}                           │
│                                                                   │
│  📖 Theory: subtopic-explanation.md — read this first             │
│                                                                   │
│  Files:                                                           │
│  • Subtopics: {SKILL_DIR}/topics/{topic}/subtopics/              │
│  • Theory: .../{subtopic-name}/subtopic-explanation.md            │
│  • Question: .../{subtopic-name}/assignments/01-{name}/question.md│
│  • Scaffold: (same directory)/scaffold/                           │
│  • Test: (same directory)/test.{ext}                              │
│  • Solution guide: (same directory)/solution-guide.md             │
│                                                                   │
│  To work on this:                                                 │
│  1. Read subtopic-explanation.md for THIS subtopic's concepts     │
│  2. Read the question.md carefully                                │
│  3. Use the scaffold to write your solution                       │
│  4. Run the test to verify your solution                          │
│  5. Ask me questions if you're stuck                              │
│  6. When done, say \"I'm done\" or \"Check my solution\"         │
│                                                                   │
│  Tip: Focus on THIS subtopic's concepts. The next subtopic will   │
│  build on what you learn here — master this first.                │
└──────────────────────────────────────────────────────────────────┘
```

## Phase 3: USER INTERACTION LOOP

This is an open-ended loop. The user will:
- Work on the assignment
- Ask questions about concepts
- Request hints
- Submit their solution for review
- Ask for clarifications or alternative approaches

### 3.1 How to Handle User Interactions

**For concept questions** (e.g., "I don't understand how closures work"):

**Rule: Do NOT just explain. Generate a task that tests their understanding.**

The user learns by DOING. When they ask a concept question, give them a focused micro-exercise that isolates the concept they're struggling with. Understanding comes from solving it, not from reading an explanation.

1. Spawn a subagent to generate a DIAGNOSTIC MICRO-EXERCISE:

```typescript
task(category="unspecified-high", run_in_background=false, prompt="
1. TASK: Create a focused micro-exercise that tests the user's understanding of '{concept}' in '{skill}'. The user is struggling with this concept during assignment '{assignment}' on topic '{topic}'.
2. EXPECTED OUTCOME: A self-contained micro-exercise (5-15 min to solve) that isolates the specific concept and lets the user figure it out by coding.

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, context7_query-docs, read, write

4. MUST DO:
   - **CURRENT DATE: {CURRENT_DATE}** — ONLY research current information. Check for deprecation warnings. If a library/framework has a newer standard (e.g. CRA → Vite, pip → uv), reference the current approach.
   - **ZPD calibration**: The user is struggling with this concept. The micro-exercise must be EASIER than the main assignment — it fills the gap, not adds more difficulty. ~90% familiar / 10% new.
   - Read the current assignment: {ASSIGNMENT_DIR}/question.md (to understand context without giving away the solution)
   - Research the concept online to find the MOST COMMON confusion points
   - Design a micro-exercise that:
     * ISOLATES the confusing concept — removes unrelated complexity
     * Is a real-world-ish scenario (NOT 'write a function that...' — frame it as solving a problem)
     * Can be solved in 5-15 minutes (if it takes longer, it's outside ZPD — add more scaffolding)
     * Requires the user to WRITE CODE / PRODUCE SOMETHING to complete
     * Has a CLEAR RIGHT ANSWER that can be verified
     * INCLUDES built-in scaffolding: starter code, inline hints (commented), or step guidance
   - DO NOT write academic explanations. The exercise IS the teaching tool.
   - Include in the exercise brief:
     * A short scenario (1-2 sentences)
     * What to build
     * Success criteria (how they know it's correct)
     * A hint ONLY if they get stuck (hidden section)
   - Save to: {CURRENT_RUN}/interaction-{n}-diagnostic-task.md
   - The file should contain: task description + any starter code + verification steps

5. MUST NOT DO:
   - Do NOT write a long explanation — the task IS the teaching tool
   - Do NOT give away the main assignment solution
   - Do NOT make the exercise too complex — isolate ONE concept
   - Do NOT skip the hands-on component — user must write/do something

6. CONTEXT:
   - Skill: {skill}
   - Topic: {topic}
   - Concept: {concept}
   - User's confusion: {their exact question}
   - User experience level: {from preferences}
   - ZPD directive: This micro-exercise must be EASIER than the main assignment. The user is struggling — your job is to fill the gap, not stretch further. ~90% familiar / 10% new.
")
```

2. Present the micro-exercise to the user:
> "The best way to understand {concept} is to work through it. Here's a focused exercise that isolates exactly what you're asking about:
>
> 📝 {CURRENT_RUN}/interaction-{n}-diagnostic-task.md
>
> Try solving it — it should take 5-15 minutes. Once you're done, we can discuss what clicked and get back to the main assignment. Questions while you work?"

3. When the user completes the micro-exercise, verify their solution and discuss what they learned. THEN connect it back to the main assignment.

4. If the user still doesn't understand after the micro-exercise:
   - Do NOT make the second one harder. Make it EASIER with MORE scaffolding.
   - Break the concept into smaller sub-concepts and target just one.
   - Provide more starter code, more inline hints, more step-by-step guidance.
   - Only after 2 failed task attempts AND regressed scaffolding, provide a brief direct explanation followed by an even simpler task.
   - If the user is clearly out of their depth, suggest reviewing prerequisites from topic-roadmap.md.

**For solution review** (user says "check my solution" or "I'm done"):
1. Read the user's solution from the scaffold directory.
2. Do NOT use a subagent — review it yourself (it's quick).
3. Check:
   - Does it pass the tests? (If not, this tells you they're outside ZPD — offer easier variant)
   - Is the code clean and idiomatic?
   - Are there edge cases not handled?
   - Could it be more efficient?
4. Provide structured feedback. Be encouraging — the goal is teaching, not grading.
5. **Conduct a self-report debrief using the `question` tool** (critical — you CANNOT calibrate from observation alone due to partial observability). Present these as structured polls with selectable options. The open-ended "Type your own answer" option is available by default if the user wants to add anything:

   ```
   question(questions=[{
     header: "Assignment Difficulty",
     question: "How was the difficulty for you?",
     options: [
       {label: "Too Easy", description: "I finished quickly without much effort"},
       {label: "Just Right", description: "Challenging but doable — I learned a lot"},
       {label: "Too Hard", description: "I struggled significantly"},
     ]
   }, {
     header: "External Resources",
     question: "Did you use any external resources? (Google, docs, Stack Overflow, AI tools)",
     options: [
       {label: "None needed", description: "Solved it with what I know"},
       {label: "Syntax lookups only", description: "Just checked syntax / API details"},
       {label: "Used for concepts", description: "Had to look up explanations to understand"},
       {label: "Heavy use", description: "Couldn't have solved it without external help"},
     ]
   }, {
     header: "Confidence Level",
     question: "How confident do you feel applying these concepts to a new problem?",
     options: [
       {label: "Very confident", description: "Could explain it to someone else"},
       {label: "Mostly confident", description: "Could figure it out with a bit of effort"},
       {label: "Not really", description: "Would need significant help"},
     ]
   }])
   ```

6. **Present path forward options with the `question` tool.** Include a difficulty choice option:

   ```
   question(questions=[{
     header: "What's Next?",
     question: "What would you like to do?",
     options: [
       {label: "Next assignment — you decide difficulty", description: "You pick how hard the next one should be"},
       {label: "Next assignment — default difficulty", description: "I recommend the next level based on how you did"},
       {label: "More practice on this", description: "Similar exercises to reinforce what I just learned"},
       {label: "Switch topics", description: "Move to a different topic on the roadmap"},
       {label: "Take a break", description: "End this session and save progress"},
     ]
   }])
   ```

   If they chose "Next assignment — you decide difficulty", follow up with:

   ```
   question(questions=[{
     header: "Choose Difficulty",
     question: "What difficulty should the next assignment be?",
     options: [
       {label: "Easier", description: "More scaffolding, guided steps, same concepts"},
       {label: "Same difficulty", description: "Similar challenge level with different scenario"},
       {label: "Harder", description: "More complex, combine concepts, new edge cases"},
       {label: "Surprise me", description: "Based on what you've seen from me so far"},
     ]
   }])
   ```

7. **Calibrate using self-report + test results** (use as a recommendation, not a command — the user's choice overrides):
   - **Tests pass + "Just Right" / "Too Easy" + "Very confident"** → user can safely advance. If they chose "default difficulty", proceed to next level.
   - **Tests pass + "Too Hard" or "Heavy use" for concepts** → recommend an easier bridging assignment, but respect if user wants to push forward.
   - **Tests pass + "Not really confident"** → recommend more practice, but respect user's choice.
   - **Tests don't pass** → **user cannot proceed.** Offer regressed easier variant or more scaffolding regardless of their preference. Explain why.

8. Update topic-progress.md with the self-report data, user's choice, and your notes.

**For "I'm stuck" / "give me a hint"**:
1. Read their current work (if any exists).
2. Identify where they're stuck. Is it the core concept or a tangential detail? This tells you if they need ZPD regression.
3. **First response**: provide a minimal hint that nudges, not solves. See if they can proceed.
4. **Second response** (still stuck): increase scaffolding. Give more specific guidance, a partial code snippet, or break the next step down.
5. **Third response** (still stuck): **the assignment is outside their ZPD.** Do NOT keep pushing. Offer to:
   - Create an easier variant of the same assignment with more scaffolding
   - Switch to a bridging micro-exercise that targets the prerequisite they're missing
   - Review the relevant section of topic-explanation.md together
6. Log the struggle pattern in topic-progress.md so the next agent knows this was a sticking point.

**For deeper practice requests** (e.g., "I need more practice with this"):
```typescript
task(category="writing", run_in_background=false, prompt="
1. TASK: Create 2-3 supplementary practice exercises for {topic}/{concept} to help the user build confidence.
2. EXPECTED OUTCOME: Additional mini-exercises with varying difficulty.

3. REQUIRED TOOLS: read, write

4. MUST DO:
   - **CURRENT DATE: {CURRENT_DATE}** — Use current, real-world examples. Avoid outdated patterns or deprecated APIs.
   - **ZPD calibration**: These exercises should be EASIER than the main assignment — they're bridging exercises, not harder challenges.
   - Read the current assignment to understand what's been covered
   - Identify the SPECIFIC sub-concept the user is struggling with (from their interaction history)
   - Create 2-3 smaller exercises that target ONLY that sub-concept
   - Each should be solvable in 5-15 minutes (if longer, add more scaffolding)
   - Include: brief description, expected output, hints, and partial starter code
   - Save as markdown with code blocks to: {CURRENT_RUN}/interaction-{n}-practice-exercises.md

5. MUST NOT:
   - Do NOT repeat the same problems from the main assignment
   - Do NOT make these harder than the main assignment — they bridge the gap, they don't add difficulty
")
```

```

### 3.2 Track All Interactions

For each user interaction during the session:
1. Create an interaction file: `{CURRENT_RUN}/interaction-{n}-{type}.md`
2. Log the user's question, your response, and any files created
3. This creates a searchable history for future sessions

## Phase 4: ASSIGNMENT COMPLETION & ADVANCEMENT

### 4.1 When User Completes an Assignment

1. Verify the solution is correct (run tests if possible).

2. **Update `subtopic-progress.md`** — the per-subtopic tracker:
   - Mark the assignment as ✅ Completed
   - Add session entry to Learning Sessions

3. **Update `topic-progress.md`** — the topic-level overview:
   - Update the subtopic row's assignment count and status
   - Add session entry to the Learning Sessions table
   - Update Skills Demonstrated

4. **Update `progress-index.md`** at the skill level to reflect the change.

5. **Conduct self-report debrief using the `question` tool** — You CANNOT calibrate from system metrics alone (partial observability). The user may have used external resources without your knowledge. Present these as structured polls:

   ```
   question(questions=[{
     header: "Assignment Difficulty",
     question: "How was the difficulty for you?",
     options: [
       {label: "Too Easy", description: "Finished quickly without much effort"},
       {label: "Just Right", description: "Challenging but doable — learned a lot"},
       {label: "Too Hard", description: "Struggled significantly"},
     ]
   }, {
     header: "External Resources",
     question: "Did you use external resources? (Google, docs, Stack Overflow, AI tools)",
     options: [
       {label: "None needed", description: "Solved with what I know"},
       {label: "Syntax lookups only", description: "Just checked syntax/API details"},
       {label: "Used for concepts", description: "Looked up explanations to understand"},
       {label: "Heavy use", description: "Couldn't have solved it without external help"},
     ]
   }, {
     header: "Confidence Level",
     question: "How confident are you applying these concepts to a new problem?",
     options: [
       {label: "Very confident", description: "Could explain it to someone else"},
       {label: "Mostly confident", description: "Could figure it out with some effort"},
       {label: "Not really", description: "Would need significant help"},
     ]
   }])
   ```

6. **Determine next step** — there are now TWO axes of progression:

   **Axis A: More assignments within the SAME subtopic?**
   - If more practice needed or user wants deeper work → generate next assignment within same subtopic
   - If current subtopic is sufficiently mastered → move to NEXT SUBTOPIC

   **Axis B: Advance to next subtopic?**
   - Read `topic-roadmap.md` to determine the next subtopic in dependency order
   - The next subtopic should build on the current one

7. **Present path forward with the `question` tool**, including subtopic awareness:

   ```
   question(questions=[{
     header: "What's Next?",
     question: "You've completed the {subtopic-name} subtopic. What now?",
     options: [
       {label: "Next subtopic: {next-subtopic}", description: "Move to the next learning unit"},
       {label: "More practice on this", description: "Another assignment on {current-subtopic}"},
       {label: "Switch topics", description: "Move to a different topic on the roadmap"},
       {label: "Take a break", description: "End session and save progress"},
     ]
   }])
   ```

   If they chose "Next subtopic", also offer difficulty choice:
   ```
   question(questions=[{
     header: "Next Subtopic Readiness",
     question: "How would you like to approach the next subtopic?",
     options: [
       {label: "Read explanation → do assignment", description: "Full learning cycle"},
       {label: "I know this — jump to assignment", description: "Skip theory, go straight to practice"},
       {label: "Surprise me", description: "Choose the best approach for me"},
     ]
   }])
   ```

8. **Calibrate using self-report + test results** (recommendation, not command — user's choice overrides):
   - **Tests pass + "Just Right"/"Too Easy" + "Very confident"** → user can safely advance to next subtopic.
   - **Tests pass + "Too Hard" or "Heavy use for concepts"** → recommend another assignment within same subtopic first, but respect if user wants to push forward.
   - **Tests pass + "Not really confident"** → recommend more practice within same subtopic, but respect user's choice.
   - **Tests don't pass** → **user cannot proceed to next subtopic.** Offer regressed variant. Must master current subtopic first.
   - **User chose a specific next step** → honor it.

9. Update `SkillPreferences.md` with the self-report data and user's choice.
10. If advancing to next subtopic: the next call will generate that subtopic's explanation + first assignment on-demand.

### 4.2 Generate Next Assignment (On-Demand)

When the user wants to proceed, there are TWO scenarios:

**Scenario A: More assignments within the CURRENT subtopic**
The user wants deeper practice on the concept they just learned.
→ Generate another assignment in the same subtopic's assignments/ directory.

**Scenario B: Advance to the NEXT subtopic**
The user has mastered the current subtopic and wants to move on.
→ Generate the NEXT subtopic's explanation AND its first assignment.

Determine which scenario by reading `topic-progress.md` and checking the user's choice from Phase 4.1 step 7.

---

**Scenario A: More assignments within same subtopic:**

```typescript
task(category="unspecified-high", run_in_background=false, timeout=300000, prompt="
1. TASK: Create next assignment ({assignment-num}) within subtopic '{subtopic}' for topic '{topic}' in skill '{skill}'.
2. EXPECTED OUTCOME: Complete assignment at the requested difficulty, focused on THIS subtopic's concepts.

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, context7_query-docs, read, write

4. MUST DO:
   - **CURRENT DATE: {CURRENT_DATE}** — ONLY use current, real-world scenarios.
   - Read the subtopic-explanation.md: {SUDTOPIC_DIR}/subtopic-explanation.md (stay focused on THIS subtopic's concepts)
   - Read the previous assignment(s) to ensure progression: {ASSIGNMENT_DIR}
   - Research online for real-world applications specific to this subtopic
   - Create the assignment at the user-chosen difficulty:
     * Easier: More scaffolding, guided steps, same concepts (if user struggled)
     * Same level: Similar challenge with different scenario (if user wants consolidation)
     * Harder: More complex, combines subtopic concepts with edge cases (if user breezed through)
   - Save files to: {SUDTOPIC_DIR}/assignments/0{n}-{concept-name}/
   - Follow the same scaffold, naming, and solution-guide conventions from Phase 1.4

5. MUST NOT DO:
   - Do NOT introduce concepts from other subtopics — keep it focused on THIS subtopic
   - Do NOT skip the scaffold
   - Do NOT reuse the exact same scenario from previous assignments
   - Do NOT use `pip install`, `python -m venv`, or `requirements.txt` in Python scaffolds

6. CONTEXT:
   - Skill: {skill}
   - Topic: {topic}
   - Subtopic: {subtopic}
   - Subtopic directory: {SUDTOPIC_DIR}/
   - User-chosen difficulty: {difficulty} — honor this EXACTLY
   - Previous assignment concepts: {summary}
   - User self-report: difficulty={self_reported}, external_help={help_level}, confidence={confidence}
")
```

---

**Scenario B: Create next subtopic + its first assignment:**

```typescript
task(category="deep", run_in_background=false, timeout=600000, prompt="
1. TASK: Create the next subtopic '{next-subtopic}' for topic '{topic}' in skill '{skill}'.
2. EXPECTED OUTCOME: subtopic-explanation.md, first assignment (question, test, scaffold, solution-guide), and subtopic-progress.md for the next subtopic.

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, context7_query-docs, read, write, bash, grep

4. MUST DO:
   - **CURRENT DATE: {CURRENT_DATE}** — ONLY use current info. Research extensively (5+ searches) for this specific subtopic.
   - Read the topic-roadmap.md: {TOPICS_DIR}/{topic}/topic-roadmap.md (understand dependency order)
   - Read the topic-overview.md: {TOPICS_DIR}/{topic}/topic-overview.md (understand context)
   - Read the previous subtopic's explanation to ensure proper progression: {PREV_SUDTOPIC_DIR}/subtopic-explanation.md
   - Research THIS subtopic independently — do NOT reuse content from previous subtopics
   
   Create:
   4a) subtopic-explanation.md at:
     {TOPICS_DIR}/{topic}/subtopics/{next-subtopic-num}-{name}/subtopic-explanation.md
   
   Follow the same 3-layer format from Phase 1.4 Step 4a:
   - Why This Matters (scoped to THIS subtopic)
   - Prerequisites (link to previous subtopic if needed)
   - Layer 1: Core Idea (1-2 paragraphs)
   - Layer 2: How It Works (commands, code, examples — researched)
   - Layer 3: Production Context (misconceptions, edge cases, trade-offs)
   - Learning Checkpoints (3-5 questions)
   - Ready to Practice (link to assignment)
   
   4b) First assignment at:
     {TOPICS_DIR}/{topic}/subtopics/{next-subtopic-num}-{name}/assignments/01-{concept}/
   
   Same structure as Phase 1.4 Step 4b:
   - question.md
   - test.{ext}
   - scaffold/ (with all conventions)
   - solution-guide.md
   
   4c) subtopic-progress.md at:
     {TOPICS_DIR}/{topic}/subtopics/{next-subtopic-num}-{name}/subtopic-progress.md
   
   Update topic-progress.md at the topic level to add the new subtopic row.

5. MUST NOT DO:
   - Do NOT cover concepts from the NEXT subtopic after this one — stay focused
   - Do NOT repeat content from the previous subtopic
   - Do NOT skip research — each subtopic needs independent research
   - Do NOT use `pip install`, `python -m venv`, or `requirements.txt`

6. CONTEXT:
   - Skill: {skill}
   - Topic: {topic}
   - Previous subtopic: {prev_subtopic}
   - Next subtopic: {next_subtopic}
   - Next subtopic number: {n}
   - Topics directory: {TOPICS_DIR}/{topic}/
")
```

After creating the next subtopic, present it to the user (same pattern as Phase 1.5 Step 2-3).

### 4.3 When All Assignments Are Complete

### 4.3 When All Subtopics Are Complete

When ALL subtopics for a topic are completed (all subtopics in the topic-roadmap marked ✅):

1. **Create a cross-subtopic integration assignment** (optional — ask the user if they want one):
   - This assignment combines concepts from ALL subtopics into a real-world scenario
   - Save to: {TOPICS_DIR}/{topic}/assignments/01-{integration-name}/
   - This is the capstone — the user demonstrates they can use everything together

2. **Update `topic-progress.md`** — set overall status to ✅ Completed, finalize all subtopic statuses.

3. **Update `progress-index.md`** — mark topic as ✅ Completed (this is the overview index).

4. **Update `roadmap.md`** — change topic progress marker to ✅.

5. Update `SkillPreferences.md` — note topic completion, record competencies demonstrated.

6. Append to `UserPreferences.md` if the user demonstrated strong affinities or struggles.

7. Ask the user:
> "Great work completing **{topic}**! You mastered {N} subtopics. 🎉
>
> Options:
> 1. **Next topic**: {next_recommended_topic}
> 2. **Choose your own**: pick from the roadmap
> 3. **Cross-subtopic integration project**: combine everything you learned
> 4. **Review & reinforce**: practice more on specific subtopics
> 5. **Done for now**: end this session"

8. If continuing, loop back to Phase 1 (topic selection).

## Phase 5: UPDATE PREFERENCES & PROGRESS

### 5.1 Update UserPreferences.md (Global)

After key learning interactions, assess if any global preferences should be updated:

- User consistently struggles with certain types of concepts → note learning style insight
- User asks for more/less depth → update preferred depth
- User shows strong aptitude in certain areas → note strengths
- User expresses time constraints or goals → update goals section

**Format for updates:**
```markdown
## Preference Log
### {timestamp}: Observed during {topic} learning
- {insight}: {evidence}
```

### 5.2 Update SkillPreferences.md

Always update after a session:
```markdown
## Learning History
### {timestamp}: {topic} — Assignment {n} completed
- Concepts covered: {list}
- Performance notes: {observations}
- User feedback: {any direct feedback}
```

### 5.3 Update progress-index.md (Skill-Level Overview)

`progress-index.md` is the **overview index** — it summarizes state but the authoritative per-topic progress lives in each `topic-progress.md`. Update the index after any state change:

- Assignment completions → reflect status change, link to topic-progress.md
- Topic completions → mark ✅
- New topic starts → add entry pointing to its topic-progress.md
- Session timestamps

### 5.4 Write Session Agent Log

```bash
mkdir -p "$CURRENT_RUN"
```

Write to `$CURRENT_RUN/agent-log.md`:
- Session start/end time
- Topic worked on
- Assignments completed
- Concepts discussed
- Key interactions
- Decisions made about pacing, depth, focus
- Files created
- Next steps / recommendations for next session

## Phase 6: SESSION END

### 6.1 Present Session Summary

```markdown
┌──────────────────────────────────────────────────────────────────┐
│  📋 Learning Session Summary                                     │
├──────────────────────────────────────────────────────────────────┤
│  Skill: {skill}                                                   │
│  Topic: {topic}                                                   │
│  Date: {date}                                                     │
│  Duration: {approx time}                                          │
│                                                                   │
│  Progress:                                                        │
│  • Assignments completed: {n}/{total}                             │
│  • Concepts covered: {list}                                       │
│  • Session log: {CURRENT_RUN}/agent-log.md                        │
│                                                                   │
│  Overall Progress in {skill}: {X}%                                │
│  • Topics completed: {n}/{total}                                   │
│  • Topics in progress: {n}                                        │
│                                                                   │
│  Next session recommendations:                                    │
│  • Continue with next assignment in {topic}                       │
│  • Or start a new topic: {recommended_topic}                      │
│                                                                   │
│  To continue later: /omnilearn-start {skill}                      │
└──────────────────────────────────────────────────────────────────┘
```

### 6.2 Git Commit

```bash
if git rev-parse --git-dir > /dev/null 2>&1; then
  git add "$LEARNING_DIR/"
  git commit -m "omnilearn: learning session — {skill}/{topic}

- Completed assignment(s): {list}
- Updated progress tracking
- Updated learning preferences based on session
"
fi
```

If no git repo: ask if user wants to initialize one (same as /omnilearn-roadmap).

## Quality Gates

| Check | Phase | Action if Failed |
|-------|-------|-----------------|
| Skill roadmap exists | 0 | Tell user to run /omnilearn-roadmap first |
| User preferences read | 0 | Read the files |
| Topic roadmap exists (if needed) | 1.4 | Create it via deep subagent |
| Topic overview exists (topic-overview.md) | 1.4 | Create it via deep subagent — 5 min read, big picture only |
| Subtopic explanation exists (subtopics/01-*/subtopic-explanation.md) with all sections (Why This Matters, Layer 1, Layer 2, Layer 3, Learning Checkpoints) | 1.4 | Re-generate — each subtopic MUST have its own focused explanation |
| subtopic-explanation.md covers ONE subtopic only (no concept cramming) | 1.4 | If multiple concepts are present, split into separate subtopics |
| Assignment 1 exists (question, test, scaffold, solution) | 1.4 | Fix incomplete assignment |
| Assignment tests are syntactically valid | 1.4 | Quick syntax check, fix if broken |
| subtopic-progress.md created for each subtopic | 1.4 | Create with per-subtopic tracking |
| topic-progress.md tracks at subtopic level (not just topic) | 1.4 | Add subtopic rows with status and links |
| topic-progress.md updated on each assignment completion | 4 | Update immediately — update both subtopic-progress.md and topic-progress.md |
| Self-report debrief conducted (difficulty, external help, confidence) | 4 | Use `question` tool to collect structured responses. Log in SkillPreferences.md |
| Calibration decision documented (which signals used, what was decided) | 4 | Write the reasoning in topic-progress.md |
| Subtopic advancement decision made after each assignment (more practice or next subtopic) | 4 | Present options with `question` tool. Document choice. |
| Interaction diagnostic task files written for user Q&A | 3 | Write task file, not just explanation |
| progress-index.md updated after each completion | 4, 5 | Update immediately |
| Agent log written for session | 5 | Write before session end |
| SkillPreferences.md updated | 5 | Update with new observations |
| Git commit made | 6 | Commit or ask user |

## Assignment Difficulty Calibration (ZPD + Flow)

> ⚠️ **Partial Observability Warning**: The system CANNOT reliably measure your understanding or effort through observation alone. You may use Google, Stack Overflow, docs, AI tools, or other resources without the agent knowing. This means automated calibration based on "time to complete" or "hints asked" is fundamentally unreliable. **Direct self-report is essential.** Always ask the user how it went — don't assume you know.

### The 85% Rule
Each assignment should be roughly **85% familiar / 15% new**. If the user is struggling with more than ~30% of an assignment, it's outside their ZPD — provide more scaffolding or offer an easier variant.

### Difficulty Progression (NOT Fixed)

| Phase | Focus | Scaffolding Level | Calibration Method |
|-------|-------|-------------------|---------------------|
| **Baseline** | Establish floor. One straightforward task to gauge current level. | High — detailed hints, guided steps | User self-report + test results |
| **Stretch 1** | Core concept + one new twist. First real learning step. | Medium — key hints available | User self-report + test results |
| **Stretch 2** | Combine concepts, handle edge cases. Defensible difficulty. | Low — minimal hints, fading support | User self-report + test results |
| **Real-World** | Full scenario, multiple concerns, best practices. Maximum stretch. | Minimal — just success criteria | User self-report + test results |

> **If the user says it was "Too Easy"** → skip Stretch 1, start at Stretch 2 (or skip directly to Real-World).
> **If the user says it was "Too Hard" or used heavy external help** → drop back, provide more scaffolding, or create an intermediate variant.
> **If tests don't pass** → **do NOT proceed regardless of self-report.** The user may think they got it but the code says otherwise.
> **The goal is never to make the user fail.** It's to keep them in flow — challenged but supported.

### Calibration Protocol (Self-Report + Verification)

Because the system operates under **partial observability** (your learning process is partially hidden), calibration uses TWO signal sources:

#### Source 1: Verification (System Data)
- Do all tests pass? (Yes/No — this is objective)
- Does the code look reasonable? (Agent assessment)
- Were there obvious struggles visible in the interaction?

#### Source 2: Self-Report (User Data — EQUALLY IMPORTANT)
After each assignment completion, the agent MUST ask these questions using the `question` tool:

1. **Difficulty rating**: Too Easy / Just Right / Too Hard
2. **External resource usage**: Did you use Google, docs, Stack Overflow, or AI tools?
   - If yes: was it for *understanding concepts* or just *syntax/details*?
3. **Confidence level**: Very confident / Mostly confident / Not really confident
4. **Preference**: More practice / Next challenge / Different topic

#### Decision Matrix (Recommendations — User Choice Overrides)

| Tests Pass? | Self-Report | Recommend | But User Can Choose |
|-------------|-------------|-----------|-------------------|
| ✅ Yes | Too Easy + Very confident | Skip next difficulty level | Any difficulty they want |
| ✅ Yes | Just Right + Confident | Proceed to next level normally | Any difficulty they want |
| ✅ Yes | Just Right + Not confident | Offer practice variant | Push to next level if they want |
| ✅ Yes | Too Hard + Heavy external help | Bridging assignment first | Push to next level if they want (their call) |
| ✅ Yes | Heavy external help for concepts | Practice variant or bridging | Push forward if they want |
| ❌ No | Any | **Do NOT proceed.** Regressed variant | **No choice — tests must pass.** Explain why. |
| Any | User selected specific difficulty | Generate at their chosen level | Honor it regardless of recommendation |

#### Dynamic Adjustment Rules

1. **After each assignment completion**, run the self-report debrief BEFORE deciding next steps. Use the `question` tool with selectable options.
2. **Let the user's self-report override your assumptions.** If they say "Too Hard" even though tests passed, they may have brute-forced with external help — believe them and adjust.
3. **Heavy external resource use for concepts ≠ learning.** If the user relied on external explanations (not just syntax lookups), recommend a bridging exercise, but respect if they want to push forward — they know their own capacity.
4. **Tests passing is necessary but not sufficient.** Many learners can make tests pass without understanding why. Always check self-report confidence.
5. **Failed tests always overrule everything.** Even if the user says "I got it," if tests don't pass, they haven't demonstrated it. No advancement allowed.
6. **User choice > system recommendation.** Present your recommendation based on the data, but let the user decide. They know their own learning better than any algorithm.
7. **Let the user choose their own difficulty.** If they want harder, make it harder. If they want easier, make it easier. Their learning, their pace.
8. **After 2 consecutive "Too Hard" reports** → the topic may be too advanced. Check with the user: "You've found the last two assignments too hard. Would you like to review prerequisites, or keep going?"
9. **The number of assignments per topic is NOT fixed at 3.** Add extra intermediate assignments if the user needs them. Remove levels that are too easy. The goal is learning, not completing a checklist.
10. **Document the calibration decision.** In topic-progress.md, note: self-report data, user's choice, your recommendation, and what was actually done. This creates a traceable calibration history.

## Error Recovery

| Situation | Action |
|-----------|--------|
| Skill/roadmap doesn't exist | Tell user to use /omnilearn-roadmap first |
| User asks for a topic not in roadmap | Offer to add it (spawn roadmap-edit flow) |
| User's code doesn't pass tests | Guide them with hints, not the answer. Do NOT advance to next subtopic until tests pass. |
| User wants to skip subtopic | Check if the next subtopic depends on current one. If independent, allow. If dependent, explain the dependency. |
| User wants to skip to advanced topic | Assess readiness, warn if prerequisites missing, let them try |
| User self-reports "Too Hard" but tests pass | Recommend more practice within same subtopic (bridging assignment), but respect if user wants to push to next subtopic. |
| User self-reports "Not confident" | Recommend more practice within same subtopic, but honor user's choice to advance if they prefer. |
| User used heavy external resources for concepts | Recommend another assignment within same subtopic, but let user decide. They may feel ready despite external help. |
| User chooses "Harder" after "Just Right" performance | Honor it. Generate a legitimately harder assignment within the same subtopic. |
| User chooses "Easier" after passing easily | Honor it. They may want consolidation before advancing. Generate at requested difficulty within same subtopic. |
| User's difficulty choice conflicts with recommendation | Present your reasoning briefly, then defer to their choice: "Your call. I'll generate it at the level you asked for." |
| User wants to revisit a previous subtopic | Allow it. Read that subtopic's explanation, offer a practice assignment. Don't force a linear path. |
| Subagent produces low-quality assignment | Fix via continuation session, ensure all files exist |
| Subtopic-explanation covers multiple concepts | Split into separate subtopics. File a continuation session to fix. |
| User gets frustrated | Adjust difficulty, offer easier variant within current subtopic, or suggest taking a break. |
| Session interrupted | Next session reads topic-progress.md — picks up at the current subtopic. |
| Test script has errors | Fix the test script immediately |
| Session interrupted | Next session reads progress-index.md and picks up where left off |
| User wants different language/framework | Adapt scaffold and tests accordingly |

## What You MUST Do

- ✅ **Teach, don't test** — The goal is learning, not assessment. Every assignment is a teaching tool.
- ✅ **ONE concept per subtopic** — Each subtopic-explanation.md covers EXACTLY ONE concept. If you need to explain multiple concepts, split into more subtopics. No cramming.
- ✅ **Calibrate to ZPD** — First assignment should be baseline (easy, ~90% success). Adjust difficulty based on performance. Never start with max difficulty.
- ✅ **Follow the 85% Rule** — ~85% familiar, ~15% new. If the user struggles with >30% of the task, it's outside ZPD — provide scaffolding or regress.
- ✅ **Scaffold then fade** — Start with strong support (detailed hints, starter code, guided steps). Remove scaffolding as competence grows.
- ✅ **Detect frustration early** — If user says "I'm stuck" 3+ times, the task is outside ZPD. Create an easier variant or bridge exercise.
- ✅ **Acknowledge partial observability** — You CANNOT measure their effort or external resource use. Always do a structured self-report debrief after each assignment.
- ✅ **Calibrate using BOTH self-report AND test results** — Tests passing ≠ understanding. Self-report "Too Hard" with tests passing means they brute-forced it. Adjust accordingly.
- ✅ **Let the user's self-report override your assumptions** — If they say "Too Hard" or "Not confident," believe them, even if tests pass.
- ✅ **Ask before deciding next steps** — Don't assume. Use the `question` tool with selectable options. Present subtopic choices ("more practice on this subtopic" vs "next subtopic").
- ✅ **Present options, don't decide for them** — Give the user choices (next subtopic / more practice / switch topics / break). Let them pick.
- ✅ **Let users choose their difficulty** — Offer options: Easier / Same / Harder / Surprise me. Honor their choice even if it differs from your recommendation.
- ✅ **User choice > system recommendation** — Present your assessment, but defer to user's decision. They know their learning better than any algorithm.
- ✅ **Check roadmap exists before starting** — validate the skill is set up
- ✅ **Read progress before each session** — know which subtopic the user is on
- ✅ **Generate assignments on-demand** — only create what's needed now
- ✅ **Create topic roadmaps via deep subagent** — autonomous research + structure
- ✅ **Progress lives in topic-progress.md and subtopic-progress.md** — topic level tracks subtopics, subtopic level tracks assignments. Runs/ contains only action logs.
- ✅ **When user has a doubt, generate a diagnostic micro-task** — but make it EASIER than the main assignment (fills the ZPD gap)
- ✅ **Update subtopic-progress.md after every state change** — never batch updates. Then sync topic-progress.md and progress-index.md.
- ✅ **Log all interactions in runs/** — create interaction task files for Q&A, agent-log.md for session actions
- ✅ **Update user preferences** — when you have clear signal
- ✅ **Provide tasks, not answers** — guide the user to discover solutions through practice
- ✅ **Generate real-world assignments** — theory-only is not enough. Every assignment must be a real-world scenario
- ✅ **Assignments must require genuine work** — the scaffold should provide structure and imports, but the user must write the actual logic. TODO markers with `pass` statements, not pre-filled solutions.
- ✅ **Git commit after each session** — track progress over time

## What You MUST NOT Do

- ❌ Do NOT create a single massive topic-explanation.md covering all subtopics — this violates chunking and cognitive load research. Each subtopic gets its own focused document.
- ❌ Do NOT create all subtopics upfront — only the first. Rest are generated on-demand as the user progresses.
- ❌ Do NOT allow any subtopic-explanation.md to cover multiple concepts — if it does, the subagent made a mistake. Split into more subtopics.
- ❌ Do NOT create all assignments upfront — generate on-demand as user progresses
- ❌ Do NOT start with max difficulty — always baseline first, then calibrate
- ❌ Do NOT push the user beyond ZPD — if they're failing, regress and scaffold more
- ❌ Do NOT keep the same difficulty after failure — if tests fail, offer an easier variant
- ❌ Do NOT write explanations when user has a doubt — generate a diagnostic task instead
- ❌ Do NOT give away solutions when the user is stuck — give them tasks that lead to the answer
- ❌ Do NOT skip scaffold files — the user needs a starting point
- ❌ Do NOT skip fading scaffolding — as competence grows, reduce support
- ❌ Do NOT make all assignments the same difficulty — progression is critical. Each should be noticeably harder than the last.
- ❌ Do NOT assume you know how the user performed — partial observability means you CAN'T see external resource use, study time, or effort. Always ask.
- ❌ Do NOT rely on proxy metrics alone (time-to-complete, hints asked, test pass rate) — these are noisy signals that don't capture external help.
- ❌ Do NOT advance the user to the next subtopic based solely on tests passing — if they self-report "Too Hard" or low confidence, recommend more practice within the current subtopic first.
- ❌ Do NOT allow advancement to the next subtopic if tests don't pass — they must demonstrate mastery of the current subtopic first.
- ❌ Do NOT force your recommendation over the user's choice — present your assessment, then defer. It's their learning journey.
- ❌ Do NOT skip the difficulty choice step — always let the user choose their difficulty when generating the next assignment.
- ❌ Do NOT present open-ended questions without options — use the `question` tool with selectable choices. The "Type your own answer" option handles anything they want to add.
- ❌ Do NOT fix the number of assignments — add more if the user needs intermediate steps, remove if they're too easy
- ❌ Do NOT let runs/ contain progress state — runs/ is for action logs only, topic-progress.md is the source of truth
- ❌ Do NOT skip updating subtopic-progress.md and topic-progress.md — both must be kept in sync
- ❌ Do NOT lose the user's work or progress — always read topic-progress.md before acting
- ❌ Do NOT push to remote without explicit user approval
- ❌ Do NOT use `as any`, `@ts-ignore`, or equivalent in any code
