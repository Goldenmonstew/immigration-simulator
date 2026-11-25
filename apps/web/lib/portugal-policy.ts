import type { Locale } from '@uk-immigration/engine';
import {
  portugal2026_11,
  portugalFull2026_11,
  type SourceRef,
} from '@uk-immigration/policy-data';
import { t, type TranslationKey } from '../i18n';
import { PT_TARGETS, ptPathwayByTarget } from './portugal-fields';
import { portugalRules } from './portugal-policy-rules';
import {
  withPolicySources,
  type PolicyParameterValue,
  type PolicyRuleSet,
} from './policy';

const title = (key: TranslationKey) => ({ 'zh-CN': t(key), en: t(key, 'en') });
const change = (
  key: 'nationality' | 'ari' | 'blueCard' | 'fee',
  parameter: { sources: readonly SourceRef[] },
  date: string,
) => ({
  date,
  title: t(`pt.policy.${key}Change`),
  titleEn: t(`pt.policy.${key}Change`, 'en'),
  summary: t(`pt.policy.${key}Summary`),
  summaryEn: t(`pt.policy.${key}Summary`, 'en'),
  sources: [...parameter.sources],
});

const time = portugal2026_11.values;
const full = portugalFull2026_11.values;
const values = { ...time, ...full };
const set: PolicyRuleSet = {
  id: 'pt.current-law',
  title: title('pt.policy.title'),
  kind: 'LAW',
  status: 'CURRENT_LAW',
  sources: [
    { srcId: 'SRC-120', locator: 'Lei 37/81 arts. 3, 6, 9–10, 15' },
    {
      srcId: 'SRC-123',
      locator: 'Lei 23/2007 arts. 75–91, 98–103, 121-I, 125–131',
    },
    { srcId: 'SRC-478', locator: 'Lei 37/2006 arts. 2–3, 6–17, 21–24, 29' },
  ],
};

// Fields of the nested parameters, with EUR amounts (fees to the cent) and
// shares shown as percentages.
type Field = readonly [TranslationKey, ('eur' | 'fee' | 'share')?];
const opposition: Record<string, Field> = {
  relationship: ['pt.param.oppositionRelationship'],
  period: ['pt.param.oppositionPeriod'],
};
const fields: Record<string, Record<string, Field>> = {
  oldPortugueseEvidence: {
    schoolYears: ['pt.param.schoolYears'],
    dualCertificateHours: ['pt.param.dualCertificateHours'],
    accommodatedAge: ['pt.param.accommodatedAge'],
  },
  adultNationalityFee: {
    from: ['pt.param.from'],
    eur: ['pt.param.amount', 'fee'],
  },
  panFees: {
    from: ['pt.param.from'],
    registration: ['pt.param.panRegistration', 'fee'],
    inspection: ['pt.param.panInspection', 'fee'],
    review: ['pt.param.panReview', 'fee'],
  },
  householdWeights: {
    firstAdult: ['pt.param.firstAdult', 'share'],
    otherAdult: ['pt.param.otherAdult', 'share'],
    dependant: ['pt.param.dependant', 'share'],
  },
  purposeMeans: {
    ordinaryMonths: ['pt.param.meansMonths'],
    housingFactor: ['pt.param.housingFactor', 'share'],
    housingAndMealsFactor: ['pt.param.housingAndMealsFactor', 'share'],
  },
  incomeEvidenceMonths: {
    employee: ['pt.param.employeeEvidence'],
    serviceContract: ['pt.param.serviceEvidence'],
  },
  minimumWage2026: {
    mainland: ['pt.option.region.mainland', 'eur'],
    from: ['pt.param.from'],
    until: ['pt.param.until'],
  },
  generalRefusal: {
    prisonYears: ['pt.param.refusalPrisonYears'],
    repeatedSentences: ['pt.param.refusalConvictions'],
  },
  blueCard: {
    from: ['pt.param.from'],
    euYears: ['pt.param.blueEuYears'],
    portugalYears: ['pt.param.bluePortugalYears'],
    singleAbsenceMonths: ['pt.param.blueSingleAbsence'],
    totalAbsenceMonths: ['pt.param.blueTotalAbsence'],
    lossEuMonths: ['pt.param.blueLoss'],
  },
  ariDocumentAge: {
    otherCountryYears: ['pt.param.otherCountryYears'],
    criminalMonths: ['pt.param.criminalMonths'],
    complianceDays: ['pt.param.complianceDays'],
  },
  ariFund: {
    eur: ['pt.param.minimumTransfer', 'eur'],
    maturityYears: ['pt.param.fundMaturity'],
    portugalShare: ['pt.param.fundPortugalShare', 'share'],
  },
  ariCompany: {
    eur: ['pt.param.minimumCapital', 'eur'],
    permanentJobs: ['pt.param.permanentJobs'],
    maintainedJobs: ['pt.param.maintainedJobs'],
    jobYears: ['pt.param.jobYears'],
  },
  ariLowDensity: {
    reduction: ['pt.param.lowDensityReduction', 'share'],
    peoplePerKm2: ['pt.param.peoplePerKm2'],
    gdpShare: ['pt.param.gdpShare', 'share'],
  },
  ariHistoricalInvestment: {
    capitalEur: ['pt.param.capitalTransfer', 'eur'],
    propertyEur: ['pt.param.propertyPurchase', 'eur'],
    renovationEur: ['pt.param.renovation', 'eur'],
    buildingYears: ['pt.param.buildingYears'],
  },
  freeMovementAbsence: {
    ordinaryMonths: ['pt.param.yearlyAbsence'],
    ordinaryWindowYears: ['pt.param.absenceWindowYears'],
    justifiedMonths: ['pt.param.justifiedMonths'],
    maxJustifiedAbsences: ['pt.param.justifiedAbsences'],
    lossYears: ['pt.param.lossYears'],
  },
  freeMovementRegistration: {
    initialMonths: ['pt.param.initialMonths'],
    registrationDays: ['pt.param.registrationDays'],
  },
  workerEarlyResidence: {
    workMonths: ['pt.param.workMonths'],
    retirementResidenceYears: ['pt.param.retirementResidenceYears'],
    disabilityResidenceYears: ['pt.param.disabilityResidenceYears'],
    crossBorderYears: ['pt.param.crossBorderYears'],
    selfEmployedAge: ['pt.param.selfEmployedAge'],
  },
  oppositionYears: opposition,
  oldOppositionYears: opposition,
  aimaFeeDates: { from: ['pt.param.from'], until: ['pt.param.until'] },
  aimaFeeReductions: {
    eligibleDigital: ['pt.param.digitalReduction', 'share'],
    assistedInPerson: ['pt.param.assistedReduction', 'share'],
  },
  freeMovementFees: {
    from: ['pt.param.from'],
    age: ['pt.param.ageBoundary'],
    infantAge: ['pt.param.infantAge'],
    olderDigital: ['pt.param.olderDigital', 'fee'],
    olderInPerson: ['pt.param.olderInPerson', 'fee'],
    youngerDigital: ['pt.param.youngerDigital', 'fee'],
    youngerInPerson: ['pt.param.youngerInPerson', 'fee'],
    infantInPerson: ['pt.param.infantInPerson', 'fee'],
    urgentOlder: ['pt.param.urgentOlder', 'fee'],
    urgentYounger: ['pt.param.urgentYounger', 'fee'],
    addressOnly: ['pt.option.feeMode.address-only', 'fee'],
  },
};
const routes = ['cplp', 'eu', 'eea', 'other', 'stateless'] as const;
// Each AIMA charge has the published left and right columns.
const feeTables = [
  'aimaOrdinaryFees',
  'aimaBlueFees',
  'aimaLongTermFees',
  'aimaInvestmentFees',
];

function displayParameter(
  name: string,
  locale: Locale,
): PolicyParameterValue | undefined {
  const label = (key: TranslationKey) => t(key, locale);
  const format = (value: number | string, unit?: Field[1]) =>
    typeof value === 'string' || !unit
      ? value
      : unit === 'share'
        ? value.toLocaleString(locale, { style: 'percent' })
        : `EUR ${value.toLocaleString(
            locale,
            unit === 'fee'
              ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              : {},
          )}`;
  const value = (values as Record<string, { value: unknown }>)[name]
    ?.value as Record<string, number | string | readonly number[]>;
  if (name === 'nationalityYears' || name === 'nationalityIntervalYears')
    return routes.map((route) => ({
      [label('pt.field.route')]: label(`pt.option.route.${route}`),
      [label('pt.param.years')]: value[route] as number,
    }));
  if (feeTables.includes(name))
    return Object.entries(value).map(([item, amounts]) => {
      const [left, right] =
        typeof amounts === 'number' ? [amounts, amounts] : amounts;
      return {
        [label('pt.param.feeItem')]: label(
          `pt.param.fee.${item}` as TranslationKey,
        ),
        [label('pt.option.feeColumn.left')]: format(left, 'fee'),
        [label('pt.option.feeColumn.right')]: format(right, 'fee'),
      };
    });
  const layout = fields[name];
  if (!layout) return undefined;
  return Object.fromEntries(
    Object.entries(layout).map(([field, [key, unit]]) => [
      label(key),
      format(value[field] as number | string, unit),
    ]),
  );
}

export const portugalPolicy = withPolicySources({
  ruleSets: [set],
  displayedRuleSets: [set],
  pathways: PT_TARGETS.map((target) => ({
    id: ptPathwayByTarget[target],
    title: title(`pt.target.${target}`),
  })),
  parameters: {
    [set.id]: {
      asOf: portugalFull2026_11.asOf,
      ruleSetId: set.id,
      values,
    },
  },
  rules: { [set.id]: portugalRules },
  displayParameter,
  changelog: [
    change('nationality', time.lawInForce, time.lawInForce.value),
    change('fee', full.aimaFeeDates, full.aimaFeeDates.value.from),
    change('blueCard', full.blueCard, full.blueCard.value.from),
    change('ari', full.ariInvestmentReform, full.ariInvestmentReform.value),
  ],
});
