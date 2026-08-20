import type { NextConfig } from "next";

// Set by the GitHub Actions workflow to "/<repo-name>" for project pages
// (e.g. https://<user>.github.io/<repo>/), left empty for user/org root
// pages (a repo named <user>.github.io) and for local dev.
// Must be NEXT_PUBLIC_-prefixed so it's also readable client-side (see
// src/lib/basePath.ts), since next/image doesn't prefix `src` itself when
// images.unoptimized is set.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
};

export default nextConfig;
