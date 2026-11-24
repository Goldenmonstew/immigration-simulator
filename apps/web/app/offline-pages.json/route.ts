import { sitePagePaths } from '../../lib/site-countries';

export const dynamic = 'force-static';

export function GET() {
  return Response.json(sitePagePaths);
}
