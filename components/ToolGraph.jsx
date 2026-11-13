"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

/* ------------------------------------------------------------------ */
/* The stack as a connected mind map: Artemis at the center, themed   */
/* hubs around it, every tool a node. Hand-tuned layout (no physics   */
/* library) in a 1000x585 viewBox; deterministic signal pulses.       */
/* ------------------------------------------------------------------ */

const MONO = "JetBrains Mono, ui-monospace, monospace";

// chip metrics (viewBox units)
const chipW = (label) => Math.round(label.length * 6.9 + 20);
const hubW = (label) => Math.round(label.length * 7.2 + 26);
const CHIP_H = 24;
const HUB_H = 28;

const NODES = [
  // ---- center ----
  {
    id: "artemis", kind: "center", label: "Artemis", x: 500, y: 290,
    title: "Artemis BioLabs",
    blurb:
      "The hub. Every demo on this page came out of this stack — public data in, interactive portals out.",
  },

  // ---- hubs ----
  {
    id: "h-lang", kind: "hub", label: "Analysis", x: 212, y: 170,
    title: "Languages & analysis",
    blurb:
      "The working languages. Python and scanpy drive the single-cell work here; R and Bioconductor cover the methods that live on that side.",
  },
  {
    id: "h-db", kind: "hub", label: "Databases", x: 788, y: 170,
    title: "Databases",
    blurb:
      "Reference knowledge: pathway, interaction, and expression databases that turn a bare gene list into biology.",
  },
  {
    id: "h-enr", kind: "hub", label: "Enrichment", x: 775, y: 415,
    title: "Enrichment & annotation",
    blurb:
      "From gene list to meaning — enrichment tests and controlled vocabularies that put a defensible name on a cluster.",
  },
  {
    id: "h-viz", kind: "hub", label: "Visualization", x: 500, y: 500,
    title: "Visualization",
    blurb:
      "Seeing the result: interactive viewers for embeddings, tissue, and genome tracks — the part collaborators actually touch.",
  },
  {
    id: "h-pipe", kind: "hub", label: "Pipelines", x: 212, y: 415,
    title: "Pipelines & compute",
    blurb:
      "Where the compute happens — notebooks for exploration, workflow engines and local GPU when runs get heavy.",
  },
  {
    id: "h-pub", kind: "hub", label: "Public data", x: 500, y: 92,
    title: "Public data",
    blurb:
      "Where the raw material comes from — public archives and the platform vendors who publish reference datasets.",
  },

  // ---- Languages & analysis ----
  {
    id: "r", kind: "badge", label: "R", img: "logos/r.svg", x: 78, y: 82, hub: "h-lang",
    title: "R",
    blurb:
      "The statistical lingua franca of genomics. When a method ships as an R package, we meet it on its own turf.",
  },
  {
    id: "python", kind: "badge", label: "Python", img: "logos/python.svg", x: 66, y: 196, hub: "h-lang",
    title: "Python",
    blurb:
      "The backbone language of our pipelines — from QC scripts to the portals on this page, nearly everything starts in Python.",
  },
  {
    id: "bioc", kind: "chip", label: "Bioconductor", x: 212, y: 60, hub: "h-lang",
    title: "Bioconductor",
    blurb:
      "R's genomics ecosystem — thousands of peer-reviewed packages for expression, annotation, and statistics.",
  },
  {
    id: "scanpy", kind: "chip", label: "scanpy", x: 338, y: 92, hub: "h-lang",
    title: "scanpy",
    blurb:
      "Our single-cell workhorse. The clustering, UMAP, and pseudotime figures on this page are scanpy runs.",
  },

  // ---- Databases ----
  {
    id: "geo", kind: "chip", label: "GEO", x: 684, y: 68, hub: "h-db",
    title: "GEO",
    blurb:
      "Where public sequencing lands. We pull raw series straight from accession IDs — this site's glioblastoma demos come from GSE194329.",
  },
  {
    id: "kegg", kind: "chip", label: "KEGG", x: 790, y: 52, hub: "h-db",
    title: "KEGG",
    blurb:
      "Pathway maps for enrichment calls — which signaling programs a cluster is actually running.",
  },
  {
    id: "reactome", kind: "chip", label: "Reactome", x: 912, y: 92, hub: "h-db",
    title: "Reactome",
    blurb:
      "Curated human pathway hierarchy — the second opinion we read next to KEGG before calling a signaling program.",
  },
  {
    id: "string", kind: "chip", label: "STRING", x: 936, y: 178, hub: "h-db",
    title: "STRING",
    blurb:
      "Protein–protein interaction networks — for asking whether a marker set actually hangs together as a complex.",
  },
  {
    id: "cellxgene", kind: "chip", label: "CELLxGENE", x: 912, y: 262, hub: "h-db",
    title: "CELLxGENE",
    blurb:
      "The CZI single-cell atlas ecosystem — published reference datasets to sanity-check a cell-state call against.",
  },

  // ---- Enrichment & annotation ----
  {
    id: "enrichr", kind: "chip", label: "Enrichr", x: 920, y: 372, hub: "h-enr",
    title: "Enrichr",
    blurb:
      "One gene list in, ranked enrichment across hundreds of libraries out — the fastest first pass on what a cluster is doing.",
  },
  {
    id: "cellont", kind: "chip", label: "Cell Ontology", x: 893, y: 462, hub: "h-enr",
    title: "Cell Ontology",
    blurb:
      "The controlled vocabulary for cell types — labels that mean the same thing across every dataset and atlas.",
  },

  // ---- Pipelines & compute ----
  {
    id: "nextflow", kind: "chip", label: "Nextflow", x: 84, y: 362, hub: "h-pipe",
    title: "Nextflow",
    blurb:
      "The workflow engine for runs too big for a notebook — every step declared, containerized, and resumable.",
  },
  {
    id: "jupyter", kind: "badge", label: "Jupyter", img: "logos/jupyter.svg", x: 66, y: 452, hub: "h-pipe",
    title: "Jupyter",
    blurb:
      "Exploratory home base. Analyses start as notebooks, so every figure keeps the code that made it.",
  },
  {
    id: "gpu", kind: "chip", label: "GPU", x: 196, y: 505, hub: "h-pipe",
    title: "Local GPU",
    blurb:
      "Local GPU compute. The language models behind our copilot run on our own hardware — Qwen via Ollama — so data never leaves the machine.",
  },

  // ---- Visualization ----
  {
    id: "vitessce", kind: "chip", label: "Vitessce", x: 352, y: 548, hub: "h-viz",
    title: "Vitessce",
    blurb:
      "The viewer every portal on this page is built on — linked UMAP, tissue, and expression panels, all in the browser.",
  },
  {
    id: "umap", kind: "chip", label: "UMAP", x: 640, y: 548, hub: "h-viz",
    title: "UMAP",
    blurb:
      "The 2-D fold of expression space. Every embedding figure above is a UMAP — always shown beside the tissue it came from.",
  },
  {
    id: "igv", kind: "chip", label: "IGV", x: 500, y: 556, hub: "h-viz",
    title: "IGV",
    blurb:
      "The genome browser for reads and tracks — when a call needs checking at base-pair resolution, we open IGV.",
  },

  // ---- Public data ----
  {
    id: "nih", kind: "badge", label: "NIH", img: "logos/nih.svg", x: 392, y: 44, hub: "h-pub",
    title: "NIH",
    blurb:
      "NIH archives — GEO, SRA, dbGaP — hold most of the world's public sequencing. The demos on this site are built on NIH-hosted data.",
  },
  {
    id: "tenx", kind: "chip", label: "10x Genomics", x: 612, y: 40, hub: "h-pub",
    title: "10x Genomics",
    blurb:
      "Maker of the Chromium and Visium platforms. Their published datasets are the reference sections in our GBM demos.",
  },
];

// hubs connect to center; leaves to their hub; cross-links are real relationships
const EDGES = [
  // spokes
  { a: "h-lang", b: "artemis" },
  { a: "h-db", b: "artemis" },
  { a: "h-enr", b: "artemis" },
  { a: "h-viz", b: "artemis" },
  { a: "h-pipe", b: "artemis" },
  { a: "h-pub", b: "artemis" },
  // leaves
  { a: "r", b: "h-lang" },
  { a: "python", b: "h-lang" },
  { a: "bioc", b: "h-lang" },
  { a: "scanpy", b: "h-lang" },
  { a: "geo", b: "h-db" },
  { a: "kegg", b: "h-db" },
  { a: "reactome", b: "h-db" },
  { a: "string", b: "h-db" },
  { a: "cellxgene", b: "h-db" },
  { a: "enrichr", b: "h-enr" },
  { a: "cellont", b: "h-enr" },
  { a: "nextflow", b: "h-pipe" },
  { a: "jupyter", b: "h-pipe" },
  { a: "gpu", b: "h-pipe" },
  { a: "vitessce", b: "h-viz" },
  { a: "umap", b: "h-viz" },
  { a: "igv", b: "h-viz" },
  { a: "nih", b: "h-pub" },
  { a: "tenx", b: "h-pub" },
  // cross-links (curved, dashed): tool-to-tool relationships
  { a: "scanpy", b: "umap", c: [468, 377] },      // scanpy computes the UMAPs
  { a: "scanpy", b: "cellxgene", c: [628, 200] }, // anndata in, atlas out
  { a: "geo", b: "tenx", c: null },               // 10x series deposited in GEO
  { a: "enrichr", b: "kegg", c: [805, 210] },     // Enrichr queries KEGG libraries
  { a: "vitessce", b: "cellxgene", c: [700, 480] }, // shared viewer ecosystem
];

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

// precomputed geometry for every edge
const EDGE_GEO = EDGES.map((e) => {
  const a = byId[e.a];
  const b = byId[e.b];
  return { ...e, x1: a.x, y1: a.y, x2: b.x, y2: b.y };
});

// point along an edge (straight lerp, or quadratic bezier for curved cross-links)
function edgePoint(e, t) {
  if (e.c) {
    const u = 1 - t;
    return {
      x: u * u * e.x1 + 2 * u * t * e.c[0] + t * t * e.x2,
      y: u * u * e.y1 + 2 * u * t * e.c[1] + t * t * e.y2,
    };
  }
  return { x: e.x1 + (e.x2 - e.x1) * t, y: e.y1 + (e.y2 - e.y1) * t };
}

// deterministic edge sequence for the pulses (fixed LCG shuffle, same every load)
const PULSE_SEQ = (() => {
  const idx = EDGE_GEO.map((_, i) => i);
  let s = 42;
  const rand = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
})();

const N_PULSES = 5;
const PULSE_MS = 2600;

const DEFAULT_CARD = {
  title: "The stack",
  blurb: "Hover any node — every tool here is one we actually run.",
};

export default function ToolGraph() {
  const [active, setActive] = useState(null); // node id or null
  const pulseRefs = useRef([]);
  const rafRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t0 = performance.now();
    const tick = (now) => {
      // rAF's first timestamp can precede t0 → negative t → Math.floor(-ε) = -1
      // → negative JS modulo → undefined edge lookup. Clamp.
      const t = Math.max(0, now - t0);
      for (let i = 0; i < N_PULSES; i++) {
        const el = pulseRefs.current[i];
        if (!el) continue;
        const phase = t / PULSE_MS + i * 0.37;
        const p = phase % 1;
        const trip = Math.floor(phase);
        const edge = EDGE_GEO[PULSE_SEQ[(trip * N_PULSES + i) % PULSE_SEQ.length]];
        const dir = (trip + i) % 2 === 0 ? p : 1 - p; // alternate direction
        const pt = edgePoint(edge, dir);
        el.setAttribute("cx", pt.x.toFixed(1));
        el.setAttribute("cy", pt.y.toFixed(1));
        el.setAttribute("opacity", (Math.sin(p * Math.PI) * 0.85).toFixed(2));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const card = active ? byId[active] : DEFAULT_CARD;
  const touches = (e) => active && (e.a === active || e.b === active);

  const nodeProps = (n) => ({
    role: "button",
    tabIndex: 0,
    "aria-label": `${n.title}: ${n.blurb}`,
    style: { cursor: "pointer", outline: "none" },
    onMouseEnter: () => setActive(n.id),
    onFocus: () => setActive(n.id),
    onClick: () => setActive(n.id),
  });

  return (
    <section id="stack" className="relative px-6 md:px-14 py-24 md:py-32 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-sm text-violet mb-4">12 · THE STACK, CONNECTED</p>
        <h3 className="text-2xl md:text-3xl font-semibold tracking-tight max-w-3xl">
          Speaks the tools you already trust.
        </h3>
        <p className="mt-4 max-w-2xl text-lg text-dim leading-relaxed">
          Not a list — a working graph: the languages, databases, and viewers behind every
          demo on this page, wired the way we actually use them.
        </p>
      </Reveal>

      <Reveal className="mt-10">
        {/* graph panel */}
        <div className="rounded-[4px] border border-line bg-panel overflow-x-auto">
          <svg
            viewBox="0 0 1000 585"
            className="block w-full h-auto min-w-[720px] max-w-[900px] mx-auto"
            aria-label="Mind map of the Artemis tool stack: six themed clusters of tools connected to a central Artemis node"
          >
            {/* ---- edges (under nodes) ---- */}
            <g fill="none">
              {EDGE_GEO.map((e, i) => {
                const hot = touches(e);
                const stroke = hot ? "rgba(17,94,89,0.65)" : "rgba(17,94,89,0.18)";
                const w = hot ? 1.6 : 1;
                return e.c ? (
                  <path
                    key={i}
                    d={`M ${e.x1} ${e.y1} Q ${e.c[0]} ${e.c[1]} ${e.x2} ${e.y2}`}
                    stroke={stroke}
                    strokeWidth={w}
                    strokeDasharray="4 6"
                  />
                ) : (
                  <line
                    key={i}
                    x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                    stroke={stroke}
                    strokeWidth={w}
                    strokeDasharray={e.a.startsWith("h-") || e.b.startsWith("h-") ? undefined : "4 6"}
                  />
                );
              })}
            </g>

            {/* ---- signal pulses ---- */}
            <g>
              {Array.from({ length: N_PULSES }).map((_, i) => (
                <circle
                  key={i}
                  ref={(el) => (pulseRefs.current[i] = el)}
                  r="2.6"
                  fill="#0f766e"
                  opacity="0"
                />
              ))}
            </g>

            {/* ---- nodes ---- */}
            {NODES.map((n) => {
              const isActive = active === n.id;

              if (n.kind === "center") {
                return (
                  <g key={n.id} transform={`translate(${n.x} ${n.y})`} {...nodeProps(n)}>
                    <circle r="46" fill="transparent" />
                    <circle
                      r="38"
                      fill="#115e59"
                      stroke={isActive ? "#0f766e" : "rgba(17,94,89,0.3)"}
                      strokeWidth={isActive ? 3 : 1}
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#f7f4ec"
                      fontFamily={MONO}
                      fontSize="13"
                      fontWeight="600"
                    >
                      Artemis
                    </text>
                  </g>
                );
              }

              if (n.kind === "badge") {
                return (
                  <g key={n.id} transform={`translate(${n.x} ${n.y})`} {...nodeProps(n)}>
                    <circle r="30" fill="transparent" />
                    <circle
                      r="20"
                      fill="#fffdf7"
                      stroke={isActive ? "#0f766e" : "#d8d2c2"}
                      strokeWidth={isActive ? 1.8 : 1}
                    />
                    <image href={n.img} x="-13" y="-13" width="26" height="26" />
                    <text
                      y="34"
                      textAnchor="middle"
                      fill={isActive ? "#115e59" : "#5f5b50"}
                      fontFamily={MONO}
                      fontSize="10.5"
                    >
                      {n.label}
                    </text>
                  </g>
                );
              }

              const hub = n.kind === "hub";
              const w = hub ? hubW(n.label) : chipW(n.label);
              const h = hub ? HUB_H : CHIP_H;
              return (
                <g key={n.id} transform={`translate(${n.x} ${n.y})`} {...nodeProps(n)}>
                  {/* generous invisible hit target */}
                  <rect x={-w / 2 - 8} y={-h / 2 - 8} width={w + 16} height={h + 16} fill="transparent" />
                  <rect
                    x={-w / 2}
                    y={-h / 2}
                    width={w}
                    height={h}
                    rx="3"
                    fill={hub ? "rgba(15,118,110,0.07)" : "#fffdf7"}
                    stroke={isActive ? "#0f766e" : hub ? "rgba(17,94,89,0.45)" : "#d8d2c2"}
                    strokeWidth={isActive ? 1.8 : 1}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={hub ? "#115e59" : "#1c1a15"}
                    fontFamily={MONO}
                    fontSize={hub ? 12 : 11.5}
                    fontWeight={hub ? 600 : 400}
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* explanation card — pinned below the graph, never follows the cursor */}
        <div
          aria-live="polite"
          className="mt-4 rounded-[4px] border border-line bg-panel px-5 py-4 min-h-[92px] md:min-h-[76px]"
        >
          <p className="font-mono text-[11px] tracking-[0.25em] text-violet uppercase mb-1.5">
            {card.title}
          </p>
          <p className="text-[15px] leading-relaxed text-snow/90 max-w-3xl">{card.blurb}</p>
        </div>
      </Reveal>
    </section>
  );
}
