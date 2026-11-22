"use client";

import { useEffect, useRef } from "react";

// Working subset, not a systematic review. 62 is the GEO DataSets count.
// 61 of those series were not ingested and were not individually adjudicated,
// so the three exclusion labels are criteria, not a counted split.
// The included three are the one ingested GEO series plus two sources
// identified outside GEO. 4 + 1 + 3 = 8 sections on this page.

const IDENTIFIED = 62;
const EXCLUDED = 61;
const COLS = 10;

const BINS = [
  "no per-sample spatial files",
  "non-target platform",
  "not yet ingested",
];

const SOURCES = [
  {
    name: "GSE194329",
    cite: "Ren et al. 2023",
    n: 4,
    chips: ["GBM1", "GBM2", "GBM3", "GBM4"],
  },
  {
    name: "10x Parent Visium",
    cite: "public demonstration dataset",
    n: 1,
    chips: ["Parent"],
  },
  {
    name: "gbmspace.org",
    cite: "de Jong et al. 2026",
    n: 3,
    chips: ["AT10", "AT14", "AT15"],
  },
];

const BIN_OF = Array.from({ length: IDENTIFIED }, (_, i) => (i === 0 ? -1 : (i - 1) % 3));
const JITTER = Array.from({ length: IDENTIFIED }, (_, i) => [
  (((i * 47) % 17) - 8) * 1.7,
  (((i * 19) % 13) - 6) * 1.5,
]);

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const ease = (t) => 1 - Math.pow(1 - clamp01(t), 3);
const lerp = (a, b, t) => a + (b - a) * t;

function layout(w, h) {
  const cols = w < 480 ? 9 : COLS;
  const rows = Math.ceil(IDENTIFIED / cols);
  const left = w * 0.07;
  const top = h * 0.1;
  const gridW = w * 0.4;
  const gridH = h * 0.58;
  const homes = [];
  for (let i = 0; i < IDENTIFIED; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    homes.push({
      x: left + ((c + 0.5) / cols) * gridW,
      y: top + ((r + 0.5) / rows) * gridH,
    });
  }
  const bins = [0, 1, 2].map((b) => ({
    x: w * 0.56,
    y: h * (0.2 + b * 0.24),
  }));
  const neck = [
    { x: w * 0.16, y: h * 0.86 },
    { x: w * 0.33, y: h * 0.86 },
    { x: w * 0.5, y: h * 0.86 },
  ];
  return { homes, bins, neck };
}

function drawFunnel(ctx, w, h, s) {
  ctx.clearRect(0, 0, w, h);
  const { homes, bins, neck } = layout(w, h);

  ctx.beginPath();
  ctx.moveTo(w * 0.04, h * 0.04);
  ctx.lineTo(w * 0.5, h * 0.04);
  ctx.lineTo(w * 0.4, h * 0.74);
  ctx.lineTo(w * 0.1, h * 0.74);
  ctx.closePath();
  ctx.strokeStyle = "rgba(20, 184, 166, 0.4)";
  ctx.lineWidth = 1.25;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(w * 0.48, h * 0.36);
  ctx.lineTo(w * 0.56, h * 0.36);
  ctx.strokeStyle = "rgba(245, 158, 11, 0.45)";
  ctx.stroke();

  const r = w < 480 ? 2.6 : 3.3;

  for (let i = 0; i < IDENTIFIED; i++) {
    const home = homes[i];
    const appear = ease((s - (i % colsFor(w)) * 0.008) / 0.2);
    if (appear <= 0.01) continue;
    let x = home.x;
    let y = home.y;
    let color = "#14b8a6";
    let radius = r;
    let alpha = appear;

    if (i === 0) {
      const flow = ease((s - 0.7) / 0.24);
      x = lerp(home.x, neck[0].x, flow);
      y = lerp(home.y, neck[0].y, flow);
      radius = r + flow * 2.4;
      color = "#5eead4";
    } else {
      const peel = ease((s - 0.28 - (i % 8) * 0.012) / 0.3);
      const bin = bins[BIN_OF[i]];
      const [jx, jy] = JITTER[i];
      x = lerp(home.x, bin.x + jx, peel);
      y = lerp(home.y, bin.y + jy, peel);
      color = peel > 0.45 ? "#f59e0b" : "#14b8a6";
      alpha = appear * (1 - peel * 0.12);
      radius = r * (1 - peel * 0.05);
    }

    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const join = ease((s - 0.62) / 0.2);
  if (join > 0.01) {
    ctx.globalAlpha = join;
    ctx.fillStyle = "#5eead4";
    for (let k = 0; k < 2; k++) {
      const fromX = -8;
      const fromY = h * (0.7 + k * 0.08);
      const x = lerp(fromX, neck[k + 1].x, join);
      const y = lerp(fromY, neck[k + 1].y, join);
      ctx.beginPath();
      ctx.arc(x, y, r + join * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function colsFor(w) {
  return w < 480 ? 9 : COLS;
}

function readouts(s) {
  return {
    identified: Math.round(ease(s / 0.22) * IDENTIFIED),
    excluded: Math.round(ease((s - 0.18) / 0.36) * EXCLUDED),
    sources: Math.round(ease((s - 0.52) / 0.22) * 3),
    sections: Math.round(ease((s - 0.58) / 0.3) * 8),
    rows: ease((s - 0.55) / 0.22),
    note: ease((s - 0.48) / 0.16),
    bins: ease((s - 0.28) / 0.22),
  };
}

export default function ScreenFunnel({ progress, reduced = false }) {
  const canvasRef = useRef(null);
  const idRef = useRef(null);
  const exRef = useRef(null);
  const srcRef = useRef(null);
  const secRef = useRef(null);
  const rowsRef = useRef(null);
  const noteRef = useRef(null);
  const binRefs = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let s = reduced ? 1 : 0;

    const apply = () => {
      const n = readouts(reduced ? 1 : s);
      if (idRef.current) idRef.current.textContent = String(n.identified);
      if (exRef.current) exRef.current.textContent = String(n.excluded);
      if (srcRef.current) srcRef.current.textContent = String(n.sources);
      if (secRef.current) secRef.current.textContent = String(n.sections);
      if (rowsRef.current) {
        rowsRef.current.style.opacity = String(reduced ? 1 : n.rows);
        rowsRef.current.style.transform = `translateY(${reduced ? 0 : (1 - n.rows) * 8}px)`;
      }
      if (noteRef.current) noteRef.current.style.opacity = String(reduced ? 1 : n.note);
      binRefs.current.forEach((el) => {
        if (!el) return;
        const on = reduced || n.bins > 0.55;
        el.style.borderColor = on ? "rgba(245, 158, 11, 0.65)" : "rgba(255, 255, 255, 0.12)";
        el.style.color = on ? "#f8fafc" : "#94a3b8";
      });
    };

    const paint = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w < 2 || h < 2) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pw = Math.round(w * dpr);
      const ph = Math.round(h * dpr);
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFunnel(ctx, w, h, reduced ? 1 : s);
      apply();
    };

    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(canvas);
    let unsub = () => {};
    if (!reduced && progress) {
      const sync = (p) => {
        s = clamp01((p - 0.28) / 0.2);
        paint();
      };
      unsub = progress.on("change", sync);
      sync(progress.get());
    }
    return () => {
      ro.disconnect();
      unsub();
    };
  }, [progress, reduced]);

  return (
    <div
      className="w-full max-w-[680px] rounded-[4px] border border-line bg-panel/90 px-2.5 py-2 md:px-5 md:py-4"
      aria-label="Screening funnel. 62 GEO series identified. 61 not ingested, not individually adjudicated. 3 sources and 8 sections included."
    >
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="font-mono text-[11px] tracking-[0.16em] text-violet">02 · SCREEN</p>
        <p className="hidden font-mono text-[10px] text-dim md:block">working subset, not a systematic review</p>
      </div>

      <div className="mb-2 grid grid-cols-3 gap-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">Identified</p>
          <p ref={idRef} className="text-xl font-semibold tabular-nums leading-none text-snow md:text-3xl">
            {reduced ? IDENTIFIED : 0}
          </p>
          <p className="font-mono text-[10px] leading-tight text-dim">GEO series</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">Not ingested</p>
          <p ref={exRef} className="text-xl font-semibold tabular-nums leading-none text-magma md:text-3xl">
            {reduced ? EXCLUDED : 0}
          </p>
          <p className="font-mono text-[10px] leading-tight text-dim">not individually adjudicated</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">Included</p>
          <p className="text-xl font-semibold tabular-nums leading-none text-snow md:text-3xl">
            <span ref={srcRef}>{reduced ? 3 : 0}</span>
            <span className="text-violet"> / </span>
            <span ref={secRef} className="text-violet">{reduced ? 8 : 0}</span>
          </p>
          <p className="font-mono text-[10px] leading-tight text-dim">sources / sections</p>
        </div>
      </div>

      <div className="relative">
        <canvas ref={canvasRef} className="block h-[108px] w-full md:h-[200px]" aria-hidden />
        <div className="pointer-events-none absolute right-0 top-0 flex w-[42%] flex-col gap-1.5 md:w-[38%]">
          {BINS.map((label, i) => (
            <p
              key={label}
              ref={(el) => {
                binRefs.current[i] = el;
              }}
              className="rounded-[3px] border border-line px-2 py-1 font-mono text-[10px] leading-snug text-dim md:text-[11px]"
            >
              {label}
            </p>
          ))}
        </div>
      </div>

      <p ref={noteRef} className="mt-1 font-mono text-[10px] leading-snug text-dim md:text-[11px]" style={{ opacity: reduced ? 1 : 0 }}>
        One GEO series stays. Two sources identified outside GEO join it.
      </p>

      <ul
        ref={rowsRef}
        className="mt-1 space-y-1"
        style={{ opacity: reduced ? 1 : 0 }}
      >
        {SOURCES.map((src) => (
          <li key={src.name} className="rounded-[3px] border border-violet/35 bg-ink/60 px-2 py-1">
            <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[11.5px] leading-tight md:text-[13.5px]">
              <span className="font-medium text-snow">{src.name}</span>
              <span className="text-dim">{src.cite}, {src.n === 1 ? "1 section" : `${src.n} sections`}</span>
              {src.chips.map((chip) => (
                <span key={chip} className="rounded-[3px] border border-line px-1.5 py-0.5 font-mono text-[10px] text-violet">
                  {chip}
                </span>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
