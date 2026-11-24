import { irelandFull2026_11 as full } from '@uk-immigration/policy-data';
import { addDays } from '../dates';
import type { IsoDate } from '../types';
import { all, character, registeredMonths } from './common';
import type {
  IrelandAssessment,
  IrelandCharacter,
  IrelandRegistration,
  IrelandResidencePeriod,
} from './common';
import { undueBurden } from './work';
import type { IrelandBurden } from './work';

const p = full.ltr.value;

type LtrBasis =
  | 'gep'
  | 'csep'
  | 'legacy-employment'
  | 'employment-stamp4'
  | 'hosting'
  | 'hosting-stamp4'
  | 'public-sho-registrar'
  | 'multi-site-doctor'
  | 'ict'
  | 'other-excluded'
  | 'uncertain';

export interface IrelandLtr {
  registeredPeriods?: (IrelandResidencePeriod & {
    basis: LtrBasis;
    /** Evidence of the qualifying underlying grant and corresponding Stamp/IRP. */
    evidence?: boolean;
  })[];
  councilRegisteredOn?: IsoDate;
  historicPublicDoctorEvidence?: boolean;
  employment?: 'employed' | 'self-employed' | 'unemployed';
  canContinueEmployment?: boolean;
  termsComplied?: boolean;
  pastBreachUnderReview?: boolean;
  /** For renewal, confirms that the applicant still holds the LTR permission being renewed. */
  validPermission?: boolean;
  residenceAndApplicationEvidence?: boolean;
  character?: IrelandCharacter;
  burden?: IrelandBurden;
  family?: {
    eligibleDependentRelationship?: boolean;
    principalHoldsLtr?: boolean;
    principalQualifyingPeriods?: IrelandResidencePeriod[];
    dependentRegisteredPeriods?: IrelandResidencePeriod[];
  };
  /** If the applicant already holds LTR, provide post-grant conditions and renewal evidence. */
  maintenance?: {
    largestCalendarYearAbsenceDays?: number;
    tripsPermittedOrExceptionConfirmed?: boolean;
    workEffortsAndResidence?: boolean;
    /** Residence and, for principal applicants, work evidence from the previous LTR grant. */
    previousGrantYearsEvidence?: boolean;
    renewal?: boolean;
  };
  approvalLetterOn?: IsoDate;
  feePaidOn?: IsoDate;
  familyOrRenewalFeeConfirmed?: boolean;
}

function principalResidence(a: IrelandAssessment, data: IrelandLtr) {
  const certain: IrelandResidencePeriod[] = [];
  const possible: IrelandResidencePeriod[] = [];
  let specialStatus: boolean | undefined;
  let special = false;
  for (const period of data.registeredPeriods ?? []) {
    if (
      period.from >= a.day ||
      period.basis === 'ict' ||
      period.basis === 'other-excluded'
    )
      continue;
    let evidence = period.evidence;
    let from = period.from;
    if (period.basis === 'public-sho-registrar') {
      special = true;
      evidence = all(
        evidence,
        data.historicPublicDoctorEvidence,
        period.from < p.doctorTransition ? true : undefined,
        data.councilRegisteredOn ? true : undefined,
      );
      if (data.councilRegisteredOn && data.councilRegisteredOn > from)
        from = data.councilRegisteredOn;
    }
    if (period.basis === 'multi-site-doctor' || period.basis === 'uncertain') {
      special ||= period.basis === 'multi-site-doctor';
      if (evidence !== false) evidence = undefined;
    }
    if (period.basis === 'hosting' || period.basis === 'hosting-stamp4')
      special = true;
    if (
      period.basis === 'hosting' ||
      period.basis === 'hosting-stamp4' ||
      period.basis === 'public-sho-registrar' ||
      period.basis === 'multi-site-doctor'
    ) {
      specialStatus =
        evidence === true || specialStatus === true ? true : evidence;
    }
    if (evidence === true) certain.push({ ...period, from });
    if (evidence !== false) possible.push({ ...period, from });
  }
  const met =
    data.registeredPeriods === undefined
      ? undefined
      : registeredMonths(certain, a.day, p.months) === true
        ? true
        : registeredMonths(possible, a.day, p.months) === false
          ? false
          : undefined;
  a.add(
    'C01',
    met,
    a.L(
      `须累计 ${p.months} 个月合格 Stamp 1／4 登记；按 IRP 或护照章有效期去重，空档不计。ICT、家庭等基础不可替代合格就业许可（PD-335）。`,
      `Accumulate ${p.months} months of qualifying Stamp 1 or 4 registration, deduplicating IRP or stamp periods and excluding gaps. ICT, family and other excluded bases do not substitute for employment permission (PD-335).`,
    ),
    ['PD-335'],
  );
  if (special)
    a.add(
      'C02',
      specialStatus,
      a.L(
        `Hosting Agreement 时段可按符合条件的组合计。旧公立医院医师须确认 ${p.doctorTransition} 前的过渡依据及 Medical Council 注册日；复杂医师许可见 PD-335。`,
        `Qualifying Hosting Agreement combinations may count. Historic public hospital doctors need evidence of the transition before ${p.doctorTransition} and their Medical Council registration date. See PD-335 for complex medical permissions.`,
      ),
      ['PD-335'],
      false,
    );
}

export function longTermResidence(
  a: IrelandAssessment,
  family: boolean,
  data: IrelandLtr,
  inState: boolean | undefined,
  renewal: boolean,
  registration: IrelandRegistration | undefined,
) {
  const { add, L, day } = a;
  if (!family && !renewal) {
    principalResidence(a, data);
    add(
      'C03',
      all(
        inState,
        data.validPermission,
        data.employment === undefined
          ? undefined
          : data.employment === 'employed',
        data.canContinueEmployment,
      ),
      L(
        '在共和国合法递交，并在办理中及之后持续受雇。自雇不符合主申要求。',
        'File while lawfully in the State and remain employed during and after the application. Self-employment does not qualify for the principal route.',
      ),
    );
  }
  const validPermission =
    registration?.validPermission === false && registration.renewalPending
      ? undefined
      : all(data.validPermission, registration?.validPermission ?? true);
  add(
    'C04',
    renewal ? all(
      validPermission,
      data.pastBreachUnderReview ? undefined : data.termsComplied ?? true,
      registration?.passportValid ?? true,
      registration?.addressCurrent ?? true,
      registration?.checklistComplete ?? true,
    ) : all(
      data.validPermission,
      data.pastBreachUnderReview ? undefined : data.termsComplied,
      data.residenceAndApplicationEvidence,
    ),
    renewal ? L(
      '核对现有 LTR 许可、登记和当前许可所附条件。上一许可期的证明见 C08。',
      'Check the existing LTR permission, registration and any conditions of the current grant. See C08 for evidence from the previous grant.',
    ) : L(
      '核对有效许可、历次合规、表格、护照与登记、就业／依亲和实际居住材料。',
      'Check permission, compliance, form, passports and registration, work or dependency and actual residence evidence.',
    ),
    ['PD-321', 'PD-335'],
  );
  if (!renewal || data.burden) add(
    'C05',
    undueBurden(data.burden, true),
    L(
      'PRSI 给付与非保险福利分开。非保险或经收入评估福利须按个案核对（PD-333）。',
      'Distinguish PRSI-based payments from non-contributory benefits. Non-contributory or means-tested benefits need individual review (PD-333).',
    ),
    ['PD-333'],
  );
  if (!renewal || data.character) add(
    'C06',
    character(data.character),
    L(
      '须如实披露定罪和未决起诉。等待庭审期间暂缓；其他影响由 ISD 判断。',
      'Disclose convictions and pending prosecutions. A pending trial puts the case on hold. ISD assesses other effects.',
    ),
  );
  if (family) {
    const f = data.family;
    const overlaps: IrelandResidencePeriod[] = [];
    if (!renewal) {
      for (const applicant of f?.dependentRegisteredPeriods ?? []) {
        for (const principal of f?.principalQualifyingPeriods ?? []) {
          const from =
            applicant.from > principal.from ? applicant.from : principal.from;
          const to = [applicant.to ?? day, principal.to ?? day].sort()[0];
          if (from <= to) overlaps.push({ from, to });
        }
      }
    }
    const qualifyingHistory = renewal
      ? true
      : f?.dependentRegisteredPeriods && f.principalQualifyingPeriods
        ? registeredMonths(overlaps, day, p.months)
        : undefined;
    add(
      'C07',
      all(
        inState,
        renewal ? validPermission : data.validPermission,
        f?.eligibleDependentRelationship,
        f?.principalHoldsLtr,
        qualifyingHistory,
      ),
      renewal ? L(
        '核对依亲关系仍适用及担保人仍持 LTR Stamp 4。上一许可期的居住证明见 C08（PD-335）。',
        'Check that the family relationship still qualifies and that the principal still holds LTR Stamp 4. See C08 for residence evidence from the previous grant (PD-335).',
      ) : L(
        `主申请人须持 LTR Stamp 4，家属在同一合格期间合法登记累计 ${p.months} 个月，且在境内递交（PD-335）。`,
        `The principal must hold LTR Stamp 4. The dependant needs ${p.months} months of lawful overlapping registration and must apply in the State (PD-335).`,
      ),
      ['PD-335'],
    );
  }
  const m = data.maintenance;
  if (m || renewal) {
    const hasTravelEvidence = m?.largestCalendarYearAbsenceDays !== undefined ||
      m?.tripsPermittedOrExceptionConfirmed !== undefined;
    const travel =
      m?.largestCalendarYearAbsenceDays === undefined
        ? m?.tripsPermittedOrExceptionConfirmed
        : m.largestCalendarYearAbsenceDays <= p.travelDays
          ? m.tripsPermittedOrExceptionConfirmed
          : m.tripsPermittedOrExceptionConfirmed === true
            ? true
            : undefined;
    add(
      'C08',
      all(
        renewal && !hasTravelEvidence ? true : travel,
        renewal ? family || (m?.workEffortsAndResidence ?? true) : m?.workEffortsAndResidence,
        renewal ? m?.previousGrantYearsEvidence : true,
      ),
      L(
        `主申准许通常 ${p.grantYears} 年。获批后一般每历年出境不超过 ${p.travelDays} 日，并核原因、就业努力与续期材料（PD-334、PD-335）。`,
        `The principal grant usually lasts ${p.grantYears} years. After grant, general guidance allows ${p.travelDays} days absent per calendar year. Check the purpose, employment efforts and renewal evidence (PD-334, PD-335).`,
      ),
      ['PD-334', 'PD-335'],
      renewal,
    );
  }
  const deadline =
    data.approvalLetterOn && addDays(data.approvalLetterOn, p.payDays);
  const feeKnown =
    (!family && !renewal) || data.familyOrRenewalFeeConfirmed === true;
  add(
    'C09',
    !feeKnown || !deadline
      ? undefined
      : data.feePaidOn
        ? data.feePaidOn >= data.approvalLetterOn! && data.feePaidOn <= deadline
        : day > deadline
          ? false
          : undefined,
    L(
      feeKnown
        ? `批准费 €${p.fee}，在批准信后 ${p.payDays} 日内支付${deadline ? `（${deadline}）` : ''}，IRP 登记费另核。`
        : '家属和续期的批准费按来函确认（PD-335）。',
      feeKnown
        ? `Approval fee €${p.fee}, due within ${p.payDays} days of the letter${deadline ? ` (${deadline})` : ''}. Check the IRP fee separately.`
        : 'Confirm the approval fee for dependants or renewals from the official letter (PD-335).',
    ),
    !feeKnown ? ['PD-335'] : undefined,
    false,
  );
  add(
    'C10',
    true,
    L(
      'LTR 没有独立语言、公民考试、体检、私保或住房面积门槛。住址仍用于居住与登记。',
      'LTR has no separate language, civics, medical exam, private insurance or housing size requirement. Address is used as evidence and for registration.',
    ),
    undefined,
    false,
  );
}
