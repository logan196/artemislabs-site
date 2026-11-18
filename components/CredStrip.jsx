// Backing strip under the opening. Only the founder-confirmed backing line;
// the other founder/competition items were dropped (Nov 17) until verified.
export default function CredStrip() {
  return (
    <section aria-label="Backing" className="relative bg-black border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-6 md:py-8">
        <p
          className="text-center text-[1.25rem] md:text-[1.6rem] text-[#f7f4ea] leading-tight"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
        >
          Artemis Biolabs is funded by Bill Gross.
        </p>
      </div>
    </section>
  );
}
