"use client";

import Reveal from "./Reveal";

const BOOKING =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0FzlJl55WV52jaH-JEG8_xJLO5YLd20t2ksXikjwMfGnVQ-zLI4XUCAmHTFiLE1tnQgAIxBhjW";

const INQUIRY = "mailto:lbeharry@alumni.caltech.edu";

const PATHS = [
  {
    tag: "01 · FRONTIER CHALLENGE",
    title: "Send us a challenge worth solving",
    body: "Have a complex spatial, single-cell, or multi-omic question? Send us the problem; we return a scoped plan and a prototype view.",
    cta: ["Submit a challenge →", `${INQUIRY}?subject=${encodeURIComponent("A biological challenge for Artemis")}`],
  },
  {
    tag: "02 · JOINT RESEARCH",
    title: "Propose a dataset or co-study",
    body: "Partner on an in-house cohort, benchmark a new method, or turn a public atlas into a custom lab portal.",
    cta: ["Suggest a collaboration →", `${INQUIRY}?subject=${encodeURIComponent("Artemis BioLabs · collaboration")}`],
  },
  {
    tag: "03 · DIRECT BRIEFING",
    title: "Book a 30-minute technical call",
    body: "Walk through your assays, sample size, and timeline directly with our computational leads.",
    cta: ["Book a call ↗", BOOKING, true],
  },
];

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

      <Reveal className="max-w-5xl mx-auto mt-16">
        <p className="font-mono text-[14px] tracking-[0.2em] text-violet text-center uppercase">
          built by Caltech researchers
        </p>
      </Reveal>

      {/* the closing — three ways in, none of them a waitlist */}
      <div className="max-w-5xl mx-auto text-center mt-24">
        <Reveal>
          <img src="artemis_mark.svg" alt="" className="h-16 w-16 mx-auto mb-8" />
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Galvanize your research today.
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-dim leading-relaxed">
            Stop bottlenecking discovery behind static slide decks and overloaded cores.
            Hand your team a living portal they can interrogate in real time.
          </p>
        </Reveal>

        <Reveal className="mt-12">
          <div className="grid md:grid-cols-3 gap-4 text-left">
            {PATHS.map(({ tag, title, body, cta: [label, href, external] }) => (
              <div key={tag} className="rounded-[3px] border border-line bg-panel/80 p-6 flex flex-col">
                <p className="font-mono text-[11px] tracking-[0.2em] text-violet uppercase mb-3">{tag}</p>
                <p className="text-[17px] font-medium text-snow mb-2">{title}</p>
                <p className="text-[14px] text-dim leading-relaxed flex-1">{body}</p>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="mt-5 inline-block rounded-[3px] border border-snow/25 px-4 py-2.5 text-[14px] text-snow text-center hover:border-violet hover:bg-violet/10 transition-all"
                >
                  {label}
                </a>
              </div>
            ))}
          </div>
          <p className="mt-8 font-mono text-[13px] text-dim">
            Direct inquiry ·{" "}
            <a href={INQUIRY} className="text-snow hover:text-violet transition-colors">
              lbeharry@alumni.caltech.edu
            </a>
          </p>
        </Reveal>
      </div>

      <footer className="mt-24 border-t border-line pt-8 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <span className="flex items-center gap-3">
          <img src="artemis_mark.svg" alt="" className="h-8" />
          <span className="font-semibold tracking-[0.18em] text-[14px]">ARTEMIS <span className="font-mono text-violet tracking-[0.3em] text-[11px]">BIOLABS</span></span>
        </span>
        <p className="font-mono text-[13px] text-dim">
          © 2026 Artemis BioLabs · bioinformatics, reimagined · artemislabs.bio
        </p>
      </footer>
    </section>
  );
}
