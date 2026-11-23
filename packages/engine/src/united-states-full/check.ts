import {
  unitedStatesFull2026_11,
  unitedStatesFullSources,
} from '@uk-immigration/policy-data';
import type { SourceRef } from '@uk-immigration/policy-data';
import type { CountryCheck } from '../country-result';
import { textFor } from '../rule';
import type { UsFullRequest, UsHousehold, UsReview } from './types';

export const v = unitedStatesFull2026_11.values;
export const s = unitedStatesFullSources;

export type Answer = boolean | undefined;
export const reviewed = (value?: UsReview): Answer =>
  value === 'cleared' ? true : value === 'barred' ? false : undefined;
export const not = (value: Answer): Answer =>
  value === undefined ? undefined : !value;
export const all = (...values: Answer[]): Answer =>
  values.includes(false)
    ? false
    : values.includes(undefined)
      ? undefined
      : true;
export const any = (...values: Answer[]): Answer =>
  values.includes(true) ? true : values.includes(undefined) ? undefined : false;
export const atLeast = (actual: number | undefined, minimum: number): Answer =>
  actual === undefined ? undefined : actual >= minimum;
export const atMost = (actual: number | undefined, maximum: number): Answer =>
  actual === undefined ? undefined : actual <= maximum;

export function poverty(household?: UsHousehold): number | undefined {
  if (!household?.region || !household.size) return undefined;
  const { first, additional } = v.poverty.value[household.region];
  return first + (household.size - 1) * additional;
}

export function checksFor(request: UsFullRequest) {
  const L = textFor(request);
  return (
    id: string,
    zh: string,
    en: string,
    answer: Answer,
    sources: SourceRef[],
    pending?: string | string[],
    detail?: [zh: string, en: string],
  ): CountryCheck => ({
    id: `US-${id}`,
    title: L(zh, en),
    status: answer === undefined ? 'UNKNOWN' : answer ? 'MET' : 'NOT_MET',
    explanation: detail
      ? L(...detail)
      : answer === undefined
        ? L(
            '需要补充答案、证据或主管机关的个案结论。',
            'More answers, evidence or an individual agency finding are needed.',
          )
        : answer
          ? L(
              '按所填资料满足该项。',
              'The answers indicate this requirement is met.',
            )
          : L(
              '按所填资料未满足该项。',
              'The answers indicate this requirement is unmet.',
            ),
    sources,
    ...(answer === undefined && pending
      ? { pendingDetails: typeof pending === 'string' ? [pending] : pending }
      : {}),
  });
}
