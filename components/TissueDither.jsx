"use client";

import { useEffect, useRef } from "react";

/**
 * The hero field: a real H&E glioblastoma section, halftoned into tick marks.
 *
 * This is the mechanism arda.ai actually uses, read out of their bundle. They
 * downsample a photograph to a coarse luminance grid, invert it to darkness,
 * then walk a grid of tick columns and emit a mark wherever the local darkness
 * beats a fixed per-column random threshold. Their "factory" is a dithered
 * photo, not a noise function, which is why it reads as a real scene.
 *
 * The important difference here: the photograph is the client's own data. This
 * is AT14, a glioblastoma section from de Jong et al. (gbmspace.org), the same
 * section used further down the page. The hero is the specimen, not an
 * illustration of one.
 *
 * Per-column thresholds (rather than per-cell) are what give the pattern its
 * vertical grain, the characteristic look, and worth preserving exactly.
 */

const SRC = "/dejong/AT14-BRA-4-FO-2_1_he.jpg";

const LUMA_W = 170; // luminance grid resolution, finer than arda's 16x12
const LUMA_H = 182; // because real tissue has structure worth resolving
const IMG_ASPECT = 2338 / 2505;

const TICK_W = 1.8;
const TICK_GAP = 3.1;
const ROW_H = 15; // px per tick row
const CONTRAST = 2.35; // expands darkness around the pivot, as arda does
const PIVOT = 0.60;    // only genuinely dense tissue survives; paper drops out,
                       // which is what gives the reference its negative space
const ROW_REVEAL = 0.028; // seconds between rows landing

const SNOW = "232,238,246";
const TEAL = "20,184,166";

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export default function TissueDither({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let luma = null; // Float32Array(LUMA_W * LUMA_H), 0 = paper, 1 = dense tissue
    let thresholds = null; // one fixed threshold per tick column
    let w = 0;
    let h = 0;
    let raf = 0;
    let start = 0;
    let visible = true;
    let everStarted = false;

    /** Downsample the section to a luminance grid and invert it to darkness. */
    const readLuma = (img) => {
      const off = document.createElement("canvas");
      off.width = LUMA_W;
      off.height = LUMA_H;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return null;
      // white ground first: the slide's background is paper, and any letterbox
      // must read as paper too rather than as dense tissue
      octx.fillStyle = "#fff";
      octx.fillRect(0, 0, LUMA_W, LUMA_H);
      octx.drawImage(img, 0, 0, LUMA_W, LUMA_H);
      const d = octx.getImageData(0, 0, LUMA_W, LUMA_H).data;
      const out = new Float32Array(LUMA_W * LUMA_H);
      for (let i = 0; i < out.length; i++) {
        const p = i * 4;
        out[i] = 1 - (0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2]) / 255;
      }
      return out;
    };

    /** Bilinear sample of the luma grid at normalized (u,v). */
    const sample = (u, v) => {
      if (!luma) return 0;
      const x = clamp01(u) * (LUMA_W - 1);
      const y = clamp01(v) * (LUMA_H - 1);
      const x0 = Math.floor(x);
      const y0 = Math.floor(y);
      const x1 = Math.min(LUMA_W - 1, x0 + 1);
      const y1 = Math.min(LUMA_H - 1, y0 + 1);
      const fx = x - x0;
      const fy = y - y0;
      const a = luma[y0 * LUMA_W + x0];
      const b = luma[y0 * LUMA_W + x1];
      const c = luma[y1 * LUMA_W + x0];
      const e = luma[y1 * LUMA_W + x1];
      return (a + (b - a) * fx) * (1 - fy) + (c + (e - c) * fx) * fy;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.ceil(w / (TICK_W + TICK_GAP)) + 1;
      thresholds = new Float32Array(cols);
      for (let i = 0; i < cols; i++) thresholds[i] = Math.random();
    };

    const paint = (t) => {
      ctx.clearRect(0, 0, w, h);
      if (!luma || !thresholds) return;

      const rows = Math.ceil(h / ROW_H);
      const step = TICK_W + TICK_GAP;
      const cols = thresholds.length;

      // cover-fit the section into the frame
      const drawW = Math.max(w, h * IMG_ASPECT);
      const drawH = drawW / IMG_ASPECT;
      const offX = (w - drawW) / 2;
      const offY = (h - drawH) / 2;

      const revealed = reduced ? rows : Math.floor(t / ROW_REVEAL);

      for (let r = 0; r < rows; r++) {
        if (r > revealed) break;
        const y = r * ROW_H;
        const v = (y + ROW_H / 2 - offY) / drawH;

        // the row that just landed flares briefly, so the pass is visible
        const age = reduced ? 1 : clamp01((revealed - r) / 6);
        const flare = 1 - age;

        for (let c = 0; c < cols; c++) {
          const x = c * step;
          const u = (x + step / 2 - offX) / drawW;
          let d = sample(u, v);
          d = clamp01((d - PIVOT) * CONTRAST + 0.42);
          if (thresholds[c] >= d) continue;

          // darkest tissue reads teal; the rest is bone-white
          const hot = d > 0.86;
          const alpha = (hot ? 0.58 : 0.34) + d * 0.3 + flare * 0.4;
          ctx.fillStyle = `rgba(${hot ? TEAL : SNOW},${Math.min(1, alpha)})`;
          ctx.fillRect(x, y + 1, TICK_W, ROW_H - 2 + flare * 2);
        }
      }
    };

    const frame = (now) => {
      if (!start) start = now;
      everStarted = true;
      const t = (now - start) / 1000;
      paint(t);
      if (reduced) return;
      // once the whole section has landed it is a still figure; stop burning
      // frames entirely rather than repainting an unchanging image
      if (t > Math.ceil(h / ROW_H) * ROW_REVEAL + 0.4) return;
      if (visible) raf = requestAnimationFrame(frame);
    };

    const restart = () => {
      cancelAnimationFrame(raf);
      resize();
      start = 0;
      if (visible || reduced) raf = requestAnimationFrame(frame);
    };

    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      luma = readLuma(img);
      restart();
    };
    img.onerror = () => {
      // never leave the hero empty because one asset failed
      luma = new Float32Array(LUMA_W * LUMA_H);
      for (let y = 0; y < LUMA_H; y++) {
        for (let x = 0; x < LUMA_W; x++) {
          const dx = x / LUMA_W - 0.5;
          const dy = y / LUMA_H - 0.5;
          luma[y * LUMA_W + x] = Math.max(0, 0.85 - (dx * dx + dy * dy) * 3.2);
        }
      }
      restart();
    };
    img.src = SRC;

    resize();

    let resizeTimer = 0;
    let roPrimed = false;
    const ro = new ResizeObserver(() => {
      if (!roPrimed) { roPrimed = true; return; }
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(restart, 180);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (!visible || reduced || !luma) return;
        if (!everStarted) start = 0;
        everStarted = true;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
      img.onload = null;
      img.onerror = null;
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
