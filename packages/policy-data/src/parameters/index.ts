import type {
  ParameterSet,
  RuleSetId,
  RULE_SET_IDS_BY_COUNTRY,
} from '../types';
import { currentLaw2026_11 } from './current-law-2026-11';
import { earnedSettlement2026_11 } from './earned-settlement-2026-11';
import { newZealandFull2026_11 } from './new-zealand-2026-11';

/** A parameter file for every rule set registered in that country. */
export const PARAMETERS_BY_COUNTRY = {
  nz: { [newZealandFull2026_11.ruleSetId]: newZealandFull2026_11 },
  uk: {
    [currentLaw2026_11.ruleSetId]: currentLaw2026_11,
    [earnedSettlement2026_11.ruleSetId]: earnedSettlement2026_11,
  },
} satisfies {
  [Country in keyof typeof RULE_SET_IDS_BY_COUNTRY]: Record<
    (typeof RULE_SET_IDS_BY_COUNTRY)[Country][number],
    ParameterSet
  >;
};

/** Existing UK callers use this name. */
export const PARAMETERS: Record<RuleSetId, ParameterSet> =
  PARAMETERS_BY_COUNTRY.uk;
