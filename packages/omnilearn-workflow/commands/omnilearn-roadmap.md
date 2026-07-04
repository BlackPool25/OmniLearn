---
description: Create a comprehensive, real-world-ready learning roadmap for any skill or subject. Uses multi-agent research to design optimal learning paths with practical, hands-on focus. Stores structured output in .omnilearn/ for continuous learning.
---

# /omnilearn-roadmap — Create a Comprehensive Learning Roadmap

## Usage
```
/omnilearn-roadmap I want to learn Rust
/omnilearn-roadmap Machine Learning for production systems
/omnilearn-roadmap React with TypeScript
/omnilearn-roadmap System Design for backend engineers
```

## Directory Structure

```
.omnilearn/
├── UserPreferences.md                           ← Global user preferences (auto-read + updated)
└── <skill-name>/                                 ← Normalized skill folder (e.g., "Rust", "Machine-Learning")
    ├── SkillPreferences.md                       ← Per-skill learning preferences
    ├── SkillConventions.md                       ← 🔑 Setup conventions: package manager, project structure, deps, testing (auto-learned)
    ├── roadmap.md                                ← Master roadmap (the main deliverable)
    ├── progress-index.md                         ← Progress log — index of all runs
    ├── runs/                                     ← Research & execution logs
    │   └── YYYY-MM-DD-HHMMSS-roadmap-creation/
    │       ├── agent-log.md                      ← What this run did, decisions made
    │       ├── research-content.md               ← Raw: subagent A findings (what to learn)
    │       ├── research-learning.md              ← Raw: subagent B findings (how to learn it)
    │       └── roadmap-draft.md                  ← Raw: synthesized roadmap draft
    └── topics/                                   ← Topics in the roadmap (populated during learning)
        └── <topic-name>/                         ← Each topic has its own progress tracking
            ├── topic-roadmap.md                  ← Detailed subtopic roadmap (created on-demand)
            ├── topic-progress.md                 ← Per-topic progress: assignments status, sessions
            ├── assignments/                      ← Hands-on assignments (generated during learning)
            │   ├── 01-<concept>/
            │   │   ├── question.md               ← Real-world scenario assignment brief
            │   │   ├── test.<ext>                ← Automated test script
            │   │   ├── scaffold/                 ← Starter code (user writes solution here)
            │   │   └── solution-guide.md         ← Reference solution + explanation
            │   └── ...
            └── runs/                             ← Per-topic action logs (NOT progress state)
                └── YYYY-MM-DD-HHMMSS-<activity>/
                    ├── agent-log.md              ← What happened this run: decisions, actions
                    └── ...
```

## Core Principles

1. **Orchestrator is a coordinator** — You delegate research, synthesis, and creation to subagents. You do not do the work yourself. You manage files, present to user, handle git.
2. **Agent communication via MD files** — Every subagent writes its findings to a markdown file. The next subagent reads those files. No information loss from summarization.
3. **Token efficiency** — Only read files that are needed. Use file paths and grep to find what you need. Don't load entire files into context unnecessarily.
4. **Self-learning** — After key interactions, assess whether user preferences need updating. Store only genuinely useful information. Don't hoard trivia.
5. **Learning by doing** — The roadmap must emphasize practical, real-world skills. Not theory-only. The user learns by coding, building, and solving actual problems.
6. **Two preference layers** — Global (UserPreferences.md across all skills) and per-skill (SkillPreferences.md for this specific domain).
7. **Level-adaptive roadmaps** — Never waste time on topics the user already knows. Research the user's level first, then design a roadmap that starts where they are, not at zero.
8. **Cross-skill integration** — Real-world work combines skills. If the user knows Python and is learning FastAPI, the roadmap should use Python throughout. If they know React and want Node.js, build full-stack projects. Never silo a skill from what the user already knows.

## Phase 0.0: CONFIG CHECK — Validate Learning Directory

**Before ANY other phase, check that OmniLearn is configured:**

```bash
OMNILEARN_CONFIG="$HOME/.config/opencode/omnilearn.json"

if [ ! -f "$OMNILEARN_CONFIG" ]; then
  echo "OmniLearn is not configured yet."
  echo ""
  echo "Run this first:"
  echo "  /omnilearn-init"
  echo ""
  echo "This will set up your learning directory and create the base structure."
  exit 1
fi

# Read the learning directory from config
LEARNING_DIR=$(grep -o '"learningDirectory"[[:space:]]*:[[:space:]]*"[^"]*"' "$OMNILEARN_CONFIG" | sed 's/"learningDirectory"[[:space:]]*:[[:space:]]*"//' | sed 's/"$//')

if [ -z "$LEARNING_DIR" ] || [ ! -d "$LEARNING_DIR" ]; then
  echo "Error: Learning directory '$LEARNING_DIR' not found or invalid."
  echo "Reconfigure with: /omnilearn-init"
  exit 1
fi

# Set the OmniLearn base directory
OMNILEARN_DIR="$LEARNING_DIR/.omnilearn"
echo "Using learning directory: $LEARNING_DIR"
```

All subsequent paths in this command use `$OMNILEARN_DIR` as the base.

## MANDATORY TOOLS

| Tool | When | Why |
|------|------|-----|
| `task(subagent_type="explore", background)` | Research phases | Codebase exploration — check existing skill data |
| `task(category="unspecified-high", background)` | Content creation | Heavy research, roadmap synthesis, file writing |
| `task(category="deep", background)` | Autonomous multi-step | Complex subtasks that need internal orchestration |
| `google_search` / `websearch_web_search_exa` | Research phases | Web research for content, learning paths, best practices |
| `context7_resolve-library-id` + `context7_query_docs` | Tech skills | Official documentation for languages, frameworks, libraries |
| `read`, `write`, `edit`, `bash`, `grep`, `glob` | Every phase | File operations and navigation |
| `bash(git ...)` | Completion phase | Git commit after roadmap creation |

## Phase 0: INTENT GATE — Parse Input & Validate

### 0.1 Parse the User's Intent

Extract the skill name from the user's message. Normalize to kebab-case for folder naming:
- "I want to learn Rust" → skill = `Rust`
- "Machine Learning for production systems" → skill = `Machine-Learning`
- "React with TypeScript" → skill = `React-with-TypeScript`

If the input is too vague (e.g., "I want to learn something"), ask for clarification:
> "I want to help you create a focused learning roadmap. What specific skill or subject do you want to learn? For example: 'Rust', 'Machine Learning', 'React with TypeScript'."

### 0.2 Check Prerequisites

```bash
SKILL_DIR="$OMNILEARN_DIR/<skill-name>"
RUNS_DIR="$SKILL_DIR/runs"
TOPICS_DIR="$SKILL_DIR/topics"

# Create base omnilearn dir if not exists
mkdir -p "$OMNILEARN_DIR"
```

### 0.3 Check for Existing Skill

If `$SKILL_DIR` already has a `roadmap.md`, inform the user:
> "A roadmap for **{skill}** already exists at `.omnilearn/{skill}/roadmap.md`. To revise it, use `/omnilearn-roadmap-edit`. To start learning, use `/omnilearn-start`."

If the user wants to overwrite, note it and proceed (archive old roadmap to runs/ first).

### 0.4 Load User Preferences & Cross-Skill Inventory

```bash
if [ -f "$OMNILEARN_DIR/UserPreferences.md" ]; then
  echo "Reading global user preferences..."
fi
```

Read `UserPreferences.md` if it exists. Key signals to extract:
- Learning style preferences (hands-on, theory-first, etc.)
- Experience level (beginner, intermediate, advanced) — **critical for adaptive roadmap**
- Time commitments
- Career goals
- Prior related knowledge the user has mentioned

### 0.5 Cross-Skill Inventory — Scan Existing Skills

**This is mandatory.** Scan the learning directory for ALL existing skills the user has already learned or is learning:

```bash
# List all existing skill directories inside .omnilearn/
ls -d "$OMNILEARN_DIR"/*/ 2>/dev/null | while read dir; do
  skill_name=$(basename "$dir")
  # Read their progress to understand what the user already knows
  if [ -f "$dir/progress-index.md" ]; then
    echo "Existing skill: $skill_name — checking progress..."
    # Extract: completed topics, current level, tools used
  fi
done
```

**Why this matters:**
- If the user already knows **Python** and wants to learn **Data Science**, the roadmap should use Python from day 1, not teach a new language
- If the user has completed **JavaScript** and wants **React**, skip JS basics and jump into React-specific content
- Real-world projects should **combine skills** — e.g., a Rust + Python project if the user knows both

Compile a **Cross-Skill Context** summary:
```
Cross-Skill Context:
- Existing skills: {skill1} (level: intermediate, topics: {key topics completed})
                {skill2} (level: beginner, topics: {key topics completed})
- User's stated level in {new_skill}: {from preferences or inferred}
- Known related tools/languages: {list}
- Integration opportunities: {ways existing skills can combine with new skill}
```

This summary will be passed to ALL research and synthesis subagents so they can design an adaptive, personalized roadmap.

## Phase 1: PARALLEL RESEARCH — Two Subagents Simultaneously

Spawn BOTH subagents in parallel. Each does exhaustive research and writes to a file.

### 1.1 Subagent A: Content Research — "What to Learn" (Level-Adaptive)

This subagent researches EVERYTHING a person must know to be real-world ready in this skill. Not just theory — practical engineering competence.
**BUT: it must ADAPT the research based on the user's existing level and known related skills.**

```typescript
task(category="unspecified-high", run_in_background=true, prompt="
1. TASK: Research everything a person must learn to become genuinely skilled at {skill}. ADAPT the research based on the user's existing knowledge and related skills they already have.

2. EXPECTED OUTCOME: A comprehensive, structured markdown file covering all knowledge areas, concepts, tools, and practices needed for real-world proficiency in {skill} — **filtered and prioritized based on what the user already knows**.

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, context7_resolve-library-id, context7_query_docs, read, write

4. MUST DO:

   FIRST — Consider the user's level and existing knowledge:
   - User's stated experience with {skill}: {user level}
   - User's existing related skills: {cross-skill context}
   - Example: if user knows Python and wants Data Science, DON'T research Python basics — focus on data science libraries and concepts
   - Example: if user knows JavaScript and wants React, skip JS fundamentals, start with React-specific patterns
   - Example: if user is an absolute beginner, include fundamentals but frame them for real-world application

   THEN — Research with this adaptation:
   - Use google_search / websearch_web_search_exa extensively to find:
     * Official documentation, tutorials, and learning resources for {skill}
     * Industry best practices and standards
     * Common interview topics, real-world requirements
     * Tools, frameworks, and ecosystems around {skill}
     * Advanced topics that separate junior from senior practitioners
   - If {skill} is a programming language/framework/library, use context7 to look up its official docs
   - Structure the research by: Fundamentals (skip if user already knows them) → Core Concepts → Advanced Topics → Ecosystem/Tools → Real-World Application
   - For EACH topic area, specify:
     * What concepts must be understood
     * Why it matters in real-world practice
     * What practical skills/exercises reinforce it
     * Common pitfalls and misconceptions
     * **Integration opportunities with skills the user already knows** (e.g., 'if you already know {related_skill}, you can apply it here by...')
   - Prioritize content that makes someone a BETTER ENGINEER, not just a theory-knower
   - Cover: debugging, testing, performance, security, maintenance, tooling, workflows
   - Research career-relevant aspects: what employers actually look for
   - Write in a clear, structured markdown format with ### headers for each major section
   - **Flag sections that can be skipped or fast-tracked** based on existing knowledge
   - Save to: {RUNS_DIR}/research-content.md

5. MUST NOT DO:
   - Do NOT create a learning schedule or timeline (that's for later synthesis)
   - Do NOT skip advanced topics because they're 'hard'
   - Do NOT include fluff or filler content
   - Do NOT just list topics — explain WHY each matters
   - Do NOT waste space on basics the user clearly already knows — note them briefly and move on

6. CONTEXT:
   - Skill: {skill}
   - User level in {skill}: {user level}
   - User preferences: {user preferences summary}
   - Cross-skill context (existing skills the user has): {cross-skill context}
   - This research will feed into a roadmap synthesis step that must produce a personalized, level-appropriate roadmap
")
```

### 1.2 Subagent B: Learning Path Research — "How to Learn It" (Level-Adaptive)

This subagent researches the best pedagogical approaches, common pitfalls, and learning strategies for this specific skill.
**ADAPT based on the user's existing level and cross-skill knowledge — an intermediate learner needs a very different path than a beginner.**

```typescript
task(category="unspecified-high", run_in_background=true, prompt="
1. TASK: Research optimal learning strategies, common pitfalls, and effective teaching approaches for {skill} — ADAPTED to the user's existing level and related knowledge.
2. EXPECTED OUTCOME: A detailed markdown file covering how to structure learning, common mistakes, and best practices for mastering {skill} at the user's specific level.

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, read, write

4. MUST DO:

   FIRST — Consider the user's level:
   - User's experience with {skill}: {user level}
   - Existing related skills: {cross-skill context}
   - If the user is INTERMEDIATE/ADVANCED in related areas, the learning path should:
     * Skip 'what is X' introductions
     * Use comparisons to known concepts ('this is like Y in Python but different because...')
     * Jump faster into applied, real-world projects
     * Focus on depth, not breadth
   - If the user is a BEGINNER, the learning path should:
     * Build strong foundational understanding through practice
     * Use smaller, more frequent checkpoints
     * Include more guided real-world projects
     * Focus on building confidence through completion

   THEN — Research with this adaptation:
   - Use google_search / websearch_web_search_exa extensively to find:
     * Best learning paths and curricula for {skill} (from universities, bootcamps, online platforms)
     * Common pitfalls and mistakes — **specifically at the user's level** (beginner mistakes vs intermediate mistakes are very different)
     * Evidence-based learning strategies (spaced repetition, project-based learning, etc.)
     * Recommended project ideas of increasing complexity
     * **Integration project ideas that combine {skill} with {existing_skills}** for real-world practice
     * Community resources (forums, Discord servers, conferences, meetups)
     * Success stories and failure patterns from self-learners at similar levels
   - For EACH major phase of learning, recommend:
     * Learning approach (project-based, tutorial-based, reading, etc.)
     * Time estimates for each phase
     * Practice strategies that reinforce learning
     * How to know when you're ready to advance
   - Research project-based learning approaches specifically — the user learns by doing
   - Document what order concepts should be learned and why (prerequisites matter)
   - Identify which parts are hardest for most learners and recommend extra focus
   - **Suggest cross-skill projects** — e.g., if user knows Flask and is learning React, suggest building a full-stack app
   - Write in a clear, structured markdown format with ### headers
   - Save to: {RUNS_DIR}/research-learning.md

5. MUST NOT DO:
   - Do NOT create the actual roadmap (that's for later synthesis)
   - Do NOT recommend expensive paid resources exclusively (mix free and paid)
   - Do NOT suggest 'learn everything before building anything'
   - Do NOT suggest beginner-level resources if the user is clearly beyond that level

6. CONTEXT:
   - Skill: {skill}
   - User level in {skill}: {user level}
   - User preferences: {user preferences summary}
   - Cross-skill context (existing skills the user has): {cross-skill context}
   - This research will feed into a roadmap synthesis step that must produce a personalized, level-appropriate roadmap
")
```

### 1.3 Wait for Both to Complete

Wait for the system notification. Collect both results via `background_output()`.

**Do NOT do any other work during this phase.** The research subagents are doing the heavy lifting.

## Phase 2: ROADMAP SYNTHESIS — Create the Master Roadmap

### 2.1 Read Research Results

```bash
# Read the research files
CONTENT_FILE="$RUNS_DIR/research-content.md"
LEARNING_FILE="$RUNS_DIR/research-learning.md"
```

Read both files to extract key findings.

### 2.2 Spawn Roadmap Synthesizer Subagent (Level-Adaptive + Cross-Skill)

This is the most critical step. The synthesizer must produce a **PERSONALIZED** roadmap that adapts to the user's level and integrates their existing skills.

```typescript
task(category="unspecified-high", run_in_background=false, timeout=300000, prompt="
1. TASK: Synthesize research into a personalized, level-adaptive, cross-skill-integrated master roadmap for {skill}.
2. EXPECTED OUTCOME: A detailed roadmap.md file with a learning path TAILORED to this user's level and existing knowledge — skipping what they already know, integrating related skills, and focused on real-world readiness.

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, context7_query_docs, read, write, grep

4. MUST DO:
   - Read BOTH research files:
     * Content research: {RUNS_DIR}/research-content.md
     * Learning path research: {RUNS_DIR}/research-learning.md
   - Read cross-skill context: existing skills the user has
   - If there are gaps or contradictions, do additional research online
   
   CRITICAL — Personalization rules:
   - **Do NOT include topics the user already knows.** If the user is experienced in Python and learning FastAPI, skip Python fundamentals entirely.
   - **Use analogies to existing knowledge.** Frame new concepts in terms of what the user already knows. E.g., 'Think of this like Python decorators but with a twist...'
   - **Integrate cross-skill projects.** Suggest projects that combine {skill} with the user's existing {related_skills}. E.g., 'Build an ML model in Python and deploy it with FastAPI.' This is how real-world skills are built.
   - **Adjust depth based on level.** For intermediate learners: less breadth, more depth on each topic. For beginners:循序渐进 (step by step) with more reinforcement.
   - **Adjust estimated effort.** An experienced developer learning a new language needs fewer hours than a complete beginner.
   
   The roadmap must have this structure:

   # {skill} Learning Roadmap

   ## Overview (Personalized)
   - What this skill is, why it matters, what YOU'LL be able to do (given your existing {related_skills} knowledge)
   - **Your starting point**: {user level} — what we'll skip because you already know it
   - **Cross-skill opportunities**: How {skill} combines with {related_skills} you already know
   - Estimated effort (hours/weeks — **adjusted for your level**)
   - Learning philosophy (how this roadmap works)

   ## Roadmap Structure
   - How to use this roadmap
   - How progress is tracked
   - How topics connect (prerequisite relationships)
   - Legend: 🟢 Not Started 🔵 In Progress ✅ Completed

   ## Foundation (SKIP if user already knows these)
   Only include topics the user actually needs. If they already know foundational concepts, note it:
   > ✅ Skipped — you already have this from {related_skill}
   
   ### Topic 1: {name}
   - **Why this matters**: Real-world relevance
   - **Core concepts**: What you need to understand
   - **Practical skills**: What you'll be able to do
   - **Your advantage**: How your {related_skill} knowledge applies here
   - **Suggested approach**: How to learn this
   - **Prerequisites**: {none or list}
   - **Estimated time**: {hours — adjusted for user level}
   - **Progress**: 🟢 Not Started

   ## Core
   ### Topic N: {name}
   ... same structure, with cross-skill references where applicable ...

   ## Advanced
   ### Topic M: {name}
   ... same structure ...

   ## Real-World Readiness
   ### Cross-Skill Capstone Projects
   - Project 1: {description combining {skill} with {related_skill}}
   - Project 2: {description combining {skill} with {related_skill}}
   
   ### Ecosystem & Tools
   - Essential tools, IDEs, debugging, profiling

   ## Continuous Growth
   - How to keep learning beyond this roadmap
   - Communities, conferences, advanced resources

   IMPORTANT FORMATTING RULES:
   - The roadmap should be NON-LINEAR where appropriate — show connections between topics
   - Each topic should clearly state prerequisites so the user knows dependencies
   - Focus on real-world readiness: after completing a topic, the user should be able to APPLY it
   - For tech skills: coverage of testing, debugging, performance, security, deployment
   - **Cross-skill integration must appear throughout** — not just in a separate section
   
   - Also create/update {SKILL_DIR}/SkillPreferences.md:
     * Skill name, created date
     * Current stage: {user level}
     * Starting level: {user level}
     * Related skills: {cross-skill context}
     * Learning focus areas
   
   - Also create/update {SKILL_DIR}/progress-index.md:
     * Roadmap created date
     * Overview of all topics with Not Started status
     * Cross-skill context noted
     * Empty learning sessions table

5. MUST NOT DO:
   - Do NOT include topics the user already knows (waste of time — they'll get bored and quit)
   - Do NOT create assignment files (that happens during /omnilearn-start)
   - Do NOT make the roadmap too high-level — each topic should be specific and actionable
   - Do NOT create a linear 'day 1, day 2' style plan — this is a skill roadmap, not a course schedule
   - Do NOT treat beginners and experienced learners the same — the roadmap must be different for each
   - Do NOT silo this skill from the user's existing knowledge — integration is key to real-world readiness

6. CONTEXT:
   - Skill: {skill}
   - User level in {skill}: {user level}
   - Cross-skill context (existing skills): {cross-skill context}
   - Skill directory: {SKILL_DIR}
   - Runs directory: {RUNS_DIR}
   - Topics directory: {TOPICS_DIR}
   - User preferences: {summary}
")
```

### 2.3 Verify Roadmap

Read the generated `roadmap.md` and verify:
- It's not empty or placeholder
- It has at least 5 major topics
- Each topic has: why matters, core concepts, prerequisites, practical skills
- It covers foundation → core → advanced progression
- It has real-world readiness section

If any check fails, spawn a fix subagent: `task(task_id="<session_id>", prompt="Fix: {specific issue}")`

## Phase 3: UPDATE USER PREFERENCES — Organic Learning

### 3.1 Update or Create UserPreferences.md

Read existing `UserPreferences.md` (if any). Based on this interaction, determine if new preferences should be recorded.

**Only add preferences when there is CLEAR SIGNAL. Rules:**
- The user explicitly stated their experience level → record it
- The user explicitly stated learning preferences → record it
- The user asked for specific focus areas → record them
- You inferred something with HIGH confidence → record it as a note

**Do NOT add generic or speculative preferences.**

```markdown
## Learning Style
- [evidence-based preference 1]
- [evidence-based preference 2]

## Technical Background
- [based on their stated or demonstrated knowledge]
```

Append a log entry:
```markdown
## Preference Log
### {date}: {trigger event}
- {what was learned about the user}
- {why it's useful to remember}
```

### 3.2 Write Agent Log

```bash
RUN_LOG="$RUNS_DIR/agent-log.md"
```

Write to the agent log file documenting:
- What skill roadmap was created
- Key decisions made during research and synthesis
- Any notable findings from research
- Current state (user hasn't started learning yet)

## Phase 4: PRESENT TO USER

```markdown
┌──────────────────────────────────────────────────────────────────┐
│  ✅ Roadmap Created: {skill}                                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  📍 Location: .omnilearn/{skill}/roadmap.md                       │
│                                                                   │
│  📊 Roadmap Overview:                                             │
│  • Foundation: {N} topics — build the fundamentals                │
│  • Core: {N} topics — deep practical knowledge                    │
│  • Advanced: {N} topics — expert-level mastery                    │
│  • Real-World: {N} capstone projects + ecosystem tools            │
│  • Estimated effort: {hours} hours                                │
│                                                                   │
│  🎯 Learning Philosophy:                                          │
│  • Learn by doing — each topic has hands-on assignments           │
│  • Progress tracked via progress-index.md                         │
│  • Self-adapting — preferences update as you learn                │
│                                                                   │
│  ┌─ Preview ─────────────────────────────────────────────────┐    │
│  │ {First 2-3 topics from the roadmap}                        │    │
│  │ ...                                                        │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                   │
│  What's next:                                                     │
│                                                                   │
│  1. Review the full roadmap at the path above                     │
│  2. Want changes? Use /omnilearn-roadmap-edit                     │
│  3. Ready to start? Use /omnilearn-start {skill}                  │
│                                                                   │
│  Any feedback on this roadmap? I can adjust depth, focus,         │
│  or specific topics.                                              │
└──────────────────────────────────────────────────────────────────┘
```

Ask for feedback. If the user wants changes, ask them to use `/omnilearn-roadmap-edit`.

## Phase 5: GIT COMMIT

### 5.1 Check Git Setup

```bash
# Check if the project has a git repo
if git rev-parse --git-dir > /dev/null 2>&1; then
  echo "Git repo detected"
else
  echo "No git repo found"
fi
```

If git repo exists:
```bash
git add "$OMNILEARN_DIR/"
git commit -m "omnilearn: create learning roadmap for {skill}

- Added master roadmap with foundation, core, advanced, and real-world topics
- Created skill directory structure with progress tracking
- Updated global user preferences based on interaction
"
```

If no git repo exists, ask:
> "I noticed this project doesn't have a git repository yet. Would you like me to initialize one and commit the roadmap? This enables automatic progress tracking via commits as you learn."

If yes:
```bash
git init
git add "$OMNILEARN_DIR/"
git commit -m "omnilearn: initialize learning environment with {skill} roadmap"
```

**Never push without explicit user instruction.**

## Phase 6: UPDATE TODO & COMPLETE

Mark the task as complete. Update UserPreferences.md if new relevant information was learned.

## Quality Gates

| Check | Phase | Action if Failed |
|-------|-------|-----------------|
| Content research subagent completed | 1 | Block — must have research |
| Learning path subagent completed | 1 | Block — must have research |
| Cross-skill inventory scanned | 0 | Scan .omnilearn/ directories |
| User level extracted from preferences | 0 | Infer from available signals |
| Roadmap has 5+ substantive topics | 2 | Re-synthesize with fix |
| Roadmap skips topics user already knows | 2 | Re-synthesize — remove redundant basics |
| Roadmap references cross-skill integration | 2 | Re-synthesize — add integration opportunities |
| Roadmap covers foundation→core→advanced | 2 | Re-synthesize with fix |
| Roadmap has real-world readiness section | 2 | Re-synthesize with fix |
| Estimated effort adjusted for user level | 2 | Re-synthesize — adjust time estimates |
| progress-index.md created with reference to cross-skill | 2 | Create it manually |
| SkillPreferences.md created with level data | 2 | Create it manually |
| Agent log written | 3 | Write it |
| User preferences considered | 3 | If exists, must be read |
| Git commit attempted | 5 | Ask user if they want to skip |

## Error Recovery

| Situation | Action |
|-----------|--------|
| Skill folder already exists with roadmap | Inform user, suggest /omnilearn-roadmap-edit |
| Research subagent fails | Diagnose, re-spawn with more specific instructions |
| Roadmap synthesis is poor quality | Re-spawn synthesis with fix instructions |
| Subagent can't access web search | Use alternative search tools, proceed with available data |
| User wants different structure | Accept feedback, tell them to use /omnilearn-roadmap-edit |
| User says "I already know this topic" | Show how to use /omnilearn-roadmap-edit to skip it; note user's level in preferences |
| User's level was misjudged (too advanced / too basic) | Update UserPreferences.md with corrected level, offer to regenerate roadmap |
| Cross-skill integration missed a known skill | Note the missing skill in preferences, update roadmap with integration |
| User wants to overwrite existing roadmap | Archive old roadmap to runs/, proceed with creation |
| Git init/commit fails due to permissions | Report error, suggest manual git setup |

## What You MUST Do

- ✅ **Delegate research to parallel subagents** — never do research yourself
- ✅ **Write findings to files** — communication between agents is via markdown files
- ✅ **Read UserPreferences.md at start** — adapt to the user
- ✅ **Update preferences organically** — only when you have clear signal
- ✅ **Scan cross-skill inventory** — check what other skills the user has before designing
- ✅ **Adapt to user level** — skip basics they know, adjust depth and pace
- ✅ **Integrate related skills** — design cross-skill projects and analogies
- ✅ **Verify roadmap quality** — 5+ topics, foundation→core→advanced, real-world focus, level-appropriate
- ✅ **Create complete skill directory structure** — roadmap, progress-index, SkillPreferences, runs/
- ✅ **Present results clearly** — roadmap preview, next steps
- ✅ **Git commit after roadmap creation** — only if repo exists or user agrees

## What You MUST NOT Do

- ❌ Do NOT do research yourself — always delegate to subagents
- ❌ Do NOT skip reading UserPreferences.md if it exists
- ❌ Do NOT ignore cross-skill context — always scan existing skills
- ❌ Do NOT create a roadmap that wastes time on known topics
- ❌ Do NOT silo this skill from what the user already knows — real-world work combines skills
- ❌ Do NOT treat beginners and experienced learners the same — adapt the roadmap
- ❌ Do NOT create assignments during roadmap creation
- ❌ Do NOT make a day-by-day course schedule — this is a skill roadmap
- ❌ Do NOT push to remote without explicit user approval
- ❌ Do NOT ask the user to fill out a preferences form — infer organically
- ❌ Do NOT create theory-only roadmaps — emphasize hands-on learning
- ❌ Do NOT skip advanced topics
