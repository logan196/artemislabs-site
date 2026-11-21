"use client";

import Reveal from "./Reveal";
import { BOOKING, EMAIL, MAILTO } from "@/lib/links";

export default function Cta() {
  return (
    <section id="contact" className="px-6 py-24 md:px-14 md:py-36">
      <Reveal className="mx-auto max-w-3xl text-center">
        <img src="brand/artemis-emblem.v1.png" alt="" className="mx-auto h-16 w-16 object-contain" />
        <p className="mb-4 mt-8 font-mono text-sm text-violet">FUNDED BY BILL GROSS</p>
        <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Join the Hunt.</h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-dim">
          Tell us the question. We agree the scope in writing, then we start.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href={BOOKING} target="_blank" rel="noreferrer" className="inline-block rounded-[3px] bg-violet-deep px-8 py-3.5 font-medium text-ink glow-ring hover:bg-violet">
            Join the Hunt
          </a>
          <a href={BOOKING} target="_blank" rel="noreferrer" className="inline-block rounded-[3px] border border-snow/50 px-8 py-3.5 text-dim hover:border-violet hover:text-snow">
            Book a call
          </a>
        </div>
        <p className="mt-6 text-[15px] text-dim">
          <a href={MAILTO} className="text-snow hover:text-violet">{EMAIL}</a>
        </p>
      </Reveal>

      <footer className="mx-auto mt-20 flex max-w-7xl flex-col items-start justify-between gap-4 border-t border-line pt-8 md:flex-row md:items-center">
        <span className="flex items-center gap-3">
          <img src="artemis_mark.svg" alt="" className="h-8" />
          <span className="text-[14px] tracking-[0.16em] text-snow">ARTEMIS BIOLABS</span>
        </span>
        <p className="font-mono text-[12px] leading-relaxed text-dim">
          Funded by Bill Gross
          <span className="mx-2 text-white/20">/</span>
          © 2026 Artemis BioLabs
        </p>
      </footer>
    </section>
  );
}
