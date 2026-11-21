"use client";

import { BOOKING, MAILTO } from "@/lib/links";
import SpatialField from "./SpatialField";

const NAV = [
  ["#services", "Services"],
  ["#glioblastoma", "Glioblastoma"],
  ["#founders", "Founders"],
  ["#partner", "Partner"],
];

export default function Hero() {
  return (
    <header className="relative">
      <a
        href="#services"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:left-3 focus:top-3 focus:rounded-md focus:bg-panel focus:px-3 focus:py-2 focus:text-snow"
      >
        Skip to content
      </a>
      <nav className="sticky top-0 z-40 border-b border-line bg-ink/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-10">
          <a href="/" aria-label="Artemis BioLabs, home" className="shrink-0">
            <img src="artemis_lockup.svg" alt="Artemis BioLabs" className="h-8 w-auto md:h-9" />
          </a>
          <div className="hidden items-center gap-7 text-[15px] text-snow/90 md:flex">
            {NAV.map(([href, label]) => (
              <a key={href} href={href} className="rounded-sm hover:text-violet focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet">
                {label}
              </a>
            ))}
            <a
              href={BOOKING}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-violet-deep px-4 py-2 text-[14px] font-medium text-white hover:bg-[#278893]"
            >
              Book a call
            </a>
          </div>
          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-full border border-line px-3 py-1.5 text-[14px] text-snow">
              Menu
            </summary>
            <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-line bg-ink p-2 shadow-2xl">
              {NAV.map(([href, label]) => (
                <a key={href} href={href} className="block rounded-lg px-3 py-2.5 text-snow hover:bg-panel">
                  {label}
                </a>
              ))}
              <a href={BOOKING} target="_blank" rel="noreferrer" className="mt-1 block rounded-lg bg-violet-deep px-3 py-2.5 text-center font-medium text-white">
                Book a call
              </a>
            </div>
          </details>
        </div>
      </nav>

      <section className="hero-wash relative isolate flex min-h-[calc(100svh-4.25rem)] items-center overflow-hidden">
        <SpatialField className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-[radial-gradient(ellipse_at_18%_55%,rgba(11,31,42,0.82)_0%,rgba(11,31,42,0.35)_42%,transparent_68%)] md:w-[70%]" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-violet">
            Funded by Bill Gross
          </p>
          <h1 className="font-display mt-5 max-w-4xl text-[clamp(2.7rem,7vw,6.4rem)] leading-[0.96] text-snow">
            Your lab&apos;s computational team.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-snow/85 md:text-xl">
            Spatial, single-cell, imaging, and sequencing. A scientist directs the work.
            You leave with a portal, figures, and code your lab can rerun.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={BOOKING}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-violet-deep px-7 py-3.5 text-[16px] font-medium text-white shadow-[0_12px_40px_-16px_rgba(31,111,120,0.95)] hover:bg-[#278893]"
            >
              Book a call
            </a>
            <a href={MAILTO} className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3.5 text-[16px] text-snow hover:border-violet">
              loganbeharry@gmail.com
            </a>
          </div>
        </div>
      </section>
    </header>
  );
}
