"use client";

import { useEffect, useRef, useState } from "react";

// A live terminal that REPLAYS the real GBM3 session — typed command, staged
// progress, real state counts, grounded chat. Values mirror output/GBM3.
const TEAL = "#5eead4";
const DIM = "#8b87a0";
const MINT = "#86efac";
const AMBER = "#fcd34d";

const BARS = [
  ["load + preprocess", 900],
  ["BANKSY embedding  λ=0.2", 1500],
  ["Leiden clustering", 800],
  ["cell-state calls · qwen3", 1200],
  ["Vitessce portal + zarr", 700],
];

// the in-silico bench — whimsical wet-lab verbs while the pipeline cooks
const VERBS = [
  "titrating buffers…",
  "hybridizing probes…",
  "phosphorylating the backbone…",
  "annealing neighborhoods…",
  "spinning down barcodes…",
  "blocking nonspecific clusters…",
  "eluting marker genes…",
  "imaging the virtual slide…",
];

function BenchVerb({ running }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setI((v) => (v + 1) % VERBS.length), 850);
    return () => clearInterval(t);
  }, [running]);
  if (!running) return null;
  return (
    <div style={{ color: "#6c6880", fontStyle: "italic" }}>
      {"  "}⌁ {VERBS[i]}
    </div>
  );
}

function Bar({ label, dur, onDone, active }) {
  const [p, setP] = useState(0);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  useEffect(() => {
    // latch: once a bar completes it stays complete — parent re-renders must
    // never restart t0 (that made stages finish out of order).
    if (!active || doneRef.current) return;
    const t0 = performance.now();
    let raf;
    const step = (now) => {
      const f = dur <= 0 ? 1 : Math.min(1, (now - t0) / dur);
      setP(f);
      if (f < 1) raf = requestAnimationFrame(step);
      else {
        doneRef.current = true;
        onDoneRef.current();
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, dur]);
  const n = 22;
  const filled = Math.max(0, Math.min(n, Math.round((Number.isFinite(p) ? p : 1) * n)));
  return (
    <div>
      <span style={{ color: p >= 1 ? MINT : DIM }}>{p >= 1 ? "✓ " : "  "}</span>
      <span style={{ color: DIM }}>{label.padEnd(26, " ")}</span>
      <span style={{ color: TEAL }}>{"━".repeat(filled)}</span>
      <span style={{ color: "#3a3650" }}>{"─".repeat(n - filled)}</span>
      <span style={{ color: DIM }}> {Math.round(p * 100)}%</span>
    </div>
  );
}

export default function TerminalLive() {
  const [phase, setPhase] = useState(0); // 0 idle, 1 typing, 2+ = bar index+2, 100 table, 101 chat
  const [typed, setTyped] = useState("");
  const [chatTyped, setChatTyped] = useState("");
  const boxRef = useRef(null);
  const reduced = useRef(false);

  const CMD = "artemis run --input GBM3.h5ad --tissue-context glioblastoma";
  const CHAT_A =
    "Hypoxia-linked VEGFA is strongest in the endothelial-annotated domain and spatially contiguous — Moran's I 0.62 on this section's k-NN graph.";

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) {
      setTyped(CMD); setChatTyped(CHAT_A); setPhase(102);
      return;
    }
    const io = new IntersectionObserver((e) => {
      if (e[0].isIntersecting) { setPhase((p) => (p === 0 ? 1 : p)); io.disconnect(); }
    }, { rootMargin: "-60px" });
    if (boxRef.current) io.observe(boxRef.current);
    return () => io.disconnect();
  }, []);

  // type the command
  useEffect(() => {
    if (phase !== 1) return;
    if (typed.length < CMD.length) {
      const t = setTimeout(() => setTyped(CMD.slice(0, typed.length + 1)), 26);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase(2), 350);
    return () => clearTimeout(t);
  }, [phase, typed]);

  // type the chat answer
  useEffect(() => {
    if (phase !== 101) return;
    if (chatTyped.length < CHAT_A.length) {
      const t = setTimeout(() => setChatTyped(CHAT_A.slice(0, chatTyped.length + 2)), 14);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase(102), 400);
    return () => clearTimeout(t);
  }, [phase, chatTyped]);

  // loop after a hold
  useEffect(() => {
    if (phase !== 102 || reduced.current) return;
    const t = setTimeout(() => { setTyped(""); setChatTyped(""); setPhase(1); }, 7000);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: 1e6 });
  });

  const barDone = (i) => () => setPhase(i + 2 === BARS.length + 1 ? 100 : i + 3);
  useEffect(() => {
    if (phase !== 100) return;
    const t = setTimeout(() => setPhase(101), 900);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div className="rounded-lg border border-snow/60 overflow-hidden">
      <div className="flex items-center gap-1.5 bg-ink-2 border-b border-line px-4 py-2.5" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="ml-3 font-mono text-[12px] text-dim">artemis — zsh</span>
      </div>
      <div
        ref={boxRef}
        className="bg-[#12101d] px-5 py-4 font-mono text-[13px] leading-[1.75] h-[380px] overflow-hidden whitespace-pre-wrap"
        role="img"
        aria-label="Terminal replay of the Artemis pipeline running on the GBM3 section"
      >
        <div>
          <span style={{ color: DIM }}>$ </span>
          <span style={{ color: "#efeef8" }}>{typed}</span>
          {phase === 1 && <span className="animate-pulse" style={{ color: TEAL }}>▍</span>}
        </div>
        {phase >= 2 && (
          <div style={{ color: DIM }}>
            {"\n"}  <span style={{ color: TEAL, fontWeight: 700 }}>ARTEMIS</span> BioLabs · spatial pipeline · artemislabs.bio
            {"\n"}  input: GBM3.h5ad · 1,775 spots × 36,601 genes · Visium{"\n\n"}
          </div>
        )}
        {BARS.map(([label, dur], i) =>
          phase >= i + 2 ? (
            <Bar key={label} label={label} dur={reduced.current ? 0 : dur} active={phase === i + 2 || phase > i + 2} onDone={barDone(i)} />
          ) : null
        )}
        <BenchVerb running={phase >= 2 && phase < 100} />
        {phase >= 100 && (
          <div>
            {"\n"}<span style={{ color: "#efeef8", fontWeight: 700 }}>  16 domains → 7 cell states</span>
            {"\n"}<span style={{ color: TEAL }}>  oligodendrocytes</span><span style={{ color: DIM }}>      453   </span>
            <span style={{ color: TEAL }}>NPC-like tumor</span><span style={{ color: DIM }}>       439</span>
            {"\n"}<span style={{ color: TEAL }}>  endothelial</span><span style={{ color: DIM }}>           247   </span>
            <span style={{ color: TEAL }}>astrocytes</span><span style={{ color: DIM }}>           244</span>
            {"\n"}<span style={{ color: MINT }}>  ✓</span><span style={{ color: DIM }}> portal   output/GBM3/portal.html · provenance: qwen3:8b, local</span>
          </div>
        )}
        {phase >= 101 && (
          <div>
            {"\n"}<span style={{ color: DIM }}>$ </span><span style={{ color: "#efeef8" }}>artemis chat "which regions look hypoxic?"</span>
            {"\n"}<span style={{ color: AMBER }}>  ● </span><span style={{ color: DIM }}>qwen3:8b · local · grounded on output/GBM3</span>
            {"\n"}<span style={{ color: "#cfcde0" }}>  {chatTyped}</span>
            {phase === 101 && <span className="animate-pulse" style={{ color: TEAL }}>▍</span>}
          </div>
        )}
      </div>
    </div>
  );
}
