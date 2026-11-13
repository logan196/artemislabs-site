"use client";

import { useEffect, useRef, useState } from "react";

// "Raw data becomes science": a stream of sequencer glyphs morphs into the
// REAL GBM1 section (coordinates + states from banksy_gbm1.json). The glyph
// phase is concept animation; the destination is actual data.
const GLYPHS = "ACGTacgt0123479·|:";
const PALETTE = ["#0d9488", "#b45309", "#1d4ed8", "#15803d", "#7c3aed", "#be123c", "#0369a1", "#a16207"];

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function DataMorph({ height = 420 }) {
  const ref = useRef(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("banksy_gbm1.json").then((r) => (r.ok ? r.json() : null)).then(setData).catch(() => {});
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !data) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rand = mulberry32(7);
    // subsample for perf, keep state balance by stride
    const spots = data.spots.filter((_, i) => i % 3 === 0);
    const parts = spots.map((s) => ({
      tx: s[0], ty: s[1], st: s[2],
      gx: rand(), gy: rand(),
      ch: GLYPHS[Math.floor(rand() * GLYPHS.length)],
      d: rand() * 0.35, // per-particle delay
    }));
    const CYCLE = 9; // seconds
    let raf;

    const ease = (x) => 1 - Math.pow(1 - x, 3);

    const draw = (now) => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr)) { canvas.width = w * dpr; canvas.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const t = reduced ? CYCLE * 0.65 : (now / 1000) % CYCLE;
      // phase: 0-2.2 raw stream · 2.2-5 morph · 5-9 atlas hold
      const pad = 36;
      const box = { x: pad, y: pad, w: w - pad * 2, h: h - pad * 2 };
      ctx.font = "12px 'JetBrains Mono', ui-monospace, monospace";
      for (const p of parts) {
        const gx = box.x + p.gx * box.w;
        const gy = box.y + ((p.gy + (reduced ? 0 : t * 0.04)) % 1) * box.h;
        const tx = box.x + p.tx * box.w;
        const ty = box.y + (p.ty / 0.95) * box.h * 0.95;
        let f = 0;
        if (t > 2.2) f = Math.min(1, Math.max(0, (t - 2.2 - p.d) / 2.2));
        f = ease(f);
        const x = gx + (tx - gx) * f;
        const y = gy + (ty - gy) * f;
        if (f < 0.6) {
          ctx.globalAlpha = (1 - f) * 0.55;
          ctx.fillStyle = "#5f5b50";
          ctx.fillText(p.ch, x, y);
        }
        if (f > 0.25) {
          ctx.globalAlpha = Math.min(1, (f - 0.25) / 0.5) * 0.92;
          ctx.beginPath();
          ctx.arc(x, y, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = PALETTE[p.st % PALETTE.length];
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      // caption chip in atlas phase
      if (t > 5.2) {
        const a = Math.min(1, (t - 5.2) / 0.8);
        const label = "GBM1 · 4,764 spots · real coordinates, real states";
        ctx.font = "600 12px 'JetBrains Mono', ui-monospace, monospace";
        const tw = ctx.measureText(label).width;
        ctx.fillStyle = `rgba(255,253,247,${0.9 * a})`;
        ctx.strokeStyle = `rgba(216,210,194,${0.8 * a})`;
        ctx.beginPath();
        ctx.roundRect(w - tw - 34, h - 38, tw + 18, 24, 4);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = `rgba(28,26,21,${a})`;
        ctx.fillText(label, w - tw - 25, h - 22);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [data, height]);

  return (
    <canvas
      ref={ref}
      style={{ width: "100%", height }}
      className="pointer-events-none select-none"
      role="img"
      aria-label="Animation: raw sequencing characters morphing into the real GBM1 spatial section"
    />
  );
}
