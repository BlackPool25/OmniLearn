---
name: omnilearn-research
description: >-
  Multi-agent deep research with adaptive methodology routing (Popperian severe testing, PRISMA 2020 systematic, PRISMA-ScR scoping, Design Science) + GRADE + adversarial verification. Use for research paper, gap analysis, project ideation, deep analysis, systematic review. Triggers "/omnilearn-research", "research", "gap analysis", "literature review", "project ideation", "deep research".
version: 2.1.0
last-verified: 2026-09-02
---

# /omnilearn-research — Deep Research Engine (Adaptive v2.1)

## Usage

```
/omnilearn-research What are the compression bottlenecks in modern backend APIs?
/omnilearn-research How does Postgres handle concurrent transactions under SSI?
/omnilearn-research Find design patterns for fault-tolerant message queues
/omnilearn-research --continue compression-bottlenecks
/omnilearn-research dig deeper on the expand-contract pattern from CI/CD research
/omnilearn-research --mode=dsr Design a CRDT-backed queue with bounded staleness under partition
/omnilearn-research --mode=scoping Map gaps in CRDT convergence-latency literature
/omnilearn-research --list
```

## Quick Start

To run research, invoke `/omnilearn-research "<question>"` with an optional `--mode` flag. To continue, use `--continue <slug>`. To map or design, set `--mode=scoping|dsr` or let the Phase 0.5 router infer it.

```bash
/omnilearn-research "Does Brotli reduce p99 latency vs gzip for JSON <10KB at 500-1000 rps?"
/omnilearn-research --mode=scoping "What is missing in WASM-edge compression research?"
/omnilearn-research --mode=dsr "Viable 8-week compression projects for a 3-person team"
```

## Current Date Context

- Treat **2026-09-02** as the recency anchor for every search.
- Apply the recency dual tranche: foundational (seminal, any year) + recent (2024-2026 prioritized, date-filtered per query).
- Record `year` per source in `source-table.md` and flag `recency: foundational | recent | dated`.

## MCP Semantics

- Use `context7_query-docs` to resolve official documentation for libraries, frameworks, and APIs encountered in the evidence base.
- Use `searxng_academic_search` (OpenAlex / arXiv / PubMed via S2) for academic databases — not `google_search` alone.
- Use `google_search` / `websearch_web_search_exa` for industry/practical and grey-literature tranche.

## Core Research Philosophy

This system follows **adaptive methodology routing** — select the method whose entry conditions match the question, then enforce that method's contract. Popperian falsification is one route, not the only route.

### Research Principles

| Principle | What It Means |
|-----------|---------------|
| **Falsification over confirmation (Popperian route)** | Every hypothesis specifies what would disprove it under a severity budget; the falsification agent searches with equal resources to meet that criterion. |
| **Systematic review (PRISMA route)** | Follow PRISMA 2020 with pre-registered protocol, search-log.csv, screening-log.csv, PRISMA flow with counts, and a 27-item checklist — not a flow line. |
| **Multi-agent adversarial process** | Hypothesis generation and testing run in DIFFERENT subagents with opposing goals and file-per-agent logs merged by the lead. |
| **Confidence calibration (IPCC)** | Report calibrated language (very low → very high) + likelihood % + prediction interval alongside confidence interval; include a traceable account showing GRADE → confidence. |
| **Explicit uncertainty** | Every conclusion includes: what remains unknown, alternative explanations not ruled out, and what evidence would overturn it. |
| **Loop prevention** | Before every research action, check the iterator log and saturation log. Never repeat the same failed approach. |

To verify philosophy selection, proceed to Phase 0.5 before any literature work.

---

## Directory Structure

```
{learningDirectory}/.omnilearn/research/
├── INDEX.md                              ← MOC: map of ALL research topics (updated after every phase)
├── <research-topic>/                     ← e.g., "compression-backend-bottlenecks"
│   ├── topic-index.md                    ← MOC for this topic: status, key findings, iterator log
│   ├── STATUS.md                         ← Human-readable progress: current phase, what's happening
│   ├── progress.json                     ← Machine-readable progress (agent reads this on resume)
│   ├── STATE.json                        ← Canonical machine state (generates STATUS.md + INDEX.md views)
│   │
│   ├── 00-abstract.md                    ← Structured abstract (Background/Methods/Results/Conclusions)
│   ├── 01-background/
│   │   ├── protocol.md                   ← Pre-registered protocol (PICOS/PEO, databases, strings, I/E, screening plan)
│   │   ├── search-log.csv                ← 16-col PRISMA-S log: query, DB, date, hits, filters
│   │   ├── screening-log.csv             ← Include/exclude decisions with reasons
│   │   ├── excluded-sources.md           ← Excluded studies with reason per PRISMA 16b
│   │   ├── prisma-flow.md               ← PRISMA 2020 4-phase flow with counts derived from logs
│   │   ├── PRISMA-checklist.md          ← 27-item checklist with file:line pointers (see references/research-templates/PRISMA-2020-checklist.md)
│   │   ├── literature-review.md          ← Thematic synthesis with PRISMA flow + search-strategy table
│   │   ├── source-table.md              ← All sources with GRADE evidence rating + year + recency + artifact link
│   │   ├── bias-assessment.md           ← RoB per source + publication-bias check
│   │   ├── gap-map.md                   ← Robinson 7 gaps + Reasons A-D + Petersen heatmap (see references/research-templates/gap-taxonomy.md)
│   │   ├── gap-heatmap.csv              ← Facet × evidence-level heatmap (Petersen SMS)
│   │   └── contradictions-map.md        ← Contradictory cluster (Gap type 3 subset)
│   │
│   ├── 02-hypotheses/
│   │   ├── hypothesis-registry.md       ← All hypotheses with status + severity + Ioannidis/FAF flags
│   │   ├── hypothesis-registry.lock.json← Append-only hash + timestamp (pre-reg lock)
│   │   ├── H1-<claim>.md               ← Atomic hypothesis: claim, falsification criteria, severity, predictions
│   │   └── H2-<claim>.md
│   │   ├── RQ1-<question>.md            ← (scoping/exploratory route) Research question files
│   │   └── candidate-designs.md         ← (DSR route) 3-5 designs with evaluation plan
│   │
│   ├── 03-evidence/
│   │   ├── evidence-log-supporting.md   ← Supporting agent's per-query log (file-per-agent)
│   │   ├── evidence-log-contradicting.md← Falsification agent's per-query log (file-per-agent)
│   │   ├── evidence-log.md              ← Lead-merged canonical log (deduped)
│   │   ├── citation-audit.md            ← curl -I + hash + Wayback + Crossref + ≥10% spot-check
│   │   ├── predictions-log.md           ← Calibration: forecast → outcome for Brier scoring
│   │   ├── supporting/                  ← Evidence that corroborates (with source links)
│   │   └── contradicting/              ← Evidence that challenges (falsification attempts)
│   │
│   ├── 04-synthesis/
│   │   ├── findings.md                  ← What we established (structured per finding)
│   │   ├── SoF-{outcome}.md            ← GRADE Summary of Findings per outcome (see references/research-templates/GRADE-SoF-template.md)
│   │   ├── conclusions.md               ← What we conclude + confidence levels + hedging by section
│   │   ├── discussion.md                ← Interpretation + limitations + generalizability (IMRaD Discussion)
│   │   ├── open-questions.md            ← What remains unknown (specific, falsifiable)
│   │   ├── recommendations.md           ← Practical implications + GRADE EtD
│   │   ├── related-work.md              ← Coded dimension table (IMRaD Related Work)
│   │   ├── method.md                    ← Protocol + threats to validity (IMRaD Methods)
│   │   ├── contribution-matrix.md       ← Contribution vs prior work (IMRaD declaration)
│   │   ├── options-matrix.md            ← (DSR route) Double Diamond → SCAMPER/MA/TRIZ → Opportunity Map + 3D feasibility
│   │   └── saturation-log.md            ← Queries executed, new sources/themes per query, stopping rule
│   │
│   ├── 05-iterations/                   ← LOOP PREVENTION: every run logged here
│   │   ├── iterator-log.md             ← Global index: hash | question | mode | approach | result | file
│   │   ├── iteration-001.md            ← Full run log: actions, decisions, results
│   │   └── iteration-002.md
│   │
│   ├── follow-ups/                      ← Extensions from user questions
│   │   ├── 01-<user-question>/
│   │   │   ├── CONTEXT.md              ← Copy of relevant section + source: findings.md#L<range> @ <commit>
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

Progressive disclosure — heavy templates live in `references/research-templates/` and are linked, not inlined:

- GRADE SoF: `references/research-templates/GRADE-SoF-template.md`
- PRISMA 2020 checklist: `references/research-templates/PRISMA-2020-checklist.md`
- SIFT + AACODS + 5Q script: `references/research-templates/SIFT-lateral-reading-script.md`
- Gap taxonomy: `references/research-templates/gap-taxonomy.md`

---

## Mandatory Tools

| Tool | When | Why |
|------|------|-----|
| `team_create({ inline_spec })` | Phase 1 (literature review) and Phase 3 (evidence gathering) | Parallel independent research angles and the **adversarial confirmation/falsification pair** run as team members |
| `team_task_create` / `team_task_update` / `team_task_list` | Phase 1 + Phase 3 | Track each member's deliverable; use `blockedBy` for member dependencies (e.g., synthesis member waits for review members) |
| `team_send_message` | Phase 1 + Phase 3 | Dispatch members, collect completion reports |
| `team_shutdown_request` / `team_approve_shutdown` / `team_delete` | After Phase 1 and Phase 3 | **Closure Contract** — close each team once its tasks are terminal |
| `task(category="deep", run_in_background=false)` | Phase 2 (hypothesis) + Phase 4 (synthesis) | Serial single-deliverable phases with no parallelism |
| `task(subagent_type="explore", background)` | Discovery | Find existing research, check iterator log |
| `google_search` / `websearch_web_search_exa` | Industry/practical + grey lit | Web-biased tranche — complement with academic DBs |
| `searxng_academic_search` | Academic tranche — every Phase 1 + Phase 3 | OpenAlex / arXiv / PubMed via S2 — required for ≥3 DBs (PRISMA item 6) |
| `context7_query-docs` | Tech topics | Official documentation for libraries/frameworks |
| `read`, `write`, `edit`, `bash`, `grep`, `glob` | Every phase | File operations |
| `question` tool | User interaction | Present findings, ask for direction |

To select databases, consult `protocol.md` information-sources table (PRISMA item 6) — it MUST list ≥3 databases: OpenAlex, arXiv, PubMed (or Scopus/S2) + web tranche.

## TEAM ORCHESTRATION (Phase 1 + Phase 3)

**Any phase with 2+ independent research agents runs as a TEAM, not as individual `task()` calls.** Teams are ephemeral:

1. **Create the team** with an inline spec — members are category-routed workers whose prompts are fully self-contained (read context → research → write deliverable files → report to lead via `team_send_message`). Max 8 members, max 4 parallel workers.
2. **Register tracking tasks**: `team_task_create` one per deliverable. For member dependencies, use `blockedBy` (e.g., a merge member's task `blockedBy` the review members' task IDs — it starts only after they complete). Then `team_send_message` each member: claim task (`team_task_update` → `in_progress`), execute, mark `completed`, report summary.
3. **Wait for completion** — `team_task_list` until every task is terminal. Members run in parallel; do NOT poll.
4. **Closure Contract (MANDATORY, same turn as completion)**: once every task is `completed`/`failed`, shut down each active member (`team_shutdown_request` → `team_approve_shutdown`) and `team_delete`. If delete says "members still active", re-run `team_status` once, then retry.
5. **Fallback**: if `team_*` tools are unavailable, fall back to `task(category="deep", run_in_background=true/false)` with the same member prompts.
6. **Do NOT use teams for serial single-deliverable phases** (Phase 2 hypothesis formation, Phase 4 synthesis) — individual `deep` delegates are correct there.

---

## Phase 0: INTENT GATE — Parse & Validate

### 0.1 Parse Input

To classify the request, extract the research question and flags:

| Input Pattern | Action |
|---------------|--------|
| `/omnilearn-research What is X?` | New research on X |
| `/omnilearn-research --continue <topic>` | Resume existing research on topic |
| `/omnilearn-research dig deeper on Y from Z` | Follow-up on existing research |
| `/omnilearn-research --mode=popperian\|scoping\|exploratory\|dsr What is X?` | New research with explicit route |
| `/omnilearn-research --list` | List all research topics with status |

To handle `--list`, run:

```bash
ls -1d "$RESEARCH_DIR"/*/ 2>/dev/null | xargs -n1 basename 2>/dev/null | sort
# If empty: echo "No research topics yet."
```

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

# Derive slug (hash-prefixed to avoid collision)
TOPIC_SLUG_HASH=$(echo -n "$USER_QUESTION" | sha256sum | cut -c1-8)
TOPIC_SLUG_BASE=$(echo "$USER_QUESTION" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]\+/-/g' | sed 's/^-//;s/-$//' | cut -c1-40)
TOPIC_SLUG="${TOPIC_SLUG_HASH}-${TOPIC_SLUG_BASE}"
TOPIC_DIR="$RESEARCH_DIR/$TOPIC_SLUG"

if [ -d "$TOPIC_DIR" ]; then
  question(questions=[{
    header: "Existing Research Found",
    question: "Research on '$TOPIC_SLUG' already exists. What to do?",
    options: [
      {label: "Continue existing", description: "Resume where progress.json left off"},
      {label: "Start fresh", description: "Archive previous to archives/<slug>-<timestamp> and start new"},
      {label: "Extend with new question", description: "Add a follow-up focused on a specific angle"},
    ]
  }])
  # Branch explicitly after question():
  # - Continue → read progress.json + STATE.json, resume at next incomplete phase
  # - Start fresh → mv "$TOPIC_DIR" "$RESEARCH_DIR/archives/${TOPIC_SLUG}-$(date +%s)"
  # - Extend → create follow-ups/01-<angle>/ with CONTEXT.md anchoring
fi
```

### 0.4 Generate the Topic Slug

To slugify, derive a filesystem-safe slug from the research question:

- Lowercase, replace spaces/special chars with hyphens
- Prefix with 8-char sha256 hash of the full question to avoid semantic collisions (e.g., "CRDT vs Raft" vs "Raft vs CRDT")
- Keep base under 40 chars, total under 60 (truncate base if longer)
- Example: "What are the compression bottlenecks in modern backend APIs?" → `a3f9c1d2-compression-bottlenecks-backend-apis`

---

## Phase 0.5: ADAPTIVE ROUTER — Methodology Selection

To route correctly, classify the request BEFORE any literature work. This phase fixes monotheism (P0-1).

### 0.5.1 Routing Table

| Goal | Maturity | Wants artifact? | Route | Entry conditions | Success criterion |
|------|----------|-----------------|-------|------------------|-------------------|
| Test a causal/empirical claim ("Does X cause Y under Z?") | Hypothesis exists | No (wants verdict) | **popperian** — severe testing | Falsifiable claim + risky prediction possible | Hypothesis survives severe falsification attempt |
| Map what is missing/weak | Field exists, gaps unknown | No (wants map) | **scoping** — PRISMA-ScR (Tricco 2018/JBI) | Broad field, heterogeneous evidence | Faceted gap-heatmap with sparse cells identified |
| Synthesize what is known (systematic) | Field mature, question narrow | No (wants synthesis) | **systematic** — PRISMA 2020 | Narrow PICOS, ≥3 DBs, pre-registered protocol | PRISMA flow + GRADE SoF per outcome |
| Explain how/why a mechanism works | Mechanism exists | No (wants model) | **exploratory** — Braun & Clarke thematic | Descriptive question, no causal test | Thematic model + assumptions + unknowns |
| Design/build a viable solution | Constraints known | Yes (wants design/RFC) | **dsr** — Hevner/Peffers DSR | Problem + constraints + evaluation plan | Options matrix + feasibility + RFC draft |

### 0.5.2 Pseudocode (deterministic)

```typescript
// To classify, infer goal, maturity, and artifact intent from the request.

type Route = "popperian" | "scoping" | "systematic" | "exploratory" | "dsr";

function route(request: string, explicitMode?: Route): Route {
  if (explicitMode) return explicitMode; // --mode flag wins

  const wantsArtifact = /design|build|prototype|roadmap|choose between|viable|feasible/i.test(request);
  const wantsMap      = /gap|missing|uncovered|unexplored|map the field|scoping/i.test(request);
  const wantsExplain  = /how does|how is|explain|mechanism|why does/i.test(request);
  const wantsTest     = /does .+ cause|is .+ better|under .+ condition|effect of/i.test(request);
  const wantsSystematic = /systematic review|PRISMA|GRADE/i.test(request);

  if (wantsArtifact) return "dsr";
  if (wantsMap) return "scoping";
  if (wantsSystematic) return "systematic";
  if (wantsTest) return "popperian";
  if (wantsExplain) return "exploratory";
  // Default: exploratory (safest — thematic synthesis without forced H-tests)
  return "exploratory";
}

// Record route in progress.json + STATE.json + iterator-log hash input
// progress.json: { route, routed_at: "2026-09-02", rationale: "..." }
```

### 0.5.3 Mode-Aware Cardinality & Gate Rules

To enforce mode-correct artifacts, apply:

- `popperian` → hypothesis-registry.md with 2-5 H-files, each with falsification criterion + severity + Ioannidis/FAF flags. Gate: ≥2 contradictions conditional (see 0.5.4).
- `systematic` → protocol.md + search-log.csv + screening-log.csv + PRISMA flow + SoF per outcome. No H-files required.
- `scoping` → gap-map.md (Robinson 7 gaps + Reasons A-D) + gap-heatmap.csv (Petersen SMS). No H-files required.
- `exploratory` → themes.md + model-candidates.md + assumptions.md (no H-files; RQs allowed: RQ1-*.md).
- `dsr` → candidate-designs.md + evaluation-plan.md → options-matrix.md + feasibility.md + rfc-draft.md (Double Diamond → SCAMPER/MA/TRIZ → Opportunity Map + 3D feasibility).

### 0.5.4 Conditional Contradiction Gate

To avoid perverse incentives on settled fields, make the contradiction requirement conditional:

```bash
# Gate: contradictions-map.md with ≥2 contradictions REQUIRED only when route == popperian
# For scoping/systematic: require ≥2 gap types documented OR ≥3 sparse heatmap cells
# For exploratory/dsr: require ≥2 themes OR ≥3 candidate designs — contradictions optional
if [ "$ROUTE" = "popperian" ]; then
  test $(grep -c "^## Contradiction" "$TOPIC_DIR/01-background/contradictions-map.md") -ge 2 || echo "FAIL: popperian requires ≥2 contradictions"
fi
```

---

## Phase 1: BACKGROUND & LITERATURE REVIEW

**Goal:** To systematically capture what exists, what is known, and where the voids lie — with reproducibility.

Run as a **research TEAM** (see TEAM ORCHESTRATION): three parallel angle reviewers (academic + industry + empirical), then a synthesis member that merges their angle reviews into the canonical files (its task is `blockedBy` the three review tasks).

```typescript
team_create({ inline_spec: {
  name: "<topic>-litreview",
  members: [
    // ANGLE REVIEWER 1: Academic / peer-reviewed sources
    { name: "academic-reviewer", category: "unspecified-high", prompt: `
1. TASK: To conduct the academic-angle literature review for topic '{topic}'. Cover the ACADEMIC/PEER-REVIEWED evidence base (papers, systematic reviews, meta-analyses, university material).

2. EXPECTED OUTCOME: 01-background/review-academic.md + 01-background/source-table-academic.md at {TOPIC_DIR}/01-background/

3. REQUIRED TOOLS: searxng_academic_search, google_search, websearch_web_search_exa, context7_query-docs, read, write, bash

4. MUST DO — Systematic Literature Review (academic angle):
   - **CURRENT DATE: {CURRENT_DATE}** — apply recency dual tranche (foundational + recent 2024-2026).
   - STEP 1 — Read protocol.md (PICOS/PEO, inclusion/exclusion, databases). If absent, draft it with the lead before searching.
   - STEP 2 — Search Strategy: to construct 3-5 distinct queries with Boolean operators for academic DBs (OpenAlex/arXiv/PubMed via searxng_academic_search); minimum 5 searches. Log each query in search-log.csv (16-col PRISMA-S: query, DB, date, hits, filters).
   - STEP 3 — Source Collection & Screening: to rate every source by evidence level (Level 1 systematic review/meta-analysis → Level 5 blog/opinion) + year + recency flag. Academic-angle sources skew to Levels 1-3.
   - STEP 4 — Snowballing: for each high-quality source, to check references (backward) and citations (forward) via OpenAlex/Semantic Scholar graph; log refs screened in search-log.csv; stop when saturation-log marginal gain < threshold (see 04-synthesis/saturation-log.md).
   - STEP 5 — SIFT + AACODS: to apply the 4 SIFT moves + 60s lateral reading per source + AACODS for grey literature + 5Q independence audit (see references/research-templates/SIFT-lateral-reading-script.md).
   - STEP 6 — For each source to record: source URL, type, evidence level, year, venue, key claim, limitation, artifact link, 5Q pass.
   - To write review-academic.md (thematic synthesis with levels of consensus) and source-table-academic.md (table with evidence ratings) to {TOPIC_DIR}/01-background/.
   - To append translation notes (if non-English source encountered: translate claim, log original + translator + confidence).

5. MUST NOT DO:
   - Do NOT suppress contradictions to make the review seem cleaner
   - Do NOT include sources not read and evaluated
   - Do NOT present opinion as fact — label evidence levels clearly
   - Do NOT cover the industry/empirical angles — that is a teammate's job

6. CONTEXT:
   - Topic: {topic}
   - Route: {route}
   - Background directory: {TOPIC_DIR}/01-background/
   - Current date: {CURRENT_DATE}
   - To claim the team task (team_task_update → in_progress, owner academic-reviewer) when starting, mark it completed when files are written, then report a short summary to the lead via team_send_message.
`},
    // ANGLE REVIEWER 2: Industry / practical sources
    { name: "industry-reviewer", category: "unspecified-high", prompt: `
1. TASK: To conduct the industry/practical-angle review for topic '{topic}'. Cover the industry evidence base (official documentation, technical specifications, practitioner guides, engineering reports, credible blogs).

2. EXPECTED OUTCOME: 01-background/review-industry.md + 01-background/source-table-industry.md at {TOPIC_DIR}/01-background/

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, searxng_academic_search, context7_query-docs, read, write, bash

4. MUST DO — Systematic Literature Review (industry angle):
   - **CURRENT DATE: {CURRENT_DATE}** — recency dual tranche.
   - STEP 1 — Read protocol.md; log queries in search-log.csv (16-col PRISMA-S).
   - STEP 2 — To construct 3-5 distinct queries with Boolean operators focused on industry/practical sources; minimum 5 searches.
   - STEP 3 — To rate every source by evidence level (Level 3 official documentation → Level 5 opinion) + year + recency flag. Industry-angle sources skew to Levels 3-5.
   - STEP 4 — Snowballing: to check what each high-quality source references; log in search-log.csv.
   - STEP 5 — SIFT + AACODS + 5Q per source (see SIFT template).
   - STEP 6 — For each source to record: source URL, type, evidence level, year, venue, key claim, limitation, artifact link, 5Q pass.
   - To write review-industry.md and source-table-industry.md to {TOPIC_DIR}/01-background/.

5. MUST NOT DO:
   - Do NOT suppress contradictions
   - Do NOT include sources not read and evaluated
   - Do NOT present opinion as fact — label evidence levels clearly
   - Do NOT cover the academic/empirical angles — that is a teammate's job

6. CONTEXT:
   - Topic: {topic}
   - Route: {route}
   - Background directory: {TOPIC_DIR}/01-background/
   - Current date: {CURRENT_DATE}
   - To claim the team task (team_task_update → in_progress, owner industry-reviewer) when starting, mark it completed when files are written, then report via team_send_message.
`},
    // ANGLE REVIEWER 3: Empirical / reproducibility sources
    { name: "empirical-reviewer", category: "unspecified-high", prompt: `
1. TASK: To conduct the empirical/reproducibility-angle review for topic '{topic}'. Cover benchmarks, artifacts, datasets, replication packages, and measurement harnesses.

2. EXPECTED OUTCOME: 01-background/review-empirical.md + 01-background/source-table-empirical.md at {TOPIC_DIR}/01-background/

3. REQUIRED TOOLS: google_search, websearch_web_search_exa, searxng_academic_search, context7_query-docs, read, write, bash

4. MUST DO — Empirical Angle:
   - **CURRENT DATE: {CURRENT_DATE}** — recency dual tranche.
   - STEP 1 — Read protocol.md; log queries in search-log.csv.
   - STEP 2 — To construct 3-5 queries targeting benchmarks, artifacts, datasets (e.g., "benchmark", "artifact evaluation", "reproducibility package", "dataset").
   - STEP 3 — For each source to record: URL, benchmark harness, dataset, artifact DOI/link, sample size, environment, key result, limitation, 5Q pass.
   - STEP 4 — SIFT + AACODS + 5Q per source.
   - To write review-empirical.md (what is empirically measured vs claimed) and source-table-empirical.md to {TOPIC_DIR}/01-background/.

5. MUST NOT DO:
   - Do NOT invent benchmark numbers — only report measured values with harness details
   - Do NOT cover academic/industry angles

6. CONTEXT:
   - Topic: {topic}
   - Route: {route}
   - Background directory: {TOPIC_DIR}/01-background/
   - Current date: {CURRENT_DATE}
   - To claim the team task (team_task_update → in_progress, owner empirical-reviewer) when starting, mark it completed when files are written, then report via team_send_message.
`},
    // SYNTHESIS/MERGE member: blocked by the three reviewers
    { name: "synthesis-merger", category: "unspecified-high", prompt: `
1. TASK: To merge the three angle literature reviews (academic + industry + empirical) for topic '{topic}' into the canonical review files.

2. EXPECTED OUTCOME (all in {TOPIC_DIR}/01-background/):
   - literature-review.md — merged canonical review with PRISMA flow, search-strategy table, thematic synthesis across ALL angles, and a Gaps & Contradictions section
   - source-table.md — merged source table (all sources from angle tables, deduplicated) with evidence levels + year + recency + artifact link
   - gap-map.md — Robinson 7 gaps + Reasons A-D + Petersen heatmap (see references/research-templates/gap-taxonomy.md)
   - gap-heatmap.csv — facet × evidence-level heatmap
   - contradictions-map.md — contradictory cluster (Gap type 3 subset) with claim A vs B, sources, root, resolution needed, strength per side
   - bias-assessment.md — RoB per source + publication-bias check
   - prisma-flow.md — 4-phase PRISMA 2020 flow with counts derived from search-log.csv + screening-log.csv (not invented)
   - PRISMA-checklist.md — 27-item checklist with file:line pointers
   - search-log.csv — merged canonical 16-col PRISMA-S log
   - screening-log.csv — merged include/exclude with reasons

3. REQUIRED TOOLS: read, write

4. MUST DO:
   - To wait until ALL three angle reviews exist (task is blocked on theirs).
   - To read: {TOPIC_DIR}/01-background/review-academic.md, review-industry.md, review-empirical.md, source-table-*.md
   - STEP 1 — Merge: to combine angle syntheses into literature-review.md; keep the search-strategy table and derive PRISMA flow counts from logs (records identified → screened → eligibility → included) with exclusion-reason counts.
   - STEP 2 — Gap mapping: to classify every gap under Robinson 7 types + Reasons A-D; produce heatmap; route via Petersen SMS fork (see gap-taxonomy template).
   - STEP 3 — Contradiction mapping (subset of gap type 3): to explicitly identify where sources disagree; for each: what, how strong per side (evidence-level weighted), adjudication note (how to resolve).
   - STEP 4 — To complete PRISMA-checklist.md (27 items) and verify search-log.csv has ≥3 DBs, dates, full strings (PRESS-ready).
   - STEP 5 — To write all 10 canonical files listed above.

5. MUST NOT DO:
   - Do NOT invent sources — only merge what the angle reviewers found
   - Do NOT suppress contradictions or gaps to make the review seem cleaner
   - Do NOT invent PRISMA flow numbers — derive from logs

6. CONTEXT:
   - Topic: {topic}
   - Route: {route}
   - Background directory: {TOPIC_DIR}/01-background/
   - Current date: {CURRENT_DATE}
   - To claim the team task (team_task_update → in_progress, owner synthesis-merger) when starting, mark it completed when files are written, then report via team_send_message.
`}
  ]
}})
```

**Register tasks (note the dependency):**

```typescript
task_academic  = team_task_create(teamRunId, subject: "Literature review — academic angle", description: "{TOPIC_DIR}/01-background/review-academic.md + source-table-academic.md + search-log entries")
task_industry  = team_task_create(teamRunId, subject: "Literature review — industry angle", description: "{TOPIC_DIR}/01-background/review-industry.md + source-table-industry.md + search-log entries")
task_empirical = team_task_create(teamRunId, subject: "Literature review — empirical angle", description: "{TOPIC_DIR}/01-background/review-empirical.md + source-table-empirical.md + search-log entries")
task_merge     = team_task_create(teamRunId, subject: "Merge reviews + gap map + PRISMA", description: "literature-review.md + source-table.md + gap-map.md + gap-heatmap.csv + contradictions-map.md + bias-assessment.md + prisma-flow.md + PRISMA-checklist.md", blockedBy: [task_academic, task_industry, task_empirical])
team_send_message(teamRunId, to: "academic-reviewer", body: "Task #1 registered — claim, execute, write files, mark completed, report.")
team_send_message(teamRunId, to: "industry-reviewer", body: "Task #2 registered — claim, execute, write files, mark completed, report.")
team_send_message(teamRunId, to: "empirical-reviewer", body: "Task #3 registered — claim, execute, write files, mark completed, report.")
team_send_message(teamRunId, to: "synthesis-merger", body: "Task #4 registered (starts after tasks 1-3) — claim when unblocked, execute, mark completed, report.")
```

To verify completion, wait for all four tasks to reach `completed` (via `team_task_list`), then apply the **Closure Contract** (shutdown + delete the team). Verify: all 10 canonical files exist with proper structure; search-log.csv has ≥3 DBs with dates and full strings; PRISMA-checklist.md has 27 rows with file:line pointers.

---

## Phase 1.5: PROTOCOL, SEARCH LOG & PRESS (Pre-registered Before Screening)

To satisfy PRISMA 2020 items 5-7 and 24, write `protocol.md` BEFORE any screening decision and log every search.

### protocol.md Template

To write `01-background/protocol.md`, include:

```markdown
# Protocol — {topic}

**Route:** {route} | **Date:** {CURRENT_DATE} | **Version:** 1.0 | **Registration:** local (amendments logged below)

## Objectives (PICOS/PEO or SPIDER)

- Population/Concept: ...
- Intervention/Exposure: ...
- Comparator: ...
- Outcome: ...
- Study design: ...

## Information Sources (PRISMA item 6)

| Database | URL/API | Date last searched | Coverage |
|----------|---------|--------------------|----------|
| OpenAlex | searxng_academic_search | {date} | Academic papers |
| arXiv | searxng_academic_search | {date} | Preprints |
| PubMed | searxng_academic_search | {date} | Biomedical (if relevant) |
| Web (Exa) | websearch_web_search_exa | {date} | Industry + grey |

## Search Strings (PRISMA item 7) — full strings per DB

See search-log.csv for execution; strings pre-registered here.

## Eligibility Criteria (PRISMA item 5) — operationalized

| Criterion | Include | Exclude |
|-----------|---------|---------|
| Language | English + translated (log translator) | — |
| Date | Foundational (any year) + recent 2024-2026 tranche | — |
| Study design | ... | Preprints without peer review for Level 1 claims |
| Population | ... | ... |

## Screening Plan (PRISMA item 8)

Two independent screeners (academic + industry reviewers) + arbiter (synthesis-merger). Log in screening-log.csv.

## Risk of Bias (item 11) + Certainty (item 15)

RoB tool per study type; GRADE SoF per outcome (see GRADE-SoF-template.md).

## Amendments

| Date | Change | Rationale |
|------|--------|-----------|
```

### search-log.csv — 16-Column PRISMA-S

To log every search, write `01-background/search-log.csv` with columns:

```
query_id, query_string, database, date_searched, hits_returned, filters_applied, hits_screened, included, excluded, exclusion_reasons, snowball_backward_refs, snowball_forward_cites, translator, notes, searcher, PRESS_peer_reviewed
```

Every angle reviewer appends rows; the synthesis-merger deduplicates and marks `PRESS_peer_reviewed` after peer review.

### PRESS Peer Review

To peer-review the search strategy, apply PRESS 2015 checklist: translation, Boolean operators, subject headings, text-word searching, spelling/syntax, limits/filters. Record result in `search-log.csv` column `PRESS_peer_reviewed` + note in `protocol.md`.

### Translation Handling

To handle non-English sources, translate the claim, log `original + translator + confidence` in `source-table.md`, and note in `search-log.csv` `translator` column.

---

## Phase 2: HYPOTHESIS FORMATION (Route-Dependent)

**Goal:** To generate the correct artifact for the routed methodology — not always hypotheses.

| Route | Phase 2 Output |
|-------|----------------|
| `popperian` | hypothesis-registry.md + H1-*.md (falsifiable) |
| `systematic` | RQ-registry.md + extraction-form.md (no H-tests) |
| `scoping` | RQ-registry.md + gap-map.md link (no H-tests) |
| `exploratory` | themes.md + model-candidates.md + RQ1-*.md |
| `dsr` | candidate-designs.md + evaluation-plan.md |

### 2A. Popperian Track — Operationalized Hypotheses

**This track stays a single `task(category="deep", run_in_background=false)` delegate (NOT a team)** — one coherent serial deliverable (the hypothesis registry) produced from the completed Phase-1 gaps; the adversarial split happens in Phase 3.

```typescript
task(category="deep", run_in_background=false, timeout=300000, prompt="
1. TASK: To generate falsifiable hypotheses from the gaps and contradictions in the literature review for topic '{topic}' (route: popperian).
2. EXPECTED OUTCOME: hypothesis-registry.md + individual hypothesis files at {TOPIC_DIR}/02-hypotheses/ + hypothesis-registry.lock.json

3. REQUIRED TOOLS: read, write, bash

4. MUST DO — Popperian Hypothesis Generation (operationalized):

   STEP 1 — To read gap-map.md, contradictions-map.md, and literature-review.md:
   - To identify each contradiction (sources that disagree) and each gap (Robinson types 1-7)
   - Hypotheses come from THESE, not from brainstorming

   STEP 2 — For each contradiction/gap, to formulate a hypothesis with SEVERITY:

   A hypothesis MUST have:
   - A precise, falsifiable claim: 'X produces Y under conditions Z' with quantified effect (e.g., '≥15% reduction in p99 latency')
   - A null form: 'X has no effect on Y under conditions Z' with equivalence margin
   - An explicit falsification criterion: 'This hypothesis would be disproven if [specific observation with instrument, metric, threshold, population, time window]'
   - A risky prediction: what MUST be observed if true that would be surprising under the null and under plausible alternatives (Mayo severe testing)
   - A severity budget: searches planned, source levels required, independence required, and what counts as severe vs weak test
   - Ioannidis/FAF flags: to assess prior probability, flexibility (degrees of freedom), and bias risk per hypothesis
   - An alternative: if false, most likely alternative and how to distinguish

   STEP 3 — To rate severity per hypothesis:
   - Severe test: ≥2 independent L1-L2 sources meeting criterion OR ≥3 independent L3 with consistent measurement
   - Weak test: single L4/L5 source meeting criterion string — downgrade to Provisionally falsified
   - To record auxiliary vs core: does a failed prediction falsify the hypothesis or its auxiliaries (measurement, scope, implementation)? — Lakatos protective belt

   STEP 4 — To assess with Ioannidis (2005) + FAF (flexibility-audit):
   - Prior plausibility: high / moderate / low (based on base rate in field)
   - Flexibility: number of researcher degrees of freedom (thresholds, subgroups, metrics) — high flexibility → downgrade corroboration
   - Bias risk: funding/COI, publication bias for this claim type

   STEP 5 — To write hypothesis-registry.md:

   # Hypothesis Registry

   ## Hypothesis 1: {claim}
   - **Status**: Active / Falsified / Provisionally falsified / Corroborated / Contested / Unfalsifiable
   - **Source gap/contradiction**: {which gap/contradiction from Phase 1}
   - **Claim**: X produces Y under Z (quantified)
   - **Null**: X has no effect on Y under Z (with margin)
   - **Falsification criterion**: Would be disproven by [specific, operationalized observation]
   - **Risky prediction**: Must observe [surprising observation] if true
   - **Severity**: {severe | weak} — {budget and independence required}
   - **Ioannidis/FAF**: prior {H/M/L} | flexibility {low/med/high} | bias risk {low/med/high}
   - **Alternative**: If false, most likely {alternative}
   - **Priority**: High / Medium / Low (impact × testability × novelty)

   STEP 6 — To write individual hypothesis files (H1-{slug}.md, H2-{slug}.md):

   # H1: {claim}

   ## Claim
   Exact, falsifiable, quantified statement.

   ## Origin
   Which gap or contradiction this hypothesis addresses (Gap ID or C-ID).

   ## Falsification Criteria
   This hypothesis would be disproven if [specific, operationalized, surprising observation].

   ## Predictions
   If true, we MUST observe: [list with magnitudes and conditions]

   ## Severity & Auxiliaries
   - Severity required: {definition}
   - Core vs auxiliary: {what failure implicates}

   ## Ioannidis/FAF
   Prior, flexibility, bias risk

   ## Alternative Explanations
   - Alt 1: {explanation} — {how to distinguish}
   - Alt 2: {explanation} — {how to distinguish}

   ## Priority
   High / Medium / Low

   ## Status
   Active (awaiting evidence gathering)

   STEP 7 — To lock: to write hypothesis-registry.lock.json with sha256 + timestamp (append-only pre-reg). No silent rewrites between Phase 2 and Phase 3.

5. MUST NOT DO:
   - Do NOT generate hypotheses from brainstorming — only from identified gaps/contradictions
   - Do NOT skip falsification criterion or severity — every hypothesis MUST state both
   - Do NOT make vague claims — 'X affects Y' is not falsifiable. 'X increases Y by Z% under W (n≥30, measured via k6)' is.
   - Do NOT forget Ioannidis/FAF — a hypothesis without bias awareness is incomplete
   - Do NOT generate more than 5 hypotheses per cycle — prioritization is essential
   - Do NOT quantify without operationalization (instrument, metric, threshold, n)

6. CONTEXT:
   - Topic: {topic}
   - Route: popperian
   - Background directory: {TOPIC_DIR}/01-background/
   - Hypotheses directory: {TOPIC_DIR}/02-hypotheses/
")
```

To verify, check: hypothesis-registry.md with 2-5 hypotheses, each with operationalized falsification criterion + severity + Ioannidis/FAF; hypothesis-registry.lock.json exists.

### 2B. Non-Popperian Tracks — RQs, Themes, Designs

To generate the correct non-Popperian artifact, follow the route:

- **systematic / scoping:** To write `RQ-registry.md` with PICO/PICo questions; each `RQ1-{slug}.md` has `Question | Motivation (gap link) | Needed evidence | Method family | Priority (novelty × feasibility × stakeholder impact)`.
- **exploratory:** To write `themes.md` (codes + evidence clusters via Braun & Clarke) + `model-candidates.md` + `assumptions.md`; optional `RQ1-*.md`.
- **dsr:** To write `candidate-designs.md` (3-5 designs, each with `context | objective | design sketch | TRIZ principle | constraints | TRL`) + `evaluation-plan.md` (how each design will be evaluated: benchmark, prototype, user study). For ideation frameworks, apply Double Diamond → SCAMPER/MA/TRIZ → Opportunity Map + 3D feasibility (desirability × feasibility × viability) in Phase 4.

---

## Phase 3: EVIDENCE GATHERING

**CRITICAL**: To collect evidence, run via **TEAM** with file-per-agent logs merged by the lead — not shared-file writes.

| Route | Evidence Team Composition |
|-------|---------------------------|
| `popperian` | Confirmation agent + Falsification agent (adversarial, equal resources) |
| `systematic` / `scoping` | Extractor + Bias-assessor (independent screening) |
| `exploratory` | Triangulation agents (not adversarial — corroborate across sources, log anomalies) |
| `dsr` | Feasibility-evaluator + Risk-evaluator (+ optional bench runner with bash) |

### Popperian Adversarial Team

```typescript
team_create({ inline_spec: {
  name: "<topic>-evidence",
  members: [
    // CONFIRMATION AGENT
    { name: "confirmation-agent", category: "unspecified-high", prompt: `
1. TASK: To find SUPPORTING evidence for the active hypotheses in topic '{topic}'.
2. EXPECTED OUTCOME: Evidence files in {TOPIC_DIR}/03-evidence/supporting/ + evidence-log-supporting.md

3. REQUIRED TOOLS: searxng_academic_search, google_search, websearch_web_search_exa, context7_query-docs, read, write, bash

4. MUST DO:
   - To read hypothesis-registry.md: {TOPIC_DIR}/02-hypotheses/hypothesis-registry.md
   - For EACH active hypothesis, to search for evidence that SUPPORTS it (minimum 5 queries per hypothesis; log each in evidence-log-supporting.md with query, DB, hits, screened, included, level)
   - For each piece of evidence, to record: source, claim, evidence level (1-5), year, confidence, how it supports
   - To write each finding as a separate note in supporting/ with full provenance
   - To write evidence-log-supporting.md (file-per-agent log — do NOT write to the shared evidence-log.md)

5. CONTEXT:
   - Topic: {topic}
   - Route: popperian
   - Evidence directory: {TOPIC_DIR}/03-evidence/
   - Hypothesis registry: {TOPIC_DIR}/02-hypotheses/hypothesis-registry.md
   - To claim the team task (team_task_update → in_progress, owner confirmation-agent) when starting, mark it completed when files are written, then report via team_send_message.
`},
    // FALSIFICATION AGENT (Devil's Advocate) — EQUAL resources, non-negotiable
    { name: "falsification-agent", category: "unspecified-high", prompt: `
1. TASK: To find CONTRADICTING evidence for the active hypotheses in topic '{topic}'. Act as DEVIL'S ADVOCATE — the ONLY job is to disprove the hypotheses.
2. EXPECTED OUTCOME: Evidence files in {TOPIC_DIR}/03-evidence/contradicting/ + evidence-log-contradicting.md

3. REQUIRED TOOLS: searxng_academic_search, google_search, websearch_web_search_exa, context7_query-docs, read, write, bash

4. MUST DO — Falsification Protocol (with severity):
   - To read hypothesis-registry.md: {TOPIC_DIR}/02-hypotheses/hypothesis-registry.md
   - For EACH active hypothesis, to identify its falsification criterion + severity budget
   - To search for evidence that MEETS the falsification criterion (minimum 5 queries per hypothesis; log each in evidence-log-contradicting.md)
   - If no contradicting evidence is found after exhaustive search, to state: 'Hypothesis survived falsification attempt — no contradicting evidence found after [N] searches at severity {level}'
   - For each finding: to record source, claim, evidence level, year, HOW it contradicts, and whether it meets severity
   - To rate falsification strength (severity-weighted):
     * Strongly falsified: ≥2 independent L1-L2 sources meet criterion OR ≥3 independent L3 with consistent measurement
     * Provisionally falsified: One L1-L2 meets criterion OR single L3 with weak severity
     * Not falsified: Exhaustive search at planned severity found no contradicting evidence
     * Unfalsifiable: No possible observation could disprove (label as non-scientific)
   - To assess Ioannidis/FAF per finding (does new evidence shift prior/flexibility/bias?)
   - To write each finding as a separate note in contradicting/ with full provenance
   - To write evidence-log-contradicting.md (file-per-agent — do NOT write to shared log)

5. MUST NOT DO:
   - Do NOT search only superficially — falsification search MUST be AS THOROUGH as supporting (parity gate checks |fals - conf| ≤1)
   - Do NOT dismiss contradicting evidence as low quality unless genuinely rated so (apply same 5-level scale)
   - Do NOT give up after 1 negative result — search multiple angles
   - Do NOT label as not falsified after only 1-2 searches — minimum 5 per hypothesis
   - Do NOT ignore the falsification criterion — test the specific criterion, not vague disproof

6. CONTEXT:
   - Topic: {topic}
   - Route: popperian
   - Evidence directory: {TOPIC_DIR}/03-evidence/
   - Hypothesis registry: {TOPIC_DIR}/02-hypotheses/hypothesis-registry.md
   - To claim the team task (team_task_update → in_progress, owner falsification-agent) when starting, mark it completed when files are written, then report via team_send_message.
`}
  ]
}})
```

**Register tasks + dispatch (parallel, equal resources):**

```typescript
team_task_create(teamRunId, subject: "Evidence — supporting (confirmation)", description: "{TOPIC_DIR}/03-evidence/supporting/ + evidence-log-supporting.md")
team_task_create(teamRunId, subject: "Evidence — contradicting (falsification)", description: "{TOPIC_DIR}/03-evidence/contradicting/ + evidence-log-contradicting.md")
team_send_message(teamRunId, to: "confirmation-agent", body: "Task #1 registered — claim, execute, write files, mark completed, report.")
team_send_message(teamRunId, to: "falsification-agent", body: "Task #2 registered — claim, execute, write files, mark completed, report.")
```

To complete, wait for BOTH tasks to reach `completed` (via `team_task_list`), then apply the **Closure Contract**.

**Lead merge step (file-per-agent logs merged by lead — evidence pipeline hardening P1-7):**

```bash
# Lead (in lead's own context, after both agents complete):
# 1. Read evidence-log-supporting.md + evidence-log-contradicting.md
# 2. Merge into canonical 03-evidence/evidence-log.md (deduplicate, preserve provenance)
# 3. Parity gate: |searches_fals - searches_conf| ≤1 else re-run the lagging agent
# 4. Update hypothesis-registry.md per hypothesis:
#    Falsified: contradicting evidence meets criterion at required severity
#    Provisionally falsified: single L1-L2 or weak severity
#    Contested: both supporting and contradicting at comparable severity
#    Corroborated: supporting exists + survived severe falsification attempt
#    Inconclusive: insufficient evidence either way
# 5. Append calibration entry to predictions-log.md per finding (forecast → outcome placeholder for Brier scoring)
```

---

## Phase 4: SYNTHESIS

**Goal:** To produce structured conclusions with IMRaD declaration, contribution matrix, calibrated confidence, and route-appropriate artifacts.

**This phase stays a single `task(category="deep", run_in_background=false)` delegate (NOT a team)** — one coherent serial deliverable read from all Phase-1/3 evidence files.

```typescript
task(category="deep", run_in_background=false, timeout=300000, prompt="
1. TASK: To synthesize all evidence for topic '{topic}' (route: {route}) into structured conclusions with calibrated confidence.
2. EXPECTED OUTCOME: findings.md, SoF-{outcome}.md per outcome, conclusions.md, discussion.md, open-questions.md, recommendations.md, related-work.md, method.md, contribution-matrix.md + route-specific artifacts at {TOPIC_DIR}/04-synthesis/ + 00-abstract.md

3. REQUIRED TOOLS: read, write

4. MUST DO — Scientific Synthesis:

   STEP 1 — To read ALL evidence:
   - To read hypothesis-registry.md (or RQ-registry.md / themes.md / candidate-designs.md per route)
   - To read ALL supporting + contradicting evidence files
   - To read evidence-log.md (canonical merged log)
   - To read source-table.md + bias-assessment.md + gap-map.md
   - To read protocol.md + search-log.csv + PRISMA-checklist.md

   STEP 2 — For each hypothesis/RQ/theme/design, to determine status (popperian: Falsified / Provisionally falsified / Corroborated / Contested / Inconclusive; other routes: Answered / Partially answered / Unanswered).

   STEP 3 — To write findings.md — every finding MUST include ALL fields:

   # Findings: {topic}

   ## Finding 1: {claim}
   - **Confidence**: IPCC calibrated language (very low / low / medium / high / very high) + likelihood % (e.g., 70-85%) — see calibration below
   - **Prediction interval (PI) alongside CI**: {PI} and {CI} — to show heterogeneity beyond sampling error
   - **GRADE SoF**: High / Moderate / Low / Very Low (per references/research-templates/GRADE-SoF-template.md) — one SoF-{outcome}.md per outcome
   - **Key sources**: [links with year + level]
   - **Remaining uncertainty**: {aleatoric vs epistemic vs model uncertainty}
   - **Alternative explanations not ruled out**: [list]
   - **Would be overturned by**: [specific future evidence / critical experiment]
   - **Traceable account**: GRADE domains → confidence mapping (why this confidence, not just what)

   STEP 4 — To write IMRaD artifacts:
   - 00-abstract.md — structured: Background / Methods / Results / Conclusions
   - method.md — protocol summary + threats to validity (Wohlin: internal/external/construct/conclusion)
   - related-work.md — coded dimension table (cluster sources by approach × context, contrast per cell)
   - discussion.md — interpretation + limitations + generalizability
   - contribution-matrix.md — contribution vs prior work (what is novel, what is confirmatory)

   STEP 5 — To write conclusions.md:

   # Conclusions

   ## What We Established (Highest Confidence)
   1. {finding} — {IPCC level + %}
   - Hedging: to hedge by section — Results hedged via PI/CI, Discussion hedged via limitations, Recommendations hedged via GRADE EtD strength

   ## What Remains Contested
   1. {issue} — supporting suggests X (CI/PI), contradicting suggests Y — adjudication note

   ## What We Don't Know
   1. {open question} — what specific evidence is needed

   STEP 6 — To write open-questions.md — each question MUST be:
   - Specific (not 'more research needed')
   - Falsifiable (what evidence would answer it)
   - Actionable (what study/experiment would resolve it)
   - PICO/PICo formatted where applicable
   - With proposed design + sample/setting + feasibility

   | Question | Why It Matters | What Evidence Would Answer It | Priority | PICO |
   |----------|---------------|------------------------------|----------|------|
   | ... | ... | ... | ... | ... |

   STEP 7 — To write recommendations.md with GRADE Evidence-to-Decision (EtD):
   - Problem, desirable/undesirable effects, certainty (GRADE), values, resources, equity, acceptability, feasibility → strength + direction (strong vs conditional)

   STEP 8 — Route-specific outputs:
   - scoping/systematic: gap-heatmap.csv update + research-agenda.md (RQ × priority × method)
   - dsr: options-matrix.md + feasibility.md (TRL, effort, risk, 3D: desirability × feasibility × viability) + rfc-draft.md
     * Ideation frameworks: Double Diamond (Discover→Define→Develop→Deliver) → SCAMPER/MA/TRIZ (contradiction matrix, 40 principles) → Opportunity Map + 3D feasibility scoring
   - exploratory: explanatory-model.md + assumptions.md + unknowns.md

   STEP 9 — To write saturation-log.md + recency note:
   - Saturation: queries_executed, new_sources_per_query, new_themes_per_query, stopping rule (stop when last 5 queries added 0 new themes — Guest et al. 2006; or marginal gain < threshold)
   - Recency: foundational vs recent tranche counts, fast-moving vs stable tags per finding

   STEP 10 — Calibrated confidence (IPCC):
   - To use IPCC calibrated language: very low / low / medium / high / very high (confidence) + likelihood % (0-100%)
   - To include PI alongside CI for every quantitative finding
   - To hedge by section: Results (PI/CI), Discussion (limitations), Recommendations (EtD strength)
   - To include traceable account: 'Confidence {level} because GRADE {High/Med/Low} + consistency {measured} + precision {n, CI width} + bias {assessment}'

5. MUST NOT DO:
   - Do NOT present supporting evidence without also presenting contradicting evidence (popperian) or bias assessment (all routes)
   - Do NOT use vague confidence language — use IPCC level + likelihood % + PI/CI
   - Do NOT skip alternative explanations or traceable account
   - Do NOT present synthesis as final truth — label confidence and hedging clearly
   - Do NOT generate open questions as 'more research needed' — be specific with PICO and feasibility

6. CONTEXT:
   - Topic: {topic}
   - Route: {route}
   - Background: {TOPIC_DIR}/01-background/
   - Hypotheses/RQs: {TOPIC_DIR}/02-hypotheses/
   - Evidence: {TOPIC_DIR}/03-evidence/
   - Synthesis output: {TOPIC_DIR}/04-synthesis/
")
```

---

## Phase 5: ITERATION LOGGING & STATUS UPDATE

After ALL phases complete, to log the iteration and update all views:

### 5.1 Write Iteration Log

```bash
ITER_NUM=$(ls -1 "$TOPIC_DIR/05-iterations"/iteration-*.md 2>/dev/null | wc -l)
ITER_NUM=$((ITER_NUM + 1))
ITER_PADDED=$(printf "%03d" "$ITER_NUM")
```

To write `{TOPIC_DIR}/05-iterations/iteration-{ITER_PADDED}.md`:

```markdown
# Iteration {ITER_PADDED}

## Research Question
{original question}

## Route
{route} — {rationale}

## Date
{current date}

## Actions Taken
- Phase 0.5: Route {route} (goal={goal}, maturity={maturity}, wants_artifact={bool})
- Phase 1: Background & literature review
  - N searches executed (search-log.csv rows)
  - M sources collected and evaluated (source-table.md rows)
  - Databases: {list} (≥3 required)
  - PRESS: {pass/fail}
  - Gaps mapped: {Robinson types covered} (gap-map.md)
  - Contradictions: {count} (conditional gate per route)
- Phase 2: Hypothesis/RQ/Design formation
  - Y hypotheses/RQs/designs generated
  - Severity / Ioannidis-FAF logged
  - Locked: hypothesis-registry.lock.json @ {hash}
- Phase 3: Evidence gathering
  - Z supporting evidence files, W contradicting
  - Parity: |fals - conf| = {delta} (≤1 required for popperian)
  - File-per-agent logs merged by lead
  - Citation audit: {pass/fail} (≥10% spot-check)
  - H falsified / C corroborated / Contested / Inconclusive
- Phase 4: Synthesis
  - Findings with IPCC confidence + PI/CI + traceable account
  - GRADE SoF per outcome
  - Saturation: {queries, new sources/themes per query, stopping rule}
  - Recency: {foundational count} vs {recent 2024-2026 count}

## Key Decisions
| Decision | Rationale |
|----------|-----------|
| {decision} | {why} |

## Results
- **Hypotheses falsified**: {count}
- **Hypotheses corroborated**: {count}
- **Contested**: {count}
- **Inconclusive**: {count}
- **Overall confidence**: {IPCC level + %}
- **Gaps mapped**: {types}

## What Was Learned
{Key insight}

## Next Steps / Open Paths
{Natural next questions}
```

### 5.2 Update Iterator Log

To append to `{TOPIC_DIR}/05-iterations/iterator-log.md`, write pipe-table with canonical hash:

```markdown
| hash | # | Date | Question | Mode | Approach | Key Result | Evidence |
|------|---|------|----------|------|----------|------------|----------|
| {sha256(question|mode|approach_template_id)} | {N} | {date} | {question} | {route} | {approach_template_id} | {result} | iteration-{N}.md |
```

To compute the hash, canonicalize `question|mode|approach_template_id` (not free prose). To check for duplicates, compare cosine >0.92 on embeddings as secondary guard.

### 5.3 Update STATUS.md + STATE.json

To update `{TOPIC_DIR}/STATUS.md`:

```markdown
# Research Status: {topic}

**Status:** ✅ Complete | **Route:** {route} | **Confidence:** {IPCC level + %}
**Last Activity:** {date}

## Phase Summary
| Phase | Status | Output |
|-------|--------|--------|
| 0.5 Router | ✅ {route} | goal={goal}, maturity={m}, wants_artifact={b} |
| 1. Literature Review | ✅ Complete | N sources, M gaps, PRESS {pass} |
| 2. Hypothesis/RQ/Design | ✅ Complete | H hypotheses/RQs/designs (locked) |
| 3. Evidence Gathering | ✅ Complete | S supporting, C contradicting, parity {delta}, audit {pass} |
| 4. Synthesis | ✅ Complete | Findings with IPCC+PI + SoF + saturation |

## Quick Links
- [Findings](04-synthesis/findings.md)
- [SoF per outcome](04-synthesis/SoF-*.md)
- [Conclusions](04-synthesis/conclusions.md)
- [Gap Map](01-background/gap-map.md)
- [PRISMA Flow](01-background/prisma-flow.md)
- [All Evidence (merged)](03-evidence/evidence-log.md)

## To Continue
Run: `/omnilearn-research --continue {topic-slug}`
Or: `/omnilearn-research dig deeper on {specific-angle} from {topic}`
```

To update `STATE.json` (canonical machine state), write JSON with `route`, `phases_completed`, `confidence`, `gaps`, `hypotheses_status`.

### 5.4 Update Research INDEX.md

To update `{RESEARCH_DIR}/INDEX.md`, add or update the entry after every phase transition (not only at Phase 5 end):

```markdown
## Active Research

### {topic} ({date}) — route: {route}
{one-line summary}
- Confidence: {IPCC level + %}
- Key finding: {brief}
- Gaps: {types}
- [Open in research dir]({TOPIC_DIR}/)
```

---

## FOLLOW-UP SYSTEM

When user says `dig deeper on Y from X`, to extend:

### 1. Locate the Context

```bash
# To search existing research for the reference
grep -ri "{reference}" "$TOPIC_DIR/" --include="*.md" | head -20
# To read the relevant section to understand context (use line-anchored reads)
```

### 2. Create Follow-up Folder

```bash
mkdir -p "$TOPIC_DIR/follow-ups/01-{specific-angle}/"
```

### 3. Anchor Context

To write `CONTEXT.md`, copy the relevant section from the parent research so this follow-up is self-contained:

```markdown
# Context: {specific-angle}

This follow-up was triggered by: {user's question}

## Source Anchor
source: findings.md#L<start>-L<end> @ <git rev-parse HEAD>

## What the Parent Research Established
{Copy of relevant section from findings.md}

## What We're Extending
{Specific aspect we're investigating further}

## Parent Route
{route} — follow-up inherits or re-routes via Phase 0.5
```

### 4. Run Research

To run, execute the same engine (Phases 0.5-4) but scoped to the specific angle, using the CONTEXT.md as the starting point rather than starting from scratch. To limit scope, reuse parent `source-table.md` with dedup and cap follow-up budget to N queries (incremental search: parent query + delta).

### 5. Link Back

To update the parent `topic-index.md`:

```markdown
## Follow-ups
- [{specific-angle}](follow-ups/01-{specific-angle}/) — {brief description} (route: {route})
```

---

## ANTI-PATTERN GUARDS (Loop Prevention + Integrity)

### Guard 1: Iterator Log Check (Before EVERY action)

Before starting ANY research action, to check for prior attempts:

```bash
# To check if this question + mode + approach has been tried before (canonicalized)
ITER_LOG="$TOPIC_DIR/05-iterations/iterator-log.md"
CANONICAL_HASH=$(echo -n "$QUESTION|$ROUTE|$APPROACH_TEMPLATE_ID" | sha256sum | cut -d' ' -f1)
if [ -f "$ITER_LOG" ] && grep -q "$CANONICAL_HASH" "$ITER_LOG" 2>/dev/null; then
  echo "⚠️  This question+mode+approach was tried before (hash $CANONICAL_HASH)."
  echo "See iteration entry in $ITER_LOG."
  echo "Either: (a) adjust the approach_template_id, or (b) ask the user to confirm retry."
  # If same hash was tried 2x without progress → force pivot (block execution)
  exit 0
fi
# Secondary: embedding cosine >0.92 for semantic duplicates (when available)
```

To compute the approach identifier, use `approach_template_id` enum (e.g., `academic-review`, `industry-review`, `empirical-review`, `falsification`, `supporting`), not free prose.

### Guard 2: Falsification Gate (Popperian Route Only)

To verify falsification was attempted for each hypothesis (gated on route == popperian):

```bash
if [ "$ROUTE" = "popperian" ]; then
  HYP_DIR="$TOPIC_DIR/02-hypotheses/"
  EVID_DIR="$TOPIC_DIR/03-evidence/contradicting/"
  for hyp in "$HYP_DIR"/H*.md; do
    HYP_ID=$(grep -oE "H[0-9]+" "$hyp" | head -1)
    # Normalize: match H1 with optional punct/space/slug
    if ! grep -r -Eiq "H[0-9]+[[:punct:] ]" "$EVID_DIR" 2>/dev/null | grep -qi "$HYP_ID"; then
      # Also check evidence-log-contradicting.md for hypothesis_id frontmatter
      if ! grep -qi "$HYP_ID" "$TOPIC_DIR/03-evidence/evidence-log-contradicting.md" 2>/dev/null; then
        echo "⚠️  Hypothesis $HYP_ID has no falsification attempt recorded."
        echo "Do NOT mark as corroborated until falsification is attempted."
      fi
    fi
  done
fi
```

### Guard 3: Citation Audit — Operationalized (P0-4)

To verify every citation, run the citation audit script — not a comment stub. Execute after Phase 1 and Phase 3, and block Phase 4 if it fails.

```bash
# To run citation audit, execute (or inline):
# scripts/verify-sources.sh is optional; inline equivalent below:

SOURCE_TABLE="$TOPIC_DIR/01-background/source-table.md"
AUDIT_FILE="$TOPIC_DIR/03-evidence/citation-audit.md"

echo "# Citation Audit — $(date -I)" > "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"
echo "| # | URL | HTTP | Hash | Wayback | Crossref | Spot-check |" >> "$AUDIT_FILE"
echo "|---|-----|------|------|---------|----------|------------|" >> "$AUDIT_FILE"

# Extract URLs from source-table.md (markdown links + bare URLs)
grep -oE "https?://[^)[:space:]>\"]+" "$SOURCE_TABLE" | sort -u | nl | while read -r n url; do
  # 1. curl -I — HTTP status (follow redirects, 15s timeout)
  http=$(curl -L --max-time 15 -I -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  # 2. Content hash (GET + sha256, truncated)
  hash=$(curl -L --max-time 15 -s "$url" 2>/dev/null | sha256sum 2>/dev/null | cut -c1-12 || echo "no-hash")
  # 3. Wayback snapshot check (HEAD to web.archive.org)
  wb=$(curl -s --max-time 10 "https://web.archive.org/cdx/search/cdx?url=$url&limit=1&output=json" 2>/dev/null | grep -q "20" && echo "found" || echo "none")
  # 4. Crossref DOI resolution (if DOI-like URL)
  cr="n/a"
  if echo "$url" | grep -qiE "doi\.org|10\.[0-9]+/"; then
    doi=$(echo "$url" | grep -oE "10\.[0-9]+/[^[:space:]>\"]+")
    cr=$(curl -s --max-time 10 "https://api.crossref.org/works/$doi" 2>/dev/null | grep -q '"status":"ok"' && echo "ok" || echo "fail")
  fi
  # 5. ≥10% spot-check: every 10th source gets full content fetch + claim verification flag
  spot="—"
  if [ $((n % 10)) -eq 0 ]; then
    spot="spot-checked"
  fi
  echo "| $n | $url | $http | $hash | $wb | $cr | $spot |" >> "$AUDIT_FILE"
  if [ "$http" != "200" ] && [ "$http" != "301" ] && [ "$http" != "302" ]; then
    echo "⚠️  Source $n ($url) returned HTTP $http — flag as unverified, trigger re-search."
  fi
done

# Gate: block Phase 4 if any URL returned 000/404/500 or Crossref fail
# Hallucinated URL → remove citation, add note: 'Removed — source could not be verified (HTTP $code).', re-run the search that produced it.
```

To enforce, require `citation-audit.md` with HTTP 200/301/302 per source before Phase 4 synthesis proceeds. Mark spot-check rows explicitly.

### Guard 4: Topic Drift Detection

To detect drift, compute a drift score against `topic-index.md` original question:

```bash
# To check drift, compare current focus vs original question (embedding or keyword overlap)
# LLM prompt in merge/synthesis to compute drift_score ∈ {aligned, minor, major}
# - aligned: current scope within original question
# - minor: adjacent expansion — log and continue
# - major: >50% divergence — re-anchor: re-read original question from topic-index.md, rewrite literature-review.md scope
```

To enforce, require the synthesis delegate to emit `drift_score` in `findings.md` header; `major` blocks completion until re-anchored.

### Guard 5: SIFT + Lateral Reading + AACODS + 5Q Independence

To harden source evaluation, apply per source (see references/research-templates/SIFT-lateral-reading-script.md):

- **SIFT 4 moves** — Stop, Investigate source, Find better coverage, Trace to original — executed per source.
- **60s lateral reading** — timeboxed to 60 s per source (domain about + claim search + citation trace).
- **AACODS** — for grey literature: Authority/Accuracy/Coverage/Objectivity/Date/Significance scored 0-2, include if ≥7/12.
- **5Q independence audit** — per sampled source: Who funded? What method? Independent of other included sources? Peer-reviewed or equivalent? Reproducible artifact linked?

To log results, add columns `SIFT | AACODS | 5Q_pass` to `source-table.md`.

---

## EVIDENCE PIPELINE HARDENING

To prevent race conditions and silent evidence loss, enforce file-per-agent logs merged by the lead:

- Each agent writes ONLY its own log: `evidence-log-supporting.md` / `evidence-log-contradicting.md` (never the shared `evidence-log.md`).
- The lead merges both into canonical `evidence-log.md` (deduplicated, provenance preserved) after `team_task_list` shows terminal tasks.
- Parity gate: `|searches_fals - searches_conf| ≤1` else re-run the lagging agent. Record `searches_executed` per agent in the log header.
- Checkpoint: reviewer files are durable even if merge fails; merge is idempotent and re-runnable.
- Schema: every evidence file requires frontmatter `source_url:` + `evidence_level:` enum + `hypothesis_id:`; merge validates schema.

---

## CALIBRATED CONFIDENCE — IPCC + PI + Hedging + Traceable Account

To calibrate confidence, apply IPCC calibrated language with likelihood, prediction intervals, and hedging by section:

| IPCC Confidence | Likelihood % | Meaning | GRADE Mapping |
|-----------------|--------------|---------|---------------|
| Very low | 0-10% | Speculative | GRADE Very Low |
| Low | 10-33% | Weak evidence | GRADE Low |
| Medium | 33-66% | Moderate, mixed | GRADE Low-Moderate |
| High | 66-90% | Strong, consistent | GRADE Moderate |
| Very high | 90-100% | Replicated, robust | GRADE High |

To report per finding:

- **IPCC level** + **likelihood %** + **prediction interval (PI) alongside confidence interval (CI)** — include both to show heterogeneity.
- **Traceable account** — one sentence: "Confidence {level} because GRADE {High/Med/Low} + consistency {high/moderate/low} + precision {n, CI width} + bias {RoB} + recency {foundational/recent}."
- **Elicitation protocol** — two independent estimates → Delphi reconciliation; log in `predictions-log.md` for Brier scoring over iterations.
- **Hedging by section** — Results hedged via PI/CI; Discussion hedged via limitations; Recommendations hedged via GRADE EtD strength (strong vs conditional).

---

## DSR + IDEATION FRAMEWORKS (When Route == dsr)

To design viable solutions, apply Double Diamond → SCAMPER/MA/TRIZ → Opportunity Map + 3D feasibility:

1. **Double Diamond (Discover → Define → Develop → Deliver):**
   - Discover: solution-space scan (patents, prior art, GitHub exemplars, TRIZ contradictions) → `01-background/solution-space-scan.md`
   - Define: problem + objectives + constraints → `02-hypotheses/candidate-designs.md` (3-5 designs)

2. **SCAMPER / Morphological Analysis / TRIZ:**
   - SCAMPER: Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse — per design.
   - Morphological box: dimensions × options matrix for solution variants.
   - TRIZ: contradiction matrix (technical contradictions) + 40 principles; map design trade-offs to TRIZ principles.

3. **Opportunity Map + 3D Feasibility:**
   - Opportunity Map: impact × effort × risk plot for each candidate.
   - 3D feasibility: Desirability (user need) × Feasibility (tech) × Viability (resources/trl) — score 1-5 per axis, include in `04-synthesis/feasibility.md`.
   - Output: `04-synthesis/options-matrix.md` + `feasibility.md` + `rfc-draft.md` + `next-sprint.md`

---

## IMRaD DECLARATION + CONTRIBUTION MATRIX + RECENCY + SATURATION

To satisfy synthesis completeness, include:

- **IMRaD declaration** — `00-abstract.md` (Background/Methods/Results/Conclusions) + `method.md` + `findings.md` (Results) + `discussion.md` + explicit mapping table in `method.md`.
- **Contribution matrix** — `contribution-matrix.md`: rows = contributions, cols = prior work; mark novel vs confirmatory.
- **Recency dual tranche** — foundational (seminal, any year) + recent (2024-2026) dual tranche; date filter per query; `source-table.md` has `year` column + `recency` flag; findings tag `stable` vs `fast-moving`.
- **Saturation log** — `04-synthesis/saturation-log.md` with `queries_executed`, `new_sources_per_query`, `new_themes_per_query`, stopping rule: stop when last 5 queries added 0 new themes (Guest et al. 2006) or marginal gain < threshold; log `information_power` (Malterud et al. 2016).

---

## QUALITY GATES

| Check | Phase | Route | Action if Failed |
|-------|-------|-------|------------------|
| protocol.md exists with PICOS/PEO + databases (≥3) + full strings + I/E operationalized | 1 | all | Write protocol.md before searching — re-dispatch with protocol template |
| search-log.csv exists with 16-col PRISMA-S, ≥3 DBs, dates, hits, filters | 1 | all | Re-run searches with logging — every query must be logged |
| PRESS peer review recorded in search-log.csv + protocol.md | 1 | all | Run PRESS 2015 checklist, mark column |
| PRISMA flow derived from logs (not invented) with counts at Identification→Screening→Eligibility→Included | 1 | all | Derive from search-log.csv + screening-log.csv counts |
| PRISMA-checklist.md with 27 items pointing to file:line | 1 | systematic | Complete checklist — each item points to file:line |
| source-table.md with evidence levels + year + recency + artifact link for every source | 1 | all | Grade every source; add missing columns |
| gap-map.md with Robinson 7 gaps + Reasons A-D + Petersen heatmap | 1 | all | Classify gaps; produce heatmap (see gap-taxonomy template) |
| contradictions-map.md with ≥2 contradictions (popperian) OR ≥2 gap types / ≥3 sparse cells (other routes) | 1 | gate conditional | Route-aware: popperian requires ≥2 contradictions; scoping/systematic require ≥2 gap types or ≥3 sparse cells; exploratory/dsr require ≥2 themes or ≥3 designs |
| All Phase-1 team tasks terminal + teams deleted (Closure Contract) | 1 | all | Complete shutdown/delete before next phase |
| hypothesis-registry.md with 2-5 operationalized hypotheses (severity + Ioannidis/FAF per H) + lock file | 2 | popperian | Each hypothesis must have quantified claim + operationalized falsification criterion + severity + Ioannidis/FAF |
| RQ-registry.md / themes.md / candidate-designs.md per route | 2 | non-popperian | Write route-appropriate artifact (see Phase 2B) |
| Every hypothesis has severity + Ioannidis/FAF flags | 2 | popperian | Add severity budget + prior/flexibility/bias per H |
| supporting/ AND contradicting/ evidence directories exist (popperian) OR extractor logs exist (other routes) | 3 | all | Both adversarial logs must exist for popperian — falsification is mandatory |
| File-per-agent logs merged by lead into evidence-log.md (not shared writes) | 3 | all | Merge evidence-log-supporting.md + evidence-log-contradicting.md via lead |
| Parity gate: |fals - conf| ≤1 (popperian) | 3 | popperian | Re-run lagging agent until parity within 1 |
| Falsification agent ran for EVERY hypothesis (≥5 queries per H, SIFT per source) | 3 | popperian | Check evidence-log-contradicting.md for hypothesis coverage |
| Citation audit: citation-audit.md with curl -I + hash + Wayback + Crossref + ≥10% spot-check, no 000/404 | 3 | all | Run citation audit script; remove unverified citations, re-search |
| SIFT + AACODS + 5Q per source (sampled ≥10%) | 1,3 | all | Apply SIFT moves + AACODS + 5Q; log columns |
| Every finding has IPCC level + likelihood % + PI/CI + traceable account | 4 | all | Add calibrated confidence — no vague language |
| Every finding has GRADE SoF per outcome (High/Moderate/Low/Very Low with footnotes) | 4 | all | Write SoF-{outcome}.md per outcome (see GRADE-SoF-template.md) |
| Every finding lists alternative explanations not ruled out + overturn condition | 4 | all | Add at least 1 alternative per finding |
| open-questions.md has specific, actionable, PICO-formatted questions | 4 | all | Rewrite — 'more research needed' is not acceptable |
| recommendations.md uses GRADE EtD (strong vs conditional) + hedging by section | 4 | all | Apply EtD table per recommendation |
| IMRaD artifacts: 00-abstract.md + method.md + discussion.md + contribution-matrix.md | 4 | all | Write IMRaD set |
| Saturation log: queries, new sources/themes per query, stopping rule | 4 | all | Write saturation-log.md (Guest et al. threshold) |
| Recency dual tranche logged (foundational vs recent 2024-2026) | 1,4 | all | Tag every source + finding as stable vs fast-moving |
| iteration-{N}.md written for this run (zero-padded, correct wc -l counting) | 5 | all | Write now — enables loop prevention |
| iterator-log.md updated with canonical hash (question|mode|approach_template_id) | 5 | all | Update now — prevents future repetition |
| STATE.json + STATUS.md + INDEX.md updated (INDEX after every phase, not only at end) | 5 | all | Update views from STATE.json |

---

## What This System Does NOT Do

- ❌ Does NOT produce agreeable summaries — it seeks contradiction (popperian) or maps gaps (scoping)
- ❌ Does NOT pretend all findings are equally confident — it calibrates via IPCC + GRADE + PI/CI
- ❌ Does NOT suppress uncertainty — it highlights it with hedging by section and traceable accounts
- ❌ Does NOT repeat failed approaches — the iterator log + saturation log + parity gate prevent this
- ❌ Does NOT let one agent do both hypothesis generation AND testing — they are separate, with file-per-agent logs
- ❌ Does NOT present opinion as evidence — every claim has a source + level + year + audit status
- ❌ Does NOT answer unanswerable questions — it identifies what's unknowable and what would answer it
- ❌ Does NOT invent PRISMA flow numbers, GRADE levels, or citations — all are derived from logs and audited

---

## Error Recovery

| Situation | Action |
|-----------|--------|
| No contradictions found in literature (popperian) | Check if route is correct — settled field may need scoping route. If truly popperian, re-dispatch with broader scope; if field is settled, re-route to scoping and map gaps instead. |
| Falsification member found nothing | Mark as 'Not Falsified After Severe Search' — but document severity, search depth (queries, DBs, levels), and Ioannidis shift. |
| Supporting and contradicting evidence equally strong | Flag as 'Contested — unresolved.' Present both sides with PI/CI + GRADE; do NOT force a conclusion. Log in SoF as Low certainty due to inconsistency. |
| Team member fails in Phase 1 or Phase 3 | Re-run via `team_send_message` to that member (same team session) with more specific instructions |
| Team member's deliverable files missing | Re-dispatch same member; if team closed, re-create a 1-member team or use a single `deep` delegate |
| Team tools unavailable | Fall back to `task(category="deep", run_in_background=true/false)` with the same member prompts |
| User asks a follow-up on non-existent section | Search INDEX.md for similar topics. If truly not found, acknowledge the gap and start fresh research. |
| Same iteration hash detected | Block execution. Tell user: 'This exact question+mode+approach was tried before with [result]. Try a different angle or confirm you want to retry.' |
| Source verification finds hallucinated citations (HTTP 000/404 or Crossref fail) | Remove the citation. Add note: 'Removed — source could not be verified (HTTP $code, Crossref $status).' Re-run the search that produced it. |
| Citation audit spot-check fails (≥10% sampled) | Expand spot-check to 25%, re-verify all sources from the failing agent's log. |
| Parity gate fails (|fals - conf| >1) | Re-run the lagging agent with explicit query budget to reach parity. |
| Research drifts off-topic (drift_score == major) | Re-anchor: re-read original question from topic-index.md. Rewrite literature-review.md scope to re-align. |
| Saturation not reached (marginal gain still high) | Continue searching — add 3-5 more queries targeting sparse heatmap cells, then re-check saturation. |
| PRESS peer review fails | Revise search strings per PRESS feedback, re-execute, update search-log.csv. |

---

## SSoT & Version Pin

- **Single source of truth:** `packages/omnilearn-workflow/commands/omnilearn-research.md` (this file).
- **Synced copy:** `~/.config/opencode/skills/omnilearn/references/omnilearn-research.md` — identical content, updated via sync script.
- **Version:** `2.1.0` pinned in frontmatter (`version` + `last-verified`). To bump, update both files and the sync script atomically.

To sync, run:

```bash
# scripts/sync-research-skill.sh — keep SSoT in sync (run after every edit)
SRC="packages/omnilearn-workflow/commands/omnilearn-research.md"
DST="$HOME/.config/opencode/skills/omnilearn/references/omnilearn-research.md"
cp "$SRC" "$DST"
echo "Synced $SRC → $DST ($(wc -l < "$SRC") lines, version $(grep '^version:' "$SRC"))"
```

To verify drift, run `diff -u "$SRC" "$DST"` — empty diff means in sync.

## References (Methodological Canon)

To ground methodology, cite where applicable: Popper (1959/1963), Lakatos (1970), Kuhn (1962), Mayo (2018 severe testing), Booth et al. (systematic approaches), Cochrane Handbook v6.4, PRISMA 2020 (Page et al., BMJ 2021), PRISMA-ScR (Tricco et al. 2018), GRADE (Guyatt et al.), JBI Manual, Kitchenham & Charters (2007), Petersen et al. (2008/2015 SMS), Robinson et al. (2011 gaps), Hevner et al. (2004 DSR), Peffers et al. (2007), Braun & Clarke (thematic analysis), PRESS 2015, AACODS (Tyndall 2010), SIFT (Caulfield), Ioannidis (2005), Walker et al. (2003 uncertainty), Mastrandrea et al. (2010 IPCC guidance), Fischhoff & Bruine de Bruin (calibration).
