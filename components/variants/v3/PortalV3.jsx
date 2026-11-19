"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const BOOKING =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0FzlJl55WV52jaH-JEG8_xJLO5YLd20t2ksXikjwMfGnVQ-zLI4XUCAmHTFiLE1tnQgAIxBhjW";
const DATA_URL = "plots/umap_params.json";
const DARK_SAFE = { "#1c1a15": "#CC79A7" };
const MARKERS = ["EGFR", "SOX2", "CD68"];
const VIEW_TABS = [["spatial", "Spatial"], ["umap", "UMAP"], ["expression", "Expression"]];

function safePalette(color) {
  return DARK_SAFE[color?.toLowerCase()] || color || "#94a3b8";
}

function markerColor(value, maximum) {
  const t = Math.max(0, Math.min(1, maximum ? value / maximum : 0));
  const a = [39, 45, 61];
  const b = [20, 184, 166];
  const c = [245, 158, 11];
  const pair = t < 0.55 ? [a, b, t / 0.55] : [b, c, (t - 0.55) / 0.45];
  const rgb = pair[0].map((n, i) => Math.round(n + (pair[1][i] - n) * pair[2]));
  return `rgb(${rgb.join(",")})`;
}

function getSetting(data, tab) {
  return data.settings[tab === "umap" ? 1 : 0];
}

function CloudCanvas({ data, tab, marker, className = "", animate = true }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !data) return undefined;
    const context = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let rect = { width: 1, height: 1 };
    const draw = (time = 0) => {
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#0a0a11";
      context.fillRect(0, 0, width, height);
      const setting = getSetting(data, tab);
      const values = data.markers[marker] || [];
      const maximum = Math.max(...values, 1);
      const pad = Math.max(12, Math.min(width, height) * 0.08);
      const w = width - pad * 2;
      const h = height - pad * 2;
      context.save();
      context.globalCompositeOperation = "lighter";
      for (let i = 0; i < data.labels.length; i += 1) {
        const shimmer = reduce ? 0 : Math.sin(time / 700 + i * 0.37) * 0.55;
        const x = pad + setting.x[i] * w;
        const y = pad + (1 - setting.y[i]) * h;
        context.globalAlpha = tab === "expression" ? 0.78 : 0.86;
        context.fillStyle = tab === "expression"
          ? markerColor(values[i], maximum)
          : safePalette(data.palette[data.labels[i]]);
        context.beginPath();
        context.arc(x, y, Math.max(1.25, Math.min(2.35, width / 245)) + shimmer * 0.18, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
      if (!reduce && animate) frame = window.requestAnimationFrame(draw);
    };
    const observer = new ResizeObserver(([entry]) => {
      rect = entry.contentRect;
      if (reduce || !animate) draw();
    });
    observer.observe(canvas);
    draw();
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [data, tab, marker, animate]);

  return <canvas ref={ref} className={className} aria-label={`${tab} point cloud for GBM3`} role="img" />;
}

function DomainBars({ data }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !data) return undefined;
    const ctx = canvas.getContext("2d");
    let rect = { width: 1, height: 1 };
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = rect;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const maximum = Math.max(...data.domain_counts);
      const gap = width / data.domain_counts.length;
      data.domain_counts.forEach((count, index) => {
        const barHeight = (count / maximum) * (height - 12);
        ctx.fillStyle = safePalette(data.palette[index]);
        ctx.fillRect(index * gap + 2, height - barHeight - 3, Math.max(2, gap - 4), barHeight);
      });
    };
    const observer = new ResizeObserver(([entry]) => { rect = entry.contentRect; draw(); });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [data]);
  return <canvas ref={ref} className="h-24 w-full" role="img" aria-label="Bar chart of BANKSY domain counts" />;
}

function LoadingShell() {
  return <div className="absolute inset-0 grid place-items-center bg-ink-2 text-center font-mono text-xs tracking-[0.18em] text-dim uppercase">Loading recorded dataset…</div>;
}

function transcriptFor(data) {
  if (!data) return [];
  const n = data.labels.length;
  const counts = data.labels.reduce((all, label) => {
    all[label] = (all[label] || 0) + 1;
    return all;
  }, []);
  const largestIndex = counts.indexOf(Math.max(...counts));
  const egfr = data.markers.EGFR;
  const egfrPositive = data.labels.reduce((sum, label, index) => sum + (label === largestIndex && egfr[index] > 0 ? 1 : 0), 0);
  const egfrFraction = counts[largestIndex] ? Math.round((egfrPositive / counts[largestIndex]) * 100) : 0;
  const cd68Means = data.domains.map((_, domain) => {
    const points = data.labels.reduce((sum, label, index) => sum + (label === domain ? data.markers.CD68[index] : 0), 0);
    return points / (counts[domain] || 1);
  });
  const cd68Index = cd68Means.indexOf(Math.max(...cd68Means));
  return [
    { tab: "spatial", marker: "EGFR", text: `Opened ${data.dataset}: ${n.toLocaleString()} observations across ${data.domains.length} BANKSY domains.` },
    { tab: "spatial", marker: "EGFR", text: `Spatial view: ${data.domains[largestIndex]} is the largest domain with ${counts[largestIndex].toLocaleString()} observations.` },
    { tab: "umap", marker: "EGFR", text: `Switching to UMAP. ${egfrFraction}% of ${data.domains[largestIndex]} observations have EGFR above zero.` },
    { tab: "expression", marker: "SOX2", text: `Coloring the tissue by SOX2 across all ${n.toLocaleString()} observations.` },
    { tab: "expression", marker: "CD68", text: `${data.domains[cd68Index]} has the highest mean CD68 value; mapping that expression back to tissue.` },
  ];
}

function AgentRail({ data, setTab, setMarker }) {
  const reducedRef = useRef(false);
  const [shown, setShown] = useState(0);
  const [typed, setTyped] = useState(0);
  const lines = useMemo(() => transcriptFor(data), [data]);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!lines.length) return undefined;
    if (reducedRef.current) {
      setShown(lines.length);
      setTyped(0);
      return undefined;
    }
    setShown(0);
    setTyped(0);
    let line = 0;
    let character = 0;
    let timeout;
    const advance = () => {
      const active = lines[line];
      setTab(active.tab);
      setMarker(active.marker);
      character += 1;
      setShown(line + 1);
      setTyped(character);
      if (character <= active.text.length) {
        timeout = window.setTimeout(advance, 13);
      } else {
        line += 1;
        character = 0;
        timeout = line < lines.length ? window.setTimeout(advance, 680) : undefined;
      }
    };
    timeout = window.setTimeout(advance, 260);
    return () => window.clearTimeout(timeout);
  }, [lines, setMarker, setTab]);

  return (
    <aside className="flex min-h-0 flex-col border-t border-line bg-[#10101a] lg:border-l lg:border-t-0" aria-label="Recorded Artemis agent run">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet">Artemis agent</p><p className="mt-0.5 text-sm text-snow">GBM3 work log</p></div>
        <span className="rounded-full border border-violet/35 bg-violet/10 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-violet">recorded run</span>
      </div>
      <div className="flex-1 space-y-3 overflow-auto px-4 py-4" aria-live="polite">
        {lines.slice(0, shown).map((line, index) => {
          const isTyping = !reducedRef.current && index === shown - 1 && typed <= line.text.length;
          const text = isTyping ? line.text.slice(0, typed) : line.text;
          return <div key={line.text} className="border-l border-violet/50 pl-3 text-[13px] leading-relaxed text-snow/90"><span className="mr-2 font-mono text-[9px] uppercase tracking-wider text-dim">{index + 1}</span>{text}{isTyping && <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-violet align-middle" />}</div>;
        })}
      </div>
      <div className="border-t border-line px-4 py-3 font-mono text-[10px] leading-relaxed text-dim">Concept preview · transcript facts are computed from the loaded arrays.</div>
    </aside>
  );
}

function PortalGrid({ data }) {
  if (!data) return null;
  const metadata = [["dataset", data.dataset], ["source", data.source], ["seed", data.seed], ["neighbors", data.neighbors]];
  return (
    <section id="portal" className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[11px] uppercase tracking-[0.32em] text-violet">Portal modules</p><h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">A workbench, not a brochure.</h2></div><p className="max-w-sm text-sm leading-relaxed text-dim">Every preview below is tied to the same loaded GBM3 data or image asset.</p></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="overflow-hidden rounded-[3px] border border-line bg-panel"><div className="flex items-center justify-between border-b border-line px-4 py-3"><h3 className="text-sm text-snow">Cell populations</h3><span className="font-mono text-[9px] uppercase tracking-wider text-dim">portal preview</span></div><CloudCanvas data={data} tab="spatial" marker="EGFR" animate={false} className="h-44 w-full" /><p className="border-t border-line px-4 py-3 font-mono text-[10px] text-dim">Spatial · domain color</p></article>
        <article className="overflow-hidden rounded-[3px] border border-line bg-panel"><div className="flex items-center justify-between border-b border-line px-4 py-3"><h3 className="text-sm text-snow">Integrated maps</h3><span className="font-mono text-[9px] uppercase tracking-wider text-dim">portal preview</span></div><div className="px-4 pt-4"><DomainBars data={data} /></div><p className="border-t border-line px-4 py-3 font-mono text-[10px] text-dim">BANKSY domain counts</p></article>
        <article className="overflow-hidden rounded-[3px] border border-line bg-panel"><div className="flex items-center justify-between border-b border-line px-4 py-3"><h3 className="text-sm text-snow">Metadata</h3><span className="font-mono text-[9px] uppercase tracking-wider text-dim">portal preview</span></div><dl className="divide-y divide-line px-4 py-2">{metadata.map(([key, value]) => <div key={key} className="py-2"><dt className="font-mono text-[9px] uppercase tracking-wider text-dim">{key}</dt><dd className="mt-1 break-words text-[11px] leading-relaxed text-snow/80">{String(value)}</dd></div>)}</dl></article>
        <article className="overflow-hidden rounded-[3px] border border-line bg-panel"><div className="flex items-center justify-between border-b border-line px-4 py-3"><h3 className="text-sm text-snow">Imaging</h3><span className="font-mono text-[9px] uppercase tracking-wider text-dim">portal preview</span></div><img src="gbm/GBM3_he.jpg" alt="GBM3 H and E tissue image" className="h-44 w-full object-cover" /><p className="border-t border-line px-4 py-3 font-mono text-[10px] text-dim">10x Genomics Visium, GBM</p></article>
      </div>
    </section>
  );
}

export default function PortalV3() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("spatial");
  const [marker, setMarker] = useState("EGFR");
  const [error, setError] = useState(false);
  useEffect(() => {
    let mounted = true;
    fetch(DATA_URL).then((response) => response.ok ? response.json() : Promise.reject(new Error("dataset unavailable"))).then((json) => { if (mounted) setData(json); }).catch(() => { if (mounted) setError(true); });
    return () => { mounted = false; };
  }, []);
  const pointCount = data?.labels.length;
  return (
    <main className="min-h-screen overflow-hidden bg-ink text-snow grain">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_5%,rgba(20,184,166,.12),transparent_34%),radial-gradient(ellipse_at_85%_45%,rgba(245,158,11,.06),transparent_30%)]" />
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10"><a href="#top" aria-label="Artemis BioLabs, top of page"><img src="artemis_lockup.svg" alt="Artemis BioLabs" className="h-8 w-auto md:h-10" /></a><div className="flex items-center gap-5"><a href="#portal" className="hidden text-sm text-dim transition-colors hover:text-snow sm:block">Portal modules</a><a href={BOOKING} target="_blank" rel="noreferrer" className="rounded-[3px] border border-violet/70 bg-violet-deep px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-violet focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet">Book a demo</a></div></nav>
      <section id="top" className="mx-auto max-w-7xl px-5 pb-16 pt-10 md:px-10 md:pb-24 md:pt-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-0">
          <div className="lg:pr-10"><p className="font-mono text-[11px] uppercase tracking-[0.35em] text-violet">Artemis BioLabs · agentic portal</p><h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.045em] md:text-7xl">Your dataset is already <span className="text-gradient">a place to work.</span></h1><p className="mt-6 max-w-2xl text-lg leading-relaxed text-dim">A live GBM3 workbench, guided by a recorded agent run. Explore the same observations the agent is narrating, then bring us your first analysis.</p></div>
          <div className="self-end border-l border-line pl-5 font-mono text-[11px] leading-relaxed text-dim"><p className="text-snow">{data?.dataset || "GBM3"} · {pointCount ? `${pointCount.toLocaleString()} observations` : "loading observations"}</p><p className="mt-2">Ren et al. 2023 (GSE194329)</p><p className="mt-2 text-violet">● live portal canvas</p></div>
        </div>
        <div className="mt-10 overflow-hidden rounded-[4px] border border-line bg-panel shadow-2xl shadow-black/30">
          <div className="grid min-h-[600px] lg:grid-cols-[minmax(0,1fr)_350px]">
            <section className="relative flex min-w-0 flex-col" aria-label="GBM3 data viewer">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-ink-2 px-4 py-3"><div role="tablist" aria-label="Viewer mode" className="flex rounded-[3px] border border-line p-1">{VIEW_TABS.map(([id, label], index) => <button key={id} type="button" role="tab" aria-controls="gbm3-viewer-panel" aria-selected={tab === id} tabIndex={tab === id ? 0 : -1} onKeyDown={(event) => { if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) { event.preventDefault(); const next = event.key === "Home" ? 0 : event.key === "End" ? VIEW_TABS.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + VIEW_TABS.length) % VIEW_TABS.length; setTab(VIEW_TABS[next][0]); event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next].focus(); } }} onClick={() => setTab(id)} className={`rounded-[2px] px-3 py-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-violet ${tab === id ? "bg-violet-deep text-ink" : "text-dim hover:text-snow"}`}>{label}</button>)}</div><div className="flex items-center gap-1" aria-label="Expression marker controls">{MARKERS.map((name) => <button key={name} type="button" onClick={() => { setMarker(name); setTab("expression"); }} aria-pressed={marker === name && tab === "expression"} className={`rounded-full border px-2.5 py-1 font-mono text-[10px] transition-colors focus-visible:outline-2 focus-visible:outline-violet ${marker === name && tab === "expression" ? "border-violet bg-violet/10 text-violet" : "border-line text-dim hover:text-snow"}`}>{name}</button>)}</div></div>
              <div id="gbm3-viewer-panel" role="tabpanel" className="relative min-h-[420px] flex-1 bg-[#0a0a11]"><CloudCanvas data={data} tab={tab} marker={marker} className="absolute inset-0 h-full w-full" />{!data && !error && <LoadingShell />}{error && <div className="absolute inset-0 grid place-items-center p-8 text-center text-sm text-dim">The portal dataset could not be loaded.</div>}<div className="pointer-events-none absolute bottom-4 left-4 rounded-[3px] border border-line bg-ink/85 px-3 py-2 font-mono text-[10px] leading-relaxed text-dim"><p className="text-snow">{tab === "umap" ? "UMAP embedding" : tab === "expression" ? `${marker} expression` : "Tissue coordinates"}</p><p>{pointCount ? `${pointCount.toLocaleString()} canvas points` : "Preparing canvas"}</p></div><div className="pointer-events-none absolute right-4 top-4 rounded-[3px] border border-line bg-ink/85 px-3 py-2 font-mono text-[10px] text-dim">GBM3 · portal preview</div></div>
              <div className="grid grid-cols-2 divide-x divide-line border-t border-line text-[11px] text-dim sm:grid-cols-4"><div className="px-4 py-3"><span className="block font-mono text-[9px] uppercase tracking-wider">view</span><span className="mt-1 block text-snow">{tab}</span></div><div className="px-4 py-3"><span className="block font-mono text-[9px] uppercase tracking-wider">color</span><span className="mt-1 block text-snow">{tab === "expression" ? marker : "domain"}</span></div><div className="px-4 py-3"><span className="block font-mono text-[9px] uppercase tracking-wider">source</span><span className="mt-1 block text-snow">{data?.source || "—"}</span></div><div className="px-4 py-3"><span className="block font-mono text-[9px] uppercase tracking-wider">motion</span><span className="mt-1 block text-snow">canvas</span></div></div>
            </section>
            <AgentRail data={data} setTab={setTab} setMarker={setMarker} />
          </div>
        </div>
      </section>
      <PortalGrid data={data} />
      <section className="border-y border-line bg-ink-2"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:grid-cols-[0.85fr_1.15fr] md:px-10"><div><p className="font-mono text-[11px] uppercase tracking-[0.32em] text-violet">A core, made legible</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">The analysis should feel close at hand.</h2></div><div className="grid gap-3 sm:grid-cols-3">{[["01", "Shared context", "Start from the sample, source, and parameters already attached to the work."], ["02", "Visible reasoning", "A recorded run makes the changing view and its data context easy to inspect."], ["03", "A human next step", "When you are ready, bring the first analysis to an Artemis team."]].map(([number, title, text]) => <article key={number} className="border-l border-line pl-4"><p className="font-mono text-[10px] text-violet">{number}</p><h3 className="mt-2 text-sm text-snow">{title}</h3><p className="mt-2 text-sm leading-relaxed text-dim">{text}</p></article>)}</div></div></section>
      <section className="mx-auto max-w-7xl px-5 py-20 text-center md:px-10 md:py-28"><p className="font-mono text-[11px] uppercase tracking-[0.32em] text-violet">Artemis BioLabs</p><h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">Computational biology, accelerated.</h2><p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-dim">Every core service your lab needs. One AI-powered team.</p><a href={BOOKING} target="_blank" rel="noreferrer" className="mt-8 inline-flex rounded-[3px] bg-violet-deep px-6 py-3 font-medium text-ink transition-colors hover:bg-violet focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet">Book a demo</a><p className="mt-4 font-mono text-xs text-dim">The first analysis is on us.</p></section>
    </main>
  );
}
