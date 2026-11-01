import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent the bundler from inlining these native/Node-expected libs
  serverExternalPackages: ["pdf-parse", "mammoth"],
  // react-pdf optionally requires the native `canvas` package; stub it out.
  turbopack: {
    resolveAlias: {
      canvas: "./src/lib/empty-module.ts",
    },
  },
};

export default nextConfig;
