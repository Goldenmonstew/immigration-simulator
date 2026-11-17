import type { Character } from '../types';
import {
  skilledWorkerProfile,
  hongKongBnoProfile,
  familyPartnerProfile,
  graduateProfile,
} from './metadata';

const roster = [
  {
    profile: skilledWorkerProfile,
    load: async () => (await import('./skilled-worker')).skilledWorker,
  },
  {
    profile: hongKongBnoProfile,
    load: async () => (await import('./hong-kong-bno')).hongKongBno,
  },
  {
    profile: familyPartnerProfile,
    load: async () => (await import('./family-partner')).familyPartner,
  },
  {
    profile: graduateProfile,
    load: async () => (await import('./graduate')).graduate,
  },
];
export const characters = roster.map(({ profile }) => profile);

const loaded = new Map<string, Character>();

export async function loadCharacter(id: string): Promise<Character> {
  const character = loaded.get(id);
  if (character) return character;
  const entry = roster.find(({ profile }) => profile.id === id);
  if (!entry) throw new Error(`Unknown character: ${id}`);
  const story = await entry.load();
  loaded.set(id, story);
  return story;
}

export function characterOf(id: string): Character {
  const character = loaded.get(id);
  if (!character) throw new Error(`Character not loaded: ${id}`);
  return character;
}
