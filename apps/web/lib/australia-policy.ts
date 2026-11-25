import { AU_FULL_PATHWAYS, type Locale } from '@uk-immigration/engine';
import { australiaFull2026_11 } from '@uk-immigration/policy-data';
import { t, type TranslationKey } from '../i18n';
import { australiaRules } from './australia-policy-rules';
import {
  withPolicySources,
  type PolicyParameterValue,
  type PolicyRuleSet,
} from './policy';

function title(key: TranslationKey) {
  return { 'zh-CN': t(key), en: t(key, 'en') };
}

const full = australiaFull2026_11;
const v = full.values;

const set: PolicyRuleSet = {
  id: full.ruleSetId,
  title: title('au.policy.title'),
  kind: 'LAW',
  status: 'CURRENT_LAW',
  sources: [
    { srcId: 'SRC-200', locator: 'Volumes 1–3, Schedules 1, 2, 4, 5, 6D, 8' },
    { srcId: 'SRC-069', locator: 'ss 41, 46, 48, 82, 104' },
    { srcId: 'SRC-211', locator: 's 501' },
    { srcId: 'SRC-061', locator: 'ss 21–28' },
  ],
};

const tariffs = [
  'employer',
  'independent',
  'nominated',
  'regional',
  'regionalHk',
  'partner',
  'currentProspectiveMarriage',
  'formerProspectiveMarriage',
  'innovation',
] as const;
// Schedule 2 score tables list the Competent, Proficient and Superior levels in order.
const levels = ['Competent', 'Proficient', 'Superior'];

function mapValues<T, U>(
  record: Readonly<Record<string, T>>,
  f: (value: T) => U,
) {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, f(value)]),
  );
}

// Show Schedule 6D bands, test score tables and family charges by meaning.
function displayParameter(
  name: string,
  locale: Locale,
): PolicyParameterValue | undefined {
  const label = (key: TranslationKey) => t(key, locale);
  const money = (amount: number) => `AUD ${amount.toLocaleString(locale)}`;
  const bands = (rows: readonly (readonly number[])[], from: TranslationKey) =>
    rows.map(([minimum, points]) => ({
      [label(from)]: minimum,
      [label('au.policy.points')]: points,
    }));
  const scores = (rows: readonly (readonly number[])[]) =>
    rows.map(([listening, reading, writing, speaking], i) => ({
      [label('au.policy.level')]: levels[i],
      [label('au.policy.listening')]: listening,
      [label('au.policy.reading')]: reading,
      [label('au.policy.writing')]: writing,
      [label('au.policy.speaking')]: speaking,
    }));
  if (name === 'skilledPoints') {
    const points = v.skilledPoints.value;
    return {
      ...points,
      ageBands: bands(points.ageBands, 'au.policy.minAge'),
      overseasMonths: bands(points.overseasMonths, 'au.policy.minMonths'),
      australianMonths: bands(points.australianMonths, 'au.policy.minMonths'),
    };
  }
  if (name === 'skilledEnglish') {
    const english = v.skilledEnglish.value;
    const { oet, ...legacy } = english.legacy;
    return {
      ...english,
      current: mapValues(english.current, scores),
      legacy: {
        ...mapValues(legacy, scores),
        oet: oet.map((grade, i) => ({
          [label('au.policy.level')]: levels[i],
          [label('au.policy.lowestGrade')]: grade,
        })),
      },
      // Overall scores, not amounts.
      functional: mapValues(english.functional, String),
      legacyFunctional: mapValues(english.legacyFunctional, String),
    };
  }
  const tariff = tariffs.find((id) => id === name);
  if (tariff) {
    const rate = v[tariff].value;
    const row = (category: TranslationKey, amounts: readonly number[]) => ({
      [label('au.policy.category')]: label(category),
      [label('au.policy.primary')]: money(amounts[0]),
      [label('au.policy.additionalAdult')]: money(amounts[1]),
      [label('au.policy.additionalMinor')]: money(amounts[2]),
    });
    return {
      [label('au.policy.firstInstalment')]: [
        row('au.policy.standardRate', rate.standard),
        row('au.policy.pacificRate', rate.pacific),
      ],
      // 186 charges the primary applicant a separate second instalment.
      [label('au.policy.secondInstalment')]:
        tariff === 'employer'
          ? {
              [label('au.policy.primary')]: money(
                v.employerPrimarySecond.value,
              ),
              [label('au.policy.additionalAdult')]: money(rate.second),
            }
          : money(rate.second),
    };
  }
  if (name === 'returnVisa') {
    const rate = v.returnVisa.value;
    return {
      [label('au.policy.standardRate')]: money(rate.standard),
      [label('au.policy.pacificRate')]: money(rate.pacific),
      [label('au.policy.paperSurcharge')]: money(rate.nonInternet),
    };
  }
  if (name === 'employerPrimarySecond')
    return {
      [label('au.policy.secondInstalment')]: {
        [label('au.policy.primary')]: money(v.employerPrimarySecond.value),
      },
    };
}

export const australiaPolicy = withPolicySources({
  ruleSets: [set],
  displayedRuleSets: [set],
  pathways: AU_FULL_PATHWAYS.map((id) => ({
    id,
    title: title(`au.pathway.${id}` as TranslationKey),
  })),
  parameters: { [set.id]: full },
  rules: { [set.id]: australiaRules },
  displayParameter,
  changelog: [
    {
      date: v.hongKongStreamsFrom.value,
      title: t('au.policy.hkChange'),
      titleEn: t('au.policy.hkChange', 'en'),
      summary: t('au.policy.hkSummary'),
      summaryEn: t('au.policy.hkSummary', 'en'),
      sources: v.hongKongStreamsFrom.sources,
    },
    {
      date: v.regionalApplicationsFrom.value,
      title: t('au.policy.regionalChange'),
      titleEn: t('au.policy.regionalChange', 'en'),
      summary: t('au.policy.regionalSummary'),
      summaryEn: t('au.policy.regionalSummary', 'en'),
      sources: v.regionalApplicationsFrom.sources,
    },
    {
      date: v.scvFrom.value,
      title: t('au.policy.scvChange'),
      titleEn: t('au.policy.scvChange', 'en'),
      summary: t('au.policy.scvSummary'),
      summaryEn: t('au.policy.scvSummary', 'en'),
      sources: v.scvFrom.sources,
    },
    {
      date: v.skilledEnglish.value.newTestsFrom,
      title: t('au.policy.englishChange'),
      titleEn: t('au.policy.englishChange', 'en'),
      summary: t('au.policy.englishSummary'),
      summaryEn: t('au.policy.englishSummary', 'en'),
      sources: v.skilledEnglish.sources,
    },
    {
      date: v.effectiveFrom.value,
      title: t('au.policy.feeChange'),
      titleEn: t('au.policy.feeChange', 'en'),
      summary: t('au.policy.feeSummary'),
      summaryEn: t('au.policy.feeSummary', 'en'),
      sources: [
        ...v.effectiveFrom.sources,
        { srcId: 'SRC-214', locator: 'Core Skills Income Threshold' },
        { srcId: 'SRC-221', locator: 'Current visa pricing' },
      ],
    },
  ],
});
