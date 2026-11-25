import {
  addDays,
  addMonths,
  type CefrLevel,
  type DeFullRoute,
} from '@uk-immigration/engine';
import { GermanyWhatIfControls } from '../app/germany/whatif/controls';
import type { TranslationKey } from '../i18n';
import {
  activeGermanyAnswers,
  germanySteps,
  validateGermanyStep,
  type GermanyDraft,
} from './germany-draft';
import { validDate } from './questionnaire';
import type { CountryWhatIf } from './whatif';

export type GermanyWhatIfLevel = CefrLevel | 'none';
/** The answers cannot be shown as one value; keep them unchanged. */
export const MIXED = 'mixed';
type Mixed = typeof MIXED;

export interface GermanyWhatIf {
  simulationDate: string;
  noTrips: boolean;
  provenGerman?: GermanyWhatIfLevel | Mixed;
  orientationScore?: number;
  contributionMonths?: number;
  blueCardMonths?: number;
  annualGrossSalary?: number;
  livelihoodConfirmed?: boolean | Mixed;
  natGerman?: GermanyWhatIfLevel | Mixed;
  natScore?: number;
  natLivelihood?: boolean | Mixed;
}

export const germanyFocusControls = {
  date: 'de-whatif-date',
  trips: 'de-whatif-trips',
  german: 'de-whatif-german',
  knowledge: 'de-whatif-knowledge',
  contributions: 'de-whatif-contributions',
  blueCardMonths: 'de-whatif-blue-card-months',
  salary: 'de-whatif-salary',
  livelihood: 'de-whatif-livelihood',
  natGerman: 'de-whatif-nat-german',
  natKnowledge: 'de-whatif-nat-knowledge',
  natLivelihood: 'de-whatif-nat-livelihood',
};

const focusByCondition: Record<string, keyof typeof germanyFocusControls> = {
  'DE-C13': 'date',
  'DE-C15-time': 'date',
  'DE-C19-time': 'date',
  'DE-C22-time': 'date',
  'DE-C25-time': 'date',
  'DE-C26-time': 'date',
  'DE-C28': 'date',
  'DE-C32-time': 'date',
  'DE-C34-time': 'date',
  'DE-C36-time': 'date',
  'DE-C38-time': 'date',
  'DE-C41-time': 'date',
  'DE-C42-time': 'date',
  'DE-C44': 'date',
  'DE-C46-application': 'date',
  'DE-C55': 'date',
  'DE-C56-time': 'date',
  'DE-C11-deadline': 'date',
  'DE-C63-time': 'trips',
  'DE-C63': 'trips',
  'DE-C63-current': 'trips',
  'DE-C64-settlement': 'trips',
  'DE-C64-eu-long-term': 'trips',
  'DE-C45': 'trips',
  'DE-C08': 'german',
  'DE-C20': 'german',
  'DE-C36-language': 'german',
  'DE-C50': 'natGerman',
  'DE-C09': 'knowledge',
  'DE-C51': 'natKnowledge',
  'DE-C61-guidance': 'natKnowledge',
  'DE-C05': 'contributions',
  'DE-C17': 'contributions',
  'DE-C30-pension': 'contributions',
  'DE-C19-months': 'blueCardMonths',
  'DE-C21-pay': 'salary',
  'DE-C03': 'livelihood',
  'DE-C25': 'livelihood',
  'DE-C26': 'livelihood',
  'DE-C29-income': 'livelihood',
  'DE-C36-livelihood': 'livelihood',
  'DE-C42-maintenance': 'livelihood',
  'DE-C49': 'natLivelihood',
  'DE-C60': 'natLivelihood',
};

const cefrOrder: GermanyWhatIfLevel[] = [
  'none',
  'A1',
  'A2',
  'B1',
  'B2',
  'C1',
  'C2',
];
const atLeastLevel = (
  level: GermanyWhatIfLevel | undefined,
  target: CefrLevel,
) =>
  level === undefined
    ? undefined
    : cefrOrder.indexOf(level) >= cefrOrder.indexOf(target);

// Routes whose general German check reads the common certificate (C08).
const commonLevelRoutes: DeFullRoute[] = [
  'R01',
  'R02',
  'R04',
  'R05',
  'R05-fast',
  'R06',
  'R09',
  'R12',
  'R14',
  'R15',
];
// Routes whose livelihood check reads the common confirmation (C03).
const commonLivelihoodRoutes: DeFullRoute[] = [
  'R01',
  'R02',
  'R03',
  'R04',
  'R06',
  'R09',
  'R10',
  'R12',
  'R13',
  'R14',
  'R15',
];
const citizenshipLivelihoodRoutes: DeFullRoute[] = ['R07', 'R08', 'R16'];

type Decision = 'accepted' | 'refused' | 'pending';
const decided = (value?: Decision) =>
  value === 'accepted' ? true : value === 'refused' ? false : undefined;
const decision = (value?: boolean): Decision | undefined =>
  value === undefined ? undefined : value ? 'accepted' : 'refused';

/** One answer shared by the selected routes, or MIXED when they differ. */
function shared<T>(values: T[]): T | Mixed | undefined {
  return values.every((value) => value === values[0]) ? values[0] : MIXED;
}

function settlementGerman(draft: GermanyDraft) {
  const proven = draft.common?.provenGerman;
  const routes = draft.routes;
  const levels: (GermanyWhatIfLevel | undefined)[] = [];
  if (routes.some((route) => commonLevelRoutes.includes(route)))
    levels.push(
      proven ?? (draft.germanC1 ? 'C1' : draft.germanB1 ? 'B1' : undefined),
    );
  if (routes.includes('R03')) {
    const language = draft.mobility?.blueCard?.language;
    levels.push(
      (language === 'below-A1' ? 'none' : language) ??
        proven ??
        (draft.germanB1 ? 'B1' : undefined),
    );
  }
  const child = routes.includes('R11')
    ? draft.settlement?.childLanguageB1
    : undefined;
  if (routes.includes('R11') && child === undefined) levels.push(proven);
  const level = shared(levels);
  if (child === undefined) return level;
  return level !== undefined &&
    level !== MIXED &&
    atLeastLevel(level, 'B1') === child
    ? level
    : MIXED;
}

function settlementLivelihood(draft: GermanyDraft) {
  const routes = draft.routes;
  const common = draft.common ?? {};
  const settlement = draft.settlement ?? {};
  // A blank confirmation may still be decided by the budget or benefits.
  const confirmed =
    common.livelihoodConfirmed ??
    (common.household || common.benefits ? MIXED : undefined);
  const values: (boolean | Mixed | undefined)[] = [];
  if (routes.some((route) => commonLivelihoodRoutes.includes(route)))
    values.push(confirmed);
  if (routes.includes('R06')) values.push(settlement.euRegularIncome);
  if (routes.includes('R11'))
    values.push(settlement.childSecureLivelihood ?? confirmed);
  if (routes.includes('R05'))
    values.push(decided(settlement.refugeeIncome?.ordinaryDecision));
  if (routes.includes('R05-fast'))
    values.push(decided(settlement.refugeeIncome?.acceleratedDecision));
  if (routes.includes('R15')) {
    const maintenance = settlement.formerSpouseMaintenance;
    values.push(
      maintenance === 'own-funds-enforceable-and-sufficient'
        ? true
        : maintenance === 'insufficient' || maintenance === 'third-party'
          ? false
          : undefined,
    );
  }
  return shared(values);
}

function citizenshipLivelihood(draft: GermanyDraft) {
  const nat = draft.citizenship ?? {};
  const values: (boolean | Mixed | undefined)[] = [];
  if (draft.routes.some((route) => citizenshipLivelihoodRoutes.includes(route)))
    values.push(
      nat.sustainableHouseholdSupport ??
        (draft.common?.household ? MIXED : undefined),
      nat.withoutSgbIIorXII,
    );
  if (draft.routes.includes('R17'))
    values.push(nat.discretionary?.sustainableSupportIncludingInsurance);
  return shared(values);
}

// Whole calendar months from one date to a later one (engine addMonths).
function monthsSince(from: string, to: string) {
  let months = 0;
  while (addMonths(from, months + 1) <= to) months++;
  return months;
}

// Start of the unbroken run of Blue Cards in force on the date, if any.
function blueCardSince(permits: GermanyDraft['permits'], date: string) {
  const held = (permits ?? [])
    .filter((permit) => permit.from <= date)
    .sort((a, b) => a.from.localeCompare(b.from));
  let i = held.length - 1;
  if (held[i]?.kind !== 'blue-card') return undefined;
  while (
    i > 0 &&
    held[i - 1].kind === 'blue-card' &&
    !(
      held[i - 1].to &&
      !held[i - 1].renewing &&
      addDays(held[i - 1].to!, 1) < held[i].from
    )
  )
    i--;
  return held[i].from;
}

// Assuming no absence, a period outside the EU continues the status held
// before it. An earliest period outside the EU has none and stays as it is.
function withoutAbsences(periods: { kind: string; from: string }[]) {
  const sorted = [...periods].sort((a, b) => a.from.localeCompare(b.from));
  return sorted.map((period, i) => {
    if (period.kind !== 'outside-eu') return period;
    const status = sorted
      .slice(0, i)
      .reverse()
      .find((other) => other.kind !== 'outside-eu');
    return status ? { ...period, kind: status.kind } : period;
  });
}

export const germanyWhatIf: CountryWhatIf<GermanyDraft, GermanyWhatIf> = {
  focusControls: germanyFocusControls,
  focusForRule(id) {
    if (id.startsWith('DE-C63-') || id.startsWith('DE-C64-')) return 'trips';
    return focusByCondition[id];
  },
  initial(stored) {
    const draft = activeGermanyAnswers(stored);
    const nat = draft.citizenship ?? {};
    const evidence = nat.germanEvidence;
    return {
      simulationDate: draft.simulationDate,
      noTrips: false,
      provenGerman: settlementGerman(draft),
      orientationScore: draft.common?.orientationScore,
      contributionMonths: draft.contributionMonths,
      blueCardMonths: draft.blueCardEmploymentMonths,
      annualGrossSalary: draft.mobility?.blueCard?.countableAnnualGross,
      livelihoodConfirmed: settlementLivelihood(draft),
      natGerman:
        evidence === 'accepted-equivalent' || evidence === 'pending'
          ? MIXED
          : evidence,
      natScore:
        nat.knowledge && 'correct' in nat.knowledge
          ? nat.knowledge.correct
          : undefined,
      natLivelihood: citizenshipLivelihood(draft),
    };
  },
  apply(stored, knobs) {
    const draft = activeGermanyAnswers(stored);
    const base = germanyWhatIf.initial(draft);
    const routes = draft.routes;
    const common = { ...draft.common };
    const settlement = { ...draft.settlement };
    const mobility = { ...draft.mobility };
    const citizenship = { ...draft.citizenship };
    const changed = <K extends keyof GermanyWhatIf>(key: K) =>
      knobs[key] !== base[key] && knobs[key] !== MIXED;
    let { germanB1, germanC1 } = draft;

    if (changed('provenGerman')) {
      const level = knobs.provenGerman as GermanyWhatIfLevel | undefined;
      common.provenGerman = level;
      germanB1 = atLeastLevel(level, 'B1');
      germanC1 = atLeastLevel(level, 'C1');
      if (routes.includes('R03'))
        mobility.blueCard = {
          ...mobility.blueCard,
          language: level === 'none' ? 'below-A1' : level,
          fastTrack: germanB1,
        };
      if (routes.includes('R11')) settlement.childLanguageB1 = germanB1;
    }

    // The score replaces a pending or other knowledge answer.
    if (changed('orientationScore')) {
      common.orientationScore = knobs.orientationScore;
      delete common.knowledgeEvidence;
    }

    if (changed('livelihoodConfirmed')) {
      const confirmed = knobs.livelihoodConfirmed as boolean | undefined;
      common.livelihoodConfirmed = confirmed;
      // Unknown must not fall back to a recorded benefit classification.
      if (confirmed === undefined) delete common.benefits;
      settlement.euRegularIncome = confirmed;
      settlement.childSecureLivelihood = confirmed;
      if (routes.includes('R05') || routes.includes('R05-fast'))
        settlement.refugeeIncome = {
          ...settlement.refugeeIncome,
          ...(routes.includes('R05') && {
            ordinaryDecision: decision(confirmed),
          }),
          ...(routes.includes('R05-fast') && {
            acceleratedDecision: decision(confirmed),
          }),
        };
      settlement.formerSpouseMaintenance =
        confirmed === undefined
          ? undefined
          : confirmed
            ? 'own-funds-enforceable-and-sufficient'
            : 'insufficient';
    }

    if (changed('natGerman'))
      citizenship.germanEvidence = knobs.natGerman as
        GermanyWhatIfLevel | undefined;

    if (changed('natScore'))
      citizenship.knowledge =
        knobs.natScore === undefined
          ? undefined
          : {
              kind:
                citizenship.knowledge?.kind === 'lid'
                  ? 'lid'
                  : 'naturalisation-test',
              correct: knobs.natScore,
            };

    if (changed('natLivelihood')) {
      const supported = knobs.natLivelihood as boolean | undefined;
      citizenship.sustainableHouseholdSupport = supported;
      citizenship.withoutSgbIIorXII = supported;
      if (routes.includes('R17'))
        citizenship.discretionary = {
          ...citizenship.discretionary,
          sustainableSupportIncludingInsurance: supported,
        };
    }

    if (changed('annualGrossSalary'))
      mobility.blueCard = {
        ...mobility.blueCard,
        countableAnnualGross: knobs.annualGrossSalary,
      };

    // As on the result page, months entered as of the simulation date grow by
    // one each month after it; Blue Card months only while the card is held,
    // from a later Blue Card's start (§ 18c Abs. 2).
    let { contributionMonths, blueCardMonths } = knobs;
    const later =
      validDate(knobs.simulationDate) &&
      knobs.simulationDate > draft.simulationDate;
    if (later && contributionMonths !== undefined)
      contributionMonths += monthsSince(
        draft.simulationDate,
        knobs.simulationDate,
      );
    const blueSince =
      later && !draft.mobility?.blueCard?.employment
        ? blueCardSince(draft.permits, knobs.simulationDate)
        : undefined;
    if (blueSince && blueCardMonths !== undefined)
      blueCardMonths += monthsSince(
        blueSince > draft.simulationDate ? blueSince : draft.simulationDate,
        knobs.simulationDate,
      );

    // Confirmations made for the original date are open again on another date.
    if (knobs.simulationDate !== draft.simulationDate) {
      mobility.titles = mobility.titles?.map((title) => ({
        ...title,
        validTo: title.validTo === null ? undefined : title.validTo,
        continuingUnder81:
          title.continuingUnder81 === true
            ? undefined
            : title.continuingUnder81,
      }));
      if (mobility.blueCard?.cardHeldAtDecision === true)
        mobility.blueCard = {
          ...mobility.blueCard,
          cardHeldAtDecision: undefined,
        };
    }

    if (knobs.noTrips) {
      mobility.titles = mobility.titles?.map((t) => ({ ...t, trips: [] }));
      if (mobility.freedom) {
        mobility.freedom = {
          ...mobility.freedom,
          annualOrdinaryAbsenceMonths: [],
          importantAbsences: [],
          subsequentTrips: [],
        };
      }
      if (routes.includes('R11')) settlement.childForeignSchoolDays = 0;
      const periods = settlement.euMobility?.periods;
      if (periods)
        settlement.euMobility = {
          ...settlement.euMobility,
          periods: withoutAbsences(periods) as typeof periods,
        };
    }

    return activeGermanyAnswers({
      ...draft,
      simulationDate: knobs.simulationDate,
      trips: knobs.noTrips ? [] : draft.trips,
      contributionMonths,
      blueCardEmploymentMonths: blueCardMonths,
      germanB1,
      germanC1,
      common,
      settlement,
      mobility,
      citizenship,
    });
  },
  validate(draft, knobs) {
    const errors: Record<string, TranslationKey> = {};
    if (!validDate(knobs.simulationDate)) errors.date = 'de.whatif.invalidDate';
    for (const [key, score] of [
      ['knowledge', knobs.orientationScore],
      ['natKnowledge', knobs.natScore],
    ] as const)
      if (
        score !== undefined &&
        (!Number.isSafeInteger(score) || score < 0 || score > 33)
      )
        errors[key] = 'de.whatif.invalidScore';
    if (
      knobs.contributionMonths !== undefined &&
      (!Number.isSafeInteger(knobs.contributionMonths) ||
        knobs.contributionMonths < 0)
    )
      errors.contributions = 'de.whatif.invalidMonths';
    if (
      knobs.blueCardMonths !== undefined &&
      (!Number.isSafeInteger(knobs.blueCardMonths) || knobs.blueCardMonths < 0)
    )
      errors.blueCardMonths = 'de.whatif.invalidMonths';
    if (
      knobs.annualGrossSalary !== undefined &&
      (!Number.isFinite(knobs.annualGrossSalary) || knobs.annualGrossSalary < 0)
    )
      errors.salary = 'de.whatif.invalidSalary';
    // With valid knobs, a step can only fail on facts after the new date.
    if (!Object.keys(errors).length)
      for (const { step } of germanySteps(draft))
        if (Object.keys(validateGermanyStep({ ...draft, step })).length) {
          errors.date = 'de.whatif.factAfterDate';
          break;
        }
    return errors;
  },
  Controls: GermanyWhatIfControls,
};
