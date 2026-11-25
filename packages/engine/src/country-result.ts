import { RULE_SETS } from './evaluate';
import type { PilotStatus } from './pilot';
import type {
  DecisionOutcome,
  IsoDate,
  Locale,
  RuleOutcome,
  RuleSet,
  SettlementAssessment,
  SimulationResult,
} from './types';

export interface CountryCheck extends Omit<RuleOutcome, 'status'> {
  status: 'MET' | 'NOT_MET' | 'UNKNOWN';
  /** Display group. Only requirements and time requirements are gaps. */
  kind?:
    | 'requirement'
    | 'factor'
    | 'information'
    | 'time'
    | 'budget'
    | 'afterApproval'
    | 'alternative';
  applicable?: boolean;
  fee?: { currency: string; amount: number; possibleReducedAmount?: number };
}

export interface CountryPathway extends Omit<
  SettlementAssessment,
  'outcome' | 'rules'
> {
  id: string;
  title: string;
  status: DecisionOutcome | PilotStatus;
  checks: CountryCheck[];
  summary?: string;
  notChecked?: string[];
  pendingDetails?: string[];
  /** Timing alone can be known even when other requirements remain open. */
  timeStatus?: PilotStatus;
  timeEarliestDate?: IsoDate;
  /** Travel milestone in place of a filing date, or null if none applies. */
  travelDate?: { kind: 'departure' | 'returnDeadline'; date?: IsoDate } | null;
}

export interface CountryColumn {
  id: string;
  title: string;
  pathways: CountryPathway[];
}

export interface CountryResult {
  policyAsOf: IsoDate;
  columns: CountryColumn[];
  shortCircuit?: { reason: string; message: string };
}

const ukCheckStatus = {
  PASS: 'MET',
  FAIL: 'NOT_MET',
  UNKNOWN: 'UNKNOWN',
} as const;

const ukColumnTitles = {
  LAW: { en: 'Current law', 'zh-CN': '现行法律' },
  ANNOUNCED: { en: 'Announced reforms', 'zh-CN': '已公布改革' },
};

/** The UK engine produces one assessed settlement pathway per rule set. */
export function adaptUkResult(
  { byRuleSet, ...result }: SimulationResult,
  locale: Locale = 'zh-CN',
  ruleSets: Readonly<Record<string, RuleSet>> = RULE_SETS,
): CountryResult {
  return {
    ...result,
    columns: Object.entries(byRuleSet).map(([id, assessment]) => {
      const title = ukColumnTitles[ruleSets[id].kind][locale];
      const { outcome, rules, ...details } = assessment;
      return {
        id,
        title,
        pathways: [
          {
            id,
            title,
            status: outcome,
            ...details,
            checks: rules.map((rule) => ({
              ...rule,
              status: ukCheckStatus[rule.status],
            })),
          },
        ],
      };
    }),
  };
}
