import { unitedStates2026_11 } from '@uk-immigration/policy-data';
import { addDays, addMonths, daysBetween } from '../dates';
import { afterYears } from '../pilot';
import {
  all,
  any,
  atLeast,
  atMost,
  checksFor,
  checkStatus,
  not,
  reviewed,
  s,
  v,
} from './check';
import type {
  UsFullRequest,
  UsInvestmentAnswers,
  UsTravelAnswers,
} from './types';

const legacy = unitedStates2026_11.values;

export function jobsCheck(a?: UsInvestmentAnswers) {
  const law = v.eb5.value;
  const hours = atLeast(a?.minimumWeeklyHours, law.weeklyHours);
  const count = atLeast(a?.qualifyingJobs, law.jobs);
  const regional =
    a?.regionalCenter === false
      ? true
      : a?.regionalCenter === true
        ? all(
            atMost(a.indirectJobsPct, law.indirectMaxPct),
            atMost(
              a.shortConstructionIndirectJobsPct,
              law.shortConstructionIndirectMaxPct,
            ),
          )
        : undefined;
  return all(count, hours, regional);
}

export function conditionChecks(request: UsFullRequest) {
  const check = checksFor(request);
  if (request.conditional === 'investor') {
    const a = request.conditions?.investor;
    const law = v.eb5.value;
    const preRia =
      a?.originalPetitionFiledOn && a.originalPetitionFiledOn < law.rulesFrom;
    const sustained = a?.originalPetitionFiledOn
      ? preRia
        ? reviewed(a.continuousInvestmentDuringConditionalResidence)
        : atLeast(a.sustainmentYears, law.sustainmentYears)
      : undefined;
    const capitalEvidence = all(
      sustained,
      a?.atRisk,
      reviewed(a?.requiredCapitalFullyInvested),
      reviewed(a?.lawfullySourcedFunds),
    );
    const residentSince =
      request.principalConditional ?? request.permanentResident;
    const anniversary =
      preRia && residentSince
        ? afterYears(residentSince, legacy.conditionalYears.value)
        : undefined;
    const approvalRequirementDate =
      capitalEvidence === true &&
      anniversary &&
      request.simulationDate < anniversary
        ? anniversary
        : undefined;
    return [
      {
        ...check(
          'C17-CAPITAL',
          '投资本金及持续在险',
          'Capital invested and sustained at risk',
          approvalRequirementDate ? false : capitalEvidence,
          [...s.i829, ...s.eb5],
          'PD-278',
          approvalRequirementDate
            ? [
                `如资金继续在险，旧法规定的条件居留投资期在 ${approvalRequirementDate} 届满。`,
                `If the capital remains at risk, the pre-RIA sustainment period ends on ${approvalRequirementDate}.`,
              ]
            : undefined,
          approvalRequirementDate ? 'MET' : undefined,
        ),
        ...(approvalRequirementDate ? { approvalRequirementDate } : {}),
      },
      check(
        'C17-I829-PAPER',
        'I-829 纸质递交',
        'Paper filing for I-829',
        request.fees?.channel !== 'online',
        s.i829,
        'PD-094',
        ['I-829 适用纸质递交。', 'I-829 is filed on paper.'],
      ),
      check(
        'C17-JOBS',
        'EB-5 合资格就业与合理期限',
        'EB-5 qualifying employment and reasonable time',
        any(jobsCheck(a), reviewed(a?.jobsAccepted)),
        [...s.i829, ...s.eb5],
        'PD-278',
        [
          `通常须创造至少 ${law.jobs} 个每周至少 ${law.weeklyHours} 小时的合资格岗位。合理期限、保留岗位或例外由 USCIS 审定。`,
          `Generally, create at least ${law.jobs} qualifying jobs of at least ${law.weeklyHours} hours weekly. USCIS assesses reasonable time, retained jobs and exceptions.`,
        ],
      ),
    ];
  }
  const a = request.conditions?.marriage;
  const lpr = request.principalConditional ?? request.permanentResident;
  const married = a?.marriedOn ?? request.marriage?.married;
  const applies =
    married && lpr
      ? married <= lpr &&
        lpr < afterYears(married, legacy.conditionalYears.value)
      : undefined;
  const filing = all(
    not(a?.finalRemovalOrder),
    a?.filing === 'joint'
      ? a.spouseJoins
      : a?.filing === 'separate-child'
        ? any(
            request.separatePetition,
            request.principalConditional && request.permanentResident
              ? daysBetween(
                  request.principalConditional,
                  request.permanentResident,
                ) > legacy.childConcurrentDays.value
              : undefined,
          )
        : a?.filing
          ? reviewed(a.waiverBasis)
          : undefined,
  );
  return [
    check(
      'C15-BONA-FIDE-MARRIAGE',
      '条件身份与善意婚姻',
      'Conditional residence and bona fide marriage',
      all(
        applies,
        a?.filing === 'hardship'
          ? true
          : all(reviewed(a?.bonaFide), not(a?.improperConsideration)),
      ),
      s.marriage,
      'PD-274',
    ),
    check(
      'C16-I751-FILING',
      'I-751 联名、单独递交或豁免',
      'I-751 joint filing, separate child petition or waiver',
      all(filing, reviewed(a?.interviewRequirement)),
      s.marriageWaiver,
      'PD-274',
      [
        '死亡、最终离婚或撤销、家暴或极端残忍、以及条件居留期间出现的极端困难各有不同举证条件。',
        'Death, final divorce or annulment, battery or extreme cruelty, and extreme hardship arising during conditional residence have distinct evidence requirements.',
      ],
      checkStatus(filing),
    ),
  ];
}

function deportabilityCheck(a?: UsTravelAnswers) {
  const facts = a?.deportabilityFacts;
  if (!facts) return reviewed(a?.deportability);
  const law = v.deportability.value;
  const cimt = facts.singleCimt;
  const first = cimt
    ? all(
        cimt.possibleSentenceMonths >= law.cimtSentenceMonths,
        cimt.committedOn >= cimt.admittedOn,
        any(
          cimt.committedOn <= afterYears(cimt.admittedOn, law.cimtYears),
          all(
            cimt.sWitness,
            cimt.committedOn <= afterYears(cimt.admittedOn, law.witnessYears),
          ),
        ),
      )
    : facts.independentCimtCount === 0
      ? false
      : undefined;
  const drug =
    facts.controlledSubstance === 'none'
      ? true
      : facts.controlledSubstance === 'single-simple-cannabis'
        ? atMost(facts.cannabisGrams, v.crime.value.cannabisGrams)
        : facts.controlledSubstance === 'other'
          ? false
          : undefined;
  return all(
    not(first),
    atMost(facts.independentCimtCount, v.crime.value.multipleConvictions - 1),
    not(facts.aggravatedFelony),
    drug,
    reviewed(facts.earlyMarriageTermination),
    reviewed(facts.otherGround),
    facts.unclassified === false ? true : undefined,
  );
}

export function travelChecks(request: UsFullRequest) {
  const check = checksFor(request);
  const obligation = (...args: Parameters<typeof check>) => ({
    ...check(...args),
    informational: true as const,
  });
  const a = request.travel;
  const date = request.simulationDate;
  const birth = request.dateOfBirth;
  const reg = v.registration.value;
  const address = v.address.value;
  const carrying =
    birth && date < afterYears(birth, reg.carryAge)
      ? true
      : a?.carryingEvidence === false && !birth
        ? undefined
        : a?.carryingEvidence;
  const moved = a?.movedOn;
  const reported = a?.addressReportedOn;
  const addressMet =
    moved === 'no-move'
      ? true
      : moved && reported && reported !== 'not-reported'
        ? reported >= moved &&
          reported <= addDays(moved, address.days) &&
          reported <= date
        : moved && reported === 'not-reported'
          ? date <= addDays(moved, address.days)
          : undefined;
  const birthday = birth ? afterYears(birth, reg.renewAge) : undefined;
  const expiry = a?.cardExpiresOn;
  const filed = a?.replacementFiledOn;
  const needsAgeReplacement =
    birthday &&
    birthday <= date &&
    request.permanentResident &&
    request.permanentResident < birthday &&
    expiry &&
    birth
      ? expiry >= afterYears(birth, address.expiresBeforeAge)
      : false;
  const ageReplacement =
    needsAgeReplacement && birthday
      ? filed === 'not-filed'
        ? date <= addDays(birthday, reg.reRegisterDays)
        : filed
          ? filed >= birthday &&
            filed <= addDays(birthday, reg.reRegisterDays) &&
            filed <= date
          : undefined
      : birth && expiry && request.permanentResident
        ? true
        : undefined;
  const expiryReplacement =
    request.conditional && request.conditional !== 'none'
      ? false
      : expiry
        ? date >= addMonths(expiry, -address.renewalMonths)
        : undefined;
  const renewalNeeded = any(expiryReplacement, a?.otherReplacementGround);
  const renewal =
    renewalNeeded === false
      ? true
      : renewalNeeded === true && filed === 'not-filed'
        ? false
        : filed && filed !== 'not-filed'
          ? filed <= date
          : undefined;

  const trips = request.trips?.filter(
    (trip) =>
      !request.permanentResident || trip.returned > request.permanentResident,
  );
  const trip = trips?.reduce<(typeof trips)[number] | undefined>(
    (latest, item) =>
      !latest || item.returned > latest.returned ? item : latest,
    undefined,
  );
  const oneYear = trip
    ? trip.returned >=
      afterYears(trip.departed, legacy.greenCardReturnYears.value)
    : undefined;
  const longTrip = trip
    ? daysBetween(trip.departed, trip.returned) - 1 >
      legacy.seekingAdmissionDays.value
    : undefined;
  const seekingAdmission =
    trips?.length === 0
      ? false
      : any(
          longTrip,
          a?.admissionTriggers === 'none'
            ? false
            : a?.admissionTriggers === 'triggered'
              ? true
              : undefined,
        );
  const noTravel = trips?.length === 0 && a?.returnDocument === undefined;
  const route = a?.returnDocument;
  const issuance = a?.permitIssuedOn;
  const permitLaw = v.reentryPermit.value;
  const permitTerm =
    a?.permitRestrictedToOneYear === undefined
      ? undefined
      : a.permitRestrictedToOneYear
        ? permitLaw.restrictedYears
        : permitLaw.years;
  const permitExpiry =
    a?.permitExpiresOn ??
    (issuance && permitTerm !== undefined
      ? afterYears(issuance, permitTerm)
      : undefined);
  const permitValid =
    trip && issuance && permitExpiry
      ? issuance <= trip.returned && trip.returned < permitExpiry
      : undefined;
  const document = noTravel
    ? true
    : all(
        route === 'reentry-permit'
          ? permitValid === undefined
            ? a?.documentValidAtReturn
            : all(a?.documentValidAtReturn ?? permitValid, permitValid)
          : a?.documentValidAtReturn,
        route === 'green-card'
          ? not(oneYear)
          : route === 'reentry-permit'
            ? all(a?.permitAppliedInUs, a?.permitBiometricsInUs)
            : route === 'sb1'
              ? reviewed(a?.sb1OutsideControl)
              : route === 'continuous-journey'
                ? a?.continuousJourneyStartedInTime
                : route === 'none'
                  ? false
                  : undefined,
      );
  return {
    seekingAdmission,
    returnedOn: trip?.returned,
    checks: [
      obligation(
        'C18-REGISTRATION',
        '登记与随身携证',
        'Registration and carrying evidence',
        all(
          a?.registration === 'registered'
            ? true
            : a?.registration === 'unregistered'
              ? false
              : undefined,
          carrying,
        ),
        s.registration,
        'PD-268',
        [
          `已登记绿卡持有人年满 ${reg.carryAge} 岁应随身携带登记证明。外交豁免子女登记需另行核对。`,
          `Registered green card holders must carry their registration evidence from age ${reg.carryAge}. Registration of children with diplomatic immunity requires separate confirmation.`,
        ],
      ),
      obligation(
        'C19-ADDRESS',
        '地址变更申报',
        'Change-of-address reporting',
        addressMet,
        s.address,
        'PD-274',
        [
          `搬家后 ${address.days} 天内报备，尚在期限内的可及时提交。`,
          `Report a move within ${address.days} days. A report can still be timely while the deadline is open.`,
        ],
      ),
      obligation(
        'C19-REPLACEMENT',
        '绿卡证件更新',
        'Green card replacement and renewal',
        all(ageReplacement, renewal),
        s.address,
        'PD-274',
        [
          `通常在离到期不足 ${address.renewalMonths} 个月时申领续卡，年满 ${reg.renewAge} 岁后换卡适用例外。条件卡续期走取消条件程序。`,
          `Normally apply when an expiring card is within ${address.renewalMonths} months of expiry. Exceptions apply to replacement at age ${reg.renewAge}. Conditional cards use removal of conditions.`,
        ],
      ),
      check(
        'C20-SEEKING-ADMISSION',
        '返美是否进入不予入境审查',
        'Whether return triggers a new admission examination',
        seekingAdmission === undefined ? undefined : true,
        s.seekingAdmission,
        'PD-269',
        seekingAdmission
          ? [
              '本次返美须按寻求入境审查，下方列出相关准入条件。',
              'This return requires inspection as an applicant for admission. Admission checks follow.',
            ]
          : seekingAdmission === false
            ? [
                '所填资料未触发寻求入境。',
                'The facts entered do not trigger a new admission examination.',
              ]
            : [
                '需核对离境时间、放弃永居、离境后违法、程序中离境、刑事记录及入境口岸。',
                'Confirm trip length, abandonment, illegal activity abroad, pending proceedings, criminal grounds and the port of entry.',
              ],
      ),
      check(
        'C21-DEPORTABILITY',
        '境内递解事由',
        'Grounds of deportability',
        deportabilityCheck(a),
        s.removal,
        'PD-269',
      ),
      check(
        'C22-RETURN-DOCUMENT',
        '返美证件及适用例外',
        'Return documents and applicable exceptions',
        document,
        s.return,
        ['PD-095', 'PD-274'],
      ),
      check(
        'C22-RESIDENCE-INTENT',
        '保有美国永久居留意图',
        'Intent to retain U.S. permanent residence',
        all(
          request.permanentResident
            ? request.permanentResident <= date
            : undefined,
          noTravel ? true : reviewed(a?.abandonment),
        ),
        s.return,
        'PD-274',
        [
          '回美证与 SB-1 不替代对离境目的、在美联系及非自愿滞留证据的审核。',
          'A reentry permit or SB-1 does not replace review of travel purpose, U.S. ties and evidence of a stay outside your control.',
        ],
      ),
    ],
  };
}
