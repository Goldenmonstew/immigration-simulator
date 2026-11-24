import { germanyFull2026_11 as policy } from '@uk-immigration/policy-data';
import { fullYears } from './dates';
import type { CountryCheck } from './country-result';
import type { DeFullRequest } from './germany-full';
import { check, src } from './germany-full-shared';

const p = policy.values;
const protectionFeeRefs = [
  src(410, '§ 52 Abs. 3 Nr. 1, 4, Abs. 4'),
  {
    ...src(434, 'BT-Drs. 18/12050 Art. 2 Nr. 11, Art. 3'),
    url: 'https://dserver.bundestag.de/btd/18/120/1812050.pdf',
  },
  src(438, 'BGBl. 2026 I Nr. 111 Art. 7 Nr. 2, Art. 13 Abs. 2'),
];

export interface DeFeeAnswers {
  applicationDate?: string;
  stage?:
    | 'application'
    | 'withdrawn-before-review'
    | 'after-substantive-review'
    | 'jurisdiction-or-capacity-only';
  reduction?:
    | 'ordinary'
    | 'section52-protection-or-admission'
    | 'association-right'
    | 'authority-set'
    | 'pending';
  /** Amount assessed by the authority for the specified stage. */
  assessedFee?: number;
  paid?: number;
  expressAccepted?: boolean;
  personalTaxableIncome?: boolean;
  euDocument?: 'certificate' | 'family-card' | 'replacement';
  citizenshipTest?: 'already-proved-or-exempt' | 'bamf' | 'state';
  stateTestQuote?: number;
  integration?:
    | 'none'
    | 'covered-first-exam'
    | 'external-lid'
    | 'course'
    | 'commercial-or-repeat';
  providerQuote?: number;
  /** Reimbursement base for the requested course units at registration. */
  courseReimbursementBase?: number;
  courseExemption?: 'granted' | 'pending' | 'ordinary';
  employeeGrossAnnual?: number;
  qualifyingChildren?: number;
}

// These checks report costs and payment separately from legal eligibility.
export function feeChecks(route: string, req: DeFullRequest): CountryCheck[] {
  if (route === 'R00') return [];
  const f = req.fees ?? {};
  const day = f.applicationDate ?? req.simulationDate;
  const age =
    req.birthDate && req.birthDate <= day
      ? fullYears(req.birthDate, day)
      : undefined;
  const minor =
    age === undefined ? undefined : age < p.citizenshipMinorAge.value;
  const card = p.identityCardFees.value;
  const cardFee =
    day < p.cardFeesFrom.value || age === undefined
      ? undefined
      : age < card.age
        ? card.under
        : card.standard;
  const results: CountryCheck[] = [];
  const fee = (
    id: string,
    zh: string,
    en: string,
    amount: number | undefined,
    refs: CountryCheck['sources'],
    detail?: readonly [string, string],
  ) => {
    const text: readonly [string, string] | undefined =
      amount === undefined
        ? detail
        : [`${zh}：€${amount.toFixed(2)}。`, `${en}: €${amount.toFixed(2)}.`];
    results.push(
      check(
        req.locale,
        id,
        zh,
        en,
        amount === undefined ? undefined : true,
        refs,
        'PD-359',
        text,
      ),
    );
  };
  let due: number | undefined;
  let chargeId: string;
  let refs: CountryCheck['sources'];
  const schedule = p.settlementFees.value;
  const naturalising = ['R07', 'R08', 'R16', 'R17'].includes(route);
  if (naturalising) {
    chargeId = 'DE-C69';
    refs = [
      ...p.naturalisationFees.sources,
      ...p.naturalisationFeesFrom.sources,
    ];
    const n = p.naturalisationFees.value;
    if (day >= p.naturalisationFeesFrom.value) {
      if (
        route !== 'R16' ||
        minor === false ||
        f.personalTaxableIncome === true
      )
        due = n.standard;
      else if (minor === true && f.personalTaxableIncome === false)
        due = n.childJoining;
    }
    if (f.stage && f.stage !== 'application') {
      const range =
        due === undefined ? undefined : `€${n.minimumOnWithdrawal}–€${due}`;
      fee(
        'DE-C69-review',
        '撤回或拒绝后的机关核费',
        'Fee assessment on withdrawal or refusal',
        undefined,
        refs,
        [
          range && f.stage === 'after-substantive-review'
            ? `实质审理后的法定区间为 ${range}，须机关定额。`
            : '按处理阶段和机关文书核费。',
          range && f.stage === 'after-substantive-review'
            ? `The range after substantive review is ${range}. The authority determines the amount.`
            : 'The stage and the authority’s notice determine the charge.',
        ],
      );
      due = undefined;
    }
    if (f.reduction === 'pending') due = undefined;
    if (f.reduction === 'authority-set') due = f.assessedFee;
  } else if (route === 'R18') {
    chargeId = 'DE-C68';
    refs = [
      src(410, '§ 47 Abs. 3, § 45c'),
      ...p.identityCardFees.sources,
      ...p.feeScheduleFrom.sources,
    ];
    if (f.euDocument === 'certificate' && day >= p.feeScheduleFrom.value)
      due = schedule.euCertificate;
    if (f.euDocument === 'family-card') due = cardFee;
    if (f.euDocument === 'replacement') due = f.assessedFee;
  } else {
    const euLong = route === 'R06';
    chargeId = euLong ? 'DE-C66' : 'DE-C65';
    refs = [...p.settlementFees.sources, ...p.feeScheduleFrom.sources];
    let advance: number | undefined;
    const processingShare =
      schedule.advanceShare * (minor ? schedule.minorShare : 1);
    const base = euLong
      ? schedule.euLongTerm
      : route === 'R10'
        ? schedule.business
        : route === 'R13'
          ? schedule.academic
          : schedule.general;
    if (day >= p.feeScheduleFrom.value) {
      if (euLong || minor === false) due = base;
      else if (minor === true)
        due =
          route === 'R11'
            ? day >= policy.asOf
              ? schedule.familyChild
              : undefined
            : base * schedule.minorShare;
      if (minor !== undefined) advance = base * processingShare;
    }
    if (f.reduction === 'association-right') {
      due = cardFee;
      advance = cardFee === undefined ? undefined : cardFee * processingShare;
      refs.push(
        src(410, '§§ 49 Abs. 1, 50 Abs. 1, 52a Abs. 2'),
        ...p.identityCardFees.sources,
      );
    } else if (
      f.reduction === 'section52-protection-or-admission' &&
      !['R06', 'R10', 'R13'].includes(route)
    ) {
      due = advance = day >= p.feeScheduleFrom.value ? 0 : undefined;
      refs.push(...protectionFeeRefs);
    } else if (f.reduction === 'authority-set' || f.reduction === 'pending') {
      due = f.reduction === 'authority-set' ? f.assessedFee : undefined;
      // After substantive review, the assessed amount is itself the processing fee.
      advance = f.stage === 'after-substantive-review' ? due : undefined;
    }
    const reductionRefs = [
      src(410, '§§ 52 Abs. 3–4, 7, 52a, 53'),
      ...p.identityCardFees.sources,
      ...protectionFeeRefs,
    ];
    results.push(
      check(
        req.locale,
        'DE-C67',
        '减免资格与机关核定',
        'Statutory fee reductions and individual decisions',
        f.reduction === undefined ||
          f.reduction === 'pending' ||
          (f.reduction === 'section52-protection-or-admission' &&
            day < p.feeScheduleFrom.value) ||
          (f.reduction === 'authority-set' && f.assessedFee === undefined)
          ? undefined
          : true,
        reductionRefs,
        'PD-359',
      ),
    );
    if (
      f.stage === 'withdrawn-before-review' ||
      f.stage === 'jurisdiction-or-capacity-only'
    )
      due = advance = 0;
    else if (f.stage === 'after-substantive-review') due = advance;
    fee(
      chargeId + '-advance',
      '包含在总费用内的处理费',
      'Processing advance included in the total',
      advance,
      refs,
    );
    if (f.expressAccepted && (!f.stage || f.stage === 'application')) {
      const extra =
        day >= p.expressFrom.value && minor !== undefined
          ? p.expressFee.value * (minor ? schedule.minorShare : 1)
          : undefined;
      fee(
        chargeId + '-express',
        '已受理的加急制证附加费',
        'Accepted express issuance surcharge',
        extra,
        [
          ...p.expressFee.sources,
          ...p.expressFrom.sources,
          ...p.settlementFees.sources,
        ],
      );
      due = due !== undefined && extra !== undefined ? due + extra : undefined;
    }
  }
  fee(
    chargeId,
    f.reduction === undefined
      ? '适用费率（个案减免另核）'
      : '本次申请费用（欧元）',
    f.reduction === undefined
      ? 'Scheduled charge before any individual reduction'
      : 'Application charge in euros',
    due,
    refs,
  );
  if (f.paid !== undefined) {
    results.push(
      check(
        req.locale,
        chargeId + '-paid',
        '已付款是否覆盖本次费用',
        'Payment covers the assessed charge',
        due === undefined ? undefined : f.paid >= due,
        refs,
        'PD-359',
      ),
    );
  }
  if (naturalising) {
    const t = f.citizenshipTest;
    const cost =
      t === 'already-proved-or-exempt'
        ? 0
        : t === 'state'
          ? f.stateTestQuote
          : t === 'bamf' && day >= p.testFeeFrom.value
            ? p.testFee.value
            : undefined;
    fee(
      'DE-C70',
      '入籍考试费用',
      'Citizenship test charge',
      cost,
      p.testFee.sources,
    );
  }
  if (route !== 'R18') {
    const course = f.integration;
    let cost: number | undefined;
    if (course === 'none' || course === 'covered-first-exam') cost = 0;
    if (course === 'external-lid' && day >= p.orientationFeeFrom.value)
      cost = p.externalOrientationFee.value;
    if (course === 'commercial-or-repeat') cost = f.providerQuote;
    if (course === 'course') {
      if (f.courseExemption === 'granted') cost = 0;
      if (
        f.courseExemption === 'ordinary' &&
        f.courseReimbursementBase !== undefined
      )
        cost =
          f.courseReimbursementBase * p.integrationCourseShare.value.personal;
      if (
        f.employeeGrossAnnual !== undefined &&
        f.qualifyingChildren !== undefined
      ) {
        const thresholds = p.integrationCourseShare.value;
        const fraction =
          thresholds.employee +
          (f.qualifyingChildren === 0
            ? 0
            : f.qualifyingChildren === 1
              ? thresholds.oneChildAddition
              : thresholds.multipleChildrenAddition);
        const eligible = day.startsWith(p.monthlyNeedsYear.value + '-')
          ? Math.round(f.employeeGrossAnnual * 100) <=
            Math.round(p.pensionCeiling2026.value * fraction * 100)
          : undefined;
        results.push(
          check(
            req.locale,
            'DE-C71-exemption',
            '按子女人数及受雇工资申请整合课费用豁免',
            'Employee earnings threshold for a course contribution exemption',
            eligible,
            [
              ...p.integrationCourseShare.sources,
              ...p.pensionCeiling2026.sources,
            ],
            'PD-359',
          ),
        );
      }
    }
    fee(
      'DE-C71',
      '整合课程、LiD 或语言考试费用',
      'Integration course, LiD or language exam charge',
      cost,
      [
        ...p.integrationCourseShare.sources,
        ...p.externalOrientationFee.sources,
        src(412, '§ 17 Abs. 3, 5'),
      ],
    );
  }
  return results;
}
