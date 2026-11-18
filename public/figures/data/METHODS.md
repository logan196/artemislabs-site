# Methods: The Figure Booklet (neuro-omics figure packages, 2023-26)

Compiled by Artemis Biolabs. Corpus snapshot: 2026-10-15. Everything here can be regenerated from the scripts in this folder.

## 1. Corpus (systematic search)
* **Source:** Europe PMC REST API (`/webservices/rest/search`). It indexes open-access full text by section, so a term can be searched inside METHODS only.
* **Base query:** neuro terms in the title or abstract, AND omics terms in the abstract or METHODS, AND `PUB_YEAR:[2023 TO 2026]`, `OPEN_ACCESS:Y`, `HAS_FT:Y`, `SRC:MED`:

```
(TITLE:(neuron OR neurons OR neuronal OR brain OR cortex OR cortical OR hippocampus OR hippocampal OR neurodevelopment OR neurodevelopmental OR "neural progenitor" OR "neural stem" OR neurodegeneration OR neurodegenerative OR cerebellum OR "spinal cord" OR retina OR glia OR glial OR astrocyte OR astrocytes OR microglia OR oligodendrocyte OR "cerebral organoid" OR "brain organoid" OR Alzheimer OR Parkinson OR "nervous system") OR ABSTRACT:(neuron OR neurons OR neuronal OR brain OR cortex OR cortical OR hippocampus OR hippocampal OR neurodevelopment OR neurodevelopmental OR "neural progenitor" OR "neural stem" OR neurodegeneration OR neurodegenerative OR cerebellum OR "spinal cord" OR retina OR glia OR glial OR astrocyte OR astrocytes OR microglia OR oligodendrocyte OR "cerebral organoid" OR "brain organoid" OR Alzheimer OR Parkinson OR "nervous system")) AND (ABSTRACT:("single-cell RNA" OR "single-nucleus RNA" OR "single-cell sequencing" OR "scRNA-seq" OR "snRNA-seq" OR "RNA-seq" OR "RNA sequencing" OR "spatial transcriptomics" OR Visium OR MERFISH OR Xenium OR CosMx OR "Slide-seq" OR "Stereo-seq" OR CODEX OR "snATAC-seq" OR "scATAC-seq" OR multiome) OR METHODS:("single-cell RNA" OR "single-nucleus RNA" OR "single-cell sequencing" OR "scRNA-seq" OR "snRNA-seq" OR "RNA-seq" OR "RNA sequencing" OR "spatial transcriptomics" OR Visium OR MERFISH OR Xenium OR CosMx OR "Slide-seq" OR "Stereo-seq" OR CODEX OR "snATAC-seq" OR "scATAC-seq" OR multiome)) AND PUB_YEAR:[2023 TO 2026] AND OPEN_ACCESS:Y AND HAS_FT:Y AND SRC:MED
```
* **Corpus size:** 17,768 papers. By year: {2023: 3412, 2024: 4052, 2025: 5413, 2026: 4891}. 2026 is a partial year.
* **Modality tags** (term in abstract or METHODS; one paper can carry several): single-cell or multiome 6,887; spatial 1,376; any RNA-seq, bulk included, 16,397.
* **Full paper list:** `corpus_papers.csv` and the xlsx `Corpus` sheet, with PMCID, DOI, journal, year, citation count, modality flags, and which packages each paper mentions.

## 2. Package screening and counting
* I screened 212 candidate packages and tools, listed in `candidates.py`. Each entry has its search phrases and, for ambiguous names, a context clause. Examples: `patchwork` must appear with ggplot2, "R package" or CRAN. `Signac` must appear with ATAC or chromatin. `slingshot` must appear with trajectory or pseudotime. `MAST` needs hurdle or MAST-test wording, so mast cells aren't counted. `PROGENy` needs pathway-activity wording, so "progeny" (offspring) isn't counted.
* **paper_count** is the number of corpus papers whose **METHODS** section mentions the package. **fulltext_any_count** counts the same terms anywhere in the paper and is given for comparison.
* **Ranking scope:** only tools that make figures. That covers dedicated plotting libraries, analysis packages with built-in plotting (Seurat, DESeq2 and so on), and web or desktop tools whose figures get published (Cytoscape, Metascape, IGV). Analysis-only, QC and data-container packages (Harmony, DoubletFinder, GSVA, DAVID, anndata and others) are left out of the ranking but still counted in the `Excluded` sheet. General GUI tools (GraphPad Prism, ImageJ/Fiji, Illustrator, BioRender, Excel) are in `GUI_tools`.

## 3. Example papers and figure links
For each top-100 package I took up to 10 of the most-cited corpus papers that mention it and parsed their Europe PMC `fullTextXML`. Each figure was scored as follows:
* +6 if the caption names the package
* +3 if the figure is cited in a paragraph that names the package
* +1 to +3 if the caption contains keywords for the figure type the package makes (heatmap, UMAP, volcano, pseudotime and so on)
* −2 if it is a supplementary or extended-data figure

Papers were then ranked by their best figure score, plus a bonus when the sentence naming the package uses plotting words. Up to 3 examples are kept per package. The **evidence** column quotes the caption or text where the package is named.
Each figure URL (`https://pmc.ncbi.nlm.nih.gov/articles/<PMCID>/figure/<fig-id>/`) was loaded in headless Chrome. 261 of 268 resolved. Figures that aren't hosted on PMC (some extended-data figures in author manuscripts) are flagged, and the article link is given instead.

## 4. Recreations (Phase 1)
* **Shared data:** `recreations/_data/prep_data.R`.
  * Bulk: `airway` (DESeq2, dexamethasone vs untreated).
  * Neuro single-cell: Zeisel et al. 2015, mouse somatosensory cortex and hippocampus CA1, 3,005 cells, from `scRNAseq::ZeiselBrainData`, processed with Seurat (UMAP, clusters, author cell types).
  * Python scripts read the same matrices through `_data/load_zeisel.py`.
* One folder per package: `recreations/<package>/`, containing a script plus `vN_<variation>.png`. Each script runs on its own with `Rscript <script>`, `python3 <script>` or `bash <script>`. `run_all.sh` reruns everything.
* **Live web APIs:** Enrichr (GSEApy), g:Profiler (gprofiler2, HTTPS), STRING (string-db.org API), so these need internet.
* **deepTools uses SIMULATED bigWigs.** Swap in real ENCODE or GEO bigWigs for production figures.
* **survminer** uses `coin::glioma` (Grana et al. 2002).
* **Network note:** gprofiler2 is pointed at its HTTPS endpoint.

## 5. Top 20 (METHODS mentions, % of 17,768 papers)
| rank | package | language | papers | % corpus | recreation |
|---|---|---|---|---|---|
| 1 | DESeq2 (plotPCA/plotMA) | R | 5668 | 31.9% | done |
| 2 | Seurat | R | 4671 | 26.29% | done |
| 3 | clusterProfiler | R | 3518 | 19.8% | done |
| 4 | ggplot2 | R | 2490 | 14.01% | done |
| 5 | GSEA (Broad) | Desktop | 2056 | 11.57% | done |
| 6 | limma | R | 2047 | 11.52% | done |
| 7 | edgeR | R | 1892 | 10.65% | done |
| 8 | Cytoscape | Desktop | 1501 | 8.45% | queued (not scriptable / see note) |
| 9 | pheatmap | R | 1119 | 6.3% | done |
| 10 | WGCNA | R | 884 | 4.98% | done |
| 11 | CellChat | R | 839 | 4.72% | done |
| 12 | STRING | Web | 838 | 4.72% | done |
| 13 | Enrichr | Web | 778 | 4.38% | done |
| 14 | scanpy | Python | 763 | 4.29% | done |
| 15 | Metascape | Web | 707 | 3.98% | queued (not scriptable / see note) |
| 16 | Ingenuity Pathway Analysis | Desktop | 678 | 3.82% | queued (not scriptable / see note) |
| 17 | ComplexHeatmap | R | 567 | 3.19% | done |
| 18 | g:Profiler | Web/R/Python | 563 | 3.17% | done |
| 19 | IGV | Desktop/Web | 549 | 3.09% | queued (not scriptable / see note) |
| 20 | fgsea | R | 478 | 2.69% | done |

## 6. Caveats
1. **Open-access bias.** Only papers with Europe PMC full text are included. Closed-access Cell, Neuron and Nature Neuroscience papers are missing unless they have an OA or author-manuscript copy.
2. **A mention doesn't prove figure use.** DESeq2, limma and edgeR rank high because they are cited for statistics. The `role` column and the evidence sentences help tell the two apart.
3. **Under-counting.** Tools listed only in Key Resources tables or Code Availability sections outside METHODS, or not named at all (matplotlib, ggplot2 are often unnamed), are under-counted. Compare with `fulltext_any_count`.
4. **Name ambiguity** is handled with context terms, but that isn't perfect: Harmony, Giotto and CARD are all common words or names.
5. **Topic noise.** The neuro filter works on the title or abstract, so a few off-topic papers that mention the brain in passing are included. One example is a UCSC Browser example about ape sex chromosomes.
6. **Not yet recreated:** web, GUI and commercial tools (Cytoscape, Metascape, IPA, IGV, QuPath, UCSC) and database-heavy tools (SCENIC). They're queued with style-equivalent plans (see `note`).

---
# Phase 2: mainstream continuation + "Niche & Cool" (requested redirect)

## 7. Niche & Cool ranking (sheet `Niche_Cool`, `niche_cool_catalog.csv`)
- Candidates: 73 newer/specialised visualisation tools (`niche_candidates.py`), each with search terms, GitHub repo,
  a curator visual-distinctiveness score (1-5) and its signature visual.
- Counts (`niche_count.py` -> `data/niche_counts.json`): Europe PMC full-text METHODS-section mentions per year, in two corpora:
  the neuro corpus (as Phase 1) and a broad open-access omics corpus with no neuro filter (bigger denominators,
  more stable growth estimates). Year denominators: neuro 3,412 / 4,052 / 5,413 / 4,891 (2023-2026);
  broad 28,714 / 33,012 / 42,965 / 35,775.
- growth_ratio = (broad mentions per 1k papers in 2025-26 + 0.01) / (broad mentions per 1k in 2023 + 0.01).
- niche_cool_score = 0.5 x percentile(growth_ratio) + 0.5 x visual_score/5. Ranked by this, not raw count.
- GitHub stars/created/last-push via read-only `gh api repos/<repo>` (`gh_stars.sh` -> `data/gh_stats.json`).
- Caveats: tools first released in 2023-24 have inflated ratios (near-zero 2023 base); counts < ~10 are noisy;
  the visual score is subjective; 2026 is a partial year (to mid-Oct).

## 8. Real neuro datasets used for recreations
Zeisel 2015 mouse S1 cortex/CA1 scRNA-seq (scRNAseq; Fluidigm C1 chip ID used as replicate for composition tests:
propeller, miloR, sccomp, Augur by tissue); La Manno 2018 dentate gyrus P12/P35 (scVelo; velocity, CellRank,
Palantir, Mellon, veloVI, scTour, moscot P12->P35 optimal transport, CytoTRACE 2); 10x Visium mouse coronal brain
(squidpy; Squidpy, Tangram, COMMOT, Loupe-style); Moffitt 2018 MERFISH hypothalamus; Maynard 2021 human DLPFC
151673 (STexampleData; spatialLIBD, ggspavis, BayesSpace, Banksy); Allen CCFv3 25 um (BrainGlobe; brainrender,
atlas overlays); NeuroVault/Harvard-Oxford (nilearn); PhysioNet EEGBCI S001 imagery runs (MNE);
Tirosh 2016 oligodendroglioma (inferCNV); scDRS data-release MAGMA gene sets (SCZ, BIP, MDD, AD, height control);
NicheNet v2 mouse priors (Zenodo 7074291). Non-neuro fallbacks are flagged in each script header and the
catalog note: ggcoverage (bundled HNRNPC RNA-seq bigWigs), Signac (bundled atac_small PBMC), plotgardener (IMR90).

## 9. Recreation conventions
One directory per tool under `recreations/`, one `*_recreate.{R,py,sh}` script, outputs `vN_<what>.png` (2-5 variations).
`run_all.sh` runs them sequentially (memory), LIANA_plus first (its tables feed pyCirclize, CellPhoneDB_ktplots,
circlize_chord), logs `recreations/<dir>/run.log` and `logs/run_all_status.tsv`.
Compatibility shims are commented inline: `np.Inf`/`np.float_` (COMMOT, scDRS on NumPy 2), `matplotlib.cm.get_cmap`
(PyComplexHeatmap), dense X for scTour (removed scipy `.A`), brainrender final frame drawn by vedo without depth
peeling (software-GL offscreen blanks translucent meshes), moscot Sankey re-drawn from the OT coupling (built-in
Sankey mis-draws), BayesSpace enhanced-gene maps via the same per-gene PC regression enhanceFeatures(nrounds=0) uses
(the full sub-spot assay OOMs), miloR built from source with `src/Makevars` C++11 flag removed.

## 10. Validation (audit, Oct 2026)
* **Counting method:** a package is counted once per paper whose Methods section names it (Europe PMC open-access full text, 2023–26). A mention shows the package was used; it does not show that it drew a particular published figure.
* **Precision check:** one random hit from each of 30 randomly chosen Top-100 packages (seed 2026), read by hand. The term referred to the intended package in 30/30 (95% CI 88–100%); the authors used it in 29/30 (83–100%; the miss was a passing mention of NicheNet); the paper explicitly tied it to a figure in 10/30 (17–53%).
* **Name collisions:** ambiguous names (e.g. GSEA, ggplot2-family terms, generic words) were queried with package-specific phrases, and broad terms were checked by hand during the precision sample.
* **Re-derivation:** every count, percentage, rank, growth ratio, score and star count was recomputed from the raw query outputs. One text error was corrected (21 recreated niche tools in 19 folders, not "19 tools").
* **Links:** all 141 DOIs resolve through the DOI handle API; all 168 PMC figure anchors exist in the Europe PMC full-text XML. No dead links were found.
* **Snapshot drift:** a re-query four days later found 17,801 papers (+0.2%); sampled package counts moved 0.1–0.2% with ranks unchanged.
* **Caveats:** open-access bias (paywalled papers are missed); growth ratios marked † rest on fewer than 5 broad-corpus mentions in 2023; recreations use public demo data (some non-neuro) and deepTools uses simulated signal.
