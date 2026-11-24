// Shared primitives used by both policy-data and the engine. They live here
// (not in the engine) because the engine depends on this package, not the
// other way round.

/** A pointer into docs/SOURCES.md, e.g. { srcId: 'SRC-001', locator: 'p16' }. */
export interface SourceRef {
  srcId: string;
  /** Physical PDF page ("p16"), paragraph ("SW 4.2") or anchor. */
  locator: string;
  /** A page within the source, when the locator is not on its main URL. */
  url?: string;
}

/** The existing UK ids are also used by the game and existing result links. */
export const RULE_SET_IDS = [
  'current-law-2026-11',
  'earned-settlement-2026-11',
] as const;

/** New rule sets use a country prefix, e.g. "au.current-law". */
export type RuleSetId = (typeof RULE_SET_IDS)[number] | `${string}.${string}`;

/** Each country's rule sets, in registration order (contracts §13). */
export const RULE_SET_IDS_BY_COUNTRY = {
  uk: RULE_SET_IDS,
  de: ['de.current-law-2026-11'],
  au: ['au.current-law-2026-11'],
  es: ['es.current-law'],
  ca: ['ca.current-law-2026-11'],
} as const satisfies Record<string, readonly RuleSetId[]>;

export interface Parameter<T> {
  value: T;
  sources: SourceRef[];
}

/** "Meet the threshold in `required` of the `window` years before applying." */
export interface BestYears {
  required: number;
  window: number;
}

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/** An English level required for applications made on or after a date. */
export interface DatedEnglishRequirement {
  cefrLevel: CefrLevel;
  /** YYYY-MM-DD */
  applicationsFrom: string;
}

/** Declare parameter sets with `satisfies ParameterSet` so value names stay typed. */
export interface ParameterSet<
  Value =
    | number
    | string
    | BestYears
    | DatedEnglishRequirement
    | string[]
    | Record<string, number>,
> {
  ruleSetId: RuleSetId;
  /**
   * The rule set whose values (and their sources) this one carries over by
   * spreading its `values`; documentation only (contracts §13).
   */
  basedOn?: RuleSetId;
  /** Date (YYYY-MM-DD) the values were last checked against their sources. */
  asOf: string;
  values: Record<string, Parameter<Value>>;
}
