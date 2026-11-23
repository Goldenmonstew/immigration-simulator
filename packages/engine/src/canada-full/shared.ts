import type { SourceRef } from '@uk-immigration/policy-data';
import type { CaPathway, CaRequest } from '../canada';
import type { CountryCheck } from '../country-result';
import type { Lang } from '../rule';
import type { IsoDate } from '../types';
import type { AtlanticAnswers } from './atlantic';
import type { ExpressAnswers } from './express';
import type { FamilyAnswers } from './family';
import type { FederalAnswers, FederalApplication } from './federal';
import type { CaFullPathwayId } from './index';
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

export function completePrApplication(application: FederalApplication) {
  return all(
    application.signed,
    application.allFamilyDeclared,
    application.validIdentityAndTravelDocuments,
    application.applicationEvidenceComplete,
    application.processingFeesPaid,
  );
}

interface FilingDates {
  federal?: IsoDate;
  provincial?: IsoDate;
  employer?: IsoDate;
  completeFamilyApplication?: IsoDate;
  firstCardDetails?: IsoDate;
  citizenshipSigning?: IsoDate;
}

export function filingDatesForRoute(
  req: CaFullRequest,
  id: CaFullPathwayId,
): FilingDates {
  if (id === 'CA-RESIDENCY')
    return { firstCardDetails: req.residence?.card?.firstCardDetailsDate };
  if (id === 'CA-CITIZENSHIP' || id === 'CA-CIT-MINOR-52')
    return { citizenshipSigning: req.residence?.signingDate };

  const application = req.federal?.applications?.[id];
  const receipt = application?.filedOn;
  const eeReceipt =
    req.express?.invitation?.program === id
      ? req.express.applicationDate
      : undefined;
  switch (id) {
    case 'CA-EE-FSW':
    case 'CA-EE-CEC':
    case 'CA-EE-FST':
      return { federal: receipt ?? eeReceipt };
    case 'CA-PNP':
      return {
        federal:
          receipt ??
          req.pnp?.federalFiled ??
          (req.pnp?.mode === 'enhanced' ? eeReceipt : undefined),
        provincial: req.pnp?.ontario?.filed,
        employer: req.pnp?.ontario?.employerFiled,
      };
    case 'CA-AIP':
      return { federal: receipt ?? req.atlantic?.applicationDate };
    case 'CA-QC-PSTQ':
      return {
        federal: receipt ?? req.quebec?.federalReceived,
        provincial: req.quebec?.filed,
      };
    case 'CA-FAMILY': {
      const complete = req.family?.completeApplicationReceived;
      const federal = receipt ?? req.family?.filingDate ?? complete;
      return {
        federal,
        completeFamilyApplication:
          complete ??
          (application && completePrApplication(application)
            ? federal
            : undefined),
        provincial: req.family?.province?.submissionDate,
      };
    }
  }
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
