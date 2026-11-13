"use client";

import { useEffect, useRef } from "react";

/* ---------- shared helpers ---------- */
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
const TEAL = "#0f766e", SEPIA = "#9a5b13", BLUE = "#1d4ed8", GREEN = "#15803d", AMBER = "#b45309";
const CLUST = [TEAL, AMBER, BLUE, GREEN];
const lerp = (a, b, p) => a + (b - a) * p;
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease = (p) => p * p * (3 - 2 * p);
const PAD = 8;

function blobPath(ctx, cx, cy, rx, ry, h, n = 56) {
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const w = 1 + 0.16 * h[0] * Math.sin(a * 2 + h[1] * 4) + 0.11 * h[2] * Math.sin(a * 3 + h[3] * 5);
    ctx[i ? "lineTo" : "moveTo"](cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w);
  }
  ctx.closePath();
}

/* ---------- sketches: (ctx, W, H, t, R) with R a fresh seeded PRNG ---------- */
const DRAW = {
  singlecell(ctx, W, H, t, R) {
    const cs = [[0.28, 0.3], [0.72, 0.28], [0.3, 0.73], [0.71, 0.72]];
    const p = ease(clamp01(t / 0.72));
    for (let i = 0; i < 120; i++) {
      const k = i % 4;
      const sx = lerp(PAD, W - PAD, R()), sy = lerp(PAD, H - PAD, R());
      const a = R() * 6.283, r = Math.sqrt(R()) * Math.min(W, H) * 0.15;
      const x = lerp(sx, cs[k][0] * W + Math.cos(a) * r, p);
      const y = lerp(sy, cs[k][1] * H + Math.sin(a) * r * 0.8, p);
      ctx.globalAlpha = 0.35 + 0.45 * p;
      ctx.fillStyle = CLUST[k];
      ctx.beginPath(); ctx.arc(x, y, 1.7, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
  },

  spatial(ctx, W, H, t, R) {
    const h = [R() * 2 - 1, R() * 2 - 1, R() * 2 - 1, R() * 2 - 1];
    const cx = W / 2, cy = H / 2, rx = (W - PAD * 2) * 0.42, ry = (H - PAD * 2) * 0.44;
    blobPath(ctx, cx, cy, rx, ry, h);
    ctx.strokeStyle = INK(0.35); ctx.lineWidth = 1; ctx.stroke();
    for (let i = 0; i < 110; i++) {
      const a = R() * 6.283, rr = Math.sqrt(R()) * 0.88, ph = R() * 6.283;
      const w = 1 + 0.16 * h[0] * Math.sin(a * 2 + h[1] * 4) + 0.11 * h[2] * Math.sin(a * 3 + h[3] * 5);
      const x = cx + Math.cos(a) * rx * w * rr, y = cy + Math.sin(a) * ry * w * rr;
      const dom = (x < cx ? 0 : 1) + (y + 10 * Math.sin(a * 2 + h[1]) < cy ? 0 : 2);
      ctx.globalAlpha = 0.45 + 0.3 * Math.sin(t * 6.283 + ph);
      ctx.fillStyle = CLUST[dom];
      ctx.beginPath(); ctx.arc(x, y, 1.8, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
  },

  chromatin(ctx, W, H, t, R) {
    const laneH = (H - PAD * 2) / 3, cols = [TEAL, SEPIA, BLUE];
    const xMax = PAD + (W - PAD * 2) * ease(t);
    for (let l = 0; l < 3; l++) {
      const base = PAD + laneH * (l + 0.82);
      const bumps = [];
      const nb = 3 + Math.floor(R() * 3);
      for (let b = 0; b < nb; b++) bumps.push([PAD + 6 + R() * (W - PAD * 2 - 12), 5 + R() * 10, laneH * (0.3 + R() * 0.55)]);
      ctx.beginPath(); ctx.moveTo(PAD, base);
      for (let x = PAD; x <= xMax; x += 2) {
        let y = base;
        for (const [c, w, amp] of bumps) y -= amp * Math.exp(-(((x - c) / w) ** 2));
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = cols[l]; ctx.globalAlpha = 0.85; ctx.lineWidth = 1.3; ctx.stroke();
      ctx.lineTo(xMax, base); ctx.closePath();
      ctx.fillStyle = cols[l]; ctx.globalAlpha = 0.14; ctx.fill();
      ctx.globalAlpha = 0.25; ctx.strokeStyle = INK(0.3); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(PAD, base); ctx.lineTo(W - PAD, base); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },

  longread(ctx, W, H, t, R) {
    const x0 = PAD, x1 = W - PAD;
    ctx.strokeStyle = INK(0.55); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x0, PAD + 5); ctx.lineTo(x1, PAD + 5); ctx.stroke();
    const n = 6, rowH = (H - PAD * 2 - 16) / n;
    for (let i = 0; i < n; i++) {
      const p = ease(clamp01((t - i * 0.13) / 0.22));
      const y = PAD + 16 + i * rowH;
      const rs = x0 + R() * (x1 - x0) * 0.28, re = x1 - R() * (x1 - x0) * 0.28;
      const off = (1 - p) * 20 * (i % 2 ? 1 : -1);
      ctx.globalAlpha = p * 0.9;
      ctx.strokeStyle = TEAL; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(rs + off, y); ctx.lineTo(re + off, y); ctx.stroke();
      const nSeg = 2 + Math.floor(R() * 2), span = re - rs;
      ctx.fillStyle = TEAL;
      for (let s = 0; s < nSeg; s++) {
        const a = rs + (span * s) / nSeg + span * 0.04, b = rs + (span * (s + 1)) / nSeg - span * 0.1;
        ctx.beginPath(); ctx.roundRect(a + off, y - 2.5, Math.max(4, b - a), 5, 2.5); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  },

  radiomics(ctx, W, H, t, R) {
    const cx = W / 2, cy = H / 2, rx = (W - PAD * 2) * 0.4, ry = (H - PAD * 2) * 0.46;
    ctx.strokeStyle = INK(0.5); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 6.283); ctx.stroke();
    ctx.strokeStyle = INK(0.2);
    ctx.beginPath(); ctx.ellipse(cx, cy, rx * 0.7, ry * 0.7, 0, 0, 6.283); ctx.stroke();
    const h = [R() * 2 - 1, R() * 2 - 1, R() * 2 - 1, R() * 2 - 1];
    const bx = cx + rx * 0.32, by = cy - ry * 0.12, br = Math.min(rx, ry) * 0.34;
    const p1 = ease(clamp01(t / 0.55)), p2 = ease(clamp01((t - 0.62) / 0.3));
    ctx.save();
    blobPath(ctx, bx, by, br, br * 0.85, h, 40);
    ctx.clip();
    ctx.strokeStyle = TEAL; ctx.globalAlpha = 0.7; ctx.lineWidth = 1;
    const total = Math.ceil((4 * br) / 4), lit = Math.round(total * p1);
    for (let i = 0; i < lit; i++) {
      const o = -2 * br + i * 4;
      ctx.beginPath(); ctx.moveTo(bx + o - br, by + br); ctx.lineTo(bx + o + br, by - br); ctx.stroke();
    }
    ctx.restore();
    if (p2 > 0) {
      blobPath(ctx, bx, by, br, br * 0.85, h, 40);
      ctx.setLineDash([4, 3]); ctx.strokeStyle = TEAL; ctx.globalAlpha = p2; ctx.lineWidth = 1.4;
      ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.globalAlpha = 1;
  },

  calcium(ctx, W, H, t, R) {
    const rowH = (H - PAD * 2) / 4;
    for (let i = 0; i < 4; i++) {
      const base = PAD + rowH * (i + 0.7), phase = R() * 6.283;
      const spikes = [R(), R(), R()];
      const pts = [];
      for (let x = PAD; x <= W - PAD; x += 2) {
        const u = (((x - PAD) / (W - PAD * 2) + t) % 1 + 1) % 1;
        let v = Math.sin((u * 3 + phase) * 6.283) * 1.4, f = 0;
        for (const s of spikes) {
          let d = u - s; d -= Math.round(d);
          if (d >= 0) { const e = Math.exp(-d * 34); v -= rowH * 0.62 * e; f = Math.max(f, e); }
        }
        pts.push([x, base + v, f]);
      }
      ctx.strokeStyle = CLUST[i]; ctx.globalAlpha = 0.5; ctx.lineWidth = 1.1;
      ctx.beginPath(); pts.forEach(([x, y], j) => ctx[j ? "lineTo" : "moveTo"](x, y)); ctx.stroke();
      ctx.globalAlpha = 0.95; ctx.lineWidth = 1.7; ctx.beginPath();
      let pen = false;
      for (const [x, y, f] of pts) {
        if (f > 0.3) { ctx[pen ? "lineTo" : "moveTo"](x, y); pen = true; } else pen = false;
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },

  clinical(ctx, W, H, t, R) {
    const x0 = PAD, x1 = W - PAD, y0 = PAD + 2, y1 = H - PAD;
    ctx.strokeStyle = INK(0.25); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
    for (const [col, rate, floor] of [[TEAL, 1, 0.42], [SEPIA, 0.78, 0.68]]) {
      const xMax = x0 + (x1 - x0) * ease(clamp01(t * rate * 1.15));
      let x = x0, y = y0 + 2;
      ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let s = 0; s < 7 && x < xMax; s++) {
        const nx = Math.min(x + (0.06 + R() * 0.12) * (x1 - x0), xMax);
        ctx.lineTo(nx, y);
        if (R() < 0.55 && nx < xMax) { // censor tick cross on the plateau
          const tx = (x + nx) / 2;
          ctx.moveTo(tx, y - 3); ctx.lineTo(tx, y + 3);
          ctx.moveTo(tx - 3, y); ctx.lineTo(tx + 3, y);
          ctx.moveTo(nx, y);
        }
        if (nx < xMax) { const ny = Math.min(y + (3 + R() * 10), y0 + (y1 - y0) * floor); ctx.lineTo(nx, ny); y = ny; }
        x = nx;
      }
      if (x < xMax) ctx.lineTo(xMax, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },

  dna(ctx, W, H, t, R) {
    const cx = W / 2, cy = H / 2, r = Math.min(W, H) / 2 - PAD - 4;
    ctx.strokeStyle = INK(0.4); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.283); ctx.stroke();
    let a = -Math.PI / 2;
    const sweep = -Math.PI / 2 + ease(t) * 6.283;
    const cols = [TEAL, AMBER, BLUE, GREEN, SEPIA];
    for (let i = 0; i < 5; i++) {
      const span = 0.45 + R() * 0.75, gap = 0.12 + R() * 0.28;
      const end = Math.min(a + span, sweep);
      if (end > a) {
        ctx.strokeStyle = cols[i]; ctx.lineWidth = 4.5; ctx.lineCap = "round"; ctx.globalAlpha = 0.85;
        ctx.beginPath(); ctx.arc(cx, cy, r + (i % 2 ? 4 : -4) * 0.9, a, end); ctx.stroke();
      }
      a += span + gap;
    }
    ctx.lineCap = "butt"; ctx.globalAlpha = 1;
    ctx.strokeStyle = INK(0.5); ctx.lineWidth = 1;
    for (const ta of [0.9, 3.6]) {
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ta) * (r - 4), cy + Math.sin(ta) * (r - 4));
      ctx.lineTo(cx + Math.cos(ta) * (r + 7), cy + Math.sin(ta) * (r + 7));
      ctx.stroke();
    }
  },
};

export default function AssayMini({ kind, height = 110 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const draw = DRAW[kind];
    if (!ctx || !draw) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, W = 0, H = 0;
    const render = (t) => {
      ctx.clearRect(0, 0, W, H);
      draw(ctx, W, H, t, mulberry32(seedOf(kind)));
    };
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) render(1);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    if (!reduced) {
      const dur = 6000, start = performance.now();
      const frame = (now) => { render(((now - start) % dur) / dur); raf = requestAnimationFrame(frame); };
      raf = requestAnimationFrame(frame);
    }
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [kind]);
  return <canvas ref={ref} aria-hidden="true" style={{ width: "100%", height, display: "block" }} />;
}
