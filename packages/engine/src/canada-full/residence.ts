import { canadaFull2026_11 as ca } from '@uk-immigration/policy-data';
import { evaluateCanada } from '../canada';
import { addDays, addYears, fullYears, overlapDays } from '../dates';
import { afterYears } from '../pilot';
import type { IsoDate } from '../types';
import {
  all,
  any,
  ref,
  type CaFullRequest,
  type Context,
  type Item,
} from './shared';

const v = ca.values;
type Decision = 'none' | 'pending' | 'approved' | 'refused';
type Interval = { from: IsoDate; to: IsoDate };
type Adjustment = Interval & { evidence: 'accepted' | 'pending' };
type Presence = { credits?: Adjustment[]; exclusions?: Adjustment[] };
type TaxAnswer = 'filed' | 'not-required' | 'not-filed' | 'uncertain';
type GrantPath = 'CA-CITIZENSHIP' | 'CA-CIT-MINOR-52';

export interface ResidenceAnswers {
  prStatus?: 'valid' | 'lost' | 'never' | 'under-review';
  prConditionsFulfilled?: boolean;
  prDays?: Presence;
  enforcement?: {
    /** IRPA s.44(1) residency report or residency decision made outside Canada. */
    decisionDate: IsoDate;
    laterFoundCompliant?: boolean;
  };
  humanitarianRelief?: Decision;
  card?: {
    kind: 'first' | 'renew' | 'replace' | 'official-error';
    inCanada?: boolean;
    canadianAddress?: boolean;
    firstCardDetailsDate?: IsoDate;
    photosAndSignaturesReady?: boolean;
    identityAndOldCardEvidenceReady?: boolean;
    noDisqualifyingOrderOrMisuse?: boolean;
    biometricsIfRequestedReady?: boolean;
    paid?: boolean;
  };
  prtd?: {
    outsideCanada?: boolean;
    lacksValidCard?: boolean;
    lastInCanada?: IsoDate;
    appealOpenOrPending?: boolean;
    travelAndResidencyEvidenceReady?: boolean;
    paid?: boolean;
  };
  signingDate?: IsoDate;
  grantDate?: IsoDate;
  parent?:
    'citizen' | 'co-applicant-pending' | 'co-applicant-granted' | 'not-citizen';
  parentageConfirmed?: boolean;
  adultSigned?: boolean;
  authorizedRepresentativeSigned?: boolean;
  minorCountersignedOrExcused?: boolean;
  representativeWaiver?: Decision;
  minorPresenceWaiver?: Decision;
  citizenshipDays?: Presence;
  taxYears?: Record<number, TaxAnswer>;
  language?: {
    evidence?:
      'accepted-levels' | 'accepted-alternative' | 'self-assessed' | 'rejected';
    speaking?: number;
    listening?: number;
    waiver?: Decision;
  };
  test?: {
    outcome?: 'passed' | 'not-taken' | 'retry' | 'finally-failed';
    correct?: number;
    attemptsUsed?: number;
    waiver?: Decision;
  };
  noEffectiveRemovalOrder?: boolean;
  noEffectiveSecurityDeclaration?: boolean;
  returnAuthorizedIfRequired?: boolean;
  noCurrentSentenceOrProbation?: boolean;
  noProhibitedCanadianProceedings?: boolean;
  noEquivalentForeignProceedings?: boolean;
  foreignProceedingsWaiver?: Decision;
  noWarCrimesProceedingsOrConviction?: boolean;
  history?: {
    // Only events confirmed to fall under the relevant statutory prohibition.
    convictions?: IsoDate[];
    misrepresentationBars?: IsoDate[];
    revocations?: IsoDate[];
    noCurrentMisrepresentation?: boolean;
    specialProhibitionCleared?: boolean;
    classificationsConfirmed?: boolean;
  };
  identityAndDeclarationsReady?: boolean;
  fingerprintAndCourtRequestsSatisfied?: boolean;
  // Each entry is a single continuous stay in one country outside Canada.
  policeStays?: (Interval & { certificateOrExceptionAccepted?: boolean })[];
  oath?: 'taken' | 'waiting' | 'refused';
  oathWaiver?: Decision;
  stillEligibleAtGrant?: boolean;
  citizenshipFeesPaid?: boolean;
  caf?: {
    route: 'ordinary' | 'pr-member' | 'attached-or-seconded';
    serviceConfirmed?: boolean;
    // CAF-certified service within the statutory window ending on this signing date.
    signedForDate?: IsoDate;
    yearsOfQualifyingService?: number;
    release?: 'serving' | 'honourable' | 'other';
  };
}

const threshold = (value: number | undefined, min: number) =>
  value === undefined ? undefined : value >= min;
const waiver = (decision: Decision | undefined) =>
  decision === 'pending' ? undefined : decision === 'approved';
const applies = (age: number | undefined, min: number, end: number) =>
  age === undefined ? undefined : age >= min && age < end;

function currentPr(req: CaFullRequest, a: ResidenceAnswers, date: IsoDate) {
  if (
    a.prStatus === 'lost' ||
    a.prStatus === 'never' ||
    (req.permanentResident && req.permanentResident > date)
  )
    return false;
  if (req.permanentResident && a.prStatus === 'valid') return true;
  return undefined;
}

function timeBaseline(req: CaFullRequest, date: IsoDate, residency: boolean) {
  if (
    !req.permanentResident ||
    !req.trips ||
    (!residency && !req.temporaryPeriods)
  )
    return undefined;
  return evaluateCanada({
    simulationDate: date,
    permanentResident: req.permanentResident,
    trips: req.trips,
    dateOfBirth: req.dateOfBirth ?? date,
    temporaryPeriods: req.temporaryPeriods ?? [],
    locale: req.locale,
  }).pathways[residency ? 0 : 1];
}

// Count a calendar day once even if credit or exclusion documents overlap.
// Lower and upper bounds differ only for unresolved evidence. Confirmed Crown
// service days are full days under s.5(1.01)–(1.03), including before PR.
function adjustedDays(
  req: CaFullRequest,
  date: IsoDate,
  residency: boolean,
  a?: Presence,
) {
  const pr = req.permanentResident;
  if (!pr || !req.trips || (!residency && !req.temporaryPeriods))
    return undefined;
  const window = residency
    ? v.prWindowYears.value
    : v.citizenshipWindowYears.value;
  const anniversary = afterYears(pr, window);
  const first = residency && date < anniversary;
  const start = first ? pr : addYears(date, -window);
  const end = first ? anniversary : date;
  let lower = 0,
    upper = 0,
    lowerTemporary = 0,
    upperTemporary = 0;
  const covers = (p: Interval, d: IsoDate) => p.from <= d && d <= p.to;
  for (let d = start; d < end; d = addDays(d, 1)) {
    const abroad = req.trips.some((t) => t.departed < d && d < t.returned);
    const resident = d >= pr && !abroad;
    const temporary =
      !residency &&
      !abroad &&
      d < pr &&
      req.temporaryPeriods!.some((p) => p.from <= d && (!p.to || d <= p.to));
    const credits = a?.credits?.filter((p) => covers(p, d));
    const exclusions = a?.exclusions?.filter((p) => covers(p, d));
    const e = residency ? req.residence?.enforcement : undefined;
    const afterDecision = e !== undefined && d > e.decisionDate;
    if (
      (afterDecision && e.laterFoundCompliant === false) ||
      exclusions?.some((p) => p.evidence === 'accepted')
    )
      continue;
    const certainCredit =
      abroad && credits?.some((p) => p.evidence === 'accepted');
    const possibleCredit =
      abroad && (credits === undefined || credits.length > 0);
    if (resident || possibleCredit) upper++;
    else if (temporary) upperTemporary++;
    if (exclusions?.length !== 0 || (afterDecision && !e.laterFoundCompliant))
      continue;
    if (resident || certainCredit) lower++;
    else if (temporary) lowerTemporary++;
  }
  const pre = (days: number) =>
    Math.min(days * v.citPrePrDailyCredit.value, v.preResidenceCreditCap.value);
  return {
    lower: lower + pre(lowerTemporary),
    upper: upper + pre(upperTemporary),
  };
}

function boundsPass(bounds: ReturnType<typeof adjustedDays>, target: number) {
  if (!bounds) return undefined;
  return bounds.lower >= target
    ? true
    : bounds.upper < target
      ? false
      : undefined;
}

function attachBaseline(item: Item, base: ReturnType<typeof timeBaseline>) {
  if (!base) return;
  const { status, summary, earliestDate, pendingDetails, assumptions } = base;
  item.timeBaseline = { status, summary, earliestDate, pendingDetails };
  item.assumptions = assumptions;
}

function attachFutureDate(
  item: Item,
  base: ReturnType<typeof timeBaseline>,
  req: CaFullRequest,
  residency: boolean,
  adjustments?: Presence,
) {
  const date = base?.earliestDate;
  if (item.status !== 'NOT_MET' || base?.status !== 'FUTURE' || !date) return;
  // Extra credited days abroad could bring the first qualifying date forward.
  if (req.trips?.length && adjustments?.credits?.length !== 0) return;
  const target = residency ? v.prObligationDays.value : v.citizenshipDays.value;
  // Exclusions and enforcement can prevent qualification on the baseline date.
  if (boundsPass(adjustedDays(req, date, residency, adjustments), target))
    item.earliestDate = date;
}

function prChecks({ req, L, check }: Context, a: ResidenceAnswers): Item[] {
  const date = req.simulationDate;
  const pr = currentPr(req, a, date);
  const base = timeBaseline(req, date, true);
  const time = base?.checks[0];
  const bounds = adjustedDays(req, date, true, a.prDays);
  const relief =
    a.humanitarianRelief === undefined
      ? undefined
      : waiver(a.humanitarianRelief);
  const effective = any(boundsPass(bounds, v.prObligationDays.value), relief);
  const card = a.card;
  const fee =
    card && ['first', 'official-error'].includes(card.kind)
      ? 0
      : v.prDocumentFee.value;
  let cardOk: boolean | undefined;
  if (card?.kind === 'first') {
    const filed = card.firstCardDetailsDate;
    const deadline =
      req.permanentResident &&
      addDays(req.permanentResident, v.firstPrCardDays.value);
    const timely =
      filed && deadline && req.permanentResident
        ? filed >= req.permanentResident && filed <= deadline && filed <= date
        : deadline && date > deadline
          ? false
          : undefined;
    cardOk = all(
      pr,
      card.inCanada,
      card.canadianAddress,
      card.photosAndSignaturesReady,
      timely,
    );
  } else if (card) {
    cardOk = all(
      pr,
      effective,
      card.inCanada,
      card.canadianAddress,
      card.photosAndSignaturesReady,
      card.identityAndOldCardEvidenceReady,
      card.noDisqualifyingOrderOrMisuse,
      card.biometricsIfRequestedReady,
      fee === 0 || card.paid,
    );
  }
  const t = a.prtd;
  const recent = t?.lastInCanada
    ? t.lastInCanada >= addDays(date, -v.prtdAppealPresenceDays.value) &&
      t.lastInCanada < date
    : undefined;
  const prtd = all(
    pr,
    t?.outsideCanada,
    t?.lacksValidCard,
    t?.travelAndResidencyEvidenceReady,
    t?.paid,
    any(effective, all(t?.appealOpenOrPending, recent)),
  );
  const baseline = check(
    'CA-R02',
    L('实地居住天数', 'Physical residency baseline'),
    time?.met,
    [time?.text, base?.summary].filter(Boolean).join(' ') ||
      L(
        '请提供取得 PR 日期与完整行程。',
        'Provide the PR date and complete travel history.',
      ),
    [
      ref('SRC-075', 'IRPA s.28(2)(a)–(b)'),
      ref('SRC-078', 'PR status determination: Five-year period'),
    ],
    base?.pendingDetails,
    true,
  );
  attachBaseline(baseline, base);
  const obligation = check(
    'CA-R03',
    L(
      '认可的境外日、执法截点及人道裁量',
      'Credited days abroad, enforcement and humanitarian relief',
    ),
    effective,
    (bounds
      ? L(
          `按证据可计 ${bounds.lower} 至 ${bounds.upper} 天。 `,
          `Evidence supports ${bounds.lower} to ${bounds.upper} days. `,
        )
      : '') +
      L(
        '核对同住或派驻境外的日期、执法认定后排除的日期，以及人道裁量决定。',
        'Check accompanying or posting dates, days excluded after an enforcement decision, and the humanitarian decision.',
      ),
    [
      ref('SRC-075', 'IRPA s.28(2)(a)(ii)–(iv), (c)'),
      ref('SRC-261', 'IRPR ss.61–62'),
    ],
    ['PD-240'],
  );
  attachFutureDate(obligation, base, req, true, a.prDays);
  return [
    check(
      'CA-R01',
      L('当前永久居民身份及附带条件', 'Current PR status and conditions'),
      all(pr, a.prConditionsFulfilled),
      L(
        '核对 PR 起始日期、有效身份、最终决定与附带条件。卡到期不会终止身份。',
        'Check the PR date, current status, final decisions and outstanding conditions. Card expiry does not end PR.',
      ),
      [ref('SRC-261', 'IRPA ss.2(1), 27(2), 28(1), 46(1)')],
      ['PD-240'],
    ),
    baseline,
    obligation,
    check(
      'CA-R04',
      L('PR card 办理', 'PR card application'),
      cardOk,
      L(
        `确认首卡或换补卡、在加地址、照片、执法与生物识别材料、收据。首卡资料期限 ${v.firstPrCardDays.value} 天。`,
        `Confirm first issue or replacement, Canadian address, photos, enforcement and biometrics documents, and receipt. First-card details are due within ${v.firstPrCardDays.value} days.`,
      ) + (card ? ` CAD ${fee}.` : ''),
      [
        ref('SRC-261', 'IRPR ss.53–59, 308'),
        ref('SRC-265', 'PR card guide: Who can apply; Step 3'),
      ],
      ['PD-240'],
      true,
    ),
    check(
      'CA-R05',
      L('永久居民旅行证件', 'Permanent resident travel document'),
      prtd,
      L(
        `核对境外地点、卡有效期及居住或人道决定。如依据上诉申请，须在前 ${v.prtdAppealPresenceDays.value} 天内到过加拿大，并且仍在上诉期限内或上诉待决。备妥证件并缴费 CAD ${v.prDocumentFee.value}。`,
        `Check location abroad, card expiry and the residency or humanitarian decision. If relying on an appeal, you must have been in Canada in the preceding ${v.prtdAppealPresenceDays.value} days and either still be within the appeal period or have an appeal pending. Provide the documents and pay CAD ${v.prDocumentFee.value}.`,
      ),
      [
        ref('SRC-261', 'IRPA s.31(3); IRPR s.315'),
        ref('SRC-265', 'PRTD guide: Who may use this application; Step 3'),
      ],
      ['PD-240'],
      true,
    ),
  ];
}

function taxStatus(
  date: IsoDate,
  window: number,
  answers: ResidenceAnswers['taxYears'],
) {
  const first = Number(addYears(date, -window).slice(0, 4));
  const last = Number(addDays(date, -1).slice(0, 4));
  let known = 0,
    uncertain = 0;
  for (let y = first; y <= last; y++) {
    const answer = answers?.[y];
    if (answer === 'filed' || answer === 'not-required') known++;
    if (!answer || answer === 'uncertain') uncertain++;
  }
  const target = v.citTaxYears.value;
  return {
    known,
    first,
    last,
    ok: known >= target ? true : known + uncertain < target ? false : undefined,
  };
}

function citizenshipChecks(
  ctx: Context,
  a: ResidenceAnswers,
  id: GrantPath,
): Item[] {
  const { req, L, check } = ctx;
  const date = a.signingDate ?? req.simulationDate;
  const age = req.dateOfBirth && fullYears(req.dateOfBirth, date);
  const minor =
    typeof age === 'number' ? age < v.languageMinAge.value : undefined;
  const minor52 = id === 'CA-CIT-MINOR-52';
  const parentCitizen =
    a.parent === 'citizen' || a.parent === 'co-applicant-granted'
      ? true
      : a.parent === 'not-citizen'
        ? false
        : undefined;
  const coSign =
    typeof age === 'number'
      ? age < v.citSignatureOathAge.value || a.minorCountersignedOrExcused
      : undefined;
  const signer =
    minor === undefined
      ? undefined
      : minor
        ? all(
            any(
              a.authorizedRepresentativeSigned,
              !minor52 && waiver(a.representativeWaiver),
            ),
            coSign,
          )
        : a.adultSigned;
  const caf = !minor52 ? a.caf : undefined;
  const usePrService = caf?.route === 'pr-member' && caf.release !== 'other';
  const useSecondment = caf?.route === 'attached-or-seconded';
  const useService = usePrService || useSecondment;
  const base = !minor52 ? timeBaseline(req, date, false) : undefined;
  const bounds =
    !minor52 && !useService
      ? adjustedDays(req, date, false, a.citizenshipDays)
      : undefined;
  const enoughDays = any(
    boundsPass(bounds, v.citizenshipDays.value),
    minor === true && waiver(a.minorPresenceWaiver),
  );
  const tax = taxStatus(
    date,
    usePrService ? v.citCafWindowYears.value : v.citizenshipWindowYears.value,
    a.taxYears,
  );
  const inBand = minor52
    ? false
    : applies(
        typeof age === 'number' ? age : undefined,
        v.languageMinAge.value,
        v.languageMaxAge.value,
      );
  const lang = a.language;
  const language =
    lang?.evidence === 'accepted-alternative'
      ? true
      : lang?.evidence === 'accepted-levels'
        ? all(
            threshold(lang.listening, v.citListeningSpeakingLevel.value),
            threshold(lang.speaking, v.citListeningSpeakingLevel.value),
          )
        : lang?.evidence === 'rejected'
          ? false
          : undefined;
  const test = a.test;
  const format = v.citTestFormat.value;
  const scorePassed =
    test?.correct === undefined || test.correct > format.questions
      ? undefined
      : test.correct >= format.correct;
  const knowledge =
    test?.outcome === 'passed' || scorePassed === true
      ? true
      : test?.outcome === 'finally-failed'
        ? false
        : undefined;
  const h = a.history;
  const noEvent = (
    dates: IsoDate[] | undefined,
    years: number,
    end: IsoDate,
  ) =>
    dates === undefined
      ? undefined
      : !dates.some((d) => d >= addYears(date, -years) && d <= end);
  const currentReview =
    a.grantDate ?? (req.simulationDate < date ? date : req.simulationDate);
  const historyOk =
    h?.classificationsConfirmed === true
      ? all(
          noEvent(h.convictions, v.citConvictionYears.value, currentReview),
          noEvent(h.revocations, v.citRevocationYears.value, addDays(date, -1)),
          noEvent(
            h.misrepresentationBars,
            v.citMisrepresentationYears.value,
            addDays(date, -1),
          ),
          h.noCurrentMisrepresentation,
          h.specialProhibitionCleared,
        )
      : undefined;
  const policeStart =
    req.dateOfBirth &&
    [
      addYears(req.dateOfBirth, v.languageMinAge.value),
      addYears(date, -v.citPoliceLookbackYears.value),
    ]
      .sort()
      .at(-1)!;
  const certs =
    minor52 || minor === true
      ? true
      : policeStart && a.policeStays
        ? all(
            ...a.policeStays.map(
              (s) =>
                overlapDays(s.from, s.to, policeStart, addDays(date, -1)) <
                  v.citPoliceSingleStayDays.value ||
                s.certificateOrExceptionAccepted,
            ),
          )
        : undefined;
  const grantAge =
    req.dateOfBirth && a.grantDate
      ? fullYears(req.dateOfBirth, a.grantDate)
      : undefined;
  const oath = any(
    grantAge === undefined ? undefined : grantAge < v.citSignatureOathAge.value,
    waiver(a.oathWaiver),
    a.oath === 'taken' ? true : a.oath === 'refused' ? false : undefined,
  );
  const chargeKnown =
    typeof age === 'number' &&
    date <= ca.asOf &&
    date >= v.citRightFeeFrom.value;
  const fee = minor
    ? v.citMinorApplicationFee.value
    : v.citAdultProcessingFee.value + v.citRightFee.value;
  const exempt = L(
    '此分支免除此项。',
    'This requirement does not apply to this branch.',
  );
  const presence = check(
    'CA-R08',
    L('实际居住及例外', 'Physical presence and exceptions'),
    minor52 || useService || enoughDays,
    (base?.checks[1]?.text ?? '') +
      ' ' +
      (minor52 || useService
        ? exempt
        : bounds
          ? L(
              `证据支持 ${bounds.lower} 至 ${bounds.upper} 天。`,
              `Evidence supports ${bounds.lower} to ${bounds.upper} days.`,
            )
          : L(
              '提供 PR 日期、临时身份期间及完整行程。',
              'Provide the PR date, temporary status periods and full travel record.',
            )) +
      (base?.earliestDate
        ? L(
            ` 普通实地基线最早签署日 ${base.earliestDate}。`,
            ` Ordinary baseline first signing date: ${base.earliestDate}.`,
          )
        : ''),
    [
      ref('SRC-074', 'Citizenship Act ss.5(1)(c)(i), 5(1.001), 21'),
      ref('SRC-260', 'Citizenship Act ss.5(1.01)–(1.03), 5(3)'),
      ref('SRC-077', 'Physical Presence Calculator FAQ A3'),
    ],
    ['PD-241', ...(base?.pendingDetails ?? [])],
  );
  attachBaseline(presence, base);
  if (date >= req.simulationDate)
    attachFutureDate(presence, base, req, false, a.citizenshipDays);
  return [
    check(
      'CA-R06',
      L('申请类别、父母身份及签署', 'Grant route, parent and signatures'),
      all(
        signer,
        minor52 ? all(minor, parentCitizen, a.parentageConfirmed) : true,
      ),
      L(
        '成人本人签署；未成年人核对法定代办、适用的共同签署或豁免。s.5(2) 另需加籍父母或同时申请已获准的父母。',
        'Check the adult signature or authorized representative, minor countersignature and waiver. Section 5(2) also requires a citizen parent or a co-applying parent already granted citizenship.',
      ),
      [
        ref(
          'SRC-260',
          'Citizenship Act ss.2(1), 5(1.04)–(1.05), 5(2); Citizenship Regulations (No. 2) s.4',
        ),
        ref('SRC-262', 'Minor application guides: Who can apply'),
      ],
      ['PD-241'],
    ),
    check(
      'CA-R07',
      L('永久居民身份及条件', 'Permanent residence and outstanding conditions'),
      useSecondment || all(currentPr(req, a, date), a.prConditionsFulfilled),
      useSecondment
        ? exempt
        : L(
            '确认有效 PR、无未履行的身份条件及未决身份审查。',
            'Confirm effective PR, fulfilled conditions and the outcome of any PR investigation.',
          ),
      [
        ref('SRC-074', 'Citizenship Act s.5(1)(c)'),
        ref('SRC-260', 'Citizenship Act ss.5(2), 22(6)'),
        ref('SRC-262', 'Eligibility: Be a permanent resident'),
      ],
      ['PD-241'],
    ),
    presence,
    check(
      'CA-R09',
      L('逐年报税义务', 'Tax filing by year'),
      minor52 || useSecondment || tax.ok,
      minor52 || useSecondment
        ? exempt
        : L(
            `${tax.first}–${tax.last} 税年中已有 ${tax.known} 年确认应报已报或依法无需申报，需 ${v.citTaxYears.value} 年。`,
            `For tax years ${tax.first}–${tax.last}, ${tax.known} years were filed as required or had no filing obligation; ${v.citTaxYears.value} are required.`,
          ),
      [
        ref('SRC-074', 'Citizenship Act s.5(1)(c)(iii)'),
        ref('SRC-260', 'Citizenship Act s.5(1.2)'),
        ref('SRC-262', 'CRA: Do you have to file a tax return?'),
      ],
      ['PD-242'],
    ),
    check(
      'CA-R10',
      L('听说能力与证明', 'Speaking and listening evidence'),
      inBand === undefined
        ? undefined
        : !inBand || any(language, waiver(lang?.waiver)),
      inBand === false
        ? exempt
        : L(
            `签署时核对英语或法语听、说分别达 ${v.citListeningSpeakingLevel.value} 级的认可证据、等效文件或获准豁免。`,
            `At signing, check accepted English or French evidence for speaking and listening at level ${v.citListeningSpeakingLevel.value}, an accepted alternative or approved waiver.`,
          ),
      [
        ref('SRC-074', 'Citizenship Act s.5(1)(d)'),
        ref('SRC-260', 'Citizenship Regulations s.14; Act s.5(3)'),
        ref('SRC-263', 'Language evidence: CLB/NCLC'),
      ],
      lang?.waiver === 'pending' ? ['PD-259'] : undefined,
    ),
    check(
      'CA-R11',
      L('公民知识考试', 'Citizenship knowledge test'),
      inBand === undefined
        ? undefined
        : !inBand || any(knowledge, waiver(test?.waiver)),
      inBand === false
        ? exempt
        : L(
            `共 ${format.questions} 题，${format.minutes} 分钟，须答对 ${format.correct} 题；最多 ${format.attempts} 次机会。等待考试或重考时须确认。`,
            `Answer ${format.correct} of ${format.questions} questions correctly in ${format.minutes} minutes, with up to ${format.attempts} attempts. A pending test or retest is unresolved.`,
          ),
      [
        ref('SRC-074', 'Citizenship Act s.5(1)(e)'),
        ref('SRC-260', 'Citizenship Regulations s.15; Act s.5(3)'),
        ref('SRC-263', 'Citizenship test: Test format and passing score'),
      ],
      test?.waiver === 'pending' ? ['PD-259'] : undefined,
    ),
    check(
      'CA-R12',
      L(
        '移除令、安全宣告及返加授权',
        'Removal order, security declaration and ARC',
      ),
      all(
        minor52 || a.noEffectiveRemovalOrder,
        a.noEffectiveSecurityDeclaration,
        a.returnAuthorizedIfRequired,
      ),
      L(
        '核对适用的移除令、现行安全宣告，以及是否持有依法所需的返加授权。',
        'Check any applicable removal order, current security declaration, and authorization to return if required.',
      ),
      [
        ref('SRC-260', 'Citizenship Act ss.5(1)(f), 19–20, 22(1)(e)'),
        ref('SRC-262', 'Citizenship prohibitions'),
      ],
      ['PD-243'],
    ),
    check(
      'CA-R13',
      L(
        '现行服刑、刑事程序及战争罪禁项',
        'Current sentence, criminal proceedings and war crimes',
      ),
      all(
        a.noCurrentSentenceOrProbation,
        a.noProhibitedCanadianProceedings,
        any(
          a.noEquivalentForeignProceedings,
          waiver(a.foreignProceedingsWaiver),
        ),
        a.noWarCrimesProceedingsOrConviction,
      ),
      L(
        '分别核对缓刑、假释、监禁或适用境外刑罚，国内及等效境外指控、审判或上诉，以及战争罪调查或定罪。',
        'Check probation, parole, incarceration or equivalent foreign sentence, domestic and equivalent foreign proceedings or appeals, and war crimes investigations or convictions.',
      ),
      [ref('SRC-260', 'Citizenship Act s.22(1)(a)–(d), (1.1)')],
      ['PD-243'],
    ),
    check(
      'CA-R14',
      L(
        '定罪、虚报、撤籍及特别禁项',
        'Convictions, fraud, revocation and special prohibitions',
      ),
      historyOk,
      L(
        '按签署日核对适用定罪、虚报禁令和撤籍回溯，以及申请后定罪、当前虚报和特殊禁项；需确认法定分类。',
        'Check dated convictions, misrepresentation bars and revocations, convictions since filing, current misrepresentation and special prohibitions. Statutory classifications must be established.',
      ),
      [ref('SRC-260', 'Citizenship Act s.22(1)(e.1)–(f), (2)–(5)')],
      ['PD-243'],
    ),
    check(
      'CA-R15',
      L(
        '身份、警证及指纹材料',
        'Identity, police certificates and fingerprints',
      ),
      all(
        a.identityAndDeclarationsReady,
        certs,
        a.fingerprintAndCourtRequestsSatisfied,
      ),
      L(
        `确认身份声明及 IRCC 要求的指纹或法庭文件。成人申请前 ${v.citPoliceLookbackYears.value} 年内，成年后在境外同一国家连续 ${v.citPoliceSingleStayDays.value} 天起核对警证或获准例外。`,
        `Check identity declarations and any IRCC fingerprint or court requests. For adults, check the certificate or accepted exception for a continuous stay of ${v.citPoliceSingleStayDays.value} days in one foreign country after turning adult in the previous ${v.citPoliceLookbackYears.value} years.`,
      ),
      [
        ref('SRC-260', 'Citizenship Regulations (No. 2) ss.2, 4'),
        ref('SRC-262', 'CIT 0002 Q13, Q16'),
      ],
      ['PD-245'],
    ),
    check(
      'CA-R16',
      L('宣誓与授予时资格', 'Oath and continued eligibility at grant'),
      all(oath, a.stillEligibleAtGrant),
      L(
        `按授予日年龄判断；满 ${v.citSignatureOathAge.value} 岁通常须宣誓，另核书面豁免及授予时资格。`,
        `Use age at grant. From ${v.citSignatureOathAge.value}, check the oath or written waiver and continued eligibility at grant.`,
      ),
      [
        ref('SRC-260', 'Citizenship Act ss.3(1)(c), 5(3), 22(6), 24'),
        ref('SRC-262', 'Eligibility: Take the oath'),
      ],
      a.oathWaiver === 'pending' ? ['PD-259'] : undefined,
      !a.grantDate,
    ),
    check(
      'CA-R17',
      L('入籍费用', 'Citizenship fees'),
      a.citizenshipFeesPaid,
      (chargeKnown
        ? L(`应付 CAD ${fee}。`, `Fee due: CAD ${fee}. `)
        : L(
            '需确认该申请日适用的官方费表及年龄（PD-258）。',
            'Confirm the fee schedule for the application date and the age at filing (PD-258). ',
          )) +
        L(
          '申请时须缴清费用并附上凭证。正常考试及宣誓不另收费。',
          'Pay the full application fee and include the receipt when filing. There is no separate charge for the normal test or oath.',
        ),
      [
        ref('SRC-260', 'Citizenship Regulations ss.31–32 and Schedule'),
        ref(
          'SRC-260',
          'Citizenship Regulations (No. 2) ss.2(1)(i), 2(2)(i), 2(3)(e), 4(c)',
        ),
        ref(
          'SRC-264',
          'Fee list: Citizenship; right of citizenship fee adjustment',
        ),
      ],
    ),
    check(
      'CA-R18',
      L(
        '收入、住房、保险及地址登记',
        'Income, housing, insurance and registration',
      ),
      true,
      L(
        '本类入籍无独立收入、住房、私人医保、体检或住址登记门槛；表格仍要求通信地址。',
        'This grant has no independent income, housing, private insurance, medical exam or residence registration threshold. Provide the mailing address on the form.',
      ),
      [
        ref('SRC-260', 'Citizenship Act s.5(1)–(2)'),
        ref('SRC-262', 'Eligibility requirements'),
      ],
      undefined,
      true,
    ),
    ...(!minor52
      ? [
          check(
            'CA-R19',
            L('军队服役特别条款', 'Canadian Armed Forces service'),
            !useService ||
              all(
                caf?.serviceConfirmed,
                caf?.signedForDate === date
                  ? threshold(caf.yearsOfQualifyingService, v.citCafYears.value)
                  : undefined,
                usePrService
                  ? caf?.release
                    ? caf.release !== 'other'
                    : undefined
                  : true,
              ),
            !useService
              ? L(
                  '按普通居住时钟评估。',
                  'Assessed using the ordinary physical presence clock.',
                )
              : L(
                  `需 CAF 确认证明申请前 ${v.citCafWindowYears.value} 年内有 ${v.citCafYears.value} 年合资格服役，以及适用的借调或退役记录。`,
                  `CAF records must establish ${v.citCafYears.value} years of qualifying service in the preceding ${v.citCafWindowYears.value} years and the applicable secondment or release status.`,
                ),
            [
              ref(
                'SRC-260',
                'Citizenship Act s.5(1.2)–(1.3); Citizenship Regulations (No. 2) s.2(2)–(3)',
              ),
            ],
            ['PD-241'],
          ),
        ]
      : []),
  ];
}

export function residenceChecks(
  ctx: Context,
  id: 'CA-RESIDENCY' | GrantPath,
): Item[] {
  const a = ctx.req.residence ?? {};
  return id === 'CA-RESIDENCY'
    ? prChecks(ctx, a)
    : citizenshipChecks(ctx, a, id);
}
