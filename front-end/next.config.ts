import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "vapehub-dev.s3.eu-central-1.amazonaws.com",
        pathname: '/**',
      },
    ],
    // Re-enable Next.js Image Optimization for smaller payloads and WebP/AVIF delivery.
    // Note: `remotePatterns` controls which external hosts are allowed for `next/image`.
    formats: ["image/avif", "image/webp"],
    // Cache optimized images for at least 1 hour to avoid repeated CPU work.
    minimumCacheTTL: 60 * 60,
  },
   experimental: {
    scrollRestoration: false,
     authInterrupts: true
  }
};

export default nextConfig;
