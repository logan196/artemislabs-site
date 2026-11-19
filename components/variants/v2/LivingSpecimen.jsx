"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const BOOKING =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0FzlJl55WV52jaH-JEG8_xJLO5YLd20t2ksXikjwMfGnVQ-zLI4XUCAmHTFiLE1tnQgAIxBhjW";

const STATE_COLORS = ["#38bdf8", "#e879f9", "#f59e0b", "#fb7185", "#34d399", "#a78bfa"];
const DEPTHS = [-0.34, 0.18, 0.42, 0.06, -0.18, 0.3];

function gfapColor(value) {
  const t = Math.max(0, Math.min(1, value));
  const stops = [
    [34, 211, 238],
    [168, 85, 247],
    [245, 158, 11],
  ];
  const scaled = t * 2;
  const a = stops[scaled < 1 ? 0 : 1];
  const b = stops[scaled < 1 ? 1 : 2];
  const mix = scaled < 1 ? scaled : scaled - 1;
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * mix)}, ${Math.round(a[1] + (b[1] - a[1]) * mix)}, ${Math.round(a[2] + (b[2] - a[2]) * mix)})`;
}

function number(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default function LivingSpecimen() {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const sceneRef = useRef({
    data: null,
    hidden: new Set(),
    gfap: false,
    reduced: false,
    pointer: { x: 0, y: 0, active: false },
    positions: [],
    selected: -1,
    needsDraw: true,
  });
  const [data, setData] = useState(null);
  const [hidden, setHidden] = useState([]);
  const [gfap, setGfap] = useState(false);
  const [inspect, setInspect] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let live = true;
    fetch("banksy_gbm1.json")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Specimen unavailable"))))
      .then((result) => {
        if (!live) return;
        result.gfapColors = result.spots.map((spot) => gfapColor(spot[3]));
        sceneRef.current.data = result;
        sceneRef.current.needsDraw = true;
        sceneRef.current.redraw?.();
        setData(result);
      })
      .catch(() => live && setLoadError(true));
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d");
    const scene = sceneRef.current;
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    scene.reduced = reducedQuery.matches;
    let lastSize = "";

    const draw = (now) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      const sizeKey = `${Math.round(width)}x${Math.round(height)}@${dpr}`;
      if (sizeKey !== lastSize) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        lastSize = sizeKey;
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      const specimen = scene.data;
      if (!specimen) {
        context.fillStyle = "rgba(148,163,184,.72)";
        context.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
        context.textAlign = "center";
        context.fillText("LOADING VISIUM SPECIMEN…", width / 2, height / 2);
        context.textAlign = "left";
        if (!scene.reduced) frameRef.current = requestAnimationFrame(draw);
        return;
      }

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.405;
      const breathe = scene.reduced ? 1 : 1 + Math.sin(now * 0.00115) * 0.018;
      const tiltX = scene.pointer.active && !scene.reduced ? scene.pointer.x * 0.042 : 0;
      const tiltY = scene.pointer.active && !scene.reduced ? scene.pointer.y * 0.042 : 0;

      const aura = context.createRadialGradient(cx, cy, radius * 0.12, cx, cy, radius * 1.2);
      aura.addColorStop(0, "rgba(20,184,166,.16)");
      aura.addColorStop(0.58, "rgba(20,184,166,.045)");
      aura.addColorStop(1, "rgba(20,184,166,0)");
      context.fillStyle = aura;
      context.fillRect(0, 0, width, height);
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.fillStyle = "rgba(4,10,14,.64)";
      context.fill();
      context.save();
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.clip();

      scene.positions = new Array(specimen.spots.length);
      for (let i = 0; i < specimen.spots.length; i += 1) {
        const [x, y, state] = specimen.spots[i];
        const depth = DEPTHS[state] || 0;
        const drift = scene.reduced ? 0 : Math.sin(now * 0.00075 + i * 0.43) * 0.62;
        const px = cx + (x - 0.5) * radius * 1.86 * breathe + tiltX * depth + drift;
        const py = cy + (y - 0.5) * radius * 1.86 * breathe + tiltY * depth + drift * 0.45;
        scene.positions[i] = [px, py];
        const isVisible = !scene.hidden.has(state);
        const isSelected = i === scene.selected;
        context.globalAlpha = isVisible ? (isSelected ? 1 : 0.79) : 0.045;
        context.fillStyle = scene.gfap ? specimen.gfapColors[i] : STATE_COLORS[state];
        context.beginPath();
        context.arc(px, py, isSelected ? 3.6 : 1.35 + Math.max(0, depth), 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
      if (scene.selected >= 0 && scene.positions[scene.selected]) {
        const [px, py] = scene.positions[scene.selected];
        context.beginPath();
        context.arc(px, py, 7.5, 0, Math.PI * 2);
        context.strokeStyle = "rgba(248,250,252,.95)";
        context.lineWidth = 1.3;
        context.stroke();
      }
      context.restore();
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.strokeStyle = "rgba(148,163,184,.28)";
      context.lineWidth = 1;
      context.stroke();
      context.beginPath();
      context.arc(cx, cy, radius + 9, 0, Math.PI * 2);
      context.strokeStyle = "rgba(20,184,166,.17)";
      context.lineWidth = 1;
      context.stroke();

      if (!scene.reduced) frameRef.current = requestAnimationFrame(draw);
    };

    const redraw = () => {
      scene.needsDraw = true;
      if (scene.reduced) draw(performance.now());
    };
    scene.redraw = redraw;
    const onReducedChange = (event) => {
      scene.reduced = event.matches;
      cancelAnimationFrame(frameRef.current);
      draw(performance.now());
    };
    const resize = () => redraw();
    reducedQuery.addEventListener("change", onReducedChange);
    window.addEventListener("resize", resize);
    draw(performance.now());
    return () => {
      cancelAnimationFrame(frameRef.current);
      delete scene.redraw;
      reducedQuery.removeEventListener("change", onReducedChange);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const counts = useMemo(() => {
    if (!data) return [];
    return data.spots.reduce((accumulator, spot) => {
      accumulator[spot[2]] = (accumulator[spot[2]] || 0) + 1;
      return accumulator;
    }, Array(data.states.length).fill(0));
  }, [data]);

  const toggleState = (index) => {
    const scene = sceneRef.current;
    if (scene.hidden.has(index)) scene.hidden.delete(index);
    else scene.hidden.add(index);
    setHidden([...scene.hidden]);
    scene.redraw?.();
  };

  const toggleGfap = () => {
    const next = !sceneRef.current.gfap;
    sceneRef.current.gfap = next;
    setGfap(next);
    sceneRef.current.redraw?.();
  };

  const moveSpecimen = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    sceneRef.current.pointer = {
      x: (event.clientX - rect.left - rect.width / 2) / (rect.width / 2),
      y: (event.clientY - rect.top - rect.height / 2) / (rect.height / 2),
      active: true,
    };
    sceneRef.current.redraw?.();
  };

  const selectSpot = (event) => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let nearest = -1;
    let closest = 11 * 11;
    sceneRef.current.positions.forEach(([px, py], index) => {
      const dx = px - x;
      const dy = py - y;
      const distance = dx * dx + dy * dy;
      if (distance < closest && !sceneRef.current.hidden.has(data.spots[index][2])) {
        closest = distance;
        nearest = index;
      }
    });
    if (nearest >= 0) {
      sceneRef.current.selected = nearest;
      const spot = data.spots[nearest];
      setSelected({ index: nearest, state: spot[2], gfap: spot[3] });
      if (!inspect) setInspect(true);
      sceneRef.current.redraw?.();
    }
  };

  const maxCount = Math.max(...counts, 1);
  const buttonClass = "rounded-[3px] border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet";

  return (
    <main className="grain min-h-screen overflow-hidden bg-ink text-snow selection:bg-violet selection:text-ink">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_24%,rgba(20,184,166,0.1),transparent_25%),radial-gradient(circle_at_90%_65%,rgba(245,158,11,0.06),transparent_22%),#07060b]" aria-hidden />
      <a href="#specimen" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[3px] focus:bg-violet focus:px-4 focus:py-2 focus:text-ink">Skip to specimen</a>

      <nav className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 md:px-10">
        <a href="#top" aria-label="Artemis BioLabs home">
          <img src="artemis_lockup.svg" alt="Artemis BioLabs" className="h-8 w-auto md:h-9" />
        </a>
        <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-dim md:gap-7">
          <a href="#services" className="hidden hover:text-snow md:inline">Cores</a>
          <a href="#images" className="hidden hover:text-snow md:inline">Tissue views</a>
          <a href={BOOKING} target="_blank" rel="noreferrer" className="rounded-[3px] border border-violet/60 px-3 py-2 text-violet hover:bg-violet hover:text-ink">Book a conversation</a>
        </div>
      </nav>

      <section id="top" className="mx-auto max-w-[1440px] px-5 pb-20 pt-8 md:px-10 md:pb-28 md:pt-14">
        <div className="mb-7 max-w-2xl md:mb-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-violet">Live specimen / GBM1</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-tight sm:text-6xl xl:text-7xl">Computational biology, <span className="text-gradient">in its native state.</span></h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-dim md:text-lg">Every core service your lab needs. One AI-powered team. Start by touching the specimen.</p>
        </div>

        <div id="specimen" className={`relative mt-7 grid items-center gap-5 transition-[grid-template-columns] duration-500 lg:mt-1 ${inspect ? "lg:grid-cols-[minmax(0,1fr)_360px]" : "lg:grid-cols-1"}`}>
          <div className={`relative min-w-0 transition-all duration-500 ${inspect ? "lg:mr-3" : "mx-auto w-full max-w-5xl"}`}>
            <div className="pointer-events-none absolute inset-[12%] rounded-full bg-violet/10 blur-[90px]" aria-hidden />
            <div className="relative rounded-[5px] border border-line bg-white/[0.018] p-3 shadow-[0_24px_100px_rgba(0,0,0,.35)] backdrop-blur-sm md:p-5">
              <div className="flex items-center justify-between border-b border-line pb-3 font-mono text-[9px] uppercase tracking-[0.22em] text-dim">
                <span>Confocal viewport</span>
                <span className="text-violet">{data ? `${number(data.spots.length)} spots` : "Initializing"}</span>
              </div>
              <div className="relative mx-auto aspect-square max-h-[58svh] w-full max-w-[720px]">
                <canvas
                  ref={canvasRef}
                  onPointerMove={moveSpecimen}
                  onPointerLeave={() => { sceneRef.current.pointer.active = false; sceneRef.current.redraw?.(); }}
                  onClick={selectSpot}
                  className="h-full w-full cursor-crosshair touch-pan-y outline-none"
                  role="img"
                  tabIndex="0"
                  aria-label="Interactive GBM1 Visium spot specimen. Move the pointer to shift focal depth, click a spot to inspect it."
                />
                {loadError && <p className="absolute inset-0 grid place-items-center font-mono text-xs text-magma">Specimen could not be loaded.</p>}
              </div>
              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-3">
                <div className="pointer-events-none font-mono text-[9px] uppercase tracking-[0.19em] text-dim"><span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-violet shadow-[0_0_9px_#14b8a6]" />Pointer shifts focal plane · click to inspect</div>
                <button type="button" onClick={() => setInspect((value) => !value)} aria-expanded={inspect} className="rounded-[3px] border border-violet/60 bg-ink/80 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-violet backdrop-blur hover:bg-violet hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-snow">
                  {inspect ? "Close readout" : "Inspect specimen"} <span aria-hidden>→</span>
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-2" aria-label="Fluorescence channel controls">
              {data?.states.map((state, index) => {
                const off = hidden.includes(index);
                return <button key={state} type="button" onClick={() => toggleState(index)} aria-pressed={!off} className={`${buttonClass} ${off ? "border-white/10 bg-transparent text-dim/45" : "border-white/15 bg-white/[0.045] text-snow hover:border-white/40"}`}><span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full" style={{ background: STATE_COLORS[index], opacity: off ? 0.28 : 1 }} />CH{index + 1} · {state}</button>;
              })}
              <button type="button" onClick={toggleGfap} aria-pressed={gfap} className={`${buttonClass} ${gfap ? "border-magma/70 bg-magma/15 text-magma" : "border-white/15 bg-white/[0.045] text-dim hover:text-snow"}`}>GFAP · {gfap ? "on" : "off"}</button>
            </div>
          </div>

          <aside className={`overflow-hidden rounded-[5px] border border-line bg-panel/70 transition-all duration-500 ${inspect ? "max-h-[900px] opacity-100" : "max-h-0 border-transparent opacity-0 lg:absolute"}`} aria-label="Specimen readout">
            <div className="border-b border-line px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-violet">Specimen readout</p>
              <p className="mt-2 text-sm text-dim">10x Genomics Visium, GBM</p>
            </div>
            <div className="space-y-5 p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[3px] border border-line bg-ink/40 p-3"><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-dim">Spots counted</p><p className="mt-1 text-xl font-medium">{data ? number(data.spots.length) : "—"}</p></div>
                <div className="rounded-[3px] border border-line bg-ink/40 p-3"><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-dim">GFAP p99</p><p className="mt-1 text-xl font-medium">{data?.gfap?.p99 ?? "—"}</p></div>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim">State composition</p>
                <div className="mt-3 space-y-2.5">
                  {data?.states.map((state, index) => <div key={state} className="grid grid-cols-[1fr_auto] gap-x-3 text-[11px]"><div className="min-w-0"><div className="mb-1 flex justify-between gap-2"><span className="truncate text-snow/85">{state}</span><span className="font-mono text-dim">{number(counts[index])}</span></div><div className="h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${(counts[index] / maxCount) * 100}%`, background: STATE_COLORS[index] }} /></div></div></div>)}
                </div>
              </div>
              <div className="border-t border-line pt-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim">Selected spot</p>
                {selected ? <p className="mt-2 text-sm leading-relaxed"><span style={{ color: STATE_COLORS[selected.state] }}>{data?.states[selected.state]}</span><br /><span className="font-mono text-xs text-dim">GFAP {selected.gfap}</span></p> : <p className="mt-2 text-sm text-dim">Click any visible spot in the field.</p>}
              </div>
              <p className="font-mono text-[9px] leading-relaxed tracking-[0.1em] text-dim">GFAP scale: {data?.gfap?.norm || "loading"}</p>
            </div>
          </aside>
        </div>
      </section>

      <section id="services" className="border-y border-line bg-ink-2/80 px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-violet">Core capabilities</p>
          <div className="mt-4 flex flex-col justify-between gap-5 md:flex-row md:items-end"><h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">One embedded team, from raw signal to a result your lab can use.</h2><p className="max-w-sm text-sm leading-relaxed text-dim">Every core is shaped around the study, assay, and the people who will use the result.</p></div>
          <div className="mt-12 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "Single-cell", "Raw reads to annotated atlases and iPSC benchmarking."],
              ["02", "Spatial transcriptomics", "Cells mapped on tissue."],
              ["03", "CUT&Tag and chromatin", "Peaks, tracks, and differential binding."],
              ["04", "Long-read sequencing", "Isoforms, structural variants, and methylation."],
              ["05", "Radiomics and imaging", "Segmentation to outcome models."],
              ["06", "Calcium imaging", "Wave detection without hand scoring."],
              ["07", "Clinical data and biostatistics", "Cohorts, trials, and survival models."],
              ["08", "Custom apps: DNA Studio", "Plasmid maps from SnapGene files."],
            ].map(([id, title, description]) => <article key={id} className="min-h-48 border-b border-r border-line p-5 transition-colors hover:bg-white/[0.035]"><p className="font-mono text-[10px] text-violet">{id}</p><h3 className="mt-9 text-lg font-medium">{title}</h3><p className="mt-2 text-sm leading-relaxed text-dim">{description}</p></article>)}
          </div>
        </div>
      </section>

      <section id="images" className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[0.35em] text-violet">Tissue views</p><h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">The image stays attached to the data.</h2></div><p className="max-w-sm text-sm leading-relaxed text-dim">Hover or focus each view to reveal its corresponding overlay.</p></div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {["GBM1", "GBM2", "GBM3"].map((sample) => <figure key={sample} className="group relative aspect-[4/3] overflow-hidden rounded-[4px] border border-line bg-panel" tabIndex="0"><img src={`gbm/${sample}_he.jpg`} alt={`${sample} H&E tissue image`} className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0 group-focus:opacity-0" /><img src={`gbm/${sample}_overlay.jpg`} alt={`${sample} tissue overlay`} className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus:opacity-100" /><figcaption className="absolute bottom-0 left-0 right-0 flex justify-between bg-ink/75 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] backdrop-blur"><span>{sample}</span><span className="text-violet">H&E / overlay</span></figcaption></figure>)}
        </div>
      </section>

      <section id="contact" className="border-t border-line px-5 py-24 text-center md:px-10 md:py-32">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-violet">Your first analysis is on us</p>
        <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-tight md:text-6xl">Bring us the question that will not fit in a spreadsheet.</h2>
        <a href={BOOKING} target="_blank" rel="noreferrer" className="mt-9 inline-flex rounded-[3px] bg-violet-deep px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-violet focus-visible:outline focus-visible:outline-2 focus-visible:outline-snow">Book a conversation <span className="ml-3">→</span></a>
      </section>
    </main>
  );
}
