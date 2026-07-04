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

**The user learns by doing, not by reading.** Every topic produces:
1. A **topic explanation** — concise, practical overview (just enough context)
2. **Hands-on assignments** — increasing difficulty: basic → intermediate → real-world
3. **Test scripts** — automated validation of the user's solution
4. **Scaffold code** — starter files so they can jump straight into coding
5. **Solution guides** — reference implementations with explanation

The goal metric: **Can the user apply what they learned to real-world problems they haven't seen before?**

## Directory Structure

```
.omnilearn/<skill>/
├── roadmap.md
├── SkillPreferences.md
├── progress-index.md                       ← Overview index: links to topic-progress.md per topic
├── runs/                                   ← Skill-level run logs (action logs only, NOT progress)
│   └── YYYY-MM-DD-HHMMSS-learning-<topic>/
│       ├── agent-log.md                    ← What happened this run: decisions, actions taken
│       ├── interaction-1.md                ← User Q&A interaction record
│       ├── interaction-2.md
│       └── ...
└── topics/
    └── <topic-name>/                       ← e.g., "error-handling", "neural-networks"
        ├── topic-roadmap.md                ← Detailed subtopic roadmap (created on-demand)
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

## MANDATORY TOOLS

| Tool | When | Why |
|------|------|-----|
| `task(category="unspecified-high", background/poll)` | Content creation | Topic roadmaps, assignments, explanations |
| `task(category="deep", background)` | Complex autonomous | Full topic roadmap creation (sub-agents within) |
| `task(category="writing")` | Content writing | Topic explanations, solution guides |
| `task(category="unspecified-high", ["programming"])` | Technical work | Test scripts, scaffold code |
| `google_search` / `websearch_web_search_exa` | Research | Learning resources, topic best practices |
| `context7_query_docs` | Tech skills | Official docs for languages/frameworks |
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
SKILL_DIR="$OMNILEARN_DIR/<skill>"
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

### 0.3 Read Progress, Preferences & Cross-Skill Inventory

Read these files to understand the current state:
- `UserPreferences.md` (if exists) — learning style, experience level, goals
- `SkillPreferences.md` — per-skill state, preferences
- `progress-index.md` — overview of topic statuses

**For any topics marked 🔵 In Progress**, read their `topic-progress.md` files to get the detailed state:
- Which assignment are they on?
- What was the last session's outcome?
- What concepts are they struggling with?

**Cross-skill inventory** — Scan the learning directory for other skills the user has learned:
```bash
ls -d "$OMNILEARN_DIR"/*/ 2>/dev/null | while read dir; do
  skill_name=$(basename "$dir")
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

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, context7_resolve-library-id, context7_query_docs, read, write, bash, grep

4. MUST DO — Step-by-Step:

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
   
   ## Assignment Structure
   - 3 assignments: Basic → Intermediate → Real-World
   - Each builds on the previous
   - Final assignment should be a mini-project or real-world scenario
   
   STEP 3 — Create Assignment 1 (the first one) at:
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
     - Minimal code structure to get started
     - Comments marking where to write code // TODO: or # TODO:
     - Import/require statements already in place
     - Can be empty scaffold if topic is conceptual
   
   d) solution-guide.md:
     - Complete reference solution (code)
     - Explanation of the solution approach
     - Why certain choices were made
     - Alternative approaches
     - Common mistakes and how to avoid them
     - Real-world connections
   
   STEP 4 — Create topic-progress.md at:
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
   - Do NOT create all 3 assignments at once — only the first one
   - Do NOT make assignments purely theoretical — use real-world scenarios
   - Do NOT skip the scaffold — the user should be able to start coding immediately
   - Do NOT use any external packages that aren't standard library without noting it
   - Do NOT create assignments that are too easy (basic concept application) or too hard (leaps without foundation)
   - Do NOT leave TODOs in scaffold that require making unrelated architectural decisions

6. CONTEXT:
   - Skill: {skill}
   - Topic: {topic}
   - Topics directory: {TOPICS_DIR}/{topic}/
   - User experience level: {from preferences}
   - User learning style: {from preferences}
")
```

After completion, verify:
- topic-roadmap.md exists with proper structure
- Assignment 1 exists with all 4 files (question.md, test, scaffold, solution-guide.md)
- Test script is syntactically valid (run a quick check)

If anything is missing, fix via session continuation: `task(task_id="<session_id>", prompt="Fix: {missing element}")`

**Then proceed to Phase 2.**

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
│  Files:                                                           │
│  • Question: .omnilearn/{skill}/topics/{topic}/assignments/      │
│              01-{name}/question.md                                │
│  • Scaffold: (same directory)/scaffold/                           │
│  • Test: (same directory)/test.{ext}                              │
│  • Solution guide: (same directory)/solution-guide.md             │
│                                                                   │
│  To work on this:                                                 │
│  1. Read the question.md carefully                                │
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

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, context7_query_docs, read, write

4. MUST DO:
   - Read the current assignment: {ASSIGNMENT_DIR}/question.md (to understand context without giving away the solution)
   - Research the concept online to find the MOST COMMON confusion points
   - Design a micro-exercise that:
     * ISOLATES the confusing concept — removes unrelated complexity
     * Is a real-world-ish scenario (NOT 'write a function that...' — frame it as solving a problem)
     * Can be solved in 5-15 minutes
     * Requires the user to WRITE CODE / PRODUCE SOMETHING to complete
     * Has a CLEAR RIGHT ANSWER that can be verified
   - DO NOT write academic explanations. The exercise IS the explanation.
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
")
```

2. Present the micro-exercise to the user:
> "The best way to understand {concept} is to work through it. Here's a focused exercise that isolates exactly what you're asking about:
>
> 📝 {CURRENT_RUN}/interaction-{n}-diagnostic-task.md
>
> Try solving it — it should take 5-15 minutes. Once you're done, we can discuss what clicked and get back to the main assignment. Questions while you work?"

3. When the user completes the micro-exercise, verify their solution and discuss what they learned. THEN connect it back to the main assignment.

4. If the user still doesn't understand after the micro-exercise, generate a SECOND one targeting a different angle. Only revert to a direct explanation after 2 failed task attempts.

**For solution review** (user says "check my solution" or "I'm done"):
1. Read the user's solution from the scaffold directory.
2. Do NOT use a subagent — review it yourself (it's quick).
3. Check:
   - Does it pass the tests?
   - Is the code clean and idiomatic?
   - Are there edge cases not handled?
   - Could it be more efficient?
4. Provide structured feedback.
5. If it passes review:
   - Mark assignment as completed in progress-index.md
   - Ask if they want to proceed to the next assignment
   - Generate next assignment on-demand

**For "I'm stuck" / "give me a hint"**:
1. Read their current work (if any exists).
2. Identify where they're stuck.
3. Provide a hint that guides WITHOUT giving away the solution.
4. If they're fundamentally stuck on a prerequisite concept, offer to create mini-exercises.

**For deeper practice requests** (e.g., "I need more practice with this"):
```typescript
task(category="writing", run_in_background=false, prompt="
1. TASK: Create 2-3 supplementary practice exercises for {topic}/{concept} to help the user build confidence.
2. EXPECTED OUTCOME: Additional mini-exercises with varying difficulty.

3. REQUIRED TOOLS: read, write

4. MUST DO:
   - Read the current assignment to understand what's been covered
   - Create 2-3 smaller exercises that target the specific area the user is struggling with
   - Each should be solvable in 5-15 minutes
   - Include: brief description, expected output, hints if needed
   - Save as markdown with code blocks to: {CURRENT_RUN}/interaction-{n}-practice-exercises.md

5. MUST NOT:
   - Do NOT repeat the same problems from the main assignment
")
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

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, context7_query_docs, read, write

4. MUST DO:
   - Read the topic-roadmap.md: {TOPICS_DIR}/{topic}/topic-roadmap.md
   - Read the previous assignment(s) to ensure progression: {ASSIGNMENT_DIR}
   - Read the user's learning preferences and history from {SKILL_PREFS}
   - Research online for real-world applications of this topic at this difficulty level
   - Create the assignment with INCREASING difficulty:
     * Assignment 1: Basic understanding and application
     * Assignment 2: Intermediate — combine concepts, handle edge cases  
     * Assignment 3: Real-world — full scenario, multiple concerns, best practices
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
     - Minimal boilerplate
     - TODO markers for user implementation
     - All necessary imports/includes set up
   
   d) solution-guide.md:
     - Complete solution
     - Explanation of approach
     - Alternative solutions' discussion
     - Real-world production considerations
     - Common mistakes

5. MUST NOT DO:
   - Do NOT make the next assignment a repetition of the previous one
   - Do NOT skip difficulty progression
   - Do NOT use external non-standard dependencies without noting it in scaffold setup

6. CONTEXT:
   - Skill: {skill}
   - Topic: {topic}
   - Assignment number: {n}/3
   - Difficulty: {basic/intermediate/real-world}
   - Previous assignment concepts: {summary}
   - User performance on previous assignment: {observations}
")
```

### 4.3 When All Assignments Are Complete

When all 3 assignments for a topic are done:

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
  git add "$OMNILEARN_DIR/"
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
| Assignment 1 exists (question, test, scaffold, solution) | 1.4 | Fix incomplete assignment |
| Assignment tests are syntactically valid | 1.4 | Quick syntax check, fix if broken |
| topic-progress.md created when topic roadmap is made | 1.4 | Create it with proper structure |
| topic-progress.md updated on each assignment completion | 4 | Update immediately — this is the source of truth |
| Interaction diagnostic task files written for user Q&A | 3 | Write task file, not just explanation |
| progress-index.md updated after each completion | 4, 5 | Update immediately |
| Agent log written for session | 5 | Write before session end |
| SkillPreferences.md updated | 5 | Update with new observations |
| Git commit made | 6 | Commit or ask user |

## Assignment Difficulty Progression

| Level | Focus | What it Tests |
|-------|-------|---------------|
| 01-basic | Core concept application | Can the user apply the fundamental concept correctly? |
| 02-intermediate | Combined concepts + edge cases | Can the user handle complexity and edge cases? |
| 03-real-world | Full scenario + best practices | Can the user deliver production-quality code? |

Each level should feel meaningfully harder. The jump from 02 to 03 should be the biggest — that's where real learning happens.

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

- ✅ **Check roadmap exists before starting** — validate the skill is set up
- ✅ **Read progress before each session** — know where the user left off
- ✅ **Generate assignments on-demand** — only create what's needed now
- ✅ **Create topic roadmaps via deep subagent** — autonomous research + structure
- ✅ **Progress lives in topic-progress.md** — assignment status, sessions, skills demonstrated. Runs/ contains only action logs.
- ✅ **When user has a doubt, generate a diagnostic micro-task** — the user learns by doing, not by reading explanations
- ✅ **Update topic-progress.md after every state change** — never batch updates. Then sync progress-index.md (the overview)
- ✅ **Log all interactions in runs/** — create interaction task files for Q&A, agent-log.md for session actions
- ✅ **Update user preferences** — when you have clear signal
- ✅ **Provide tasks, not answers** — guide the user to discover solutions through practice
- ✅ **Generate real-world assignments** — theory-only is not enough. Every assignment must be a real-world scenario
- ✅ **Git commit after each session** — track progress over time

## What You MUST NOT Do

- ❌ Do NOT create all assignments upfront — generate on-demand as user progresses
- ❌ Do NOT write explanations when user has a doubt — generate a diagnostic task instead
- ❌ Do NOT give away solutions when the user is stuck — give them tasks that lead to the answer
- ❌ Do NOT skip scaffold files — the user needs a starting point
- ❌ Do NOT make all 3 assignments the same difficulty — progression is critical
- ❌ Do NOT let runs/ contain progress state — runs/ is for action logs only, topic-progress.md is the source of truth
- ❌ Do NOT skip updating topic-progress.md — it's the authoritative progress record per topic
- ❌ Do NOT lose the user's work or progress — always read topic-progress.md before acting
- ❌ Do NOT push to remote without explicit user approval
- ❌ Do NOT use `as any`, `@ts-ignore`, or equivalent in any code
