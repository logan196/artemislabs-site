// Subtle credibility strip under the hero: plain wordmark text only (no
// third-party logos). Every line is founder-confirmed or publicly sourced.
const ITEMS = [
  { t: "Funded by Bill Gross" },
  { t: "Founder · Caltech ’25" },
  {
    t: "Finalist · Bill Gross Business Plan Competition 2024 (IND CoPilot)",
    href: "https://www.caltech.edu/about/news/bill-gross-business-plan-competition",
  },
  { t: "Formerly AI engineer, Pfizer" },
];

export default function CredStrip() {
  return (
    <div className="bg-black border-t border-white/[0.06]">
      <ul className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[12px] text-snow/45">
        {ITEMS.map((i, k) => (
          <li key={i.t} className="flex items-center gap-8">
            {k > 0 && <span className="hidden md:inline h-3 w-px bg-white/15" aria-hidden />}
            {i.href ? (
              <a href={i.href} target="_blank" rel="noreferrer" className="hair-link hover:text-snow/80 transition-colors">{i.t} ↗</a>
            ) : (
              <span>{i.t}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
