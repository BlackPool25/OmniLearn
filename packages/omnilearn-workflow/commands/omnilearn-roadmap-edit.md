---
description: Edit an existing learning roadmap with full research-backed revision. Preserves progress data and run logs while restructuring the roadmap with the same rigor as creation.
---

# /omnilearn-roadmap-edit — Edit an Existing Learning Roadmap

## Usage
```
/omnilearn-roadmap-edit Rust Add more systems programming focus
/omnilearn-roadmap-edit React I want more emphasis on testing patterns
/omnilearn-roadmap-edit Machine Learning Make the math section more approachable
/omnilearn-roadmap-edit Python I want to add web scraping and automation
```

## Current Date Context

```bash
CURRENT_DATE=$(date +%Y-%m-%d)
CURRENT_YEAR=$(date +%Y)
```

**All subagents that do research or content generation MUST receive the current date and prioritize current information over deprecated or outdated resources.**

## MCP Tool Call Semantics (CRITICAL — Subagents Frequently Get This Wrong)

All subagents that use MCP tools MUST follow these exact calling conventions:

### `context7_resolve-library-id` + `context7_query_docs`
1. **ALWAYS call `context7_resolve-library-id` FIRST** with the library name to get the correct library ID.
2. Use the returned library ID (format: `/org/package`) as the `libraryId` parameter in `context7_query_docs`.
3. Do NOT guess or hardcode library IDs.
4. Max 3 calls per question.

### `google_search` / `websearch_web_search_exa`
- Use specific, well-formed queries — not keywords, but describe the ideal page.
- Good: `"current best practices for REST API design 2025"`
- Bad: `"REST API"`
- Pass `query` as a plain string, not wrapped in an object.

### General Rules
- Match tool call parameter names EXACTLY as defined in the tool schema.
- Do NOT wrap string parameters in extra objects or arrays.
- Do NOT nest tool calls unless the API explicitly requires it.
- If a tool call fails, verify parameter names match before retrying.

## Core Behavior

This command performs the same rigorous research-backed process as `/omnilearn-roadmap`, but operates on an EXISTING roadmap. It:
1. Reads the existing roadmap and associated files
2. Understands what the user wants to change
3. Does parallel research to validate and expand
4. Produces an updated roadmap while preserving progress tracking data
5. Archives the old version to runs/ for history

**Progress data (completed topics, assignment logs, run histories) must NOT be lost during editing.**

**Critical rule: the edit restructures FUTURE topics intelligently while leaving COMPLETED and IN-PROGRESS topics untouched. Never delete or reset progress — only reorder, add, or deepen future content.**

## Directory Structure Reference

```
.omnilearn/
├── UserPreferences.md
└── <skill-name>/
    ├── SkillPreferences.md
    ├── SkillConventions.md                  ← Preserved during edits
    ├── roadmap.md                          ← Will be updated
    ├── progress-index.md                   ← Must be preserved & updated
    ├── runs/
    │   └── YYYY-MM-DD-HHMMSS-roadmap-edit/
    │       ├── agent-log.md
    │       ├── research-changes.md         ← Research on requested changes
    │       ├── old-roadmap-archived.md     ← Previous version of roadmap
    │       └── new-roadmap-draft.md        ← Draft of updated roadmap
    └── topics/                             ← MUST be preserved — never delete or alter topic-progress.md, assignments/, or runs/
        └── <topic-name>/
            ├── topic-progress.md           ← 🔑 THE source of truth for what the user has done
            ├── assignments/                ← All assignment work the user has completed
            └── runs/                       ← Learning session logs
```

**Progress Inventory — Every edit must account for each topic's full state before making changes.**

## Phase 0: INTENT GATE — Parse Input & Validate

### 0.1 Parse Input

Extract the skill name and the change request from the user's message:
- "Edit my Rust roadmap to add more systems programming" → skill: `Rust`, changes: "add more systems programming"
- "Make the React roadmap less focused on hooks and more on state management patterns" → skill: `React`, changes: "more state management patterns"

If no skill is identifiable, ask:
> "Which skill's roadmap would you like to edit? (e.g., 'Rust', 'React', 'Machine Learning')"

If no specific change is mentioned, ask:
> "What would you like to change about the {skill} roadmap? For example: add topics, restructure, change depth, adjust focus areas."

### 0.2 Check Roadmap Exists

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
RUNS_DIR="$SKILL_DIR/runs"
TOPICS_DIR="$SKILL_DIR/topics"
PROGRESS_INDEX="$SKILL_DIR/progress-index.md"
SKILL_PREFS="$SKILL_DIR/SkillPreferences.md"

if [ ! -f "$ROADMAP" ]; then
  echo "No roadmap found for {skill}. Create one first with: /omnilearn-roadmap {skill}"
  exit 1
fi
```

### 0.3 Read Existing Files + Build Progress Inventory

Read these files:
- `UserPreferences.md` — global preferences
- `SkillPreferences.md` — per-skill preferences  
- `roadmap.md` — the existing roadmap (read fully)
- `progress-index.md` — overview of topic statuses

### 0.4 Inventory ALL Topic Progress (CRITICAL — Must Not Be Skipped)

**Before ANY changes, you must build a complete inventory of every topic's progress.** This is the safety net that prevents progress loss.

```bash
TOPICS_DIR="$SKILL_DIR/topics"
```

For each topic directory found in `$TOPICS_DIR/`:
1. Read its `topic-progress.md` — extract:
   - Topic name and overall status (✅ Completed / 🔵 In Progress / 🟢 Not Started)
   - Which assignments are completed (1/3, 2/3, 3/3)
   - Skills demonstrated (from the log)
   - Last session date
2. List the assignments directory — note which assignment files exist
3. List the runs directory — note any learning session logs

Build a **Progress Inventory** file:

```bash
PROGRESS_INVENTORY="$ARCHIVE_DIR/progress-inventory.md"
```

Write to this file with the following structure:

```markdown
# Progress Inventory: {skill} (before edit)

## Topics Inventory
| Topic | Status | Assignments Done | Skills Demonstrated | Last Activity |
|-------|--------|-----------------|---------------------|---------------|
| topic-1 | ✅ Completed | 3/3 | {list of skills} | {date} |
| topic-2 | 🔵 In Progress | 1/3 | {partial skills} | {date} |
| topic-3 | 🟢 Not Started | 0/3 | — | — |

## Detailed Topic States

### topic-1 (✅ Completed)
- topic-progress.md: {TOPICS_DIR}/topic-1/topic-progress.md
- Assignments: 01-basics ✅, 02-intermediate ✅, 03-real-world ✅
- Skills: {extracted skills demonstrated}
- Sessions: {count} learning sessions in runs/

### topic-2 (🔵 In Progress)
- topic-progress.md: {TOPICS_DIR}/topic-2/topic-progress.md
- Assignments: 01-basics ✅, 02-intermediate 🔵, 03-real-world 🟢
- Current assignment: {which one they're on}
- Skills: {extracted skills demonstrated so far}
- Sessions: {count} learning sessions

### topic-3 (🟢 Not Started)
- topic-progress.md: {TOPICS_DIR}/topic-3/topic-progress.md
- No progress yet

## Cross-Skill Context (from existing skills)
{summary of other skills user has learned}
```

This inventory is passed to ALL downstream subagents so they know exactly what must be preserved.

### 0.5 Archive Current Roadmap

```bash
mkdir -p "$RUNS_DIR/$(date +%s)-roadmap-edit"
ARCHIVE_DIR="$RUNS_DIR/$(date +%s)-roadmap-edit"
cp "$ROADMAP" "$ARCHIVE_DIR/old-roadmap-archived.md"
```

This ensures the old version is NEVER lost.

## Phase 1: PARALLEL RESEARCH — Analyze + Research Changes

Spawn two subagents in parallel:

### 1.1 Subagent A: Changes Analysis (Progress-Aware)

```typescript
task(category="unspecified-high", run_in_background=true, prompt="
1. TASK: Analyze the existing {skill} roadmap and the user's requested changes to determine exactly what needs to be added, removed, or restructured. **CRITICAL: You MUST read the progress inventory first to know what the user has already accomplished.**
2. EXPECTED OUTCOME: A detailed analysis identifying specific roadmap changes, with rationale and a **progress migration plan** ensuring nothing the user has done is lost.

3. REQUIRED TOOLS: read, write, grep

4. MUST DO:
   - FIRST — Read the PROGRESS INVENTORY: {ARCHIVE_DIR}/progress-inventory.md
     * Note EVERY topic's status (✅ Completed / 🔵 In Progress / 🟢 Not Started)
     * Note every assignment that's been completed
     * Note skills the user has demonstrated
   - Read the existing roadmap: {ROADMAP}
   - Read the skill preferences: {SKILL_PREFS}
   - Analyze the user's change request: '{user_change_request}'
   - Identify EXACTLY which sections/topics need to change:
     * **COMPLETED topics (✅) must NEVER be removed or altered** — they represent accomplished learning
     * **IN-PROGRESS topics (🔵) should be left intact** — the user is mid-learning
     * **NOT STARTED topics (🟢) are fair game for restructuring** — these are future work
     * New topics to add — specify where in the structure they fit
     * Existing topics to modify — specify what needs to change (only future/not-started ones)
     * Topics to reorder — specify new position in the sequence
     * Depth/emphasis adjustments — which topics need more/less coverage
   - **For each proposed change to a NOT STARTED topic, verify it doesn't conflict with completed topics' prerequisites**
   - Write analysis to: {ARCHIVE_DIR}/research-changes.md
   - Format: For each change, state: What, Where, Why, Impact on existing progress

5. MUST NOT DO:
   - Do NOT suggest removing or modifying ✅ Completed topics
   - Do NOT suggest removing or modifying 🔵 In Progress topics unless the user explicitly asked
   - Do NOT suggest discarding any assignment files, topic-progress.md files, or run logs
   - Do NOT modify any files — this is analysis only
   - Do NOT add topics that are out of scope for the skill

6. CONTEXT:
   - Skill: {skill}
   - User change request: {user_change_request}
   - Progress inventory at: {ARCHIVE_DIR}/progress-inventory.md
   - Existing roadmap at: {ROADMAP}
   - User preferences: {summary}
")
```

### 1.2 Subagent B: Online Research for Changes

```typescript
task(category="unspecified-high", run_in_background=true, prompt="
1. TASK: Research online to validate and inform the user's requested roadmap changes for {skill}.
2. EXPECTED OUTCOME: A research document with web-sourced findings about the topics the user wants to add/modify.

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, context7_resolve-library-id, context7_query_docs, read, write

4. MUST DO:
   - **CURRENT DATE: {CURRENT_DATE}** — ONLY research current information. Check for deprecation warnings. Prioritize resources from the last 1-2 years. Prefer latest stable versions of any library/framework/tool.
   - Analyze the user's change request: '{user_change_request}'
   - Use google_search / websearch_web_search_exa to research:
     * The specific topics/areas the user wants to add or modify
     * Current best practices and latest developments
     * Common curriculum structures that include these topics
     * Importance and relevance of these topics for real-world proficiency
   - If the topics involve programming languages/frameworks, use context7 for official docs
   - For each researched area, document:
     * What it is and why it matters
     * Prerequisites
     * How it connects to other topics in the skill
     * Recommended depth of coverage
     * Learning resources
   - Assess whether the user's requested changes are:
     * Essential (should definitely be added)
     * Beneficial (good addition but not critical)
     * Out of scope (not relevant to the skill)
     * Too advanced/premature (needs prerequisites first)
   - Write findings to: {ARCHIVE_DIR}/research-online.md

5. MUST NOT DO:
   - Do NOT skip research even if you 'know' the topic — web search validates currency
   - Do NOT modify any files — this is research only

6. CONTEXT:
   - Skill: {skill}
   - User change request: {user_change_request}
   - User preferences: {summary}
")
```

### 1.3 Collect Both Results

Wait for both to complete. Collect via `background_output()`.

## Phase 2: ROADMAP UPDATE — Synthesize New Version

### 2.1 Read Research and Old Roadmap

Read the research files and the archived old roadmap.

### 2.2 Spawn Roadmap Update Subagent (Progress-Preserving)

```typescript
task(category="unspecified-high", run_in_background=false, timeout=300000, prompt="
1. TASK: Update the {skill} roadmap based on change analysis and online research. **CRITICAL: Preserve ALL completed and in-progress topic data — these represent learning the user has already done and must never be erased.**
2. EXPECTED OUTCOME: An updated roadmap.md that incorporates the user's requested changes while keeping every byte of the user's progress intact.

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, read, write, grep

4. MUST DO — in this order:

   STEP 1 — Read ALL context:
   - Read the PROGRESS INVENTORY: {ARCHIVE_DIR}/progress-inventory.md
     * This tells you EXACTLY what the user has done: every completed topic, every in-progress assignment
     * Every topic in this inventory has a topic-progress.md, assignments/, and runs/ in topics/
   - Read the CHANGE ANALYSIS: {ARCHIVE_DIR}/research-changes.md
   - Read the ONLINE RESEARCH: {ARCHIVE_DIR}/research-online.md
   - Read the OLD ROADMAP: {ARCHIVE_DIR}/old-roadmap-archived.md

   STEP 2 — Map old topics → new structure:
   For EACH topic from the progress inventory and old roadmap, decide:
   - ✅ **Completed topics**: MUST appear in the new roadmap EXACTLY as they were — same name, same position (or moved only as a group with other completed topics), same ✅ marker
   - 🔵 **In-progress topics**: MUST appear in the new roadmap with the same name and 🔵 marker. If the user wants to rename it, create an alias mapping. The topic-progress.md must remain valid.
   - 🟢 **Not-started topics**: Can be restructured, merged, split, reordered, or replaced as needed
   
   Create a **topic mapping table** showing how each old topic maps to the new structure:

   ```markdown
   | Old Topic | Status | Action | New Topic | topic-progress.md |
   |-----------|--------|--------|-----------|-------------------|
   | Variables | ✅ | Preserve | Variables | topics/variables/topic-progress.md |
   | Functions | 🔵 | Preserve | Functions | topics/functions/topic-progress.md |
   | Pointers | 🟢 | Merge into | Memory Management | (new — no existing file) |
   | Structs | 🟢 | Split into | Structs + Traits | (new — no existing files) |
   ```

   STEP 3 — Synthesize updated roadmap:
   - Completed topics appear first in their section (user has earned their place)
   - In-progress topics appear next, with their 🔵 marker and link to topic-progress.md
   - Not-started and new topics follow, reorganized as needed
   - Maintain the same structure format (Foundation → Core → Advanced → Real-World)
   - For each preserved topic (✅ or 🔵), include a note like:
     > *Progress: ✅ Completed — see topics/{topic}/ for details*
   - Write the updated roadmap to: {ROADMAP}
   - Format must be IDENTICAL to the original roadmap format (same section structure, marker format)

5. MUST NOT DO:
   - Do NOT change progress markers for ✅ or 🔵 topics
   - Do NOT delete or modify any files inside topics/ directory — topic-progress.md, assignments/, runs/ are all sacred
   - Do NOT remove completed topics — they represent accomplished learning
   - Do NOT treat completed and not-started topics the same — completed are immutable, not-started are flexible
   - Do NOT rename topic folders without updating the mapping — the topic-progress.md path must still work
   - Do NOT change SkillPreferences.md or progress-index.md (those are updated separately)

6. CONTEXT:
   - Skill: {skill}
   - Progress inventory (source of truth for what user has done): {ARCHIVE_DIR}/progress-inventory.md
   - User change request: {user_change_request}
   - User preferences: {summary}
   - Topic directories (DO NOT TOUCH): {TOPICS_DIR}/
")
```

### 2.3 Preserve Topic Directories & Update Supporting Files

**Critical: The topics/ directory and everything inside it must NEVER be deleted.**

If the edit renames or restructures topics:

1. **If a topic is renamed**: Move the directory (not copy — move to preserve all content):
   ```bash
   mv "$TOPICS_DIR/old-topic-name" "$TOPICS_DIR/new-topic-name"
   ```
   And update its `topic-progress.md` header to reflect the new name.

2. **If a topic is split into multiple topics**: Copy the `topic-progress.md` to each split topic as a starting point (with 🟢 Not Started status), but keep the original intact:
   ```bash
   cp "$TOPICS_DIR/original-topic/topic-progress.md" "$TOPICS_DIR/split-topic-1/topic-progress.md"
   cp "$TOPICS_DIR/original-topic/topic-progress.md" "$TOPICS_DIR/split-topic-2/topic-progress.md"
   ```
   Update each copy's header to reflect the new topic name and reset status to 🟢.

3. **If topics are merged**: Keep all original topic directories. Create a new parent topic directory that references them:
   ```bash
   mkdir -p "$TOPICS_DIR/new-merged-topic"
   # Create topic-progress.md that references the sub-topics
   ```
   The originals remain accessible and their progress is preserved.

4. **Completed/In-progress topics MUST keep their exact directory name** unless the user explicitly requests renaming.

Then update supporting files:

Update `SkillPreferences.md` to reflect any new focus areas.

Update `progress-index.md`:
- Preserve ALL existing progress data (completed/in-progress markers unchanged)
- Add any new topics with 🟢 Not Started status
- Update renamed topic references if directories were moved
- Each topic entry should link to its topic-progress.md

**Do NOT use a subagent for these — they are simple edits performed by the orchestrator directly.**

## Phase 3: UPDATE USER PREFERENCES

### 3.1 Update UserPreferences.md

If this interaction reveals new, clear signals about the user's preferences, append them to `UserPreferences.md`:

- User wants deeper coverage of specific areas → adjust skill focus preferences
- User expresses frustration with certain topics → note potential learning style insight
- User asks for more/less theory vs practice → update learning style preferences

**Only add high-confidence signals. Don't speculate.**

### 3.2 Write Agent Log

```bash
mkdir -p "$ARCHIVE_DIR"
```

Write to `$ARCHIVE_DIR/agent-log.md`:
- What changes were requested
- What research was conducted
- What changes were made to the roadmap
- Any topics added/removed/modified
- Current state of progress-index.md

## Phase 4: PRESENT TO USER

```markdown
┌──────────────────────────────────────────────────────────────────┐
│  ✅ Roadmap Updated: {skill}                                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Changes Made:                                                    │
│  • Added: {new topics added}                                      │
│  • Modified: {topics restructured or deepened}                    │
│  • Removed: {any topics removed, if any}                          │
│  • Preserved: All progress data intact                            │
│                                                                   │
│  🔗 Previous version archived at:                                 │
│     .omnilearn/{skill}/runs/{timestamp}-roadmap-edit/             │
│                                                                   │
│  📍 Updated roadmap: .omnilearn/{skill}/roadmap.md                │
│                                                                   │
│  ┌─ Change Preview ──────────────────────────────────────────┐   │
│  │ {brief summary of the most significant changes}            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Your progress on completed/in-progress topics has been preserved.│
│                                                                   │
│  Next: Use /omnilearn-start {skill} to continue learning.         │
│  Want further changes? Use /omnilearn-roadmap-edit again.         │
└──────────────────────────────────────────────────────────────────┘
```

## Phase 5: GIT COMMIT

```bash
if git rev-parse --git-dir > /dev/null 2>&1; then
  git add "$OMNILEARN_DIR/"
  git commit -m "omnilearn: update roadmap for {skill}

- {change summary}
- Archived previous version to runs/
- Preserved all progress data unchanged
"
fi
```

If no git repo: same flow as `/omnilearn-roadmap` — ask if the user wants to initialize one.

## Quality Gates

| Check | Phase | Action if Failed |
|-------|-------|-----------------|
| Old roadmap archived before editing | 0 | Block — archive first |
| Progress inventory built (topic-progress.md read for ALL topics) | 0 | Block — must know what user has done |
| Change analysis subagent reads progress inventory | 1 | Re-spawn with progress inventory path |
| Online research subagent completed | 1 | Block — must have validation |
| All ✅ Completed topics preserved in new roadmap unchanged | 2 | Restore from archive, re-synthesize |
| All 🔵 In Progress topics preserved with same status | 2 | Restore markers from archive |
| All 🟢 Not Started topics accounted for (restructured or moved) | 2 | Check each was mapped |
| Each existing topic-progress.md still accessible | 2 | Verify file still exists at its path |
| No topic-progress.md files deleted | 2 | Revert: git checkout if needed |
| No assignment files deleted | 2 | Revert: git checkout if needed |
| progress-index.md updated with new structure + old progress | 2 | Fix manually — preserve all ✅ and 🔵 |
| Agent log written with topic mapping table | 3 | Write it |
| Verify old roadmap archived to runs/ | 0 | Archive it — never lose history |

## Error Recovery

| Situation | Action |
|-----------|--------|
| Skill/roadmap doesn't exist | Tell user to use /omnilearn-roadmap first |
| User wants to revert changes | Restore old-roadmap-archived.md from runs/, revert any topic directory moves |
| User says "you deleted my progress!" | STOP. Restore from archive. The topics/ directory must be fully intact with git checkout. |
| Change analysis conflicts with online research | Present both perspectives, ask user which to follow |
| Progress markers accidentally changed | Restore from archived old roadmap |
| topic-progress.md accidentally modified | Revert: `git checkout .omnilearn/{skill}/topics/{topic}/topic-progress.md` |
| topics/ directory accidentally modified | Revert: `git checkout .omnilearn/{skill}/topics/` |
| Topic renamed but topic-progress.md path broken | Move directory back, use a symlink or alias instead |
| User's requested change is too vague | Ask clarifying questions before proceeding |

## What You MUST Do

- ✅ **Build a complete progress inventory BEFORE any changes** — read every topic-progress.md
- ✅ **Archive old roadmap before any changes** — never overwrite without backup
- ✅ **Preserve ALL topic-progress.md, assignments/, and runs/ files** — they are the user's learning record
- ✅ **Treat ✅ Completed topics as immutable** — never delete, never reset, never reorder away from their section
- ✅ **Treat 🔵 In Progress topics as sacred** — the user is mid-learning, don't disrupt them
- ✅ **Only restructure 🟢 Not Started topics** — future work is flexible, past work is not
- ✅ **Map old topic names → new topic names** — create a mapping table so nothing is lost
- ✅ **Research changes online** — validate that additions are current and relevant
- ✅ **Update progress-index.md with new structure** — add new topics, preserve old progress, update renamed references
- ✅ **Update SkillPreferences.md** to reflect new focus areas
- ✅ **Git commit after edit**

## What You MUST NOT Do

- ❌ Do NOT overwrite roadmap without archiving old version
- ❌ Do NOT delete or modify files in topics/ directory — topic-progress.md, assignments/, runs/ are all sacred
- ❌ Do NOT delete or reset completed topic progress
- ❌ Do NOT modify in-progress topic status
- ❌ Do NOT treat completed and not-started topics the same — they are fundamentally different
- ❌ Do NOT skip building the progress inventory — this is what prevents data loss
- ❌ Do NOT skip online research — even for topics you 'know'
- ❌ Do NOT assume you know what the user has done — read topic-progress.md files to verify
- ❌ Do NOT proceed if change request is too vague — ask for clarification
- ❌ Do NOT push to remote without explicit user approval
