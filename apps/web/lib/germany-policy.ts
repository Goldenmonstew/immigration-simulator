import { DE_FULL_ROUTES, type Locale } from '@uk-immigration/engine';
import { germanyFull2026_11 } from '@uk-immigration/policy-data';
import { t, type TranslationKey } from '../i18n';
import { punct } from '../i18n/punctuation';
import {
  germanyParameterLabels as labels,
  germanyParameterText as text,
} from '../i18n/countries/germany-module';
import { germanyRules } from './germany-policy-rules';
import {
  withPolicySources,
  type PolicyParameterValue,
  type PolicyRuleSet,
} from './policy';

function title(key: TranslationKey) {
  return { 'zh-CN': t(key), en: t(key, 'en') };
}

const full = germanyFull2026_11;
const v = full.values;
const values: Record<string, { value: unknown }> = v;

// Amounts that stand alone, rather than inside a labelled parameter.
const amounts: Record<string, 'eur' | 'eurYear'> = {
  pensionCeiling2026: 'eurYear',
  expressFee: 'eur',
  extensionFee: 'eur',
  testFee: 'eur',
  externalOrientationFee: 'eur',
};

// Show nested parameters as labelled rows with units, and euro amounts with
// their currency, instead of raw keys and bare arrays.
function displayParameter(
  name: string,
  locale: Locale,
): PolicyParameterValue | undefined {
  const say = (pair: readonly [string, string]) =>
    pair[locale === 'en' ? 1 : 0];
  const format = (value: number, unit: keyof typeof text.unit) => {
    const n =
      unit === 'share'
        ? String(Math.round(value * 1000) / 10)
        : unit === 'calendarYear'
          ? String(value)
          : value.toLocaleString(locale, {
              minimumFractionDigits:
                unit.startsWith('eur') && !Number.isInteger(value) ? 2 : 0,
            });
    return say(text.unit[unit])
      .replace('{n}', n)
      .replace('{n:s}', value === 1 ? '' : 's');
  };
  const column = (pair: readonly [string, string], n?: number) =>
    say(pair).replace('{n}', String(n));
  const amount = amounts[name];
  if (amount) return format(values[name].value as number, amount);
  if (name === 'blueCardShortageGroups' || name === 'blueCardItGroups')
    return say(text.isco).replace(
      '{list}',
      v[name].value.join(punct(locale).list),
    );
  if (name === 'blueCardLanguage')
    return [v.blueCardMonths.value, v.blueCardB1Months.value].map(
      (months, i) => ({
        [say(text.item)]: column(text.blueCardTrack, months),
        [say(text.value)]: v.blueCardLanguage.value[i],
      }),
    );
  if (name === 'blueCardStandardPay' || name === 'blueCardReducedPay')
    return Object.entries(v[name].value).map(([year, pay]) => ({
      [say(text.year)]: year,
      [say(text.annualPay)]: format(pay, 'eur'),
    }));
  if (name === 'retirementAdditionalMonths')
    return Object.entries(v.retirementAdditionalMonths.value).map(
      ([year, months]) => ({
        [say(text.birthYear)]: year,
        [column(text.addedMonths, v.retirementAge.value.earlierYears)]: format(
          months,
          'months',
        ),
      }),
    );
  const items = labels[name];
  if (items)
    return Object.entries(values[name].value as Record<string, number>).map(
      ([key, value]) => ({
        [say(text.item)]: say([items[key][0], items[key][1]]),
        [say(text.value)]: format(value, items[key][2]),
      }),
    );
}
const set: PolicyRuleSet = {
  id: full.ruleSetId,
  title: title('de.policy.title'),
  kind: 'LAW',
  status: 'CURRENT_LAW',
  sources: [
    {
      srcId: 'SRC-100',
      locator: 'AufenthG §§ 9, 9a–9c, 18c, 21, 26, 28, 31, 35, 51',
    },
    { srcId: 'SRC-101', locator: 'StAG §§ 8–12b, 16, 38, 40a' },
    { srcId: 'SRC-422', locator: 'FreizügG/EU §§ 2–6' },
  ],
};

export const germanyPolicy = withPolicySources({
  ruleSets: [set],
  displayedRuleSets: [set],
  pathways: DE_FULL_ROUTES.map((route) => ({
    id: `DE-${route}`,
    title: title(`de.route.${route}` as TranslationKey),
  })),
  parameters: { [set.id]: full },
  rules: { [set.id]: germanyRules },
  displayParameter,
  changelog: [
    {
      date: v.skilledCurrentFrom.value,
      title: t('de.policy.skilledChange'),
      titleEn: t('de.policy.skilledChange', 'en'),
      summary: t('de.policy.skilledSummary'),
      summaryEn: t('de.policy.skilledSummary', 'en'),
      sources: v.skilledCurrentFrom.sources,
    },
    {
      date: v.fiveYearsFrom.value,
      title: t('de.policy.starmodgChange'),
      titleEn: t('de.policy.starmodgChange', 'en'),
      summary: t('de.policy.starmodgSummary'),
      summaryEn: t('de.policy.starmodgSummary', 'en'),
      sources: v.fiveYearsFrom.sources,
    },
    {
      date: v.turboAbolishedFrom.value,
      title: t('de.policy.turboChange'),
      titleEn: t('de.policy.turboChange', 'en'),
      summary: t('de.policy.turboSummary'),
      summaryEn: t('de.policy.turboSummary', 'en'),
      sources: v.turboAbolishedFrom.sources,
    },
    {
      date: v.cardFeesFrom.value,
      title: t('de.policy.cardFeeChange'),
      titleEn: t('de.policy.cardFeeChange', 'en'),
      summary: t('de.policy.cardFeeSummary'),
      summaryEn: t('de.policy.cardFeeSummary', 'en'),
      sources: v.cardFeesFrom.sources,
    },
    {
      date: v.protectionNoticeFrom.value,
      title: t('de.policy.protectionNoticeChange'),
      titleEn: t('de.policy.protectionNoticeChange', 'en'),
      summary: t('de.policy.protectionNoticeSummary'),
      summaryEn: t('de.policy.protectionNoticeSummary', 'en'),
      sources: v.protectionNoticeFrom.sources,
    },
  ],
});
