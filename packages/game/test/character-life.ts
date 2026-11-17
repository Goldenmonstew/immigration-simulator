import type { GameEvent } from '../src';
import * as skilledWorker from '../src/characters/skilled-worker-life';
import * as hongKongBno from '../src/characters/hong-kong-bno-life';
import * as familyPartner from '../src/characters/family-partner-life';

export const lifeChains: Record<string, GameEvent[]> = {
  'skilled-worker': skilledWorker.lifeChains,
  'hong-kong-bno': hongKongBno.lifeChains,
  'family-partner': familyPartner.lifeChains,
};

export const characterLifeEvents: Record<string, GameEvent[]> = {
  'skilled-worker': skilledWorker.characterLifeEvents,
  'hong-kong-bno': hongKongBno.characterLifeEvents,
  'family-partner': familyPartner.characterLifeEvents,
};
