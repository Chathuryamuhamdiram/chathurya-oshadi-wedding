import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
