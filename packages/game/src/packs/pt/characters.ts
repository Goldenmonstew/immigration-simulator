import type {
  CountryResult,
  PtResidenceEvidence,
} from '@uk-immigration/engine';
import { portugal2026_11 } from '@uk-immigration/policy-data';
import type { Character, CharacterProfile, GameEvent, Text } from '../../model';
import type { PtEffect, PtFestival, PtTimeline } from './rules';

type PtCharacter = Character<PtTimeline, PtEffect, CountryResult, PtFestival>;
type PtEvent = GameEvent<PtEffect, PtFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });
/** Years of temporary residence before permanent residence (SRC-123 art. 80(1)(a)). */
const permanentYears = portugal2026_11.values.permanentYears.value;

// Fictional individual facts below (dates, income, household), not policy
// thresholds. Official reviews start clear; the criminal record certificate
// and the declaration papers are gathered in play.
const residence = (
  means: NonNullable<PtResidenceEvidence['means']>,
  language: PtResidenceEvidence['language'],
): PtResidenceEvidence => ({
  means,
  accommodation: 'documented',
  healthCoverage: 'sns-proof',
  language,
  tax: 'compliant',
  socialSecurity: 'compliant',
  travelDocumentValid: true,
  criminalRecordAvailable: false,
  statusCancellation: 'clear',
  criminalSentence: {
    scope: 'complete',
    totalYears: 0,
    permanentWindowVerified: true,
    convictions: [],
  },
  generalRefusal: { review: 'clear', sisAlert: false, ucfeExclusion: false },
  fees: { column: 'left', exemption: 'none', paid: false },
});

export const workerProfile: CharacterProfile = {
  id: 'worker',
  name: t('沈知夏', 'Zhixia Shen'),
  intro: t(
    '知夏来自杭州，2021 年秋天持学习居留来里斯本读设计硕士。毕业后她在旧瓷砖厂改成的共享办公楼做界面设计，持工作类临时居留许可，居留卡到 2028-08-31。人物与事件均为虚构。',
    'Zhixia from Hangzhou came to Lisbon in autumn 2021 on a study permit for a design master’s. She now designs apps at a coworking hub in an old tile works, on a work-based temporary residence permit; her card runs to 2028-08-31. All characters and events are fictional.',
  ),
  sprite: 'urban/yao-flatmate.png',
};
export const partnerProfile: CharacterProfile = {
  id: 'partner',
  name: t('塞莱斯特·蒙泰罗', 'Celeste Monteiro'),
  intro: t(
    '塞莱斯特来自佛得角的明德卢，2023 年秋天持工作类临时居留许可来到里斯本，在旧瓷砖厂的食堂掌勺。2024 年她和电车司机米格尔·索萨结婚，儿子托马斯 2025 年出生，是葡萄牙人。居留卡到 2028-10-15。只评估塞莱斯特本人，人物与事件均为虚构。',
    'Celeste from Mindelo, Cape Verde, came to Lisbon in autumn 2023 on a work-based temporary residence permit and runs the Tile Works canteen. In 2024 she married tram driver Miguel Sousa; their son Tomás, born in 2025, is Portuguese. Her card runs to 2028-10-15. Only Celeste is assessed; all characters and events are fictional.',
  ),
  sprite: 'urban/family-partner.png',
};

const opening = (
  id: string,
  text: Text,
  choices: PtEvent['choices'],
): PtEvent => ({
  id: `opening-${id}`,
  channel: 'morning',
  title: t('燕子街区的早晨', 'Morning in Andorinhas'),
  text,
  weight: 0,
  once: true,
  choices,
});

const workerEvents: PtEvent[] = [
  {
    id: 'zx-five-years',
    channel: 'npc:thiago',
    speaker: 'thiago',
    title: t(`满 ${permanentYears} 年那天`, `The ${permanentYears}-year mark`),
    text: t(
      `蒂亚戈一边给你的自行车打气一边说：「学习居留也算临时居留，你已经持满 ${permanentYears} 年了。可以去 AIMA 递永久居留，先把葡语证书和无犯罪记录证明准备好。」`,
      `Pumping up your bike tyre, Thiago says: “Study permits count as temporary residence too, and you’ve held it for ${permanentYears} years now. You can file for permanent residence at AIMA. Get the Portuguese certificate and the criminal record certificate ready first.”`,
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'list',
        label: t('在手机备忘录里列清单', 'Make a checklist on your phone'),
        effects: [
          { type: 'stat', key: 'mood', delta: 3 },
          { type: 'friendship', npc: 'thiago', delta: 25 },
        ],
      },
    ],
  },
  {
    id: 'zx-salary-review',
    channel: 'letter',
    title: t('年度面谈', 'Annual review'),
    text: t(
      '创始人在邮件里说，你重画的订餐流程让客户的退单少了一半。最后一行：下个月起调薪。',
      'The founder writes that your redesigned ordering flow halved the clients’ cancellations. The last line: a raise from next month.',
    ),
    weight: 3,
    once: true,
    when: [{ yearMin: 2 }, { stat: 'career', min: 40 }],
    choices: [
      {
        id: 'thanks',
        label: t(
          '回信道谢，晚上去小酒馆庆祝',
          'Reply with thanks and celebrate at the tasca',
        ),
        effects: [
          { type: 'salary', monthlyEur: 2_050 },
          { type: 'money', delta: -25 },
          { type: 'stat', key: 'mood', delta: 6 },
        ],
        note: t(
          '虚构的薪资变化，会记入永久居留评估里的可计月净收入。',
          'A fictional pay change, recorded as countable monthly net income in the permanent residence assessment.',
        ),
      },
    ],
  },
  {
    id: 'zx-prato-do-dia',
    channel: 'phone',
    title: t('今日套餐', 'Prato do dia'),
    text: t(
      '同事若昂打来电话：「街角小酒馆今天的套餐是烤鸡配米饭，一起去？只准说葡语。」',
      'Colleague João calls: “The tasca on the corner has grilled chicken and rice today. Coming? Portuguese only.”',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'go',
        label: t('去，顺便练葡语', 'Go, and practise Portuguese'),
        effects: [
          { type: 'money', delta: -9 },
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'stat', key: 'portuguese', delta: 1 },
        ],
      },
      {
        id: 'desk',
        label: t('在工位吃饭团', 'Eat a rice ball at your desk'),
        effects: [{ type: 'stat', key: 'career', delta: 1 }],
      },
    ],
  },
  {
    id: 'zx-mum-call',
    channel: 'phone',
    title: t('视频电话', 'A video call'),
    text: t(
      '妈妈在镜头那头问：「你们那儿的电车真的是黄色的？」窗外正好有一辆叮叮当当爬上坡。',
      'On the screen, Mum asks: “Are the trams there really yellow?” Right on cue, one clangs up the hill outside.',
    ),
    weight: 2,
    choices: [
      {
        id: 'show',
        label: t('举着手机追着电车拍', 'Chase the tram with the camera'),
        effects: [{ type: 'stat', key: 'mood', delta: 6 }],
      },
      {
        id: 'short',
        label: t(
          '聊十分钟，约好周末再打',
          'Chat ten minutes, call again at the weekend',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 3 }],
      },
    ],
  },
  {
    id: 'zx-ciple-group',
    channel: 'place:college',
    title: t('备考小组', 'A study group'),
    text: t(
      '下课后，苏妮塔拉你加入 CIPLE 备考小组：「周六在图书馆，互相念听力稿。」伊内斯老师在白板上写下 juntos（一起）。',
      'After class, Sunita asks you to join her CIPLE study group: “Saturdays at the library, reading listening scripts to each other.” Inês writes juntos (together) on the board.',
    ),
    weight: 3,
    once: true,
    when: [{ stat: 'portuguese', max: 59 }],
    choices: [
      {
        id: 'join',
        label: t('加入小组', 'Join the group'),
        effects: [
          { type: 'stat', key: 'portuguese', delta: 3 },
          { type: 'friendship', npc: 'sunita', delta: 20 },
        ],
      },
      {
        id: 'solo',
        label: t('先自己背动词变位', 'Drill verb endings alone'),
        effects: [{ type: 'stat', key: 'portuguese', delta: 1 }],
      },
    ],
  },
  {
    id: 'zx-azulejo-brief',
    channel: 'place:work',
    title: t('瓷砖图案库', 'A tile pattern library'),
    text: t(
      '新客户是街区的瓷砖修复工坊，想把一百多种老花样做成网站。样板上的钴蓝色一摸还有点凉。',
      'A new client: the bairro’s tile restoration workshop wants its hundred-odd old patterns online. The cobalt-blue samples are cool to the touch.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'take',
        label: t(
          '接下项目，周末去工坊拍照',
          'Take it on and photograph the workshop',
        ),
        effects: [
          { type: 'stat', key: 'career', delta: 4 },
          { type: 'stat', key: 'mood', delta: 3 },
        ],
      },
    ],
  },
];

const partnerEvents: PtEvent[] = [
  {
    id: 'cl-tomas-fever',
    channel: 'morning',
    title: t('托马斯发烧了', 'Tomás has a fever'),
    text: t(
      '托马斯半夜开始发烧，脸红扑扑的。米格尔今天是早班电车，五点就出门了。',
      'Tomás started a fever in the night, cheeks flushed. Miguel has the early tram shift and left at five.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'clinic',
        label: t('抱去卫生中心', 'Carry him to the health centre'),
        effects: [
          { type: 'stat', key: 'health', delta: -2 },
          { type: 'stat', key: 'mood', delta: 3 },
        ],
      },
      {
        id: 'fatima',
        label: t(
          '请法蒂玛奶奶来帮忙看一会儿',
          'Ask Dona Fátima to sit with him',
        ),
        effects: [
          { type: 'friendship', npc: 'fatima', delta: 25 },
          { type: 'stat', key: 'mood', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'cl-mindelo-call',
    channel: 'phone',
    title: t('明德卢来的电话', 'A call from Mindelo'),
    text: t(
      '妹妹在视频里转了一圈：海边、鼓声、彩色的狂欢节羽毛。「下次你带托马斯回来，让他听听莫尔纳。」',
      'Your sister spins the camera: the bay, drums, bright carnival feathers. “Next time bring Tomás home and let him hear morna.”',
    ),
    weight: 2,
    choices: [
      {
        id: 'sing',
        label: t('跟着鼓声哼几句莫尔纳', 'Hum a few bars of a morna'),
        effects: [{ type: 'stat', key: 'mood', delta: 6 }],
      },
      {
        id: 'quiet',
        label: t('挂了电话，去河边走走', 'Hang up and walk by the river'),
        effects: [
          { type: 'stat', key: 'mood', delta: 2 },
          { type: 'stat', key: 'health', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'cl-cachupa',
    channel: 'place:home',
    title: t('周日的卡舒帕', 'Sunday cachupa'),
    text: t(
      '米格尔的爸妈要来吃午饭。玉米和豆子已经泡了一夜，锅够大，香味能飘到楼下。',
      'Miguel’s parents are coming for lunch. The maize and beans soaked overnight; the pot is big enough to scent the whole stairwell.',
    ),
    weight: 3,
    once: true,
    when: [{ dayKind: 'weekend' }],
    choices: [
      {
        id: 'cook',
        label: t('炖一大锅，多盛一碗给邻居', 'Cook a big pot and share a bowl'),
        effects: [
          { type: 'money', delta: -18 },
          { type: 'stat', key: 'mood', delta: 6 },
          { type: 'friendship', npc: 'fatima', delta: 15 },
        ],
      },
    ],
  },
  {
    id: 'cl-late-tram',
    channel: 'place:home',
    title: t('末班电车回来的人', 'Back from the last tram'),
    text: t(
      '米格尔开完末班电车回家，帽子还没摘，先去看了看睡着的托马斯。',
      'Miguel comes home from the last tram and, cap still on, looks in on the sleeping Tomás first.',
    ),
    weight: 2,
    when: [{ minuteMin: 1140 }],
    choices: [
      {
        id: 'soup',
        label: t('给他热一碗汤', 'Warm him some soup'),
        effects: [
          { type: 'stat', key: 'mood', delta: 5 },
          { type: 'friendship', npc: 'miguel', delta: 25 },
        ],
      },
      {
        id: 'rest',
        label: t('让他先睡，明早再聊', 'Let him sleep; talk tomorrow'),
        effects: [{ type: 'stat', key: 'health', delta: 2 }],
      },
    ],
  },
  {
    id: 'cl-birth-certificate',
    channel: 'letter',
    title: t('明德卢寄来的信封', 'An envelope from Mindelo'),
    text: t(
      '妈妈从明德卢的登记处寄来你的出生证明，信封里还夹着一小包晒干的薄荷。',
      'Your mother has posted your birth certificate from the Mindelo registry office, with a little packet of dried mint tucked inside.',
    ),
    weight: 3,
    once: true,
    when: [{ yearMin: 1 }],
    choices: [
      {
        id: 'file',
        label: t(
          '把证明夹进国籍声明的文件夹',
          'File it with the declaration papers',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
    ],
  },
  {
    id: 'cl-extra-shift',
    channel: 'morning',
    title: t('食堂加班', 'An extra canteen shift'),
    text: t(
      '经理发消息：今天楼里有活动，午餐要多准备八十份，能早一小时来吗？',
      'The manager texts: there’s an event in the building and lunch needs eighty extra portions. Can you come in an hour early?',
    ),
    weight: 3,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'yes',
        label: t('答应，加班加钱', 'Say yes for the extra pay'),
        effects: [
          { type: 'money', delta: 45 },
          { type: 'stat', key: 'career', delta: 2 },
          { type: 'stat', key: 'health', delta: -2 },
        ],
      },
      {
        id: 'no',
        label: t('婉拒，今天要陪托马斯', 'Decline: today is for Tomás'),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
    ],
  },
];

const worker: PtCharacter = {
  ...workerProfile,
  startDate: '2026-03-01',
  stats: { money: 9_000, mood: 64, health: 72, portuguese: 36, career: 32 },
  timeline: {
    targets: ['naturalisation', 'permanent'],
    steps: {},
    route: 'other',
    birthDate: '1996-04-08',
    permits: [
      { kind: 'study', from: '2021-09-01', to: '2022-08-31' },
      { kind: 'study', from: '2022-09-01', to: '2023-08-31' },
      { kind: 'temporary', from: '2023-09-01', to: '2025-08-31' },
      { kind: 'temporary', from: '2025-09-01', to: '2028-08-31' },
    ],
    trips: [],
    nationality: {
      statelessRecognized: false,
      officialPortugueseCountryNational: false,
      bornInOfficialPortugueseCountry: false,
      language: { kind: 'none' },
      declaration: 'willing',
      crime: { review: 'clear', record: 'none' },
      security: 'clear',
      sanctions: 'clear',
      meansSources: ['employment'],
      meansEvidenceAvailable: true,
      documentsReady: false,
    },
    residence: residence(
      {
        region: 'mainland',
        otherAdults: 0,
        dependantChildren: 0,
        monthlyEligibleEur: 1_850,
        supportedMonths: 12,
        stable: true,
        solidarityReliance: false,
      },
      { kind: 'none' },
    ),
    permanentOperation: 'grant',
  },
  opening: opening(
    'worker',
    t(
      '电车的铃声从坡下传上来，对面阳台的床单被风吹得鼓鼓的。今天是在里斯本的第五个春天，冰箱上贴着一张葡语动词表。',
      'A tram bell rings up from the bottom of the hill and the sheets on the balcony opposite fill with wind. It’s your fifth spring in Lisbon, and a Portuguese verb chart is stuck to the fridge.',
    ),
    [
      {
        id: 'walk',
        label: t('先去观景台看看河', 'Look at the river from the miradouro'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
      {
        id: 'study',
        label: t(
          '翻出课本，今年要考 CIPLE',
          'Dig out the textbook: this is the year for CIPLE',
        ),
        effects: [{ type: 'stat', key: 'portuguese', delta: 2 }],
      },
    ],
  ),
  settlement: t(
    'AIMA 的窗口收下材料，回执上盖了章。走出大楼时电车正好经过，你知道明天还会在燕子街区醒来。',
    'The AIMA window takes your papers and stamps the receipt. A tram passes as you step outside; tomorrow you’ll wake up in Andorinhas again.',
  ),
  events: workerEvents,
};

const partner: PtCharacter = {
  ...partnerProfile,
  startDate: '2026-03-01',
  stats: { money: 4_800, mood: 70, health: 68, portuguese: 92, career: 20 },
  timeline: {
    targets: ['permanent', 'partner'],
    steps: {},
    route: 'cplp',
    birthDate: '1994-11-03',
    permits: [
      { kind: 'temporary', from: '2023-10-16', to: '2025-10-15' },
      { kind: 'temporary', from: '2025-10-16', to: '2028-10-15' },
    ],
    trips: [],
    nationality: {
      crime: { review: 'clear', record: 'none' },
      security: 'clear',
      sanctions: 'clear',
    },
    residence: residence(
      {
        region: 'mainland',
        otherAdults: 1,
        dependantChildren: 1,
        monthlyEligibleEur: 2_450,
        supportedMonths: 12,
        stable: true,
        solidarityReliance: false,
      },
      // Whether foreign Portuguese schooling is accepted is for the authority.
      { kind: 'foreign-portuguese-school' },
    ),
    permanentOperation: 'grant',
    partner: {
      kind: 'marriage',
      relationshipFrom: '2024-02-10',
      current: true,
      portuguesePartner: true,
      // Miguel is Portuguese from birth.
      partnerPortugueseSince: '1991-07-22',
      registrationAccepted: true,
      effectiveLinksEvidence: true,
      commonPortugueseChild: true,
      foreignService: 'none',
      documentsReady: false,
    },
  },
  opening: opening(
    'partner',
    t(
      '米格尔留了张纸条：「早班，托马斯的奶瓶在锅里温着。晚上我带烤栗子回来。」窗外的河面亮晶晶的。',
      'Miguel left a note: “Early shift. Tomás’s bottle is warming in the pan. I’ll bring roast chestnuts tonight.” The river glitters outside.',
    ),
    [
      {
        id: 'canteen',
        label: t('先去食堂备菜', 'Head to the canteen to prep'),
        effects: [{ type: 'stat', key: 'career', delta: 2 }],
      },
      {
        id: 'river',
        label: t('推着托马斯沿河走一圈', 'Push Tomás along the river'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
    ],
  ),
  settlement: t(
    '登记处的职员把收件单递给你，托马斯在推车里抓着那张纸不放。回家的路上，米格尔的电车在坡上按了两声铃。',
    'The registry clerk hands you the receipt, and Tomás grabs it from his pushchair. On the way home, Miguel’s tram rings twice on the hill.',
  ),
  events: partnerEvents,
};

export const ptCharacters = [worker, partner];
export const ptProfiles = ptCharacters.map(
  ({ id, name, intro, sprite }): CharacterProfile => ({
    id,
    name,
    intro,
    sprite,
  }),
);
