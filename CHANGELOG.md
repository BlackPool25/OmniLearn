# Changelog

All notable changes to OmniLearn will be documented here.

## 2.3.0 — 2026-09-11 — Ask-before-install (beta-safe)

### Fixed
- **Installer no longer touches omo/opencode uninvited** — detects existing
  installs FIRST (`command -v` + `--version` probes, prerelease-aware:
  `-beta`/`-next`/`-rc`/`-alpha`/`-canary`/`-dev` all count as installed),
  prints version + channel, and asks (keep [default] / explicit opt-in
  reinstall). Non-interactive runs default to keep-existing. Previously a
  beta omo install could be paved over by stable — now a beta is never
  downgraded without an explicit user choice.
- **Missing binaries are guidance, not force-installs** — when omo/opencode
  are absent the installer prints self-install commands and continues with
  skills + MCPs instead of executing `curl | bash` or `npx` installers
  unprompted. No exit-1 dead end.

### Added
- **Self-install flags** — `--skills-only` (= `--skip-omo --skip-opencode`),
  `--skip-omo`, `--skip-opencode`, documented in `--help` and the README.
- **Default scope is skills + MCPs** — command files, reference templates,
  Context7 MCP entry, omo plugin wiring. Binaries are out of scope unless
  explicitly opted in. `--check` now reports detected omo/opencode versions.

### Synced
- `commands/` verified byte-identical to live skills (`ec9b941b` research
  skill included, all 6 commands match) — no copy needed, sha proof logged.

## 2.1.0 — 2026-09-02 — Adaptive research engine

### Added
- **Adaptive Router Phase 0.5** (popperian|scoping|systematic|exploratory|dsr) — fixes monotheism, routes by goal/maturity/wants_artifact
- **Protocol + PRISMA 2020** — pre-registered protocol.md, 16-col search-log.csv (PRISMA-S), screening-log.csv, 4-phase flow derived from logs, 27-item checklist
- **Three-angle Phase 1** — academic + industry + empirical reviewers (not two), each with SIFT 4 moves + 60s lateral reading + AACODS + 5Q independence
- **Gap-map taxonomy** — Robinson 7 gaps + Reasons A-D + Petersen heatmap (gap-heatmap.csv)
- **DSR + ideation** — Double Diamond → SCAMPER/MA/TRIZ → Opportunity Map + 3D feasibility (desirability×feasibility×viability)
- **Operationalized hypotheses** — quantified claim + null margin + operationalized falsification + risky prediction + severity budget + Ioannidis/FAF + lockfile
- **Citation audit** — executable curl -I + hash + Wayback + Crossref + ≥10% spot-check (was comment stub)
- **Calibrated confidence** — IPCC very low→very high + likelihood % + PI alongside CI + traceable account + hedging by section
- **Evidence pipeline hardening** — file-per-agent logs merged by lead + parity gate |fals-conf|≤1 + schema
- **IMRaD + contribution matrix + recency dual tranche + saturation log**
- **Research templates** — 4 stubs in references/research-templates/ (PRISMA, GRADE-SoF, SIFT, gap-taxonomy)
- **SSoT sync** — scripts/sync-research-skill.sh + version pin 2.1.0 + last-verified

### Fixed
- **P0-2 SSoT schism** — 835 vs 855 drift, now canonical packages/ + generated installed with CI diff -q
- **Double H1** — single H1, imperative/infinitive style, progressive disclosure
- **Blow-up body** — heavy templates linked not inlined, Quick Start + Current Date Context + MCP Semantics added

### Changed
- Skill frontmatter: added name, version, last-verified, pushy description with 6 triggers
- Package version: 1.4.0 → 2.1.0

## 2.2.0 — 2026-09-02 — Normal orchestration (no teams)

### Changed
- **Removed `team_*` orchestration** — now uses normal `task(category="deep", run_in_background=true/false)` + `background_output(task_id="bg_...")` only. No `team_create`, `team_task_*`, `team_send_message`, `Closure Contract`, or `blockedBy`.
- Phase 1: 3 parallel reviewers via `task(run_in_background=true)` → collect via `background_output` after `<system-reminder>`, then spawn merger as blocking `task(run_in_background=false)`
- Phase 3: confirmation/falsification pair via `task(run_in_background=true)` → collect via `background_output`
- Docs: Mandatory Tools table and orchestration workflow updated to normal orchestration; fallback and error table updated

### Fixed
- User request: don't use teams, just normal orchestration

### Synced (2026-09-11) — research skill quality upgrades
- `commands/omnilearn-research.md` synced byte-identical to the verified improved skill (`ec9b941b`): PRISMA-S strategy tables, contradiction-seeking queries, arxiv grounding, hypothesis-first ordering, relevance gate + cascade retrieval, field-level citation check (R/P/H), Step 3.5 claim-lock, evidence-bound confidence rubric, 6 new quality gates
- `bin/install.js` now also installs `references/` payloads (recursive copy to the omnilearn skill references dir) and covers them in `--check`; help text updated
- Package README rewritten for v2.2.0 (install/usage, quality upgrades, omo + Context7 MCP wiring)
