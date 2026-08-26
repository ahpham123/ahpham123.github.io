import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages — outputs a fully static site to `out/`
  output: "export",
  images: {
    // GitHub Pages has no image optimization server
    unoptimized: true,
  },
};

export default nextConfig;
