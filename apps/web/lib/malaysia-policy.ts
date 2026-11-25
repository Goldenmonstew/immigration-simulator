import {
  evaluateMalaysiaFull,
  type Locale,
  type MyFullRequest,
  type RuleMeta,
} from '@uk-immigration/engine';
import {
  malaysiaFull2026_11 as full,
  type SourceRef,
} from '@uk-immigration/policy-data';
import { t, type TranslationKey } from '../i18n';
import type { myZh } from '../i18n/countries/malaysia';
import { MY_TARGETS, myPathwayByTarget } from './malaysia-fields';
import {
  withPolicySources,
  type PolicyParameterValue,
  type PolicyRuleSet,
} from './policy';

const ruleSetId = full.ruleSetId;
const values = full.values;
const title = (key: TranslationKey) => ({ 'zh-CN': t(key), en: t(key, 'en') });

// Answer sets that together reach every source and pending detail each
// condition cites (a unit test checks them against random answers). Each
// set assesses all fifteen routes.
const date = full.asOf;
const answered: MyFullRequest = {
  simulationDate: date,
  dateOfBirth: '1980-01-01',
  nationality: 'US',
  passportExpiry: '2030-01-01',
  passes: [{ kind: 'employment', from: '2015-01-01', to: '2028-12-31' }],
  trips: [],
  family: {
    tie: 'wife-of-citizen',
    marriedOn: '2015-01-01',
    marriageRegistration: 'malaysia',
    separated: false,
    divorced: false,
  },
  citizenSponsor: true,
  residencePassSponsor: true,
  citizenReferees: 2,
  immigrationRecord: 'clear',
  criminalRecord: 'none',
  previousPrRefusalOn: null,
  evidence: { applicantIncome: true },
  language: { malay: 'good', english: 'good' },
  was: { regulatorRecognition: true, citizenSponsor: true },
  rep: {
    relation: 'wife',
    participantHasSatk: true,
    approvalLetterValidUntil: '2027-01-01',
    marriedBeforeRepApplication: true,
    participantSponsor: true,
    referees: 2,
  },
  citizenship: {
    permanentResidentSince: '2010-01-01',
    intendsToResidePermanently: 'yes',
    qualifyingReferees: 2,
    renounceOtherNationality: 'yes',
    completeTravelRecords: true,
    taxReturnsFiveYears: true,
    inFederationOnMerdekaDay: false,
  },
  mm2h: {
    category: 'gold',
    fromCountryWithDiplomaticRelations: true,
    viaLicensedOperator: true,
    fixedDepositUsd: 500_000,
    propertyValueRm: 1_000_000,
    daysPerYear: 90,
    goodConductCertificates: true,
    healthInsurance: true,
    dependants: 0,
    needsToWork: false,
  },
  work: { basicMonthlySalaryRm: 25_000 },
  rpt: { taxYearsPaid: 3, qualification: true, totalExperienceYears: 10 },
  deRantau: {
    talent: 'non-tech',
    annualIncomeUsd: 80_000,
    workType: 'remote-employee',
    employerRegisteredInMalaysia: false,
    contractStart: '2025-01-01',
    dependants: 0,
  },
};
const samples: MyFullRequest[] = [
  { simulationDate: date },
  answered,
  // Open answers that name a pending detail: a marriage registered abroad,
  // a reported separation, an adopted child, pass breaks and Residence Pass
  // time, minister's consent for residence, an undecided oath.
  {
    ...answered,
    nationality: 'JP',
    passes: [
      { kind: 'ltsvp-spouse', from: '2019-01-01', to: '2021-12-31' },
      { kind: 'ltsvp-spouse', from: '2022-04-01', to: '2024-03-31' },
      { kind: 'residence', from: '2024-04-01', to: '2029-03-31' },
    ],
    trips: [
      { departed: '2020-01-01', returned: '2021-06-01', reason: 'education' },
    ],
    family: {
      tie: 'husband-of-citizen',
      marriedOn: '2015-01-01',
      marriageRegistration: 'foreign-only',
      separated: true,
      divorced: false,
      childRelation: 'adopted',
    },
    citizenship: {
      ...answered.citizenship,
      permanentResidentSince: null,
      renounceOtherNationality: 'unsure',
      inFederationOnMerdekaDay: undefined,
    },
    rep: { ...answered.rep, relation: 'child' },
    mm2h: { ...answered.mm2h, category: 'sez', daysPerYear: 30 },
    deRantau: {
      ...answered.deRantau,
      talent: 'tech',
      annualIncomeUsd: 36_000,
      workType: 'freelancer',
    },
    work: { basicMonthlySalaryRm: 5_000 },
  },
  {
    ...answered,
    simulationDate: '2026-05-01',
    dateOfBirth: '2008-05-01',
    nationality: 'IL',
    passes: [
      { kind: 'ltsvp-spouse', from: '2025-01-01', to: '2026-12-31' },
      { kind: 'student', from: '2020-01-01', to: '2026-12-31' },
    ],
    family: { tie: 'child-of-citizen', childRelation: 'adopted' },
    previousPrRefusalOn: '2026-01-01',
    rep: { relation: 'husband' },
    citizenship: { renounceOtherNationality: 'no' },
    mm2h: { category: 'silver' },
  },
  // A reported separation, MM2H stays short of the days at 50 or over, and
  // pass time that only adds up across a break.
  {
    ...answered,
    dateOfBirth: '1970-01-01',
    passes: [
      { kind: 'ltsvp-spouse', from: '2022-01-01', to: '2023-12-31' },
      { kind: 'ltsvp-spouse', from: '2026-06-01', to: '2028-05-31' },
      { kind: 'student', from: '2020-01-01', to: '2021-06-30' },
      { kind: 'student', from: '2026-06-01', to: '2028-05-31' },
    ],
    family: { ...answered.family, separated: true, divorced: false },
    mm2h: { ...answered.mm2h, daysPerYear: 30 },
  },
  {
    ...answered,
    family: { tie: 'child-of-pr' },
    passes: [
      { kind: 'employment', from: '2021-09-01', to: '2023-11-30' },
      { kind: 'employment', from: '2024-05-01', to: '2027-12-31' },
    ],
    immigrationRecord: 'listed',
    criminalRecord: 'convicted',
    rep: { relation: 'none' },
  },
];

function catalogue() {
  const rules = new Map<string, RuleMeta & { titles: Set<string>[] }>();
  for (const request of samples) {
    const [zh, en] = (['zh-CN', 'en'] as const).map(
      (locale) => evaluateMalaysiaFull({ ...request, locale }).columns[0],
    );
    zh.pathways.forEach((pathway, p) =>
      pathway.checks.forEach((check, c) => {
        const rule = rules.get(check.id) ?? {
          id: check.id,
          title: '',
          titleEn: '',
          sources: [],
          pendingDetails: [],
          ruleSetId,
          titles: [new Set<string>(), new Set<string>()],
        };
        rule.titles[0].add(check.title);
        rule.titles[1].add(en.pathways[p].checks[c].title);
        for (const source of check.sources)
          if (
            !rule.sources.some(
              (known) =>
                known.srcId === source.srcId &&
                known.locator === source.locator,
            )
          )
            rule.sources.push(source);
        for (const pending of check.pendingDetails ?? [])
          if (!rule.pendingDetails.includes(pending))
            rule.pendingDetails.push(pending);
        rules.set(check.id, rule);
      }),
    );
  }
  // A condition titled differently on different routes lists every title.
  return [...rules.values()]
    .map(({ titles: [zh, en], ...rule }): RuleMeta => ({
      ...rule,
      title: [...zh].join('／'),
      titleEn: [...en].join(' / '),
      pendingDetails: rule.pendingDetails.sort(),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

const set: PolicyRuleSet = {
  id: ruleSetId,
  title: title('my.policy.title'),
  kind: 'LAW',
  status: 'CURRENT_LAW',
  sources: [
    { srcId: 'SRC-500', locator: 'Part III、附表一、附表二第三部分' },
    { srcId: 'SRC-503', locator: 's.8(3) p12–14、s.10 p18' },
    { srcId: 'SRC-505', locator: '§§4–15 p17–34' },
  ],
};

type ParamLabel =
  Extract<keyof typeof myZh, `my.param.${string}`> extends `my.param.${infer S}`
    ? S
    : never;
type Unit = 'rm' | 'usd' | 'percent';
type Field = readonly [ParamLabel | TranslationKey, Unit?];

// MM2H amounts and ages by category, named as in the questionnaire.
const category = (
  unit?: Unit,
  names = ['platinum', 'gold', 'silver', 'sez'],
): Record<string, Field> =>
  Object.fromEntries(
    names.map((name) => [
      name,
      [`my.option.mm2hCategory.${name}` as TranslationKey, unit],
    ]),
  );

// Field names of the nested parameters, with their currency or unit.
const fields: Record<string, Record<string, Field>> = {
  prWife: {
    marriageYears: ['marriageYears'],
    ltsvpMonths: ['ltsvpMonthsOver'],
  },
  prHusband: {
    marriageYears: ['marriageYears'],
    ltsvpYears: ['ltsvpYears'],
    maxGapMonths: ['maxGapMonths'],
  },
  prChild: { underAge: ['underAge'], passMonths: ['passMonthsOver'] },
  prWas: {
    passYears: ['passYears'],
    maxGapMonths: ['maxGapMonths'],
    dependantPassMonths: ['dependantPassMonths'],
    childUnderAge: ['childUnderAge'],
  },
  prCollection: {
    approvalValidMonths: ['approvalValidMonths'],
    collectionDays: ['collectionDays'],
  },
  rep: {
    wifeMarriageYears: ['wifeMarriageYears'],
    husbandMarriageYears: ['husbandMarriageYears'],
    childUnderAge: ['childUnderAge'],
    passportMonths: ['passportMonths'],
    referees: ['referees'],
    refereeMinAge: ['refereeMinAge'],
    ltsvpFeePerYearRm: ['ltsvpFeePerYear', 'rm'],
    prFeeRm: ['prFee', 'rm'],
  },
  residencePass: {
    passportMonths: ['passportMonths'],
    citizenFamilyYears: ['citizenFamilyYears'],
    prFamilyYears: ['prFamilyYears'],
    childMaxAge: ['childMaxAge'],
    sponsorMinAge: ['sponsorMinAge'],
    feeRm: ['passFee', 'rm'],
    feeYears: ['feeYears'],
  },
  naturalisation: {
    minAge: ['minAge'],
    residenceYears: ['residenceYears'],
    windowYears: ['windowYears'],
    recentMonths: ['recentMonths'],
    referees: ['referees'],
    refereeMinAge: ['refereeMinAge'],
    refereeKnownYears: ['refereeKnownYears'],
  },
  wifeRegistration: {
    residenceYears: ['residenceYears'],
    dissolutionYears: ['dissolutionYears'],
  },
  childRegistration: { underAge: ['underAge'] },
  citizenshipFeesRm: {
    application: ['applicationFee', 'rm'],
    naturalisationCertificate: ['naturalisationCertificate', 'rm'],
    naturalisationCertificateMerdeka: [
      'naturalisationCertificateMerdeka',
      'rm',
    ],
    merdekaDay: ['merdekaDay'],
    wifeCertificate: ['wifeCertificate', 'rm'],
    childCertificate: ['childCertificate', 'rm'],
  },
  deprivation: {
    withinYears: ['withinYears'],
    prisonMonths: ['prisonMonths'],
    fineRm: ['fine', 'rm'],
    abroadYears: ['abroadYears'],
  },
  constitutionAmendment2025: {
    royalAssent: ['royalAssent'],
    gazetted: ['gazetted'],
    newMinAge: ['newMinAge'],
    oathMonths: ['oathMonths'],
  },
  spouseLtsvp: {
    minMonths: ['minMonths'],
    maxYears: ['maxYears'],
    feePerYearRm: ['passFeePerYear', 'rm'],
  },
  mm2hAge: { ...category(), sezOlderAge: ['sezOlderAge'] },
  mm2hDepositUsd: {
    ...category('usd'),
    sezOlder: ['sezOlder', 'usd'],
    withdrawalPercent: ['withdrawalShare', 'percent'],
  },
  mm2hParticipationFeeRm: category('rm'),
  mm2hProperty: {
    ...category('rm', ['platinum', 'gold', 'silver']),
    resaleYears: ['resaleYears'],
    purchaseYears: ['purchaseYears'],
  },
  mm2hStay: { days: ['days'], exemptAge: ['exemptAge'] },
  mm2hPassYears: category(),
  mm2hRenewalFeeRm: { ...category('rm'), everyYears: ['everyYears'] },
  mm2hDependants: {
    childUnconditionalAge: ['childUnconditionalAge'],
    childMaxAge: ['childMaxAge'],
    childMaxAgeOther: ['childMaxAgeOther'],
  },
  mm2hScreening: {
    minAge: ['conductMinAge'],
    validMonths: ['conductValidMonths'],
    insuranceMaxAge: ['insuranceMaxAge'],
  },
  mm2hPassFeesRm: {
    principalPerYear: ['principalPerYear', 'rm'],
    principalIssuance: ['principalIssuance', 'rm'],
    dependantPerYear: ['dependantPerYear', 'rm'],
    dependantIssuance: ['dependantIssuance', 'rm'],
  },
  mm2hSystemFeeRm: { amount: ['amount', 'rm'], from: ['from'] },
  rpt: {
    workYears: ['workYears'],
    epValidityMonths: ['epValidityMonths'],
    taxYears: ['taxYears'],
    basicSalaryRm: ['basicSalary', 'rm'],
    experienceYears: ['experienceYears'],
    passYears: ['passTermYears'],
    dependantUnderAge: ['childUnderAge'],
  },
  deRantauIncomeUsd: {
    tech: ['techIncome', 'usd'],
    techFrom: ['techFrom'],
    techBefore: ['techBefore', 'usd'],
    nonTech: ['nonTechIncome', 'usd'],
  },
  deRantau: {
    minAge: ['minAge'],
    passportMonths: ['passportMonths'],
    contractMonths: ['contractMonths'],
    maxMonths: ['maxMonths'],
    excludedNationality: ['excludedNationality'],
    initialMinMonths: ['initialMinMonths'],
    initialMaxMonths: ['initialMaxMonths'],
    renewals: ['renewals'],
    renewalMonths: ['renewalMonths'],
    childUnderAge: ['childUnderAge'],
    processingFeeRm: ['processingFee', 'rm'],
    dependantFeeRm: ['dependantFee', 'rm'],
    passFeeQuarterRm: ['passFeeQuarter', 'rm'],
    passFeeQuarterMonths: ['passFeeQuarterMonths'],
    passFeeYearRm: ['passFeePerYear', 'rm'],
  },
  employmentPass: {
    revisedFrom: ['revisedFrom'],
    successionPlanFrom: ['successionPlanFrom'],
    minPassMonths: ['minPassMonths'],
    maxPassMonths: ['maxPassMonths'],
    childUnderAge: ['childUnderAge'],
  },
};
// Amounts payable by nationality (deposit and security bond).
const byNationality: Record<string, Record<string, Field>> = {
  prDepositRm: {
    otherCountries: ['otherCountries', 'rm'],
    refundYears: ['refundYears'],
  },
  securityBondRm: { otherCountries: ['otherCountries', 'rm'] },
};
const amounts = ['prFeeRm'];

function displayParameter(
  name: string,
  locale: Locale,
): PolicyParameterValue | undefined {
  const label = (key: Field[0]) =>
    t((key.includes('.') ? key : `my.param.${key}`) as TranslationKey, locale);
  const format = (value: number | string, unit?: Unit) =>
    typeof value === 'string' || !unit
      ? value
      : unit === 'percent'
        ? `${value}%`
        : `${unit === 'rm' ? 'RM' : 'USD'}\u00a0${value.toLocaleString(locale)}`;
  const regions = new Intl.DisplayNames([locale], { type: 'region' });
  const country = (code: string) =>
    code === 'stateless'
      ? t('my.form.stateless', locale)
      : (regions.of(code) ?? code);
  const value = (values as Record<string, { value: unknown }>)[name]
    ?.value as Record<string, number | string | Record<string, number>>;
  const shown = (layout: Record<string, Field>) =>
    Object.fromEntries(
      Object.entries(layout).map(([field, [key, unit]]) => [
        label(key),
        field === 'excludedNationality'
          ? country(value[field] as string)
          : format(value[field] as number | string, unit),
      ]),
    );
  const table = (rates: Record<string, number>) =>
    Object.entries(rates).map(([code, amount]) => ({
      [label('nationality')]: country(code),
      [label('amount')]: format(amount, 'rm'),
    }));
  if (amounts.includes(name))
    return format(values[name as 'prFeeRm'].value, 'rm');
  if (byNationality[name])
    return {
      ...shown(byNationality[name]),
      [label('byNationality')]: table(
        value.byNationality as Record<string, number>,
      ),
      ...(name === 'securityBondRm' && {
        [label('mdecOnly')]: table(value.mdecOnly as Record<string, number>),
      }),
    };
  const layout = fields[name];
  if (!layout) return undefined;
  if (name !== 'employmentPass') return shown(layout);
  // Minimum basic monthly salary by category, revised and before.
  const { revised, previous } = values.employmentPass.value;
  return {
    ...shown(layout),
    [label('salaryByCategory')]: (
      ['category1', 'category2', 'category3'] as const
    ).map((key) => ({
      [label('category')]: label(key),
      [label('revised')]: format(revised[key], 'rm'),
      [label('previous')]: format(previous[key], 'rm'),
    })),
  };
}

// Amounts are grouped the same way in both languages.
function fill(text: string, entries: Record<string, string | number>) {
  return Object.entries(entries).reduce(
    (filled, [name, value]) =>
      filled.replaceAll(`{${name}}`, value.toLocaleString('en')),
    text,
  );
}
const change = (
  key: 'employmentPass' | 'deRantau' | 'mm2hSystem' | 'amendment',
  on: string,
  sources: readonly SourceRef[],
  entries: Record<string, string | number>,
) => ({
  date: on,
  title: t(`my.policy.change.${key}`),
  titleEn: t(`my.policy.change.${key}`, 'en'),
  summary: fill(t(`my.policy.change.${key}.summary`), entries),
  summaryEn: fill(t(`my.policy.change.${key}.summary`, 'en'), entries),
  sources: [...sources],
});

const ep = values.employmentPass;
const income = values.deRantauIncomeUsd;
const amendment = values.constitutionAmendment2025;
export const malaysiaPolicy = withPolicySources({
  ruleSets: [set],
  displayedRuleSets: [set],
  pathways: MY_TARGETS.map((target) => ({
    id: myPathwayByTarget[target],
    title: title(`my.target.${target}`),
  })),
  parameters: {
    [ruleSetId]: { asOf: full.asOf, ruleSetId, values },
  },
  rules: { [ruleSetId]: catalogue() },
  displayParameter,
  changelog: [
    change('employmentPass', ep.value.revisedFrom, ep.sources, {
      ...ep.value.revised,
      ...Object.fromEntries(
        Object.entries(ep.value.previous).map(([key, amount]) => [
          `old${key}`,
          amount,
        ]),
      ),
    }),
    change('deRantau', income.value.techFrom, income.sources, {
      tech: income.value.tech,
      before: income.value.techBefore,
    }),
    change(
      'mm2hSystem',
      values.mm2hSystemFeeRm.value.from,
      values.mm2hSystemFeeRm.sources,
      { amount: values.mm2hSystemFeeRm.value.amount },
    ),
    change('amendment', amendment.value.gazetted, amendment.sources, {
      assent: amendment.value.royalAssent,
      age: values.naturalisation.value.minAge,
      newAge: amendment.value.newMinAge,
    }),
  ],
});
