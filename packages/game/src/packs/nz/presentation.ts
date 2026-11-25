// Keep the asset manifest separate from the engine and stories for the initial HTML.
// New Zealand reuses the shared CC0 art; its own cast borrows existing residents.
export const nzGameArt = {
  root: '/game',
  town: '/assets/meadow-town',
  banner: '/new-zealand/town-banner.png',
  townMap: '/new-zealand/town.json',
  homeMap: '/home.json',
  defaultResident: 'skilled-worker',
  residents: [] as string[],
  cast: {
    nurse: 'priya',
    partner: 'skilled-worker',
    mere: 'margaret',
    bruce: 'dave',
    sione: 'ade',
    grace: 'ka-ning-partner',
    annelie: 'lina',
    nikau: 'ka-ning-child',
    hamish: 'jamie',
    aroha: 'graduate',
  } as Record<string, string>,
  shopSigns: [
    'cafe',
    'shop',
    'pub',
    'gp',
    'library',
    'college',
    'council',
    'visa',
  ],
  crops: ['turnip', 'potato', 'strawberry', 'tomato', 'cucumber', 'corn'],
};
