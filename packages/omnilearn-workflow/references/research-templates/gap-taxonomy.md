# Gap-Map Taxonomy — Robinson et al. 7 Gaps + Reasons A-D + Petersen SMS Fork

To map gaps, classify each under gaps A-G and reasons A-D, then route via Petersen fork.

## Robinson et al. (2011) — 7 Gap Types

| Gap | Definition | Example |
|-----|------------|---------|
| 1. Insufficient / imprecise information | Evidence exists but weak/imprecise | Compression ratio reported without variance |
| 2. Biased information | Systematic bias in available evidence | Benchmarks only on NVMe, not EBS |
| 3. Inconsistency / unknown consistency | Contradictory results | LZ4 vs Zstd at <4 KB claims conflict |
| 4. Not the right information | Proxy outcome, wrong population/context | Measured throughput, need tail latency |
| 5. Not the right population / context | Studied group ≠ target | WASM-edge vs server |
| 6. Not the right intervention / exposure | Studied method ≠ target method | gzip vs Brotli-Zstd comparison missing |
| 7. Other — new question / opportunity | Novel combination unstudied | CRDT + bounded staleness under partition |

## Reasons A-D (why gap matters)

A. New technology / innovation gap — B. New population-context gap — C. Knowledge void (absence) — D. Prior evidence low-certainty

## Petersen SMS Mapping Fork

```
IF goal == systematic map (SMS):
  → Petersen et al. 2008/2015: classify by facet (topic × contribution × method × context)
  → Heatmap: rows = domain facets, cols = evidence levels
  → Gaps = sparse/empty cells, NOT contradictions alone
  → Output: gap-heatmap.csv + gap-map.md (faceted)
ELSE IF goal == contradictory synthesis:
  → contradictions-map.md as subset of gap-map (Gap type 3)
```

Every `gap-map.md` MUST contain all 7 gap sections (mark "none found" if empty) + heatmap. Map at least 2 gap types or ≥3 sparse heatmap cells to pass the synthesis gate.
