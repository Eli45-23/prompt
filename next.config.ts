import type { NextConfig } from "next";

  const nextConfig: NextConfig = {
    output: undefined, // Explicitly prevent static export
    images: {
      unoptimized: true,
    },
  };
