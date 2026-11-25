"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight spatial-graph field. Points drift and link to nearby neighbors,
 * the way a tissue section reads once coordinates are attached.
 * One static frame when the visitor prefers reduced motion.
 */
export default function SpatialField({ className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = true;

    const nodes = Array.from({ length: 110 }, (_, i) => {
      const ang = i * 2.399;
      const rad = 0.08 + (i % 17) / 22;
      return {
        x: 0.5 + Math.cos(ang) * rad * (0.55 + (i % 5) * 0.08),
        y: 0.48 + Math.sin(ang) * rad * 0.72,
        vx: Math.cos(i * 1.7) * 0.00011,
        vy: Math.sin(i * 1.3) * 0.00009,
        r: i % 11 === 0 ? 3.1 : 1.6,
        warm: i % 9 === 0,
      };
    });

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w < 2 || h < 2) {
        if (!reduce && running) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }
        return;
      }
      const pw = Math.floor(w * dpr);
      const ph = Math.floor(h * dpr);
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      if (!reduce) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0.04 || n.x > 0.96) n.vx *= -1;
          if (n.y < 0.06 || n.y > 0.94) n.vy *= -1;
        }
      }

      const pts = nodes.map((n) => ({ ...n, px: n.x * w, py: n.y * h }));
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].px - pts[j].px;
          const dy = pts[i].py - pts[j].py;
          const d2 = dx * dx + dy * dy;
          if (d2 > 125 * 125) continue;
          const a = 1 - Math.sqrt(d2) / 125;
          ctx.strokeStyle = `rgba(127,214,220,${0.22 + a * 0.7})`;
          ctx.beginPath();
          ctx.moveTo(pts[i].px, pts[i].py);
          ctx.lineTo(pts[j].px, pts[j].py);
          ctx.stroke();
        }
      }
      for (const p of pts) {
        const g = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, p.r * 8);
        const core = p.warm ? "212,168,106" : "143,212,218";
        g.addColorStop(0, `rgba(${core},0.95)`);
        g.addColorStop(1, `rgba(${core},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.r * 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = p.warm ? "#f0d7b0" : "#e7f7f8";
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduce && running) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }
    };

    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running && !reduce) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      }
    });
    io.observe(canvas);
    draw();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
