import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { evaluateCanadaFull, evaluateCanada } from '../src';
import type { CaFullPathwayId, CaFullRequest } from '../src';
import type {
  FederalAnswers,
  FederalMember,
  FederalPerson,
} from '../src/canada-full/federal';
import { federal, filed, person } from './canada-federal-fixture';

const sim = '2026-11-23';
function result(id: CaFullPathwayId, patch: Partial<CaFullRequest>) {
  return evaluateCanadaFull({
    simulationDate: sim,
    dateOfBirth: person.dateOfBirth,
    express: { invitation: { program: 'CA-EE-FSW', date: '2026-10-30' } },
    federal,
    ...patch,
  }).columns[0].pathways.find((p) => p.id === id)!;
}
function c(
  n: number,
  change: Partial<FederalAnswers> = {},
  id: CaFullPathwayId = 'CA-EE-FSW',
  patch: Partial<CaFullRequest> = {},
) {
  return result(id, {
    federal: { ...federal, ...change },
    ...patch,
  }).checks.find((c) => c.id === 'CA-R' + n)!;
}
const applicant = (change: Partial<FederalPerson>) => ({
  principal: { ...person, ...change },
});

describe('initial PR federal checks', () => {
  test('R20–R27 can all pass. Another application has its own signature and payment.', () => {
    for (const n of [20, 21, 22, 23, 24, 25, 26, 27])
      expect(c(n).status).toBe('MET');
    expect(c(20, {}, 'CA-EE-FST').status).toBe('UNKNOWN');
    expect(
      c(20, {
        applications: { 'CA-EE-FSW': { ...filed, allFamilyDeclared: false } },
      }).status,
    ).toBe('NOT_MET');
    expect(c(21, { members: undefined }).status).toBe('UNKNOWN');
    for (const ground of [
      'security',
      'humanRights',
      'sanctions',
      'organisedCrime',
    ] as const) {
      expect(
        c(
          21,
          applicant({ safety: { ...person.safety, [ground]: 'inadmissible' } }),
        ).status,
      ).toBe('NOT_MET');
      expect(
        c(
          21,
          applicant({ safety: { ...person.safety, [ground]: 'under-review' } }),
        ).pendingDetails,
      ).toContain('PD-243');
    }
  });
  test('R22 separate statutory serious and ordinary grounds and rehabilitation clock', () => {
    const offence = {
      jurisdiction: 'Canada' as const,
      maximumCanadianYears: 9,
      imposedMonths: 6,
      ordinaryGroundEstablished: false,
      outstandingWithoutRelief: true,
    };
    const finding = (patch: Partial<typeof offence>) =>
      c(
        22,
        applicant({
          criminalFinding: undefined,
          classifiedOffence: { ...offence, ...patch },
        }),
      );
    expect(finding({}).status).toBe('MET');
    expect(finding({ imposedMonths: 7 }).status).toBe('NOT_MET');
    expect(finding({ maximumCanadianYears: 10 }).status).toBe('NOT_MET');
    expect(finding({ ordinaryGroundEstablished: true }).status).toBe('NOT_MET');
    expect(finding({ outstandingWithoutRelief: false }).status).toBe('UNKNOWN');
    const foreign = {
      ...offence,
      jurisdiction: 'abroad' as const,
      imposedMonths: 24,
      rehabilitationClockStart: '2021-10-10',
    };
    const report = c(
      22,
      applicant({
        criminalFinding: 'under-review',
        classifiedOffence: foreign,
      }),
    );
    expect(report.status).toBe('UNKNOWN');
    expect(report.explanation).toContain('2026-10-10');
    expect(
      c(
        22,
        applicant({ criminalFinding: undefined, classifiedOffence: foreign }),
      ).status,
    ).toBe('MET');
  });
  test('R23 family exemption is ground-specific, medical clearance independent of a completed exam', () => {
    const exempt = applicant({
      excessiveDemand: 'inadmissible',
      familyExcessiveDemandExemption: true,
    });
    expect(c(23, exempt, 'CA-FAMILY').status).toBe('MET');
    expect(c(23, exempt).status).toBe('NOT_MET');
    expect(
      c(
        23,
        applicant({ ...exempt.principal, publicSafety: 'inadmissible' }),
        'CA-FAMILY',
      ).status,
    ).toBe('NOT_MET');
    const pending = applicant({ publicHealth: 'under-review' });
    expect(c(23, pending).pendingDetails).toContain('PD-244');
    expect(c(24, pending).status).toBe('MET');
  });
  test('R24 upfront exam, expiry, instructions and formal reuse', () => {
    const exam = (
      patch: FederalPerson['exam'],
      id: CaFullPathwayId = 'CA-EE-FSW',
    ) => c(24, applicant({ exam: patch }), id);
    expect(exam({ panelExamComplete: false }).status).toBe('NOT_MET');
    for (const [examOn, status] of [
      ['2025-11-23', 'UNKNOWN'],
      ['2025-11-24', 'MET'],
    ] as const)
      expect(
        c(
          24,
          {
            ...applicant({ exam: { examOn, panelExamComplete: true } }),
            applications: { 'CA-EE-FSW': { ...filed, filedOn: '2025-11-25' } },
          },
          'CA-EE-FSW',
          {
            express: {
              invitation: { program: 'CA-EE-FSW', date: '2025-11-20' },
            },
          },
        ).status,
      ).toBe(status);
    expect(
      exam({ instructionOn: '2026-10-24', panelExamComplete: false }, 'CA-AIP')
        .status,
    ).toBe('UNKNOWN');
    expect(
      exam({ instructionOn: '2026-10-23', panelExamComplete: false }, 'CA-AIP')
        .status,
    ).toBe('UNKNOWN');
    expect(
      exam(
        {
          instructionOn: '2026-10-23',
          panelExamComplete: false,
          instructionExtension: 'none',
        },
        'CA-AIP',
      ).status,
    ).toBe('NOT_MET');
    expect(
      exam({ disposition: 'reuse-requested', previousExamOn: '2025-11-24' })
        .status,
    ).toBe('UNKNOWN');
    expect(
      exam({
        disposition: 'reuse-granted',
        previousExamOn: '2021-11-23',
        inCanada: true,
        eligiblePreviousMedicalCode: true,
      }).status,
    ).toBe('MET');
    expect(
      exam({ disposition: 'reuse-granted', previousExamOn: '2021-11-22' })
        .status,
    ).toBe('UNKNOWN');
  });
  test('R24 checks the completion date against the original AIP instruction deadline and the IRCC decision', () => {
    const exam = (details: FederalPerson['exam']) =>
      c(
        24,
        applicant({
          exam: {
            instructionOn: '2026-09-01',
            panelExamComplete: true,
            ...details,
          },
        }),
        'CA-AIP',
        { atlantic: { applicationDate: '2026-08-10' } },
      );
    expect(exam({ examOn: '2026-10-01' }).status).toBe('MET');
    expect(
      exam({ examOn: '2026-10-01', instructionOn: undefined }).status,
    ).toBe('UNKNOWN');
    const late = { examOn: '2026-10-16' };
    const unresolved = exam(late);
    expect(unresolved.status).toBe('UNKNOWN');
    expect(unresolved.explanation).toContain('未满足原体检期限（2026-10-01）');
    expect(unresolved.pendingDetails).toContain('PD-244');
    expect(exam({ ...late, extendedUntil: '2027-10-16' }).status).toBe(
      'UNKNOWN',
    );
    expect(exam({ ...late, instructionExtension: 'pending' }).status).toBe(
      'UNKNOWN',
    );
    expect(exam({ ...late, instructionExtension: 'none' }).status).toBe(
      'NOT_MET',
    );
    expect(
      exam({ ...late, instructionExtension: { until: '2026-10-16' } }).status,
    ).toBe('MET');
    expect(
      exam({ ...late, instructionExtension: { until: '2026-10-15' } }).status,
    ).toBe('NOT_MET');
    expect(
      exam({ ...late, instructionExtension: 'late-exam-accepted' }).status,
    ).toBe('MET');
  });
  test('R25 misrepresentation runs from the specified statutory start, and family scope is separate from examination', () => {
    const finding = {
      misrepresentation: 'inadmissible' as const,
      misrepresentationClockStart: '2021-11-24',
    };
    expect(c(25, finding).status).toBe('NOT_MET');
    expect(
      c(25, { ...finding, misrepresentationClockStart: '2021-11-23' }).status,
    ).toBe('MET');
    expect(c(25, { adequateSupportArrangements: false }).status).toBe(
      'NOT_MET',
    );
    const member: FederalMember = {
      ...person,
      relationship: 'child',
      accompanying: false,
      custodyOrAuthorityUnderSection23: false,
      otherAdmissibility: 'clear',
      safety: { security: 'inadmissible' },
      examinationScope: 'required',
      exam: { disposition: 'follow-up' },
    };
    expect(c(21, { members: [member] }).status).toBe('MET');
    expect(c(24, { members: [member] }).status).toBe('UNKNOWN');
    expect(
      c(21, {
        members: [{ ...member, custodyOrAuthorityUnderSection23: true }],
      }).status,
    ).toBe('NOT_MET');
    expect(
      c(25, {
        members: [{ ...member, custodyOrAuthorityUnderSection23: undefined }],
      }).pendingDetails,
    ).toContain('PD-245');
  });
  test('R25 checks both the filing date and the simulation date against the misrepresentation bar', () => {
    const status = (filedOn: string, simulationDate = sim) =>
      c(
        25,
        {
          misrepresentation: 'inadmissible',
          misrepresentationClockStart: '2021-11-01',
          applications: { 'CA-EE-FSW': { filedOn } },
        },
        'CA-EE-FSW',
        { simulationDate },
      ).status;
    expect(status('2026-10-10')).toBe('NOT_MET');
    expect(status('2021-11-01')).toBe('NOT_MET');
    expect(status('2026-11-01')).toBe('MET');
    expect(status('2021-10-31')).toBe('MET');
    expect(status('2021-10-31', '2026-10-31')).toBe('NOT_MET');
    expect(
      c(
        25,
        {
          misrepresentation: 'inadmissible',
          misrepresentationClockStart: '2021-11-01',
        },
        'CA-PNP',
        {
          pnp: { mode: 'enhanced', federalFiled: '2026-10-10' },
        },
      ).status,
    ).toBe('NOT_MET');
  });
  test('R25 assigns an EE receipt during a misrepresentation bar only to its invited class', () => {
    const routes = ['CA-EE-FSW', 'CA-EE-CEC', 'CA-EE-FST', 'CA-PNP'] as const;
    for (const program of [...routes, undefined]) {
      const { pathways } = evaluateCanadaFull({
        simulationDate: sim,
        express: {
          invitation: program && { program, date: '2026-04-29' },
          applicationDate: '2026-05-20',
        },
        pnp: { mode: 'enhanced' },
        federal: {
          ...federal,
          applications: undefined,
          misrepresentation: 'inadmissible',
          misrepresentationClockStart: '2021-11-01',
        },
      }).columns[0];
      for (const id of routes) {
        const item = pathways
          .find((p) => p.id === id)!
          .checks.find((c) => c.id === 'CA-R25');
        expect(item?.status, `${program} / ${id}`).toBe(
          id === program ? 'NOT_MET' : 'MET',
        );
      }
    }
  });
  test('R26 police certificates use consecutive adult stays, dates of issue and program instructions', () => {
    const stay = {
      from: '2026-05-23',
      currentCountry: true,
      certificateIssued: '2026-05-23',
    };
    const police = (
      s: NonNullable<FederalPerson['foreignStays']>,
      dob = person.dateOfBirth,
      id: CaFullPathwayId = 'CA-EE-FSW',
    ) =>
      c(
        26,
        applicant({
          definitiveChecklistSatisfied: undefined,
          dateOfBirth: dob,
          foreignStays: s,
        }),
        id,
      );
    expect(police([stay]).status).toBe('MET');
    expect(police([{ ...stay, certificateIssued: '2026-05-22' }]).status).toBe(
      'NOT_MET',
    );
    expect(
      police(
        [{ ...stay, certificateIssued: undefined, missing: true }],
        '2008-05-24',
      ).status,
    ).toBe('MET');
    expect(
      police(
        [{ ...stay, certificateIssued: undefined, missing: true }],
        '2008-05-23',
      ).status,
    ).toBe('NOT_MET');
    const previous = {
      from: '2016-06-01',
      until: '2017-05-23',
      currentCountry: false,
      certificateIssued: '2017-05-23',
    };
    expect(police([previous]).status).toBe('MET');
    expect(
      police([{ ...previous, certificateIssued: '2017-05-22' }]).status,
    ).toBe('NOT_MET');
    expect(
      police([
        {
          ...previous,
          until: '2017-05-22',
          certificateIssued: undefined,
          missing: true,
        },
      ]).status,
    ).toBe('MET');
    const missing = [{ ...stay, certificateIssued: undefined, missing: true }];
    expect(police(missing, undefined, 'CA-AIP').status).toBe('UNKNOWN');
    expect(police(missing, undefined, 'CA-FAMILY').status).toBe('NOT_MET');
    expect(police([], undefined, 'CA-QC-PSTQ').status).toBe('UNKNOWN');
  });
  test.each([
    ['2012-11-24', 'MET'],
    ['2012-11-23', 'NOT_MET'],
    ['1946-11-24', 'NOT_MET'],
    ['1946-11-23', 'MET'],
  ])('R26 biometrics by age at filing (%s)', (dob, status) => {
    expect(
      c(26, applicant({ dateOfBirth: dob, biometrics: 'temporary-only' }))
        .status,
    ).toBe(status);
  });
  test('R27 and R28 fee estimates, including accompanying children, family biometric cap and unpublished dates', () => {
    const child: FederalMember = {
      ...person,
      relationship: 'child',
      accompanying: true,
    };
    const couple = {
      ...filed,
      biometricPayers: 3,
      singleEligibleFamilyApplyingTogether: true,
      amountPaidIncludingBiometrics: 3620,
    };
    const members: FederalMember[] = [
      { ...person, relationship: 'spouse', accompanying: true },
      child,
      { ...child, accompanying: false },
    ];
    // 2 × 1590 + 270 + 170 = 3620.
    expect(
      c(27, { members, applications: { 'CA-EE-FSW': couple } }).explanation,
    ).toContain('3620');
    expect(
      c(27, { members, applications: { 'CA-EE-FSW': couple } }).status,
    ).toBe('MET');
    expect(
      c(27, {
        members,
        applications: {
          'CA-EE-FSW': { ...couple, amountPaidIncludingBiometrics: 3619 },
        },
      }).status,
    ).toBe('NOT_MET');
    expect(
      c(27, {
        applications: { 'CA-EE-FSW': { ...filed, paymentOn: '2028-04-30' } },
      }).pendingDetails,
    ).toContain('PD-258');
    // 90 + 570 + 600 + 180 + 85 = 1525.
    const app = { ...filed, amountPaidIncludingBiometrics: 1525 };
    const f = { members: [child], applications: { 'CA-FAMILY': app } };
    expect(
      c(28, f, 'CA-FAMILY', { family: { relationship: 'spouse' } }).status,
    ).toBe('MET');
    expect(
      c(
        28,
        {
          ...f,
          applications: {
            'CA-FAMILY': { ...app, amountPaidIncludingBiometrics: 1524 },
          },
        },
        'CA-FAMILY',
        { family: { relationship: 'spouse' } },
      ).status,
    ).toBe('NOT_MET');
    expect(
      c(
        28,
        {
          applications: {
            'CA-FAMILY': {
              ...app,
              biometricPayers: 0,
              amountPaidIncludingBiometrics: 180,
            },
          },
        },
        'CA-FAMILY',
        { dateOfBirth: '2015-11-23', family: { relationship: 'child' } },
      ).explanation,
    ).toContain('180');
    expect(
      c(28, { applications: { 'CA-FAMILY': app } }, 'CA-FAMILY', {
        dateOfBirth: '2004-11-23',
        family: { relationship: 'child' },
      }).status,
    ).toBe('UNKNOWN');
  });
});

describe('full Canadian assessment contract', () => {
  test('ten paths, two locales and published source locators with no fabricated dates or positive defaults', () => {
    const assess = (locale: 'en' | 'zh-CN') =>
      evaluateCanadaFull({ simulationDate: sim, locale });
    const zh = assess('zh-CN'),
      en = assess('en');
    const register = readFileSync(
      new URL('../../../docs/SOURCES.md', import.meta.url),
      'utf8',
    )
      .split('## 一级来源')[1]
      .split('\n## ')[0];
    expect(zh.policyAsOf).toBe('2026-11-23');
    expect(zh.columns[0].id).toBe('ca.current-law-2026-11');
    expect(zh.columns[0].pathways).toHaveLength(10);
    for (const [i, pathway] of zh.columns[0].pathways.entries()) {
      const english = en.columns[0].pathways[i];
      expect(pathway.status, pathway.id).toBe('UNKNOWN');
      expect(pathway.earliestDate).toBeUndefined();
      expect(pathway.id).toBe(english.id);
      expect(pathway.title).not.toBe(english.title);
      expect(new Set(pathway.checks.map((c) => c.id)).size).toBe(
        pathway.checks.length,
      );
      for (const [j, c] of pathway.checks.entries()) {
        const other = english.checks[j];
        expect(c.id).toBe(other.id);
        expect(c.status).toBe(other.status);
        expect(c.title).not.toBe(other.title);
        expect(c.explanation).not.toBe(other.explanation);
        expect(c.sources.length).toBeGreaterThan(0);
        for (const src of c.sources) {
          expect(register).toContain('| ' + src.srcId + ' |');
          expect(src.locator.trim()).not.toBe('');
        }
      }
    }
  });
  test('citizenship proof is referred before evaluating PR and grants; the old time API retains its version', () => {
    for (const citizenshipStatus of ['citizen', 'possible-by-descent'] as const)
      expect(
        evaluateCanadaFull({ simulationDate: sim, citizenshipStatus }),
      ).toMatchObject({
        columns: [],
        shortCircuit: { reason: 'CANADIAN_CITIZENSHIP_STATUS' },
      });
    expect(
      evaluateCanada({
        simulationDate: sim,
        dateOfBirth: '1980-01-01',
        permanentResident: '2020-01-01',
        temporaryPeriods: [],
        trips: [],
      }).policyAsOf,
    ).toBe('2026-11-21');
  });
  test('the legacy time result stays available even when new eligibility checks are unresolved', () => {
    const input = {
      simulationDate: sim,
      dateOfBirth: '1980-01-01',
      permanentResident: '2020-01-01',
      trips: [{ departed: '2022-01-01', returned: '2026-06-01' }],
      temporaryPeriods: [],
    };
    const original = evaluateCanada(input);
    const full = evaluateCanadaFull(input);
    for (const [i, id] of ['CA-R02', 'CA-R08'].entries()) {
      const { status, earliestDate, pendingDetails, summary } =
        original.pathways[i];
      const path = full.columns[0].pathways[i];
      expect(path.checks.find((c) => c.id === id)?.timeBaseline).toEqual({
        status,
        earliestDate,
        pendingDetails,
        summary,
      });
      expect(path.earliestDate).toBeUndefined();
    }
    expect(
      result('CA-AIP', { ...input, residence: { prStatus: 'valid' } }).status,
    ).toBe('NOT_APPLICABLE');
    expect(
      result('CA-RESIDENCY', { ...input, permanentResident: '2026-12-01' })
        .status,
    ).toBe('NOT_APPLICABLE');
  });

  test('base nomination can meet the federal route, an outstanding review defers it, and a definitive refusal takes precedence', () => {
    const answers: CaFullRequest['pnp'] = {
      stream: 'other',
      mode: 'base',
      nomination: 'valid',
      nominationIssued: '2026-08-01',
      intendsNominatingProvince: true,
      investment: 'none',
      nominationExpires: '2026-12-31',
      federalFiled: '2026-10-01',
      viaPrPortal: true,
    };
    const patch = {
      pnp: answers,
      federal: {
        ...federal,
        principal: {
          ...person,
          exam: { ...person.exam, instructionOn: '2026-10-15' },
        },
        applications: { 'CA-PNP': { ...filed, filedOn: answers.federalFiled } },
      },
    };
    const p = result('CA-PNP', patch);
    expect(
      p.status,
      JSON.stringify(p.checks.filter((c) => !c.advisory && c.status !== 'MET')),
    ).toBe('MET');
    const undated = result('CA-PNP', {
      ...patch,
      pnp: { ...answers, nominationIssued: undefined },
    });
    for (const id of ['CA-R45', 'CA-R46'])
      expect(undated.checks.find((c) => c.id === id)?.status).toBe('UNKNOWN');
    expect(undated.status).toBe('UNKNOWN');
    expect(
      result('CA-PNP', {
        ...patch,
        federal: {
          ...patch.federal,
          principal: {
            ...patch.federal.principal,
            criminalFinding: 'under-review',
          },
        },
      }).status,
    ).toBe('UNKNOWN');
    expect(
      result('CA-PNP', {
        ...patch,
        pnp: { ...answers, nomination: 'withdrawn' },
        federal: {
          ...patch.federal,
          principal: {
            ...patch.federal.principal,
            criminalFinding: 'under-review',
          },
        },
      }).status,
    ).toBe('NOT_MET');
  });
});
