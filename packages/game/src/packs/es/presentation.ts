// Keep the asset manifest separate from the engine and stories for the initial HTML.
// Spain reuses the shared CC0 art; its own cast borrows existing residents.
export const esGameArt = {
  root: '/game',
  town: '/assets/meadow-town',
  banner: '/spain/town-banner.png',
  townMap: '/spain/town.json',
  homeMap: '/home.json',
  defaultResident: 'skilled-worker',
  residents: [] as string[],
  cast: {
    cook: 'gareth',
    exporter: 'ka-ning-partner',
    amparo: 'margaret',
    tonet: 'dave',
    herminia: 'maeve',
    sergi: 'hong-kong-bno',
    fatima: 'priya',
    marina: 'lina',
    quique: 'jamie',
    lele: 'ka-ning-child',
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
  crops: ['tomato', 'potato', 'strawberry', 'cucumber', 'corn'],
};
