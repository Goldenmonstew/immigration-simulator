import { policyStories } from '../events/policy';
import type { GameEvent } from '../types';

// Fictional scenes inspired by the research library L11, L15 and L02.
// Existing invitation, school-letter and kettle cards open these follow-ups.
export const lifeChains: GameEvent[] = [
  {
    id: 'family-ledger-plan',
    title: { zhCN: '厨房本子的新页', en: 'A new page in the kitchen book' },
    text: {
      zhCN: '你们定好水壶的办法，杰米翻开厨房本子：「咱们把共用的钱写这儿！哎，菜谱得往后挪一页。」',
      en: 'You have agreed how to handle the kettle. Jamie opens your kitchen book. “Let’s put our shared spending here! Oh, the recipe needs to move back a page.”',
    },
    channel: 'letter',
    weight: 3,
    once: true,
    requires: ['family-ledger-invited'],
    choices: [
      {
        id: 'shared',
        label: {
          zhCN: '你们划出共用栏，每次一起补记',
          en: 'Draw a shared column and update it together each time',
        },
        effects: [{ type: 'friendship', npc: 'jamie', delta: 5 }],
        sets: ['family-ledger-shared', 'family-ledger-planned'],
      },
      {
        id: 'separate',
        label: {
          zhCN: '你们各记各的，约好定期合一次',
          en: 'Keep separate notes and agree to compare them regularly',
        },
        effects: [{ type: 'friendship', npc: 'jamie', delta: 5 }],
        sets: ['family-ledger-separate', 'family-ledger-planned'],
      },
    ],
  },
  {
    id: 'family-ledger-check',
    title: { zhCN: '被茶杯盖住的字', en: 'The words beneath the mug' },
    text: {
      zhCN: '你们照约定核对记录，一笔「厨房」被杯底盖住了。杰米挪开杯子，你才发现那是上回商量烧水的备忘。',
      en: 'You compare your notes as agreed. A mug covers an entry marked “kitchen”. Jamie moves it, revealing the reminder about your earlier kettle discussion.',
    },
    channel: 'letter',
    weight: 3,
    once: true,
    requires: ['family-ledger-planned'],
    choices: [
      {
        id: 'rewrite',
        label: {
          zhCN: '你重抄这一行，杰米核对余下几项',
          en: 'Rewrite the line while Jamie checks the other entries',
        },
        effects: [{ type: 'friendship', npc: 'jamie', delta: 5 }],
        sets: ['family-ledger-checked'],
      },
      {
        id: 'read',
        label: {
          zhCN: '你逐项念，杰米挪开杯子补字',
          en: 'Read each entry while Jamie moves the mug and fills the gaps',
        },
        effects: [{ type: 'friendship', npc: 'jamie', delta: 5 }],
        sets: ['family-ledger-checked'],
      },
    ],
  },
  {
    id: 'family-ledger-shared-return',
    title: {
      zhCN: '共用栏旁的菜谱',
      en: 'The recipe beside the shared column',
    },
    text: {
      zhCN: '你们补记过共用栏，杰米又在旁边写晚饭材料：「咱们先看冰箱！哎，昨天的土豆还在。」你翻到空白处。',
      en: 'You have updated the shared column. Jamie adds dinner ingredients beside it. “Let’s check the fridge first! Oh, yesterday’s potatoes are still there.” You find a blank space.',
    },
    channel: 'letter',
    weight: 3,
    once: true,
    requires: ['family-ledger-shared', 'family-ledger-checked'],
    forbids: ['family-ledger-returned'],
    choices: [
      {
        id: 'list',
        label: {
          zhCN: '你先查冰箱，两人慢慢写采购单',
          en: 'Check the fridge and take time to write the shopping list together',
        },
        effects: [{ type: 'none' }],
        sets: ['family-ledger-returned'],
      },
      {
        id: 'cook',
        label: {
          zhCN: '你先整理现有材料，把采购单留待饭后',
          en: 'Sort the ingredients you have and leave the list until after dinner',
        },
        effects: [{ type: 'none' }],
        sets: ['family-ledger-returned'],
      },
    ],
  },
  {
    id: 'family-ledger-separate-return',
    title: {
      zhCN: '两张记录合起来',
      en: 'Putting two sets of notes together',
    },
    text: {
      zhCN: '你们又按约拿出各自记录，杰米把自己的夹在菜谱前：「咱们先看你的，我那张有个油印，得认一会儿。」',
      en: 'You bring out your separate notes again as agreed. Jamie clips his before the recipe. “Let’s start with yours. Mine has a grease mark; it’ll take a moment to read.”',
    },
    channel: 'letter',
    weight: 3,
    once: true,
    requires: ['family-ledger-separate', 'family-ledger-checked'],
    forbids: ['family-ledger-returned'],
    choices: [
      {
        id: 'together',
        label: {
          zhCN: '你留出时间，一起认清油印下的字',
          en: 'Set aside time to read beneath the grease mark together',
        },
        effects: [{ type: 'none' }],
        sets: ['family-ledger-returned'],
      },
      {
        id: 'copy',
        label: {
          zhCN: '你先核自己那份，等杰米重抄好再合',
          en: 'Check your own notes first and compare after Jamie copies his',
        },
        effects: [{ type: 'none' }],
        sets: ['family-ledger-returned'],
      },
    ],
  },
];

// SRC-043 "Who needs an ETA" and its linked nationality checker. The
// passport belongs to the visitor, not the player. All are checking requirements,
// including any existing permission; no choice promises an application outcome.
// SRC-041 physical p1 questions 2–3 and p4 questions 8–10 inspire the household
// pressures below, not exemptions. Annual incomes are fictional scenario facts,
// not legal thresholds; income effects preserve contract salary and relationships.
export const characterLifeEvents: GameEvent[] = [
  {
    id: 'family-visit-plans',
    when: [{ yearMin: 4 }],
    title: { zhCN: '妹妹圈出的假期', en: 'The holiday your sister circles' },
    text: {
      zhCN: '妹妹拿巴西护照准备来访，给你发了假期表。你们先按国籍核对 ETA 要求和已有许可，机票还没订。',
      en: 'Your sister plans to visit with her Brazilian passport and sends her holiday rota. You check ETA requirements and any existing permission together; flights are not booked yet.',
    },
    weight: 1,
    once: true,
    channel: 'phone',
    choices: [
      {
        id: 'check',
        label: {
          zhCN: '你陪她按护照与来访目的查官方要求',
          en: 'Help check official requirements for her passport and purpose',
        },
        effects: [{ type: 'none' }],
        sets: ['life-visit-planned'],
      },
      {
        id: 'call',
        label: {
          zhCN: '你约她下班后通话核对证件',
          en: 'Arrange a call after her shift to check documents',
        },
        effects: [{ type: 'none' }],
        sets: ['life-visit-planned'],
      },
    ],
  },
  {
    id: 'family-crossed-shifts',
    when: [{ yearMin: 4 }],
    title: { zhCN: '错开的晚饭', en: 'Dinner on different shifts' },
    text: {
      zhCN: '杰米的新班表与你撞了车，冰箱上贴了两张晚饭时间。你们摊开工资单，商量换班还是暂时少接一些班。',
      en: 'Jamie’s new rota clashes with yours; two dinner times hang on the fridge. You spread out the payslips and discuss swapping shifts or temporarily taking fewer.',
    },
    weight: 1,
    once: true,
    channel: 'npc:jamie',
    forbids: [
      'family-job-worry',
      'family-jamie-unemployed',
      'family-pip-applied',
    ],
    choices: [
      {
        id: 'swap',
        label: {
          zhCN: '你们找同事换班，把晚饭挪到一起',
          en: 'Arrange shift swaps and eat dinner together',
        },
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
      {
        id: 'reduce',
        label: {
          zhCN: '你们同意杰米少接班，重记他的收入',
          en: 'Agree that Jamie takes fewer shifts and update his earnings',
        },
        effects: [
          { type: 'income', taxYear: 'current', partnerEarnings: 18000 },
          { type: 'stat', key: 'health', delta: 4 },
        ],
        note: {
          zhCN: '记录本情节伴侣税年收入 £18,000；保留英国公民伴侣关系，不改变许可或承诺豁免。',
          en: 'Records fictional partner tax-year earnings of £18,000. Keeps the British-citizen partnership; changes no permission and promises no exemption.',
        },
      },
    ],
  },
];

policyStories.push({
  // SRC-001 CP 1707, physical p18, "British connections": eligible
  // partners of British citizens retain a distinct proposed pathway, subject
  // to route and mandatory requirements. Publication 2026-11-02;
  // the delivery end is editorial. No automatic qualification is implied.
  published: '2026-11-02',
  until: '2027-08-02',
  character: 'family-partner',
  event: {
    id: 'budget-family-calendar',
    title: { zhCN: '日历上的两栏', en: 'Two columns on the calendar' },
    text: {
      zhCN: '杰米把预算剪报递给你。你们另翻定居回应中英国公民伴侣的段落：他的护照和你待核的申请材料，仍是两栏。',
      en: 'Jamie hands you the Budget cutting. You separately find the settlement response on partners of British citizens: his passport and your application papers still occupy different columns.',
    },
    weight: 0,
    once: true,
    channel: 'letter',
    requires: ['budget-news-read'],
    choices: [
      {
        id: 'sort',
        label: {
          zhCN: '你们按自己的家庭路线整理材料',
          en: 'Sort the papers for your own family route together',
        },
        effects: [{ type: 'none' }],
      },
      {
        id: 'ask',
        label: {
          zhCN: '你记下还要核对的条件',
          en: 'Write down the requirements you still need to check',
        },
        effects: [{ type: 'none' }],
      },
    ],
  },
});
