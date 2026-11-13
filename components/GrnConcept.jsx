"use client";

import { useEffect, useMemo, useRef } from "react";

// Concept sketch of a gene-regulatory network (after Kamimoto et al. 2020):
// three TF modules, pulsing regulatory edges. Illustration — NOT data.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MODULES = [
  { cx: 0.3, cy: 0.38, r: 0.2, color: "#0d9488" },
  { cx: 0.68, cy: 0.3, r: 0.17, color: "#b45309" },
  { cx: 0.58, cy: 0.7, r: 0.21, color: "#1d4ed8" },
];

export default function GrnConcept({ height = 340 }) {
  const ref = useRef(null);

  const { nodes, edges } = useMemo(() => {
    const rand = mulberry32(42);
    const nodes = [];
    MODULES.forEach((m, mi) => {
      const n = 20;
      for (let i = 0; i < n; i++) {
        const a = rand() * Math.PI * 2;
        const rr = Math.sqrt(rand()) * m.r;
        nodes.push({
          x: m.cx + Math.cos(a) * rr,
          y: m.cy + Math.sin(a) * rr * 0.9,
          m: mi,
          hub: i === 0,
          ph: rand() * Math.PI * 2,
        });
      }
    });
    const edges = [];
    nodes.forEach((n, i) => {
      // each node links to its module hub + a couple of in-module peers
      const hub = MODULES.findIndex((_, mi) => mi === n.m) * 20;
      if (i !== hub) edges.push([i, hub, true]);
      const peer = hub + 1 + Math.floor(rand() * 19);
      if (peer !== i) edges.push([i, peer, false]);
    });
    // sparse cross-module edges
    for (let k = 0; k < 10; k++) {
      edges.push([Math.floor(rand() * nodes.length), Math.floor(rand() * nodes.length), false]);
    }
    return { nodes, edges };
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf;
    const draw = (now) => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr)) { canvas.width = w * dpr; canvas.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const t = reduced ? 0 : now / 1000;
      const px = (n) => {
        const wob = reduced ? 0 : Math.sin(t * 0.7 + n.ph) * 3;
        return [n.x * w + wob, n.y * h + (reduced ? 0 : Math.cos(t * 0.6 + n.ph) * 3)];
      };
      // module rings, breathing
      for (const m of MODULES) {
        const breathe = reduced ? 1 : 1 + 0.025 * Math.sin(t * 0.8 + m.cx * 9);
        ctx.beginPath();
        ctx.ellipse(m.cx * w, m.cy * h, m.r * w * 1.12 * breathe, m.r * h * 1.25 * breathe, 0, 0, Math.PI * 2);
        ctx.strokeStyle = m.color + "55";
        ctx.lineWidth = 1.4;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      // edges
      edges.forEach(([i, j, strong], k) => {
        const [x1, y1] = px(nodes[i]);
        const [x2, y2] = px(nodes[j]);
        const pulse = reduced ? 0.5 : 0.35 + 0.3 * Math.sin(t * 1.4 + k);
        ctx.strokeStyle = `rgba(95,91,80,${(strong ? 0.4 : 0.18) * pulse + 0.08})`;
        ctx.lineWidth = strong ? 1 : 0.7;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
      // nodes
      for (const n of nodes) {
        const [x, y] = px(n);
        ctx.beginPath();
        ctx.arc(x, y, n.hub ? 6.5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = MODULES[n.m].color + (n.hub ? "" : "cc");
        ctx.fill();
        if (n.hub) {
          ctx.strokeStyle = "#fffdf7";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [nodes, edges]);

  return (
    <canvas
      ref={ref}
      style={{ width: "100%", height }}
      className="pointer-events-none select-none"
      role="img"
      aria-label="Animated concept sketch of a gene-regulatory network with three transcription-factor modules"
    />
  );
}
