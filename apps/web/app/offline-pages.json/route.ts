import { countryPath, nonUkCountries } from '../../lib/site-countries';

export const dynamic = 'force-static';

export function GET() {
  return Response.json([
    '/',
    ...['', 'simulate', 'result', 'whatif', 'policy', 'about', 'game'].map(
      (sub) => countryPath('uk', sub),
    ),
    ...nonUkCountries.map(({ id }) => countryPath(id)),
  ]);
}
