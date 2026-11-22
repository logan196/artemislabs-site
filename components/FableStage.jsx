"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Decode from "./Decode";

// ——————————————————————————————————————————————————————————————————————
// The Fable: "The Huntress & the Crystal of Twelve."
// Biological noise in the wild → precision aim → structured, living insight.
//
// One canvas carries the crystal (dodecahedron + internal DNA helix); one
// SVG overlay carries a faint classical monoline engraving (Artemis, bow,
// arrow, agentic sub-threads). The two layers share a coordinate frame:
// SVG viewBox 1440×900 stretched with preserveAspectRatio="none", so
// (720, 297) in the SVG is exactly (0.5·w, 0.33·h) on the canvas — the
// crystal's core, where the arrow lands.
//
// Palette is strictly three values (obsidian / bone / teal), kept quiet —
// the engraving is background texture, never louder than the product.
// ——————————————————————————————————————————————————————————————————————

const BONE = "243, 239, 230";
const TEAL = "45, 212, 191";

// the 20 vertices of the stack — carried over from the original dodecahedron
const LABELS = [
  "Visium", "Xenium", "CODEX", "CosMx", "Visium HD",
  "snRNA-seq", "snATAC-seq", "H&E", "BANKSY", "Leiden",
  "cell2location", "NMF niches", "IvyGAP", "Moran's I", "scVI",
  "UMAP", "Vitessce", "zarr", "Qwen3", "RAPIDS",
];

const AGENT_STEPS = ["INGEST · FASTQ/H5AD", "BANKSY · λ=0.2", "SUBAGENTS · 15 DOMAINS"];
// what the arrow IS — each word is dropped by the arrowhead as it passes,
// delays matched to the flight's hang-at-apex profile
const ARROW_MEANS = [
  { w: "LLM", x: 23.6, y: 16.2, d: 0.4 },
  { w: "DISCOVERY", x: 30.7, y: 14.1, d: 0.74 },
  { w: "ANALYSIS", x: 37.8, y: 16.4, d: 1.2 },
  { w: "HPC", x: 44.8, y: 22.8, d: 1.5 },
];

// beat timing (ms): construction 0→2.1s, release 2300, a 1.7s parabola that
// hangs at its apex, impact 4000, assembly 4.0→5.1s, copy reveals 5.4s+
const T_RELEASE = 2300;
const T_IMPACT = 4000;

// ——— the engraving, authored as data ———
// A full Attic-profile huntress: crown, Greek nose, chignon, peplos with
// belted overfold, striding legs in hunting boots, recurve bow at full draw.
// Each stroke is {d, a: alpha, w: width, t: delay} — she is drawn the way a
// pen plotter would draw her, and the construction scaffolding shows it.
const FIGURE = [
  // head
  { d: "M 188 246 C 183 231, 191 215, 206 211 C 212 209, 216 213, 217 218", a: 0.8, w: 1.35, t: 0.3 },
  { d: "M 190 242 C 193 232, 200 226, 209 222", a: 0.22, w: 1, t: 0.42 },
  { d: "M 176.5 241 a 6.5 6.5 0 1 0 13 0 a 6.5 6.5 0 1 0 -13 0", a: 0.68, w: 1.1, t: 0.38 },
  { d: "M 191 224 C 197 219, 205 215, 212 214", a: 0.28, w: 0.9, t: 0.5 },
  { d: "M 217 218 C 219 222, 221 227, 222 231 C 222 233, 219 234, 218 236 C 220 237.5, 220 240, 218 241 C 221 243, 220.5 247, 216 250 C 212 253, 206 252, 201 250", a: 0.8, w: 1.35, t: 0.46 },
  { d: "M 209 227 Q 212 225, 215 227", a: 0.4, w: 0.9, t: 0.62 },
  // neck, torso
  { d: "M 201 250 C 200.5 256, 200.5 262, 201 268 M 188 247 C 186.5 253, 186 259, 186.5 266", a: 0.7, w: 1.25, t: 0.62 },
  { d: "M 186 266 C 180 285, 179 309, 183 333 C 184 337, 185 340, 186 342", a: 0.8, w: 1.35, t: 0.7 },
  { d: "M 201 268 C 203 279, 209 287, 210 295 C 211 301, 206 309, 201 317 C 198.5 325, 197.5 333, 197.5 340", a: 0.8, w: 1.35, t: 0.74 },
  // belt + peplos overfold
  { d: "M 185 342 C 193 346, 201 345.5, 207 342 M 185.5 346 C 193 349.5, 200 349, 206 346", a: 0.45, w: 1, t: 0.86 },
  { d: "M 185 345 C 182.5 356, 183 365, 187 373 M 205 344 C 207.5 355, 207 363, 203.5 371 M 187 373 Q 192 379, 196.5 372.5 Q 200.5 378, 203.5 371", a: 0.22, w: 1, t: 0.92 },
  // skirt
  { d: "M 185 345 C 172 377, 166 404, 168.5 428", a: 0.6, w: 1.3, t: 0.98 },
  { d: "M 206 344 C 216.5 375, 220.5 402, 218 426", a: 0.6, w: 1.3, t: 1.0 },
  { d: "M 168.5 428 Q 181 437.5, 193 429.5 Q 206 437.5, 218 426", a: 0.5, w: 1.1, t: 1.08 },
  { d: "M 192.5 352 C 190.5 378, 190.5 403, 192.5 425 M 201.5 350 C 204.5 376, 205.5 401, 203.5 423", a: 0.22, w: 0.9, t: 1.12 },
  // legs — striding
  { d: "M 209 428 C 217 444, 224 457, 226.5 471 C 229.5 491, 229.5 510, 226.5 528 C 225.5 534, 226 540, 228 544 L 247 547", a: 0.8, w: 1.35, t: 1.12 },
  { d: "M 178 430 C 170 446, 163.5 460, 160.5 473 C 155.5 492, 150.5 510, 146.5 528 C 145.5 534, 144.5 540, 142.5 545 L 122.5 549", a: 0.8, w: 1.35, t: 1.18 },
  { d: "M 219.5 471 C 222.5 490, 221.5 508, 218.5 525 M 152.5 473 C 149.5 491, 144 508, 138 525", a: 0.22, w: 1, t: 1.3 },
  { d: "M 215.5 509 L 230.5 506 M 136 510 L 151 508", a: 0.4, w: 0.95, t: 1.38 },
  // bow arm (extended) + draw arm (full draw)
  { d: "M 196 272 C 215 276, 247 284, 277 292 C 293 296.5, 306.5 300, 316 302", a: 0.8, w: 1.35, t: 1.2 },
  { d: "M 200.5 284 C 223 289, 253 295.5, 282.5 301.5 C 294 304, 303.5 305.5, 311.5 306", a: 0.22, w: 1, t: 1.3 },
  { d: "M 312 299 C 318.5 299.5, 320.5 305, 315.5 308.5", a: 0.68, w: 1.05, t: 1.42 },
  // the recurve bow
  { d: "M 318 302 C 322.5 272, 318.5 236, 303.5 203 C 301.5 198.5, 303.5 194, 308.5 193", a: 0.82, w: 1.45, t: 1.5 },
  { d: "M 318 306 C 322.5 336, 318.5 372, 303.5 405 C 301.5 409.5, 303.5 414, 308.5 415", a: 0.82, w: 1.45, t: 1.58 },
  { d: "M 314.5 295.5 L 322 297.5 M 314.5 311 L 322 309", a: 0.4, w: 0.9, t: 1.7 },
];

// blueprint scaffolding — flashes while she is constructed, gone by release
const GUIDES = [
  { d: "M 196 198 L 196 554", t: 0.05 },
  { d: "M 110 264 L 430 264", t: 0.15 },
  { d: "M 196 304 a 110 110 0 1 0 220 0 a 110 110 0 1 0 -220 0", t: 0.25 },
  { d: "M 179 232 a 26 26 0 1 0 52 0 a 26 26 0 1 0 -52 0", t: 0.1 },
];

// construction nodes at the joints, with three live coordinate readouts
const NODES = [
  { x: 194, y: 273, t: 0.55, label: "shoulder · 194,273" },
  { x: 159, y: 267, t: 0.6 },
  { x: 206, y: 262, t: 0.72, label: "nock · 206,262" },
  { x: 318, y: 303, t: 0.78, label: "grip · 318,303" },
  { x: 306, y: 196, t: 0.88 },
  { x: 306, y: 413, t: 0.92 },
  { x: 196, y: 341, t: 0.48 },
  { x: 226, y: 471, t: 0.68 },
  { x: 160, y: 472, t: 0.74 },
];

// the crystal's blueprint — typed like a mermaid definition, then it
// compiles: on impact the whole block flies into the forming dodecahedron
const CODE_LINES = [
  { s: "const \u03c6 = (1 + Math.sqrt(5)) / 2;", t: 350 },
  { s: "verts = cube(\u00b11) \u222a rect(0, \u00b11/\u03c6, \u00b1\u03c6);  // 20", t: 800 },
  { s: "edges = pairs(dist == 2/\u03c6);           // 30", t: 1250 },
  { s: "faces = pentagons(verts);             // 12", t: 1700 },
  { s: "artemis.banksy(adata, lambda_=0.2)", t: 2150 },
  { s: "portal.write(adata, live=True)", t: 2600 },
];

// museum-placard intertitles — the story, told while the arrow flies
const CAPTIONS = [
  { text: "Raw data is a wilderness.", at: 0.3, hold: 1.1 },
  { text: "She strings the bow with living code.", at: 1.75, hold: 0.4 },
  { text: "One arrow: LLMs, analysis, HPC. Galvanizing discovery.", at: 2.8, hold: 1.55 },
  { text: "Structure \u2014 alive.", at: 5.35, hold: 2.3 },
];

const easeSnap = [0.16, 1, 0.3, 1];

export default function FableStage() {
  const canvasRef = useRef(null);
  const impactRef = useRef(null); // performance.now() of impact, null before
  const [stage, setStage] = useState("drawing"); // drawing | flight | impacted
  const [run, setRun] = useState(0); // bump to replay the fable
  const [inView, setInView] = useState(false);
  const [armed, setArmed] = useState(false); // first time the stage enters the viewport
  const reducedRef = useRef(false);
  const rootRef = useRef(null);

  // Only observe the stage. Canvas/rAF must not start at mount.
  // `armed` is one-way: leaving the viewport pauses rAF only, it does not
  // reset the beat or remount Framer/Decode timelines mid-play.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (ents) => {
        setInView(ents.some((e) => e.isIntersecting && e.intersectionRatio > 0));
      },
      { threshold: 0.05, rootMargin: "80px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (inView) setArmed(true);
  }, [inView]);

  // beat scheduler — starts on first intersection, replays when `run` bumps
  useEffect(() => {
    if (!armed) return;
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
  }, [run, armed]);

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

    const rot = { rx: 0.5, ry: 0.7, vx: 0, vy: 0 };
    const par = { tx: 0, ty: 0, x: 0, y: 0 };
    const drag = { on: false, x: 0, y: 0 };
    const hover = { i: -1 };
    let kicked = false; // impact spin kick applied once per run
    let pts = [];

    // the wilderness: each vertex has a scatter home it drifts around until
    // the arrow lands; dust motes and broken fragments fill the dark
    const scatter = verts.map(() => ({
      ox: (Math.random() - 0.5) * 0.62,
      oy: (Math.random() - 0.5) * 0.44,
      ph: Math.random() * Math.PI * 2,
    }));
    const dust = Array.from({ length: 110 }, () => ({
      ox: (Math.random() - 0.5) * 0.95,
      oy: (Math.random() - 0.5) * 0.6,
      ph: Math.random() * Math.PI * 2,
      r: 0.6 + Math.random() * 1.1,
    }));
    const frags = Array.from({ length: 15 }, () => [
      Math.floor(Math.random() * verts.length),
      Math.floor(Math.random() * verts.length),
    ]).filter(([a, b]) => a !== b);
    let bfs = null; // per-vertex cascade order, computed at the strike

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

      // 04 · impact — a single crystalline ring, nothing else on the ground
      if (since > 0 && since < 1.4) {
        const k = since / 1.4;
        ctx.beginPath();
        ctx.arc(cx, cy, since * S * 0.55, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${TEAL}, ${0.32 * (1 - k)})`;
        ctx.lineWidth = 1.1;
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
      const proj = verts.map(([x, y, z]) => {
        const y1 = y * cosx - z * sinx, z1 = y * sinx + z * cosx;
        const x2 = x * cosy + z1 * siny, z2 = -x * siny + z1 * cosy;
        const s = R * (3.4 / (3.4 + z2));
        return [cx + x2 * s, cy + y1 * s, z2];
      });

      // the strike cascades: BFS from the vertex nearest the arrow's entry,
      // each ring of neighbours flying home 110ms after the last
      if (since >= 0 && !bfs) {
        let hit = 0;
        for (let i = 1; i < proj.length; i++) if (proj[i][0] < proj[hit][0]) hit = i;
        const adj = new Map(verts.map((_, i) => [i, []]));
        for (const [i, j] of edges) { adj.get(i).push(j); adj.get(j).push(i); }
        const dist = new Array(verts.length).fill(Infinity);
        dist[hit] = 0;
        const q = [hit];
        while (q.length) {
          const v = q.shift();
          for (const n of adj.get(v)) if (dist[n] === Infinity) { dist[n] = dist[v] + 1; q.push(n); }
        }
        bfs = dist;
      }
      if (since < 0 && bfs) bfs = null; // salute replay re-scatters
      const ease3 = (u) => 1 - Math.pow(1 - u, 3);
      const asm = verts.map((_, i) => {
        if (since < 0 || !bfs) return 0;
        return ease3(Math.max(0, Math.min(1, (since - bfs[i] * 0.11 - (i % 3) * 0.02) / 0.5)));
      });
      const avgA = asm.reduce((a, b) => a + b, 0) / asm.length;
      pts = proj.map(([x, y, z], i) => {
        const a = asm[i];
        if (a >= 1) return [x, y, z];
        const sx = cx + scatter[i].ox * S + Math.sin(t * 0.7 + scatter[i].ph) * 9;
        const sy = cy + scatter[i].oy * S + Math.cos(t * 0.55 + scatter[i].ph) * 7;
        return [sx + (x - sx) * a, sy + (y - sy) * a, z * a];
      });

      // 01 · the wilderness — dust and broken fragments; no structure yet
      const wildA = reduced ? 0 : Math.max(0, 1 - Math.max(0, since) * 1.6);
      if (wildA > 0.02) {
        for (const m of dust) {
          const mx = cx + m.ox * S + Math.sin(t * 0.5 + m.ph) * 12;
          const my = cy + m.oy * S + Math.cos(t * 0.4 + m.ph) * 9;
          const tw = 0.5 + 0.5 * Math.sin(t * 1.3 + m.ph * 3);
          ctx.beginPath();
          ctx.arc(mx, my, m.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${BONE}, ${0.09 * tw * wildA})`;
          ctx.fill();
        }
        ctx.lineWidth = 0.7;
        for (const [i, j] of frags) {
          ctx.beginPath();
          ctx.moveTo(pts[i][0], pts[i][1]);
          ctx.lineTo(pts[j][0], pts[j][1]);
          ctx.strokeStyle = `rgba(${BONE}, ${0.055 * wildA * (0.6 + 0.4 * Math.sin(t + i))})`;
          ctx.stroke();
        }
      }

      // the strike — a 180ms white-hot bloom at the core
      if (since > 0 && since < 0.22 && !reduced) {
        const k = since / 0.22;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70);
        g.addColorStop(0, `rgba(255,255,255,${0.5 * (1 - k)})`);
        g.addColorStop(0.4, `rgba(${TEAL}, ${0.3 * (1 - k)})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(cx - 80, cy - 80, 160, 160);
      }

      // glassy faces, back to front — lighting up one by one on impact
      const faceOrder = faces
        .map((f, fi) => [f.reduce((acc, i) => acc + pts[i][2], 0) / 5, fi])
        .sort((a, b) => b[0] - a[0]);
      for (const [fz, fi] of faceOrder) {
        const f = faces[fi];
        const facing = 1 - (fz + 1.7) / 3.4;
        // a face exists only once its five vertices have flown home,
        // then ignites in sequence after the cascade settles
        const fa = Math.min(asm[f[0]], asm[f[1]], asm[f[2]], asm[f[3]], asm[f[4]]);
        if (fa < 0.03) continue;
        let lit = 0;
        if (since >= 0.9) {
          const local = since - 0.9 - fi * 0.06;
          if (local > 0) lit = Math.min(1, local * 2.2) * (0.35 + 0.65 * Math.exp(-local * 1.1));
        }
        ctx.beginPath();
        f.forEach((i, k) => (k ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1])));
        ctx.closePath();
        ctx.fillStyle = `rgba(${TEAL}, ${(0.012 + 0.028 * facing + 0.14 * lit * facing) * fa * fa})`;
        ctx.fill();
      }

      // edges — bone wireframe in the wild, teal once the shot lands
      for (const [i, j] of edges) {
        const ea = Math.min(asm[i], asm[j]);
        if (ea < 0.04) continue;
        const near = 1 - ((pts[i][2] + pts[j][2]) / 2 + 1.7) / 3.4;
        const hot = hover.i >= 0 && (i === hover.i || j === hover.i);
        const amp = (0.14 + 0.42 * near) * ea * ea;
        ctx.strokeStyle = hot ? `rgba(${TEAL}, 0.9)` : `rgba(${TEAL}, ${amp})`;
        ctx.lineWidth = hot ? 1.8 : 1.05;
        ctx.beginPath();
        ctx.moveTo(pts[i][0], pts[i][1]);
        ctx.lineTo(pts[j][0], pts[j][1]);
        ctx.stroke();
      }

      // signal carriers along the edges — the agents never stop running
      if (!reduced && since > 1.3) {
        const carrierA = Math.min(1, (since - 1.3) / 1);
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
      const helixSpeed = since < 0 ? 1.0 : 1.6 + 2.4 * Math.exp(-Math.max(0, since - 0.9) * 1.1);
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
      const helixA = (0.45 + 0.4 * settled) * avgA * avgA;
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
        const a = asm[i];
        const vcol = a > 0.5 ? TEAL : BONE;
        ctx.fillStyle = hot ? `rgb(${TEAL})` : `rgba(${vcol}, ${(0.3 + 0.55 * near) * (0.4 + 0.6 * a)})`;
        ctx.fill();
      }
      if (hover.i >= 0) chip(hover.i, 1);

      if (running) raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running) return;
      running = true;
      lastNow = performance.now();
      draw(lastNow); // size the backing store immediately (avoid 300×150 first paint)
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

    const io = new IntersectionObserver(
      (ents) => {
        const on = ents.some((e) => e.isIntersecting && e.intersectionRatio > 0);
        if (on) {
          if (reduced) draw(performance.now());
          else start();
        } else {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.05, rootMargin: "80px 0px" }
    );
    io.observe(canvas);

    return () => {
      io.disconnect();
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
    <div ref={rootRef} className="absolute inset-0" aria-hidden>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full select-none"
        style={{ touchAction: "pan-y" }}
      />

      {armed && <>
      {/* the engraving — Artemis constructed stroke by stroke, like a plotter */}
      <svg
        key={run}
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
        fill="none"
      >
        <defs>
          <filter id="fable-headglow" x="-250%" y="-250%" width="600%" height="600%">
            <feGaussianBlur stdDeviation="2.6" />
          </filter>
        </defs>
        <g strokeLinecap="round" strokeLinejoin="round">
          {/* line of action: the whole tableau leans 6° into the shot and
              stands 1.15× — pose first, ornament second */}
          <motion.g
            transform="translate(-34.5 -57) scale(1.15)"
            animate={{ opacity: stage === "flight" ? 0.3 : 1 }}
            transition={{ duration: 0.45 }}
          >
          <g transform="rotate(6 196 345)">
          {/* blueprint scaffolding — flashes during construction, gone by release */}
          {GUIDES.map((g, i) => (
            <motion.path
              key={`g${i}`}
              d={g.d}
              stroke={`rgba(${BONE}, 0.14)`}
              strokeWidth="0.8"
              strokeDasharray="2 6"
              vectorEffect="non-scaling-stroke"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.1, delay: g.t, times: [0, 0.15, 0.75, 1] }}
            />
          ))}

          {/* construction nodes at her joints */}
          {NODES.map((n, i) => (
            <motion.rect
              key={`n${i}`}
              x={n.x - 1.4}
              y={n.y - 1.4}
              width="2.8"
              height="2.8"
              fill={`rgba(${TEAL}, 0.75)`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.2 - n.t, delay: n.t, times: [0, 0.1, 0.8, 1] }}
            />
          ))}
          {NODES.filter((n) => n.label).map((n, i) => (
            <motion.text
              key={`nl${i}`}
              x={n.x + 7}
              y={n.y - 5}
              fill={`rgba(${BONE}, 0.38)`}
              style={{ font: "500 9px 'JetBrains Mono', ui-monospace, monospace", letterSpacing: "0.04em" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.2 - n.t, delay: n.t + 0.1, times: [0, 0.15, 0.75, 1] }}
            >
              {n.label}
            </motion.text>
          ))}

          {/* the huntress — every stroke draws on in sequence */}
          {FIGURE.map((p, i) => (
            <motion.path
              key={`f${i}`}
              d={p.d}
              stroke={`rgba(${BONE}, ${p.a})`}
              strokeWidth={p.w}
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.45, delay: p.t, ease: easeSnap }}
            />
          ))}

          {/* draw arm at full draw — elbow high and back, hand at the jaw */}
          <motion.path
            d="M 193 270 C 180 262, 168 261, 159 267 C 166 273, 186 268, 204 262 M 202 258 C 207 257.5, 210 260, 207.5 264.5"
            stroke={`rgba(${BONE}, 0.8)`}
            strokeWidth="1.35"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: stage === "drawing" ? 1 : 0 }}
            transition={{
              pathLength: { duration: 0.45, delay: 1.34, ease: easeSnap },
              opacity: stage === "drawing" ? { duration: 0.45, delay: 1.34 } : { duration: 0.1 },
            }}
          />
          {/* follow-through — the hand releases back past the cheek */}
          <motion.path
            d="M 193 270 C 183 261, 173 257, 165 257 C 159 258, 155 262, 154 268"
            stroke={`rgba(${BONE}, 0.8)`}
            strokeWidth="1.35"
            vectorEffect="non-scaling-stroke"
            initial={{ opacity: 0 }}
            animate={{ opacity: stage === "drawing" ? 0 : 1 }}
            transition={{ duration: 0.18, delay: stage === "drawing" ? 0 : 0.12 }}
          />
          {/* bowstring — a taut strand of code; overshoots and rings on release */}
          <motion.path
            d="M 306.5 196 L 206 262 L 306.5 412"
            stroke={`rgba(${TEAL}, 0.55)`}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            initial={{ opacity: 0 }}
            animate={
              stage === "drawing"
                ? { opacity: 1, d: "M 306.5 196 L 206 262 L 306.5 412" }
                : {
                    opacity: 1,
                    d: [
                      "M 306.5 196 L 206 262 L 306.5 412",
                      "M 306.5 196 L 316 304 L 306.5 412",
                      "M 306.5 196 L 302 304 L 306.5 412",
                      "M 306.5 196 L 308.5 304 L 306.5 412",
                      "M 306.5 196 L 306.5 304 L 306.5 412",
                    ],
                  }
            }
            transition={
              stage === "drawing"
                ? { opacity: { duration: 0.12, delay: 1.72 } }
                : { d: { duration: 0.34, times: [0, 0.22, 0.5, 0.78, 1], ease: "easeOut" } }
            }
          />
          {/* the nocked arrow, visible only at full draw */}
          <AnimatePresence>
            {stage === "drawing" && (
              <motion.g
                initial={{ y: 0 }}
                animate={{ y: [0, -1, 0.6, 0] }}
                transition={{ repeat: Infinity, duration: 1.1, delay: 1.95 }}
                exit={{ opacity: 0, transition: { duration: 0.06 } }}
              >
                <motion.path
                  d="M 206 262 L 332 266 M 210 257.5 L 219 262 M 210 266.5 L 219 263"
                  stroke={`rgba(${TEAL}, 0.75)`}
                  strokeWidth="1.3"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.82 }}
                />
              </motion.g>
            )}
          </AnimatePresence>

          {/* close the pose group — the shot itself flies in stage space */}
          </g>
          </motion.g>

          {/* the release — one long dramatic parabola, left as a faint trace */}
          <motion.path
            d="M 212 246 Q 470 40 720 297"
            stroke={`rgb(${TEAL})`}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={drawn ? { pathLength: [0, 0.48, 0.58, 1], opacity: [0, 0.9, 0.2] } : { pathLength: 0, opacity: 0 }}
            transition={{
              pathLength: { duration: 1.7, times: [0, 0.42, 0.62, 1], ease: "linear" },
              opacity: { duration: 3, times: [0, 0.4, 1] },
            }}
          />
          {drawn && (
            <motion.g
              initial={{ offsetDistance: "0%", opacity: 0 }}
              animate={{ offsetDistance: ["0%", "48%", "58%", "100%"], opacity: [0, 1, 1, 0] }}
              transition={{
                offsetDistance: { duration: 1.7, times: [0, 0.42, 0.62, 1], ease: "linear" },
                opacity: { duration: 1.75, times: [0, 0.04, 0.92, 1] },
              }}
              style={{ offsetPath: 'path("M 212 246 Q 470 40 720 297")', offsetRotate: "auto" }}
            >
              <path
                d="M -22 0 L 0 0 M 0 0 L -7 -3.6 M 0 0 L -7 3.6"
                stroke={`rgb(${TEAL})`}
                strokeWidth="5"
                strokeLinecap="round"
                filter="url(#fable-headglow)"
                opacity="0.55"
              />
              <path
                d="M -22 0 L 0 0 M 0 0 L -7 -3.6 M 0 0 L -7 3.6"
                stroke={`rgb(${TEAL})`}
                strokeWidth="2.4"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <circle cx="1.5" cy="0" r="2.4" fill="#F3EFE6" opacity="0.9" />
            </motion.g>
          )}
          <motion.path
            d="M 238 248 Q 475 20 716 293"
            stroke={`rgba(${BONE}, 0.3)`}
            strokeWidth="0.8"
            strokeDasharray="3 5"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={drawn ? { pathLength: 1, opacity: [0, 0.7, 0] } : {}}
            transition={{ duration: 1.7, delay: 0.06 }}
          />
          <motion.path
            d="M 238 252 Q 475 95 716 301"
            stroke={`rgba(${TEAL}, 0.38)`}
            strokeWidth="0.8"
            strokeDasharray="3 5"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={drawn ? { pathLength: 1, opacity: [0, 0.7, 0] } : {}}
            transition={{ duration: 1.7, delay: 0.12 }}
          />
          <motion.path
            d="M 238 250 Q 475 58 716 297"
            stroke={`rgba(${TEAL}, 0.25)`}
            strokeWidth="0.7"
            strokeDasharray="2 7"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={drawn ? { pathLength: 1, opacity: [0, 0.6, 0] } : {}}
            transition={{ duration: 1.7, delay: 0.18 }}
          />
        </g>
      </svg>

      {/* the crystal's blueprint, typed beside it — then it compiles:
          on impact the whole block flies into the forming dodecahedron */}
      <div className="hidden lg:block absolute right-[7%] top-[20%] w-[330px] pointer-events-none text-left">
        <motion.div
          key={`code-${run}`}
          initial={{ opacity: 0, x: 0, y: 0, scale: 1 }}
          animate={
            stage === "impacted"
              ? { opacity: 0, x: -370, y: 70, scale: 0.45 }
              : stage === "flight"
                ? { opacity: 0.28, x: 0, y: 0, scale: 1 }
                : { opacity: [0, 0.62, 0.62], x: 0, y: 0, scale: 1 }
          }
          transition={
            stage === "impacted"
              ? { duration: 0.9, delay: 0.1, ease: easeSnap }
              : stage === "flight"
                ? { duration: 0.45 }
                : { duration: 2.5, times: [0, 0.3, 1] }
          }
          className="font-mono text-[10.5px] leading-[1.9] text-[#F3EFE6]/60"
        >
          <p className="text-[#F3EFE6]/30 mb-1">{"// the crystal of twelve"}</p>
          {CODE_LINES.map((l) => (
            <p key={l.s} className="whitespace-nowrap">
              <span className="text-[#2DD4BF]/70">▸ </span>
              <Decode text={l.s} delay={l.t} speed={13} />
            </p>
          ))}
        </motion.div>
      </div>

      {/* the name at the heart of the crystal */}
      <div className="hidden md:block absolute left-1/2 top-[33%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.p
          key={`core-${run}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, delay: 5.4 }}
          className="font-mono text-[11.5px] tracking-[0.34em] uppercase text-[#2DD4BF] whitespace-nowrap"
          style={{ textShadow: "0 0 18px rgba(45,212,191,0.45)" }}
        >
          <Decode text="BIOINFORMATICS, REIMAGINED" delay={5500} />
        </motion.p>
      </div>

      {/* micro-terminal tags at the nock (beat 02 · the draw) */}
      <div className="hidden lg:flex flex-col items-start gap-1.5 absolute top-[38%] left-[18.5%] pointer-events-none">
        <AnimatePresence>
          {drawn &&
            AGENT_STEPS.map((label, i) => (
              <motion.span
                key={`${run}-${label}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: [0, 0.7, 0], y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.2, delay: 0.1 + i * 0.14, times: [0, 0.25, 1] }}
                className="font-mono text-[10px] tracking-[0.18em] text-[#2DD4BF] border border-[#2DD4BF]/20 bg-[#090A0B]/80 px-2 py-0.5 rounded-[3px]"
              >
                {label}
              </motion.span>
            ))}
        </AnimatePresence>
      </div>

      {/* what the arrow IS — each word ignites as the arrowhead passes it */}
      <AnimatePresence>
        {drawn &&
          ARROW_MEANS.map((m) => (
            <motion.span
              key={`${run}-${m.w}`}
              initial={{ opacity: 0, y: 7, scale: 0.7 }}
              animate={{ opacity: [0, 1, 1, 0], y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3.4, delay: m.d, times: [0, 0.06, 0.72, 1], scale: { duration: 0.3, delay: m.d } }}
              className="hidden lg:block absolute font-mono text-[13px] tracking-[0.3em] text-[#2DD4BF] pointer-events-none"
              style={{ left: `${m.x}%`, top: `${m.y}%`, textShadow: "0 0 16px rgba(45,212,191,0.7)" }}
            >
              {m.w}
            </motion.span>
          ))}
      </AnimatePresence>

      {/* museum placard — the story, told while the arrow flies */}
      <div className="hidden lg:block absolute left-[6.5%] top-[64%] w-[280px] h-16 pointer-events-none text-left">
        <div className="w-10 border-t border-[#F3EFE6]/20 mb-3" />
        {CAPTIONS.map((c, i) => (
          <motion.p
            key={`${run}-cap${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0], y: [4, 0, 0, -3] }}
            transition={{ duration: c.hold + 0.8, delay: c.at, times: [0, 0.18, 0.8, 1] }}
            className="absolute top-5 left-0 right-0 text-[13.5px] italic leading-snug text-[#F3EFE6]/70"
            style={{ fontFamily: "'New York', ui-serif, Georgia, 'Times New Roman', serif" }}
          >
            <span className="not-italic font-mono text-[9px] tracking-[0.25em] text-[#2DD4BF]/80 mr-2">
              {["I", "II", "III", "IV"][i]}
            </span>
            {c.text}
          </motion.p>
        ))}
      </div>
      </>}
    </div>
  );
}
