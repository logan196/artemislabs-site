"use client";

import { motion } from "framer-motion";
import Reveal, { Stagger, item } from "./Reveal";

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
    text: "Four domains annotate as microglia/TAMs — the largest sits adjacent to the hypoxic domain, with SPP1 and C1QB among its top markers. Want me to run DE between it and the rest of the TAM spots?",
  },
];

export default function CopilotSection() {
  return (
    <section id="copilot" className="relative px-6 md:px-14 py-28 md:py-40 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-14 items-center">
        <Reveal>
          <p className="font-mono text-sm text-violet mb-4">qwen3:8b · deepseek-r1:8b · claude</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            An analyst inside every portal.
          </h2>
          <p className="mt-6 text-lg text-dim leading-relaxed max-w-xl">
            Every portal ships with a research copilot grounded in your dataset — clusters,
            markers, spatial statistics. Run it on Claude for frontier reasoning, or flip the
            model dropdown to a local open-source model through Ollama and keep the entire
            loop on your own hardware: no API keys, no cloud, no PHI exposure.
          </p>
          <div className="mt-8 flex gap-3 flex-wrap font-mono text-[13px] text-dim">
            <span>local mode: zero egress</span>
            <span aria-hidden>·</span>
            <span>Claude optional</span>
            <span aria-hidden>·</span>
            <span>grounded in your zarr</span>
          </div>
        </Reveal>

        <Stagger className="rounded-3xl border border-line bg-panel/70 p-6 md:p-8 space-y-4 glow-ring">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <span className="font-mono text-[13px] text-dim">research-copilot</span>
            <span className="font-mono text-[13px] text-mint">● local mode · qwen3:8b</span>
          </div>
          {CHAT.map((m, i) => (
            <motion.div
              key={i}
              variants={item}
              transition={{ delay: i * 0.25 }}
              className={`max-w-[92%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                m.role === "user"
                  ? "ml-auto bg-violet-deep/80 text-snow"
                  : "bg-ink border border-line text-dim"
              }`}
            >
              {m.text}
            </motion.div>
          ))}
          <p className="font-mono text-[11px] text-dim pt-1">
            from the 10x GBM section · markers per report.md · Moran's I via the portal's live tool
          </p>
        </Stagger>
      </div>
    </section>
  );
}
