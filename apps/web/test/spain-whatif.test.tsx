import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { spainFull2026_11 } from '@uk-immigration/policy-data';
import { WhatIfView } from '../components/whatif-lab';
import { LocaleContext } from '../i18n/locale';
import { readPageResult } from '../lib/page-result';
import { decodeDraft, encodeDraft } from '../lib/share';
import { activeSpainAnswers, type SpainDraft } from '../lib/spain-draft';
import { spainModule as es } from '../lib/spain-module';
import type { SpainWhatIf } from '../lib/spain-whatif';

const v = spainFull2026_11.values;
const render = (node: React.ReactNode) =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale: 'en', setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );

const base = (targets: SpainDraft['targets']): SpainDraft => ({
  ...es.createDraft(),
  step: 0,
  completed: true,
  simulationDate: '2026-11-24',
  targets,
  timeRecordsComplete: true,
  permits: [{ from: '2017-01-01', study: false }],
  trips: [],
  route: 'general',
});

const status = (draft: SpainDraft, id: string) =>
  es
    .run(draft, 'en')
    .columns[0].pathways.flatMap((pathway) => pathway.checks)
    .find((check) => check.id === id)?.status;

const compare = (draft: SpainDraft, knobs: Partial<SpainWhatIf> = {}) =>
  es.whatif.apply(draft, { ...es.whatif.initial(draft), ...knobs });

function expectUnchanged(draft: SpainDraft) {
  const after = compare(draft);
  expect(after).toEqual(activeSpainAnswers(draft));
  expect(es.run(after, 'en')).toEqual(es.run(draft, 'en'));
  const html = render(<WhatIfView country={es} draft={draft} />);
  expect(html.match(/Same as the current scenario/g)).toHaveLength(
    es.run(draft, 'en').columns[0].pathways.length,
  );
}

const insured = {
  kind: 'public' as const,
  entitledOrAuthorized: true,
  validFrom: '2017-01-01',
  proof: true,
};

test('opening the comparison keeps multi-path and pending answers as they were', () => {
  // L is cleared, N conduct and records are still unanswered.
  expectUnchanged({
    ...base(['L', 'N']),
    residence: { securityDecision: 'clear' },
  });
  // A pending decision stays unconfirmed for L and M.
  expectUnchanged({
    ...base(['L', 'M']),
    residence: {
      securityDecision: 'pending',
      criminalCertificatesWhereRequired: true,
    },
    mobility: { holder: { securityDecision: 'pending' } },
  });
  // Expired, unconfirmed private and partly answered cover across E, M, F, R-E.
  expectUnchanged({
    ...base(['E', 'M', 'F', 'R-E']),
    residence: { insurance: { ...insured, validTo: '2026-01-01' } },
    mobility: {
      purpose: 'non-working',
      holder: { healthCover: { ...insured, kind: 'private' } },
    },
  });
  // A CCSE pass without its certificate date, and an unregistered DELE equivalent.
  expectUnchanged({
    ...base(['N']),
    nationality: {
      ccse: { verifiedPass: true },
      deleEvidence: 'registered-official-equivalent',
    },
  });
  // Resources differ between E and F, and E has not confirmed stability.
  expectUnchanged({
    ...base(['E', 'F']),
    residence: { resources: { familySize: 2, eligibleMonthlyIncome: 950 } },
    mobility: {
      purpose: 'non-working',
      family: {
        resources: { familySize: 3, eligibleMonthlyIncome: 1000, stable: true },
      },
    },
  });
});

test('a later comparison date tests the recorded insurance end date', () => {
  const draft = {
    ...base(['E']),
    residence: { insurance: { ...insured, validTo: '2027-06-01' } },
  };
  expect(status(draft, 'ES-E06')).toBe('MET');
  expect(es.whatif.initial(draft).healthCover).toBe(true);
  expect(
    status(compare(draft, { simulationDate: '2028-01-01' }), 'ES-E06'),
  ).toBe('NOT_MET');
});

test('yes and no knobs start from the baseline conditions and can return to unconfirmed', () => {
  const draft: SpainDraft = {
    ...base(['N', 'L']),
    residence: {
      securityDecision: 'clear',
      criminalCertificatesWhereRequired: true,
    },
    nationality: {
      birthDate: '1990-05-10',
      examRelief: 'none',
      deleEvidence: 'dele',
      deleLevel: 'B1',
      conductAndSecurityDecision: true,
      criminalRecords: {
        spanishRecordOrQuery: true,
        originRecordOrLawfulAlternative: true,
        militaryProcedureIfApplicable: true,
      },
    },
  };
  expect(es.whatif.initial(draft)).toMatchObject({
    natRoute: 'general',
    delePassed: true,
    ccsePassed: undefined,
    conductCleared: true,
  });
  const unknown = compare(draft, {
    natRoute: undefined,
    delePassed: undefined,
    conductCleared: undefined,
  });
  expect(unknown.route).toBeUndefined();
  for (const id of ['ES-N11', 'ES-N10', 'ES-L12', 'ES-L12-CERT'])
    expect(status(unknown, id)).toBe('UNKNOWN');

  // "No" removes the certificate and any exemption.
  expect(status(compare(draft, { delePassed: false }), 'ES-N11')).toBe(
    'NOT_MET',
  );
  for (const nationality of [
    { ...draft.nationality, documentedNationalities: ['MX'] },
    { ...draft.nationality, examRelief: 'full-dispensation' as const },
    { birthDate: '1990-05-10' },
  ]) {
    const exempt = { ...draft, nationality };
    expect(status(compare(exempt, { delePassed: false }), 'ES-N11')).toBe(
      'NOT_MET',
    );
  }
  expect(status(compare(draft, { ccsePassed: false }), 'ES-N12')).toBe(
    'NOT_MET',
  );
  const passed = compare(draft, { ccsePassed: true, delePassed: true });
  expect(status(passed, 'ES-N12')).toBe('MET');
  expect(passed.nationality.deleLevel).toBe('B1');
  expect(
    compare({ ...draft, nationality: {} }, { delePassed: true }).nationality,
  ).toMatchObject({
    deleEvidence: 'dele',
    deleLevel: v.nationalityDeleMinimum.value,
  });
});

test('insurance and conduct answers apply to every selected route', () => {
  const draft: SpainDraft = {
    ...base(['L', 'E', 'F', 'R-E']),
    residence: { insurance: insured },
    mobility: {
      purpose: 'non-working',
      holder: { healthCover: { ...insured, coversFamilyMember: true } },
    },
  };
  const covers = ['ES-E06', 'ES-F04', 'ES-R07'];
  expect(covers.map((id) => status(draft, id))).toEqual([
    'MET',
    'MET',
    'UNKNOWN',
  ]);
  for (const [answer, expected] of [
    [true, 'MET'],
    [false, 'NOT_MET'],
  ] as const) {
    const after = compare(draft, { healthCover: answer });
    expect(covers.map((id) => status(after, id))).toEqual([
      expected,
      expected,
      expected,
    ]);
  }
  const refused = compare(draft, { conductCleared: false });
  for (const id of ['ES-L12', 'ES-E08', 'ES-R05'])
    expect(status(refused, id)).toBe('NOT_MET');
  const cleared = compare(draft, { conductCleared: true });
  for (const id of ['ES-L12', 'ES-L12-CERT', 'ES-E08', 'ES-R05'])
    expect(status(cleared, id)).toBe('MET');
});

test('income, household size and salary controls change the routes that read them', () => {
  const factors = v.mobilityNonWorkingFactors.value;
  const single = v.ipremMonthly.value * factors.applicant;
  const draft: SpainDraft = {
    ...base(['M']),
    mobility: {
      purpose: 'non-working',
      holder: {
        nonWorking: {
          dependants: 0,
          monthlyNonWorkIncome: single,
          availableCapitalEur: 0,
          sourceAndAvailabilityDocumented: true,
          accommodationAvailable: true,
          accommodationDocumented: true,
        },
      },
    },
  };
  expect(status(draft, 'ES-M02')).toBe('MET');
  expect(es.whatif.initial(draft)).toMatchObject({
    familySize: 1,
    monthlyIncome: single,
  });
  const family = compare(draft, { familySize: 3 });
  expect(family.mobility.holder?.nonWorking?.dependants).toBe(2);
  expect(status(family, 'ES-M02')).toBe('NOT_MET');

  const html = (targets: SpainDraft['targets'], purpose = 'non-working') =>
    render(
      <WhatIfView
        country={es}
        draft={{
          ...base(targets),
          mobility: { purpose: purpose as 'non-working' },
        }}
      />,
    );
  // R-E and U have no numeric income test; M has a card absence test.
  for (const targets of [['R-E'], ['U']] as const)
    expect(html([...targets])).not.toContain('id="es-whatif-income"');
  expect(html(['M'])).toContain('id="es-whatif-trips"');
  expect(html(['M'])).not.toContain('id="es-whatif-salary"');
  expect(html(['M'], 'employment')).toContain('id="es-whatif-salary"');
  expect(html(['M'], 'employment')).not.toContain('id="es-whatif-income"');
  for (const id of ['ES-R06', 'ES-U05', 'ES-M05', 'ES-N13'])
    expect(es.whatif.focusForRule(id, '')).toBeUndefined();
  expect(es.whatif.focusForRule('ES-T02', '')).toBe('trips');
});

test('assuming no trips also clears the longest absence after permanent residence', () => {
  const draft: SpainDraft = {
    ...base(['U']),
    freeMovement: {
      acquiredOn: '2015-01-01',
      longestPostAcquisitionAbsence: {
        departed: '2020-01-01',
        returned: '2023-01-02',
      },
    },
  };
  expect(status(draft, 'ES-U04-retention')).toBe('NOT_MET');
  expect(status(compare(draft, { noTrips: true }), 'ES-U04-retention')).toBe(
    'MET',
  );
});

test('a comparison share reopens with the same compared result', () => {
  const draft: SpainDraft = {
    ...base(['E']),
    residence: {
      resources: { familySize: 2, eligibleMonthlyIncome: 950, stable: true },
      insurance: insured,
    },
  };
  const after = compare(draft, { familySize: 3 });
  const shared = readPageResult(es, 'en', encodeDraft(es, after));
  expect(decodeDraft(es, encodeDraft(es, after))).toEqual(after);
  expect(shared.result).toEqual(es.run(after, 'en'));
  expect(status(after, 'ES-E05')).toBe('NOT_MET');
});

test('household size must count the applicant in the questionnaire too', () => {
  const draft: SpainDraft = {
    ...base(['E']),
    step: 3,
    residence: { resources: { familySize: 0 } },
  };
  expect(es.validateStep(draft)).toEqual({
    'es-res-resources-familySize': 'es.whatif.invalidFamilySize',
  });
});
