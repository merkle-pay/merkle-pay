import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/index.html",
      },
    ];
  },
};

export default nextConfig;
