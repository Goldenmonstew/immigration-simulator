import {
  evaluateCanadaFull,
  type CaFullRequest,
  type Locale,
  type RuleMeta,
} from '@uk-immigration/engine';
import { canadaFull2026_11 as ca } from '@uk-immigration/policy-data';
import { t, type TranslationKey } from '../i18n';
import { canadaGoals } from './canada-fields';
import {
  withPolicySources,
  type PolicyParameterValue,
  type PolicyRuleSet,
} from './policy';

function title(key: TranslationKey) {
  return { 'zh-CN': t(key), en: t(key, 'en') };
}

const v = ca.values;
const set: PolicyRuleSet = {
  id: ca.ruleSetId,
  title: title('ca.policy.title'),
  kind: 'LAW',
  status: 'CURRENT_LAW',
  sources: [
    { srcId: 'SRC-075', locator: 'IRPA s.28' },
    { srcId: 'SRC-074', locator: 'Citizenship Act s.5' },
    { srcId: 'SRC-260', locator: 'Citizenship Act; Citizenship Regulations' },
    { srcId: 'SRC-261', locator: 'IRPA; IRPR' },
  ],
};

// A PR date one residence window before the policy date.
const windowBefore =
  String(Number(ca.asOf.slice(0, 4)) - v.prWindowYears.value) +
  ca.asOf.slice(4);

// Each branch of the engine reports the conditions it assesses. Together
// these branches reach every condition, with its sources and pending details.
const branches: (Omit<CaFullRequest, 'simulationDate' | 'locale'> & {
  simulationDate?: string;
})[] = [
  {},
  { permanentResident: ca.asOf, trips: [], temporaryPeriods: [] },
  // Rolling windows (PD-089, PD-090) and a 29 February date (PD-091).
  {
    simulationDate: '2028-02-29',
    permanentResident: windowBefore,
    trips: [],
    temporaryPeriods: [],
  },
  // From the next federal fee adjustment neither the published schedule nor
  // the current Québec income table applies (PD-258).
  {
    simulationDate: v.federalFees.value.nextAdjustment,
    family: { quebec: true },
  },
  {
    residence: {
      caf: { route: 'pr-member' },
      language: { waiver: 'pending' },
      test: { waiver: 'pending' },
      oathWaiver: 'pending',
    },
  },
  ...(['high', 'lower', 'physician'] as const).map((category) => ({
    pnp: {
      mode: 'enhanced' as const,
      stream: 'ontario-workforce' as const,
      ontario: { category },
    },
  })),
  ...(['high', 'intermediate', 'regulated', 'talent'] as const).map(
    (stream) => ({ quebec: { stream } }),
  ),
  { family: { quebec: true } },
];

function conditions() {
  const rules = new Map<string, RuleMeta>();
  for (const branch of branches) {
    const request = { simulationDate: ca.asOf, ...branch };
    const zh = evaluateCanadaFull(request).columns[0].pathways;
    const en = evaluateCanadaFull({ ...request, locale: 'en' }).columns[0]
      .pathways;
    zh.forEach((pathway, index) =>
      pathway.checks.forEach((check, row) => {
        const rule = rules.get(check.id) ?? {
          id: check.id,
          ruleSetId: ca.ruleSetId,
          title: check.title,
          titleEn: en[index].checks[row].title,
          sources: [],
          pendingDetails: [],
        };
        for (const source of check.sources)
          if (
            !rule.sources.some(
              (known) =>
                known.srcId === source.srcId &&
                known.locator === source.locator,
            )
          )
            rule.sources.push(source);
        // The time baseline's details belong to the condition that shows it.
        for (const pending of [
          ...(check.pendingDetails ?? []),
          ...(check.timeBaseline?.pendingDetails ?? []),
        ])
          if (!rule.pendingDetails.includes(pending))
            rule.pendingDetails.push(pending);
        rules.set(check.id, rule);
      }),
    );
  }
  return [...rules.values()].sort(
    (a, b) => Number(a.id.slice(4)) - Number(b.id.slice(4)),
  );
}

// Tables indexed by family size, years of work or household make-up are
// shown with labelled rows and columns.
function displayParameter(
  name: string,
  locale: Locale,
): PolicyParameterValue | undefined {
  const label = (key: TranslationKey) => t(key, locale);
  const bySize = (amounts: readonly number[]) =>
    amounts.map((amount, i) => ({
      [label('ca.policy.familySize')]: i + 1,
      [label('ca.policy.amount')]: amount,
    }));
  const byChildren = (amounts: readonly number[]) =>
    amounts.map((amount, i) => ({
      [label('ca.policy.minorChildren')]: i,
      [label('ca.policy.amount')]: amount,
    }));
  switch (name) {
    case 'familyIncomeTable':
      return bySize(v.familyIncomeTable.value);
    case 'eeFunds':
    case 'atlanticFunds':
      return { ...v[name].value, amounts: bySize(v[name].value.amounts) };
    case 'fswSelection': {
      const { work } = v.fswSelection.value;
      return {
        ...v.fswSelection.value,
        // The last entry applies to that many years or more.
        work: work.map((points, i) => ({
          [label('ca.policy.workYears')]:
            i === work.length - 1 ? `${i}+` : String(i),
          [label('ca.policy.points')]: points,
        })),
      };
    }
    case 'familyQuebecIncome': {
      // Table B: adults by row, children by column, with each further
      // child priced by the row.
      const { extraChild, ...table } = v.familyQuebecIncome.value;
      const children = (n: number) =>
        label('ca.policy.children').replace('{n}', String(n));
      return {
        ...table,
        own: bySize(table.own),
        groups: table.groups.map((amounts, adults) => ({
          [label('ca.field.adults')]: adults,
          ...Object.fromEntries(
            amounts.map((amount, n) => [children(n), amount]),
          ),
          [label('ca.policy.extraChild')]: extraChild[adults],
        })),
      };
    }
    case 'quebecSelection2026': {
      const rates = v.quebecSelection2026.value;
      return {
        ...rates,
        single: byChildren(rates.single),
        couple: byChildren(rates.couple),
      };
    }
    case 'familyQcIntakeSchedule':
      return v.familyQcIntakeSchedule.value.map(
        ({ opens, lettersThrough }) => ({
          [label('ca.policy.intakeOpens')]: opens,
          [label('ca.policy.lettersThrough')]: lettersThrough,
        }),
      );
  }
}

export const canadaPolicy = withPolicySources({
  ruleSets: [set],
  displayedRuleSets: [set],
  pathways: canadaGoals.map((id) => ({
    id,
    title: title(`ca.goal.${id}`),
  })),
  parameters: { [set.id]: ca },
  rules: { [set.id]: conditions() },
  displayParameter,
  changelog: [
    {
      date: v.citRightFeeFrom.value,
      title: t('ca.policy.rightFeeChange'),
      titleEn: t('ca.policy.rightFeeChange', 'en'),
      summary: t('ca.policy.rightFeeSummary').replace(
        '{fee}',
        String(v.citRightFee.value),
      ),
      summaryEn: t('ca.policy.rightFeeSummary', 'en').replace(
        '{fee}',
        String(v.citRightFee.value),
      ),
      sources: [...v.citRightFeeFrom.sources, ...v.citRightFee.sources],
    },
    {
      date: v.federalFees.value.from,
      title: t('ca.policy.feeChange'),
      titleEn: t('ca.policy.feeChange', 'en'),
      summary: t('ca.policy.feeSummary').replace(
        '{date}',
        v.federalFees.value.nextAdjustment,
      ),
      summaryEn: t('ca.policy.feeSummary', 'en').replace(
        '{date}',
        v.federalFees.value.nextAdjustment,
      ),
      sources: [...v.federalFees.sources],
    },
    {
      date: v.eeCategorySelection.value.currentListFrom,
      title: t('ca.policy.categoryChange'),
      titleEn: t('ca.policy.categoryChange', 'en'),
      summary: t('ca.policy.categorySummary'),
      summaryEn: t('ca.policy.categorySummary', 'en'),
      sources: [...v.eeCategorySelection.sources],
    },
  ],
});
