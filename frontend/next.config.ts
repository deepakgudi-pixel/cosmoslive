import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  productionBrowserSourceMaps: false,
  experimental: {
    preloadEntriesOnStart: false,
    serverSourceMaps: false,
    webpackMemoryOptimizations: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "apod.nasa.gov" },
      { protocol: "https", hostname: "images-assets.nasa.gov" },
      { protocol: "https", hostname: "mars.nasa.gov" },
      { protocol: "http", hostname: "mars.nasa.gov" },
      { protocol: "https", hostname: "**.nasa.gov" },
      { protocol: "https", hostname: "images-api.nasa.gov" },
      { protocol: "https", hostname: "**.spaceflightnewsapi.net" },
      { protocol: "https", hostname: "**.thespacedevs.com" },
      { protocol: "https", hostname: "live.staticflickr.com" },
      { protocol: "https", hostname: "**.flickr.com" },
    ],
  },
  async rewrites() {
    // When running on the server (rewrites), the backend is always reachable 
    // at localhost:4000 within the same container/machine.
    // Using the public URL here can cause issues if the container cannot
    // resolve its own public domain.
    const apiTarget = "http://localhost:4000";

    return [
      {
        source: "/api/:path*",
        destination: `${apiTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
