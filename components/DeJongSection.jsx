"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal, { Stagger, item } from "./Reveal";

const SECTIONS = [
  { id: "AT10-BRA-5-FO-3_1", title: "AT10 · frontal, site 3", source: "Visium · IvyGAP-annotated" },
  { id: "AT14-BRA-4-FO-2_1", title: "AT14 · frontal, site 2", source: "Visium" },
  { id: "AT15-BRA-4-FO-B2-S25", title: "AT15 · serial block B2", source: "Visium · serial sections" },
];

const VIEWS = [
  { id: "overlay", label: "cell states on H&E" },
  { id: "breakdown", label: "states · niches · histopathology" },
  { id: "he", label: "H&E histology" },
];

export default function DeJongSection() {
  const [meta, setMeta] = useState({});
  const [active, setActive] = useState(SECTIONS[0].id);
  const [view, setView] = useState("overlay");

  useEffect(() => {
    fetch("dejong/meta.json").then((r) => (r.ok ? r.json() : {})).then(setMeta).catch(() => {});
  }, []);

  const m = meta[active];

  return (
    <section id="dejong" className="relative px-6 md:px-14 py-24 md:py-36 max-w-7xl mx-auto">
      <Reveal>
        <p className="font-mono text-sm text-violet mb-4">de Jong et al. · Nature 2026 · gbmspace.org</p>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          A Nature paper, loaded overnight.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-dim leading-relaxed">
          The GBM-space cohort mapped one conserved spatial trajectory — developmental-like
          → gliosis → hypoxia — across glioblastomas. We pulled their public manuscript
          sections and imported them into the portal <span className="text-snow">with the paper's own
          analysis intact</span>: cell2location cell states, NMF spatial niches, and IvyGAP
          histopathology, each explorable next to the H&E.
        </p>
      </Reveal>

      <div className="mt-12 flex flex-col gap-6">
        <Stagger className="flex gap-3 overflow-x-auto pb-2">
          {SECTIONS.map((s) => (
            <motion.button
              key={s.id}
              variants={item}
              onClick={() => setActive(s.id)}
              className={`text-left shrink-0 rounded-2xl border px-5 py-4 transition-all ${
                active === s.id
                  ? "border-violet bg-violet/10 glow-ring"
                  : "border-line bg-panel/60 hover:border-violet/40"
              }`}
            >
              <p className="font-medium">{s.title}</p>
              <p className="font-mono text-xs text-dim mt-1">{s.source}</p>
              {meta[s.id] && (
                <p className="font-mono text-xs text-violet/80 mt-2">
                  {meta[s.id].n_spots.toLocaleString()} spots · {meta[s.id].n_states} states
                </p>
              )}
            </motion.button>
          ))}
        </Stagger>

        <div className="rounded-3xl border border-line bg-panel/60 p-5 md:p-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <div className="flex gap-2 flex-wrap">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-mono transition-all ${
                    view === v.id ? "bg-violet-deep text-snow" : "text-dim hover:text-snow border border-line"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
            {m && (
              <div className="flex gap-2 flex-wrap">
                {m.top_states.map((t) => (
                  <span key={t.label} className="font-mono text-xs text-dim border border-line rounded-full px-3 py-1">
                    {t.label} · {t.n.toLocaleString()}
                  </span>
                ))}
              </div>
            )}
          </div>
          <a
            href={`dejong/${active}_${view}.jpg`}
            target="_blank"
            rel="noreferrer"
            title="Open full resolution"
            className="block overflow-hidden rounded-2xl bg-ink cursor-zoom-in"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={`${active}-${view}`}
                src={`dejong/${active}_${view}.jpg`}
                alt={`${active} — ${view}`}
                className="w-full max-h-[84vh] object-contain"
                initial={{ opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
              />
            </AnimatePresence>
          </a>
          <p className="mt-4 text-[13.5px] text-dim leading-relaxed">
            <span className="font-semibold text-snow">Fig. 4&nbsp;|</span> Imported unmodified — no re-clustering; the paper's own deconvolution and annotations drive every view.
            Data: de Jong et al., <i>Nature</i> 2026 (open access) · gbmspace.org. Nine sections live in the portal.
          </p>
        </div>
      </div>
    </section>
  );
}
