"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ——————————————————————————————————————————————————————————————————————
// The Fable: "The Huntress & the Crystal of Twelve."
// Biological noise in the wild → precision aim → structured, living insight.
//
// One canvas carries the living matter (spatial cell pool, dodecahedron,
// DNA helix, drifting genomic coordinates); one SVG overlay carries the
// classical monoline engraving (Artemis, bow, arrow, agentic sub-threads).
// The two layers share a coordinate frame: SVG viewBox 1440×900 stretched
// with preserveAspectRatio="none", so (720, 297) in the SVG is exactly
// (0.5·w, 0.33·h) on the canvas — the crystal's core, where the arrow lands.
//
// Animation layer palette is strictly three values (obsidian / bone / teal);
// multicolor is reserved for the biological clusters, per Okabe–Ito.
// ——————————————————————————————————————————————————————————————————————

const BONE = "243, 239, 230";
const TEAL = "45, 212, 191";
const OKABE_ITO = ["#56B4E9", "#E69F00", "#009E73", "#CC79A7", "#F0E442"];

// the 20 vertices of the stack — carried over from the original dodecahedron
const LABELS = [
  "Visium", "Xenium", "CODEX", "CosMx", "Visium HD",
  "snRNA-seq", "snATAC", "H&E", "BANKSY", "Leiden",
  "cell2location", "NMF niches", "IvyGAP", "Moran's I", "DE",
  "UMAP", "Vitessce", "zarr", "Qwen3", "GPU",
];

const COORD_TICKS = [
  "chr3:181,695,000", "chr7:55,019,017 · EGFR", "chr17:7,668,402 · TP53",
  "120,418 cells", "FASTQ · R2 151bp", "chr10:87,863,113 · PTEN",
  "unmapped · 2.4%", "GFAP+ · ambiguous",
];

const AGENT_STEPS = ["INGEST · FASTQ/H5AD", "BANKSY · λ=0.2", "SUBAGENTS · 15 DOMAINS"];
const THREAD_CALLS = ["BANKSY", "Leiden", "Wilcoxon", "Qwen3"];

// beat timing (ms): draw 0→1500, release 1500, impact 2200, living 3200+
const T_RELEASE = 1500;
const T_IMPACT = 2200;

const easeSnap = [0.16, 1, 0.3, 1];

export default function FableStage() {
  const canvasRef = useRef(null);
  const impactRef = useRef(null); // performance.now() of impact, null before
  const [stage, setStage] = useState("drawing"); // drawing | flight | impacted
  const [run, setRun] = useState(0); // bump to replay the fable
  const reducedRef = useRef(false);

  // beat scheduler — replays when `run` bumps (logo salute re-fires the shot)
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reducedRef.current = reduced;
    if (reduced) {
      setStage("impacted");
      impactRef.current = performance.now() - 60000; // settled living state
      return;
    }
    setStage("drawing");
    impactRef.current = null;
    const t1 = setTimeout(() => setStage("flight"), T_RELEASE);
    const t2 = setTimeout(() => {
      setStage("impacted");
      impactRef.current = performance.now();
    }, T_IMPACT);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [run]);

  useEffect(() => {
    const onSalute = () => setRun((r) => r + 1);
    window.addEventListener("artemis-salute", onSalute);
    return () => window.removeEventListener("artemis-salute", onSalute);
  }, []);

  // ——— geometry: dodecahedron verts / edges / 12 pentagonal faces ———
  const { verts, edges, faces } = useMemo(() => {
    const phi = (1 + Math.sqrt(5)) / 2;
    const a = 1, b = 1 / phi, c = phi;
    const verts = [];
    for (const x of [-a, a]) for (const y of [-a, a]) for (const z of [-a, a]) verts.push([x, y, z]);
    for (const s of [-1, 1]) for (const t of [-1, 1]) {
      verts.push([0, s * b, t * c]);
      verts.push([s * b, t * c, 0]);
      verts.push([s * c, 0, t * b]);
    }
    const edges = [];
    const target = 2 / phi;
    for (let i = 0; i < verts.length; i++)
      for (let j = i + 1; j < verts.length; j++) {
        const d = Math.hypot(verts[i][0] - verts[j][0], verts[i][1] - verts[j][1], verts[i][2] - verts[j][2]);
        if (Math.abs(d - target) < 1e-6) edges.push([i, j]);
      }
    const centers = [];
    for (const s1 of [-1, 1]) for (const s2 of [-1, 1]) {
      centers.push([0, s1, s2 * phi]);
      centers.push([s1, s2 * phi, 0]);
      centers.push([s2 * phi, 0, s1]);
    }
    const faces = centers.map((c) => {
      const cl = Math.hypot(...c);
      const cn = c.map((v) => v / cl);
      const idx = verts
        .map((v, i) => [v[0] * cn[0] + v[1] * cn[1] + v[2] * cn[2], i])
        .sort((a, b) => b[0] - a[0])
        .slice(0, 5)
        .map(([, i]) => i);
      const refv = Math.abs(cn[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
      const u = [
        cn[1] * refv[2] - cn[2] * refv[1],
        cn[2] * refv[0] - cn[0] * refv[2],
        cn[0] * refv[1] - cn[1] * refv[0],
      ];
      const ul = Math.hypot(...u);
      const un = u.map((v) => v / ul);
      const wn = [
        cn[1] * un[2] - cn[2] * un[1],
        cn[2] * un[0] - cn[0] * un[2],
        cn[0] * un[1] - cn[1] * un[0],
      ];
      return idx
        .map((i) => {
          const v = verts[i];
          return [Math.atan2(v[0] * wn[0] + v[1] * wn[1] + v[2] * wn[2], v[0] * un[0] + v[1] * un[1] + v[2] * un[2]), i];
        })
        .sort((a, b) => a[0] - b[0])
        .map(([, i]) => i);
    });
    return { verts, edges, faces };
  }, []);

  // ——— the living canvas ———
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduced = reducedRef.current;
    let raf = 0;
    let running = false;
    let lastNow = 0;

    // spatial pool — a diffuse wild cloud that snaps into Okabe–Ito domains
    // as the impact wave sweeps outward through it
    const cells = Array.from({ length: 240 }, (_, i) => {
      const cluster = i % 5;
      const theta = Math.random() * Math.PI * 2;
      const rad = Math.pow(Math.random(), 0.6);
      return {
        cluster,
        theta,
        rad,
        wx: (Math.random() - 0.5) * 2, // wild position, fraction of half-width
        wy: Math.random(), // wild position within the lower band
        x: null,
        y: null,
        r: 1.1 + Math.random() * 1.4,
        ph: Math.random() * Math.PI * 2,
      };
    });

    const rot = { rx: 0.5, ry: 0.7, vx: 0, vy: 0 };
    const par = { tx: 0, ty: 0, x: 0, y: 0 };
    const drag = { on: false, x: 0, y: 0 };
    const hover = { i: -1 };
    let kicked = false; // impact spin kick applied once per run
    let pts = [];

    const draw = (now) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) { raf = requestAnimationFrame(draw); return; }
      if (canvas.width !== Math.round(w * dpr)) { canvas.width = w * dpr; canvas.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const t = now / 1000;
      const dt = Math.min(50, Math.max(0, now - lastNow));
      lastNow = now;

      const cx = w * 0.5;
      const cy = h * 0.33;
      const S = Math.min(w, h * 1.3); // layout scale
      const impactAt = impactRef.current;
      const since = impactAt == null ? -1 : (now - impactAt) / 1000;
      const settled = since > 1.6 ? 1 : since < 0 ? 0 : since / 1.6;

      // 01 · the wild — drifting genomic coordinates, fading out after impact
      const wildAlpha = since < 0 ? 1 : Math.max(0, 1 - since * 1.2);
      if (wildAlpha > 0.02) {
        ctx.font = "500 10px 'JetBrains Mono', ui-monospace, monospace";
        COORD_TICKS.forEach((tick, i) => {
          const fx = (0.08 + ((i * 0.131 + 0.05 * Math.sin(t * 0.21 + i * 2.1)) % 0.86));
          const fy = 0.1 + ((i * 0.37 + 0.02 * Math.cos(t * 0.17 + i)) % 0.78);
          const blink = 0.5 + 0.5 * Math.sin(t * 0.7 + i * 1.9);
          ctx.fillStyle = `rgba(${BONE}, ${0.16 * blink * wildAlpha})`;
          ctx.fillText(tick, fx * w, fy * h);
        });
      }

      // spatial pool — wild drift pre-impact; radial wave snaps cells to domains
      const clusterOff = [
        [-0.34, 0.425], [-0.17, 0.455], [0, 0.435], [0.17, 0.46], [0.34, 0.43],
      ];
      const waveR = since < 0 ? -1 : since * S * 1.1; // impact wave radius
      for (const c of cells) {
        const [ox, oy] = clusterOff[c.cluster];
        const sx = cx + (ox + Math.cos(c.theta) * c.rad * 0.052) * S;
        const sy = cy + (oy + Math.sin(c.theta) * c.rad * 0.024) * S;
        const wxp = cx + c.wx * w * 0.46;
        const wyp = cy + (0.14 + c.wy * 0.42) * h;
        if (c.x == null) { c.x = wxp; c.y = wyp; }
        const distFromCore = Math.hypot(c.x - cx, c.y - cy);
        const snapped = waveR >= 0 && distFromCore < waveR;
        const tx = snapped ? sx : wxp;
        const ty = snapped ? sy : wyp;
        const driftA = snapped ? 3 : 16;
        const dX = Math.sin(t * 1.05 + c.ph) * driftA;
        const dY = Math.cos(t * 0.85 + c.ph) * driftA * 0.8;
        const spring = snapped ? 0.05 : 0.006;
        c.x += (tx + dX - c.x) * spring * (reduced ? 10 : 1);
        c.y += (ty + dY - c.y) * spring * (reduced ? 10 : 1);
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fillStyle = OKABE_ITO[c.cluster];
        ctx.globalAlpha = snapped ? 0.44 : 0.13;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 04 · impact wave — a single crystalline ring sweeping the pool
      if (since > 0 && since < 1.6) {
        const k = since / 1.6;
        ctx.beginPath();
        ctx.arc(cx, cy, waveR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${TEAL}, ${0.4 * (1 - k)})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // ——— the crystal of twelve ———
      if (!kicked && since >= 0 && !reduced) {
        kicked = true;
        rot.vy += 0.028; // the shot lands with real momentum
        rot.vx += 0.01;
      }
      if (!drag.on) {
        if (!reduced) {
          const breathe = 0.09 + 0.1 * (1 - settled); // slows into living state
          rot.ry += (breathe + 0.04 * Math.sin(t * 0.3)) * (dt / 1000);
          rot.rx += 0.06 * (dt / 1000);
        }
        rot.rx += rot.vx;
        rot.ry += rot.vy;
        rot.vx *= 0.955;
        rot.vy *= 0.955;
      }
      par.x += ((drag.on ? 0 : par.tx) - par.x) * 0.06;
      par.y += ((drag.on ? 0 : par.ty) - par.y) * 0.06;
      const cosx = Math.cos(rot.rx + par.x), sinx = Math.sin(rot.rx + par.x);
      const cosy = Math.cos(rot.ry + par.y), siny = Math.sin(rot.ry + par.y);
      const pulse = since > 0 && since < 1.2 ? Math.sin((since / 1.2) * Math.PI) * 0.07 : 0;
      const R = Math.min(96, S * 0.112) * (1 + pulse);
      pts = verts.map(([x, y, z]) => {
        const y1 = y * cosx - z * sinx, z1 = y * sinx + z * cosx;
        const x2 = x * cosy + z1 * siny, z2 = -x * siny + z1 * cosy;
        const s = R * (3.4 / (3.4 + z2));
        return [cx + x2 * s, cy + y1 * s, z2];
      });

      // glassy faces, back to front — lighting up one by one on impact
      const faceOrder = faces
        .map((f, fi) => [f.reduce((acc, i) => acc + pts[i][2], 0) / 5, fi])
        .sort((a, b) => b[0] - a[0]);
      for (const [fz, fi] of faceOrder) {
        const f = faces[fi];
        const facing = 1 - (fz + 1.7) / 3.4;
        // sequential illumination: face fi ignites at impact + fi·70ms
        let lit = 0;
        if (since >= 0) {
          const local = since - fi * 0.07;
          if (local > 0) lit = Math.min(1, local * 2.2) * (0.35 + 0.65 * Math.exp(-local * 1.1));
        }
        ctx.beginPath();
        f.forEach((i, k) => (k ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1])));
        ctx.closePath();
        ctx.fillStyle = `rgba(${TEAL}, ${0.012 + 0.028 * facing + 0.12 * lit * facing})`;
        ctx.fill();
      }

      // edges — bone wireframe in the wild, teal once the shot lands
      for (const [i, j] of edges) {
        const near = 1 - ((pts[i][2] + pts[j][2]) / 2 + 1.7) / 3.4;
        const hot = hover.i >= 0 && (i === hover.i || j === hover.i);
        const base = since >= 0 ? TEAL : BONE;
        const amp = since >= 0 ? 0.14 + 0.42 * near : 0.08 + 0.22 * near;
        ctx.strokeStyle = hot ? `rgba(${TEAL}, 0.9)` : `rgba(${base}, ${amp})`;
        ctx.lineWidth = hot ? 1.8 : 1.05;
        ctx.beginPath();
        ctx.moveTo(pts[i][0], pts[i][1]);
        ctx.lineTo(pts[j][0], pts[j][1]);
        ctx.stroke();
      }

      // signal carriers along the edges — the agents never stop running
      if (!reduced && since > 0.4) {
        const carrierA = Math.min(1, (since - 0.4) / 1);
        for (let c = 0; c < 4; c++) {
          const speed = 0.9 + c * 0.23;
          const k = Math.floor(t * speed + c * 37) % edges.length;
          const [i, j] = edges[k];
          const f = (t * speed + c * 37) % 1;
          const px = pts[i][0] + (pts[j][0] - pts[i][0]) * f;
          const py = pts[i][1] + (pts[j][1] - pts[i][1]) * f;
          ctx.beginPath();
          ctx.arc(px, py, c === 0 ? 2.8 : 2, 0, Math.PI * 2);
          ctx.fillStyle = c % 2 ? `rgb(${TEAL})` : `rgb(${BONE})`;
          ctx.globalAlpha = 0.75 * carrierA;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      // the double helix threaded through the core — accelerates on impact,
      // then settles into a steady, rhythmic spin
      const helixSpeed = since < 0 ? 1.0 : 1.6 + 1.6 * Math.exp(-Math.max(0, since) * 0.9);
      const H = R * 1.32;
      const amp = R * 0.3;
      const N = 42;
      const turns = 2.1;
      const strand = (ph) => {
        const arr = [];
        for (let k = 0; k <= N; k++) {
          const u = k / N;
          const ang = u * turns * Math.PI * 2 + (reduced ? 1.4 : t * helixSpeed) + ph;
          arr.push([cx + Math.sin(ang) * amp, cy - H / 2 + u * H, Math.cos(ang)]);
        }
        return arr;
      };
      const s1 = strand(0), s2 = strand(Math.PI);
      const helixA = since < 0 ? 0.45 : 0.45 + 0.4 * settled;
      for (let k = 2; k < N; k += 4) {
        const a = s1[k], b = s2[k];
        const front = (a[2] + b[2]) / 2 > 0;
        ctx.strokeStyle = `rgba(${TEAL}, ${(front ? 0.4 : 0.14) * helixA})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
      }
      for (const [sIdx, s] of [s1, s2].entries()) {
        ctx.beginPath();
        s.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.strokeStyle = sIdx === 0 ? `rgba(${TEAL}, ${0.6 * helixA})` : `rgba(${BONE}, ${0.42 * helixA})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        for (const [x, y, d] of s) {
          if (d > 0.62) {
            ctx.beginPath();
            ctx.arc(x, y, 1.7, 0, Math.PI * 2);
            ctx.fillStyle = sIdx === 0 ? `rgba(${TEAL}, ${0.85 * helixA})` : `rgba(${BONE}, ${0.7 * helixA})`;
            ctx.fill();
          }
        }
      }

      // vertices + hover chips (the stack, nameable by hand — kept from v1)
      ctx.font = "600 11px 'JetBrains Mono', ui-monospace, monospace";
      const chip = (i, la) => {
        const [x, y] = pts[i];
        const label = LABELS[i % LABELS.length];
        const tw = ctx.measureText(label).width;
        const flip = x > w - tw - 28;
        const cx0 = flip ? x - tw - 19 : x + 11;
        ctx.strokeStyle = `rgba(${TEAL}, ${0.55 * la})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + (flip ? -4 : 4), y);
        ctx.lineTo(flip ? cx0 + tw + 4 : cx0 - 4, y);
        ctx.stroke();
        ctx.fillStyle = `rgba(9, 10, 11, ${0.88 * la})`;
        ctx.strokeStyle = `rgba(${TEAL}, ${0.35 * la})`;
        ctx.beginPath();
        ctx.roundRect(cx0 - 5, y - 8.5, tw + 10, 16, 3);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = `rgba(${BONE}, ${0.35 + 0.65 * la})`;
        ctx.fillText(label, cx0, y + 3.5);
      };
      for (const [, i] of pts.map((p, i) => [p[2], i]).sort((a, b) => a[0] - b[0])) {
        const [x, y, z] = pts[i];
        const near = 1 - (z + 1.7) / 3.4;
        const hot = i === hover.i;
        ctx.beginPath();
        ctx.arc(x, y, (hot ? 4 : 2.2) + 1.4 * near, 0, Math.PI * 2);
        const vcol = since >= 0 ? TEAL : BONE;
        ctx.fillStyle = hot ? `rgb(${TEAL})` : `rgba(${vcol}, ${0.3 + 0.55 * near})`;
        ctx.fill();
      }
      if (hover.i >= 0) chip(hover.i, 1);

      if (running) raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running) return;
      running = true;
      lastNow = performance.now();
      raf = requestAnimationFrame(draw);
    };
    const stopIfIdle = () => {
      if (reduced && !drag.on && Math.abs(rot.vx) + Math.abs(rot.vy) < 0.00005) {
        running = false;
        cancelAnimationFrame(raf);
        draw(performance.now());
      }
    };

    // drag to spin the crystal; hover a vertex to name it (kept from v1)
    const onDown = (e) => {
      // only grab when the cursor is near the crystal, so text stays selectable
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const R0 = Math.min(96, Math.min(rect.width, rect.height * 1.3) * 0.112) * 1.7;
      if (Math.hypot(mx - rect.width * 0.5, my - rect.height * 0.33) > R0) return;
      drag.on = true;
      drag.x = e.clientX;
      drag.y = e.clientY;
      rot.vx = 0;
      rot.vy = 0;
      canvas.style.cursor = "grabbing";
      canvas.setPointerCapture?.(e.pointerId);
      start();
    };
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (drag.on) {
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        drag.x = e.clientX;
        drag.y = e.clientY;
        rot.ry += dx * 0.006;
        rot.rx += dy * 0.006;
        rot.vy = dx * 0.0022;
        rot.vx = dy * 0.0022;
        if (reduced) start();
        return;
      }
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      if (!reduced) {
        par.ty = ((mx / rect.width) - 0.5) * 0.16;
        par.tx = ((my / rect.height) - 0.5) * 0.12;
      }
      let best = -1, bestD = 16 * 16;
      for (let i = 0; i < pts.length; i++) {
        const d = (pts[i][0] - mx) ** 2 + (pts[i][1] - my) ** 2;
        if (d < bestD) { bestD = d; best = i; }
      }
      if (best !== hover.i) {
        hover.i = best;
        if (reduced) { start(); setTimeout(stopIfIdle, 60); }
      }
      canvas.style.cursor = drag.on ? "grabbing" : best >= 0 ? "pointer" : "default";
    };
    const onUp = () => {
      drag.on = false;
      canvas.style.cursor = "default";
      if (reduced) {
        const coast = setInterval(() => {
          stopIfIdle();
          if (!running) clearInterval(coast);
        }, 120);
      }
    };
    const onLeave = () => {
      hover.i = -1;
      par.tx = 0;
      par.ty = 0;
      if (reduced) { start(); setTimeout(stopIfIdle, 60); }
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onLeave);

    if (reduced) draw(performance.now());
    else start();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [verts, edges, faces, run]);

  const drawn = stage !== "drawing";

  return (
    <div className="absolute inset-0" aria-hidden>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full select-none"
        style={{ touchAction: "pan-y" }}
      />

      {/* classical monoline engraving — Artemis, the bow, the shot */}
      <svg
        key={run}
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
        fill="none"
      >
        <g strokeLinecap="round" strokeLinejoin="round">
          {/* ground line — the plinth of the engraving */}
          <motion.path
            d="M 92 458 L 238 458"
            stroke={`rgba(${BONE}, 0.12)`}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          />
          {/* head, profile facing the shot, chignon knotted behind */}
          <motion.path
            d="M 148 263 a 9 9 0 1 0 18 0 a 9 9 0 1 0 -18 0"
            stroke={`rgba(${BONE}, 0.55)`}
            strokeWidth="1.3"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: easeSnap }}
          />
          <motion.circle
            cx="146" cy="257" r="3.4"
            fill={`rgba(${BONE}, 0.4)`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.35 }}
          />
          {/* back contour — nape, spine, small of the back, hip */}
          <motion.path
            d="M 159 271 C 156 282, 152 294, 150 306 C 148 322, 148 338, 148 354"
            stroke={`rgba(${BONE}, 0.55)`}
            strokeWidth="1.3"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.08, ease: easeSnap }}
          />
          {/* chest contour with breast curve */}
          <motion.path
            d="M 156 274 C 155 283, 156 290, 160 295 C 163 299, 162 304, 158 308 C 155 322, 153 338, 152 352"
            stroke={`rgba(${BONE}, 0.38)`}
            strokeWidth="1.1"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.14, ease: easeSnap }}
          />
          {/* chiton skirt — a fuller bell from hip to hem */}
          <motion.path
            d="M 148 354 C 137 374, 131 392, 131 410 M 152 352 C 161 372, 166 390, 167 408 M 131 410 Q 149 419 167 408"
            stroke={`rgba(${BONE}, 0.44)`}
            strokeWidth="1.15"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.26, ease: easeSnap }}
          />
          {/* drape folds falling through the skirt */}
          <motion.path
            d="M 145 362 C 141 378, 139 394, 139 408 M 152 360 C 152 376, 153 392, 154 407 M 158 364 C 160 378, 161 392, 161 405"
            stroke={`rgba(${BONE}, 0.17)`}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, delay: 0.38 }}
          />
          {/* legs — front knee driving into the lunge, back leg extended */}
          <motion.path
            d="M 155 409 C 162 420, 169 429, 173 440 L 176 456 M 141 410 C 133 424, 123 438, 112 450 L 104 457"
            stroke={`rgba(${BONE}, 0.55)`}
            strokeWidth="1.3"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: easeSnap }}
          />
          {/* quiver at the back, fletching showing over the shoulder */}
          <motion.path
            d="M 140 284 L 132 318 M 137 286 L 132 278 M 142 288 L 139 279 M 146 289 L 144 281"
            stroke={`rgba(${BONE}, 0.35)`}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.45 }}
          />
          {/* bow arm, level and extended to the grip */}
          <motion.path
            d="M 155 294 C 177 300, 203 308, 227 317"
            stroke={`rgba(${BONE}, 0.55)`}
            strokeWidth="1.3"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: easeSnap }}
          />
          {/* draw arm — elbow pulled high and back, hand anchored at the nock */}
          <motion.path
            d="M 157 293 C 170 296, 171 308, 161 316 L 156 319"
            stroke={`rgba(${BONE}, 0.55)`}
            strokeWidth="1.3"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.42, ease: easeSnap }}
          />
          {/* the recurve bow */}
          <motion.path
            d="M 205 245 Q 253 318 205 391"
            stroke={`rgba(${BONE}, 0.65)`}
            strokeWidth="1.3"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: easeSnap }}
          />
          {/* bowstring — taut strand of living code; snaps straight on release */}
          <motion.path
            d={stage === "drawing" ? "M 205 245 L 156 319 L 205 391" : "M 205 245 L 205 318 L 205 391"}
            stroke={`rgba(${TEAL}, 0.5)`}
            strokeWidth="0.9"
            vectorEffect="non-scaling-stroke"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.12 }}
          />
          {/* the nocked arrow, visible only while drawing */}
          <AnimatePresence>
            {stage === "drawing" && (
              <motion.path
                d="M 156 319 L 230 315"
                stroke={`rgba(${TEAL}, 0.8)`}
                strokeWidth="1.3"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.06 } }}
                transition={{ duration: 0.3, delay: 0.75 }}
              />
            )}
          </AnimatePresence>

          {/* 03 · the release — one beam, splitting into parallel agentic threads */}
          <motion.path
            d="M 156 319 Q 440 282 720 297"
            stroke={`rgb(${TEAL})`}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={drawn ? { pathLength: 1, opacity: [0, 1, 0.2] } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.7, ease: easeSnap }}
          />
          <motion.path
            d="M 180 315 Q 440 252 716 294"
            stroke={`rgba(${BONE}, 0.3)`}
            strokeWidth="0.8"
            strokeDasharray="3 5"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={drawn ? { pathLength: 1, opacity: [0, 0.7, 0] } : {}}
            transition={{ duration: 0.8, delay: 0.05 }}
          />
          <motion.path
            d="M 180 321 Q 440 330 716 300"
            stroke={`rgba(${TEAL}, 0.38)`}
            strokeWidth="0.8"
            strokeDasharray="3 5"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={drawn ? { pathLength: 1, opacity: [0, 0.7, 0] } : {}}
            transition={{ duration: 0.8, delay: 0.09 }}
          />
          <motion.path
            d="M 180 318 Q 440 295 716 297"
            stroke={`rgba(${TEAL}, 0.25)`}
            strokeWidth="0.7"
            strokeDasharray="2 7"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={drawn ? { pathLength: 1, opacity: [0, 0.6, 0] } : {}}
            transition={{ duration: 0.8, delay: 0.13 }}
          />
        </g>
      </svg>

      {/* micro-terminal tags near the nock (beat 02 · the draw) */}
      <div className="hidden lg:flex flex-col items-start gap-1.5 absolute top-[43%] left-[16.5%] pointer-events-none">
        <AnimatePresence>
          {drawn &&
            AGENT_STEPS.map((label, i) => (
              <motion.span
                key={`${run}-${label}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: [0, 0.75, 0.35], y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, delay: 0.1 + i * 0.14 }}
                className="font-mono text-[10px] tracking-[0.18em] text-[#2DD4BF] border border-[#2DD4BF]/20 bg-[#090A0B]/80 px-2 py-0.5 rounded-[3px]"
              >
                {label}
              </motion.span>
            ))}
        </AnimatePresence>
      </div>

      {/* the sub-thread pipeline calls, flashing once mid-flight */}
      <div className="hidden lg:flex gap-8 absolute top-[22%] left-[22%] pointer-events-none">
        <AnimatePresence>
          {stage === "flight" &&
            THREAD_CALLS.map((call, i) => (
              <motion.span
                key={`${run}-${call}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.6, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, delay: i * 0.08 }}
                className="font-mono text-[10px] tracking-widest text-[#F3EFE6]/70"
              >
                {call}
              </motion.span>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
