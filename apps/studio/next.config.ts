import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  env: {
    // Resolve to packages/content for book data
    // This allows Studio to read/write the shared content package
    CONTENT_PATH: path.resolve(__dirname, '../../packages/content'),
  },
};

export default nextConfig;
