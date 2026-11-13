"use client";

import { motion } from "framer-motion";
import Reveal from "./Reveal";

// All numbers real — GEO DataSets esearch, accessed 2026-11-13; <Count>62</Count>.
const ACCESSED = "2026-11-13";
const N_IDENTIFIED = 62; // GEO series matching the query below
const N_NOT_INGESTED = 61; // 62 minus GSE194329, the one GEO series ingested
const N_SECTIONS = 8;

const GEO_QUERY =
  '(glioblastoma) AND (spatial transcriptomics) AND "Homo sapiens"[organism] AND gse[entry type]';

const ease = [0.21, 0.6, 0.27, 1];

function Box({ title, tone = "main", delay = 0, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, duration: 0.5, ease }}
      className={`rounded-[4px] border bg-panel px-5 py-4 ${
        tone === "excl" ? "border-magma/40" : tone === "incl" ? "border-violet" : "border-line"
      }`}
    >
      <p
        className={`font-mono text-[10.5px] tracking-[0.2em] uppercase mb-1.5 ${
          tone === "excl" ? "text-magma" : "text-violet"
        }`}
      >
        {title}
      </p>
      <div className="text-[14px] text-dim leading-relaxed">{children}</div>
    </motion.div>
  );
}

function Arrow({ delay = 0, label }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-center gap-2 py-2 pl-5 font-mono text-[11px]"
      aria-hidden
    >
      <span className="text-violet">↓</span>
      {label && <span className="text-dim">{label}</span>}
    </motion.div>
  );
}

export default function PrismaStory() {
  return (
    <section id="pipeline" className="relative px-6 md:px-14 py-24 md:py-32 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-sm text-violet mb-4">02 · FROM SEARCH TO PORTAL</p>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          One query, <span className="text-violet">eight sections</span>, one portal.
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-dim leading-relaxed">
          The section above is one of eight. Here is the paper trail — the search, what it
          returned, what was screened out, and what shipped live on this page.
        </p>
      </Reveal>

      {/* the trail — one view, four steps, nothing overlapping */}
      <div className="mt-10 max-w-3xl">
        {/* step 1 · the query */}
        <Box title={`search · GEO DataSets · accessed ${ACCESSED}`} delay={0}>
          <p className="font-mono text-[12.5px] leading-relaxed break-words">
            <span className="text-dim">geo/gds »&nbsp;</span>
            <span className="text-snow">{GEO_QUERY}</span>
          </p>
        </Box>
        <Arrow delay={0.15} />

        {/* step 2 · what it returned */}
        <Box title="records identified" delay={0.2}>
          <p className="font-semibold text-snow">
            <span className="text-violet tabular-nums">{N_IDENTIFIED}</span> GEO series
          </p>
          <p className="mt-0.5 text-[12.5px]">
            + 2 sources outside GEO (10x Genomics · gbmspace.org)
          </p>
        </Box>
        <Arrow
          delay={0.35}
          label="screened for: human GBM · Visium / MERFISH / seqFISH · per-sample spatial files + H&E"
        />

        {/* step 3 · in and out, side by side — the split is the point */}
        <div className="grid md:grid-cols-2 gap-3 md:gap-4">
          <Box title="included in this page's GBM demos" tone="incl" delay={0.5}>
            <p className="font-semibold text-snow">
              3 sources · <span className="text-violet tabular-nums">{N_SECTIONS}</span> sections
              on this page
            </p>
            <ul className="mt-1.5 space-y-0.5 text-[12.5px]">
              <li>· GSE194329 — 4 sections (Ren et al. 2023)</li>
              <li>· 10x Parent Visium — 1 section</li>
              <li>· gbmspace.org atlas — 3 sections (de Jong et al. 2026)</li>
            </ul>
          </Box>
          <Box title="not ingested" tone="excl" delay={0.6}>
            <p className="font-semibold text-snow">
              <span className="text-magma tabular-nums">{N_NOT_INGESTED}</span> GEO series
            </p>
            <ul className="mt-1.5 space-y-0.5 text-[12.5px]">
              <li>· no per-sample spatial files</li>
              <li>· non-target platform</li>
              <li>· not yet ingested</li>
            </ul>
            <p className="mt-1.5 font-mono text-[11px]">not individually adjudicated</p>
          </Box>
        </div>
        <Arrow delay={0.75} />

        {/* step 4 · where it all landed */}
        <motion.a
          href="live/GBM3/portal.html"
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: 0.85, duration: 0.5, ease }}
          className="block rounded-[4px] border border-violet-deep bg-violet-deep text-ink px-5 py-4 hover:bg-violet transition-colors"
        >
          <p className="font-mono text-[10.5px] tracking-[0.2em] uppercase mb-1 opacity-80">
            shipped
          </p>
          <p className="font-medium">
            <span
              className="inline-block h-2 w-2 rounded-full bg-emerald-300 animate-pulse mr-2 align-middle"
              aria-hidden
            />
            every included section, live in the GBM atlas portal →
          </p>
        </motion.a>
      </div>

      <p className="mt-6 text-[13.5px] text-dim leading-relaxed max-w-3xl">
        <span className="font-semibold text-snow">Fig. 1&nbsp;|</span> From search to portal.
        Our working subset, not a published systematic review: the sections this page
        actually processes — GSE194329 (Ren et al., <em>Nat Commun</em> 2023; 4 sections),
        the 10x Genomics Parent Visium GBM dataset (1 section), and the gbmspace.org atlas
        (de Jong et al., <em>Nature</em> 2026; 3 sections). The remaining {N_NOT_INGESTED}{" "}
        GEO series were not individually adjudicated.
      </p>
    </section>
  );
}
