"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Real numbers. Source: NCBI GEO DataSets (eutils esearch, db=gds),   */
/* accessed 2026-11-13. The query returned <Count>62</Count>.          */
/* Included sources are exactly what this page's demos process.        */
/* ------------------------------------------------------------------ */
const GEO_QUERY =
  '(glioblastoma) AND (spatial transcriptomics) AND "Homo sapiens"[organism] AND gse[entry type]';
const ACCESSED = "2026-11-13";
const N_IDENTIFIED = 62; // GEO esearch Count, accessed 2026-11-13; re-verified 2026-11-17 still 62
const N_NOT_INGESTED = 61; // 62 minus GSE194329, the one GEO series ingested
const N_SECTIONS = 8; // sections actually shown on this page

// Two tidy bands: sources surface above the query, platforms below the count —
// nothing ever overlaps the search bar or the counter.
const CHIPS = [
  { label: "GSE194329", kind: "source" },
  { label: "10x Parent Visium", kind: "source" },
  { label: "gbmspace.org", kind: "source" },
  { label: "Visium", kind: "platform" },
  { label: "MERFISH", kind: "platform" },
  { label: "seqFISH", kind: "platform" },
];

const TILES = [
  { src: "gbm/GBM1_he.jpg", label: "GBM1 · GSE194329", sx: -220, sy: -140, r: -8 },
  { src: "gbm/GBM2_he.jpg", label: "GBM2 · GSE194329", sx: 160, sy: -180, r: 6 },
  { src: "gbm/GBM3_he.jpg", label: "GBM3 · GSE194329", sx: 260, sy: -60, r: -5 },
  { src: "gbm/GBM4_he.jpg", label: "GBM4 · GSE194329", sx: -280, sy: 40, r: 7 },
  { src: "gbm/TenX_GBM_he.jpg", label: "10x Parent Visium", sx: -140, sy: 200, r: -6 },
  { src: "dejong/AT10-BRA-5-FO-3_1_he.jpg", label: "AT10 · gbmspace.org", sx: 120, sy: 220, r: 5 },
  { src: "dejong/AT14-BRA-4-FO-2_1_he.jpg", label: "AT14 · gbmspace.org", sx: 300, sy: 120, r: -7 },
  { src: "dejong/AT15-BRA-4-FO-B2-S25_he.jpg", label: "AT15 · gbmspace.org", sx: -60, sy: -240, r: 8 },
];

const STACK_LOGOS = [
  { src: "logos/strip/r.png", label: "R" },
  { src: "logos/strip/rstudio.png", label: "RStudio" },
  { src: "logos/strip/python.png", label: "Python" },
  { src: "logos/strip/nih.png", label: "NIH" },
  { src: "logos/strip/ncbi.png", label: "NCBI" },
  { src: "logos/strip/geo.png", label: "GEO" },
  { src: "logos/strip/sra.png", label: "SRA" },
  { src: "logos/strip/cellxgene.png", label: "CELLxGENE" },
  { src: "logos/strip/allen.png", label: "Allen Institute" },
  { src: "logos/strip/bioconductor.png", label: "Bioconductor" },
  { src: "logos/strip/scanpy.png", label: "Scanpy" },
];

const ACTS = ["search", "screen", "atlas", "portal"];

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/* ---------------------------- shared markup ---------------------------- */

function FlowBox({ title, children, tone = "main", className = "" }) {
  const border = tone === "excl" ? "border-magma/50" : "border-violet/50";
  return (
    <div className={`rounded-[3px] border ${border} bg-panel shadow-sm px-4 py-3 ${className}`}>
      <p className="font-mono text-[11px] uppercase tracking-widest text-dim mb-1">{title}</p>
      <div className="text-[13px] md:text-sm leading-relaxed text-snow">{children}</div>
    </div>
  );
}

function PortalChrome({ interactive = true }) {
  return (
    <div className="w-full max-w-3xl mx-auto rounded-[6px] border border-line bg-panel shadow-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-line bg-ink-2">
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="ml-3 flex items-center gap-2 rounded-[3px] border border-line bg-panel px-3 py-0.5 font-mono text-[11px] md:text-xs text-dim">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-violet" />
          </span>
          artemislabs.bio/live
        </span>
      </div>
      <img
        src="demo/poster.png"
        alt="The live Artemis portal — spatial view, UMAP and copilot rail on a real GBM section"
        className="w-full block"
        loading="lazy"
      />
      <div className="px-4 py-3 border-t border-line flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[11px] md:text-xs text-dim">
          {N_SECTIONS} sections · 3 sources · one portal
        </p>
        <a
          href="live/GBM3/portal.html"
          target="_blank"
          rel="noreferrer"
          tabIndex={interactive ? 0 : -1}
          className="rounded-[3px] bg-violet-deep text-ink px-5 py-2 text-sm md:text-[15px] font-medium hover:bg-violet transition-colors"
        >
          Open the live portal →
        </a>
      </div>
    </div>
  );
}

function Caption() {
  return (
    <p className="text-[11px] md:text-[13px] text-dim leading-relaxed max-w-4xl mt-4 md:mt-6 px-1">
      <span className="font-semibold text-snow">Fig. 1&nbsp;|</span> From search to portal — the
      GEO DataSets query{" "}
      <span className="font-mono text-[12px]">
        (glioblastoma) AND (spatial transcriptomics) AND &quot;Homo sapiens&quot;[organism] AND
        gse[entry type]
      </span>{" "}
      returned {N_IDENTIFIED} human series (accessed {ACCESSED}). The funnel shows{" "}
      <span className="text-snow">our working subset, not a published systematic review</span>: the
      sections this page actually processes — GSE194329 (Ren et&nbsp;al., <i>Nat Commun</i> 2023; 4
      sections), the 10x Genomics Parent Visium GBM demonstration dataset (1 section), and the
      gbmspace.org atlas (de&nbsp;Jong et&nbsp;al., <i>Nature</i> 2026; 3 sections) — the remaining{" "}
      {N_NOT_INGESTED} GEO series were not individually adjudicated.
    </p>
  );
}

function ExclusionBody() {
  return (
    <ul className="list-none space-y-0.5 text-dim">
      <li>· no per-sample spatial files</li>
      <li>· non-target platform</li>
      <li>· not yet ingested</li>
      <li className="font-mono text-[11px] pt-1">not individually adjudicated</li>
    </ul>
  );
}

function IncludedBody({ nRef }) {
  return (
    <>
      <p className="font-semibold">
        3 sources ·{" "}
        <span className="text-violet">
          {nRef ? <span ref={nRef}>{N_SECTIONS}</span> : N_SECTIONS} sections
        </span>{" "}
        on this page
      </p>
      <ul className="list-none mt-1 space-y-0.5 text-dim">
        <li>· GSE194329 — 4 sections (Ren et al. 2023)</li>
        <li>· 10x Parent Visium — 1 section</li>
        <li>· gbmspace.org atlas — 3 sections (de Jong et al. 2026)</li>
      </ul>
    </>
  );
}

/* ----------------------- reduced-motion fallback ----------------------- */

function StaticStory() {
  return (
    <div className="space-y-14">
      {/* 1 · search */}
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-violet mb-3">01 · search</p>
        <StaticLogos />
        <div className="rounded-[3px] border border-line bg-panel p-4 font-mono text-[12px] md:text-sm text-snow">
          <span className="text-dim">geo/gds&nbsp;»&nbsp;</span>
          {GEO_QUERY}
        </div>
        <p className="mt-3 font-mono text-sm text-dim">
          <span className="text-3xl font-semibold text-snow">{N_IDENTIFIED}</span> series
          identified · accessed {ACCESSED}
        </p>
      </div>

      {/* 2 · screen */}
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-violet mb-3">02 · screen</p>
        <div className="grid gap-4 md:grid-cols-2 max-w-3xl">
          <FlowBox title={`identified · n=${N_IDENTIFIED}`}>
            GEO series matching the query, plus 2 sources identified outside GEO (10x Genomics,
            gbmspace.org).
          </FlowBox>
          <FlowBox title="screened for">
            Human GBM · Visium / MERFISH / seqFISH · per-sample spatial files + H&amp;E.
          </FlowBox>
          <FlowBox title={`not ingested · n=${N_NOT_INGESTED}`} tone="excl">
            <ExclusionBody />
          </FlowBox>
          <FlowBox title="included in this page's GBM demos">
            <IncludedBody />
          </FlowBox>
        </div>
      </div>

      {/* 3 · atlas */}
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-violet mb-3">03 · atlas</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl">
          {TILES.map((t) => (
            <figure key={t.src}>
              <img
                src={t.src}
                alt={`H&E section — ${t.label}`}
                className="w-full aspect-square object-cover rounded-[3px] ring-2 ring-violet/60"
                loading="lazy"
              />
              <figcaption className="font-mono text-[10px] md:text-[11px] text-dim mt-1">
                {t.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* 4 · portal */}
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-violet mb-3">04 · portal</p>
        <PortalChrome />
      </div>
    </div>
  );
}

/* --------------------------- animated pieces --------------------------- */

function Chip({ chip, progress, i }) {
  // patient: each chip waits its turn, rises gently into its slot
  const a = 0.03 + i * 0.02; // stays < 0.2 for all 6 chips — breakpoints must be monotonic
  const opacity = useTransform(progress, [a, a + 0.045, 0.2, 0.25], [0, 1, 1, 0]);
  const y = useTransform(progress, [a, a + 0.06], [10, 0]);
  return (
    <motion.span
      style={{ opacity, y }}
      className="flex items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-1 font-mono text-[10px] md:text-xs text-dim shadow-sm"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full animate-pulse ${chip.kind === "source" ? "bg-violet" : "bg-[#d9a45b]"}`}
        style={{ animationDelay: `${i * 0.35}s`, animationDuration: "2.2s" }}
        aria-hidden
      />
      {chip.label}
    </motion.span>
  );
}

function LogoMark({ item, progress, i, n }) {
  const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
  const sx = Math.cos(angle) * (220 + (i % 3) * 40);
  const sy = Math.sin(angle) * (110 + (i % 2) * 30);
  const a = 0.004 + i * 0.007;
  const opacity = useTransform(progress, [a, a + 0.025, 0.21, 0.27], [0, 1, 1, 0]);
  const x = useTransform(progress, [a, 0.12], [sx, 0]);
  const y = useTransform(progress, [a, 0.12], [sy, 0]);
  const scale = useTransform(progress, [a, 0.12], [0.7, 1]);
  return (
    <motion.span
      style={{ opacity, x, y, scale }}
      className="flex items-center justify-center h-8 px-1.5"
      title={item.label}
    >
      <img
        src={item.src}
        alt={item.label}
        className="h-7 w-auto max-h-7 object-contain object-center"
      />
      <span className="sr-only">{item.label}</span>
    </motion.span>
  );
}

function LogoRow({ progress }) {
  const lineOp = useTransform(progress, [0.04, 0.08, 0.21, 0.27], [0, 1, 1, 0]);
  return (
    <div className="mb-6 w-full">
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
        {STACK_LOGOS.map((item, i) => (
          <LogoMark key={item.label} item={item} progress={progress} i={i} n={STACK_LOGOS.length} />
        ))}
      </div>
      <motion.p
        style={{ opacity: lineOp }}
        className="mt-3 text-center font-mono text-[10.5px] md:text-[11px] text-dim leading-relaxed max-w-xl mx-auto"
      >
        Built on public archives and established open-source tools.
        <span className="block text-dim/80 mt-0.5">
          Logos identify tools and archives in this work — no partnership or endorsement is implied.
        </span>
      </motion.p>
    </div>
  );
}

function StaticLogos() {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
        {STACK_LOGOS.map((item) => (
          <span key={item.label} className="flex items-center justify-center h-8 px-1.5" title={item.label}>
            <img
              src={item.src}
              alt={item.label}
              className="h-7 w-auto max-h-7 object-contain object-center"
            />
          </span>
        ))}
      </div>
      <p className="mt-3 text-center font-mono text-[11px] text-dim leading-relaxed max-w-xl mx-auto">
        Built on public archives and established open-source tools.
        <span className="block text-dim/80 mt-0.5">
          Logos identify tools and archives in this work — no partnership or endorsement is implied.
        </span>
      </p>
    </div>
  );
}

function WfRow({ progress, range, name, right, tone = "main", children }) {
  const [a, b] = range;
  const opacity = useTransform(progress, [a - 0.012, a], [0, 1]);
  const bar = useTransform(progress, range, [0, 1]);
  const runOp = useTransform(progress, [a, b - 0.005, b], [1, 1, 0]);
  const doneOp = useTransform(progress, [b - 0.005, b], [0, 1]);
  const excl = tone === "excl";
  return (
    <motion.div style={{ opacity }} className="pointer-events-none">
      <div className="flex items-baseline gap-3">
        <span className="relative w-[14px] shrink-0 font-mono text-[12px] leading-none">
          <motion.span style={{ opacity: runOp }} className="absolute inset-0 text-[#d9a45b]">●</motion.span>
          <motion.span style={{ opacity: doneOp }} className={excl ? "text-magma" : "text-violet"}>
            {excl ? "⊘" : "✓"}
          </motion.span>
        </span>
        <span className="font-mono text-[11px] md:text-[11.5px] tracking-wide text-snow shrink-0">{name}</span>
        <span className="flex-1" />
        <span className="font-mono text-[10.5px] md:text-[11px] text-dim text-right">{right}</span>
      </div>
      <div className="mt-1 ml-[26px] h-[3px] rounded-full bg-line/50 overflow-hidden">
        <motion.div
          className={`h-full origin-left ${excl ? "bg-magma" : "bg-violet-deep"}`}
          style={{ scaleX: bar }}
        />
      </div>
      {children}
    </motion.div>
  );
}

function WfTask({ progress, at, label }) {
  const op = useTransform(progress, [at, at + 0.008], [0, 1]);
  return (
    <motion.span
      style={{ opacity: op }}
      className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-[3px] border border-line bg-ground/50 text-dim"
    >
      <span className="text-violet">✓</span>
      {label}
    </motion.span>
  );
}

function Connector({ progress, range, vertical = true, dashedTone = false, className = "" }) {
  const pathLength = useTransform(progress, range, [0, 1]);
  return (
    <svg
      className={className}
      width={vertical ? 2 : 56}
      height={vertical ? 28 : 2}
      viewBox={vertical ? "0 0 2 28" : "0 0 56 2"}
      fill="none"
      aria-hidden
    >
      <motion.line
        x1={vertical ? 1 : 0}
        y1={vertical ? 0 : 1}
        x2={vertical ? 1 : 56}
        y2={vertical ? 28 : 1}
        stroke={dashedTone ? "#d9a45b" : "#5fd4c4"}
        strokeWidth="2"
        strokeDasharray={dashedTone ? "4 4" : undefined}
        style={{ pathLength }}
      />
    </svg>
  );
}

function AnimatedBox({ progress, range, children, className = "" }) {
  const opacity = useTransform(progress, range, [0, 1]);
  const y = useTransform(progress, range, [16, 0]);
  return (
    <motion.div style={{ opacity, y }} className={className}>
      {children}
    </motion.div>
  );
}

function Tile({ tile, progress, i }) {
  const a = 0.56 + i * 0.012;
  const b = 0.66 + i * 0.012;
  const ease = { ease: (v) => 1 - Math.pow(1 - v, 3) }; // decelerate into the grid
  const x = useTransform(progress, [a, b], [tile.sx, 0], ease);
  const y = useTransform(progress, [a, b], [tile.sy, 0], ease);
  const rotate = useTransform(progress, [a, b], [tile.r, 0], ease);
  const opacity = useTransform(progress, [a, a + 0.03], [0, 1]);
  const ring = useTransform(progress, [0.68, 0.73], [0, 1]);
  return (
    <motion.figure style={{ x, y, rotate, opacity }} className="relative">
      <img
        src={tile.src}
        alt={`H&E section — ${tile.label}`}
        className="w-full aspect-square object-cover rounded-[3px]"
        loading="lazy"
      />
      <motion.span
        style={{ opacity: ring }}
        className="absolute inset-0 rounded-[3px] ring-2 ring-violet/70 pointer-events-none"
        aria-hidden
      />
      <motion.figcaption
        style={{ opacity: ring }}
        className="font-mono text-[9px] md:text-[11px] text-dim mt-1"
      >
        {tile.label}
      </motion.figcaption>
    </motion.figure>
  );
}

/* ------------------------------ component ------------------------------ */

export default function PrismaStory() {
  const wrapRef = useRef(null);
  const typedRef = useRef(null);
  const countRef = useRef(null);
  const idRef = useRef(null);
  const exclRef = useRef(null);
  const inclRef = useRef(null);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setReduced(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  // Direct-DOM counters + typed query: no React re-render per scroll frame.
  useEffect(() => {
    const unsub = scrollYProgress.on("change", (p) => {
      if (typedRef.current) {
        const chars = Math.round(clamp01((p - 0.015) / 0.12) * GEO_QUERY.length);
        typedRef.current.textContent = GEO_QUERY.slice(0, chars);
      }
      if (countRef.current) {
        countRef.current.textContent = String(
          Math.round(clamp01((p - 0.02) / 0.06) * N_IDENTIFIED)
        );
      }
      if (idRef.current) {
        idRef.current.textContent = String(
          Math.round(clamp01((p - 0.27) / 0.04) * N_IDENTIFIED)
        );
      }
      if (exclRef.current) {
        exclRef.current.textContent = String(
          Math.round(clamp01((p - 0.39) / 0.04) * N_NOT_INGESTED)
        );
      }
      if (inclRef.current) {
        inclRef.current.textContent = String(
          Math.round(clamp01((p - 0.45) / 0.04) * N_SECTIONS)
        );
      }
      const idx = p < 0.26 ? 0 : p < 0.55 ? 1 : p < 0.79 ? 2 : 3;
      setActive((prev) => (prev === idx ? prev : idx));
    });
    return unsub;
  }, [scrollYProgress]);

  // Act visibility windows (contiguous — no dead zones).
  const o1 = useTransform(scrollYProgress, [0, 0.2, 0.25], [1, 1, 0]);
  const headerFade = useTransform(scrollYProgress, [0.52, 0.6, 0.93, 1], [1, 0.25, 0.25, 1]);
  const o2 = useTransform(scrollYProgress, [0.26, 0.31, 0.5, 0.54], [0, 1, 1, 0]);
  const o3 = useTransform(scrollYProgress, [0.55, 0.6, 0.75, 0.79], [0, 1, 1, 0]);
  const o4 = useTransform(scrollYProgress, [0.8, 0.86, 1], [0, 1, 1]);
  const portalScale = useTransform(scrollYProgress, [0.78, 0.92], [0.92, 1]);
  const portalEvents = useTransform(o4, (v) => (v > 0.5 ? "auto" : "none"));
  const caret = useTransform(scrollYProgress, [0, 0.135, 0.15], [1, 1, 0]);

  if (reduced) {
    return (
      <section id="pipeline" className="relative px-6 md:px-14 py-16 md:py-24 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          One query, <span className="text-violet">eight sections</span>, one portal.
        </h2>
        <p className="mt-4 mb-12 max-w-2xl text-[15px] md:text-base text-dim leading-relaxed">
          The section above is one of eight — here is the paper trail that found them,
          screened them, and shipped them live.
        </p>
        <StaticStory />
        <Caption />
      </section>
    );
  }

  return (
    <section id="pipeline" ref={wrapRef} className="relative h-[300vh] md:h-[340vh]">
      <div className="sticky top-0 h-[100svh] flex flex-col overflow-hidden">
        {/* header — recedes while the atlas thumbnails fly through */}
        <motion.div
          style={{ opacity: headerFade }}
          className="px-6 md:px-14 pt-14 md:pt-20 max-w-7xl mx-auto w-full"
        >
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight max-w-3xl">
            One query, <span className="text-violet">eight sections</span>, one portal.
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] md:text-base text-dim leading-relaxed">
            The section above is one of eight — here is the paper trail that found them,
            screened them, and shipped them live.
          </p>
        </motion.div>

        {/* progress rail */}
        <div
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-5"
          aria-hidden
        >
          {ACTS.map((name, i) => (
            <div key={name} className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                  active === i ? "bg-violet" : "bg-line"
                }`}
              />
              <span
                className={`font-mono text-[10px] md:text-[11px] uppercase tracking-widest transition-colors duration-300 ${
                  active === i ? "text-violet" : "text-dim/60"
                }`}
              >
                {name}
              </span>
            </div>
          ))}
        </div>

        {/* stage */}
        <div className="relative flex-1 max-w-6xl w-full mx-auto px-8 md:px-14">
          {/* ACT 1 · SEARCH */}
          <motion.div
            style={{ opacity: o1 }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="relative w-full max-w-5xl">
              <LogoRow progress={scrollYProgress} />
              <div className="max-w-3xl mx-auto">
              <div className="flex flex-wrap justify-center gap-2.5 mb-6 min-h-[30px]">
                {CHIPS.filter((c) => c.kind === "source").map((c, i) => (
                  <Chip key={c.label} chip={c} progress={scrollYProgress} i={i} />
                ))}
              </div>
              <div className="rounded-[3px] border border-line bg-panel shadow-sm p-4 md:p-5 font-mono text-[12px] md:text-sm text-snow min-h-[5.5rem]">
                <span className="text-dim">geo/gds&nbsp;»&nbsp;</span>
                <span ref={typedRef} />
                <motion.span style={{ opacity: caret }} className="text-violet">
                  ▌
                </motion.span>
              </div>
              <p className="mt-4 font-mono text-sm text-dim text-center">
                <span ref={countRef} className="text-4xl md:text-5xl font-semibold text-snow tabular-nums">
                  {N_IDENTIFIED}
                </span>{" "}
                series identified · GEO DataSets · accessed {ACCESSED}
              </p>
              <div className="flex flex-wrap justify-center gap-2.5 mt-6 min-h-[30px]">
                {CHIPS.filter((c) => c.kind === "platform").map((c, i) => (
                  <Chip key={c.label} chip={c} progress={scrollYProgress} i={i + 3} />
                ))}
              </div>
              </div>
            </div>
          </motion.div>

          {/* ACT 2 · THE WORKFLOW — nf-core-style process board */}
          <motion.div
            style={{ opacity: o2 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-full max-w-2xl rounded-[4px] border border-line bg-panel shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-line bg-ground/60 px-4 py-2">
                <span className="font-mono text-[11px] text-dim">workflow: search_to_portal</span>
                <span className="font-mono text-[10.5px] text-violet">executor · artemis</span>
              </div>
              <div className="p-4 md:p-5 flex flex-col gap-3">
                <WfRow progress={scrollYProgress} range={[0.275, 0.305]} name="GEO_SEARCH:ESEARCH"
                  right={<><span ref={idRef} className="text-violet tabular-nums">{N_IDENTIFIED}</span> series · +2 outside GEO</>} />
                <WfRow progress={scrollYProgress} range={[0.305, 0.335]} name="SCREEN:PLATFORM"
                  right="Visium · MERFISH · seqFISH" />
                <WfRow progress={scrollYProgress} range={[0.335, 0.365]} name="SCREEN:FILES"
                  right={<>per-sample spatial + H&amp;E</>} />
                <WfRow progress={scrollYProgress} range={[0.365, 0.4]} name="EXCLUDE" tone="excl"
                  right={<><span ref={exclRef} className="text-magma tabular-nums">{N_NOT_INGESTED}</span> not ingested · not individually adjudicated</>} />
                <WfRow progress={scrollYProgress} range={[0.4, 0.49]} name="INGEST:SECTIONS"
                  right={<><span ref={inclRef} className="text-violet tabular-nums">{N_SECTIONS}</span> sections · 3 sources</>}>
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-[26px]">
                    {["GBM1", "GBM2", "GBM3", "GBM4", "TenX", "AT10", "AT14", "AT15"].map((d, i) => (
                      <WfTask key={d} progress={scrollYProgress} at={0.405 + i * 0.01} label={d} />
                    ))}
                  </div>
                </WfRow>
                <WfRow progress={scrollYProgress} range={[0.49, 0.525]} name="PORTAL:BUILD"
                  right="live — every included section" />
              </div>
            </div>
          </motion.div>

          {/* ACT 3 · ATLAS */}
          <motion.div
            style={{ opacity: o3 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-full max-w-3xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                {TILES.map((t, i) => (
                  <Tile key={t.src} tile={t} progress={scrollYProgress} i={i} />
                ))}
              </div>
              <p className="mt-4 font-mono text-[11px] md:text-xs text-dim text-center">
                {N_SECTIONS} H&amp;E sections · 3 sources · one coordinate frame
              </p>
            </div>
          </motion.div>

          {/* ACT 4 · PORTAL */}
          <motion.div
            style={{ opacity: o4, pointerEvents: portalEvents }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div style={{ scale: portalScale }} className="w-full">
              <PortalChrome />
            </motion.div>
          </motion.div>
        </div>

        {/* caption pinned to the bottom of the sticky panel */}
        <div className="px-6 md:px-14 pb-5 max-w-7xl mx-auto w-full">
          <Caption />
        </div>
      </div>
    </section>
  );
}
