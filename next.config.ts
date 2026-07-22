import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "img.magnific.com" },
      { protocol: "https", hostname: "**.magnific.com" },
    ],
  },
};

export default nextConfig;
