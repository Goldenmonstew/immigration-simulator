import { createArt } from './art';
import { createCharacterSelect } from './character-select';
import { createDiary } from './diary';
import { createEnding } from './ending';
import { createEventCards } from './event-card';
import { createGameClient } from './game-client';
import { createHud } from './hud';
import { createLifeOverlays } from './life-overlays';
import { createLocationMenu } from './location-menu';
import { createQuarterSummary } from './quarter-summary';
import { createSession } from './session';
import type { GameCountry, GameKinds } from './types';

function createViews<K extends GameKinds>(c: GameCountry<K>) {
  const art = createArt(c.art, c.asset);
  const session = createSession(c);
  const diary = createDiary(c);
  const menu = createLocationMenu(c);
  const cards = createEventCards(c, menu);
  const hud = createHud(c);
  const { QuarterSummary } = createQuarterSummary(c, { ...session, ...cards });
  const life = createLifeOverlays(c, { ...menu, ...cards, ...session, ...art });
  const ending = createEnding(c, { ...session, ...art });
  const CharacterSelect = createCharacterSelect(c, art);
  return {
    ...art,
    ...session,
    ...diary,
    ...menu,
    ...cards,
    ...hud,
    QuarterSummary,
    ...life,
    ...ending,
    CharacterSelect,
  };
}
export type GameShellViews<K extends GameKinds> = ReturnType<
  typeof createViews<K>
>;

/**
 * The country-independent game, bound to one country's content pack, art and
 * assessment views. Each country keeps one shell and re-exports its parts.
 */
export function createGameShell<K extends GameKinds>(c: GameCountry<K>) {
  const views = createViews(c);
  return { ...views, GameClient: createGameClient(c, views) };
}
