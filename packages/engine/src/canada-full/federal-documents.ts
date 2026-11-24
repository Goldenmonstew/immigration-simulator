import { canadaFull2026_11 as ca } from '@uk-immigration/policy-data';
import { addDays, addMonths, addYears, fullYears } from '../dates';
import type { InitialPrRoute } from './federal';
import { all } from './shared';

const medical = ca.values.federalMedical.value;
const police = ca.values.federalPolice.value;

export type PrProcedure =
  'express' | 'atlantic' | 'family' | 'checklist' | 'unknown';

export interface MedicalExam {
  examOn?: string;
  instructionOn?: string;
  panelExamComplete?: boolean;
  /** A recorded exemption, a request for reuse, or an outstanding follow-up. */
  disposition?:
    'exempt' | 'reuse-granted' | 'reuse-requested' | 'follow-up' | 'refused';
  previousExamOn?: string;
  inCanada?: boolean;
  eligiblePreviousMedicalCode?: boolean;
  /** IRCC's decision on the instruction deadline or on the completed late exam. */
  instructionExtension?:
    { until: string } | 'late-exam-accepted' | 'none' | 'pending';
  /** Extended validity of an exam result. */
  extendedUntil?: string;
}

export function medicalExam(
  exam: MedicalExam | undefined,
  procedure: PrProcedure,
  filed: string | undefined,
  asOf: string,
  invitedOn: string | undefined,
): { met: boolean | undefined; missedDeadline?: string } {
  if (!exam) return { met: undefined };
  if (exam.disposition === 'exempt') return { met: true };
  if (exam.disposition === 'refused') return { met: false };
  if (exam.disposition === 'reuse-requested') return { met: undefined };
  if (exam.disposition === 'reuse-granted') {
    // Older pending applications and anomalous dates require the actual decision.
    if (
      !filed ||
      filed < medical.reuseFrom ||
      filed > medical.reuseUntil ||
      !exam.previousExamOn ||
      exam.previousExamOn >= filed ||
      exam.previousExamOn < addYears(filed, -medical.reuseYears) ||
      exam.inCanada === false ||
      exam.eligiblePreviousMedicalCode === false
    )
      return { met: undefined };
    return { met: true };
  }
  const completedOn =
    exam.panelExamComplete && exam.examOn && exam.examOn <= asOf
      ? exam.examOn
      : undefined;
  // Expired results can be extended, and outstanding follow-up needs a decision.
  const valid =
    completedOn &&
    exam.disposition !== 'follow-up' &&
    (asOf < addMonths(completedOn, medical.validMonths) ||
      (exam.extendedUntil && asOf <= exam.extendedUntil))
      ? true
      : undefined;

  if (procedure === 'express') {
    if (exam.disposition === 'follow-up') return { met: undefined };
    if (
      filed &&
      ((completedOn && completedOn > filed) ||
        (exam.panelExamComplete === false && filed <= asOf))
    )
      return { met: false };
    // Calendar dates alone cannot establish the order of same-day events.
    if (
      !invitedOn ||
      !completedOn ||
      completedOn <= invitedOn ||
      completedOn === filed
    )
      return { met: undefined };
    return { met: valid };
  }
  if (procedure === 'unknown' || !exam.instructionOn) return { met: undefined };
  const observedOn =
    completedOn ?? (exam.panelExamComplete === false ? asOf : undefined);
  if (!observedOn || observedOn < exam.instructionOn) return { met: undefined };
  const deadline = addDays(exam.instructionOn, medical.instructionDays);
  if (observedOn <= deadline) return { met: valid };

  const extension = exam.instructionExtension;
  let accepted: boolean | undefined;
  if (typeof extension === 'object') accepted = observedOn <= extension.until;
  else if (extension === 'late-exam-accepted' && completedOn) accepted = true;
  else if (extension === 'none') accepted = false;
  return { met: all(valid, accepted), missedDeadline: deadline };
}

export interface PoliceStay {
  /** One continuous stay outside Canada. Repeat the country-level certificate for stays in the same country. */
  from: string;
  /** Exclusive end, or still resident there on the filing date. */
  until?: string;
  currentCountry: boolean;
  /** Issuers with specific published validity or direct-delivery instructions. */
  issuer?: 'dubai-police' | 'hong-kong-police';
  certificateIssued?: string;
  /** Last valid date printed on the certificate, if specified. */
  certificateExpires?: string;
  /** Use only where the issuing country's IRCC instructions require a request letter. */
  requestLetterStages?: Partial<
    Record<InitialPrRoute, 'explanation-uploaded' | 'letter-received'>
  >;
  /** IRCC's receipt date for this requested certificate, by federal application. */
  supplementReceipts?: Partial<Record<InitialPrRoute, string>>;
  /** Explicit absence of a required document vs a missing answer. */
  missing?: boolean;
  exemptionGranted?: boolean;
}

export interface DocumentAnswers {
  definitiveChecklistSatisfied?: boolean;
  /** All non-Canadian stays, including an explicit empty history. */
  foreignStays?: PoliceStay[];
  /** An open IRCC request. Its absence does not document receipt of any particular certificate. */
  outstandingPoliceRequest?: boolean;
  biometrics?:
    | 'provided-for-pr'
    | 'exempt'
    | 'temporary-only'
    | 'pending'
    | 'not-provided';
}

export function policeDocuments(
  answers: DocumentAnswers,
  dob: string | undefined,
  route: InitialPrRoute,
  procedure: PrProcedure,
  filing: string | undefined,
  asOf: string,
): boolean | undefined {
  const {
    definitiveChecklistSatisfied,
    outstandingPoliceRequest,
    foreignStays,
  } = answers;
  const requestsCleared = outstandingPoliceRequest ? undefined : true;
  const checklist = outstandingPoliceRequest
    ? undefined
    : definitiveChecklistSatisfied;
  if (checklist === false) return false;
  if (dob && filing && fullYears(dob, filing) < police.minAge)
    return requestsCleared;
  if (!filing && foreignStays?.length) return undefined;
  if (!filing || !dob || !foreignStays) return checklist;
  if (procedure === 'unknown') {
    // A PNP application without a recorded mode can still have a definite result.
    const base = policeDocuments(
      answers,
      dob,
      route,
      'checklist',
      filing,
      asOf,
    );
    const enhanced = policeDocuments(
      answers,
      dob,
      route,
      'express',
      filing,
      asOf,
    );
    return base === enhanced ? base : undefined;
  }
  const adult = addYears(dob, police.minAge);
  const windowStart =
    procedure === 'express' ? addYears(filing, -police.lookbackYearsEE) : adult;
  return all(
    requestsCleared,
    ...foreignStays.map((stay) => {
      if (stay.exemptionGranted) return true;
      const { certificateIssued } = stay;
      const supplementReceivedOn = stay.supplementReceipts?.[route];
      const requestLetterStage = stay.requestLetterStages?.[route];
      const start = [adult, windowStart, stay.from].sort().at(-1)!;
      const end = stay.until && stay.until < filing ? stay.until : filing;
      // IMM 0199 and IMM 5690 separately require the country of current residence.
      if (
        !supplementReceivedOn &&
        !requestLetterStage &&
        !(procedure === 'checklist' && stay.currentCountry) &&
        addMonths(start, police.stayMonths) > end
      )
        return true;
      if (supplementReceivedOn) {
        if (
          supplementReceivedOn < filing ||
          (certificateIssued && supplementReceivedOn < certificateIssued) ||
          supplementReceivedOn > asOf
        )
          return undefined;
      } else {
        if (
          requestLetterStage ||
          (certificateIssued && certificateIssued > filing)
        )
          return undefined;
        if (stay.missing)
          return outstandingPoliceRequest || procedure === 'atlantic'
            ? undefined
            : false;
        // At initial AIP filing, a printed expiry can rule out a certificate even without its issue date.
        if (!certificateIssued && procedure !== 'atlantic') return checklist;
      }
      const receivedOn = supplementReceivedOn ?? filing;
      if (
        stay.currentCountry &&
        stay.certificateExpires &&
        receivedOn > stay.certificateExpires
      )
        return false;
      if (!certificateIssued) {
        if (!supplementReceivedOn) return checklist;
        // IRCC may receive the requested certificate directly from the issuer.
        return requestLetterStage || stay.issuer === 'hong-kong-police'
          ? true
          : undefined;
      }
      // 'until' is the first day no longer staying in that country.
      if (!stay.currentCountry) return certificateIssued >= end;
      if (!stay.certificateExpires && stay.issuer === 'dubai-police') {
        const anniversary = addMonths(
          certificateIssued,
          police.dubaiCertificateMonths,
        );
        // The issuer specifies a duration, without defining the last valid day (PD-245).
        return receivedOn === anniversary
          ? undefined
          : receivedOn < anniversary;
      }
      if (
        certificateIssued >=
        addMonths(receivedOn, -police.currentCertificateMonths)
      )
        return true;
      if (procedure !== 'atlantic') return false;

      const anniversary = addYears(
        certificateIssued,
        police.atlanticUsualCertificateYears,
      );
      // At initial filing, the general and AIP guidance overlap without specifying precedence (PD-245).
      if (!supplementReceivedOn)
        return receivedOn > anniversary ? false : undefined;
      if (
        receivedOn < anniversary ||
        (receivedOn === anniversary && stay.certificateExpires)
      )
        return true;
      // IRCC does not define exceptions or the last valid day for a requested supplement.
      return undefined;
    }),
  );
}

export function biometrics(
  answers: DocumentAnswers,
  dob: string | undefined,
  filing: string,
) {
  if (dob) {
    const age = fullYears(dob, filing);
    if (age < police.biometricsMinAge || age > police.biometricsMaxAge)
      return true;
  }
  if (
    answers.biometrics === 'provided-for-pr' ||
    answers.biometrics === 'exempt'
  )
    return true;
  if (!dob || !answers.biometrics || answers.biometrics === 'pending')
    return undefined;
  return false;
}
