"use client";

import Reveal from "./Reveal";

export default function Cta() {
  return (
    <section id="contact" className="relative px-6 md:px-14 py-32 md:py-44 overflow-hidden">
      <div className="aurora absolute left-1/2 bottom-0 h-[60vh] w-[70vw] -translate-x-1/2 translate-y-1/3 rounded-full bg-violet-deep/25 blur-[140px] -z-10" />
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <img src="artemis_icon.svg" alt="" className="h-12 w-12 rounded-xl mx-auto mb-8 glow-ring" />
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">
            Your data has a story.<br />
            <span className="text-gradient">Let's render it.</span>
          </h2>
          <p className="mt-6 text-lg text-dim leading-relaxed">
            We came up through research before building Artemis Labs. If your lab is sitting
            on spatial data and short on computational hands, the first analysis is on us —
            pick a public or in-house dataset and we'll turn it around as a live portal.
          </p>
          <a
            href="mailto:sne@novaflowapp.com?subject=Artemis%20Labs%20%C2%B7%20spatial%20analysis"
            className="mt-10 inline-block rounded-full bg-violet-deep px-8 py-3.5 font-medium hover:bg-violet transition-colors glow-ring"
          >
            Start a conversation
          </a>
        </Reveal>
      </div>
      <footer className="mt-28 border-t border-line pt-8 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <img src="artemis_logo_white.svg" alt="Artemis Labs" className="h-4 opacity-70" />
        <p className="font-mono text-xs text-dim/60">
          © 2026 Artemis Labs · computational biology, delivered · artemislabs.bio
        </p>
      </footer>
    </section>
  );
}
