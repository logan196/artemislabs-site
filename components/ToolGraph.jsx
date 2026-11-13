"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

/* ------------------------------------------------------------------ */
/* The stack as an integrations wall: a dark panel, tool logos in      */
/* rounded tiles on two orbital rings, animated light beams flowing   */
/* along curved paths into a glowing Artemis hub. Hand-tuned layout   */
/* in a 1040x640 design space (no physics library); deterministic     */
/* pulse timing; HTML tiles over an SVG beam layer, scaled to fit.    */
/* ------------------------------------------------------------------ */

const W = 1040;
const H = 640;
const CX = 520;
const CY = 320;

/* ---- tools (blurbs audited — reused verbatim from the v2 graph) ---- */
const TOOLS = [
  {
    id: "python", label: "Python", img: "logos/python.svg",
    title: "Python",
    blurb:
      "The backbone language of our pipelines — from QC scripts to the portals on this page, nearly everything starts in Python.",
  },
  {
    id: "scanpy", label: "scanpy", img: "logos/scanpy.svg",
    title: "scanpy",
    blurb:
      "Our single-cell workhorse. The clustering, UMAP, and pseudotime figures on this page are scanpy runs.",
  },
  {
    id: "vitessce", label: "Vitessce", img: "logos/vitessce.png",
    title: "Vitessce",
    blurb:
      "The viewer every portal on this page is built on — linked UMAP, tissue, and expression panels, all in the browser.",
  },
  {
    id: "geo", label: "archive", big: "GEO",
    title: "GEO",
    blurb:
      "Where public sequencing lands. We pull raw series straight from accession IDs — this site's glioblastoma demos come from GSE194329.",
  },
  {
    id: "jupyter", label: "Jupyter", img: "logos/jupyter.svg",
    title: "Jupyter",
    blurb:
      "Exploratory home base. Analyses start as notebooks, so every figure keeps the code that made it.",
  },
  {
    id: "nextflow", label: "Nextflow", img: "logos/nextflow.svg",
    title: "Nextflow",
    blurb:
      "The workflow engine for runs too big for a notebook — every step declared, containerized, and resumable.",
  },
  {
    id: "r", label: "R", img: "logos/r.svg",
    title: "R",
    blurb:
      "The statistical lingua franca of genomics. When a method ships as an R package, we meet it on its own turf.",
  },
  {
    id: "nih", label: "NIH", img: "logos/nih.svg",
    title: "NIH",
    blurb:
      "NIH archives — GEO, SRA, dbGaP — hold most of the world's public sequencing. The demos on this site are built on NIH-hosted data.",
  },
  {
    id: "tenx", label: "10x Genomics", img: "logos/tenx.svg",
    title: "10x Genomics",
    blurb:
      "Maker of the Chromium and Visium platforms. Their published datasets are the reference sections in our GBM demos.",
  },
  {
    id: "kegg", label: "KEGG", img: "logos/kegg.png",
    title: "KEGG",
    blurb:
      "Pathway maps for enrichment calls — which signaling programs a cluster is actually running.",
  },
  {
    id: "reactome", label: "Reactome", img: "logos/reactome.png",
    title: "Reactome",
    blurb:
      "Curated human pathway hierarchy — the second opinion we read next to KEGG before calling a signaling program.",
  },
  {
    id: "string", label: "STRING", img: "logos/string.png",
    title: "STRING",
    blurb:
      "Protein–protein interaction networks — for asking whether a marker set actually hangs together as a complex.",
  },
  {
    id: "cellxgene", label: "CELLxGENE", img: "logos/cellxgene.svg",
    title: "CELLxGENE",
    blurb:
      "The CZI single-cell atlas ecosystem — published reference datasets to sanity-check a cell-state call against.",
  },
  {
    id: "enrichr", label: "Enrichr", img: "logos/enrichr.png",
    title: "Enrichr",
    blurb:
      "One gene list in, ranked enrichment across hundreds of libraries out — the fastest first pass on what a cluster is doing.",
  },
  {
    id: "cellont", label: "Cell Ontology", big: "CL",
    title: "Cell Ontology",
    blurb:
      "The controlled vocabulary for cell types — labels that mean the same thing across every dataset and atlas.",
  },
  {
    id: "umap", label: "embedding", big: "UMAP",
    title: "UMAP",
    blurb:
      "The 2-D fold of expression space. Every embedding figure above is a UMAP — always shown beside the tissue it came from.",
  },
  {
    id: "igv", label: "IGV", img: "logos/igv.png",
    title: "IGV",
    blurb:
      "The genome browser for reads and tracks — when a call needs checking at base-pair resolution, we open IGV.",
  },
  {
    id: "gpu", label: "compute", big: "GPU",
    title: "Local GPU",
    blurb:
      "Local GPU compute. The language models behind our copilot run on our own hardware — Qwen via Ollama — so data never leaves the machine.",
  },
  {
    id: "bioc", label: "Bioconductor", img: "logos/bioconductor.svg",
    title: "Bioconductor",
    blurb:
      "R's genomics ecosystem — thousands of peer-reviewed packages for expression, annotation, and statistics.",
  },
];

const CENTER = {
  id: "artemis",
  title: "Artemis BioLabs",
  blurb:
    "The hub. Every demo on this page came out of this stack — public data in, interactive portals out.",
};

const DEFAULT_CARD = {
  title: "The stack",
  blurb: "This is the stack that built every demo above. Hover any tool.",
};

/* ---- orbital layout: inner ring of 7 workhorses, outer ring of 12 ---- */
const INNER = ["python", "scanpy", "vitessce", "geo", "jupyter", "nextflow", "r"];
const OUTER = [
  "nih", "tenx", "kegg", "reactome", "string", "cellxgene",
  "enrichr", "cellont", "umap", "igv", "gpu", "bioc",
];

const POS = {};
INNER.forEach((id, k) => {
  const a = -Math.PI / 2 + (k * 2 * Math.PI) / INNER.length;
  POS[id] = { x: CX + 225 * Math.cos(a), y: CY + 155 * Math.sin(a) };
});
OUTER.forEach((id, k) => {
  const a = -Math.PI / 2 + Math.PI / OUTER.length + (k * 2 * Math.PI) / OUTER.length;
  POS[id] = { x: CX + 425 * Math.cos(a), y: CY + 258 * Math.sin(a) };
});

/* ---- beams: one gently curved path per tile into the hub ---- */
const BEAMS = TOOLS.map((t, i) => {
  const { x, y } = POS[t.id];
  const dx = CX - x;
  const dy = CY - y;
  const dist = Math.hypot(dx, dy);
  // control point: midpoint pushed perpendicular, alternating side
  const bow = (i % 2 === 0 ? 1 : -1) * dist * 0.14;
  const cx = (x + CX) / 2 + (-dy / dist) * bow;
  const cy = (y + CY) / 2 + (dx / dist) * bow;
  return { id: t.id, x1: x, y1: y, cx, cy, x2: CX, y2: CY };
});
const beamById = Object.fromEntries(BEAMS.map((b) => [b.id, b]));

// point along a beam's quadratic bezier: t=0 at the tile, t=1 at the hub
function beamPoint(b, t) {
  const u = 1 - t;
  return {
    x: u * u * b.x1 + 2 * u * t * b.cx + t * t * b.x2,
    y: u * u * b.y1 + 2 * u * t * b.cy + t * t * b.y2,
  };
}

// deterministic beam sequence for the pulses (fixed LCG shuffle, same every load)
const PULSE_SEQ = (() => {
  const idx = BEAMS.map((_, i) => i);
  let s = 42;
  const rand = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
})();

const N_PULSES = 6;
const PULSE_MS = 2800;
// pulses 2 and 5 flow hub → tile; the rest flow tile → hub
const OUTBOUND = new Set([2, 5]);

const byId = Object.fromEntries([...TOOLS, CENTER].map((t) => [t.id, t]));

/* ---- tile chrome (shared desktop/mobile) ---- */
const TILE_BASE =
  "flex flex-col items-center justify-center rounded-[10px] border bg-[#1b1926] " +
  "outline-none transition-[transform,border-color,box-shadow] duration-200 will-change-transform";
const TILE_IDLE =
  "border-white/[0.08] shadow-[0_2px_10px_rgba(0,0,0,0.35)] " +
  "hover:-translate-y-[2px] hover:border-teal-300/40 hover:shadow-[0_0_0_1px_rgba(94,234,212,0.18),0_8px_24px_-8px_rgba(45,212,191,0.4)]";
const TILE_HOT =
  "-translate-y-[2px] border-teal-300/60 shadow-[0_0_0_1px_rgba(94,234,212,0.28),0_8px_24px_-8px_rgba(45,212,191,0.5)]";

function TileFace({ t, compact }) {
  const long = t.label.length > 9; // "Cell Ontology", "10x Genomics", "Bioconductor"
  return (
    <>
      {t.img ? (
        <span
          className={`flex items-center justify-center rounded-[6px] bg-[#f7f4ec] ${
            compact ? "h-[30px] w-[52px] px-[5px]" : "h-[34px] w-[58px] px-[6px]"
          }`}
        >
          <img
            src={t.img}
            alt=""
            className={`object-contain ${compact ? "max-h-[21px] max-w-[42px]" : "max-h-[24px] max-w-[46px]"}`}
          />
        </span>
      ) : (
        <span
          className={`flex items-center font-mono font-semibold tracking-[0.12em] text-teal-200/90 ${
            compact ? "h-[30px] text-[12px]" : "h-[34px] text-[13px]"
          }`}
        >
          {t.big}
        </span>
      )}
      <span
        className={`max-w-full truncate px-1 font-mono text-[#9b97ad] ${
          long
            ? compact
              ? "text-[8px] tracking-normal"
              : "text-[8.5px] tracking-normal"
            : compact
              ? "text-[8.5px] tracking-[0.04em]"
              : "text-[9.5px] tracking-[0.06em]"
        }`}
      >
        {t.label}
      </span>
    </>
  );
}

export default function ToolGraph() {
  const [active, setActive] = useState(null); // tool id or null
  const [scale, setScale] = useState(880 / W);
  const stageRef = useRef(null);
  const pulseRefs = useRef([]);
  const rafRef = useRef(0);

  // fit the fixed 1040x640 composition to the panel width (transform-only)
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const fit = () => setScale(el.clientWidth / W);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // deterministic pulse engine: pure function of elapsed time, one rAF
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t0 = performance.now();
    const tick = (now) => {
      // rAF's first timestamp can precede t0 → negative t → Math.floor(-ε) = -1
      // → negative JS modulo → undefined beam lookup. Clamp.
      const t = Math.max(0, now - t0);
      for (let i = 0; i < N_PULSES; i++) {
        const el = pulseRefs.current[i];
        if (!el) continue;
        const phase = t / PULSE_MS + i * 0.37;
        const p = phase % 1;
        const trip = Math.floor(phase);
        const beam = BEAMS[PULSE_SEQ[(trip * N_PULSES + i) % PULSE_SEQ.length]];
        const pt = beamPoint(beam, OUTBOUND.has(i) ? 1 - p : p);
        el.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
        el.setAttribute("opacity", (Math.sin(p * Math.PI) * 0.9).toFixed(2));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const card = active ? byId[active] : DEFAULT_CARD;

  const tileProps = (id) => ({
    type: "button",
    "aria-label": `${byId[id].title}: ${byId[id].blurb}`,
    onMouseEnter: () => setActive(id),
    onFocus: () => setActive(id),
    onClick: () => setActive(id),
  });

  return (
    <section id="stack" className="relative px-6 md:px-14 py-24 md:py-32 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-sm text-violet mb-4">12 · THE STACK, CONNECTED</p>
        <h3 className="text-2xl md:text-3xl font-semibold tracking-tight max-w-3xl">
          Speaks the tools you already trust.
        </h3>
        <p className="mt-4 max-w-2xl text-lg text-dim leading-relaxed">
          The languages, databases, and viewers behind every demo on this page —
          flowing into one connected stack.
        </p>
      </Reveal>

      <Reveal className="mt-10">
        {/* ---- dark integrations panel ---- */}
        <div className="relative overflow-hidden rounded-[8px] border border-snow/60 bg-[#12101d]">
          {/* dot grid + teal vignette (static, cheap) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(55% 60% at 50% 50%, rgba(45,212,191,0.08), transparent 72%)",
            }}
          />

          {/* ======== desktop: orbital wall with beams (md+) ======== */}
          <div className="relative hidden md:block overflow-x-auto px-4 py-6">
            <div ref={stageRef} className="min-w-[880px]">
              <div className="relative w-full" style={{ height: H * scale }}>
                <div
                  className="absolute left-0 top-0"
                  style={{
                    width: W,
                    height: H,
                    transform: `scale(${scale})`,
                    transformOrigin: "0 0",
                  }}
                >
                  {/* beam layer (under the tiles) */}
                  <svg
                    width={W}
                    height={H}
                    viewBox={`0 0 ${W} ${H}`}
                    className="absolute inset-0"
                    aria-hidden
                    style={{ pointerEvents: "none" }}
                  >
                    <g fill="none" strokeLinecap="round">
                      {BEAMS.map((b) => {
                        const hot = active === b.id || active === "artemis";
                        return (
                          <path
                            key={b.id}
                            d={`M ${b.x1} ${b.y1} Q ${b.cx} ${b.cy} ${b.x2} ${b.y2}`}
                            stroke={hot ? "rgba(94,234,212,0.55)" : "rgba(94,234,212,0.11)"}
                            strokeWidth={hot ? 1.5 : 1}
                            style={{ transition: "stroke 200ms" }}
                          />
                        );
                      })}
                    </g>
                    {/* light pulses: soft halo + bright core, moved via transform */}
                    {Array.from({ length: N_PULSES }).map((_, i) => (
                      <g
                        key={i}
                        ref={(el) => (pulseRefs.current[i] = el)}
                        opacity="0"
                      >
                        <circle r="7" fill="rgba(45,212,191,0.18)" />
                        <circle r="2.3" fill="#8ff5e4" />
                      </g>
                    ))}
                  </svg>

                  {/* center hub glow */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute"
                    style={{
                      left: CX,
                      top: CY,
                      width: 360,
                      height: 360,
                      transform: "translate(-50%,-50%)",
                      background:
                        "radial-gradient(closest-side, rgba(45,212,191,0.22), rgba(45,212,191,0.05) 55%, transparent 75%)",
                    }}
                  />

                  {/* center hub tile */}
                  <div
                    className="absolute"
                    style={{ left: CX, top: CY, transform: "translate(-50%,-50%)" }}
                  >
                    <button
                      {...tileProps("artemis")}
                      className={`flex h-[124px] w-[124px] flex-col items-center justify-center gap-2 rounded-[14px] border outline-none transition-[transform,border-color,box-shadow] duration-200 will-change-transform ${
                        active === "artemis"
                          ? "-translate-y-[2px] border-teal-300/70 shadow-[0_0_0_1px_rgba(94,234,212,0.3),0_0_48px_rgba(45,212,191,0.35)]"
                          : "border-teal-300/30 shadow-[0_0_36px_rgba(45,212,191,0.22)] hover:-translate-y-[2px] hover:border-teal-300/60"
                      }`}
                      style={{
                        background: "linear-gradient(180deg, #1c2b2a 0%, #171522 100%)",
                      }}
                    >
                      <img src="artemis_mark.svg" alt="" className="h-[44px] w-[44px]" />
                      <span className="font-mono text-[13px] font-semibold tracking-[0.08em] text-[#d9f5ef]">
                        Artemis
                      </span>
                    </button>
                  </div>

                  {/* tool tiles */}
                  {TOOLS.map((t) => (
                    <div
                      key={t.id}
                      className="absolute"
                      style={{
                        left: POS[t.id].x,
                        top: POS[t.id].y,
                        transform: "translate(-50%,-50%)",
                      }}
                    >
                      <button
                        {...tileProps(t.id)}
                        className={`h-[88px] w-[88px] gap-[7px] ${TILE_BASE} ${
                          active === t.id ? TILE_HOT : TILE_IDLE
                        }`}
                      >
                        <TileFace t={t} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ======== mobile: tight tile grid, no beams (<md) ======== */}
          <div className="relative grid grid-cols-4 gap-2 p-3 md:hidden">
            <button
              {...tileProps("artemis")}
              className={`col-span-4 flex h-[56px] flex-row items-center justify-center gap-3 rounded-[10px] border outline-none transition-[border-color,box-shadow] duration-200 ${
                active === "artemis"
                  ? "border-teal-300/70 shadow-[0_0_28px_rgba(45,212,191,0.3)]"
                  : "border-teal-300/30 shadow-[0_0_22px_rgba(45,212,191,0.18)]"
              }`}
              style={{ background: "linear-gradient(180deg, #1c2b2a 0%, #171522 100%)" }}
            >
              <img src="artemis_mark.svg" alt="" className="h-[26px] w-[26px]" />
              <span className="font-mono text-[12px] font-semibold tracking-[0.08em] text-[#d9f5ef]">
                Artemis
              </span>
            </button>
            {TOOLS.map((t) => (
              <button
                key={t.id}
                {...tileProps(t.id)}
                className={`aspect-[0.95] w-full gap-[5px] ${TILE_BASE} ${
                  active === t.id ? TILE_HOT : TILE_IDLE
                }`}
              >
                <TileFace t={t} compact />
              </button>
            ))}
          </div>
        </div>

        {/* explanation card — pinned below the panel, never follows the cursor */}
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
