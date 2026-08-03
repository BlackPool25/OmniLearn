---
description: Refine, update, or get answers about a specific subtopic within a skill's learning roadmap. Deep research + structured updates for individual topics.
---

# /omnilearn-refine — Refine a Subtopic or Answer Questions About It

## Usage
```
/omnilearn-refine Rust ownership I'm confused about borrowing rules
/omnilearn-refine Python decorators Can you add more depth to this topic?
/omnilearn-refine React hooks The explanation of useEffect is too shallow
/omnilearn-refine Machine Learning gradient-descent I need more math background
/omnilearn-refine Go concurrency Can you restructure this topic?
```

## Purpose

This command handles TWO scenarios:

1. **User has questions or doubts** about a specific subtopic they're learning → research + explain + optional practice exercises
2. **User wants to refine/update** a specific topic's roadmap → research + restructure with full rigor

Both scenarios follow the same core flow: research → analyze → produce structured output.

## Directory Structure

```
<skill>/                                          ← Skill at learning directory root
├── roadmap.md
├── SkillPreferences.md
├── SkillConventions.md                  ← Setup conventions read for consistent diagnostic tasks
├── progress-index.md
├── runs/
│   └── YYYY-MM-DD-HHMMSS-refine-<topic>/
│       ├── agent-log.md
│       ├── research-findings.md             ← Research output
│       ├── refinement-plan.md               ← What changes are needed
│       └── updated-topic-roadmap.md         ← Draft of updated topic roadmap
└── topics/
    └── <topic>/
        ├── topic-roadmap.md                 ← Will be updated if refined
        ├── topic-explanation.md             ← Theory: Expert-grade deep-dive (context hook → progressive layers → annotated examples → misconceptions → checkpoints) — updated if refined
        ├── topic-progress.md                ← Progress state (preserved)
        ├── assignments/                     ← May be added to if needed
        │   ├── 01-<concept>/
        │   │   ├── question.md
        │   │   ├── test.<ext>
        │   │   ├── scaffold/
        │   │   └── solution-guide.md
        │   └── ...
        └── runs/
```

## Current Date Context

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
- Use specific, well-formed queries — not keywords, but what you want to find.
- Good: `"best practices for error handling in Rust 2024"`
- Bad: `"Rust error handling"`
- Pass the `query` parameter as a string, not an object.

### General Rules
- Match tool call parameter names EXACTLY as specified in the tool definitions.
- Do NOT wrap string parameters in objects.
- Do NOT nest tool calls unless required by the API.
- If a tool call fails, check parameter names and types before retrying.

## MANDATORY TOOLS

| Tool | When | Why |
|------|------|-----|
| `team_create({ inline_spec })` | REFINE flow — parallel research (analysis + online research) | Run the two independent research angles as team members |
| `team_task_create` / `team_task_update` / `team_task_list` | REFINE flow research | Track each research angle's deliverable |
| `team_send_message` | REFINE flow research | Dispatch members, collect completion reports |
| `team_shutdown_request` / `team_approve_shutdown` / `team_delete` | After REFINE research | **Closure Contract** — close the team once all research tasks are terminal |
| `google_search` / `websearch_web_search_exa` | Research | Topic research, answer questions, validate changes |
| `context7_resolve-library-id` + `context7_query-docs` | Tech topics | Official documentation for precise answers — MUST call resolve first |
| `task(category="unspecified-high", run_in_background=false)` | QUESTION flow (serial) | Single-deliverable steps with no parallelism (diagnostic task creation, roadmap update) |
| `read`, `write`, `edit`, `bash`, `grep`, `glob` | All phases | File operations |

## TEAM ORCHESTRATION (REFINE flow research)

**When a phase has 2+ independent research/analysis agents, run them as a TEAM, not as individual `task()` calls.** Teams are ephemeral:

1. **Create the team** with an inline spec — members are category-routed workers whose prompts are fully self-contained (read context → research/analyze → write deliverable file → report to lead via `team_send_message`). Max 8 members, max 4 parallel workers.
2. **Register tracking tasks**: `team_task_create` one per deliverable, then `team_send_message` each member: claim task (`team_task_update` → `in_progress`), execute, mark `completed`, report summary.
3. **Wait for completion** — `team_task_list` until every task is terminal. Members run in parallel; do NOT poll.
4. **Closure Contract (MANDATORY, same turn)**: once every task is `completed`/`failed`, shut down each active member (`team_shutdown_request` → `team_approve_shutdown`) and `team_delete`. If delete says "members still active", re-run `team_status` once, then retry.
5. **Fallback**: if `team_*` tools are unavailable, fall back to `task(category="unspecified-high", run_in_background=true)` with the same member prompts.
6. **Do NOT use teams for serial single-deliverable steps** (QUESTION-flow diagnostic task, roadmap update) — individual delegates are correct there.

## Phase 0: INTENT GATE — Parse Input

### 0.1 Parse Input

Extract skill, topic, and the user's question/request:
- "omnilearn-refine Rust ownership I'm confused about borrowing rules"
  → skill: `Rust`, topic: `ownership`, request: "confused about borrowing rules" (QUESTION)
- "omnilearn-refine Python decorators Can you add more depth?"
  → skill: `Python`, topic: `decorators`, request: "add more depth" (REFINE)
- "omnilearn-refine React hooks The explanation is too shallow"
  → skill: `React`, topic: `hooks`, request: "explanation too shallow" (REFINE)

If topic is ambiguous or missing, ask:
> "Which topic in {skill} would you like to look at? Available topics: {list}"

### 0.2 Determine Intent Type

Classify the request as either:
- **QUESTION** — user has a doubt, confusion, or needs explanation
- **REFINE** — user wants the topic roadmap improved, expanded, or restructured

**Rule of thumb:** If the user says "I'm confused", "I don't understand", "explain", "how does X work" → QUESTION. If they say "add more", "this is too shallow", "restructure", "improve" → REFINE.

### 0.3 Validate Existence

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
TOPIC_DIR="$SKILL_DIR/topics/<topic>"
TOPIC_ROADMAP="$TOPIC_DIR/topic-roadmap.md"
CURRENT_RUN="$SKILL_DIR/runs/$(date +%s)-refine-<topic>"
GLOBAL_PREFS="$OMNILEARN_DIR/UserPreferences.md"

if [ ! -d "$SKILL_DIR" ]; then
  echo "Skill '{skill}' not found. Create a roadmap first: /omnilearn-roadmap {skill}"
  exit 1
fi

if [ ! -d "$TOPIC_DIR" ] || [ ! -f "$TOPIC_ROADMAP" ]; then
  echo "Topic '{topic}' not found or doesn't have a topic roadmap yet."
  echo "Start learning it first: /omnilearn-start {skill} (then choose {topic})"
  exit 1
fi

mkdir -p "$CURRENT_RUN"
```

### 0.4 Read Existing Files

Read:
- `UserPreferences.md` (if exists) — user's learning style, experience
- `SkillPreferences.md` — per-skill context
- `topic-roadmap.md` — the current topic structure
- Any existing assignments for context on what the user has done

## Phase 1: QUESTION FLOW — User Has a Doubt

Use this flow when intent is **QUESTION**.

### 1.1 Generate a Diagnostic Task (Not Just an Explanation)

**Rule: The user learns by DOING. When they ask a question, give them a focused micro-exercise that isolates the confusing concept.** Understanding comes from solving, not reading.

```typescript
task(category="unspecified-high", run_in_background=false, prompt="
1. TASK: Create a focused micro-exercise that tests the user's understanding of '{concept}' in '{skill}'. The user is confused about: '{user_request}'.
2. EXPECTED OUTCOME: A self-contained micro-exercise (5-15 min) that isolates the specific concept and lets the user figure it out by coding/building.

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, context7_resolve-library-id, context7_query-docs, read, write

4. MUST DO:
   - Read the current topic-roadmap.md to understand what's been covered: {TOPIC_ROADMAP}
   - Read any existing assignments to understand context: {TOPIC_DIR}/assignments/ (list only, read specifics if needed)
   - Research the concept online to find the MOST COMMON confusion points
   - Design a micro-exercise that:
     * ISOLATES the confusing concept — removes unrelated complexity
     * Is a real-world-ish scenario (NOT 'write a function that...' — frame it as solving a concrete problem)
     * Can be solved in 5-15 minutes
     * Requires the user to WRITE CODE / BUILD SOMETHING / PRODUCE OUTPUT
     * Has a CLEAR RIGHT ANSWER that they can verify
   - Include in the exercise brief:
     * A short problem scenario (1-2 sentences, real-world framing)
     * What to build/do
     * Success criteria (how they know it's correct)
     * A hint ONLY if they get stuck (hidden section at bottom)
   - Save to: {CURRENT_RUN}/interaction-diagnostic-task.md
   - The file should contain: task description + any starter code + verification steps

5. MUST NOT DO:
   - Do NOT write a long explanation — the task IS the teaching tool
   - Do NOT give away the solution to any existing assignment
   - Do NOT make the exercise too complex — isolate ONE concept only
   - Do NOT skip the hands-on component — user must produce something

6. CONTEXT:
   - Skill: {skill}
   - Topic: {topic}
   - User's question: {user_request}
   - User experience level: {from preferences}
")
```

### 1.2 Present the Diagnostic Task

```markdown
┌──────────────────────────────────────────────────────────────────┐
│  🎯 Let's Figure This Out By Doing                               │
├──────────────────────────────────────────────────────────────────┤
│  Topic: {skill}/{topic}                                            │
│                                                                   │
│  The best way to understand this is to work through it.           │
│  Here's a focused exercise:                                       │
│                                                                   │
│  📝 {CURRENT_RUN}/interaction-diagnostic-task.md                  │
│                                                                   │
│  It should take 5-15 minutes. Try solving it, then we'll         │
│  discuss what clicked.                                            │
│                                                                   │
│  Questions while you work? I'm here.                              │
└──────────────────────────────────────────────────────────────────┘
```

### 1.3 Follow Up After the Task

When the user completes the micro-exercise:
1. Verify their solution (check output, run any verification code).
2. Discuss what they learned from solving it.
3. Connect it back to the original concept they were confused about.
4. If they're still confused, generate a SECOND diagnostic task with a different angle.
5. **Only resort to a direct explanation after 2 failed task attempts** — and even then, keep it minimal with a follow-up task.

### 1.4 Log the Interaction

Save a record of the interaction (question + task + outcome) to:
- `{CURRENT_RUN}/agent-log.md` — what happened, what was created, outcome
- Update `topic-progress.md` if the interaction revealed something about the user's learning (e.g., "struggled with X concept, resolved through Y practice task")

## Phase 2: REFINE FLOW — User Wants Topic Roadmap Improved

Use this flow when intent is **REFINE**.

### 2.1 Research the Current Topic + Requested Changes (research TEAM)

Run the two research angles as a **team** (see TEAM ORCHESTRATION above).

```typescript
team_create({ inline_spec: {
  name: "<skill>-<topic>-refine-research",
  members: [
    // MEMBER A: Analysis of the current topic roadmap + requested changes
    { name: "changes-analyst", category: "unspecified-high", prompt: `
1. TASK: Analyze the current '{topic}' topic roadmap and the user's refinement request for '{skill}'.
2. EXPECTED OUTCOME: A detailed analysis of what needs to change in the topic roadmap.

3. REQUIRED TOOLS: read, write, grep

4. MUST DO:
   - Read the full topic-roadmap.md: {TOPIC_ROADMAP}
   - Read the main skill roadmap for context: {SKILL_DIR}/roadmap.md
   - Read the skill preferences: {SKILL_DIR}/SkillPreferences.md
   - Analyze the user's request: '{user_request}'
   - Identify exactly what's needed:
     * Is the current depth insufficient? → what's missing
     * Is the structure wrong? → what order makes more sense
     * Are there missing subtopics? → what should be added
     * Are prerequisites not clear? → what's missing
   - Produce a detailed analysis saved to: {CURRENT_RUN}/refinement-plan.md
   - Format: For each change, specify: What, Why, Where in the structure

5. MUST NOT DO:
   - Do NOT make any actual changes to files — analysis only
   - Do NOT discard existing content — note what should be kept vs changed

6. CONTEXT:
   - Skill: {skill}
   - Topic: {topic}
   - User request: {user_request}
   - Claim your team task (team_task_update → in_progress, owner changes-analyst) when you start, mark it completed when the file is written, then report a 5-10 line summary to the lead via team_send_message.
`},
    // MEMBER B: Online research for refinement
    { name: "online-researcher", category: "unspecified-high", prompt: `
1. TASK: Research online to find better ways to structure and teach '{topic}' in '{skill}'.
2. EXPECTED OUTCOME: A research document with web-sourced findings about best practices for teaching/learning this topic.

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, context7_resolve-library-id, context7_query-docs, read, write

4. MUST DO:
   - Analyze the user's refinement request: '{user_request}'
   - Use web search extensively to find:
     * Alternative structures and progressions for this topic
     * Common curriculum approaches from reputable sources
     * Best practices for teaching this specific topic
     * Deeper coverage of subtopics the user mentioned
     * Real-world applications and project ideas
   - For tech topics, use context7 for official docs
   - For each finding, document: source, key insight, relevance to the refinement
   - Save to: {CURRENT_RUN}/research-findings.md

5. MUST NOT DO:
   - Do NOT make any changes to files — research only
   - Do NOT skip research even if you're familiar with the topic

6. CONTEXT:
   - Skill: {skill}
   - Topic: {topic}
   - User request: {user_request}
   - Claim your team task (team_task_update → in_progress, owner online-researcher) when you start, mark it completed when the file is written, then report a 5-10 line summary to the lead via team_send_message.
`}
  ]
}})
// Register tasks + dispatch both members (see TEAM ORCHESTRATION).
```

### 2.2 (part of team) — Online Research for Refinement

Covered by the `online-researcher` member above.

### 2.3 Collect Both Results

Wait for members to report and verify via `team_task_list` that both tasks are `completed`. Read the analysis and research files. Then apply the **Closure Contract** (shutdown + delete the team).

### 2.4 Spawn Topic Roadmap Update Subagent

**This step stays a single `task()` delegate (NOT a team)** — one serial deliverable, no parallelism. Same for the QUESTION-flow diagnostic task (Phase 1.1).

```typescript
task(category="unspecified-high", run_in_background=false, timeout=300000, prompt="
1. TASK: Update the '{topic}' topic-roadmap.md based on the refinement analysis and online research.
2. EXPECTED OUTCOME: An updated topic-roadmap.md that addresses the user's concerns.

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, read, write

4. MUST DO:
   - Read the refinement analysis: {CURRENT_RUN}/refinement-plan.md
   - Read the online research: {CURRENT_RUN}/research-findings.md
   - Read the current topic roadmap: {TOPIC_ROADMAP}
   - Read existing assignments to understand what exists: {TOPIC_DIR}/assignments/ (just list — read only what's needed)
   - Update the topic-roadmap.md at: {TOPIC_ROADMAP}
   - Preserve ALL existing structure that's still valid
   - Add/modify based on the research
   - Keep the same format as the original
   - Write to: {TOPIC_ROADMAP}

5. MUST NOT DO:
   - Do NOT delete or modify assignment files — only the topic-roadmap.md
   - Do NOT remove completed subtopics if they've been studied
   - Do NOT create new assignments (that's /omnilearn-start's job)
   - Do NOT change the overall structure format

6. CONTEXT:
   - Skill: {skill}
   - Topic: {topic}
   - User request: {user_request}
")
```

### 2.5 Verify the Updated Roadmap

Read the updated topic-roadmap.md and verify:
- All existing content worth keeping is preserved
- New content addresses the user's concerns
- Structure is clear and logical
- Prerequisites are documented
- Learning objectives are clear

If anything is wrong, spawn a fix via continuation.

## Phase 3: UPDATE PREFERENCES & LOG

### 3.1 Update UserPreferences.md

If the interaction reveals new user preferences:
- User struggles with certain types of concepts → note learning style insight
- User asks for specific depth/approach → update preferences
- User shows interest in specific applications → note career/focus interests

### 3.2 Update SkillPreferences.md

Record the refinement/question session in the skill preferences.

### 3.3 Write Agent Log

Write to `$CURRENT_RUN/agent-log.md`:
- Whether this was a QUESTION or REFINE session
- What the user asked
- What research was conducted
- What files were created or modified
- Key decisions made
- Any changes to user preferences

## Phase 4: PRESENT TO USER

### 4.1 For Question Flow

```markdown
┌──────────────────────────────────────────────────────────────────┐
│  ✅ Question Answered                                             │
├──────────────────────────────────────────────────────────────────┤
│  Topic: {skill}/{topic}                                            │
│                                                                   │
│  Full explanation saved to:                                       │
│  {CURRENT_RUN}/interaction-question.md                            │
│                                                                   │
│  Want more practice on this concept? I can create exercises.      │
│  Ready to get back to learning? Use /omnilearn-start {skill}      │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 For Refine Flow

```markdown
┌──────────────────────────────────────────────────────────────────┐
│  ✅ Topic Roadmap Refined                                         │
├──────────────────────────────────────────────────────────────────┤
│  {skill}/{topic} — topic roadmap updated                          │
│                                                                   │
│  Changes made:                                                    │
│  • {change 1}                                                     │
│  • {change 2}                                                     │
│  • {change 3}                                                     │
│                                                                   │
│  📍 Updated: {TOPIC_ROADMAP}                                      │
│                                                                   │
│  Previous version automatically archived in the run log.          │
│                                                                   │
│  Next: Use /omnilearn-start {skill} to continue learning.         │
│  Any feedback on these changes?                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Phase 5: GIT COMMIT

```bash
if git rev-parse --git-dir > /dev/null 2>&1; then
  git add "$LEARNING_DIR/"
  git commit -m "omnilearn: refine topic '{topic}' in {skill}

- {summary of what was done}
- Updated topic roadmap / provided explanations
"
fi
```

If no git repo: ask if user wants to initialize one (same pattern).

## Quality Gates

| Check | Phase | Action if Failed |
|-------|-------|-----------------|
| Skill folder exists | 0 | Tell user to create roadmap first |
| Topic folder + roadmap exists | 0 | Tell user to start learning first |
| Intent correctly classified (QUESTION vs REFINE) | 0 | Re-classify, ask user if unsure |
| Research team created with both members (REFINE) | 2 | Re-create team; fall back to background subagents only if team tools unavailable |
| Analysis + research members completed (files exist) (REFINE) | 2 | Re-dispatch members via team_send_message |
| All team tasks terminal + team deleted (Closure Contract) (REFINE) | 2 | Complete shutdown/delete before 2.4 |
| Research subagent completed (QUESTION) | 1 | Re-spawn with better instructions |
| Topic roadmap updated with proper structure (REFINE) | 2 | Fix via continuation |
| Existing assignments not modified (REFINE) | 2 | Revert if accidentally changed |
| Agent log written | 3 | Write it |
| Git commit attempted | 5 | Ask user if they want to skip |

## Error Recovery

| Situation | Action |
|-----------|--------|
| Topic not found | Suggest available topics from the skill roadmap |
| User's question is too vague | Ask clarifying questions before researching |
| Research team member fails | Re-run via `team_send_message` to that member (same team session) with more specific instructions |
| Team member's deliverable file missing | Re-dispatch same member; if team closed, re-create 1-member team or use a single task() delegate |
| Team tools unavailable | Fall back to `task(category="unspecified-high", run_in_background=true)` with same member prompts |
| Research yields poor results | Try alternative search queries, broaden scope |
| Refinement accidentally modifies assignments | Revert: `git checkout $SKILL_DIR/topics/$TOPIC/assignments/` |
| User wants to undo refinement | Archive current, restore from git or previous file in runs/ |
| User has multiple questions | Answer the most foundational one first, then the dependent ones |

## What You MUST Do

- ✅ **Classify intent first** — QUESTION or REFINE, they have different flows
- ✅ **Read existing topic-roadmap.md** before doing anything
- ✅ **Delegate REFINE-flow parallel research to a TEAM** — analysis + online research run as team members (see TEAM ORCHESTRATION)
- ✅ **Apply the Closure Contract** — shut down members and delete the team as soon as all REFINE research tasks are terminal
- ✅ **Research online** — don't rely on internal knowledge alone
- ✅ **Keep explanations practical** — examples, code, analogies
- ✅ **Preserve existing assignments** — never modify learning materials  
- ✅ **Log everything** — interaction files for questions, agent logs for sessions
- ✅ **Update preferences** when you learn something new about the user
- ✅ **Git commit after changes**

## What You MUST NOT Do

- ❌ Do NOT modify assignment files during refinement — only the topic-roadmap.md
- ❌ Do NOT skip web research — even for topics you're confident about
- ❌ Do NOT give away assignment solutions when answering questions
- ❌ Do NOT leave teams running after research completes — teams are ephemeral; close them (Closure Contract)
- ❌ Do NOT use a team for serial single-deliverable steps (diagnostic task, roadmap update) — individual `task()` delegates are correct there
- ❌ Do NOT proceed with ambiguous requests — ask clarifying questions first
- ❌ Do NOT push to remote without explicit user approval
