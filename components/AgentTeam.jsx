"use client";

// PhD-led agent team. Numbers on the role cards were dropped so the
// section doesn't read as a numbered slide.
import Reveal from "./Reveal";

const ROLES = [
  ["Study architect", "Frames the biological question, cohorts, controls and analysis plan before any compute begins."],
  ["Spatial analyst", "Checks tissue, coordinates and quality signals, then works through domains and cell-state evidence across the assay."],
  ["Methods reviewer", "Challenges assumptions, tracks provenance, and turns the analysis into figures and a decision-ready report."],
];

export default function AgentTeam() {
  return (
    <section id="team" className="relative px-6 md:px-14 py-16 md:py-24 max-w-7xl mx-auto">
      <Reveal>
        <h2 className="mt-5 text-4xl md:text-6xl max-w-4xl">
          A PhD-led agent team for your spatial data
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-dim leading-relaxed">
          Give Artemis the question, the assay context and access to the data. A lead
          scientist directs specialised agents through quality control, annotation,
          spatial inference and interpretation, and a person reviews every decision.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-14 rounded-[10px] border border-line bg-panel/60 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 md:px-7 py-3 border-b border-line font-mono text-[11.5px] text-dim">
            <span>Spatial study</span>
            <span>question, evidence plan, analysis, review</span>
          </div>
          <div className="grid md:grid-cols-3">
            {ROLES.map(([t, b], i) => (
              <div key={t} className={`lift-card relative p-6 md:p-8 ${i < 2 ? "md:border-r border-b md:border-b-0 border-line" : ""}`}>
                <h3 className="text-2xl text-snow" style={{ fontFamily: "var(--font-serif), serif" }}>{t}</h3>
                <p className="mt-3 text-[15px] text-dim leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
          <div className="px-5 md:px-7 py-4 border-t border-line flex flex-wrap items-center justify-between gap-3">
            <p className="text-[14.5px] text-dim">Every result carries its source, method and decision trail.</p>
            <p className="font-mono text-[11.5px] text-snow/80">human review ↺ at each hand-off</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <p className="text-[15px] text-dim max-w-xl">
            Start with a scoped pilot and leave with a transparent analysis plan, reviewed
            findings and reusable deliverables.
          </p>
          <a href="#contact" className="font-mono text-[13px] text-snow hover:text-violet border-b border-white/20 hover:border-violet pb-0.5 transition-colors self-start">
            Scope a spatial study →
          </a>
        </div>
      </Reveal>
    </section>
  );
}
