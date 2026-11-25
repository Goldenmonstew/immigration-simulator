// Keep the asset manifest separate from the engine and stories for the initial HTML.
// Japan reuses the shared CC0 art; its own cast borrows existing residents.
export const jpGameArt = {
  root: '/game',
  town: '/assets/meadow-town',
  banner: '/japan/town-banner.png',
  townMap: '/japan/town.json',
  homeMap: '/home.json',
  defaultResident: 'skilled-worker',
  residents: [] as string[],
  cast: {
    engineer: 'hong-kong-bno',
    spouse: 'family-partner',
    yoshie: 'margaret',
    kenji: 'dave',
    misaki: 'yao-flatmate',
    lan: 'graduate',
    daisuke: 'jamie',
    raj: 'rahman',
    sho: 'ka-ning-child',
    yuto: 'skilled-worker',
  } as Record<string, string>,
  shopSigns: [
    'cafe',
    'shop',
    'pub',
    'gp',
    'library',
    'college',
    'visa',
    'station',
  ],
  crops: ['turnip', 'potato', 'strawberry', 'tomato', 'cucumber', 'corn'],
};
