"use client";

import { useEffect, useRef } from "react";

/* ---------- shared helpers (same conventions as AssayMini) ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const seedOf = (s) => { let h = 7; for (const c of s) h = (h * 33 + c.charCodeAt(0)) >>> 0; return h; };
const INK = (a) => `rgba(28,26,21,${a})`;
const PANEL = "#fffdf7";
const TEAL = "#0f766e", SEPIA = "#9a5b13", BLUE = "#1d4ed8", GREEN = "#15803d", AMBER = "#b45309";
const CLUST = [TEAL, AMBER, BLUE, GREEN];
const lerp = (a, b, p) => a + (b - a) * p;
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease = (p) => p * p * (3 - 2 * p);
const PAD = 6;

/* ---------- sketches: (ctx, W, H, t, R) with R a fresh seeded PRNG ----------
   Pure abstract concept loops — no text, no numbers, no fake data. */
const DRAW = {
  /* scattered dots gain faint neighbor-rings, then settle into 3 spatial blocks */
  banksy(ctx, W, H, t, R) {
    const regs = [
      [PAD, PAD, W * 0.46, H - PAD, TEAL],
      [W * 0.52, PAD, W - PAD, H * 0.5, SEPIA],
      [W * 0.52, H * 0.56, W - PAD, H - PAD, BLUE],
    ];
    const settle = ease(clamp01((t - 0.38) / 0.38));
    const rings = Math.sin(Math.PI * clamp01((t - 0.08) / 0.42));
    for (const [x0, y0, x1, y1, c] of regs) {
      ctx.globalAlpha = 0.1 * settle;
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.roundRect(x0, y0, x1 - x0, y1 - y0, 3); ctx.fill();
    }
    for (let i = 0; i < 36; i++) {
      const k = i % 3, [x0, y0, x1, y1, c] = regs[k];
      const sx = lerp(PAD, W - PAD, R()), sy = lerp(PAD, H - PAD, R());
      const tx = lerp(x0 + 3, x1 - 3, R()), ty = lerp(y0 + 3, y1 - 3, R());
      const x = lerp(sx, tx, settle), y = lerp(sy, ty, settle);
      if (rings > 0.02 && i % 3 === 0) {
        ctx.globalAlpha = 0.18 * rings * (1 - settle);
        ctx.strokeStyle = INK(1); ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(x, y, 4.5, 0, 6.283); ctx.stroke();
      }
      if (settle < 0.99) {
        ctx.globalAlpha = 0.5 * (1 - settle);
        ctx.fillStyle = INK(1);
        ctx.beginPath(); ctx.arc(x, y, 1.4, 0, 6.283); ctx.fill();
      }
      if (settle > 0.01) {
        ctx.globalAlpha = 0.85 * settle;
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, 6.283); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  },

  /* dot clusters; blank label chips attach to each cluster one by one */
  annotate(ctx, W, H, t, R) {
    const cs = [
      [W * 0.24, H * 0.38, TEAL],
      [W * 0.62, H * 0.3, SEPIA],
      [W * 0.46, H * 0.72, BLUE],
    ];
    for (let i = 0; i < 45; i++) {
      const k = i % 3, [cx, cy, c] = cs[k];
      const a = R() * 6.283, r = Math.sqrt(R()) * 9;
      ctx.globalAlpha = 0.65; ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r * 1.2, cy + Math.sin(a) * r * 0.8, 1.4, 0, 6.283); ctx.fill();
    }
    const off = [[12, -15], [11, 8], [13, 3]];
    cs.forEach(([cx, cy, c], i) => {
      const p = ease(clamp01((t - (0.22 + i * 0.22)) / 0.16));
      if (p <= 0) return;
      const bx = cx + off[i][0], by = cy + off[i][1] + (1 - p) * 3;
      ctx.globalAlpha = p * 0.5; ctx.strokeStyle = INK(1); ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(cx + 3, cy); ctx.lineTo(bx, by + 4); ctx.stroke();
      ctx.globalAlpha = p;
      ctx.fillStyle = PANEL;
      ctx.beginPath(); ctx.roundRect(bx, by, 16, 8, 2); ctx.fill();
      ctx.strokeStyle = c; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(bx + 4, by + 4, 1.5, 0, 6.283); ctx.fill();
      ctx.globalAlpha = p * 0.45; ctx.strokeStyle = INK(1);
      ctx.beginPath(); ctx.moveTo(bx + 7.5, by + 4); ctx.lineTo(bx + 13, by + 4); ctx.stroke();
    });
    ctx.globalAlpha = 1;
  },

  /* a file glyph unfolds into a 2x2 mini-dashboard wireframe */
  forge(ctx, W, H, t, R) {
    const sc = []; for (let i = 0; i < 6; i++) sc.push([R(), R()]);
    const bars = [R(), R(), R()];
    const ln = []; for (let i = 0; i < 4; i++) ln.push(R());
    const heat = []; for (let i = 0; i < 6; i++) heat.push(R());
    const p1 = ease(clamp01((t - 0.1) / 0.3));
    const p2 = ease(clamp01((t - 0.42) / 0.18));
    const p3 = ease(clamp01((t - 0.58) / 0.22));
    const fx = lerp(W / 2 - 10, PAD, p1), fy = lerp(H / 2 - 13, PAD, p1);
    const fw = lerp(20, W - PAD * 2, p1), fh = lerp(26, H - PAD * 2, p1);
    ctx.globalAlpha = 1;
    ctx.fillStyle = PANEL; ctx.strokeStyle = INK(0.5); ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.roundRect(fx, fy, fw, fh, 2.5); ctx.fill(); ctx.stroke();
    if (p1 < 0.98) {
      ctx.globalAlpha = 1 - p1;
      ctx.beginPath();
      ctx.moveTo(fx + fw - 7, fy); ctx.lineTo(fx + fw - 7, fy + 7); ctx.lineTo(fx + fw, fy + 7);
      ctx.stroke();
    }
    const mx = fx + fw / 2, my = fy + fh / 2;
    if (p2 > 0) {
      ctx.globalAlpha = 0.45; ctx.strokeStyle = INK(1); ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mx, fy + 2); ctx.lineTo(mx, fy + 2 + (fh - 4) * p2);
      ctx.moveTo(fx + 2, my); ctx.lineTo(fx + 2 + (fw - 4) * p2, my);
      ctx.stroke();
    }
    if (p3 > 0) {
      ctx.globalAlpha = p3 * 0.9;
      ctx.fillStyle = TEAL;
      for (const [u, v] of sc) {
        ctx.beginPath(); ctx.arc(fx + 5 + u * (fw / 2 - 10), fy + 5 + v * (fh / 2 - 10), 1.3, 0, 6.283); ctx.fill();
      }
      ctx.fillStyle = SEPIA;
      bars.forEach((b, i) => {
        const bh = (fh / 2 - 8) * (0.35 + 0.65 * b) * p3;
        ctx.fillRect(mx + 5 + i * 7, my - 3 - bh, 4, bh);
      });
      ctx.strokeStyle = BLUE; ctx.lineWidth = 1.2;
      ctx.beginPath();
      ln.forEach((v, i) => {
        ctx[i ? "lineTo" : "moveTo"](fx + 4 + (i / 3) * (fw / 2 - 9), my + 5 + (fh / 2 - 10) * (0.2 + 0.7 * v));
      });
      ctx.stroke();
      heat.forEach((v, i) => {
        ctx.globalAlpha = p3 * (0.25 + 0.6 * v);
        ctx.fillStyle = TEAL;
        ctx.fillRect(mx + 4 + (i % 3) * 7, my + 4 + Math.floor(i / 3) * 7, 5, 5);
      });
    }
    ctx.globalAlpha = 1;
  },

  /* two tiny bar groups re-randomizing smoothly + a wandering stat cursor */
  live(ctx, W, H, t, R) {
    const states = [];
    for (let s = 0; s < 3; s++) { const st = []; for (let i = 0; i < 6; i++) st.push(0.25 + R() * 0.75); states.push(st); }
    const u = t * 3, s0 = Math.floor(u) % 3, s1 = (s0 + 1) % 3;
    const f = ease(clamp01((u - Math.floor(u) - 0.55) / 0.45));
    const base = H - PAD - 2, maxH = H - PAD * 2 - 8;
    const bw = 6, gap = 3, groupGap = 14;
    const total = (bw * 3 + gap * 2) * 2 + groupGap;
    let x = PAD + (W - PAD * 2 - total) / 2;
    for (let g = 0; g < 2; g++) {
      for (let b = 0; b < 3; b++) {
        const i = g * 3 + b;
        const h = lerp(states[s0][i], states[s1][i], f) * maxH;
        ctx.fillStyle = g ? SEPIA : TEAL;
        ctx.globalAlpha = 0.5 + 0.17 * b;
        ctx.beginPath(); ctx.roundRect(x, base - h, bw, h, 1.5); ctx.fill();
        x += bw + gap;
      }
      x += groupGap - gap;
    }
    ctx.globalAlpha = 1; ctx.strokeStyle = INK(0.3); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD, base + 1); ctx.lineTo(W - PAD, base + 1); ctx.stroke();
    const cx = PAD + 8 + (W - PAD * 2 - 16) * (0.5 + 0.45 * Math.sin(t * 6.283 * 2 + 1.3));
    const cy = PAD + 4 + maxH * 0.45 * (0.5 + 0.5 * Math.sin(t * 6.283 * 3 + 0.4));
    ctx.strokeStyle = INK(0.55); ctx.lineWidth = 1;
    ctx.setLineDash([2, 2.5]);
    ctx.beginPath(); ctx.moveTo(cx, cy + 4); ctx.lineTo(cx, base); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(cx, cy, 2.6, 0, 6.283); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy); ctx.lineTo(cx - 3.2, cy);
    ctx.moveTo(cx + 3.2, cy); ctx.lineTo(cx + 5, cy);
    ctx.stroke();
  },

  /* chat bubbles alternating with a typing-dots pulse */
  copilot(ctx, W, H, t) {
    const bw = W * 0.44, bh = 12;
    const bubble = (x, y, color, filled, p) => {
      if (p <= 0) return;
      const yy = y + (1 - p) * 3;
      ctx.beginPath(); ctx.roundRect(x, yy, bw, bh, 4);
      if (filled) {
        ctx.globalAlpha = p * 0.16; ctx.fillStyle = color; ctx.fill();
      } else {
        ctx.globalAlpha = p; ctx.fillStyle = PANEL; ctx.fill();
      }
      ctx.globalAlpha = p;
      ctx.strokeStyle = filled ? color : INK(0.45); ctx.lineWidth = 1; ctx.stroke();
      ctx.globalAlpha = p * 0.6;
      ctx.strokeStyle = filled ? color : INK(0.4);
      ctx.beginPath();
      ctx.moveTo(x + 5, yy + 4.5); ctx.lineTo(x + bw - 7, yy + 4.5);
      ctx.moveTo(x + 5, yy + 8); ctx.lineTo(x + bw * 0.62, yy + 8);
      ctx.stroke();
    };
    const typing = (x, y, on) => {
      if (on <= 0) return;
      for (let i = 0; i < 3; i++) {
        const b = Math.max(0, Math.sin(t * 6.283 * 6 - i));
        ctx.globalAlpha = on * (0.3 + 0.6 * b);
        ctx.fillStyle = INK(1);
        ctx.beginPath(); ctx.arc(x + i * 6, y - b * 1.5, 1.6, 0, 6.283); ctx.fill();
      }
    };
    bubble(PAD, PAD, null, false, ease(clamp01((t - 0.02) / 0.1)));
    typing(W - PAD - 20, H / 2 + 1, clamp01((t - 0.16) / 0.06) * clamp01((0.42 - t) / 0.06));
    bubble(W - PAD - bw, H / 2 - 6, TEAL, true, ease(clamp01((t - 0.44) / 0.1)));
    typing(PAD + 6, H - PAD - 4, clamp01((t - 0.62) / 0.06));
    ctx.globalAlpha = 1;
  },

  /* a column of document lines scrolls; one highlights teal and docks right */
  scout(ctx, W, H, t, R) {
    const rowsW = []; for (let i = 0; i < 6; i++) rowsW.push([0.55 + R() * 0.4, 0.3 + R() * 0.45]);
    const x0 = PAD + 1, colW = W * 0.5;
    const rowH = 15, span = 6 * rowH;
    const scanOn = clamp01((t - 0.1) / 0.08) * clamp01((0.45 - t) / 0.08);
    ctx.save();
    ctx.beginPath(); ctx.rect(x0 - 2, PAD - 1, colW + 4, H - PAD * 2 + 2); ctx.clip();
    for (let i = 0; i < 6; i++) {
      const y = PAD + (((i * rowH - t * span) % span + span) % span) - rowH * 0.5;
      const near = clamp01(1 - Math.abs(y + 2.5 - H / 2) / 11);
      const scan = near * scanOn;
      ctx.strokeStyle = scan > 0.05 ? TEAL : INK(1);
      ctx.globalAlpha = 0.4 + 0.5 * scan;
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + colW * rowsW[i][0], y); ctx.stroke();
      ctx.globalAlpha *= 0.65; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(x0, y + 4.5); ctx.lineTo(x0 + colW * rowsW[i][1], y + 4.5); ctx.stroke();
    }
    ctx.restore();
    const dx = W - PAD - 24, dy = H / 2 - 8;
    ctx.globalAlpha = 1;
    ctx.setLineDash([2.5, 2.5]); ctx.strokeStyle = INK(0.35); ctx.lineWidth = 1;
    ctx.strokeRect(dx, dy, 24, 16);
    ctx.setLineDash([]);
    const vis = clamp01((t - 0.34) / 0.06);
    if (vis > 0) {
      const pm = ease(clamp01((t - 0.4) / 0.28));
      const cx = lerp(x0 + colW * 0.3, dx + 2, pm), cy = lerp(H / 2 - 7, dy + 2, pm);
      ctx.globalAlpha = vis;
      ctx.fillStyle = "rgba(15,118,110,0.12)"; ctx.strokeStyle = TEAL; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(cx, cy, 20, 12, 2); ctx.fill(); ctx.stroke();
      ctx.globalAlpha = vis * 0.8;
      ctx.beginPath();
      ctx.moveTo(cx + 3, cy + 4); ctx.lineTo(cx + 15, cy + 4);
      ctx.moveTo(cx + 3, cy + 8); ctx.lineTo(cx + 11, cy + 8);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },

  /* random scatter organizes into a tidy mini-figure: panel + axis + legend */
  abstract(ctx, W, H, t, R) {
    const nd = 5;
    const dstart = []; for (let i = 0; i < nd; i++) dstart.push([lerp(PAD, W - PAD, R()), lerp(PAD, H - PAD, R())]);
    const jit = []; for (let i = 0; i < nd; i++) jit.push(R() * 4 - 2);
    const lstart = []; for (let i = 0; i < 3; i++) lstart.push([lerp(PAD, W - PAD, R()), lerp(PAD, H - PAD, R())]);
    const extra = []; for (let i = 0; i < 8; i++) extra.push([lerp(PAD, W - PAD, R()), lerp(PAD, H - PAD, R())]);
    const p = ease(clamp01((t - 0.15) / 0.45));
    if (p < 1) {
      ctx.fillStyle = INK(1); ctx.globalAlpha = 0.35 * (1 - p);
      for (const [x, y] of extra) { ctx.beginPath(); ctx.arc(x, y, 1.3, 0, 6.283); ctx.fill(); }
    }
    const px = PAD, py = PAD, pw = W * 0.58, ph = H - PAD * 2;
    ctx.globalAlpha = p; ctx.strokeStyle = INK(0.5); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 2.5); ctx.stroke();
    const ax = px + 7, ay = py + ph - 6, atop = py + 5, aright = px + pw - 5;
    ctx.globalAlpha = p * 0.7;
    ctx.beginPath(); ctx.moveTo(ax, atop); ctx.lineTo(ax, ay); ctx.lineTo(aright, ay); ctx.stroke();
    for (let i = 0; i < nd; i++) {
      const tx = ax + 5 + (i / (nd - 1)) * (aright - ax - 10);
      const ty = ay - 5 - (i / (nd - 1)) * (ay - atop - 10) + jit[i];
      ctx.globalAlpha = 0.45 + 0.5 * p; ctx.fillStyle = CLUST[i % 4];
      ctx.beginPath(); ctx.arc(lerp(dstart[i][0], tx, p), lerp(dstart[i][1], ty, p), 1.8, 0, 6.283); ctx.fill();
    }
    const lx = W - PAD - 22, ly0 = PAD + 8;
    for (let i = 0; i < 3; i++) {
      const x = lerp(lstart[i][0], lx, p), y = lerp(lstart[i][1], ly0 + i * 11, p);
      ctx.globalAlpha = 0.5 + 0.5 * p; ctx.fillStyle = CLUST[i];
      ctx.beginPath(); ctx.roundRect(x, y, 5, 5, 1); ctx.fill();
      ctx.globalAlpha = p * 0.45; ctx.strokeStyle = INK(1); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + 8, y + 2.5); ctx.lineTo(x + 16, y + 2.5); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },

  /* dataset tiles slide in from the edge onto a grid, corner tags intact */
  importer(ctx, W, H, t) {
    const tw = 20, th = 13, gx = 5, gy = 6;
    const gridW = 3 * tw + 2 * gx;
    const gx0 = PAD + (W - PAD * 2 - gridW) / 2 - 4, gy0 = PAD + 4;
    const tagC = [TEAL, SEPIA, BLUE, GREEN, AMBER, TEAL];
    for (let i = 0; i < 6; i++) {
      const tx = gx0 + (i % 3) * (tw + gx), ty = gy0 + Math.floor(i / 3) * (th + gy);
      ctx.globalAlpha = 0.25; ctx.strokeStyle = INK(1); ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.strokeRect(tx, ty, tw, th);
      ctx.setLineDash([]);
      const p = ease(clamp01((t - 0.08 - i * 0.09) / 0.22));
      if (p <= 0) continue;
      const x = lerp(W + 4, tx, p);
      ctx.globalAlpha = p;
      ctx.fillStyle = PANEL; ctx.strokeStyle = INK(0.5);
      ctx.beginPath(); ctx.roundRect(x, ty, tw, th, 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = tagC[i];
      ctx.beginPath(); ctx.roundRect(x + 1.5, ty + 1.5, 5, 3.5, 1); ctx.fill();
      ctx.globalAlpha = p * 0.4; ctx.strokeStyle = INK(1);
      ctx.beginPath();
      ctx.moveTo(x + 3, ty + 8.5); ctx.lineTo(x + tw - 4, ty + 8.5);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },
};

/* per-kind loop duration (ms) — quiet 4-6s loops */
const DUR = {
  banksy: 5000, annotate: 5200, forge: 4600, live: 6000,
  copilot: 4200, scout: 5200, abstract: 5000, importer: 4000,
};

export default function StackMini({ kind, height = 56 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const draw = DRAW[kind];
    if (!ctx || !draw) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = DUR[kind] || 5000;
    let raf = 0, W = 0, H = 0, start = 0;
    const render = (t) => {
      ctx.clearRect(0, 0, W, H);
      draw(ctx, W, H, t, mulberry32(seedOf(kind)));
    };
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render(0.9); // settled static frame; the loop overwrites it when running
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    let io;
    if (!reduced) {
      const frame = (now) => {
        if (!start) start = now;
        render(((now - start) % dur) / dur);
        raf = requestAnimationFrame(frame);
      };
      io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(frame); }
        else if (raf) { cancelAnimationFrame(raf); raf = 0; }
      }, { threshold: 0.1 });
      io.observe(canvas);
    }
    return () => { if (raf) cancelAnimationFrame(raf); ro.disconnect(); if (io) io.disconnect(); };
  }, [kind]);
  return <canvas ref={ref} aria-hidden="true" style={{ width: "100%", height, display: "block" }} />;
}
