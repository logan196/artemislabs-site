"use client";

import { motion } from "framer-motion";
import Reveal, { Stagger, item } from "./Reveal";

const CHAT = [
  { role: "user", text: "Which regions look hypoxic / mesenchymal in this section?" },
  {
    role: "ai",
    text: "The MES-like domain in the lower-right quadrant shows the classic hypoxia signature — CHI3L1 and VEGFA high, with ADM co-elevated at the core. The rim transitions into AC-like (GFAP⁺/AQP4⁺) tissue, consistent with a pseudopalisading margin.",
  },
  { role: "user", text: "Any immune infiltration near it?" },
  {
    role: "ai",
    text: "Yes — microglia/TAM spots (CD68⁺, AIF1⁺) concentrate along the hypoxic border, a pattern the Moran's I layer flags as significantly spatially autocorrelated (I = 0.41).",
  },
];

export default function CopilotSection() {
  return (
    <section id="copilot" className="relative px-6 md:px-14 py-28 md:py-40 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-14 items-center">
        <Reveal>
          <p className="font-mono text-sm text-violet mb-4">04 · LOCAL COPILOT</p>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">
            An analyst in the rail.<br />
            <span className="text-gradient">Your data never leaves.</span>
          </h2>
          <p className="mt-6 text-lg text-dim leading-relaxed max-w-xl">
            Every portal ships with a research copilot grounded in your dataset — clusters,
            markers, spatial statistics. It runs on <span className="text-snow font-mono text-base">qwen3:8b</span> through
            Ollama, entirely on local hardware: no API keys, no cloud, no PHI exposure.
            Prefer frontier reasoning? Flip the model dropdown to Claude.
          </p>
          <div className="mt-8 flex gap-3 flex-wrap font-mono text-xs">
            {["100% on-device", "zero egress", "Claude optional", "grounded in your zarr"].map((t) => (
              <span key={t} className="border border-line rounded-full px-4 py-1.5 text-dim">{t}</span>
            ))}
          </div>
        </Reveal>

        <Stagger className="rounded-3xl border border-line bg-panel/70 p-6 md:p-8 space-y-4 glow-ring">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <span className="font-mono text-xs text-dim">research-copilot</span>
            <span className="font-mono text-xs text-mint">● qwen3:8b · local</span>
          </div>
          {CHAT.map((m, i) => (
            <motion.div
              key={i}
              variants={item}
              className={`max-w-[92%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                m.role === "user"
                  ? "ml-auto bg-violet-deep/80 text-snow"
                  : "bg-ink border border-line text-dim"
              }`}
            >
              {m.text}
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
