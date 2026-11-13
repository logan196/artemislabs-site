"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";

// Deterministic PRNG so server/client render identically.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NOISY = ["#0d9488", "#1d4ed8", "#15803d", "#b45309", "#7c3aed", "#be123c"];
const DOMAINS = [
  { cx: 0.26, cy: 0.3, color: "#0d9488", label: "OPC-like" },
  { cx: 0.72, cy: 0.26, color: "#1d4ed8", label: "MES-like · hypoxic" },
  { cx: 0.3, cy: 0.74, color: "#15803d", label: "AC-like" },
  { cx: 0.74, cy: 0.72, color: "#b45309", label: "Immune · TAM" },
];

function makeSpots() {
  const rand = mulberry32(2026);
  const spots = [];
  const COLS = 34, ROWS = 24;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = (c + 0.5 + (r % 2 ? 0.5 : 0)) / COLS;
      const y = (r + 0.5) / ROWS;
      if (Math.hypot(x - 0.5, (y - 0.5) * 1.4) > 0.52) continue; // tissue-ish blob
      let best = 0, bd = 1e9;
      DOMAINS.forEach((d, i) => {
        const dist = Math.hypot(x - d.cx, y - d.cy) + (rand() - 0.5) * 0.16;
        if (dist < bd) { bd = dist; best = i; }
      });
      spots.push({
        x: x + (rand() - 0.5) * 0.012,
        y: y + (rand() - 0.5) * 0.012,
        noisy: NOISY[Math.floor(rand() * NOISY.length)],
        domain: best,
      });
    }
  }
  return spots;
}

function hexLerp(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(",")})`;
}

export default function BanksySection() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });
  const spots = useMemo(makeSpots, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;

    const draw = () => {
      const p = scrollYProgress.get();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== w * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const ringPhase = Math.min(1, Math.max(0, (p - 0.18) / 0.3));
      const resolve = Math.min(1, Math.max(0, (p - 0.5) / 0.35));
      const t = performance.now() / 1000;

      // Aspect-corrected mapping: keep the tissue blob blob-shaped on tall
      // (mobile) canvases instead of smearing into horizontal stripes.
      const sh = Math.min(h, w * 0.78);
      const oy = (h - sh) / 2;
      const px = (nx) => nx * w;
      const py = (ny) => oy + ny * sh;

      // neighbour rings on a rotating subset
      if (ringPhase > 0 && resolve < 1) {
        const n = Math.floor(ringPhase * 10);
        for (let k = 0; k < n; k++) {
          const s = spots[(k * 97 + Math.floor(t) * 13) % spots.length];
          const pulse = 14 + Math.sin(t * 2.4 + k) * 3;
          ctx.beginPath();
          ctx.arc(px(s.x), py(s.y), pulse, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(15,118,110,${0.5 * ringPhase * (1 - resolve)})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          // azimuthal sweep
          ctx.beginPath();
          ctx.arc(px(s.x), py(s.y), pulse, t * 1.8 + k, t * 1.8 + k + 1.1);
          ctx.strokeStyle = `rgba(154,91,19,${0.85 * ringPhase * (1 - resolve)})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      for (const s of spots) {
        const color = resolve > 0 ? hexLerp(s.noisy, DOMAINS[s.domain].color, resolve) : s.noisy;
        ctx.beginPath();
        ctx.arc(px(s.x), py(s.y), 3.1, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.9;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // domain labels once resolved — pill behind each so they read over dots.
      // NOTE: CSS vars are invalid in Canvas2D font strings; hardcode the face.
      if (resolve > 0.75) {
        const a = Math.min(1, (resolve - 0.75) * 4);
        ctx.font = "600 13px 'JetBrains Mono', ui-monospace, monospace";
        for (const d of DOMAINS) {
          const tw = ctx.measureText(d.label).width;
          const lx = px(d.cx) - tw / 2;
          const ly = py(d.cy) - 30;
          ctx.fillStyle = `rgba(255,253,247,${0.85 * a})`;
          ctx.beginPath();
          ctx.roundRect(lx - 8, ly - 14, tw + 16, 21, 10);
          ctx.fill();
          ctx.fillStyle = `rgba(28,26,21,${a})`;
          ctx.fillText(d.label, lx, ly + 2);
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [scrollYProgress, spots]);

  // Contiguous windows — no dead zones where all three captions are ghosts.
  const cap1 = useTransform(scrollYProgress, [0, 0.2, 0.3], [1, 1, 0]);
  const cap2 = useTransform(scrollYProgress, [0.3, 0.38, 0.52, 0.6], [0, 1, 1, 0]);
  const cap3 = useTransform(scrollYProgress, [0.6, 0.7, 1], [0, 1, 1]);

  return (
    <section id="banksy" ref={wrapRef} className="relative h-[180vh] md:h-[240vh]">
      <div className="sticky top-0 h-[100svh] flex flex-col overflow-hidden">
        <div className="px-6 md:px-14 pt-16 md:pt-20 max-w-7xl mx-auto w-full">
          <p className="font-mono text-sm text-violet mb-3">02 · BANKSY</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Clustering that <span className="text-violet">sees the tissue.</span>
          </h2>
        </div>
        <div className="relative flex-1 max-w-5xl w-full mx-auto">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          {/* persistent card; only the text crossfades, so the backdrop never ghosts */}
          <div className="absolute bottom-8 left-6 md:left-10 w-[26rem] max-w-[85vw] min-h-[7.6rem] rounded-[4px] bg-panel/95 border border-line shadow-sm p-4">
            <motion.p style={{ opacity: cap1 }} className="absolute inset-4 text-dim text-lg leading-relaxed">
              Standard clustering sees each spot alone — expression without place. The
              tissue dissolves into noise.
            </motion.p>
            <motion.p style={{ opacity: cap2 }} className="absolute inset-4 text-dim text-lg leading-relaxed">
              BANKSY embeds every spot <span className="text-snow">with its neighborhood</span> —
              mean expression and an azimuthal gradient over the k-nearest ring.
            </motion.p>
            <motion.p style={{ opacity: cap3 }} className="absolute inset-4 text-dim text-lg leading-relaxed">
              Domains emerge that follow the anatomy — tumor states, immune niches,
              hypoxic zones — <span className="text-snow">ready for annotation.</span>
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
