import { currentLaw2026_11 } from '@uk-immigration/policy-data';
import { policyStories } from '../events/policy';
import type { GameEvent } from '../types';

const oldSalaryApplicationsBefore =
  currentLaw2026_11.values.skilledWorkerPre2024ApplicationsBefore.value;
const oldSalaryDeadline = new Date(oldSalaryApplicationsBefore);
const deadlineInChinese = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'long',
  timeZone: 'UTC',
}).format(oldSalaryDeadline);
const deadlineInEnglish = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'long',
  timeZone: 'UTC',
}).format(oldSalaryDeadline);

// Fictional scenes inspired by the research library L11, L15 and L02.
// Existing invitation, school-letter and kettle cards open these follow-ups.
export const lifeChains: GameEvent[] = [
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
];

// SRC-043 "Who needs an ETA" and its linked nationality checker. The
// passport belongs to the visitor, not the player. All are checking requirements,
// including any existing permission; no choice promises an application outcome.
// SRC-041 physical p1 questions 2–3 and p4 questions 8–10 inspire the household
// pressures below, not exemptions. Annual incomes are fictional scenario facts,
// not legal thresholds; income effects preserve contract salary and relationships.
export const characterLifeEvents: GameEvent[] = [
  {
    id: 'sw-visit-plans',
    when: [{ yearMin: 3 }],
    title: { zhCN: '妈妈发来的护照页', en: 'Mum sends a passport page' },
    text: {
      zhCN: '妈妈想来住几天，发来中国护照页。你陪她核对访客签证要求和材料，客床上的纸箱暂时还没动。',
      en: 'Mum wants to visit and sends her Chinese passport page. You help check visitor visa requirements and documents. The boxes are still on the guest bed.',
    },
    weight: 1,
    once: true,
    channel: 'phone',
    choices: [
      {
        id: 'check',
        label: {
          zhCN: '你按她的国籍与来访目的查官方指引',
          en: 'Check official guidance for her nationality and purpose',
        },
        effects: [{ type: 'none' }],
        sets: ['life-visit-planned'],
      },
      {
        id: 'call',
        label: {
          zhCN: '你约好通话，一起核对现有证件',
          en: 'Arrange a call to check her existing documents together',
        },
        effects: [{ type: 'none' }],
        sets: ['life-visit-planned'],
      },
    ],
  },
];

policyStories.push(
  {
    // SRC-033, Q40064, answered 2026-11-04, Answer ¶2–6 and ¶10:
    // announced salary measures; further details will follow, no new amount.
    // Delivery starts on the answer date. The longer editorial window lets a
    // quarterly player read the news before drawing this follow-up.
    published: '2026-11-04',
    until: '2027-08-04',
    character: 'skilled-worker',
    event: {
      id: 'budget-hr-papers',
      title: { zhCN: 'HR 的附件', en: 'An attachment from HR' },
      text: {
        zhCN: '读过预算新闻，HR 又来信请你核对岗位与工资材料。议会答复仍说细节待公布，你先把旧工资单从抽屉里找出来。',
        en: 'After the Budget news, HR asks you to check your job and pay records. The parliamentary answer still says details will follow. You find the old payslips in a drawer.',
      },
      weight: 0,
      once: true,
      channel: 'letter',
      requires: ['budget-news-read'],
      choices: [
        {
          id: 'check',
          label: {
            zhCN: '你逐项核对岗位说明与工资单',
            en: 'Compare the job description with your payslips',
          },
          effects: [{ type: 'none' }],
        },
        {
          id: 'ask',
          label: {
            zhCN: '你回信问清材料清单',
            en: 'Reply to clarify the document checklist',
          },
          effects: [{ type: 'none' }],
        },
      ],
    },
  },
  {
    // SRC-004 SW 4.2(b)(ii) sets the exclusive cutoff.
    // SW 24.3 row C refers back to SW 4.2(b). The story's start is editorial.
    published: '2029-10-04',
    until: oldSalaryApplicationsBefore,
    character: 'skilled-worker',
    event: {
      id: 'sw-settlement-window-letter',
      title: { zhCN: '文件夹里的最后一页', en: 'The last page in the folder' },
      text: {
        zhCN: `信里提醒你，按旧薪资档申请须在${deadlineInChinese}前递交。你把信夹在最上面，市政厅能看定居还差什么。`,
        en: `A letter reminds you to apply before ${deadlineInEnglish} to use the old salary rates. You put it on top of the folder. The town hall shows what you still need to qualify for settlement.`,
      },
      weight: 0,
      once: true,
      channel: 'letter',
      choices: [
        {
          id: 'check',
          label: {
            zhCN: '圈好日期，去市政厅看评估',
            en: 'Circle the date and check the town hall assessment',
          },
          effects: [{ type: 'none' }],
        },
        {
          id: 'file',
          label: {
            zhCN: '先把材料按清单排好',
            en: 'Put the papers in checklist order first',
          },
          effects: [{ type: 'none' }],
        },
      ],
    },
  },
);
