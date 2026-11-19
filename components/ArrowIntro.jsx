"use client";

import { useEffect, useRef } from "react";

// Artemis' arrow: flies across the title spelling out the name (dispatching
// "artemis-spell" progress for SpellOut letters), then banks upward and
// crashes into the dodecahedron, dispatching "artemis-impact" with the strike
// direction so HeroGenesis can shatter along it. Logo-click ("artemis-salute")
// replays the whole sequence.

const PRE_MS = 600;
const SPELL_MS = 1500;
const DIVE_MS = 620;
const FLASH_MS = 450;

export default function ArrowIntro() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = false;
    let t0 = 0;
    let impactSent = false;
    let impactAt = null; // [x, y, vx, vy]
    const trail = [];

    const spell = (f) => window.dispatchEvent(new CustomEvent("artemis-spell", { detail: { f } }));
    const impact = (vx, vy) => window.dispatchEvent(new CustomEvent("artemis-impact", { detail: { vx, vy } }));

    if (reduced) {
      // no flight — reveal the name and hand the cloud its cue immediately
      const id = setTimeout(() => { spell(1); impact(0.3, -0.95); }, 150);
      const onSalute = () => { spell(1); impact(0.3, -0.95); };
      window.addEventListener("artemis-salute", onSalute);
      return () => { clearTimeout(id); window.removeEventListener("artemis-salute", onSalute); };
    }

    const rects = () => {
      const own = canvas.getBoundingClientRect();
      const title = document.getElementById("hero-title")?.getBoundingClientRect();
      const target = document.getElementById("genesis-canvas")?.getBoundingClientRect();
      if (!title || !target) return null;
      return {
        tL: title.left - own.left,
        tR: title.right - own.left,
        tY: title.top + title.height / 2 - own.top,
        gX: target.left + target.width / 2 - own.left,
        gY: target.top + target.height / 2 - own.top,
      };
    };

    const drawArrow = (x, y, ang) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.lineCap = "round";
      // shaft
      ctx.strokeStyle = "rgba(248,250,252,0.95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-30, 0);
      ctx.lineTo(-2, 0);
      ctx.stroke();
      // head
      ctx.strokeStyle = "#14b8a6";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-8, -5);
      ctx.lineTo(1, 0);
      ctx.lineTo(-8, 5);
      ctx.stroke();
      // fletching
      ctx.strokeStyle = "rgba(20,184,166,0.8)";
      ctx.lineWidth = 1.6;
      for (const o of [-30, -25]) {
        ctx.beginPath();
        ctx.moveTo(o, 0);
        ctx.lineTo(o - 5, -5);
        ctx.moveTo(o, 0);
        ctx.lineTo(o - 5, 5);
        ctx.stroke();
      }
      ctx.restore();
    };

    const draw = (now) => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr)) { canvas.width = w * dpr; canvas.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const r = rects();
      if (!r) { raf = requestAnimationFrame(draw); return; }
      const el = now - t0;

      let x, y, ang;
      if (el < PRE_MS) {
        x = r.tL - 140; y = r.tY; ang = 0;
      } else if (el < PRE_MS + SPELL_MS) {
        const f = (el - PRE_MS) / SPELL_MS;
        x = r.tL - 140 + (r.tR + 40 - (r.tL - 140)) * f;
        y = r.tY + Math.sin(f * Math.PI * 3) * 7 - 2;
        ang = Math.atan2(Math.cos(f * Math.PI * 3) * 7 * 0.02, 1);
        spell(Math.max(0, Math.min(1, (x - r.tL) / (r.tR - r.tL))));
      } else if (el < PRE_MS + SPELL_MS + DIVE_MS) {
        spell(1);
        const u = (el - PRE_MS - SPELL_MS) / DIVE_MS;
        const e = u * u; // accelerate into the strike
        const p0 = [r.tR + 40, r.tY];
        const p2 = [r.gX, r.gY];
        const p1 = [p0[0] + (p2[0] - p0[0]) * 0.1, Math.min(p0[1], p2[1]) + 40];
        const q = (a, b, c, s) => (1 - s) * (1 - s) * a + 2 * (1 - s) * s * b + s * s * c;
        x = q(p0[0], p1[0], p2[0], e);
        y = q(p0[1], p1[1], p2[1], e);
        const dx = 2 * (1 - e) * (p1[0] - p0[0]) + 2 * e * (p2[0] - p1[0]);
        const dy = 2 * (1 - e) * (p1[1] - p0[1]) + 2 * e * (p2[1] - p1[1]);
        ang = Math.atan2(dy, dx);
        if (u > 0.985 && !impactSent) {
          impactSent = true;
          const n = Math.hypot(dx, dy) || 1;
          impactAt = [p2[0], p2[1], dx / n, dy / n, now];
          impact(dx / n, dy / n);
        }
      } else {
        // flash, then rest
        if (!impactSent) { impactSent = true; impactAt = [r.gX, r.gY, 0.3, -0.95, now]; impact(0.3, -0.95); }
        const fe = (now - impactAt[4]) / FLASH_MS;
        if (fe < 1) {
          const [ix, iy] = impactAt;
          ctx.strokeStyle = `rgba(20,184,166,${(0.7 * (1 - fe)).toFixed(3)})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ix, iy, 10 + fe * 58, 0, Math.PI * 2);
          ctx.stroke();
          ctx.lineWidth = 1.4;
          for (let k = 0; k < 8; k++) {
            const a = (k / 8) * Math.PI * 2 + 0.4;
            const r0 = 12 + fe * 44, r1 = r0 + 14 * (1 - fe);
            ctx.strokeStyle = `rgba(248,250,252,${(0.55 * (1 - fe)).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(ix + Math.cos(a) * r0, iy + Math.sin(a) * r0);
            ctx.lineTo(ix + Math.cos(a) * r1, iy + Math.sin(a) * r1);
            ctx.stroke();
          }
          raf = requestAnimationFrame(draw);
        } else {
          running = false;
          ctx.clearRect(0, 0, w, h);
        }
        return;
      }

      trail.push([x, y]);
      if (trail.length > 24) trail.shift();
      for (let i = 1; i < trail.length; i++) {
        const a = i / trail.length;
        ctx.strokeStyle = `rgba(20,184,166,${(a * 0.5).toFixed(3)})`;
        ctx.lineWidth = a * 2.6;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1][0], trail[i - 1][1]);
        ctx.lineTo(trail[i][0], trail[i][1]);
        ctx.stroke();
      }
      if (el >= PRE_MS) drawArrow(x, y, ang);

      raf = requestAnimationFrame(draw);
    };

    const play = () => {
      t0 = performance.now();
      impactSent = false;
      impactAt = null;
      trail.length = 0;
      spell(0);
      if (!running) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };

    const onSalute = () => play();
    window.addEventListener("artemis-salute", onSalute);
    play();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("artemis-salute", onSalute);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none z-30"
      aria-hidden
    />
  );
}
