import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  basePath: '/prompt',
  assetPrefix: '/prompt/',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
