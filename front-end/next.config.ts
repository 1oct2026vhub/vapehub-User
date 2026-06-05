import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// Ensure .env / .env.local are loaded before reading PRERENDER_TOKEN for the env block.
loadEnvConfig(process.cwd());

const nextConfig: NextConfig = {
  trailingSlash: true,
  // Edge middleware inlines env at build time; expose PRERENDER_TOKEN explicitly.
  env: {
    PRERENDER_TOKEN: process.env.PRERENDER_TOKEN,
    PRERENDER_SERVICE_URL: process.env.PRERENDER_SERVICE_URL,
    PRERENDER_ENABLED: process.env.PRERENDER_ENABLED,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
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
