"use client";

import { useEffect, useRef } from "react";

/* Dark, inView-armed assay sketches. Line art only; no copyrighted
   raster is painted into the canvas. Palette follows the hero / fable:
   near-black well, bone ink, teal accent. */

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const seedOf = (s) => { let h = 7; for (const c of s) h = (h * 33 + c.charCodeAt(0)) >>> 0; return h; };
const lerp = (a, b, p) => a + (b - a) * p;
const ease = (p) => p * p * (3 - 2 * p);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const seg = (t, a, b) => clamp((t - a) / Math.max(0.0001, b - a), 0, 1);

const BG = "#090A0B";
const BONE = "#E8E4D8";
const TEAL = "#2DD4BF";
const INK = (a) => `rgba(232,228,216,${a})`;
const CLUST = ["#2DD4BF", "#E0A050", "#8A6AA8", "#4A9FD4", "#C46B8A", "#C84840", "#9AA7A3", "#5BA88A"];
const PAD = 7;
const DUR = 8000;

function fillBg(ctx, W, H) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
}

function label(ctx, text, x, y, color = INK(0.7), size = 8) {
  ctx.font = `600 ${size}px ui-sans-serif, system-ui, sans-serif`;
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

function tissueOutline(ctx, cx, cy, rx, ry, h, n = 64) {
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const w = 1 + 0.14 * h[0] * Math.sin(a * 2 + h[1] * 3) + 0.08 * h[2] * Math.sin(a * 5 + h[3]);
    const dent = 1 - 0.12 * Math.max(0, Math.cos(a - 0.4));
    ctx[i ? "lineTo" : "moveTo"](cx + Math.cos(a) * rx * w * dent, cy + Math.sin(a) * ry * w);
  }
  ctx.closePath();
}

const DRAW = {
  singlecell(ctx, W, H, t, R) {
    // Traced from a multilineage iPSC UMAP (Shen et al., Sci Data 2025, CC-BY 4.0):
    // many small clusters packed in a 2-D fold, not four equal blobs.
    const centers = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * 6.283 + 0.3;
      centers.push([0.5 + Math.cos(a) * 0.32, 0.52 + Math.sin(a) * 0.34 * 0.82, i]);
    }
    // two leftover satellite clusters, as in the atlas
    centers.push([0.18, 0.22, 2], [0.84, 0.24, 5]);
    const names = ["epi", "mes", "endo", "CM", "EC", "PG", "neur", "blood"];
    const gather = ease(seg(t, 0.05, 0.42));
    const colorIn = ease(seg(t, 0.28, 0.62));
    const labelIn = ease(seg(t, 0.62, 0.78));
    const n = 160;
    for (let i = 0; i < n; i++) {
      const k = i % centers.length;
      const c = centers[k];
      const sx = lerp(PAD, W - PAD, R());
      const sy = lerp(PAD, H - PAD, R());
      const a = R() * 6.283, r = Math.sqrt(R()) * Math.min(W, H) * (0.08 + (k % 3) * 0.02);
      const tx = c[0] * W + Math.cos(a) * r;
      const ty = c[1] * H + Math.sin(a) * r * 0.85;
      const x = lerp(sx, tx, gather);
      const y = lerp(sy, ty, gather);
      ctx.globalAlpha = 0.25 + 0.7 * colorIn;
      ctx.fillStyle = colorIn > 0.05 ? CLUST[c[2] % CLUST.length] : BONE;
      ctx.beginPath(); ctx.arc(x, y, 1.7, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = labelIn;
    names.forEach((nm, i) => {
      if (i >= 8) return;
      const c = centers[i];
      label(ctx, nm, c[0] * W + 4, c[1] * H - 8, INK(0.85), 7.5);
    });
    ctx.globalAlpha = 1;
    ctx.strokeStyle = INK(0.18); ctx.lineWidth = 1;
    ctx.strokeRect(PAD - 2, PAD - 2, W - PAD * 2 + 4, H - PAD * 2 + 4);
    label(ctx, "UMAP", PAD + 2, H - 8, INK(0.4), 7);
  },

  spatial(ctx, W, H, t, R) {
    // Visium-like spots on an H&E tissue silhouette; domains color like BANKSY.
    const h = [0.7, -0.4, 0.5, 0.2];
    const cx = W * 0.46, cy = H * 0.52, rx = W * 0.36, ry = H * 0.38;
    const outline = ease(seg(t, 0.0, 0.2));
    const spotsIn = ease(seg(t, 0.18, 0.48));
    const domains = ease(seg(t, 0.48, 0.78));
    ctx.save();
    tissueOutline(ctx, cx, cy, rx, ry, h);
    ctx.strokeStyle = INK(0.55 * outline); ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = `rgba(232,228,216,${0.06 * outline})`; ctx.fill();
    tissueOutline(ctx, cx, cy, rx, ry, h);
    ctx.clip();
    // faint histological grain, clipped to the section
    ctx.globalAlpha = 0.08 * outline;
    ctx.strokeStyle = BONE; ctx.lineWidth = 0.5;
    for (let i = 0; i < 18; i++) {
      const y = cy - ry + (i / 17) * ry * 2;
      ctx.beginPath(); ctx.moveTo(cx - rx, y); ctx.lineTo(cx + rx, y + 4); ctx.stroke();
    }
    const cols = 11, rows = 8;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const ox = (row % 2) * 0.5;
        const x = cx - rx * 0.85 + ((col + ox) / (cols - 1)) * rx * 1.7;
        const y = cy - ry * 0.78 + (row / (rows - 1)) * ry * 1.56;
        const dx = (x - cx) / rx, dy = (y - cy) / ry;
        if (dx * dx + dy * dy > 0.95) continue;
        const dom = dx < -0.15 ? 0 : dy < -0.1 ? 1 : dx > 0.35 ? 2 : 3;
        const appear = spotsIn * (0.6 + 0.4 * ((col + row) % 3) / 2);
        ctx.globalAlpha = appear;
        ctx.fillStyle = domains > 0.05 ? CLUST[dom] : INK(0.55);
        ctx.beginPath(); ctx.arc(x, y, 2.15, 0, 6.283); ctx.fill();
        ctx.globalAlpha = appear * 0.7;
        ctx.strokeStyle = BG; ctx.lineWidth = 0.4; ctx.stroke();
      }
    }
    ctx.restore();
    ctx.globalAlpha = ease(seg(t, 0.7, 0.9));
    label(ctx, "H&E + Visium", PAD + 2, H - 8, INK(0.4), 7);
    ctx.globalAlpha = 1;
  },

  chromatin(ctx, W, H, t, R) {
    // Genome-browser tracks: gene model + CUT&Tag / ATAC pileups.
    const x0 = PAD + 18, x1 = W - PAD, geneY = H - 16;
    const drawAxis = ease(seg(t, 0.0, 0.15));
    const geneIn = ease(seg(t, 0.12, 0.35));
    const trackIn = ease(seg(t, 0.32, 0.72));
    ctx.globalAlpha = drawAxis;
    ctx.strokeStyle = INK(0.3); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, geneY); ctx.lineTo(x1, geneY); ctx.stroke();
    label(ctx, "chr", 3, geneY, INK(0.4), 7);
    // exons of a gene model
    const exons = [[0.08, 0.16], [0.28, 0.36], [0.48, 0.7], [0.8, 0.92]];
    ctx.globalAlpha = geneIn;
    ctx.strokeStyle = BONE; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(lerp(x0, x1, 0.08), geneY); ctx.lineTo(lerp(x0, x1, 0.92), geneY); ctx.stroke();
    ctx.fillStyle = BONE;
    exons.forEach(([a, b]) => {
      const x = lerp(x0, x1, a), w = lerp(x0, x1, b) - x;
      ctx.fillRect(x, geneY - 3, w, 6);
    });
    label(ctx, "GENE", lerp(x0, x1, 0.48), geneY + 9, INK(0.45), 6.5);
    const tracks = [
      { name: "CUT&Tag", color: TEAL, peaks: [[0.12, 0.9], [0.32, 0.55], [0.58, 1], [0.84, 0.35]] },
      { name: "ATAC", color: "#4A9FD4", peaks: [[0.1, 0.4], [0.31, 0.7], [0.57, 0.8], [0.86, 0.5]] },
      { name: "IgG", color: "#8a8a8a", peaks: [[0.2, 0.12], [0.5, 0.1], [0.8, 0.14]] },
    ];
    tracks.forEach((tr, i) => {
      const base = 14 + i * ((geneY - 22) / 3);
      ctx.globalAlpha = 0.85 * trackIn;
      label(ctx, tr.name, 3, base - 8, INK(0.45), 6.5);
      ctx.beginPath(); ctx.moveTo(x0, base);
      for (let x = x0; x <= x1; x += 2) {
        const u = (x - x0) / (x1 - x0);
        let y = 0;
        tr.peaks.forEach(([c, amp]) => { y += amp * Math.exp(-(((u - c) / 0.045) ** 2)); });
        const reveal = clamp((trackIn * 1.15 - u), 0, 1);
        ctx.lineTo(x, base - y * 16 * reveal);
      }
      ctx.strokeStyle = tr.color; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.lineTo(x1, base); ctx.lineTo(x0, base); ctx.closePath();
      ctx.fillStyle = tr.color; ctx.globalAlpha = 0.18 * trackIn; ctx.fill();
    });
    ctx.globalAlpha = 1;
  },

  longread(ctx, W, H, t, R) {
    // Reference exons + isoforms + sashimi junction arcs.
    const x0 = PAD + 4, x1 = W - PAD;
    const exons = [[0.06, 0.18], [0.3, 0.42], [0.55, 0.64], [0.78, 0.94]];
    const isoforms = [
      [0, 1, 2, 3],
      [0, 2, 3],
      [0, 1, 3],
    ];
    const refIn = ease(seg(t, 0.0, 0.2));
    const isoIn = ease(seg(t, 0.2, 0.5));
    const arcIn = ease(seg(t, 0.5, 0.82));
    const yRef = 16;
    ctx.globalAlpha = refIn;
    ctx.strokeStyle = INK(0.35); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, yRef); ctx.lineTo(x1, yRef); ctx.stroke();
    ctx.fillStyle = BONE;
    exons.forEach(([a, b]) => ctx.fillRect(lerp(x0, x1, a), yRef - 4, lerp(x0, x1, b) - lerp(x0, x1, a), 8));
    label(ctx, "ref", x0, yRef - 10, INK(0.45), 6.5);
    isoforms.forEach((iso, i) => {
      const y = 36 + i * 18;
      ctx.globalAlpha = isoIn;
      ctx.strokeStyle = CLUST[i]; ctx.lineWidth = 1;
      const xa = lerp(x0, x1, exons[iso[0]][0]);
      const xb = lerp(x0, x1, exons[iso[iso.length - 1]][1]);
      ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xb, y); ctx.stroke();
      ctx.fillStyle = CLUST[i];
      iso.forEach((ei) => {
        const [a, b] = exons[ei];
        ctx.fillRect(lerp(x0, x1, a), y - 3, Math.max(3, lerp(x0, x1, b) - lerp(x0, x1, a)), 6);
      });
    });
    // sashimi arcs on the reference
    const junctions = [[0, 1, 0.9], [1, 2, 0.6], [0, 2, 0.45], [2, 3, 0.8], [1, 3, 0.3]];
    junctions.forEach(([a, b, w], i) => {
      const xA = lerp(x0, x1, (exons[a][1] + exons[a][0]) / 2);
      const xB = lerp(x0, x1, (exons[b][1] + exons[b][0]) / 2);
      const mid = (xA + xB) / 2;
      const rise = 10 + (b - a) * 10;
      ctx.globalAlpha = arcIn * 0.9;
      ctx.strokeStyle = TEAL; ctx.lineWidth = 0.7 + w * 1.8;
      ctx.beginPath(); ctx.moveTo(xA, yRef - 4);
      ctx.quadraticCurveTo(mid, yRef - 4 - rise * arcIn, xB, yRef - 4);
      ctx.stroke();
    });
    ctx.globalAlpha = ease(seg(t, 0.75, 0.92));
    label(ctx, "sashimi", PAD + 2, H - 8, INK(0.4), 7);
    ctx.globalAlpha = 1;
  },

  radiomics(ctx, W, H, t, R) {
    // Axial thorax silhouette, tumor contour, then a short feature read-out.
    const slice = ease(seg(t, 0.0, 0.28));
    const contour = ease(seg(t, 0.3, 0.65));
    const feats = ease(seg(t, 0.62, 0.88));
    const cx = W * 0.38, cy = H * 0.52;
    ctx.globalAlpha = slice;
    ctx.strokeStyle = INK(0.55); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(cx, cy, 42, 36, 0, 0, 6.283); ctx.stroke();
    // two lung fields
    ctx.fillStyle = "rgba(45,52,58,0.9)";
    ctx.beginPath(); ctx.ellipse(cx - 16, cy, 14, 22, 0.1, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 16, cy + 1, 13, 21, -0.1, 0, 6.283); ctx.fill();
    ctx.strokeStyle = INK(0.25); ctx.stroke();
    // mediastinum
    ctx.fillStyle = "rgba(80,80,82,0.8)";
    ctx.beginPath(); ctx.ellipse(cx, cy + 2, 6, 16, 0, 0, 6.283); ctx.fill();
    // tumor in left lung
    const tx = cx - 20, ty = cy - 6;
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const a = (i / 40) * 6.283;
      const rr = 8 * (1 + 0.18 * Math.sin(a * 3) + 0.1 * Math.sin(a * 5));
      ctx[i ? "lineTo" : "moveTo"](tx + Math.cos(a) * rr, ty + Math.sin(a) * rr * 0.85);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(196,72,64,${0.35 * slice})`; ctx.fill();
    ctx.setLineDash([3, 2]);
    ctx.strokeStyle = TEAL; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.3 + 0.7 * contour;
    const lenGuess = 80;
    ctx.lineDashOffset = (1 - contour) * lenGuess;
    ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    // feature bars
    const bars = [["shape", 0.82], ["texture", 0.64], ["intensity", 0.71]];
    bars.forEach((b, i) => {
      const x = W * 0.68, y = 22 + i * 26;
      ctx.globalAlpha = feats;
      label(ctx, b[0], x, y - 7, INK(0.5), 7);
      ctx.fillStyle = INK(0.12);
      ctx.fillRect(x, y, 56, 5);
      ctx.fillStyle = TEAL;
      ctx.fillRect(x, y, 56 * b[1] * feats, 5);
    });
    ctx.globalAlpha = 1;
  },

  calcium(ctx, W, H, t, R) {
    // Left FOV + ROIs; right traces with rise-and-decay transients.
    const fovW = W * 0.42;
    const fovIn = ease(seg(t, 0.0, 0.25));
    ctx.globalAlpha = fovIn;
    ctx.fillStyle = "#121416";
    ctx.fillRect(PAD, PAD, fovW - PAD, H - PAD * 2);
    ctx.strokeStyle = INK(0.2); ctx.strokeRect(PAD, PAD, fovW - PAD, H - PAD * 2);
    // noisy field
    for (let i = 0; i < 80; i++) {
      ctx.globalAlpha = 0.08 * fovIn;
      ctx.fillStyle = BONE;
      ctx.fillRect(PAD + R() * (fovW - PAD), PAD + R() * (H - PAD * 2), 3, 3);
    }
    const rois = [
      [0.28, 0.32, 0.12, 0.0],
      [0.62, 0.3, 0.38, 0.2],
      [0.4, 0.62, 0.55, 0.4],
      [0.7, 0.7, 0.78, 0.6],
    ];
    const tracesX0 = fovW + 8, tracesX1 = W - PAD;
    rois.forEach((roi, i) => {
      const cx = PAD + roi[0] * (fovW - PAD);
      const cy = PAD + roi[1] * (H - PAD * 2);
      // spike windows along the loop
      const u = (t + roi[3]) % 1;
      const fire = u > roi[2] && u < roi[2] + 0.12 ? Math.exp(-((u - roi[2]) / 0.03)) : 0;
      ctx.globalAlpha = 0.85 * fovIn;
      ctx.strokeStyle = CLUST[i]; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(cx, cy, 7, 0, 6.283); ctx.stroke();
      if (fire > 0.15) {
        ctx.globalAlpha = 0.35 * fire;
        ctx.fillStyle = CLUST[i];
        ctx.beginPath(); ctx.arc(cx, cy, 7, 0, 6.283); ctx.fill();
      }
      const base = PAD + 16 + i * ((H - PAD * 2 - 10) / 4);
      ctx.globalAlpha = ease(seg(t, 0.15, 0.4));
      ctx.strokeStyle = CLUST[i]; ctx.lineWidth = 1.15;
      ctx.beginPath();
      for (let x = tracesX0; x <= tracesX1; x += 2) {
        const s = (x - tracesX0) / (tracesX1 - tracesX0);
        let v = 0;
        // two transients per loop, classic Ca2+ shape
        [roi[2], (roi[2] + 0.45) % 1].forEach((sp) => {
          let d = s - sp; if (d < 0) d += 1;
          if (d < 0.2) v += (d < 0.03 ? d / 0.03 : Math.exp(-(d - 0.03) * 12));
        });
        const y = base - v * 16;
        ctx[x === tracesX0 ? "moveTo" : "lineTo"](x, y);
      }
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    label(ctx, "FOV", PAD + 3, PAD + 8, INK(0.4), 6.5);
  },

  clinical(ctx, W, H, t, R) {
    const x0 = PAD + 16, x1 = W - PAD - 2, y0 = PAD + 6, y1 = H - 18;
    const axis = ease(seg(t, 0.0, 0.15));
    const drawK = ease(seg(t, 0.15, 0.8));
    ctx.globalAlpha = axis;
    ctx.strokeStyle = INK(0.3); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
    label(ctx, "OS", 2, y0 + 4, INK(0.45), 6.5);
    label(ctx, "time", x1 - 18, y1 + 8, INK(0.4), 6.5);
    // two arms, predetermined steps (deterministic, not random each frame)
    const arms = [
      { col: TEAL, steps: [[0, 1], [0.18, 1], [0.18, 0.86], [0.34, 0.86], [0.34, 0.7], [0.52, 0.7], [0.52, 0.58], [0.7, 0.58], [0.7, 0.5], [1, 0.5]], censors: [0.26, 0.6, 0.88] },
      { col: "#E0A050", steps: [[0, 1], [0.12, 1], [0.12, 0.78], [0.28, 0.78], [0.28, 0.58], [0.44, 0.58], [0.44, 0.4], [0.62, 0.4], [0.62, 0.28], [0.82, 0.28], [0.82, 0.2], [1, 0.2]], censors: [0.22, 0.5] },
    ];
    arms.forEach((arm, ai) => {
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = arm.col; ctx.lineWidth = 1.6;
      ctx.beginPath();
      arm.steps.forEach((p, i) => {
        const x = lerp(x0, x1, p[0]);
        const y = lerp(y1, y0, p[1]);
        const reveal = drawK * 1.05;
        if (p[0] > reveal && i > 0) return;
        ctx[i ? "lineTo" : "moveTo"](x, y);
      });
      ctx.stroke();
      arm.censors.forEach((c) => {
        if (c > drawK) return;
        // interpolate y at c
        let yv = 1;
        for (let i = 1; i < arm.steps.length; i++) {
          if (arm.steps[i][0] >= c) { yv = arm.steps[i - 1][1]; break; }
        }
        const x = lerp(x0, x1, c), y = lerp(y1, y0, yv);
        ctx.beginPath(); ctx.moveTo(x, y - 3); ctx.lineTo(x, y + 3); ctx.stroke();
      });
    });
    ctx.globalAlpha = ease(seg(t, 0.75, 0.92));
    label(ctx, "A", x0 + 4, y0 + 8, TEAL, 7);
    label(ctx, "B", x0 + 16, y0 + 8, "#E0A050", 7);
    ctx.globalAlpha = 1;
  },

  dna(ctx, W, H, t, R) {
    const cx = W * 0.38, cy = H / 2, r = Math.min(W, H) / 2 - PAD - 6;
    const ring = ease(seg(t, 0.0, 0.25));
    const feat = ease(seg(t, 0.22, 0.7));
    const labs = ease(seg(t, 0.6, 0.85));
    ctx.globalAlpha = ring;
    ctx.strokeStyle = INK(0.45); ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + ring * 6.283); ctx.stroke();
    const features = [
      { name: "ori", a0: -0.3, a1: 0.5, col: TEAL, thick: 6 },
      { name: "AmpR", a0: 0.7, a1: 1.7, col: "#E0A050", thick: 6 },
      { name: "CMV", a0: 2.0, a1: 2.55, col: "#4A9FD4", thick: 6 },
      { name: "insert", a0: 2.7, a1: 5.2, col: "#8A6AA8", thick: 8 },
    ];
    features.forEach((f, i) => {
      const local = clamp((feat - i * 0.12) / 0.55, 0, 1);
      ctx.globalAlpha = 0.95 * local;
      ctx.strokeStyle = f.col; ctx.lineWidth = f.thick; ctx.lineCap = "round";
      ctx.beginPath(); ctx.arc(cx, cy, r, f.a0, lerp(f.a0, f.a1, local)); ctx.stroke();
      ctx.lineCap = "butt";
      if (labs > 0.2) {
        const mid = (f.a0 + f.a1) / 2;
        const lx = cx + Math.cos(mid) * (r + 12);
        const ly = cy + Math.sin(mid) * (r + 12);
        ctx.globalAlpha = labs;
        ctx.textAlign = Math.cos(mid) > 0 ? "left" : "right";
        label(ctx, f.name, lx, ly, f.col, 7);
        ctx.textAlign = "left";
      }
    });
    ctx.globalAlpha = labs;
    label(ctx, "pArtemis", cx - 16, cy, INK(0.7), 8);
    ctx.globalAlpha = 1;
  },
};

export default function AssayMini({ kind, height = 110, armed = false }) {
  const ref = useRef(null);
  const armedRef = useRef(!!armed);
  useEffect(() => { armedRef.current = !!armed; }, [armed]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const draw = DRAW[kind];
    if (!ctx || !draw) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, W = 0, H = 0, start = 0, running = false;
    const localArmed = { v: armedRef.current };

    const render = (tNorm) => {
      fillBg(ctx, W, H);
      draw(ctx, W, H, tNorm, mulberry32(seedOf(kind)));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) render(1);
      else if (!running) render(0);
    };

    const frame = (now) => {
      if (!localArmed.v && !armedRef.current) {
        render(0);
        raf = requestAnimationFrame(frame);
        return;
      }
      if (!running) { start = now; running = true; }
      if (reduced) { render(1); return; }
      const t = ((now - start) % DUR) / DUR;
      render(t);
      raf = requestAnimationFrame(frame);
    };

    const armIfSeen = () => {
      const r = canvas.getBoundingClientRect();
      const vh = window.innerHeight || 0;
      if (r.bottom > 0 && r.top < vh) {
        armedRef.current = true;
        localArmed.v = true;
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { armedRef.current = true; localArmed.v = true; } }, { threshold: 0.2 });
    io.observe(canvas);
    window.addEventListener("scroll", armIfSeen, { passive: true });
    armIfSeen();
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("scroll", armIfSeen);
    };
  }, [kind]);

  return <canvas ref={ref} aria-hidden="true" style={{ width: "100%", height, display: "block", background: BG }} />;
}
