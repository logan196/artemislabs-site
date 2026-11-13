"use client";

import Reveal from "./Reveal";

// Wet labs are the customer; spatial is one showcase. This is the other:
// a clinical proteomics paper reanalyzed end-to-end in the notebook portal.
export default function WetLabSection() {
  return (
    <section id="wetlab" className="relative bg-ink-2/60 border-y border-line">
      <div className="px-6 md:px-14 py-24 md:py-32 max-w-7xl mx-auto">
        <Reveal>
          <p className="font-mono text-sm text-violet mb-4">NOT JUST SPATIAL</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
            Built for wet labs, whatever the assay.
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-dim leading-relaxed">
            Spatial is the showcase on this page — the engagement covers everything your
            bench produces. Below: a published CSF proteomics cohort (Hällqvist 2024,
            <i> Nat Commun</i>) independently reanalyzed in our notebook portal — volcano
            plots, cross-dataset validation, classifier rebuilds, and a reproducibility
            appendix where every figure ships with the code that made it.
          </p>
        </Reveal>
        <Reveal delay={0.08} className="mt-10">
          <div className="rounded-lg border border-snow/60 overflow-hidden bg-[#0d0d16]">
            <video
              src="demo/proteomics_demo.mp4"
              autoPlay
              muted
              loop
              playsInline
              controls
              className="w-full"
              aria-label="Screen recording of the Artemis notebook portal reanalyzing the Hällqvist 2024 CSF proteomics cohort"
            />
          </div>
          <p className="mt-3 text-[13.5px] text-dim leading-relaxed">
            <span className="font-semibold text-snow">Fig. 8&nbsp;|</span> The notebook portal reanalyzing Hällqvist et al. 2024 (CSF proteomics, 194 subjects, 32-protein MRM panel) — public data, every claim re-derived.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
