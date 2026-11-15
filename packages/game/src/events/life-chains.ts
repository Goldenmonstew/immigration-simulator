import type { GameEvent } from '../types';

// Fictional scenes inspired by the research library L11, L15 and L02.
// Existing invitation, school-letter and kettle cards open these follow-ups.
export const lifeChains: Record<string, GameEvent[]> = {
  'skilled-worker': [
    {
      id: 'sw-lunch-seat',
      title: { zhCN: '午餐群里的新人', en: 'A newcomer in the lunch chat' },
      text: {
        zhCN: '你处理过岗位邀请，阿德又拉来团队新人吃午饭（他也刚认全名字）。你们先商量怎么腾出座位。',
        en: 'You have dealt with the job invitation. Ade invites the team’s new colleague to lunch (he has only just learnt their name too). You work out where everyone can sit.',
      },
      channel: 'letter',
      weight: 3,
      once: true,
      requires: ['sw-lunch-invited'],
      choices: [
        {
          id: 'kitchen',
          label: {
            zhCN: '你去厨房挪椅子，约好各带饭盒',
            en: 'Move kitchen chairs and agree to bring packed lunches',
          },
          effects: [{ type: 'friendship', npc: 'ade', delta: 5 }],
          sets: ['sw-lunch-kitchen', 'sw-lunch-seat-ready'],
        },
        {
          id: 'bench',
          label: {
            zhCN: '你绕去找空长椅，约好各带饭盒',
            en: 'Look for a free bench and agree to bring packed lunches',
          },
          effects: [{ type: 'friendship', npc: 'ade', delta: 5 }],
          sets: ['sw-lunch-bench', 'sw-lunch-seat-ready'],
        },
      ],
    },
    {
      id: 'sw-lunch-boxes',
      title: { zhCN: '饭盒开盖', en: 'Lunch-box lids' },
      text: {
        zhCN: '你们按约带来饭盒。新人取水时找不到厨房，阿德在群里补了路线（这次先自己走过）。你回消息接应。',
        en: 'You all bring lunch as agreed. Looking for water, the newcomer cannot find the kitchen. Ade posts directions (after walking them himself this time). You reply to help.',
      },
      channel: 'letter',
      weight: 3,
      once: true,
      requires: ['sw-lunch-seat-ready'],
      choices: [
        {
          id: 'meet',
          label: {
            zhCN: '你提前到门口接人，再一起吃饭',
            en: 'Meet at the door early, then eat together',
          },
          effects: [{ type: 'friendship', npc: 'ade', delta: 5 }],
          sets: ['sw-lunch-shared'],
        },
        {
          id: 'map',
          label: {
            zhCN: '你先画清拐角，让新人自己走来',
            en: 'Draw the turn clearly so the newcomer can find the way',
          },
          effects: [{ type: 'friendship', npc: 'ade', delta: 5 }],
          sets: ['sw-lunch-shared'],
        },
      ],
    },
    {
      id: 'sw-lunch-kitchen-return',
      title: { zhCN: '留下的空椅', en: 'The spare kitchen chair' },
      text: {
        zhCN: '你上回挪出的厨房座位又空着。新人已经会找门，在群里问谁来吃饭；阿德先发了一张空饭盒的照片。',
        en: 'The kitchen seat you cleared last time is free again. The newcomer now knows the door and asks who is coming. Ade replies with a photo of an empty lunch box.',
      },
      channel: 'letter',
      weight: 3,
      once: true,
      requires: ['sw-lunch-kitchen', 'sw-lunch-shared'],
      forbids: ['sw-lunch-returned'],
      choices: [
        {
          id: 'join',
          label: {
            zhCN: '你整理手头的活，留出这次午休',
            en: 'Arrange your work to keep this lunch break free',
          },
          effects: [{ type: 'none' }],
          sets: ['sw-lunch-returned'],
        },
        {
          id: 'later',
          label: {
            zhCN: '你先回复今天忙，另约一次带饭',
            en: 'Reply that today is busy and arrange another packed lunch',
          },
          effects: [{ type: 'none' }],
          sets: ['sw-lunch-returned'],
        },
      ],
    },
    {
      id: 'sw-lunch-bench-return',
      title: { zhCN: '长椅上的位置', en: 'Room on the bench' },
      text: {
        zhCN: '你上回找的长椅被新人记住了，对方问下次还去不去。阿德回消息说先看天气（外套上回忘带了）。',
        en: 'The newcomer remembers the bench you found and asks about going back. Ade suggests checking the weather first (he forgot his coat last time).',
      },
      channel: 'letter',
      weight: 3,
      once: true,
      requires: ['sw-lunch-bench', 'sw-lunch-shared'],
      forbids: ['sw-lunch-returned'],
      choices: [
        {
          id: 'join',
          label: {
            zhCN: '你先查天气，留出下次午休',
            en: 'Check the forecast and keep the next lunch break free',
          },
          effects: [{ type: 'none' }],
          sets: ['sw-lunch-returned'],
        },
        {
          id: 'inside',
          label: {
            zhCN: '你去问厨房能否作为下雨的备选',
            en: 'Ask about using the kitchen if it rains',
          },
          effects: [{ type: 'none' }],
          sets: ['sw-lunch-returned'],
        },
      ],
    },
  ],
  'hong-kong-bno': [
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
  ],
  'family-partner': [
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
  ],
};
