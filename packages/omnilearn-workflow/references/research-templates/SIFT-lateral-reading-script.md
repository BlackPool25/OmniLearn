# SIFT + 60s Lateral Reading — Script (run per source)

To verify a source, execute the 4 SIFT moves sequentially. Timebox lateral reading to 60 s per source.

## Moves

1. **Stop** — Pause before citing; note initial impression vs needed claim strength.
2. **Investigate the source** — Open the source's about/domain/author; check expertise and COI.
3. **Find better coverage** — Lateral-read: open 2-3 independent sources on same claim (search `claim + site:trusted`); compare.
4. **Trace to original** — Follow citations to primary study/report; verify the claim matches the source.

## 60 s Lateral Reading Protocol

```bash
# For each source URL in source-table.md:
# 1. curl -I (5s) → HTTP status
# 2. Open domain about page (15s) → authority
# 3. google_search claim quotes (20s) → corroboration
# 4. Trace citation link if present (20s) → primary
```

## AACODS Check (grey literature only)

Authority / Accuracy / Coverage / Objectivity / Date / Significance — score each 0-2, include if ≥7/12.

## 5Q Independence Audit (per sampled source)

1. Who funded/published? 2. What method produced claim? 3. Independent of other included sources? 4. Peer-reviewed or equivalent check? 5. Reproducible artifact/data linked?

Log result in `source-table.md` columns: `SIFT | AACODS | 5Q_pass`.
