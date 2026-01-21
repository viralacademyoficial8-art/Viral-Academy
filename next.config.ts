import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "**.wp.com",
      },
      {
        protocol: "https",
        hostname: "**.wordpress.com",
      },
      {
        protocol: "https",
        hostname: "viralacademy.com",
      },
      {
        protocol: "https",
        hostname: "**.viralacademy.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
