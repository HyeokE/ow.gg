import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d15f34w2p8l1cc.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "blz-contentstack-images.akamaized.net",
      },
      {
        protocol: "https",
        hostname: "static.playoverwatch.com",
      },
      {
        protocol: "https",
        hostname: "overfast-api.tekrop.fr",
      },
    ],
  },
  watchOptions: {
    pollIntervalMs: 1000,
  },
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
