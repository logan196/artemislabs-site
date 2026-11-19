"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// The hero centerpiece: the dodecahedron spins until Artemis' arrow strikes it
// ("artemis-impact"), then it shatters into 1,775 real GBM3 cells (Ren et al.
// 2023, GSE194329) that live on as a breathing point cloud, morphing between
// the tissue coordinates and four UMAP embeddings. A floating HUD exposes the
// data like a portal: domain channel-pills, color-by-gene, embedding advance.

const DATA_URL = "plots/umap_params.json";
const MORPH_MS = 1700;
const HOLD_MS = 3600;
const SETTLE_MS = 1100; // per-point tween from shard to first embedding

// Okabe-Ito's black slot is invisible on the obsidian ground — swap it for the
// reddish-purple slot so all seven domains stay CVD-distinguishable.
const DARK_SAFE = { "#1c1a15": "#CC79A7" };

const easeOutCubic = (u) => 1 - Math.pow(1 - u, 3);
const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

function expressionColor(v) {
  // dim slate → teal → amber ramp for gene expression
  const stops = [
    [30, 41, 59],
    [20, 184, 166],
    [245, 158, 11],
  ];
  const t = Math.max(0, Math.min(1, v)) * 2;
  const i = t < 1 ? 0 : 1;
  const f = t - i;
  const a = stops[i], b = stops[i + 1];
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`;
}

export default function HeroGenesis({ size = 400 }) {
  const canvasRef = useRef(null);
  const S = useRef({
    mode: "solid",
    data: null,
    hidden: new Set(),
    colorBy: "domain",
    setting: 1, // start on a UMAP embedding; tissue arrives in the cycle
    morph: null,
    holdUntil: 0,
    shards: [],
    points: [],
    impact: { vx: 0, vy: -1, t: -1e9 },
    hover: -1,
    reduced: false,
    redraw: () => {},
  }).current;
  const [phase, setPhase] = useState("solid");
  const [hud, setHud] = useState({ setting: 1, hidden: [], colorBy: "domain" });
  const [data, setData] = useState(null);

  const { verts, edges, faces } = useMemo(() => {
    const phi = (1 + Math.sqrt(5)) / 2;
    const a = 1, b = 1 / phi;
    const verts = [];
    for (const x of [-a, a]) for (const y of [-a, a]) for (const z of [-a, a]) verts.push([x, y, z]);
    for (const s of [-1, 1]) for (const t of [-1, 1]) {
      verts.push([0, s * b, t * phi]);
      verts.push([s * b, t * phi, 0]);
      verts.push([s * phi, 0, t * b]);
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
      const ref = Math.abs(cn[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
      const u = [cn[1] * ref[2] - cn[2] * ref[1], cn[2] * ref[0] - cn[0] * ref[2], cn[0] * ref[1] - cn[1] * ref[0]];
      const ul = Math.hypot(...u);
      const un = u.map((v) => v / ul);
      const wn = [cn[1] * un[2] - cn[2] * un[1], cn[2] * un[0] - cn[0] * un[2], cn[0] * un[1] - cn[1] * un[0]];
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

  useEffect(() => {
    fetch(DATA_URL)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        d.palette = d.palette.map((c) => DARK_SAFE[c] ?? c);
        for (const g of Object.keys(d.markers)) {
          const m = d.markers[g];
          const max = Math.max(...m) || 1;
          d.markers[g] = m.map((v) => v / max);
        }
        S.data = d;
        setData(d);
      })
      .catch(() => {});
  }, [S]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    S.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = false;
    let lastNow = 0;
    const rot = { rx: 0.5, ry: 0.7 };
    let pts = [];

    const box = () => {
      const w = canvas.clientWidth || size;
      const h = canvas.clientHeight || size;
      const side = Math.min(w, h) - 86;
      return { w, h, x0: (w - side) / 2, y0: (h - side) / 2 - 8, side };
    };

    const settingPos = (si, i) => {
      const { x0, y0, side } = box();
      const s = S.data.settings[si];
      return [x0 + s.x[i] * side, y0 + (1 - s.y[i]) * side];
    };

    const pointColor = (i) => {
      const d = S.data;
      if (S.colorBy === "domain") return d.palette[d.labels[i]];
      return expressionColor(d.markers[S.colorBy][i]);
    };

    const beginShatter = () => {
      if (S.mode !== "solid") return;
      S.mode = "shatter";
      const now = performance.now();
      S.impact.t = now;
      const { w, h } = box();
      const cx = w / 2, cy = h / 2;
      S.shards = edges.map(([i, j]) => {
        const mx = (pts[i][0] + pts[j][0]) / 2, my = (pts[i][1] + pts[j][1]) / 2;
        const or_ = Math.hypot(mx - cx, my - cy) || 1;
        const k = 0.09 + Math.random() * 0.1;
        return {
          x1: pts[i][0], y1: pts[i][1], x2: pts[j][0], y2: pts[j][1],
          vx: ((mx - cx) / or_) * or_ * 0.004 + S.impact.vx * k * 60,
          vy: ((my - cy) / or_) * or_ * 0.004 + S.impact.vy * k * 60,
          vr: (Math.random() - 0.5) * 0.12,
          rot: 0, alpha: 0.9,
        };
      });
      if (S.data) {
        S.points = S.data.labels.map((lab, i) => {
          const v = pts[i % pts.length];
          return {
            sx: v[0] + (Math.random() - 0.5) * 14,
            sy: v[1] + (Math.random() - 0.5) * 14,
            t0: now + 120 + i * 0.35,
          };
        });
        S.setting = 1;
        S.morph = null;
        S.holdUntil = now + SETTLE_MS + 900 + HOLD_MS;
        setHud((p) => ({ ...p, setting: 1 }));
        setTimeout(() => setPhase("cloud"), S.reduced ? 0 : SETTLE_MS + 700);
        if (S.reduced) {
          S.mode = "cloud";
          S.shards = [];
        }
      } else {
        // data unavailable: let the shards fly, then the solid re-forms
        setTimeout(() => { S.mode = "solid"; start(); }, 1200);
      }
      start();
    };

    const onImpact = (e) => {
      S.impact.vx = e.detail?.vx ?? 0;
      S.impact.vy = e.detail?.vy ?? -1;
      beginShatter();
    };
    const onSalute = () => {
      S.mode = "solid";
      S.shards = [];
      S.points = [];
      S.hover = -1;
      setPhase("solid");
      start();
    };

    const draw = (now) => {
      const { w, h } = box();
      if (canvas.width !== Math.round(w * dpr)) { canvas.width = w * dpr; canvas.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const t = now / 1000;
      const dt = Math.min(50, Math.max(0, now - lastNow));
      lastNow = now;

      if (S.mode === "solid" || S.mode === "shatter") {
        if (S.mode === "solid" && !S.reduced) {
          rot.rx += 0.14 * (dt / 1000);
          rot.ry += 0.1 * (dt / 1000);
        }
        const cosx = Math.cos(rot.rx), sinx = Math.sin(rot.rx);
        const cosy = Math.cos(rot.ry), siny = Math.sin(rot.ry);
        const R = Math.min(w, h) * 0.3;
        pts = verts.map(([x, y, z]) => {
          const y1 = y * cosx - z * sinx, z1 = y * sinx + z * cosx;
          const x2 = x * cosy + z1 * siny, z2 = -x * siny + z1 * cosy;
          const s = R * (3.4 / (3.4 + z2));
          return [w / 2 + x2 * s, h / 2 + y1 * s, z2];
        });
      }

      if (S.mode === "solid") {
        const faceOrder = faces
          .map((f, fi) => [f.reduce((acc, i) => acc + pts[i][2], 0) / 5, fi])
          .sort((a, b) => b[0] - a[0]);
        for (const [fz, fi] of faceOrder) {
          const f = faces[fi];
          const facing = 1 - (fz + 1.7) / 3.4;
          ctx.beginPath();
          f.forEach((i, k) => (k ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1])));
          ctx.closePath();
          ctx.fillStyle = `rgba(20, 184, 166, ${0.015 + 0.045 * facing})`;
          ctx.fill();
        }
        for (const [i, j] of edges) {
          const near = 1 - ((pts[i][2] + pts[j][2]) / 2 + 1.7) / 3.4;
          ctx.strokeStyle = `rgba(20, 184, 166, ${0.14 + 0.45 * near})`;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(pts[i][0], pts[i][1]);
          ctx.lineTo(pts[j][0], pts[j][1]);
          ctx.stroke();
        }
        for (const [x, y, z] of pts) {
          const near = 1 - (z + 1.7) / 3.4;
          ctx.beginPath();
          ctx.arc(x, y, 2.4 + 1.6 * near, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(20, 184, 166, ${0.35 + 0.6 * near})`;
          ctx.fill();
        }
        if (!S.reduced && running) raf = requestAnimationFrame(draw);
        return;
      }

      // ——— shards ———
      if (S.shards.length) {
        let alive = false;
        for (const s of S.shards) {
          s.x1 += s.vx * dt * 0.06; s.y1 += s.vy * dt * 0.06;
          s.x2 += s.vx * dt * 0.06; s.y2 += s.vy * dt * 0.06;
          const mx = (s.x1 + s.x2) / 2, my = (s.y1 + s.y2) / 2;
          s.rot += s.vr;
          s.alpha *= 0.968;
          if (s.alpha > 0.02) alive = true;
          const dx = (s.x2 - s.x1) / 2, dy = (s.y2 - s.y1) / 2;
          const c = Math.cos(s.rot), sn = Math.sin(s.rot);
          ctx.strokeStyle = `rgba(20, 184, 166, ${s.alpha.toFixed(3)})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(mx - dx * c + dy * sn, my - dy * c - dx * sn);
          ctx.lineTo(mx + dx * c - dy * sn, my + dy * c + dx * sn);
          ctx.stroke();
        }
        if (!alive) S.shards = [];
      }

      // ——— the living cloud ———
      if (S.data && S.points.length) {
        const d = S.data;
        if (S.mode === "shatter" && now > (S.points[0]?.t0 ?? 0) + SETTLE_MS + 600) S.mode = "cloud";

        // embedding cycle: hold, then morph to the next setting (paused on hover)
        if (S.mode === "cloud" && !S.reduced) {
          if (S.hover >= 0) S.holdUntil = Math.max(S.holdUntil, now + 1400);
          if (!S.morph && now > S.holdUntil) {
            const next = (S.setting + 1) % d.settings.length;
            S.morph = { from: S.setting, to: next, t0: now };
            S.setting = next;
            setHud((p) => ({ ...p, setting: next }));
          }
          if (S.morph && now > S.morph.t0 + MORPH_MS) {
            S.morph = null;
            S.holdUntil = now + HOLD_MS;
          }
        }

        const n = d.labels.length;
        let nearest = -1, nearD = 16 * 16;
        const mx = S.mx ?? -1e9, my = S.my ?? -1e9;
        for (let i = 0; i < n; i++) {
          const p = S.points[i];
          let x, y;
          if (S.reduced) {
            [x, y] = settingPos(S.setting, i);
          } else if (now < p.t0) {
            x = p.sx; y = p.sy;
          } else if (now < p.t0 + SETTLE_MS) {
            const u = easeOutCubic((now - p.t0) / SETTLE_MS);
            const [tx, ty] = settingPos(S.setting, i);
            x = p.sx + (tx - p.sx) * u;
            y = p.sy + (ty - p.sy) * u;
          } else if (S.morph) {
            const u = easeInOut(Math.min(1, (now - S.morph.t0) / MORPH_MS));
            const [ax, ay] = settingPos(S.morph.from, i);
            const [bx, by] = settingPos(S.morph.to, i);
            x = ax + (bx - ax) * u;
            y = ay + (by - ay) * u;
          } else {
            [x, y] = settingPos(S.setting, i);
          }
          if (!S.reduced && S.mode === "cloud" && !S.morph) {
            x += Math.sin(t * 0.6 + i * 1.7) * 1.3;
            y += Math.cos(t * 0.5 + i * 2.3) * 1.3;
          }
          p.x = x; p.y = y;
          const hiddenDom = S.hidden.has(d.labels[i]);
          if (!hiddenDom) {
            const dd = (x - mx) * (x - mx) + (y - my) * (y - my);
            if (dd < nearD) { nearD = dd; nearest = i; }
          }
        }
        S.hover = nearest;

        for (let i = 0; i < n; i++) {
          const p = S.points[i];
          const hiddenDom = S.hidden.has(d.labels[i]);
          ctx.globalAlpha = hiddenDom ? 0.05 : 0.85;
          ctx.fillStyle = pointColor(i);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.1, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        if (nearest >= 0 && S.mode === "cloud") {
          const p = S.points[nearest];
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6.5, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(248,250,252,0.9)";
          ctx.lineWidth = 1.3;
          ctx.stroke();
          const dom = d.domains[d.labels[nearest]];
          const extra = S.colorBy !== "domain" ? ` · ${S.colorBy} ${(d.markers[S.colorBy][nearest]).toFixed(2)}` : "";
          const label = `${dom}${extra}`;
          ctx.font = "600 11px 'JetBrains Mono', ui-monospace, monospace";
          const tw = ctx.measureText(label).width;
          const lx = Math.min(Math.max(8, p.x + 10), w - tw - 14);
          const ly = Math.max(16, p.y - 12);
          ctx.fillStyle = "rgba(7,6,11,0.82)";
          ctx.strokeStyle = "rgba(255,255,255,0.18)";
          ctx.beginPath();
          ctx.roundRect(lx - 5, ly - 11, tw + 10, 17, 3);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = d.palette[d.labels[nearest]];
          ctx.fillText(label, lx, ly + 2);
        }

        ctx.font = "500 10.5px 'JetBrains Mono', ui-monospace, monospace";
        ctx.fillStyle = "rgba(148,163,184,0.75)";
        ctx.textAlign = "center";
        ctx.fillText("GBM3 · 1,775 cells · BANKSY domains · Ren et al. 2023", w / 2, h - 6);
        ctx.textAlign = "left";
      }

      if (running && !(S.reduced && S.mode === "cloud")) raf = requestAnimationFrame(draw);
      else running = false;
    };

    const start = () => {
      if (running) return;
      running = true;
      lastNow = performance.now();
      raf = requestAnimationFrame(draw);
    };
    S.redraw = () => {
      if (S.reduced) draw(performance.now());
      else start();
    };

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      S.mx = e.clientX - r.left;
      S.my = e.clientY - r.top;
      if (S.reduced && S.mode === "cloud") draw(performance.now());
    };
    const onLeave = () => {
      S.mx = -1e9; S.my = -1e9; S.hover = -1;
      if (S.reduced && S.mode === "cloud") draw(performance.now());
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    window.addEventListener("artemis-impact", onImpact);
    window.addEventListener("artemis-salute", onSalute);
    if (S.reduced) draw(performance.now());
    else start();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("artemis-impact", onImpact);
      window.removeEventListener("artemis-salute", onSalute);
    };
  }, [S, verts, edges, faces, size]);

  const settingLabel = (d, i) => {
    const s = d.settings[i];
    return s.id === "tissue" ? "tissue coordinates" : `UMAP · min_dist ${s.min_dist}`;
  };
  const advance = () => {
    if (!S.data) return;
    const next = (S.setting + 1) % S.data.settings.length;
    S.morph = S.reduced ? null : { from: S.setting, to: next, t0: performance.now() };
    S.setting = next;
    S.holdUntil = performance.now() + MORPH_MS + HOLD_MS;
    setHud((p) => ({ ...p, setting: next }));
    S.redraw();
  };
  const toggleDomain = (i) => {
    if (S.hidden.has(i)) S.hidden.delete(i);
    else S.hidden.add(i);
    setHud((p) => ({ ...p, hidden: [...S.hidden] }));
    S.redraw();
  };
  const setColorBy = (k) => {
    S.colorBy = k;
    setHud((p) => ({ ...p, colorBy: k }));
    S.redraw();
  };

  const pill =
    "pointer-events-auto rounded-full border px-2.5 py-1 font-mono text-[10.5px] leading-none backdrop-blur-md transition-colors cursor-pointer select-none";

  return (
    <div className="relative" style={{ height: size }}>
      <canvas
        id="genesis-canvas"
        ref={canvasRef}
        style={{ width: "100%", height: size, touchAction: "pan-y" }}
        className="select-none"
        role="img"
        aria-label="Living point cloud of 1,775 glioblastoma cells from Ren et al. 2023, morphing between tissue coordinates and UMAP embeddings. Before the intro completes it is a wireframe dodecahedron struck by an arrow."
      />
      {phase === "cloud" && data && (
        <>
          <button
            onClick={advance}
            title="Advance to the next embedding"
            className={`${pill} absolute top-1 right-1 border-white/15 bg-white/[0.04] text-dim hover:text-snow hover:border-violet`}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet animate-pulse mr-1.5 align-middle" aria-hidden />
            {settingLabel(data, hud.setting)} →
          </button>
          <div className="absolute top-1 left-1 flex gap-1.5">
            {["domain", ...Object.keys(data.markers)].map((k) => (
              <button
                key={k}
                onClick={() => setColorBy(k)}
                className={`${pill} ${
                  hud.colorBy === k
                    ? "border-violet/70 bg-violet/15 text-snow"
                    : "border-white/15 bg-white/[0.04] text-dim hover:text-snow"
                }`}
              >
                {k === "domain" ? "domains" : k}
              </button>
            ))}
          </div>
          <div className="absolute bottom-6 left-1 right-1 flex flex-wrap gap-1.5 justify-center">
            {data.domains.map((name, i) => {
              const off = hud.hidden.includes(i);
              return (
                <button
                  key={name}
                  onClick={() => toggleDomain(i)}
                  aria-pressed={!off}
                  className={`${pill} ${
                    off ? "border-white/10 bg-transparent text-dim/50" : "border-white/15 bg-white/[0.05] text-snow/90"
                  }`}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full mr-1.5 align-middle"
                    style={{ background: data.palette[i], opacity: off ? 0.25 : 1 }}
                    aria-hidden
                  />
                  {name} · {data.domain_counts[i]}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
