import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "img.magnific.com" },
      { protocol: "https", hostname: "**.magnific.com" },
      { protocol: "https", hostname: "staticecp.uprinting.com" },
      { protocol: "https", hostname: "**.uprinting.com" },
      { protocol: "https", hostname: "printoe.com" },
    ],
  },
};

export default nextConfig;
