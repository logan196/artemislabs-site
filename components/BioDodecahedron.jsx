"use client";

import { useEffect, useMemo, useRef } from "react";

// The dodecahedron of bioinformatics: 20 vertices = 20 pieces of the stack,
// 30 edges = the connections between them. Rotating 3D wireframe on paper.
// Interactive: drag to spin (with momentum), hover a vertex for its label.
const LABELS = [
  "Visium", "Xenium", "CODEX", "CosMx", "Visium HD",
  "snRNA-seq", "snATAC", "H&E", "BANKSY", "Leiden",
  "cell2location", "NMF niches", "IvyGAP", "Moran's I", "DE",
  "UMAP", "Vitessce", "zarr", "Qwen3", "GPU",
];

export default function BioDodecahedron({ size = 460, labels = true, helix = false }) {
  const ref = useRef(null);

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
    // 12 pentagonal faces: centers are the dual icosahedron's vertex directions;
    // each face = the 5 dodeca vertices nearest that direction, ordered by angle.
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
      // in-plane basis to order the ring
      const ref = Math.abs(cn[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
      const u = [
        cn[1] * ref[2] - cn[2] * ref[1],
        cn[2] * ref[0] - cn[0] * ref[2],
        cn[0] * ref[1] - cn[1] * ref[0],
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

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = false;

    // interaction state — all outside React
    const rot = { rx: 0.5, ry: 0.7, vx: 0, vy: 0 };
    const par = { tx: 0, ty: 0, x: 0, y: 0 }; // parallax target + eased value
    const drag = { on: false, x: 0, y: 0 };
    const hover = { i: -1 };
    let interacted = false;
    let hintA = reduced ? 0 : 1; // "drag to spin" cue, fades after first touch
    let lastNow = 0;
    let pts = [];

    const draw = (now) => {
      const w = canvas.clientWidth || size;
      const h = canvas.clientHeight || size;
      if (canvas.width !== Math.round(w * dpr)) { canvas.width = w * dpr; canvas.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const t = now / 1000;
      const dt = Math.min(50, Math.max(0, now - lastNow));
      lastNow = now;

      // auto-spin unless the user is holding it; momentum always applies
      if (!drag.on) {
        if (!reduced) {
          rot.rx += 0.14 * (dt / 1000);
          rot.ry += 0.1 * (dt / 1000);
        }
        rot.rx += rot.vx;
        rot.ry += rot.vy;
        rot.vx *= 0.94;
        rot.vy *= 0.94;
      }
      // ease the cursor-parallax tilt (max ~0.1 rad), zero while dragging
      par.x += ((drag.on ? 0 : par.tx) - par.x) * 0.06;
      par.y += ((drag.on ? 0 : par.ty) - par.y) * 0.06;
      const cosx = Math.cos(rot.rx + par.x), sinx = Math.sin(rot.rx + par.x);
      const cosy = Math.cos(rot.ry + par.y), siny = Math.sin(rot.ry + par.y);
      const R = Math.min(w, h) * 0.3;
      pts = verts.map(([x, y, z]) => {
        const y1 = y * cosx - z * sinx, z1 = y * sinx + z * cosx;
        const x2 = x * cosy + z1 * siny, z2 = -x * siny + z1 * cosy;
        const s = R * (3.4 / (3.4 + z2));
        return [w / 2 + x2 * s, h / 2 + y1 * s, z2];
      });

      // glassy pentagon faces, back-to-front — depth makes the solid read as 3D
      const faceOrder = faces
        .map((f, fi) => [f.reduce((acc, i) => acc + pts[i][2], 0) / 5, fi])
        .sort((a, b) => b[0] - a[0]); // far faces first (larger z = farther here)
      for (const [fz, fi] of faceOrder) {
        const f = faces[fi];
        const facing = 1 - (fz + 1.7) / 3.4; // 0 back → 1 front
        ctx.beginPath();
        f.forEach((i, k) => (k ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1])));
        ctx.closePath();
        ctx.fillStyle = `rgba(15, 118, 110, ${0.018 + 0.05 * facing})`;
        ctx.fill();
      }

      // edges — the connections (edges touching the hovered vertex light up)
      ctx.lineWidth = 1.1;
      for (const [i, j] of edges) {
        const near = 1 - ((pts[i][2] + pts[j][2]) / 2 + 1.7) / 3.4;
        const hot = hover.i >= 0 && (i === hover.i || j === hover.i);
        ctx.strokeStyle = hot
          ? "rgba(17, 94, 89, 0.9)"
          : `rgba(17, 94, 89, ${0.14 + 0.45 * near})`;
        ctx.lineWidth = hot ? 1.8 : 1.1;
        ctx.beginPath();
        ctx.moveTo(pts[i][0], pts[i][1]);
        ctx.lineTo(pts[j][0], pts[j][1]);
        ctx.stroke();
      }
      // signal pulses travelling the edges — five concurrent carriers
      if (!reduced) {
        for (let c = 0; c < 5; c++) {
          const speed = 0.9 + c * 0.23;
          const k = Math.floor(t * speed + c * 37) % edges.length;
          const [i, j] = edges[k];
          const f = (t * speed + c * 37) % 1;
          const px = pts[i][0] + (pts[j][0] - pts[i][0]) * f;
          const py = pts[i][1] + (pts[j][1] - pts[i][1]) * f;
          const col = c % 2 ? "#0f766e" : "#9a5b13";
          // comet trail behind each carrier
          for (let tr = 1; tr <= 3; tr++) {
            const ft = Math.max(0, f - tr * 0.045);
            const tx = pts[i][0] + (pts[j][0] - pts[i][0]) * ft;
            const ty = pts[i][1] + (pts[j][1] - pts[i][1]) * ft;
            ctx.beginPath();
            ctx.arc(tx, ty, (c === 0 ? 3.4 : 2.4) * (1 - tr * 0.24), 0, Math.PI * 2);
            ctx.fillStyle = col;
            ctx.globalAlpha = 0.85 * (1 - tr * 0.28);
            ctx.fill();
          }
          ctx.beginPath();
          ctx.arc(px, py, c === 0 ? 3.4 : 2.4, 0, Math.PI * 2);
          ctx.fillStyle = col;
          ctx.globalAlpha = 0.85;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      // DNA double helix threaded through the core
      if (helix) {
        const H = Math.min(w, h) * 0.62;
        const cx = w / 2, cy = h / 2;
        const turns = 2.2, amp = Math.min(w, h) * 0.075;
        const N = 46;
        const strand = (ph) => {
          const ptsS = [];
          for (let k = 0; k <= N; k++) {
            const u = k / N;
            const ang = u * turns * Math.PI * 2 + (reduced ? 0 : t * 1.1) + ph;
            const x = cx + Math.sin(ang) * amp;
            const y = cy - H / 2 + u * H;
            const depth = Math.cos(ang); // -1 back, 1 front
            ptsS.push([x, y, depth]);
          }
          return ptsS;
        };
        const s1 = strand(0), s2 = strand(Math.PI);
        // rungs (base pairs)
        for (let k = 2; k < N; k += 4) {
          const a = s1[k], b = s2[k];
          const front = (a[2] + b[2]) / 2 > 0;
          ctx.strokeStyle = front ? "rgba(154,91,19,0.65)" : "rgba(154,91,19,0.22)";
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(b[0], b[1]);
          ctx.stroke();
        }
        for (const s of [s1, s2]) {
          ctx.beginPath();
          s.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
          ctx.strokeStyle = "rgba(15,118,110,0.7)";
          ctx.lineWidth = 1.8;
          ctx.stroke();
          // depth highlights
          for (const [x, y, d] of s) {
            if (d > 0.6) {
              ctx.beginPath();
              ctx.arc(x, y, 1.8, 0, Math.PI * 2);
              ctx.fillStyle = "rgba(17,94,89,0.85)";
              ctx.fill();
            }
          }
        }
        // bases drifting off the helix
        if (!reduced) {
          ctx.font = "600 11px 'JetBrains Mono', ui-monospace, monospace";
          for (let g = 0; g < 4; g++) {
            const u = ((t * 0.13 + g * 0.27) % 1);
            const src = s1[Math.floor(((g * 11) % N))];
            const dx = (g % 2 ? 1 : -1) * u * Math.min(w, h) * 0.3;
            const dy = -u * Math.min(w, h) * 0.18;
            ctx.globalAlpha = Math.pow(1 - u, 0.7) * 0.85;
            ctx.fillStyle = "#115e59";
            ctx.fillText("ACGT"[g], src[0] + dx, src[1] + dy);
            ctx.globalAlpha = 1;
          }
        }
      }

      // vertices; persistent chips when labels=true, hover chip always
      ctx.font = "600 11px 'JetBrains Mono', ui-monospace, monospace";
      const order = pts.map((p, i) => [p[2], i]).sort((a, b) => a[0] - b[0]);
      const chip = (i, la) => {
        const [x, y] = pts[i];
        const label = LABELS[i % LABELS.length];
        const tw = ctx.measureText(label).width;
        const flip = x > w - tw - 28; // keep chips inside the right edge
        const cx0 = flip ? x - tw - 19 : x + 11;
        ctx.strokeStyle = `rgba(17,94,89,${0.5 * la})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + (flip ? -4 : 4), y);
        ctx.lineTo(flip ? cx0 + tw + 4 : cx0 - 4, y);
        ctx.stroke();
        ctx.fillStyle = `rgba(255,253,247,${0.85 * la})`;
        ctx.strokeStyle = `rgba(216,210,194,${0.8 * la})`;
        ctx.beginPath();
        ctx.roundRect(cx0 - 5, y - 8.5, tw + 10, 16, 3);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = `rgba(28, 26, 21, ${0.3 + 0.7 * la})`;
        ctx.fillText(label, cx0, y + 3.5);
      };
      for (const [, i] of order) {
        const [x, y, z] = pts[i];
        const near = 1 - (z + 1.7) / 3.4;
        const hot = i === hover.i;
        ctx.beginPath();
        ctx.arc(x, y, (hot ? 4.2 : 2.6) + 1.6 * near, 0, Math.PI * 2);
        ctx.fillStyle = hot ? "#115e59" : `rgba(15, 118, 110, ${0.35 + 0.6 * near})`;
        ctx.fill();
        if (hot) {
          ctx.beginPath();
          ctx.arc(x, y, 8 + 1.6 * near, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(17,94,89,0.5)";
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
        if (labels && near > 0.35 && !hot) {
          const la = Math.min(1, (near - 0.35) / 0.2); // ramp 0.35→0.55, no pop
          chip(i, la);
        }
      }
      if (hover.i >= 0) chip(hover.i, 1); // hovered label always on top, full alpha

      // one-time affordance cue
      if (hintA > 0.02) {
        if (interacted) hintA *= 0.92;
        ctx.font = "500 11px 'JetBrains Mono', ui-monospace, monospace";
        ctx.fillStyle = `rgba(95,91,80,${0.75 * hintA})`;
        ctx.textAlign = "center";
        ctx.fillText("⟲ drag to spin · hover a vertex", w / 2, h - 6);
        ctx.textAlign = "left";
      }

      if (running) raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running) return;
      running = true;
      lastNow = performance.now();
      raf = requestAnimationFrame(draw);
    };
    const stopIfIdle = () => {
      // reduced motion: only animate while dragging or coasting
      if (reduced && !drag.on && Math.abs(rot.vx) + Math.abs(rot.vy) < 0.00005) {
        running = false;
        cancelAnimationFrame(raf);
        draw(performance.now()); // settle on a final frame
      }
    };

    // ——— pointer interaction ———
    const onDown = (e) => {
      interacted = true;
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
        rot.vy = dx * 0.0022; // momentum carried on release
        rot.vx = dy * 0.0022;
        if (reduced) start();
        return;
      }
      // hover pick: nearest projected vertex within 16px
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      if (!reduced) {
        par.ty = ((mx / rect.width) - 0.5) * 0.2;
        par.tx = ((my / rect.height) - 0.5) * 0.16;
      }
      let best = -1, bestD = 16 * 16;
      for (let i = 0; i < pts.length; i++) {
        const d = (pts[i][0] - mx) ** 2 + (pts[i][1] - my) ** 2;
        if (d < bestD) { bestD = d; best = i; }
      }
      if (best !== hover.i) {
        hover.i = best;
        interacted = interacted || best >= 0;
        if (reduced) { start(); setTimeout(stopIfIdle, 60); }
      }
      canvas.style.cursor = drag.on ? "grabbing" : best >= 0 ? "pointer" : "grab";
    };
    const onUp = () => {
      drag.on = false;
      canvas.style.cursor = "grab";
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

    if (reduced) {
      // single static frame; interaction wakes the loop
      draw(performance.now());
    } else {
      start();
    }
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [verts, edges, faces, size, labels, helix]);

  return (
    <canvas
      ref={ref}
      style={{ width: "100%", height: size, touchAction: "pan-y", cursor: "grab" }}
      className="select-none"
      aria-label="Interactive dodecahedron whose 20 vertices are the parts of the Artemis BioLabs stack — drag to rotate, hover a vertex to name it"
      role="img"
    />
  );
}
