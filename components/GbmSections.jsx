"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import { ArrowRight } from "./ArrowUpRight";

// Restored from GbmGallery.jsx (Nov 13 site, 4534ff0): the AT15 "living
// figure" and the five public glioma sections, each opening its portal.
// Counts come from public/gbm/meta.json at render time.
const SAMPLES = [
  { id: "GBM1", title: "HGG1", source: "Ren et al. 2023 · GSE194329 · astrocytoma, IDH-mut, grade 4" },
  { id: "GBM2", title: "GBM2", source: "Ren et al. 2023 · GSE194329 · GBM, IDH-wt, recurrent" },
  { id: "GBM3", title: "GBM3", source: "Ren et al. 2023 · GSE194329 · GBM, IDH-wt, primary" },
  { id: "GBM4", title: "HGG4", source: "Ren et al. 2023 · GSE194329 · astrocytoma, IDH-mut, grade 4" },
  { id: "TenX_GBM", title: "10x GBM", source: "10x Genomics Parent Visium · fresh frozen" },
];

function LivingFigure() {
  const [annotated, setAnnotated] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setAnnotated(true); return; }
    let iv;
    const io = new IntersectionObserver(([e]) => {
      clearInterval(iv);
      if (e.isIntersecting) iv = setInterval(() => setAnnotated((a) => !a), 4200);
    }, { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => { io.disconnect(); clearInterval(iv); };
  }, []);
  return (
    <figure ref={ref} className="rounded-[4px] overflow-hidden border border-line bg-panel">
      <span className="relative block aspect-[16/9] md:aspect-[16/8] overflow-hidden bg-[#f3efe4]">
        <img src="dejong/AT15-BRA-4-FO-B2-S25_he.jpg" alt="Glioblastoma section AT15, H&E stain" className="absolute inset-0 w-full h-full object-cover object-top" />
        <img
          src="dejong/AT15-BRA-4-FO-B2-S25_overlay.jpg"
          alt="The same AT15 section with the paper's cell states overlaid"
          className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-[1800ms] ease-in-out"
          style={{ opacity: annotated ? 1 : 0 }}
        />
        <span className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur px-3 py-1 text-[12px] text-snow/90">
          {annotated ? "Cell states" : "H&E"}
        </span>
      </span>
      <figcaption className="border-t border-line px-5 py-3 text-[13px] text-dim leading-relaxed">
        <span className="text-snow">AT15</span>, an atlas section fading between the raw
        H&amp;E and its cell2location-estimated states. de Jong et al., <i>Nature</i> 2026 ·
        gbmspace.org.
      </figcaption>
    </figure>
  );
}

export default function GbmSections() {
  const [meta, setMeta] = useState({});
  useEffect(() => {
    fetch("gbm/meta.json").then((r) => (r.ok ? r.json() : {})).then(setMeta).catch(() => {});
  }, []);
  return (
    <section id="sections" className="relative px-6 md:px-14 py-20 md:py-28 max-w-7xl mx-auto">
      <Reveal>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          Five sections, one afternoon.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-dim leading-relaxed">
          Five public glioma sections went through the pipeline unmodified. Each came
          out with BANKSY domains, putative cell states and marker maps, and its own
          interactive portal.
        </p>
      </Reveal>
      <Reveal delay={0.06} className="mt-10">
        <LivingFigure />
      </Reveal>
      <Reveal delay={0.1}>
        <ul className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {SAMPLES.map((s) => (
            <li key={s.id}>
              <a
                href={`live/${s.id}/index.html`}
                target="_blank"
                rel="noreferrer"
                className="group block rounded-[4px] border border-line bg-panel overflow-hidden hover:border-violet/50 transition-colors"
              >
                <span className="block aspect-square overflow-hidden bg-[#f3efe4]">
                  <img
                    src={`gbm/${s.id}_overlay.jpg`}
                    alt={`${s.title}: cell states on H&E`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </span>
                <span className="block px-3 py-2.5">
                  <span className="flex items-center justify-between text-[14px] text-snow">
                    {s.title} <ArrowRight className="text-dim group-hover:text-violet" />
                  </span>
                  <span className="block mt-0.5 text-[11.5px] text-dim leading-snug">{s.source}</span>
                  {meta[s.id] && (
                    <span className="block mt-1 font-mono text-[11px] text-dim tabular-nums">
                      {meta[s.id].n_spots.toLocaleString()} spots · {meta[s.id].n_clusters} domains
                    </span>
                  )}
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[13px] text-dim leading-relaxed max-w-3xl">
          Cell states on the five Ren et al. / 10x sections are model-annotated and not
          independently validated. Each card opens that section's portal.
        </p>
      </Reveal>
    </section>
  );
}
