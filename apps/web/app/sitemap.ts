import type { MetadataRoute } from 'next';
import { sitePagePaths } from '../lib/site-countries';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const origin = basePath
    ? 'https://goldenmonstew.github.io'
    : 'https://immigration-simulator.pages.dev';
  return sitePagePaths.map((path) => ({ url: origin + basePath + path }));
}
