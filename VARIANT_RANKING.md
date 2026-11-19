# Artemis landing variants — adversarial ranking (2026-11-19)

Five full landing experiences, one dataset, one app. Review live: `npm run dev`
then open **/compare**. Screenshots: `review-shots/`. All five render the real
GBM3 BANKSY/UMAP payload (Ren et al. 2023, GSE194329) and/or the GBM1 Visium
spots; no fabricated numbers passed the brief.

Three independent adversarial judges (Codex `gpt-5.6-terra`, high reasoning):
design/brand, scientific credibility, engineering. Full transcripts in the
session job dir; verdicts verbatim below.

## Scoreboard

| Variant | Builder | Design | Science | Eng | Σ |
|---|---|---:|---:|---:|---:|
| **V3 · Agentic Portal** (`/v3`) | Codex | 5 | **8** | 5 | **18** |
| **V5 · Mission Control** (`/v5`) | Codex | 5 | 5 | **6** | 16 |
| **V1 · Arrow Genesis** (`/`) | Claude | 6 | 4→fixed | 4→fixed | 14* |
| **V2 · Living Specimen** (`/v2`) | Codex | 7 | 3 | 4 | 14 |
| **V4 · Down the Barrel** (`/v4`) | Codex | **8** | 2 | 2 | 12 |

\* V1's science + engineering violations were fixed post-judging (see below);
the other variants are left exactly as judged so the comparison stays honest.

## The real finding: the judges disagree on purpose

- **Design crowned V4** ("the only variant that feels immediately ownable" —
  the H&E→domains scroll dive) and called V1's crash "the best raw idea"
  wrapped in an overcrowded payoff frame.
- **Science crowned V3** (every on-screen number computed from the loaded
  arrays; agent rail honestly labeled "recorded run") and executed V4 and V2
  for dressing Visium spot data up as microscopy ("confocal viewport",
  "channels", "focal plane") and everyone for calling spots "cells".
- **Engineering crowned V5** (computed telemetry, cleanest state handling) and
  flagged V4's `touch-none` sticky canvas as the one CRITICAL (breaks touch
  scrolling entirely).

**Recommended direction (synthesis):** none of the five ships as-is. The
winning composite is:

1. **V1's moment** — arrow spells the name, strikes the dodecahedron, data
   comes alive — as the 6-second opening (design: "use it as a transition,
   not the whole hero"), with the post-crash frame decluttered.
2. **V3's proof** — the recorded agent run that visibly drives a real portal
   viewer, every number computed — as the first section below the fold. This
   is the "cooler, more agentic HuBMAP" and the credibility judge's winner.
3. **V4's dive** — H&E crossfading into computed domains — compressed to one
   decisive scroll beat (not 620svh), touch-scrolling fixed.
4. **Everywhere:** spot-level language ("1,775 Visium spots", "model-annotated
   states"), provenance lines, and relative-expression labels. A PI audience
   is the whole business; the science judge's violations list is the ship gate.

Also compare against the **`fable-hero` branch** (huntress blueprint intro,
built earlier, undeployed) before committing — same arrow idea, narrative
register. Note: the live artemislabs.bio runs the sage-green redesign whose
source is managed outside this repo; merging any winner into production goes
through that team/flow, not `scripts/deploy-ghpages.sh` (destructive — see
memory).

## Judge verdicts (verbatim closings)

### Design & brand
> SCORES: V1=6 V2=7 V3=5 V4=8 V5=5
> RANKING: V4 > V2 > V1 > V3 > V5
- GRAFT: V1 — the dodecahedron shattering into a real, inspectable cell cloud; use it as a short transition, not the whole hero.
- GRAFT: V2 — the clear specimen-first interaction cue and restrained instrument-frame composition.
- GRAFT: V3 — the causal, narrated analysis sequence; retain only if it shows decisions and outcomes rather than faux-agent theater.
- GRAFT: V4 — the H&E-to-domain scroll morph, compressed into a decisive evidence-led reveal.
- GRAFT: V5 — the radar sweep's controlled motion language and sharply drawn technical panel borders.

Key critiques: V1 opening reads as dead space then over-corrects into pill
clutter; "Every core service your lab needs. One AI-powered team." is
AI-services boilerplate; V3 "mistakes interface density for credibility";
V4's headline says nothing (just the name); V5's "compbio" contraction in the
H1 was judged too casual for a premium firm.

### Scientific credibility
> SCORES: V1=4 V2=3 V3=8 V4=2 V5=5
> RANKING: V3 > V5 > V1 > V2 > V4

Violations that MUST be fixed before any scientist sees a variant:
- ALL: Visium **spots**, not "cells"; the 7 named categories are
  model-annotated putative cell states, not "BANKSY domains" (the underlying
  run had 15 BANKSY clusters). ✅ fixed in V1; open in V2–V5.
- V1 `HeroGenesis.jsx`: hardcoded "1,775", max-scaled expression shown as if
  raw. ✅ both fixed (count from `labels.length`, log-norm values shown and
  labeled).
- V2 `LivingSpecimen.jsx`: "confocal viewport" / "channels" / "focal plane"
  framing for spot data; missing provenance for state labels. ⚠️ open.
- V3 `PortalV3.jsx:140-145,212`: "BANKSY domains" naming. ⚠️ open (otherwise
  the credibility winner — all transcript numbers computed at render time).
- V4 `DownTheBarrel.jsx`: hardcoded min_dist + count, "cell level" promise,
  rescaled expression unlabeled. ⚠️ open.
- V5 `MissionControl.jsx`: spots-as-"cells", "BANKSY labels" naming. ⚠️ open.

### Engineering
> SCORES: V1=4 V2=4 V3=5 V4=2 V5=6
> RANKING: V5 > V3 > V2 > V1 > V4

MUSTFIX (verbatim, status annotated):
- V4 `touch-none` on the fullscreen sticky canvas — **CRITICAL**, breaks touch
  scrolling of the whole page. ⚠️ open.
- V1 data/impact race + untracked timers + unguarded fetch. ✅ fixed
  (`S.tryShatter` replay path, timer registry cleared on unmount, cancelled
  flag; per-frame geometry cached once per draw).
- V2 permanent rAF loop with per-frame 4,764-point allocations; focusable
  canvas with no keyboard operation. ⚠️ open.
- V2–V5 route-relative asset/fetch URLs break if `trailingSlash` is ever
  enabled (they work today: no-trailing-slash export + dev fix). ⚠️ open.
- V3 13ms-interval React updates + char-by-char `aria-live` flooding. ⚠️ open.
- V5 radar animates offscreen; per-frame gradient + rect reads. ⚠️ open.

## Infrastructure fix shipped with this branch

`next.config.mjs`: `assetPrefix: "./"` is now **production-only**. In dev it
rewrote every chunk to `./_next/...`, which 404s on nested routes and killed
hydration for the entire site — nothing client-side ran in `next dev`
(root cause of the "site feels dead locally" mystery; verified with a probe
page: EFFECT-NOT-RUN → EFFECT-RAN after the fix).

## How to review tomorrow

```bash
cd ~/artemislabs-site/.claude/worktrees/hero-arrow-genesis
npm run dev -- --port 3461
# open http://localhost:3461/compare
```

Branch `worktree-hero-arrow-genesis`, pushed to the PRIVATE remote
(`logan196/artemislabs-source`). Nothing deployed.
