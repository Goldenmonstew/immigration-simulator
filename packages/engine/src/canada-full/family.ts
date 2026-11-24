import { canadaFull2026_11 as ca } from '@uk-immigration/policy-data';
import { addMonths, addYears, fullYears } from '../dates';
import type { IsoDate } from '../types';
import {
  accompanyingChildrenEligible,
  all,
  any,
  dependentChildEligible,
  filingDatesForRoute,
  receivedBy,
  ref,
  type Context,
  type DependentChildAnswers,
  type Item,
} from './shared';

const v = ca.values;
type Relationship = 'spouse' | 'common-law' | 'conjugal' | 'child';
type QuebecGroup = { adults: number; children: number };

export interface FamilyAnswers {
  relationship?: Relationship;
  quebec?: boolean;
  filingDate?: IsoDate;
  permanentResidenceDate?: IsoDate;
  /** Date the qualifying TRP started the federal undertaking under s.132(1)(a). */
  qualifyingTrpStart?: IsoDate;
  completeApplicationReceived?: IsoDate;
  sponsorBirthDate?: IsoDate;
  sponsorStatus?: 'citizen' | 'pr' | 'registered-indian' | 'other';
  registeredSponsorAccepted?: boolean;
  sponsorInCanada?: boolean;
  returnToCanadaConfirmed?: boolean;
  noDuplicateSponsorship?: boolean;
  sponsorshipFiled?: boolean;
  sponsorPreviouslySponsoredAsPartner?: boolean;
  sponsorContinuousPrOrCitizenSince?: IsoDate;
  noActivePartnerUndertaking?: boolean;
  sponsor?: {
    notWithdrawn?: boolean;
    noRemovalOrder?: boolean;
    notDetained?: boolean;
    /** Confirmed absence or disposition of a designated s.133 offence. */
    criminalBarCleared?: boolean;
    conviction?: {
      jurisdiction: 'canada' | 'foreign';
      sentenceCompletedOn?: IsoDate;
      finalAcquittal?: boolean;
      effectiveCanadianPardon?: boolean;
      foreignRehabilitationConfirmed?: boolean;
    };
    noProceedingSuspension?: boolean;
    noUndertakingOrSupportDefault?: boolean;
    immigrationDebtClear?: boolean;
    bankruptcyDischargedOrAbsent?: boolean;
    socialAssistancePermittedOrAbsent?: boolean;
  };
  genuineAndContinuingRelationship?: boolean;
  marriageRecognizedAndEligible?: boolean;
  cohabitationSince?: IsoDate;
  deemedCommonLawAccepted?: boolean;
  partnershipSince?: IsoDate;
  legalOrPracticalBarriersConfirmed?: boolean;
  sponsoredOutsideCanada?: boolean;
  /** For the sponsored child, or for a partner's sole accompanying child. */
  child?: DependentChildAnswers & {
    parentageConfirmed?: boolean;
    priorDisclosureExamOrExceptionConfirmed?: boolean;
  };
  applicationClass?: 'family' | 'inland';
  cohabitingInCanada?: boolean;
  temporaryStatusValid?: boolean;
  lackOfStatusPolicy?: 'not-applicable' | 'requested' | 'accepted' | 'refused';
  // For a partner: their dependent child has a dependent. For a directly
  // sponsored child: that child has a dependent.
  multigenerationalDependants?: boolean;
  federalUndertakingAndAgreementSigned?: boolean;
  federalIncome?: {
    unduplicatedHouseholdSize?: number;
    // Each figure is net of the exclusions under s.134; include only an eligible co-signer.
    eligibleNoaIncome?: number;
    eligibleLastYearIncome?: number;
  };
  province?: {
    /** The required IRCC letter or qualifying inland acknowledgment for this undertaking. */
    eligibilityLetterOrQualifyingInlandAor?: boolean;
    letterDate?: IsoDate;
    submissionDate?: IsoDate;
    sponsorResidenceOrReturnConfirmed?: boolean;
    provincialFinancialAndConductBarsClear?: boolean;
    custodyConsentIfRequired?: boolean;
    undertakingAndAdultDeclarationsSigned?: boolean;
    integrationPlanIfRequiredSigned?: boolean;
    additionalSponsoredBirthDates?: IsoDate[];
    mifiDecision?: 'approved' | 'pending' | 'refused';
    ownHouseholdSize?: number;
    sponsoredGroups?: QuebecGroup[];
    eligibleCanadianIncome?: number;
    eligibleCanadianAssets?: number;
    resourcesSustainable?: boolean;
    intakeExemptionConfirmed?: boolean;
    intakeCapacityConfirmed?: boolean;
    applications?: number;
    additionalPersons?: number;
    feesPaid?: boolean;
  };
}

function scale(size: number | undefined, rows: number[], extra: number) {
  if (size === undefined || size < 1) return undefined;
  return (
    rows[Math.min(size, rows.length) - 1] +
    Math.max(0, size - rows.length) * extra
  );
}

function quebecGroupIncome({ adults, children }: QuebecGroup) {
  const { groups, extraChild, extraAdult } = v.familyQuebecIncome.value;
  const row = Math.min(adults, groups.length - 1);
  const col = Math.min(children, groups[row].length - 1);
  return (
    groups[row][col] +
    (adults - row) * extraAdult +
    (children - col) * extraChild[row]
  );
}

export function familyChecks({ req, L, check }: Context): Item[] {
  const f = req.family ?? {};
  const q = f.province;
  const qc = f.quebec;
  const filing = filingDatesForRoute(req, 'CA-FAMILY');
  const date = filing.federal ?? req.simulationDate;
  const childDocumentDate =
    filing.childAgeLockIn ??
    receivedBy(filing.federal, req.simulationDate) ??
    req.simulationDate;
  const provDate = filing.provincial ?? req.simulationDate;
  const fundTable = v.familyQuebecIncome.value;
  const currentQuebecTable =
    provDate >= fundTable.fromDate && provDate <= fundTable.toDate;
  const adult = v.familyAdultAge.value;
  const partner =
    f.relationship === undefined ? undefined : f.relationship !== 'child';
  const sponsorAge = f.sponsorBirthDate
    ? fullYears(f.sponsorBirthDate, date)
    : undefined;
  const registered = f.sponsorStatus === 'registered-indian';
  const sponsorEligible = registered
    ? f.registeredSponsorAccepted
    : f.sponsorStatus === undefined
      ? undefined
      : f.sponsorStatus !== 'other';
  const res = any(
    f.sponsorInCanada,
    all(
      f.sponsorStatus === undefined ? undefined : f.sponsorStatus === 'citizen',
      f.returnToCanadaConfirmed,
      any(
        partner,
        f.multigenerationalDependants === undefined
          ? undefined
          : !f.multigenerationalDependants,
      ),
    ),
  );
  const fiveYears = f.sponsorContinuousPrOrCitizenSince
    ? addYears(
        f.sponsorContinuousPrOrCitizenSince,
        v.familyPartnerBarYears.value,
      ) <= date
    : undefined;
  const repeatOk =
    partner === false ||
    any(
      f.sponsorPreviouslySponsoredAsPartner === undefined
        ? undefined
        : !f.sponsorPreviouslySponsoredAsPartner,
      fiveYears,
    );
  const s = f.sponsor;
  const conviction = s?.conviction;
  const sentencePeriodMet = conviction?.sentenceCompletedOn
    ? addYears(conviction.sentenceCompletedOn, v.familyConvictionYears.value) <=
      date
    : undefined;
  const crimeClear = conviction
    ? any(
        conviction.finalAcquittal,
        conviction.jurisdiction === 'canada' &&
          conviction.effectiveCanadianPardon,
        all(
          sentencePeriodMet,
          conviction.jurisdiction === 'canada' ||
            conviction.foreignRehabilitationConfirmed,
        ),
      )
    : s?.criminalBarCleared;
  const fedBars = all(
    s?.noUndertakingOrSupportDefault,
    s?.bankruptcyDischargedOrAbsent,
  );
  const age = req.dateOfBirth ? fullYears(req.dateOfBirth, date) : undefined;
  const longEnough = (start?: IsoDate) =>
    start === undefined
      ? undefined
      : addMonths(start, v.familyPartnerMonths.value) <= date;
  const relOk =
    f.relationship === 'spouse'
      ? f.marriageRecognizedAndEligible
      : f.relationship === 'common-law'
        ? any(longEnough(f.cohabitationSince), f.deemedCommonLawAccepted)
        : f.relationship === 'conjugal'
          ? all(
              longEnough(f.partnershipSince),
              f.legalOrPracticalBarriersConfirmed,
              f.sponsoredOutsideCanada,
            )
          : undefined;
  const child = f.child;
  const isFamilyClass =
    f.applicationClass === undefined
      ? undefined
      : f.applicationClass === 'family';
  const inlandRel =
    f.relationship === undefined
      ? undefined
      : f.relationship === 'spouse' || f.relationship === 'common-law';
  const statusWaiver =
    f.lackOfStatusPolicy === 'accepted'
      ? true
      : f.lackOfStatusPolicy === 'refused' ||
          f.lackOfStatusPolicy === 'not-applicable'
        ? false
        : undefined;
  const classOk = any(
    isFamilyClass,
    all(
      f.applicationClass === undefined
        ? undefined
        : f.applicationClass === 'inland',
      inlandRel,
      f.cohabitingInCanada,
      any(f.temporaryStatusValid, statusWaiver),
    ),
  );
  const needIncome = f.multigenerationalDependants;
  const household = f.federalIncome;
  const fedThreshold = scale(
    household?.unduplicatedHouseholdSize,
    v.familyIncomeTable.value,
    v.familyIncomeExtra.value,
  );
  const matches = (income: number | undefined, min: number | undefined) =>
    min === undefined || income === undefined ? undefined : income >= min;
  const fedIncome =
    date.slice(0, 4) === ca.asOf.slice(0, 4)
      ? any(
          matches(household?.eligibleNoaIncome, fedThreshold),
          matches(household?.eligibleLastYearIncome, fedThreshold),
        )
      : undefined;
  const incomeOk = (met: boolean | undefined) =>
    needIncome === undefined ? undefined : !needIncome || met;
  const aAmount = scale(q?.ownHouseholdSize, fundTable.own, fundTable.ownExtra);
  const bAmount = q?.sponsoredGroups?.reduce(
    (sum, group) => sum + quebecGroupIncome(group),
    0,
  );
  const total =
    aAmount !== undefined && bAmount !== undefined
      ? aAmount + bAmount
      : undefined;
  const qcIncome =
    currentQuebecTable && q?.eligibleCanadianIncome !== undefined
      ? all(
          matches(q.eligibleCanadianIncome, aAmount),
          any(
            matches(q.eligibleCanadianIncome, total),
            matches(
              q.eligibleCanadianAssets === undefined
                ? undefined
                : q.eligibleCanadianIncome + q.eligibleCanadianAssets,
              total,
            ),
          ),
          q.resourcesSustainable,
        )
      : undefined;
  const prDate = f.permanentResidenceDate;
  const fed = v.familyUndertaking.value;
  const provincial = v.familyQcUndertaking.value;
  let fedEnd: IsoDate | undefined, provEnd: IsoDate | undefined;
  if (prDate && partner === true) {
    fedEnd = provEnd = addYears(prDate, fed.partnerYears);
  } else if (prDate && req.dateOfBirth && partner === false) {
    const prAge = fullYears(req.dateOfBirth, prDate);
    fedEnd =
      prAge < v.familyChildAge.value
        ? [
            addYears(prDate, fed.childYears),
            addYears(req.dateOfBirth, fed.childEndAge),
          ].sort()[0]
        : addYears(prDate, fed.partnerYears);
    provEnd =
      prAge < provincial.youngAge
        ? [
            addYears(prDate, provincial.youngYears),
            addYears(req.dateOfBirth, provincial.youngEndAge),
          ].sort()[1]
        : [
            addYears(prDate, provincial.olderYears),
            addYears(req.dateOfBirth, provincial.olderEndAge),
          ].sort()[1];
  }
  const requiresPlan = (dob: IsoDate) => {
    const age = fullYears(dob, provDate);
    return age >= provincial.integrationMin && age <= provincial.integrationMax;
  };
  const anyIntegrationRequired = any(
    req.dateOfBirth ? requiresPlan(req.dateOfBirth) : undefined,
    q?.additionalSponsoredBirthDates?.some(requiresPlan),
  );
  const integration = any(
    q?.integrationPlanIfRequiredSigned,
    anyIntegrationRequired === undefined ? undefined : !anyIntegrationRequired,
  );
  const mifi =
    q?.mifiDecision === 'approved'
      ? true
      : q?.mifiDecision === 'refused'
        ? false
        : undefined;
  const exemptIntake = any(
    partner === undefined ? undefined : !partner,
    q?.intakeExemptionConfirmed,
  );
  const schedule = v.familyQcIntakeSchedule.value;
  const received = receivedBy(filing.provincial, req.simulationDate);
  const applicable =
    received && received <= v.familyQcIntakeThrough.value
      ? schedule.filter((x) => x.opens <= received).at(-1)
      : undefined;
  const letter = q?.letterDate;
  const scheduled =
    letter && applicable
      ? letter <= applicable.lettersThrough
        ? true
        : letter <= schedule[schedule.length - 1].lettersThrough
          ? false
          : undefined
      : undefined;
  const entry = any(
    exemptIntake,
    received
      ? all(
          scheduled,
          q?.eligibilityLetterOrQualifyingInlandAor,
          q?.intakeCapacityConfirmed,
        )
      : undefined,
  );
  const fees = v.familyQcFees.value;
  const amount =
    q?.applications !== undefined && q.additionalPersons !== undefined
      ? q.applications * fees.principal + q.additionalPersons * fees.additional
      : undefined;
  const qcOnly = (value: boolean | undefined) =>
    qc === undefined ? undefined : !qc || value;
  const ex = L(
    '此分支免除此项。',
    'This requirement does not apply to this branch.',
  );
  return [
    check(
      'CA-R71',
      L(
        '担保人身份、居住与既有担保',
        'Sponsor status, residence and earlier sponsorships',
      ),
      all(
        sponsorAge === undefined ? undefined : sponsorAge >= adult,
        sponsorEligible,
        res,
        repeatOk,
        partner === false || f.noActivePartnerUndertaking,
        f.noDuplicateSponsorship,
        f.sponsorshipFiled,
      ),
      L(
        `担保人至少 ${adult} 岁，核对身份与居住、正式递交、未决重复担保、仍有效的承诺。曾由伴侣担保获 PR 后再担保伴侣须满 ${v.familyPartnerBarYears.value} 年。`,
        `The sponsor must be at least ${adult}. Check status, residence, filing, duplicate sponsorship and active undertakings. A previously partner-sponsored PR must wait ${v.familyPartnerBarYears.value} years before sponsoring another partner.`,
      ),
      [
        ref('SRC-261', 'IRPA s.13; IRPR s.130'),
        ref('SRC-274', 'Sponsor eligibility: Who can sponsor'),
      ],
      ['PD-250', 'PD-255'],
    ),
    check(
      'CA-R72',
      L(
        '持续担保资格、债务及禁项',
        'Continuing eligibility, debts and sponsor bars',
      ),
      all(
        s?.notWithdrawn,
        s?.noRemovalOrder,
        s?.notDetained,
        crimeClear,
        // A stay of processing leaves the eventual decision unresolved.
        s?.noProceedingSuspension === true ? true : undefined,
        s?.immigrationDebtClear,
        s?.socialAssistancePermittedOrAbsent,
        qc === undefined ? undefined : qc || fedBars,
      ),
      L(
        '核对担保仍有效、移除或羁押、指定犯罪及例外、审理暂停、移民债务和社会救济；魁省以外另核破产、旧承诺和抚养费。',
        'Check continuing sponsorship, removal, detention, designated offences and exceptions, suspension, immigration debts and social assistance. Outside Québec also check bankruptcy, prior commitments and maintenance.',
      ),
      [
        ref('SRC-261', 'IRPR ss.133, 135–137'),
        ref('SRC-274', 'Sponsor eligibility: Who cannot sponsor'),
      ],
      ['PD-243', 'PD-255'],
    ),
    check(
      'CA-R73',
      L('伴侣关系、年龄及真实性', 'Partner relationship, age and genuineness'),
      partner === undefined
        ? undefined
        : !partner ||
            all(
              age === undefined ? undefined : age >= adult,
              f.genuineAndContinuingRelationship,
              relOk,
            ),
      partner === false
        ? ex
        : L(
            `双方关系须持续真实。核对有效婚姻、连续同住 ${v.familyPartnerMonths.value} 个月或已确认的法定例外，或境外伴侣关系及婚姻/同住障碍。`,
            `Confirm a continuing genuine relationship: a recognized marriage, ${v.familyPartnerMonths.value} consecutive months of cohabitation or a confirmed legal exception, or a conjugal relationship abroad with proven barriers.`,
          ),
      [
        ref('SRC-261', 'IRPR ss.1–2, 4–5, 117, 121, 124–125'),
        ref(
          'SRC-274',
          'Guide 5289: Sponsoring your spouse, common-law partner or conjugal partner',
        ),
      ],
      ['PD-255'],
    ),
    check(
      'CA-R74',
      L('受抚养子女与先前申报', 'Dependent child and prior declaration'),
      partner === undefined
        ? undefined
        : all(
            child?.priorDisclosureExamOrExceptionConfirmed,
            accompanyingChildrenEligible(
              req.federal?.members,
              filing.childAgeLockIn,
              childDocumentDate,
              partner ? child : undefined,
            ),
            partner ||
              all(
                dependentChildEligible(
                  req.dateOfBirth ?? req.federal?.principal?.dateOfBirth,
                  filing.childAgeLockIn,
                  child,
                ),
                child?.parentageConfirmed,
                child?.custodyAndConsentReady,
              ),
          ),
      L(
        `核对先前申报、移民检查及适用例外。直接担保和随行的子女均在完整申请收件日锁龄。当日未满 ${v.familyChildAge.value} 岁者，审理期间须持续无配偶或同居伴侣。已达该年龄者，须自该年龄前持续经济依赖父母，且因身心状况无法自立。联邦申请中每名未满 ${v.childConsentAgeLimit.value} 岁、需要另一位法定家长同意的子女，须有其同意或准许迁居的法院文件。仅提供缺件说明时，等待审查。`,
        `Check prior declaration, examination and applicable exceptions. Age locks at complete receipt for both directly sponsored and accompanying children. A child under ${v.familyChildAge.value} on that date must remain unmarried and without a common-law partner throughout processing. Older children must have depended on parental financial support since before that age and remain unable to support themselves due to a physical or mental condition. For each immigrating child under ${v.childConsentAgeLimit.value} on the federal application who needs the other legal parent's consent, check that consent or a court document permitting relocation. An explanation for missing documents awaits review.`,
      ),
      [
        ref('SRC-261', 'IRPR ss.2, 25.1, 117(9)–(11), 125'),
        ref(
          'SRC-274',
          'Guide 5289: Definitions of dependent children; Step 5, incomplete applications',
        ),
        ...v.childConsentAgeLimit.sources,
      ],
      ['PD-245', 'PD-255'],
    ),
    check(
      'CA-R75',
      L('担保类别与境内身份', 'Sponsorship class and inland status'),
      classOk,
      L(
        '境内类别限在加拿大与担保人同住的配偶或同居伴侣，须有有效临时身份或适用的已准豁免。其他类别按 Family Class 核对。无一般性语言、考试、住房或私人医疗保险门槛。',
        'The inland class requires a spouse or common-law partner living with the sponsor in Canada, with valid temporary status or an accepted exemption. Family Class is assessed separately. There is no general language, test, housing or private insurance threshold.',
      ),
      [
        ref('SRC-261', 'IRPR ss.117, 123–128'),
        ref(
          'SRC-274',
          'Guide 5289: class of application; inland public policy §§2–4',
        ),
      ],
      ['PD-255'],
    ),
    check(
      'CA-R76',
      L('联邦担保承诺与收入', 'Federal undertaking and income'),
      qc === undefined
        ? undefined
        : qc ||
            all(f.federalUndertakingAndAgreementSigned, incomeOk(fedIncome)),
      qc
        ? ex
        : L(
            '核对已签承诺及适用协议。出现跨代受抚养人时，以合资格 NOA 或过去十二个月收入较高者比较 IMM 1283 的家庭金额。',
            'Check the signed undertaking and applicable agreement. With multigenerational dependants, compare the higher eligible NOA or preceding twelve-month income against the IMM 1283 household amount.',
          ) +
            (needIncome && fedThreshold !== undefined
              ? ` CAD ${fedThreshold}.`
              : '') +
            (fedEnd
              ? L(
                  ` 承诺自 ${f.qualifyingTrpStart ?? prDate} 至 ${fedEnd}。`,
                  ` Undertaking from ${f.qualifyingTrpStart ?? prDate} ends ${fedEnd}.`,
                )
              : ''),
      [
        ref('SRC-261', 'IRPR ss.131–134'),
        ref('SRC-274', 'IMM 1283: Federal Income Table, 2025'),
      ],
      ['PD-248', 'PD-255'],
    ),
    check(
      'CA-R77',
      L('魁省担保资格与承诺', 'Québec sponsorship and undertaking'),
      qcOnly(
        all(
          q?.eligibilityLetterOrQualifyingInlandAor,
          received ? !letter || letter <= received : undefined,
          q?.sponsorResidenceOrReturnConfirmed,
          q?.provincialFinancialAndConductBarsClear,
          q?.custodyConsentIfRequired,
          q?.undertakingAndAdultDeclarationsSigned,
          integration,
          mifi,
        ),
      ),
      qc === false
        ? ex
        : L(
            '核对联邦通知、返魁或居魁、既有债务及犯罪和救济记录、监护同意、承诺书、适用的欢迎融入计划，以及省决定。',
            'Check federal notice, Québec residence or return, defaults, conduct and assistance, custody consent, signed undertaking, applicable integration plan and provincial decision.',
          ) +
            (provEnd
              ? L(` 承诺至 ${provEnd}。`, ` Undertaking ends ${provEnd}.`)
              : ''),
      [
        ref('SRC-261', 'IRPR ss.131–134, 137'),
        ref(
          'SRC-275',
          'Eligibility: Positive Decision; Application Admissibility Rules; submitting the undertaking, responsibilities; form A-0546-GF: Durée',
        ),
      ],
      ['PD-255'],
    ),
    check(
      'CA-R78',
      L('魁省收入与在加资产', 'Québec income and Canadian assets'),
      qcOnly(incomeOk(qcIncome)),
      qc === false || needIncome === false
        ? ex
        : L(
            '表 A 须用加拿大收入；表 B 按每组现有及新增承诺分别计算，余额可用在加资产，须证明承诺期间持续有能力负担。',
            'Table A requires Canadian income. Add a separate table B amount for each existing and new group. Canadian assets may cover the remaining table B amount, with proof of sustainable means.',
          ) +
            (currentQuebecTable && total !== undefined
              ? ` A: CAD ${aAmount}; A+B: CAD ${total}.`
              : ''),
      [
        ref('SRC-261', 'IRPR ss.133(1)(j)(ii), 137'),
        ref('SRC-275', 'Calculating the amounts you need: Tables A and B'),
      ],
      ['PD-255'],
    ),
    check(
      'CA-R79',
      L('魁省排期、限额及例外', 'Québec intake schedule, cap and exemptions'),
      qcOnly(entry),
      qc === false
        ? ex
        : L(
            `伴侣受理期上限 ${v.familyQcIntakeCap.value} 份。按魁省实际收件日核对批次、联邦通知种类与签发日，以及当时余量。合资格子女免受批次限制。`,
            `The partner intake cap is ${v.familyQcIntakeCap.value}. Use the date Québec received the undertaking to check the intake schedule, federal letter type and issue date, and capacity at receipt. Qualifying children are exempt from the intake schedule.`,
          ) +
            (applicable
              ? L(
                  ` 此档信件截止 ${applicable.lettersThrough}。`,
                  ` Letter cutoff for this batch: ${applicable.lettersThrough}.`,
                )
              : ''),
      [
        ref(
          'SRC-275',
          'Reception period, Application Intake Schedule and Exemptions',
        ),
        ref('SRC-276', 'Québec family reception rules'),
      ],
      ['PD-256'],
    ),
    check(
      'CA-R80',
      L('魁省家庭担保费用', 'Québec sponsorship fees'),
      qcOnly(
        currentQuebecTable && amount !== undefined ? q?.feesPaid : undefined,
      ),
      qc === false
        ? ex
        : !currentQuebecTable
          ? L(
              '请核对该受理年度的魁省收费公告。',
              'Check the Québec fee schedule for this intake year.',
            )
          : L(
              `每份申请 CAD ${fees.principal}，每名附加人员 CAD ${fees.additional}。单独担保多名子女时逐份收费。`,
              `Each application costs CAD ${fees.principal}, plus CAD ${fees.additional} per additional person. Separately sponsored children each require an application.`,
            ) +
            (currentQuebecTable && amount !== undefined
              ? L(` 合计 CAD ${amount}。`, ` Total CAD ${amount}.`)
              : ''),
      [ref('SRC-275', 'Spouse/child undertaking: Paying the fees')],
      !currentQuebecTable ? ['PD-258'] : undefined,
      true,
    ),
  ];
}
