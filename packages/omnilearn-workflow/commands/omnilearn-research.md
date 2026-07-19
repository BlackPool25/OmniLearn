# /omnilearn-research Command

**Description**: Multi-agent deep research system. Uses parallel subagents with systematic literature review, falsification-based hypothesis testing, and structured evidence synthesis to produce high-quality research on any topic.

**Scope**: opencode

---

## Command Instructions

# /omnilearn-research — Deep Research Engine

## Usage

```
/omnilearn-research What are the compression bottlenecks in modern backend APIs?
/omnilearn-research How does Postgres handle concurrent transactions under SSI?
/omnilearn-research Find design patterns for fault-tolerant message queues
/omnilearn-research --continue compression-bottlenecks
/omnilearn-research dig deeper on the expand-contract pattern from CI/CD research
```

## Core Research Philosophy

This system follows **Popperian falsification** — not "gather evidence to confirm a hypothesis" but "actively try to disprove hypotheses and report what survives." The goal is not to produce agreeable summaries but to identify what is genuinely known, what is uncertain, and what is contradicted.

### Research Principles

| Principle | What It Means |
|-----------|---------------|
| **Falsification over confirmation** | Every hypothesis must specify what would disprove it. The agent actively searches for contradicting evidence, not just supporting evidence. |
| **Systematic review** | Research follows PRISMA-style methodology: predefined search strategy, inclusion/exclusion criteria, evidence quality grading. Not ad-hoc web scraping. |
| **Multi-agent adversarial process** | Hypothesis generation and hypothesis testing are handled by DIFFERENT subagents with opposing goals. This prevents confirmation bias. |
| **Confidence calibration** | Every finding has a numerical confidence bound, not vague language. "Moderate evidence (65-75%)" not "some evidence suggests." |
| **Explicit uncertainty** | Every conclusion includes: what remains unknown, alternative explanations not ruled out, and what evidence would overturn it. |
| **Loop prevention** | Before every research action, the agent checks an iterator log for previous attempts. No repeating the same failed approach. |

---

## Directory Structure

```
{learningDirectory}/.omnilearn/research/
├── INDEX.md                              ← MOC: map of ALL research topics (updated after every run)
├── <research-topic>/                     ← e.g., "compression-backend-bottlenecks"
│   ├── topic-index.md                    ← MOC for this topic: status, key findings, iterator log
│   ├── STATUS.md                         ← Human-readable progress: current phase, what's happening
│   ├── progress.json                     ← Machine-readable progress (agent reads this on resume)
│   │
│   ├── 01-background/
│   │   ├── literature-review.md          ← Systematic search results with PRISMA flow
│   │   ├── source-table.md              ← All sources with GRADE evidence rating
│   │   └── contradictions-map.md        ← Known disagreements in the literature
│   │
│   ├── 02-hypotheses/
│   │   ├── hypothesis-registry.md       ← All hypotheses with status (active/falsified/unverified)
│   │   ├── H1-<claim>.md               ← Atomic hypothesis: claim, falsification criteria, status
│   │   └── H2-<claim>.md
│   │
│   ├── 03-evidence/
│   │   ├── evidence-log.md              ← All evidence collected with confidence ratings
│   │   ├── supporting/                  ← Evidence that corroborates (with source links)
│   │   └── contradicting/              ← Evidence that challenges (falsification attempts)
│   │
│   ├── 04-synthesis/
│   │   ├── findings.md                  ← What we established (structured per finding)
│   │   ├── conclusions.md               ← What we conclude + confidence levels
│   │   ├── open-questions.md            ← What remains unknown (specific, falsifiable)
│   │   └── recommendations.md           ← Practical implications
│   │
│   ├── 05-iterations/                   ← LOOP PREVENTION: every run logged here
│   │   ├── iterator-log.md             ← Global index of all iterations (check BEFORE acting)
│   │   ├── iteration-001.md            ← Full run log: actions, decisions, results
│   │   └── iteration-002.md
│   │
│   ├── follow-ups/                      ← Extensions from user questions
│   │   ├── 01-<user-question>/
│   │   │   ├── CONTEXT.md              ← Copy of relevant section from parent research
│   │   │   ├── findings.md
│   │   │   ├── agent-log.md
│   │   │   └── sources.md
│   │   └── ...
│   │
│   └── agent-log.md                     ← Full reasoning log for this research thread
│
└── archives/                             ← Completed / paused research
    └── <completed-topic>/
```

---

## Mandatory Tools

| Tool | When | Why |
|------|------|-----|
| `task(category="deep", background)` | Each research phase | Autonomous subagents for literature review, hypothesis, evidence, synthesis |
| `task(subagent_type="explore", background)` | Discovery | Find existing research, check iterator log |
| `google_search` / `websearch_web_search_exa` | Every phase | Primary research tool — minimum 5-15 queries per phase |
| `context7_query-docs` | Tech topics | Official documentation for libraries/frameworks |
| `read`, `write`, `edit`, `bash`, `grep`, `glob` | Every phase | File operations |
| `question` tool | User interaction | Present findings, ask for direction |

---

## Phase 0: INTENT GATE — Parse & Validate

### 0.1 Parse Input

Extract the research question or command from the user's message:

| Input Pattern | Action |
|---------------|--------|
| `/omnilearn-research What is X?` | New research on X |
| `/omnilearn-research --continue <topic>` | Resume existing research on topic |
| `/omnilearn-research dig deeper on Y from Z` | Follow-up on existing research |
| `/omnilearn-research --list` | List all research topics with status |

### 0.2 Verify Setup

```bash
OMNILEARN_CONFIG="$HOME/.config/opencode/omnilearn.json"

if [ ! -f "$OMNILEARN_CONFIG" ]; then
  echo "OmniLearn is not configured yet."
  echo "Run this first: /omnilearn-init"
  exit 1
fi

LEARNING_DIR=$(grep -o '"learningDirectory"[[:space:]]*:[[:space:]]*"[^"]*"' "$OMNILEARN_CONFIG" | sed 's/"learningDirectory"[[:space:]]*:[[:space:]]*"//' | sed 's/"$//')
RESEARCH_DIR="$LEARNING_DIR/.omnilearn/research"
```

### 0.3 Check for Existing Research

```bash
mkdir -p "$RESEARCH_DIR"

# Ensure INDEX.md exists
if [ ! -f "$RESEARCH_DIR/INDEX.md" ]; then
  echo "# Research Map of Content" > "$RESEARCH_DIR/INDEX.md"
  echo "" >> "$RESEARCH_DIR/INDEX.md"
  echo "## Active Research" >> "$RESEARCH_DIR/INDEX.md"
  echo "" >> "$RESEARCH_DIR/INDEX.md"
  echo "## Archives" >> "$RESEARCH_DIR/INDEX.md"
fi

# Read INDEX.md to see if this topic already exists
TOPIC_SLUG=$(echo "$USER_QUESTION" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]+/-/g' | sed 's/^-//;s/-$//')
TOPIC_DIR="$RESEARCH_DIR/$TOPIC_SLUG"

if [ -d "$TOPIC_DIR" ]; then
  # Read topic-index.md to understand current state
  # Ask user: continue existing research or start fresh?
  question(questions=[{
    header: "Existing Research Found",
    question: "Research on '$TOPIC_SLUG' already exists. What do you want to do?",
    options: [
      {label: "Continue existing", description: "Resume where we left off"},
      {label: "Start fresh", description: "Overwrite with new research"},
      {label: "Extend with new question", description: "Add a follow-up focused on a specific angle"},
    ]
  }])
fi
```

### 0.4 Generate the Topic Slug

Derive a filesystem-safe slug from the research question:
- Lowercase, replace spaces/special chars with hyphens
- Keep it under 60 chars (truncate if longer)
- Example: "What are the compression bottlenecks in modern backend APIs?" → `compression-bottlenecks-backend-apis`

---

## Phase 1: BACKGROUND & LITERATURE REVIEW

**Goal**: Systematic understanding of what exists, what's known, where the gaps are.

Spawn parallel subagents:

```typescript
task(category="deep", run_in_background=false, timeout=300000, prompt="
1. TASK: Conduct a systematic literature review for the research topic '{topic}'.
2. EXPECTED OUTCOME: literature-review.md, source-table.md, contradictions-map.md at {TOPIC_DIR}/01-background/

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, context7_query-docs (if tech topic), read, write

4. MUST DO — Scientific Literature Review Methodology:

   STEP 1 — Search Strategy:
   - Construct 3-5 distinct search queries using Boolean operators
   - Example: '(concept_A OR synonym) AND (concept_B) NOT (irrelevant)'
   - Search across multiple angles: academic, industry, practical, theoretical
   - Minimum 10 search queries total
   
   STEP 2 — Source Collection & Screening:
   - For each search result, evaluate against inclusion/exclusion criteria
   - Rate each source by evidence level using this hierarchy:
     Level 1 — Systematic review / meta-analysis (strongest)
     Level 2 — Peer-reviewed empirical study (RCT, cohort, controlled)
     Level 3 — Industry report / official documentation / technical specification
     Level 4 — Expert analysis / practitioner guide / book
     Level 5 — Blog post / opinion / anecdotal (weakest, use with caution)
   - Flag the source type for every entry
   
   STEP 3 — Snowballing:
   - For each high-quality source found, check its references (backward snowballing)
   - Search for papers that cite it (forward snowballing)
   - Aim to find 30-50% additional sources this way
   
   STEP 4 — Contradiction Mapping:
   - Explicitly identify where sources disagree
   - For each contradiction: what do they disagree about? How strong is each side?
   - This is the KEY output — gaps for hypothesis generation come from contradictions, not absences
   
   STEP 5 — Write Files:
   
   4a) literature-review.md:
   # Literature Review: {topic}
   
   ## Search Strategy
   | Query | Database | Results | Screened | Included |
   |-------|----------|---------|----------|----------|
   | ... | ... | ... | ... | ... |
   
   ## PRISMA Flow
   Records identified → Duplicates removed → Screened → Full-text assessed → Included
   
   ## Thematic Synthesis
   ### Theme 1: {finding area}
   - What the evidence says
   - Level of consensus
   - Key sources
   
   ### Theme 2: ...
   
   ## Gaps & Contradictions
   - Contradiction 1: [Source A says X] vs [Source B says not-X]
   - Gap 1: [Specific question no source addresses]
   
   4b) source-table.md:
   | Source | Type | Evidence Level | Key Claim | Limitation |
   |--------|------|---------------|-----------|------------|
   | [link] | academic | 2 | X causes Y | Small sample |
   
   4c) contradictions-map.md:
   # Contradictions Map
   
   ## Contradiction 1: {topic}
   - **Claim A**: {what side A says} [sources]
   - **Claim B**: {what side B says} [sources]
   - **Root of disagreement**: {methodological difference / different context / etc.}
   - **Resolution needed**: {what kind of study would resolve this}
   - **Current balance**: {which side has stronger evidence, and why}

5. MUST NOT DO:
   - Do NOT suppress contradictions to make the review seem cleaner
   - Do NOT include sources you haven't actually read and evaluated
   - Do NOT stop at surface-level search — snowball and deep-search
   - Do NOT present opinion as fact — label evidence levels clearly
   - Do NOT omit source limitations — every source has them, report them

6. CONTEXT:
   - Topic: {topic}
   - Research directory: {TOPIC_DIR}/
   - Current date: {CURRENT_DATE}
")
```

After completion, verify: literature-review.md, source-table.md, and contradictions-map.md all exist with proper structure.

---

## Phase 2: HYPOTHESIS FORMATION

**Goal**: Generate falsifiable hypotheses from the contradictions and gaps identified in Phase 1.

**CRITICAL**: Hypothesis generation and hypothesis testing use DIFFERENT subagents. The generator proposes. The evaluator challenges. This prevents confirmation bias.

```typescript
task(category="deep", run_in_background=false, timeout=300000, prompt="
1. TASK: Generate falsifiable hypotheses from the gaps and contradictions identified in the literature review for topic '{topic}'.
2. EXPECTED OUTCOME: hypothesis-registry.md + individual hypothesis files at {TOPIC_DIR}/02-hypotheses/

3. REQUIRED TOOLS: read, write

4. MUST DO — Popperian Hypothesis Generation:

   STEP 1 — Read the contradictions-map.md and literature-review.md:
   - Identify each contradiction (sources that disagree)
   - Identify each gap (question no source addresses)
   - Hypotheses come from THESE, not from brainstorming
   
   STEP 2 — For each contradiction/gap, formulate a hypothesis:
   
   A hypothesis MUST have:
   - A precise, falsifiable claim: 'X produces Y under conditions Z'
   - A null form: 'X has no effect on Y under conditions Z'
   - An explicit falsification criterion: 'This hypothesis would be disproven if [specific observation]'
   - A prediction of what MUST be observed if the hypothesis is true
   
   STEP 3 — For each hypothesis, generate the counter-position:
   - What would have to be true for the OPPOSITE claim to hold?
   - If the hypothesis is wrong, what is the most likely alternative?
   
   STEP 4 — Write the hypothesis-registry.md:
   
   # Hypothesis Registry
   
   ## Hypothesis 1: {claim}
   - **Status**: Active / Falsified / Unverified
   - **Source contradiction**: {which contradiction from Phase 1 it addresses}
   - **Claim**: X produces Y under Z
   - **Null**: X has no effect on Y under Z
   - **Falsification criterion**: Would be disproven by [specific observation]
   - **Alternative**: If false, most likely alternative is [alternative claim]
   - **Priority**: High / Medium / Low (based on impact + testability)
   
   ## Hypothesis 2: ...
   
   STEP 5 — Write individual hypothesis files (H1-{slug}.md, H2-{slug}.md):
   
   # H1: {claim}
   
   ## Claim
   Exact, falsifiable statement.
   
   ## Origin
   Which contradiction or gap this hypothesis addresses.
   
   ## Falsification Criteria
   This hypothesis would be disproven if [specific, observable condition].
   
   ## Predictions
   If true, we MUST observe: [list of predictions]
   
   ## Alternative Explanations
   - Alt 1: {explanation} — {how to distinguish from main hypothesis}
   - Alt 2: {explanation} — {how to distinguish}
   
   ## Priority
   High / Medium / Low
   
   ## Status
   Active (awaiting evidence gathering)

5. MUST NOT DO:
   - Do NOT generate hypotheses from 'brainstorming' — only from identified gaps/contradictions
   - Do NOT skip the falsification criterion — every hypothesis MUST state what would disprove it
   - Do NOT make vague claims — 'X affects Y' is not falsifiable. 'X increases Y by Z% under conditions W' is.
   - Do NOT forget to specify alternative explanations — a hypothesis without alternatives is incomplete
   - Do NOT generate more than 5 hypotheses per research cycle — prioritization is essential

6. CONTEXT:
   - Topic: {topic}
   - Background directory: {TOPIC_DIR}/01-background/
   - Hypotheses directory: {TOPIC_DIR}/02-hypotheses/
")
```

After completion, verify: hypothesis-registry.md with 2-5 hypotheses, each with explicit falsification criteria.

---

## Phase 3: EVIDENCE GATHERING

**CRITICAL**: This phase uses TWO opposing subagents in parallel:
- **Confirmation Agent**: Finds evidence that SUPPORTS each hypothesis
- **Falsification Agent** (Devil's Advocate): Finds evidence that CONTRADICTS each hypothesis

The falsification agent gets EQUAL resources. This is non-negotiable.

```typescript
// LAUNCH BOTH IN PARALLEL
task(category="deep", run_in_background=true, timeout=300000, prompt="
1. TASK: Find SUPPORTING evidence for the active hypotheses in topic '{topic}'.
2. EXPECTED OUTCOME: Evidence files in {TOPIC_DIR}/03-evidence/supporting/

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, context7_query-docs, read, write

4. MUST DO:
   - Read the hypothesis-registry.md: {TOPIC_DIR}/02-hypotheses/hypothesis-registry.md
   - For EACH active hypothesis, search for evidence that SUPPORTS it
   - For each piece of evidence, record: source, claim, evidence level (1-5), confidence
   - Save each finding as a separate note in supporting/ with full provenance
   - Update evidence-log.md with all findings

5. CONTEXT:
   - Topic: {topic}
   - Evidence directory: {TOPIC_DIR}/03-evidence/
   - Hypothesis registry: {TOPIC_DIR}/02-hypotheses/hypothesis-registry.md
")

task(category="deep", run_in_background=true, timeout=300000, prompt="
1. TASK: Find CONTRADICTING evidence for the active hypotheses in topic '{topic}'.
   You are the DEVIL'S ADVOCATE. Your ONLY job is to disprove the hypotheses.
2. EXPECTED OUTCOME: Evidence files in {TOPIC_DIR}/03-evidence/contradicting/

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, context7_query-docs, read, write

4. MUST DO — Falsification Protocol:
   - Read the hypothesis-registry.md: {TOPIC_DIR}/02-hypotheses/hypothesis-registry.md
   - For EACH active hypothesis, identify its falsification criterion
   - Search for evidence that MEETS the falsification criterion (would disprove the hypothesis)
   - If you find NO contradicting evidence after exhaustive search, state: 'Hypothesis survived falsification attempt — no contradicting evidence found after [N] searches'
   - For each finding: record source, claim, evidence level, HOW it contradicts the hypothesis
   - Rate the falsification strength:
     * Strongly falsified: Multiple independent sources meet the falsification criterion
     * Provisionally falsified: One credible source meets the criterion
     * Not falsified: Exhaustive search found no contradicting evidence
     * Unfalsifiable: No possible observation could disprove (label as non-scientific)
   - Save each finding as a separate note in contradicting/ with full provenance
   - Update evidence-log.md with all findings

5. MUST NOT DO:
   - Do NOT search only superficially — the falsification search must be AS THOROUGH as the supporting search
   - Do NOT dismiss contradicting evidence as 'low quality' unless it genuinely is (apply same standards)
   - Do NOT give up after 1 negative result — search multiple angles
   - Do NOT label a hypothesis as 'not falsified' after only 1-2 searches — minimum 5 search queries per hypothesis
   - Do NOT ignore the falsification criterion — you are testing the specific criterion, not vaguely 'disproving'

6. CONTEXT:
   - Topic: {topic}
   - Evidence directory: {TOPIC_DIR}/03-evidence/
   - Hypothesis registry: {TOPIC_DIR}/02-hypotheses/hypothesis-registry.md
")
```

After BOTH complete, merge results:

```bash
# Update hypothesis-registry.md with findings from both agents
# For each hypothesis:
#   If contradicting evidence found matching the falsification criterion → Status: Falsified
#   If supporting evidence found AND no contradicting evidence → Status: Corroborated
#   If both found → Status: Contested (research unresolved, flag for synthesis)
```

---

## Phase 4: SYNTHESIS

**Goal**: Produce structured conclusions from all evidence.

```typescript
task(category="deep", run_in_background=false, timeout=300000, prompt="
1. TASK: Synthesize all evidence for topic '{topic}' into structured conclusions.
2. EXPECTED OUTCOME: findings.md, conclusions.md, open-questions.md, recommendations.md at {TOPIC_DIR}/04-synthesis/

3. REQUIRED TOOLS: read, write

4. MUST DO — Scientific Synthesis:

   STEP 1 — Read ALL evidence:
   - Read hypothesis-registry.md
   - Read ALL supporting evidence files
   - Read ALL contradicting evidence files
   - Read evidence-log.md
   
   STEP 2 — For each hypothesis, determine status:
   - **Falsified**: Contradicting evidence matched the falsification criterion
   - **Corroborated**: Survived falsification attempts + supporting evidence exists
   - **Contested**: Both supporting and contradicting evidence exist, unresolved
   - **Inconclusive**: Insufficient evidence either way
   
   STEP 3 — Write findings.md:
   
   # Findings: {topic}
   
   ## Finding 1: {claim}
   - **Confidence**: [numerical range, e.g., 70-85%]
   - **Evidence strength**: [GRADE level + study count]
   - **Key sources**: [links]
   - **Remaining uncertainty**: [what we still don't know]
   - **Alternative explanations not ruled out**: [list]
   - **Would be overturned by**: [specific future evidence]
   
   ## Finding 2: ...
   
   Every finding MUST include ALL fields above. No exceptions.
   
   STEP 4 — Write conclusions.md:
   
   # Conclusions
   
   ## What We Established (Highest Confidence)
   1. {finding} — {confidence range}
   
   ## What Remains Contested
   1. {issue} — supporting evidence suggests X, contradicting evidence suggests Y
   
   ## What We Don't Know
   1. {open question} — what specific evidence is needed
   
   STEP 5 — Write open-questions.md:
   
   # Open Questions
   
   Each question MUST be:
   - Specific (not 'more research needed')
   - Falsifiable (what evidence would answer it)
   - Actionable (what kind of study/experiment would resolve it)
   
   | Question | Why It Matters | What Evidence Would Answer It | Priority |
   |----------|---------------|------------------------------|----------|
   | ... | ... | ... | ... |
   
   STEP 6 — Write recommendations.md:
   
   # Recommendations
   
   Based on the findings, what should the user DO with this information?
   - Practical implications for their context
   - What they can rely on (high confidence findings)
   - What they should be cautious about (contested findings)
   - What they should investigate further (open questions)

5. MUST NOT DO:
   - Do NOT present supporting evidence without also presenting contradicting evidence
   - Do NOT use vague confidence language — use numerical ranges
   - Do NOT skip alternative explanations — every finding must address them
   - Do NOT present the synthesis as final truth — label confidence clearly
   - Do NOT generate open questions that are just 'more research needed' — be specific

6. CONTEXT:
   - Topic: {topic}
   - Background: {TOPIC_DIR}/01-background/
   - Hypotheses: {TOPIC_DIR}/02-hypotheses/
   - Evidence: {TOPIC_DIR}/03-evidence/
   - Synthesis output: {TOPIC_DIR}/04-synthesis/
")
```

---

## Phase 5: ITERATION LOGGING & STATUS UPDATE

After ALL phases complete:

### 5.1 Write Iteration Log

```bash
ITER_NUM=$(ls "$TOPIC_DIR/05-iterations/" | grep -c "iteration-" || echo 0)
ITER_NUM=$((ITER_NUM + 1))
```

Write `{TOPIC_DIR}/05-iterations/iteration-{ITER_NUM}.md`:

```markdown
# Iteration {ITER_NUM}

## Research Question
{original question}

## Date
{CURRENT_DATE}

## Actions Taken
- Phase 1: Background & literature review
  - N searches executed
  - M sources collected and evaluated
  - X contradictions identified
- Phase 2: Hypothesis formation
  - Y hypotheses generated from contradictions
- Phase 3: Evidence gathering
  - Z supporting evidence files created
  - W contradicting evidence files created
  - H hypotheses falsified
  - C hypotheses corroborated
- Phase 4: Synthesis
  - Findings written with confidence levels
  - Open questions documented

## Key Decisions
| Decision | Rationale |
|----------|-----------|
| {decision} | {why} |

## Results
- **Hypotheses falsified**: {count}
- **Hypotheses corroborated**: {count}
- **Contested**: {count}
- **Inconclusive**: {count}
- **Overall confidence**: {range}

## What Was Learned
{Key insight from this iteration}

## Next Steps / Open Paths
{Natural next questions or directions}
```

### 5.2 Update Iterator Log

Append to `{TOPIC_DIR}/05-iterations/iterator-log.md`:

```markdown
| # | Date | Question | Approach | Key Result | Evidence |
|---|------|----------|----------|------------|----------|
| {N} | {date} | {question} | {approach summary} | {result} | iteration-{N}.md |
```

### 5.3 Update STATUS.md

```markdown
# Research Status: {topic}

**Status:** ✅ Complete | **Confidence:** {overall range}
**Last Activity:** {date}

## Phase Summary
| Phase | Status | Output |
|-------|--------|--------|
| 1. Literature Review | ✅ Complete | N sources, M contradictions |
| 2. Hypothesis Formation | ✅ Complete | H hypotheses |
| 3. Evidence Gathering | ✅ Complete | S supporting, C contradicting |
| 4. Synthesis | ✅ Complete | Findings with confidence levels |

## Quick Links
- [Findings](04-synthesis/findings.md)
- [Conclusions](04-synthesis/conclusions.md)
- [Open Questions](04-synthesis/open-questions.md)
- [All Evidence](03-evidence/evidence-log.md)

## To Continue
Run: `/omnilearn-research --continue {topic-slug}`
Or: `/omnilearn-research dig deeper on {specific-angle} from {topic}`
```

### 5.4 Update Research INDEX.md

Add or update entry in `{RESEARCH_DIR}/INDEX.md`:

```markdown
## Active Research

### {topic} ({date})
{one-line summary}
- Confidence: {range}
- Key finding: {brief}
- [Open in research dir]({TOPIC_DIR}/)
```

---

## FOLLOW-UP SYSTEM

When user says `dig deeper on Y from X`:

### 1. Locate the Context

```bash
# Search existing research for the reference
grep -ri "{reference}" "$TOPIC_DIR/" --include="*.md" | head -20
# Read the relevant section to understand context
```

### 2. Create Follow-up Folder

```bash
mkdir -p "$TOPIC_DIR/follow-ups/01-{specific-angle}/"
```

### 3. Anchor Context

Write `CONTEXT.md` — copy the relevant section from the parent research so this follow-up is self-contained:

```markdown
# Context: {specific-angle}

This follow-up was triggered by: {user's question}

## What the Parent Research Established
{Copy of relevant section from findings.md}

## What We're Extending
{Specific aspect we're investigating further}
```

### 4. Run Research

Run the same 4-phase engine (Phases 1-4) but scoped to the specific angle, using the CONTEXT.md as the starting point rather than starting from scratch.

### 5. Link Back

Update the parent `topic-index.md`:

```markdown
## Follow-ups
- [{specific-angle}](follow-ups/01-{specific-angle}/) — {brief description}
```

---

## ANTI-PATTERN GUARDS (Loop Prevention)

### Guard 1: Iterator Log Check (Before EVERY action)

Before starting ANY research action, the agent MUST:

```bash
# Check if this question + approach combination has been tried before
ITER_LOG="$TOPIC_DIR/05-iterations/iterator-log.md"
if [ -f "$ITER_LOG" ]; then
  # Hash the question + approach
  HASH=$(echo "$QUESTION $APPROACH" | md5sum | cut -d' ' -f1)
  if grep -q "$HASH" "$ITER_LOG" 2>/dev/null; then
    echo "⚠️  This question + approach combination has been tried before."
    echo "See iteration entry in $ITER_LOG for previous results."
    echo "Either: (a) adjust the approach, or (b) ask the user if they want to retry."
    # If same approach was tried 2x without progress → force pivot
  fi
fi
```

### Guard 2: Falsification Gate

Every hypothesis MUST have its falsification criterion checked before it can be marked as "corroborated":

```bash
# Check if falsification was attempted for each hypothesis
HYP_DIR="$TOPIC_DIR/02-hypotheses/"
EVID_DIR="$TOPIC_DIR/03-evidence/contradicting/"

for hyp in "$HYP_DIR"/H*.md; do
  HYP_NAME=$(basename "$hyp" .md)
  # Check if any contradicting evidence file references this hypothesis
  if ! grep -r -l "$HYP_NAME" "$EVID_DIR" > /dev/null 2>&1; then
    echo "⚠️  Hypothesis $HYP_NAME has no falsification attempt recorded."
    echo "Phase 3 falsification agent may not have run for this hypothesis."
    echo "Do NOT mark as corroborated until falsification is attempted."
  fi
done
```

### Guard 3: Source Verification

Every citation MUST be verified before inclusion:

```bash
# Verify each source is real and accessible
# If a source URL is suspected to be hallucinated, flag it
```

### Guard 4: Topic Drift Detection

```bash
# Periodically check that current research direction matches original question
# Read the original question from topic-index.md
# Compare with current focus
# If they diverge significantly, re-anchor
```

---

## QUALITY GATES

| Check | Phase | Action if Failed |
|-------|-------|-----------------|
| literature-review.md exists with PRISMA flow | 1 | Re-run Phase 1 with explicit PRISMA instructions |
| source-table.md with evidence levels for every source | 1 | Re-run Phase 1 — every source must be graded |
| contradictions-map.md identifies at least 2 contradictions | 1 | Re-run Phase 1 — finding contradictions is the goal |
| hypothesis-registry.md with 2-5 falsifiable hypotheses | 2 | Each hypothesis must have falsification criterion |
| Every hypothesis has explicit falsification criterion | 2 | Add: 'This hypothesis would be disproven by [X]' |
| supporting/ AND contradicting/ evidence directories exist | 3 | Both must exist — falsification is mandatory |
| Falsification agent ran for EVERY hypothesis | 3 | Check evidence-log for hypothesis coverage |
| Every finding has confidence range (not vague language) | 4 | Add numerical range — no 'some evidence suggests' |
| Every finding lists alternative explanations not ruled out | 4 | Add at least 1 alternative per finding |
| open-questions.md has specific, actionable questions | 4 | Rewrite — 'more research needed' is not acceptable |
| iteration-{N}.md written for this run | 5 | Write now — this enables loop prevention |
| iterator-log.md updated with this run's hash | 5 | Update now — prevents future agents from repeating |
| INDEX.md updated at research root | 5 | Update now — keeps the MOC current |

---

## What This System Does NOT Do

- ❌ Does NOT produce agreeable summaries — it seeks contradiction
- ❌ Does NOT pretend all findings are equally confident — it calibrates
- ❌ Does NOT suppress uncertainty — it highlights it
- ❌ Does NOT repeat failed approaches — the iterator log prevents this
- ❌ Does NOT let one agent do both hypothesis generation AND testing — they are separate
- ❌ Does NOT present opinion as evidence — every claim has a source + level
- ❌ Does NOT answer unanswerable questions — it identifies what's unknowable

---

## Error Recovery

| Situation | Action |
|-----------|--------|
| No contradictions found in literature | Search more broadly — contradictions ALWAYS exist in real research. If truly none found, the topic may be settled or the research is too shallow. |
| Falsification agent found nothing | Mark as 'Not Falsified After Exhaustive Search' — but document search depth (how many queries, which sources). |
| Supporting and contradicting evidence equally strong | Flag as 'Contested — unresolved.' Present both sides in synthesis. Do NOT force a conclusion. |
| User asks a follow-up on non-existent section | Search INDEX.md for similar topics. If truly not found, acknowledge the gap and start fresh research. |
| Same iteration hash detected | Block execution. Tell user: 'This exact question+approach was tried before with [result]. Try a different angle or confirm you want to retry.' |
| Source verification finds hallucinated citations | Remove the citation. Add a note: 'Removed — source could not be verified.' Re-run the search that produced it. |
| Research drifts off-topic | Re-anchor: re-read the original question from topic-index.md. If drift is >50%, restart Phase 1. |
