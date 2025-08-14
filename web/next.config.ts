import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        // ensure Node can't walk outside project for styles
      },
    },
  },
};

export default nextConfig;
