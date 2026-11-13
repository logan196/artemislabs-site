/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: same build serves Vercel and the self-contained preview
  // artifact. Relative assetPrefix keeps _next/* chunks path-independent.
  output: "export",
  assetPrefix: "./",
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
