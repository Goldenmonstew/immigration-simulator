import type {
  AnchorId,
  GameEvent,
  GameState,
  MapSurprise,
  SurpriseId,
  Text,
} from './types';

const scenes: {
  id: SurpriseId;
  anchor: AnchorId;
  clue: Text;
  event: GameEvent;
  results: Record<string, { text: Text; trace: Text }>;
}[] = [
  {
    id: 'biscuit-cat',
    anchor: 'high-street-west',
    clue: {
      zhCN: '小店窗台下多了一条晃动的条纹尾巴。',
      en: 'A striped tail flicks beneath the shop windowsill.',
    },
    event: {
      id: 'surprise-biscuit-cat',
      title: { zhCN: '窗台下的尾巴', en: 'The tail below the sill' },
      text: {
        zhCN: '你认出寻猫公告上的饼干。它缩在窗台下，拉赫曼的联系便条贴在门边。你停住脚步。',
        en: 'You recognise Biscuit from the missing-cat notice. The cat crouches below the sill, beside Rahman’s contact note. You stop walking.',
      },
      weight: 0,
      once: true,
      choices: [
        {
          id: 'wait',
          label: {
            zhCN: '蹲远一点，等主人拿猫包来',
            en: 'Wait at a distance for the owner’s carrier',
          },
          effects: [{ type: 'stat', key: 'mood', delta: 2 }],
        },
        {
          id: 'call',
          label: {
            zhCN: '照便条报位置，给它留出空地',
            en: 'Report the location and leave the cat some space',
          },
          effects: [{ type: 'stat', key: 'mood', delta: 2 }],
        },
      ],
    },
    results: {
      wait: {
        text: {
          zhCN: '你蹲在远处等。主人带猫包赶来，饼干自己钻了进去；窗台下留下倒扣的空水碟。',
          en: 'You wait at a distance. The owner arrives with a carrier and Biscuit climbs in. An empty water dish is left upside down below the sill.',
        },
        trace: {
          zhCN: '窗台下倒扣着猫用过的水碟。',
          en: 'The cat’s water dish rests upside down below the sill.',
        },
      },
      call: {
        text: {
          zhCN: '你报清位置后让开。稍后门边添了主人的便条：「已接回家，谢谢。」寻猫纸卷进了回收筐。',
          en: 'You report the location and move aside. Later, the owner leaves a note: “Home safe, thank you.” The missing-cat notice goes into the recycling basket.',
        },
        trace: {
          zhCN: '小店门边贴着「已接回家，谢谢」。',
          en: 'A “Home safe, thank you” note is posted by the shop door.',
        },
      },
    },
  },
  {
    id: 'swap-box',
    anchor: 'library-steps',
    clue: {
      zhCN: '图书馆台阶旁多了纸箱，干净花盆露出半边。',
      en: 'A box of clean plant pots sits beside the library steps.',
    },
    event: {
      id: 'surprise-swap-box',
      title: { zhCN: '台阶旁的花盆', en: 'Pots by the steps' },
      text: {
        zhCN: '你走近交换箱，翻开的纸盖写着：「花盆免费领，也欢迎帮忙分类。」箱底还压着几张旧标签。',
        en: 'You approach the swap box. Its open lid says, “Pots free to take. Help sorting welcome too.” Old labels line the bottom.',
      },
      weight: 0,
      once: true,
      choices: [
        {
          id: 'pot',
          label: {
            zhCN: '挑一个花盆，把其余的摞稳',
            en: 'Take a pot and stack the others safely',
          },
          effects: [{ type: 'item', item: 'swap-pot', delta: 1 }],
        },
        {
          id: 'sort',
          label: {
            zhCN: '留下花盆，按大小重新分类',
            en: 'Leave the pots and sort them by size',
          },
          effects: [{ type: 'stat', key: 'mood', delta: 2 }],
        },
      ],
    },
    results: {
      pot: {
        text: {
          zhCN: '你带走一个洗净的花盆，把剩下的摞稳。箱盖合上半边，露着你压平的「欢迎再用」标签。',
          en: 'You take a clean pot and stack the rest safely. The half-closed lid shows the “Use again” label you flattened.',
        },
        trace: {
          zhCN: '台阶旁的箱盖上留着「欢迎再用」标签。',
          en: 'The box lid by the steps keeps its “Use again” label.',
        },
      },
      sort: {
        text: {
          zhCN: '你把花盆按大小摆开，旧标签翻面写成尺寸。后来箱子收走了，你写的分类签留在门边。',
          en: 'You sort the pots by size and reuse the backs of old labels. Later the box is collected; your size labels stay beside the door.',
        },
        trace: {
          zhCN: '图书馆门边留着你写的花盆分类签。',
          en: 'Your handwritten pot-size labels remain beside the library door.',
        },
      },
    },
  },
  {
    id: 'lost-mitten',
    anchor: 'park-bench',
    clue: {
      zhCN: '长椅靠背上搭着一只手套，袖口系着细绳。',
      en: 'A mitten with a cuff string hangs over the bench back.',
    },
    event: {
      id: 'surprise-lost-mitten',
      title: { zhCN: '长椅上的单只手套', en: 'One mitten on the bench' },
      text: {
        zhCN: '你走到长椅边，发现手套内侧缝着图书馆失物牌。细绳快滑进椅缝，远处还有人在低头找东西。',
        en: 'You reach the bench. A library lost-property tag is sewn inside the mitten. Its string slips towards a gap; someone in the distance is searching the ground.',
      },
      weight: 0,
      once: true,
      choices: [
        {
          id: 'desk',
          label: {
            zhCN: '按失物牌联系图书馆来收',
            en: 'Use the tag to ask the library to collect it',
          },
          effects: [{ type: 'stat', key: 'mood', delta: 2 }],
        },
        {
          id: 'owner',
          label: {
            zhCN: '举起手套，问远处找东西的人',
            en: 'Hold it up for the person searching nearby',
          },
          effects: [{ type: 'stat', key: 'mood', delta: 2 }],
        },
      ],
    },
    results: {
      desk: {
        text: {
          zhCN: '你照牌上的号码联系图书馆，等工作人员来收。你把「失物请问图书馆」的小牌系在长椅侧面。',
          en: 'You call the library using the tag and wait for collection. You tie a “Lost property: ask at the library” label to the bench side.',
        },
        trace: {
          zhCN: '长椅侧面系着「失物请问图书馆」的小牌。',
          en: 'A “Lost property: ask at the library” label hangs from the bench.',
        },
      },
      owner: {
        text: {
          zhCN: '你举起手套，对方拿出另一只来配。临走前，你们把长椅边的空挂钩扶正，留给下件失物。',
          en: 'You hold up the mitten. The person produces its partner. Before leaving, you straighten the empty hook beside the bench for the next lost thing.',
        },
        trace: {
          zhCN: '长椅边的失物挂钩被扶正了。',
          en: 'The lost-property hook beside the bench has been straightened.',
        },
      },
    },
  },
];

export const surpriseEvents = scenes.map((scene) => scene.event);

/** Each scene gets one representative day in its own first-year quarter. */
export function mapSurprises(state: GameState): MapSurprise[] {
  if (state.trip || state.ending) return [];
  return scenes.flatMap((scene, index): MapSurprise[] => {
    const record = state.surpriseRecords?.find(
      (entry) => entry.id === scene.id,
    );
    if (record)
      return [
        {
          id: scene.id,
          phase: 'trace',
          anchor: scene.anchor,
          text: scene.results[record.choiceId].trace,
        },
      ];
    const day =
      index * 3 + ((Math.imul(state.seed ^ (index + 1), 2654435761) >>> 0) % 3);
    if (
      state.pendingEvent ||
      state.firedEvents.includes(scene.event.id) ||
      state.dayNumber !== day ||
      state.day.minute < 540 ||
      state.day.minute >= 1080
    )
      return [];
    return [
      {
        id: scene.id,
        phase: 'clue',
        anchor: scene.anchor,
        text: scene.clue,
        expiresMinute: 1080,
      },
    ];
  });
}

export function surpriseEventAt(
  state: GameState,
  anchor: AnchorId,
): GameEvent | undefined {
  const clue = mapSurprises(state).find(
    (entry) => entry.phase === 'clue' && entry.anchor === anchor,
  );
  return scenes.find((scene) => scene.id === clue?.id)?.event;
}

export function completeSurprise(
  state: GameState,
  eventId: string,
  choiceId: string,
): Text | undefined {
  const scene = scenes.find((entry) => entry.event.id === eventId);
  if (!scene) return undefined;
  state.surpriseRecords ??= [];
  state.surpriseRecords.push({
    id: scene.id,
    choiceId,
    dayNumber: state.dayNumber,
  });
  return scene.results[choiceId].text;
}
