"use client";

import { useEffect, useRef, useState } from "react";

const BOOKING =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0FzlJl55WV52jaH-JEG8_xJLO5YLd20t2ksXikjwMfGnVQ-zLI4XUCAmHTFiLE1tnQgAIxBhjW";
const DATA_URL = "plots/umap_params.json";
const DOMAIN_SAFE_PALETTE = { "#1c1a15": "#CC79A7" };
const ACTS = [
  { progress: 0.08, label: "specimen" },
  { progress: 0.38, label: "BANKSY domains" },
  { progress: 0.61, label: "embedding" },
  { progress: 0.82, label: "markers" },
  { progress: 0.96, label: "cores" },
];

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const map = (value, start, end) => clamp((value - start) / (end - start));
const smooth = (value) => value * value * (3 - 2 * value);
const mix = (a, b, value) => a + (b - a) * value;

function expressionColor(value) {
  const t = clamp(value);
  const stops = [
    [32, 38, 54],
    [20, 184, 166],
    [245, 158, 11],
  ];
  const segment = t < 0.5 ? 0 : 1;
  const f = (t * 2) - segment;
  const from = stops[segment];
  const to = stops[segment + 1];
  return `rgb(${Math.round(mix(from[0], to[0], f))}, ${Math.round(mix(from[1], to[1], f))}, ${Math.round(mix(from[2], to[2], f))})`;
}

function scaleMarker(values) {
  const max = Math.max(...values) || 1;
  return values.map((value) => value / max);
}

function sceneFor(progress, data) {
  if (progress < 0.22) return { name: "H&E · 10x Visium, GBM", act: 0 };
  if (progress < 0.52) {
    const index = Math.min(6, Math.floor(map(progress, 0.22, 0.52) * 7));
    return { name: data?.domains?.[index] || "BANKSY domains", act: 1, domain: index };
  }
  if (progress < 0.7) return { name: "BANKSY → UMAP · min_dist 0.01", act: 2 };
  if (progress < 0.77) return { name: "EGFR expression", act: 3, gene: "EGFR" };
  if (progress < 0.85) return { name: "SOX2 expression", act: 3, gene: "SOX2" };
  if (progress < 0.92) return { name: "CD68 expression", act: 3, gene: "CD68" };
  return { name: "sample cores", act: 4 };
}

function drawSpecimen(ctx, image, width, height, progress) {
  const field = Math.min(width, height) * (0.33 + map(progress, 0, 0.22) * 0.42);
  const cx = width * 0.5;
  const cy = height * 0.5;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, field, 0, Math.PI * 2);
  ctx.clip();
  if (image?.complete && image.naturalWidth) {
    const sourceRatio = image.naturalWidth / image.naturalHeight;
    const targetRatio = 1;
    let sw = image.naturalWidth;
    let sh = image.naturalHeight;
    if (sourceRatio > targetRatio) sw = sh;
    else sh = sw;
    const drift = progress * 0.025;
    const sx = (image.naturalWidth - sw) * (0.5 + drift);
    const sy = (image.naturalHeight - sh) * (0.47 - drift);
    ctx.drawImage(image, sx, sy, sw, sh, cx - field, cy - field, field * 2, field * 2);
  } else {
    const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, field);
    grad.addColorStop(0, "#d6bcc8");
    grad.addColorStop(0.48, "#7e5e83");
    grad.addColorStop(1, "#25172f");
    ctx.fillStyle = grad;
    ctx.fillRect(cx - field, cy - field, field * 2, field * 2);
  }
  ctx.fillStyle = "rgba(7, 6, 11, 0.12)";
  ctx.fillRect(cx - field, cy - field, field * 2, field * 2);
  ctx.restore();
  const edge = ctx.createRadialGradient(cx, cy, field * 0.78, cx, cy, field * 1.05);
  edge.addColorStop(0, "rgba(7,6,11,0)");
  edge.addColorStop(0.78, "rgba(7,6,11,0.08)");
  edge.addColorStop(1, "rgba(7,6,11,0.96)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(248,250,252,0.27)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, field, 0, Math.PI * 2);
  ctx.stroke();
}

function DownTheBarrelCanvas({ progress, onHover }) {
  const canvasRef = useRef(null);
  const dataRef = useRef(null);
  const imageRef = useRef(null);
  const pointerRef = useRef({ x: -1000, y: -1000 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const image = new Image();
    image.src = "gbm/GBM3_he.jpg";
    image.onload = () => {
      imageRef.current = image;
      setLoaded((value) => !value);
    };
    fetch(DATA_URL)
      .then((response) => (response.ok ? response.json() : null))
      .then((raw) => {
        if (!raw) return;
        dataRef.current = {
          ...raw,
          palette: raw.palette.map((color) => DOMAIN_SAFE_PALETTE[color] || color),
          markers: Object.fromEntries(
            Object.entries(raw.markers).map(([gene, values]) => [gene, scaleMarker(values)])
          ),
        };
        setLoaded((value) => !value);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d");
    let frame = 0;

    const render = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#07060b";
      context.fillRect(0, 0, width, height);

      const data = dataRef.current;
      const specimenFade = 1 - smooth(map(progress, 0.18, 0.39));
      if (specimenFade > 0.002) {
        context.save();
        context.globalAlpha = specimenFade;
        drawSpecimen(context, imageRef.current, width, height, progress);
        context.restore();
      }

      if (!data) {
        context.fillStyle = "rgba(248,250,252,0.56)";
        context.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
        context.fillText("Loading specimen coordinates…", 24, height - 28);
        return;
      }

      const scene = sceneFor(progress, data);
      const tissue = data.settings[0];
      const umap = data.settings[1];
      const cloudIn = smooth(map(progress, 0.18, 0.34));
      const morph = smooth(map(progress, 0.52, 0.7));
      const pullback = smooth(map(progress, 0.91, 0.99));
      const side = Math.min(width, height) * (0.76 - pullback * 0.42);
      const left = (width - side) / 2;
      const top = (height - side) / 2;
      const pointRadius = Math.max(1.05, Math.min(2.3, width / 520)) * (1 - pullback * 0.32);
      let hoverIndex = -1;
      let nearest = 15 * 15;
      const pointer = pointerRef.current;
      const gene = scene.gene;
      const visibleDomain = scene.domain ?? 6;

      context.save();
      context.globalAlpha = cloudIn;
      for (let i = 0; i < data.labels.length; i += 1) {
        const tx = left + tissue.x[i] * side;
        const ty = top + (1 - tissue.y[i]) * side;
        const ux = left + umap.x[i] * side;
        const uy = top + (1 - umap.y[i]) * side;
        const x = mix(tx, ux, morph);
        const y = mix(ty, uy, morph);
        const domain = data.labels[i];
        let color = "rgba(148,163,184,0.28)";
        if (scene.act === 1) {
          color = domain <= visibleDomain ? data.palette[domain] : "rgba(148,163,184,0.19)";
        } else if (scene.act >= 2 && !gene) {
          color = data.palette[domain];
        } else if (gene) {
          color = expressionColor(data.markers[gene][i]);
        }
        context.beginPath();
        context.arc(x, y, pointRadius, 0, Math.PI * 2);
        context.fillStyle = color;
        context.fill();
        if (progress >= 0.85 && pullback < 0.2) {
          const distance = (x - pointer.x) ** 2 + (y - pointer.y) ** 2;
          if (distance < nearest) {
            nearest = distance;
            hoverIndex = i;
          }
        }
      }
      context.restore();

      if (hoverIndex >= 0) {
        const domain = data.labels[hoverIndex];
        const tx = left + tissue.x[hoverIndex] * side;
        const ty = top + (1 - tissue.y[hoverIndex]) * side;
        const ux = left + umap.x[hoverIndex] * side;
        const uy = top + (1 - umap.y[hoverIndex]) * side;
        const x = mix(tx, ux, morph);
        const y = mix(ty, uy, morph);
        context.strokeStyle = "#f8fafc";
        context.lineWidth = 1;
        context.beginPath();
        context.arc(x, y, pointRadius + 4, 0, Math.PI * 2);
        context.stroke();
        onHover({
          x,
          y,
          domain: data.domains[domain],
          gene: gene || "domain",
          value: gene ? data.markers[gene][hoverIndex] : null,
        });
      } else {
        onHover(null);
      }
    };

    const requestRender = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(render);
    };
    const resize = new ResizeObserver(requestRender);
    resize.observe(canvas);
    requestRender();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
    };
  }, [loaded, onHover, progress]);

  const move = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerRef.current = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    setLoaded((value) => !value);
  };

  return (
    <canvas
      ref={canvasRef}
      aria-label="Interactive GBM3 spatial transcriptomics specimen view"
      className="h-full w-full touch-none"
      onPointerMove={move}
      onPointerLeave={() => {
        pointerRef.current = { x: -1000, y: -1000 };
        setLoaded((value) => !value);
      }}
    />
  );
}

function DepthGauge({ progress, data, hover }) {
  const scene = sceneFor(progress, data);
  return (
    <aside className="pointer-events-none absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 md:block" aria-label="Specimen depth gauge">
      <div className="flex h-64 items-stretch gap-3">
        <div className="relative w-px bg-snow/20">
          <span className="absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-violet shadow-[0_0_16px_3px_rgba(20,184,166,0.5)]" style={{ top: `${clamp(progress) * 100}%` }} />
          {[0, 0.22, 0.52, 0.7, 0.92].map((stop) => <span key={stop} className="absolute -left-1 h-px w-2 bg-snow/45" style={{ top: `${stop * 100}%` }} />)}
        </div>
        <div className="flex w-40 flex-col justify-between py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-dim">
          <span>Depth / {Math.round(progress * 100).toString().padStart(3, "0")}</span>
          <span className="leading-relaxed text-snow">{scene.name}</span>
          {hover ? <span className="leading-relaxed text-violet">{hover.domain}<br />{hover.gene}{hover.value !== null ? ` · ${hover.value.toFixed(2)}` : ""}</span> : <span>GBM3 · 1775 cells</span>}
        </div>
      </div>
    </aside>
  );
}

function CoresOverlay({ progress }) {
  const opacity = smooth(map(progress, 0.91, 0.98));
  if (opacity < 0.01) return null;
  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-6 z-10 mx-auto max-w-lg transition-none md:bottom-12" style={{ opacity }}>
      <div className="rounded-[3px] border border-line bg-ink/80 p-3 backdrop-blur-md">
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((sample) => (
            <img key={sample} src={`gbm/GBM${sample}_he.jpg`} alt={`GBM${sample} H&E sample`} className="aspect-square w-full rounded-[2px] object-cover opacity-75" />
          ))}
        </div>
        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">10x Genomics Visium, GBM</p>
          <a href={BOOKING} target="_blank" rel="noreferrer" className="pointer-events-auto rounded-[3px] bg-violet-deep px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-violet focus-visible:outline focus-visible:outline-2 focus-visible:outline-snow">Book a demo</a>
        </div>
      </div>
    </div>
  );
}

export default function DownTheBarrel() {
  const trackRef = useRef(null);
  const [reduced, setReduced] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [data, setData] = useState(null);
  const [hover, setHover] = useState(null);
  const displayProgress = reduced ? ACTS[step].progress : progress;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduced(query.matches);
    updatePreference();
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    fetch(DATA_URL).then((response) => (response.ok ? response.json() : null)).then(setData).catch(() => {});
  }, []);

  useEffect(() => {
    if (reduced) return undefined;
    let frame = 0;
    const update = () => {
      const element = trackRef.current;
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      const distance = Math.max(1, element.offsetHeight - window.innerHeight);
      setProgress(clamp(-bounds.top / distance));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  const active = sceneFor(displayProgress, data);

  return (
    <main className="min-h-screen bg-ink text-snow grain">
      <nav className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-snow/10 bg-ink/75 px-5 py-3 backdrop-blur-md md:px-9">
        <a href="#top" aria-label="Artemis BioLabs — top of page" className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet">
          <img src="artemis_lockup.svg" alt="Artemis BioLabs" className="h-7 w-auto md:h-8" />
        </a>
        <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-dim md:gap-7">
          <a href="#method" className="hidden transition-colors hover:text-snow md:block">Method</a>
          <a href="#contact" className="hidden transition-colors hover:text-snow md:block">Contact</a>
          <a href={BOOKING} target="_blank" rel="noreferrer" className="rounded-[3px] border border-violet/70 px-3 py-2 text-snow transition-colors hover:bg-violet hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-snow">Book a demo</a>
        </div>
      </nav>

      <section id="top" ref={trackRef} className={reduced ? "relative min-h-[100svh]" : "relative h-[620svh]"}>
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <DownTheBarrelCanvas progress={displayProgress} onHover={setHover} />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,6,11,0.54),transparent_48%,rgba(7,6,11,0.24))]" />
          <div className="pointer-events-none absolute left-5 top-[22%] z-10 max-w-[min(35rem,calc(100vw-3rem))] md:left-10 md:top-1/2 md:-translate-y-1/2">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.35em] text-violet">A depth-first analysis</p>
            <h1 className="text-[clamp(2.6rem,7vw,6.8rem)] font-semibold leading-[0.9] tracking-[-0.06em]">ARTEMIS<br />BIOLABS</h1>
            <p className="mt-5 max-w-xs font-mono text-[12px] uppercase leading-relaxed tracking-[0.18em] text-snow/75">computational biology, accelerated.</p>
          </div>
          <div className="pointer-events-none absolute bottom-6 left-5 z-10 md:bottom-10 md:left-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.21em] text-dim">{reduced ? "Use the specimen controls" : "Scroll to focus deeper"}</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-snow/80">{active.name}</p>
          </div>
          <DepthGauge progress={displayProgress} data={data} hover={hover} />
          <CoresOverlay progress={displayProgress} />

          {reduced && (
            <div className="absolute bottom-6 right-5 z-30 flex items-center gap-2 md:bottom-10 md:right-10" aria-label="Specimen depth controls">
              <button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0} className="rounded-[3px] border border-line bg-ink/85 px-3 py-2 font-mono text-xs uppercase tracking-[0.15em] disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet">Prev</button>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">{step + 1} / {ACTS.length}</span>
              <button type="button" onClick={() => setStep((value) => Math.min(ACTS.length - 1, value + 1))} disabled={step === ACTS.length - 1} className="rounded-[3px] border border-violet/70 bg-violet-deep px-3 py-2 font-mono text-xs uppercase tracking-[0.15em] text-ink disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-snow">Next</button>
            </div>
          )}
        </div>
      </section>

      <section id="method" className="border-t border-line bg-ink-2 px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-violet">One specimen, more signal</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] md:text-6xl">Stay close to the biology.</h2>
          </div>
          <div className="grid gap-px border border-line bg-line sm:grid-cols-3">
            {[
              ["Spatial context", "Trace coordinates through the same sample."],
              ["Domain structure", "See BANKSY domains emerge in tissue space."],
              ["Marker signal", "Inspect EGFR, SOX2, and CD68 at cell level."],
            ].map(([title, description]) => (
              <article key={title} className="bg-ink-2 p-6">
                <h3 className="text-lg font-medium text-snow">{title}</h3>
                <p className="mt-4 text-base leading-relaxed text-dim">{description}</p>
              </article>
            ))}
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-6xl font-mono text-[11px] uppercase tracking-[0.16em] text-dim">GBM3 · Ren et al. 2023 (GSE194329) · 1,775 cells</p>
      </section>

      <section className="border-t border-line px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-violet">The embedded team</p>
          <div className="mt-7 grid gap-8 md:grid-cols-2 md:items-end">
            <h2 className="text-4xl font-semibold tracking-[-0.045em] md:text-6xl">Every core service your lab needs. One AI-powered team.</h2>
            <p className="max-w-md text-lg leading-relaxed text-dim">Bring the question. We help make the data legible, from tissue context through analysis.</p>
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-line bg-violet-deep px-5 py-20 text-ink md:px-10 md:py-28">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink/70">Begin with your first analysis</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] md:text-6xl">The first analysis is on us.</h2>
          </div>
          <a href={BOOKING} target="_blank" rel="noreferrer" className="rounded-[3px] bg-ink px-6 py-3 text-base font-medium text-snow transition-colors hover:bg-ink-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-snow">Book a demo</a>
        </div>
      </section>
    </main>
  );
}
