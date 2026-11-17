// Credibility strip under the opening. Every line is founder-confirmed or
// publicly sourced; the wording of each item is unchanged.
const ITEMS = [
  { k: "Founder", t: "Founder · Caltech ’25" },
  { k: "Backing", t: "Funded by Bill Gross" },
  {
    k: "Competition",
    t: "Finalist · Bill Gross Business Plan Competition 2024 (IND CoPilot)",
    href: "https://www.caltech.edu/about/news/bill-gross-business-plan-competition",
  },
  { k: "Before Artemis", t: "Formerly AI engineer, Pfizer" },
];

export default function CredStrip() {
  return (
    <section aria-label="Founder and backing" className="relative bg-black border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-7 md:py-9">
        <p className="text-center text-[1.35rem] md:text-[1.7rem] text-[#f7f4ea] leading-tight" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
          Caltech founder. Funded by Bill Gross.
        </p>
        <ul className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ITEMS.map((i) => (
            <li key={i.t} className="rounded-[4px] border border-white/15 bg-white/[0.035] px-4 py-3.5 transition-colors duration-300 hover:border-violet/70 hover:bg-white/[0.06]">
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-violet">{i.k}</p>
              {i.href ? (
                <a href={i.href} target="_blank" rel="noreferrer" className="mt-1.5 block text-[14.5px] leading-snug text-[#f7f4ea] hover:text-white">
                  {i.t} <span aria-hidden>↗</span>
                </a>
              ) : (
                <p className="mt-1.5 text-[14.5px] leading-snug text-[#f7f4ea]">{i.t}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
