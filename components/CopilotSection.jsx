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
    text: "Four domains annotate as microglia/TAMs — the largest spans 246 spots, and a 71-spot domain carries SPP1 and C1QB in its top markers. Want me to run DE between it and the rest of the section?",
  },
];

export default function CopilotSection() {
  return (
    <section id="copilot" className="relative px-6 md:px-14 py-28 md:py-40 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-14 items-center">
        <Reveal>
          <p className="font-mono text-sm text-violet mb-4">10 · YOUR CO-SCIENTIST</p>
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
          <div className="mt-8 flex gap-3 flex-wrap font-mono text-[13px] text-dim">
            <span>local mode: zero egress</span>
            <span aria-hidden>·</span>
            <span>frontier model optional</span>
            <span aria-hidden>·</span>
            <span>grounded in your data</span>
          </div>
          <p className="mt-6 text-[14.5px] text-dim leading-relaxed max-w-xl">
            One co-scientist, every portal on this page — and the same rail ships with every
            assay we support: the live genome browser above is where CUT&amp;RUN and long
            reads land.
          </p>
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
              transition={{ delay: i * 0.55, duration: 0.5 }}
              className={`max-w-[92%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                m.role === "user"
                  ? "ml-auto bg-violet-deep text-ink"
                  : "bg-ink border border-line text-dim"
              }`}
            >
              {m.text}
            </motion.div>
          ))}
          <p className="text-[12.5px] text-dim pt-1 leading-relaxed">
            Illustrative exchange — the prose is scripted, every number is real: output/TenX_GBM/report.md; Moran's I computed with the portal's live tool (backend/analysis/live.py) on the same section.
          </p>
        </Stagger>
      </div>
    </section>
  );
}
