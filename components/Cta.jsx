"use client";

import Reveal from "./Reveal";

export default function Cta() {
  return (
    <section id="contact" className="relative px-6 md:px-14 py-28 md:py-40 overflow-hidden">
      <div className="aurora absolute left-1/2 bottom-0 h-[60vh] w-[70vw] -translate-x-1/2 translate-y-1/3 rounded-full bg-violet-deep/25 blur-[140px] -z-10" />

      <Reveal className="max-w-5xl mx-auto border-t border-line pt-10">
        <div className="grid sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div>
            <p className="font-mono text-[13px] text-violet">built by a researcher-founder</p>
            <p className="mt-1 text-dim text-[15px] leading-relaxed">who ran these analyses before selling them.</p>
          </div>
          <div>
            <p className="font-mono text-[13px] text-violet">pipelines in production</p>
            <p className="mt-1 text-dim text-[15px] leading-relaxed">across academic spatial-omics labs — Xenium, Visium, CODEX, MRI.</p>
          </div>
          <div>
            <p className="font-mono text-[13px] text-violet">GSE194329, reproduced</p>
            <p className="mt-1 text-dim text-[15px] leading-relaxed">everything on this page was generated end-to-end from public data. Ask for the code.</p>
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
          <a
            href="mailto:sne@novaflowapp.com?subject=Artemis%20Labs%20%C2%B7%20spatial%20analysis"
            className="mt-10 inline-block rounded-full bg-violet-deep px-8 py-3.5 font-medium hover:bg-violet transition-colors glow-ring"
          >
            Start a conversation
          </a>
        </Reveal>
      </div>

      <footer className="mt-24 border-t border-line pt-8 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <span className="flex items-center gap-3">
          <img src="artemis_mark.svg" alt="" className="h-8" />
          <span className="font-semibold tracking-[0.18em] text-[14px]">ARTEMIS <span className="font-mono text-violet tracking-[0.3em] text-[11px]">BIOLABS</span></span>
        </span>
        <p className="font-mono text-[13px] text-dim">
          © 2026 Artemis BioLabs · computational biology, delivered · artemislabs.bio
        </p>
      </footer>
    </section>
  );
}
