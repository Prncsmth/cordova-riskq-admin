import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  // Pins the workspace root to this project -- without this, Turbopack walks
  // up the directory tree, finds an unrelated package-lock.json sitting in
  // the home directory, and mistakenly treats that as the workspace root.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;