"use client";

// Closing section: one headline, one line of value, three equal options.
import Reveal from "./Reveal";
import { BOOKING, CONTACT } from "./AccessForms";

const OPTIONS = [
  {
    k: "For labs",
    t: "Request early access",
    b: "Tell us your data type and question; we reply with a proposed first analysis.",
    href: "#early-access",
    cta: "Request early access",
    primary: true,
  },
  {
    k: "For collaborators",
    t: "Suggest a collaboration",
    b: "A dataset, a method or a joint project. Propose it and we come back with a plan.",
    href: "#collaborate",
    cta: "Suggest a collaboration",
  },
  {
    k: "Talk first",
    t: "Book a 30-minute call",
    b: "Walk us through the project and the data; leave with a concrete next step.",
    href: BOOKING,
    cta: "Book a call ↗",
    external: true,
  },
];

export default function Cta() {
  return (
    <section id="contact" className="relative bg-black border-t border-white/[0.06] px-6 md:px-14 pt-20 md:pt-28 pb-10 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <img src="artemis_mark.svg" alt="" className="h-12 w-12 mb-8" />
          <h2 className="text-4xl md:text-5xl max-w-3xl">Your data has a story.</h2>
          <p className="mt-4 max-w-xl text-lg text-dim leading-relaxed">
            Tell us the assay and the question. We scope the analysis and show you the result in a live portal.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div id="book" className="mt-14 grid md:grid-cols-3 border border-white/10 rounded-[4px] overflow-hidden">
            {OPTIONS.map((o, i) => (
              <div key={o.t} className={`flex flex-col p-7 md:p-8 bg-white/[0.015] ${i < 2 ? "border-b md:border-b-0 md:border-r border-white/10" : ""}`}>
                <p className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-dim">{o.k}</p>
                <h3 className="mt-4 text-[1.7rem] leading-tight text-snow" style={{ fontFamily: "var(--font-serif), serif" }}>{o.t}</h3>
                <p className="mt-3 text-[14.5px] text-dim leading-relaxed flex-1">{o.b}</p>
                <a
                  href={o.href}
                  {...(o.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className={`mt-8 inline-flex justify-center items-center rounded-[3px] px-5 py-2.5 text-[14px] font-medium transition-colors ${
                    o.primary ? "bg-snow text-ink hover:bg-white" : "border border-white/20 text-snow hover:border-white/50"
                  }`}
                >
                  {o.cta}
                </a>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[13px] text-dim">
            Or email <a href={`mailto:${CONTACT}?subject=Artemis%20BioLabs`} className="hair-link text-snow/80 hover:text-snow">{CONTACT}</a>
          </p>
        </Reveal>

        <footer className="mt-20 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[12.5px] text-dim">
          <span className="flex items-center gap-3">
            <img src="artemis_mark.svg" alt="" className="h-8 w-8" />
            <span className="font-semibold tracking-[0.18em] text-[14px] text-snow">ARTEMIS <span className="font-mono text-violet tracking-[0.3em] text-[11px]">BIOLABS</span></span>
          </span>
          <p className="font-mono text-[13px] text-dim">
            © 2026 Artemis BioLabs · computational biology, accelerated · artemislabs.bio
          </p>
        </footer>
      </div>
    </section>
  );
}
