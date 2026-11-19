/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: same build serves Vercel and the self-contained preview
  // artifact. Relative assetPrefix keeps _next/* chunks path-independent —
  // but in dev it 404s every chunk on nested routes (./_next resolves under
  // the route path), killing hydration, so it's production-only.
  output: "export",
  ...(process.env.NODE_ENV === "development" ? {} : { assetPrefix: "./" }),
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
