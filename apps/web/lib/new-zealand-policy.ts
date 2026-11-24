import {
  evaluateNewZealandFull,
  type NzFullRequest,
  type RuleMeta,
} from '@uk-immigration/engine';
import {
  newZealandFull2026_11 as full,
  type SourceRef,
} from '@uk-immigration/policy-data';
import { t, type TranslationKey } from '../i18n';
import { withPolicySources, type PolicyRuleSet } from './policy';

const title = (key: TranslationKey) => ({ 'zh-CN': t(key), en: t(key, 'en') });
const values = full.values;

// Answers that reach every condition the engine can return. Conditions are
// read from the engine so the policy page shares its titles and sources.
const date = full.asOf;
const ready = {
  role: 'principal',
  conditions: 'none',
  deportationLiability: 'none',
  furtherPoliceEvidence: 'not-requested',
  otherCommitments: [] as never[],
} as const;
const onshore = { currentlyInNz: true, restrictedEntry: false } as const;
const recent = {
  firstArrival: '2025-11-01',
  residentVisa: { granted: '2025-11-01', category: 'general' as const },
  trips: [],
};
const requests: NzFullRequest[] = [
  { simulationDate: date },
  {
    simulationDate: date,
    resident: {
      travel: { action: 'variation' },
      prv: { category: 'migrant-investor', role: 'principal' },
    },
    skilled: {
      smc: { route: 'points' },
      green: { tier: 'work' },
      sector: { category: 'care' },
    },
    family: { investment: { route: 'active' } },
    common: { dependants: [{ relation: 'partner' }] },
  },
  {
    simulationDate: date,
    resident: { travel: { action: 'subsequent' } },
    skilled: {
      smc: { route: 'experience' },
      sector: { category: 'transport' },
    },
    family: { investment: { route: 'business', business: { stage: 'work' } } },
  },
  {
    simulationDate: date,
    skilled: { smc: { route: 'trades' }, green: { tier: 'straight' } },
  },
  // A joint PRV application projected to the date the principal qualifies.
  {
    simulationDate: date,
    dateOfBirth: '1990-01-01',
    ...recent,
    common: {
      character: 'clear',
      identityDocuments: true,
      requiredFeePaid: true,
      residenceFiling: {
        currentVisa: 'other-eligible-temporary-or-resident',
        statutoryBar: 'none',
        atImmigrationControlArea: false,
        hasOmittedRelationshipVisaDependant: false,
      },
      dependants: [
        {
          relation: 'child',
          dateOfBirth: '2002-02-01',
          single: true,
          hasOwnChildren: false,
          financiallyDependent: true,
          identityDocuments: true,
          character: 'clear',
          prvApplication: {
            ...recent,
            linkedToJointPrincipal: true,
            travel: onshore,
            prv: { ...ready, role: 'linked' },
          },
        },
      ],
    },
    resident: {
      prv: ready,
      travel: { ...onshore, firstEntryClass: 'standard' },
    },
  },
];

function engineRules() {
  const rules = new Map<string, RuleMeta>();
  const pathways = new Map<string, { 'zh-CN': string; en: string }>();
  const sameSource = (a: SourceRef, b: SourceRef) =>
    a.srcId === b.srcId && a.locator === b.locator;
  for (const request of requests) {
    const [zh, en] = (['zh-CN', 'en'] as const).map(
      (locale) =>
        evaluateNewZealandFull({ ...request, locale }).columns[0].pathways,
    );
    zh.forEach((pathway, i) => {
      pathways.set(pathway.id, { 'zh-CN': pathway.title, en: en[i].title });
      pathway.checks.forEach((check, j) => {
        // Per-member PRV checks repeat the joint member condition.
        if (/^NZ-P2-(PARTNER|CHILD)-\d+$/.test(check.id)) return;
        const rule = rules.get(check.id) ?? {
          id: check.id,
          ruleSetId: full.ruleSetId,
          title: check.title,
          titleEn: en[i].checks[j].title,
          sources: [],
          pendingDetails: [],
        };
        for (const source of check.sources)
          if (!rule.sources.some((known) => sameSource(known, source)))
            rule.sources.push(source);
        for (const pd of check.pendingDetails ?? [])
          if (!rule.pendingDetails.includes(pd)) rule.pendingDetails.push(pd);
        rules.set(check.id, rule);
      });
    });
  }
  return {
    rules: [...rules.values()],
    pathways: [...pathways].map(([id, title]) => ({ id, title })),
  };
}

const engine = engineRules();
const set: PolicyRuleSet = {
  id: full.ruleSetId,
  title: title('nz.policy.title'),
  kind: 'LAW',
  status: 'CURRENT_LAW',
  sources: [
    { srcId: 'SRC-070', locator: 's8' },
    { srcId: 'SRC-071', locator: 'ss71, 73–74' },
    { srcId: 'SRC-072', locator: 'RV1–RV4, R5.66' },
    { srcId: 'SRC-230', locator: 'R2, R5' },
  ],
};

export const newZealandPolicy = withPolicySources({
  ruleSets: [set],
  displayedRuleSets: [set],
  pathways: engine.pathways,
  parameters: { [set.id]: full },
  rules: { [set.id]: engine.rules },
  changelog: [
    {
      date: values.unlawfulChildRuleFrom.value,
      title: t('nz.policy.unlawfulChildChange'),
      titleEn: t('nz.policy.unlawfulChildChange', 'en'),
      summary: t('nz.policy.unlawfulChildSummary'),
      summaryEn: t('nz.policy.unlawfulChildSummary', 'en'),
      sources: [...values.unlawfulChildRuleFrom.sources],
    },
    {
      date: values.grantFeeEffective.value,
      title: t('nz.policy.feeChange'),
      titleEn: t('nz.policy.feeChange', 'en'),
      summary: t('nz.policy.feeSummary'),
      summaryEn: t('nz.policy.feeSummary', 'en'),
      sources: [...values.grantFeeEffective.sources],
    },
    {
      date: values.smcFrom.value,
      title: t('nz.policy.smcChange'),
      titleEn: t('nz.policy.smcChange', 'en'),
      summary: t('nz.policy.smcSummary'),
      summaryEn: t('nz.policy.smcSummary', 'en'),
      sources: [...values.smcFrom.sources],
    },
  ],
});
