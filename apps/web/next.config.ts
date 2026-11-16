import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  env: {
    NEXT_PUBLIC_BUILD_SHA: (process.env.GITHUB_SHA ?? '').slice(0, 7),
  },
  transpilePackages: [
    '@uk-immigration/engine',
    '@uk-immigration/game',
    '@uk-immigration/policy-data',
  ],
};

export default nextConfig;
