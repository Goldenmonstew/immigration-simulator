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
  extendedUntil?: string;
}

export function medicalExam(
  exam: MedicalExam | undefined,
  procedure: PrProcedure,
  filed: string | undefined,
  asOf: string,
): boolean | undefined {
  if (!exam) return undefined;
  if (exam.disposition === 'exempt') return true;
  if (exam.disposition === 'refused') return false;
  if (
    exam.disposition === 'follow-up' ||
    exam.disposition === 'reuse-requested'
  )
    return undefined;
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
      return undefined;
    return true;
  }
  if (exam.examOn && exam.examOn <= asOf && exam.panelExamComplete) {
    if (filed && procedure === 'express' && exam.examOn > filed) return false;
    if (exam.extendedUntil && asOf <= exam.extendedUntil) return true;
    // An expired IME can be extended or IRCC may request a new one.
    if (asOf >= addMonths(exam.examOn, medical.validMonths)) return undefined;
    return true;
  }
  if (exam.panelExamComplete !== false) return undefined;
  if (procedure === 'express' && filed && filed <= asOf) return false;
  if (
    exam.instructionOn &&
    asOf > addDays(exam.instructionOn, medical.instructionDays)
  )
    return false;
  return undefined;
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
