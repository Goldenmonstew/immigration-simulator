// Keep the asset manifest separate from the engine and stories for the initial HTML.
// Greece reuses the shared CC0 art; its own cast borrows existing residents.
export const grGameArt = {
  root: '/game',
  town: '/assets/meadow-town',
  banner: '/greece/town-banner.png',
  townMap: '/greece/town.json',
  homeMap: '/home.json',
  /** The shared town tiles, recoloured with whitewash and Aegean blue. */
  tiles: '/greece/tiles.png',
  defaultResident: 'skilled-worker',
  residents: [] as string[],
  cast: {
    bluecard: 'rahman',
    spouse: 'ka-ning-partner',
    eleni: 'margaret',
    stavros: 'gareth',
    katerina: 'maeve',
    ardit: 'dave',
    despina: 'lina',
    thanasis: 'hong-kong-bno',
    nefeli: 'ka-ning-child',
    yannis: 'skilled-worker',
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
  crops: ['tomato', 'cucumber', 'potato', 'strawberry', 'corn', 'turnip'],
};
