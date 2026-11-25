import type {
  CountryResult,
  EsNationalityFacts,
  EsResidenceFacts,
} from '@uk-immigration/engine';
import type { Character, CharacterProfile, GameEvent, Text } from '../../model';
import type { EsEffect, EsFestival, EsTimeline } from './rules';

type EsCharacter = Character<EsTimeline, EsEffect, CountryResult, EsFestival>;
type EsEvent = GameEvent<EsEffect, EsFestival>;
const t = (zhCN: string, en: string): Text => ({ zhCN, en });

// Fictional individual facts below (dates of birth, permits, the residence
// card's expiry, the family), not policy thresholds.
const residence = (extra: EsResidenceFacts = {}): EsResidenceFacts => ({
  thirdCountryRegime: true,
  entryRestrictionsClear: true,
  noReturnCommitmentClear: true,
  inSpain: true,
  residentInSpain: true,
  validIdentityDocument: true,
  competentOfficeAndApplication: true,
  criminalCertificatesWhereRequired: true,
  securityDecision: 'clear',
  nationalAlternatives: [],
  schooling: { children: [] },
  ...extra,
});

const nationality = (extra: EsNationalityFacts): EsNationalityFacts => ({
  applicantSignature: 'self',
  necessarySupportProvided: true,
  criminalRecords: {
    spanishRecordOrQuery: true,
    originRecordOrLawfulAlternative: true,
    militaryProcedureIfApplicable: true,
  },
  conductAndSecurityDecision: true,
  deleEvidence: 'none',
  examRelief: 'none',
  ccse: { verifiedPass: false },
  integrationDecision: true,
  ...extra,
  documents: {
    applicationForm: true,
    identity: true,
    birthRecord: true,
    residence: true,
    address: true,
    foreignDocumentFormalities: true,
    previousPassportsIfRequired: true,
    ...extra.documents,
  },
});

export const cookProfile: CharacterProfile = {
  id: 'cook',
  name: t('乔尔·包蒂斯塔', 'Joel Bautista'),
  intro: t(
    '乔尔来自菲律宾怡朗，2024 年 9 月持居留和工作许可来到瓦伦西亚，在港区的米饭馆当厨师。菲律宾属于入籍可缩短年限的国家，他想先考过西语和公民常识，申请西班牙国籍。人物与事件均为虚构。',
    'Joel from Iloilo in the Philippines came to València in September 2024 with a residence and work permit, cooking at a rice restaurant in the harbour. The Philippines is on the shorter residence route to Spanish nationality, so he plans to pass the Spanish and civics exams and apply. All characters and events are fictional.',
  ),
  sprite: 'urban/gareth.png',
};
export const exporterProfile: CharacterProfile = {
  id: 'exporter',
  name: t('周雨桐', 'Yutong Zhou'),
  intro: t(
    '雨桐来自浙江青田，2021 年秋天持居留和工作许可来到瓦伦西亚，在一家瓷砖出口公司做对华业务。女儿乐乐在街区小学读三年级。居留满五年后，她想申请长期居留。人物与事件均为虚构。',
    'Yutong from Qingtian in Zhejiang came to València in autumn 2021 with a residence and work permit, handling China sales for a tile exporter. Her daughter Lele is in year three at the neighbourhood school. After five years of residence she plans to apply for long-term residence. All characters and events are fictional.',
  ),
  sprite: 'urban/ka-ning-partner.png',
};

const opening = (
  id: string,
  text: Text,
  choices: EsEvent['choices'],
): EsEvent => ({
  id: `opening-${id}`,
  channel: 'morning',
  title: t('维拉马尔的早晨', 'Morning in Vilamar'),
  text,
  weight: 0,
  once: true,
  choices,
});

const cookEvents: EsEvent[] = [
  {
    id: 'cook-socarrat',
    channel: 'place:work',
    title: t('锅底的那层焦香', 'The crust at the bottom'),
    text: t(
      '主厨帕科把耳朵贴近铁锅：「听，噼啪声变了，socarrat 就成了。」他让你自己掌下一锅。',
      'Head cook Paco leans his ear to the pan. “Listen, the crackle changes: that’s the socarrat.” He hands you the next pan.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'try',
        label: t('自己掌一锅', 'Cook the next pan yourself'),
        effects: [
          { type: 'stat', key: 'career', delta: 3 },
          { type: 'stat', key: 'mood', delta: 3 },
        ],
      },
      {
        id: 'watch',
        label: t('再看他做一锅', 'Watch him do one more'),
        effects: [{ type: 'stat', key: 'career', delta: 1 }],
      },
    ],
  },
  {
    id: 'cook-balikbayan',
    channel: 'letter',
    title: t('寄回家的纸箱', 'A box for home'),
    text: t(
      '你在客厅里装一个 balikbayan 纸箱：橄榄油、巧克力、给外甥的球衣。妈妈说「别寄太多，你自己留着」。',
      'You pack a balikbayan box in the living room: olive oil, chocolate, a football shirt for your nephew. Mum says not to send too much and keep some for yourself.',
    ),
    weight: 2,
    once: true,
    choices: [
      {
        id: 'send',
        label: t('封箱寄走', 'Tape it up and send it'),
        effects: [
          { type: 'money', delta: -60 },
          { type: 'stat', key: 'mood', delta: 6 },
        ],
      },
      {
        id: 'wait',
        label: t('等圣诞前再寄', 'Wait and send it before Christmas'),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
    ],
  },
  {
    id: 'cook-tagalog',
    channel: 'place:college',
    title: t('他加禄语里的西语', 'Spanish inside Tagalog'),
    text: t(
      '玛丽娜老师听你说 mesa、silya、kutsara，笑了：「你早就会一半了，只是不知道。」',
      'Marina hears you say mesa, silya and kutsara and laughs. “You already know half of it. You just didn’t know.”',
    ),
    weight: 3,
    once: true,
    when: [{ stat: 'spanish', max: 57 }],
    choices: [
      {
        id: 'list',
        label: t('一起列一张对照表', 'Make a word list together'),
        effects: [
          { type: 'stat', key: 'spanish', delta: 2 },
          { type: 'friendship', npc: 'marina', delta: 20 },
        ],
      },
    ],
  },
  {
    id: 'cook-nbi',
    channel: 'letter',
    title: t('马尼拉来的证明', 'A certificate from Manila'),
    text: t(
      '菲律宾的无犯罪证明终于寄到了。法蒂玛看了一眼：「要海牙认证，还要宣誓翻译。民事登记处旁边就有人帮忙。」',
      'Your Philippine police clearance has finally arrived. Fatima glances at it. “It needs an apostille and a sworn translation. There’s help next to the civil registry.”',
    ),
    weight: 3,
    once: true,
    forbids: ['papers-ready'],
    choices: [
      {
        id: 'plan',
        label: t('夹进入籍材料文件夹', 'File it with the nationality papers'),
        effects: [{ type: 'stat', key: 'mood', delta: 3 }],
        note: t(
          '入籍要核对原籍国的刑事记录和出生证明，外国文书须认证和翻译（SRC-321、SRC-322）。去民事登记处的窗口办。',
          'Nationality checks the home-country criminal record and birth certificate; foreign papers need legalisation and translation (SRC-321, SRC-322). Sort them at the civil registry.',
        ),
      },
    ],
  },
  {
    id: 'cook-mum-call',
    channel: 'phone',
    title: t('怡朗来的视频', 'A video call from Iloilo'),
    text: t(
      '妈妈举着手机绕院子一圈：「芒果熟了！你那边的烟花视频再发一个给你舅舅看。」',
      'Mum walks the phone round the yard. “The mangoes are ripe! Send your uncle another of those firework videos.”',
    ),
    weight: 2,
    choices: [
      {
        id: 'show',
        label: t('带她看港口的落日', 'Show her the sunset over the harbour'),
        effects: [{ type: 'stat', key: 'mood', delta: 6 }],
      },
      {
        id: 'short',
        label: t(
          '聊几句，约周末再打',
          'Chat a little, call again at the weekend',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 3 }],
      },
    ],
  },
  {
    id: 'cook-summer-rush',
    channel: 'morning',
    title: t('海滩季的米饭馆', 'Beach season at the restaurant'),
    text: t(
      '七月的周末，露台从中午坐满到半夜。帕科问你能不能多顶一个晚班。',
      'July weekends fill the terrace from noon to midnight. Paco asks if you can take an extra evening shift.',
    ),
    weight: 3,
    season: 3,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'yes',
        label: t('顶班，多赚一点', 'Take the shift for the extra pay'),
        effects: [
          { type: 'money', delta: 80 },
          { type: 'stat', key: 'health', delta: -2 },
        ],
      },
      {
        id: 'no',
        label: t('婉拒，晚上想去海边', 'Decline: the beach is calling'),
        effects: [{ type: 'stat', key: 'mood', delta: 3 }],
      },
    ],
  },
];

const exporterEvents: EsEvent[] = [
  {
    id: 'exporter-lele-valencian',
    channel: 'place:home',
    title: t('乐乐的作业', 'Lele’s homework'),
    text: t(
      '乐乐趴在桌上写瓦伦西亚语作业，回头纠正你：「妈妈，不是 gracias，是 gràcies！」',
      'Lele does her Valencian homework at the table and corrects you over her shoulder: “Mum, not gracias, it’s gràcies!”',
    ),
    weight: 3,
    when: [{ minuteMin: 1140 }],
    choices: [
      {
        id: 'learn',
        label: t('请她当小老师', 'Ask her to teach you'),
        effects: [
          { type: 'stat', key: 'spanish', delta: 1 },
          { type: 'friendship', npc: 'lele', delta: 25 },
        ],
      },
      {
        id: 'praise',
        label: t('夸她，再切盘橙子', 'Praise her and cut some oranges'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
    ],
  },
  {
    id: 'exporter-container',
    channel: 'place:work',
    title: t('卡在港口的集装箱', 'A container stuck at the port'),
    text: t(
      '一柜发往宁波的地砖卡在港口查验。客户在微信上连发三条语音。',
      'A container of floor tiles for Ningbo is held for inspection at the port. The client sends three voice messages in a row.',
    ),
    weight: 3,
    once: true,
    choices: [
      {
        id: 'stay',
        label: t('留下来把单据理清', 'Stay late and sort the paperwork'),
        effects: [
          { type: 'stat', key: 'career', delta: 4 },
          { type: 'stat', key: 'health', delta: -2 },
        ],
      },
      {
        id: 'agent',
        label: t(
          '交给报关行，明早再跟',
          'Pass it to the customs agent until morning',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 2 }],
      },
    ],
  },
  {
    id: 'exporter-grandma-call',
    channel: 'phone',
    title: t('青田来的电话', 'A call from Qingtian'),
    text: t(
      '外婆在镜头那头问：「乐乐长高没有？暑假回来吗？杨梅快熟了。」',
      'Grandma asks over video: “Has Lele grown? Are you coming home this summer? The bayberries are nearly ripe.”',
    ),
    weight: 2,
    choices: [
      {
        id: 'lele',
        label: t('把电话递给乐乐', 'Hand the phone to Lele'),
        effects: [
          { type: 'stat', key: 'mood', delta: 6 },
          { type: 'friendship', npc: 'lele', delta: 10 },
        ],
      },
      {
        id: 'later',
        label: t(
          '说完正事，约好周末再聊',
          'Cover the news and call again at the weekend',
        ),
        effects: [{ type: 'stat', key: 'mood', delta: 3 }],
      },
    ],
  },
  {
    id: 'exporter-tutoria',
    channel: 'morning',
    title: t('家长会', 'Parents’ meeting'),
    text: t(
      '班主任约你下午四点半谈谈乐乐的学期。通知是瓦伦西亚语写的，你查了两遍字典。',
      'Lele’s teacher asks to meet at half past four about her term. The note is in Valencian; you check the dictionary twice.',
    ),
    weight: 3,
    once: true,
    when: [{ dayKind: 'workday' }],
    choices: [
      {
        id: 'go',
        label: t('早退半小时去学校', 'Leave work half an hour early'),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'stat', key: 'career', delta: -1 },
          { type: 'stat', key: 'spanish', delta: 1 },
        ],
      },
      {
        id: 'call',
        label: t('改成电话沟通', 'Ask to talk by phone instead'),
        effects: [{ type: 'stat', key: 'career', delta: 1 }],
      },
    ],
  },
  {
    id: 'exporter-cita-tip',
    channel: 'npc:sergi',
    speaker: 'sergi',
    title: t('塞尔吉的秘诀', 'Sergi’s tip'),
    text: t(
      '塞尔吉压低声音：「外国人办公室的 cita previa 一早放号。图书馆电脑快，多试几次。递表那天带上护照和 EX-11。」',
      'Sergi lowers his voice. “The immigration office releases its cita previa slots early. The library computers are quick, so keep trying. On the day, bring your passport and the EX-11 form.”',
    ),
    weight: 3,
    once: true,
    forbids: ['cita-booked'],
    choices: [
      {
        id: 'thanks',
        label: t(
          '记下来，请他喝杯欧洽塔',
          'Note it down and buy him a horchata',
        ),
        effects: [
          { type: 'money', delta: -4 },
          { type: 'friendship', npc: 'sergi', delta: 25 },
        ],
      },
    ],
  },
  {
    id: 'exporter-card-folder',
    channel: 'place:home',
    title: t('居留卡上的日期', 'The date on the residence card'),
    text: t(
      '居留卡背面的到期日越来越近。你把护照、住址登记证明和乐乐的在学证明放进同一个文件夹。',
      'The expiry date on your residence card is getting close. Passport, padrón certificate and Lele’s school certificate go into one folder.',
    ),
    weight: 3,
    once: true,
    when: [{ visaMonthsLeftMax: 8 }],
    choices: [
      {
        id: 'plan',
        label: t('这周就去抢 cita previa', 'Try for a cita previa this week'),
        effects: [{ type: 'stat', key: 'mood', delta: 3 }],
      },
      {
        id: 'later',
        label: t('先把提醒贴在冰箱上', 'Stick a reminder on the fridge'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
    ],
  },
];

const cook: EsCharacter = {
  ...cookProfile,
  startDate: '2026-03-01',
  stats: { money: 5_200, mood: 66, health: 74, spanish: 44, career: 30 },
  timeline: {
    targets: ['L', 'N'],
    timeRecordsComplete: true,
    permits: [
      { from: '2024-09-02', to: '2025-09-01', study: false },
      { from: '2025-09-02', to: '2027-08-31', study: false },
    ],
    trips: [],
    route: 'ibero',
    nationality: nationality({
      birthDate: '1994-07-21',
      originalNationalityForPermit: 'philippines',
      documentedNationalities: ['PH'],
      criminalRecords: {
        spanishRecordOrQuery: true,
        originRecordOrLawfulAlternative: false,
        militaryProcedureIfApplicable: true,
      },
      documents: { birthRecord: false, foreignDocumentFormalities: false },
    }),
    residence: residence(),
    steps: { moves: [] },
  },
  opening: opening(
    'cook',
    t(
      '凌晨就有人在街上放鞭炮：法雅节要来了。广场上搭起了半人高的木架，阳台上晾着你的白厨师服。',
      'Firecrackers in the street since dawn: the Fallas are coming. A wooden frame is going up in the square, and your white chef’s jacket hangs on the balcony.',
    ),
    [
      {
        id: 'square',
        label: t('去广场看他们搭法雅', 'Go and watch the falla go up'),
        effects: [{ type: 'stat', key: 'mood', delta: 4 }],
      },
      {
        id: 'study',
        label: t(
          '翻出西语课本，今年要考 DELE',
          'Dig out the Spanish book: this is the year for the DELE',
        ),
        effects: [{ type: 'stat', key: 'spanish', delta: 2 }],
      },
    ],
  ),
  settlement: t(
    '入籍申请递交了，回执存在手机里。晚上帕科在锅边给你留了一勺锅巴：「下一锅，等你宣誓那天再做。」',
    'The nationality application is in and the receipt is on your phone. That evening Paco saves you a spoonful of socarrat: “The next pan is for the day you take the oath.”',
  ),
  events: cookEvents,
};

const exporter: EsCharacter = {
  ...exporterProfile,
  startDate: '2026-03-01',
  stats: { money: 11_000, mood: 64, health: 70, spanish: 55, career: 46 },
  timeline: {
    targets: ['L', 'N'],
    timeRecordsComplete: true,
    permits: [
      { from: '2021-10-04', to: '2023-10-03', study: false },
      { from: '2023-10-04', to: '2027-04-30', study: false },
    ],
    trips: [],
    route: 'general',
    nationality: nationality({
      birthDate: '1989-11-03',
      documentedNationalities: ['CN'],
    }),
    residence: residence({
      schooling: {
        children: [
          {
            birthDate: '2018-05-14',
            standardSpanishSchooling: true,
            enrolledWithProof: true,
          },
        ],
      },
    }),
    steps: { moves: [] },
  },
  opening: opening(
    'exporter',
    t(
      '乐乐把书包甩上肩：「妈妈，今天学校要做法雅的小模型！」窗外的橙树开了花，整条街都是香的。',
      'Lele swings her school bag on: “Mum, we’re making a little falla at school today!” The orange trees outside are in blossom and the whole street smells of it.',
    ),
    [
      {
        id: 'walk',
        label: t('送她到校门口', 'Walk her to the school gate'),
        effects: [
          { type: 'stat', key: 'mood', delta: 4 },
          { type: 'friendship', npc: 'lele', delta: 15 },
        ],
      },
      {
        id: 'mail',
        label: t(
          '先回几封宁波客户的邮件',
          'Answer the Ningbo client emails first',
        ),
        effects: [{ type: 'stat', key: 'career', delta: 2 }],
      },
    ],
  ),
  settlement: t(
    '长期居留的申请收下了，窗口的职员在回执上盖了章。走出大楼，乐乐举着两杯欧洽塔在门口等你。',
    'The long-term residence application is accepted, and the clerk stamps your receipt. Outside, Lele is waiting at the door with two horchatas.',
  ),
  events: exporterEvents,
};

export const esCharacters = [cook, exporter];
export const esProfiles = esCharacters.map(
  ({ id, name, intro, sprite }): CharacterProfile => ({
    id,
    name,
    intro,
    sprite,
  }),
);
