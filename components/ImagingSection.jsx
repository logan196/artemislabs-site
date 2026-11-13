"use client";

import Reveal from "./Reveal";

// Radiomics & imaging proof: the longitudinal DTI cohort browser (mouse study).
export default function ImagingSection() {
  return (
    <section id="imaging" className="relative bg-ink-2/60 border-y border-line">
      <div className="px-6 md:px-14 py-24 md:py-32 max-w-7xl mx-auto">
        <Reveal>
          <p className="font-mono text-sm text-violet mb-4">06 · RADIOMICS & IMAGING</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
            From scanner to statistics, browsable.
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-dim leading-relaxed">
            A longitudinal diffusion-MRI cohort browser we built for a preclinical neurodegeneration study: per-subject FA and fiber-orientation maps, full 3D volumes
            in the browser, and regional group statistics over 300 atlas regions — one
            interface from raw scans to effect sizes.
          </p>
        </Reveal>
        <Reveal delay={0.08} className="mt-10">
          <div className="rounded-lg border border-snow/60 overflow-hidden bg-[#12101d]">
            <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-[#2a2838] bg-[#0d0b16]">
              <img src="artemis_mark.svg" alt="" className="w-4 h-4" />
              <span className="font-mono text-[11.5px] tracking-[0.14em] uppercase text-dim">
                artemis · dti-cohort-atlas
              </span>
            </div>
            <video
              src="demo/dti_demo.mp4"
              poster="demo/dti_still.png"
              autoPlay
              muted
              loop
              playsInline
              controls
              className="w-full"
              aria-label="Screen recording of the DTI cohort browser: mosaic of diffusion maps, 3D volume rendering, and regional statistics dashboard"
            />
          </div>
          <p className="mt-3 text-[13.5px] text-dim leading-relaxed">
            <span className="font-semibold text-snow">Fig. 5&nbsp;|</span> The DTI cohort browser — 15 mice × 3 timepoints, registered to the Allen CCFv3 atlas (100&nbsp;µm): FA mosaics and DEC fiber-orientation maps, with in-browser 3D volumes and per-region trajectories in the full tool. Preclinical research in progress, shown with group labels blinded; regional labels provisional.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
