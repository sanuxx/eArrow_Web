import type { NextConfig } from "next";

// Set by the GitHub Actions workflow to "/<repo-name>" for project pages
// (e.g. https://<user>.github.io/<repo>/), left empty for user/org root
// pages (a repo named <user>.github.io) and for local dev.
const basePath = process.env.NEXT_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
};

export default nextConfig;
