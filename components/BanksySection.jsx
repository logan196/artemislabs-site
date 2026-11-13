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

const NOISY = ["#2dd4bf", "#22d3ee", "#34d399", "#fbbf24", "#60a5fa", "#f87171"];
const DOMAINS = [
  { cx: 0.26, cy: 0.3, color: "#2dd4bf", label: "OPC-like" },
  { cx: 0.72, cy: 0.26, color: "#22d3ee", label: "MES-like · hypoxic" },
  { cx: 0.3, cy: 0.74, color: "#34d399", label: "AC-like" },
  { cx: 0.74, cy: 0.72, color: "#fbbf24", label: "Immune · TAM" },
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

      // neighbour rings on a rotating subset
      if (ringPhase > 0 && resolve < 1) {
        const n = Math.floor(ringPhase * 10);
        for (let k = 0; k < n; k++) {
          const s = spots[(k * 97 + Math.floor(t) * 13) % spots.length];
          const pulse = 14 + Math.sin(t * 2.4 + k) * 3;
          ctx.beginPath();
          ctx.arc(s.x * w, s.y * h, pulse, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(94,234,212,${0.5 * ringPhase * (1 - resolve)})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          // azimuthal sweep
          ctx.beginPath();
          ctx.arc(s.x * w, s.y * h, pulse, t * 1.8 + k, t * 1.8 + k + 1.1);
          ctx.strokeStyle = `rgba(34,211,238,${0.85 * ringPhase * (1 - resolve)})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      for (const s of spots) {
        const color = resolve > 0 ? hexLerp(s.noisy, DOMAINS[s.domain].color, resolve) : s.noisy;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, 3.1, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.9;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // domain labels once resolved
      if (resolve > 0.75) {
        ctx.font = "12px var(--font-jetbrains), monospace";
        for (const d of DOMAINS) {
          ctx.fillStyle = `rgba(233,246,245,${(resolve - 0.75) * 4})`;
          ctx.fillText(d.label, d.cx * w - 28, d.cy * h - 26);
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [scrollYProgress, spots]);

  const cap1 = useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 1, 0]);
  const cap2 = useTransform(scrollYProgress, [0.25, 0.35, 0.5, 0.6], [0, 1, 1, 0]);
  const cap3 = useTransform(scrollYProgress, [0.6, 0.72, 1], [0, 1, 1]);

  return (
    <section id="banksy" ref={wrapRef} className="relative h-[320vh]">
      <div className="sticky top-0 h-[100svh] flex flex-col overflow-hidden">
        <div className="px-6 md:px-14 pt-16 md:pt-20 max-w-7xl mx-auto w-full">
          <p className="font-mono text-sm text-violet mb-3">02 · BANKSY</p>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">
            Clustering that <span className="text-gradient">sees the tissue.</span>
          </h2>
        </div>
        <div className="relative flex-1 max-w-5xl w-full mx-auto">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute bottom-10 left-6 md:left-10 w-[26rem] max-w-[85vw]">
            <motion.p style={{ opacity: cap1 }} className="absolute bottom-0 w-full text-dim text-lg leading-relaxed rounded-2xl bg-ink/70 backdrop-blur-sm p-4">
              Standard clustering sees each spot alone — expression without place. The
              tissue dissolves into noise.
            </motion.p>
            <motion.p style={{ opacity: cap2 }} className="absolute bottom-0 w-full text-dim text-lg leading-relaxed rounded-2xl bg-ink/70 backdrop-blur-sm p-4">
              BANKSY embeds every spot <span className="text-snow">with its neighborhood</span> —
              mean expression and an azimuthal gradient over the k-nearest ring.
            </motion.p>
            <motion.p style={{ opacity: cap3 }} className="absolute bottom-0 w-full text-dim text-lg leading-relaxed rounded-2xl bg-ink/70 backdrop-blur-sm p-4">
              Domains emerge that follow the anatomy — tumor states, immune niches,
              hypoxic zones — <span className="text-snow">ready for annotation.</span>
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
