// Thin "opens elsewhere" arrow. Inline SVG so iOS never swaps in the ↗ emoji;
// inherits the surrounding text color and scales with the font size.
export default function ArrowUpRight({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      width="0.8em"
      height="0.8em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block align-[-0.05em] ${className}`}
    >
      <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" />
    </svg>
  );
}

// Same weight, pointing right: for links that stay on this page.
export function ArrowRight({ className = "" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" width="0.8em" height="0.8em" fill="none" stroke="currentColor"
      strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={`inline-block align-[-0.05em] ${className}`}>
      <path d="M2.5 6h7M6.5 3l3 3-3 3" />
    </svg>
  );
}
