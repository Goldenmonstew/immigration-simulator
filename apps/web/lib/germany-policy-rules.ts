import type { RuleMeta } from '@uk-immigration/engine';
import {
  germany2026_11,
  germanyFull2026_11,
  type SourceRef,
} from '@uk-immigration/policy-data';
import { germanyConditionTitles } from '../i18n/countries/germany-module';

const time = germany2026_11.values;
const full = germanyFull2026_11.values;
const ref = (srcId: string, locator: string, url?: string): SourceRef => ({
  srcId,
  locator,
  url,
});
const aufenthG = (locator: string) => ref('SRC-100', locator);
const stAG = (locator: string) => ref('SRC-101', locator);

function rule(
  id: keyof typeof germanyConditionTitles,
  sources: readonly SourceRef[],
  pendingDetails: string[] = [],
): RuleMeta {
  const [title, titleEn] = germanyConditionTitles[id];
  return {
    id,
    title,
    titleEn,
    sources: [...sources],
    pendingDetails,
    ruleSetId: germanyFull2026_11.ruleSetId,
  };
}

export const germanyRules: RuleMeta[] = [
  rule('DE-C01', [aufenthG('§§ 3, 5 Abs. 1 Nr. 1a, 4, 80, 81')], ['PD-340']),
  rule('DE-C01-procedure', [aufenthG('§§ 81, 82 Abs. 1, 4–5')], ['PD-340']),
  rule(
    'DE-C02',
    [aufenthG('§ 5 Abs. 2–3; § 26 Abs. 3'), ref('SRC-410', '§§ 39, 41')],
    ['PD-340'],
  ),
  rule(
    'DE-C03',
    [
      aufenthG('§§ 2 Abs. 3, 5 Abs. 1 Nr. 1, 9 Abs. 2; 9c'),
      ref('SRC-415', 'Voraussetzungen / Erforderliche Unterlagen'),
      ...full.monthlyNeeds2026.sources,
      ref('SRC-435', '1 C 21.09, Leitsätze; 1 C 12.10, Leitsatz'),
    ],
    ['PD-341', 'PD-342'],
  ),
  rule(
    'DE-C04',
    [
      aufenthG('§ 2 Abs. 3 Sätze 1, 3; § 9 Abs. 2 Satz 6; § 9c Satz 1 Nr. 3'),
      ref('SRC-415', 'Krankenversicherung'),
    ],
    ['PD-343'],
  ),
  rule(
    'DE-C05',
    [aufenthG('§ 9 Abs. 2 Satz 1 Nr. 3, Satz 6, Abs. 3; § 104 Abs. 2')],
    ['PD-344', 'PD-349'],
  ),
  rule(
    'DE-C06',
    [
      aufenthG(
        '§§ 5 Abs. 1 Nr. 2–3, Abs. 4, 9 Abs. 2 Nr. 4, 9a Abs. 2 Nr. 5, 54, 58a, 73, 79',
      ),
    ],
    ['PD-345'],
  ),
  rule('DE-C06-authority', [aufenthG('§§ 73 Abs. 2, 79 Abs. 2')], ['PD-345']),
  rule(
    'DE-C07',
    [
      aufenthG('§ 9 Abs. 2 Satz 1 Nr. 5–6, Abs. 3 Satz 1; §§ 18c, 26'),
      ref('SRC-107', 'Nr. 18c.1.1.5, Druckseite 117'),
    ],
    ['PD-346'],
  ),
  rule(
    'DE-C08',
    [
      aufenthG(
        '§§ 2 Abs. 9–12, 9 Abs. 2 Nr. 7 und Sätze 2–5, 18c, 26 Abs. 3, 28 Abs. 2, 104 Abs. 2',
      ),
    ],
    ['PD-347', 'PD-349'],
  ),
  rule(
    'DE-C09',
    [
      aufenthG('§ 9 Abs. 2 Nr. 8, Sätze 2–5; §§ 9a, 18c, 26, 104 Abs. 2'),
      ref('SRC-412', '§ 17 Abs. 1–2'),
      ...full.orientationPass.sources,
    ],
    ['PD-347', 'PD-349'],
  ),
  rule(
    'DE-C10',
    [
      aufenthG('§ 2 Abs. 4; § 9 Abs. 2 Nr. 9; § 9a Abs. 2 Nr. 6'),
      ref('SRC-108', 'Nr. 2.4.0–2.4.3'),
    ],
    ['PD-348'],
  ),
  rule(
    'DE-C11',
    [aufenthG('§§ 71, 81'), ref('SRC-413', 'BMG §§ 17, 19, 27')],
    ['PD-348'],
  ),
  rule(
    'DE-C11-deadline',
    [aufenthG('§§ 71, 81'), ref('SRC-413', 'BMG §§ 17, 19, 27')],
    ['PD-348'],
  ),
  rule('DE-C12', [aufenthG('§ 104 Abs. 1, 2, 5, 7, 8')], ['PD-349']),
  rule(
    'DE-C13',
    [
      ...time.generalYears.sources,
      ...time.abroadCreditMonths.sources,
      ...time.priorSettlementCreditYears.sources,
      ref('SRC-107', 'Nr. 20a.5.7, 20a.6.1–20a.6.2 (p200–p201)'),
    ],
    ['PD-120', 'PD-122'],
  ),
  rule(
    'DE-C15',
    [
      aufenthG('§§ 18 Abs. 3, 18c Abs. 1 Satz 1 Nr. 1, Satz 2'),
      ref('SRC-107', 'Nr. 18c.1.2, p.117'),
    ],
    ['PD-346'],
  ),
  rule(
    'DE-C15-time',
    [...time.skilledYears.sources, ...time.skilledTrainedYears.sources],
    ['PD-122', 'PD-346'],
  ),
  rule(
    'DE-C16',
    [
      aufenthG('§ 18c Abs. 1 Satz 1 Nr. 2; §§ 18a, 18b, 18d, 18g'),
      ref('SRC-430', 'Voraussetzungen: Arbeitsplatz'),
    ],
    ['PD-346'],
  ),
  rule(
    'DE-C16-initial',
    [
      aufenthG('§ 18 Abs. 2 Satz 1 Nr. 1–5, Sätze 2–3'),
      ref('SRC-425', 'BAnz AT 18.12.2025 B2 p.1'),
    ],
    ['PD-346'],
  ),
  rule(
    'DE-C17',
    [
      aufenthG('§ 18c Abs. 1 Satz 1 Nr. 3, Satz 2'),
      ref('SRC-439', 'BGBl. 2023 I Nr. 217 Art. 2 Nr. 12, Art. 12 Abs. 1'),
    ],
    ['PD-344'],
  ),
  rule(
    'DE-C19',
    [aufenthG('§ 18c Abs. 2 Satz 1'), ref('SRC-107', 'Nr. 18c.2.1.1, p117')],
    ['PD-353'],
  ),
  rule(
    'DE-C19-months',
    [
      ...time.blueCardMonths.sources,
      ...time.blueCardB1Months.sources,
      ...time.daysPerMonth.sources,
      ref('SRC-431', 'Voraussetzungen – Beschäftigung'),
      ref('SRC-107', 'Nr. 18c.2.1.1–3, pp117–118'),
      ...full.blueCardReducedPay.sources,
    ],
    ['PD-123', 'PD-350'],
  ),
  rule(
    'DE-C19-time',
    [...time.blueCardMonths.sources, ...time.blueCardB1Months.sources],
    ['PD-123', 'PD-350'],
  ),
  rule('DE-C20', full.blueCardLanguage.sources, ['PD-347']),
  rule(
    'DE-C21-job',
    [
      aufenthG('§§ 18 Abs. 2, 18g Abs. 1–4, 19f Abs. 1–2, 82 Abs. 1'),
      ref('SRC-107', 'Nr. 18c.2.1.1–2, pp117–118'),
      ref('SRC-107', 'Nr. 18g.4.0, 18g.4.2–4, pp150–151'),
    ],
    ['PD-346'],
  ),
  rule(
    'DE-C21-pay',
    [
      ...full.blueCardStandardPay.sources,
      ...full.blueCardReducedPay.sources,
      ...full.blueCardJob.sources,
    ],
    ['PD-350'],
  ),
  rule(
    'DE-C22',
    [
      aufenthG('§ 28 Abs. 1–3'),
      ref('SRC-108', 'Nr. 28.2.3, p.165'),
      ref('SRC-427', 'Voraussetzungen'),
    ],
    ['PD-352'],
  ),
  rule('DE-C22-time', time.germanFamilyYears.sources, ['PD-120', 'PD-352']),
  rule(
    'DE-C24-title',
    [aufenthG('§§ 26 Abs. 3 Sätze 1, 3, 6, 104 Abs. 5')],
    ['PD-351'],
  ),
  rule(
    'DE-C24-notice',
    [
      aufenthG('§ 26 Abs. 3 Satz 1 Nr. 2, Satz 3 Nr. 2'),
      ...full.protectionPriorNoticeFrom.sources,
      ...full.protectionNoticeFrom.sources,
    ],
    ['PD-351'],
  ),
  rule(
    'DE-C25',
    [
      aufenthG('§ 26 Abs. 3 Satz 1 Nr. 3, Satz 2'),
      ref(
        'SRC-428',
        'Voraussetzungen: Gesicherter Lebensunterhalt durch eigenes Einkommen',
      ),
      ref('SRC-423', 'SGB VI §§ 35 Satz 2, 235 Abs. 2'),
    ],
    ['PD-351'],
  ),
  rule(
    'DE-C25-time',
    [
      ...time.refugeeYears.sources,
      ...time.abroadCreditMonths.sources,
      aufenthG('§ 26 Abs. 3 Satz 6; § 104 Abs. 5'),
    ],
    ['PD-126', 'PD-351'],
  ),
  rule(
    'DE-C26',
    [
      aufenthG('§ 26 Abs. 3 Satz 3 Nr. 4, Satz 4'),
      ref(
        'SRC-428',
        'Voraussetzungen: Gesicherter Lebensunterhalt durch eigenes Einkommen',
      ),
      ref('SRC-423', 'SGB VI §§ 35 Satz 2, 235 Abs. 2'),
    ],
    ['PD-351'],
  ),
  rule(
    'DE-C26-time',
    [
      ...time.refugeeC1Years.sources,
      ...time.abroadCreditMonths.sources,
      aufenthG('§ 26 Abs. 3 Satz 6; § 104 Abs. 5'),
    ],
    ['PD-126', 'PD-351'],
  ),
  rule(
    'DE-C27',
    [aufenthG('§ 9a Abs. 3 Nr. 1–5'), ref('SRC-437', 'Art. 3–4')],
    ['PD-353'],
  ),
  rule(
    'DE-C28',
    [
      ...time.euLongTermYears.sources,
      ...time.euSingleAbsenceMonths.sources,
      ...time.euTotalAbsenceMonths.sources,
      ...full.euMobility.sources,
    ],
    ['PD-125', 'PD-353'],
  ),
  rule(
    'DE-C29-income',
    [
      aufenthG('§§ 9a Abs. 2 Satz 1 Nr. 2, 9c Satz 1'),
      ref('SRC-108', 'Nr. 9a.2.1.2'),
    ],
    ['PD-341'],
  ),
  rule(
    'DE-C29-tax',
    [aufenthG('§ 9c Satz 1 Nr. 1'), ref('SRC-108', 'Nr. 9c.1.1')],
    ['PD-341'],
  ),
  rule(
    'DE-C29-work',
    [aufenthG('§ 9c Satz 1 Nr. 4, Satz 2'), ref('SRC-108', 'Nr. 9c.1.4')],
    ['PD-346'],
  ),
  rule(
    'DE-C30-pension',
    [aufenthG('§ 9c Satz 1 Nr. 2, Satz 3'), ref('SRC-429', 'Altersversorgung')],
    ['PD-344'],
  ),
  rule(
    'DE-C30-care',
    [aufenthG('§ 9c Satz 1 Nr. 3'), ref('SRC-429', 'Krankenversicherung')],
    ['PD-343'],
  ),
  rule(
    'DE-C32-title',
    [aufenthG('§ 26 Abs. 4 Satz 1'), ref('SRC-416', 'Voraussetzungen')],
    ['PD-354'],
  ),
  rule(
    'DE-C32-time',
    [aufenthG('§§ 26 Abs. 4 Sätze 1, 3, 9 Abs. 2 Satz 1 Nr. 1')],
    ['PD-126'],
  ),
  rule(
    'DE-C32-discretion',
    [aufenthG('§ 26 Abs. 4 Satz 1'), ref('SRC-416', 'Voraussetzungen')],
    ['PD-354'],
  ),
  rule(
    'DE-C34-title',
    [aufenthG('§ 21 Abs. 4–6'), ref('SRC-417', 'Voraussetzungen')],
    ['PD-354'],
  ),
  rule('DE-C34-time', full.businessYears.sources, ['PD-354']),
  rule('DE-C34-initial', [aufenthG('§ 21 Abs. 1–3')], ['PD-354']),
  rule(
    'DE-C35-business',
    [
      aufenthG('§ 21 Abs. 4 Satz 2'),
      ref('SRC-417', 'Erforderliche Unterlagen'),
    ],
    ['PD-354'],
  ),
  rule('DE-C35-discretion', full.businessYears.sources, ['PD-354']),
  rule(
    'DE-C36-title',
    [
      aufenthG('§§ 35 Abs. 1, 26 Abs. 3 Satz 5, Abs. 4 Satz 4'),
      ref('SRC-418', 'Voraussetzungen'),
    ],
    ['PD-355'],
  ),
  rule('DE-C36-time', full.childSettlement.sources, ['PD-355']),
  rule(
    'DE-C36-language',
    [aufenthG('§§ 35 Abs. 1 Satz 2 Nr. 2, Abs. 4, 2 Abs. 11')],
    ['PD-347'],
  ),
  rule(
    'DE-C36-livelihood',
    [aufenthG('§ 35 Abs. 1 Satz 2 Nr. 3, Abs. 4')],
    ['PD-355'],
  ),
  rule(
    'DE-C37-conduct',
    [aufenthG('§ 35 Abs. 3 Satz 1 Nr. 1–2, Sätze 2–3')],
    ['PD-345'],
  ),
  rule(
    'DE-C37-aid',
    [aufenthG('§ 35 Abs. 3 Satz 1 Nr. 3, Satz 2, Abs. 4')],
    ['PD-355'],
  ),
  rule('DE-C38-family', [aufenthG('§ 9 Abs. 3a Satz 1 Nr. 1')], ['PD-352']),
  rule('DE-C38-time', full.skilledSpouse.sources, ['PD-355']),
  rule(
    'DE-C38-work',
    [...full.skilledSpouse.sources, ref('SRC-107', 'Nr. 9.3a')],
    ['PD-355'],
  ),
  rule(
    'DE-C39-post',
    [
      aufenthG('§§ 18 Abs. 3 Nr. 2, 18c Abs. 3 Sätze 1, 3'),
      ref('SRC-107', 'Nr. 18c.3'),
      ref('SRC-430', 'Voraussetzungen'),
    ],
    ['PD-356'],
  ),
  rule('DE-C39-consent', [aufenthG('§ 18c Abs. 3 Satz 2')], ['PD-356']),
  rule('DE-C40', [aufenthG('§ 18c Abs. 3 Satz 1')], ['PD-356']),
  rule('DE-C41-appointment', [aufenthG('§ 19c Abs. 4 Satz 1')], ['PD-356']),
  rule('DE-C41-time', full.civilServiceYears.sources, ['PD-356']),
  rule(
    'DE-C42-family',
    [aufenthG('§§ 28 Abs. 3, 31 Abs. 3'), ref('SRC-108', 'Nr. 31.3.1–4')],
    ['PD-352'],
  ),
  rule(
    'DE-C42-maintenance',
    [aufenthG('§ 31 Abs. 3'), ref('SRC-108', 'Nr. 31.3.1–4')],
    ['PD-355'],
  ),
  rule(
    'DE-C42-time',
    [
      aufenthG('§§ 9 Abs. 2 Satz 1 Nr. 1, 31 Abs. 3'),
      ...time.generalYears.sources,
      ref('SRC-108', 'Nr. 31.3.1–4'),
    ],
    ['PD-120', 'PD-352'],
  ),
  rule('DE-C43', [ref('SRC-422', '§§ 1–4, 4a Abs. 1, 5, § 12')], ['PD-357']),
  rule('DE-C44', [ref('SRC-422', '§§ 2–4, § 4a Abs. 1–6')], ['PD-357']),
  rule(
    'DE-C45',
    [ref('SRC-422', '§ 4a Abs. 7, § 5 Abs. 5–6, § 6 Abs. 1–5')],
    ['PD-345', 'PD-357'],
  ),
  rule(
    'DE-C46',
    [
      stAG('§§ 8 Abs. 1, 10 Abs. 1 Satz 1, 34'),
      ref('SRC-106', 'Nr. 10.1.0; Nr. 10.1 Rdn. 137'),
    ],
    ['PD-340'],
  ),
  rule(
    'DE-C46-application',
    [stAG('§§ 8 Abs. 1, 10 Abs. 1 Satz 1')],
    ['PD-340'],
  ),
  rule(
    'DE-C47',
    [
      stAG('§§ 10 Abs. 1 Satz 1 Nr. 2, 12b, 16'),
      ref('SRC-106', 'Nr. 10.1.2 Rdn. 59'),
    ],
    ['PD-122'],
  ),
  rule(
    'DE-C48',
    [
      stAG('§ 10 Abs. 1 Satz 1 Nr. 1, 1a, Sätze 2–3; § 11'),
      ref('SRC-106', 'Nr. 10.1.1 Rdn. 14; Rdn. 137'),
    ],
    ['PD-358'],
  ),
  rule(
    'DE-C49',
    [
      stAG('§ 10 Abs. 1 Satz 1 Nr. 3a–c; § 40a'),
      ref('SRC-106', 'Nr. 10.1.3 Rdn. 61–121'),
    ],
    ['PD-358'],
  ),
  rule(
    'DE-C50',
    [
      stAG('§ 10 Abs. 1 Nr. 6, Abs. 4, 4a, 6'),
      ref('SRC-106', 'Nr. 10.4, 10.4a, 10.6'),
    ],
    ['PD-347'],
  ),
  rule(
    'DE-C51',
    [
      stAG('§ 10 Abs. 1 Nr. 7, Satz 2, Abs. 5–7'),
      ...full.citizenshipKnowledgeTest.sources,
      ref('SRC-414', 'Nachweis der staatsbürgerlichen Kenntnisse'),
    ],
    ['PD-347'],
  ),
  rule(
    'DE-C52',
    [
      stAG('§§ 8 Abs. 1 Nr. 2, Abs. 2; 10 Abs. 1 Nr. 5; 12a Abs. 1–4'),
      ...full.citizenshipConvictions.sources,
      ref('SRC-424', 'BZRG §§ 46, 51, 52'),
    ],
    ['PD-345'],
  ),
  rule(
    'DE-C53',
    [stAG('§§ 11 Satz 1 Nr. 1–3, 37'), aufenthG('§ 54 Abs. 1 Nr. 2, 4')],
    ['PD-345'],
  ),
  rule(
    'DE-C54',
    [
      stAG('§ 16 Sätze 1–3; § 10 Abs. 1 Satz 2'),
      ref('SRC-105', 'Art. 1 Nr. 6, Art. 6 Abs. 1'),
    ],
    ['PD-358'],
  ),
  rule(
    'DE-C55',
    [
      ...time.naturalisationYears.sources,
      ...time.naturalisationAbsenceMonths.sources,
      ...time.priorResidenceCreditYears.sources,
      ...time.turboAbolishedFrom.sources,
      ref('SRC-103', 'AsylG § 55 Abs. 3'),
      ref('SRC-105', 'BT-Drs. 20/9044 (p39)'),
    ],
    ['PD-127', 'PD-128', 'PD-129'],
  ),
  rule(
    'DE-C56',
    [
      stAG('§ 9 Abs. 1 Sätze 1–4, Abs. 2'),
      ref('SRC-106', 'Nr. 9.0–9.1 Rdn. 1–8 (pp41–43)'),
    ],
    ['PD-352'],
  ),
  rule(
    'DE-C56-time',
    [
      ...time.naturalisationYears.sources,
      ...time.spouseMarriageYears.sources,
      ref('SRC-103', 'AsylG § 55 Abs. 3'),
      ref('SRC-105', 'BT-Drs. 20/9044 (p39)'),
    ],
    ['PD-128', 'PD-359'],
  ),
  rule(
    'DE-C57',
    [stAG('§ 9 Abs. 2'), ref('SRC-106', 'Nr. 9.2 Rdn. 9–10 (p43)')],
    ['PD-352'],
  ),
  rule(
    'DE-C58',
    [
      stAG('§ 10 Abs. 2; § 9 Abs. 1 Satz 3'),
      ...full.citizenshipFamilyGuidance.sources,
    ],
    ['PD-359'],
  ),
  rule(
    'DE-C58-guidance',
    [
      stAG('§ 10 Abs. 2; § 9 Abs. 1 Satz 3'),
      ...full.citizenshipFamilyGuidance.sources,
    ],
    ['PD-359'],
  ),
  rule(
    'DE-C58-decision',
    [
      stAG('§ 10 Abs. 2; § 9 Abs. 1 Satz 3'),
      ...full.citizenshipFamilyGuidance.sources,
    ],
    ['PD-359'],
  ),
  rule(
    'DE-C59',
    [stAG('§ 8 Abs. 1 Nr. 3'), ref('SRC-106', 'Nr. 8.1.1')],
    ['PD-348'],
  ),
  rule(
    'DE-C60',
    [
      stAG('§ 8 Abs. 1 Nr. 4, Abs. 2'),
      ref('SRC-106', 'Nr. 8.1.1 Rdn. 13–19; Nr. 8.2 Rdn. 69 ff.'),
    ],
    ['PD-341'],
  ),
  rule(
    'DE-C61-guidance',
    [ref('SRC-106', 'Nr. 8.1.2 Rdn. 20–37 (pp24–28)')],
    ['PD-359'],
  ),
  rule(
    'DE-C62',
    [stAG('§ 8 Abs. 1'), ref('SRC-106', 'Nr. 8.1.2, Nr. 8.2')],
    ['PD-359'],
  ),
  rule('DE-C63', [aufenthG('§ 51 Abs. 1–4, 7, 9–10; § 81 Abs. 4')], ['PD-353']),
  rule(
    'DE-C63-time',
    [
      ...time.lapseMonths.sources,
      ...time.blueCardLapseMonths.sources,
      ...time.euLapseMonths.sources,
      ...time.euLapseYears.sources,
    ],
    ['PD-124', 'PD-353'],
  ),
  rule(
    'DE-C63-current',
    [aufenthG('§§ 51 Abs. 1–4, 7, 9–10, 81 Abs. 4')],
    ['PD-124', 'PD-353'],
  ),
  rule(
    'DE-C64-settlement',
    [
      aufenthG('§ 51 Abs. 1–4, 10'),
      ref('SRC-108', 'Nr. 51.1.6.6–7, pp236–237'),
    ],
    ['PD-124', 'PD-353'],
  ),
  rule(
    'DE-C64-eu-long-term',
    [
      aufenthG('§ 51 Abs. 9 Sätze 1–2, Abs. 2–4'),
      ref('SRC-108', 'Nr. 51.1.6.6–7, pp236–237'),
    ],
    ['PD-124', 'PD-353'],
  ),
  rule(
    'DE-C65',
    [...full.settlementFees.sources, ...full.feeScheduleFrom.sources],
    ['PD-359'],
  ),
  rule(
    'DE-C65-advance',
    [...full.settlementFees.sources, ...full.feeScheduleFrom.sources],
    ['PD-359'],
  ),
  rule(
    'DE-C65-express',
    [
      ...full.expressFee.sources,
      ...full.expressFrom.sources,
      ...full.settlementFees.sources,
    ],
    ['PD-359'],
  ),
  rule(
    'DE-C65-paid',
    [...full.settlementFees.sources, ...full.feeScheduleFrom.sources],
    ['PD-359'],
  ),
  rule(
    'DE-C66',
    [...full.settlementFees.sources, ...full.feeScheduleFrom.sources],
    ['PD-359'],
  ),
  rule(
    'DE-C66-advance',
    [...full.settlementFees.sources, ...full.feeScheduleFrom.sources],
    ['PD-359'],
  ),
  rule(
    'DE-C66-express',
    [
      ...full.expressFee.sources,
      ...full.expressFrom.sources,
      ...full.settlementFees.sources,
    ],
    ['PD-359'],
  ),
  rule(
    'DE-C66-paid',
    [...full.settlementFees.sources, ...full.feeScheduleFrom.sources],
    ['PD-359'],
  ),
  rule(
    'DE-C67',
    [
      ref('SRC-410', '§§ 52 Abs. 3–4, 7, 52a, 53'),
      ...full.identityCardFees.sources,
      ref('SRC-438', 'BGBl. 2026 I Nr. 111 Art. 7 Nr. 2, Art. 13 Abs. 2'),
    ],
    ['PD-359'],
  ),
  rule(
    'DE-C68',
    [
      ref('SRC-410', '§ 47 Abs. 3, § 45c'),
      ...full.identityCardFees.sources,
      ...full.feeScheduleFrom.sources,
    ],
    ['PD-359'],
  ),
  rule(
    'DE-C68-paid',
    [
      ref('SRC-410', '§ 47 Abs. 3, § 45c'),
      ...full.identityCardFees.sources,
      ...full.feeScheduleFrom.sources,
    ],
    ['PD-359'],
  ),
  rule(
    'DE-C69',
    [
      ...full.naturalisationFees.sources,
      ...full.naturalisationFeesFrom.sources,
    ],
    ['PD-359'],
  ),
  rule(
    'DE-C69-review',
    [
      ...full.naturalisationFees.sources,
      ...full.naturalisationFeesFrom.sources,
    ],
    ['PD-359'],
  ),
  rule(
    'DE-C69-paid',
    [
      ...full.naturalisationFees.sources,
      ...full.naturalisationFeesFrom.sources,
    ],
    ['PD-359'],
  ),
  rule('DE-C70', full.testFee.sources, ['PD-359']),
  rule(
    'DE-C71',
    [
      ...full.integrationCourseShare.sources,
      ...full.externalOrientationFee.sources,
      ref('SRC-412', '§ 17 Abs. 3, 5'),
    ],
    ['PD-359'],
  ),
  rule(
    'DE-C71-exemption',
    [
      ...full.integrationCourseShare.sources,
      ...full.pensionCeiling2026.sources,
    ],
    ['PD-359'],
  ),
];
