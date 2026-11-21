"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import { stateColor } from "../lib/stateColors";

const SAMPLES = [
  { id: "GBM1", title: "GBM1", source: "Ren et al. 2023 · GSE194329" },
  { id: "GBM2", title: "GBM2", source: "Ren et al. 2023 · GSE194329" },
  { id: "GBM3", title: "GBM3", source: "Ren et al. 2023 · GSE194329" },
  { id: "GBM4", title: "GBM4", source: "Ren et al. 2023 · GSE194329" },
  { id: "TenX_GBM", title: "10x GBM", source: "10x Genomics Parent Visium" },
];

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function GlowField() {
  const ref = useRef(null);
  const [legend, setLegend] = useState([]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let alive = true;
    let raf = 0;
    let seen = true;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const he = new Image();
    he.src = "gbm/GBM1_he.jpg";

    let spots = null;
    let colors = [];
    let maxX = 1;
    let maxY = 1;
    let plate = null;
    let plateW = 0;
    let plateH = 0;

    const rebuild = (w, h, dpr) => {
      if (!spots) return;
      plate = document.createElement("canvas");
      plate.width = Math.floor(w * dpr);
      plate.height = Math.floor(h * dpr);
      plateW = w;
      plateH = h;
      const pctx = plate.getContext("2d");
      pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const scale = Math.min(w / maxX, h / maxY) * 0.88;
      const ox = (w - maxX * scale) / 2;
      const oy = (h - maxY * scale) / 2;
      for (const [x, y, s] of spots) {
        const rgb = colors[s] || [31, 111, 120];
        pctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
        pctx.beginPath();
        pctx.arc(ox + x * scale, oy + y * scale, 3.4, 0, Math.PI * 2);
        pctx.fill();
      }
    };

    const frame = (now) => {
      if (!alive || !seen) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w < 2 || h < 2) {
        if (!reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
        return;
      }
      const pw = Math.floor(w * dpr);
      const ph = Math.floor(h * dpr);
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
      if (!plate || plateW !== w || plateH !== h) rebuild(w, h, dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#07161c";
      ctx.fillRect(0, 0, w, h);
      if (he.complete && he.naturalWidth) {
        const ir = he.naturalWidth / he.naturalHeight;
        const cr = w / h;
        let dw;
        let dh;
        let dx;
        let dy;
        if (ir > cr) {
          dh = h;
          dw = h * ir;
          dx = (w - dw) / 2;
          dy = 0;
        } else {
          dw = w;
          dh = w / ir;
          dx = 0;
          dy = (h - dh) / 2;
        }
        ctx.globalAlpha = 0.22;
        ctx.drawImage(he, dx, dy, dw, dh);
        ctx.globalAlpha = 1;
      }
      if (plate) {
        const pulse = reduce ? 0.5 : 0.5 + 0.5 * Math.sin(now / 900);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.filter = `blur(${14 + pulse * 8}px)`;
        ctx.globalAlpha = 0.9;
        ctx.drawImage(plate, 0, 0, w, h);
        ctx.filter = "none";
        ctx.globalAlpha = 0.92;
        ctx.drawImage(plate, 0, 0, w, h);
        ctx.restore();
      }
      if (!reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
    };

    fetch("banksy_gbm1.json")
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        spots = data.spots;
        colors = data.states.map((name, i) => hexToRgb(stateColor(name, i)));
        const counts = data.states.map((name) => ({ name, n: 0 }));
        for (const [x, y, s] of spots) {
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
          if (counts[s]) counts[s].n += 1;
        }
        setLegend(counts.sort((a, b) => b.n - a.n).slice(0, 4));
        plate = null;
        frame(performance.now());
      })
      .catch(() => {});

    const io = new IntersectionObserver(([entry]) => {
      seen = entry.isIntersecting;
      if (seen && spots && !reduce) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(canvas);
    he.onload = () => {
      if (alive) frame(performance.now());
    };

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <figure className="overflow-hidden rounded-[4px] border border-snow/60 bg-ink shadow-[0_0_70px_-24px_rgba(20,184,166,0.55)]">
      <canvas ref={ref} className="block h-[320px] w-full md:h-[540px]" role="img" aria-label="GBM1 Visium spots glowing by cell state over the H and E slide" />
      <figcaption className="flex flex-col gap-3 border-t border-line px-5 py-4 md:flex-row md:items-center md:justify-between">
        <p className="max-w-xl text-[13.5px] leading-relaxed text-dim">
          GBM1, Ren et al. 2023 (GSE194329). Each dot is a real Visium spot, colored by its cell state, over the H&amp;E.
        </p>
        <ul className="flex flex-wrap gap-2">
          {legend.map((item) => (
            <li key={item.name} className="font-mono text-[11px] text-snow/80">
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ background: stateColor(item.name), boxShadow: `0 0 8px ${stateColor(item.name)}` }} />
              {item.name}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}

function LivingFigure() {
  const [on, setOn] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOn(true);
      return;
    }
    let timer;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      timer = setInterval(() => setOn((v) => !v), 4200);
    }, { threshold: 0.35 });
    if (ref.current) io.observe(ref.current);
    return () => {
      io.disconnect();
      clearInterval(timer);
    };
  }, []);

  return (
    <figure ref={ref} className="overflow-hidden rounded-[4px] border border-snow/60 bg-ink">
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src="dejong/AT15-BRA-4-FO-B2-S25_he.jpg"
          alt="AT15 glioblastoma section, H and E"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        <img
          src="dejong/AT15-BRA-4-FO-B2-S25_overlay.jpg"
          alt="The same AT15 section with cell states overlaid"
          className="glow-plate absolute inset-0 h-full w-full object-cover object-top"
          style={{ opacity: on ? 1 : 0.15 }}
        />
      </div>
      <figcaption className="border-t border-line px-5 py-4 text-[13.5px] leading-relaxed text-dim">
        AT15, de Jong et al., Nature 2026. The section breathes between the H&amp;E and the cell states.
      </figcaption>
    </figure>
  );
}

export default function GlowingGbm() {
  return (
    <section id="glioblastoma" className="relative border-y border-line bg-ink-2/60 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-14">
        <Reveal>
          <p className="mb-4 font-mono text-sm text-violet">GLIOBLASTOMA</p>
          <h2 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
            A section, glowing.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-dim">
            Public Visium glioblastoma sections. Histology underneath, cell states and markers lit on top. Pan them in the browser.
          </p>
        </Reveal>

        <Reveal delay={0.06} className="mt-10">
          <GlowField />
        </Reveal>

        <div className="mt-6 flex gap-4 overflow-x-auto pb-2 snap-x">
          {SAMPLES.map((s) => (
            <a
              key={s.id}
              href={`live/${s.id}/index.html`}
              target="_blank"
              rel="noreferrer"
              className="lit-card group relative w-[78%] shrink-0 snap-start overflow-hidden rounded-[4px] border border-line bg-panel sm:w-[46%] lg:w-auto lg:min-w-0 lg:flex-1"
            >
              <span className="relative block aspect-[4/3] overflow-hidden bg-black">
                <img src={`gbm/${s.id}_he.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <img src={`gbm/${s.id}_overlay.jpg`} alt="" className="glow-plate absolute inset-0 h-full w-full object-cover opacity-90" />
              </span>
              <span className="block px-4 py-3">
                <span className="block text-[15px] font-medium text-snow">{s.title}</span>
                <span className="mt-1 block font-mono text-[11px] text-dim">{s.source}</span>
                <span className="mt-2 block text-[13px] text-violet">Open the portal</span>
              </span>
            </a>
          ))}
        </div>

        <Reveal delay={0.08} className="mt-8">
          <LivingFigure />
        </Reveal>

        <Reveal delay={0.1} className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <a href="live/explore/index.html" target="_blank" rel="noreferrer" className="rounded-[3px] bg-violet-deep px-5 py-2.5 text-[15px] font-medium text-ink hover:bg-violet">
              Open the live H&amp;E viewer
            </a>
            <a href="live/GBM3/portal.html" target="_blank" rel="noreferrer" className="rounded-[3px] border border-snow/50 px-5 py-2.5 text-[15px] text-dim hover:border-violet hover:text-snow">
              GBM3 portal
            </a>
          </div>
          <div className="relative mt-5 overflow-hidden rounded-[4px] border border-snow/60 bg-ink">
            <iframe
              src="live/explore/index.html"
              title="Artemis Explore, live glioblastoma viewer with H and E, markers, and cell states"
              className="hidden h-[720px] w-full border-0 md:block"
              loading="eager"
            />
            <a href="live/explore/index.html" target="_blank" rel="noreferrer" className="relative block aspect-[4/3] md:hidden">
              <img src="live/explore/he.jpg" alt="AT15 glioblastoma H and E" className="absolute inset-0 h-full w-full object-contain bg-[#f3efe4]" />
              <img src="live/explore/states.png" alt="" className="glow-plate absolute inset-0 h-full w-full object-contain opacity-80" />
              <span className="absolute bottom-3 left-3 rounded-[3px] bg-violet-deep px-3 py-1 text-[13px] font-medium text-ink">
                Open the viewer
              </span>
            </a>
          </div>
          <p className="mt-4 max-w-3xl text-[13.5px] leading-relaxed text-dim">
            Artemis Explore on AT15, de Jong et al., Nature 2026 (gbmspace.org): 10,356 spots, eight marker channels, and 66 cell states estimated with cell2location. State labels on the Ren and 10x sections are model-annotated and not independently validated.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
