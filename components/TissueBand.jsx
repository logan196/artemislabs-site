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

export default function TissueBand() {
  return (
    <section id="tissue" className="relative px-6 md:px-14 py-20 md:py-28 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-xs text-dim tracking-wide">
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
            className={`block rounded-[4px] border border-line bg-panel p-3 pb-4 shadow-[0_14px_38px_-24px_rgba(0,0,0,0.6)] ${im.tilt} hover:rotate-0 hover:border-violet/50 transition-all duration-300`}
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
    </section>
  );
}
