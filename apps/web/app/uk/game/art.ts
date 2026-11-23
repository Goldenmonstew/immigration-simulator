import type { GameEvent, Npc, Text } from '@uk-immigration/game';
import { ukArt, ukAsset } from './country';

export const portraitIds = ukArt.residents;
export const expressions = ['neutral', 'happy', 'worried'] as const;
type Expression = (typeof expressions)[number];
const artRoot = ukAsset(ukArt.town);
export const townBanner = `${artRoot}/town-banner.png`;

export function portraitPath(id: string, expression = 'neutral') {
  const person = portraitIds.includes(id) ? id : ukArt.defaultResident;
  const face = expressions.find((value) => value === expression) ?? 'neutral';
  return `${artRoot}/portraits/${person}-${face}.png`;
}

// Use the displayed bilingual text, never a previous outcome or keyword guesses.
export function dialogueExpression(
  person: Npc,
  text: Text,
  event?: GameEvent,
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

export const shopSignIds = ukArt.shopSigns;
export const signPath = (id: string) => `${artRoot}/signs/${id}.png`;

// Display the plaque at 16px on the solid wall tile left of the door.
export const signPosition = (door: { x: number; y: number }) => ({
  x: door.x - 8,
  y: door.y - 8,
});
