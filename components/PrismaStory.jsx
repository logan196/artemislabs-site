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
const N_IDENTIFIED = 62; // GEO series matching the query above
const N_NOT_INGESTED = 61; // 62 minus GSE194329, the one GEO series ingested
const N_SECTIONS = 8; // sections actually shown on this page

const CHIPS = [
  { label: "GSE194329", x: "6%", y: "12%" },
  { label: "10x Parent Visium", x: "72%", y: "8%" },
  { label: "gbmspace.org", x: "80%", y: "70%" },
  { label: "Visium", x: "10%", y: "76%" },
  { label: "MERFISH", x: "58%", y: "86%" },
  { label: "seqFISH", x: "34%", y: "4%" },
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
  const a = 0.03 + i * 0.02;
  const opacity = useTransform(progress, [a, a + 0.05, 0.2, 0.25], [0, 1, 1, 0]);
  const y = useTransform(progress, [a, a + 0.08], [24, 0]);
  return (
    <motion.span
      style={{ opacity, y, left: chip.x, top: chip.y }}
      className="absolute rounded-full border border-line bg-panel px-3 py-1 font-mono text-[10px] md:text-xs text-dim shadow-sm"
    >
      {chip.label}
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
        stroke={dashedTone ? "#9a5b13" : "#0f766e"}
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
          Math.round(clamp01((p - 0.1) / 0.1) * N_IDENTIFIED)
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
  const o1 = useTransform(scrollYProgress, [0, 0.21, 0.26], [1, 1, 0]);
  const headerFade = useTransform(scrollYProgress, [0.52, 0.6, 0.93, 1], [1, 0.25, 0.25, 1]);
  const o2 = useTransform(scrollYProgress, [0.24, 0.29, 0.51, 0.55], [0, 1, 1, 0]);
  const o3 = useTransform(scrollYProgress, [0.53, 0.58, 0.76, 0.8], [0, 1, 1, 0]);
  const o4 = useTransform(scrollYProgress, [0.78, 0.85, 1], [0, 1, 1]);
  const portalScale = useTransform(scrollYProgress, [0.78, 0.92], [0.92, 1]);
  const portalEvents = useTransform(o4, (v) => (v > 0.5 ? "auto" : "none"));
  const caret = useTransform(scrollYProgress, [0, 0.135, 0.15], [1, 1, 0]);

  if (reduced) {
    return (
      <section id="pipeline" className="relative px-6 md:px-14 py-24 md:py-36 max-w-7xl mx-auto">
        <p className="font-mono text-sm text-violet mb-4">02 · FROM SEARCH TO PORTAL</p>
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
          <p className="font-mono text-sm text-violet mb-4">02 · FROM SEARCH TO PORTAL</p>
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
            <div className="relative w-full max-w-3xl">
              {CHIPS.map((c, i) => (
                <Chip key={c.label} chip={c} progress={scrollYProgress} i={i} />
              ))}
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
            </div>
          </motion.div>

          {/* ACT 2 · PRISMA FLOW */}
          <motion.div
            style={{ opacity: o2 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-full max-w-3xl grid md:grid-cols-[minmax(0,22rem)_auto_minmax(0,16rem)] md:items-start md:justify-center gap-y-0">
              {/* main spine */}
              <div className="flex flex-col items-center">
                <AnimatedBox progress={scrollYProgress} range={[0.27, 0.3]} className="w-full">
                  <FlowBox title="records identified">
                    <p className="font-semibold">
                      <span ref={idRef} className="text-violet tabular-nums">{N_IDENTIFIED}</span> GEO series
                    </p>
                    <p className="text-dim mt-0.5 text-[12px]">
                      + 2 sources outside GEO (10x Genomics · gbmspace.org)
                    </p>
                  </FlowBox>
                </AnimatedBox>
                <Connector progress={scrollYProgress} range={[0.3, 0.33]} />
                <AnimatedBox progress={scrollYProgress} range={[0.33, 0.36]} className="w-full">
                  <FlowBox title="screened for">
                    Human GBM · Visium / MERFISH / seqFISH · per-sample spatial files + H&amp;E
                  </FlowBox>
                </AnimatedBox>
                <Connector progress={scrollYProgress} range={[0.42, 0.45]} />
                <AnimatedBox progress={scrollYProgress} range={[0.45, 0.49]} className="w-full">
                  <FlowBox title="included in this page's GBM demos">
                    <IncludedBody nRef={inclRef} />
                  </FlowBox>
                </AnimatedBox>
              </div>
              {/* branch to exclusions (right on md, below on mobile) */}
              <div className="hidden md:flex items-center pt-[7.5rem]">
                <Connector
                  progress={scrollYProgress}
                  range={[0.36, 0.39]}
                  vertical={false}
                  dashedTone
                />
              </div>
              <AnimatedBox
                progress={scrollYProgress}
                range={[0.39, 0.42]}
                className="md:pt-[4.6rem] mt-3 md:mt-0"
              >
                <FlowBox title="not ingested" tone="excl">
                  <p className="font-semibold">
                    <span ref={exclRef} className="text-magma tabular-nums">{N_NOT_INGESTED}</span> GEO series
                  </p>
                  <ExclusionBody />
                </FlowBox>
              </AnimatedBox>
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
