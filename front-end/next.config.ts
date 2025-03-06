import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ]
  },
  trailingSlash: true
};

export default nextConfig;
