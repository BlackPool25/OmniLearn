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
        │   │   ├── critic-review.md        ← Quality review by oracle agent (auto-generated after creation)
        │   │   ├── subtopic-progress.md    ← Progress for this single subtopic
        │   │   ├── assignments/
        │   │   │   ├── 01-<concept>/
        │   │   │   │   ├── question.md     ← Real-world scenario assignment brief
        │   │   │   │   ├── critic-review.md← Quality review (auto-generated after creation)
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

## Subagent Delegation Rule: Delegate → Continue → Wait → Act (ALL Subagents)

This rule applies to EVERY subagent delegation — research, critic review, content creation, anything:

1. **Delegate in background**: Always use `run_in_background=true` unless the task takes <5 seconds and the main agent has literally nothing else to do
2. **Continue non-overlapping work**: While subagents run, the main agent does work that doesn't depend on their results (reading files, planning next steps, updating progress, preparing context)
3. **Wait before acting**: Do NOT make any changes that depend on a subagent's results until ALL relevant subagents have reported. Collect via `background_output(task_id="bg_...")` after the system's `<system-reminder>` notification
4. **Only then act**: With all results collected, make decisions and implement changes

This maximizes parallelism without sacrificing quality. The main agent is the orchestrator — it keeps working while subagents research, then synthesizes when they're done.

## TEAM ORCHESTRATION (use for ALL parallel research batches)

**When a research batch has 2+ independent research angles, run them as a TEAM, not as individual `task()` calls.** The main agent still creates ALL content directly — team members are research workers that return raw findings and never write content files.

1. **Create the team** with an inline spec (teams are ephemeral):
   ```json
   {"name": "<skill>-<topic>-research", "members": [
     {"name": "research-1", "category": "unspecified-high", "prompt": "<full self-contained research prompt — return raw findings to the lead via team_send_message, NO files, NO content creation>"},
     {"name": "research-2", "category": "unspecified-high", "prompt": "..."},
     {"name": "research-3", "category": "unspecified-high", "prompt": "..."}
   ]}
   ```
   Member prompts MUST be fully self-contained (read context → research → report via `team_send_message`). Max 8 members, max 4 parallel workers.
2. **Register tracking tasks**: `team_task_create` one task per research angle, then `team_send_message` to each member: claim task (`team_task_update` → `in_progress`), research, report findings via `team_send_message`, mark `completed`.
3. **Wait for completion** — `team_task_list` until every task is terminal. While members run, the main agent continues non-overlapping work (reading context files, planning subtopic structure).
4. **Closure Contract (MANDATORY, same turn as completion)**: once every task is `completed`/`failed`, shut down each active member (`team_shutdown_request` → `team_approve_shutdown`) and `team_delete`. If delete says "members still active", re-run `team_status` once, then retry.
5. **Fallback**: if `team_*` tools are unavailable, fall back to `task(subagent_type="librarian", run_in_background=true)` with the same research prompts.
6. **Do NOT team-ify**: single research tasks (one angle), the diagnostic-task flow, and solution reviews — no parallelism there.

## CRITICAL: Critic Review Stays as Individual `oracle` Delegates

**The Critic Review process (below) MUST keep using `task(subagent_type="oracle", run_in_background=true)` — it is NOT converted to teams.** `oracle` is not an eligible team-member type (team members are category-routed `sisyphus-junior` workers or `sisyphus`/`atlas`/`hephaestus`). The critics are independent evaluators of already-created files; the existing background-delegate pattern already runs them in parallel and is the correct tool.

## The Critic Review Process (MANDATORY AFTER EVERY CONTENT CREATION)

**After every topic-roadmap, subtopic-explanation, or assignment creation**, you MUST run a critic review before presenting the result to the user or proceeding to the next step. This is NOT optional — it is the quality gate that prevents low-effort, inaccurate, or pedagogically weak content from reaching the user.

### How the Critic Works

```
Content Created → Spawn Critic(s) in background → Continue independent work → ALL critics done → Fix Issues → Present
```

**The critic runs in the background (`run_in_background=true`) but the main agent MUST wait for all results before making ANY changes.** Workflow:

1. Spawn all critic subagents with `run_in_background=true` — they search and evaluate independently
2. While critics run, the main agent may continue **non-overlapping work** (e.g., updating progress files, preparing the next step's context)
3. **CRITICAL: Do NOT make any changes to the content under review until ALL critics have returned their results.** Collect outputs via `background_output(task_id="bg_...")` after receiving the completion notification
4. Once all critics are done, read the `critic-review.md` files and fix issues

The critic is an `oracle` subagent that:
1. Reads the newly created content
2. Searches the web (google_search, websearch) for current best practices, common pitfalls, and real-world standards
3. Evaluates the content against: accuracy, pedagogical quality, production relevance, and skill-specific conventions
4. Produces a structured `critic-review.md` in the content's directory
5. The MAIN AGENT then fixes all issues the critic identified

### The Critic Subagent Template (Use This Every Time)

Insert this IMMEDIATELY after ANY content creation subagent completes (topic roadmap, subtopic explanation, assignment, etc.):

```typescript
// Background — run in parallel with other work, but main agent MUST wait for result before making any changes
task(subagent_type="oracle", run_in_background=true, timeout=120000, prompt="
CRITIC REVIEW: Review the recently created content for '{content_type}' in skill '{skill}', topic '{topic}'.

**CURRENT DATE: {CURRENT_DATE}** — Use ONLY current information. Flag anything that references deprecated libraries, outdated patterns, or superseded best practices.

1. Read these files to understand the content:
   - {CONTENT_DIR}/  [the directory containing the created content]

2. Conduct web research using google_search / websearch for EACH of these angles:
   - Current industry best practices for THIS specific concept
   - Common misconceptions and mistakes that beginners make
   - Whether the examples/patterns used are up-to-date and idiomatic
   - If the difficulty calibration matches real-world expectations
   - Search for 3-5 different sources to triangulate quality signals

3. Evaluate the content against these criteria (be specific with evidence):
   a) ACCURACY: Is every technical statement correct? Are there errors, oversimplifications, or misleading claims?
   b) PEDAGOGY: Does the explanation follow the one-concept-per-subtopic rule? Are the layers progressive? Is the ZPD appropriate?
   c) PRODUCTION RELEVANCE: Does the assignment/test/scaffold reflect real-world practice? Or is it academic/artificial?
   d) CONVENTIONS: Does the code/scaffold follow the skill's SkillConventions.md? (e.g. src/ layout, uv for Python, proper naming)
   e) COMPLETENESS: Are all required sections present? (question.md, test, scaffold, solution-guide, etc.)
   f) PREREQUISITES: Does the content assume knowledge the user hasn't learned yet?

4. For each issue found:
   - State the EXACT file and line/area
   - Explain WHY it's a problem (with web source if applicable)
   - Give a CONCRETE suggestion for how to fix it
   - Rate severity: BLOCKER / MAJOR / MINOR / INFO

5. If the content is a subtopic-explanation.md, also evaluate:
   - Is it ONE concept or multiple? (MUST be one)
   - Is the 'One Level Down' rule followed?
   - Are misconceptions proactively addressed?

6. If the content is an assignment/test, also evaluate:
   - Can the assignment be solved with the concepts taught so far?
   - Are the test scripts syntactically valid and runnable?
   - Do the tests test the right things? (the subtopic's learning objectives)
   - Is the scaffold genuinely useful (provides structure, not the solution)?

7. Save your review to: {CONTENT_DIR}/critic-review.md
   Format:
   # Critic Review: {content_type}
   
   ## Summary
   - Overall verdict: ✅ Pass / ⚠️ Pass with issues / ❌ Needs fixes
   - Blocker count: {n} | Major: {n} | Minor: {n} | Info: {n}
   
   ## Issues Found
   ### {severity}: {short description}
   - **Location**: {file}:{line/area}
   - **Problem**: {detailed explanation}
   - **Evidence**: {web research finding}
   - **Suggestion**: {concrete fix}
   
   ## What's Good
   - {aspect that works well}
   
   ## Research Notes
   - {key finding from web research}

8. DO NOT:
   - Do NOT rubber-stamp content as good without checking it
   - Do NOT ignore minor issues — accumulation of minor issues is a quality problem
   - Do NOT make assumptions about current best practices — always verify with web search
   - Do NOT skip the web research phase

9. CONTEXT:
   - Skill: {skill} 
   - Topic: {topic}
   - Content type: {content_type} (e.g. 'topic-roadmap', 'subtopic-1-explanation', 'assignment-01')
   - Content directory: {CONTENT_DIR}/
   - User skill level: {from preferences}
")
```

### Collecting Results Before Making Changes

1. **Wait for ALL critics to finish** before making any changes to content under review. The system sends `<system-reminder>` when background tasks complete.
2. Collect each critic's output via `background_output(task_id="bg_...")`.
3. Only after ALL critics have reported, proceed to fixing.

After collecting all critic results:
1. Read each `{CONTENT_DIR}/critic-review.md` file.
2. For every BLOCKER and MAJOR issue: fix the content immediately.
3. For MINOR issues: fix unless the fix would cause more harm than good.
4. For INFO items: consider implementing if they clearly improve quality.
5. If the verdict is ❌ Needs fixes: after fixing, run the critic again on the fixed content.
6. Only after all BLOCKERS and MAJORs are resolved, proceed.

If the critic returns a verdict of ✅ Pass or ⚠️ Pass with issues where all BLOCKER/MAJOR issues are fixed, the MAIN AGENT saves the critic-review.md alongside the content and proceeds.

## MANDATORY TOOLS

| Tool | When | Why |
|------|------|-----|
| `team_create({ inline_spec })` | Parallel research batches (2+ research angles) | Run independent research angles as team members instead of individual background subagents |
| `team_task_create` / `team_task_update` / `team_task_list` | Research batches | Track each research angle's completion |
| `team_send_message` | Research batches | Dispatch members; receive raw research findings |
| `team_shutdown_request` / `team_approve_shutdown` / `team_delete` | After research batches | **Closure Contract** — close the team once all research tasks are terminal |
| `task(subagent_type="librarian", background)` | **Single-angle research only / fallback** | RESEARCH ONLY — topic research, concept research, real-world patterns. NEVER for content creation. |
| `task(subagent_type="explore", background)` | **RESEARCH ONLY** — reading context files, summarizing existing content | Background file analysis. NEVER for content creation. |
| `task(subagent_type="oracle")` | **Critic review ONLY after EVERY content creation** (NOT team-eligible — always individual delegates) | Quality assurance — evaluates accuracy, pedagogy, production relevance. Does NOT create. |
| `websearch_web_search_exa` | Research (within team members / librarian) | Primary web search tool |
| `context7_resolve-library-id` + `context7_query-docs` | Tech skill research (within team members / librarian) | Official documentation lookup |
| `question` tool | User interaction | Present topic choices, ask for preferences, calibrate difficulty |
| `read`, `write`, `edit`, `bash`, `grep`, `glob` | **EVERY phase — MAIN AGENT creates content with these** | The main agent writes ALL content directly using these tools. Team members and subagents NEVER write content files. |
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

### 1.4 Create Topic Roadmap (Main Agent Creates — Subagents Research ONLY)

If the chosen topic doesn't have a `topic-roadmap.md`, the MAIN AGENT creates everything directly. Subagents are used ONLY for systematic research. This preserves the user's intent without summarization loss.

**Architecture: Research → Synthesize → Create**

```
                            ┌─ Research Agent 1: Prerequisites, dependencies, key concepts
                            ├─ Research Agent 2: Common mistakes, real-world patterns
                            ├─ Research Agent 3: Official docs, API reference, best practices
                            │
Main Agent (YOU) ───────────┤ Read roadmap, preferences, conventions, cross-skill inventory
                            │   (while research runs in background)
                            ├─ COLLECT all research results
                            │
                            ├─ CREATE topic-overview.md        (directly — writes files)
                            ├─ CREATE topic-roadmap.md         (directly — writes files)
                            ├─ CREATE subtopic-explanation.md  (directly — writes files)
                            ├─ CREATE assignment + scaffold    (directly — writes files)
                            ├─ CREATE progress files           (directly — writes files)
                            └─ → Run critic review (oracle subagent for evaluation only)
```

**The user's question/intent reaches the content creator (YOU) unfiltered.** No subagent intermediary stands between the user's words and the final explanation. Subagents only gather raw materials.

#### Step 1: Fire Research Team in Background (Parallel)

Run the 2-4 research angles as a **TEAM** (see TEAM ORCHESTRATION above). Each member is a category-routed worker focused on a DIFFERENT research angle with systematic rigor; each returns raw findings to the lead via `team_send_message` — the MAIN AGENT then creates all content directly.

```typescript
team_create({ inline_spec: {
  name: "<skill>-<topic>-research",
  members: [
    // RESEARCH MEMBER 1: Core concepts, prerequisites, subtopic dependencies
    { name: "concept-researcher", category: "unspecified-high", prompt: `
1. TASK: Systematic research on prerequisites, key concepts, and subtopic structure for '{topic}' in '{skill}'.
2. EXPECTED OUTCOME: A structured research report covering core concepts, prerequisite chains, subtopic dependency map, and industry-standard tools. The MAIN AGENT will use this report to create the learning materials directly.

3. REQUIRED TOOLS: websearch_web_search_exa, context7_resolve-library-id, context7_query-docs

4. MUST DO — Systematic Research (PRISMA-inspired):
   - **CURRENT DATE: {CURRENT_DATE}** — ONLY current information. Flag any deprecated resources.
   - Conduct 5-10 distinct web searches using well-formed queries (describe the ideal page, not keywords).
   - For each search result, evaluate source quality using this hierarchy:
     Level 1 — Official documentation / maintained standard (highest)
     Level 2 — Peer-reviewed / industry-recognized authority
     Level 3 — Expert practitioner guide / established tutorial
     Level 4 — Blog post / community content
     Level 5 — Opinion / anecdotal (lowest, use cautiously)
   - Search for each of these angles:
     a) What EXACT prerequisites does a learner need before starting this topic?
     b) What are the CORE sub-skills within this topic? List every distinct concept.
     c) How do those sub-skills depend on each other? Which are prerequisites for others?
     d) What are the MUST-KNOW tools, frameworks, or standards as of {CURRENT_YEAR}?
     e) What industry-standard versions and practices are current?
   - For tech topics: use context7 to get official documentation references.
   - Snowball: when you find a high-quality source, check what it references.

5. REPORT STRUCTURE — Return your findings to the lead via team_send_message in this format:
   ## Prerequisites
   - [prerequisite 1] — why it's needed
   - [prerequisite 2] — why it's needed
   
   ## Core Concepts (ordered by dependency)
   1. [concept name]
      - What it is (1 sentence)
      - Why it matters (1 sentence)
      - Real-world example
      - Common prerequisite for: [concept X, concept Y]
      - Evidence: [source URL] (Level X)
   
   2. ...
   
   ## Industry Standards
   - Tool/Practice: [name] — current version: [X] — evidence: [source]
   
   ## Key Sources
   - [link] — Level X — [brief note on what it covers]

6. DO NOT:
   - Do NOT write explanations or assignments — that is the MAIN AGENT's job
   - Do NOT create any files — return findings as text only
   - Do NOT skip source quality ratings
   - Do NOT stop at 1-2 searches — be thorough (5-10 queries minimum)
   - Do NOT assume you know the topic — verify everything with searches

7. CONTEXT:
   - Skill: {skill}
   - Topic: {topic}
   - Claim your team task (team_task_update → in_progress, owner concept-researcher) when you start, then report findings via team_send_message and mark the task completed.
`},
    // RESEARCH MEMBER 2: Common mistakes, real-world patterns, production context
    { name: "mistakes-researcher", category: "unspecified-high", prompt: `
1. TASK: Systematic research on common mistakes, real-world patterns, misconceptions, and production context for '{topic}' in '{skill}'.
2. EXPECTED OUTCOME: A structured research report covering what beginners get wrong, real-world usage patterns, production best practices, and edge cases. The MAIN AGENT will embed these insights into the explanation and assignments.

3. REQUIRED TOOLS: websearch_web_search_exa, context7_query-docs

4. MUST DO — Systematic Research:
   - **CURRENT DATE: {CURRENT_DATE}** — ONLY current information.
   - Conduct 5-10 distinct web searches covering:
     a) What are the MOST COMMON mistakes beginners make with this topic?
     b) What misconceptions do learners typically have?
     c) What does production-quality code look like for this topic? (search GitHub repos, real projects)
     d) What edge cases and failure modes exist?
     e) What trade-offs do experienced practitioners consider?
     f) What separates beginner from professional understanding?
     g) Search for real-world examples, job requirements, and production codebases (GitHub)
   - For each finding, rate the source quality (same Level 1-5 hierarchy).
   - Snowball from high-quality sources.
   - Collect at least 3-5 distinct sources for the most important points.

5. REPORT STRUCTURE — Return findings to the lead via team_send_message:
   ## Common Beginner Mistakes
   1. [mistake] — why it happens — how to avoid — evidence: [source] (Level X)
   
   ## Misconceptions
   1. [misconception] — what's actually true — evidence: [source] (Level X)
   
   ## Production Patterns
   - [pattern] — when to use it — trade-offs — evidence: [source] (Level X)
   
   ## Edge Cases & Failure Modes
   - [scenario] — what goes wrong — how to handle — evidence: [source] (Level X)
   
   ## Expert vs Beginner Differences
   - [difference] — evidence: [source] (Level X)
   
   ## Key Sources
   - [link] — Level X — [what it covers]

6. DO NOT:
   - Do NOT write explanations or assignments — that is the MAIN AGENT's job
   - Do NOT create any files — return findings as text only
   - Do NOT skip searching for contrasting/contradicting perspectives
   - Do NOT rely on a single source — triangulate from at least 3 sources per major finding

7. CONTEXT:
   - Skill: {skill}
   - Topic: {topic}
   - Claim your team task (team_task_update → in_progress, owner mistakes-researcher) when you start, then report findings via team_send_message and mark the task completed.
`},
    // RESEARCH MEMBER 3 (if tech topic): Official documentation and API reference
    // Only add this member if it's a technical skill where official docs are relevant.
    { name: "docs-researcher", category: "unspecified-high", prompt: `
1. TASK: Research official documentation for '{topic}' in '{skill}'.
2. EXPECTED OUTCOME: Specific API references, syntax examples, configuration patterns from official docs. The MAIN AGENT will use these for accurate examples and test scripts.

3. REQUIRED TOOLS: context7_resolve-library-id, context7_query-docs, websearch_web_search_exa

4. MUST DO:
   - **CURRENT DATE: {CURRENT_DATE}** — ONLY current documentation versions.
   - Resolve the library/package name to a Context7 library ID.
   - Query official docs for:
     a) Core API syntax and signatures
     b) Configuration patterns
     c) Common usage examples
     d) Version-specific changes relevant to {CURRENT_YEAR}
   - Supplement with web search for official documentation pages.
   - Note exact version numbers and any deprecation warnings.

5. REPORT STRUCTURE — Return findings to the lead via team_send_message:
   ## API Reference
   - [function/API] — signature — example usage — docs: [link]
   
   ## Configuration Patterns
   - [pattern] — config structure — docs: [link]
   
   ## Version Notes
   - Current stable: [version] — key changes: [list]
   
   ## Deprecation Warnings
   - [what's deprecated] — replacement — docs: [link]

6. DO NOT:
   - Do NOT write explanations or assignments
   - Do NOT create any files
   - Do NOT guess API syntax — always verify against actual docs

7. CONTEXT:
   - Skill: {skill}
   - Topic: {topic}
   - Claim your team task (team_task_update → in_progress, owner docs-researcher) when you start, then report findings via team_send_message and mark the task completed.
`}
  ]
}})
```

#### Step 1b: Register tasks and dispatch

```typescript
team_task_create(teamRunId, subject: "Research: core concepts & prerequisites", description: "Findings → lead via team_send_message")
team_task_create(teamRunId, subject: "Research: common mistakes & production context", description: "Findings → lead via team_send_message")
team_task_create(teamRunId, subject: "Research: official docs & API reference (tech topics only)", description: "Findings → lead via team_send_message")
team_send_message(teamRunId, to: "concept-researcher", body: "Task #1 registered — claim via team_task_update (in_progress), research, report findings via team_send_message, mark completed.")
team_send_message(teamRunId, to: "mistakes-researcher", body: "Task #2 registered — claim via team_task_update (in_progress), research, report findings via team_send_message, mark completed.")
team_send_message(teamRunId, to: "docs-researcher", body: "Task #3 registered — claim via team_task_update (in_progress), research, report findings via team_send_message, mark completed.")
```

#### Step 2: While Research Runs — Read Context Files

Do NOT wait idly. Read these files while subagents research:

- `{ROADMAP}` — main skill roadmap
- `{GLOBAL_PREFS}` (if exists), `{SKILL_PREFS}` (if exists) — user preferences
- `{SKILL_DIR}/SkillConventions.md` (if exists) — project conventions
- Cross-skill inventory (scan learning directory for related skills)

Plan the subtopic structure in your head. You'll write it after research comes back.

#### Step 3: Collect Research Results

Wait for the team members to report their findings via `team_send_message`, and verify with `team_task_list` that ALL research tasks are `completed`. Then apply the **Closure Contract** (shutdown each member → `team_delete`) before creating content.

**Do NOT proceed without ALL research results.** If results are thin, re-dispatch the relevant member via `team_send_message` for deeper coverage (same team session), or if the team is closed, fall back to a single `librarian` delegate.

#### Step 4: Main Agent Creates ALL Content Directly

Using the research results, YOU (the main agent) create every file. Write files directly using the `write` tool. All pedagogical rules from the original design still apply — they are YOUR rules to follow while creating.

**Use this structure for each file you create:**

##### 4a) Create topic-overview.md
Write to `{TOPICS_DIR}/{topic}/topic-overview.md` — the BIG PICTURE (5 min read). Structure:

```markdown
# {topic}

⏱️ Estimated reading time: 5 minutes

## Why This Topic Matters
[2-3 paragraphs hooking the reader with a concrete problem they've felt]

## What You'll Learn
- [subtopic 1] — [what they'll be able to do after]
- [subtopic 2] — [what they'll be able to do after]
- ...

## How These Subtopics Fit Together
[Dependency diagram in text form:
01. Subtopic A ──┐
                 ├── 03. Subtopic C ──┐
02. Subtopic B ──┘                    │
                                      └── 04. Subtopic D
]

## Prerequisites
[Brief checklist — details in each subtopic]
```

Draw from **Research Agent 1** (core concepts, dependencies) for this file.

##### 4b) Create topic-roadmap.md
Write to `{TOPICS_DIR}/{topic}/topic-roadmap.md` — the INDEX. Structure:

```markdown
# {topic} — Learning Path

## Prerequisites
[from research]

## Learning Objectives
[what user will be able to do]

## Subtopic Dependency Map
[arrow notation: 01 → 02 → 03, or 01 → 02, 01 → 03 (parallel)]

## Subtopics (ordered by dependency)
### 1. [subtopic name]
- [1 sentence what it covers]
- [1 sentence why it matters in real world]
- Estimated time: [X] min
- Link: subtopics/01-{name}/subtopic-explanation.md

### 2. ...

## Cross-Subtopic Integration
[How subtopics combine into real-world scenarios]
```

Draw from **Research Agent 1** for dependencies and structure.

##### 4c) Create the FIRST SUBTOPIC

Create directory: `{TOPICS_DIR}/{topic}/subtopics/01-{subtopic-name}/`

**subtopic-explanation.md** — This is the THEORETICAL FOUNDATION for ONE specific subtopic. Follow these rules:

- **ONE concept per document** — If you find yourself explaining multiple distinct concepts, split them.
- **One-Level-Down Rule** — Start one level simpler than you think. You can always go deeper.
- **Unpack → Complexity → Repack** — Deconstruct, progressively add real-world constraints, then reconstruct.
- **Assume Nothing** — Make ALL prerequisites explicit.
- **One New Idea at a Time** — Never introduce multiple new concepts in the same paragraph.
- **Concrete Before Abstract** — Show working example FIRST, then explain why it works.
- **Address Misconceptions Proactively** — Anticipate the 2-3 most common confusions.
- **Depth over breadth** — 200-400 lines. If shorter, you're skipping depth.

Use this format:

```markdown
# [subtopic name]

⏱️ Estimated reading time: [X]-[Y] minutes

## Why This Matters
[Scoped to THIS subtopic. User just read the overview — now going deeper.]

## Prerequisites
[Only what's needed for THIS subtopic.]

## Layer 1: The Core Idea (One Level Down)
[Simplest correct explanation for THIS ONE concept. 1-2 paragraphs.]

## Layer 2: How It Actually Works
[Commands, examples, code. Annotated code blocks with WHY comments.
100-250 lines of focused content. Draw from Research Agent 3 for accurate syntax.]

## Layer 3: Real-World Production Context
[Draw from Research Agent 2:]
- **Common Misconceptions** (2-3, specific to THIS concept)
- **Edge Cases & Failure Modes**
- **Trade-offs**
- **Production Patterns**

## Learning Checkpoints
[3-5 questions testing ONLY this subtopic's concepts.]

## Ready to Practice?
→ Assignment: [link to assignment directory]
```

**Draw from ALL research agents:**
- Agent 1 for core concept accuracy and structure
- Agent 2 for misconceptions, edge cases, and real-world context
- Agent 3 for accurate code examples, syntax, and API usage

**Assignment 1** — Create directory: `{TOPICS_DIR}/{topic}/subtopics/01-{subtopic-name}/assignments/01-{concept}/`

Create these files with the `write` tool:

a) **question.md** — Assignment brief:
   - Clear learning objective matching THIS subtopic's concepts
   - Real-world problem description
   - Numbered requirements/specifications
   - Hints section
   - Expected output/behavior
   - References to subtopic-explanation.md sections

b) **test.{ext}** — Automated test script:
   - Validates ONLY this subtopic's learning objectives
   - Edge case tests with clear error messages
   - Runnable without modification
   - Use SkillConventions.md for test framework and command

c) **scaffold/** — Starter code:
   - Follow SkillConventions.md (src/ layout, uv sync, proper naming)
   - Provide structure + imports, user writes the actual logic
   - TODO markers with `pass` statements, not pre-filled solutions
   - Name project from skill name (not "app")

d) **solution-guide.md** — Reference implementation with explanation:
   - Draw from Research Agent 2 for best practices
   - Reference subtopic-explanation.md sections

e) **subtopic-progress.md** — Per-subtopic tracker:

```markdown
# Progress: [subtopic name]

## Status
- Overall: 🔵 In Progress
- Started: {date}

## Assignments
1. **01-{concept}** — 🟢 Not Started

## Learning Sessions
| Date | Activity | Run Log |

## Skills Demonstrated
```

##### 4d) Create topic-progress.md
Write to `{TOPICS_DIR}/{topic}/topic-progress.md`:

```markdown
# Progress: {topic}

## Status
- Overall: 🔵 In Progress
- Started: {date}
- Last activity: {date}
- Subtopics: 1/{total} started

## Subtopic Progress
| # | Subtopic | Status | Assignments | Link |
|---|----------|--------|-------------|------|
| 1 | **01-{name}** | 🔵 In Progress | 0/1 completed | subtopics/01-{name}/subtopic-progress.md |
| 2 | **02-{name}** | 🟢 Not Started | — | — |
| ... | ... | ... | ... | ... |

## Learning Sessions
| Date | Activity | Run Log |
```

##### 4e) Update progress-index.md
At the skill level, add a pointer to this new topic.

#### Step 5: Verify Everything Exists

After creating all files, verify:
- [ ] `topic-overview.md` exists — big picture orientation (5 min read)
- [ ] `topic-roadmap.md` exists — index with subtopic list
- [ ] `subtopics/01-{name}/subtopic-explanation.md` exists with all layers
- [ ] `subtopics/01-{name}/assignments/01-{concept}/` exists with question.md, test, scaffold, solution-guide.md
- [ ] `subtopics/01-{name}/subtopic-progress.md` exists
- [ ] `topic-progress.md` tracks at subtopic level
- [ ] Test script is syntactically valid
- [ ] Scaffold follows SkillConventions.md conventions

If anything is missing, fix it immediately. Do NOT proceed to critic review with missing files.

#### Step 6: CRITIC REVIEW — MANDATORY

After verification passes, run the Critic Review process (defined above) on each piece of content. The critic is an `oracle` subagent — it EVALUATES only, it does NOT create content. This is safe because:
- The critic reads already-created files
- The critic's job is to identify errors and suggest fixes
- The MAIN AGENT makes the actual fixes (preserving intent)

Run critics on:
- `{TOPICS_DIR}/{topic}/topic-roadmap.md` — content_type="topic-roadmap"
- `{TOPICS_DIR}/{topic}/topic-overview.md` — content_type="topic-overview"
- `{TOPICS_DIR}/{topic}/subtopics/01-{name}/subtopic-explanation.md` — content_type="subtopic-1-explanation"
- `{TOPICS_DIR}/{topic}/subtopics/01-{name}/assignments/01-{concept}/` — content_type="assignment-01"

Fire each critic with `run_in_background=true` (they're independent). While they run, do non-overlapping prep work. Collect all results, then fix all BLOCKER and MAJOR issues before proceeding to Phase 1.5.

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

1. **Fire a research subagent** (background) to research the specific concept the user is asking about. This is the ONLY delegated part — raw research, no content creation:

```typescript
task(subagent_type="librarian", run_in_background=true, timeout=120000, prompt="
1. TASK: Research the concept '{concept}' in '{skill}' to find common confusion points, typical mistakes, and the most effective ways to understand it.
2. EXPECTED OUTCOME: Raw research findings only — specific confusion patterns, real-world examples, common pitfalls. The MAIN AGENT will use this to create a diagnostic micro-exercise.

3. REQUIRED TOOLS: websearch_web_search_exa, context7_query-docs

4. MUST DO — Systematic Research:
   - **CURRENT DATE: {CURRENT_DATE}** — ONLY current information.
   - Conduct 3-5 searches specifically about:
     * What do beginners find MOST confusing about this concept?
     * What are the most common errors / misconceptions?
     * What analogies or teaching approaches are most effective?
     * What real-world scenarios naturally require this concept?
     * What prerequisite knowledge is often missing?
   - Rate source quality (Level 1-5).
   - Return raw findings as text — NO files, NO formatted explanations.

5. REPORT STRUCTURE:
   ## Confusion Points
   - [specific confusion] — why it happens — frequency (common/rare)
   
   ## Common Mistakes
   - [mistake] — what the correct approach is
   
   ## Effective Teaching Approaches
   - [approach] — what makes it work
   
   ## Real-World Scenarios
   - [scenario] — how it uses the concept
   
   ## Missing Prerequisites
   - [knowledge gap] — how it blocks understanding

6. DO NOT:
   - Do NOT create any files
   - Do NOT write exercises, explanations, or assignments
   - Do NOT summarize — return specific, actionable findings

7. CONTEXT:
   - Skill: {skill}
   - Topic: {topic}
   - Concept: {concept}
   - User's exact confusion: '{their exact question}'
")
```

2. **While research runs**, read the current assignment: `{ASSIGNMENT_DIR}/question.md` to understand context.

3. **Collect research results** after system notification.

4. **MAIN AGENT creates the diagnostic micro-exercise directly** — YOU (the main agent) write the file. The user's exact words and confusion are preserved because you heard them firsthand:

   Write to `{CURRENT_RUN}/interaction-{n}-diagnostic-task.md`:
   
   - **ZPD calibration**: The user is struggling. The micro-exercise must be EASIER than the main assignment. ~90% familiar / 10% new.
   - **Design rules**:
     * ISOLATE the confusing concept — remove unrelated complexity
     * Real-world-ish scenario (NOT 'write a function that...' — frame as solving a problem)
     * Can be solved in 5-15 minutes
     * Requires writing code / producing something
     * Has a CLEAR RIGHT ANSWER that can be verified
     * INCLUDES built-in scaffolding: starter code, inline hints, or step guidance
   - **Do NOT write a long explanation** — the exercise IS the teaching tool
   - **Do NOT give away the main assignment solution**
   - Include: short scenario (1-2 sentences), what to build, success criteria, hidden hint section, starter code, verification steps
   - Draw from research results for the most effective confusion-targeting approach

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

1. **Research subagent** (background) — find what bridges this gap:
```typescript
task(subagent_type="librarian", run_in_background=true, timeout=120000, prompt="
1. TASK: Research supplementary practice angles for '{concept}' in '{skill}' — what exercises bridge the gap for struggling learners?
2. EXPECTED OUTCOME: Raw research on alternative approaches, simpler entry points, and effective practice patterns for this specific concept.

3. REQUIRED TOOLS: websearch_web_search_exa

4. MUST DO:
   - **CURRENT DATE: {CURRENT_DATE}**
   - Search for: what simpler/alternative approaches exist for teaching this concept?
   - What are effective practice patterns that build confidence?
   - What are exercises that break this concept into smaller pieces?
   - Return ONLY raw findings — no exercises, no explanations, no files.

5. DO NOT create any files or exercises.
")
```

2. **MAIN AGENT creates 2-3 practice exercises directly** — write to `{CURRENT_RUN}/interaction-{n}-practice-exercises.md`:
   - **ZPD calibration**: These must be EASIER than the main assignment — bridging, not harder
   - Read the current assignment to understand context
   - Target ONLY the specific sub-concept the user is struggling with
   - Each exercise: 5-15 min, brief description, expected output, hints, partial starter code
   - Do NOT repeat the same problems from the main assignment
   - Draw from research for alternative teaching angles

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

The MAIN AGENT creates the assignment directly. Research runs as a small team (or a single delegate if only one angle applies).

```typescript
team_create({ inline_spec: {
  name: "<skill>-<subtopic>-assignment-research",
  members: [
    // RESEARCH ONLY — finds real-world applications for this subtopic
    { name: "scenario-researcher", category: "unspecified-high", prompt: `
1. TASK: Research real-world applications and practice scenarios for subtopic '{subtopic}' in '{skill}/{topic}'.
2. EXPECTED OUTCOME: Raw research findings — real-world use cases, common scenarios, edge cases, and difficulty-appropriate practice ideas. The MAIN AGENT will use this to create an assignment directly.

3. REQUIRED TOOLS: websearch_web_search_exa, context7_query-docs

4. MUST DO:
   - **CURRENT DATE: {CURRENT_DATE}**
   - Conduct 3-5 searches for:
     * Real-world scenarios that use '{subtopic}' concepts
     * Common variations and edge cases of this concept
     * Industry patterns and best practices
     * What a 'harder' version of this concept looks like vs an 'easier' one
   - Rate source quality (Level 1-5).
   - Return specific, actionable findings via team_send_message — NO files, NO exercises, NO explanations.

5. REPORT STRUCTURE (via team_send_message):
   ## Real-World Scenarios
   - [scenario] — which concepts it uses — difficulty level
   
   ## Practice Patterns
   - [pattern] — what it teaches — difficulty
   
   ## Edge Cases & Variations
   - [variation] — what makes it interesting
   
   ## Difficulty Ideas
   - Easier: [approach]
   - Same: [approach]
   - Harder: [approach]

6. DO NOT create any files. Claim your team task (team_task_update → in_progress, owner scenario-researcher), report via team_send_message, mark completed.
`},
    // Context reader — the prior content the new assignment must build on
    { name: "context-reader", category: "unspecified-high", prompt: `
Read the subtopic-explanation.md: {SUDTOPIC_DIR}/subtopic-explanation.md
Read the previous assignment: {ASSIGNMENT_DIR}
Summarize: what concepts were covered, what was tested, what the user already built.
Return as plain text via team_send_message — NO files. Claim your team task (team_task_update → in_progress, owner context-reader), report, mark completed.
`}
  ]
}})
// Register tasks + dispatch both members (see TEAM ORCHESTRATION). Apply the Closure Contract when both are terminal.
```

**While research runs**, read the context:
- `{SUDTOPIC_DIR}/subtopic-explanation.md` (stay focused on THIS subtopic's concepts)
- `{ASSIGNMENT_DIR}` — previous assignment(s) to ensure progression
- User's self-report: difficulty, external help, confidence

**Collect research results**, then **MAIN AGENT creates the assignment directly**:

Write files to `{SUDTOPIC_DIR}/assignments/0{n}-{concept-name}/`:

a) **question.md** — Assignment brief at the user-chosen difficulty:
   - Easier: More scaffolding, guided steps, same concepts
   - Same level: Similar challenge, different scenario
   - Harder: More complex, combine concepts, edge cases
   - Draw from research for authentic scenarios

b) **test.{ext}** — Automated test script (follow SkillConventions.md)

c) **scaffold/** — Starter code (follow conventions, use src/ layout)

d) **solution-guide.md** — Reference implementation with explanation

**CRITIC REVIEW — MANDATORY**: After creating, run the Critic Review (oracle subagent) on the new assignment directory `{SUDTOPIC_DIR}/assignments/0{n}-{concept-name}/`. The critic EVALUATES only — it does not create. Fix all BLOCKER and MAJOR issues before presenting to the user.

---

**Scenario B: Create next subtopic + its first assignment:**

MAIN AGENT creates everything directly. Research runs as a **team** (see TEAM ORCHESTRATION).

```typescript
team_create({ inline_spec: {
  name: "<skill>-<topic>-subtopic-research",
  members: [
    // RESEARCH MEMBER 1: Core concepts and structure for the new subtopic
    { name: "concept-researcher", category: "unspecified-high", prompt: `
1. TASK: Systematic research for subtopic '{next-subtopic}' in '{skill}/{topic}'.
2. EXPECTED OUTCOME: Raw research on core concepts, prerequisites, key ideas, and real-world patterns for this specific subtopic. The MAIN AGENT uses this to write the explanation directly.

3. REQUIRED TOOLS: websearch_web_search_exa, context7_resolve-library-id, context7_query-docs

4. MUST DO — Systematic (5-10 searches):
   - **CURRENT DATE: {CURRENT_DATE}** — ONLY current information.
   - Search for each angle:
     a) Core concept — what exactly is this subtopic about? What is its essence?
     b) Prerequisites — what MUST the learner already understand?
     c) How does this build on the previous subtopic '{prev_subtopic}'?
     d) Key syntax / API / commands — what are the actual mechanics?
     e) Industry-standard tools and practices as of {CURRENT_YEAR}
   - For tech topics: use context7 for official docs.
   - Rate source quality (Level 1-5).
   - Return raw findings via team_send_message — NO files, NO explanations.

5. REPORT STRUCTURE (via team_send_message):
   ## Core Concept
   - Essence: [what this is, in 1-2 sentences]
   - Why it matters: [real-world importance]
   
   ## Prerequisites
   - [what's needed] — why
   
   ## Key Mechanics
   - [syntax/API/command] — what it does — example — source (Level X)
   
   ## Industry Standards
   - [tool/practice] — version — source
   
   ## Common Patterns
   - [pattern] — when to use — source
   
   ## Key Sources
   - [link] — Level X — what it covers

6. DO NOT create any files. Claim your team task (team_task_update → in_progress, owner concept-researcher), report via team_send_message, mark completed.
`},
    // RESEARCH MEMBER 2: Common mistakes and production context
    { name: "mistakes-researcher", category: "unspecified-high", prompt: `
1. TASK: Research common mistakes, misconceptions, and production context for subtopic '{next-subtopic}' in '{skill}/{topic}'.
2. EXPECTED OUTCOME: Raw findings on what beginners get wrong, edge cases, and real-world pitfalls.

3. REQUIRED TOOLS: websearch_web_search_exa

4. MUST DO (3-5 searches):
   - **CURRENT DATE: {CURRENT_DATE}**
   - Search for:
     * Common mistakes beginners make with this concept
     * Misconceptions about how it works
     * Edge cases and failure modes
     * Production best practices
     * Trade-offs experienced practitioners consider
   - Rate source quality.
   - Return raw findings via team_send_message — NO files.

5. DO NOT create any files. Claim your team task (team_task_update → in_progress, owner mistakes-researcher), report via team_send_message, mark completed.
`}
  ]
}})
// Register tasks + dispatch both members (see TEAM ORCHESTRATION). Apply the Closure Contract when both are terminal.
```

**While research runs**, read context files:
- `{TOPICS_DIR}/{topic}/topic-roadmap.md` (dependency order)
- `{TOPICS_DIR}/{topic}/topic-overview.md` (big picture)
- `{PREV_SUDTOPIC_DIR}/subtopic-explanation.md` (previous progression)
- `SkillConventions.md` for scaffold conventions

**Collect all research results**, then **MAIN AGENT creates everything directly**:

a) **subtopic-explanation.md** at `{TOPICS_DIR}/{topic}/subtopics/{next-subtopic-num}-{name}/`:
   Follow the same 3-layer format from Phase 1.4 Step 4a:
   - Why This Matters (scoped to THIS subtopic)
   - Prerequisites (link to previous subtopic if needed)
   - Layer 1: Core Idea
   - Layer 2: How It Works (use Research Agent 1 for accurate syntax)
   - Layer 3: Production Context (use Research Agent 2 for mistakes/edge cases)
   - Learning Checkpoints
   - Ready to Practice (link to assignment)

b) **First assignment** at `assignments/01-{concept}/`:
   - question.md, test.{ext}, scaffold/, solution-guide.md
   - Follow same conventions as Phase 1.4 Step 4b

c) **subtopic-progress.md**

d) **Update topic-progress.md** with the new subtopic row

**CRITIC REVIEW — MANDATORY**: After creating, run Critic Review (oracle subagent — evaluation only) on:
- `subtopic-explanation.md` — content_type="subtopic-explanation"
- `assignments/01-{concept}/` — content_type="assignment-01"

Fix all BLOCKER and MAJOR issues before presenting to the user (Phase 1.5 Step 2-3).

After creating the next subtopic, present it to the user (same pattern as Phase 1.5 Step 2-3).

### 4.3 When All Assignments Are Complete

### 4.3 When All Subtopics Are Complete

When ALL subtopics for a topic are completed (all subtopics in the topic-roadmap marked ✅):

1. **Create a cross-subtopic integration assignment** (optional — ask the user if they want one):
   - This assignment combines concepts from ALL subtopics into a real-world scenario
   - **MAIN AGENT creates directly** — fire a research subagent (`librarian`, background) to find real-world scenarios that combine these subtopics, then YOU write the assignment files
   - Save to: {TOPICS_DIR}/{topic}/assignments/01-{integration-name}/
   - Create: question.md, test.{ext}, scaffold/, solution-guide.md
   - This is the capstone — the user demonstrates they can use everything together

2. **Run Critic Review — MANDATORY** on the integration assignment directory `{TOPICS_DIR}/{topic}/assignments/01-{integration-name}/`. Fix all BLOCKER and MAJOR issues.

3. **Update `topic-progress.md`** — set overall status to ✅ Completed, finalize all subtopic statuses.

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
| Topic roadmap exists (if needed) | 1.4 | Main agent creates directly after research subagents complete |
| Topic overview exists (topic-overview.md) | 1.4 | Main agent creates directly — 5 min read, big picture only |
| Subtopic explanation exists (subtopics/01-*/subtopic-explanation.md) with all sections (Why This Matters, Layer 1, Layer 2, Layer 3, Learning Checkpoints) | 1.4 | Re-generate — each subtopic MUST have its own focused explanation |
| subtopic-explanation.md covers ONE subtopic only (no concept cramming) | 1.4 | If multiple concepts are present, split into separate subtopics |
| Assignment 1 exists (question, test, scaffold, solution) | 1.4 | Fix incomplete assignment |
| Assignment tests are syntactically valid | 1.4 | Quick syntax check, fix if broken |
| Critic review run on topic-roadmap, overview, subtopic-explanation, and assignment | 1.4 | Run oracle critic on each. Fix BLOCKER/MAJOR. Save critic-review.md |
| Critic review run on new assignment | 4.2 (Scenario A) | Run oracle critic on assignment. Fix BLOCKER/MAJOR |
| Critic review run on new subtopic and its assignment | 4.2 (Scenario B) | Run oracle critic on explanation + assignment. Fix BLOCKER/MAJOR |
| Critic review run on cross-subtopic integration | 4.3 | Run oracle critic on integration assignment. Fix BLOCKER/MAJOR |
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
| Subagent produces low-quality assignment | Run critic review, fix BLOCKER/MAJOR issues, then re-run critic if verdict was ❌ |
| Critic review returns ❌ Needs fixes | Fix all BLOCKER and MAJOR issues, then re-run critic on the same content. Repeat until verdict is ✅ or ⚠️ with only MINOR/INFO items remaining |
| Critic review finds content covers multiple concepts | Split the subtopic into separate subtopics, run critic on each |
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
- ✅ **Create ALL content directly as the main agent** — YOU write topic roadmaps, explanations, assignments, scaffolds, and tests. Subagents do RESEARCH only (web search, doc lookup, finding patterns). This preserves the user's exact intent without summarization loss.
- ✅ **Fire parallel research as a TEAM** — when a research batch has 2+ independent angles, use `team_create` (category-routed members) and collect findings via `team_send_message` + `team_task_list`. Single-angle research stays a `librarian`/`explore` background delegate. Collect results before creating content. Research quality determines learning quality — use systematic multi-angle searches.
- ✅ **Progress lives in topic-progress.md and subtopic-progress.md** — topic level tracks subtopics, subtopic level tracks assignments. Runs/ contains only action logs.
- ✅ **When user has a doubt, generate a diagnostic micro-task** — but make it EASIER than the main assignment (fills the ZPD gap)
- ✅ **Update subtopic-progress.md after every state change** — never batch updates. Then sync topic-progress.md and progress-index.md.
- ✅ **Log all interactions in runs/** — create interaction task files for Q&A, agent-log.md for session actions
- ✅ **Update user preferences** — when you have clear signal
- ✅ **Provide tasks, not answers** — guide the user to discover solutions through practice
- ✅ **Apply the Closure Contract after every research team** — shut down all members and `team_delete` as soon as every research task is terminal. Never leave a team running into an interactive session.
- ✅ **Run critic review in background after EVERY content creation** — critics are `oracle` delegates (NOT team-eligible); use `run_in_background=true` so critics can run in parallel. Continue non-overlapping work while waiting
- ✅ **Wait for ALL critics before making changes** — collect results via `background_output(task_id="bg_...")` after the system notifies completion. Do NOT edit content under review until all critics have reported
- ✅ **Fix BLOCKER and MAJOR issues from critic** — do NOT proceed until all blockers are resolved. The critic-review.md file documents the quality assessment
- ✅ **Generate real-world assignments** — theory-only is not enough. Every assignment must be a real-world scenario
- ✅ **Assignments must require genuine work** — the scaffold should provide structure and imports, but the user must write the actual logic. TODO markers with `pass` statements, not pre-filled solutions.
- ✅ **Git commit after each session** — track progress over time

## What You MUST NOT Do

- ❌ **Do NOT delegate content creation to subagents** — YOU (the main agent) write ALL content directly. Subagents research only. Delegating content creation to a subagent loses the user's intent through summarization. The user's exact words must reach the content creator unfiltered.
- ❌ **Do NOT use category-based subagents (`deep`, `unspecified-high`, `writing`, `visual-engineering`) for content creation** — these are for content creation delegation, which violates the main-agent-creates principle. Use team members (category-routed) or `librarian`/`explore` for RESEARCH ONLY.
- ❌ **Do NOT convert critic review to a team** — `oracle` is not team-eligible; critics stay individual background `oracle` delegates.
- ❌ **Do NOT leave research teams running** — teams are ephemeral; apply the Closure Contract (shutdown + delete) as soon as research tasks are terminal.
- ❌ **Do NOT create content without research first** — always fire research subagents in background, collect their findings, then create. Research quality determines learning quality.
- ❌ **Do NOT skip research on common mistakes and misconceptions** — these are essential for effective explanations. Research Agent 2 (production context) is not optional.
- ❌ Do NOT create a single massive topic-explanation.md covering all subtopics — this violates chunking and cognitive load research. Each subtopic gets its own focused document.
- ❌ Do NOT create all subtopics upfront — only the first. Rest are generated on-demand as the user progresses.
- ❌ Do NOT allow any subtopic-explanation.md to cover multiple concepts — if it does, split into more subtopics. The main agent owns quality.
- ❌ Do NOT create all assignments upfront — generate on-demand as user progresses
- ❌ Do NOT start with max difficulty — always baseline first, then calibrate
- ❌ Do NOT push the user beyond ZPD — if they're failing, regress and scaffold more
- ❌ Do NOT keep the same difficulty after failure — if tests fail, offer an easier variant
- ❌ Do NOT write explanations when user has a doubt — generate a diagnostic task instead
- ❌ Do NOT give away solutions when the user is stuck — give them tasks that lead to the answer
- ❌ Do NOT skip the critic review — every content creation (topic roadmap, subtopic explanation, assignment) MUST get a critic-review.md. Without it, the content is unverified
- ❌ Do NOT edit content under review before all critics have reported — collect all background_output first, then fix. Making changes before getting critic feedback defeats the purpose
- ❌ Do NOT proceed with BLOCKER issues unfixed — the critic identified them for a reason; fix them before the user sees the content
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
