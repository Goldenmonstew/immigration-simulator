import type { GameEvent } from '../types';

// News dates: docs/SOURCES.md publication register. All town reactions are fiction.
// News delivery windows last one editorial quarter after publication. Character
// follow-ups allow later quarterly draws after the news has been read. The
// reminder starts two editorial quarters before its registered legal cutoff.
export const policyStories: {
  published: string;
  until: string;
  character?: string;
  event: GameEvent;
}[] = [
  {
    // SRC-012 CP 1326, physical p72, paragraphs 264–267: settlement proposals
    // and a further consultation. Publication: 2025-05-12 (source register).
    published: '2025-05-12',
    until: '2025-08-12',
    event: {
      id: 'news-white-paper',
      title: { zhCN: '公告栏的新剪报', en: 'A fresh cutting on the board' },
      text: {
        zhCN: '移民白皮书发布了。公告栏的剪报被风掀起，几位邻居围着定居提案那一段，谁也没先走。',
        en: 'The immigration white paper is out. Wind lifts the cutting on the noticeboard. Neighbours linger around the settlement proposals.',
      },
      weight: 0,
      once: true,
      channel: 'morning',
      choices: [
        {
          id: 'read',
          label: {
            zhCN: '按住纸角，把那段读完',
            en: 'Hold the corner and finish reading',
          },
          effects: [{ type: 'none' }],
        },
        {
          id: 'listen',
          label: { zhCN: '听听邻居在谈什么', en: 'Listen to the neighbours' },
          effects: [{ type: 'none' }],
        },
      ],
    },
  },
  {
    // SRC-013 CP 1448, physical p10, settlement consultation options.
    // Publication: 2025-11-20 (source register, consultation page).
    published: '2025-11-20',
    until: '2026-02-20',
    event: {
      id: 'news-consultation',
      title: { zhCN: '咖啡杯旁的问卷', en: 'A questionnaire beside the cup' },
      text: {
        zhCN: '定居咨询发布了。咖啡馆有人打印了问卷，大家把椅子挪近，谈起已经在路上的人会怎样。',
        en: 'The settlement consultation is out. Someone brings a printed questionnaire to the café. Chairs draw closer as people discuss those already on the journey.',
      },
      weight: 0,
      once: true,
      channel: 'morning',
      choices: [
        {
          id: 'read',
          label: {
            zhCN: '借来问卷，慢慢读',
            en: 'Borrow the questionnaire and read',
          },
          effects: [{ type: 'none' }],
        },
        {
          id: 'talk',
          label: {
            zhCN: '说说自己听到的疑问',
            en: 'Share the questions you have heard',
          },
          effects: [{ type: 'none' }],
        },
      ],
    },
  },
  {
    // SRC-001 CP 1707, physical p8–10, introduction and implementation guidance;
    // SRC-002 HC Deb vol 792 col 593, Rules changes still to be laid.
    // Both published 2026-11-02 (source register). No outcome is predicted.
    published: '2026-11-02',
    until: '2027-02-02',
    event: {
      id: 'news-consultation-response',
      title: { zhCN: '广播里的一段回应', en: 'A response on the radio' },
      text: {
        zhCN: '政府公布了定居咨询回应。小店广播念起标题，柜台前的人停下挑茶，有人问正式规则何时才看得到。',
        en: 'The government publishes its settlement consultation response. The shop radio reads the headline. People stop choosing tea; someone asks when the formal Rules will be available.',
      },
      weight: 0,
      once: true,
      channel: 'morning',
      choices: [
        {
          id: 'listen',
          label: {
            zhCN: '等广播念完，再结账',
            en: 'Hear the bulletin out before paying',
          },
          effects: [{ type: 'none' }],
        },
        {
          id: 'read',
          label: {
            zhCN: '记下标题，回家找原文',
            en: 'Note the title and look up the full response at home',
          },
          effects: [{ type: 'none' }],
        },
      ],
    },
  },
  {
    // SRC-032, published 2026-10-28, §7.9 "Backing business and British
    // Industry", "Implementing MAC recommendations on visa salary requirements":
    // spring 2027 is an implementation window, not an effective Rules date.
    // The end of this delivery window is editorial, not a policy deadline.
    published: '2026-10-28',
    until: '2027-01-28',
    event: {
      id: 'news-budget-2026',
      title: { zhCN: '沾着茶渍的预算新闻', en: 'Budget news with a tea stain' },
      text: {
        zhCN: '你在茶渍旁读到预算案：拟于2027年春季调整工作签证薪资要求。有人追问新金额，你指着「待细则」那一栏。',
        en: 'Beside a tea stain, you read the Budget plan to change work visa salary requirements in spring 2027. Someone asks for new amounts; you point to the details still to come.',
      },
      weight: 0,
      once: true,
      channel: 'morning',
      choices: [
        {
          id: 'read',
          label: {
            zhCN: '你把实施窗口与待定细节分开记',
            en: 'Note the window separately from the pending details',
          },
          effects: [{ type: 'none' }],
          sets: ['budget-news-read'],
        },
        {
          id: 'talk',
          label: {
            zhCN: '你和邻居约好等正式规则再核对',
            en: 'Agree with a neighbour to check the formal Rules when published',
          },
          effects: [{ type: 'none' }],
          sets: ['budget-news-read'],
        },
      ],
    },
  },
];
