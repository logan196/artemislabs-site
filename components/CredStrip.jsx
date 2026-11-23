// Funding line under the opening. Wording is the founder's own request
// ("funded by Bill Gross"); the article link is the Fortune story he
// supplied (fortune.com, Nov 17 2026), not evidence of an investment.
const linkCls =
  "underline decoration-white/30 underline-offset-4 hover:decoration-[#f7f4ea] transition-colors";
export default function CredStrip() {
  return (
    <section aria-label="Backing" className="relative bg-black border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-6 md:py-8 text-center">
        <p
          className="text-[1.25rem] md:text-[1.6rem] text-[#f7f4ea] leading-tight"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
        >
          Funded by{" "}
          <a
            className={linkCls}
            href="https://www.idealab.com/bio/management/bill_gross.php"
            target="_blank"
            rel="noopener noreferrer"
          >
            Bill Gross
          </a>
        </p>
        <p className="mt-2 text-[0.85rem] md:text-[0.95rem] text-[#f7f4ea]/60">
          <a
            className={linkCls}
            href="https://fortune.com/2026/11/17/bill-gross-idealab-ai-patents-fortune-500-license-caltech/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Fortune article
          </a>
        </p>
      </div>
    </section>
  );
}
