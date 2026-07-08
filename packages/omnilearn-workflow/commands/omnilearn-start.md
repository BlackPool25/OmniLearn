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

1. **`topic-explanation.md`** — Expert-grade theory explainer: context hook → progressive layers (simple→complex) → annotated examples → misconceptions → checkpoints. Each layer is self-contained and correct; they build up WITHOUT assuming prior technical depth.
2. **Hands-on assignments** — calibrated difficulty: baseline → adjusted based on performance. NOT a fixed ladder.
3. **Test scripts** — immediate feedback so the user knows if they're on track.
4. **Scaffold code** — starter files so they jump straight into coding, not boilerplate.
5. **Solution guides** — reference implementations with explanation.

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
        ├── topic-roadmap.md                ← Detailed subtopic roadmap (created on-demand)
        ├── **topic-explanation.md**        ← ← 🔑 THEORY: Expert-grade explanation (context hook → progressive layers 1→2→3 → annotated examples → misconceptions → checkpoints → bridge to assignments)
        ├── topic-progress.md               ← 🔑 PROGRESS LIVES HERE: assignment status, sessions, skills demonstrated
        ├── assignments/
        │   ├── 01-<concept-basics>/
        │   │   ├── question.md             ← Real-world scenario assignment brief
        │   │   ├── test.<ext>              ← Automated test script
        │   │   ├── scaffold/               ← Starter code (user writes solution here)
        │   │   └── solution-guide.md       ← Reference solution + explanation
        │   ├── 02-<concept-intermediate>/
        │   │   └── ...
        │   └── 03-<concept-real-world>/
        │       └── ...
        └── runs/                           ← Per-topic action logs (NOT progress state)
            └── YYYY-MM-DD-HHMMSS-<activity>/
                ├── agent-log.md            ← Actions during this run
                └── ...
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
1. TASK: Create a comprehensive subtopic roadmap and initial learning materials for the topic '{topic}' within the skill '{skill}'.
2. EXPECTED OUTCOME: A detailed topic-roadmap.md with structured learning path, AND the first assignment with question, test script, scaffold, and solution guide.

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, context7_resolve-library-id, context7_query-docs, read, write, bash, grep

4. MUST DO — Step-by-Step:
   - **CURRENT DATE: {CURRENT_DATE}** — ONLY research current information. Prioritize resources from the last 1-2 years. Check for deprecation warnings. Prefer latest stable versions of any library/framework/tool. If older resources reference superseded tools (e.g. CRA → Vite, pip → uv), flag and use the current standard.

   STEP 1 — Research:
   - Read the main roadmap to understand how this topic fits: {ROADMAP}
   - Read user preferences: {GLOBAL_PREFS} (if exists), {SKILL_PREFS} (if exists)
   - Use google_search / websearch extensively to research:
     * What EXACTLY needs to be learned for this topic for real-world proficiency
     * Common learning resources, tutorials, documentation
     * Best practices and common pitfalls
     * Prerequisites and related concepts
   - If it's a tech topic, use context7 for official documentation
   
   STEP 2 — Create topic-roadmap.md at:
     {TOPICS_DIR}/{topic}/topic-roadmap.md
   
   Structure:
   # {topic} — Learning Path
   
   ## Prerequisites
   - What the user should know before starting
   
   ## Learning Objectives
   - By the end, what the user will be able to do
   
   ## Subtopic Breakdown (ordered)
   ### 1. {subtopic name}
   - Core concepts
   - Why it matters in real-world
   - Practical skills gained
   
   ### 2. ...
   
   ## Assignment Structure (Adaptive — Determined During Learning)
   - **Assignments are NOT pre-defined.** They are generated on-demand based on the user's performance, ZPD, and pace.
   - The general trajectory is: Baseline → Stretch → Real-World, but the number of assignments and their specific difficulty is determined adaptively.
   - If the user breezes through, they get fewer, harder assignments. If they struggle, they get more scaffolding and intermediate bridging exercises.
   - The final assignment will be a real-world scenario that integrates this topic with other skills the user knows.
   
   STEP 3 — Create topic-explanation.md at:
     {TOPICS_DIR}/{topic}/topic-explanation.md
   
   This is the THEORETICAL FOUNDATION the user reads BEFORE attempting assignments.
   
   **CRITICAL PEDAGOGY RULES** (based on cognitive load theory + expert teaching research):
   - **One-Level-Down Rule**: Start one level simpler than you think the user needs. You can always go deeper; you cannot undo confusion once it sets in. Each layer must be a correct (if simplified) mental model.
   - **Unpack → Complexity → Repack**: Deconstruct the concept to its essence, progressively add real-world constraints, then reconstruct into a coherent mental model the user can carry forward.
   - **Assume Nothing**: Make ALL prerequisites explicit. The user is here to LEARN. Do not assume they know the surrounding jargon unless you stated it as a prerequisite.
   - **One New Idea at a Time**: Working memory holds ~4 chunks. Never introduce multiple new concepts in the same paragraph.
   - **Concrete Before Abstract**: Show the full working example FIRST, then explain why it works. Humans learn patterns, then rules.
   - **Address Misconceptions Proactively**: For every concept, anticipate the 2-3 most common confusions and address them BEFORE the user gets confused.
   - **Active > Passive**: Embed quick checkpoints. The user should pause, think, or answer before moving on.
   - **The Completeness Test**: Each layer must give a correct mental model IN ISOLATION. Layer 1 must not contradict Layer 3 — it's a simplified version of the same truth.
   
   Use this format:
   
   # {topic}

   ⏱️ Estimated reading time: {X}-{Y} minutes (varies by your depth preference — Layer 1 alone is ~3 min)
   
   ## Why This Matters
   Start with a problem the reader has felt. A concrete situation: "You're building X and you notice Y behavior. You try Z but it doesn't work. That's because..." 
   
   **Hook them with the pain this concept solves.** Do NOT start with a definition. Start with the human situation.
   
   > Example: Instead of "FastAPI is a modern web framework for Python", say: "You've built a Python script that processes data. Now you need to expose it as an API so others can call it. You could use Flask, but you notice it doesn't validate request data, your docs are hand-written, and async endpoints need boilerplate. FastAPI solves these three problems in one go."
   
   ## Prerequisites
   Explicit checklist of what the user should already know. Numbered. No surprises.
   ```
   Before reading this, you should be comfortable with:
   1. {concept A} — we'll use it to build {new concept}
   2. {concept B} — understanding this makes {topic} click faster
   3. {tool/library C} — basic usage required
   
   Not there yet? Review: {link to prerequisite topic or resource}
   ```
   **Be honest here.** If you list something as a prerequisite and it actually isn't needed, you'll scare the user off. If you skip listing something that IS needed, the user will get confused.
   
   ## Layer 1: The Core Idea (One Level Down)
   
   The simplest correct explanation. If you were explaining this to someone who knows the prerequisites but nothing more about this topic.
   
   Describe the concept using:
   - An analogy to something familiar (if one exists and is correct)
   - The minimal working example — no edge cases, no error handling
   - The ONE thing that makes this concept different from what the user already knows
   
   Use **bold** for new terminology. Define each term inline immediately.
   
   > **Keep it to 1-2 paragraphs max.** If you need more, you're not one level down enough.
   
   ## Layer 2: How It Actually Works
   
   Now add real-world constraints. Pick up from Layer 1 and show the same concept with:
   - The actual mechanics (code, system interaction, protocol details)
   - Concrete syntax / implementation patterns
   - How the pieces connect (architecture flow, data flow, call sequence)
   - **Why** each piece exists (not just what it does)
   
   For technical topics: include annotated code blocks where every line/block is explained with a comment on WHY it's there.
   
   ```{language}
   # Line 1: We do X because... (REASON, not description)
   # Line 2: This handles Y edge case because...
   # Line 3: Without this, Z would break because...
   ```
   
   > **If the topic isn't code** (e.g., system design, ML theory): use concrete diagrams described in text. "The flow goes: Client → Load Balancer → Service A. The load balancer exists because..." Show the sequence explicitly.
   
   ## Layer 3: Real-World Production Context
   
   Now go deeper. What changes when this runs at scale, in production, with real traffic?
   
   - **Common Misconceptions** (2-3, proactively addressed):
     | What People Think | What Actually Happens | Why The Confusion |
     |------------------|----------------------|-------------------|
     | "X does Y" | Actually X does Z because..." | "This confusion comes from..." |
   
   - **Edge Cases & Failure Modes**: What breaks and why. How to handle it.
   - **Trade-offs**: What you gain vs what you sacrifice by using this approach.
   - **Performance & Security**: How this behaves under load. Security considerations.
   - **Production Patterns**: How experienced practitioners actually use this (tools, configs, monitoring).
   
   > **Don't scare the user.** Frame these as: "Now that you understand the basics, here's how experienced engineers think about this. You don't need to master all of this today, but knowing these patterns will save you hours of debugging."
   
   ## Learning Checkpoints
   
   Quick verification questions. The user should be able to answer these after reading. They are NOT graded — they're self-checks.
   
   ```
   1. {Concept name}: In your own words, explain what this does and why it exists.
   2. {Scenario question}: If {situation X} happens, what would {concept} do?
   3. {Compare/contrast}: How is {this concept} different from {similar concept the user might confuse it with}?
   
   If you can't answer these, re-read Layer 1 and Layer 2 above. If you're still unsure, ask me to clarify before starting the assignment.
   ```
   
   ## Ready to Practice?
   Brief bridge sentence connecting theory to the first assignment. Reference specific concepts from the explanation:
   
    "Now that you understand {concept from Layer 1} and {pattern from Layer 2}, open assignment 01-{name} to apply it. Pay special attention to {specific gotcha from Layer 3}."
    
    STEP 4 — Create Assignment 1 (the first one) at:
     {TOPICS_DIR}/{topic}/assignments/01-{concept}/
   
   Create these files:
   
   a) question.md — The assignment brief:
     - Clear learning objective
     - Problem description (real-world scenario)
     - Requirements/Specifications (numbered list)
     - Hints section (hidden behind spoiler or at bottom)
     - Expected output/behavior description
     - References to docs/resources if helpful
   
   b) test.{ext} — Automated test script:
     - Language-appropriate test framework (pytest for Python, jest for JS/TS, etc.)
     - Tests that validate the solution works correctly
     - Edge case tests
     - Clear error messages on failure
     - Must be runnable without modification (include any needed imports)
     - Use the simplest possible test setup
   
    c) scaffold/ directory with starter files:
    
       GOLDEN RULE: The user must be able to go from `cd scaffold/` to `running the test` in ONE command.
       If the assignment isn't testing setup/environment skills, automate ALL of that.
    
       The scaffold MUST follow the conventions from SkillConventions.md. If that file doesn't exist,
       read SkillPreferences.md to determine: package manager, test framework, linter, formatter,
       project structure preferences.
    
       ----------------------------------------------------------------
       PYTHON UV PROJECTS (most common case in 2026):
       ----------------------------------------------------------------
       Use THIS structure for ANY Python project that uses `uv`:
    
       ```
       scaffold/
       ├── pyproject.toml          # name = derived from skill (see naming rules below)
       ├── uv.lock                 # auto-generated by uv sync
       ├── .python-version         # pinned Python version
       ├── .gitignore              # .venv, __pycache__, .env, *.pyc
       ├── README.md
       ├── setup.sh                # just runs: uv sync && echo "Ready!"
       ├── src/
       │   └── <package_name>/     # importable package (see naming rules)
       │       ├── __init__.py
       │       └── main.py         # user-editable file with # TODO markers
       └── tests/
           ├── __init__.py
           └── test_main.py
       ```
    
       SETUP (automate everything):
       - setup.sh does ONE thing: `uv sync` (auto-creates .venv, installs all deps)
       - NO `python -m venv`, NO `pip install`, NO `requirements.txt`
       - Include `pyproject.toml` with ALL deps pre-listed in `[project] dependencies`
       - Dev deps go in `[dependency-groups] dev` (uv-native pattern)
       - Include `uv.lock` so installs are reproducible
       - Include `.python-version` to pin the Python version
       - Test script lives INSIDE scaffold/ so `uv run` finds pyproject.toml directly
       - OR: setup.sh + README.md with `uv sync && uv run pytest`
    
       ----------------------------------------------------------------
       JAVASCRIPT / TYPESCRIPT PROJECTS:
       ----------------------------------------------------------------
       - Use `package.json` with `npm install` or the user's preferred package manager
       - Include minimal config files (tsconfig.json, .eslintrc, etc.)
       - test script: `npm test`
    
       ----------------------------------------------------------------
       GENERIC (all projects):
       ----------------------------------------------------------------
       - Minimal code structure — only the files the user needs to touch
       - Comments marking where to write code // TODO: or # TODO:
       - Import/require statements already in place
       - Cross-skill integration: if the user knows {related_skill}, structure the scaffold to use familiar patterns from it
       - If the topic is NOT a programming topic (e.g., system design), provide templates or worksheets instead
    
       ----------------------------------------------------------------
       PROJECT NAMING RULES (MANDATORY — Python/Node/any):
       ----------------------------------------------------------------
       The project name in pyproject.toml / package.json MUST follow these rules:
    
       1. **Be descriptive & unique** — NEVER use generic names:
          ❌ BAD: "app", "myapp", "project", "api", "backend", "core", "server"
          ✅ GOOD: skill-derived kebab-case like "python-backend-fastapi-learning"
    
       2. **No PyPI conflicts** — The name must NOT match any dependency's PyPI name.
          Search PyPI to verify. If it matches, rename. Common conflicts: "app", "api",
          "fastapi" (if adding fastapi as dep), "uvicorn", "pydantic".
    
       3. **Rule for Python projects**:
          - `pyproject.toml` name (distribution name): kebab-case with hyphens
          - Import package name (directory): same name with hyphens → underscores
          - Example:
            | Skill | "Python-Backend-FastAPI" |
            | Project name | `python-backend-fastapi-learning` |
            | Package dir | `src/python_backend_fastapi_learning/` |
          - Derive from skill name: lowercase the skill, replace spaces/slashes with hyphens, append "-learning"
    
       4. **Rule for Node projects**:
          - `package.json` name: @scope/kebab-case (e.g., `@omnilearn/react-learning`)
          - Main entry: `src/index.js` or `src/index.ts`
    
       ----------------------------------------------------------------
       ANNOYING THINGS TO NEVER DO:
       ----------------------------------------------------------------
       - Do NOT make the user manually create a venv or install packages unless the assignment is specifically about that
       - Do NOT leave unlisted imports — if a package is needed, it must be in pyproject.toml / package.json as a dependency
       - Do NOT create requirements.txt — use pyproject.toml exclusively for Python uv projects
       - Do NOT run `uv` commands from a directory without a pyproject.toml (unless using `--no-project`)
       - Do NOT place test.sh outside the scaffold directory — it causes uv project discovery failures
       - Do NOT require the user to set up databases, API keys, or external services without providing clear instructions or a docker-compose.yml
       - Do NOT leave configuration files empty or incomplete — provide working defaults
       - Do NOT make the user hunt for the right Python/Node version — specify it in the scaffold or use `.nvmrc`/`.python-version`
       - Do NOT use project name "app" — it conflicts with the PyPI "app" package and breaks uv
   
   d) solution-guide.md — CRITICAL: Must be researched, accurate, and complete.
   
      BEFORE writing the solution:
      1. Use google_search / context7_query-docs to research the CORRECT approach for this specific problem.
      2. Verify your solution compiles/runs correctly — test it mentally or note any assumptions.
      3. Cross-reference with topic-explanation.md to ensure consistency.
      4. If the topic involves a library/framework, check official docs via context7 to confirm API accuracy.
      
      The solution-guide.md must have this structure:
      
      ## Solution Overview
      - What approach was taken and why (1 paragraph)
      - Key decisions made and the tradeoffs considered
      
      ## Complete Solution
      ```{language}
      # The full, working solution code
      # Each section commented with WHY, not just WHAT
      ```
      
      ## Step-by-Step Explanation
      - Break the solution into logical steps
      - For each step: what it does, why it's done this way, what would happen if you did it differently
      - Reference the topic-explanation.md concepts being applied
      
      ## Edge Cases Handled
      - List edge cases the solution handles
      - What would break if not handled
      
      ## Alternative Approaches
      - At least one alternative solution approach
      - Why the main approach was chosen over alternatives
      
      ## Common Mistakes
      - 3-5 specific mistakes learners make on this type of problem
      - How to identify and fix each one
      
      ## Real-World Notes
      - How this solution would differ in a production codebase
      - Performance, security, or maintainability considerations
   
STEP 5 — Create topic-progress.md at:
   {TOPICS_DIR}/{topic}/topic-progress.md

   This is the AUTHORITATIVE progress tracker for this topic. Structure:
   
   # Progress: {topic}
   
   ## Status
   - Overall: 🔵 In Progress
   - Started: {date}
   - Last activity: {date}
   
   ## Assignments
   1. **01-{concept}** — 🟢 Not Started
      <!-- Update to 🔵 In Progress when started, ✅ Completed when done -->
   
   ## Learning Sessions
   | Date | Activity | Run Log |
   |------|----------|---------|
   | {date} | Topic started, first assignment created | runs/{run-id}/agent-log.md |
   
   ## Skills Demonstrated
   <!-- Record real-world skills the user has shown -->
   
   Also update progress-index.md at the skill level to point to this topic:
   - Add topic entry with status 🔵 In Progress and a link to topic-progress.md

5. MUST NOT DO:
   - Do NOT create all assignments at once — only the first one. Subsequent assignments are generated on-demand as the user progresses.
   - Do NOT make assignments purely theoretical — use real-world scenarios
   - Do NOT skip the scaffold — the user should be able to start coding immediately
   - Do NOT make topic-explanation.md a wall of text — use whitespace, headings, examples, and checkpoints to break it up. Each layer should take 3-5 minutes to read. The full document is a thorough deep-dive, not a skim.
   - Do NOT use any external packages that aren't standard library without noting it
   - Do NOT create assignments that are too easy (basic concept application) or too hard (leaps without foundation)
   - Do NOT leave TODOs in scaffold that require making unrelated architectural decisions
   - **Do NOT write solutions without researching first** — use google_search or context7 to verify API syntax, library behavior, and best practices before writing solution-guide.md
   - **Do NOT guess** — if you're unsure how a library function works, look it up via context7. Guesses lead to inaccurate solutions.
   - **Do NOT use `pip install`, `python -m venv`, or `requirements.txt` in Python scaffolds** — use `uv sync` and `pyproject.toml`
   - **Do NOT name the project "app" or any generic name** — use the skill-derived naming rules (see STEP 4)
   - **Do NOT generate scaffolds with flat layout (`app/` at root)** — use `src/` layout for production-quality structure

6. CONTEXT:
   - Skill: {skill} — DERIVE THE PROJECT NAME FROM THIS using naming rules in STEP 4
   - Topic: {topic}
   - Topics directory: {TOPICS_DIR}/{topic}/
   - User experience level: {from preferences}
   - User learning style: {from preferences}
   - Skill conventions (package manager, project structure, deps, testing setup): {from SkillConventions.md — read before generating scaffold. If SkillConventions.md doesn't exist, read SkillPreferences.md}
   - Cross-skill context (other skills user knows, so scaffold can use familiar patterns): {from cross-skill inventory}
")
```

After completion, verify:
- topic-roadmap.md exists with proper structure
- **topic-explanation.md exists with all required sections (Why This Matters, Prerequisites, Layer 1, Layer 2, Learning Checkpoints, Ready to Practice)**
- Assignment 1 exists with all 4 files (question.md, test, scaffold, solution-guide.md)
- Test script is syntactically valid (run a quick check)

If anything is missing, fix via session continuation: `task(task_id="<session_id>", prompt="Fix: {missing element}")"

## Phase 1.5: READINESS GATE — Teach Before Test

**The user MUST read the theory before touching assignments.** This is non-negotiable.

1. Present the topic-explanation.md to the user:
> "Before we jump into coding, let's cover the concepts you need.
>
> 📖 **{SKILL_DIR}/topics/{topic}/topic-explanation.md**
>
> This covers: Why This Matters → Prerequisites → Layer 1 (Core Idea) → Layer 2 (How It Works) → Layer 3 (Production Context) → Learning Checkpoints → Ready to Practice
> It should take about 5-10 minutes to read.
>
> Let me know when you've finished reading, or ask me questions about anything that's unclear."

2. **Wait for the user to confirm they've read it.** Do NOT skip this step.
   - If they ask questions → answer them (using diagnostic task pattern from Phase 3 if needed)
   - If they say "I already know this" → ask 2 quick concept-checking questions to verify. If they pass, skip. If they fail, tell them to read it.
   - If they say "ready" → proceed.

3. **Only after confirmation** → proceed to Phase 2.

## Phase 2: ASSIGNMENT PRESENTATION

### 2.1 Read the Current Assignment

Read the assignment files for the current topic:
- `question.md` — to understand what to present
- Check if any work has already been done (are there user files in the assignment directory?)

### 2.2 Present the Assignment to the User

```markdown
┌──────────────────────────────────────────────────────────────────┐
│  📚 Topic: {topic}                                               │
│  📝 Assignment: {assignment-name} ({n}/{total})                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  {brief description of the assignment}                           │
│                                                                   │
│  📖 Start here: topic-explanation.md — read the theory first     │
│                                                                   │
│  Files:                                                           │
│  • Theory: {SKILL_DIR}/topics/{topic}/topic-explanation.md       │
│  • Question: {SKILL_DIR}/topics/{topic}/assignments/             │
│              01-{name}/question.md                                │
│  • Scaffold: (same directory)/scaffold/                           │
│  • Test: (same directory)/test.{ext}                              │
│  • Solution guide: (same directory)/solution-guide.md             │
│                                                                   │
│  To work on this:                                                 │
│  1. Read topic-explanation.md for the concepts                    │
│  2. Read the question.md carefully                                │
│  2. Use the scaffold to write your solution                       │
│  3. Run the test to verify your solution                          │
│  4. Ask me questions if you're stuck                              │
│  5. When done, say \"I'm done\" or \"Check my solution\"         │
│                                                                   │
│  Tip: Try to solve it yourself before looking at the solution     │
│  guide. That's where the real learning happens.                   │
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
5. **Calibrate next step based on performance:**
   - **Passed easily (no hints, fast, clean code)** → great. Flag for next level: skip easier variants, go straight to stretch.
   - **Passed with some hints or minor issues** → perfect ZPD. Proceed to next level normally.
   - **Passed but needed significant help** → they're at the edge of ZPD. Consider an intermediate bridging assignment before the next difficulty level.
   - **Did NOT pass tests** → **do NOT proceed.** They're outside ZPD. Offer a regressed easier variant or more scaffolding. Create an intermediate exercise that bridges the gap.
6. Update topic-progress.md with the result and your calibration assessment.

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
2. **Update `topic-progress.md`** — this is the AUTHORITATIVE source for per-topic progress:

```bash
# Read topic-progress.md, update assignment status from 🔵 In Progress to ✅ Completed
# Add session entry to the Learning Sessions table
# Update Skills Demonstrated with any new real-world skills the user showed
```

3. **Update `progress-index.md`** at the skill level to reflect the change (this is an OVERVIEW index, not the source of truth):

```bash
# Update progress-index.md to reflect the assignment completion
# Keep it concise — just the status change, detailed tracking lives in topic-progress.md
```

4. Update `SkillPreferences.md` with any new insights about the user's learning.

5. Ask if they want to:
   - **Continue to the next assignment** (same topic, next difficulty level)
   - **Take a break** (session ends, progress saved)
   - **Request more practice** on the current concept
   - **Move to a new topic**

### 4.2 Generate Next Assignment (On-Demand)

When the user wants to proceed, generate the next assignment:

```typescript
task(category="unspecified-high", run_in_background=false, timeout=300000, prompt="
1. TASK: Create the next assignment ({assignment-num}) for topic '{topic}' in skill '{skill}'.
2. EXPECTED OUTCOME: Complete assignment with question.md, test script, scaffold, and solution-guide.md at the next difficulty level.

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, context7_query-docs, read, write

4. MUST DO:
   - **CURRENT DATE: {CURRENT_DATE}** — ONLY use current, real-world scenarios. Avoid outdated APIs, deprecated libraries, or superseded best practices. Research what's current in the industry for this topic.
   - Read the topic-roadmap.md: {TOPICS_DIR}/{topic}/topic-roadmap.md
   - Read the previous assignment(s) to ensure progression: {ASSIGNMENT_DIR}
   - Read the user's learning preferences and history from {SKILL_PREFS}
   - Research online for real-world applications of this topic at this difficulty level
   - Create the assignment with INCREASING difficulty following this PATTERN (more levels can be added as needed):
     * Assignment 1: Basic understanding and application
     * Assignment 2: Intermediate — combine concepts, handle edge cases  
     * Assignment 3: Real-world — full scenario, multiple concerns, best practices
     * (Additional assignments can be created if the user needs more depth or practice)
   - For each assignment, create these files in:
     {TOPICS_DIR}/{topic}/assignments/0{n}-{concept-name}/
   
   a) question.md — Include:
     - Learning objectives
     - Real-world scenario description
     - Technical requirements
     - Acceptance criteria (how to know it's done)
     - Hints (separate section, user can choose to read)
   
   b) test.{ext} — Automated validation:
     - Language-appropriate test framework
     - Unit tests + edge cases
     - Clear failure messages
     - Self-contained and runnable
   
    c) scaffold/ — Starter code:
    
       GOLDEN RULE: The user must go from `cd scaffold/` to running tests in ONE command.
    
       The scaffold MUST follow SkillConventions.md (or SkillPreferences.md if conventions file doesn't exist).
    
       ----------------------------------------------------------------
       PYTHON UV PROJECTS (most common case in 2026):
       ----------------------------------------------------------------
       Use THIS structure:
    
       ```
       scaffold/
       ├── pyproject.toml          # name = skill-derived (see naming rules below)
       ├── uv.lock                 # auto-generated by uv sync
       ├── .python-version         # pinned Python version
       ├── .gitignore              # .venv, __pycache__, .env, *.pyc
       ├── README.md
       ├── setup.sh                # just runs: uv sync
       ├── src/
       │   └── <package_name>/     # importable package (skill-derived)
       │       ├── __init__.py
       │       └── main.py
       └── tests/
           ├── __init__.py
           └── test_main.py
       ```
    
       SETUP RULES:
       - setup.sh: `uv sync` only (auto-creates .venv, installs all deps)
       - NO `python -m venv`, NO `pip install`, NO `requirements.txt`
       - pyproject.toml with ALL deps pre-listed, dev deps in `[dependency-groups] dev`
       - Test file lives INSIDE scaffold/ so `uv run` finds pyproject.toml
        
       ----------------------------------------------------------------
       JAVASCRIPT / TYPESCRIPT / OTHER:
       ----------------------------------------------------------------
       - Node: package.json with npm install or user's preferred package manager
       - Rust: Cargo.toml with cargo build
       - Follow SkillConventions.md for the exact structure
    
       ----------------------------------------------------------------
       PROJECT NAMING RULES (MANDATORY — same as Phase 1.4):
       ----------------------------------------------------------------
       - NEVER use generic names: "app", "myapp", "project", "api", "backend", "core", "server"
       - USE: skill-derived kebab-case, e.g., "python-backend-fastapi-learning"
       - The project name must NOT match any dependency's PyPI name (check before choosing)
       - Python: project name = kebab-case, package dir = same with underscores
         Example: name="python-backend-fastapi-learning", src/python_backend_fastapi_learning/
       - Derive from skill name: lowercase skill, replace special chars with hyphens, append "-learning"
    
       ----------------------------------------------------------------
       ANNOYING THINGS TO NEVER DO:
       ----------------------------------------------------------------
       - Do NOT make the user manually create a venv or install packages unless the assignment specifically tests that skill
       - Do NOT create requirements.txt — use pyproject.toml exclusively for Python uv projects
       - Do NOT run `uv` commands from a directory without pyproject.toml (unless using `--no-project`)
       - Do NOT place test.sh outside scaffold/ — it breaks uv project discovery
       - Do NOT use project name "app" — conflicts with PyPI "app" package and breaks uv
       - Do NOT leave unlisted imports — every dep must be in pyproject.toml / package.json
   
   d) solution-guide.md — CRITICAL: Must be researched and accurate.
   
      BEFORE writing:
      1. Use google_search / context7_query-docs to research the correct approach.
      2. Verify the solution works — test mentally or note assumptions.
      3. Cross-reference with previous solution-guide.md files to maintain consistency.
      
      Structure:
      
      ## Solution Overview
      - Approach taken, key decisions, tradeoffs
      
      ## Complete Solution
      ```{language}
      # Full working code with WHY comments, not just WHAT
      ```
      
      ## Step-by-Step Explanation
      - Logical steps with reasoning for each
      - What changes at this difficulty level vs previous assignments
      
      ## Edge Cases Handled
      - What was considered and why
      
      ## Alternative Approaches
      - Other valid solutions and when to use them
      
      ## Common Mistakes
      - Specific errors learners make at this difficulty level
      
      ## Production Notes
      - How this scales, performs, or differs in real codebases

5. MUST DO (research before generation):
   - **Research FIRST** — Use context7 or google_search to verify your solution approach before writing
   - **Cross-reference** with topic-explanation.md and prior solution-guide.md files
   - **Verify accuracy** — If you're unsure about API syntax or behavior, look it up. Do not guess.
   
6. MUST NOT DO:
   - Do NOT make the next assignment a repetition of the previous one
   - Do NOT skip difficulty progression
   - Do NOT write solutions without researching first
   - Do NOT use external non-standard dependencies without noting it in scaffold setup
   - Do NOT guess API signatures — use context7 to verify
   - **Do NOT use `pip install`, `python -m venv`, or `requirements.txt` in Python scaffolds** — use `uv sync` and `pyproject.toml`
   - **Do NOT name the project "app" or any generic name** — use skill-derived naming rules
   - **Do NOT generate scaffolds with flat layout** — use `src/` layout for production-quality structure

7. CONTEXT:
   - Skill: {skill} — DERIVE THE PROJECT NAME FROM THIS using naming rules
   - Topic: {topic}
   - Assignment number: {n}
   - Difficulty: {current difficulty level}
   - Previous assignment concepts: {summary}
   - User performance on previous assignment: {observations}
   - Skill conventions (package manager, project structure, deps, testing setup): {from SkillConventions.md — MUST follow these when generating scaffold. If SkillConventions.md doesn't exist, read SkillPreferences.md}
   - Cross-skill context (other skills the user knows): {from cross-skill inventory — integrate these patterns into the scaffold if relevant}
")
```

### 4.3 When All Assignments Are Complete

When all required assignments for a topic are done (the topic-roadmap defines how many; the default progression is 3 but more can be added):

1. **Update `topic-progress.md`** — set overall status to ✅ Completed, finalize all assignment statuses.
2. **Update `progress-index.md`** — mark topic as ✅ Completed (this is the overview index).
3. **Update `roadmap.md`** — change topic progress marker to ✅.
4. Update `SkillPreferences.md` — note topic completion, record competencies demonstrated.
5. Append to `UserPreferences.md` if the user demonstrated strong affinities or struggles.
6. Ask the user:
> "Great work completing **{topic}**! 🎉
>
> Options:
> 1. **Next topic**: {next_recommended_topic}
> 2. **Choose your own**: pick from the roadmap
> 3. **Review & reinforce**: practice more on this topic
> 4. **Done for now**: end this session"

5. If continuing, loop back to Phase 1 (topic selection).

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
| topic-explanation.md exists with all sections (Why This Matters, Prerequisites, Layer 1, Layer 2, Layer 3, Learning Checkpoints, Ready to Practice) | 1.4 | Re-generate — topic-explanation.md is mandatory |
| topic-explanation.md is a proper deep-dive (not shallow, not a wall of text) | 1.4 | Add more depth or break into sections with whitespace and examples |
| Assignment 1 exists (question, test, scaffold, solution) | 1.4 | Fix incomplete assignment |
| Assignment tests are syntactically valid | 1.4 | Quick syntax check, fix if broken |
| topic-progress.md created when topic roadmap is made | 1.4 | Create it with proper structure |
| topic-progress.md updated on each assignment completion | 4 | Update immediately — this is the source of truth |
| Interaction diagnostic task files written for user Q&A | 3 | Write task file, not just explanation |
| progress-index.md updated after each completion | 4, 5 | Update immediately |
| Agent log written for session | 5 | Write before session end |
| SkillPreferences.md updated | 5 | Update with new observations |
| Git commit made | 6 | Commit or ask user |

## Assignment Difficulty Calibration (ZPD + Flow)

### The 85% Rule
Each assignment should be roughly **85% familiar / 15% new**. If the user is struggling with more than ~30% of an assignment, it's outside their ZPD — provide more scaffolding or offer an easier variant.

### Difficulty Progression (NOT Fixed)

| Phase | Focus | Scaffolding Level | Success Rate Target |
|-------|-------|-------------------|---------------------|
| **Baseline** | Establish floor. One straightforward task to gauge current level. | High — detailed hints, guided steps | Should complete easily (>90%) |
| **Stretch 1** | Core concept + one new twist. First real learning step. | Medium — key hints available | Should complete with some struggle (~80%) |
| **Stretch 2** | Combine concepts, handle edge cases. Defensible difficulty. | Low — minimal hints, fading support | Productive struggle (~70%) |
| **Real-World** | Full scenario, multiple concerns, best practices. Maximum stretch. | Minimal — just success criteria | Challenge zone (~60% initial, improve with iteration) |

> **If the user succeeds at Baseline too easily** → skip Stretch 1, start at Stretch 2.
> **If the user fails at Stretch 2** → drop back, provide more scaffolding, or create an intermediate variant.
> **The goal is never to make the user fail.** It's to keep them in flow — challenged but supported.

### Dynamic Adjustment Rules

1. **After each assignment completion**, assess: Did they need hints? How many? How long did it take?
2. **Passed too easily** (no hints, fast) → skip one difficulty level or add a harder twist.
3. **Passed with some hints** → perfect. Proceed to next level with similar calibration.
4. **Failed or excessive struggle** → **do NOT push forward.** Regress: offer an easier variant with more scaffolding, or provide a bridging exercise.
5. **After 2 consecutive failures on the same level** → the topic is too advanced. Recommend reviewing prerequisites from topic-roadmap.md before continuing.
6. **The number of assignments per topic is NOT fixed at 3.** Add extra intermediate assignments if the user needs them. Remove levels that are too easy. The goal is learning, not completing a checklist.

## Error Recovery

| Situation | Action |
|-----------|--------|
| Skill/roadmap doesn't exist | Tell user to use /omnilearn-roadmap first |
| User asks for a topic not in roadmap | Offer to add it (spawn roadmap-edit flow) |
| User's code doesn't pass tests | Guide them with hints, not the answer |
| User wants to skip to advanced | Assess readiness, warn if prerequisites missing, let them try |
| Subagent produces low-quality assignment | Fix via continuation session, ensure all 4 files exist |
| User gets frustrated | Adjust difficulty, offer more practice exercises, change approach |
| Test script has errors | Fix the test script immediately |
| Session interrupted | Next session reads progress-index.md and picks up where left off |
| User wants different language/framework | Adapt scaffold and tests accordingly |

## What You MUST Do

- ✅ **Teach, don't test** — The goal is learning, not assessment. Every assignment is a teaching tool.
- ✅ **Calibrate to ZPD** — First assignment should be baseline (easy, ~90% success). Adjust difficulty based on performance. Never start with max difficulty.
- ✅ **Follow the 85% Rule** — ~85% familiar, ~15% new. If the user struggles with >30% of the task, it's outside ZPD — provide scaffolding or regress.
- ✅ **Scaffold then fade** — Start with strong support (detailed hints, starter code, guided steps). Remove scaffolding as competence grows.
- ✅ **Detect frustration early** — If user says "I'm stuck" 3+ times, the task is outside ZPD. Create an easier variant or bridge exercise.
- ✅ **Check roadmap exists before starting** — validate the skill is set up
- ✅ **Read progress before each session** — know where the user left off
- ✅ **Generate assignments on-demand** — only create what's needed now
- ✅ **Create topic roadmaps via deep subagent** — autonomous research + structure
- ✅ **Progress lives in topic-progress.md** — assignment status, sessions, skills demonstrated. Runs/ contains only action logs.
- ✅ **When user has a doubt, generate a diagnostic micro-task** — but make it EASIER than the main assignment (fills the ZPD gap)
- ✅ **Update topic-progress.md after every state change** — never batch updates. Then sync progress-index.md (the overview)
- ✅ **Log all interactions in runs/** — create interaction task files for Q&A, agent-log.md for session actions
- ✅ **Update user preferences** — when you have clear signal
- ✅ **Provide tasks, not answers** — guide the user to discover solutions through practice
- ✅ **Generate real-world assignments** — theory-only is not enough. Every assignment must be a real-world scenario
- ✅ **Git commit after each session** — track progress over time

## What You MUST NOT Do

- ❌ Do NOT create all assignments upfront — generate on-demand as user progresses
- ❌ Do NOT start with max difficulty — always baseline first, then calibrate
- ❌ Do NOT push the user beyond ZPD — if they're failing, regress and scaffold more
- ❌ Do NOT keep the same difficulty after failure — if tests fail, offer an easier variant
- ❌ Do NOT write explanations when user has a doubt — generate a diagnostic task instead
- ❌ Do NOT give away solutions when the user is stuck — give them tasks that lead to the answer
- ❌ Do NOT skip scaffold files — the user needs a starting point
- ❌ Do NOT skip fading scaffolding — as competence grows, reduce support
- ❌ Do NOT make all assignments the same difficulty — progression is critical. Each should be noticeably harder than the last.
- ❌ Do NOT fix the number of assignments — add more if the user needs intermediate steps, remove if they're too easy
- ❌ Do NOT let runs/ contain progress state — runs/ is for action logs only, topic-progress.md is the source of truth
- ❌ Do NOT skip updating topic-progress.md — it's the authoritative progress record per topic
- ❌ Do NOT lose the user's work or progress — always read topic-progress.md before acting
- ❌ Do NOT push to remote without explicit user approval
- ❌ Do NOT use `as any`, `@ts-ignore`, or equivalent in any code
