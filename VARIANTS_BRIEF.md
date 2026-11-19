# Artemis BioLabs — landing-page variant builders' brief

You are building ONE full landing-page variant as a route in this Next.js 16 app
(App Router, Turbopack, Tailwind v4 via `@import "tailwindcss"` + `@theme`).
Four builders work in parallel in THIS SAME working tree. Stay strictly in your
lane or you will clobber a sibling.

## Your lane (hard rule)

Variant N owns exactly two locations and NOTHING else:
- `app/vN/page.js` (+ optional `app/vN/layout.js`)
- `components/variants/vN/` (all your components live here)

Do NOT edit any file outside your lane. Do NOT run `npm run build`, `next dev`,
or any npm command — the orchestrator builds once at the end (concurrent .next
writes corrupt each other). Write code you are confident parses.

## What this is

Artemis BioLabs (artemislabs.bio) sells embedded computational-biology service
("Every core service your lab needs. One AI-powered team." / "computational
biology, accelerated." / "The first analysis is on us."). Booking link:
https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0FzlJl55WV52jaH-JEG8_xJLO5YLd20t2ksXikjwMfGnVQ-zLI4XUCAmHTFiLE1tnQgAIxBhjW

The client wants the landing experience to feel like a LIVING, breathing
biological specimen you can immediately interact with — "a cooler, more agentic
HuBMAP portal" (portal.hubmapconsortium.org is the reference they love), not a
static gallery. Interactivity with REAL data is the product demo.

## Design system (match it)

Dark obsidian theme, tokens already in `app/globals.css` `@theme`:
ink #07060b (ground) · ink-2 #0e0d16 · panel #141322 · line rgba(255,255,255,.12)
snow #f8fafc (body) · dim #94a3b8 · violet #14b8a6 (PRIMARY accent — it's teal
despite the name) · violet-deep #0d9488 (button fill) · amber/magma #f59e0b.
Utility classes exist: `.grain`, `.text-gradient`, `.glow-ring`, `.aurora`.
Fonts: system sans + ui-monospace (no Google fonts are loaded — do not add any).
House moves: hairline borders, rounded-[3px], mono micro-labels, uppercase
tracking-[0.35em] eyebrows, canvas-rendered data, framer-motion reveals
(framer-motion is installed). Respect `prefers-reduced-motion` everywhere.

## Real data you may use (and the ONLY data you may use)

1. `public/plots/umap_params.json` — fetch at runtime as `"plots/umap_params.json"`.
   GBM3 sample, Ren et al. 2023 (GSE194329). Keys:
   - `settings`: 5 embeddings `{id, min_dist, x:[1775], y:[1775]}`, coords
     normalized 0..1. ids: `tissue` (real spatial coords), then 4 UMAP variants.
   - `labels`: 1775 ints 0..6 → `domains` (7 BANKSY domains:
     oligodendrocytes, NPC-like tumor cells, endothelial cells, astrocytes,
     proliferating tumor cells, microglia/TAMs, pericytes/smooth muscle)
   - `domain_counts`: [453,439,247,244,226,97,69] · `palette`: 7 hex (Okabe-Ito;
     swap `#1c1a15` → `#CC79A7` on dark ground or it vanishes)
   - `markers`: {EGFR, SOX2, CD68} → 1775 floats (log-norm expression)
2. `public/banksy_gbm1.json` — fetch as `"banksy_gbm1.json"`. GBM1 Visium:
   `states` (6 names), `spots`: 4764 × [x, y, stateIdx, gfapNorm], `gfap`
   {gene:"GFAP", norm, p99}.
3. Real images under `public/`: `gbm/GBM{1-4}_{he,overlay,breakdown}.jpg`,
   `gbm/GBM{1-4}_{markers,states}.png`, `analysis/*.jpg`,
   `dejong/*.jpg` (H&E + segmentation overlays), `portal_brain.jpg`,
   `seqfish_card.jpg`, `artemis_lockup.svg`, `artemis_mark.svg`, `logos/`.
   Reference them with RELATIVE paths (`"gbm/GBM3_he.jpg"`, no leading slash).

## Claim integrity (absolute)

- NEVER invent numbers, metrics, client names, logos, testimonials, paper
  citations, or capabilities. Every number shown must come from the JSON files
  above or be a true count of what is on screen.
- Real citations you may use verbatim: "Ren et al. 2023 (GSE194329)" for the
  UMAP/BANKSY data; "10x Genomics Visium, GBM" for the gbm/ images.
- The co-scientist/agent angle may be shown as UI concept (panels, feeds,
  prompts) but label anything non-functional honestly (e.g. "concept preview"),
  never as if it were computing live.

## Quality bar

- The hero must be interactive with real data within the first viewport.
- 60fps: canvas for point clouds (1,775 or 4,764 pts is fine), no DOM per point.
- Mobile-usable, keyboard-focusable controls, aria labels, reduced-motion path.
- "use client" on interactive components; fetch data in useEffect; guard window.
- The page must be complete: hero + at least 2–3 supporting sections (services/
  portals/CTA) so it reads as a full site, reusing your own variant components.
  You may import SHARED read-only components (`components/ClientMarquee.jsx`,
  `components/Cta.jsx`, `components/Reveal.jsx`) but never edit them.

Sibling routes for context (do not edit): `/` is V1 "Arrow Genesis" (arrow
spells the name, strikes a dodecahedron, it shatters into the 1,775-cell live
cloud with channel pills). Make yours DIFFERENT and better.
