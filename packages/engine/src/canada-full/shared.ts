import type { SourceRef } from '@uk-immigration/policy-data';
import type { CaPathway, CaRequest } from '../canada';
import type { CountryCheck } from '../country-result';
import type { Lang } from '../rule';
import type { AtlanticAnswers } from './atlantic';
import type { ExpressAnswers } from './express';
import type { FamilyAnswers } from './family';
import type { FederalAnswers } from './federal';
import type { PnpAnswers } from './pnp';
import type { QuebecAnswers } from './quebec';
import type { ResidenceAnswers } from './residence';

export interface CaFullRequest extends Partial<CaRequest> {
  simulationDate: string;
  citizenshipStatus?: 'citizen' | 'possible-by-descent' | 'not-citizen';
  residence?: ResidenceAnswers;
  federal?: FederalAnswers;
  family?: FamilyAnswers;
  express?: ExpressAnswers;
  atlantic?: AtlanticAnswers;
  pnp?: PnpAnswers;
  quebec?: QuebecAnswers;
}

export interface Item extends CountryCheck {
  /** A document option, reference calculation, fee or later-stage reminder. */
  advisory?: boolean;
  /** First projected date this substantive time requirement is met. */
  earliestDate?: CaPathway['earliestDate'];
  /** Original physical-presence calculation, before exceptions or other conditions. */
  timeBaseline?: Pick<
    CaPathway,
    'status' | 'summary' | 'earliestDate' | 'pendingDetails'
  >;
}

type Answer = boolean | undefined;

export interface Context {
  req: CaFullRequest;
  L: Lang;
  check(
    id: string,
    title: string,
    ok: Answer,
    explanation: string,
    sources: SourceRef[],
    pending?: string[],
    advisory?: boolean,
  ): Item;
}

export function all(...values: Answer[]): Answer {
  return values.includes(false)
    ? false
    : values.includes(undefined)
      ? undefined
      : true;
}

export function any(...values: Answer[]): Answer {
  return values.includes(true)
    ? true
    : values.includes(undefined)
      ? undefined
      : false;
}

export function ref(srcId: string, locator: string): SourceRef {
  return { srcId, locator };
}
