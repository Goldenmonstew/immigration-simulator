import {
  evaluateUnitedStatesFull,
  type Locale,
  type RuleMeta,
  type UsFullRequest,
} from '@uk-immigration/engine';
import {
  unitedStates2026_11,
  unitedStatesFull2026_11,
} from '@uk-immigration/policy-data';
import { t, type TranslationKey } from '../i18n';
import {
  withPolicySources,
  type PolicyParameterValue,
  type PolicyRuleSet,
} from './policy';
import { usPathways } from './united-states-fields';

const ruleSetId = 'us.current-law-2026-11';
const time = unitedStates2026_11.values;
const full = unitedStatesFull2026_11.values;
const title = (key: TranslationKey) => ({ 'zh-CN': t(key), en: t(key, 'en') });

const date = '2026-11-21';
const resident = { dateOfBirth: '1980-01-01', permanentResident: '2015-01-01' };
const immigrant = (
  pathway: UsFullRequest['pathway'],
  process: 'adjustment' | 'consular',
  extra: Partial<UsFullRequest> = {},
): UsFullRequest => ({
  pathway,
  simulationDate: date,
  dateOfBirth: '1990-01-01',
  admission: { process, decisionOn: '2027-06-01' },
  fees: {
    travelForm: process === 'adjustment' ? 'advance-parole' : undefined,
    hr1: 'parole',
    adjustmentSupplementA: true,
  },
  ...extra,
});

// Each condition the engine can report, with its sources and pending details,
// comes from assessing these answer sets in both languages.
const samples: UsFullRequest[] = [
  {
    pathway: 'US-NATURALIZATION',
    simulationDate: date,
    ...resident,
    conditional: 'none',
    trips: [],
    fees: { channel: 'paper' },
  },
  {
    pathway: 'US-SPOUSE',
    simulationDate: date,
    ...resident,
    conditional: 'marriage',
    trips: [],
    marriage: { married: '2014-01-01' },
  },
  {
    pathway: 'US-MILITARY',
    simulationDate: date,
    ...resident,
    military: {
      basis: 'peacetime',
      separatedOn: '2026-01-01',
      service: [{ from: '2020-01-01', to: '2026-01-01' }],
    },
  },
  { pathway: 'US-CONDITIONS', simulationDate: date, ...resident },
  {
    pathway: 'US-CONDITIONS',
    simulationDate: date,
    ...resident,
    permanentResident: '2025-01-01',
    conditional: 'marriage',
    conditions: { marriage: { filing: 'divorce' } },
  },
  {
    pathway: 'US-CONDITIONS',
    simulationDate: date,
    ...resident,
    permanentResident: '2025-01-01',
    conditional: 'investor',
  },
  ...(
    ['i90', 'i131', 'ds117', 'i131a', 'ar11', 'g325r', undefined] as const
  ).map((feeForm): UsFullRequest => ({
    pathway: 'US-TRAVEL',
    simulationDate: date,
    ...resident,
    conditional: 'none',
    trips: [{ departed: '2026-01-01', returned: '2026-11-01' }],
    travel: { feeForm, admissionTriggers: 'triggered' },
  })),
  immigrant('US-FAMILY', 'adjustment', {
    family: { petitioner: 'citizen', relationship: 'spouse' },
    admission: {
      process: 'adjustment',
      decisionOn: '2027-06-01',
      i485PendingEvents: [{ on: '2027-02-01', kind: 'procedure' }],
    },
    trips: [
      {
        departed: '2027-01-01',
        returned: '2027-01-10',
        i485Travel: { route: 'advance-parole' },
      },
    ],
  }),
  immigrant('US-FAMILY', 'consular'),
  immigrant('US-EMPLOYMENT', 'adjustment', {
    employment: { category: 'eb3', perm: 'certified' },
    admission: {
      process: 'adjustment',
      petitionStatus: 'approved',
      decisionOn: '2027-06-01',
    },
    fees: { premiumProcessing: true },
  }),
  immigrant('US-EMPLOYMENT', 'adjustment'),
  immigrant('US-EMPLOYMENT', 'consular', { employment: { category: 'eb1a' } }),
  immigrant('US-EMPLOYMENT', 'consular', { employment: { category: 'eb5' } }),
  immigrant('US-EMPLOYMENT', 'consular', {
    employment: { category: 'gold-card' },
  }),
  immigrant('US-ADJUSTMENT', 'adjustment', {
    admission: { process: 'adjustment', adjustmentBasis: 'other' },
  }),
  {
    pathway: 'US-HUMANITARIAN',
    simulationDate: date,
    dateOfBirth: '1990-01-01',
    humanitarian: { status: 'refugee' },
    admission: {
      decisionOn: '2027-06-01',
      i485PendingEvents: [{ on: '2027-02-01', kind: 'procedure' }],
    },
    fees: { travelForm: 'refugee-document' },
  },
];

function catalogue() {
  const rules = new Map<string, RuleMeta>();
  for (const request of samples) {
    const [zh, en] = (['zh-CN', 'en'] as const).map(
      (locale) => evaluateUnitedStatesFull({ ...request, locale }).columns[0],
    );
    zh.pathways[0].checks.forEach((check, index) => {
      const rule = rules.get(check.id) ?? {
        id: check.id,
        title: check.title,
        titleEn: en.pathways[0].checks[index].title,
        sources: [],
        pendingDetails: [],
        ruleSetId,
      };
      for (const source of check.sources)
        if (
          !rule.sources.some(
            (known) =>
              known.srcId === source.srcId && known.locator === source.locator,
          )
        )
          rule.sources.push(source);
      for (const pending of check.pendingDetails ?? [])
        if (!rule.pendingDetails.includes(pending))
          rule.pendingDetails.push(pending);
      rules.set(check.id, rule);
    });
  }
  return [...rules.values()].sort((a, b) => a.id.localeCompare(b.id));
}

const set: PolicyRuleSet = {
  id: ruleSetId,
  title: title('us.policy.title'),
  kind: 'LAW',
  status: 'CURRENT_LAW',
  sources: [
    { srcId: 'SRC-079', locator: '8 U.S.C. (Immigration and Nationality Act)' },
    { srcId: 'SRC-080', locator: '8 CFR' },
    { srcId: 'SRC-081', locator: 'USCIS Policy Manual' },
  ],
};

const change = (
  on: string,
  key: 'civics' | 'poverty' | 'hr1' | 'eb5',
  sources: RuleMeta['sources'],
  values: Record<string, string | number> = {},
) => {
  const fill = (text: string) =>
    Object.entries(values).reduce(
      (filled, [name, value]) => filled.replaceAll(`{${name}}`, String(value)),
      text,
    );
  return {
    date: on,
    title: t(`us.policy.change.${key}`),
    titleEn: t(`us.policy.change.${key}`, 'en'),
    summary: fill(t(`us.policy.change.${key}.summary`)),
    summaryEn: fill(t(`us.policy.change.${key}.summary`, 'en')),
    sources: [...sources],
  };
};

// The current designated period of hostilities has no end date.
function shown(value: unknown): PolicyParameterValue {
  if (Array.isArray(value)) return value.map(shown);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([name, entry]) => [name, shown(entry)]),
    );
  return (value ?? '—') as PolicyParameterValue;
}

// Counts, ages and ratios in the fee tables. Every other number is in USD.
const feeCounts = new Set([
  'smallEmployerMax',
  'i485ChildAge',
  'adultAge',
  'waiverRatio',
  'reducedRatio',
]);
const channels: Record<string, TranslationKey> = {
  paper: 'us.policy.paper',
  online: 'us.policy.online',
};

// Positional pairs and lists get named columns, fees their currency.
function displayParameter(
  name: string,
  locale: Locale,
): PolicyParameterValue | undefined {
  const label = (key: TranslationKey) => t(key, locale);
  const usd = (amount: number) => `USD ${amount.toLocaleString(locale)}`;
  const dollars = (value: unknown, key = ''): PolicyParameterValue =>
    typeof value === 'number'
      ? feeCounts.has(key)
        ? value
        : usd(value)
      : typeof value === 'object' && value
        ? Object.fromEntries(
            Object.entries(value).map(([field, entry]) => [
              channels[field] ? label(channels[field]) : field,
              dollars(entry, field),
            ]),
          )
        : String(value);
  // Amounts before and from the date a new schedule takes effect.
  const byDate = (effective: string) => ({
    before: label('us.policy.before').replace('{date}', effective),
    from: label('us.policy.from').replace('{date}', effective),
  });
  if (name === 'englishExemptions')
    return full.englishExemptions.value.map(({ age, lprYears }) => ({
      [label('us.policy.minAge')]: age,
      [label('us.policy.minLprYears')]: lprYears,
    }));
  if (name === 'military') {
    const military = shown(full.military.value) as {
      hostilities: string[][];
    };
    return {
      ...military,
      hostilities: military.hostilities.map(([start, end]) => ({
        [label('us.policy.periodStart')]: start,
        [label('us.policy.periodEnd')]: end,
      })),
    };
  }
  if (name === 'hr1Fees') {
    const { effective, ...rates } = full.hr1Fees.value;
    const { before, from } = byDate(effective);
    return {
      effective,
      ...Object.fromEntries(
        Object.entries(rates).map(([field, rate]) => [
          field,
          typeof rate === 'number'
            ? usd(rate)
            : { [before]: usd(rate[0]), [from]: usd(rate[1]) },
        ]),
      ),
    };
  }
  if (name === 'eb5Fees') {
    const { effective, old, current } = full.eb5Fees.value;
    const { before, from } = byDate(effective);
    return { effective, [before]: dollars(old), [from]: dollars(current) };
  }
  if (name === 'fees' || name === 'consularFees')
    return dollars(full[name].value);
  if (
    name === 'otherImmigrationGrounds' ||
    name === 'sijAdmissionExemptions' ||
    name === 'vawaAdjustmentAdmissionExemptions' ||
    name === 'vawaConsularAdmissionExemptions' ||
    name === 'humanitarianAdmissionExemptions'
  )
    return full[name].value.map(
      (ground) => `INA 212(a)(${ground.replace(/^\d+/, '$&)')}`,
    );
}

const civics = full.civicsTest.value;
export const unitedStatesPolicy = withPolicySources({
  ruleSets: [set],
  displayedRuleSets: [set],
  pathways: usPathways.map((id) => ({
    id,
    title: title(`us.option.${id}`),
  })),
  parameters: {
    [ruleSetId]: {
      asOf: unitedStatesFull2026_11.asOf,
      ruleSetId,
      values: Object.fromEntries(
        Object.entries({ ...time, ...full }).map(([name, parameter]) => [
          name,
          { value: shown(parameter.value), sources: parameter.sources },
        ]),
      ),
    },
  },
  rules: { [ruleSetId]: catalogue() },
  displayParameter,
  changelog: [
    change(civics.switchDate, 'civics', full.civicsTest.sources, {
      bank: civics.current.bank,
      asked: civics.current.asked,
      correct: civics.current.correct,
    }),
    change(full.poverty.value.effective, 'poverty', full.poverty.sources, {
      i864: full.poverty.value.i864Effective,
    }),
    change(full.hr1Fees.value.effective, 'hr1', full.hr1Fees.sources),
    change(full.eb5Fees.value.effective, 'eb5', full.eb5Fees.sources),
  ],
});
