# Live site map: artemislabs.bio

Captured 21 Nov 2026 from the live site. No application code was changed.

The live homepage is not the same composition as current `main` `app/page.js`. `main` mounts Hero, the logo marquee, BANKSY, What we do, Spatial bioinformatics, the UMAP explorer, the H&E foundation block, Co-scientist, the stack list, the tool graph, and the close. The live homepage instead runs Hero, marquee, UMAP, the search-to-portal story, What we do, founders, use cases, the portal feature, Spatial bioinformatics, Co-scientist, the stack list, the tool graph, the fable, and the close. BANKSY and the foundation block are in `main` and are not sections on the live homepage.

Paths below are files on current `main` when the file exists. Where the live section is not in this tree, the path is the last git commit that still has it.

Desktop crops are 1440px wide. Phone crops (homepage only) are 390px wide.

## Homepage

### 1. Opening

**Heading:** ARTEMIS BIOLABS

Tissue field drawn from the AT14 glioblastoma H&E (de Jong et al. 2026). Tick marks reveal, callouts read Segment cells, Call spatial niches, Annotate cell states, Map expression gradients. Line: "Every core service your lab needs. One AI-powered team." Button: Book a demo. Small line: "The first analysis is on us."

**Source:** `components/Hero.jsx`, `components/TissueDither.jsx`, `components/SplitText.jsx`, `components/FounderLock.jsx`

**Issue:** Book a demo uses the old Google Calendar appointments URL, not `https://calendar.app.google/Gcn7m6neU3P3ktQA8`. Nav item BANKSY points at `#banksy`, and that id is not on this live page.

![1 desktop](docs/site-map/desktop/home-01.png)

![1 phone](docs/site-map/phone/home-01.png)

### 2. Institution strip

**Heading:** Where our team has trained and collaborated

Scrolling row of institution and company marks (Stanford, Caltech, MIT, St. Jude, A2, Pfizer, Columbia, Princeton, USC, UCSF).

**Source:** `components/ClientMarquee.jsx`

**Issue:** It is a moving strip with faded edges, so one frame never shows the whole set.

![2 desktop](docs/site-map/desktop/home-02.png)

![2 phone](docs/site-map/phone/home-02.png)

### 3. Core, reimagined

**Heading:** Your computational biology core, reimagined.

Kicker "01 · DEMOCRATIZING BIOINFORMATICS". Living figure of 1,775 GBM3 spots moving between tissue and UMAP, with dials and a SOX2 color option. Caption cites Ren et al. 2023 (GSE194329).

**Source:** `components/UmapExplorer.jsx` (file is on `main`; `app/page.js` on `main` places it later than the live page does)

**Issue:** Caption is long and uses em dashes. The canvas is heavy on a phone.

![3 desktop](docs/site-map/desktop/home-03.png)

![3 phone](docs/site-map/phone/home-03.png)

### 4. Search to portal

**Heading:** One query, eight sections, one portal.

Kicker "02 · FROM SEARCH TO PORTAL". Scroll story from a GEO query to the sections GBM1-4, TenX, AT10, AT14, AT15. Figure caption says this is a working subset, not a published systematic review.

**Source:** `components/PrismaStory.jsx` (on `main`, not mounted by current `app/page.js`)

**Issue:** Very tall scroll (about 3000px). Figure caption uses em dashes.

![4 desktop](docs/site-map/desktop/home-04.png)

![4 phone](docs/site-map/phone/home-04.png)

### 5. Eight cores

**Heading:** Eight cores. One embedded team.

Kicker "03 · WHAT WE DO". Eight cards: Single-cell, Spatial transcriptomics, CUT&Tag and chromatin, Long-read sequencing, Radiomics and imaging, Calcium imaging, Clinical data and biostatistics, Custom apps: DNA Studio. Each says "demo on request". Line below adds bulk RNA-seq, variants, proteomics, metabolomics, cytometry, and microbiome.

**Source:** `components/WhatWeDo.jsx`, sketches in `components/AssayMini.jsx`

**Issue:** Cards do not open a demo. The only action is "Request a sample report" (email).

![5 desktop](docs/site-map/desktop/home-05.png)

![5 phone](docs/site-map/phone/home-05.png)

### 6. Founders

**Heading:** Built by two scientists. Met in Pasadena.

Kicker "ABOUT ARTEMIS · CO-FOUNDERS". Logan Beharry, Co-founder and CSO (A2, Pfizer, Caltech, USC, Bill Gross Prize 2024 runner-up). Bella Germano, Co-founder and COO (Cedars-Sinai, Caltech, ophthalmology paper). Two publication cards under that.

**Source:** not on current `main`. Last copy: `6c36536:components/FoundersSection.jsx`

**Issue:** This block is on the live site and is missing from current `main`.

![6 desktop](docs/site-map/desktop/home-06.png)

![6 phone](docs/site-map/phone/home-06.png)

### 7. Use cases

**Heading:** Real datasets, live in the browser.

Kicker "04 · USE CASES". Three rows, each with a wireframe dodecahedron that glows when that row is active.

**Source:** not on current `main`. Last copy: `6c36536:components/UseCasesSection.jsx`

**Issue:** Intro line uses an em dash ("Not slideware"). The DTI row opens a video, not a portal.

![7 desktop](docs/site-map/desktop/home-07.png)

![7 phone](docs/site-map/phone/home-07.png)

#### 7.1 Spatial domains in resected GBM

Visium GBM, BANKSY, 1,775 spots, link to the live GBM3 portal. Teal dodecahedron.

![7.1](docs/site-map/desktop/home-07-1.png)

#### 7.2 Single-molecule cortex, rebuilt live

seqFISH+ mouse cortex, Eng et al. 2019, 913 cells. Amber dodecahedron. Body copy uses em dashes.

![7.2](docs/site-map/desktop/home-07-2.png)

#### 7.3 A diffusion-MRI cohort, browsable

Mouse DTI, 15 animals by 3 timepoints, "Watch the 20-second replay". Violet dodecahedron.

![7.3](docs/site-map/desktop/home-07-3.png)

### 8. Portal

**Heading:** One selection, every view.

Kicker "THE PORTAL". Still of the GBM1 Vitessce portal (4,764 spots) plus three claims: drop-in ingest, linked exploration, ask the section.

**Source:** `components/PortalFeature.jsx` (on `main`, not mounted by current `app/page.js`)

**Issue:** This is a captured still, not the live viewer.

![8 desktop](docs/site-map/desktop/home-08.png)

![8 phone](docs/site-map/phone/home-08.png)

### 9. Spatial bioinformatics

**Heading:** A PhD-led agent team for your spatial data.

Kicker "05 · SPATIAL BIOINFORMATICS". Long paragraph with an em dash, an "agent room" card, then three cards: Study architect, Spatial analyst, Methods reviewer. Button: Scope a spatial study (email).

**Source:** `components/SpatialAgentsSection.jsx`

**Issue:** The lead paragraph is the wordy one Logan flagged, and it uses an em dash.

![9 desktop](docs/site-map/desktop/home-09.png)

![9 phone](docs/site-map/phone/home-09.png)

#### 9.1 Study architect

Frames the question, cohorts, controls, and analysis plan.

![9.1](docs/site-map/desktop/home-09-1.png)

#### 9.2 Spatial analyst

Checks tissue, coordinates, quality, domains, and cell state.

![9.2](docs/site-map/desktop/home-09-2.png)

#### 9.3 Methods reviewer

Challenges assumptions and turns the run into figures and a report.

![9.3](docs/site-map/desktop/home-09-3.png)

### 10. Co-scientist

**Heading:** Text us like your core.

Kicker "06 · YOUR CO-SCIENTIST". Phone mock with a scripted chat. Caption says the prose is scripted and the numbers are from a real TenX GBM report.

**Source:** `components/CopilotSection.jsx`

**Issue:** Reads like a live chat until the small caption. Copy uses em dashes.

![10 desktop](docs/site-map/desktop/home-10.png)

![10 phone](docs/site-map/phone/home-10.png)

### 11. The stack list

**Heading:** Eight capabilities, one stack.

Kicker "10 · THE STACK" (the number does not match its place on the page). Eight rows: banksy-pipeline, marker-annotator, vitessce-forge, live-analysis, research-copilot, paper-scout, abstract-artist, cohort-importer.

**Source:** `components/ToolsGrid.jsx`

**Issue:** No section id, so the nav item "The stack" skips this block and lands on section 12. Several descriptions use em dashes.

![11 desktop](docs/site-map/desktop/home-11.png)

![11 phone](docs/site-map/phone/home-11.png)

### 12. Tool graph

**Heading:** Speaks the tools you already trust.

Kicker "08 · THE STACK, CONNECTED". Logo tiles (Python, scanpy, Vitessce, GEO, and others) with lines into an Artemis hub. Hover shows a blurb.

**Source:** `components/ToolGraph.jsx`

**Issue:** Explanations only appear on hover, which a phone cannot do the same way. Blurbs use em dashes.

![12 desktop](docs/site-map/desktop/home-12.png)

![12 phone](docs/site-map/phone/home-12.png)

### 13. The fable

**Heading:** One pass from raw counts to spatial structure.

Kicker "About Artemis · why Artemis". Live drawing of the huntress and the crystal (dodecahedron). Button: Replay the fable. Four captions, including "Structure, alive."

**Source:** not on current `main`. Last copy: `6c36536:components/FableSection.jsx` and `components/FableStage.jsx`

**Issue:** On the live site and missing from current `main`. Captions use em dashes.

![13 desktop](docs/site-map/desktop/home-13.png)

![13 phone](docs/site-map/phone/home-13.png)

### 14. Close and footer

**Heading:** Your data has a story.

Kicker "HOW AN ENGAGEMENT WORKS", four steps (pilot, scope, deliverables, your data stays yours), "built by Caltech researchers", a draggable dodecahedron, Book a demo, and an email link. Footer: ARTEMIS BIOLABS, copyright 2026.

**Source:** `components/Cta.jsx`, dodecahedron in `components/BioDodecahedron.jsx`

**Issue:** Book a demo uses the old calendar URL. Step copy uses em dashes. The pilot step says the first portal and marker report are free.

![14 desktop](docs/site-map/desktop/home-14.png)

![14 phone](docs/site-map/phone/home-14.png)

## Other live pages

Phone crops were not taken for these. Each shot is the desktop first screen.

### 15. About

**Heading:** Co-founders

Static page. Leadership (Logan, Bella, with press links), team (Haley Nessy, Samanda Saltibus, Emma Nemes), two papers, founding principles, and "Artemis BioLabs is funded by Bill Gross."

**Source:** `origin/gh-pages:about/index.html`. There is no `app/about` on `main`.

**Issue:** Richer than homepage section 6, and it is not generated by the current Next app.

![15](docs/site-map/desktop/about.png)

### 16. Figure gallery

**Heading:** Publication-ready figures for your omics data

Searchable figure booklet in two parts (mainstream, niche). Linked methods page.

**Source:** `origin/gh-pages:figures/` (not built by current `main`)

**Issue:** Large standalone gallery. Easy to miss from the homepage nav.

![16](docs/site-map/desktop/figures.png)

#### 16.1 Methods

**Heading:** Methods: The Figure Booklet

Corpus, screening, example papers, recreations, top 20.

**Source:** `origin/gh-pages:figures/data/methods.html`

![16.1](docs/site-map/desktop/figures-methods.png)

### 17. Fable page

**Heading:** What if your data were delivered alive?

A second long page: GBM gallery, cores, UMAP, co-scientist. Not the same as homepage section 13.

**Source:** `origin/gh-pages:fable/index.html` (older Next export)

![17](docs/site-map/desktop/fable.png)

### 18. Intro

**Heading:** ARTEMIS BIOLABS

Another long homepage variant: tissue, cores, UMAP, "The slide already knows."

**Source:** `origin/gh-pages:intro/index.html`

![18](docs/site-map/desktop/intro.png)

### 19. Notes

**Heading:** Notes from the team

**Source:** `origin/gh-pages:notes/index.html`

![19](docs/site-map/desktop/notes.png)

### 20. Specimen

**Heading:** What if your data were delivered alive?

One specimen study, with a stack inspection.

**Source:** `origin/gh-pages:specimen/index.html`

![20](docs/site-map/desktop/specimen.png)

### 21. Proxima

**Heading:** PROXIMA

Standalone tool page.

**Source:** `origin/gh-pages:proxima/index.html`

![21](docs/site-map/desktop/proxima.png)

### 22. Hero variants

**Heading:** Two hero directions

Internal comparison of Halftone, Editorial, and Live analysis. Not linked from the public nav.

**Source:** `app/variants/page.js` on `main`, also `origin/gh-pages:variants.html`

**Issue:** Internal review page is public.

![22](docs/site-map/desktop/variants.png)

### 23. MERFISH demo

**Heading:** Mouse preoptic area

**Source:** `origin/gh-pages:demos/merfish/index.html`

![23](docs/site-map/desktop/demo-merfish.png)

### 24. Specimen demo

**Heading:** A specimen in focus.

**Source:** `origin/gh-pages:demos/specimen/index.html`

![24](docs/site-map/desktop/demo-specimen.png)

### 25. Live H&E viewer

**Heading:** Artemis Explore, AT15 glioblastoma

Pan and zoom H&E, marker channels, cell states. Split view.

**Source:** `public/live/explore/` (also on `gh-pages` under `/live/explore/`)

![25](docs/site-map/desktop/live-explore.png)

### 26. Live GBM portals

One Vitessce-style portal per public section. Same kind of page, different sample.

**Source:** `public/live/GBM1/`, `GBM2/`, `GBM3/`, `GBM4/`, `TenX_GBM/`, `AT10/` plus `portal.html` on GBM3, AT10, and seqFISH.

**Issue:** Easy to confuse the index page with the fuller portal.html.

#### 26.1 GBM1

![26.1](docs/site-map/desktop/live-gbm1.png)

#### 26.2 GBM3 index

![26.2](docs/site-map/desktop/live-gbm3.png)

#### 26.3 GBM3 portal

![26.3](docs/site-map/desktop/live-gbm3-portal.png)

### 27. Mouse brain atlas

**Heading:** Whole-brain MERFISH atlas

3,938,808 cells. Allen Brain Cell Atlas.

**Source:** `public/live/brain/`

![27](docs/site-map/desktop/live-brain.png)

### 28. seqFISH+ portal

**Heading:** seqFISH+

**Source:** `public/live/seqfish/`

![28](docs/site-map/desktop/live-seqfish.png)

### 29. GBM3 workbench

**Heading:** GBM3 UMAP and Spatial

**Source:** `origin/gh-pages:live/workbench/index.html` (this workbench is not in current `main` `public/live`)

![29](docs/site-map/desktop/live-workbench.png)

## Routes seen on gh-pages

Homepage `/`. About `/about/`. Figures `/figures/` and `/figures/data/methods.html`. Fable `/fable/`, plus `fable/fable-embed.html` and `fable/finale.v1.html`. Intro `/intro/` and `/intro/proxima/`. Notes `/notes/`. Specimen `/specimen/`. Proxima `/proxima/`. Variants `/variants.html`. Demos `/demos/merfish/`, `/demos/specimen/`. Live viewers listed in sections 25 to 29, and also `/live/GBM2/`, `/live/GBM4/`, `/live/TenX_GBM/`, `/live/AT10/`, `/live/AT10/portal.html`, `/live/GBM3/histology/`, `/live/seqfish/portal.html`.

## In main, not on the live homepage

These are mounted by current `main` `app/page.js` and were not sections of the live homepage on 21 Nov 2026.

- `components/BanksySection.jsx`, id `banksy`. The live nav still links here.
- `components/FoundationSection.jsx`, id `foundation`. H&E versus cell-state slider for AT14.
