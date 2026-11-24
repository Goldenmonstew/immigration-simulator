import { addMonths } from './dates';
import {
  ageAtLeast,
  all,
  any,
  assemblePathway,
  check,
  continuity,
  filingContext,
  fromPilot,
  full,
  inapplicable,
  old,
  paidOnTime,
  pilotFor,
  ref,
  scheduleFiling,
} from './japan-full-shared';
import type {
  JpFiling,
  JpFullCheck,
  JpFullContext,
  JpFullPathway,
  JpPayment,
} from './japan-full-shared';
import { afterYears } from './pilot';
import type { IsoDate } from './types';

export type JpFullNaturalisationRoute =
  | { route: 'general'; homeMajorityAge?: number }
  | { route: 'spouse'; marriedOn: IsoDate; stillJapaneseSpouse?: boolean }
  | {
      route: 'article-6-former-national-child';
      biologicalChildOfFormerNational?: boolean;
    }
  | {
      route: 'article-6-japan-birth';
      bornInJapan?: boolean;
      biologicalParentBornInJapan?: boolean;
      authorityConfirmsOverseasBirthBranch?: boolean;
    }
  | { route: 'article-6-long-residence' }
  | {
      route: 'article-8-japanese-child';
      biologicalChildOfJapaneseNational?: boolean;
    }
  | {
      route: 'article-8-adopted-child';
      adoptedByJapaneseNational?: boolean;
      adoptedWhileMinorUnderHomeLaw?: boolean;
    }
  | {
      route: 'article-8-former-national';
      lostJapaneseNationality?: boolean;
      lostAfterNaturalising?: boolean;
    }
  | {
      route: 'article-8-stateless-from-birth';
      bornInJapan?: boolean;
      statelessSinceBirth?: boolean;
      domiciledContinuouslySinceBirth?: boolean;
    }
  | {
      route: 'article-9-special-merit';
      specialMeritConfirmed?: boolean;
      dietApproval?: boolean;
    };

export interface JpNaturalisationEvidence {
  japaneseCitizen?: boolean;
  inJapan?: boolean;
  /** Whether the current Japanese domicile rests on lawful status. */
  lawfulDomicile?: boolean;
  domicileFrom?: IsoDate;
  residenceFrom?: IsoDate;
  capacityUnderHomeLaw?: boolean;
  goodConductConfirmed?: boolean;
  criminalOrTrafficHistory?: 'none' | 'relevant-record' | 'uncertain';
  livelihoodConfirmed?: boolean;
  nationality?:
    | 'confirmed-stateless'
    | 'all-nationalities-lost-on-naturalisation'
    | 'will-retain-nationality';
  cannotLoseNationalityByOwnChoice?: boolean;
  ministerialExceptionConfirmed?: boolean;
  constitutionalConditionConfirmed?: boolean;
  integratedIntoJapanConfirmed?: boolean;
  japaneseLanguage?: {
    speaking?: 'independent' | 'needs-help' | 'unable';
    reading?: 'independent' | 'needs-help' | 'unable';
    writing?: 'independent' | 'needs-help' | 'unable';
    authorityConfirmed?: boolean;
  };
  requiredInterviewAndAssessmentComplete?: boolean;
  tax?: JpPayment;
  pension?: JpPayment;
  publicHealthInsurance?: JpPayment;
  residenceEvidenceReady?: boolean;
  healthInsuranceEvidenceReady?: boolean;
  motivationReady?: boolean;
  oathReady?: boolean;
  plansToLiveInJapan?: boolean;
  filer?: JpFiling;
  filedAtJurisdictionalBureau?: boolean;
  writtenDocumentsAndTranslationsReady?: boolean;
  officialGazetteOn?: IsoDate;
  familyRegistrationOn?: IsoDate;
}

export interface JpFullNaturalisationRequest {
  routes: JpFullNaturalisationRoute[];
  evidence?: JpNaturalisationEvidence;
}

const titles: Record<JpFullNaturalisationRoute['route'], [string, string]> = {
  general: ['一般帰化', 'Ordinary naturalisation'],
  spouse: [
    '帰化 · 日本国民配偶者',
    'Naturalisation · spouse of a Japanese national',
  ],
  'article-6-former-national-child': [
    '帰化 · 曾为日本国民者之子',
    'Naturalisation · child of a former Japanese national',
  ],
  'article-6-japan-birth': [
    '帰化 · 日本出生特例',
    'Naturalisation · Japan birth exception',
  ],
  'article-6-long-residence': [
    '帰化 · 长期居所',
    'Naturalisation · long residence',
  ],
  'article-8-japanese-child': [
    '帰化 · 日本国民之子',
    'Naturalisation · child of a Japanese national',
  ],
  'article-8-adopted-child': [
    '帰化 · 日本国民养子',
    'Naturalisation · adopted child of a Japanese national',
  ],
  'article-8-former-national': [
    '帰化 · 曾有日本国籍',
    'Naturalisation · former Japanese national',
  ],
  'article-8-stateless-from-birth': [
    '帰化 · 在日出生且自出生无国籍',
    'Naturalisation · born in Japan and stateless since birth',
  ],
  'article-9-special-merit': [
    '帰化 · 特別功労',
    'Naturalisation · special merit',
  ],
};

export function assessJapanNaturalisation(
  req: JpFullContext,
  route: JpFullNaturalisationRoute,
  e: JpNaturalisationEvidence,
): JpFullPathway {
  const { date, L } = filingContext(req);
  const evidenceOn = req.residenceEvidenceOn ?? date;
  const assess = (applicationDate: IsoDate) =>
    assessJapanNaturalisationOnDate(
      { ...req, applicationDate },
      evidenceOn !== applicationDate && route.route === 'spouse'
        ? { ...route, stillJapaneseSpouse: undefined }
        : route,
      evidenceOn === applicationDate
        ? e
        : { ...e, inJapan: undefined, lawfulDomicile: undefined },
    );
  const initial = assess(date);
  const hasCandidateAnswers =
    evidenceOn !== date &&
    (e.inJapan !== undefined ||
      e.lawfulDomicile !== undefined ||
      (route.route === 'spouse' && route.stillJapaneseSpouse !== undefined));
  const candidateDate =
    hasCandidateAnswers && initial.status !== 'NOT_APPLICABLE'
      ? date
      : initial.earliestDate;
  const result = scheduleFiling(initial, L, assess, candidateDate);
  if (result.earliestDate === undefined) return result;
  return {
    ...result,
    summary:
      result.summary +
      L(
        '实际递交日由管辖法务局安排。',
        ' The actual filing date depends on the competent Legal Affairs Bureau.',
      ),
  };
}

function assessJapanNaturalisationOnDate(
  req: JpFullContext,
  route: JpFullNaturalisationRoute,
  e: JpNaturalisationEvidence,
): JpFullPathway {
  const { date, L } = filingContext(req);
  const history = continuity(req, date);
  const a9 = route.route === 'article-9-special-merit';
  const a8 = route.route.startsWith('article-8-');
  const spouse = route.route === 'spouse';
  const ordinary = route.route === 'general';
  const simplified = full.simplifiedNaturalisation.value;
  const currentDomicile = history.abroad
    ? false
    : all(e.inJapan, e.lawfulDomicile);
  const domicileStart = e.domicileFrom ?? req.stayStart;
  const residenceStart = e.residenceFrom ?? req.stayStart;
  const earlier =
    domicileStart < residenceStart ? domicileStart : residenceStart;
  const continuous = (start: IsoDate, years: number) => {
    const met = history.yearsSince(start, years);
    if (met !== true) return met;
    return history.hasTripsSince(afterYears(date, -years)) ? undefined : true;
  };
  const pilot =
    ordinary || spouse
      ? pilotFor(req, {
          naturalisation: spouse
            ? { route: 'spouse', marriedOn: route.marriedOn }
            : {
                route: 'general',
                dateOfBirth: req.dateOfBirth ?? date,
                homeMajorityAge: route.homeMajorityAge,
              },
        })
      : undefined;
  // A missing DOB must not turn the pilot's placeholder age into a failed condition or projection.
  const timePilot = ordinary && !req.dateOfBirth ? undefined : pilot;
  const law = (locator: string) => ref('SRC-111', locator);
  const q9 = ref(
    'SRC-117',
    'Q9',
    'https://www.moj.go.jp/MINJI/minji78.html#a09',
  );
  const practiceRefs = [
    ...old.naturalisationPracticeYears.sources,
    ...old.naturalisationPracticeFrom.sources,
  ];
  const values: JpFullCheck[] = [];
  const c = (
    key: string,
    zh: string,
    en: string,
    met: boolean | undefined,
    sources: Parameters<typeof check>[3],
    detailZh: string,
    detailEn: string,
    pending: string[] = [],
    kind?: JpFullCheck['kind'],
  ) => {
    const item = check(
      `jp.nat.${key}`,
      L(zh, en),
      met,
      sources,
      L(detailZh, detailEn),
      pending,
      kind,
    );
    values.push(item);
    return item;
  };
  const skip = (item: JpFullCheck, zh: string, en: string) => {
    values[values.indexOf(item)] = inapplicable(item, L(zh, en));
  };
  const relax = (item: JpFullCheck) =>
    skip(
      item,
      '所选条文准许放宽此项，须另满足该条文的路径条件。',
      'The selected article permits relaxation of this condition when its pathway requirements are met.',
    );

  c(
    'foreign-national',
    '外国人申请身份',
    'Foreign applicant',
    e.japaneseCitizen === undefined ? undefined : !e.japaneseCitizen,
    [law('第2–4・17条'), q9],
    '先核对是否已通过出生、認知或届出取得日本国籍，再选择帰化。',
    'Check any Japanese nationality acquired at birth, by acknowledgement or by notification before applying for naturalisation.',
    ['PD-377'],
  );
  const domicile = c(
    'lawful-domicile',
    '申请时的合法日本住所',
    'Lawful domicile in Japan',
    currentDomicile,
    [law('第5–8条'), q9],
    '核对在日实际住所、居所、正当在留资格与递交地点。',
    'Confirm your actual Japanese domicile or residence, valid status and filing location.',
    ['PD-139'],
  );
  if (a9) relax(domicile);

  if (ordinary) {
    if (pilot && !e.domicileFrom) {
      values.push(
        fromPilot(
          'jp.nat.domicile-years',
          L('连续住所年限', 'Years of continuous domicile'),
          pilot.checks[0],
          ['PD-130', 'PD-138', 'PD-139'],
        ),
      );
    } else {
      const years = old.naturalisationYears.value;
      c(
        'domicile-years',
        '连续住所年限',
        'Years of continuous domicile',
        continuous(domicileStart, years),
        old.naturalisationYears.sources,
        `一般帰化要求在日本连续住所满 ${years} 年。`,
        `Ordinary naturalisation requires ${years} years of continuous domicile in Japan.`,
        ['PD-130', 'PD-138', 'PD-139'],
      );
    }
  }
  const japanAge =
    date < old.naturalisationAgeFrom.value
      ? old.naturalisationAgeBefore.value
      : old.naturalisationAge.value;
  const birthAge = ageAtLeast(req.dateOfBirth, date, japanAge);
  const transitionalAge =
    date < old.naturalisationAgeFrom.value &&
    birthAge === false &&
    ageAtLeast(req.dateOfBirth, date, old.naturalisationAge.value);
  const age =
    timePilot && ordinary
      ? timePilot.checks[1].met
      : transitionalAge
        ? undefined
        : birthAge;
  const capacity = c(
    'age-and-capacity',
    '年龄及本国法行为能力',
    'Age and capacity under home law',
    all(age, e.capacityUnderHomeLaw),
    [...old.naturalisationAge.sources, ...old.naturalisationAgeFrom.sources],
    `递交日适用 ${japanAge} 岁门槛，并须具本国法适用的行为能力。跨改法日未决申请待确认。`,
    `The filing-date age threshold is ${japanAge} and legal capacity under home law is also required. Pending applications crossing the age change need confirmation.`,
    transitionalAge ? ['PD-161', 'PD-377'] : ['PD-377'],
  );
  if (spouse || a8 || a9) relax(capacity);

  const conduct = c(
    'good-conduct',
    '法定素行善良',
    'Statutory good conduct',
    e.goodConductConfirmed,
    [
      law('第5条第1項第3号'),
      q9,
      ref('SRC-445', '帰化のてびき「運転記録証明書」'),
    ],
    `${e.criminalOrTrafficHistory === 'relevant-record' ? '已填写刑事或交通记录。' : ''} 品格综合看国内外刑事、交通、生活行为及缴税缴费。适用时驾驶记录通常为最近 ${full.evidenceYears.value.naturalisationLocal.driving} 年。`,
    `${e.criminalOrTrafficHistory === 'relevant-record' ? 'A criminal or traffic record was reported. ' : ''}The authority considers conduct, domestic and foreign criminal and traffic records, and payment compliance. Driving records may cover the latest ${full.evidenceYears.value.naturalisationLocal.driving} years.`,
    ['PD-376'],
  );
  if (a9) relax(conduct);

  const livelihood = c(
    'livelihood',
    '共同生计',
    'Means of support',
    e.livelihoodConfirmed,
    [
      law('第5条第1項第4号'),
      q9,
      ref('SRC-445', '帰化のてびき「生計」「事業」'),
    ],
    '可按本人或共同生计亲属的资产、职业技能、就业与支出证明能在日本生活。',
    'Evidence of assets, skills, employment and expenses can come from the applicant or relatives sharing their livelihood.',
    ['PD-377'],
  );
  if (a8 || a9) relax(livelihood);

  const losesNationality =
    e.nationality === undefined
      ? undefined
      : e.nationality !== 'will-retain-nationality';
  const exception = all(
    e.cannotLoseNationalityByOwnChoice,
    e.ministerialExceptionConfirmed,
  );
  const nationality = c(
    'nationality-loss',
    '防止重国籍',
    'Avoidance of multiple nationality',
    any(losesNationality, exception),
    [
      law('第5条第1項第5号・第2項'),
      q9,
      ref('SRC-445', '帰化のてびき「国籍喪失等」'),
    ],
    '核对无国籍、因归化失去现有全部国籍，或第5条第2項的批准。',
    'Confirm statelessness, loss of all current nationalities on naturalisation, or approval under Article 5(2).',
    ['PD-377'],
  );
  const nationalityException = c(
    'nationality-loss-exception',
    '不能失籍的法定例外',
    'Exception where loss is beyond the applicant’s control',
    exception,
    [law('第5条第2項'), q9],
    '本人意愿无法失去原国籍且法务大臣认可特殊关系或境遇时可放宽。',
    'The Minister may relax the condition if loss is beyond the applicant’s control and a particular relationship or circumstance is recognised.',
    ['PD-377'],
    'information',
  );
  if (a9) relax(nationality);
  if (a9 || losesNationality === true) relax(nationalityException);

  const constitutional = c(
    'constitutional-condition',
    '宪法遵守',
    'Constitutional condition',
    e.constitutionalConditionConfirmed,
    [law('第5条第1項第6号'), q9],
    '核对是否存在条文所规定的以暴力破坏宪法或政府、组织或参加相关团体的事实。',
    'Confirm whether conduct within the statutory scope of violent subversion, including forming or joining a relevant group, applies.',
    ['PD-376'],
  );
  if (a9) relax(constitutional);

  const practice = pilot?.checks[ordinary ? 2 : 1];
  if (practice && !e.residenceFrom) {
    values.push(
      fromPilot(
        'jp.nat.residence-practice',
        L('审查运用在留年限', 'Residence under review practice'),
        practice,
        ['PD-137', 'PD-138', 'PD-139'],
      ),
    );
  } else {
    const years = old.naturalisationPracticeYears.value;
    const period = continuous(residenceStart, years);
    const residence = c(
      'residence-practice',
      '审查运用在留年限',
      'Residence under review practice',
      period === true
        ? true
        : ordinary && date >= old.naturalisationPracticeFrom.value
          ? period
          : undefined,
      practiceRefs,
      `审查运用原则要求在留 ${years} 年，简易帰化的适用边界由法务局确认。`,
      `Review practice generally looks for ${years} years of residence. Confirm its application to simplified naturalisation with the bureau.`,
      ['PD-137', 'PD-138'],
    );
    if (a9) relax(residence);
  }
  c(
    'integration',
    '融入日本社会',
    'Integration into Japanese society',
    e.integratedIntoJapanConfirmed,
    [q9, ...practiceRefs],
    '在留年限与融和整体判断分别核对，法务局可查生活、家庭及其他证据。',
    'Residence duration and integration are separate. The bureau may examine life in Japan, family and other evidence.',
    ['PD-137', 'PD-364'],
    a9 ? 'factor' : 'requirement',
  );

  const language = e.japaneseLanguage;
  const languageFacts = [
    language?.speaking,
    language?.reading,
    language?.writing,
  ];
  c(
    'japanese-language',
    '日语会话、阅读与书写',
    'Spoken and written Japanese',
    language?.authorityConfirmed,
    [q9, ref('SRC-445', '東京法務局第2節、帰化のてびき「日本語試験の結果等」')],
    `会话、读、写分别核对。${languageFacts.some((fact) => fact && fact !== 'independent') ? '已填写部分能力需帮助或不能独立完成。' : ''} 认可证据、等级及个案例外由法务局确认。`,
    `Speaking, reading and writing are assessed separately.${languageFacts.some((fact) => fact && fact !== 'independent') ? ' Some skills are reported as requiring help or unavailable.' : ''} The bureau confirms evidence, level and exceptions.`,
    ['PD-364'],
    a9 ? 'factor' : 'requirement',
  );
  c(
    'interview-and-assessment',
    '法务局面谈与指定评估',
    'Bureau interview and applicable assessment',
    e.requiredInterviewAndAssessmentComplete,
    [
      ref('SRC-118', '参議院答弁書「三について」'),
      ref('SRC-445', '審査基準・静岡地方法務局「国籍相談・面接」'),
    ],
    '核对个案收到的面谈、评估与补件指示。公开资料未给出统一公民考试和评分。',
    'Confirm interviews, assessments and requests in your case. Published material gives no uniform civics test or scoring scheme.',
    ['PD-364'],
    'factor',
  );

  const windows = full.evidenceYears.value.naturalisationLocal;
  for (const [key, zh, en, payment, years] of [
    ['tax', '税务缴付', 'Tax payments', e.tax, windows.tax],
    [
      'pension-payments',
      '公的年金缴付',
      'Public pension payments',
      e.pension,
      windows.insurance,
    ],
    [
      'public-health-insurance',
      '公的医疗保险缴付',
      'Public health insurance payments',
      e.publicHealthInsurance,
      windows.insurance,
    ],
  ] as const) {
    c(
      key,
      zh,
      en,
      paidOnTime(payment),
      [
        q9,
        ref('SRC-118', '参議院法務委員会 No.120'),
        ref('SRC-459', '納税・社会保険料'),
      ],
      `核对适用义务及按期证据，东京和广岛相应材料示例为最近 ${years} 年，具体期限由法务局确定。`,
      `Check applicable duties and timely payment. The respective Tokyo and Hiroshima examples cover ${years} years, subject to the bureau’s instructions.`,
      ['PD-376'],
      'factor',
    );
  }
  c(
    'housing-and-health-evidence',
    '住房与医保材料',
    'Housing and public health insurance evidence',
    all(e.residenceEvidenceReady, e.healthInsuranceEvidenceReady),
    [
      law('第5条第1項第1・3・4号'),
      ref('SRC-445', '帰化のてびき「住民票」「医療保険」'),
    ],
    '核对住民票、居住史与适用医保资料。个案可补充租赁、资产或居住证据。',
    'Confirm resident records, residence history and applicable medical insurance evidence. The case may need additional housing or asset documents.',
    ['PD-377'],
    'factor',
  );

  const selfRequired = ageAtLeast(
    req.dateOfBirth,
    date,
    simplified.selfFilingAge,
  );
  const motivation = c(
    'motivation-and-oath',
    '动机书与宣誓',
    'Motivation statement and oath',
    all(e.motivationReady, e.oathReady),
    [
      ref('SRC-446', '第2条第3項'),
      ref('SRC-445', '帰化のてびき「動機書」「宣誓」'),
    ],
    `核对动机书、宣誓及归化后生活计划。${e.plansToLiveInJapan === false ? '已填写不打算在日本生活。' : ''} 未满 ${simplified.selfFilingAge} 岁免本人动机书及宣誓。`,
    `Check the motivation statement, oath and plans for life after naturalisation.${e.plansToLiveInJapan === false ? ' The applicant does not intend to live in Japan.' : ''} The applicant’s own statement and oath are waived under age ${simplified.selfFilingAge}.`,
    ['PD-364'],
    'factor',
  );
  if (selfRequired === false)
    skip(
      motivation,
      '未满法定年龄，免本人动机书和宣誓。',
      'The applicant is below the age for a personal statement and oath.',
    );

  const fileInPerson =
    selfRequired === undefined || e.filer === undefined
      ? undefined
      : e.filer === (selfRequired ? 'self' : 'legal-representative');
  c(
    'filing-and-documents',
    '递交人、法务局及申请材料',
    'Filer, competent bureau and required documents',
    all(
      fileInPerson,
      e.filedAtJurisdictionalBureau,
      e.writtenDocumentsAndTranslationsReady,
      history.abroad ? false : e.inJapan,
    ),
    [
      law('第18条'),
      ref('SRC-446', '第2条'),
      ref('SRC-445', '帰化許可申請「提出方法」「提出先」'),
    ],
    `满 ${simplified.selfFilingAge} 岁须本人亲自到住所辖区法务局递交，以下由法定代理人递交，并附证明及外文日译。`,
    `Applicants aged ${simplified.selfFilingAge} or older file personally at their competent bureau. Younger applicants use their legal representative. Include evidence and Japanese translations.`,
    ['PD-370'],
  );

  const fee = full.fees.value.naturalisation;
  c(
    'application-fee',
    '帰化申请费',
    'Naturalisation application fee',
    true,
    [ref('SRC-445', '帰化許可申請「手数料」')],
    `国家申请费 JPY ${fee}，制证与翻译另按实际发生费用。`,
    `The government application fee is JPY ${fee}. Document and translation costs vary.`,
    [],
    'information',
  ).fee = { currency: 'JPY', amount: fee };
  const gazette = e.officialGazetteOn;
  const due = gazette
    ? addMonths(gazette, simplified.familyRegistrationMonths)
    : undefined;
  const submitted = e.familyRegistrationOn;
  c(
    'gazette-and-family-registration',
    '官報生效与帰化届',
    'Gazette commencement and family registration',
    gazette && submitted && due && submitted <= req.simulationDate
      ? submitted >= gazette && submitted <= due
      : due && req.simulationDate > due
        ? false
        : undefined,
    [law('第10条'), ref('SRC-447', '第102条の2')],
    `官報告示当日生效，告示后 ${simplified.familyRegistrationMonths} 个月内办帰化届。${due ? `推算期限 ${due}。` : ''}`,
    `Nationality takes effect on Gazette publication. Register within ${simplified.familyRegistrationMonths} month of publication.${due ? ` Calculated deadline: ${due}.` : ''}`,
    ['PD-370'],
    'information',
  );

  const a6 = (
    key: string,
    met: boolean | undefined,
    locator: string,
    zh: string,
    en: string,
    pending: string[] = ['PD-137', 'PD-138', 'PD-139'],
  ) =>
    c(
      key,
      '第6条路径条件',
      'Article 6 pathway requirements',
      met,
      [law(locator)],
      zh,
      en,
      pending,
    );
  const a8Check = (
    key: string,
    met: boolean | undefined,
    locator: string,
    zh: string,
    en: string,
  ) =>
    c(
      key,
      '第8条路径条件',
      'Article 8 pathway requirements',
      met,
      [law(locator)],
      zh,
      en,
      ['PD-137', 'PD-138', 'PD-139', 'PD-377'],
    );

  switch (route.route) {
    case 'general':
      break;
    case 'spouse': {
      const first = old.spouseNaturalisationYears.value;
      const second = old.spouseNaturalisationDomicileYears.value;
      const marriage = old.spouseNaturalisationMarriageYears.value;
      const period =
        e.domicileFrom || e.residenceFrom
          ? any(
              continuous(earlier, first),
              all(
                date >= afterYears(route.marriedOn, marriage),
                continuous(domicileStart, second),
              ),
            )
          : pilot?.checks[0].met;
      c(
        'spouse-article-7',
        '第7条日本国民配偶者',
        'Article 7 spouse of a Japanese national',
        all(route.stillJapaneseSpouse, date >= route.marriedOn, period),
        old.spouseNaturalisationYears.sources,
        `现为日本国民配偶，且连续住所或居所满 ${first} 年并有现住所，或结婚满 ${marriage} 年且连续住所满 ${second} 年。`,
        `Be a current spouse of a Japanese national, with ${first} years of continuous domicile or residence and current domicile, or ${marriage} years of marriage and ${second} year of continuous domicile.`,
        ['PD-137', 'PD-138', 'PD-139'],
      );
      break;
    }
    case 'article-6-former-national-child': {
      const years = simplified.article6ChildYears;
      a6(
        'former-national-child',
        all(route.biologicalChildOfFormerNational, continuous(earlier, years)),
        '第6条第1号',
        `为曾有日本国籍者的非养子女，且连续住所或居所满 ${years} 年。`,
        `Be a non-adopted child of a former Japanese national with ${years} years of continuous domicile or residence.`,
      );
      break;
    }
    case 'article-6-japan-birth': {
      const years = simplified.article6JapanBirthYears;
      const locallyBorn = all(
        route.bornInJapan,
        any(continuous(earlier, years), route.biologicalParentBornInJapan),
      );
      const overseas = all(
        route.bornInJapan === undefined ? undefined : !route.bornInJapan,
        route.biologicalParentBornInJapan,
        route.authorityConfirmsOverseasBirthBranch,
      );
      a6(
        'japan-birth',
        any(locallyBorn, overseas),
        '第6条第2号',
        `本人在日本出生且连续住所或居所满 ${years} 年，或适用在日出生的生父母分支。本人境外出生而生父母在日出生时由法务局确认。`,
        `Check birth in Japan with ${years} years of continuous domicile or residence, or the applicable Japan-born biological parent branch. Obtain confirmation if the applicant was born abroad.`,
        ['PD-138', 'PD-139', 'PD-373'],
      );
      break;
    }
    case 'article-6-long-residence': {
      const years = simplified.article6ResidenceYears;
      a6(
        'long-residence',
        continuous(residenceStart, years),
        '第6条第3号',
        `连续在日本有居所满 ${years} 年。`,
        `Have continuous residence in Japan for ${years} years.`,
      );
      break;
    }
    case 'article-8-japanese-child':
      a8Check(
        'japanese-child',
        route.biologicalChildOfJapaneseNational,
        '第8条第1号',
        '日本国民的非养子女，现有日本住所。',
        'Be a non-adopted child of a Japanese national with current Japanese domicile.',
      );
      break;
    case 'article-8-adopted-child': {
      const years = simplified.article8AdoptionYears;
      a8Check(
        'adopted-child',
        all(
          route.adoptedByJapaneseNational,
          route.adoptedWhileMinorUnderHomeLaw,
          continuous(domicileStart, years),
        ),
        '第8条第2号',
        `由日本国民收养，收养时依本国法未成年，并连续日本住所满 ${years} 年。`,
        `Be adopted by a Japanese national while a minor under home law, with ${years} year of continuous Japanese domicile.`,
      );
      break;
    }
    case 'article-8-former-national':
      a8Check(
        'former-national',
        all(
          route.lostJapaneseNationality,
          route.lostAfterNaturalising === undefined
            ? undefined
            : !route.lostAfterNaturalising,
        ),
        '第8条第3号',
        '曾失去日本国籍且现有日本住所，排除归化后失籍。',
        'Have lost Japanese nationality, other than following naturalisation, and have current Japanese domicile.',
      );
      break;
    case 'article-8-stateless-from-birth': {
      const years = simplified.article8StatelessYears;
      a8Check(
        'stateless-from-birth',
        all(
          route.bornInJapan,
          route.statelessSinceBirth,
          route.domiciledContinuouslySinceBirth,
          req.dateOfBirth ? continuous(req.dateOfBirth, years) : undefined,
        ),
        '第8条第4号',
        `在日本出生、从出生起无国籍、自出生起连续日本住所满 ${years} 年。`,
        `Be born in Japan, stateless since birth, and continuously domiciled in Japan since birth for at least ${years} years.`,
      );
      break;
    }
    case 'article-9-special-merit':
      c(
        'special-merit',
        '对日特別功労与国会承认',
        'Special merit and approval of the Diet',
        all(route.specialMeritConfirmed, route.dietApproval),
        [law('第9条')],
        '须由主管方面认定特別功労并获国会承认。',
        'Official recognition of special merit and approval of the Diet are required.',
        ['PD-378'],
      );
      break;
  }
  if (pilot && history.abroad)
    values.push(
      fromPilot(
        'jp.nat.filing-in-japan',
        L('在日本递交', 'Filing in Japan'),
        pilot.checks.at(-1)!,
        ['PD-139'],
      ),
    );
  else
    c(
      'filing-in-japan',
      '在日本递交',
      'Filing in Japan',
      history.abroad ? false : e.inJapan,
      [
        ref('SRC-112', '行政機関の休日に関する法律 第1条'),
        ref('SRC-117', 'Q10', 'https://www.moj.go.jp/MINJI/minji78.html#a10'),
      ],
      '确认本人或法定代理人在住所辖区的日本法务局递交。',
      'Confirm filing in Japan at the competent bureau by the applicant or legal representative.',
      ['PD-139'],
    );
  const preserveTime = !e.domicileFrom && !e.residenceFrom;
  return assemblePathway(
    `jp.nat.${route.route}`,
    L(...titles[route.route]),
    date,
    values,
    L,
    preserveTime ? timePilot : undefined,
    e.japaneseCitizen === true,
  );
}
