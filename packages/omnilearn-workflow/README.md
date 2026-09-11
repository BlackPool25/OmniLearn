# omnilearn-workflow

[![npm version](https://img.shields.io/npm/v/omnilearn-workflow.svg)](https://www.npmjs.com/package/omnilearn-workflow)
[![License: MIT](https://img.shields.io/github/license/BlackPool25/OmniLearn.svg)](LICENSE)

Installer for OmniLearn v2.3.0 — multi-agent learning workflows for OpenCode.

```bash
npx omnilearn-workflow
```

Full docs: [github.com/BlackPool25/OmniLearn](https://github.com/BlackPool25/OmniLearn)

## What you get

Six commands installed to `~/.config/opencode/command/`, plus research
methodology templates under `~/.config/opencode/skills/omnilearn/references/`:

- `/omnilearn-init` — configure your learning directory
- `/omnilearn-roadmap` — research + generate a learning roadmap
- `/omnilearn-roadmap-edit` — modify a roadmap without losing progress
- `/omnilearn-start` — hands-on learning with assignments and tests
- `/omnilearn-refine` — dig deeper into a specific concept
- `/omnilearn-research` — deep research engine on any topic

## The research engine

`/omnilearn-research` runs systematic review, not ad-hoc web scraping. Every
run follows the same pipeline: background literature review (academic +
industry angles) → falsifiable hypotheses → adversarial evidence gathering
(confirmation and falsification passes) → calibrated synthesis with explicit
uncertainty.

What changed in this version:

- **PRISMA-S search strategy tables** — every angle logs full query strings
  verbatim with limits and flow counts, so a third party can rerun the search.
- **Contradiction-seeking queries** — each angle runs dedicated queries whose
  goal is to find disagreement and negative results, not confirmation.
- **arXiv grounding** — the academic angle extracts section-cited notes from
  primary sources instead of trusting abstracts.
- **Hypothesis-first ordering** — no retrieval runs before each sub-hypothesis
  has verification-method, expected-outcome, and falsification criterion.
- **Relevance gate + cascade retrieval** — every query must target a
  hypothesis; sources resolve cache → DOI → scholar connectors → web search,
  with a gap-pass for what is still missing.
- **Field-level citation check** — every source verified on
  title/authors/venue/year/DOI and labeled R (real), P (needs re-check), or
  H (removed).
- **Claim lock (Step 3.5)** — high-risk claims reach synthesis only with two
  independent domains plus counter-search plus a primary source; the rest go
  to an Unresolved/Refuted annex.
- **Evidence-bound confidence rubric** — ≥85% needs L1–2 sources, 70–85%
  needs L3 plus survived falsification, below is `contested`, never a number.
- **Six quality gates** — arxiv step, claim lock, contradiction floor,
  falsification coverage, citation labels, and rubric compliance are each
  enforced with a named verifier before the run concludes.

## Flags

| Flag | What it does |
|---|---|
| `--yes` | Non-interactive: skills + MCPs, keeps existing omo/opencode |
| `--skills-only` | Skills + MCPs only — never touches omo or opencode |
| `--skip-omo` | Never touches the omo binary |
| `--skip-opencode` | Never touches the opencode binary |
| `--check` | Verify install health (commands, references, MCP, plugin, binaries) |
| `--version` | Show package version |
| `--help` | Show usage help |

## Requirements

- **Node.js >= 18** — no Bun needed
- **OpenCode** — install it yourself:
  `curl -fsSL https://opencode.ai/install | bash`
- **oh-my-openagent (`omo`)** — provides multi-agent orchestration:
  `npx oh-my-openagent@latest install`

  Providers are configured later inside OpenCode.

## What the installer does

The default scope is **skills + MCPs**. The installer detects your existing
`omo` and `opencode` installs first — stable releases and prerelease channels
(`-beta`, `-next`, `-rc`) alike count as installed — prints the detected
version, and asks before touching either binary. Keeping what you have is
always the default, and non-interactive runs keep existing installs. A beta is
never downgraded to stable unless you explicitly choose a reinstall. If you
manage both tools yourself, `--skills-only` skips them entirely.

1. Detects existing omo/opencode (version + channel) — asks, defaults to keep
2. Copies the 6 command files to `~/.config/opencode/command/`
3. Copies the research templates to the omnilearn skill references dir
4. Configures the **Context7 MCP** for documentation lookups
5. Registers the **oh-my-openagent plugin entry** (binaries only on opt-in)
6. Optionally configures your learning directory

### Context7 MCP setup

Documentation lookups go through Context7 in remote mode — no API key, no
local server. The installer writes this into your OpenCode config
(`opencode.json`, `.jsonc` also accepted):

```json
{
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp",
      "enabled": true
    }
  }
}
```

If the entry already exists under any `*context7*`/`ctx7` key, the installer
leaves it alone. Run `npx omnilearn-workflow --check` anytime to verify.

## Verify

```bash
npx omnilearn-workflow --check
```

Checks detected omo/opencode versions, all 6 commands, reference templates,
Context7 MCP, the oh-my-openagent plugin, and your learning directory —
warnings include the exact fix command.

## License

MIT
