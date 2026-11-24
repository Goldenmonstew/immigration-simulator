import {
  unitedStatesFull2026_11,
  unitedStatesFullSources,
} from '@uk-immigration/policy-data';
import type { SourceRef } from '@uk-immigration/policy-data';
import { daysBetween } from '../dates';
import { textFor } from '../rule';
import type { IsoDate } from '../types';
import type { UsTrip } from '../united-states';
import type {
  UsFullCheck,
  UsFullRequest,
  UsHousehold,
  UsReview,
} from './types';

export const v = unitedStatesFull2026_11.values;
export const s = unitedStatesFullSources;

export type Answer = boolean | undefined;
export const checkStatus = (answer: Answer): UsFullCheck['status'] =>
  answer === undefined ? 'UNKNOWN' : answer ? 'MET' : 'NOT_MET';
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

export function cumulativeDaysAt(total: number, through: IsoDate, on: IsoDate) {
  const difference = daysBetween(through, on);
  return {
    minimum: Math.max(0, total + Math.min(0, difference)),
    maximum: total + Math.max(0, difference),
  };
}

export function returnFromTrip(
  trips: UsTrip[] | undefined,
  date: IsoDate,
): IsoDate | undefined {
  return trips?.reduce<IsoDate | undefined>((latestReturn, trip) => {
    // With date-only inputs, resume filing on the return day after arrival.
    if (trip.departed <= date && date < trip.returned)
      return !latestReturn || trip.returned > latestReturn
        ? trip.returned
        : latestReturn;
    return latestReturn;
  }, undefined);
}

export function physicalPresenceAtReceipt(
  trips: UsTrip[],
  date: IsoDate,
): Answer {
  if (
    trips.some(({ departed, returned }) => departed < date && date < returned)
  )
    return false;
  return trips.some(
    ({ departed, returned }) => departed === date || returned === date,
  )
    ? undefined
    : true;
}

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
    filingStatus?: UsFullCheck['filingStatus'],
  ): UsFullCheck => ({
    id: `US-${id}`,
    title: L(zh, en),
    status: checkStatus(answer),
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
    ...(filingStatus ? { filingStatus } : {}),
    ...((answer === undefined || filingStatus === 'UNKNOWN') && pending
      ? { pendingDetails: typeof pending === 'string' ? [pending] : pending }
      : {}),
  });
}
