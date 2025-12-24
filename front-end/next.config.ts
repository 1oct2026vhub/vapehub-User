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
        port: '',
        pathname: '/**',
      },
    ],
    // Disable image optimization to preserve original quality and formats
    // This prevents WebP conversion, compression, and filename changes
    // Images will be served as-is with their original quality and format
    unoptimized: true,
  },
   experimental: {
    scrollRestoration: false,
     authInterrupts: true
  }
};

export default nextConfig;
