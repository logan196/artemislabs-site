/* Terminal-driven 8-stage wrangling run.
   Draw-in (boxes, tracks, Artemis loading) happens first; this clock
   starts at t=0 after T_LOAD_END. Times are milliseconds. */

export const T_BOX = 700;
export const T_TRACK = 2000;
export const T_LOAD = 900;
export const T_LOAD_END = 3400;

const BOX_STAGES = {
  inputs: 1,
  wrangle: [2, 3, 4, 5],
  analysis: 6,
  pathways: 7,
  portal: 8,
};

export const BOX_META = {
  inputs:   { n: "1",   title: "Ingest" },
  wrangle:  { n: "2-5", title: "Wrangling" },
  analysis: { n: "6",   title: "Analysis" },
  pathways: { n: "7",   title: "Annotation & pathways" },
  portal:   { n: "8",   title: "Portal & delivery" },
};

const WRANGLE_TITLES = {
  2: { n: "2", title: "Lit review + pipeline selection" },
  3: { n: "3", title: "Metadata reconciliation" },
  4: { n: "4", title: "Adversarial QC review" },
  5: { n: "5", title: "Normalize + integrate" },
};

export function boxHeader(boxId, stageN, live) {
  if (boxId === "compute") {
    const title = "Compute  ·  SLURM";
    if (stageN < 1 && !live) return { n: "HPC", title, state: "idle" };
    return { n: "HPC", title, state: "running" };
  }
  const meta = BOX_META[boxId];
  if (boxId === "wrangle") {
    if (live || stageN >= 6) return { ...meta, state: "done" };
    if (stageN < 2) return { ...meta, state: "queued" };
    const step = WRANGLE_TITLES[stageN];
    return { ...meta, state: "running", step: step.n, subtitle: step.title };
  }
  if (live || stageN >= 8) return { ...meta, state: "done" };
  const need = BOX_STAGES[boxId];
  const n = Array.isArray(need) ? need[0] : need;
  if (stageN < n) return { ...meta, state: "queued" };
  if (stageN === n) return { ...meta, state: "running" };
  return { ...meta, state: "done" };
}

function stamp(sec) {
  const h = 14;
  const m = 2 + Math.floor(sec / 60);
  const s = sec % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function buildPipeline() {
  const events = [];
  let t = 0;
  let clock = 8; // seconds after 14:02:00

  const SCALE = 0.5;
  const line = (text, opts = {}, delay = 220) => {
    events.push({ t, type: "line", text, kind: opts.kind || "log", station: opts.station || null, id: opts.id || null });
    t += delay * SCALE;
  };
  const cmd = (text) => {
    const dur = Math.min(700, 180 + text.length * 10);
    events.push({ t, type: "cmd", text });
    t += Math.max(dur * SCALE, text.length * 8 + 40);
  };
  const light = (station) => {
    events.push({ t, type: "light", station });
    events.push({ t, type: "pulse", station });
    events.push({ t: t + 700, type: "unpulse", station });
  };
  const highlight = (station) => {
    events.push({ t, type: "highlight", station });
  };
  const stage = (n) => {
    events.push({ t, type: "stage", n, state: "running" });
  };
  const stageDone = (n) => {
    events.push({ t, type: "stage", n, state: "done" });
  };

  let jobSeq = 184201;
  const dispatch = (partition, name, nodes, station) => {
    const id = String(jobSeq++);
    const n = nodes || (partition === "gpu" ? 1 : 2);
    events.push({ t, type: "sbatch", partition, job: id, name, nodes: n, station: station || null });
    line(`$ sbatch -p ${partition} -N ${n} -J ${name}`, { kind: "cmd" }, 160);
    line(`Submitted batch job ${id}`, { kind: "meta" }, 120);
    line(`[${stamp(clock++)}]   slurm  ${id}  ${name}  ${partition}  R  n=${n}`, { kind: "proc", station: station || null }, 140);
    return id;
  };
  const finishJob = (id, name, partition, station) => {
    events.push({ t, type: "sfin", partition, job: id, name, station: station || null });
    line(`[${stamp(clock++)}]   slurm  ${id}  ${name}  COMPLETED`, { kind: "done", station: station || null }, 120);
  };
  const runProc = (p) => {
    const part = p.part || "cpu";
    const nodes = p.nodes || (part === "gpu" ? 1 : 2);
    highlight(p.station);
    const jid = dispatch(part, p.name, nodes, p.station);
    if (p.cmd) cmd(p.cmd);
    line(`[${stamp(clock++)}] [${p.hash}] process > ${p.name}`, { kind: "proc", station: p.station, id: p.hash }, p.runDelay || 400);
    line(`[${stamp(clock++)}]   [100%] ${p.n} of ${p.n} done`, { kind: "done", station: p.station, id: p.hash }, 140);
    light(p.station);
    finishJob(jid, p.name, part, p.station);
    if (p.extra) line(`[${stamp(clock++)}]     ${p.extra}`, { kind: "meta", station: p.station }, 180);
  };

  cmd("$ nextflow run artemis/wrangle -profile hpc --project GBM3");
  line("N E X T F L O W  ~  version 24.10.4", { kind: "meta" }, 280);
  line("Launching `artemis/wrangle` [a3f1c2d] DSL2 - revision: 7c2e91b", { kind: "meta" }, 320);
  line(`[${stamp(clock++)}] executor > slurm (max: 64)`, { kind: "meta" }, 240);

  // 1 Ingest
  stage(1);
  line(`[${stamp(clock++)}] [stage 1/8] INGEST`, { kind: "stage" }, 300);

  const ingest = [
    { hash: "a3/f1c2", name: "INGEST:GEO",        target: "GSE194329",     n: 12, unit: "samples", extra: "md5 7f3c1a2b  bytes=3.4G  format=SOFT/FASTQ", station: "geo" },
    { hash: "b1/9c40", name: "INGEST:TENX",       target: "Visium_GBM3",   n: 1,  unit: "sample",  extra: "filtered_feature_bc_matrix.h5  1775 spots x 36601 genes", station: "tenx" },
    { hash: "c7/2e19", name: "INGEST:CELLXGENE",  target: "census_brain",  n: 1,  unit: "slice",   extra: "soma  n_obs=50000  organism=Homo sapiens", station: "cxg" },
    { hash: "d4/88a1", name: "INGEST:H5AD",       target: "GBM3_visium.h5ad", n: 1, unit: "file", extra: "AnnData  1775 x 36601  obsm['spatial'] ok", station: "h5ad" },
    { hash: "e0/11ab", name: "INGEST:FASTQ",      target: "lib_01-08",     n: 8,  unit: "libraries", extra: "sha256 9c1e...e4  layout=paired  Illumina", station: "fastq" },
    { hash: "f2/6d30", name: "INGEST:ATAC",       target: "CUTTag_GBM3",   n: 4,  unit: "bams",    extra: "chromap + MACS3  peaks=42118  format=BAM", station: "atac" },
    { hash: "a9/44ce", name: "INGEST:PROTEOMICS", target: "mq_evidence",   n: 16, unit: "samples", extra: "MaxQuant  4812 proteins  format=mzML/tsv", station: "prot" },
    { hash: "bb/01d7", name: "INGEST:STAGE",      target: "data/store",    n: 7,  unit: "assays",  extra: "wrote manifest.yml  checksums ok", station: "fetch" },
  ];
  ingest.forEach((p) => {
    runProc({ ...p, part: "cpu", nodes: p.name === "INGEST:FASTQ" || p.name === "INGEST:ATAC" ? 4 : 2 });
  });
  stageDone(1);

  // 2 Literature review + pipeline selection
  stage(2);
  line(`[${stamp(clock++)}] [stage 2/8] LIT REVIEW + PIPELINE`, { kind: "stage" }, 280);
  cmd("$ artemis lit pubmed_review --query BANKSY+GBM");
  const job_lit = dispatch("cpu", "LIT:PUBMED", 1, "litreview");
  highlight("litreview");
  line(`[${stamp(clock++)}] [c1/77e0] process > LIT:PUBMED`, { kind: "proc", station: "litreview" }, 400);
  line(`[${stamp(clock++)}]   [100%] 25 of 25 done`, { kind: "done", station: "litreview" }, 140);
  light("litreview");
  finishJob(job_lit, "LIT:PUBMED", "cpu", "litreview");
  line(`[${stamp(clock++)}]     25 PMIDs  methods scored  wrote lit/review.json`, { kind: "meta" }, 240);

  cmd("$ artemis pipe select --from lit/review.json");
  const job_pipe = dispatch("cpu", "PIPELINE:SELECT", 1, "pipeline");
  highlight("pipeline");
  line(`[${stamp(clock++)}] [c2/19aa] process > PIPELINE:SELECT`, { kind: "proc", station: "pipeline" }, 400);
  line(`[${stamp(clock++)}]   [100%] 1 of 1 done`, { kind: "done", station: "pipeline" }, 140);
  light("pipeline");
  finishJob(job_pipe, "PIPELINE:SELECT", "cpu", "pipeline");
  line(`[${stamp(clock++)}]     BANKSY 0.1.9 + scanpy 1.10 + nf-core/atacseq`, { kind: "meta" }, 260);
  stageDone(2);

  // 3 Metadata
  stage(3);
  line(`[${stamp(clock++)}] [stage 3/8] METADATA RECONCILE`, { kind: "stage" }, 280);
  cmd("$ artemis meta reconcile --obo cl.obo");
  const job_meta = dispatch("cpu", "META:RECONCILE", 1, "metadata");
  highlight("metadata");
  line(`[${stamp(clock++)}] [d8/3b12] process > META:RECONCILE`, { kind: "proc", station: "metadata" }, 440);
  line(`[${stamp(clock++)}]   [100%] 44 of 44 done`, { kind: "done", station: "metadata" }, 140);
  light("metadata");
  finishJob(job_meta, "META:RECONCILE", "cpu", "metadata");
  line(`[${stamp(clock++)}]     mapped 41 / 44 labels to CL  3 unmapped flagged`, { kind: "meta" }, 260);
  stageDone(3);

  // 4 Adversarial QC
  stage(4);
  line(`[${stamp(clock++)}] [stage 4/8] ADVERSARIAL QC`, { kind: "stage" }, 280);
  cmd("$ artemis qc adversarial --assays all");
  const job_qc = dispatch("cpu", "QC:ADVERSARIAL", 4, "advqc");
  highlight("advqc");
  line(`[${stamp(clock++)}] [e5/aa09] process > QC:ADVERSARIAL`, { kind: "proc", station: "advqc" }, 320);
  line(`[${stamp(clock++)}]     spatial PASS  mt%=4.1  spots=1775`, { kind: "meta" }, 280);
  line(`[${stamp(clock++)}]     scrna PASS  doublets=2.4%  cells=8432`, { kind: "meta" }, 280);
  line(`[${stamp(clock++)}]     bulk PASS  FastQC 8/8  STAR uniquely mapped=89%`, { kind: "meta" }, 280);
  line(`[${stamp(clock++)}]     atac PASS  FRiP=0.41  TSS=7.8`, { kind: "meta" }, 280);
  line(`[${stamp(clock++)}]     proteomics FLAG  ambient carryover  1 sample`, { kind: "warn" }, 320);
  line(`[${stamp(clock++)}]   [100%] 5 of 5 done`, { kind: "done", station: "advqc" }, 180);
  light("advqc");
  finishJob(job_qc, "QC:ADVERSARIAL", "cpu", "advqc");
  line(`[${stamp(clock++)}]     review: 4 pass, 1 flag  qc/adversarial_report.html`, { kind: "meta" }, 220);
  stageDone(4);

  // 5 Normalization and integration
  stage(5);
  line(`[${stamp(clock++)}] [stage 5/8] NORMALIZE + INTEGRATE`, { kind: "stage" }, 280);
  cmd("$ artemis integrate --method harmony,scvi");
  const job_harm = dispatch("cpu", "INTEGRATE:HARMONY", 4, "norm");
  const job_scvi = dispatch("gpu", "INTEGRATE:SCVI", 1, "norm");
  highlight("norm");
  line(`[${stamp(clock++)}] [f0/c414] process > INTEGRATE:HARMONY`, { kind: "proc", station: "norm" }, 400);
  line(`[${stamp(clock++)}] [f0/c415] process > INTEGRATE:SCVI`, { kind: "proc", station: "norm" }, 360);
  line(`[${stamp(clock++)}]   [100%] 4 of 4 done`, { kind: "done", station: "norm" }, 140);
  light("norm");
  finishJob(job_harm, "INTEGRATE:HARMONY", "cpu", "norm");
  finishJob(job_scvi, "INTEGRATE:SCVI", "gpu", "norm");
  line(`[${stamp(clock++)}]     Harmony + scVI  A100  wrote GBM3_integrated.h5ad`, { kind: "meta" }, 200);
  events.push({ t, type: "light", station: "artemis" });
  stageDone(5);

  // 6 Analysis
  stage(6);
  line(`[${stamp(clock++)}] [stage 6/8] ANALYSIS`, { kind: "stage" }, 280);
  const analysis = [
    { cmd: "$ python scanpy_cluster --resolution 0.8", part: "cpu", nodes: 2, hash: "11/ab02", name: "ANALYSIS:SCANPY", target: "leiden", n: 12, unit: "clusters", extra: "scanpy 1.10.2  Python 3.12  Leiden 12 clusters", station: "scanpy" },
    { cmd: "$ Rscript bioc_de.R --seurat 5.1 --bioc 3.19", part: "cpu", nodes: 2, hash: "12/44f0", name: "ANALYSIS:SEURAT", target: "DESeq2", n: 16, unit: "samples", extra: "1204 genes at padj < 0.05", station: "rlang" },
    { cmd: "$ nextflow run nf-core/rnaseq -r 3.14.0 -profile hpc", part: "cpu", nodes: 8, hash: "13/90c1", name: "ANALYSIS:NEXTFLOW", target: "rnaseq", n: 3, unit: "processes", extra: "FASTQC + STAR + FEATURECOUNTS  all done", station: "nextflow" },
    { cmd: "$ python embed_umap --n_neighbors 15", part: "gpu", nodes: 1, hash: "14/2d77", name: "ANALYSIS:UMAP", target: "X_umap", n: 2, unit: "embeddings", extra: "n=1775 spots + 8432 cells", station: "umap" },
    { cmd: "$ python banksy.run --lambda 0.2", part: "cpu", nodes: 2, hash: "15/ee3a", name: "ANALYSIS:BANKSY", target: "domains", n: 8, unit: "domains", extra: "BANKSY 0.1.9  domain 7: 97 spots", station: "banksy" },
    { cmd: "$ artemis de --group domain_7 --method wilcoxon", part: "cpu", nodes: 1, hash: "16/07b8", name: "ANALYSIS:DE", target: "wilcoxon", n: 1, unit: "contrast", extra: "wrote out/de_domain7.csv  pyDESeq2 fallback", station: "de" },
  ];
  analysis.forEach((p) => runProc(p));
  stageDone(6);

  // 7 Annotation and pathways
  stage(7);
  line(`[${stamp(clock++)}] [stage 7/8] ANNOTATION + PATHWAYS`, { kind: "stage" }, 280);
  const annot = [
    { cmd: "$ artemis annotate --model CellTypist", part: "gpu", nodes: 1, hash: "21/c9d0", name: "ANNOTATE:CELLTYPIST", target: "CL", n: 12, unit: "clusters", extra: "mapped onto Cell Ontology  wrote obs['cell_type']", station: "annotate" },
    { cmd: "$ artemis enrich --libraries kegg,reactome,string,enrichr", part: "cpu", nodes: 1, hash: "22/1a55", name: "PATHWAY:ENRICH", target: "domain_7", n: 4, unit: "libraries", extra: "wrote out/pathways.csv", station: "pathway" },
    { cmd: "$ artemis enrich kegg --gseapy 1.1", part: "cpu", nodes: 1, hash: "23/88e2", name: "PATHWAY:KEGG", target: "HIF-1", n: 1, unit: "run", extra: "top: HIF-1 signaling  padj=1.2e-6", station: "kegg" },
    { cmd: "$ artemis enrich reactome", part: "cpu", nodes: 1, hash: "24/5b01", name: "PATHWAY:REACTOME", target: "ECM", n: 1, unit: "run", extra: "top: Extracellular matrix organization", station: "reactome" },
    { cmd: "$ artemis enrich string --species 9606", part: "cpu", nodes: 1, hash: "25/d3aa", name: "PATHWAY:STRING", target: "PPI", n: 1, unit: "run", extra: "80 proteins, 214 edges", station: "string" },
    { cmd: "$ artemis enrich enrichr --lib Hallmark", part: "cpu", nodes: 1, hash: "26/0f19", name: "PATHWAY:ENRICHR", target: "Hallmark", n: 1, unit: "run", extra: "HYPOXIA  padj=3.4e-5", station: "enrichr" },
  ];
  annot.forEach((p) => runProc(p));
  stageDone(7);

  // 8 Portal and delivery
  stage(8);
  line(`[${stamp(clock++)}] [stage 8/8] PORTAL + DELIVERY`, { kind: "stage" }, 280);
  const deliver = [
    { cmd: "$ artemis export zarr --out out/GBM3.zarr", part: "cpu", nodes: 1, hash: "31/aa10", name: "DELIVER:ZARR", target: "GBM3.zarr", n: 1, unit: "store", extra: "zarr 2.18  chunks=256  wrote out/GBM3.zarr", station: "zarr" },
    { cmd: "$ artemis export vitessce --out out/vitessce.json", part: "cpu", nodes: 1, hash: "32/b6c3", name: "DELIVER:VITESSCE", target: "view_config", n: 3, unit: "views", extra: "spatial + umap + genes  vitessce 3.5", station: "vitessce" },
    { cmd: "$ jupyter execute explore.ipynb --kernel python3", part: "cpu", nodes: 1, hash: "33/4e2f", name: "DELIVER:NOTEBOOK", target: "explore.ipynb", n: 1, unit: "nb", extra: "wrote explore.nb.html  JupyterLab 4.2", station: "jupyter" },
    { cmd: "$ artemis report --out out/report.html --multiqc", part: "cpu", nodes: 1, hash: "34/91de", name: "DELIVER:REPORT", target: "report.html", n: 1, unit: "file", extra: "methods, figures, portal link  MultiQC 1.24", station: "report" },
  ];
  deliver.forEach((p) => runProc(p));
  line(`[${stamp(clock++)}] [a3f1c2d] pipeline completed successfully`, { kind: "done" }, 240);
  line("done. portal ready.", { kind: "done" }, 200);
  stageDone(8);
  events.push({ t, type: "live" });
  events.sort((a, b) => a.t - b.t);
  return { events, duration: t };
}

export const PIPELINE = buildPipeline();

export function trackSpan(through, litSet) {
  const ids = through || [];
  if (ids.length < 2) return 0;
  let last = -1;
  for (let i = 0; i < ids.length; i++) {
    if (litSet.has(ids[i])) last = i;
    else break;
  }
  if (last < 1) return 0;
  return last / (ids.length - 1);
}

export const INITIAL_LIT = new Set(["artemis"]);

export function finalLit() {
  return new Set([
    "geo", "tenx", "cxg", "h5ad", "fastq", "atac", "prot", "fetch",
    "litreview", "pipeline", "metadata", "norm", "advqc", "artemis",
    "scanpy", "rlang", "nextflow", "umap", "banksy", "de",
    "annotate", "pathway", "kegg", "reactome", "string", "enrichr",
    "zarr", "vitessce", "jupyter", "report",
  ]);
}

export function completedLines() {
  return PIPELINE.events.filter((e) => e.type === "line" || e.type === "cmd").map((e) => ({
    text: e.type === "cmd" ? e.text : e.text,
    kind: e.type === "cmd" ? "cmd" : (e.kind || "log"),
    station: e.station || null,
  }));
}



export const CPU_TOTAL = 16;
export const GPU_TOTAL = 4;

export function emptyCompute() {
  return { cpuJobs: [], gpuJobs: [], cpuUsed: 0, gpuUsed: 0 };
}

export function applyCompute(state, ev) {
  const next = {
    cpuJobs: state.cpuJobs.slice(),
    gpuJobs: state.gpuJobs.slice(),
  };
  if (ev.type === "sbatch") {
    const job = { id: ev.job, name: ev.name, nodes: ev.nodes || 1, partition: ev.partition };
    if (ev.partition === "gpu") next.gpuJobs.push(job);
    else next.cpuJobs.push(job);
  } else if (ev.type === "sfin") {
    const key = ev.partition === "gpu" ? "gpuJobs" : "cpuJobs";
    next[key] = next[key].filter((j) => j.id !== ev.job);
  }
  return {
    ...next,
    cpuUsed: next.cpuJobs.reduce((s, j) => s + j.nodes, 0),
    gpuUsed: next.gpuJobs.reduce((s, j) => s + j.nodes, 0),
  };
}

export function liveCompute() {
  return {
    cpuJobs: [
      { id: "184260", name: "nf-core/rnaseq", nodes: 4, partition: "cpu" },
      { id: "184261", name: "BANKSY", nodes: 2, partition: "cpu" },
    ],
    gpuJobs: [
      { id: "184262", name: "scVI", nodes: 1, partition: "gpu" },
      { id: "184263", name: "CellTypist", nodes: 1, partition: "gpu" },
    ],
    cpuUsed: 6,
    gpuUsed: 2,
  };
}

/* Official artemis_mark.svg viewBox is -1.78 -1.78 3.56 3.56.
   Hull vertices of the drawn dodecahedron, in mark space. */
export const ARTEMIS_MARK_SIZE = 84;
export const ARTEMIS_MARK_SIZE_COMPACT = 56;
const MARK_VB = 3.56;
const MARK_HULL = [
  [1.721, -0.171],
  [1.404, 1.009],
  [0.671, 1.358],
  [-0.438, 1.634],
  [-1.261, 0.839],
  [-1.721, 0.171],
  [-1.404, -1.009],
  [-0.671, -1.358],
  [0.438, -1.634],
  [1.261, -0.839],
];

function markAngle(p) {
  return (Math.atan2(p[1], p[0]) * 180 / Math.PI + 360) % 360;
}

function angDiff(a, b) {
  let d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

// Vertices plus edge midpoints, so tracks can dock on sides or corners.
const MARK_PORTS = [];
for (let i = 0; i < MARK_HULL.length; i++) {
  const a = MARK_HULL[i];
  const b = MARK_HULL[(i + 1) % MARK_HULL.length];
  MARK_PORTS.push(a);
  MARK_PORTS.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
}

export function artemisPoint(cx, cy, vx, vy, size, inflate = 1) {
  const s = (size / MARK_VB) * inflate;
  return [cx + vx * s, cy + vy * s];
}

export function artemisArc(cx, cy, inDeg, outDeg, size = ARTEMIS_MARK_SIZE) {
  // Inflate past the drawn silhouette so rounded chords stay outside the mark.
  const inflate = 1.16;
  const approach = 1.32;
  const n = MARK_PORTS.length;
  const angs = MARK_PORTS.map(markAngle);
  const nearest = (deg) => {
    let bi = 0;
    let bd = 1e9;
    angs.forEach((a, i) => {
      const d = angDiff(a, deg);
      if (d < bd) {
        bd = d;
        bi = i;
      }
    });
    return bi;
  };
  const i0 = nearest(inDeg);
  const i1 = nearest(outDeg);
  const cw = (i1 - i0 + n) % n;
  const ccw = (i0 - i1 + n) % n;
  const hull = [];
  if (cw <= ccw) {
    for (let k = 0; k <= cw; k++) hull.push(MARK_PORTS[(i0 + k) % n]);
  } else {
    for (let k = 0; k <= ccw; k++) hull.push(MARK_PORTS[(i0 - k + n) % n]);
  }
  const dock = (p, scale) => artemisPoint(cx, cy, p[0], p[1], size, scale);
  const first = hull[0];
  const last = hull[hull.length - 1];
  const path = [dock(first, approach)];
  hull.forEach((p) => path.push(dock(p, inflate)));
  if (i0 !== i1) path.push(dock(last, approach));
  return path;
}

export function snapshotAt(rt) {
  const lit = new Set(INITIAL_LIT);
  const pulse = new Set();
  const lines = [];
  let highlight = null;
  let stageN = 0;
  let typing = "";
  let live = false;
  let pendingCmd = null;
  let compute = emptyCompute();
  for (const ev of PIPELINE.events) {
    if (ev.t > rt) continue;
    if (ev.type === "cmd") {
      // if the next event is after rt, we may still be typing
      pendingCmd = ev;
      // tentatively: if enough time has passed, commit full command
      lines.push({ text: ev.text, kind: "cmd", station: null });
    } else if (ev.type === "line") {
      pendingCmd = null;
      lines.push({ text: ev.text, kind: ev.kind || "log", station: ev.station || null });
    } else if (ev.type === "light") {
      lit.add(ev.station);
    } else if (ev.type === "pulse" && ev.t + 700 > rt) {
      pulse.add(ev.station);
    } else if (ev.type === "highlight") {
      highlight = ev.station;
    } else if (ev.type === "stage") {
      stageN = ev.n;
    } else if (ev.type === "sbatch" || ev.type === "sfin") {
      compute = applyCompute(compute, ev);
    } else if (ev.type === "live") {
      live = true;
    }
  }
  if (live) {
    for (const id of finalLit()) lit.add(id);
    highlight = null;
    typing = "";
    compute = liveCompute();
  }
  return { lit, pulse, lines, highlight, stageN, typing, live, compute };
}

export function stageEndTime(n) {
  let t = 0;
  for (const ev of PIPELINE.events) {
    if (ev.type === "stage" && ev.n === n && ev.state === "done") t = ev.t;
  }
  return t;
}

export function stageRunTime(n) {
  let start = 0;
  let end = 0;
  for (const ev of PIPELINE.events) {
    if (ev.type === "stage" && ev.n === n && ev.state === "running") start = ev.t;
    if (ev.type === "stage" && ev.n === n && ev.state === "done") end = ev.t;
  }
  return Math.floor((start + end) / 2) || start;
}
