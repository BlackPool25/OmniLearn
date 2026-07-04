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
.omnilearn/<skill>/
├── roadmap.md
├── SkillPreferences.md
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
        ├── assignments/                     ← May be added to if needed
        └── runs/
```

## MANDATORY TOOLS

| Tool | When | Why |
|------|------|-----|
| `google_search` / `websearch_web_search_exa` | Research | Topic research, answer questions, validate changes |
| `context7_query_docs` | Tech topics | Official documentation for precise answers |
| `task(category="unspecified-high", background)` | Heavy work | Research, analysis, topic updates |
| `read`, `write`, `edit`, `bash`, `grep`, `glob` | All phases | File operations |

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
SKILL_DIR="$OMNILEARN_DIR/<skill>"
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

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, context7_resolve-library-id, context7_query_docs, read, write

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

### 2.1 Research the Current Topic + Requested Changes

```typescript
task(category="unspecified-high", run_in_background=true, prompt="
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
")
```

### 2.2 Online Research for Refinement

```typescript
task(category="unspecified-high", run_in_background=true, prompt="
1. TASK: Research online to find better ways to structure and teach '{topic}' in '{skill}'.
2. EXPECTED OUTCOME: A research document with web-sourced findings about best practices for teaching/learning this topic.

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, context7_resolve-library-id, context7_query_docs, read, write

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
")
```

### 2.3 Collect Both Results

Wait for both to complete. Read the analysis and research files.

### 2.4 Spawn Topic Roadmap Update Subagent

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
  git add "$OMNILEARN_DIR/"
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
| Research subagent completed (QUESTION) | 1 | Re-spawn with better instructions |
| Analysis + research subagents completed (REFINE) | 2 | Re-spawn |
| Topic roadmap updated with proper structure (REFINE) | 2 | Fix via continuation |
| Existing assignments not modified (REFINE) | 2 | Revert if accidentally changed |
| Agent log written | 3 | Write it |
| Git commit attempted | 5 | Ask user if they want to skip |

## Error Recovery

| Situation | Action |
|-----------|--------|
| Topic not found | Suggest available topics from the skill roadmap |
| User's question is too vague | Ask clarifying questions before researching |
| Research yields poor results | Try alternative search queries, broaden scope |
| Refinement accidentally modifies assignments | Revert: `git checkout .omnilearn/{skill}/topics/{topic}/assignments/` |
| User wants to undo refinement | Archive current, restore from git or previous file in runs/ |
| User has multiple questions | Answer the most foundational one first, then the dependent ones |

## What You MUST Do

- ✅ **Classify intent first** — QUESTION or REFINE, they have different flows
- ✅ **Read existing topic-roadmap.md** before doing anything
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
- ❌ Do NOT proceed with ambiguous requests — ask clarifying questions first
- ❌ Do NOT push to remote without explicit user approval
