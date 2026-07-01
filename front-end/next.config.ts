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
    // Serve media as uploaded (e.g. WEBP on S3). No /_next/image/ transcoding to AVIF/JPEG.
    unoptimized: true,
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
  },
   experimental: {
    scrollRestoration: false,
     authInterrupts: true
  }
};

export default nextConfig;
