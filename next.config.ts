import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Turbopack/bundler from inlining these native/Node-expected libs
  serverExternalPackages: ["pdf-parse", "mammoth"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
