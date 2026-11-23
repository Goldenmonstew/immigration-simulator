import {
  ireland2026_11 as pilot,
  irelandFull2026_11 as full,
} from '@uk-immigration/policy-data';
import { addDays, addMonths } from '../dates';
import type { IePathway } from '../ireland';
import { afterYears } from '../pilot';
import type { IsoDate } from '../types';
import { all, character } from './common';
import type { IrelandAssessment, IrelandCharacter } from './common';

const p = full.work;

export interface IrelandBurden {
  benefit?: 'none' | 'prsi-only' | 'non-insurance' | 'means-tested' | 'other';
  officialUndueBurden?: boolean;
}

export function undueBurden(
  facts: IrelandBurden | undefined,
  acceptsPrsi: boolean,
) {
  if (facts?.officialUndueBurden !== undefined)
    return !facts.officialUndueBurden;
  return facts?.benefit === 'none' ||
    (acceptsPrsi && facts?.benefit === 'prsi-only')
    ? true
    : undefined;
}

export interface IrelandWorkPermit {
  applicationDate?: IsoDate;
  termMonths?: number;
  renewal?: boolean;
  feePrepared?: boolean;
  tier?:
    | 'csep'
    | 'csepGraduate'
    | 'csepHigh'
    | 'gep'
    | 'gepLower'
    | 'gepGraduate'
    | 'ict'
    | 'ictTrainee';
  occupationEligible?: boolean;
  recognisedQualifications?: boolean;
  employerEligible?: boolean;
  /** Share of EEA, Swiss and UK employees; for ICT, use the connected person. */
  eeaStaffShare?: number;
  staffShareExemption?: boolean;
  graduateNfqLevel?: number;
  graduateAwardOn?: IsoDate;
  irishRegisteredQualification?: boolean;
  offerFrom?: IsoDate;
  offerEnd?: IsoDate;
  labourMarketTestOrExemption?: boolean;
  foreignEmploymentFrom?: IsoDate;
  transferOn?: IsoDate;
  associatedEmployersAndAssignment?: boolean;
  hoursPerWeek?: number;
  /** Only statutory components, excluding bonuses. */
  eligibleAnnualRemuneration?: number;
  eligibleHourlyRemuneration?: number;
  baseWageLawMet?: boolean;
  /** Use only if the applicable public pay agreement has been verified. */
  publicPayAgreement?: { annual: number; hourly: number };
  publicPayAgreementUnconfirmed?: boolean;
}

export interface IrelandWorkUpgrade {
  basis?: 'csep' | 'hosting' | 'multi-site-doctor' | 'gep' | 'ict';
  validCorrespondingPermission?: boolean;
  employedInState?: boolean;
  passportIrpAndPermits?: boolean;
  payslipAndRevenueEvidence?: boolean;
  employerLetterOn?: IsoDate;
  recordsConsistent?: boolean;
  termsComplied?: boolean;
  character?: IrelandCharacter;
  permissionRevoked?: boolean;
  isdApproved?: boolean;
  hostingAgreementValid?: boolean;
  doctorPermitAndQualificationsValid?: boolean;
  /** Omit when assessing an existing permission without a new permit application. */
  permitApplication?: IrelandWorkPermit;
}

export interface IrelandWcatt {
  nonEea?: boolean;
  validPermissionWhileProcessing?: boolean;
  termsComplied?: boolean;
  character?: IrelandCharacter;
  burden?: IrelandBurden;
  employmentEfforts?: boolean;
  passportAndIrpEvidence?: boolean;
  bankEvidenceMonths?: number;
  exceptionalTravelConfirmed?: boolean;
  /** Maximum time abroad in an applicable grant year, on a confirmed calendar-month reading. */
  longestAnnualAbsenceMonths?: number;
  grantReceived?: boolean;
  passportExpiresOn?: IsoDate;
  renewWithPassport?: boolean;
}

export function employmentPermit(
  a: IrelandAssessment,
  data: IrelandWorkPermit,
  basis: IrelandWorkUpgrade['basis'],
) {
  const { add, L } = a;
  const values = p.permit.value;
  const category =
    basis === 'csep'
      ? 'B07'
      : basis === 'gep' || basis === 'multi-site-doctor'
        ? 'B08'
        : 'B09';
  const date = data.applicationDate;
  const tier = data.tier;
  const matches =
    tier && basis
      ? tier
          .toLowerCase()
          .startsWith(basis === 'multi-site-doctor' ? 'gep' : basis)
      : undefined;
  const rate =
    data.publicPayAgreement ?? (matches && tier ? values[tier] : undefined);
  const hours = data.hoursPerWeek;
  const annual =
    rate && hours !== undefined
      ? rate.annual +
        Math.max(0, hours - values.standardHours) * rate.hourly * values.weeks
      : undefined;
  const pay =
    !date ||
    date < values.from ||
    date > full.asOf ||
    data.publicPayAgreementUnconfirmed ||
    !rate ||
    annual === undefined ||
    data.eligibleAnnualRemuneration === undefined ||
    data.eligibleHourlyRemuneration === undefined
      ? undefined
      : all(
          tier === 'csepHigh'
            ? data.eligibleAnnualRemuneration > annual
            : data.eligibleAnnualRemuneration >= annual,
          data.eligibleHourlyRemuneration >= rate.hourly,
          data.baseWageLawMet,
        );
  const graduate = tier === 'csepGraduate' || tier === 'gepGraduate';
  const degree = !graduate
    ? true
    : all(
        data.graduateNfqLevel === undefined
          ? undefined
          : data.graduateNfqLevel >= values.graduateLevel,
        data.graduateAwardOn && date
          ? data.graduateAwardOn <= date &&
              date <= addMonths(data.graduateAwardOn, values.graduateMonths)
          : undefined,
        tier === 'gepGraduate' ? data.irishRegisteredQualification : true,
      );
  const ratio =
    data.staffShareExemption === true ||
    (data.eeaStaffShare !== undefined && data.eeaStaffShare >= values.eeaShare)
      ? true
      : data.eeaStaffShare === undefined ||
          data.staffShareExemption === undefined
        ? undefined
        : false;
  const offer =
    data.offerFrom && data.offerEnd
      ? addDays(data.offerEnd, 1) >=
        afterYears(data.offerFrom, values.csepOfferYears)
      : undefined;
  const ict = basis === 'ict';
  const trainee = tier === 'ictTrainee';
  const prior =
    data.foreignEmploymentFrom && data.transferOn
      ? data.transferOn >=
        addMonths(
          data.foreignEmploymentFrom,
          trainee ? values.ictTraineePriorMonths : values.ictPriorMonths,
        )
      : undefined;
  const ictTerms = all(
    prior,
    data.associatedEmployersAndAssignment,
    hours === undefined ? undefined : hours >= values.ictMinimumHours,
    !trainee
      ? true
      : data.termMonths === undefined
        ? undefined
        : data.termMonths <= values.ictTraineeMaxMonths,
  );
  const ictStaffRule =
    ict && data.renewal !== true
      ? L(
          `新办 ICT 时，关联实体的 EEA、瑞士及英国籍雇员须占至少 ${values.eeaShare * 100}%，或满足法定豁免。`,
          `For a new ICT permit, at least ${values.eeaShare * 100}% of the connected entity's employees must be EEA, Swiss or UK nationals unless a statutory exemption applies.`,
        )
      : '';
  add(
    category,
    all(
      matches,
      pay,
      degree,
      data.occupationEligible,
      data.recognisedQualifications,
      data.employerEligible,
      ict ? ictTerms : true,
      ict && data.renewal !== false
        ? data.renewal === true || ratio === true
          ? true
          : undefined
        : ratio,
      basis === 'csep'
        ? offer
        : basis === 'gep' || basis === 'multi-site-doctor'
          ? data.labourMarketTestOrExemption
          : true,
    ),
    L(
      `需核对雇主、职业、资格及适用报酬。${annual === undefined || !rate ? '' : `本档年薪门槛 €${annual.toFixed(2)}、时薪 €${rate.hourly}。`}${ictStaffRule} 分档或历史薪酬冲突见 PD-328。`,
      `Check the employer, occupation, qualifications and applicable remuneration. ${annual === undefined || !rate ? '' : `This tier uses €${annual.toFixed(2)} annually and €${rate.hourly} hourly. `}${ictStaffRule ? `${ictStaffRule} ` : ''}See PD-328 for classification or historic remuneration issues.`,
    ),
    ['PD-328'],
  );
  const fee = p.fees.value;
  const term = data.termMonths;
  const csepRenewal = basis === 'csep' && data.renewal === true;
  const amount =
    csepRenewal || !date || date < fee.from || data.renewal === undefined
      ? undefined
      : basis === 'csep'
        ? fee.csep
        : term === undefined || !basis
          ? undefined
          : !data.renewal
            ? term <= fee.shortMonths
              ? fee.newShort
              : term <= fee.middleMonths
                ? fee.newMiddle
                : undefined
            : ict
              ? term <= fee.shortMonths
                ? fee.ictRenewShort
                : term <= fee.middleMonths
                  ? fee.ictRenewMiddle
                  : term <= fee.longMonths
                    ? fee.ictRenewLong
                    : undefined
              : term <= fee.shortMonths
                ? fee.gepRenewShort
                : term <= fee.longMonths
                  ? fee.gepRenewLong
                  : undefined;
  add(
    'B10',
    csepRenewal ? false : amount === undefined ? undefined : data.feePrepared,
    csepRenewal
      ? L(
          'CSEP 不能续期，续期费用不适用。IRP 登记另行核对。',
          'A CSEP is not renewable, so no renewal fee applies. IRP registration is assessed separately.',
        )
      : amount === undefined
        ? L(
            '需确认许可期限、收费日期及签发或续期类别（PD-339）。',
            'Confirm the term, date and whether this is a new permit or renewal (PD-339).',
          )
        : L(
            `基础就业许可费 €${amount}，另核 IRP 登记。`,
            `Underlying employment permit fee €${amount}. IRP registration is assessed separately.`,
          ),
    ['PD-339'],
    false,
  );
}

export function workUpgrade(
  a: IrelandAssessment,
  route: 'csep' | 'gep',
  clock: IePathway,
  input: IrelandWorkUpgrade,
) {
  const { add, L, day } = a;
  a.time(clock, ['STAMP4-WORK-TIME'], [['PD-116', 'PD-326']]);
  const basis = input.basis;
  const qualifying =
    basis === undefined
      ? undefined
      : route === 'csep'
        ? basis === 'csep' ||
          basis === 'hosting' ||
          basis === 'multi-site-doctor'
        : basis === 'gep' || basis === 'ict';
  add(
    'B03',
    all(qualifying, input.employedInState, input.validCorrespondingPermission),
    L(
      '须在境内实际工作且当前 Stamp 与就业许可或 Hosting Agreement 对应。',
      'The employee must be working in the State and hold a Stamp matching the permit or Hosting Agreement.',
    ),
    ['PD-326'],
  );
  const n = p.upgrade.value;
  const letter = input.employerLetterOn
    ? input.employerLetterOn <= day &&
      day <= addMonths(input.employerLetterOn, n.employerLetterMonths)
    : undefined;
  add(
    'B04',
    all(
      input.passportIrpAndPermits,
      input.payslipAndRevenueEvidence,
      letter,
      input.recordsConsistent === false ? undefined : input.recordsConsistent,
    ),
    L(
      `核对护照、IRP、许可、工资单、Revenue 记录及最近 ${n.employerLetterMonths} 个月雇主信；ICT 清单及记录冲突见 PD-326。`,
      `Check passport, IRP, permits, payslip, Revenue records and an employer letter within ${n.employerLetterMonths} months. See PD-326 for ICT and conflicting records.`,
    ),
    ['PD-326'],
  );
  add(
    'B05',
    all(
      input.termsComplied,
      input.permissionRevoked === undefined
        ? undefined
        : !input.permissionRevoked,
      basis === 'csep' || input.character
        ? character(input.character)
        : basis === undefined
          ? undefined
          : true,
    ),
    L(
      '核对历次许可合规、撤销及适用的品格评估。CSEP 指南明示品格要求（PD-327）。',
      'Check compliance, any revocation and applicable character review. CSEP guidance explicitly requires good character (PD-327).',
    ),
    ['PD-327'],
  );
  const renewal =
    route === 'csep' ? n.shortGroupRenewYears : n.longGroupRenewYears;
  add(
    'B06',
    input.isdApproved,
    L(
      `线上升级，通常每 ${renewal} 年续期。登记费见 B02；升级流程未另列考试、私保或固定个人收入门槛。`,
      `Apply online. Renewal is generally every ${renewal} year(s). See B02 for registration fees. The upgrade procedure lists no separate test, private insurance or personal income threshold.`,
    ),
    ['PD-326'],
    false,
  );
  if (basis === 'hosting' || basis === 'multi-site-doctor') {
    add(
      'B09',
      basis === 'hosting'
        ? input.hostingAgreementValid
        : input.doctorPermitAndQualificationsValid,
      L(
        '核对正式 Hosting Agreement，或 NCHD 多地点许可及执业资格。',
        'Check the formal Hosting Agreement or the NCHD multi-site permit and professional qualifications.',
      ),
    );
  }
  if (input.permitApplication && basis !== 'hosting')
    employmentPermit(a, input.permitApplication, basis);
}

export function wcatt(
  a: IrelandAssessment,
  clock: IePathway,
  data: IrelandWcatt,
  inState: boolean | undefined,
) {
  const { add, L } = a;
  a.time(clock, ['WCATT-TIME'], [['PD-114', 'PD-118', 'PD-321']]);
  add(
    'B24',
    all(data.nonEea, inState, data.validPermissionWhileProcessing),
    L(
      '非 EEA 申请人须在共和国境内合法递交，等候期间维持有效许可。',
      'A non-EEA applicant must file while lawfully in the State and keep permission valid during processing.',
    ),
    ['PD-321'],
  );
  add(
    'B25',
    all(data.termsComplied, character(data.character)),
    L(
      '须守原许可条件并披露定罪。等待庭审会搁置，已披露定罪由 ISD 个案评估。',
      'Comply with previous permissions and disclose convictions. A pending trial puts the application on hold. ISD reviews disclosed convictions individually.',
    ),
  );
  add(
    'B26',
    undueBurden(data.burden, false),
    L(
      '不得造成 undue burden。没有固定工资下限，获批后须尽力就业（PD-333）。',
      'The applicant must avoid undue burden. There is no fixed wage threshold, and employment efforts are a condition after grant (PD-333).',
    ),
    ['PD-333'],
  );
  const months = full.wcatt.value.bankMonths;
  const limit = pilot.values.wcattAbsenceMonths.value;
  const travel =
    data.longestAnnualAbsenceMonths === undefined
      ? undefined
      : data.longestAnnualAbsenceMonths <= limit
        ? true
        : data.exceptionalTravelConfirmed;
  add(
    'B27',
    all(
      data.passportAndIrpEvidence,
      data.bankEvidenceMonths === undefined
        ? undefined
        : data.bankEvidenceMonths >= months,
      data.grantReceived ? travel : true,
    ),
    L(
      `护照、IRP、近 ${months} 个月银行记录。获批后每年出境一般不超过 ${limit} 个月（PD-117、PD-334）。`,
      `Passport, IRP and ${months} months of bank statements. After grant, absences generally must not exceed ${limit} months per year (PD-117, PD-334).`,
    ),
    ['PD-117', 'PD-334'],
  );
  add(
    'B28',
    data.grantReceived
      ? all(
          data.passportExpiresOn
            ? a.day <= data.passportExpiresOn
            : data.renewWithPassport,
          data.employmentEfforts,
        )
      : data.grantReceived,
    L(
      `Stamp 5 通常至当前护照到期${data.passportExpiresOn ? `（${data.passportExpiresOn}）` : ''}。获批后线上登记，换护照须续办。现行流程未列独立考试、体检、私保或专项申请费。`,
      `Stamp 5 normally lasts until the current passport expires${data.passportExpiresOn ? ` (${data.passportExpiresOn})` : ''}. Register online after grant and renew after changing passport. The procedure lists no separate test, medical exam, private insurance or application fee.`,
    ),
    undefined,
    false,
  );
}
