import { japanFull2026_11 as jp } from '@uk-immigration/policy-data';
import type { IsoDate } from './types';

const { hsp, jSkip } = jp.values;
type HspActivity = keyof typeof hsp.value.education;
type Education = keyof (typeof hsp.value.education)['research'];

export interface JpTalentActivity {
  activity: HspActivity;
  /** Official activity/contract category and qualifying host institution. */
  qualifyingActivity?: boolean;
  /** Annual eligible remuneration, including qualifying bonuses or transfers. */
  remunerationYen?: number;
  education?: Education;
  relevantExperienceYears?: number;
}

/** A point calculation or official record at one specific reference date. */
export interface JpHspSnapshot extends Partial<JpTalentActivity> {
  on: IsoDate;
  confirmedPoints?: number;
  /** False or omitted keeps unreported bonus items open. */
  complete?: boolean;
  age?: number;
  multipleGraduateFields?: boolean;
  patents?: number;
  qualifyingResearchGrants?: number;
  qualifyingPublications?: number;
  equivalentResearch?: boolean;
  technicalQualifications?: 'one' | 'two' | 'equivalent-higher-category';
  position?: 'representative' | 'director';
  innovationEmployer?: 'standard' | 'small-business';
  smallBusinessResearchPercent?: number;
  foreignQualification?: boolean;
  japanHigherEducation?: boolean;
  japaneseEvidence?:
    'N1-equivalent' | 'N2-equivalent' | 'foreign-japanese-major';
  bjtScore?: number;
  advancedProject?: boolean;
  designatedUniversity?: boolean;
  designatedTraining?: 'japanese-higher-education' | 'other';
  regionalEmployer?: boolean;
  designatedFinance?: boolean;
  personalInvestmentYen?: number;
}

export interface JpJSkipSnapshot extends Partial<JpTalentActivity> {
  on: IsoDate;
  /** Confirmation that the category was satisfied on this date. */
  confirmed?: boolean;
}

const atLeast = (n: number | undefined, minimum: number) =>
  n === undefined ? undefined : n >= minimum;

function pointsIn(
  value: number,
  bands: readonly (readonly number[])[],
): number {
  return bands.find(([minimum]) => value >= minimum)?.[1] ?? 0;
}

export function hspAssessment(
  snapshot: JpHspSnapshot | undefined,
  on: IsoDate,
  threshold: number,
): { met?: boolean; points?: number } {
  if (!snapshot || snapshot.on !== on) return {};
  if (snapshot.qualifyingActivity === false) return { met: false };
  const t = hsp.value;
  const { activity, remunerationYen, education, relevantExperienceYears, age } =
    snapshot;
  const salaryMet =
    activity === 'research'
      ? true
      : activity === undefined
        ? undefined
        : atLeast(remunerationYen, t.minSalary);
  if (salaryMet === false) return { met: false };
  if (snapshot.confirmedPoints !== undefined) {
    return {
      met: snapshot.confirmedPoints >= threshold,
      points: snapshot.confirmedPoints,
    };
  }
  if (on < t.tableFrom || activity === undefined) return {};

  const b = t.bonus;
  const ageBand =
    age === undefined ? undefined : t.age.find(([upper]) => age < upper);
  const salaryFloor = ageBand?.[2] ?? t.olderSalaryFloor;
  const salaryPoints =
    remunerationYen === undefined
      ? 0
      : activity === 'management'
        ? pointsIn(remunerationYen, t.managementSalary)
        : age !== undefined && remunerationYen >= salaryFloor
          ? pointsIn(remunerationYen, t.salary)
          : 0;
  const research = [
    atLeast(snapshot.patents, t.research.patents),
    atLeast(snapshot.qualifyingResearchGrants, t.research.grants),
    atLeast(snapshot.qualifyingPublications, t.research.publications),
    snapshot.equivalentResearch,
  ].filter(Boolean).length;
  const japaneseN1 =
    snapshot.japaneseEvidence === 'N1-equivalent' ||
    snapshot.japaneseEvidence === 'foreign-japanese-major' ||
    atLeast(snapshot.bjtScore, t.bjtN1);
  const japaneseN2 =
    snapshot.japaneseEvidence === 'N2-equivalent' ||
    atLeast(snapshot.bjtScore, t.bjtN2);
  const points =
    (education ? t.education[activity][education] : 0) +
    pointsIn(relevantExperienceYears ?? 0, t.experience[activity]) +
    salaryPoints +
    (activity === 'management' ? 0 : (ageBand?.[1] ?? 0)) +
    (activity === 'research' && research
      ? research >= t.research.categoriesForHigher
        ? t.research.researchMultiple
        : t.research.researchSingle
      : activity === 'technical' && research
        ? t.research.technical
        : 0) +
    (activity === 'technical' && snapshot.technicalQualifications
      ? snapshot.technicalQualifications === 'one'
        ? t.qualifications.one
        : t.qualifications.two
      : 0) +
    (activity === 'management' ? t.positions[snapshot.position ?? 'none'] : 0) +
    (snapshot.multipleGraduateFields ? b.multiFieldGraduateDegree : 0) +
    (snapshot.innovationEmployer === 'small-business'
      ? b.innovationSmallEmployer
      : snapshot.innovationEmployer === 'standard'
        ? b.innovationEmployer
        : 0) +
    ((snapshot.smallBusinessResearchPercent ?? 0) >
    t.researchSpendPercentExclusive
      ? b.researchSmallEmployer
      : 0) +
    (snapshot.foreignQualification ? b.foreignQualification : 0) +
    (snapshot.japanHigherEducation ? b.japanHigherEducation : 0) +
    (japaneseN1
      ? b.japaneseN1
      : japaneseN2 && !snapshot.japanHigherEducation
        ? b.japaneseN2
        : 0) +
    (snapshot.advancedProject ? b.advancedProject : 0) +
    (snapshot.designatedUniversity ? b.designatedUniversity : 0) +
    (snapshot.designatedTraining &&
    !(
      snapshot.designatedTraining === 'japanese-higher-education' &&
      snapshot.japanHigherEducation
    )
      ? b.designatedTraining
      : 0) +
    (snapshot.regionalEmployer ? b.regionalEmployer : 0) +
    (snapshot.designatedFinance && activity !== 'research'
      ? b.designatedFinance
      : 0) +
    (activity === 'management' &&
    atLeast(snapshot.personalInvestmentYen, t.personalInvestmentYen)
      ? b.personalInvestment
      : 0);

  const complete =
    snapshot.complete &&
    education !== undefined &&
    relevantExperienceYears !== undefined &&
    remunerationYen !== undefined &&
    (activity === 'management' || age !== undefined);
  const met =
    points < threshold
      ? complete
        ? false
        : undefined
      : snapshot.qualifyingActivity && salaryMet
        ? true
        : undefined;
  return { met, points };
}

export function jSkipAssessment(
  snapshot: JpJSkipSnapshot | undefined,
  on: IsoDate,
): boolean | undefined {
  const t = jSkip.value;
  if (on < t.from) return false;
  if (!snapshot || snapshot.on !== on) return undefined;
  if (snapshot.confirmed !== undefined) return snapshot.confirmed;
  const {
    activity,
    remunerationYen,
    relevantExperienceYears,
    education,
    qualifyingActivity,
  } = snapshot;
  if (qualifyingActivity === false) return false;
  if (!activity) return undefined;
  const salary = atLeast(
    remunerationYen,
    activity === 'management' ? t.managerSalary : t.specialistSalary,
  );
  const experience = atLeast(
    relevantExperienceYears,
    activity === 'management' ? t.managerExperience : t.specialistExperience,
  );
  const qualifications =
    activity !== 'management' &&
    education &&
    education !== 'none' &&
    education !== 'undergraduate'
      ? true
      : activity !== 'management' &&
          education === undefined &&
          experience !== true
        ? undefined
        : experience;
  if (salary === false || qualifications === false) return false;
  return salary && qualifications && qualifyingActivity ? true : undefined;
}
