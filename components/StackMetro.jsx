"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Reveal from "./Reveal";
import { LogoBadge, badgeSize } from "./StackMetroMarks";
import {
  T_BOX, T_TRACK, T_LOAD, T_LOAD_END,
  PIPELINE, boxHeader, trackSpan, INITIAL_LIT, finalLit, completedLines,
  flowState, segmentPaint, stageRunTime,
  emptyCompute, liveCompute, CPU_TOTAL, GPU_TOTAL,
  artemisArc, ARTEMIS_MARK_SIZE, ARTEMIS_MARK_SIZE_COMPACT,
  CTRL_MS,
} from "./StackMetroRun";

/* ------------------------------------------------------------------ */
/* Section 08 as a transit map in the visual language of nf-metro     */
/* (MIT, Jonathan Manning / nf-core maps). Official logo chips and    */
/* nf-metro file-type documents sit at each station. The workspace    */
/* draws in on first intersection, Artemis loads, then an 8-stage     */
/* Nextflow-style terminal run lights the map in order: ingest, lit   */
/* review + pipeline selection, metadata reconciliation, adversarial  */
/* QC, normalize + integrate, analysis, annotation, portal delivery.  */
/* Lit stations stay lit; trains run only on already-activated track  */
/* prefixes. Station hover peeks at the code; a click opens a Demo    */
/* live run. Marks are nominative use only.                           */
/* ------------------------------------------------------------------ */

const BG = "#0a0a0b";
const BOX = "#141416";
const BOX_STROKE = "#3a3a3c";
const INK = "#f0f0f0";
const MUTED = "#b3b3b3";
const DIM = "#8a8a8a";
const TILE = "#f4f4f1";
const TILE_STROKE = "#2a2a2a";
const STROKE = 3.8;
const STROKE_FEED = 3.2;
const TRAIN_GAP = 0.016;

const C = {
  kw: "#c586c0",
  str: "#ce9178",
  com: "#6a9955",
  fn: "#dcdcaa",
  num: "#b5cea8",
  pl: "#d4d4d4",
  typ: "#4ec9b0",
  punc: "#808080",
};

const TRACKS = {
  spatial:    { id: "spatial",    label: "Spatial",         color: "#2BB5A0" },
  scrna:      { id: "scrna",      label: "scRNA",           color: "#8A6AA8" },
  bulk:       { id: "bulk",       label: "Bulk",            color: "#E0A050" },
  atac:       { id: "atac",       label: "ATAC / CUT&Tag",  color: "#4C9A78" },
  proteomics: { id: "proteomics", label: "Proteomics",      color: "#C46B8A" },
  methods:    { id: "methods",    label: "Methods",         color: "#9AA7A3" },
  pathways:   { id: "pathways",   label: "Pathways",        color: "#C84840" },
  delivery:   { id: "delivery",   label: "Delivery",        color: "#4A9FD4" },
};

const STATION_COPY = {
  geo:       { label: "GEO  ·  GSE/SOFT",                    blurb: "NCBI Gene Expression Omnibus. We pull raw series from accessions such as GSE194329 (SOFT and FASTQ)." },
  tenx:      { label: "10x  ·  Visium / Chromium",           blurb: "10x Genomics Visium and Chromium. Published matrices are the reference sections in our GBM demos." },
  cxg:       { label: "CZ CELLxGENE Discover",               blurb: "The CZI CELLxGENE Discover census. Published references used to sanity-check a cell-state call." },
  h5ad:      { label: "AnnData  ·  .h5ad",                   blurb: "A researcher-supplied AnnData file (.h5ad), already counted, ready to wrangle." },
  fastq:     { label: "FASTQ  ·  Illumina",                  blurb: "Raw paired-end reads from an Illumina run, staged with checksums before alignment." },
  atac:      { label: "ATAC / CUT&Tag  ·  BAM",              blurb: "Chromatin accessibility or CUT&Tag. chromap alignment and MACS3 peaks, then join the integrated object." },
  prot:      { label: "proteomics  ·  mzML",                 blurb: "Mass-spec protein abundances (mzML / MaxQuant evidence), aligned to the same sample sheet as the sequencing assays." },
  fetch:     { label: "fetch_accession",                     blurb: "Stage a GEO series, a 10x bundle, a CELLxGENE slice, or a user upload into a common store with a written manifest." },
  litreview: { label: "Literature review  ·  PubMed",        blurb: "PubMed literature review. Prior methods and cohort papers, retrieved before a pipeline is chosen." },
  pipeline:  { label: ["Pipeline selection", "nf-core / published methods"], blurb: "Pipeline selection. Match the study to a published method (nf-core or a paper-matched workflow) before the run is declared." },
  metadata:  { label: ["Metadata reconciliation", "CL / OBO Foundry"], blurb: "Metadata examination and reconciliation. Align sample sheets and map labels onto Cell Ontology (CL) via OBO Foundry." },
  norm:      { label: ["Normalize + integrate", "Harmony / scVI"], blurb: "Normalization and batch integration with Harmony (or scVI). Make counts comparable across samples before embedding." },
  advqc:     { label: ["Adversarial QC review", "SoupX / scDblFinder"], blurb: "One unified quality check. Every assay line passes through this review (scanpy.pp, SoupX, scDblFinder) before integrated analysis is allowed to proceed." },
  artemis:   { label: "Artemis agent",                       blurb: "The wrangling agent. It sequences and governs every stage, from ingest through portal delivery." },
  scanpy:    { label: "scanpy 1.10  ·  Python 3.12",         blurb: "scanpy 1.10 on Python 3.12. Clustering, neighbors, and pseudotime. The workhorse of our single-cell runs." },
  rlang:     { label: "Seurat 5  ·  Bioconductor 3.19",      blurb: "Seurat 5 and Bioconductor 3.19. The statistical lingua franca of genomics, used when a method ships as an R package." },
  nextflow:  { label: "Nextflow 24.10  ·  -profile hpc",     blurb: "Nextflow 24.10 with -profile hpc. Workflow engine for runs too large for a notebook. Every step declared, containerized, and resumable." },
  umap:      { label: "UMAP  ·  neighbors / embed",          blurb: "UMAP embedding of expression space, always shown beside the tissue it came from." },
  banksy:    { label: "BANKSY  ·  spatial domains",          blurb: "Spatial domain detection with BANKSY 0.1.9. Neighborhood-augmented clustering of tissue domains." },
  de:        { label: "DE  ·  Wilcoxon / pyDESeq2",          blurb: "Differential expression. Wilcoxon or pyDESeq2, ranking genes that distinguish a domain or cell state from the rest of the section." },
  annotate:  { label: ["Annotation", "CellTypist / CL"],     blurb: "Cell-type annotation with CellTypist transfer, then map onto Cell Ontology." },
  pathway:   { label: "Pathway enrichment",                  blurb: "Pathway enrichment. Test a marker list against KEGG, Reactome, STRING, and Enrichr." },
  kegg:      { label: "KEGG",                                blurb: "KEGG pathway maps for enrichment calls: which signaling programs a cluster is running." },
  reactome:  { label: "Reactome",                            blurb: "Reactome curated human pathway hierarchy, read next to KEGG before calling a program." },
  string:    { label: "STRING",                              blurb: "STRING protein-protein interaction networks, for asking whether a marker set hangs together." },
  enrichr:   { label: "Enrichr",                             blurb: "Enrichr. One gene list in, ranked enrichment across hundreds of libraries out." },
  zarr:      { label: "Zarr  ·  object store",               blurb: "The chunked Zarr store every Vitessce portal on this site is served from." },
  vitessce:  { label: "Vitessce  ·  view config",            blurb: "Vitessce view config. Linked UMAP, tissue, and expression panels in the browser." },
  jupyter:   { label: "JupyterLab  ·  analysis nb",          blurb: "JupyterLab. Exploratory home base. Analyses start as notebooks so every figure keeps the code that made it." },
  report:    { label: "HTML report  ·  MultiQC",             blurb: "A written delivery: methods, figures, MultiQC, and the portal link, ready for the collaborator." },
};

const LOGOS = {
  geo:       { src: "logos/geo.png", wide: true },
  tenx:      { src: "logos/tenx.svg", wide: true },
  cxg:       { src: "logos/cellxgene-wordmark.svg", wide: true, xl: true },
  h5ad:      { file: "H5AD", fileColor: "#E07A3D" },
  fastq:     { file: "FASTQ", fileColor: "#3D8C6E" },
  atac:      { file: "BAM", fileColor: "#4C9A78" },
  prot:      { file: "MZML", fileColor: "#C46B8A" },
  fetch:     { glyph: "fetch" },
  litreview: { src: "logos/pubmed-wordmark.svg", wide: true },
  pipeline:  { glyph: "pipeline" },
  metadata:  { glyph: "ontology" },
  norm:      { glyph: "norm" },
  advqc:     { glyph: "qc", accent: true },
  scanpy:    { src: "logos/scanpy.svg", extra: "logos/python.svg", wide: true },
  rlang:     { src: "logos/r.svg", extra: "logos/bioconductor-wordmark.svg", extraFrac: 0.72, chipW: 184 },
  nextflow:  { src: "logos/nextflow-wordmark.svg", wide: true, xl: true },
  umap:      { glyph: "umap" },
  banksy:    { glyph: "banksy" },
  de:        { glyph: "de" },
  annotate:  { glyph: "annotate" },
  pathway:   { glyph: "pathway" },
  kegg:      { src: "logos/kegg.png", wide: true },
  reactome:  { src: "logos/reactome.png", wide: true },
  string:    { src: "logos/string.png", wide: true },
  enrichr:   { src: "logos/enrichr.png", wide: true },
  vitessce:  { src: "logos/vitessce.png", wide: true },
  jupyter:   { src: "logos/jupyter.svg" },
  zarr:      { src: "logos/zarr.svg", wide: true },
  report:    { file: "HTML", fileColor: "#4A9FD4" },
};

const INPUT_IDS = ["geo", "tenx", "cxg", "h5ad", "fastq", "atac", "prot"];
const ANAL_IDS = ["scanpy", "rlang", "nextflow", "umap", "banksy", "de"];
const LATER_IDS = ["annotate", "pathway", "kegg", "reactome", "string", "enrichr", "zarr", "vitessce", "jupyter", "report"];

const KW_RE = /\b(import|from|as|def|class|return|if|elif|else|for|in|with|try|except|not|and|or|True|False|None|yield|lambda|pass|break|continue|assert|process|workflow|take|emit|input|output|script|params|include|nextflow|print|raise|while)\b/;

function highlightLine(text) {
  if (!text) return [];
  const trimmed = text.trimStart();
  if (trimmed.startsWith("#") || trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) {
    return [[C.com, text]];
  }
  const parts = [];
  const re = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_][A-Za-z0-9_]*(?=\s*\())|(\b[A-Za-z_][A-Za-z0-9_]*\b)|(\s+)|(.)/g;
  let m;
  while ((m = re.exec(text))) {
    if (m[1]) parts.push([C.str, m[1]]);
    else if (m[2]) parts.push([C.num, m[2]]);
    else if (m[3]) parts.push([C.fn, m[3]]);
    else if (m[4]) parts.push([KW_RE.test(m[4]) ? C.kw : C.pl, m[4]]);
    else if (m[5]) parts.push([C.pl, m[5]]);
    else parts.push([C.punc, m[6]]);
  }
  return parts;
}

const STATION_CODE = {
  geo: { file: "fetch_geo.py", start: 1, lines: [
    "from artemis.fetch import geo",
    "",
    "accession = \"GSE194329\"",
    "bundle = geo.pull(accession, dest=\"data/raw/geo\")",
    "print(f\"fetched {len(bundle.samples)} samples from {accession}\")",
  ]},
  tenx: { file: "ingest_10x.py", start: 1, lines: [
    "from artemis.fetch import visium, chromium",
    "",
    "spatial = visium.read(\"data/raw/Visium_GBM3\")",
    "gex = chromium.read(\"data/raw/Chromium_PBMC\")",
    "print(spatial.n_obs, \"spots;\", gex.n_obs, \"cells\")",
  ]},
  cxg: { file: "slice_cellxgene.py", start: 1, lines: [
    "import cellxgene_census",
    "",
    "with cellxgene_census.open_soma() as census:",
    "    adata = cellxgene_census.get_anndata(",
    "        census, organism=\"Homo sapiens\",",
    "        obs_value_filter=\"tissue_general == 'brain'\",",
    "    )",
  ]},
  h5ad: { file: "load_h5ad.py", start: 1, lines: [
    "import scanpy as sc",
    "",
    "adata = sc.read_h5ad(\"data/user/GBM3_visium.h5ad\")",
    "assert \"spatial\" in adata.obsm",
    "print(adata.n_obs, \"spots x\", adata.n_vars, \"genes\")",
  ]},
  fastq: { file: "stage_fastq.py", start: 1, lines: [
    "from pathlib import Path",
    "from artemis.fetch import stage_reads",
    "",
    "reads = list(Path(\"data/raw/fastq\").glob(\"*.fastq.gz\"))",
    "manifest = stage_reads(reads, layout=\"paired\")",
    "print(f\"staged {len(manifest)} libraries\")",
  ]},
  atac: { file: "atac_cuttag.nf", start: 1, lines: [
    "nextflow.enable.dsl = 2",
    "include { CHROMAP; MACS3 } from \"./modules/chromatin\"",
    "",
    "workflow {",
    "    reads = Channel.fromFilePairs(params.atac_fastq)",
    "    CHROMAP(reads, params.genome)",
    "    MACS3(CHROMAP.out.bam)",
    "}",
  ]},
  prot: { file: "load_proteomics.py", start: 1, lines: [
    "import pandas as pd",
    "from artemis.protein import join_sample_sheet",
    "",
    "ms = pd.read_csv(\"data/raw/proteomics.tsv\", sep=\"\\t\")",
    "prot = join_sample_sheet(ms, sheet=\"meta/samples.csv\")",
    "print(prot.shape[0], \"proteins;\", prot.shape[1], \"samples\")",
  ]},
  fetch: { file: "fetch_all.py", start: 1, lines: [
    "from artemis.fetch import ingest",
    "",
    "store = ingest.run(",
    "    geo=\"GSE194329\",",
    "    visium=\"data/raw/Visium_GBM3\",",
    "    h5ad=\"data/user/GBM3_visium.h5ad\",",
    "    atac=\"data/raw/cuttag\",",
    "    proteomics=\"data/raw/proteomics.tsv\",",
    ")",
  ]},
  litreview: { file: "pubmed_review.py", start: 1, lines: [
    "from artemis.lit import pubmed",
    "",
    "hits = pubmed.search(",
    "    \"BANKSY spatial domain glioblastoma\",",
    "    retmax=25,",
    ")",
    "review = pubmed.summarize(hits, focus=\"methods\")",
    "print(len(hits), \"papers scored for pipeline selection\")",
  ]},
  pipeline: { file: "select_pipeline.py", start: 1, lines: [
    "from artemis.methods import match_published",
    "",
    "choice = match_published(",
    "    assays=[\"visium\", \"scrna\", \"cuttag\", \"proteomics\"],",
    "    review=review,",
    "    prefer=\"peer-reviewed, runnable\",",
    ")",
    "print(\"selected\", choice.name, choice.citation)",
  ]},
  metadata: { file: "harmonize_metadata.py", start: 1, lines: [
    "from artemis.meta import reconcile",
    "from cell_ontology import map_labels",
    "",
    "sheet = reconcile.read(\"meta/samples.csv\")",
    "sheet = map_labels(sheet, ontology=\"CL\", column=\"cell_type\")",
    "sheet.to_csv(\"meta/samples.harmonized.csv\")",
    "print(\"unmapped labels:\", sheet.attrs[\"unmapped\"])",
  ]},
  norm: { file: "integrate.py", start: 1, lines: [
    "import scanpy as sc",
    "from artemis.integrate import harmony",
    "",
    "sc.pp.normalize_total(adata, target_sum=1e4)",
    "sc.pp.log1p(adata)",
    "sc.pp.highly_variable_genes(adata, batch_key=\"donor\")",
    "adata = harmony.run(adata, batch_key=\"donor\")",
  ]},
};

Object.assign(STATION_CODE, {
  advqc: { file: "adversarial_qc.py", start: 1, lines: [
    "from artemis.qc import adversarial_review",
    "",
    "report = adversarial_review(",
    "    assays=[\"spatial\", \"scrna\", \"bulk\", \"atac\", \"proteomics\"],",
    "    checks=[\"n_counts\", \"doublets\", \"ambient\", \"batch\", \"oracles\"],",
    ")",
    "assert report.pass_count >= 4",
    "print(report.summary())",
  ]},
  artemis: { file: "agent_route.py", start: 1, lines: [
    "from artemis.agent import route",
    "",
    "plan = route.plan(",
    "    inputs=store.assays,",
    "    methods=choice,",
    "    qc=report,",
    ")",
    "route.run(plan, on_event=log.append)",
    "print(\"integrated object ->\", plan.out)",
  ]},
  scanpy: { file: "scanpy_cluster.py", start: 1, lines: [
    "import scanpy as sc",
    "",
    "sc.pp.neighbors(adata, n_neighbors=15, use_rep=\"X_pca\")",
    "sc.tl.leiden(adata, resolution=0.6)",
    "sc.tl.umap(adata)",
    "sc.tl.rank_genes_groups(adata, groupby=\"leiden\", method=\"wilcoxon\")",
  ]},
  rlang: { file: "bioc_de.R", start: 1, lines: [
    "library(DESeq2)",
    "library(BiocParallel)",
    "",
    "dds <- DESeqDataSetFromMatrix(counts, colData, ~ condition + batch)",
    "dds <- DESeq(dds, parallel = TRUE)",
    "res <- results(dds, contrast = c(\"condition\", \"tumor\", \"ctrl\"))",
  ]},
  nextflow: { file: "main.nf", start: 1, lines: [
    "nextflow.enable.dsl = 2",
    "include { FASTQC; STAR; FEATURECOUNTS } from \"./modules/bulk\"",
    "include { CHROMAP; MACS3 } from \"./modules/chromatin\"",
    "",
    "workflow {",
    "    FASTQC(params.reads)",
    "    STAR(params.reads, params.genome)",
    "    FEATURECOUNTS(STAR.out.bam)",
    "}",
  ]},
  umap: { file: "embed_umap.py", start: 1, lines: [
    "import scanpy as sc",
    "",
    "sc.tl.umap(adata, min_dist=0.3, spread=1.0)",
    "adata.obsm[\"X_umap_joint\"] = joint.embed(adata, keys=[\"gex\", \"atac\"])",
    "print(\"UMAP ready:\", adata.obsm[\"X_umap\"].shape)",
  ]},
  banksy: { file: "run_banksy.py", start: 1, lines: [
    "from banksy.main import run_banksy_multiparam",
    "",
    "adata = run_banksy_multiparam(",
    "    adata, coord_keys=(\"x\", \"y\"),",
    "    lambda_list=[0.2], histeq=False,",
    ")",
    "adata.obs[\"domain\"] = adata.obs[\"banksy_lambda_0.2\"]",
    "print(adata.obs[\"domain\"].value_counts())",
  ]},
  de: { file: "differential.py", start: 1, lines: [
    "import scanpy as sc",
    "",
    "sc.tl.rank_genes_groups(",
    "    adata, groupby=\"domain\", method=\"wilcoxon\",",
    "    pts=True, key_added=\"de_domains\",",
    ")",
    "markers = sc.get.rank_genes_groups_df(adata, group=\"7\", key=\"de_domains\")",
    "markers.head(25).to_csv(\"out/de_domain7.csv\")",
  ]},
  annotate: { file: "annotate_celltypes.py", start: 1, lines: [
    "from artemis.annotate import transfer",
    "",
    "labels = transfer.celltypist(adata, model=\"Developing_Human_Brain\")",
    "adata.obs[\"cell_type\"] = labels.map_ontology(\"CL\")",
    "print(adata.obs[\"cell_type\"].value_counts())",
  ]},
  pathway: { file: "enrich_pathways.py", start: 1, lines: [
    "from artemis.enrich import run_libraries",
    "",
    "res = run_libraries(",
    "    genes=markers.names[:100],",
    "    libraries=[\"KEGG\", \"Reactome\", \"STRING\", \"Enrichr\"],",
    ")",
    "res.to_csv(\"out/pathways.csv\")",
  ]},
  kegg: { file: "kegg_enrich.py", start: 1, lines: [
    "from gseapy import enrichr",
    "",
    "kegg = enrichr(gene_list=markers.names[:100], gene_sets=\"KEGG_2021_Human\")",
    "print(kegg.results.head(8)[[\"Term\", \"Adjusted P-value\"]])",
  ]},
  reactome: { file: "reactome_enrich.py", start: 1, lines: [
    "from gseapy import enrichr",
    "",
    "rea = enrichr(gene_list=markers.names[:100], gene_sets=\"Reactome_2022\")",
    "print(rea.results.head(8)[[\"Term\", \"Adjusted P-value\"]])",
  ]},
  string: { file: "string_network.py", start: 1, lines: [
    "from artemis.networks import stringdb",
    "",
    "net = stringdb.graph(markers.names[:80], species=9606, score=0.7)",
    "print(net.number_of_nodes(), \"nodes;\", net.number_of_edges(), \"edges\")",
  ]},
  enrichr: { file: "enrichr_run.py", start: 1, lines: [
    "from gseapy import enrichr",
    "",
    "enr = enrichr(",
    "    gene_list=markers.names[:100],",
    "    gene_sets=[\"GO_Biological_Process_2023\", \"MSigDB_Hallmark_2020\"],",
    ")",
    "enr.results.to_csv(\"out/enrichr.csv\")",
  ]},
  zarr: { file: "write_zarr.py", start: 1, lines: [
    "from anndata import AnnData",
    "import spatialdata as sd",
    "",
    "sdata = sd.SpatialData(tables={\"gex\": adata}, images={\"he\": he})",
    "sdata.write(\"out/GBM3.zarr\")",
    "print(\"wrote out/GBM3.zarr\")",
  ]},
  vitessce: { file: "generate_vitessce_config.py", start: 1, lines: [
    "from vitessce import VitessceConfig, Component as cm",
    "",
    "vc = VitessceConfig(schema_version=\"1.0.16\", name=\"GBM3\")",
    "ds = vc.add_dataset(name=\"GBM3\").add_object(adata)",
    "vc.add_view(cm.SPATIAL, dataset=ds)",
    "vc.add_view(cm.SCATTERPLOT, dataset=ds, mapping=\"UMAP\")",
    "vc.export(\"out/vitessce.json\")",
  ]},
  jupyter: { file: "explore.ipynb.py", start: 1, lines: [
    "import scanpy as sc",
    "import spatialdata_plot",
    "",
    "adata = sc.read_h5ad(\"out/GBM3_integrated.h5ad\")",
    "sc.pl.umap(adata, color=[\"domain\", \"cell_type\"], show=False)",
    "adata.sdata.pl.render_images().pl.render_shapes().pl.show()",
  ]},
  report: { file: "write_report.py", start: 1, lines: [
    "from artemis.report import render",
    "",
    "render(",
    "    methods=choice,",
    "    qc=report,",
    "    figures=[\"umap\", \"domains\", \"pathways\"],",
    "    portal=\"out/vitessce.json\",",
    "    dest=\"out/report.html\",",
    ")",
  ]},
});

const RUN_LOGS = {
  default: [
    "$ python run.py",
    "[1/4] loading inputs...",
    "[2/4] wrangling...",
    "[3/4] review passed",
    "[4/4] writing outputs",
    "done.",
  ],
  geo: ["$ python fetch_geo.py --acc GSE194329", "resolving accession...", "downloaded 12 samples (3.4 GB)", "done."],
  tenx: ["$ python ingest_10x.py --visium data/raw/Visium_GBM3", "reading filtered_feature_bc_matrix.h5", "1,775 spots x 36,601 genes", "done."],
  cxg: ["$ python slice_cellxgene.py --tissue brain", "opening SOMA census...", "slice: 50,000 cells", "done."],
  h5ad: ["$ python load_h5ad.py data/user/GBM3_visium.h5ad", "AnnData: 1,775 x 36,601", "spatial coords present", "done."],
  fastq: ["$ python stage_fastq.py data/raw/fastq", "paired libraries: 8", "checksums ok", "done."],
  atac: ["$ nextflow run atac_cuttag.nf -resume", "CHROMAP [100%]", "MACS3 peaks: 42,118", "done."],
  prot: ["$ python load_proteomics.py", "4,812 proteins x 16 samples", "joined to sample sheet", "done."],
  fetch: ["$ python fetch_all.py", "5 assays staged in data/store", "done."],
  litreview: ["$ python pubmed_review.py", "25 papers retrieved", "methods scored", "done."],
  pipeline: ["$ python select_pipeline.py", "selected: BANKSY + scanpy + nf-core/atac", "done."],
  metadata: ["$ python harmonize_metadata.py", "mapped 41 / 44 labels to CL", "3 unmapped, flagged", "done."],
  norm: ["$ python integrate.py", "Harmony integration, 4 batches", "done."],
  advqc: ["$ python adversarial_qc.py", "spatial PASS", "scrna PASS", "bulk PASS", "atac PASS", "proteomics FLAG  ambient carryover", "review: 4 pass, 1 flag", "done."],
  artemis: ["$ artemis route --plan GBM3", "routing 5 assays through QC", "integrated object written", "done."],
  scanpy: ["$ python scanpy_cluster.py", "neighbors on X_pca", "Leiden: 12 clusters", "done."],
  rlang: ["$ Rscript bioc_de.R", "DESeq2 with 16 samples", "1,204 genes at padj < 0.05", "done."],
  nextflow: ["$ nextflow run main.nf -resume", "FASTQC [100%]", "STAR [100%]", "FEATURECOUNTS [100%]", "done."],
  umap: ["$ python embed_umap.py", "UMAP (n=1,775 + 8,432)", "done."],
  banksy: ["$ python run_banksy.py --lambda 0.2", "domains: 8", "domain 7: 97 spots", "done."],
  de: ["$ python differential.py --group 7", "Wilcoxon on domain 7 vs rest", "wrote out/de_domain7.csv", "done."],
  annotate: ["$ python annotate_celltypes.py", "CellTypist transfer", "mapped onto CL", "done."],
  pathway: ["$ python enrich_pathways.py", "KEGG + Reactome + STRING + Enrichr", "wrote out/pathways.csv", "done."],
  kegg: ["$ python kegg_enrich.py", "top: HIF-1 signaling (padj=1.2e-6)", "done."],
  reactome: ["$ python reactome_enrich.py", "top: Extracellular matrix organization", "done."],
  string: ["$ python string_network.py", "80 proteins, 214 edges", "done."],
  enrichr: ["$ python enrichr_run.py", "Hallmark: HYPOXIA (padj=3.4e-5)", "done."],
  zarr: ["$ python write_zarr.py", "wrote out/GBM3.zarr", "done."],
  vitessce: ["$ python generate_vitessce_config.py", "views: spatial, umap, genes", "exported out/vitessce.json", "done."],
  jupyter: ["$ jupyter execute explore.ipynb", "kernel python3", "wrote explore.nb.html", "done."],
  report: ["$ python write_report.py", "methods, figures, portal link", "wrote out/report.html", "done."],
};

function roundedPath(points, radius = 14) {
  if (!points || points.length < 2) return "";
  const pts = points.map((p) => ({ x: p[0], y: p[1] }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1];
    const v1x = p1.x - p0.x, v1y = p1.y - p0.y;
    const v2x = p2.x - p1.x, v2y = p2.y - p1.y;
    const l1 = Math.hypot(v1x, v1y) || 1;
    const l2 = Math.hypot(v2x, v2y) || 1;
    const rr = Math.min(radius, l1 / 2, l2 / 2);
    d += ` L ${p1.x - (v1x / l1) * rr} ${p1.y - (v1y / l1) * rr} Q ${p1.x} ${p1.y} ${p1.x + (v2x / l2) * rr} ${p1.y + (v2y / l2) * rr}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

function roundedRectPath(x, y, w, h, r = 10) {
  const rr = Math.min(r, w / 2, h / 2);
  return `M ${x + rr} ${y} H ${x + w - rr} Q ${x + w} ${y} ${x + w} ${y + rr} V ${y + h - rr} Q ${x + w} ${y + h} ${x + w - rr} ${y + h} H ${x + rr} Q ${x} ${y + h} ${x} ${y + h - rr} V ${y + rr} Q ${x} ${y} ${x + rr} ${y} Z`;
}

function labelLines(copy) {
  if (!copy) return [""];
  if (Array.isArray(copy.label)) return copy.label;
  return [copy.label];
}

/* Thin dashed control rail from the agent to every stage box.
   Shared spine is drawn once; only short dock ticks and pulses are per stage. */
function controlNetwork(L) {
  const boxes = {};
  L.boxes.forEach((b) => { boxes[b.id] = b; });
  const ax = L.stations.artemis.x;
  const ay = L.stations.artemis.y;
  const markR = (L.compact ? ARTEMIS_MARK_SIZE_COMPACT : ARTEMIS_MARK_SIZE) * 0.56;
  if (L.vertical) {
    const railX = 8;
    const docks = L.boxes.map((b) => ({ id: b.id, x: b.x, y: b.y + 24 }));
    const skeleton = [
      `M ${railX} ${docks[0].y} L ${railX} ${docks[docks.length - 1].y}`,
      `M ${ax - markR} ${ay} L ${railX} ${ay}`,
    ];
    const routes = docks.map((d) => ({
      id: d.id,
      d: `M ${ax - markR} ${ay} L ${railX} ${ay} L ${railX} ${d.y} L ${d.x} ${d.y}`,
      branch: `M ${railX} ${d.y} L ${d.x} ${d.y}`,
      dock: { x: d.x, y: d.y },
    }));
    return { skeleton, routes };
  }
  const railY = 36;
  const spineX = 338;
  const gapY = 612;
  const startX = ax;
  const startY = ay + markR;
  const mid = (b) => b.x + b.w / 2;
  const drop = {
    inputs: mid(boxes.inputs),
    wrangle: mid(boxes.wrangle),
    analysis: mid(boxes.analysis),
    pathways: mid(boxes.pathways),
  };
  const portalY = boxes.portal.y + boxes.portal.h / 2;
  const computeY = boxes.compute.y + boxes.compute.h / 2;
  const skeleton = [
    `M ${startX} ${startY} L ${startX} ${gapY} L ${spineX} ${gapY} L ${spineX} ${railY}`,
    `M ${drop.inputs} ${railY} L ${drop.pathways} ${railY}`,
    `M ${spineX} ${gapY} L ${spineX} ${computeY}`,
  ];
  const viaRail = (x, y) =>
    `M ${startX} ${startY} L ${startX} ${gapY} L ${spineX} ${gapY} L ${spineX} ${railY} L ${x} ${railY} L ${x} ${y}`;
  const routes = [
    { id: "inputs", d: viaRail(drop.inputs, boxes.inputs.y), branch: `M ${drop.inputs} ${railY} L ${drop.inputs} ${boxes.inputs.y}`, dock: { x: drop.inputs, y: boxes.inputs.y } },
    { id: "wrangle", d: viaRail(drop.wrangle, boxes.wrangle.y), branch: `M ${drop.wrangle} ${railY} L ${drop.wrangle} ${boxes.wrangle.y}`, dock: { x: drop.wrangle, y: boxes.wrangle.y } },
    { id: "analysis", d: viaRail(drop.analysis, boxes.analysis.y), branch: `M ${drop.analysis} ${railY} L ${drop.analysis} ${boxes.analysis.y}`, dock: { x: drop.analysis, y: boxes.analysis.y } },
    { id: "pathways", d: viaRail(drop.pathways, boxes.pathways.y), branch: `M ${drop.pathways} ${railY} L ${drop.pathways} ${boxes.pathways.y}`, dock: { x: drop.pathways, y: boxes.pathways.y } },
    { id: "portal", d: `M ${startX} ${startY} L ${startX} ${gapY} L ${spineX} ${gapY} L ${spineX} ${portalY} L ${boxes.portal.x} ${portalY}`, branch: `M ${spineX} ${portalY} L ${boxes.portal.x} ${portalY}`, dock: { x: boxes.portal.x, y: portalY } },
    { id: "compute", d: `M ${startX} ${startY} L ${startX} ${gapY} L ${spineX} ${gapY} L ${spineX} ${computeY} L ${boxes.compute.x} ${computeY}`, branch: `M ${spineX} ${computeY} L ${boxes.compute.x} ${computeY}`, dock: { x: boxes.compute.x, y: computeY } },
  ];
  return { skeleton, routes };
}

function layoutDesktop() {
  const W = 1520;
  const H = 1040;
  const boxes = [
    { id: "inputs",   n: "1",   title: "Ingest",                 x: 20,   y: 44,  w: 310, h: 560 },
    { id: "wrangle",  n: "2-5", title: "Wrangling",              x: 346,  y: 44,  w: 400, h: 560 },
    { id: "analysis", n: "6",   title: "Analysis",               x: 762,  y: 44,  w: 360, h: 560 },
    { id: "pathways", n: "7",   title: "Annotation & pathways",  x: 1138, y: 44,  w: 362, h: 560 },
    { id: "portal",   n: "8",   title: "Portal & delivery",      x: 346,  y: 620, w: 1154, h: 248 },
    { id: "compute",  n: "HPC", title: "Compute  ·  SLURM",      x: 346,  y: 884, w: 1154, h: 136 },
  ];

  const S = {
    geo:       { x: 236, y: 110 },
    tenx:      { x: 236, y: 182 },
    cxg:       { x: 236, y: 254 },
    h5ad:      { x: 236, y: 326 },
    fastq:     { x: 236, y: 398 },
    atac:      { x: 236, y: 470 },
    prot:      { x: 236, y: 542 },
    litreview: { x: 420, y: 118 },
    pipeline:  { x: 640, y: 118 },
    fetch:     { x: 420, y: 220 },
    metadata:  { x: 420, y: 330 },
    norm:      { x: 640, y: 330 },
    advqc:     { x: 530, y: 430 },
    artemis:   { x: 640, y: 530, interchange: true },
    scanpy:    { x: 840, y: 126 },
    rlang:     { x: 1028, y: 126 },
    nextflow:  { x: 934, y: 240 },
    umap:      { x: 840, y: 360 },
    banksy:    { x: 1028, y: 360 },
    de:        { x: 934, y: 490 },
    annotate:  { x: 1230, y: 126 },
    pathway:   { x: 1230, y: 220 },
    kegg:      { x: 1420, y: 280 },
    reactome:  { x: 1420, y: 350 },
    string:    { x: 1420, y: 420 },
    enrichr:   { x: 1420, y: 490 },
    zarr:      { x: 460, y: 710 },
    vitessce:  { x: 680, y: 710 },
    jupyter:   { x: 980, y: 710 },
    report:    { x: 1280, y: 790 },
  };

  const viaA = (inDeg, outDeg) => artemisArc(S.artemis.x, S.artemis.y, inDeg, outDeg, ARTEMIS_MARK_SIZE);

  const tracks = [
    {
      id: "spatial",
      color: TRACKS.spatial.color,
      through: ["tenx", "fetch", "advqc", "artemis", "banksy", "zarr", "vitessce"],
      d: roundedPath([
        [S.tenx.x, S.tenx.y], [346, S.tenx.y], [346, S.fetch.y], [S.fetch.x, S.fetch.y],
        [S.fetch.x, S.advqc.y], [S.advqc.x, S.advqc.y],
        [viaA(230, 330)[0][0], S.advqc.y], ...viaA(230, 330),
        [762, S.artemis.y - 8], [S.banksy.x, S.artemis.y - 8], [S.banksy.x, S.banksy.y],
        [S.banksy.x, 604], [S.zarr.x, 604], [S.zarr.x, S.zarr.y], [S.vitessce.x, S.vitessce.y],
      ], 16),
    },
    {
      id: "scrna",
      color: TRACKS.scrna.color,
      through: ["cxg", "fetch", "metadata", "norm", "advqc", "artemis", "scanpy", "umap", "de", "annotate", "jupyter"],
      d: roundedPath([
        [S.cxg.x, S.cxg.y], [354, S.cxg.y], [354, S.fetch.y], [S.fetch.x, S.fetch.y],
        [S.fetch.x, S.metadata.y], [S.metadata.x, S.metadata.y], [S.norm.x, S.norm.y],
        [S.norm.x, S.advqc.y], [S.advqc.x, S.advqc.y],
        [viaA(220, 10)[0][0], S.advqc.y], ...viaA(220, 10),
        [762, S.artemis.y + 8], [S.scanpy.x, S.artemis.y + 8], [S.scanpy.x, S.scanpy.y],
        [S.scanpy.x, S.umap.y], [S.umap.x, S.umap.y], [S.umap.x, S.de.y], [S.de.x, S.de.y],
        [1138, S.de.y], [1138, S.annotate.y], [S.annotate.x, S.annotate.y],
        [S.annotate.x, 604], [S.jupyter.x, 604], [S.jupyter.x, S.jupyter.y],
      ], 16),
    },
    {
      id: "scrna-h5ad",
      color: TRACKS.scrna.color,
      through: ["h5ad", "fetch"],
      feeder: true,
      d: roundedPath([[S.h5ad.x, S.h5ad.y], [354, S.h5ad.y], [354, S.fetch.y], [S.fetch.x, S.fetch.y]], 14),
    },
    {
      id: "bulk",
      color: TRACKS.bulk.color,
      through: ["geo", "fetch", "advqc", "artemis", "nextflow", "rlang", "kegg", "reactome", "report"],
      d: roundedPath([
        [S.geo.x, S.geo.y], [338, S.geo.y], [338, S.fetch.y], [S.fetch.x, S.fetch.y],
        [S.fetch.x, S.advqc.y], [S.advqc.x, S.advqc.y],
        [viaA(210, 0)[0][0], S.advqc.y], ...viaA(210, 0),
        [762, S.artemis.y], [S.nextflow.x, S.artemis.y], [S.nextflow.x, S.nextflow.y],
        [S.rlang.x, S.nextflow.y], [S.rlang.x, S.rlang.y],
        [1138, S.rlang.y], [1138, S.kegg.y], [S.kegg.x, S.kegg.y],
        [S.kegg.x, S.reactome.y], [S.reactome.x, S.reactome.y],
        [1488, S.reactome.y], [1488, S.report.y], [S.report.x, S.report.y],
      ], 16),
    },
    {
      id: "bulk-fastq",
      color: TRACKS.bulk.color,
      through: ["fastq", "fetch"],
      feeder: true,
      d: roundedPath([[S.fastq.x, S.fastq.y], [338, S.fastq.y], [338, S.fetch.y], [S.fetch.x, S.fetch.y]], 14),
    },
    {
      id: "atac",
      color: TRACKS.atac.color,
      through: ["atac", "fetch", "advqc", "artemis", "nextflow", "de"],
      d: roundedPath([
        [S.atac.x, S.atac.y], [362, S.atac.y], [362, S.fetch.y], [S.fetch.x, S.fetch.y],
        [S.fetch.x, S.advqc.y], [S.advqc.x, S.advqc.y],
        [viaA(240, 345)[0][0], S.advqc.y], ...viaA(240, 345),
        [762, S.artemis.y - 16], [S.nextflow.x, S.artemis.y - 16], [S.nextflow.x, S.nextflow.y],
        [S.nextflow.x, S.de.y], [S.de.x, S.de.y],
      ], 16),
    },
    {
      id: "proteomics",
      color: TRACKS.proteomics.color,
      through: ["prot", "fetch", "advqc", "artemis", "rlang", "string", "report"],
      d: roundedPath([
        [S.prot.x, S.prot.y], [370, S.prot.y], [370, S.advqc.y], [S.advqc.x, S.advqc.y],
        [viaA(200, 25)[0][0], S.advqc.y], ...viaA(200, 25),
        [762, S.artemis.y + 16], [S.rlang.x, S.artemis.y + 16], [S.rlang.x, S.rlang.y],
        [1138, S.rlang.y + 12], [1138, S.string.y], [S.string.x, S.string.y],
        [S.string.x, 604], [S.report.x, 604], [S.report.x, S.report.y],
      ], 16),
    },
    {
      id: "methods",
      color: TRACKS.methods.color,
      through: ["litreview", "pipeline", "metadata", "advqc", "artemis"],
      d: roundedPath([
        [S.litreview.x, S.litreview.y], [S.pipeline.x, S.pipeline.y],
        [S.pipeline.x, S.metadata.y], [S.metadata.x, S.metadata.y],
        [S.metadata.x, S.advqc.y], [S.advqc.x, S.advqc.y],
        [viaA(225, 225)[0][0], S.advqc.y], ...viaA(225, 225),
      ], 16),
    },
    {
      id: "pathways",
      color: TRACKS.pathways.color,
      through: ["de", "pathway", "kegg", "reactome", "string", "enrichr"],
      d: roundedPath([
        [S.de.x, S.de.y], [1138, S.de.y], [1138, S.pathway.y], [S.pathway.x, S.pathway.y],
        [S.pathway.x, S.kegg.y], [S.kegg.x, S.kegg.y],
        [S.kegg.x, S.reactome.y], [S.reactome.x, S.reactome.y],
        [S.reactome.x, S.string.y], [S.string.x, S.string.y],
        [S.string.x, S.enrichr.y], [S.enrichr.x, S.enrichr.y],
      ], 16),
    },
    {
      id: "pathways-banksy",
      color: TRACKS.pathways.color,
      through: ["banksy", "pathway"],
      feeder: true,
      d: roundedPath([[S.banksy.x, S.banksy.y], [1138, S.banksy.y], [1138, S.pathway.y], [S.pathway.x, S.pathway.y]], 14),
    },
    {
      id: "delivery",
      color: TRACKS.delivery.color,
      through: ["enrichr", "jupyter", "report"],
      d: roundedPath([
        [S.enrichr.x, S.enrichr.y], [1280, S.enrichr.y], [1280, 604],
        [S.jupyter.x, 604], [S.jupyter.x, S.jupyter.y],
        [S.jupyter.x, 760], [S.report.x, 760], [S.report.x, S.report.y],
      ], 16),
    },
    {
      id: "delivery-vitessce",
      color: TRACKS.delivery.color,
      through: ["zarr", "vitessce", "report"],
      feeder: true,
      d: roundedPath([
        [S.zarr.x, S.zarr.y], [S.vitessce.x, S.vitessce.y],
        [S.vitessce.x, 760], [S.report.x, 760], [S.report.x, S.report.y],
      ], 14),
    },
  ];

  const agent = roundedPath([
    [S.litreview.x, S.litreview.y], [S.pipeline.x, S.pipeline.y],
    [S.fetch.x, S.fetch.y], [S.metadata.x, S.metadata.y], [S.norm.x, S.norm.y],
    [S.advqc.x, S.advqc.y],
    [viaA(220, 10)[0][0], S.advqc.y], ...viaA(220, 10),
    [S.scanpy.x, S.scanpy.y], [S.umap.x, S.umap.y], [S.de.x, S.de.y],
    [S.annotate.x, S.annotate.y], [S.pathway.x, S.pathway.y],
    [S.zarr.x, S.zarr.y], [S.vitessce.x, S.vitessce.y], [S.jupyter.x, S.jupyter.y], [S.report.x, S.report.y],
  ], 16);

  const above = new Set(["fetch", "nextflow", "pathway", "zarr", "vitessce", "jupyter", "banksy"]);
  const labels = {};
  Object.keys(S).forEach((id) => {
    if (INPUT_IDS.includes(id)) {
      const { w } = badgeSize(LOGOS[id], false);
      labels[id] = { anchor: "end", dx: -(w / 2 + 10), dy: 4 };
    }
    else if (["kegg", "reactome", "string", "enrichr"].includes(id)) labels[id] = { anchor: "end", dx: -62, dy: 4 };
    else if (id === "artemis") labels[id] = { anchor: "middle", dx: 0, dy: 72 };
    else if (id === "report") labels[id] = { anchor: "middle", dx: 0, dy: 42 };
    else if (id === "metadata") labels[id] = { anchor: "end", dx: -32, dy: 4 };
    else if (id === "norm") labels[id] = { anchor: "start", dx: 32, dy: 4 };
    else if (id === "advqc") labels[id] = { anchor: "middle", dx: 0, dy: -58 };
    else if (id === "banksy") labels[id] = { anchor: "middle", dx: 0, dy: -54 };
    else if (id === "fetch") labels[id] = { anchor: "start", dx: 30, dy: 4 };
    else if (id === "annotate") labels[id] = { anchor: "middle", dx: 0, dy: 44 };
    else if (id === "pipeline") labels[id] = { anchor: "middle", dx: 0, dy: 64 };
    else if (id === "de") labels[id] = { anchor: "middle", dx: 0, dy: 58 };
    else if (["litreview", "scanpy", "rlang"].includes(id)) labels[id] = { anchor: "middle", dx: 0, dy: 46 };
    else if (id === "pathway") labels[id] = { anchor: "middle", dx: 0, dy: 40 };
    else if (above.has(id)) labels[id] = { anchor: "middle", dx: 0, dy: -44 };
    else labels[id] = { anchor: "middle", dx: 0, dy: 46 };
  });

  return {
    W, H, boxes, stations: S, tracks, agent, labels, badges: {},
    title: "Artemis wrangling stack",
    terminal: { x: 20, y: 620, w: 310, h: 278 },
    vertical: false,
    compact: false,
  };
}

function layoutMobile() {
  const W = 400;
  const H = 2480;
  const boxes = [
    { id: "inputs",   n: "1",   title: "Ingest",                 x: 16, y: 40,   w: 368, h: 420 },
    { id: "wrangle",  n: "2-5", title: "Wrangling",              x: 16, y: 476,  w: 368, h: 520 },
    { id: "analysis", n: "6",   title: "Analysis",               x: 16, y: 1012, w: 368, h: 400 },
    { id: "pathways", n: "7",   title: "Annotation & pathways",  x: 16, y: 1428, w: 368, h: 400 },
    { id: "portal",   n: "8",   title: "Portal & delivery",      x: 16, y: 1844, w: 368, h: 280 },
    { id: "compute",  n: "HPC", title: "Compute  ·  SLURM",      x: 16, y: 2140, w: 368, h: 220 },
  ];

  const S = {
    geo:       { x: 250, y: 88 },
    tenx:      { x: 250, y: 140 },
    cxg:       { x: 250, y: 192 },
    h5ad:      { x: 250, y: 244 },
    fastq:     { x: 250, y: 296 },
    atac:      { x: 250, y: 348 },
    prot:      { x: 250, y: 400 },
    litreview: { x: 120, y: 530 },
    pipeline:  { x: 280, y: 530 },
    fetch:     { x: 120, y: 620 },
    metadata:  { x: 120, y: 710 },
    norm:      { x: 280, y: 710 },
    advqc:     { x: 200, y: 800 },
    artemis:   { x: 200, y: 920, interchange: true },
    scanpy:    { x: 120, y: 1070 },
    rlang:     { x: 280, y: 1070 },
    nextflow:  { x: 200, y: 1150 },
    umap:      { x: 120, y: 1238 },
    banksy:    { x: 280, y: 1238 },
    de:        { x: 200, y: 1328 },
    annotate:  { x: 200, y: 1488 },
    pathway:   { x: 200, y: 1556 },
    kegg:      { x: 200, y: 1620 },
    reactome:  { x: 200, y: 1670 },
    string:    { x: 200, y: 1720 },
    enrichr:   { x: 200, y: 1770 },
    zarr:      { x: 110, y: 1910 },
    vitessce:  { x: 290, y: 1910 },
    jupyter:   { x: 200, y: 1990 },
    report:    { x: 200, y: 2070 },
  };

  const viaA = (inDeg, outDeg) => artemisArc(S.artemis.x, S.artemis.y, inDeg, outDeg, ARTEMIS_MARK_SIZE_COMPACT);

  const tracks = [
    {
      id: "spatial", color: TRACKS.spatial.color,
      through: ["tenx", "fetch", "advqc", "artemis", "banksy", "zarr", "vitessce"],
      d: roundedPath([
        [S.tenx.x, S.tenx.y], [S.tenx.x, 450], [S.fetch.x, 450], [S.fetch.x, S.fetch.y],
        [S.advqc.x, S.fetch.y], [S.advqc.x, S.advqc.y],
        [viaA(270, 90)[0][0], S.advqc.y], ...viaA(270, 90),
        [S.artemis.x, S.banksy.y], [S.banksy.x, S.banksy.y],
        [S.banksy.x, 1840], [S.vitessce.x, 1840], [S.vitessce.x, S.vitessce.y],
      ], 14),
    },
    {
      id: "scrna", color: TRACKS.scrna.color,
      through: ["cxg", "fetch", "metadata", "norm", "advqc", "artemis", "scanpy", "umap", "de", "annotate", "jupyter"],
      d: roundedPath([
        [S.cxg.x, S.cxg.y], [S.cxg.x, 450], [S.fetch.x, 450], [S.fetch.x, S.fetch.y],
        [S.fetch.x, S.metadata.y], [S.metadata.x, S.metadata.y], [S.norm.x, S.norm.y],
        [S.norm.x, S.advqc.y], [S.advqc.x, S.advqc.y],
        [viaA(260, 200)[0][0], S.advqc.y], ...viaA(260, 200),
        [S.scanpy.x, S.artemis.y], [S.scanpy.x, S.scanpy.y],
        [S.scanpy.x, S.umap.y], [S.umap.x, S.umap.y], [S.umap.x, S.de.y], [S.de.x, S.de.y],
        [S.annotate.x, S.de.y], [S.annotate.x, S.annotate.y],
        [S.annotate.x, 1840], [S.jupyter.x, 1840], [S.jupyter.x, S.jupyter.y],
      ], 14),
    },
    {
      id: "scrna-h5ad", color: TRACKS.scrna.color, through: ["h5ad", "fetch"], feeder: true,
      d: roundedPath([[S.h5ad.x, S.h5ad.y], [S.h5ad.x, 450], [S.fetch.x, 450], [S.fetch.x, S.fetch.y]], 12),
    },
    {
      id: "bulk", color: TRACKS.bulk.color,
      through: ["geo", "fetch", "advqc", "artemis", "nextflow", "rlang", "kegg", "reactome", "report"],
      d: roundedPath([
        [S.geo.x, S.geo.y], [S.geo.x, 450], [S.fetch.x, 450], [S.fetch.x, S.fetch.y],
        [S.advqc.x, S.fetch.y], [S.advqc.x, S.advqc.y],
        [viaA(280, 90)[0][0], S.advqc.y], ...viaA(280, 90),
        [S.artemis.x, S.nextflow.y], [S.nextflow.x, S.nextflow.y],
        [S.rlang.x, S.nextflow.y], [S.rlang.x, S.rlang.y],
        [S.rlang.x, S.kegg.y], [S.kegg.x, S.kegg.y],
        [S.kegg.x, S.reactome.y], [S.reactome.x, S.reactome.y],
        [S.reactome.x, 2110], [S.report.x, 2110], [S.report.x, S.report.y],
      ], 14),
    },
    {
      id: "bulk-fastq", color: TRACKS.bulk.color, through: ["fastq", "fetch"], feeder: true,
      d: roundedPath([[S.fastq.x, S.fastq.y], [S.fastq.x, 450], [S.fetch.x, 450], [S.fetch.x, S.fetch.y]], 12),
    },
    {
      id: "atac", color: TRACKS.atac.color,
      through: ["atac", "fetch", "advqc", "artemis", "nextflow", "de"],
      d: roundedPath([
        [S.atac.x, S.atac.y], [S.atac.x, 450], [S.fetch.x, 450], [S.fetch.x, S.fetch.y],
        [S.advqc.x, S.fetch.y], [S.advqc.x, S.advqc.y],
        [viaA(250, 100)[0][0], S.advqc.y], ...viaA(250, 100),
        [S.artemis.x, S.nextflow.y], [S.nextflow.x, S.nextflow.y],
        [S.nextflow.x, S.de.y], [S.de.x, S.de.y],
      ], 14),
    },
    {
      id: "proteomics", color: TRACKS.proteomics.color,
      through: ["prot", "fetch", "advqc", "artemis", "rlang", "string", "report"],
      d: roundedPath([
        [S.prot.x, S.prot.y], [S.prot.x, 450], [330, 450], [330, S.advqc.y], [S.advqc.x, S.advqc.y],
        [viaA(290, 80)[0][0], S.advqc.y], ...viaA(290, 80),
        [S.rlang.x, S.artemis.y], [S.rlang.x, S.rlang.y],
        [S.rlang.x, S.string.y], [S.string.x, S.string.y],
        [S.string.x, 2110], [S.report.x, 2110], [S.report.x, S.report.y],
      ], 14),
    },
    {
      id: "methods", color: TRACKS.methods.color,
      through: ["litreview", "pipeline", "metadata", "advqc", "artemis"],
      d: roundedPath([
        [S.litreview.x, S.litreview.y], [S.pipeline.x, S.pipeline.y],
        [S.pipeline.x, S.metadata.y], [S.metadata.x, S.metadata.y],
        [S.metadata.x, S.advqc.y], [S.advqc.x, S.advqc.y],
        [viaA(255, 255)[0][0], S.advqc.y], ...viaA(255, 255),
      ], 14),
    },
    {
      id: "pathways", color: TRACKS.pathways.color,
      through: ["de", "pathway", "kegg", "reactome", "string", "enrichr"],
      d: roundedPath([
        [S.de.x, S.de.y], [S.pathway.x, S.de.y], [S.pathway.x, S.pathway.y],
        [S.pathway.x, S.kegg.y], [S.kegg.x, S.kegg.y],
        [S.kegg.x, S.enrichr.y], [S.enrichr.x, S.enrichr.y],
      ], 14),
    },
    {
      id: "pathways-banksy", color: TRACKS.pathways.color, through: ["banksy", "pathway"], feeder: true,
      d: roundedPath([[S.banksy.x, S.banksy.y], [S.banksy.x, S.pathway.y], [S.pathway.x, S.pathway.y]], 12),
    },
    {
      id: "delivery", color: TRACKS.delivery.color, through: ["enrichr", "jupyter", "report"],
      d: roundedPath([
        [S.enrichr.x, S.enrichr.y], [S.jupyter.x, S.enrichr.y], [S.jupyter.x, S.jupyter.y],
        [S.jupyter.x, S.report.y], [S.report.x, S.report.y],
      ], 14),
    },
    {
      id: "delivery-vitessce", color: TRACKS.delivery.color, through: ["zarr", "vitessce", "report"], feeder: true,
      d: roundedPath([[S.zarr.x, S.zarr.y], [S.vitessce.x, S.vitessce.y], [S.vitessce.x, S.report.y], [S.report.x, S.report.y]], 12),
    },
  ];

  const agent = roundedPath([
    [S.litreview.x, S.litreview.y], [S.fetch.x, S.fetch.y], [S.advqc.x, S.advqc.y],
    [viaA(270, 90)[0][0], S.advqc.y], ...viaA(270, 90),
    [S.de.x, S.de.y], [S.annotate.x, S.annotate.y],
    [S.jupyter.x, S.jupyter.y], [S.report.x, S.report.y],
  ], 14);

  const above = new Set(["litreview", "pipeline", "fetch", "scanpy", "rlang", "nextflow", "pathway", "zarr", "vitessce", "jupyter", "banksy", "advqc"]);
  const labels = {};
  Object.keys(S).forEach((id) => {
    if (INPUT_IDS.includes(id)) {
      const { w } = badgeSize(LOGOS[id], true);
      labels[id] = { anchor: "end", dx: -(w / 2 + 8), dy: 4 };
    }
    else if (["kegg", "reactome", "string", "enrichr"].includes(id)) labels[id] = { anchor: "end", dx: -36, dy: 4 };
    else if (id === "artemis") labels[id] = { anchor: "middle", dx: 0, dy: 56 };
    else if (id === "report") labels[id] = { anchor: "middle", dx: 0, dy: 32 };
    else if (id === "annotate") labels[id] = { anchor: "end", dx: -40, dy: 4 };
    else if (id === "metadata" || id === "norm" || id === "pipeline" || id === "de") labels[id] = { anchor: "middle", dx: 0, dy: 36 };
    else if (id === "advqc") labels[id] = { anchor: "middle", dx: 0, dy: -36 };
    else if (above.has(id)) labels[id] = { anchor: "middle", dx: 0, dy: -32 };
    else labels[id] = { anchor: "middle", dx: 0, dy: 32 };
  });

  return {
    W, H, boxes, stations: S, tracks, agent, labels, badges: {},
    title: "Artemis wrangling stack",
    terminal: { x: 16, y: 2148, w: 368, h: 0 },
    vertical: true,
    compact: true,
  };
}

function CodeLine({ n, text, wide }) {
  const parts = highlightLine(text);
  return (
    <div style={{ display: "flex", minHeight: 18, lineHeight: "18px", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }}>
      <span style={{ width: wide ? 36 : 28, flex: "0 0 auto", textAlign: "right", paddingRight: 10, color: "#6b6b6b", userSelect: "none" }}>{n}</span>
      <span style={{ whiteSpace: "pre" }}>
        {parts.length ? parts.map((p, i) => <span key={i} style={{ color: p[0] }}>{p[1]}</span>) : <span>&nbsp;</span>}
      </span>
    </div>
  );
}

function CodePeek({ id, x, y, containerW, containerH, onEnter, onLeave, onOpen }) {
  const code = STATION_CODE[id] || STATION_CODE.artemis;
  const copy = STATION_COPY[id];
  const width = 360;
  const maxH = 280;
  let left = x + 16;
  let top = y - 20;
  if (left + width > containerW - 8) left = Math.max(8, x - width - 16);
  if (top + maxH > containerH - 8) top = Math.max(8, containerH - maxH - 8);
  if (top < 8) top = 8;
  return (
    <div
      role="dialog"
      aria-label={`${labelLines(copy).join(" ")} code peek`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onWheel={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        left, top, width,
        maxHeight: maxH,
        background: "#1e1e1e",
        border: "1px solid #3c3c3c",
        borderRadius: 8,
        boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        color: "#d4d4d4",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#2d2d2d", borderBottom: "1px solid #3c3c3c", padding: "0 8px", height: 32, flex: "0 0 auto" }}>
        <span style={{ width: 10, height: 10, borderRadius: 99, background: "#ff5f56" }} />
        <span style={{ width: 10, height: 10, borderRadius: 99, background: "#ffbd2e" }} />
        <span style={{ width: 10, height: 10, borderRadius: 99, background: "#27c93f" }} />
        <span style={{ marginLeft: 8, background: "#1e1e1e", borderTopLeftRadius: 6, borderTopRightRadius: 6, padding: "4px 10px", fontSize: 11, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: "#cccccc" }}>
          {code.file}
        </span>
        <button
          type="button"
          onClick={onOpen}
          style={{ marginLeft: "auto", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#111", background: "#2BB5A0", border: "none", borderRadius: 4, padding: "3px 7px", cursor: "pointer", fontWeight: 700 }}
        >
          Demo
        </button>
      </div>
      <div style={{ overflow: "auto", padding: "8px 8px 10px 4px", maxHeight: maxH - 32 }}>
        {code.lines.map((ln, i) => (
          <CodeLine key={i} n={(code.start || 1) + i} text={ln} />
        ))}
      </div>
    </div>
  );
}

function MiniPreview({ id }) {
  const color = (
    id === "banksy" || id === "tenx" || id === "zarr" || id === "vitessce" ? "#2BB5A0"
    : id === "scanpy" || id === "cxg" || id === "umap" || id === "h5ad" ? "#8A6AA8"
    : id === "geo" || id === "fastq" || id === "nextflow" || id === "rlang" ? "#E0A050"
    : id === "atac" ? "#4C9A78"
    : id === "prot" || id === "string" ? "#C46B8A"
    : id === "advqc" ? "#2BB5A0"
    : "#4A9FD4"
  );
  return (
    <div style={{ background: "#111214", border: "1px solid #2a2a2c", borderRadius: 6, height: "100%", minHeight: 160, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 8, left: 10, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2BB5A0", fontWeight: 700 }}>Demo</div>
      <svg viewBox="0 0 240 160" width="100%" height="100%" aria-hidden>
        {["banksy", "tenx", "vitessce", "zarr"].includes(id) ? (
          <g>
            <ellipse cx="80" cy="90" rx="48" ry="36" fill="none" stroke="#3a3a3a" strokeWidth="1.2" />
            {Array.from({ length: 28 }).map((_, i) => (
              <circle key={i} cx={50 + (i % 7) * 10 + (i % 3)} cy={70 + Math.floor(i / 7) * 12} r="2.1" fill={i % 5 === 0 ? color : "#6a6a6a"} />
            ))}
            <rect x="140" y="50" width="80" height="70" rx="3" fill="none" stroke="#3a3a3a" />
            {Array.from({ length: 16 }).map((_, i) => (
              <circle key={i} cx={152 + (i % 4) * 16} cy={64 + Math.floor(i / 4) * 14} r="3" fill={i === 7 ? color : "#555"} opacity="0.85" />
            ))}
          </g>
        ) : ["scanpy", "umap", "cxg", "de", "annotate"].includes(id) ? (
          <g>
            {[[40, 50], [70, 70], [55, 95], [160, 55], [180, 80], [150, 100], [90, 40], [130, 120]].map((p, i) => (
              <circle key={i} cx={p[0]} cy={p[1]} r={10 + (i % 3) * 3} fill={i < 4 ? color : "#c44840"} opacity="0.28" />
            ))}
            {Array.from({ length: 40 }).map((_, i) => (
              <circle key={i} cx={40 + (i * 17) % 170} cy={45 + ((i * 31) % 90)} r="2" fill={i % 2 ? color : "#d0d0d0"} />
            ))}
          </g>
        ) : id === "advqc" ? (
          <g fontFamily="ui-monospace, monospace" fontSize="9" fill="#c8c8c8">
            <text x="24" y="50">spatial          PASS</text>
            <text x="24" y="68">scRNA            PASS</text>
            <text x="24" y="86">bulk             PASS</text>
            <text x="24" y="104">{'ATAC / CUT&Tag   PASS'}</text>
            <text x="24" y="122" fill="#E0A050">proteomics       FLAG</text>
          </g>
        ) : (
          <g>
            {[40, 70, 100, 130].map((y, i) => (
              <rect key={y} x="30" y={y} width={80 + i * 22} height="10" rx="2" fill={color} opacity={0.85 - i * 0.15} />
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}

function LiveRunModal({ id, onClose }) {
  const code = STATION_CODE[id] || STATION_CODE.artemis;
  const copy = STATION_COPY[id];
  const logs = RUN_LOGS[id] || RUN_LOGS.default;
  const [shown, setShown] = useState(1);
  useEffect(() => {
    if (shown >= logs.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), 420);
    return () => clearTimeout(t);
  }, [shown, logs.length]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Demo live run, ${labelLines(copy).join(" ")}`}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.62)", zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(1100px, 100%)", maxHeight: "90vh", background: "#1e1e1e", border: "1px solid #3c3c3c", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column", color: "#d4d4d4", boxShadow: "0 24px 64px rgba(0,0,0,0.55)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#2d2d2d", borderBottom: "1px solid #3c3c3c", padding: "8px 12px" }}>
          <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#111", background: "#2BB5A0", borderRadius: 4, padding: "3px 7px", fontWeight: 700 }}>Demo</span>
          <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, color: "#ccc" }}>{code.file}</span>
          <span style={{ fontSize: 12, color: "#9a9a9a" }}>{labelLines(copy).join(" ")}</span>
          <button type="button" onClick={onClose} style={{ marginLeft: "auto", background: "transparent", color: "#ccc", border: "1px solid #555", borderRadius: 4, padding: "4px 10px", cursor: "pointer" }}>Close</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,0.9fr)", gridTemplateRows: "1fr 180px", gap: 1, background: "#3c3c3c", minHeight: 420, maxHeight: "calc(90vh - 48px)" }}>
          <div style={{ background: "#1e1e1e", overflow: "auto", padding: "10px 8px", gridRow: "1 / 3" }}>
            {code.lines.map((ln, i) => (
              <CodeLine key={i} n={(code.start || 1) + i} text={ln} wide />
            ))}
          </div>
          <div style={{ background: "#0d0d0d", overflow: "auto", padding: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, color: "#7CFC9A" }}>
            {logs.slice(0, shown).map((ln, i) => (
              <div key={i} style={{ whiteSpace: "pre-wrap", marginBottom: 4 }}>{ln}</div>
            ))}
            <span style={{ display: "inline-block", width: 7, height: 13, background: "#7CFC9A", marginLeft: 2, opacity: shown >= logs.length ? 0.4 : 1 }} />
          </div>
          <div style={{ background: "#111214", padding: 8 }}>
            <MiniPreview id={id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function wrapLine(text, cols) {
  if (!text || !cols || text.length <= cols) return [text || ""];
  const out = [];
  let rest = text;
  while (rest.length > cols) {
    const window = rest.slice(0, cols);
    const breaks = [" ", "/", "-", "_", ":", ","].map((ch) => window.lastIndexOf(ch));
    let cut = Math.max(...breaks);
    if (cut < Math.floor(cols * 0.45)) cut = cols;
    else if (rest[cut] === " ") {
      /* break at the space, drop it */
    } else {
      cut += 1;
    }
    out.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).trimStart();
  }
  if (rest) out.push(rest);
  return out;
}

function WranglingTerminal({ lines, typing, highlight, reduced, visible }) {
  const scroller = useRef(null);
  const [cols, setCols] = useState(42);
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth || 0;
      setCols(Math.max(28, Math.floor(w / 6.4)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [visible, reduced]);
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, typing, cols]);
  if (!visible && !reduced) return null;
  const shown = [];
  lines.slice(-24).forEach((ln) => {
    const text = typeof ln === "string" ? ln : (ln.text || "");
    wrapLine(text, cols).forEach((part, i) => {
      shown.push({
        text: i === 0 ? part : `  ${part}`,
        kind: typeof ln === "string" ? "log" : (ln.kind || "log"),
        station: typeof ln === "string" ? null : ln.station,
      });
    });
  });
  const colorFor = (ln) => {
    if (!ln) return "#7CFC9A";
    if (ln.kind === "cmd" || (ln.text && ln.text.startsWith("$"))) return "#b6f5c8";
    if (ln.kind === "done") return "#d8ffe0";
    if (ln.kind === "stage") return "#e8ffe8";
    if (ln.kind === "warn") return "#f0d48a";
    if (ln.kind === "meta") return "#7aa887";
    return "#7CFC9A";
  };
  return (
    <div
      data-stack-terminal="true"
      style={{
        background: "#070807",
        border: "1px solid #1f3d2a",
        borderRadius: 8,
        color: "#7CFC9A",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 9,
        lineHeight: 1.4,
        fontVariantLigatures: "none",
        padding: "8px 10px 6px",
        height: "100%",
        minHeight: 160,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "inset 0 0 0 1px rgba(44,180,120,0.08)",
      }}
    >
      <div style={{ color: "#8fd9a8", fontSize: 9, marginBottom: 6, flex: "0 0 auto", whiteSpace: "nowrap" }}>
        artemis@hpc:~/GBM3  ·  nextflow 24.10
      </div>
      <div ref={scroller} style={{ overflow: "hidden", flex: "1 1 auto" }}>
        {shown.map((ln, i) => {
          const active = highlight && ln.station === highlight;
          return (
            <div
              key={i}
              style={{
                color: colorFor(ln),
                background: active ? "rgba(43,181,160,0.16)" : "transparent",
                margin: "0 -6px",
                padding: "0 6px",
                borderRadius: 2,
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
                wordBreak: "normal",
              }}
            >
              {ln.text}
            </div>
          );
        })}
        {typing ? (
          <div style={{ color: "#b6f5c8", whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>
            {wrapLine(typing, cols).join("\n")}
            <span style={{ opacity: 0.8 }}>{"█"}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}


function ComputeFabric({ box, compute, compact }) {
  if (!box) return null;
  const cpu = compute || emptyCompute();
  const cpuFrac = Math.max(0, Math.min(1, (cpu.cpuUsed || 0) / CPU_TOTAL));
  const gpuFrac = Math.max(0, Math.min(1, (cpu.gpuUsed || 0) / GPU_TOTAL));
  const { x, y, w, h } = box;
  const bar = (bx, by, bw, frac, color) => (
    <g>
      <rect x={bx} y={by} width={bw} height={8} rx="2" fill="#1a1a1c" stroke="#3a3a3c" strokeWidth="0.8" />
      <rect x={bx + 1} y={by + 1} width={Math.max(0, (bw - 2) * frac)} height={6} rx="1.5" fill={color} opacity="0.9" />
    </g>
  );
  const jobs = (list) => (list || []).slice(-3).map((j) => `${j.id}  ${j.name}`).join("    ") || "idle";
  if (compact) {
    return (
      <g>
        <text x={x + 14} y={y + 50} fill="#b3b3b3" fontSize="10" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
          CPU  cpu_part  {cpu.cpuUsed}/{CPU_TOTAL} nodes  {Math.round(cpuFrac * 100)}%
        </text>
        {bar(x + 14, y + 56, w - 28, cpuFrac, "#7aa887")}
        <text x={x + 14} y={y + 80} fill="#8a8a8a" fontSize="9" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">{jobs(cpu.cpuJobs)}</text>
        <text x={x + 14} y={y + 108} fill="#b3b3b3" fontSize="10" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
          GPU  gpu_part  {cpu.gpuUsed}/{GPU_TOTAL} nodes  {Math.round(gpuFrac * 100)}%
        </text>
        {bar(x + 14, y + 114, w - 28, gpuFrac, "#C8A24A")}
        <text x={x + 14} y={y + 138} fill="#8a8a8a" fontSize="9" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">{jobs(cpu.gpuJobs)}</text>
        <text x={x + 14} y={y + 160} fill="#6a6a6a" fontSize="9" fontFamily="ui-sans-serif, system-ui, sans-serif">
          slurm 23.11  ·  sbatch / squeue
        </text>
      </g>
    );
  }
  const colW = (w - 56) / 2;
  const left = x + 18;
  const right = x + 38 + colW;
  const top = y + 52;
  const lane = (lx, title, used, total, frac, color, list, hint) => (
    <g>
      <text x={lx} y={top} fill="#d0d0d0" fontSize="11" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="500">
        {title}
      </text>
      <text x={lx + colW} y={top} textAnchor="end" fill="#8fd0c0" fontSize="11" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontWeight="600">
        {used} / {total} nodes  ·  {Math.round(frac * 100)}%
      </text>
      {bar(lx, top + 8, colW, frac, color)}
      <text x={lx} y={top + 32} fill="#9a9a9a" fontSize="9.5" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
        {jobs(list)}
      </text>
      <text x={lx} y={top + 48} fill="#6a6a6a" fontSize="9" fontFamily="ui-sans-serif, system-ui, sans-serif">
        {hint}
      </text>
    </g>
  );
  return (
    <g>
      {lane(left, "CPU  ·  cpu_part", cpu.cpuUsed, CPU_TOTAL, cpuFrac, "#7aa887", cpu.cpuJobs, "alignment, QC, Nextflow processes")}
      {lane(right, "GPU  ·  gpu_part", cpu.gpuUsed, GPU_TOTAL, gpuFrac, "#C8A24A", cpu.gpuJobs, "scVI / deep models, CellTypist, embed")}
    </g>
  );
}

export default function StackMetro() {

  const rootRef = useRef(null);
  const sentinelRef = useRef(null);
  const stageRef = useRef(null);
  const pathRefs = useRef({});
  const pathDoneRefs = useRef({});
  const pathPulseRefs = useRef({});
  const boxRefs = useRef({});
  const boxFillRefs = useRef({});
  const ctrlPathRefs = useRef({});
  const ctrlPulseRefs = useRef({});
  const ctrlPipRefs = useRef({});
  const agentPathRef = useRef(null);
  const trainRefs = useRef([]);
  const agentRef = useRef(null);
  const flowRef = useRef(null);
  const paintFlowRef = useRef(() => {});
  const [armed, setArmed] = useState(false);
  const [hoverId, setHoverId] = useState(null);
  const [modalId, setModalId] = useState(null);
  const [hot, setHot] = useState(() => new Set());
  const [scene, setScene] = useState("idle");
  const [litSet, setLitSet] = useState(() => new Set(INITIAL_LIT));
  const [pulseSet, setPulseSet] = useState(() => new Set());
  const [termLines, setTermLines] = useState([]);
  const [typing, setTyping] = useState("");
  const [highlight, setHighlight] = useState(null);
  const [stageN, setStageN] = useState(0);
  const [compute, setCompute] = useState(() => emptyCompute());
  const [ctrlMap, setCtrlMap] = useState({});
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [vertical, setVertical] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false
  );
  const [reduce, setReduce] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  );
  const armedRef = useRef(false);
  const inViewRef = useRef(false);
  const sceneRef = useRef("idle");
  const litRef = useRef(new Set(INITIAL_LIT));
  const hoverTimer = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mqV = window.matchMedia("(max-width: 767px)");
    const mqR = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setVertical(mqV.matches);
      setReduce(mqR.matches);
    };
    apply();
    mqV.addEventListener("change", apply);
    mqR.addEventListener("change", apply);
    return () => {
      mqV.removeEventListener("change", apply);
      mqR.removeEventListener("change", apply);
    };
  }, []);

  const L = useMemo(() => (vertical ? layoutMobile() : layoutDesktop()), [vertical]);

  useEffect(() => {
    const el = sentinelRef.current || rootRef.current;
    if (!el) return;
    const armIfSeen = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 0;
      const seen = r.bottom > 40 && r.top < vh * 0.92;
      if (seen) inViewRef.current = true;
      if (seen) inViewRef.current = true;
      if (seen && !armedRef.current) {
        armedRef.current = true;
        setArmed(true);
      }
      if (!seen) inViewRef.current = false;
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting) armIfSeen();
      },
      { threshold: 0.12, rootMargin: "0px" }
    );
    io.observe(el);
    armIfSeen();
    window.addEventListener("scroll", armIfSeen, { passive: true });
    window.addEventListener("resize", armIfSeen);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", armIfSeen);
      window.removeEventListener("resize", armIfSeen);
    };
  }, []);

  useEffect(() => {
    if (reduce && !armedRef.current) {
      armedRef.current = true;
      setArmed(true);
    }
  }, [reduce]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const preview = new URLSearchParams(window.location.search).get("stackPreview");
    if (preview && !armedRef.current) {
      armedRef.current = true;
      inViewRef.current = true;
      setArmed(true);
    }
  }, []);

  const mainTracks = useMemo(() => L.tracks.filter((t) => !t.feeder), [L]);
  const ctrlNet = useMemo(() => controlNetwork(L), [L]);
  const ctrlRoutes = ctrlNet.routes;

  useEffect(() => {
    const setDash = (el, progress) => {
      if (!el || !el.getTotalLength) return;
      const len = el.getTotalLength();
      if (!len) return;
      el.style.strokeDasharray = `${len}`;
      el.style.strokeDashoffset = `${len * (1 - Math.max(0, Math.min(1, progress)))}`;
    };
    const paintDraw = (t, forceDone) => {
      const done = forceDone || reduce;
      L.boxes.forEach((b) => {
        const p = done ? 1 : Math.max(0, Math.min(1, t / T_BOX));
        setDash(boxRefs.current[b.id], p);
        const fill = boxFillRefs.current[b.id];
        if (fill) fill.setAttribute("opacity", String(p));
      });
      L.tracks.forEach((tr, i) => {
        const startAt = 280 + i * 70;
        const p = done ? 1 : Math.max(0, Math.min(1, (t - startAt) / (T_TRACK - 400)));
        setDash(pathRefs.current[tr.id], p);
      });
    };
    const paintFlow = (flow, sceneNow) => {
      const full = !!(flow && (flow.live || reduce || sceneNow === "live"));
      const rt = flow ? flow.rt : 0;
      L.tracks.forEach((tr) => {
        const base = pathRefs.current[tr.id];
        const doneEl = pathDoneRefs.current[tr.id];
        const pulseEl = pathPulseRefs.current[tr.id];
        if (!base || !base.getTotalLength) return;
        const len = base.getTotalLength();
        if (!len) return;
        const paint = segmentPaint(tr.through, flow, len, rt, { full });
        if (doneEl) {
          doneEl.setAttribute("stroke-dasharray", paint.doneDasharray);
          doneEl.setAttribute("stroke-dashoffset", "0");
          doneEl.setAttribute("opacity", full || paint.anyDone ? "0.96" : "0");
        }
        if (pulseEl) {
          const pu = paint.pulses && paint.pulses[0];
          if (pu && !full && !reduce) {
            const plen = 20;
            pulseEl.setAttribute("stroke-dasharray", `${plen} ${Math.max(len, 1)}`);
            pulseEl.setAttribute("stroke-dashoffset", String(-(pu.offset - plen / 2)));
            pulseEl.setAttribute("opacity", "1");
          } else {
            pulseEl.setAttribute("opacity", "0");
          }
        }
      });
      ctrlRoutes.forEach((r) => {
        const el = ctrlPathRefs.current[r.id];
        const pul = ctrlPulseRefs.current[r.id];
        const pip = ctrlPipRefs.current[r.id];
        const c = flow && flow.ctrl ? flow.ctrl[r.id] : null;
        const state = full ? "done" : (c && c.state) || "pending";
        if (el) {
          el.setAttribute("stroke", state === "pending" ? "#3d5c57" : "#2BB5A0");
          el.setAttribute("opacity", state === "pending" ? "0.42" : state === "active" ? "0.95" : "0.78");
        }
        if (pul && el && el.getTotalLength) {
          const len = el.getTotalLength();
          if (state === "active" && c && len) {
            const prog = Math.max(0, Math.min(1, (rt - c.t0) / Math.max(1, c.dur || CTRL_MS)));
            const plen = 16;
            pul.setAttribute("stroke-dasharray", `${plen} ${len}`);
            pul.setAttribute("stroke-dashoffset", String(-(prog * len - plen / 2)));
            pul.setAttribute("opacity", "1");
          } else if (pul) {
            pul.setAttribute("opacity", "0");
          }
        }
        if (pip) {
          pip.setAttribute("fill", state === "pending" ? "#1c1c1e" : "#2BB5A0");
          pip.setAttribute("stroke", state === "pending" ? "#4a4a4a" : "#d8f4ee");
          pip.setAttribute("r", state === "active" ? "5" : "3.6");
        }
      });
    };
    paintFlowRef.current = paintFlow;
    const applyFlowReact = (flow) => {
      if (!flow) return;
      litRef.current = flow.lit;
      setLitSet(new Set(flow.lit));
      setPulseSet(new Set(flow.pulse));
      setTermLines(flow.lines);
      setTyping(flow.typing || "");
      setHighlight(flow.highlight);
      setStageN(flow.live ? 8 : (flow.stageN || 0));
      setCompute(flow.compute || emptyCompute());
      setCtrlMap(flow.ctrl || {});
    };
    const resetRun = (opts = {}) => {
      const lit = opts.lit || new Set(INITIAL_LIT);
      litRef.current = lit;
      setLitSet(new Set(lit));
      setPulseSet(new Set());
      setTermLines(opts.lines || []);
      setTyping("");
      setHighlight(null);
      setStageN(opts.stageN || 0);
      setCompute(opts.compute || emptyCompute());
      setCtrlMap(opts.ctrl || {});
    };
    if (!armed) {
      paintDraw(0, false);
      sceneRef.current = "idle";
      setScene("idle");
      resetRun();
      return;
    }
    if (reduce) {
      paintDraw(T_LOAD_END, true);
      sceneRef.current = "live";
      setScene("live");
      const flow = flowState(PIPELINE.duration + 1);
      flowRef.current = flow;
      resetRun({ lit: finalLit(), lines: completedLines(), stageN: 8, compute: liveCompute(), ctrl: flow.ctrl });
      paintFlow(flow, "live");
      return;
    }
    const preview = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("stackPreview")
      : null;
    if (preview === "live" || preview === "mid" || (preview && /^\d+$/.test(preview))) {
      paintDraw(T_LOAD_END, true);
      const rt = preview === "live" ? PIPELINE.duration + 1 : preview === "mid" ? stageRunTime(4) : Number(preview);
      const snap = flowState(rt);
      flowRef.current = snap;
      applyFlowReact(snap);
      if (preview !== "live" && !snap.live && snap.typing) setTyping(snap.typing);
      else if (preview === "live" || snap.live) setTyping("");
      sceneRef.current = snap.live || preview === "live" ? "live" : "run";
      setScene(sceneRef.current);
      paintFlow(snap, sceneRef.current);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    let lastSig = "";
    const tick = (now) => {
      const t = now - t0;
      if (t < T_LOAD_END) {
        paintDraw(t, false);
        let next = "boxes";
        if (t >= T_LOAD) next = "loading";
        else if (t >= 280) next = "tracks";
        if (sceneRef.current !== next) {
          sceneRef.current = next;
          setScene(next);
        }
        raf = requestAnimationFrame(tick);
        return;
      }
      paintDraw(T_LOAD_END, true);
      const rt = t - T_LOAD_END;
      if (sceneRef.current !== "run" && sceneRef.current !== "live") {
        sceneRef.current = "run";
        setScene("run");
        litRef.current = new Set(INITIAL_LIT);
        setLitSet(new Set(INITIAL_LIT));
      }
      const flow = flowState(rt);
      flowRef.current = flow;
      paintFlow(flow, sceneRef.current);
      const sig = [
        flow.stageN,
        flow.lines.length,
        flow.typing,
        flow.highlight,
        flow.live ? 1 : 0,
        [...flow.lit].join(","),
        [...flow.pulse].join(","),
        flow.compute ? `${flow.compute.cpuUsed}:${flow.compute.gpuUsed}` : "",
        Object.keys(flow.ctrl).map((k) => `${k}:${flow.ctrl[k].state}`).join(","),
      ].join("|");
      if (sig !== lastSig) {
        lastSig = sig;
        applyFlowReact(flow);
      } else if (flow.typing !== undefined) {
        setTyping(flow.typing || "");
      }
      if (flow.live) {
        sceneRef.current = "live";
        setScene("live");
        setTyping("");
        setHighlight(null);
        setCompute(liveCompute());
        paintFlow(flow, "live");
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [armed, reduce, L, ctrlRoutes]);

  useLayoutEffect(() => {
    const flow = flowRef.current;
    if (!flow) return;
    paintFlowRef.current(flow, sceneRef.current);
  }, [L, scene, reduce, armed, ctrlRoutes, litSet, pulseSet, ctrlMap]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (reduce) return;
    if (!armed) return;
    let raf = 0;
    const trains = mainTracks.map((t, i) => ({
      id: t.id,
      color: t.color,
      phase: i * 0.11,
      speed: 0.034 + (i % 3) * 0.006,
    }));
    mainTracks.slice(0, 5).forEach((t, i) => {
      trains.push({
        id: t.id,
        color: t.color,
        phase: 0.5 + i * 0.1,
        speed: 0.034 + (i % 3) * 0.006,
        tail: true,
      });
    });
    const tick = (now) => {
      const running = sceneRef.current === "live";
      if (!running) {
        trains.forEach((_, i) => {
          const node = trainRefs.current[i];
          if (node) node.setAttribute("opacity", "0");
        });
        if (agentRef.current) agentRef.current.setAttribute("opacity", "0");
        raf = requestAnimationFrame(tick);
        return;
      }
      const t = Math.max(0, now);
      const nextHot = new Set();
      trains.forEach((tr, i) => {
        const el = pathRefs.current[tr.id];
        const node = trainRefs.current[i];
        if (!el || !node || !el.getTotalLength) return;
        const len = el.getTotalLength();
        if (!len) return;
        const track = L.tracks.find((x) => x.id === tr.id);
        const span = trackSpan((track && track.through) || [], litRef.current);
        if (span <= 0) {
          node.setAttribute("opacity", "0");
          return;
        }
        const p = ((((t / 1000) * tr.speed + tr.phase) % 1 + 1) % 1) * span;
        const cars = [0, 1, 2].map((c) => {
          const q = (p - c * TRAIN_GAP + 1) % 1;
          const pt = el.getPointAtLength(q * len);
          const q2 = (q + 0.006) % 1;
          const pt2 = el.getPointAtLength(q2 * len);
          const ang = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * (180 / Math.PI);
          return { x: pt.x, y: pt.y, ang };
        });
        const children = node.querySelectorAll("g.car");
        children.forEach((g, ci) => {
          if (!cars[ci]) return;
          g.setAttribute("transform", `translate(${cars[ci].x} ${cars[ci].y}) rotate(${cars[ci].ang})`);
        });
        node.setAttribute("opacity", "1");
        Object.entries(L.stations).forEach(([id, s]) => {
          if (Math.hypot(cars[0].x - s.x, cars[0].y - s.y) < 28) nextHot.add(id);
        });
      });
      const aEl = agentPathRef.current;
      const aNode = agentRef.current;
      if (aEl && aNode && aEl.getTotalLength) {
        const len = aEl.getTotalLength();
        const p = ((t / 1000) * 0.032) % 1;
        const pt = aEl.getPointAtLength(p * len);
        aNode.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
        aNode.setAttribute("opacity", "1");
        Object.entries(L.stations).forEach(([id, s]) => {
          if (Math.hypot(pt.x - s.x, pt.y - s.y) < 30) nextHot.add(id);
        });
      }
      setHot((prev) => {
        if (prev.size === nextHot.size && [...prev].every((k) => nextHot.has(k))) return prev;
        return nextHot;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [armed, reduce, L, mainTracks]);

  const openHover = (id, ev) => {
    if (vertical) return;
    window.clearTimeout(hoverTimer.current);
    setHoverId(id);
    const stage = stageRef.current;
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    const src = ev.currentTarget.getBoundingClientRect();
    setHoverPos({
      x: src.left - r.left + src.width / 2,
      y: src.top - r.top,
      w: r.width,
      h: r.height,
    });
  };
  const closeHoverSoon = () => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setHoverId(null), 160);
  };
  const keepHover = () => {
    window.clearTimeout(hoverTimer.current);
  };
  const openDemo = (id) => {
    setHoverId(null);
    setModalId(id);
  };

  const mapReady = scene !== "idle" && scene !== "boxes";
  const stationVisible = (id) => {
    if (reduce || scene === "live" || scene === "run" || scene === "loading") return true;
    return mapReady;
  };
  const stationLit = (id) => {
    if (hot.has(id) || hoverId === id || modalId === id) return true;
    if (reduce || scene === "live") return litSet.has(id) || finalLit().has(id);
    return litSet.has(id);
  };
  const stationPulse = (id) => pulseSet.has(id);

  const card = hoverId || modalId ? STATION_COPY[hoverId || modalId] : null;
  const trainCount = mainTracks.length + Math.min(5, mainTracks.length);
  const loading = !reduce && scene === "loading";
  const hint = vertical
    ? "Tap a station to open a Demo live run."
    : "Hover a station to read the code. Click to open a Demo live run.";
  const termVisible = reduce || scene === "loading" || scene === "run" || scene === "live";

  return (
    <section id="stack" className="relative px-6 md:px-14 py-24 md:py-32 max-w-7xl mx-auto">
      <span ref={sentinelRef} className="block h-px w-full" aria-hidden />
      <Reveal>
        <p className="font-mono text-sm text-violet mb-4">08 · THE STACK, CONNECTED</p>
        <h3 className="text-2xl md:text-3xl font-semibold tracking-tight max-w-3xl">
          Built on the tools you already trust.
        </h3>
        <p className="mt-4 max-w-2xl text-lg text-dim leading-relaxed">
          Multi-assay experiments need wrangling like this. A staged pipeline
          ingests GEO, 10x, CELLxGENE, FASTQ, BAM, and mzML, reviews the
          literature, reconciles metadata to CL, runs one adversarial QC, then
          normalizes, analyzes, annotates, and delivers a Vitessce portal.
        </p>
      </Reveal>

      <div ref={rootRef} className="mt-10" data-stack-metro="true">
        <div
          ref={stageRef}
          className="relative w-full rounded-[8px] border border-white/10 overflow-visible"
          style={{ background: BG }}
        >
          <svg
            viewBox={`0 0 ${L.W} ${L.H}`}
            width="100%"
            role="img"
            aria-label="Live metro map of the Artemis wrangling stack. Multi-assay inputs pass through one adversarial QC review into an integrated analysis and portal."
            style={{ display: "block", width: "100%", height: "auto" }}
          >
            <defs />
            <rect width={L.W} height={L.H} fill={BG} />

            <text x="20" y="22" fill={INK} fontSize="13" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="500">
              {L.title}
            </text>

            {L.boxes.map((b) => (
              <g key={b.id}>
                <path
                  ref={(el) => { boxFillRefs.current[b.id] = el; }}
                  d={roundedRectPath(b.x, b.y, b.w, b.h, 10)}
                  fill={BOX}
                  stroke="none"
                  opacity={reduce ? 1 : 0}
                />
                <path
                  ref={(el) => { boxRefs.current[b.id] = el; }}
                  d={roundedRectPath(b.x, b.y, b.w, b.h, 10)}
                  fill="none"
                  stroke={(() => {
                    const hdr = boxHeader(b.id, stageN, reduce || scene === "live", (ctrlMap[b.id] && ctrlMap[b.id].state) || (reduce || scene === "live" ? "done" : "pending"));
                    return hdr.state === "running" ? "#2BB5A0" : hdr.state === "done" ? "#4a8f84" : BOX_STROKE;
                  })()}
                  strokeWidth={(() => {
                    const hdr = boxHeader(b.id, stageN, reduce || scene === "live", (ctrlMap[b.id] && ctrlMap[b.id].state) || (reduce || scene === "live" ? "done" : "pending"));
                    return hdr.state === "running" ? 1.8 : 1.4;
                  })()}
                />
                {(() => {
                  const hdr = boxHeader(b.id, stageN, reduce || scene === "live", (ctrlMap[b.id] && ctrlMap[b.id].state) || (reduce || scene === "live" ? "done" : "pending"));
                  const stateFill = hdr.state === "running" ? "#2BB5A0" : hdr.state === "done" ? "#8fd0c0" : "#6a6a6a";
                  return (
                    <>
                      <text x={b.x + 14} y={b.y + 20} fill={hdr.state === "queued" || hdr.state === "idle" ? "#7a7a7a" : INK} fontSize="13" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="500">
                        {hdr.n}  {hdr.title}
                      </text>
                      <text x={b.x + b.w - 12} y={b.y + 20} textAnchor="end" fill={stateFill} fontSize="10" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontWeight="600" letterSpacing="0.06em">
                        {hdr.state}
                      </text>
                      {hdr.subtitle ? (
                        <text x={b.x + 14} y={b.y + 34} fill="#8fd0c0" fontSize="10" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
                          {hdr.step}  {hdr.subtitle}
                        </text>
                      ) : null}
                    </>
                  );
                })()}
              </g>
            ))}

            <ComputeFabric
              box={L.boxes.find((b) => b.id === "compute")}
              compute={compute}
              compact={L.compact}
            />

            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
              {L.tracks.map((t) => {
                const hid = hoverId || modalId;
                const hoverDim = hid && !(t.through || []).includes(hid);
                const drawing = scene === "idle" || scene === "boxes" || scene === "tracks" || scene === "loading";
                const baseOp = hoverDim ? 0.14 : (drawing && !reduce ? 1 : 0.22);
                return (
                  <g key={t.id} style={{ opacity: hoverDim ? 0.55 : 1, transition: "opacity 200ms linear" }}>
                    <path
                      ref={(el) => { pathRefs.current[t.id] = el; }}
                      d={t.d}
                      stroke={t.color}
                      strokeWidth={t.feeder ? STROKE_FEED : STROKE}
                      opacity={baseOp}
                    />
                    <path
                      ref={(el) => { pathDoneRefs.current[t.id] = el; }}
                      d={t.d}
                      stroke={t.color}
                      strokeWidth={t.feeder ? STROKE_FEED : STROKE}
                      opacity={0}
                    />
                    <path
                      ref={(el) => { pathPulseRefs.current[t.id] = el; }}
                      d={t.d}
                      stroke="#f4f4f4"
                      strokeWidth={(t.feeder ? STROKE_FEED : STROKE) - 0.6}
                      opacity={0}
                    />
                  </g>
                );
              })}
              <path ref={agentPathRef} d={L.agent} fill="none" stroke="none" />
            </g>

            <g fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: "none" }}>
              {(ctrlNet.skeleton || []).map((d, i) => (
                <path
                  key={`ctrl-skel-${i}`}
                  d={d}
                  stroke="#3d5c57"
                  strokeWidth="1.25"
                  strokeDasharray="3.5 3.5"
                  opacity={scene === "idle" || scene === "boxes" ? 0 : 0.55}
                />
              ))}
              {ctrlRoutes.map((r) => (
                <g key={`ctrl-${r.id}`}>
                  <path
                    ref={(el) => { ctrlPathRefs.current[r.id] = el; }}
                    d={r.branch || r.d}
                    stroke="#3d5c57"
                    strokeWidth="1.25"
                    strokeDasharray="3.5 3.5"
                    opacity={scene === "idle" || scene === "boxes" ? 0 : 0.42}
                  />
                  <path
                    ref={(el) => { ctrlPulseRefs.current[r.id] = el; }}
                    d={r.d}
                    stroke="#d8f4ee"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    opacity={0}
                  />
                  <circle
                    ref={(el) => { ctrlPipRefs.current[r.id] = el; }}
                    cx={r.dock.x}
                    cy={r.dock.y}
                    r="3.6"
                    fill="#1c1c1e"
                    stroke="#4a4a4a"
                    strokeWidth="1.1"
                    opacity={scene === "idle" || scene === "boxes" ? 0 : 1}
                  />
                </g>
              ))}
            </g>

            {Object.entries(L.stations).map(([id, s]) => {
              const visible = stationVisible(id);
              const lit = stationLit(id);
              const pulsing = stationPulse(id) && !reduce;
              const st = pulsing ? "active" : lit ? "done" : "pending";
              const copy = STATION_COPY[id];
              const lab = L.labels[id] || { anchor: "middle", dx: 0, dy: -22 };
              const lines = labelLines(copy);
              const logo = LOGOS[id];
              const dim = visible && !lit && scene !== "idle" && scene !== "boxes";
              return (
                <g
                  key={id}
                  transform={`translate(${s.x} ${s.y})`}
                  style={{ cursor: "pointer", opacity: visible ? (dim ? 0.38 : 1) : 0, transition: "opacity 280ms linear" }}
                  onMouseEnter={(e) => openHover(id, e)}
                  onMouseLeave={closeHoverSoon}
                  onFocus={(e) => openHover(id, e)}
                  onBlur={closeHoverSoon}
                  onClick={() => openDemo(id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${lines.join(" ")}. ${copy.blurb}`}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDemo(id); } }}
                >
                  <circle r="28" fill="transparent" />
                  {id === "artemis" ? (
                    <g>
                      {(() => {
                        const sz = L.compact ? ARTEMIS_MARK_SIZE_COMPACT : ARTEMIS_MARK_SIZE;
                        const ringOn = loading || pulsing || !!(ctrlMap && Object.values(ctrlMap).some((c) => c && c.state === "active"));
                        const r = sz * 0.58;
                        return (
                          <>
                            <circle r={r} fill="none" stroke="#2BB5A0" strokeWidth={ringOn ? 2 : 1.35} opacity={ringOn ? 1 : 0.88} />
                            <image href="artemis_mark.svg" x={-sz / 2} y={-sz / 2} width={sz} height={sz} preserveAspectRatio="xMidYMid meet" />
                          </>
                        );
                      })()}
                      {loading && (
                        <text y="64" textAnchor="middle" fill="#2BB5A0" fontSize="12" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="600" letterSpacing="0.08em">
                          Artemis loading
                        </text>
                      )}
                    </g>
                  ) : logo ? (
                    <LogoBadge x={0} y={0} spec={logo} lit={lit} pulse={pulsing} state={st} compact={L.compact} />
                  ) : (
                    <circle r={s.interchange ? 8 : st === "active" ? 6.4 : 5.2} fill="#f4f4f4" stroke={st === "pending" ? "#5a5a5a" : "#2BB5A0"} strokeWidth={st === "active" ? 2.1 : st === "done" ? 1.6 : 1.2} />
                  )}
                  {(() => {
                    const fs = id === "artemis" ? 13 : L.compact ? 10 : 11.5;
                    const lineH = L.compact ? 12 : 13.5;
                    const startY = lab.dy < 0 ? lab.dy - (lines.length - 1) * lineH : lab.dy;
                    const maxChars = Math.max(...lines.map((ln) => ln.length), 1);
                    const pw = maxChars * (fs * 0.58) + 16;
                    const ph = lines.length * lineH + 8;
                    let px = lab.dx;
                    if (lab.anchor === "middle") px = lab.dx - pw / 2;
                    else if (lab.anchor === "end") px = lab.dx - pw;
                    const py = startY - fs + 1;
                    const hideLabel = id === "artemis" && loading;
                    if (hideLabel) return null;
                    return (
                      <g style={{ pointerEvents: "none" }}>
                        <rect x={px} y={py} width={pw} height={ph} rx="3.5" fill="rgba(10,10,11,0.96)" stroke="rgba(10,10,11,0.96)" strokeWidth="3" />
                        {lines.map((ln, i) => (
                          <text
                            key={i}
                            x={lab.dx}
                            y={startY + i * lineH}
                            textAnchor={lab.anchor}
                            fill={lit ? INK : "#ececec"}
                            fontSize={fs}
                            fontFamily="ui-sans-serif, system-ui, sans-serif"
                            fontWeight={id === "artemis" || id === "advqc" ? 600 : 500}
                          >
                            {ln}
                          </text>
                        ))}
                      </g>
                    );
                  })()}
                </g>
              );
            })}

            {!reduce &&
              Array.from({ length: trainCount }).map((_, i) => {
                const src = i < mainTracks.length ? mainTracks[i] : mainTracks[i - mainTracks.length];
                return (
                  <g key={`train-${i}`} ref={(el) => { trainRefs.current[i] = el; }} opacity="0">
                    <g className="car">
                      <rect x="-10" y="-3.8" width="20" height="7.6" rx="2.6" fill={src.color} stroke="#f4f4f4" strokeWidth="1" />
                    </g>
                    <g className="car">
                      <rect x="-9" y="-3.4" width="18" height="6.8" rx="2.3" fill={src.color} stroke="#f4f4f4" strokeWidth="0.9" />
                    </g>
                    <g className="car">
                      <rect x="-8" y="-3.0" width="16" height="6.0" rx="2.1" fill={src.color} stroke="#f4f4f4" strokeWidth="0.8" opacity="0.92" />
                    </g>
                  </g>
                );
              })}

            {!reduce && (
              <g ref={agentRef} opacity="0">
                <circle r="12" fill="rgba(43,181,160,0.28)" />
                <circle r="6.4" fill="#2BB5A0" stroke="#f4f4f4" strokeWidth="1.4" />
                <circle r="2" fill="#f4f4f4" />
              </g>
            )}

            <text x={L.vertical ? 20 : 360} y={L.H - 10} fill={card ? INK : DIM} fontSize="11" fontFamily="ui-sans-serif, system-ui, sans-serif">
              {card ? `${labelLines(card).join(" ")}. ${card.blurb}` : hint}
            </text>
            <text x={L.W - 16} y={L.H - 10} textAnchor="end" fill="#6a6a6a" fontSize="8" fontFamily="ui-sans-serif, system-ui, sans-serif">
              Map style after nf-metro (MIT)
            </text>
          </svg>

          {!L.vertical && (
            <div
              style={{
                position: "absolute",
                left: `${(L.terminal.x / L.W) * 100}%`,
                top: `${(L.terminal.y / L.H) * 100}%`,
                width: `${(L.terminal.w / L.W) * 100}%`,
                height: `${(L.terminal.h / L.H) * 100}%`,
                padding: "4px 4px 0 0",
                pointerEvents: "none",
              }}
            >
              <WranglingTerminal
                lines={termLines}
                typing={typing}
                highlight={highlight}
                reduced={reduce}
                visible={termVisible}
              />
            </div>
          )}

          {!vertical && hoverId && !modalId && (
            <CodePeek
              id={hoverId}
              x={hoverPos.x}
              y={hoverPos.y}
              containerW={hoverPos.w}
              containerH={hoverPos.h}
              onEnter={keepHover}
              onLeave={closeHoverSoon}
              onOpen={() => openDemo(hoverId)}
            />
          )}
        </div>
        {L.vertical && (
          <div className="mt-3" style={{ minHeight: 220 }}>
            <WranglingTerminal
              lines={termLines}
              typing={typing}
              highlight={highlight}
              reduced={reduce}
              visible={termVisible}
            />
          </div>
        )}
      </div>
      {modalId && <LiveRunModal id={modalId} onClose={() => setModalId(null)} />}
    </section>
  );
}
