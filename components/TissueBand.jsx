"use client";

import { motion } from "framer-motion";
import Reveal, { Stagger, item } from "./Reveal";

// Public multiplexed-tissue imagery, BioImage Archive. Licenses verified on
// each study's BioStudies record (License attribute): S-BIAD605 = CC0,
// S-BIAD1237 = CC BY 4.0, S-BIAD1641 = CC BY 4.0.
const TISSUE_IMAGES = [
  {
    src: "tissue/sbiad605_ccrcc_mif.jpg",
    w: 700,
    h: 700,
    alt: "Multiplex immunofluorescence of clear cell renal cell carcinoma: Hoechst, MCM2, CD3 and CD8 channels composited in blue, green and red",
    caption: "ccRCC · Hoechst / MCM2 / CD3 / CD8 — composited from the study's OME-zarr",
    credit: "BioImage Archive S-BIAD605 · Wölflein et al. · CC0",
    href: "https://www.ebi.ac.uk/biostudies/bioimages/studies/S-BIAD605",
    tilt: "md:-rotate-[1.4deg]",
  },
  {
    src: "tissue/sbiad1237_luad_mif.jpg",
    w: 512,
    h: 512,
    alt: "Multiplex immunofluorescence whole-slide image of lung adenocarcinoma tissue in magenta, green and red",
    caption: "Lung adenocarcinoma · multiplex IF whole-slide image",
    credit: "BioImage Archive S-BIAD1237 · Um et al. · CC BY 4.0",
    href: "https://www.ebi.ac.uk/biostudies/bioimages/studies/S-BIAD1237",
    tilt: "md:rotate-[1deg]",
  },
  {
    src: "tissue/sbiad1641_thalamus_mf.png",
    w: 512,
    h: 512,
    alt: "Multiplexed fluorescence microscopy of human thalamus showing neuronal and glial fiber architecture",
    caption: "Human thalamus · neuronal, vascular and glial markers",
    credit: "BioImage Archive S-BIAD1641 · John et al. · CC BY 4.0",
    href: "https://www.ebi.ac.uk/biostudies/bioimages/studies/S-BIAD1641",
    tilt: "md:-rotate-[0.6deg]",
  },
];

const VIEWER_STATS = [
  { value: "8", label: "marker channels, composited" },
  { value: "66", label: "mapped cell states" },
  { value: "H&E", label: "paired histology · pan + zoom" },
];

const FILE_TYPES = [
  "spatial counts (.h5ad)",
  "paired H&E",
  "cell-state labels",
  "marker maps",
  "OME-zarr portals",
  "genome tracks (bigWig / BAM)",
  "3D volumes",
  "run reports (md)",
];

export default function TissueBand() {
  return (
    <section id="tissue" className="relative px-6 md:px-14 py-20 md:py-28 max-w-7xl mx-auto">
      {/* 1 · Explore Tissue Data */}
      <Reveal>
        <div className="rounded-[4px] border border-line bg-panel p-6 md:p-10 grid md:grid-cols-[1.25fr_1fr] gap-8 md:gap-12 items-center">
          <div>
            <p className="font-mono text-xs text-violet tracking-wide mb-4">
              IN-BROWSER · NO INSTALL
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Explore tissue data
            </h2>
            <p className="mt-4 max-w-xl text-[17px] text-dim leading-relaxed">
              An interactive visualizer with multi-channel marker overlays, cell
              states and paired H&amp;E —{" "}
              <span className="text-snow">right in the browser.</span> Pan and
              zoom the histology, composite expression-derived marker channels,
              toggle the mapped cell states on and off.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <a
                href="live/explore/index.html"
                target="_blank"
                rel="noreferrer"
                className="rounded-[3px] bg-violet-deep text-ink px-6 py-2.5 text-[15px] font-medium hover:bg-violet transition-colors"
              >
                Launch Tissue Visualizer ›
              </a>
              <a
                href="live/GBM3/portal.html"
                target="_blank"
                rel="noreferrer"
                className="text-violet font-medium hover:underline text-[14.5px]"
              >
                GBM atlas portal →
              </a>
            </div>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-1 gap-3">
            {VIEWER_STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-[4px] border border-line bg-ink-2/40 px-4 py-4 md:py-3.5 md:flex md:items-baseline md:gap-3"
              >
                <p className="text-2xl md:text-3xl font-semibold text-violet tabular-nums">
                  {s.value}
                </p>
                <p className="font-mono text-[11px] text-dim mt-1 md:mt-0 leading-snug">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* 2 · Public multiplexed-tissue imagery */}
      <Reveal delay={0.08}>
        <p className="mt-16 font-mono text-xs text-dim tracking-wide">
          PUBLIC MULTIPLEXED TISSUE · BIOIMAGE ARCHIVE
        </p>
      </Reveal>
      <Stagger className="mt-5 grid sm:grid-cols-3 gap-6 md:gap-8">
        {TISSUE_IMAGES.map((im) => (
          <motion.a
            key={im.src}
            variants={item}
            href={im.href}
            target="_blank"
            rel="noreferrer"
            title="Open the source study on the BioImage Archive"
            className={`block rounded-[4px] border border-line bg-panel p-3 pb-4 shadow-[0_14px_38px_-24px_rgba(28,26,21,0.45)] ${im.tilt} hover:rotate-0 hover:border-violet/50 transition-all duration-300`}
          >
            <span className="block aspect-square overflow-hidden rounded-[2px] bg-snow">
              <img
                src={im.src}
                width={im.w}
                height={im.h}
                alt={im.alt}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </span>
            <span className="block mt-3 font-mono text-[11px] text-snow leading-relaxed">
              {im.caption}
            </span>
            <span className="block mt-1 font-mono text-[10.5px] text-dim leading-relaxed">
              {im.credit}
            </span>
          </motion.a>
        ))}
      </Stagger>

      {/* 3 · Standardized file types */}
      <Reveal delay={0.08}>
        <div className="mt-16 rounded-[4px] border border-line bg-panel/70 p-6 md:p-8">
          <p className="text-[16px] text-dim leading-relaxed">
            <span className="text-snow font-medium">
              Artemis moves across all of this
            </span>{" "}
            — the artifact types already live elsewhere on this page:
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {FILE_TYPES.map((t) => (
              <span
                key={t}
                className="font-mono text-xs text-dim border border-line rounded-full px-3.5 py-1.5 bg-ink-2/30"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
