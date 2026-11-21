"use client";

import Reveal, { Stagger, item } from "./Reveal";
import { motion } from "framer-motion";

const AGENTS = [
  ["01", "Study architect", "Frames the biological question, cohorts, controls, and analysis plan before compute begins."],
  ["02", "Spatial analyst", "Checks tissue, coordinates, quality signals, domains, and cell-state evidence across the assay."],
  ["03", "Methods reviewer", "Challenges assumptions, tracks provenance, and turns the analysis into figures and a decision-ready report."],
];

export default function SpatialAgentsSection() {
  return (
    <section id="spatial-agents" className="relative border-y border-line bg-ink-2/60 px-6 py-24 md:px-14 md:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="font-mono text-sm text-violet mb-4">05 · SPATIAL BIOINFORMATICS</p>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h2 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
                A scientist leads the spatial work.
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-dim">
                Send the question, the assay, and access to the data. A lead scientist
                directs the agents through quality control, annotation, spatial inference,
                and interpretation. A person reviews every decision.
              </p>
            </div>
            <div className="rounded-[4px] border border-violet/30 bg-panel p-5 font-mono text-[13px] text-dim">
              <p className="text-violet">agent room · spatial study</p>
              <p className="mt-4 text-snow">question → evidence plan → analysis → review</p>
              <p className="mt-2">Every result carries its source, method, and decision trail.</p>
            </div>
          </div>
        </Reveal>

        <Stagger className="mt-12 grid gap-4 md:grid-cols-3">
          {AGENTS.map(([number, title, description]) => (
            <motion.article key={number} variants={item} className="rounded-[4px] border border-line bg-panel/80 p-6">
              <p className="font-mono text-xs tracking-[0.18em] text-violet">{number}</p>
              <h3 className="mt-8 text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-dim">{description}</p>
            </motion.article>
          ))}
        </Stagger>

        <Reveal delay={0.12} className="mt-10 flex flex-col items-start justify-between gap-5 border-t border-line pt-8 md:flex-row md:items-center">
          <p className="max-w-2xl text-[15px] leading-relaxed text-dim">
            Start with a scoped pilot and leave with a transparent analysis plan, reviewed findings, and reusable deliverables.
          </p>
          <a
            href="mailto:loganbeharry@gmail.com?subject=Artemis%20BioLabs%20%C2%B7%20spatial%20bioinformatics"
            className="shrink-0 rounded-[3px] bg-violet-deep px-6 py-3 font-medium text-ink transition-colors hover:bg-violet"
          >
            Scope a spatial study →
          </a>
        </Reveal>
      </div>
    </section>
  );
}
