import type { NextConfig } from 'next';

// GitHub Pages serves the site under /<repo>; Cloudflare at the root.
const basePath = process.env.BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  ...(basePath ? { basePath } : {}),
  experimental: { inlineCss: true },
  env: {
    NEXT_PUBLIC_BUILD_SHA: (process.env.BUILD_SHA ?? '').slice(0, 7),
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  transpilePackages: [
    '@uk-immigration/engine',
    '@uk-immigration/game',
    '@uk-immigration/policy-data',
  ],
};

export default nextConfig;
