import type {
  Parameter,
  ParameterSet,
  RuleSetId,
  RULE_SET_IDS_BY_COUNTRY,
} from '../types';
import { australiaFull2026_11 } from './australia-2026-11';
import { canadaFull2026_11 } from './canada-2026-11';
import { currentLaw2026_11 } from './current-law-2026-11';
import { earnedSettlement2026_11 } from './earned-settlement-2026-11';
import { germanyFull2026_11 } from './germany-2026-11';
import { newZealandFull2026_11 } from './new-zealand-2026-11';
import { spainFull2026_11 } from './spain-2026-11';

/** A parameter file for every rule set registered in that country. */
export const PARAMETERS_BY_COUNTRY = {
  de: { [germanyFull2026_11.ruleSetId]: germanyFull2026_11 },
  au: { [australiaFull2026_11.ruleSetId]: australiaFull2026_11 },
  es: { [spainFull2026_11.ruleSetId]: spainFull2026_11 },
  ca: { [canadaFull2026_11.ruleSetId]: canadaFull2026_11 },
  nz: { [newZealandFull2026_11.ruleSetId]: newZealandFull2026_11 },
  uk: {
    [currentLaw2026_11.ruleSetId]: currentLaw2026_11,
    [earnedSettlement2026_11.ruleSetId]: earnedSettlement2026_11,
  },
} satisfies {
  [Country in keyof typeof RULE_SET_IDS_BY_COUNTRY]: Record<
    (typeof RULE_SET_IDS_BY_COUNTRY)[Country][number],
    Pick<ParameterSet, 'asOf' | 'ruleSetId'> & {
      values: Record<string, Parameter<unknown>>;
    }
  >;
};

/** Existing UK callers use this name. */
export const PARAMETERS: Record<RuleSetId, ParameterSet> =
  PARAMETERS_BY_COUNTRY.uk;
