import { greeceFull2026_11, grSource } from '@uk-immigration/policy-data';
import type { CountryCheck } from './country-result';
import { addMonths, addYears } from './dates';
import { overseasInvestorFiling } from './greece-common';
import type { GrFullRequest } from './greece-full';
import { ageOn, all, any, insuranceMet } from './greece-rules';
import type { GrContext } from './greece-rules';
import type { IsoDate } from './types';

type Answer = boolean | undefined;
type PropertyPath = 'GR-GOLDEN-VISA' | 'GR-GREEK-FAMILY-PR' | 'GR-EU-FAMILY-PR';

interface InvestorFamilyMember {
  kind: 'spouse-partner' | 'ascendant' | 'child' | 'other';
  age?: number;
  // For children of only one parent, that parent must have legal custody.
  unmarriedWithRequiredCustody?: boolean;
  incapacityDocumentedAndLivingAsDependant?: boolean;
  convertingPreviousFamilyCard?: boolean;
}

interface GoldenVisaAnswers {
  stage?: 'initial' | 'renewal';
  /** If supplied, assess completion of the application already filed from abroad. */
  overseasFilingDate?: IsoDate;
  /** Entry and completion of the outstanding insurance and biometric evidence. */
  overseasEvidenceCompletedOn?: IsoDate;
  regime?: 'current' | 'legacy-card' | 'transition';
  originalConditionsStillMet?: boolean;
  // Original statutory zone for a transitional investment (older issued cards retain their grant conditions).
  legacyZone?: 'legacy-high' | 'legacy-other';
  depositPercent?: number;
  depositDate?: IsoDate;
  closingDate?: IsoDate;
  replacementProperty?: boolean;
  kind?: 'standard' | 'conversion' | 'factory-conversion' | 'listed';
  zone?: 'named-high-cost' | 'other-mainland' | 'other-island';
  censusPopulation?: number;
  propertyCount?: number;
  // Combined price for spouses/partners, own share for unrelated co-owners.
  qualifyingValueEur?: number;
  acquisition?: 'purchase' | 'inheritance' | 'parental-gift';
  // Personal ownership categories denote full ownership and possession of the qualifying share.
  title?:
    | 'sole'
    | 'spouses'
    | 'own-share'
    | 'wholly-owned-eu-company'
    | 'qualifying-tourist-lease'
    | 'ineligible';
  /** Objective value recorded for an inheritance or parental gift. */
  assessedValueEur?: number;
  registeredTransferEvidence?: boolean;
  builtOrBuildingPermit?: boolean;
  mainAreaSqm?: number;
  conversionComplete?: boolean;
  factoryIdleYears?: number;
  fullyPaidAndConditionsReleased?: boolean;
  payment?: 'bank-transfer' | 'crossed-cheque' | 'greek-pos' | 'other';
  payer?:
    'applicant' | 'spouse-partner' | 'relative-within-second-degree' | 'other';
  notarialEvidence?: boolean;
  use?:
    | 'residential-or-long-let'
    | 'short-let-or-short-sublet'
    | 'sharing-economy-short-let'
    | 'short-sublet'
    | 'sublet-terms-unknown'
    | 'long-tourist-sublet-with-services'
    | 'business-office';
  worksInGreeceUnderThisPermit?: boolean;
  retainsInvestment?: boolean;
  listedRestorationComplete?: boolean;
  family?: InvestorFamilyMember[];
  // Include every person obtaining a consular national investment visa.
  nationalVisas?: number;
}

interface Retention {
  basis?:
    | 'widowhood'
    | 'divorce'
    | 'custody'
    | 'access-in-greece'
    | 'domestic-violence'
    | 'none';
  eventDate?: IsoDate;
  applicationDate?: IsoDate;
  marriageFrom?: IsoDate;
  // Petition date or consensual dissolution date; this may precede the final divorce.
  divorceDurationEnd?: IsoDate;
  greeceResidenceFrom?: IsoDate;
  livelihood?: 'employment' | 'qualifying-family' | 'resources' | 'none';
  resourcesAssessment?: 'accepted' | 'rejected' | 'pending';
}

interface FamilyResidence {
  stage?: 'initial' | 'permanent' | 'retained' | 'maintain';
  // First day of qualifying joint residence (including later lawful retained periods).
  residenceFrom?: IsoDate;
  qualifyingResidenceDocumented?: boolean;
  priorCardExpiry?: IsoDate;
  // Longest continuous absence since acquiring permanent residence.
  longestAbsenceAfterPrYears?: number;
  retention?: Retention;
}

interface GreekFamilyAnswers extends FamilyResidence {
  relationship?:
    | 'spouse'
    | 'registered-partner'
    | 'descendant'
    | 'ascendant'
    | 'parent-of-resident-greek-minor'
    | 'minor-sibling-of-resident-greek-minor'
    | 'dependent-needs-personal-care'
    | 'other';
  registeredInGreece?: boolean;
  dependent?: boolean;
  genuineRelationship?: boolean;
  appliedForFullPublicCover?: boolean;
  // Entry or subsequent qualifying civil-registry event (for an initial Ο.3).
  initialFilingFrom?: IsoDate;
  // Longest period of interrupted residence after the old card expired.
  interruptionAfterExpiryYears?: number;
  // Historical family conversion under Article 161(1)(δ),(2).
  longestConsecutiveAbsenceYears?: number;
  maxAnnualAbsenceMonths?: number;
  // All time beyond the ordinary limit is attributable to this exemption.
  extendedAbsence?: 'compulsory-service' | 'single-serious-reason' | 'ordinary';
  extendedAbsenceMonths?: number;
}

interface EuFamilyAnswers extends Omit<FamilyResidence, 'stage'> {
  stage?: 'permanent' | 'retained' | 'maintain';
  qualifyingNonGreekEuSponsorAndRelationship?: boolean;
  sponsorExercisedTreatyRights?: boolean;
  rightsDocumentsReady?: boolean;
  shamOrFraud?: boolean;
  /** Retention until the end of studies under Article 11(3). */
  schooling?: {
    sponsorEvent?: 'departure' | 'death';
    applicant?: 'child' | 'parent-with-actual-custody' | 'other';
    childResidesInGreece?: boolean;
    childStillEnrolledInGreece?: boolean;
  };
  // Longest annual total excluding compulsory service and the serious-reason absence below.
  maxOrdinaryAnnualAbsenceMonths?: number;
  seriousAbsenceCount?: number;
  maxSeriousAbsenceMonths?: number;
  early?: {
    basis:
      | 'none'
      | 'retirement'
      | 'permanent-incapacity'
      | 'occupational-incapacity'
      | 'worker-death'
      | 'occupational-death'
      | 'cross-border-worker';
    eventDate?: IsoDate;
    sponsorResidentFrom?: IsoDate;
    precedingWorkMonths?: number;
    livedTogetherAtEvent?: boolean;
    greekSpouseDurationExemption?: boolean;
    survivingSpouseLostGreekNationalityByMarriage?: boolean;
    // Working in another Member State and returning to Greece at least weekly.
    weeklyReturnAndPriorContinuousWork?: boolean;
  };
}

export interface GrPropertyFamilyAnswers {
  goldenVisa?: GoldenVisaAnswers;
  greekFamily?: GreekFamilyAnswers;
  euFamily?: EuFamilyAnswers;
}

const p = greeceFull2026_11.values;
const investment = p.gvInvestment.value;
const family = p.gfPeriods.value;
const eu = p.efPeriods.value;

function minimum(value: number | undefined, threshold: number): Answer {
  return value === undefined ? undefined : value >= threshold;
}

function maximum(value: number | undefined, threshold: number): Answer {
  return value === undefined ? undefined : value <= threshold;
}

function beforeOrOn(date: IsoDate | undefined, cutoff: IsoDate): Answer {
  return date === undefined ? undefined : date <= cutoff;
}

function yearsBy(
  from: IsoDate | undefined,
  end: IsoDate | undefined,
  years: number,
): Answer {
  return from && end ? addYears(from, years) <= end : undefined;
}

function currentInvestmentMinimum(a: GoldenVisaAnswers, transfer: boolean) {
  if (!transfer && a.kind === undefined) return;
  if (!transfer && a.kind !== 'standard') return investment.specialEur;
  if (a.zone === 'named-high-cost') return investment.highEur;
  if (a.zone === 'other-mainland') return investment.otherEur;
  if (a.zone === 'other-island' && a.censusPopulation !== undefined)
    return a.censusPopulation > investment.islandPopulation
      ? investment.highEur
      : investment.otherEur;
}

function legacyTerms(
  a: GoldenVisaAnswers,
  sim: IsoDate,
  renewal: boolean,
): Answer {
  if (a.regime === 'current') return true;
  if (a.regime === 'legacy-card')
    return all(renewal, a.originalConditionsStillMet);
  if (a.regime !== 'transition') return;
  const ordinaryCutoff = beforeOrOn(a.closingDate, p.gvLegacyCompleteBy.value);
  const replacementCutoff = all(
    a.replacementProperty,
    beforeOrOn(a.closingDate, p.gvLegacyReplacementBy.value),
  );
  const threshold =
    a.legacyZone === 'legacy-high'
      ? p.gvTransitionalValues.value.legacyHigh
      : p.gvTransitionalValues.value.legacyOther;
  return all(
    a.originalConditionsStillMet,
    a.legacyZone === undefined
      ? undefined
      : minimum(a.qualifyingValueEur, threshold),
    minimum(a.depositPercent, p.gvLegacyDepositPercent.value),
    beforeOrOn(a.depositDate, p.gvLegacyDepositBy.value),
    beforeOrOn(a.closingDate, sim),
    a.depositDate && a.closingDate ? a.depositDate <= a.closingDate : undefined,
    any(ordinaryCutoff, replacementCutoff),
  );
}

function investorMember(m: InvestorFamilyMember, reformed: boolean): Answer {
  if (m.kind !== 'child') return m.kind !== 'other';
  const limit = p.gvFamily.value.childAge;
  if (
    reformed &&
    m.incapacityDocumentedAndLivingAsDependant === true &&
    minimum(m.age, p.gvFees.value.minorAge)
  )
    return true;
  if (m.age === undefined) return;
  if (m.age < limit) return m.unmarriedWithRequiredCustody;
  // A child who already held a family card can convert on reaching the age limit.
  return any(
    reformed && m.incapacityDocumentedAndLivingAsDependant,
    all(
      m.convertingPreviousFamilyCard,
      m.age < limit + p.gvFamily.value.independentYears,
    ),
  );
}

function investorFees(a: GoldenVisaAnswers): number | undefined {
  const fee = p.gvFees.value;
  if (!a.family || a.nationalVisas === undefined) return;
  let total = fee.main + fee.card + a.nationalVisas * fee.visaD;
  for (const m of a.family) {
    if (m.age === undefined) return;
    const independent =
      m.kind === 'child' &&
      m.age >= p.gvFamily.value.childAge &&
      m.convertingPreviousFamilyCard &&
      !m.incapacityDocumentedAndLivingAsDependant;
    total +=
      fee.card +
      (m.age < fee.minorAge
        ? fee.minor
        : independent
          ? fee.independentChild
          : fee.adultFamily);
  }
  return total;
}

function goldenChecks(req: GrFullRequest, c: GrContext): CountryCheck[] {
  const a = req.goldenVisa ?? {};
  const sim = req.simulationDate;
  const renewal = a.stage
    ? a.stage === 'renewal'
    : req.permits?.some((q) => q.kind === 'investor' && q.from <= sim) === true;
  const historical = sim < p.gvReformEffective.value;
  const legacy = a.regime === 'legacy-card' || a.regime === 'transition';
  const current = a.regime === 'current' && !historical;
  const transfer =
    a.acquisition === 'inheritance' || a.acquisition === 'parental-gift';
  const value = currentInvestmentMinimum(a, transfer);
  const lease = a.title === 'qualifying-tourist-lease';
  const acquisitionKnown = lease || a.acquisition !== undefined;
  const areaApplies =
    !lease &&
    !transfer &&
    a.kind === 'standard' &&
    a.builtOrBuildingPermit === true;
  const areaExempt =
    transfer ||
    lease ||
    (a.kind && (a.kind !== 'standard' || a.builtOrBuildingPermit === false));
  const priceMet =
    value === undefined
      ? undefined
      : minimum(transfer ? a.assessedValueEur : a.qualifyingValueEur, value);
  const property = all(
    priceMet,
    a.title === undefined ? undefined : a.title !== 'ineligible',
    !transfer || (!lease && a.title !== 'wholly-owned-eu-company'),
    lease && a.kind !== undefined ? a.kind === 'standard' : true,
    transfer || lease
      ? true
      : a.propertyCount === undefined
        ? undefined
        : a.propertyCount === investment.properties,
    !transfer && (a.kind === 'conversion' || a.kind === 'factory-conversion')
      ? a.conversionComplete
      : true,
    !transfer && a.kind === 'factory-conversion'
      ? minimum(a.factoryIdleYears, investment.factoryIdleYears)
      : true,
  );
  const oldTerms = historical
    ? a.originalConditionsStillMet
    : legacyTerms(a, sim, renewal);
  const deferredCover = overseasInvestorFiling(req);
  const shortLet =
    a.use === 'short-let-or-short-sublet' ||
    a.use === 'sharing-economy-short-let' ||
    a.use === 'short-sublet';
  let use: Answer;
  if (a.use !== undefined) {
    if (historical) use = true;
    else if (shortLet) use = current ? false : oldTerms;
    else if (a.use === 'sublet-terms-unknown')
      use = legacy && oldTerms === true ? true : undefined;
    else if (
      a.use === 'business-office' ||
      a.use === 'long-tourist-sublet-with-services'
    )
      use =
        a.kind === undefined
          ? undefined
          : !['conversion', 'factory-conversion'].includes(a.kind);
    else use = true;
  }
  const fee = p.gvFees.value;
  const total = investorFees(a);
  const amountZh =
    total === undefined
      ? '提供家属年龄、卡种及领事 D 签人数以计算合计。'
      : `本次合计 €${total}。`;
  const amountEn =
    total === undefined
      ? 'Enter family ages, card types and the number of national visas for a total.'
      : `Total €${total}.`;
  const checks: CountryCheck[] = [];
  if (!renewal && !legacy && !historical) {
    checks.push(
      c.check(
        'GV-01',
        '投资区位、产权及金额',
        'Investment zone, title and value',
        current && acquisitionKnown ? property : undefined,
        p.gvInvestment.sources,
        `核对单处购房或合格旅游租约，继承和父母赠与按完整产权的评估价值。标准档 €${investment.highEur}/€${investment.otherEur}，改住宅或保护建筑购置 €${investment.specialEur}。核实岛屿普查、持分及变更用途竣工记录。`,
        `Verify a single property purchase or qualifying tourist lease. For inherited property or a parental gift, verify full ownership and assessed value. Standard tiers €${investment.highEur}/€${investment.otherEur}, converted or listed purchases €${investment.specialEur}. Check the census, qualifying share and completed conversion.`,
        a.zone === 'other-island' &&
          a.kind === 'standard' &&
          a.censusPopulation === undefined
          ? ['PD-306']
          : undefined,
      ),
    );
    checks.push(
      c.check(
        'GV-02',
        '主要使用面积',
        'Main floor area',
        current && acquisitionKnown
          ? areaApplies
            ? minimum(a.mainAreaSqm, investment.minMainAreaSqm)
            : areaExempt
              ? true
              : undefined
          : undefined,
        p.gvInvestment.sources,
        `标准档已建房或已获建筑许可的地块主空间至少 ${investment.minMainAreaSqm} m²。`,
        `Standard built property or land with a building permit needs at least ${investment.minMainAreaSqm} m² of main space.`,
      ),
    );
  }
  if (!renewal) {
    const transferEvidence = all(
      a.notarialEvidence,
      a.registeredTransferEvidence,
    );
    const adultOn =
      req.birthDate && addYears(req.birthDate, p.gvFees.value.minorAge);
    const transferMet =
      transferEvidence === true
        ? adultOn && (adultOn <= sim || adultOn)
        : transferEvidence;
    checks.push(
      c.check(
        'GV-03',
        '取得产权或租约的证明',
        'Evidence of acquisition or lease',
        a.title === undefined || !acquisitionKnown
          ? undefined
          : transfer
            ? transferMet
            : all(
                a.fullyPaidAndConditionsReleased,
                a.payment === undefined ? undefined : a.payment !== 'other',
                a.payer === undefined ? undefined : a.payer !== 'other',
                a.notarialEvidence,
              ),
        [
          grSource(
            'F23',
            'art. 64, art. 100(1)(ε),(3),(5),(6),(11), pp. 1198–1200',
          ),
          grSource('F21', 'art. 31(2.1)(β), (2.3)(β)–(γ)'),
        ],
        transfer
          ? '成年继承人或受父母赠与人应提供公证估值和转让登记证明，公证材料须列明房产此前的用卡记录。'
          : '确认价款付清、解除条件已撤销、付款渠道和汇款人合规，且已核对原业主用卡记录。',
        transfer
          ? 'An adult heir or recipient of a parental gift must document the assessed value, registration of the transfer and prior investor-card use in the notarial record.'
          : 'Confirm full payment, released conditions, a qualifying bank channel and payer, and the seller’s investor-card record.',
        !transfer && a.payer === undefined ? ['PD-307'] : undefined,
      ),
    );
  }
  checks.push(
    c.check(
      'GV-04',
      '房产使用限制',
      'Permitted use',
      use,
      [
        grSource('F23', 'art. 64(1),(3), art. 100(7),(7Α)'),
        grSource('F53', 'Circular 9/2024, I(Δ)(α)–(β), p4'),
      ],
      `新制禁止共享经济短租及短期转租，也限制改住宅用作营业注册地，罚款 €${p.gvFines.value.prohibitedUse}。核对转租期限及服务内容；按旧制或合格过渡规定取得的房产豁免短租限制。`,
      `Under current terms sharing-economy short lets, short sublets or business offices in converted homes risk revocation and €${p.gvFines.value.prohibitedUse}. Check sublease terms and services. Properties acquired under older rules or a valid transition are exempt from the short-let restriction.`,
      (shortLet && !current) || a.use === 'sublet-terms-unknown'
        ? ['PD-308']
        : undefined,
    ),
  );
  checks.push(
    c.check(
      'GV-05',
      '投资许可的就业限制',
      'Work restriction',
      a.worksInGreeceUnderThisPermit === undefined
        ? undefined
        : !a.worksInGreeceUnderThisPermit,
      [grSource('F23', 'art. 64, art. 100(9)')],
      'Β.5 许可不赋予在希腊工作的权利。',
      'The Β.5 permit gives no access to work in Greece.',
    ),
  );
  checks.push(
    c.check(
      'GV-06',
      '投资者与家属的私人医保',
      'Private cover for investor and family',
      deferredCover ||
        all(
          insuranceMet(req.insurance, 'private'),
          a.family?.length === 0 ? true : req.insurance?.coversFamily,
        ),
      [
        grSource('F21', 'art. 31, initial grant and renewal'),
        grSource('F06', 'sole article'),
        grSource('F16', 'art. 10(11), p. 4120'),
      ],
      deferredCover
        ? `境外授权递件可先领回执。须在递件后 ${p.investorEntryMonths.value} 个月内入境并补交私保及生物识别资料，核发前核验。`
        : '核发及续期均须为主申请人及随行家属提供合标私保。',
      deferredCover
        ? `A representative can file abroad and obtain a receipt. Enter within ${p.investorEntryMonths.value} months of filing to supply private insurance and biometrics before grant.`
        : 'For grant and renewal investors need qualifying private cover for themselves and accompanying family.',
    ),
  );
  checks.push(
    c.check(
      'GV-07',
      '申请及制卡费用',
      'Filing and card costs',
      true,
      p.gvFees.sources,
      `主申请 €${fee.main}，每张制卡 €${fee.card}。随行成人 €${fee.adultFamily}，未成年人 €${fee.minor}，转独立卡 €${fee.independentChild}，每人领事 D 签 €${fee.visaD}。${amountZh}`,
      `Investor €${fee.main}, each card €${fee.card}. Adult dependant €${fee.adultFamily}, minor €${fee.minor}, independent card €${fee.independentChild}, national visa €${fee.visaD} per person. ${amountEn}`,
    ),
  );
  if (renewal) {
    checks.push(
      c.check(
        'GV-08',
        '保留投资与保护建筑修复',
        'Continued investment and listed-building restoration',
        all(
          a.retainsInvestment,
          legacy || historical
            ? true
            : a.kind === undefined
              ? undefined
              : a.kind === 'listed'
                ? a.listedRestorationComplete
                : true,
        ),
        [
          grSource('F23', 'art. 64, art. 100(4),(7Α),(8)'),
          grSource('F21', 'art. 31(3)(α), p. 16505'),
        ],
        `须保留产权或租约。保护建筑首次续期前须完成修复，否则罚 €${p.gvFines.value.listedRestoration}；离境不阻碍续期。`,
        `Keep title or the lease. Listed buildings require full restoration by first renewal, with a €${p.gvFines.value.listedRestoration} fine for breach. Absence does not prevent renewal.`,
      ),
    );
  }
  checks.push(
    c.check(
      'GV-09',
      '随行家属与子女独立卡',
      'Accompanying family and independent child card',
      a.family &&
        all(
          ...a.family.map((member) =>
            investorMember(member, sim >= p.workReformEffective.value),
          ),
        ),
      p.gvFamily.sources,
      `填写所有家属或确认独自申请。包括配偶、伴侣、直系尊亲属、未满 ${p.gvFamily.value.childAge} 岁的未婚子女和有认可失能证明的同住受养成年子女。`,
      `List family or confirm an individual application. Spouses, partners, ascendants, unmarried children under ${p.gvFamily.value.childAge}, and dependent adult children living with the family with documented incapacity can qualify.`,
    ),
  );
  checks.push(
    c.check(
      'GV-10',
      '原批条件与过渡日期',
      'Grandfathering and transition deadlines',
      oldTerms,
      [
        grSource('F23', 'art. 64(3)–(4), p. 1200'),
        ...p.gvLegacyCompleteBy.sources,
        ...p.gvTransitionalValues.sources,
      ],
      historical
        ? '按模拟日有效的原始投资条件核验，请确认当时适用的金额、区域与产权。'
        : '旧卡按原批条件续期。过渡购房须按法定日期锁定并完成交易；换房另有截止日。',
      historical
        ? 'Confirm that the investment meets the value, zone and title rules in force on the simulation date.'
        : 'Legacy cards renew under their original terms. Transitional purchases need a timely deposit and closing, with a separate replacement deadline.',
      historical || legacy ? ['PD-308'] : undefined,
    ),
  );
  return checks;
}

function security(order: GrFullRequest['publicOrder']): Answer {
  if (order === 'clear') return true;
  if (order === 'adverse') return false;
}

function retainedGround(r: Retention, greek: boolean): Answer {
  const t = p.familyRetention.value;
  const durationEnd =
    r.basis === 'divorce' ? r.divorceDurationEnd : r.eventDate;
  const inGreece = yearsBy(r.greeceResidenceFrom, durationEnd, t.inGreeceYears);
  switch (r.basis) {
    case 'widowhood':
      return inGreece;
    case 'divorce':
      return all(
        inGreece,
        yearsBy(r.marriageFrom, r.divorceDurationEnd, t.marriageYears),
      );
    case 'access-in-greece':
      return !greek;
    case 'custody':
    case 'domestic-violence':
      return true;
    case 'none':
      return false;
  }
}

function retainedLivelihood(r: Retention, req: GrFullRequest): Answer {
  if (r.livelihood === 'employment' || r.livelihood === 'qualifying-family')
    return true;
  if (r.livelihood === 'none') return false;
  if (r.livelihood === 'resources') {
    const resources =
      r.resourcesAssessment === 'accepted'
        ? true
        : r.resourcesAssessment === 'rejected'
          ? false
          : undefined;
    return all(resources, insuranceMet(req.insurance, 'either'));
  }
}

function greekKin(a: GreekFamilyAnswers, req: GrFullRequest): Answer {
  switch (a.relationship) {
    case 'spouse':
    case 'registered-partner':
      return a.registeredInGreece;
    case 'descendant': {
      const age = ageOn(req.birthDate, req.simulationDate);
      return any(
        age === undefined ? undefined : age < family.childAge,
        a.dependent,
      );
    }
    case 'ascendant':
      return a.dependent;
    case 'minor-sibling-of-resident-greek-minor': {
      const age = ageOn(req.birthDate, req.simulationDate);
      return age === undefined ? undefined : age < p.gvFees.value.minorAge;
    }
    case 'parent-of-resident-greek-minor':
    case 'dependent-needs-personal-care':
      return true;
    case 'other':
      return false;
  }
}

function greekChecks(req: GrFullRequest, c: GrContext): CountryCheck[] {
  const a = req.greekFamily ?? {};
  const sim = req.simulationDate;
  const reformed = sim >= p.workReformEffective.value;
  const checks: CountryCheck[] = [];
  // The stage is required: the permanent right has no initial-card insurance test.
  if (!a.stage)
    return [
      c.check(
        'GF-01',
        '亲属关系与申请阶段',
        'Family relationship and application stage',
        undefined,
        familySource(),
        '请选择初次 Ο.3、独立保留、转 Μ.3 或永居保有。',
        'Select initial Ο.3, a retained right, conversion to Μ.3 or retention of permanent status.',
      ),
    ];
  if (a.stage !== 'maintain')
    checks.push(
      c.check(
        'GF-01',
        '与希腊公民的真实亲属关系',
        'Genuine relationship to a Greek citizen',
        all(greekKin(a, req), a.genuineRelationship),
        familySource(),
        '确认配偶婚姻已登载于希腊户籍、伴侣关系受承认，或提供直系亲属及必要的受养证明。免签/短期签证合法入境亦可申请。',
        'Verify the registered marriage or recognised partnership, or prove the qualifying family link and any required dependency. Lawful short or visa-exempt entry is accepted.',
      ),
    );
  if (a.stage === 'initial') {
    const deferred =
      req.deferredInitialEvidence?.includes('public-insurance-application') ===
        true && a.appliedForFullPublicCover !== false;
    checks.push(
      c.check(
        'GF-02',
        'Ο.3 的医保及首卡条件',
        'Health cover for the initial Ο.3',
        any(
          deferred,
          a.appliedForFullPublicCover,
          insuranceMet(req.insurance, 'either'),
        ),
        [
          grSource('F21', 'art. 25(1.1)(ε)'),
          grSource('F16', 'arts. 10(9), 93(3),(4),(7)'),
        ],
        `可提供公保申请回执或合标医保。公保申请凭证可在首次递件后 ${p.initialEvidenceMonths.value} 个月内补交。初次申请原则上在入境后 ${family.initialMonths} 个月内递交，卡期 ${family.residenceYears} 年。`,
        `A full public insurance application or qualifying cover is accepted. Evidence of an insurance application can follow within ${p.initialEvidenceMonths.value} months of filing. Normally apply within ${family.initialMonths} months of entry. The initial card lasts ${family.residenceYears} years.`,
      ),
    );
  }
  if (a.stage === 'permanent') {
    const ordinary = maximum(
      a.maxAnnualAbsenceMonths,
      eu.ordinaryAbsenceMonths,
    );
    // Article 93(7) expressly preserves these absences on an Ο.3 card.
    const extended =
      a.extendedAbsence === 'compulsory-service' ||
      (a.extendedAbsence === 'single-serious-reason' &&
        maximum(a.extendedAbsenceMonths, eu.seriousAbsenceMonths) === true);
    const allowedAbsence = ordinary === true || extended ? true : undefined;
    const tolerableGap = !reformed
      ? a.longestConsecutiveAbsenceYears === undefined
        ? undefined
        : a.longestConsecutiveAbsenceYears < p.tenYearCard.value.absenceYears
      : a.priorCardExpiry && sim <= a.priorCardExpiry
        ? true
        : maximum(a.interruptionAfterExpiryYears, family.interruptionYears);
    const documented = all(
      a.qualifyingResidenceDocumented,
      tolerableGap,
      allowedAbsence,
      reformed || insuranceMet(req.insurance, 'either'),
    );
    const anniversary =
      a.residenceFrom && addYears(a.residenceFrom, family.residenceYears);
    checks.push(
      c.check(
        'GF-03',
        '连续合法共居与卡到期后中断',
        'Continuous qualifying residence and interruptions',
        documented === true
          ? anniversary && (anniversary <= sim || anniversary)
          : documented,
        [
          grSource('F36', 'art. 28, art. 93Α(1)'),
          grSource('F16', 'arts. 93(7),(9), 161(1)(δ),(2)'),
        ],
        reformed
          ? `与希腊籍家属共同合法居住满 ${family.residenceYears} 年。卡到期后实际居留中断不超过 ${family.interruptionYears} 年可保留转换权。核实共居期间的离境。`
          : `旧制共同合法居住满 ${family.residenceYears} 年后转 Μ.2，须核对全额医保和连续离境期。`,
        reformed
          ? `Establish ${family.residenceYears} years of qualifying residence together. A residence interruption of up to ${family.interruptionYears} years after card expiry preserves conversion. Verify absences during those years.`
          : `Under the earlier law, ${family.residenceYears} years of qualifying residence together lead to Μ.2. Verify full insurance and consecutive absences.`,
        ordinary === false && !extended ? ['PD-314'] : undefined,
      ),
    );
  }
  if (a.stage === 'retained' || (a.stage === 'permanent' && a.retention)) {
    const r = a.retention ?? {};
    const filed = r.applicationDate ?? sim;
    const onTime =
      r.eventDate === undefined
        ? undefined
        : r.eventDate <= filed &&
          filed <= sim &&
          filed <= addMonths(r.eventDate, p.familyRetention.value.filingMonths);
    checks.push(
      c.check(
        'GF-04',
        '关系终止后的个人居留权',
        'Retained personal residence right',
        reformed
          ? all(retainedGround(r, true), retainedLivelihood(r, req), onTime)
          : all(
              r.basis !== 'custody',
              retainedGround(r, true),
              beforeOrOn(r.eventDate, filed),
              beforeOrOn(filed, sim),
            ),
        [
          grSource('F36', 'art. 27(2), art. 93(11)(α)–(γ)'),
          grSource('F16', 'arts. 90, 93(11)'),
        ],
        reformed
          ? '核对丧偶、离婚、子女监护或家庭暴力依据、就业或生计医保，以及事件后规定期限内的申请。'
          : '旧制按丧偶、离婚或家暴等困难情形转 Ο.2。',
        reformed
          ? 'Check widowhood, divorce, custody or domestic violence, the employment or resources/coverage basis and timely filing after the event.'
          : 'The earlier law routes widowhood, qualifying divorce or hardship such as domestic violence to an autonomous Ο.2.',
      ),
    );
  }
  checks.push(
    c.check(
      'GF-05',
      '现实公共安全威胁与永居保有',
      'Present security threat and continued status',
      all(
        security(req.publicOrder),
        a.stage === 'maintain'
          ? reformed &&
              maximum(a.longestAbsenceAfterPrYears, family.interruptionYears)
          : true,
      ),
      [grSource('F36', 'art. 28, art. 93Α(3)–(4)'), grSource('F16', 'art. 93')],
      `前科本身不足以认定现时严重威胁。取得永居后连续离境超过 ${family.interruptionYears} 年会丧失权利。`,
      `A conviction alone does not establish a serious present threat. After acquisition an absence exceeding ${family.interruptionYears} consecutive years ends permanent residence.`,
      req.publicOrder === 'review' ? ['PD-301'] : undefined,
    ),
  );
  const feeDate =
    a.stage === 'initial' ? a.initialFilingFrom : a.priorCardExpiry;
  const late = feeDate && sim > addYears(feeDate, family.lateFeeAfterYears);
  const card = p.gvFees.value.card;
  const lateFeeZh =
    (reformed && a.stage === 'permanent') || a.stage === 'initial'
      ? feeDate === undefined
        ? `按入境、登记或旧卡到期日期另核 €${family.lateFee} 罚款。`
        : late
          ? `逾期另加 €${family.lateFee}。`
          : '本次无需逾期罚款。'
      : '';
  const lateFeeEn =
    (reformed && a.stage === 'permanent') || a.stage === 'initial'
      ? feeDate === undefined
        ? ` Check entry, civil registration or card expiry for a possible €${family.lateFee} fine.`
        : late
          ? ` Add €${family.lateFee} for late filing.`
          : ' No late filing fine.'
      : '';
  checks.push(
    c.check(
      'GF-06',
      '希腊公民家属办卡费用',
      'Greek family card fees',
      true,
      [
        grSource('F36', 'art. 27(2) and art. 28, art. 93Α(2)–(3)'),
        grSource('F21', 'art. 2(γ)'),
        grSource('F16', 'art. 93(3)'),
      ],
      `申请费 €${family.applicationFee}，每张制卡 €${card}。${reformed ? `Μ.3 每 ${family.cardYears} 年更新。` : ''}${lateFeeZh}`,
      `Application €${family.applicationFee}, card €${card}.${reformed ? ` Renew Μ.3 every ${family.cardYears} years.` : ''}${lateFeeEn}`,
    ),
  );
  return checks;
}

function familySource() {
  return [
    grSource('F36', 'art. 9(3), art. 4(λζ); art. 27, art. 93'),
    grSource('F16', 'art. 93(2)–(4)'),
    grSource('F21', 'art. 25(1)'),
  ];
}

function earlyRight(e: EuFamilyAnswers['early'], sim: IsoDate): Answer {
  if (!e) return;
  if (e.basis === 'none') return false;
  const end = e.eventDate;
  const since = e.sponsorResidentFrom;
  const durationOver = (years: number) =>
    end && since ? end > addYears(since, years) : undefined;
  let basis: Answer;
  switch (e.basis) {
    case 'retirement':
      basis = any(
        e.greekSpouseDurationExemption,
        all(
          durationOver(eu.retirementYears),
          minimum(e.precedingWorkMonths, eu.priorWorkMonths),
        ),
      );
      break;
    case 'permanent-incapacity':
      basis = any(
        e.greekSpouseDurationExemption,
        durationOver(eu.incapacityYears),
      );
      break;
    case 'occupational-incapacity':
    case 'occupational-death':
      basis = true;
      break;
    case 'worker-death':
      basis = any(
        e.survivingSpouseLostGreekNationalityByMarriage,
        yearsBy(since, end, eu.incapacityYears),
      );
      break;
    case 'cross-border-worker':
      basis = all(
        e.weeklyReturnAndPriorContinuousWork,
        yearsBy(since, end, eu.crossBorderYears),
      );
      break;
  }
  return all(beforeOrOn(end, sim), e.livedTogetherAtEvent, basis);
}

function euChecks(req: GrFullRequest, c: GrContext): CountryCheck[] {
  const a = req.euFamily ?? {};
  const sim = req.simulationDate;
  const checks: CountryCheck[] = [];
  if (!a.stage)
    return [
      c.check(
        'EF-01',
        '欧盟家属身份与申请阶段',
        'EU family status and application stage',
        undefined,
        [grSource('F02', 'arts. 11–15,17')],
        '请选择转永久卡、关系终止后个人保留或永居保有。',
        'Select permanent acquisition, retention after a family event, or continued permanent status.',
      ),
    ];
  if (a.stage !== 'maintain') {
    checks.push(
      c.check(
        'EF-01',
        '欧盟家属资格与条约居留',
        'EU family status and treaty residence',
        all(
          a.qualifyingNonGreekEuSponsorAndRelationship,
          a.sponsorExercisedTreatyRights,
          a.qualifyingResidenceDocumented,
        ),
        [
          grSource('F02', 'arts. 2,7,13(1),15'),
          grSource('F21', 'art. 59(1)(γ)'),
        ],
        '核对非希腊籍欧盟、EEA 或瑞士担保人、法定家属关系及有效条约居留期间。保留权路径按关系终止前的担保资格核验。',
        'Verify the EU/EEA/Swiss sponsor, qualifying relationship and lawful treaty residence. On a retained right, check sponsor status before the family event.',
      ),
    );
  }
  if (a.stage === 'permanent') {
    const anniversary =
      a.residenceFrom && addYears(a.residenceFrom, eu.residenceYears);
    const ordinary = beforeOrOn(anniversary, sim);
    const early = earlyRight(a.early, sim);
    checks.push(
      c.check(
        'EF-02',
        '五年居留或提早取得权利',
        'Residence period or early acquisition',
        ordinary === false && early === false
          ? anniversary
          : any(ordinary, early),
        [grSource('F02', 'arts. 13(1),14(1)–(4),15, pp. 2982–2984')],
        `合法居留满 ${eu.residenceYears} 年，或由一同生活的劳动者满足退休、失能、跨境工作或在职死亡的特别条件。`,
        `Complete ${eu.residenceYears} years of lawful residence or qualify through a worker who lived with you under retirement, incapacity, frontier-work or death provisions.`,
      ),
    );
  }
  if (a.stage !== 'retained') {
    const timely =
      a.priorCardExpiry === undefined
        ? undefined
        : sim <= addYears(a.priorCardExpiry, eu.lateYears);
    const absences = all(
      maximum(a.maxOrdinaryAnnualAbsenceMonths, eu.ordinaryAbsenceMonths),
      maximum(a.seriousAbsenceCount, eu.seriousAbsences),
      a.seriousAbsenceCount === 0
        ? true
        : maximum(a.maxSeriousAbsenceMonths, eu.seriousAbsenceMonths),
    );
    checks.push(
      c.check(
        'EF-03',
        '离境与旧卡递交期限',
        'Absences and filing deadline',
        a.stage === 'maintain'
          ? maximum(a.longestAbsenceAfterPrYears, eu.lossYears)
          : all(absences, timely === false ? undefined : timely),
        [grSource('F02', 'arts. 13(2)–(3),17(2),(4)')],
        `取得前每年普通离境最多 ${eu.ordinaryAbsenceMonths} 个月，强制兵役除外；一次重大理由最多 ${eu.seriousAbsenceMonths} 个月。取得后连续离境超过 ${eu.lossYears} 年丧失权利。旧卡逾期超过 ${eu.lateYears} 年须核实发卡。`,
        `Before acquisition, ordinary absences total at most ${eu.ordinaryAbsenceMonths} months annually, apart from compulsory service and one serious absence up to ${eu.seriousAbsenceMonths} months. After acquisition, absence over ${eu.lossYears} consecutive years ends the right. Filing more than ${eu.lateYears} year late needs review.`,
        a.stage === 'permanent' && timely === false ? ['PD-315'] : undefined,
      ),
    );
  }
  if (a.stage === 'retained' || (a.stage === 'permanent' && a.retention)) {
    const r = a.retention ?? {};
    const school = a.stage === 'retained' && a.schooling;
    const qualifies = school
      ? all(
          school.sponsorEvent === undefined ? undefined : true,
          school.applicant === undefined
            ? undefined
            : school.applicant !== 'other',
          school.childResidesInGreece,
          school.childStillEnrolledInGreece,
        )
      : all(retainedGround(r, false), retainedLivelihood(r, req));
    checks.push(
      c.check(
        'EF-04',
        '婚姻或家庭关系终止后的保留权',
        'Retained right after a family event',
        all(qualifies, beforeOrOn(r.eventDate, sim)),
        [
          grSource('F02', 'arts. 11(2)–(3),12(2),15, pp. 2981–2984'),
          grSource('F21', 'art. 59(2)(δ)–(στ)'),
        ],
        school
          ? '欧盟公民离境或死亡后，在希居住且仍在希就学的子女及实际监护的父母可保留居留至学业完成，须提供在学证明。'
          : '核对丧偶、离婚、监护探视或家暴及就业依据。以资源及医保保留时，最低养老金由当局结合个人处境评定。',
        school
          ? 'After the EU citizen departs or dies, a child residing and enrolled in Greece and the parent with actual custody retain residence until completion of studies. Provide proof of enrolment.'
          : 'Check the qualifying family event and employment basis. On a resources-and-cover basis the authorities assess resources with reference to the minimum pension and personal circumstances.',
        !school &&
          r.livelihood === 'resources' &&
          (r.resourcesAssessment === undefined ||
            r.resourcesAssessment === 'pending')
          ? ['PD-316']
          : undefined,
      ),
    );
  }
  checks.push(
    c.check(
      'EF-05',
      '公共秩序与关系真实性',
      'Public order and genuine relationship',
      all(
        security(req.publicOrder),
        a.shamOrFraud === undefined ? undefined : !a.shamOrFraud,
      ),
      [grSource('F02', 'arts. 21(1)–(2),26')],
      '仅个人行为造成的现实严重威胁可触发公共秩序限制；欺诈或虚假关系可撤销权利。',
      'Public-order restrictions require a genuine, present and sufficiently serious threat. Fraud or a sham relationship can invalidate the right.',
      req.publicOrder === 'review' ? ['PD-301'] : undefined,
    ),
  );
  const documentsZh =
    a.stage === 'maintain'
      ? '换卡时核对旧永久卡。'
      : a.stage === 'retained'
        ? '提供关系终止及保留权凭证。'
        : '确认旧卡、欧盟担保人证件或死亡证明，以及亲属凭证。';
  const documentsEn =
    a.stage === 'maintain'
      ? 'Present the old permanent card at renewal.'
      : a.stage === 'retained'
        ? 'Document the family event and the retained right.'
        : 'Confirm the prior card, sponsor’s papers or death evidence, and proof of kinship.';
  const late =
    a.stage === 'permanent' &&
    a.priorCardExpiry !== undefined &&
    sim >= a.priorCardExpiry;
  checks.push(
    c.check(
      'EF-06',
      '家属证件与费用',
      'Family documents and fees',
      a.stage === 'maintain' ? true : a.rightsDocumentsReady,
      [grSource('F02', 'art. 17(2)–(5)'), grSource('F21', 'arts. 2(γ),59')],
      `${documentsZh}申请费 €${family.applicationFee}，制卡 €${p.gvFees.value.card}。${late ? `本次逾期罚款最高 €${eu.maxFine}。` : ''}永久卡每 ${eu.cardYears} 年更新，核发最长 ${eu.decisionMonths} 个月。`,
      `${documentsEn} Filing €${family.applicationFee}, card €${p.gvFees.value.card}.${late ? ` Late fine up to €${eu.maxFine}.` : ''} The permanent card renews every ${eu.cardYears} years; issue within ${eu.decisionMonths} months.`,
    ),
  );
  return checks;
}

export function propertyFamilyChecks(
  id: PropertyPath,
  req: GrFullRequest,
  c: GrContext,
): CountryCheck[] {
  if (id === 'GR-GOLDEN-VISA') return goldenChecks(req, c);
  if (id === 'GR-GREEK-FAMILY-PR') return greekChecks(req, c);
  return euChecks(req, c);
}
