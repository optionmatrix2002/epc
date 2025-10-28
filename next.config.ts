import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Removed `output: "export"` for normal dev server behavior which
  // improves hot-reload and development build performance.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
