/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: same build serves Vercel and the self-contained preview
  // artifact. Relative assetPrefix keeps _next/* chunks path-independent.
  output: "export",
  trailingSlash: true,
  // Production only. A relative assetPrefix makes the exported _next/* chunks
  // path-independent, but in dev it also rewrites the dev-runtime and HMR
  // endpoints, which leaves the page served but never hydrated. Effects never
  // run, so the canvas stays unsized and the hero renders black.
  // Nested routes still need a post-build rewrite (scripts/relativize-export-assets.mjs):
  // "./_next" from /delivered/ would request /delivered/_next and the page
  // would render unstyled.
  ...(process.env.NODE_ENV === "production" ? { assetPrefix: "./" } : {}),
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
