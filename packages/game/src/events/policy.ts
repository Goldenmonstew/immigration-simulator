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
            en: 'Note the title to read at home',
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
  },
  {
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
  },
  {
    // SRC-004 SW 4.2(b)(ii): "date of application is before 4 April 2030";
    // SW 24.3 row C refers back to SW 4.2(b). The reminder starts two game
    // quarters before that deadline; this lead time is an editorial choice.
    published: '2029-10-04',
    until: '2030-04-04',
    character: 'skilled-worker',
    event: {
      id: 'sw-settlement-window-letter',
      title: { zhCN: '文件夹里的最后一页', en: 'The last page in the folder' },
      text: {
        zhCN: '信里提醒：老规则下的申请窗口将到期，须在2030年4月4日前提交。你把信夹在最上面，市政厅能看定居还差什么。',
        en: 'A letter reminds you that the old-rules application window is closing: submit before 4 April 2030. You put it on top of the folder. The town hall shows what settlement still needs.',
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
];
