import type { GameEvent, Npc, Text } from '@uk-immigration/game/core';
import type { GameArt } from './types';

export const expressions = ['neutral', 'happy', 'worried'] as const;
type Expression = (typeof expressions)[number];

/** Paths for one country's portraits, walking sprites and shop signs. */
export function createArt(art: GameArt, asset: (path: string) => string) {
  const artRoot = asset(art.town);
  // A cast member borrows another resident's drawings.
  const resident = (id: string) =>
    art.cast?.[id] ?? (art.residents.includes(id) ? id : art.defaultResident);
  return {
    portraitIds: art.residents,
    townBanner: `${artRoot}/town-banner.png`,
    portraitPath(id: string, expression = 'neutral') {
      const face =
        expressions.find((value) => value === expression) ?? 'neutral';
      return `${artRoot}/portraits/${resident(id)}-${face}.png`;
    },
    spritePath: (id: string) => asset(`/assets/urban/${resident(id)}.png`),
    shopSignIds: art.shopSigns,
    signPath: (id: string) => `${artRoot}/signs/${id}.png`,
    cropIds: art.crops,
  };
}

// Use the displayed bilingual text, never a previous outcome or keyword guesses.
export function dialogueExpression<F extends string>(
  person: Npc<F>,
  text: Text,
  event?: GameEvent<{ type: string }, F>,
): Expression {
  if (event) return event.heart?.hearts === 10 ? 'happy' : 'neutral';
  const matches = (candidate: Text) =>
    candidate.en === text.en && candidate.zhCN === text.zhCN;
  if (matches(person.reactions.disliked)) return 'worried';
  if (matches(person.reactions.loved) || matches(person.reactions.liked))
    return 'happy';
  const line = person.lines.find((line) => matches(line.text));
  for (const condition of line?.when ?? []) {
    if ('stat' in condition && condition.stat === 'mood') {
      if (condition.max !== undefined) return 'worried';
      if (condition.min !== undefined) return 'happy';
    }
  }
  return 'neutral';
}

// Display the plaque at 16px on the solid wall tile left of the door.
export const signPosition = (door: { x: number; y: number }) => ({
  x: door.x - 8,
  y: door.y - 8,
});
