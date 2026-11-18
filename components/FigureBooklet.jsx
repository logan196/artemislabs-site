"use client";

// Figure Booklet flip-through: fifteen plates from the Artemis Figure Booklet
// (329 figures, 98 packages), each recreated by Artemis Biolabs on public data.
// Desktop: a two-page spread whose right leaf turns on the spine.
// Mobile: a single page that peels away to the left.
// Only the visible plates are in the DOM; neighbours are preloaded.
import { useCallback, useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import ArrowUpRight from "./ArrowUpRight";

export const BOOKLET_URL = "https://logan196.github.io/novaflow-figure-booklet/";
const DWELL = 5200; // ms per plate on auto-advance
const FLIP = 950; // ms per page turn (matches CSS)

const PLATES = [
  { s: "brainrender-v1-regions-3quarter", w: 1400, h: 1050, tool: "brainrender", kind: "3D atlas", line: "The Allen mouse brain, rendered as colored 3D region meshes.", data: "Allen Mouse Brain CCFv3, 25 µm, via the BrainGlobe atlas API" },
  { s: "pycirclize-v1-chord-interactions", w: 1309, h: 1304, tool: "pyCirclize", kind: "Chord diagram", line: "Every ligand-receptor link between cortex and hippocampus cell types, in one ring.", data: "Zeisel et al. 2015, mouse cortex and CA1 scRNA-seq, scored with LIANA+" },
  { s: "scvelo-v1-stream", w: 991, h: 534, tool: "scVelo", kind: "RNA velocity", line: "Velocity streamlines tracing neurogenesis from radial glia to mature granule cells.", data: "La Manno et al. 2018, mouse dentate gyrus, spliced and unspliced counts" },
  { s: "commot-v2-flow-stream", w: 722, h: 574, tool: "COMMOT", kind: "Spatial signalling", line: "Optimal-transport flow of PTN signalling drawn as streams across the tissue.", data: "10x Visium mouse coronal brain, CellChat mouse ligand-receptor database" },
  { s: "brainrender-v3-coronal-cut", w: 1400, h: 1050, tool: "brainrender", kind: "3D atlas", line: "A coronal cut through the 3D brain that exposes thalamus and hippocampus.", data: "Allen Mouse Brain CCFv3, 25 µm, via the BrainGlobe atlas API" },
  { s: "circlize-chord-v2-circos-genome-rings", w: 1400, h: 1400, tool: "circlize", kind: "Circos genome", line: "Dexamethasone-responsive genes placed around the human genome in stacked rings.", data: "Himes et al. 2014, airway smooth-muscle bulk RNA-seq (Bioconductor airway), hg19" },
  { s: "squidpy-v4-merfish-cell-classes", w: 928, h: 496, tool: "Squidpy", kind: "Spatial omics", line: "A MERFISH slice of hypothalamus with every cell placed and classed in situ.", data: "Moffitt et al. 2018, MERFISH mouse hypothalamus, one Bregma slice" },
  { s: "sctour-v2-vector-field", w: 1151, h: 758, tool: "scTour", kind: "Neural ODE", line: "A learned vector field over the latent space of a developing dentate gyrus.", data: "La Manno et al. 2018, mouse dentate gyrus scRNA-seq" },
  { s: "goplot-v3-gochord", w: 1400, h: 1482, tool: "GOplot", kind: "Enrichment chord", line: "Oligodendrocyte marker genes wired to the biological processes they enrich.", data: "Zeisel et al. 2015, markers vs all other cell types, enrichGO BP" },
  { s: "nilearn-v1-glass-brain", w: 1400, h: 516, tool: "nilearn", kind: "Neuroimaging", line: "A motor-task activation map projected through a transparent glass brain.", data: "NeuroVault motor-task t-map, MNI space (nilearn datasets)" },
  { s: "rctd-spacexr-v3-scatterpie-zoom", w: 1170, h: 910, tool: "RCTD", kind: "Deconvolution", line: "Cell-type mixtures inside each Visium spot, drawn as a field of pie charts.", data: "10x Visium mouse coronal brain with a Zeisel et al. 2015 reference" },
  { s: "moscot-v2-sankey", w: 1033, h: 883, tool: "moscot", kind: "Optimal transport", line: "Cell fate flowing from P12 to P35, mapped by optimal transport.", data: "La Manno et al. 2018, mouse dentate gyrus time course" },
  { s: "cytotrace2-v1-potency-umap", w: 1400, h: 592, tool: "CytoTRACE 2", kind: "Developmental potency", line: "A deep model's developmental potency score painted onto the cell map.", data: "La Manno et al. 2018, mouse dentate gyrus scRNA-seq" },
  { s: "nichenet-v3-circos", w: 1400, h: 1400, tool: "NicheNet", kind: "Ligand to target", line: "Which glial and vascular ligands best explain an oligodendrocyte program.", data: "Zeisel et al. 2015 with NicheNet v2 mouse priors (Zenodo 7074291)" },
  { s: "hdwgcna-v5-moduleumapplot", w: 1300, h: 1200, tool: "hdWGCNA", kind: "Co-expression network", line: "Single-cell co-expression modules laid out as a network of hub genes.", data: "Zeisel et al. 2015, metacells per cell type" },
];
const N = PLATES.length;
const SIZES = "(min-width: 768px) 560px, calc(100vw - 48px)";
const pad = (n) => String(n).padStart(2, "0");
const src = (p, w) => `booklet/${p.s}-${w}.webp`;
const srcSet = (p) => `${src(p, 760)} 760w, ${src(p, 1400)} 1400w`;

function FigurePage({ p, sizes, eager, flat }) {
  return (
    <div className={`${flat ? "bg-white" : "fb-paper"} absolute inset-0 flex items-center justify-center p-5 md:p-8`}>
      <img
        src={src(p, 1400)}
        srcSet={srcSet(p)}
        sizes={sizes}
        width={p.w}
        height={p.h}
        alt={`${p.tool}: ${p.line} Recreated by Artemis Biolabs on public data.`}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className="max-h-full max-w-full w-auto h-auto object-contain select-none"
      />
      {!flat && (
        <span className="absolute bottom-2.5 right-4 font-mono text-[10px] tracking-[0.18em] text-black/40 uppercase">
          Recreated by Artemis Biolabs · public data
        </span>
      )}
    </div>
  );
}

function CaptionPage({ p, i }) {
  return (
    <div className="fb-caption absolute inset-0 flex flex-col justify-between p-7 lg:p-10">
      <div>
        <p className="font-mono text-[11px] tracking-[0.22em] text-dim uppercase">
          Plate {pad(i + 1)} <span className="text-white/25">/</span> {pad(N)}
        </p>
        <p className="mt-6 font-mono text-[11px] tracking-[0.22em] text-violet uppercase">{p.kind}</p>
        <h3 className="mt-3 text-4xl lg:text-5xl text-snow" style={{ fontFamily: "var(--font-serif), Georgia, serif", fontWeight: 500 }}>
          {p.tool}
        </h3>
        <p className="mt-5 text-[17px] lg:text-lg text-snow/90 leading-relaxed max-w-sm">{p.line}</p>
      </div>
      <div className="border-t border-white/10 pt-4">
        <p className="font-mono text-[11px] text-dim leading-relaxed">Data · {p.data}</p>
        <p className="mt-2 font-mono text-[11px] text-dim">Recreated by Artemis Biolabs on public data.</p>
      </div>
    </div>
  );
}

function MobileCard({ p, i, eager }) {
  return (
    <div className="absolute inset-0 flex flex-col rounded-[4px] overflow-hidden border border-white/10 bg-panel">
      <div className="relative h-[52%] shrink-0">
        <FigurePage p={p} sizes={SIZES} eager={eager} flat />
      </div>
      <div className="flex-1 min-h-0 p-5 flex flex-col justify-between gap-3">
        <div>
          <p className="font-mono text-[10.5px] tracking-[0.2em] text-dim uppercase">
            Plate {pad(i + 1)} / {pad(N)} <span className="text-violet ml-2">{p.kind}</span>
          </p>
          <h3 className="mt-2 text-3xl text-snow" style={{ fontFamily: "var(--font-serif), Georgia, serif", fontWeight: 500 }}>{p.tool}</h3>
          <p className="mt-2 text-[15.5px] text-snow/90 leading-relaxed">{p.line}</p>
        </div>
        <p className="font-mono text-[10.5px] text-dim leading-relaxed">
          Data · {p.data}
          <br />
          Recreated by Artemis Biolabs on public data.
        </p>
      </div>
    </div>
  );
}

export default function FigureBooklet() {
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(null); // { dir: "next" | "prev", to }
  const [hidden, setHidden] = useState(false); // tab in background
  const [hover, setHover] = useState(false); // mouse over the book
  const [kbFocus, setKbFocus] = useState(false); // keyboard focus inside
  const paused = hidden || hover || kbFocus;
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [tick, setTick] = useState(0); // restarts the progress bar
  const [mode, setMode] = useState(null); // "desktop" | "mobile"; one layout only, so hidden images never load
  const rootRef = useRef(null);
  const flipTimer = useRef(null);
  const swipe = useRef(null);
  const iRef = useRef(0);
  const flipRef = useRef(null);
  iRef.current = i;
  flipRef.current = flip;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const on = () => setMode(mq.matches ? "desktop" : "mobile");
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Preload the neighbours so a turn never reveals an empty page.
  useEffect(() => {
    if (!visible) return;
    [1, -1, 2].forEach((d) => {
      const p = PLATES[(i + d + N) % N];
      const img = new Image();
      img.sizes = SIZES;
      img.srcset = srcSet(p);
      img.src = src(p, 1400);
    });
  }, [i, visible]);

  const go = useCallback(
    (to, dirHint) => {
      const cur = iRef.current;
      if (flipRef.current || to === cur) return;
      const target = (to + N) % N;
      const dir = dirHint || (target > cur ? "next" : "prev");
      setTick((t) => t + 1);
      if (reduced) {
        setI(target);
        return;
      }
      setFlip({ dir, to: target });
      clearTimeout(flipTimer.current);
      flipTimer.current = setTimeout(() => {
        setI(target);
        setFlip(null);
      }, FLIP);
    },
    [reduced]
  );
  const next = useCallback(() => go(iRef.current + 1, "next"), [go]);
  const prev = useCallback(() => go(iRef.current - 1, "prev"), [go]);
  useEffect(() => () => clearTimeout(flipTimer.current), []);

  // Auto-advance while on screen, not hovered or focused, tab visible.
  const running = visible && !paused && !reduced;
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(next, DWELL);
    return () => clearTimeout(t);
  }, [running, i, tick, next]);
  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const onKey = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    else if (e.key === "Home") { e.preventDefault(); go(0, "prev"); }
    else if (e.key === "End") { e.preventDefault(); go(N - 1, "next"); }
  };
  const onPointerDown = (e) => { swipe.current = { x: e.clientX, y: e.clientY }; };
  const onPointerUp = (e) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) (dx < 0 ? next : prev)();
  };

  const cur = PLATES[i];
  const to = flip ? PLATES[flip.to] : null;
  const shown = flip ? flip.to : i;

  // Desktop spread layers.
  let leftBase, rightBase, leaf = null;
  if (!flip) {
    leftBase = <CaptionPage p={cur} i={i} />;
    rightBase = <FigurePage p={cur} sizes={SIZES} eager />;
  } else if (flip.dir === "next") {
    leftBase = <CaptionPage p={cur} i={i} />;
    rightBase = <FigurePage p={to} sizes={SIZES} eager />;
    leaf = (
      <div className="fb-leaf fb-leaf-next" key={`n${i}-${flip.to}`}>
        <div className="fb-face"><FigurePage p={cur} sizes={SIZES} eager /><div className="fb-shade fb-shade-front" /></div>
        <div className="fb-face fb-back"><CaptionPage p={to} i={flip.to} /><div className="fb-shade fb-shade-back" /></div>
      </div>
    );
  } else {
    leftBase = <CaptionPage p={to} i={flip.to} />;
    rightBase = <FigurePage p={cur} sizes={SIZES} eager />;
    leaf = (
      <div className="fb-leaf fb-leaf-prev" key={`p${i}-${flip.to}`}>
        <div className="fb-face"><CaptionPage p={cur} i={i} /><div className="fb-shade fb-shade-front" /></div>
        <div className="fb-face fb-back"><FigurePage p={to} sizes={SIZES} eager /><div className="fb-shade fb-shade-back" /></div>
      </div>
    );
  }

  // Mobile single-page layers.
  let mBase, mLeaf = null;
  if (!flip) mBase = <MobileCard p={cur} i={i} eager />;
  else if (flip.dir === "next") {
    mBase = <MobileCard p={to} i={flip.to} eager />;
    mLeaf = <div className="fb-mleaf fb-mleaf-out" key={`mo${i}`}><MobileCard p={cur} i={i} eager /></div>;
  } else {
    mBase = <MobileCard p={cur} i={i} eager />;
    mLeaf = <div className="fb-mleaf fb-mleaf-in" key={`mi${flip.to}`}><MobileCard p={to} i={flip.to} eager /></div>;
  }

  const arrow = "h-11 w-11 grid place-items-center rounded-[3px] border border-white/15 text-snow hover:border-violet hover:text-violet focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet transition-colors";

  return (
    <section id="booklet" className="relative bg-black border-y border-white/[0.06] overflow-hidden">
      <style>{CSS}</style>
      <div className="px-6 md:px-14 py-16 md:py-24 max-w-7xl mx-auto">
        <Reveal>
          <h2 className="text-4xl md:text-6xl max-w-4xl">The Figure Booklet</h2>
          <p className="mt-6 max-w-2xl text-lg text-dim leading-relaxed">
            329 figures from 98 analysis packages, each recreated by Artemis Biolabs on public data. Fifteen of
            our favorites below: chord diagrams, 3D brains, velocity streams and spatial maps. Every one is a
            figure we can make from your data.
          </p>
        </Reveal>

        <div
          ref={rootRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Figure Booklet highlights"
          tabIndex={0}
          onKeyDown={onKey}
          onPointerEnter={(e) => { if (e.pointerType === "mouse") setHover(true); }}
          onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(false); }}
          onFocus={(e) => { if (e.target.matches(":focus-visible")) setKbFocus(true); }}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setKbFocus(false); }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { swipe.current = null; }}
          className="mt-12 md:mt-14 outline-none focus-visible:ring-1 focus-visible:ring-violet/60 rounded-[4px] touch-pan-y"
        >
          {/* Desktop: two-page spread */}
          <div className="hidden md:block fb-stage mx-auto">
            <div className="fb-book relative mx-auto">
              {mode === "desktop" && (
                <>
                  <div className="fb-half fb-left">{leftBase}</div>
                  <div className="fb-half fb-right">{rightBase}</div>
                  {leaf}
                  <div className="fb-spine" aria-hidden />
                </>
              )}
            </div>
          </div>

          {/* Mobile: single page */}
          <div className="md:hidden fb-mstage relative">
            {mode === "mobile" && mBase}
            {mode === "mobile" && mLeaf}
          </div>

          <p className="sr-only" aria-live="polite">
            Plate {shown + 1} of {N}: {PLATES[shown].tool}. {PLATES[shown].line}
          </p>

          {/* Controls */}
          <div className="mt-7 flex items-center gap-4 md:gap-6 max-w-[1120px] mx-auto">
            <button type="button" onClick={prev} aria-label="Previous plate" className={arrow}>
              <span aria-hidden>←</span>
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between font-mono text-[11px] tracking-[0.18em] uppercase text-dim">
                <span><span className="text-snow">{pad(shown + 1)}</span> / {pad(N)} · {PLATES[shown].tool}</span>
                <span className="hidden sm:inline">{running ? "Auto" : reduced ? "Manual" : "Paused"}</span>
              </div>
              <div className="mt-2 h-px bg-white/10 relative overflow-hidden">
                <div
                  key={`${i}-${tick}-${running}`}
                  className={`absolute inset-y-0 left-0 bg-violet ${running ? "fb-progress" : ""}`}
                  style={{ width: running ? undefined : `${((shown + 1) / N) * 100}%`, animationDuration: `${DWELL}ms` }}
                />
              </div>
              <div className="mt-3 hidden md:flex gap-1" role="tablist" aria-label="Choose a plate">
                {PLATES.map((p, k) => (
                  <button
                    key={p.s}
                    type="button"
                    role="tab"
                    aria-selected={k === shown}
                    aria-label={`Plate ${k + 1}: ${p.tool}`}
                    title={p.tool}
                    onClick={() => go(k)}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${k === shown ? "bg-snow" : "bg-white/15 hover:bg-white/40"}`}
                  />
                ))}
              </div>
            </div>
            <button type="button" onClick={next} aria-label="Next plate" className={arrow}>
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 max-w-[1120px] mx-auto">
          <a
            href={BOOKLET_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-[3px] bg-snow text-ink px-7 py-3 font-medium hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet transition-colors"
          >
            Open the full Figure Booklet <ArrowUpRight className="ml-2" />
          </a>
          <p className="text-[13px] text-dim leading-relaxed max-w-xl">
            All plates are recreations by Artemis Biolabs on public
            datasets, cited on each plate. Code for each figure is in the booklet.
          </p>
        </div>
      </div>
    </section>
  );
}

const CSS = `
.fb-stage{perspective:2600px;max-width:1120px}
.fb-book{height:min(600px,62vw);max-height:600px;transform-style:preserve-3d;filter:drop-shadow(0 30px 50px rgba(0,0,0,.6))}
.fb-half{position:absolute;top:0;bottom:0;width:50%;overflow:hidden}
.fb-left{left:0;border-radius:4px 0 0 4px}
.fb-right{right:0;border-radius:0 4px 4px 0}
.fb-caption{background:linear-gradient(90deg,#0c0e11 0%,#0c0e11 88%,#07080a 100%);border:1px solid rgba(255,255,255,.08);border-right:0}
.fb-paper{background:linear-gradient(90deg,#e4e0d6 0%,#ffffff 6%,#ffffff 100%)}
.fb-right .fb-paper,.fb-leaf-next .fb-face:not(.fb-back) .fb-paper{border-radius:0 4px 4px 0}
.fb-spine{position:absolute;left:50%;top:0;bottom:0;width:2px;transform:translateX(-1px);background:rgba(0,0,0,.55);pointer-events:none;z-index:5}
.fb-leaf{position:absolute;top:0;bottom:0;width:50%;transform-style:preserve-3d;z-index:4;will-change:transform}
.fb-leaf-next{left:50%;transform-origin:left center;animation:fbNext ${FLIP}ms cubic-bezier(.45,.05,.25,1) forwards}
.fb-leaf-prev{left:0;transform-origin:right center;animation:fbPrev ${FLIP}ms cubic-bezier(.45,.05,.25,1) forwards}
.fb-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden}
.fb-back{transform:rotateY(180deg)}
.fb-shade{position:absolute;inset:0;pointer-events:none}
.fb-shade-front{background:linear-gradient(90deg,rgba(0,0,0,.35),rgba(0,0,0,0) 60%);animation:fbShadeIn ${FLIP}ms ease-in forwards}
.fb-shade-back{background:linear-gradient(270deg,rgba(0,0,0,.45),rgba(0,0,0,0) 60%);animation:fbShadeOut ${FLIP}ms ease-out forwards}
@keyframes fbNext{0%{transform:rotateY(0)}100%{transform:rotateY(-180deg)}}
@keyframes fbPrev{0%{transform:rotateY(0)}100%{transform:rotateY(180deg)}}
@keyframes fbShadeIn{0%{opacity:0}100%{opacity:1}}
@keyframes fbShadeOut{0%{opacity:1}100%{opacity:0}}
.fb-mstage{height:min(640px,165vw);perspective:1600px}
.fb-mleaf{position:absolute;inset:0;transform-origin:left center;will-change:transform,opacity;z-index:2}
.fb-mleaf-out{animation:fbMOut ${FLIP}ms cubic-bezier(.45,.05,.25,1) forwards}
.fb-mleaf-in{animation:fbMOut ${FLIP}ms cubic-bezier(.45,.05,.25,1) reverse forwards}
@keyframes fbMOut{0%{transform:rotateY(0);opacity:1}70%{opacity:1}100%{transform:rotateY(-100deg);opacity:0}}
.fb-progress{width:0;animation-name:fbProg;animation-timing-function:linear;animation-fill-mode:forwards}
@keyframes fbProg{from{width:0}to{width:100%}}
@media (prefers-reduced-motion:reduce){.fb-leaf,.fb-mleaf,.fb-shade{animation:none!important}}
`;
