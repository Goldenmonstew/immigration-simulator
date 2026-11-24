import { grSource, greeceFull2026_11 } from '@uk-immigration/policy-data';
import type { CountryCheck } from './country-result';
import { addMonths, addYears } from './dates';
import type { GrFullPathwayId, GrFullRequest } from './greece-full';
import { ageOn, all, insuranceMet } from './greece-rules';
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

export function passportCheck(
  id: GrFullPathwayId,
  req: GrFullRequest,
  c: GrContext,
  filingDate: IsoDate,
) {
  const nationality = id === 'GR-NATIONALITY';
  const identityOnly =
    nationality || id === 'GR-EU-FAMILY-PR' || id === 'GR-GREEK-FAMILY-PR';
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
  if (filingDate > req.simulationDate && met !== true)
    return c.check(
      'C-01',
      '递件日的旅行证件',
      'Travel document on the filing date',
      undefined,
      sources,
      `现有证件在预计递件日 ${filingDate} 不符合要求。请补充届时有效的换发证件或获认可的替代证明。`,
      `The current document will not qualify on the projected filing date, ${filingDate}. Provide evidence of a replacement or an accepted substitute valid on that date.`,
    );
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
  const age = ageOn(req.birthDate, req.simulationDate);
  const listed =
    facts?.seriousListingRemovalRefused ||
    (facts?.seriousSecurityListingYears !== undefined &&
      facts.seriousSecurityListingYears > limits.listingYears);
  const review =
    facts?.repeatOffences ||
    (facts?.finalSentenceMonths !== undefined &&
      facts.finalSentenceMonths >= limits.sentenceMonths);
  const met =
    age !== undefined && age < limits.childScreenAge
      ? true
      : listed || req.publicOrder === 'adverse'
        ? false
        : req.publicOrder === 'clear'
          ? true
          : undefined;
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
  const age = ageOn(req.birthDate, req.simulationDate);
  const exempt =
    (age !== undefined && age < limits.fingerprintAge) ||
    req.biometrics === 'medical-exemption';
  const missed = req.missedFingerprintAppointments;
  const met = exempt
    ? true
    : missed !== undefined && missed >= limits.missedAppointments
      ? false
      : req.biometrics === 'provided' ||
          req.biometrics === 'awaiting-appointment'
        ? true
        : undefined;
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

export function commonChecks(
  id: GrFullPathwayId,
  req: GrFullRequest,
  c: GrContext,
): CountryCheck[] {
  const nat = id === 'GR-NATIONALITY';
  if (nat && req.nationality?.stage === 'oath') return [];
  const greekFamily = id === 'GR-GREEK-FAMILY-PR';
  const euFamily = id === 'GR-EU-FAMILY-PR';
  if (
    (greekFamily && req.greekFamily?.stage === 'maintain') ||
    (euFamily && req.euFamily?.stage === 'maintain')
  )
    return [];
  const filedOn = nat && req.nationality?.pendingApplicationFiledOn;
  const checks = [
    passportCheck(
      id,
      req,
      c,
      filedOn && filedOn <= req.simulationDate ? filedOn : req.simulationDate,
    ),
  ];
  if (nat) return checks;
  const work = id === 'GR-WORK';
  const reunion = id === 'GR-FAMILY-TCN';
  const gold = id === 'GR-GOLDEN-VISA';
  const entry = req.entry;
  const kind = work ? req.work?.permit : undefined;
  const renewal = work
    ? req.work?.stage === 'renewal'
    : reunion
      ? req.familyTcn?.stage === 'renewal'
      : id === 'GR-LONG-TERM'
        ? req.longTerm?.stage === 'renewal'
        : id === 'GR-TEN-YEAR' && req.tenYear?.stage === 'renewal';
  const initialGold = gold && initialInvestor(req);
  const overseas = initialGold && overseasInvestorFiling(req);
  const initialEntry =
    initialGold ||
    (greekFamily && req.greekFamily?.stage === 'initial') ||
    (work && !renewal) ||
    (reunion && req.familyTcn?.stage === 'initial');
  if (initialEntry) {
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
  if (!greekFamily && !euFamily && id !== 'GR-LONG-TERM')
    checks.push(characterCheck(req, c));
  if (
    initialEntry &&
    (reunion ||
      entry === 'national-visa' ||
      entry === 'short-stay' ||
      entry === 'outside' ||
      entry === undefined)
  ) {
    const deferred =
      req.deferredInitialEvidence?.includes('public-hospital-certificate') &&
      req.publicHealth === undefined;
    checks.push(
      c.check(
        'C-04',
        '首次入境公共卫生要求',
        'Public health at first entry',
        req.publicHealth === 'cleared' || deferred
          ? true
          : req.publicHealth === 'entry-refused'
            ? false
            : undefined,
        [
          grSource('F16', 'arts. 8(d), 10(9), 176(11)'),
          ...(reunion ? [grSource('F16', 'art. 88(1)(α)–(β)')] : []),
          ...(reunion && req.familyTcn?.sponsor === 'blue-card'
            ? [grSource('F60', 'procedure 517141, condition 5')]
            : []),
        ],
        deferred
          ? `首次递件后 ${p.initialEvidenceMonths.value} 个月内补交公立医院证明。`
          : '需确认首次入境的公共卫生结论。可能的风险须由主管机关认定。',
        deferred
          ? `Supply the public hospital certificate within ${p.initialEvidenceMonths.value} months of filing.`
          : 'Confirm public health clearance for first entry. A possible risk requires a decision by the competent authority.',
        req.publicHealth === 'possible-risk' ? ['PD-302'] : [],
      ),
    );
  }
  // Specialised checks add dependent coverage, registration for work, or the rules for retained rights.
  if (
    gold ||
    (id === 'GR-TEN-YEAR' && !renewal) ||
    (id === 'GR-LONG-TERM' && !renewal)
  ) {
    const mode = gold ? 'private' : 'either';
    checks.push(
      c.check(
        'C-05',
        '医疗保险凭证',
        'Health insurance evidence',
        overseas || insuranceMet(req.insurance, mode),
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
  if (!euFamily) checks.push(changeCheck(req, c));
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
  } else checks.push(cardCheck(req, c));
  if (renewal) checks.push(renewalCheck(id, req, c));
  return checks;
}
