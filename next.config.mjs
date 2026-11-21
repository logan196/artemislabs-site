/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: same build serves GitHub Pages and the self-contained preview
  // artifact. Relative assetPrefix keeps _next/* chunks path-independent.
  output: "export",
  allowedDevOrigins: ["127.0.0.1"],
  // Production only. A relative assetPrefix makes the exported _next/* chunks
  // path-independent, but in dev it also rewrites the dev-runtime and HMR
  // endpoints, which leaves the page served but never hydrated — effects never
  // run, so the canvas stays unsized and the hero renders black.
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
