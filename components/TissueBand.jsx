"use client";

import { useEffect, useRef } from "react";
import Reveal from "./Reveal";
import TissueViewer from "./TissueViewer";

// Public multiplexed-tissue imagery, BioImage Archive. Licenses verified on
// each study's BioStudies record (License attribute): S-BIAD605 = CC0,
// S-BIAD1237 = CC BY 4.0, S-BIAD1641 = CC BY 4.0.
const VIEWER_STATS = [
  { value: "8", label: "marker channels, composited" },
  { value: "66", label: "mapped cell states" },
  { value: "H&E", label: "paired histology · pan + zoom" },
];

const FILE_TYPES = [
  { id: "h5ad", label: "spatial counts (.h5ad)" },
  { id: "he", label: "paired H&E" },
  { id: "states", label: "cell-state labels" },
  { id: "markers", label: "marker maps" },
  { id: "zarr", label: "OME-zarr portals" },
  { id: "tracks", label: "genome tracks (bigWig / BAM)" },
  { id: "volume", label: "3D volumes" },
  { id: "report", label: "run reports (md)" },
];

/* Deterministic mini-glyphs — same conventions as StackMini (seeded PRNG,
   single static draw, no text, no fake numbers). Okabe-Ito for cell states. */
function glyphRng(seed) {
  let a = 7;
  for (const c of seed) a = (a * 33 + c.charCodeAt(0)) >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const OKABE = ["#0072B2", "#009E73", "#D55E00", "#CC79A7", "#E69F00", "#56B4E9"];

const GLYPHS = {
  h5ad(ctx, W, H, R) {
    const n = 7, cell = Math.min(W, H - 10) / (n + 1);
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++) {
        const a = 0.08 + R() * 0.8;
        ctx.fillStyle = `rgba(95,212,196,${a.toFixed(2)})`;
        ctx.fillRect(8 + c * cell, 6 + r * cell, cell - 2, cell - 2);
      }
  },
  states(ctx, W, H, R) {
    for (let k = 0; k < 6; k++) {
      const cx = 14 + R() * (W - 28), cy = 12 + R() * (H - 24);
      ctx.fillStyle = OKABE[k];
      for (let i = 0; i < 9; i++) {
        ctx.beginPath();
        ctx.arc(cx + (R() - 0.5) * 16, cy + (R() - 0.5) * 14, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },
  markers(ctx, W, H) {
    const g = ctx.createLinearGradient(8, 0, W - 8, 0);
    g.addColorStop(0, "#d9e8e4");
    g.addColorStop(1, "#0b3f3a");
    ctx.fillStyle = g;
    ctx.fillRect(8, H / 2 - 8, W - 16, 16);
    ctx.strokeStyle = "rgba(243,239,228,0.35)";
    ctx.strokeRect(8.5, H / 2 - 7.5, W - 17, 15);
  },
  zarr(ctx, W, H) {
    const rows = [[1, 0.5], [2, 0.72], [4, 0.94]];
    let y = 8;
    for (const [n, wfrac] of rows) {
      const rw = (W - 16) * wfrac, x0 = (W - rw) / 2, tw = rw / n;
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = "rgba(95,212,196,0.18)";
        ctx.strokeStyle = "rgba(95,212,196,0.7)";
        ctx.fillRect(x0 + i * tw + 1, y, tw - 2, 14);
        ctx.strokeRect(x0 + i * tw + 1.5, y + 0.5, tw - 3, 13);
      }
      y += 19;
    }
  },
  tracks(ctx, W, H, R) {
    ctx.beginPath();
    ctx.moveTo(6, H * 0.55);
    for (let x = 6; x <= W - 6; x += 3) {
      const u = (x - 6) / (W - 12);
      const peak = Math.exp(-Math.pow((u - 0.55) * 4.2, 2)) * 0.8 + Math.exp(-Math.pow((u - 0.2) * 7, 2)) * 0.3;
      ctx.lineTo(x, H * 0.55 - (peak + R() * 0.06) * H * 0.42);
    }
    ctx.lineTo(W - 6, H * 0.55);
    ctx.closePath();
    ctx.fillStyle = "rgba(95,212,196,0.75)";
    ctx.fill();
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = "rgba(154,151,141,0.5)";
      ctx.fillRect(8 + R() * (W - 50), H * 0.62 + i * 6, 26 + R() * 18, 3.5);
    }
  },
  volume(ctx, W, H) {
    ctx.strokeStyle = "rgba(95,212,196,0.8)";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(W / 2, H / 2 + (i - 1) * 9, W * 0.3, H * 0.16, 0, 0, Math.PI * 2);
      ctx.globalAlpha = 0.35 + i * 0.3;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.ellipse(W / 2, H / 2, W * 0.09, H * 0.05, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#d9a45b";
    ctx.fill();
  },
  report(ctx, W, H) {
    const x0 = W / 2 - 22, y0 = 6;
    ctx.fillStyle = "#111418";
    ctx.strokeStyle = "rgba(243,239,228,0.4)";
    ctx.fillRect(x0, y0, 44, H - 12);
    ctx.strokeRect(x0 + 0.5, y0 + 0.5, 43, H - 13);
    ctx.fillStyle = "#5fd4c4";
    ctx.fillRect(x0 + 6, y0 + 7, 20, 3);
    ctx.fillStyle = "rgba(243,239,228,0.35)";
    for (let i = 0; i < 5; i++) ctx.fillRect(x0 + 6, y0 + 15 + i * 6, 32 - (i % 2) * 8, 2);
  },
};

function FileGlyph({ kind }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !GLYPHS[kind]) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.clientWidth, H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    GLYPHS[kind](ctx, W, H, glyphRng(kind));
  }, [kind]);
  return <canvas ref={ref} className="w-full h-[64px]" aria-hidden />;
}

export default function TissueBand() {
  return (
    <section id="tissue" className="relative px-6 md:px-14 py-20 md:py-28 max-w-7xl mx-auto">
      {/* 1 · Explore Tissue Data */}
      <Reveal>
        <div className="rounded-[4px] border border-line bg-panel p-6 md:p-10 grid md:grid-cols-[1.25fr_1fr] gap-8 md:gap-12 items-center">
          <div>
            <p className="font-mono text-xs text-violet tracking-wide mb-4">
              IN-BROWSER · NO INSTALL
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Explore tissue data
            </h2>
            <p className="mt-4 max-w-xl text-[17px] text-dim leading-relaxed">
              An interactive visualizer with multi-channel marker overlays, cell
              states and paired H&amp;E —{" "}
              <span className="text-snow">right in the browser.</span> Pan and
              zoom the histology, composite expression-derived marker channels,
              toggle the mapped cell states on and off.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <a
                href="live/explore/index.html"
                target="_blank"
                rel="noreferrer"
                className="rounded-[3px] bg-violet-deep text-ink px-6 py-2.5 text-[15px] font-medium hover:bg-violet transition-colors"
              >
                Launch Tissue Visualizer ›
              </a>
              <a
                href="live/GBM3/portal.html"
                target="_blank"
                rel="noreferrer"
                className="text-violet font-medium hover:underline text-[14.5px]"
              >
                GBM atlas portal →
              </a>
            </div>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-1 gap-3">
            {VIEWER_STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-[4px] border border-line bg-ink-2/40 px-4 py-4 md:py-3.5 md:flex md:items-baseline md:gap-3"
              >
                <p className="text-2xl md:text-3xl font-semibold text-violet tabular-nums">
                  {s.value}
                </p>
                <p className="font-mono text-[11px] text-dim mt-1 md:mt-0 leading-snug">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* 2 · Public multiplexed-tissue imagery — live deep zoom */}
      <Reveal delay={0.08} className="mt-16">
        <TissueViewer />
      </Reveal>

      {/* Featured figure from the most recent image-book Fig. 1 */}
      <Reveal delay={0.08}>
        <figure id="figure-book" className="mt-16 rounded-[4px] border border-line bg-panel p-3 md:p-5">
          <img
            src="figbook/fig1_at4_methods.jpg"
            alt="Figure 1 of the AT4 methods image book: authors’ Tangram types, BANKSY domains, position-only k-means, distance to hypoxic, held-out classifier, and domain composition on Xenium section AT4-FO-2"
            className="w-full h-auto rounded-[2px] bg-black"
          />
          <figcaption className="mt-3 text-[13.5px] text-dim leading-relaxed max-w-4xl">
            <span className="font-semibold text-snow">Fig. 1&nbsp;|</span> Methods
            figure for public Xenium section AT4-FO-2 (de Jong et al., Nature 2026).
            Panels: (a) authors’ Tangram cell types, (b) BANKSY domains, (c)
            position-only k-means (k=8), (d) distance to hypoxic, (e) held-out
            classifier, (f) domain composition. Source file:
            <span className="font-mono text-[12px]"> young-deck/deploy/fig/fig1_at4_methods.png</span>.
          </figcaption>
        </figure>
      </Reveal>

      {/* 3 · Standardized file types */}
      <Reveal delay={0.08}>
        <div className="mt-16 rounded-[4px] border border-line bg-panel/70 p-6 md:p-8">
          <p className="text-[16px] text-dim leading-relaxed">
            <span className="text-snow font-medium">
              Artemis moves across all of this
            </span>{" "}
            — the artifact types already live elsewhere on this page:
          </p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FILE_TYPES.map((t) => (
              <div
                key={t.id}
                className="rounded-[4px] border border-line bg-panel p-3 flex flex-col gap-2"
              >
                {t.id === "he" ? (
                  <img
                    src="gbm/GBM1_he.jpg"
                    alt=""
                    width={120}
                    height={64}
                    className="w-full h-[64px] object-cover rounded-[2px]"
                  />
                ) : (
                  <FileGlyph kind={t.id} />
                )}
                <span className="font-mono text-[10.5px] text-dim leading-snug">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
