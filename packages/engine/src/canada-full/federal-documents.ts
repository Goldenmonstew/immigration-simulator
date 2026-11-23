import { canadaFull2026_11 as ca } from '@uk-immigration/policy-data';
import { addDays, addMonths, addYears, fullYears } from '../dates';
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
  certificateIssued?: string;
  /** Explicit absence of a required document vs a missing answer. */
  missing?: boolean;
  exemptionGranted?: boolean;
}

export interface DocumentAnswers {
  definitiveChecklistSatisfied?: boolean;
  /** All non-Canadian stays, including an explicit empty history. */
  foreignStays?: PoliceStay[];
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
  procedure: PrProcedure,
  filing: string,
) {
  if (answers.outstandingPoliceRequest) return false;
  if (answers.definitiveChecklistSatisfied !== undefined)
    return answers.definitiveChecklistSatisfied;
  if (dob && fullYears(dob, filing) < police.minAge) return true;
  if (
    !dob ||
    !answers.foreignStays ||
    procedure === 'checklist' ||
    procedure === 'unknown'
  )
    return undefined;
  const adult = addYears(dob, police.minAge);
  const windowStart =
    procedure === 'express' ? addYears(filing, -police.lookbackYearsEE) : adult;
  return all(
    ...answers.foreignStays.map((stay) => {
      const start = [adult, windowStart, stay.from].sort().at(-1)!;
      const end = stay.until && stay.until < filing ? stay.until : filing;
      if (addMonths(start, police.stayMonths) > end || stay.exemptionGranted)
        return true;
      if (!stay.certificateIssued || stay.certificateIssued > filing) {
        // AIP accepts initial filing without the certificate, subject to a later request.
        if (procedure === 'atlantic') return undefined;
        return stay.missing || stay.certificateIssued ? false : undefined;
      }
      if (procedure !== 'express') return true;
      if (stay.currentCountry)
        return (
          stay.certificateIssued >=
          addMonths(filing, -police.currentCertificateMonths)
        );
      // 'until' is the first day no longer staying in that country.
      return stay.certificateIssued >= end;
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
