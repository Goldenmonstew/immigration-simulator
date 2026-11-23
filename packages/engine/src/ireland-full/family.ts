import {
  ireland2026_11 as pilot,
  irelandFull2026_11 as full,
} from '@uk-immigration/policy-data';
import { addDays, addMonths } from '../dates';
import type { IePathway } from '../ireland';
import { afterYears } from '../pilot';
import type { IsoDate } from '../types';
import {
  ageAtLeast,
  all,
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
  nextRenewalOn?: IsoDate;
  establishedFamilyPermission?: boolean;
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
  /** Facts for a new application or re-check under the family policies. */
  application?: {
    date?: IsoDate;
    channel?:
      | 'ordinary'
      | 'spouse-registration'
      | 'spouse-in-state'
      | 'de-facto-in-state'
      | 'de-facto-overseas';
    entryOrConversionValid?: boolean;
    sponsorResponsible?: boolean;
    grossTaxYears?: number[];
    previousTaxYearNet?: number;
    minorChildren?: number;
    incomeMaintained?: boolean;
    chieflyOnStateSupportYears?: number;
    verifiedSavingsMaySupplement?: boolean;
    noSocialWelfare?: boolean;
    differentPartnerGrantOn?: IsoDate;
    priorSponsorshipHistoryComplete?: boolean;
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

function familyApplication(
  a: IrelandAssessment,
  data: IrelandFamily,
  dob?: IsoDate,
) {
  const { add, L, day } = a;
  const app = data.application ?? {};
  const date = app.date ?? day;
  const versions = p.versions.value;
  const current = date >= versions.currentFrom;
  const revised = date >= versions.revisedFrom;
  const channel = app.channel;
  const specialised =
    channel === 'spouse-in-state' ||
    channel === 'de-facto-in-state' ||
    channel === 'de-facto-overseas';
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
  add(
    'B14',
    all(data.sponsorLawfulAndResident, waiting, app.entryOrConversionValid),
    L(
      `核对合格 A／B／C 类担保人与入境或境内转换。C 类新案通常等 ${n.categoryCWaitMonths} 个月，特定国际保护家庭等 ${n.protectionWaitYears} 年。`,
      `Check the qualifying category A, B or C sponsor and entry or in-State permission. New category C cases usually wait ${n.categoryCWaitMonths} months, or ${n.protectionWaitYears} years for specified protection families.`,
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
  let sponsorHistory: boolean | undefined = app.priorSponsorshipHistoryComplete;
  if (app.differentPartnerGrantOn && (partner || rel === undefined)) {
    const standard =
      date >= afterYears(app.differentPartnerGrantOn, n.changeSponsorYears);
    const dedicated =
      date >= afterYears(app.differentPartnerGrantOn, n.specializedChangeYears);
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
    ),
    ['PD-330'],
  );

  const inc = p.income.value;
  const reliance = app.chieflyOnStateSupportYears;
  const relianceMet =
    reliance === undefined ? undefined : reliance < inc.relianceYears;
  add(
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
  if (category !== 'C' || children === 0 || children === undefined) {
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
  if (category === 'C' && children !== undefined && children > 0) {
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

  if (current) {
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
  if (channel === 'spouse-registration' || channel === 'spouse-in-state') {
    const coverage =
      insurance?.permissionMonths === undefined
        ? e.firstRegistrationInsuranceMonths
        : Math.min(
            insurance.permissionMonths,
            e.firstRegistrationInsuranceMonths,
          );
    const ins = insurance
      ? all(
          insurance.hospitalAndMedical,
          insurance.coversRequiredPeople,
          insurance.coverageMonths === undefined
            ? undefined
            : insurance.coverageMonths >= coverage,
        )
      : undefined;
    add(
      'B21',
      all(
        data.sponsorIrish,
        partner && rel !== 'de-facto',
        livingTogether,
        app.addressEvidence,
        ins,
        channel === 'spouse-in-state'
          ? character(app.applicantCharacter)
          : true,
      ),
      L(
        `核对爱尔兰公民合法配偶／民事伴侣、同址及首次登记保险（通常 ${e.firstRegistrationInsuranceMonths} 个月，较短许可按全段）。专门境内案参见 PD-330。`,
        `Check the Irish spouse or civil partner, joint address and first-registration insurance (normally ${e.firstRegistrationInsuranceMonths} months or the full shorter permission). See PD-330 for the dedicated in-State route.`,
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
      add(
        'B22',
        all(base, livingTogether),
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
) {
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
  const useLegacy = !child && !alternate && !changed;
  a.time(clock, ['FAMILY-LEGACY-TIME'], [['PD-118', 'PD-329']], useLegacy);
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
  const years = pilot.values.spouse1gYears.value;
  const sufficient = data.dependentPeriods
    ? mergePeriods(data.dependentPeriods, addDays(day, -1)).some(
        ({ from, to }) => afterYears(from, years) <= addDays(to, 1),
      )
    : undefined;
  const combinedOnly =
    sufficient === false &&
    data.dependentPeriods &&
    registeredMonths(data.dependentPeriods, day, years * 12);
  const ordinary = child
    ? combinedOnly
      ? undefined
      : sufficient
    : clock.status === 'MET'
      ? true
      : clock.status === 'UNKNOWN'
        ? undefined
        : false;
  const independentOnNaturalisation =
    alternate && event && data.dependentPeriods
      ? mergePeriods(data.dependentPeriods, event).some(
          ({ from, to }) =>
            to === event &&
            afterYears(from, pRel.naturalisedSponsorDependentYears) <= event,
        )
      : undefined;
  const eligibleAtRenewal = alternate
    ? data.nextRenewalOn === undefined
      ? undefined
      : day >= data.nextRenewalOn
    : undefined;
  const eligible = changed
    ? changed.approval
    : alternate
      ? ordinary === true
        ? true
        : eligibleAtRenewal
      : ordinary;
  add(
    'B12',
    eligible,
    L(
      `家庭许可通常需 ${years} 年。担保人在依亲期间入籍，可于下次线上续期申请；入籍时依亲不足 ${pRel.naturalisedSponsorDependentYears} 年时，按此入口获发的许可仍附担保条件。`,
      `Usually ${years} years on a family permission. A sponsor naturalising during dependency allows filing at the next online renewal. If dependency was under ${pRel.naturalisedSponsorDependentYears} years at naturalisation, permission through that branch remains sponsor-dependent.`,
    ),
    ['PD-118', 'PD-329'],
    !useLegacy,
  );
  if (alternate)
    add(
      'FAMILY-INDEPENDENCE',
      ordinary === true
        ? true
        : all(eligibleAtRenewal, independentOnNaturalisation),
      L(
        '分开核对能否在下次续期申请 Stamp 4 和许可是否独立于担保人。',
        'Assess independence from the sponsor separately from eligibility to apply for Stamp 4 at the next renewal.',
      ),
      ['PD-329'],
    );
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
  if (data.application) familyApplication(a, data, dob);
}

export function directFamily(
  a: IrelandAssessment,
  data: IrelandFamily,
  dob?: IsoDate,
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
  familyApplication(a, { ...data, sponsorCategory: 'A' }, dob);
}
