import { policyStories } from '../events/policy';
import type { GameEvent } from '../types';

// Fictional scenes inspired by the research library L11, L15 and L02.
// Existing invitation, school-letter and kettle cards open these follow-ups.
export const lifeChains: GameEvent[] = [
  {
    id: 'bno-uniform-table',
    title: { zhCN: '交换桌的空位', en: 'A place at the uniform table' },
    text: {
      zhCN: '你读过家长会通知，校服交换桌又发来邀请。文舒说：「讲好先，旧外套归我洗，你挑个能帮忙的时段。」',
      en: 'After reading the parents’ evening letter, you get an invitation from the uniform exchange. Man Shu says, “Let’s agree first: I’ll wash the old coat; you find a time you can help.”',
    },
    channel: 'letter',
    weight: 3,
    once: true,
    requires: ['bno-uniform-invited'],
    choices: [
      {
        id: 'sort',
        label: {
          zhCN: '你早到一会儿，帮家长按尺寸整理',
          en: 'Arrive early to help parents sort by size',
        },
        effects: [{ type: 'friendship', npc: 'ka-ning-child', delta: 5 }],
        sets: ['bno-uniform-sort', 'bno-uniform-helped'],
      },
      {
        id: 'labels',
        label: {
          zhCN: '你留在家里，替交换桌写好尺寸签',
          en: 'Stay home and write size labels for the table',
        },
        effects: [{ type: 'friendship', npc: 'ka-ning-child', delta: 5 }],
        sets: ['bno-uniform-labels', 'bno-uniform-helped'],
      },
    ],
  },
  {
    id: 'bno-parent-network',
    title: { zhCN: '书包里的联络单', en: 'Contacts in the school bag' },
    text: {
      zhCN: '你帮过交换桌，家长捎来联络单。乐言问：「写进书包，是不是算我的联系人？」你们先商量怎么留名字。',
      en: 'After your help with the table, a parent sends a contact sheet. Lok Yin asks, “If it goes in my bag, are they my contacts?” You discuss how to leave your name.',
    },
    channel: 'letter',
    weight: 3,
    once: true,
    requires: ['bno-uniform-helped'],
    choices: [
      {
        id: 'group',
        label: {
          zhCN: '你花点时间加入家长群，约好只转发交换消息',
          en: 'Take time to join the parent chat for exchange messages',
        },
        effects: [{ type: 'friendship', npc: 'ka-ning-child', delta: 5 }],
        sets: ['bno-parent-contact'],
      },
      {
        id: 'single',
        label: {
          zhCN: '你约一位家长单独联络，消息慢一点也行',
          en: 'Arrange contact with one parent, even if news travels slower',
        },
        effects: [{ type: 'friendship', npc: 'ka-ning-child', delta: 5 }],
        sets: ['bno-parent-contact'],
      },
    ],
  },
  {
    id: 'bno-uniform-sort-return',
    title: { zhCN: '又一袋旧外套', en: 'Another bag of old coats' },
    text: {
      zhCN: '你留过联系方式，新家长带来一袋外套，想请你教他们上回按尺寸整理的办法。乐言先把桌边腾空了。',
      en: 'Through the contact you left, a new parent brings coats and asks you to show how you sorted by size last time. Lok Yin clears the edge of the table.',
    },
    channel: 'letter',
    weight: 3,
    once: true,
    requires: ['bno-uniform-sort', 'bno-parent-contact'],
    forbids: ['bno-uniform-returned'],
    choices: [
      {
        id: 'show',
        label: {
          zhCN: '你留一会儿，示范怎样分尺寸',
          en: 'Stay a while to show how to sort the sizes',
        },
        effects: [{ type: 'none' }],
        sets: ['bno-uniform-returned'],
      },
      {
        id: 'send',
        label: {
          zhCN: '你回家写清步骤，约好再送过来',
          en: 'Write the steps at home and arrange to bring them over',
        },
        effects: [{ type: 'none' }],
        sets: ['bno-uniform-returned'],
      },
    ],
  },
  {
    id: 'bno-uniform-labels-return',
    title: { zhCN: '尺寸签又用上了', en: 'The size labels return' },
    text: {
      zhCN: '你留过联系方式，新家长问尺寸签能否再借。乐言认出你上回写歪的那张，把它转正后放回袋里。',
      en: 'Through the contact you left, a new parent asks to borrow the size labels again. Lok Yin recognises your crooked label from last time, straightens it and puts it in the bag.',
    },
    channel: 'letter',
    weight: 3,
    once: true,
    requires: ['bno-uniform-labels', 'bno-parent-contact'],
    forbids: ['bno-uniform-returned'],
    choices: [
      {
        id: 'reuse',
        label: {
          zhCN: '你先擦净旧签，再让孩子带过去',
          en: 'Clean the old labels for the child to take along',
        },
        effects: [{ type: 'none' }],
        sets: ['bno-uniform-returned'],
      },
      {
        id: 'copy',
        label: {
          zhCN: '你腾出一点时间，给新家长抄一套',
          en: 'Make time to copy a set for the new parent',
        },
        effects: [{ type: 'none' }],
        sets: ['bno-uniform-returned'],
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
    id: 'bno-visit-plans',
    when: [{ yearMin: 4 }],
    title: { zhCN: '表姐的行前清单', en: 'Your cousin’s travel list' },
    text: {
      zhCN: '表姐拿着香港特区护照想来探亲。你陪她按国籍核对 ETA 要求与已有许可，再看看家里哪里能放行李。',
      en: 'Your cousin plans a visit with her Hong Kong SAR passport. You help check ETA requirements and any existing permission, then look for suitcase space at home.',
    },
    weight: 1,
    once: true,
    channel: 'phone',
    choices: [
      {
        id: 'check',
        label: {
          zhCN: '你们按她的护照与来访目的查要求',
          en: 'Check requirements for her passport and purpose together',
        },
        effects: [{ type: 'none' }],
        sets: ['life-visit-planned'],
      },
      {
        id: 'list',
        label: {
          zhCN: '你把未核对的证件问题单列出来',
          en: 'List the document questions still to check',
        },
        effects: [{ type: 'none' }],
        sets: ['life-visit-planned'],
      },
    ],
  },
  {
    id: 'bno-sick-pay-folder',
    when: [{ yearMin: 4 }],
    title: { zhCN: '病假工资的信封', en: 'The sick-pay envelope' },
    text: {
      zhCN: '你病后少接了班，病假工资单夹在药袋旁。伴侣带孩子吃饭，你终于有空核对这一税年的收入记录。',
      en: 'After illness you take fewer shifts; the sick-pay slip lies beside the medicine bag. Your partner takes the child to eat while you check this tax year’s earnings.',
    },
    weight: 1,
    once: true,
    channel: 'letter',
    choices: [
      {
        id: 'file',
        label: {
          zhCN: '你把病假工资与其他工资一起核对',
          en: 'Check the sick pay alongside your other earnings',
        },
        effects: [
          { type: 'income', taxYear: 'current', earnings: 26000 },
          { type: 'stat', key: 'health', delta: 4 },
        ],
        note: {
          zhCN: '记录本情节税年收入 £26,000；不新增 public funds 记录，不替伴侣或孩子评估。',
          en: 'Records fictional tax-year earnings of £26,000; adds no public funds episode and does not assess your partner or child.',
        },
      },
      {
        id: 'ask',
        label: {
          zhCN: '你请工资部门核对后再归档',
          en: 'Ask payroll to check before filing it',
        },
        effects: [
          { type: 'income', taxYear: 'current', earnings: 26000 },
          { type: 'stat', key: 'health', delta: 4 },
        ],
        note: {
          zhCN: '记录本情节税年收入 £26,000；不新增 public funds 记录，不替伴侣或孩子评估。',
          en: 'Records fictional tax-year earnings of £26,000; adds no public funds episode and does not assess your partner or child.',
        },
      },
    ],
  },
];

policyStories.push({
  // SRC-001 CP 1707, physical p25–26, "Which routes are outside of the
  // Earned Settlement framework" / "Existing Government commitments".
  // Publication 2026-11-02; the follow-up delivery window is editorial.
  published: '2026-11-02',
  until: '2027-08-02',
  character: 'hong-kong-bno',
  event: {
    id: 'budget-bno-neighbour',
    title: { zhCN: '校门口的追问', en: 'A question at the school gate' },
    text: {
      zhCN: '邻居把预算新闻和定居标题混在一起问你。你翻出回应中 BN(O) 在框架外的段落，孩子正拉着你的衣角。',
      en: 'A neighbour mixes the Budget news with settlement headlines. You find the response saying BN(O) is outside the framework, while your child tugs your sleeve.',
    },
    weight: 0,
    once: true,
    channel: 'morning',
    requires: ['budget-news-read'],
    choices: [
      {
        id: 'show',
        label: {
          zhCN: '你给邻居看原文，再接孩子回家',
          en: 'Show the passage, then take your child home',
        },
        effects: [{ type: 'none' }],
      },
      {
        id: 'save',
        label: {
          zhCN: '你存下原文，晚饭后和伴侣核对',
          en: 'Save it to check with your partner after dinner',
        },
        effects: [{ type: 'none' }],
      },
    ],
  },
});
