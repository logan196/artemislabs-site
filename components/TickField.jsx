"use client";

import { useEffect, useRef } from "react";

/**
 * Full-bleed canvas field of line glyphs that resolves into a tissue section.
 *
 * The scene is a density function — a sum of offset gaussians that reads as an
 * irregular, lobed tissue silhouette rather than a circle. Every tick's height
 * and alpha are driven by the density under it, so the drawing emerges from
 * the measurement rather than being an illustration laid on top.
 *
 * Reveal sweeps left-to-right: each tick carries a delay derived from its x
 * position plus jitter, so the field assembles like a plotter pass.
 */

// Normalized niche centres (x, y in 0..1 of the canvas box), radius in
// height-units so the lobes stay round at any aspect ratio.
const NICHES = [
  { x: 0.42, y: 0.44, r: 0.17, w: 1.0 },
  { x: 0.56, y: 0.39, r: 0.14, w: 0.92 },
  { x: 0.60, y: 0.56, r: 0.16, w: 0.86 },
  { x: 0.35, y: 0.58, r: 0.13, w: 0.8 },
  { x: 0.70, y: 0.47, r: 0.10, w: 0.62 },
  { x: 0.28, y: 0.49, r: 0.09, w: 0.5 },
  { x: 0.49, y: 0.65, r: 0.08, w: 0.44 },
];

const COL_STEP = 9; // px between tick columns
const ROW_STEP = 24; // px between tick rows
const TICK_W = 1.6;

const SNOW = "#e8edf5";
const TEAL = "#14b8a6";

const SWEEP = 0.62; // seconds for the left-to-right pass
const GROW = 0.55; // seconds for one tick to reach full height

function smoothstep(e0, e1, x) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

export default function TickField({ className = "", onReady }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let ticks = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let start = 0;
    let visible = true;
    let played = false; // has the reveal sweep finished at least once?

    // Density at a pixel, in 0..1.
    const densityAt = (px, py) => {
      const aspect = w / h;
      const nx = px / w;
      const ny = py / h;
      let d = 0;
      for (let i = 0; i < NICHES.length; i++) {
        const n = NICHES[i];
        const dx = (nx - n.x) * aspect;
        const dy = ny - n.y;
        const q = (dx * dx + dy * dy) / (n.r * n.r);
        d += n.w * Math.exp(-q);
      }
      return Math.min(1, d);
    };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const next = [];
      for (let x = COL_STEP * 0.5; x < w; x += COL_STEP) {
        for (let y = ROW_STEP * 0.5; y < h; y += ROW_STEP) {
          // jitter keeps the grid from reading as a screen-door pattern
          const jx = x + (Math.random() - 0.5) * COL_STEP * 0.6;
          const jy = y + (Math.random() - 0.5) * ROW_STEP * 0.5;
          const d = densityAt(jx, jy);

          // inside the tissue: dense. outside: a sparse scatter of stray ticks.
          const inside = d > 0.08;
          if (!inside && Math.random() > 0.085) continue;
          if (inside && Math.random() > 0.25 + d * 0.72) continue;

          const s = smoothstep(0.05, 0.85, d);
          next.push({
            x: jx,
            y: jy,
            // stray ticks stay short; tissue ticks grow with local density
            h: inside ? 4 + s * 19 : 7 + Math.random() * 7,
            a: inside ? 0.16 + s * 0.74 : 0.1 + Math.random() * 0.14,
            hot: d > 0.72,
            delay: (jx / w) * SWEEP + Math.random() * 0.26,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
      // draw stray ticks first so the hot core sits on top
      next.sort((a, b) => Number(a.hot) - Number(b.hot));
      ticks = next;
    };

    const paint = (t) => {
      ctx.clearRect(0, 0, w, h);
      let fill = "";
      for (let i = 0; i < ticks.length; i++) {
        const k = ticks[i];
        const p = reduced ? 1 : smoothstep(0, GROW, t - k.delay);
        if (p <= 0) continue;

        const color = k.hot ? TEAL : SNOW;
        if (color !== fill) {
          ctx.fillStyle = color;
          fill = color;
        }
        // settled ticks breathe very slightly — enough to feel live, not busy
        const breathe = reduced ? 1 : 1 + 0.07 * Math.sin(t * 1.25 + k.phase) * p;
        const hh = k.h * p * breathe;
        ctx.globalAlpha = k.a * p;
        ctx.fillRect(k.x - TICK_W / 2, k.y - hh / 2, TICK_W, hh);
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now) => {
      if (!start) start = now;
      const t = (now - start) / 1000;
      if (t > SWEEP + GROW + 0.4) played = true;
      paint(t);
      if (reduced) return; // one static pass is enough
      if (visible) raf = requestAnimationFrame(frame);
    };

    const restart = () => {
      cancelAnimationFrame(raf);
      build();
      start = 0;
      raf = requestAnimationFrame(frame);
    };

    restart();
    onReady?.();

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      // rebuild is O(cells); debounce so a drag-resize doesn't thrash
      resizeTimer = setTimeout(restart, 160);
    });
    ro.observe(canvas);

    // stop burning frames once the hero is scrolled away or the tab is hidden
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (!visible || reduced) return;
        // mounting below the fold would otherwise freeze the field at t≈0 and
        // leave it blank; replay the sweep the first time it is actually seen
        if (!played) start = 0;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (visible && !reduced) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [onReady]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

export { NICHES };
