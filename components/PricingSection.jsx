"use client";

import Reveal from "./Reveal";
import { BOOKING } from "@/lib/links";

const TIERS = [
  {
    n: "01",
    name: "Annealing",
    price: "$3,000",
    unit: "one scoped month",
    body: "Start with one question, one agreed analysis, a results walkthrough, and a handoff your lab can rerun.",
    cta: "Book Annealing",
    hunt: false,
    recommended: false,
  },
  {
    n: "02",
    name: "Hybridizing",
    price: "$2,000",
    unit: "per month, 3 months ($6,000 total)",
    body: "Keep the queue moving. Weekly working sessions, a prioritized project queue, and literature updates tied to active work.",
    cta: "Book Hybridizing",
    hunt: false,
    recommended: true,
  },
  {
    n: "03",
    name: "Join the Hunt",
    price: "$5,000",
    unit: "per month",
    body: "Your lab gets its own software, an ongoing research partnership, and direct access to Artemis scientists.",
    cta: "Join the Hunt",
    hunt: true,
    recommended: false,
  },
];

const INCLUDED = [
  "Interactive results portal",
  "Dedicated lab workspace",
  "Always-on AI agents tailored to the lab",
  "Referenced report with publication-ready figures",
  "Rerunnable code",
  "Early access to research previews",
];

export default function PricingSection() {
  return (
    <section id="partner" className="border-y border-line bg-ink-2/50 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-violet">Partner with us</p>
          <h2 className="font-display mt-4 max-w-3xl text-4xl text-snow md:text-6xl">
            Pick a way in.
          </h2>
          <p className="mt-5 max-w-2xl text-lg text-dim">
            Scope and purchase-order terms are agreed in writing before work starts.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {TIERS.map((t) => (
            <article
              key={t.name}
              className={`relative flex flex-col rounded-3xl border p-6 md:p-7 ${
                t.hunt
                  ? "hunt-card border-transparent text-snow lg:-mt-3 lg:mb-3"
                  : t.recommended
                    ? "border-violet/70 bg-panel shadow-[0_0_0_1px_rgba(31,111,120,0.45)]"
                    : "border-line bg-panel/70"
              }`}
            >
              {t.recommended ? (
                <p className="absolute -top-3 left-6 rounded-full bg-violet-deep px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white">
                  Recommended
                </p>
              ) : null}
              <p className="font-mono text-[12px] tracking-[0.16em] text-violet">{t.n}</p>
              <h3 className={`mt-3 text-2xl font-medium ${t.hunt ? "font-display text-4xl" : ""}`}>{t.name}</h3>
              <p className="mt-4 text-3xl font-medium tracking-tight text-snow">{t.price}</p>
              <p className="mt-1 text-[14px] text-dim">{t.unit}</p>
              <p className="mt-5 flex-1 text-[15.5px] leading-relaxed text-snow/85">{t.body}</p>
              <a
                href={BOOKING}
                target="_blank"
                rel="noreferrer"
                className={`mt-7 inline-flex items-center justify-center rounded-full px-5 py-3 text-center text-[15px] font-medium ${
                  t.hunt ? "hunt-cta text-white" : "bg-white/10 text-snow ring-1 ring-white/15 hover:ring-violet"
                }`}
              >
                {t.cta}
              </a>
            </article>
          ))}
        </div>

        <Reveal delay={0.08} className="mt-14">
          <h3 className="text-xl font-medium text-snow">In every engagement</h3>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {INCLUDED.map((item) => (
              <li key={item} className="rounded-xl border border-line bg-ink/50 px-4 py-3 text-[15px] text-snow/90">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-3xl text-[14px] leading-relaxed text-dim">
            Robotics access is subject to availability and agreed scope. Experimental previews are not validated workflows.
          </p>
          <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-dim">
            Research support only. No wet-lab work. No clinical or diagnostic interpretation.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
