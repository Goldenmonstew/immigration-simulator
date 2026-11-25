import {
  evaluateAustraliaFull,
  type AuFullRequest,
  type RuleMeta,
} from '@uk-immigration/engine';
import {
  australiaFull2026_11,
  type SourceRef,
} from '@uk-immigration/policy-data';
import { t, type TranslationKey } from '../i18n';

// Probe requests exercise conditional checks, sources and pending-detail codes
// across all 11 pathways so the policy catalogue matches engine output 1-to-1.
const probes: AuFullRequest[] = [
  { simulationDate: '2026-11-23' },
  {
    simulationDate: '2026-11-23',
    dateOfBirth: '1988-01-01',
    firstArrival: '2020-01-01',
    visas: [
      { subclass: '482', from: '2022-01-01', to: '2023-11-22' },
      { subclass: '485', from: '2022-11-23' },
    ],
    trips: [{ departed: '2026-10-01', returned: '2026-10-05' }],
    sponsoredFullTime: false,
    locationAtApplication: 'onshore',
    locationAtDecision: 'offshore',
    section48History: 'qualifying-refusal',
    visaCompliance: 'minor-breach',
    english: {
      test: {
        name: 'toefl',
        date: '2024-06-01',
        format: 'single-skill-retake',
        components: [12, 13, 21, 19],
      },
    },
    employer: {
      exemption: 'high-income-457-482',
      nominations: {
        'AU-186-TRT': {
          status: 'approved',
          lodged: '2026-07-01',
          approved: '2026-07-10',
          annualSalary: 85000,
        },
      },
    },
    skills: {
      invitations: {
        'AU-189-PT': 'awaiting',
        'AU-190': { issued: '2026-11-01', deadline: '2026-12-31', score: 65 },
      },
      assessment: { kind: 'awaiting' },
      nomination: 'awaiting',
    },
    innovation: {
      invitation: 'awaiting',
      achievement: 'submitted',
    },
    regional: {
      assessmentYears: [2024, 2025, 2026],
      disputedAssessment: true,
      regionalCondition: 'class-claimed',
      changeNotice: 'minor-breach',
      evidenceAndInterview: 'minor-breach',
      hongKongRegionalException: 'claimed',
    },
    partnerApplication: {
      lodged: '2024-11-01',
      stream: 'onshore',
    },
    partner: {
      stream: 'onshore',
      relationship: 'de-facto',
      compassionateDeFactoClaim: true,
      onshoreStatus: 'needs-review',
      section48History: 'qualifying-refusal',
    },
    rrv: {
      status: 'current-pr',
      ties: 'pending',
      compassionateDeparture: 'pending',
    },
    citizenship: {
      scv: { firstGrant: '2022-01-01', continuousEligible: true },
      otherResidenceBasis: 'pending',
      confinementDiscretion: 'pending',
      test: 'retest-pending',
      character: 'pending',
      intention: 'links-claimed',
      inAustraliaAtApproval: false,
      approvalAbroadException: 'pending',
    },
    publicInterest: {
      health: 'cost-risk',
      character: 'other-record',
      criticalTechnology: 'sensitive-field',
    },
  },
  {
    simulationDate: '2026-11-23',
    dateOfBirth: '1990-01-01',
    firstArrival: '2021-01-01',
    visas: [{ subclass: '189', from: '2025-01-01' }],
    trips: [{ departed: '2026-01-01', returned: '2026-01-10' }],
    english: {
      test: {
        name: 'ielts',
        date: '2026-06-01',
        format: 'approved',
        components: [4, 4, 4, 5],
      },
    },
  },
];

const extraSources: Record<string, SourceRef[]> = {
  'AU-186-TRT-age': [{ srcId: 'SRC-212', locator: 'reg 2.13' }],
  'AU-prior-visa-compliance': [
    { srcId: 'SRC-200', locator: 'Sch 8 condition 8501' },
    { srcId: 'SRC-213', locator: 's 3(1)' },
  ],
  'AU-PARTNER-time': [
    { srcId: 'SRC-065', locator: 'Eligibility → Visa requirements' },
  ],
  'AU-FEES-APPLICATION': [
    { srcId: 'SRC-221', locator: 'Current visa pricing' },
  ],
};

// Shared checks whose engine title names one pathway's criterion or charge.
const catalogueTitles: Record<string, TranslationKey> = {
  'AU-PIC-HEALTH': 'au.policy.healthRule',
  'AU-FEES-APPLICATION': 'au.policy.feesRule',
};

const extraPending: Record<string, string[]> = {
  'AU-186-TRT-time-held': ['PD-085'],
  'AU-186-TRT-time-work': ['PD-085', 'PD-207'],
  'AU-CIT-time-absences': ['PD-084'],
  'AU-CIT-time-recent-absences': ['PD-084'],
};

function buildAustraliaRules(): RuleMeta[] {
  const byId = new Map<
    string,
    {
      title: string;
      titleEn: string;
      sources: Map<string, SourceRef>;
      pending: Set<string>;
    }
  >();

  for (const request of probes) {
    const zhPaths = evaluateAustraliaFull({
      ...request,
      locale: 'zh-CN',
    }).columns[0].pathways;
    const enPaths = evaluateAustraliaFull({
      ...request,
      locale: 'en',
    }).columns[0].pathways;

    zhPaths.forEach((zhPath, pIndex) => {
      const enPath = enPaths[pIndex];
      zhPath.checks.forEach((zhCheck, cIndex) => {
        const enCheck = enPath.checks[cIndex];
        let entry = byId.get(zhCheck.id);
        if (!entry) {
          entry = {
            title: zhCheck.title,
            titleEn: enCheck.title,
            sources: new Map(),
            pending: new Set(),
          };
          byId.set(zhCheck.id, entry);
        }
        for (const src of [
          ...zhCheck.sources,
          ...(extraSources[zhCheck.id] ?? []),
        ]) {
          const key = `${src.srcId}:${src.locator}`;
          if (!entry.sources.has(key)) entry.sources.set(key, src);
        }
        for (const pd of [
          ...(zhCheck.pendingDetails ?? []),
          ...(extraPending[zhCheck.id] ?? []),
        ]) {
          entry.pending.add(pd);
        }
      });
    });
  }

  return Array.from(byId.entries(), ([id, entry]) => ({
    id,
    title: catalogueTitles[id] ? t(catalogueTitles[id]) : entry.title,
    titleEn: catalogueTitles[id] ? t(catalogueTitles[id], 'en') : entry.titleEn,
    sources: [...entry.sources.values()],
    pendingDetails: [...entry.pending],
    ruleSetId: australiaFull2026_11.ruleSetId,
  }));
}

export const australiaRules: RuleMeta[] = buildAustraliaRules();
