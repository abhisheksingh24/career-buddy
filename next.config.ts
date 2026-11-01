import type { NextConfig } from "next";

import { securityHeaders } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  // Prevent the bundler from inlining these native/Node-expected libs
  serverExternalPackages: ["pdf-parse", "mammoth"],
  // react-pdf optionally requires the native `canvas` package; stub it out.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders(process.env.NODE_ENV !== "production"),
      },
    ];
  },
  turbopack: {
    resolveAlias: {
      canvas: "./src/lib/empty-module.ts",
    },
  },
};

export default nextConfig;
