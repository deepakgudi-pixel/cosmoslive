import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  turbopack: {},
};

export default nextConfig;
