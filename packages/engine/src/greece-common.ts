import { grSource, greeceFull2026_11 } from '@uk-immigration/policy-data';
import type { CountryCheck } from './country-result';
import { addMonths, addYears } from './dates';
import type { GrFullPathwayId, GrFullRequest } from './greece-full';
import { all, any, insuranceMet, underAgeOn } from './greece-rules';
import type { GrContext } from './greece-rules';
import { isJointInitialApplication } from './greece-work-family';
import type { IsoDate } from './types';

const p = greeceFull2026_11.values;
export interface GrCommonAnswers {
  passport?: {
    kind:
      'recognised' | 'unavailable' | 'exception-pending' | 'exception-granted';
    issuedOn?: IsoDate;
    expiresOn?: IsoDate;
    blankPages?: number;
    /** The intended departure date, where it is defined for the application. */
    expectedDeparture?: IsoDate;
  };
  publicOrder?: 'clear' | 'review' | 'adverse';
  /** General permit screening; a conviction triggers an assessment by the authority. */
  character?: {
    finalSentenceMonths?: number;
    repeatOffences?: boolean;
    seriousSecurityListingYears?: number;
    seriousListingRemovalRefused?: boolean;
  };
  publicHealth?: 'cleared' | 'possible-risk' | 'entry-refused';
  changes?: {
    kind: 'ordinary' | 'birth' | 'passport-renewed';
    occurredOn: IsoDate;
    reportedOn?: IsoDate;
    /** For a renewed passport, the filing date of the next renewal/replacement. */
    nextCardFiling?: IsoDate;
  }[];
  biometrics?: 'provided' | 'medical-exemption' | 'awaiting-appointment';
  missedFingerprintAppointments?: number;
  /** Consular or duly legalised/notarised mandate to file an investment application before entry. */
  overseasInvestorMandate?: boolean;
  deferredInitialEvidence?: (
    'public-insurance-application' | 'public-hospital-certificate'
  )[];
  currentCardExpiresOn?: IsoDate;
  renewalForceMajeure?: 'approved' | 'pending' | 'none';
}

function passportCheck(
  document: 'travel' | 'identity' | 'nationality',
  req: GrFullRequest,
  c: GrContext,
  filingDate: IsoDate,
) {
  const nationality = document === 'nationality';
  const identityOnly = document !== 'travel';
  const doc = req.passport;
  const rules = p.passport.value;
  let met: boolean | undefined;
  let uncertain = false;
  if (doc?.kind === 'exception-granted') met = true;
  if (doc?.kind === 'unavailable') met = false;
  if (doc?.kind === 'exception-pending') uncertain = true;
  if (doc?.kind === 'recognised') {
    const valid =
      doc.expiresOn === undefined ? undefined : doc.expiresOn >= filingDate;
    met = identityOnly
      ? valid
      : all(
          valid,
          doc.blankPages === undefined
            ? undefined
            : doc.blankPages >= rules.blankPages,
          doc.issuedOn === undefined
            ? undefined
            : doc.issuedOn >= addYears(filingDate, -rules.issueYears) &&
                doc.issuedOn <= filingDate,
          doc.expectedDeparture === undefined || doc.expiresOn === undefined
            ? undefined
            : doc.expiresOn >=
                addMonths(doc.expectedDeparture, rules.remainingMonths),
        );
    uncertain = !identityOnly && doc.expectedDeparture === undefined;
  }
  const sources = nationality
    ? [grSource('F34', 'ΚΕΙ art. 6(1)(a)')]
    : identityOnly
      ? [grSource('F21', 'arts. 25, 59'), grSource('F02', 'art. 10')]
      : p.passport.sources;
  return c.check(
    'C-01',
    '有效旅行证件或获准的无护照例外',
    'Valid travel document or recognised passport exemption',
    met,
    sources,
    identityOnly
      ? '核对有效身份证明或已获认可的替代证件。'
      : `核对认可的证件、最近 ${rules.issueYears} 年签发、至少 ${rules.blankPages} 个空白页及预计离境后 ${rules.remainingMonths} 个月的有效期。无明确离境基准或例外未获认定时需核实。`,
    identityOnly
      ? 'Provide a valid identity document or an accepted substitute.'
      : `The recognised document must be issued within ${rules.issueYears} years, have ${rules.blankPages} blank pages and remain valid ${rules.remainingMonths} months past intended departure. An unclear departure date or a pending exemption needs confirmation.`,
    uncertain ? ['PD-300'] : [],
  );
}

function characterCheck(req: GrFullRequest, c: GrContext) {
  const limits = p.generalCharacter.value;
  const facts = req.character;
  const listed =
    facts?.seriousListingRemovalRefused ||
    (facts?.seriousSecurityListingYears !== undefined &&
      facts.seriousSecurityListingYears > limits.listingYears);
  const review =
    facts?.repeatOffences ||
    (facts?.finalSentenceMonths !== undefined &&
      facts.finalSentenceMonths >= limits.sentenceMonths);
  const met = any(
    underAgeOn(req.birthDate, req.simulationDate, limits.childScreenAge),
    listed || req.publicOrder === 'adverse'
      ? false
      : req.publicOrder === 'clear' || undefined,
  );
  return c.check(
    'C-03',
    '公共秩序与安全审查',
    'Public order and security',
    met,
    p.generalCharacter.sources,
    `终审刑期达到 ${limits.sentenceMonths} 个月或反复违法要综合审查；严重安全名单的法定拒绝情形及已作出的不利决定分别核对。`,
    `A final sentence of at least ${limits.sentenceMonths} months or repeated offences calls for individual assessment. A statutory security-list bar and an adverse decision are checked separately.`,
    review || req.publicOrder === 'review' ? ['PD-301'] : [],
  );
}

function changeCheck(req: GrFullRequest, c: GrContext) {
  const limits = p.changeReporting.value;
  const answers = req.changes
    ?.filter((change) => change.occurredOn <= req.simulationDate)
    .map((change) => {
      const deadline =
        change.kind === 'passport-renewed'
          ? change.nextCardFiling
          : change.kind === 'birth'
            ? addYears(change.occurredOn, limits.birthYears)
            : addMonths(change.occurredOn, limits.months);
      if (!deadline) return undefined;
      if (change.reportedOn && change.reportedOn <= req.simulationDate)
        return change.reportedOn <= deadline;
      return req.simulationDate <= deadline;
    });
  return c.check(
    'C-06',
    '住址和身份变更申报',
    'Address and identity change notifications',
    answers ? all(...answers) : undefined,
    p.changeReporting.sources,
    `一般变更限 ${limits.months} 个月，新生儿限 ${limits.birthYears} 年，护照续发可在下次换卡时申报。漏报罚款 €${limits.firstFine}，再犯 €${limits.repeatFine}。`,
    `Report ordinary changes within ${limits.months} months and a birth within ${limits.birthYears} years. Report a renewed passport by the next card filing. Fines are €${limits.firstFine} or €${limits.repeatFine} for recurrence.`,
  );
}

function cardCheck(req: GrFullRequest, c: GrContext) {
  const limits = p.cardFormalities.value;
  const missed = req.missedFingerprintAppointments;
  const met = any(
    underAgeOn(req.birthDate, req.simulationDate, limits.fingerprintAge),
    req.biometrics === 'medical-exemption',
    missed !== undefined && missed >= limits.missedAppointments
      ? false
      : req.biometrics === 'provided' ||
          req.biometrics === 'awaiting-appointment' ||
          undefined,
  );
  return c.check(
    'C-07',
    '指纹通知与制卡',
    'Fingerprint appointments and card issue',
    met,
    p.cardFormalities.sources,
    `制卡费 €${limits.printFee}。自 ${limits.fingerprintAge} 岁起须按通知采集指纹，身体原因可凭医疗证明豁免。尚待预约可递件；两次缺席会被驳回。`,
    `The card costs €${limits.printFee}. From age ${limits.fingerprintAge} attend when summoned, subject to a documented medical exemption. Awaiting an appointment allows filing; missing both appointments leads to refusal.`,
  );
}

function initialInvestor(req: GrFullRequest) {
  return req.goldenVisa?.stage
    ? req.goldenVisa.stage === 'initial'
    : !req.permits?.some(
        (x) => x.kind === 'investor' && x.from <= req.simulationDate,
      );
}

export function overseasInvestorFiling(req: GrFullRequest) {
  return (
    initialInvestor(req) &&
    req.entry === 'outside' &&
    req.overseasInvestorMandate === true &&
    !req.goldenVisa?.overseasFilingDate
  );
}

export function ordinaryRenewalWindow(
  req: GrFullRequest,
  expiry: IsoDate,
  c: GrContext,
) {
  const current = req.simulationDate >= p.workReformEffective.value;
  const early = addMonths(expiry, -p.renewalWindowMonths.value);
  const late = addMonths(
    expiry,
    current ? p.lateRenewalMonths.value : p.originalLateRenewal.value.months,
  );
  const met =
    req.simulationDate < early
      ? early
      : req.simulationDate <= late
        ? true
        : req.renewalForceMajeure === 'pending'
          ? undefined
          : req.renewalForceMajeure === 'approved';
  const fine = current
    ? c.L(
        `每逾期一个月 €${p.lateFinePerMonthEur.value}`,
        `€${p.lateFinePerMonthEur.value} per late month`,
      )
    : c.L(
        `逾期罚款 €${p.originalLateRenewal.value.fineEur}`,
        `a late fee of €${p.originalLateRenewal.value.fineEur}`,
      );
  const sources = current
    ? [...p.renewalWindowMonths.sources, ...p.workReformEffective.sources]
    : p.originalLateRenewal.sources;
  const text = c.L(
    `自 ${early} 可递交，逾期截至 ${late}，${fine}。超过期限需认可的不可抗力理由。`,
    `File from ${early}, or late through ${late} with ${fine}. A later filing needs accepted force majeure.`,
  );
  return { met, early, late, sources, text };
}

function renewalCheck(id: GrFullPathwayId, req: GrFullRequest, c: GrContext) {
  const expiry =
    (id === 'GR-TEN-YEAR' && req.tenYear?.cardExpiresOn) ||
    (id === 'GR-GREEK-FAMILY-PR' && req.greekFamily?.priorCardExpiry) ||
    req.currentCardExpiresOn;
  if (id === 'GR-LONG-TERM')
    return c.check(
      'C-07-window',
      '长期居民换卡期限',
      'Long-term resident card renewal deadline',
      expiry ? req.simulationDate < expiry : undefined,
      [grSource('F16', 'art. 146(2)')],
      '须在卡片到期前申请换卡，第 11(1) 条的一般续期窗口不适用。',
      'Apply before the card expires. Article 146(2) excludes the ordinary renewal window.',
    );
  const window = expiry && ordinaryRenewalWindow(req, expiry, c);
  return c.check(
    'C-07-window',
    '居留卡续期递交窗口',
    'Residence card renewal window',
    window ? window.met : undefined,
    window ? window.sources : p.renewalWindowMonths.sources,
    window ? window.text : '请填写当前卡片到期日。',
    window ? window.text : 'Enter the expiry date on the current card.',
  );
}

function autonomousInsuranceCheck(req: GrFullRequest, c: GrContext) {
  const family = req.familyTcn;
  const application =
    family?.appliedForFullPublicCover ??
    req.deferredInitialEvidence?.includes('public-insurance-application') ??
    false;
  // A gap records past coverage, not current insurance at the initial grant.
  const cover =
    req.insurance?.kind === 'gap'
      ? undefined
      : insuranceMet(req.insurance, 'either');
  const personalCover =
    req.insurance?.kind === 'private'
      ? all(cover, family?.privateCoverPermitted)
      : cover;
  return c.check(
    'C-05',
    '自主居留申请人本人的完整医保',
    'Comprehensive cover for the autonomous permit applicant',
    application || personalCover,
    [
      grSource('F16', 'arts. 8(ε), 10(9), 90(6)–(7), pp. 15, 18, 61'),
      grSource('F21', 'arts. 2(δ), 24(1.1)–(1.3), pp. 2, 17'),
      ...p.privateInsurance.sources,
    ],
    `核对本人有效公保或全额参保申请。申请凭证可在递件后 ${p.initialEvidenceMonths.value} 个月内补交。使用私保须确认本次手续允许，并达到完整保障标准。`,
    `Verify the applicant's active public cover or application for full insurance. The registration certificate may follow within ${p.initialEvidenceMonths.value} months of filing. A private policy must be permitted for this applicant and meet the full coverage requirements.`,
  );
}

interface CommonProcedure {
  passport: 'travel' | 'identity' | 'nationality';
  entry?: true;
  publicOrder?: true;
  publicHealth?: true;
  insurance?: 'either' | 'private' | 'initial-personal';
  changes?: true;
  card?: true;
  renewalWindow?: true;
}

// Only common checks are listed here. Each route also assesses its specific
// grounds, e.g. family-wide cover, employment registration or a retained right.
const permit = {
  passport: 'travel',
  publicOrder: true,
  changes: true,
  card: true,
} as const;
const longTermCard = { passport: 'travel', changes: true, card: true } as const;
const euCard = { passport: 'identity', card: true } as const;
const greekCard = { ...euCard, changes: true } as const;
const initialPermit = { ...permit, entry: true, publicHealth: true } as const;
const renewalPermit = { ...permit, renewalWindow: true } as const;

const procedures = {
  'GR-LONG-TERM': {
    initial: { ...longTermCard, insurance: 'either' },
    renewal: { ...longTermCard, renewalWindow: true },
  },
  'GR-GOLDEN-VISA': {
    initial: { ...initialPermit, insurance: 'private' },
    renewal: { ...permit, insurance: 'private' },
  },
  'GR-NATIONALITY': {
    application: { passport: 'nationality' },
    oath: undefined,
  },
  'GR-TEN-YEAR': {
    initial: { ...permit, insurance: 'either' },
    renewal: renewalPermit,
  },
  'GR-GREEK-FAMILY-PR': {
    initial: { ...greekCard, entry: true },
    renewal: { ...greekCard, renewalWindow: true },
    retained: greekCard,
    permanent: greekCard,
    maintain: undefined,
    unspecified: greekCard,
  },
  'GR-EU-FAMILY-PR': {
    retained: euCard,
    permanent: euCard,
    maintain: undefined,
    unspecified: euCard,
  },
  'GR-WORK': {
    initial: initialPermit,
    renewal: renewalPermit,
    unspecified: { ...permit, entry: true },
  },
  'GR-FAMILY-TCN': {
    initial: initialPermit,
    renewal: renewalPermit,
    unspecified: permit,
    autonomous: { ...permit, insurance: 'initial-personal' },
    childCardOnly: permit,
  },
} as const satisfies Record<
  GrFullPathwayId,
  Record<string, CommonProcedure | undefined>
>;

function familyProcedure(req: GrFullRequest) {
  const family = req.familyTcn;
  if (family?.stage !== 'autonomous') return family?.stage ?? 'unspecified';
  if (!family.autonomousBasis) return 'unspecified';
  if (family.autonomousBasis !== 'child') return 'autonomous';
  // Arts. 95(2) and 90(5): the investor child's grant and the ordinary
  // child's later extension each require the previous card as specific evidence.
  const firstCard = underAgeOn(
    req.birthDate,
    req.simulationDate,
    p.familyAutonomy.value.childRenewalAge,
  );
  if (family.sponsor === 'investor' || firstCard === false)
    return 'childCardOnly';
  return firstCard && family.sponsor ? 'autonomous' : 'unspecified';
}

function procedureFor(
  id: GrFullPathwayId,
  req: GrFullRequest,
): CommonProcedure | undefined {
  switch (id) {
    case 'GR-LONG-TERM':
      return procedures[id][req.longTerm?.stage ?? 'initial'];
    case 'GR-GOLDEN-VISA':
      return procedures[id][initialInvestor(req) ? 'initial' : 'renewal'];
    case 'GR-NATIONALITY':
      return procedures[id][req.nationality?.stage ?? 'application'];
    case 'GR-TEN-YEAR':
      return procedures[id][req.tenYear?.stage ?? 'initial'];
    case 'GR-GREEK-FAMILY-PR':
      return procedures[id][req.greekFamily?.stage ?? 'unspecified'];
    case 'GR-EU-FAMILY-PR':
      return procedures[id][req.euFamily?.stage ?? 'unspecified'];
    case 'GR-WORK':
      return procedures[id][req.work?.stage ?? 'unspecified'];
    case 'GR-FAMILY-TCN':
      return procedures[id][familyProcedure(req)];
  }
}

export function commonChecks(
  id: GrFullPathwayId,
  req: GrFullRequest,
  c: GrContext,
): CountryCheck[] {
  const procedure = procedureFor(id, req);
  if (!procedure) return [];
  const filedOn =
    procedure.passport === 'nationality' &&
    req.nationality?.pendingApplicationFiledOn;
  const checks = [
    passportCheck(
      procedure.passport,
      req,
      c,
      filedOn && filedOn <= req.simulationDate ? filedOn : req.simulationDate,
    ),
  ];
  const work = id === 'GR-WORK';
  const reunion = id === 'GR-FAMILY-TCN';
  const entry = req.entry;
  const kind = work ? req.work?.permit : undefined;
  const initialGold = id === 'GR-GOLDEN-VISA' && procedure.entry;
  const overseas = initialGold && overseasInvestorFiling(req);
  if (procedure.entry) {
    const greekFamily = id === 'GR-GREEK-FAMILY-PR';
    const family = req.familyTcn;
    const blueCardFamily = reunion && family?.sponsor === 'blue-card';
    const unconfirmedShortStay =
      blueCardFamily &&
      entry === 'short-stay' &&
      isJointInitialApplication(family) &&
      !family.sponsorPermitValid;
    const shortStayOk =
      initialGold ||
      greekFamily ||
      blueCardFamily ||
      kind === 'E1' ||
      (work && req.work?.admission === 'strategic-project');
    let allowed: boolean | undefined;
    switch (entry) {
      case 'outside':
        if (initialGold) allowed = req.overseasInvestorMandate;
        else if (greekFamily) allowed = false;
        break;
      case 'receipt':
      case 'restricted-permit':
        if (initialGold) allowed = true;
        break;
      case 'short-stay':
        if (!work || (kind && (kind === 'E1' || req.work?.admission)))
          allowed = unconfirmedShortStay ? undefined : shortStayOk;
        break;
      case 'national-visa':
      case 'permit':
        allowed = true;
        break;
      case 'unlawful':
        allowed = false;
        break;
    }
    checks.push(
      c.check(
        'C-02',
        '入境依据及境内申请资格',
        'Lawful entry and in-country filing',
        allowed,
        [
          grSource('F16', 'arts. 8(b), 10(1),(11), 12, 84, 93, 100'),
          grSource('F36', 'arts. 13, 21'),
          ...(blueCardFamily
            ? [
                grSource('F16', 'arts. 42(1)–(3), 86(1)'),
                grSource(
                  'F60',
                  'procedure 517141, conditions 2–3, documents 1–3',
                ),
              ]
            : []),
          ...(initialGold
            ? [
                grSource('F23', 'art. 64, art. 100(1)(a)'),
                grSource('F21', 'art. 31(2.1, 2.3)(α)'),
              ]
            : []),
        ],
        initialGold && entry === 'outside'
          ? `境外可凭合规授权书递件。自递件起 ${p.investorEntryMonths.value} 个月内须入境补录指纹及欠交的保险凭证。`
          : blueCardFamily
            ? '家属可持团聚 D 签递件。主卡已签发时，家属也可凭申根短期签证或免签入境证明在合法停留期内递件。主卡待批时，须核实合法短停能否用于同步首签。'
            : '核对申请类别对应的入境签证、免签或准许转换的居留证件。境外邀请阶段尚需核实实际入境文件。',
        initialGold && entry === 'outside'
          ? `A qualifying mandate allows filing before entry. Enter within ${p.investorEntryMonths.value} months of filing to submit biometrics and any outstanding insurance evidence.`
          : blueCardFamily
            ? 'A family member may file with a family D visa. Once the Blue Card is issued, the family member may also file during a lawful short stay with a uniform visa or evidence of visa-free entry. Confirm whether short-stay entry permits joint filing while the Blue Card is pending.'
            : 'Check the visa for this purpose, lawful short stay or qualifying change of status. An invitation from abroad still requires entry documents for the permit.',
        unconfirmedShortStay ? ['PD-319'] : undefined,
      ),
    );
  }
  if (procedure.publicOrder) checks.push(characterCheck(req, c));
  if (procedure.publicHealth) {
    const deferred =
      req.deferredInitialEvidence?.includes('public-hospital-certificate') &&
      req.publicHealth === undefined;
    checks.push(
      c.check(
        'C-04',
        '首次申领本类居留许可的公共卫生条件',
        'Public health for the initial grant of this permit',
        req.publicHealth === 'cleared' || deferred
          ? true
          : req.publicHealth === 'entry-refused'
            ? false
            : undefined,
        [
          grSource('F16', 'arts. 8(d), 10(9), 176(11)'),
          ...(kind === 'E1'
            ? [grSource('F16', 'arts. 31(1)(στ), 35(1)(γ)')]
            : []),
          ...(kind === 'E4'
            ? [grSource('F49', 'initial grant, condition 7')]
            : []),
          ...(initialGold && req.goldenVisa?.kind === 'conversion'
            ? [grSource('F40', 'initial grant, conditions 2, 11')]
            : []),
          ...(reunion ? [grSource('F16', 'art. 88(1)(β)')] : []),
          ...(reunion && req.familyTcn?.sponsor === 'blue-card'
            ? [grSource('F60', 'procedure 517141, condition 5')]
            : []),
        ],
        deferred
          ? `首次递件后 ${p.initialEvidenceMonths.value} 个月内补交公立医院证明。`
          : '本类别首签须符合公共卫生条件。可能的风险须由主管机关认定。',
        deferred
          ? `Supply the public hospital certificate within ${p.initialEvidenceMonths.value} months of filing.`
          : 'Public health clearance is required for the initial grant of this permit. A possible risk requires a decision by the competent authority.',
        req.publicHealth === 'possible-risk' ? ['PD-302'] : [],
      ),
    );
  }
  if (procedure.insurance === 'initial-personal') {
    checks.push(autonomousInsuranceCheck(req, c));
  } else if (procedure.insurance) {
    checks.push(
      c.check(
        'C-05',
        '医疗保险凭证',
        'Health insurance evidence',
        overseas || insuranceMet(req.insurance, procedure.insurance),
        overseas
          ? [...p.privateInsurance.sources, ...p.investorEntryMonths.sources]
          : p.privateInsurance.sources,
        overseas
          ? `可由代理人递件，须在递件后 ${p.investorEntryMonths.value} 个月内入境并补交合格医保凭证。`
          : '私保须核对全年三项年度保额、最高自付比例及有无免赔和除外条款。公保按许可类别核对。',
        overseas
          ? `Filing by mandate is permitted. Enter and provide qualifying insurance within ${p.investorEntryMonths.value} months of filing.`
          : 'Check all three annual limits, maximum copay, deductibles, exclusions and duration for private coverage. Public coverage depends on the permit category.',
        req.insurance?.kind === 'gap' ? ['PD-303'] : [],
      ),
    );
  }
  if (procedure.changes) checks.push(changeCheck(req, c));
  if (overseas || (initialGold && req.goldenVisa?.overseasFilingDate)) {
    const filed = req.goldenVisa?.overseasFilingDate;
    const completed = req.goldenVisa?.overseasEvidenceCompletedOn;
    const deadline = filed && addMonths(filed, p.investorEntryMonths.value);
    const met =
      overseas ||
      (filed && deadline && completed
        ? completed >= filed &&
          completed <= deadline &&
          completed <= req.simulationDate
        : undefined);
    checks.push(
      c.check(
        'C-07',
        '入境及补交制卡材料',
        'Entry and outstanding card evidence',
        met,
        p.investorEntryMonths.sources,
        `境外首次递件可延后提交指纹，入境、保险与生物识别材料须在递件后 ${p.investorEntryMonths.value} 个月内完成。`,
        `Biometrics may follow the initial overseas filing. Complete entry, insurance and biometrics within ${p.investorEntryMonths.value} months of filing.`,
      ),
    );
  } else if (procedure.card) checks.push(cardCheck(req, c));
  if (procedure.renewalWindow) checks.push(renewalCheck(id, req, c));
  return checks;
}
