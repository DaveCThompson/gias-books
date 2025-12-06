// Use explicit DEPLOY_TARGET env var for static export (not NODE_ENV which is always 'production' in builds)
// Set DEPLOY_TARGET=github-pages when deploying to GitHub Pages
const isGitHubPagesDeploy = process.env.DEPLOY_TARGET === 'github-pages';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Scope file tracing to this app only (prevents cross-app interference in monorepo)
  outputFileTracingRoot: __dirname,

  // Disable ESLint during build (we run it separately via turbo)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Only use static export when explicitly deploying to GitHub Pages
  // Regular builds should NOT use static export (getServerSideProps requires server)
  ...(isGitHubPagesDeploy ? { output: 'export' } : {}),

  // BasePath for GitHub Pages deployment
  basePath: isGitHubPagesDeploy ? '/gias-books' : '',

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
