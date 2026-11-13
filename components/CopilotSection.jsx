"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

// Every number below is real — from output/TenX_GBM/report.md and Moran's I
// computed by the portal's own live tool on that section.
const CHAT = [
  { role: "user", text: "Which regions look hypoxic in this section?" },
  {
    role: "ai",
    text: "Cluster 17 carries the hypoxia program — ADM, VEGFA and HILPDA all sit in its top-10 Wilcoxon markers. Spatially it forms one contiguous domain: VEGFA's Moran's I is 0.65 and ADM's 0.58 on the k-nearest-neighbor graph.",
  },
  { role: "user", text: "Any immune infiltration near it?" },
  {
    role: "ai",
    text: "Four domains annotate as microglia/TAMs — the largest spans 246 spots, and a 71-spot domain carries SPP1 and C1QB in its top markers. Want me to run DE between it and the rest of the section?",
  },
];

// phase timeline: [what becomes visible, at ms]
const TIMELINE = [
  { at: 500, shown: 1, typing: false },   // user asks
  { at: 1400, shown: 1, typing: true },   // co-scientist typing…
  { at: 4200, shown: 2, typing: false },  // reply lands
  { at: 5600, shown: 3, typing: false },  // user follows up
  { at: 6500, shown: 3, typing: true },
  { at: 9300, shown: 4, typing: false },
];

function TypingDots() {
  return (
    <div className="mr-auto rounded-2xl rounded-bl-md bg-[#e9e4d6] border border-line px-4 py-3 flex items-center gap-1.5 w-fit" aria-label="co-scientist is typing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-2 w-2 rounded-full bg-dim/70"
          animate={{ y: [0, -4, 0], opacity: [0.45, 1, 0.45] }}
          transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export default function CopilotSection() {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const timers = useRef([]);
  const [shown, setShown] = useState(reduced ? CHAT.length : 0);
  const [typing, setTyping] = useState(false);
  const [started, setStarted] = useState(false);

  const play = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setShown(0);
    setTyping(false);
    TIMELINE.forEach((step) =>
      timers.current.push(
        setTimeout(() => {
          setShown(step.shown);
          setTyping(step.typing);
        }, step.at)
      )
    );
  };

  useEffect(() => {
    if (reduced) {
      setShown(CHAT.length);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started) {
          setStarted(true);
          play();
          obs.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      timers.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const done = shown >= CHAT.length;

  return (
    <section id="copilot" className="relative px-6 md:px-14 py-28 md:py-40 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-14 items-center">
        <Reveal>
          <p className="font-mono text-sm text-violet mb-4">09 · YOUR CO-SCIENTIST</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Text us like your core.
          </h2>
          <p className="mt-6 text-lg text-dim leading-relaxed max-w-xl">
            A dedicated co-scientist rides inside <span className="text-snow">every portal
            we ship</span> — grounded in your clusters, markers and spatial statistics,
            answering the way a good core facility does, minus the three-week queue. Run it
            on a frontier cloud model, or flip the dropdown to a local open-source model
            through Ollama: no API keys, no cloud, no PHI exposure.
          </p>
          <p className="mt-6 text-[14.5px] text-dim leading-relaxed max-w-xl">
            One co-scientist, every portal on this page — and the same rail ships with every
            assay we support: the live genome browser above is where CUT&amp;RUN and long
            reads land.
          </p>
        </Reveal>

        {/* the phone */}
        <Reveal delay={0.08}>
          <div
            ref={ref}
            className="mx-auto w-full max-w-[420px] rounded-[28px] border border-line bg-panel shadow-xl overflow-hidden glow-ring"
          >
            {/* contact header */}
            <div className="border-b border-line bg-ground/60 px-5 pt-4 pb-3 text-center relative">
              <div className="mx-auto h-10 w-10 rounded-full bg-violet-deep flex items-center justify-center">
                <img src="artemis_mark.svg" alt="" className="h-6 w-6" style={{ filter: "brightness(0) invert(1)" }} />
              </div>
              <p className="mt-1.5 text-[13.5px] font-medium text-snow">Artemis · co-scientist</p>
              <p className="font-mono text-[10.5px] text-mint">● local · qwen3:8b · zero egress</p>
            </div>

            {/* thread */}
            <div className="px-4 py-5 min-h-[380px] flex flex-col justify-end gap-2.5 bg-panel">
              <p className="text-center font-mono text-[10.5px] text-dim/80 mb-1">Today 9:41 AM</p>
              <AnimatePresence initial={false}>
                {CHAT.slice(0, shown).map((m, i) => (
                  <motion.div
                    key={i}
                    initial={reduced ? false : { opacity: 0, y: 14, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.35, ease: [0.21, 0.6, 0.27, 1] }}
                    className="flex flex-col"
                  >
                    <div
                      className={`max-w-[85%] px-4 py-2.5 text-[14.5px] leading-relaxed ${
                        m.role === "user"
                          ? "ml-auto rounded-2xl rounded-br-md bg-violet-deep text-ink"
                          : "mr-auto rounded-2xl rounded-bl-md bg-[#e9e4d6] border border-line text-snow"
                      }`}
                    >
                      {m.text}
                    </div>
                    {m.role === "user" && shown > i + 1 && (
                      <span className="ml-auto mt-0.5 font-mono text-[10px] text-dim/80">
                        {`Read 9:4${i < 2 ? "1" : "2"} AM`}
                      </span>
                    )}
                    {m.role === "user" && shown === i + 1 && !typing && (
                      <span className="ml-auto mt-0.5 font-mono text-[10px] text-dim/80">Delivered</span>
                    )}
                  </motion.div>
                ))}
                {typing && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <TypingDots />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* input pill */}
            <div className="border-t border-line bg-ground/60 px-4 py-3 flex items-center gap-2.5" aria-hidden>
              <span className="h-7 w-7 rounded-full border border-line text-dim flex items-center justify-center text-[15px] leading-none shrink-0">+</span>
              <div className="flex-1 rounded-full border border-line bg-panel px-4 py-1.5 text-[13.5px] text-dim/70 select-none">
                Text your co-scientist…
              </div>
              <span className="h-7 w-7 rounded-full bg-violet-deep text-ink flex items-center justify-center text-[14px] leading-none shrink-0">↑</span>
            </div>
          </div>

          <div className="mt-3 flex items-start justify-between gap-4 max-w-[420px] mx-auto">
            <p className="text-[12px] text-dim leading-relaxed">
              Illustrative exchange — the prose is scripted, every number is real:
              output/TenX_GBM/report.md; Moran&rsquo;s I computed with the portal&rsquo;s live tool
              (backend/analysis/live.py) on the same section.
            </p>
            {!reduced && done && (
              <button
                onClick={play}
                className="shrink-0 font-mono text-[11px] text-violet hover:text-snow border border-line rounded-[3px] px-2.5 py-1 transition-colors"
              >
                ↻ replay
              </button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
