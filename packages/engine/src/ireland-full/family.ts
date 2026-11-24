import { irelandFull2026_11 as full } from '@uk-immigration/policy-data';
import { addDays, addMonths } from '../dates';
import type { IePathway } from '../ireland';
import { afterYears } from '../pilot';
import type { IsoDate } from '../types';
import {
  ageAtLeast,
  all,
  any,
  character,
  mergePeriods,
  registeredMonths,
} from './common';
import type {
  IrelandAssessment,
  IrelandCharacter,
  IrelandResidencePeriod,
} from './common';

const p = full.family;

type FamilyRelationship =
  'spouse' | 'civil-partner' | 'de-facto' | 'child' | 'other';

interface FamilyReturn {
  date: IsoDate;
  currentPermissionCoversReturn: boolean;
}

interface FamilyFiling {
  returning?: FamilyReturn;
  spouseEntry?: 'with-permission' | 'spouse-unit';
  spousePermissionValid?: boolean;
}

export interface IrelandFamily {
  relationship?: FamilyRelationship;
  relationshipValidAndGenuine?: boolean;
  livingTogether?: boolean;
  intendsToLiveTogetherInState?: boolean;
  cohabitationFrom?: IsoDate;
  compelledSeparation?: boolean;
  childUnmarriedDependent?: boolean;
  custodyConsent?: boolean;
  /** Whether both partners are of age, under the applicable relationship policy. */
  sponsorAdult?: boolean;
  sponsorCategory?: 'A' | 'B' | 'C';
  sponsorIrish?: boolean;
  sponsorLawfulAndResident?: boolean;
  sponsorQualifyingFrom?: IsoDate;
  protectionRelationshipFormedAfterEntry?: boolean;
  grantOn?: IsoDate;
  sponsorNaturalisedOn?: IsoDate;
  /** Earliest online renewal on or after becoming eligible for this route. */
  nextRenewalOn?: IsoDate;
  /** Confirms that the applicant already holds the relevant family permission. */
  establishedFamilyPermission?: boolean;
  /** Lawful residence in the State under a qualifying dependent permission. */
  dependentPeriods?: IrelandResidencePeriod[];
  change?: {
    kind: 'separation' | 'death' | 'domestic-abuse';
    endedOn?: IsoDate;
    relationshipFrom?: IsoDate;
    lastCohabitationFrom?: IsoDate;
    notificationWorkingDays?: number;
    approval?: boolean;
    abusePermissionEvidence?: boolean;
  };
  /** Facts for a new family application, first registration or renewal. */
  application?: {
    date?: IsoDate;
    /** 'first' registers an approved entry. 'renewal' keeps the existing permission. */
    registrationStage?: 'first' | 'renewal';
    /** Whether the permission letter imposes a specific insurance condition on renewal. */
    renewalInsuranceRequired?: boolean;
    renewalInsuranceConditionMet?: boolean;
    channel?:
      | 'ordinary'
      | 'spouse-registration'
      | 'spouse-in-state'
      | 'de-facto-in-state'
      | 'de-facto-overseas';
    /** Confirm the approved entry or eligibility to use the selected in-State channel. */
    entryOrConversionValid?: boolean;
    /** Confirm a basis for re-entry and lawful status eligible for conversion on this return date. */
    entryOrConversionOnReturn?: { date: IsoDate; valid: boolean };
    /** Select the Spouse Unit for the special cases listed by ISD, including short-stay visas and refused registration. */
    spouseInStateEntry?: FamilyFiling['spouseEntry'];
    /** Case-specific evidence that remaining in the State would not create an undue burden under the Spouse Unit scheme. */
    spouseUnitUndueBurdenCleared?: boolean;
    sponsorResponsible?: boolean;
    /** Earned gross income by tax year. For the Spouse Unit, exclude State welfare benefits. */
    grossTaxYears?: number[];
    previousTaxYearNet?: number;
    minorChildren?: number;
    incomeMaintained?: boolean;
    chieflyOnStateSupportYears?: number;
    verifiedSavingsMaySupplement?: boolean;
    noSocialWelfare?: boolean;
    differentPartnerGrantOn?: IsoDate;
    priorSponsorshipHistoryComplete?: boolean;
    /** Documents on the checklist for the selected application or registration stage. */
    familyEvidenceComplete?: boolean;
    addressEvidence?: boolean;
    applicantCharacter?: IrelandCharacter;
    sponsorCharacter?: IrelandCharacter;
    publicInterestCleared?: boolean;
    visa?: 'single' | 'multiple' | 'preclearance' | 'exempt';
    visaFeePrepared?: boolean;
    visaFeeExempt?: boolean;
    insuranceRequiredForEntry?: boolean;
    insuranceEvidenceAtEntry?: boolean;
    insurance?: {
      kind?: 'private' | 'travel-bridge';
      hiaAuthorised?: boolean;
      coversRequiredPeople?: boolean;
      coverageMonths?: number;
      permissionMonths?: number;
      hospitalAndMedical?: boolean;
      accidentCover?: number;
      illnessCover?: number;
      coversUntilPrivateStarts?: boolean;
    };
    overseasLawfulAndRemainsAbroad?: boolean;
    applicationSummaryOn?: IsoDate;
    submittedDocumentsOn?: IsoDate;
    sponsorBankMonths?: number;
    /** One certificate date per required foreign jurisdiction, with coverage confirmed. */
    policeCertificates?: {
      allRequiredCountriesCovered?: boolean;
      issueDates: IsoDate[];
    };
    housing?: {
      kind?:
        | 'private-owned'
        | 'private-rented'
        | 'excluded-public'
        | 'other-support';
      rooms?: {
        floorSquareFeet: number;
        ceilingFeet: number;
        occupantCount: number;
        oppositeSexOccupantsAtLeastTenNotCouple?: boolean;
      }[];
      bedroomCount?: number;
      childrenShareCompatibly?: boolean;
      unrelatedAdultsWithChildren?: boolean;
      entireHome?: boolean;
      titleOrRtbAndAccom1?: boolean;
      affordable?: boolean;
      evidenceRequestedOn?: IsoDate;
      evidenceSubmittedOn?: IsoDate;
    };
  };
}

export function isFirstFamilyRegistration(data: IrelandFamily | undefined) {
  const app = data?.application;
  return (app?.channel === 'spouse-registration' && app.registrationStage !== 'renewal') ||
    (app?.registrationStage === 'first' &&
      (app.channel === 'ordinary' || app.channel === 'de-facto-overseas'));
}

function firstRegistrationInsurance(insurance: NonNullable<IrelandFamily['application']>['insurance']) {
  if (!insurance) return undefined;
  const months = p.evidence.value.firstRegistrationInsuranceMonths;
  const coverage = Math.min(insurance.permissionMonths ?? months, months);
  return all(
    insurance.hospitalAndMedical,
    insurance.coversRequiredPeople,
    insurance.coverageMonths === undefined
      ? undefined
      : insurance.coverageMonths >= coverage,
  );
}

function firstFamilyRegistration(
  a: IrelandAssessment,
  data: IrelandFamily,
  inState: boolean | undefined,
) {
  const app = data.application;
  const spouseChannel = app?.channel === 'spouse-registration';
  const spouseRelationship = data.relationship === undefined
    ? undefined
    : data.relationship === 'spouse' || data.relationship === 'civil-partner';
  const irishSpouse =
    spouseChannel || (data.sponsorIrish === true && spouseRelationship === true);
  const jointAddress = irishSpouse || data.relationship === 'de-facto';
  const months = p.evidence.value.firstRegistrationInsuranceMonths;
  a.add(
    irishSpouse ? 'B21' : 'FAMILY-FIRST-REGISTRATION',
    all(
      inState,
      app?.entryOrConversionValid,
      app?.familyEvidenceComplete,
      spouseChannel ? all(data.sponsorIrish, spouseRelationship) : true,
      jointAddress ? all(data.livingTogether, app?.addressEvidence) : true,
      irishSpouse ? firstRegistrationInsurance(app?.insurance) : true,
    ),
    irishSpouse
      ? a.L(
          `在爱尔兰首次登记，核对双方护照、关系及共同住址证明、适用的准许信，以及覆盖医疗和住院的保险。保险通常涵盖 ${months} 个月，较短停留须全程覆盖。`,
          `For first registration in Ireland, check both passports, proof of relationship and joint address, any applicable permission letter, and insurance covering medical and hospital care for ${months} months or the entire shorter stay.`,
        )
      : a.L(
          '凭获准的家庭入境许可在爱尔兰首次登记。按获准 Stamp 的清单核对护照、准许信及适用的担保人、关系和住址文件。',
          'Register in Ireland after approved family entry. Use the granted Stamp’s checklist for passports, the permission letter and any applicable sponsor, relationship and address documents.',
        ),
    ['PD-330'],
  );
}

function familyRenewal(
  a: IrelandAssessment,
  data: IrelandFamily,
  inState: boolean | undefined,
) {
  const app = data.application;
  const irishSpouse =
    data.sponsorIrish === true &&
    (data.relationship === 'spouse' || data.relationship === 'civil-partner');
  const jointAddress = irishSpouse ||
    (data.sponsorIrish === true && data.relationship === 'de-facto');
  a.add(
    irishSpouse ? 'B21' : 'FAMILY-RENEWAL',
    all(
      inState,
      data.establishedFamilyPermission,
      app?.familyEvidenceComplete,
      jointAddress ? all(data.livingTogether, app?.addressEvidence) : true,
      app?.renewalInsuranceRequired === true
        ? app.renewalInsuranceConditionMet
        : true,
    ),
    irishSpouse
      ? a.L(
          '须在爱尔兰递交，核对双方护照、当前 IRP、结婚或民事伴侣证明、共同住址及许可附加保险条件。',
          'Apply from Ireland with both passports, the current IRP, the marriage or civil partnership certificate and proof of joint address. Check any insurance condition in the permission.',
        )
      : a.L(
          '须在爱尔兰递交，核对现行许可所属的续期清单，包括当前 IRP、护照及适用的担保人文件、共同住址、持续关系证明和许可附加条件。',
          'Apply from Ireland using the checklist for the current permission, including the current IRP, passport and any required sponsor documents, joint address, proof of a continuing relationship and permission conditions.',
        ),
    ['PD-329'],
  );
}

function familyApplication(
  a: IrelandAssessment,
  data: IrelandFamily,
  dob: IsoDate | undefined,
  inState: boolean | undefined,
  filing: FamilyFiling,
) {
  const { add, L, day } = a;
  const app = data.application ?? {};
  const channel = app.channel;
  const inStateSpouse = channel === 'spouse-in-state';
  const spouseEntry = inStateSpouse ? filing.spouseEntry : undefined;
  const inStateDeFacto = channel === 'de-facto-in-state';
  const inStateConversion = inStateSpouse || inStateDeFacto;
  const returning = inStateConversion ? filing.returning : undefined;
  const returnOn = returning?.date;
  const returnEvidence = app.entryOrConversionOnReturn;
  const entryOrConversion = !returning || returning.currentPermissionCoversReturn
    ? app.entryOrConversionValid
    : undefined;
  const eligibleBasis = all(
    inStateSpouse && spouseEntry === undefined ? undefined : true,
    spouseEntry === 'with-permission' ? filing.spousePermissionValid : true,
    returning && returnEvidence?.date === returning.date ? returnEvidence.valid : entryOrConversion,
  );
  const filedOn = app.date ?? day;
  const date = returnOn && returnOn > filedOn ? returnOn : filedOn;
  const versions = p.versions.value;
  const current = date >= versions.currentFrom;
  const revised = date >= versions.revisedFrom;
  const specialised = inStateConversion || channel === 'de-facto-overseas';
  function addApplicationCheck(
    id: 'B14' | 'B21' | 'B22',
    eligible: boolean | undefined,
    explanation: string,
    pendingDetails: string[],
  ) {
    if (!inStateConversion) {
      add(id, eligible, explanation, pendingDetails);
      return;
    }
    const waitingForReturn = inState === false && returnOn !== undefined;
    const present = waitingForReturn ? false : inState === true ? true : undefined;
    const presence = waitingForReturn
      ? eligibleBasis === undefined
        ? L(
            '须核对返爱当天可用于入境及境内转换的有效依据（PD-330）。',
            'Confirm a valid basis for re-entry and in-State conversion on the return date (PD-330).',
          )
        : L(`预计返爱日为 ${returnOn}。`, `Expected return to Ireland: ${returnOn}.`)
      : L('须在爱尔兰共和国境内递交。', 'File while present in the Republic of Ireland.');
    add(
      id,
      eligible === true ? present : eligible,
      `${explanation} ${presence}`,
      pendingDetails,
      waitingForReturn && eligible === true ? { availableOn: returnOn } : true,
    );
  }
  const category = data.sponsorCategory;
  const rel = data.relationship;
  const n = p.relationship.value;
  const wait =
    data.sponsorQualifyingFrom &&
    (data.protectionRelationshipFormedAfterEntry
      ? afterYears(data.sponsorQualifyingFrom, n.protectionWaitYears)
      : category === 'C'
        ? addMonths(data.sponsorQualifyingFrom, n.categoryCWaitMonths)
        : data.sponsorQualifyingFrom);
  const waiting =
    category === undefined
      ? undefined
      : category !== 'C'
        ? true
        : wait && revised
          ? date >= wait
          : undefined;
  addApplicationCheck(
    'B14',
    all(
      inStateDeFacto
        ? data.sponsorLawfulAndResident
        : any(
            data.sponsorLawfulAndResident,
            all(data.sponsorIrish, data.intendsToLiveTogetherInState),
          ),
      waiting,
      eligibleBasis,
    ),
    inStateDeFacto ? L(
      '境内 de facto 转换要求申请人与担保人已在爱尔兰合法居住，并核对申请人的现有许可是否允许转换。',
      'The in-State de facto route requires both partners to be lawfully resident in Ireland and the applicant to hold an eligible permission.',
    ) : L(
      `核对 A／B／C 类担保人与入境或转换资格。爱尔兰公民可拟回国定居。C 类新案通常等 ${n.categoryCWaitMonths} 个月，特定国际保护家庭等 ${n.protectionWaitYears} 年。`,
      `Check category A, B or C sponsorship and entry or conversion. Irish citizens may intend to move back to Ireland. New category C cases usually wait ${n.categoryCWaitMonths} months, or ${n.protectionWaitYears} years for specified protection families.`,
    ),
    ['PD-329', 'PD-330'],
  );
  const adult = ageAtLeast(dob, date, n.adult);
  const cohabitation = data.cohabitationFrom
    ? date >= afterYears(data.cohabitationFrom, n.deFactoYears)
    : undefined;
  const partner =
    rel === undefined
      ? undefined
      : rel === 'spouse' || rel === 'civil-partner' || rel === 'de-facto';
  const priorPartnerGrant = partner || rel === undefined ? app.differentPartnerGrantOn : undefined;
  const confirmInStateHistory = inStateConversion && priorPartnerGrant !== undefined;
  let sponsorHistory: boolean | undefined = app.priorSponsorshipHistoryComplete;
  if (confirmInStateHistory) {
    sponsorHistory = undefined;
  } else if (priorPartnerGrant) {
    const standard =
      date >= afterYears(priorPartnerGrant, n.changeSponsorYears);
    const dedicated =
      date >= afterYears(priorPartnerGrant, n.specializedChangeYears);
    sponsorHistory = !current
      ? undefined
      : channel === 'de-facto-overseas' && standard !== dedicated
        ? undefined
        : standard;
  }
  const livingTogether =
    data.livingTogether === false && data.compelledSeparation
      ? undefined
      : data.livingTogether;
  add(
    'B15',
    all(
      data.relationshipValidAndGenuine,
      rel === 'child'
        ? all(
            adult === undefined ? undefined : !adult,
            data.childUnmarriedDependent,
            data.custodyConsent,
          )
        : partner
          ? all(
              adult,
              data.sponsorAdult,
              data.intendsToLiveTogetherInState,
              rel === 'de-facto' ? cohabitation : true,
              sponsorHistory,
            )
          : rel === undefined
            ? undefined
            : false,
    ),
    L(
      `核对关系真实自愿、伴侣双方已成年；de facto 通常须共同生活 ${n.deFactoYears} 年。子女须核年龄、依赖及监护同意。`,
      `Check a genuine, freely formed relationship and that both partners are adults. De facto partners generally need ${n.deFactoYears} years of cohabitation. Check age, dependency and custody consent for a child.`,
    ) + (confirmInStateHistory ? L(
      ' 此前为另一位伴侣获批的许可须由 ISD 确认对本次境内转换的影响（PD-330）。',
      ' Ask ISD how a previous grant for a different partner affects this in-State conversion (PD-330).',
    ) : ''),
    ['PD-330'],
  );

  const inc = p.income.value;
  const reliance = app.chieflyOnStateSupportYears;
  const relianceMet =
    reliance === undefined ? undefined : reliance < inc.relianceYears;
  if (spouseEntry === 'spouse-unit') {
    add(
      'B16',
      app.spouseUnitUndueBurdenCleared,
      L(
        '配偶事务组逐案核对申请人获准留下后是否会成为国家的过度负担（PD-330）。',
        'The Spouse of Irish National Unit assesses whether granting permission would create an undue burden on the State (PD-330).',
      ),
      ['PD-330'],
    );
  } else if (!inStateSpouse) add(
    'B16',
    all(
      app.sponsorResponsible,
      channel === 'de-facto-in-state'
        ? app.noSocialWelfare === true
          ? true
          : app.noSocialWelfare === false && !current
            ? false
            : undefined
        : relianceMet === false && app.verifiedSavingsMaySupplement
          ? undefined
          : relianceMet,
    ),
    L(
      `核对单一担保人承担支持义务、主要依赖公帑是否连续达到 ${inc.relianceYears} 年，以及可核储蓄（PD-330、PD-331）。`,
      `Check support by one sponsor, main dependence on State support for ${inc.relianceYears} years, and verifiable savings (PD-330, PD-331).`,
    ),
    ['PD-330', 'PD-331'],
  );

  const taxYears = app.grossTaxYears;
  const adultIncome =
    taxYears?.length === inc.taxYearsA
      ? taxYears.reduce((sum, income) => sum + income, 0)
      : undefined;
  const preliminary =
    adultIncome === undefined
      ? undefined
      : adultIncome >= (current ? inc.categoryA : inc.previousCategoryA);
  const dedicated =
    adultIncome === undefined
      ? undefined
      : adultIncome >= inc.specializedCategoryA;
  const children = app.minorChildren;
  const gross =
    category === 'A'
      ? specialised && current && dedicated !== preliminary
        ? undefined
        : all(preliminary, app.incomeMaintained)
      : category === 'B'
        ? all(
            taxYears === undefined ? undefined : taxYears.length > 0,
            app.incomeMaintained,
          )
        : category === 'C' && children === 0 && revised
          ? all(
              taxYears?.length ? taxYears.at(-1)! > inc.categoryC : undefined,
              app.incomeMaintained,
            )
          : undefined;
  if (spouseEntry === 'spouse-unit') {
    add(
      'B17',
      adultIncome === undefined ? undefined : adultIncome >= inc.specializedCategoryA,
      L(
        `配偶事务组核对爱尔兰公民配偶或民事伴侣过去 ${inc.taxYearsA} 年合计至少 €${inc.specializedCategoryA} 的收入，国家福利不计。`,
        `The Spouse of Irish National Unit checks that the Irish spouse or civil partner earned at least €${inc.specializedCategoryA} over the last ${inc.taxYearsA} years, excluding State welfare benefits.`,
      ),
      ['PD-330'],
    );
  } else if (!inStateSpouse && (category !== 'C' || children === 0 || children === undefined)) {
    add(
      'B17',
      gross === false && app.verifiedSavingsMaySupplement ? undefined : gross,
      L(
        category === 'A'
          ? `A 类按 ${inc.taxYearsA} 个税年税前合计 €${current ? inc.categoryA : inc.previousCategoryA}；专门渠道仍列 €${inc.specializedCategoryA}，冲突见 PD-330。`
          : `B 类核对就业及继续满足许可；C 类无子女伴侣按适用版本核对上一税年税前收入是否超过 €${inc.categoryC}。`,
        category === 'A'
          ? `Category A uses €${current ? inc.categoryA : inc.previousCategoryA} gross over ${inc.taxYearsA} tax years. Dedicated pages still list €${inc.specializedCategoryA}; see PD-330.`
          : `Category B checks employment and continued permit eligibility. For a category C partner without children, check whether prior tax-year gross income exceeds €${inc.categoryC} under the applicable version.`,
      ),
      ['PD-329', 'PD-330', 'PD-331'],
    );
  }
  if (!inStateSpouse && category === 'C' && children !== undefined && children > 0) {
    const threshold =
      inc.categoryCWithChildren[
        Math.min(children, inc.categoryCWithChildren.length) - 1
      ];
    const net = app.previousTaxYearNet;
    const meets =
      !current ||
      date.slice(0, 4) !== inc.childrenTableYear ||
      net === undefined
        ? undefined
        : net > threshold;
    add(
      'B18',
      all(
        meets === false && app.verifiedSavingsMaySupplement ? undefined : meets,
        app.incomeMaintained,
      ),
      L(
        `${inc.childrenTableYear} 年表：此家庭上个税年的净收入须超过 €${threshold}。未公布的年度待确认（PD-331）。`,
        `${inc.childrenTableYear} table: this household's previous tax-year net income must exceed €${threshold}. Unpublished yearly limits need confirmation (PD-331).`,
      ),
      ['PD-329', 'PD-331'],
    );
  }

  if (current && !inStateSpouse) {
    const h = app.housing;
    const n = p.housing.value;
    const lived =
      h?.kind === 'excluded-public'
        ? false
        : h?.kind === 'private-owned' || h?.kind === 'private-rented'
          ? true
          : undefined;
    const hasChildren = children === undefined ? undefined : children > 0;
    const requiredBedrooms =
      children === undefined
        ? undefined
        : 1 + Math.ceil(children / n.childrenPerRoom);
    const rooms = h?.rooms?.length
      ? all(
          ...h.rooms.map((room) =>
            room.floorSquareFeet *
              Math.min(room.ceilingFeet, n.maxCeilingFeet) <
            room.occupantCount * n.cubicFeetPerPerson
              ? false
              : room.oppositeSexOccupantsAtLeastTenNotCouple === true
                ? false
                : room.occupantCount > 1
                  ? room.oppositeSexOccupantsAtLeastTenNotCouple === false
                    ? true
                    : undefined
                  : true,
          ),
        )
      : undefined;
    const housingEnd =
      h?.evidenceRequestedOn && addMonths(h.evidenceRequestedOn, n.replyMonths);
    const evidenceTiming = !housingEnd
      ? true
      : h.evidenceSubmittedOn
        ? h.evidenceSubmittedOn <= housingEnd
        : date > housingEnd
          ? undefined
          : true;
    const space =
      category !== 'C'
        ? true
        : all(
            h?.bedroomCount === undefined || requiredBedrooms === undefined
              ? undefined
              : h.bedroomCount >= requiredBedrooms,
            hasChildren === false
              ? true
              : hasChildren
                ? all(
                    h?.childrenShareCompatibly,
                    h?.entireHome,
                    h?.unrelatedAdultsWithChildren === undefined
                      ? undefined
                      : !h.unrelatedAdultsWithChildren,
                  )
                : undefined,
            rooms,
            h?.titleOrRtbAndAccom1,
            h?.affordable,
            evidenceTiming,
          );
    add(
      'B19',
      all(lived, space),
      L(
        `排除政策列明的公共住房。C 类须核卧室、同住、面积和产权／租赁材料；体积每人至少 ${n.cubicFeetPerPerson} 立方英尺，层高计算至 ${n.maxCeilingFeet} 英尺（PD-332）。`,
        `Excluded public accommodation does not qualify. Category C needs bedroom, sharing, space and ownership or tenancy evidence. Allow at least ${n.cubicFeetPerPerson} cubic feet per person, counting ceiling height up to ${n.maxCeilingFeet} feet (PD-332).`,
      ),
      ['PD-332'],
    );
  }

  const e = p.evidence.value;
  const visaAmount =
    app.visaFeeExempt || app.visa === 'exempt'
      ? e.exempt
      : app.visa === 'single' ||
          (app.visa === 'preclearance' && channel === 'de-facto-overseas')
        ? e.singleVisa
        : app.visa === 'multiple'
          ? e.multiVisa
          : undefined;
  add(
    'B20',
    all(
      app.familyEvidenceComplete,
      app.publicInterestCleared,
      app.insuranceRequiredForEntry === true
        ? app.insuranceEvidenceAtEntry
        : channel === 'ordinary' && app.insuranceRequiredForEntry === undefined
          ? undefined
          : true,
    ),
    L(
      `核对双方材料、安全与公共卫生审查及适用的入境保险。一般团聚不设语言或知识考试。签证或已公布预审费 ${visaAmount === undefined ? '待确认' : `€${visaAmount}`}。`,
      `Check applicant and sponsor evidence, public interest review and any entry insurance. Ordinary family reunification has no language or civics test. Visa or published preclearance fee: ${visaAmount === undefined ? 'unconfirmed' : `€${visaAmount}`}.`,
    ),
    ['PD-330'],
  );
  add(
    'FAMILY-ENTRY-FEE',
    visaAmount === undefined
      ? undefined
      : visaAmount === e.exempt
        ? true
        : app.visaFeePrepared,
    visaAmount === undefined
      ? L(
          '按入口和辖区核对签证或预审费用（PD-339）。',
          'Confirm visa or preclearance fees for the specific channel and jurisdiction (PD-339).',
        )
      : L(
          `此入口费用 €${visaAmount}，登记费另核。`,
          `Fee for this channel: €${visaAmount}. Registration fees are assessed separately.`,
        ),
    ['PD-339'],
    false,
  );
  const insurance = app.insurance;
  if (inStateSpouse) {
    addApplicationCheck(
      'B21',
      all(
        data.sponsorIrish,
        partner && rel !== 'de-facto',
        livingTogether,
        app.addressEvidence,
        spouseEntry === 'with-permission'
          ? app.familyEvidenceComplete
          : spouseEntry === 'spouse-unit' ? true : undefined,
        character(app.applicantCharacter),
        eligibleBasis,
      ),
      spouseEntry === 'spouse-unit' ? L(
        '配偶事务组按专门清单核对配偶关系、同址、品格和申请材料（PD-330）。',
        'The Spouse of Irish National Unit uses its own checklist for the relationship, joint address, character and application documents (PD-330).',
      ) : L(
        '线上换签须有现行有效的已登记许可。核对 IRP、配偶关系、双方身份、同址及财力证明。续期待决时须核实现行许可（PD-330）。',
        'Changing permission online requires a current, valid registered permission. Check the IRP and proof of the relationship, both identities, joint address and financial means. If a renewal is pending, confirm current permission (PD-330).',
      ),
      ['PD-330'],
    );
  }
  if (channel === 'de-facto-in-state' || channel === 'de-facto-overseas') {
    const police = app.policeCertificates;
    const validPolice =
      police &&
      all(
        police.allRequiredCountriesCovered,
        ...police.issueDates.map(
          (issued) =>
            issued <= date &&
            date <= addMonths(issued, e.clearanceValidityMonths),
        ),
      );
    const health =
      insurance &&
      all(
        insurance.coversRequiredPeople,
        insurance.hospitalAndMedical,
        channel === 'de-facto-in-state'
          ? insurance.kind === undefined
            ? undefined
            : insurance.kind === 'private'
          : insurance.kind === 'private'
            ? all(
                insurance.hiaAuthorised,
                insurance.coverageMonths !== undefined &&
                  insurance.permissionMonths !== undefined
                  ? insurance.coverageMonths >= insurance.permissionMonths
                  : undefined,
              )
            : insurance.kind === 'travel-bridge'
              ? all(
                  insurance.coversUntilPrivateStarts,
                  insurance.coverageMonths === undefined
                    ? undefined
                    : insurance.coverageMonths <=
                        e.firstRegistrationInsuranceMonths,
                  insurance.accidentCover === undefined
                    ? undefined
                    : insurance.accidentCover >= e.travelCoverEach,
                  insurance.illnessCover === undefined
                    ? undefined
                    : insurance.illnessCover >= e.travelCoverEach,
                )
              : undefined,
      );
    const base = all(
      rel === undefined ? undefined : rel === 'de-facto',
      data.sponsorIrish,
      cohabitation,
      validPolice,
      health,
      character(app.applicantCharacter),
      character(app.sponsorCharacter),
    );
    if (channel === 'de-facto-in-state') {
      addApplicationCheck(
        'B22',
        all(base, livingTogether, data.sponsorLawfulAndResident, eligibleBasis),
        L(
          `需合法境内渠道、私保及近 ${e.clearanceLookbackYears} 年相关外国的警察证明，签发距递交不超过 ${e.clearanceValidityMonths} 个月。获准通常为 ${n.deFactoGrantYears} 年 Stamp 4。`,
          `Use an eligible in-State channel with private insurance and police certificates for relevant foreign countries in the past ${e.clearanceLookbackYears} years, issued within ${e.clearanceValidityMonths} months. The usual grant is a ${n.deFactoGrantYears}-year Stamp 4.`,
        ),
        ['PD-330', 'PD-331'],
      );
    } else {
      const submitted =
        app.applicationSummaryOn && app.submittedDocumentsOn
          ? app.submittedDocumentsOn <=
            addDays(app.applicationSummaryOn, e.submitDays)
          : undefined;
      add(
        'B23',
        all(
          base,
          app.overseasLawfulAndRemainsAbroad,
          submitted,
          app.visaFeeExempt || app.visa === 'exempt'
            ? true
            : app.visaFeePrepared,
          app.sponsorBankMonths === undefined
            ? undefined
            : app.sponsorBankMonths >= e.sponsorBankMonths,
        ),
        L(
          `境外合法等候，${e.submitDays} 日内交资料与适用费用。旅行险仅作首年过渡，事故和疾病各至少 €${e.travelCoverEach}，并含住院。需 ${e.sponsorBankMonths} 个月担保人银行材料。`,
          `Remain lawfully abroad, submit evidence and any fee within ${e.submitDays} days, and provide ${e.sponsorBankMonths} months of sponsor bank evidence. First-year bridging travel cover needs at least €${e.travelCoverEach} each for accident and illness, plus hospital cover.`,
        ),
        ['PD-330'],
      );
    }
  }
}

export function independentFamily(
  a: IrelandAssessment,
  clock: IePathway,
  data: IrelandFamily,
  dob?: IsoDate,
  inState?: boolean,
  renewalOpens?: IsoDate,
  filing: FamilyFiling = {},
) {
  if (data.application?.registrationStage === 'renewal') {
    familyRenewal(a, data, inState);
    return;
  }
  if (isFirstFamilyRegistration(data)) {
    firstFamilyRegistration(a, data, inState);
    return;
  }
  const { add, L, day } = a;
  const pRel = p.relationship.value;
  const child = data.relationship === 'child';
  const partner =
    data.relationship === undefined
      ? undefined
      : data.relationship === 'spouse' ||
        data.relationship === 'civil-partner' ||
        data.relationship === 'de-facto';
  const adult = ageAtLeast(dob, day, pRel.adult);
  const eligibleChild =
    child && adult === false
      ? data.childUnmarriedDependent
      : child
        ? undefined
        : partner;
  const event = data.sponsorNaturalisedOn;
  const alternate =
    event &&
    event <= day &&
    data.dependentPeriods?.some(
      ({ from, to }) => from <= event && (!to || event <= to),
    );
  const changed = data.change;
  a.time(clock, ['FAMILY-LEGACY-TIME'], [['PD-118', 'PD-329']], false);
  add(
    'B11',
    all(
      eligibleChild,
      data.establishedFamilyPermission,
      changed?.kind === 'death' ? true : data.sponsorLawfulAndResident,
    ),
    L(
      '核对实际家庭团聚许可、家属类型和担保人的现行身份。成年子女或担保人变动须核准许信（PD-329）。',
      'Check the family reunification permission, family status and sponsor status. An adult child or sponsor change may require confirmation (PD-329).',
    ),
    ['PD-329'],
  );
  const years = pRel.independentResidenceYears;
  const renewal = data.nextRenewalOn && renewalOpens && data.nextRenewalOn < renewalOpens
    ? renewalOpens
    : data.nextRenewalOn;
  const reviewOn = renewal && renewal > day ? renewal : day;
  const periods = data.dependentPeriods?.filter(({ from }) => from <= day);
  const sufficient = periods
    ? mergePeriods(periods, addDays(reviewOn, -1)).some(
        ({ from, to }) => afterYears(from, years) <= addDays(to, 1),
      )
    : undefined;
  const ordinary = periods
    ? sufficient
      ? true
      : registeredMonths(periods, reviewOn, years * 12) === false
        ? false
        : undefined
    : child || clock.status === 'UNKNOWN'
      ? undefined
      : clock.status === 'MET' ||
        (clock.status === 'FUTURE' &&
          clock.earliestDate !== undefined &&
          clock.earliestDate <= reviewOn);
  const independentOnNaturalisation =
    alternate && event && data.dependentPeriods
      ? mergePeriods(data.dependentPeriods, event).some(
          ({ from, to }) =>
            to === event &&
            afterYears(from, pRel.naturalisedSponsorDependentYears) <= event,
        )
      : undefined;
  const eligibleAtRenewal = renewal === undefined ? undefined : day >= renewal;
  const timeEligible = alternate ? true : ordinary;
  const scheduledRenewal =
    !changed && timeEligible === true && eligibleAtRenewal === false && renewal
      ? { availableOn: renewal }
      : true;
  const eligible = changed
    ? changed.approval
    : timeEligible === true
      ? eligibleAtRenewal
      : timeEligible;
  add(
    'B12',
    eligible,
    L(
      `依亲居留满 ${years} 年或担保人在依亲期间入籍后，在下次线上续期申请${renewal ? `（${renewal}）` : ''}。若入籍时依亲不足 ${pRel.naturalisedSponsorDependentYears} 年，通过入籍分支获发的许可仍附担保条件。`,
      `Apply at the next online renewal${renewal ? ` (${renewal})` : ''} after ${years} years of dependent residence or a sponsor's naturalisation during dependency. If dependency was under ${pRel.naturalisedSponsorDependentYears} years at naturalisation, permission through that branch remains sponsor-dependent.`,
    ),
    ['PD-118', 'PD-329'],
    scheduledRenewal,
  );
  if (alternate) {
    const independent = any(ordinary, independentOnNaturalisation);
    add(
      'FAMILY-INDEPENDENCE',
      independent === true ? eligibleAtRenewal : independent,
      L(
        '分开核对能否在下次续期申请 Stamp 4 和许可是否独立于担保人。',
        'Assess independence from the sponsor separately from eligibility to apply for Stamp 4 at the next renewal.',
      ),
      ['PD-329'],
      independent === true ? scheduledRenewal : true,
    );
  }
  if (changed) {
    const ended = changed.endedOn;
    const relationshipMet =
      ended && changed.relationshipFrom
        ? ended >=
          afterYears(changed.relationshipFrom, pRel.endRelationshipYears)
        : undefined;
    const coResidenceMet =
      ended && changed.lastCohabitationFrom
        ? ended >=
          afterYears(changed.lastCohabitationFrom, pRel.coResidenceYears)
        : undefined;
    const timely =
      changed.notificationWorkingDays === undefined
        ? undefined
        : changed.notificationWorkingDays <= pRel.notifyWorkingDays;
    add(
      'B13',
      changed.approval ??
        (changed.kind === 'separation'
          ? all(relationshipMet, coResidenceMet, timely, undefined)
          : changed.kind === 'domestic-abuse' &&
              changed.abusePermissionEvidence === false
            ? false
            : undefined),
      L(
        `分居路线通常需关系满 ${pRel.endRelationshipYears} 年、在共和国同住满 ${pRel.coResidenceYears} 年，并在 ${pRel.notifyWorkingDays} 个工作日内通知。死亡与家暴按个案；家暴独立许可申请费 €${p.evidence.value.abuseApplication}。`,
        `Separation usually requires a ${pRel.endRelationshipYears}-year relationship, ${pRel.coResidenceYears} years living together in the State and notice within ${pRel.notifyWorkingDays} working days. Death and domestic abuse are assessed individually. The abuse-related application fee is €${p.evidence.value.abuseApplication}.`,
      ),
      ['PD-329'],
    );
  }
  if (data.application) familyApplication(a, data, dob, inState, filing);
}

export function directFamily(
  a: IrelandAssessment,
  data: IrelandFamily,
  dob?: IsoDate,
  inState?: boolean,
  filing: FamilyFiling = {},
) {
  const relation = data.relationship;
  a.add(
    'FAMILY-IRISH-SPONSOR',
    all(
      data.sponsorIrish,
      relation === undefined
        ? undefined
        : relation === 'spouse' ||
            relation === 'civil-partner' ||
            relation === 'de-facto',
    ),
  );
  if (data.application?.registrationStage === 'renewal') {
    familyRenewal(a, data, inState);
    return;
  }
  a.add(
    'FAMILY-CHANNEL',
    data.application?.channel === undefined
      ? undefined
      : relation === undefined
        ? undefined
        : relation === 'de-facto'
          ? data.application.channel === 'de-facto-in-state' ||
            data.application.channel === 'de-facto-overseas'
          : data.application.channel === 'ordinary' ||
            data.application.channel === 'spouse-registration' ||
            data.application.channel === 'spouse-in-state',
  );
  if (isFirstFamilyRegistration(data)) firstFamilyRegistration(a, data, inState);
  else familyApplication(a, { ...data, sponsorCategory: 'A' }, dob, inState, filing);
}
