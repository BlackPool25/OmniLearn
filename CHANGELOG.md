# Changelog

All notable changes to OmniLearn will be documented here.

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
