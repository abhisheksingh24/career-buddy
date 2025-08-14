import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Turbopack/bundler from inlining these native/Node-expected libs
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

export default nextConfig;
