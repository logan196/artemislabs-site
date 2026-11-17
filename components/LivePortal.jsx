"use client";

import { useEffect, useRef, useState } from "react";
import FigureLightbox from "./FigureLightbox";

// Okabe–Ito, minus black (it disappears on the teal field).
const OKABE = ["#E69F00", "#56B4E9", "#009E73", "#F0E442", "#0072B2", "#D55E00", "#CC79A7", "#F7F4EA"];

const SLIDES = [
  {
    src: "demo/still_GBM1_portal.png",
    alt: "Artemis BioLabs portal: GBM1 open with linked UMAP and spatial scatterplots, cell-set controls, gene list, Moran's heatmap and the copilot rail",
    kicker: "Linked views",
    title: "GBM1 in the portal",
    body: "UMAP and the spatial scatter share one selection. Captured from the GBM1 demo.",
  },
  {
    src: "programs/at4_domains.jpg",
    alt: "BANKSY spatial domains — AT4-FO-2",
    kicker: "Spatial",
    title: "BANKSY domains",
    body: "Section AT4-FO-2 from the glioblastoma figure on this page.",
  },
  {
    src: "analysis/GBM1_umap_pair.jpg",
    alt: "GBM1: UMAP of the BANKSY embedding beside the spatial section, both colored by putative cell state",
    kicker: "Embedding",
    title: "UMAP beside tissue",
    body: "GBM1 — the BANKSY-embedding UMAP beside the tissue, one color per putative cell state.",
  },
  {
    src: "analysis/morphology_strip.jpg",
    alt: "Histological morphology of two glioma sections at three zoom levels",
    kicker: "Morphology",
    title: "The same section, closer",
    body: "H&E at three zoom levels. Top: AT15, de Jong et al. Bottom: GBM2, Ren et al.",
  },
];

const AGENTS = [
  {
    name: "Spatial analyst",
    role: "Programs on tissue",
    intro: "Ask about the glioblastoma figure. I only replay what is already printed on this page.",
    fallback: "This preview only answers the two prompts. Nothing you type is sent to a model.",
    prompts: [
      {
        key: "hypox",
        label: "Hypoxia genes",
        q: "Which genes are in the hypoxia program on AT4?",
        a: "On AT4-FO-2 the hypoxia program is VEGFA, BNIP3L, SERPINE1 and HILPDA. The score is the mean scaled expression of those genes, averaged over each cell’s 15 nearest neighbours. Scripted from the figure caption.",
      },
      {
        key: "banksy",
        label: "BANKSY vs position",
        q: "How does BANKSY compare with position-only clustering?",
        a: "On AT4-FO-2 (126,738 cells) BANKSY domains track the authors’ hypoxia zones more closely than position-only clustering: NMI 0.37 vs 0.14. Scripted from the glioblastoma section.",
      },
    ],
  },
  {
    name: "Ingest agent",
    role: "Public NIH data",
    intro: "I describe the public archives this site already cites. I do not query NCBI from your browser.",
    fallback: "This preview only answers the two prompts. It does not reach GEO, SRA, or a model.",
    prompts: [
      {
        key: "geo",
        label: "GEO ledger",
        q: "What public NIH data can you ingest?",
        a: "NCBI GEO, queried 13 Nov 2026: 300,683 public studies, 8,836,174 deposited samples, and 2,198 spatial-transcriptomics series. This pane is replaying that ledger.",
      },
      {
        key: "glioma",
        label: "Glioma cohorts",
        q: "Which glioma cohorts are already in the portals?",
        a: "GSE194329 (Ren et al. 2023; GBM1–GBM4), the 10x Parent Visium section, and de Jong et al. Nature 2026 sections from gbmspace.org. Scripted from the portals linked on this page.",
      },
    ],
  },
  {
    name: "Benchmark agent",
    role: "Method comparison",
    intro: "I can restate the one method comparison published on this page. I cannot score a new run from here.",
    fallback: "This preview only answers the two prompts. A real comparison is scoped on a call, not in this console.",
    prompts: [
      {
        key: "nmi",
        label: "The NMI pair",
        q: "What benchmark number is on this site?",
        a: "One published comparison: on AT4-FO-2, BANKSY NMI 0.37 against the authors’ hypoxia zones, versus 0.14 for position-only clustering. Same numbers as the glioblastoma figure.",
      },
      {
        key: "ren",
        label: "Compare to Ren",
        q: "Can I compare my hypoxia program to Ren 2023?",
        a: "That question is what the benchmark work is for — your program beside a public cohort, same plots. This preview cannot run it. Book a call and we will scope it on your data.",
      },
    ],
  },
];

function HelixField() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const draw = (now) => {
      if (!running) return;
      const w = canvas.clientWidth || 600;
      const h = canvas.clientHeight || 320;
      const pw = Math.round(w * dpr);
      const ph = Math.round(h * dpr);
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const t = reduced ? 0.8 : now / 1000;
      const cx = w / 2;
      const cy = h / 2;
      const amp = Math.min(w, h) * 0.28;

      // faint archimedean spiral behind the helix
      ctx.beginPath();
      for (let i = 0; i < 220; i++) {
        const a = i * 0.18 + t * 0.35;
        const r = 8 + i * 0.55;
        const x = cx + Math.cos(a) * r * 0.55;
        const y = cy + Math.sin(a) * r * 0.28;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(247,244,234,0.16)";
      ctx.lineWidth = 1;
      ctx.stroke();

      const strands = 2;
      const n = 90;
      const dots = [];
      for (let s = 0; s < strands; s++) {
        for (let i = 0; i < n; i++) {
          const u = i / (n - 1);
          const ang = u * Math.PI * 7 + t * (0.7 + s * 0.05) + s * Math.PI;
          const y = (u - 0.5) * h * 0.78;
          const z = Math.sin(ang);
          const x = Math.cos(ang) * amp * (0.55 + 0.45 * (0.5 + 0.5 * Math.sin(u * Math.PI)));
          const persp = 0.55 + (z + 1) * 0.28;
          dots.push({
            x: cx + x * persp,
            y: cy + y,
            z,
            r: (1.5 + (z + 1) * 1.6) * (0.75 + 0.25 * Math.sin(u * 12 + t * 3)),
            c: OKABE[(i + s * 3) % OKABE.length],
            a: 0.35 + (z + 1) * 0.32,
          });
        }
      }
      dots.sort((a, b) => a.z - b.z);
      for (const d of dots) {
        ctx.beginPath();
        ctx.fillStyle = d.c;
        ctx.globalAlpha = d.a;
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        running = true;
        raf = requestAnimationFrame(draw);
      } else {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);
    raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}

function AgentPane({ agent }) {
  const [msgs, setMsgs] = useState(() => [{ role: "ai", text: agent.intro }]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef(null);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, busy]);

  function ask(text) {
    const q = text.trim();
    if (!q || busy) return;
    setDraft("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    const hit = agent.prompts.find((p) => q === p.q || q.toLowerCase().includes(p.key));
    const answer = hit ? hit.a : agent.fallback;
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 420;
    timers.current.push(setTimeout(() => {
      setMsgs((m) => [...m, { role: "ai", text: answer }]);
      setBusy(false);
    }, delay));
  }

  return (
    <form
      className="flex flex-col min-h-[280px] bg-[#042421]/80 p-3 md:p-4"
      onSubmit={(e) => { e.preventDefault(); ask(draft); }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[14px] font-semibold text-white leading-tight">{agent.name}</p>
          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#d7fff6]/75">{agent.role}</p>
        </div>
        <span className="font-mono text-[10px] text-[#d7fff6]/80 shrink-0">scripted</span>
      </div>
      <div ref={scroller} className="mt-3 flex-1 overflow-y-auto space-y-2 max-h-[180px] pr-1" aria-live="polite">
        {msgs.map((m, i) => (
          <p
            key={i}
            className={`text-[12.5px] leading-relaxed rounded-[8px] px-2.5 py-1.5 ${
              m.role === "user"
                ? "ml-4 bg-white/15 text-white"
                : "mr-3 bg-black/35 text-[#f4fffc]"
            }`}
          >
            {m.text}
          </p>
        ))}
        {busy && <p className="font-mono text-[10px] text-[#d7fff6]/70">writing…</p>}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {agent.prompts.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => ask(p.q)}
            className="rounded-full border border-white/25 px-2 py-0.5 font-mono text-[10px] text-white/90 hover:border-white hover:bg-white/10 transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5">
        <label className="sr-only" htmlFor={`ask-${agent.name}`}>{agent.name}</label>
        <input
          id={`ask-${agent.name}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask this agent…"
          maxLength={240}
          className="min-w-0 flex-1 rounded-[4px] border border-white/20 bg-black/40 px-2 py-1.5 text-[12.5px] text-white placeholder:text-white/45 focus:outline focus:outline-1 focus:outline-white"
        />
        <button type="submit" className="rounded-[4px] bg-[#f7f4ea] px-2.5 text-[12px] font-semibold text-[#06312e] hover:bg-white">
          Send
        </button>
      </div>
    </form>
  );
}

export default function LivePortal() {
  const [slide, setSlide] = useState(0);
  const [playing, setPlaying] = useState(true);
  const current = SLIDES[slide];

  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5600);
    return () => clearInterval(id);
  }, [playing]);

  const go = (next) => {
    setPlaying(false);
    setSlide((next + SLIDES.length) % SLIDES.length);
  };

  return (
    <section id="portal" className="relative overflow-hidden" style={{ background: "linear-gradient(165deg, #149688 0%, #0c6e68 46%, #084e4c 100%)" }}>
      <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden style={{ background: "radial-gradient(900px 420px at 50% 30%, rgba(255,255,255,0.18), transparent 70%)" }} />
      <div className="relative px-6 md:px-14 py-16 md:py-24 max-w-7xl mx-auto text-[#f7fffc]">
        <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-white/80">Product preview</p>
        <h2 className="mt-3 text-4xl md:text-6xl max-w-3xl text-white">
          Artemis BioLabs live portal
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-white/90 leading-relaxed">
          Several agents in one console, a helix of the run in the middle, and the
          slide reel underneath. This is a simulated preview — the replies are scripted
          and stay in your browser.
        </p>

        <div className="relative mt-10 rounded-[12px] border border-white/30 bg-[#063532]/55 shadow-[0_30px_80px_-36px_rgba(0,0,0,0.65)] overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/15 bg-black/20">
            <span className="inline-block h-2 w-2 rounded-full bg-[#b6ff6a] animate-pulse" aria-hidden />
            <span className="font-mono text-[11px] tracking-[0.16em] uppercase">Artemis portal · preview</span>
            <span className="hidden sm:inline font-mono text-[11px] text-white/70">3 agents · shared section</span>
            <a
              href="/"
              aria-label="Back to the main page"
              title="Back to the main page"
              className="home-mark ml-auto"
              onClick={(e) => {
                const path = window.location.pathname;
                if (path === "/" || path.endsWith("/index.html")) {
                  e.preventDefault();
                  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
                }
              }}
            >
              <img src="artemis_mark.svg" alt="" className="h-8 w-8" />
            </a>
          </div>

          <div className="relative h-[300px] md:h-[380px] bg-[#04211f]">
            <HelixField />
            <p className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] tracking-[0.2em] uppercase text-white/75">
              Helix · scripted field
            </p>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-0 border-t border-white/15 bg-[#042826]">
            <FigureLightbox src={current.src} alt={current.alt} caption={current.body} className="relative min-h-[220px] bg-black">
              <img
                key={current.src}
                src={current.src}
                alt=""
                className="h-full w-full object-cover object-left max-h-[320px] portal-slide"
              />
            </FigureLightbox>
            <div className="flex flex-col justify-between gap-4 p-5 md:p-6">
              <div>
                <p className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#b7fff0]">{current.kicker}</p>
                <p className="mt-2 text-2xl text-white" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>{current.title}</p>
                <p className="mt-2 text-[14.5px] leading-relaxed text-white/85">{current.body}</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => go(slide - 1)} className="rounded-[3px] border border-white/30 px-3 py-1.5 text-[13px] hover:bg-white/10" aria-label="Previous slide">
                    Prev
                  </button>
                  <button type="button" onClick={() => go(slide + 1)} className="rounded-[3px] border border-white/30 px-3 py-1.5 text-[13px] hover:bg-white/10" aria-label="Next slide">
                    Next
                  </button>
                  <button type="button" onClick={() => setPlaying((p) => !p)} className="rounded-[3px] border border-white/30 px-3 py-1.5 text-[13px] hover:bg-white/10">
                    {playing ? "Pause" : "Play"}
                  </button>
                  <span className="ml-auto font-mono text-[11px] text-white/70">{slide + 1} / {SLIDES.length}</span>
                </div>
                <label className="mt-3 block">
                  <span className="sr-only">Slide scrubber</span>
                  <input
                    type="range"
                    min={0}
                    max={SLIDES.length - 1}
                    step={1}
                    value={slide}
                    onChange={(e) => { setPlaying(false); setSlide(Number(e.target.value)); }}
                    className="w-full accent-[#f7f4ea]"
                    aria-valuetext={current.title}
                  />
                </label>
                <div className="mt-2 flex gap-2">
                  {SLIDES.map((s, i) => (
                    <button
                      key={s.src}
                      type="button"
                      aria-label={`Show slide ${i + 1}: ${s.title}`}
                      aria-current={i === slide}
                      onClick={() => go(i)}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${i === slide ? "bg-white" : "bg-white/30 hover:bg-white/55"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 border-t border-white/15">
            {AGENTS.map((agent) => (
              <div key={agent.name} className="md:[&:not(:last-child)]:border-r border-white/15 border-b md:border-b-0">
                <AgentPane agent={agent} />
              </div>
            ))}
          </div>
        </div>
        <p className="mt-4 text-[13px] text-white/75 leading-relaxed">
          Simulated console. Suggested replies quote figures and the GEO ledger already on this site.
          The dodecahedron at the right of the bar returns to the top of the page.
        </p>
      </div>
    </section>
  );
}
