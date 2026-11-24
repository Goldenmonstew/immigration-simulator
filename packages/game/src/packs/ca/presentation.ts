// Keep the asset manifest separate from the engine and stories for the initial HTML.
// Canada reuses the shared CC0 art; its own cast borrows existing residents.
export const caGameArt = {
  root: '/game',
  town: '/assets/meadow-town',
  banner: '/canada/town-banner.png',
  townMap: '/canada/town.json',
  homeMap: '/home.json',
  defaultResident: 'skilled-worker',
  residents: [] as string[],
  cast: {
    citizen: 'ka-ning-partner',
    graduate: 'graduate',
    doreen: 'margaret',
    gerry: 'gareth',
    mike: 'dave',
    bonnie: 'helen',
    fatima: 'lina',
    kwame: 'ade',
    leo: 'ka-ning-child',
    chloe: 'maeve',
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
  crops: ['potato', 'turnip', 'strawberry', 'tomato', 'cucumber', 'corn'],
};
