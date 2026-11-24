import { auPublicCriteria as p } from '@uk-immigration/policy-data';
import { checker } from './australia-check';
import { feeChecks, type AuFeeAnswers } from './australia-fees';
import type { AuFullPathId, AuFullRequest } from './australia-full';
import type { CountryCheck } from './country-result';
import { addMonths, addYears, fullYears } from './dates';
import type { IsoDate } from './types';

type Decision = 'cleared' | 'adverse' | 'pending';

export interface AuCommonAnswers {
  fees?: AuFeeAnswers;
  /** Give the least favourable result among people to whom the criterion applies. */
  publicInterest?: {
    health?:
      | 'cleared'
      | 'no-known-condition'
      | 'cost-risk'
      | 'cost-finding'
      | 'waiver-granted'
      | 'waiver-refused'
      | 'public-health-failure';
    character?:
      | 'clear-history'
      | 'other-record'
      | 'statutory-failure'
      | 'favourable-decision';
    /** For the person with the longest aggregate sentence, including concurrent terms. */
    prisonSentenceMonths?: number;
    policeDocuments?:
      | 'supplied'
      | 'not-requested'
      | 'outstanding'
      | 'waiver-pending'
      | 'waived';
    securityAndForeignPolicy?: Decision;
    criticalTechnology?: Decision | 'sensitive-field';
    commonwealthDebt?: 'none' | 'arranged' | 'outstanding';
    officialPassport?: boolean;
    passportException?: 'pending' | 'accepted';
    /** All people of the required age have signed or hold a ministerial exemption. */
    valuesSigned?: boolean;
    noOtherApplicantOfValuesAge?: boolean;
    /** All applicable custody/consent and best-interests criteria for minors. */
    childInterestsSatisfied?: boolean;
    settlementWithoutUndueDifficulty?: boolean;
    /** Also includes support available in Australia to applicants joining family. */
    permanentSettlementAndSupport?: boolean;
    /** Include family members. Exclude refusals to which the under-age exception applies. */
    integrity?: {
      identityEstablished: boolean;
      accurateDocuments: boolean;
      lastIdentityRefusal: IsoDate | null;
      lastDocumentRefusal: IsoDate | null;
      documentWaiver?: 'pending' | 'granted';
    };
    /** Includes unrevoked character cancellations or refusals covered by cl 5001. */
    returnBan5001?: boolean;
    removedOn?: IsoDate | null;
    removalWaiver?: 'pending' | 'granted';
    sponsoredStudy?: {
      applies: boolean;
      courseMonths?: number;
      /** Years spent outside Australia since ceasing the approved course. */
      yearsOutsideSinceCeasing?: number;
      support?: 'granted' | 'pending' | 'none';
    };
    temporaryInsurance?: 'maintained' | 'not-applicable' | 'lapsed';
  };
}

const visaClauses: Record<Exclude<AuFullPathId, 'AU-CITIZENSHIP'>, string> = {
  'AU-186-TRT': '186.213–214, 186.224',
  'AU-186-DE': '186.213–214, 186.235',
  'AU-189-PT': '189.211–212, 189.225–226',
  'AU-189-HK': '189.211–212, 189.243',
  'AU-190': '190.216–217',
  'AU-191': '191.211–212',
  'AU-191-HK': '191.211–212',
  'AU-PARTNER': '820.223–226, 801.223–226, 309.225–229, 100.222–225',
  'AU-858': '858.221–228',
  'AU-RRV': '155.221–222, 157.221–222',
};

function officialDecision(value?: Decision | 'sensitive-field') {
  if (value === 'cleared') return true;
  if (value === 'adverse') return false;
  return undefined;
}

export function commonChecks(
  id: AuFullPathId,
  r: AuFullRequest,
): CountryCheck[] {
  const costs = feeChecks(id, r);
  if (id === 'AU-CITIZENSHIP') return costs;
  const c = r.publicInterest ?? {};
  const check = checker(r.locale);
  const checks: CountryCheck[] = [];
  const loc = (criterion: string) => `Sch 2 ${visaClauses[id]}; ${criterion}`;
  const date =
    id === 'AU-PARTNER'
      ? (r.partnerApplication?.lodged ?? r.simulationDate)
      : r.simulationDate;
  const age = r.dateOfBirth ? fullYears(r.dateOfBirth, date) : undefined;
  const rrv = id === 'AU-RRV';
  const partner = id === 'AU-PARTNER';
  const hk = id === 'AU-189-HK';
  const innovation = id === 'AU-858';

  const passport =
    c.officialPassport || c.passportException === 'accepted'
      ? true
      : c.passportException === 'pending'
        ? undefined
        : c.officialPassport;
  checks.push(
    check(
      'AU-PIC-PASSPORT',
      passport,
      '有效护照',
      'Official passport',
      '须有有效的官方护照，或由部长认定要求持照不合理。',
      'A valid official passport or an accepted exemption is required.',
      'SRC-200',
      loc('Sch 4 PIC 4021'),
    ),
  );

  const substantial =
    c.prisonSentenceMonths !== undefined &&
    c.prisonSentenceMonths >= p.substantialSentenceMonths.value;
  const character =
    c.character === 'favourable-decision'
      ? true
      : substantial || c.character === 'statutory-failure'
        ? false
        : c.character === 'clear-history' && !c.prisonSentenceMonths
          ? true
          : undefined;
  const characterCheck = check(
    'AU-PIC-CHARACTER',
    character,
    '签证品格测试',
    'Visa character test',
    `须申报定罪、待审案件及其他品格风险。累计刑期达 ${p.substantialSentenceMonths.value} 个月（含并行刑期）即未通过品格测试。其他不良记录须个案审查，部长作出的有利决定可计入。`,
    `Disclose convictions, pending charges and other character concerns. Aggregate sentences of ${p.substantialSentenceMonths.value} months, including concurrent terms, fail the character test. Other adverse records require assessment. A favourable ministerial decision can be recorded.`,
    'SRC-211',
    's 501(1), (6)–(7A)',
    c.character === 'other-record' || !!c.prisonSentenceMonths
      ? 'PD-202'
      : undefined,
  );
  characterCheck.sources.push(
    rrv
      ? {
          srcId: 'SRC-066',
          locator: 'Eligibility → Meet character requirement',
        }
      : { srcId: 'SRC-200', locator: loc('Sch 4 PIC 4001') },
  );
  checks.push(characterCheck);

  const partnerStream = r.partnerApplication?.stream ?? r.partner?.stream;
  // The offshore partner stream applies the special return criteria to previous visitors.
  const returnCriteriaApply = rrv
    ? r.locationAtDecision === undefined
      ? undefined
      : r.locationAtDecision === 'offshore'
    : partner
      ? partnerStream === undefined
        ? undefined
        : partnerStream === 'offshore'
      : true;
  if (returnCriteriaApply !== false) {
    const banMet =
      c.returnBan5001 === undefined
        ? undefined
        : c.returnBan5001
          ? returnCriteriaApply
            ? false
            : undefined
          : true;
    checks.push(
      check(
        'AU-RETURN-5001',
        banMet,
        '驱逐及品格返澳限制',
        'Deportation and character return bar',
        '请确认是否受第 5001 条所列的驱逐、品格取消或拒签限制。返程签证在境外决定时适用。',
        'Confirm any deportation, character cancellation or refusal covered by clause 5001. For a Resident Return visa it applies outside Australia.',
        'SRC-200',
        loc('Sch 5 cl 5001'),
      ),
    );
    if (!rrv) {
      const removal =
        c.removedOn === null ||
        (c.removedOn && date > addMonths(c.removedOn, p.removalMonths.value)) ||
        c.removalWaiver === 'granted'
          ? true
          : c.removedOn && returnCriteriaApply && c.removalWaiver !== 'pending'
            ? false
            : undefined;
      checks.push(
        check(
          'AU-RETURN-5002',
          removal,
          '强制遣返后的期限',
          'Time since removal',
          `按法定条款遣返后，递交日须超过 ${p.removalMonths.value} 个月，或已获个案豁免。`,
          `After statutory removal, more than ${p.removalMonths.value} months must have elapsed at application unless a waiver has been granted.`,
          'SRC-200',
          loc('Sch 5 cl 5002'),
        ),
      );
    }
  }
  if (rrv) return [...checks, ...costs];

  const waivable = !['AU-186-DE', 'AU-189-PT', 'AU-190'].includes(id);
  const pic = waivable ? 'PIC 4007' : 'PIC 4005';
  const health =
    c.health === 'cleared' || (c.health === 'waiver-granted' && waivable)
      ? true
      : c.health === 'public-health-failure' ||
          c.health === 'waiver-refused' ||
          (!waivable &&
            (c.health === 'cost-finding' || c.health === 'waiver-granted'))
        ? false
        : undefined;
  const healthCheck = check(
    'AU-PIC-HEALTH',
    health,
    `移民体检（${pic}）`,
    `Immigration health assessment (${pic})`,
    `须核实主申及适用的随行或非随行家人的体检。自报无病史不足以确认。费用参考门槛为 AUD ${p.healthCost.value.toLocaleString('en-AU')}。${waivable ? '只有费用及服务挤占条款可获裁量豁免。' : '本路径无费用条款豁免。'}`,
    `Confirm medical assessments for the applicant and all relevant accompanying and non-migrating relatives. A self-reported clear history still needs assessment. Cost threshold AUD ${p.healthCost.value.toLocaleString('en-AU')}. ${waivable ? 'Only the cost and access provisions can be waived.' : 'There is no cost waiver on this route.'}`,
    'SRC-200',
    loc(`Sch 4 ${pic}`),
    waivable && (c.health === 'cost-finding' || c.health === 'cost-risk')
      ? 'PD-201'
      : undefined,
  );
  healthCheck.sources.push(...p.healthCost.sources);
  if (waivable)
    healthCheck.sources.push({
      srcId: 'SRC-219',
      locator: 'Health waiver → When a health waiver is available',
    });
  checks.push(healthCheck);

  const police =
    c.policeDocuments === 'outstanding'
      ? false
      : c.policeDocuments === undefined ||
          c.policeDocuments === 'waiver-pending'
        ? undefined
        : true;
  const guide = p.policeGuidance.value;
  const policeCheck = check(
    'AU-PIC-POLICE',
    police,
    '警方证明与表格 80',
    'Police certificates and Form 80',
    `须提交移民局要求的资料。警证通常涉及超过 ${guide.overAge} 岁、过去 ${guide.years} 年内在某国累计居住达 ${guide.months} 个月的人。无法合理取得的警证可申请豁免。`,
    `Supply all documents requested. Police certificates are usually requested for people over ${guide.overAge} who spent at least ${guide.months} months in a country in the past ${guide.years} years. A certificate can be waived if it is unreasonable to provide it.`,
    'SRC-200',
    'reg 2.03AA(1)–(3)',
  );
  policeCheck.sources.push(...p.policeGuidance.sources);
  checks.push(
    policeCheck,
    check(
      'AU-PIC-SECURITY',
      officialDecision(c.securityAndForeignPolicy),
      '国家安全、外交与制裁审查',
      'Security, foreign policy and sanctions',
      '须确认 ASIO 及外交政策、制裁审查结果。仅自报无风险时仍待官方核查。',
      'Confirm the ASIO, foreign-policy and sanctions assessment. Self-reported absence of risks still requires official checks.',
      'SRC-200',
      loc('Sch 4 PIC 4002–4003'),
    ),
    check(
      'AU-PIC-DEBT',
      c.commonwealthDebt === undefined
        ? undefined
        : c.commonwealthDebt !== 'outstanding',
      '联邦债务',
      'Commonwealth debts',
      '无欠款或已有获认可的还款安排。',
      'Confirm there are no outstanding debts, or that repayment arrangements were accepted.',
      'SRC-200',
      loc('Sch 4 PIC 4004'),
    ),
  );
  if (id !== 'AU-190' && !partner) {
    checks.push(
      check(
        'AU-PIC-TECHNOLOGY',
        officialDecision(c.criticalTechnology),
        '关键技术转移审查',
        'Critical technology transfer',
        '须确认部长对关键技术转移的认定。敏感领域的具体风险由主管机关判断。',
        'Confirm the ministerial determination. Authorities assess risks associated with sensitive fields.',
        'SRC-200',
        loc('Sch 4 PIC 4003B'),
        c.criticalTechnology === 'sensitive-field' ||
          c.criticalTechnology === 'pending'
          ? 'PD-203'
          : undefined,
      ),
    );
  }
  const valuesAge =
    id === 'AU-191' || id === 'AU-191-HK'
      ? p.regionalValuesAge.value
      : p.adult.value;
  const singleMinor =
    age !== undefined &&
    age < valuesAge &&
    (c.noOtherApplicantOfValuesAge === true ||
      (r.fees?.additionalAdults === 0 && r.fees?.additionalMinors === 0));
  checks.push(
    check(
      'AU-PIC-VALUES',
      singleMinor || c.valuesSigned,
      '澳大利亚价值观声明',
      'Australian Values Statement',
      `递交时已满 ${valuesAge} 岁的适用申请人须已签署声明或获得豁免。`,
      `Confirm that every relevant applicant aged ${valuesAge} or older at lodgement has signed the statement or received an exemption.`,
      'SRC-200',
      loc('Sch 4 PIC 4019'),
    ),
  );
  if (!innovation || r.innovation?.securityAssistance !== 'accepted') {
    const info = c.integrity;
    let integrity: boolean | undefined;
    if (info) {
      const identityBar =
        info.lastIdentityRefusal !== null &&
        info.lastIdentityRefusal >=
          addYears(date, -p.identityRefusalYears.value);
      const documentBar =
        !info.accurateDocuments ||
        (info.lastDocumentRefusal !== null &&
          info.lastDocumentRefusal >=
            addYears(date, -p.documentRefusalYears.value));
      if (!info.identityEstablished || identityBar) integrity = false;
      else if (!documentBar || info.documentWaiver === 'granted')
        integrity = true;
      else if (info.documentWaiver !== 'pending') integrity = false;
    }
    checks.push(
      check(
        'AU-PIC-INTEGRITY',
        integrity,
        '身份与材料真实性',
        'Identity and document integrity',
        `核实当前身份及材料、家庭成员在 ${p.documentRefusalYears.value} 年内的虚假材料拒签和 ${p.identityRefusalYears.value} 年内的身份拒签。核对未成年时的例外。材料问题可获裁量豁免。`,
        `Check current identity and documents and relevant family refusals within ${p.documentRefusalYears.value} years for false information or ${p.identityRefusalYears.value} years for identity. Apply the under-age exceptions. Document issues can be waived.`,
        'SRC-200',
        loc('Sch 4 PIC 4020(1)–(4)'),
      ),
    );
  }
  if (partner || innovation) {
    checks.push(
      check(
        'AU-PIC-SETTLEMENT',
        c.permanentSettlementAndSupport,
        '永久定居及家庭支持',
        'Permanent settlement and family support',
        '有意在澳永久定居，并确认以家庭成员身份入境者可获在澳家人的支持。',
        'Confirm intent to live permanently in Australia and support available to those entering as members of a family unit.',
        'SRC-200',
        loc('Sch 4 PIC 4009'),
      ),
    );
  }
  if (!partner) {
    const noAdditional =
      r.fees?.additionalAdults === 0 && r.fees.additionalMinors === 0;
    checks.push(
      check(
        'AU-PIC-ESTABLISHMENT',
        (hk && noAdditional) || c.settlementWithoutUndueDifficulty,
        '在澳建立生活',
        'Ability to establish in Australia',
        '适用的申请人须能在澳定居，且不会给个人或社区造成过度困难或负担。189 香港通道仅检查相关副申请人。',
        'Relevant applicants must be able to establish themselves without undue personal or community difficulty or costs. For the 189 Hong Kong stream this applies to relevant secondary applicants.',
        'SRC-200',
        loc('Sch 4 PIC 4010'),
      ),
    );
  }
  const hasMinorPrimaryCriterion =
    innovation && (age === undefined || age < p.adult.value);
  checks.push(
    check(
      'AU-PIC-CHILDREN',
      (!hasMinorPrimaryCriterion && r.fees?.additionalMinors === 0) ||
        c.childInterestsSatisfied,
      '未成年人的监护与最佳利益',
      'Child custody and best interests',
      '有适用的未成年申请人时，须满足法定移居同意、监护权及儿童最佳利益要求。',
      'For each relevant minor confirm lawful relocation or consent and no compelling reason to believe the grant would be against the child’s best interests.',
      'SRC-200',
      loc('Sch 4 PIC 4015–4018'),
    ),
  );
  if (!hk && !partner) {
    const study = c.sponsoredStudy;
    const rule = p.sponsoredStudy.value;
    let eligible: boolean | undefined;
    if (study) {
      if (
        !study.applies ||
        study.support === 'granted' ||
        (study.courseMonths !== undefined &&
          study.courseMonths < rule.shortCourseMonths) ||
        (study.yearsOutsideSinceCeasing !== undefined &&
          study.yearsOutsideSinceCeasing >= rule.yearsOutside)
      )
        eligible = true;
      else if (
        study.courseMonths !== undefined &&
        study.yearsOutsideSinceCeasing !== undefined &&
        study.support === 'none'
      )
        eligible = false;
    }
    checks.push(
      check(
        'AU-RETURN-5010',
        eligible,
        '政府资助学生的返澳条件',
        'Government-sponsored student return criteria',
        `适用者需确认课程短于 ${rule.shortCourseMonths} 个月、停读后在澳外满 ${rule.yearsOutside} 年、获政府支持或获豁免。`,
        `For affected students, confirm a course under ${rule.shortCourseMonths} months, ${rule.yearsOutside} years outside Australia after ceasing it, government support or a waiver.`,
        'SRC-200',
        loc('Sch 5 cl 5010(1)–(5)'),
      ),
    );
  }
  return [...checks, ...costs];
}

export function auNotes(id: AuFullPathId, r: AuFullRequest): string[] {
  if (id === 'AU-CITIZENSHIP') return [];
  const en = r.locale === 'en';
  const notes = [
    en
      ? 'Notify Home Affairs promptly in writing of relevant changes to application answers, including address. There is no general housing-size or municipal registration test (SRC-069 s 104).'
      : '申请答案（包括住址）发生相关变更时须尽快书面通知内政部。没有通用住房面积或市政住址登记门槛（SRC-069 s 104）。',
  ];
  if (id === 'AU-RRV') {
    notes.push(
      en
        ? 'Home Affairs may still request police certificates during RRV processing (SRC-066, About this visa → Cost).'
        : '内政部审理返程签证时仍可要求警方证明（SRC-066，About this visa → Cost）。',
    );
  } else {
    notes.push(
      en
        ? 'Check condition 8501 on the current temporary visa. Medicare eligibility depends on residence, visa and family or work circumstances (SRC-200 Sch 8 cl 8501; SRC-213 s 3(1)).'
        : '须核对当前临签的 8501 医疗保险条件。Medicare 资格取决于居住、签证、家庭或工作情况（SRC-200 Sch 8 cl 8501；SRC-213 s 3(1)）。',
    );
    if (r.publicInterest?.temporaryInsurance === 'lapsed')
      notes.push(
        en
          ? 'Disclose the lapse of cover when answering the prior visa compliance question (SRC-200 Sch 8 cl 8501).'
          : '请在前签合规问题中申报医保中断（SRC-200 Sch 8 cl 8501）。',
      );
  }
  return notes;
}
