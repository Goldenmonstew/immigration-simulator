import { characters, loadCharacter } from '@uk-immigration/game';

export const loadedCharacters = await Promise.all(
  characters.map(({ id }) => loadCharacter(id)),
);
