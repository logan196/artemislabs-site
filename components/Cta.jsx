"use client";

import Reveal from "./Reveal";

export default function Cta() {
  return (
    <section id="contact" className="relative px-6 md:px-14 py-28 md:py-40 overflow-hidden">
      

      <Reveal className="max-w-5xl mx-auto">
        <p className="font-mono text-sm text-violet mb-4 text-center">HOW AN ENGAGEMENT WORKS</p>
        <div className="grid sm:grid-cols-4 gap-4">
          {[
            ["1 · pilot", "Send one dataset — Visium, Xenium, MERFISH or .h5ad — and get back a hosted live portal plus the marker report, free."],
            ["2 · scope", "One call. We map your assays and questions to a concrete deliverable list."],
            ["3 · deliverables", "A live portal, the written report, the figures — and the code that made all three."],
            ["4 · your data stays yours", "Local-mode runs mean zero egress; cloud models are opt-in per project; deletion on request."],
          ].map(([t, b]) => (
            <div key={t} className="rounded-[3px] border border-line bg-panel/80 p-5">
              <p className="font-mono text-[12px] tracking-[0.15em] text-violet uppercase mb-2">{t}</p>
              <p className="text-[14px] text-dim leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className="max-w-5xl mx-auto border-t border-line pt-10 mt-16">
        <div className="grid sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div>
            <p className="font-mono text-[13px] text-violet">built by Caltech researchers</p>
            <p className="mt-1 text-dim text-[15px] leading-relaxed">who ran every analysis on this page themselves before selling it.</p>
          </div>
          <div>
            <p className="font-mono text-[13px] text-violet">pipelines that ran, not promises</p>
            <p className="mt-1 text-dim text-[15px] leading-relaxed">every figure on this page came from an end-to-end run on public data — Visium, MERFISH and seqFISH today; Xenium ingest in the same stack.</p>
          </div>
          <div>
            <p className="font-mono text-[13px] text-violet">GSE194329, re-analyzed end-to-end</p>
            <p className="mt-1 text-dim text-[15px] leading-relaxed">everything on this page was generated from public data by the pipeline shown above. Ask for the code.</p>
          </div>
        </div>
      </Reveal>

      <div className="max-w-3xl mx-auto text-center mt-24">
        <Reveal>
          <img src="artemis_mark.svg" alt="" className="h-16 w-16 mx-auto mb-8" />
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Your data has a story.
          </h2>
          <p className="mt-6 text-lg text-dim leading-relaxed">
            If your lab is sitting on spatial data and short on computational hands, the
            first analysis is on us — pick a public or in-house dataset and we'll turn it
            around as a live portal.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0FzlJl55WV52jaH-JEG8_xJLO5YLd20t2ksXikjwMfGnVQ-zLI4XUCAmHTFiLE1tnQgAIxBhjW"
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-[3px] bg-violet-deep text-ink px-8 py-3.5 font-medium hover:bg-violet transition-colors"
            >
              Book a demo
            </a>
            <a
              href="mailto:loganbeharry@gmail.com?subject=Artemis%20BioLabs%20%C2%B7%20analysis"
              className="inline-block rounded-[3px] border border-snow/50 px-8 py-3.5 text-dim hover:text-snow hover:border-violet transition-all"
            >
              Or start with an email
            </a>
          </div>
        </Reveal>
      </div>

      <footer className="mt-24 border-t border-line pt-8 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <span className="flex items-center gap-3">
          <img src="artemis_mark.svg" alt="" className="h-8" />
          <span className="font-semibold tracking-[0.18em] text-[14px]">ARTEMIS <span className="font-mono text-violet tracking-[0.3em] text-[11px]">BIOLABS</span></span>
        </span>
        <p className="font-mono text-[13px] text-dim">
          © 2026 Artemis BioLabs · computational biology, accelerated · artemislabs.bio
        </p>
      </footer>
    </section>
  );
}
