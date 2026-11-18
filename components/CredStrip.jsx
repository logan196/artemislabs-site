// Backing strip under the opening. Only the founder-confirmed backing line;
// the other founder/competition items were dropped (Nov 17) until verified.
export default function CredStrip() {
  return (
    <section aria-label="Backing" className="relative bg-ink">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-3 md:py-4">
        <p className="text-center text-[13px] md:text-[14px] font-light tracking-[0.01em] text-dim">
          Artemis Biolabs is funded by Bill Gross.
        </p>
      </div>
    </section>
  );
}
