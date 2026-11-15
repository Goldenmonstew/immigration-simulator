import { describe, expect, test } from 'vitest';
import { newGame, npcs, resolve, talk } from '../src';
import { heartEvents } from '../src/npcs';
import { clear } from './helpers';

describe('12.1 dialogue residuals', () => {
  test.each(Array.from({ length: 6 }, (_, i) => `jamie-daily-${31 + i}`))(
    '%s returns after reemployment and stays silent during unemployment or the work pause',
    (id) => {
      const jamie = npcs.find((npc) => npc.id === 'jamie')!;
      const original = jamie.lines;
      const line = original.find((entry) => entry.id === id)!;
      const fallback = {
        id: 'fallback',
        text: { zhCN: '你好。', en: 'Hello.' },
      };
      jamie.lines = [line, fallback];
      try {
        for (const [flags, visible] of [
          [[], true],
          [['family-jamie-unemployed'], false],
          [['family-jamie-unemployed', 'family-jamie-reemployed'], true],
          [['family-pip-applied'], false],
          [
            [
              'family-jamie-unemployed',
              'family-jamie-reemployed',
              'family-pip-applied',
            ],
            false,
          ],
        ] as const) {
          const state = clear(newGame('family-partner', 1));
          state.flags = [...flags];
          state.day.minute = 1080;
          state.heard = [fallback.id];
          expect(talk(state, 'jamie').outcome?.text, flags.join(',')).toEqual(
            visible ? line.text : fallback.text,
          );
        }
      } finally {
        jamie.lines = original;
      }
    },
  );

  const scene = heartEvents.find((event) => event.id === 'heart-ade-10')!;
  test.each(scene.choices)(
    '$id keeps Ade’s chosen agreement in his own voice',
    (choice) => {
      const before = clear(newGame('skilled-worker', 1));
      before.pendingEvent = scene.id;
      before.flags = ['talked-ade'];
      const after = clear(resolve(before, choice.id));
      const ade = npcs.find((npc) => npc.id === 'ade')!;
      const reply = ade.lines.find(
        (line) => line.id === `${scene.id}-${choice.id}-reply`,
      )!;
      after.heard = ade.lines
        .filter((line) => line.id !== reply.id)
        .map((line) => line.id);
      const spoken = talk(after, 'ade');
      expect(spoken.outcome?.text).toEqual(reply.text);
      expect(reply.text.zhCN).not.toMatch(/另案讨论|会前确认|议题关闭/);
      expect(reply.text.zhCN).toMatch(/（.+）/);
      expect(reply.text.en).toMatch(/\(.+\)/);
      expect(reply.text.zhCN.length).toBeLessThanOrEqual(40);
      expect(reply.text.zhCN).toContain(
        choice === scene.choices[0] ? '不聊工作' : '想聊工作吗',
      );
    },
  );
});
