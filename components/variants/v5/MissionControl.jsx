"use client";

import { useEffect, useRef, useState } from "react";

const BOOKING =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0FzlJl55WV52jaH-JEG8_xJLO5YLd20t2ksXikjwMfGnVQ-zLI4XUCAmHTFiLE1tnQgAIxBhjW";
const DATA_URL = "plots/umap_params.json";
const DARK_SAFE = { "#1c1a15": "#CC79A7" };

const CORES = [
  ["Single-cell", "Reads to annotated cell atlases and iPSC benchmarks."],
  ["Spatial transcriptomics", "Cell states mapped back onto tissue."],
  ["CUT&Tag and chromatin", "Peaks, tracks, and differential binding."],
  ["Long-read sequencing", "Isoforms, structural variants, and methylation."],
  ["Radiomics and imaging", "Segmentation through outcome modeling."],
  ["Calcium imaging", "Wave detection without hand scoring."],
  ["Clinical data and biostatistics", "Cohorts, trials, and survival models."],
  ["Custom apps: DNA Studio", "Plasmid maps from SnapGene files."],
];

const TASKS = [
  "Load GBM3 spatial run · Ren et al. 2023 (GSE194329)",
  "Index BANKSY domain labels",
  "Review EGFR, SOX2, and CD68 marker channels",
  "Prepare a shareable analysis surface",
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return reduced;
}

function RadarCanvas({ data, activeDomain, onDomainChange, reduced }) {
  const canvasRef = useRef(null);
  const activeRef = useRef(activeDomain);

  useEffect(() => {
    activeRef.current = activeDomain;
  }, [activeDomain]);

  useEffect(() => {
    if (!data) return undefined;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const palette = data.palette.map((color) => DARK_SAFE[color] || color);
    const tissue = data.settings.find((setting) => setting.id === "tissue");
    let frame = 0;
    let lastDomain = -1;

    const draw = (now) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#0a0c12";
      ctx.fillRect(0, 0, width, height);

      const pad = 28;
      const side = Math.max(1, Math.min(width - pad * 2, height - pad * 2));
      const x0 = (width - side) / 2;
      const y0 = (height - side) / 2;
      const cx = width / 2;
      const cy = height / 2;

      ctx.strokeStyle = "rgba(148, 163, 184, 0.13)";
      ctx.lineWidth = 1;
      [0.2, 0.4, 0.6, 0.8].forEach((ratio) => {
        ctx.beginPath();
        ctx.arc(cx, cy, (side / 2) * ratio, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.moveTo(x0, cy);
      ctx.lineTo(x0 + side, cy);
      ctx.moveTo(cx, y0);
      ctx.lineTo(cx, y0 + side);
      ctx.stroke();

      const sweepDomain = reduced ? activeRef.current : Math.floor(now / 1500) % data.domains.length;
      if (!reduced && sweepDomain !== lastDomain) {
        lastDomain = sweepDomain;
        onDomainChange(sweepDomain);
      }
      const angle = reduced ? 0 : (now / 1500) * Math.PI * 2;
      if (!reduced) {
        const radius = side * 0.7;
        const gradient = ctx.createConicGradient
          ? ctx.createConicGradient(angle - 0.8, cx, cy)
          : null;
        if (gradient) {
          gradient.addColorStop(0, "rgba(20,184,166,0.13)");
          gradient.addColorStop(0.06, "rgba(20,184,166,0)");
          gradient.addColorStop(1, "rgba(20,184,166,0)");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.strokeStyle = "rgba(20, 184, 166, 0.5)";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
        ctx.stroke();
      }

      for (let i = 0; i < data.labels.length; i += 1) {
        const domain = data.labels[i];
        const x = x0 + tissue.x[i] * side;
        const y = y0 + (1 - tissue.y[i]) * side;
        const isActive = reduced || domain === activeRef.current;
        ctx.globalAlpha = isActive ? 1 : 0.27;
        ctx.fillStyle = palette[domain];
        ctx.beginPath();
        ctx.arc(x, y, isActive ? 2.15 : 1.25, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(20, 184, 166, 0.45)";
      ctx.strokeRect(x0, y0, side, side);
      ctx.fillStyle = "rgba(248, 250, 252, 0.75)";
      ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("TISSUE COORDINATES", x0 + 8, y0 + 16);
      ctx.fillStyle = "rgba(20, 184, 166, 0.8)";
      ctx.fillText(`DOMAIN ${String(activeRef.current + 1).padStart(2, "0")}`, x0 + 8, y0 + side - 10);

      if (!reduced) frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [data, onDomainChange, reduced]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full min-h-[330px] w-full rounded-[2px]"
      aria-label="GBM3 tissue-coordinate point cloud. Colored cells show seven BANKSY domains."
      role="img"
    />
  );
}

function TypedTaskFeed({ reduced }) {
  const [visible, setVisible] = useState(reduced ? TASKS.length : 1);

  useEffect(() => {
    if (reduced) {
      setVisible(TASKS.length);
      return undefined;
    }
    setVisible(1);
    const timer = window.setInterval(() => {
      setVisible((count) => (count < TASKS.length ? count + 1 : count));
    }, 900);
    return () => window.clearInterval(timer);
  }, [reduced]);

  return (
    <ol className="space-y-4" aria-label="Recorded pipeline task feed">
      {TASKS.slice(0, visible).map((task, index) => (
        <li key={task} className="flex gap-3 font-mono text-xs leading-5 text-snow/85">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet shadow-[0_0_12px_rgba(20,184,166,0.8)]" aria-hidden="true" />
          <span>
            <span className="mr-2 text-dim">{String(index + 1).padStart(2, "0")}</span>
            {task}
            <span className="ml-2 text-violet">recorded</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function ImageStrip() {
  const [selected, setSelected] = useState(null);
  const cases = ["GBM1", "GBM2", "GBM3", "GBM4"];

  return (
    <section id="tissue" className="border-y border-line bg-ink-2/55 px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-violet">Visual inspection strip</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">H&E / domain overlay</h2>
          </div>
          <p className="max-w-sm font-mono text-xs leading-5 text-dim">10x Genomics Visium, GBM · hover or focus a case to inspect its recorded overlay.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {cases.map((caseName) => {
            const active = selected === caseName;
            return (
              <button
                key={caseName}
                type="button"
                onMouseEnter={() => setSelected(caseName)}
                onMouseLeave={() => setSelected(null)}
                onFocus={() => setSelected(caseName)}
                onBlur={() => setSelected(null)}
                onClick={() => setSelected(active ? null : caseName)}
                className="group relative aspect-[1.18] overflow-hidden rounded-[3px] border border-line bg-panel text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet"
                aria-label={`${caseName}: toggle between H and E image and domain overlay`}
              >
                <img src={`gbm/${caseName}_he.jpg`} alt={`${caseName} H and E tissue image`} className="absolute inset-0 h-full w-full object-cover" />
                <img
                  src={`gbm/${caseName}_overlay.jpg`}
                  alt=""
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"}`}
                />
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-ink/75 px-3 py-2 font-mono text-xs text-snow">
                  <span>{caseName}</span><span className="text-violet">{active ? "OVERLAY" : "H&E"}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function MissionControl() {
  const [data, setData] = useState(null);
  const [loadState, setLoadState] = useState("loading");
  const [activeDomain, setActiveDomain] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    let current = true;
    fetch(DATA_URL)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Data unavailable"))))
      .then((result) => {
        if (current) {
          setData(result);
          setLoadState("ready");
        }
      })
      .catch(() => current && setLoadState("error"));
    return () => { current = false; };
  }, []);

  const cellCount = data?.labels?.length || 0;
  const markerMax = (marker) => {
    if (!data?.markers?.[marker]) return "—";
    return Math.max(...data.markers[marker]).toFixed(2);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-ink text-snow grain">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_45%_20%,rgba(20,184,166,0.13),transparent_27%),radial-gradient(circle_at_90%_70%,rgba(245,158,11,0.07),transparent_23%)]" />
      <a href="#operations" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-[3px] focus:bg-violet focus:px-4 focus:py-2 focus:text-ink">Skip to operations</a>

      <nav className="mx-auto flex max-w-[1600px] items-center justify-between border-b border-line px-5 py-4 md:px-10">
        <a href="#top" aria-label="Artemis BioLabs Mission Control home"><img src="artemis_lockup.svg" alt="Artemis BioLabs" className="h-8 w-auto md:h-10" /></a>
        <div className="flex items-center gap-4 font-mono text-xs">
          <a href="#cores" className="hidden text-dim transition-colors hover:text-snow md:block">CORES</a>
          <a href="#tissue" className="hidden text-dim transition-colors hover:text-snow md:block">TISSUE</a>
          <a href={BOOKING} target="_blank" rel="noreferrer" className="rounded-[3px] border border-violet/70 px-3 py-2 text-violet transition-colors hover:bg-violet hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-snow">BOOK A DEMO</a>
        </div>
      </nav>

      <section id="top" className="mx-auto max-w-[1600px] px-5 pb-10 pt-12 md:px-10 md:pb-16 md:pt-20">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-violet">Artemis / Mission Control</p>
          <h1 className="mt-4 text-5xl font-semibold leading-[0.95] tracking-[-0.055em] md:text-7xl">Your compbio team,<br /><span className="text-gradient">in active orbit.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-dim">Every core service your lab needs. One AI-powered team. This console replays an open spatial-analysis run, so you can inspect the data surface—not a stock dashboard.</p>
        </div>
      </section>

      <section id="operations" className="mx-auto max-w-[1600px] px-5 pb-20 md:px-10">
        <div className="grid border border-line bg-panel/40 xl:grid-cols-[250px_minmax(0,1fr)_330px]">
          <aside className="order-2 border-b border-line xl:order-none xl:border-b-0 xl:border-r">
            <div className="grid grid-cols-2 border-b border-line xl:grid-cols-1">
              <div className="border-r border-line p-4 xl:border-b xl:border-r-0"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">Cells</p><p className="mt-2 text-2xl font-semibold">{data ? cellCount.toLocaleString() : "—"}</p><p className="mt-1 font-mono text-[10px] text-dim">loaded points</p></div>
              <div className="p-4"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">Domains</p><p className="mt-2 text-2xl font-semibold">{data ? data.domains.length : "—"}</p><p className="mt-1 font-mono text-[10px] text-dim">BANKSY labels</p></div>
            </div>
            <div className="p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-dim">Marker maxima · log-normalized</p>
              <dl className="mt-4 space-y-2 font-mono text-xs">
                {["EGFR", "SOX2", "CD68"].map((marker) => <div key={marker} className="flex items-center justify-between border-b border-line/70 pb-2"><dt className="text-snow">{marker}</dt><dd className="text-violet">{markerMax(marker)}</dd></div>)}
              </dl>
            </div>
          </aside>

          <div className="order-1 min-w-0 border-b border-line xl:order-none xl:border-b-0 xl:border-r">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-5">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-snow"><span className={`h-2 w-2 rounded-full ${loadState === "ready" ? "bg-violet" : "bg-magma"}`} aria-hidden="true" /> Tissue radar</div>
              <p className="font-mono text-[11px] text-dim">{loadState === "ready" ? "recorded run replay" : loadState === "error" ? "feed unavailable" : "loading recorded feed"}</p>
            </div>
            <div className="relative h-[420px] md:h-[560px]">
              {data ? <RadarCanvas data={data} activeDomain={activeDomain} onDomainChange={setActiveDomain} reduced={reduced} /> : <div className="grid h-full place-items-center font-mono text-xs text-dim">{loadState === "error" ? "Unable to load the recorded data feed." : "Acquiring recorded coordinates…"}</div>}
            </div>
            {data && <div className="flex flex-wrap gap-2 border-t border-line p-3" aria-label="BANKSY domain controls">
              {data.domains.map((domain, index) => (
                <button key={domain} type="button" onClick={() => setActiveDomain(index)} className={`rounded-[2px] border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet ${activeDomain === index ? "border-violet bg-violet/10 text-snow" : "border-line text-dim hover:border-snow/40 hover:text-snow"}`} aria-pressed={activeDomain === index}>
                  {String(index + 1).padStart(2, "0")} {domain}
                </button>
              ))}
            </div>}
          </div>

          <aside className="order-3 flex flex-col">
            <div className="p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-violet">Agent task feed</p>
              <p className="mt-2 font-mono text-xs leading-5 text-dim">Concept preview · recorded source: Ren et al. 2023 (GSE194329)</p>
              <div className="mt-6"><TypedTaskFeed reduced={reduced} /></div>
            </div>
          </aside>
        </div>
        {data && <p className="mt-3 font-mono text-[11px] leading-5 text-dim">GBM3 · tissue-coordinate view · {data.domains[activeDomain]}: {data.domain_counts[activeDomain].toLocaleString()} cells in this recorded label set.</p>}
      </section>

      <section id="cores" className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div><p className="font-mono text-xs uppercase tracking-[0.3em] text-violet">Fleet stations</p><h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">Eight cores, one crew.</h2></div>
          <p className="max-w-md text-base leading-relaxed text-dim">A connected operating room for the question, assay, analysis, and the people who need the result.</p>
        </div>
        <div className="mt-10 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {CORES.map(([name, description], index) => <article key={name} className="min-h-48 bg-ink p-5 transition-colors hover:bg-panel/80"><p className="font-mono text-[11px] tracking-[0.18em] text-violet">STATION {String(index + 1).padStart(2, "0")}</p><h3 className="mt-8 text-xl font-medium">{name}</h3><p className="mt-3 text-sm leading-6 text-dim">{description}</p><p className="mt-7 font-mono text-[10px] uppercase tracking-[0.18em] text-dim">Ready for scope</p></article>)}
        </div>
      </section>

      <ImageStrip />

      <section id="contact" className="px-5 py-24 md:px-10 md:py-36">
        <div className="mx-auto max-w-4xl border border-violet/40 bg-[linear-gradient(135deg,rgba(20,184,166,0.14),rgba(20,184,166,0.02)_55%,transparent)] p-8 md:p-14">
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-violet">Open a channel</p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">Bring the next question into view.</h2>
          <div className="mt-8 flex flex-wrap items-center gap-5"><a href={BOOKING} target="_blank" rel="noreferrer" className="rounded-[3px] bg-violet px-6 py-3 font-medium text-ink transition-colors hover:bg-snow focus-visible:outline focus-visible:outline-2 focus-visible:outline-snow">Book a demo</a><p className="font-mono text-xs text-dim">The first analysis is on us.</p></div>
        </div>
      </section>
    </main>
  );
}
