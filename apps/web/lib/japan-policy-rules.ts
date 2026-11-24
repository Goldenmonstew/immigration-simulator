import type { RuleMeta } from '@uk-immigration/engine';
import {
  japan2026_11,
  japanFull2026_11,
  japanImmigrationGuidance,
  type SourceRef,
} from '@uk-immigration/policy-data';
import { japanConditionTitles } from '../i18n/countries/japan-module';

const time = japan2026_11.values;
const full = japanFull2026_11.values;
const ref = (srcId: string, locator: string, url?: string): SourceRef => ({
  srcId,
  locator,
  url,
});
const guideline = (locator: string) =>
  ref('SRC-114', locator, 'https://www.moj.go.jp/isa/content/001471577.pdf');

function rule(
  id: keyof typeof japanConditionTitles,
  sources: readonly SourceRef[],
  pendingDetails: string[] = [],
): RuleMeta {
  const [title, titleEn] = japanConditionTitles[id];
  return {
    id,
    title,
    titleEn,
    sources: [...sources],
    pendingDetails,
    ruleSetId: japanFull2026_11.ruleSetId,
  };
}

const nationalityQ9 = ref(
  'SRC-117',
  'Q9',
  'https://www.moj.go.jp/MINJI/minji78.html#a09',
);

const prTaxSources = [
  ...full.evidenceYears.sources,
  ref('SRC-113', '1(3)イ'),
  guideline('第2の5(3) (p6)'),
];
const natResidencePracticeSources = [
  ...time.naturalisationPracticeYears.sources,
  ...time.naturalisationPracticeFrom.sources,
];
const natTaxSources = [
  nationalityQ9,
  ref('SRC-118', '参議院法務委員会 No.120'),
  ref('SRC-459', '納税・社会保険料'),
];
const reentryRefugeeDocumentSources = [
  ref('SRC-110', '第61条の2の15第1・3–9項'),
  ref(
    'SRC-461',
    '難民旅行証明書 第3・4節（有効期間・延長）',
    'https://www.moj.go.jp/isa/refugee/procedures/ryokou_00001.html#midashi03',
  ),
];

export const japanRules = [
  rule(
    'jp.pr.continuous-stay',
    [
      ...full.exceptionalPr.sources,
      ...time.spouseStayYears.sources,
      ...time.prStayYears.sources,
      ...time.teijushaYears.sources,
      ...time.refugeeYears.sources,
      ...time.highlySkilledYears.sources,
      ...full.jSkip.sources,
    ],
    ['PD-130', 'PD-136', 'PD-374', 'PD-375'],
  ),
  rule(
    'jp.pr.qualifying-status-stay',
    [...time.prStatusYears.sources, guideline('第2の4(2) 注2 (p5)')],
    ['PD-130'],
  ),
  rule(
    'jp.pr.old-guideline-absences',
    [ref('SRC-113', '1(3)ア, 2')],
    ['PD-130'],
  ),
  rule('jp.pr.single-absence', time.singleAbsenceMonths.sources, ['PD-360']),
  rule('jp.pr.total-absence', time.totalAbsenceMonths.sources, ['PD-360']),
  rule(
    'jp.pr.filing-in-japan',
    [ref('SRC-110', '第22条第1項'), ref('SRC-119', '申請提出者')],
    ['PD-130'],
  ),
  rule(
    'jp.pr.lawful-filing-status',
    [
      ref('SRC-119', '申請期間・申請提出者・必要書類'),
      ref('SRC-110', '第20条第6項、第22条、第22条の2'),
    ],
    ['PD-130', 'PD-136'],
  ),
  rule('jp.pr.longest-period', full.longestPeriod.sources, ['PD-369']),
  rule(
    'jp.pr.good-conduct',
    [
      ref('SRC-110', '第22条第2項'),
      ref('SRC-113', '1(1)–(3)'),
      ref('SRC-441', '第22条第2項'),
      guideline('第2の3 (p3–4)'),
    ],
    ['PD-365'],
  ),
  rule(
    'jp.pr.criminal-record',
    [ref('SRC-113', '1(1)–(3)'), guideline('第2の5(4) (p6)')],
    ['PD-365'],
  ),
  rule(
    'jp.pr.national-interest',
    [
      ref('SRC-110', '第22条第2項'),
      ref('SRC-113', '1(1)–(3)'),
      ref('SRC-441', '第22条第2項'),
      guideline('第1の1、第2の5(1)(11) (p2, p5–6, p9)'),
    ],
    ['PD-360'],
  ),
  rule(
    'jp.pr.immigration-duties',
    [
      ...full.immigrationDuties.sources,
      ref('SRC-113', '1(1)–(3)'),
      guideline('第2の5(2) (p6)'),
    ],
    ['PD-366'],
  ),
  rule('jp.pr.tax', prTaxSources, ['PD-366']),
  rule('jp.pr.pension-payments', prTaxSources, ['PD-366']),
  rule('jp.pr.public-health-insurance', prTaxSources, ['PD-366']),
  rule('jp.pr.address-registration', full.immigrationDuties.sources, [
    'PD-366',
  ]),
  rule(
    'jp.pr.independent-livelihood',
    [
      ref('SRC-110', '第22条第2項'),
      ref('SRC-110', '第61条の2の14'),
      ref('SRC-113', '1(1)–(3)'),
      ref('SRC-441', '第22条第2項'),
      guideline('第2の4(1) (p4)'),
    ],
    ['PD-361'],
  ),
  rule('jp.pr.household-income', full.incomeReview.sources, ['PD-361']),
  rule('jp.pr.projected-pension', full.pensionComparisonYears.sources, [
    'PD-362',
  ]),
  rule('jp.pr.public-burden', full.incomeReview.sources, ['PD-363']),
  rule(
    'jp.pr.public-health',
    [
      ref('SRC-110', '第5条第1項第1–3号'),
      ref('SRC-113', '1(1)–(3)'),
      guideline('第2の5(1)(5) (p6–7)'),
    ],
    ['PD-367'],
  ),
  rule(
    'jp.pr.landing-and-security',
    [ref('SRC-110', '第5条第1項第4–14号及插号'), guideline('第2の5(5) (p6–7)')],
    ['PD-365', 'PD-367'],
  ),
  rule(
    'jp.pr.status-criteria',
    [
      ...full.businessManager.sources,
      ref('SRC-113', '1(1)–(3)'),
      ref('SRC-458', '特定活動告示'),
      guideline('第2の5(5) 注3 (p7)'),
    ],
    ['PD-368'],
  ),
  rule(
    'jp.pr.guarantor',
    [
      ref('SRC-440', '第22条第1項第3号・但書、第24条第4項'),
      japanImmigrationGuidance.guarantor,
      ref('SRC-119', '申請期間・申請提出者・必要書類'),
    ],
    ['PD-370'],
  ),
  rule('jp.pr.japanese-language', full.prLanguage.sources, ['PD-364']),
  rule(
    'jp.pr.life-rules',
    [guideline('第2の5(9) (p8)'), ref('SRC-456', '生活・就労ガイドブック')],
    ['PD-364'],
  ),
  rule(
    'jp.pr.school-attendance',
    [...full.schoolAge.sources, guideline('第2の5(10) (p8–9)')],
    ['PD-371'],
  ),
  rule(
    'jp.pr.filing-documents',
    [
      ...full.prFiling.sources,
      ref('SRC-119', '申請期間・申請提出者・必要書類'),
    ],
    ['PD-370'],
  ),
  rule('jp.pr.approval-fee', full.fees.sources),
  rule('jp.pr.fee-reduction', full.fees.sources, ['PD-372']),
  rule(
    'jp.pr.integrated-card-fee',
    [
      ref('SRC-443', '第3条の3、第25条第5項'),
      ref('SRC-457', '手数料'),
      ref('SRC-119', '手数料注4'),
    ],
    ['PD-372'],
  ),
  rule(
    'jp.pr.special-permission',
    [ref('SRC-110', '第12・50条'), guideline('第3 注5 (p10)')],
    ['PD-367', 'PD-369'],
  ),
  rule('jp.pr.married-life', time.spouseMarriageYears.sources, ['PD-135']),
  rule(
    'jp.pr.qualifying-family',
    [
      ref('SRC-110', '第22条第2項'),
      ref('SRC-113', '2(1)'),
      ref('SRC-450', '配偶者・実子等'),
      ref('SRC-441', '第22条第2項'),
      guideline('第3の1 (p9)'),
    ],
    ['PD-135', 'PD-373'],
  ),
  rule(
    'jp.pr.birth-filing-window',
    [
      ...time.nationalHolidays.sources,
      ...time.birthAcquisitionDays.sources,
      ...time.birthStayWithoutStatusDays.sources,
      ...time.yearEndClosureFrom.sources,
    ],
    ['PD-160'],
  ),
  rule(
    'jp.pr.birth-acquisition',
    [
      ref('SRC-110', '第22条の2・第22条の3'),
      ref('SRC-111', '第2条'),
      ref('SRC-451', '在留資格取得・新生児'),
    ],
    ['PD-373', 'PD-160'],
  ),
  rule('jp.pr.birth-registration', [ref('SRC-447', '第49条')], ['PD-373']),
  rule('jp.pr.long-term-resident', time.teijushaYears.sources, ['PD-374']),
  rule(
    'jp.pr.recognised-protection',
    [...time.refugeeYears.sources, ref('SRC-110', '第61条の2・第61条の2の14')],
    ['PD-374'],
  ),
  rule(
    'jp.pr.hsp-current-points',
    [...time.highlySkilledYears.sources, ...full.hsp.sources],
    ['PD-375'],
  ),
  rule(
    'jp.pr.hsp-history',
    [
      ...time.highlySkilledYears.sources,
      ...full.hsp.sources,
      ref('SRC-450', '永住申請4、高度人材ポイント別の案内'),
    ],
    ['PD-375'],
  ),
  rule('jp.pr.j-skip-current', full.jSkip.sources, ['PD-375']),
  rule('jp.pr.j-skip-history', full.jSkip.sources, ['PD-375']),
  rule(
    'jp.pr.international-protection',
    [
      ref('SRC-110', '第22条第2項'),
      ref('SRC-440', '第22条第4項'),
      ref('SRC-441', '第22条第2項'),
    ],
    ['PD-374'],
  ),
  rule('jp.pr.regional-regeneration', full.exceptionalPr.sources, ['PD-374']),
  rule('jp.pr.structural-zone', full.exceptionalPr.sources, ['PD-374']),
  rule('jp.pr.recognised-contribution', full.exceptionalPr.sources, ['PD-374']),
  rule(
    'jp.nat.foreign-national',
    [ref('SRC-111', '第2–4・17条'), nationalityQ9],
    ['PD-377'],
  ),
  rule(
    'jp.nat.lawful-domicile',
    [ref('SRC-111', '第5–8条'), nationalityQ9],
    ['PD-139'],
  ),
  rule('jp.nat.domicile-years', time.naturalisationYears.sources, [
    'PD-130',
    'PD-138',
    'PD-139',
  ]),
  rule(
    'jp.nat.age-and-capacity',
    [...time.naturalisationAge.sources, ...time.naturalisationAgeFrom.sources],
    ['PD-161', 'PD-377'],
  ),
  rule(
    'jp.nat.good-conduct',
    [
      ref('SRC-111', '第5条第1項第3号'),
      nationalityQ9,
      ref('SRC-445', '帰化のてびき「運転記録証明書」'),
    ],
    ['PD-376'],
  ),
  rule(
    'jp.nat.livelihood',
    [
      ref('SRC-111', '第5条第1項第4号'),
      nationalityQ9,
      ref('SRC-445', '帰化のてびき「生計」「事業」'),
    ],
    ['PD-377'],
  ),
  rule(
    'jp.nat.nationality-loss',
    [
      ref('SRC-111', '第5条第1項第5号・第2項'),
      nationalityQ9,
      ref('SRC-445', '帰化のてびき「国籍喪失等」'),
    ],
    ['PD-377'],
  ),
  rule(
    'jp.nat.nationality-loss-exception',
    [ref('SRC-111', '第5条第2項'), nationalityQ9],
    ['PD-377'],
  ),
  rule(
    'jp.nat.constitutional-condition',
    [ref('SRC-111', '第5条第1項第6号'), nationalityQ9],
    ['PD-376'],
  ),
  rule('jp.nat.residence-practice', natResidencePracticeSources, [
    'PD-137',
    'PD-138',
    'PD-139',
  ]),
  rule('jp.nat.integration', natResidencePracticeSources, ['PD-137', 'PD-364']),
  rule(
    'jp.nat.japanese-language',
    [
      nationalityQ9,
      ref('SRC-445', '東京法務局第2節、帰化のてびき「日本語試験の結果等」'),
    ],
    ['PD-364'],
  ),
  rule(
    'jp.nat.interview-and-assessment',
    [
      ref('SRC-118', '参議院答弁書「三について」'),
      ref('SRC-445', '審査基準・静岡地方法務局「国籍相談・面接」'),
    ],
    ['PD-364'],
  ),
  rule('jp.nat.tax', natTaxSources, ['PD-376']),
  rule('jp.nat.pension-payments', natTaxSources, ['PD-376']),
  rule('jp.nat.public-health-insurance', natTaxSources, ['PD-376']),
  rule(
    'jp.nat.housing-and-health-evidence',
    [
      ref('SRC-111', '第5条第1項第1・3・4号'),
      ref('SRC-445', '帰化のてびき「住民票」「医療保険」'),
    ],
    ['PD-377'],
  ),
  rule(
    'jp.nat.motivation-and-oath',
    [
      ref('SRC-446', '第2条第3項'),
      ref('SRC-445', '帰化のてびき「動機書」「宣誓」'),
    ],
    ['PD-364'],
  ),
  rule(
    'jp.nat.filing-and-documents',
    [
      ref('SRC-111', '第18条'),
      ref('SRC-446', '第2条'),
      ref('SRC-445', '帰化許可申請「提出方法」「提出先」'),
    ],
    ['PD-370'],
  ),
  rule('jp.nat.application-fee', [ref('SRC-445', '帰化許可申請「手数料」')]),
  rule(
    'jp.nat.gazette-and-family-registration',
    [ref('SRC-111', '第10条'), ref('SRC-447', '第102条の2')],
    ['PD-370'],
  ),
  rule(
    'jp.nat.filing-in-japan',
    [
      ref('SRC-112', '行政機関の休日に関する法律 第1条'),
      ref('SRC-117', 'Q10', 'https://www.moj.go.jp/MINJI/minji78.html#a10'),
    ],
    ['PD-139'],
  ),
  rule('jp.nat.spouse-article-7', time.spouseNaturalisationYears.sources, [
    'PD-137',
    'PD-138',
    'PD-139',
  ]),
  rule(
    'jp.nat.former-national-child',
    [ref('SRC-111', '第6条第1号')],
    ['PD-137', 'PD-138', 'PD-139'],
  ),
  rule(
    'jp.nat.japan-birth',
    [ref('SRC-111', '第6条第2号'), ref('SRC-460', '第6条第2号（p3）')],
    ['PD-138', 'PD-139', 'PD-373'],
  ),
  rule(
    'jp.nat.long-residence',
    [ref('SRC-111', '第6条第3号')],
    ['PD-137', 'PD-138', 'PD-139'],
  ),
  rule(
    'jp.nat.japanese-child',
    [ref('SRC-111', '第8条第1号')],
    ['PD-137', 'PD-138', 'PD-139', 'PD-377'],
  ),
  rule(
    'jp.nat.adopted-child',
    [ref('SRC-111', '第8条第2号')],
    ['PD-137', 'PD-138', 'PD-139', 'PD-377'],
  ),
  rule(
    'jp.nat.former-national',
    [ref('SRC-111', '第8条第3号')],
    ['PD-137', 'PD-138', 'PD-139', 'PD-377'],
  ),
  rule(
    'jp.nat.stateless-from-birth',
    [ref('SRC-111', '第8条第4号')],
    ['PD-137', 'PD-138', 'PD-139', 'PD-377'],
  ),
  rule('jp.nat.special-merit', [ref('SRC-111', '第9条')], ['PD-378']),
  rule(
    'jp.reentry.ordinary-eligibility',
    [
      ref('SRC-110', '第26条'),
      japanImmigrationGuidance.ordinaryReentry,
      ref('SRC-461', '再入国許可申請「審査基準」「必要書類」'),
      ref('SRC-461', '再入国許可申請「申請期間」'),
      ref('SRC-461', '再入国許可申請「受付時間」'),
      ref('SRC-112', '行政機関の休日に関する法律第1条第1項'),
      ref('SRC-461', '再入国許可申請「オンライン申請」'),
    ],
    ['PD-370', 'PD-379'],
  ),
  rule(
    'jp.reentry.ordinary-validity',
    [
      ...full.reentry.sources,
      ...time.renewalPendingMonths.sources,
      ref('SRC-110', '第26条'),
      japanImmigrationGuidance.ordinaryReentry,
      ref('SRC-461', '再入国許可申請「審査基準」「必要書類」'),
    ],
    ['PD-136', 'PD-379'],
  ),
  rule(
    'jp.reentry.online-application',
    [
      ref('SRC-455', '在留申請オンラインシステムの対象・再入国許可'),
      ref('SRC-461', 'オンライン申請'),
    ],
    ['PD-379'],
  ),
  rule(
    'jp.reentry.return-continuity',
    [
      ...time.renewalPendingMonths.sources,
      ref('SRC-110', '第26条'),
      japanImmigrationGuidance.ordinaryReentry,
      ref('SRC-461', '再入国許可申請「審査基準」「必要書類」'),
      japanImmigrationGuidance.lossOfPermanentResidence,
      ref('SRC-110', '第19条の3・第26条の2'),
      ref('SRC-440', '第29条の4、別表第2「永住者」'),
      ref('SRC-442', '第23条第2項'),
      japanImmigrationGuidance.deemedQuestions,
      japanImmigrationGuidance.deemedReentry,
      ...reentryRefugeeDocumentSources,
    ],
    ['PD-136', 'PD-379'],
  ),
  rule('jp.reentry.travel-fee', full.fees.sources, ['PD-379']),
  rule(
    'jp.reentry.consular-extension-fee',
    [ref('SRC-462', '政令第1条第1項第5・6号、省令別表第5・6行')],
    ['PD-379'],
  ),
  rule(
    'jp.reentry.deemed-eligibility',
    [
      ref('SRC-110', '第19条の3・第26条の2'),
      ref('SRC-440', '第29条の4、別表第2「永住者」'),
      ref('SRC-442', '第23条第2項'),
      japanImmigrationGuidance.deemedQuestions,
      japanImmigrationGuidance.deemedReentry,
    ],
    ['PD-379'],
  ),
  rule(
    'jp.reentry.deemed-validity',
    [
      ...time.renewalPendingMonths.sources,
      ref('SRC-110', '第19条の3・第26条の2'),
      ref('SRC-440', '第29条の4、別表第2「永住者」'),
      ref('SRC-442', '第23条第2項'),
      japanImmigrationGuidance.deemedQuestions,
      japanImmigrationGuidance.deemedReentry,
    ],
    ['PD-136', 'PD-379'],
  ),
  rule('jp.reentry.refugee-document', reentryRefugeeDocumentSources, [
    'PD-379',
  ]),
  rule('jp.reentry.refugee-document-validity', reentryRefugeeDocumentSources, [
    'PD-379',
  ]),
];
