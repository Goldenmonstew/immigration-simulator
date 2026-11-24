import type { EsNationalityRoute } from '@uk-immigration/engine';
import { SpainWhatIfControls } from '../app/spain/whatif/controls';
import type { TranslationKey } from '../i18n';
import {
  activeSpainAnswers,
  spainSteps,
  validateSpainStep,
  type SpainDraft,
} from './spain-draft';
import { validDate } from './questionnaire';
import type { CountryWhatIf } from './whatif';

export interface SpainWhatIf {
  simulationDate: string;
  noTrips: boolean;
  natRoute?: EsNationalityRoute;
  delePassed?: boolean;
  ccsePassed?: boolean;
  familySize?: number;
  monthlyIncome?: number;
  annualSalary?: number;
  healthCover?: boolean;
  conductCleared?: boolean;
}

export const spainFocusControls = {
  date: 'es-whatif-date',
  trips: 'es-whatif-trips',
  natRoute: 'es-whatif-nat-route',
  dele: 'es-whatif-dele',
  ccse: 'es-whatif-ccse',
  familySize: 'es-whatif-family-size',
  income: 'es-whatif-income',
  salary: 'es-whatif-salary',
  insurance: 'es-whatif-insurance',
  conduct: 'es-whatif-conduct',
} as const;

const focusByCondition: Record<string, keyof typeof spainFocusControls> = {
  'ES-N01': 'date',
  'ES-N02': 'date',
  'ES-N03': 'natRoute',
  'ES-N04': 'date',
  'ES-N05': 'date',
  'ES-N06': 'date',
  'ES-N07': 'date',
  'ES-N08': 'natRoute',
  'ES-N-ONE-YEAR': 'natRoute',
  'ES-N09': 'date',
  'ES-N10-RECORDS': 'conduct',
  'ES-N10': 'conduct',
  'ES-N11': 'dele',
  'ES-N12': 'ccse',
  'ES-N13': 'ccse',
  'ES-N16': 'ccse',
  'ES-L-BASIS': 'date',
  'ES-L01': 'date',
  'ES-L01-PERMIT': 'date',
  'ES-L01-SINGLE': 'trips',
  'ES-L01-TOTAL': 'trips',
  'ES-L02': 'trips',
  'ES-L05': 'date',
  'ES-L07': 'date',
  'ES-L11': 'date',
  'ES-L12': 'conduct',
  'ES-L12-CERT': 'conduct',
  'ES-E-TIME': 'date',
  'ES-E01': 'date',
  'ES-E02': 'date',
  'ES-E03': 'date',
  'ES-E04': 'date',
  'ES-E05': 'income',
  'ES-E06': 'insurance',
  'ES-E07': 'date',
  'ES-E08': 'conduct',
  'ES-E08-CERT': 'conduct',
  'ES-M01': 'date',
  'ES-M02': 'income',
  'ES-M03': 'insurance',
  'ES-M04': 'salary',
  'ES-M05': 'salary',
  'ES-M08': 'conduct',
  'ES-F01': 'date',
  'ES-F03': 'income',
  'ES-F04': 'insurance',
  'ES-R01': 'date',
  'ES-R03': 'date',
  'ES-R04': 'date',
  'ES-R05': 'conduct',
  'ES-R06': 'income',
  'ES-R07': 'insurance',
  'ES-T01': 'date',
  'ES-T02': 'trips',
  'ES-U04': 'date',
  'ES-U04-basis': 'date',
  'ES-U04-retention': 'trips',
  'ES-U05': 'income',
  'ES-U06': 'date',
  'ES-U07': 'date',
  'ES-U08': 'date',
  'ES-U09': 'date',
  'ES-U11': 'date',
  'ES-U12': 'conduct',
  'ES-U13': 'date',
  'ES-TRANSITION': 'date',
};

export const spainWhatIf: CountryWhatIf<SpainDraft, SpainWhatIf> = {
  focusControls: spainFocusControls,
  focusForRule: (id) => focusByCondition[id],
  initial(stored) {
    const draft = activeSpainAnswers(stored);
    const nat = draft.nationality;
    const res = draft.residence;
    const mob = draft.mobility;
    const rec = draft.recovery;
    const fm = draft.freeMovement;
    const delePassed =
      nat.deleEvidence === 'registered-official-equivalent' ||
      (nat.deleEvidence === 'dele' &&
        nat.deleLevel !== undefined &&
        nat.deleLevel !== 'A1')
        ? true
        : nat.deleEvidence === 'none'
          ? false
          : undefined;
    const ins =
      res.insurance ?? mob.holder?.healthCover ?? mob.family?.healthCover ?? rec.insurance;
    const healthCover =
      ins?.proof && ins.entitledOrAuthorized && ins.kind && ins.kind !== 'none'
        ? true
        : ins?.kind === 'none'
          ? false
          : undefined;
    const conductCleared =
      nat.conductAndSecurityDecision ??
      (res.securityDecision
        ? res.securityDecision === 'clear'
        : mob.holder?.securityDecision
          ? mob.holder.securityDecision === 'cleared'
          : rec.publicOrderAndSecurityCleared ?? fm.noOfficialRestriction);
    return {
      simulationDate: draft.simulationDate,
      noTrips: false,
      natRoute: draft.route,
      delePassed,
      ccsePassed: nat.ccse?.verifiedPass,
      familySize:
        res.resources?.familySize ?? mob.family?.resources?.familySize,
      monthlyIncome:
        res.resources?.eligibleMonthlyIncome ??
        mob.family?.resources?.eligibleMonthlyIncome ??
        mob.holder?.nonWorking?.monthlyNonWorkIncome,
      annualSalary: mob.holder?.employment?.annualGrossSalary,
      healthCover,
      conductCleared,
    };
  },
  apply(stored, knobs) {
    const draft = activeSpainAnswers(stored);
    const date = knobs.simulationDate;
    const next: SpainDraft = {
      ...draft,
      simulationDate: date,
      route: knobs.natRoute ?? draft.route,
      trips: knobs.noTrips ? [] : draft.trips,
      nationality: { ...draft.nationality },
      residence: { ...draft.residence },
      mobility: { ...draft.mobility },
      recovery: { ...draft.recovery },
      longTermCard: { ...draft.longTermCard },
      freeMovement: { ...draft.freeMovement },
    };
    if (knobs.noTrips) {
      if (next.residence.tripDetails) next.residence.tripDetails = [];
      if (next.freeMovement.trips) next.freeMovement.trips = [];
      if (next.longTermCard.absences) next.longTermCard.absences = [];
      if (next.longTermCard.outsideSpainPeriods)
        next.longTermCard.outsideSpainPeriods = [];
    }
    if (knobs.delePassed !== undefined) {
      next.nationality = {
        ...next.nationality,
        deleEvidence: knobs.delePassed ? 'dele' : 'none',
        deleLevel: knobs.delePassed
          ? next.nationality.deleLevel && next.nationality.deleLevel !== 'A1'
            ? next.nationality.deleLevel
            : 'A2'
          : next.nationality.deleLevel,
      };
    }
    if (knobs.ccsePassed !== undefined) {
      next.nationality = {
        ...next.nationality,
        ccse: {
          ...next.nationality.ccse,
          verifiedPass: knobs.ccsePassed,
          issued: knobs.ccsePassed
            ? (next.nationality.ccse?.issued ?? date)
            : next.nationality.ccse?.issued,
        },
      };
    }
    if (knobs.familySize !== undefined || knobs.monthlyIncome !== undefined) {
      const patchResources = (
        current: SpainDraft['residence']['resources'],
      ) => ({
        ...current,
        ...(knobs.familySize !== undefined
          ? { familySize: knobs.familySize }
          : {}),
        ...(knobs.monthlyIncome !== undefined
          ? { eligibleMonthlyIncome: knobs.monthlyIncome, stable: current?.stable ?? true }
          : {}),
      });
      if (next.targets.includes('E')) {
        next.residence = {
          ...next.residence,
          resources: patchResources(next.residence.resources),
        };
      }
      if (next.targets.includes('F')) {
        next.mobility = {
          ...next.mobility,
          family: {
            ...next.mobility.family,
            resources: patchResources(next.mobility.family?.resources),
          },
        };
      }
      if (next.targets.includes('M') && knobs.monthlyIncome !== undefined) {
        next.mobility = {
          ...next.mobility,
          holder: {
            ...next.mobility.holder,
            nonWorking: {
              ...next.mobility.holder?.nonWorking,
              dependants:
                next.mobility.holder?.nonWorking?.dependants ??
                (knobs.familySize !== undefined
                  ? Math.max(0, knobs.familySize - 1)
                  : 0),
              monthlyNonWorkIncome: knobs.monthlyIncome,
              sourceAndAvailabilityDocumented:
                next.mobility.holder?.nonWorking
                  ?.sourceAndAvailabilityDocumented ?? true,
            },
          },
        };
      }
    }
    if (knobs.annualSalary !== undefined && next.targets.includes('M')) {
      next.mobility = {
        ...next.mobility,
        holder: {
          ...next.mobility.holder,
          employment: {
            ...next.mobility.holder?.employment,
            annualGrossSalary: knobs.annualSalary,
          },
        },
      };
    }
    if (knobs.healthCover !== undefined) {
      const cover = knobs.healthCover
        ? {
            kind: 'public' as const,
            entitledOrAuthorized: true,
            equivalentCoverage: true,
            validFrom: date <= '2000-01-01' ? date : '2000-01-01',
            proof: true,
          }
        : { kind: 'none' as const };
      if (next.targets.includes('E'))
        next.residence = { ...next.residence, insurance: cover };
      if (next.targets.includes('M') || next.targets.includes('F')) {
        next.mobility = {
          ...next.mobility,
          holder: {
            ...next.mobility.holder,
            healthCover: { ...cover, coversFamilyMember: knobs.healthCover },
          },
          family: {
            ...next.mobility.family,
            healthCover: cover,
          },
        };
      }
      if (next.targets.includes('R-E'))
        next.recovery = { ...next.recovery, insurance: cover };
    }
    if (knobs.conductCleared !== undefined) {
      if (next.targets.includes('N')) {
        next.nationality = {
          ...next.nationality,
          conductAndSecurityDecision: knobs.conductCleared,
          criminalRecords: knobs.conductCleared
            ? {
                spanishRecordOrQuery: true,
                originRecordOrLawfulAlternative: true,
                militaryProcedureIfApplicable: true,
              }
            : next.nationality.criminalRecords,
        };
      }
      if (next.targets.includes('L') || next.targets.includes('E')) {
        next.residence = {
          ...next.residence,
          securityDecision: knobs.conductCleared ? 'clear' : 'threat',
          criminalCertificatesWhereRequired: knobs.conductCleared,
        };
      }
      if (next.targets.includes('M')) {
        next.mobility = {
          ...next.mobility,
          holder: {
            ...next.mobility.holder,
            securityDecision: knobs.conductCleared ? 'cleared' : 'adverse',
            noRefusalAlert: knobs.conductCleared,
            noReturnBar: knobs.conductCleared,
          },
        };
      }
      if (next.targets.includes('R-N') || next.targets.includes('R-E')) {
        next.recovery = {
          ...next.recovery,
          publicOrderAndSecurityCleared: knobs.conductCleared,
          publicHealthCleared: knobs.conductCleared,
          clearRecordsInAllCountries: knobs.conductCleared,
        };
      }
      if (next.targets.includes('U')) {
        next.freeMovement = {
          ...next.freeMovement,
          noOfficialRestriction: knobs.conductCleared,
        };
      }
    }
    return activeSpainAnswers(next);
  },
  validate(draft, knobs) {
    const errors: Record<string, TranslationKey> = {};
    if (!validDate(knobs.simulationDate)) errors.date = 'es.error.date';
    if (
      knobs.familySize !== undefined &&
      (!Number.isSafeInteger(knobs.familySize) || knobs.familySize < 1)
    )
      errors.familySize = 'es.whatif.invalidFamilySize';
    if (
      knobs.monthlyIncome !== undefined &&
      (!Number.isFinite(knobs.monthlyIncome) || knobs.monthlyIncome < 0)
    )
      errors.income = 'es.whatif.invalidNumber';
    if (
      knobs.annualSalary !== undefined &&
      (!Number.isFinite(knobs.annualSalary) || knobs.annualSalary < 0)
    )
      errors.salary = 'es.whatif.invalidNumber';
    if (!Object.keys(errors).length) {
      for (const { step } of spainSteps(draft)) {
        const issues = validateSpainStep({ ...draft, step });
        if (Object.keys(issues).length) {
          errors.date = 'es.error.date';
          break;
        }
      }
    }
    return errors;
  },
  Controls: SpainWhatIfControls,
};
