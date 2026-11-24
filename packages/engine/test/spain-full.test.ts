import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import {
  PARAMETERS_BY_COUNTRY,
  RULE_SET_IDS_BY_COUNTRY,
} from '@uk-immigration/policy-data';
import { evaluateSpainFull, evaluateSpain } from '../src';
import type { EsFullInput, EsRequest } from '../src';

const day = '2026-11-23';
const full = (input: Partial<EsFullInput> = {}) =>
  evaluateSpainFull({ simulationDate: day, ...input }).columns[0].pathways;

test('all eight targets have distinct stable pathway IDs and registered bilingual checks for an unanswered form', () => {
  const zh = full(),
    en = full({ locale: 'en' });
  expect(zh.map((p) => p.id)).toEqual([
    'ES-NATIONALITY',
    'ES-LONG-TERM',
    'ES-LONG-TERM-EU',
    'ES-M',
    'ES-F',
    'ES-R-N',
    'ES-R-E',
    'ES-U',
  ]);
  const register = readFileSync(
    new URL('../../../docs/SOURCES.md', import.meta.url),
    'utf8',
  )
    .split('## 一级来源')[1]
    .split('\n## ')[0];
  for (const [i, p] of zh.entries()) {
    expect(p.status, p.id).toBe('UNKNOWN');
    expect(p.title).not.toBe(en[i].title);
    expect(new Set(p.checks.map((c) => c.id)).size).toBe(p.checks.length);
    for (const [j, c] of p.checks.entries()) {
      expect(c.id).toBe(en[i].checks[j].id);
      expect(c.explanation, c.id).not.toBe(en[i].checks[j].explanation);
      expect(c.sources.length, c.id).toBeGreaterThan(0);
      for (const ref of c.sources) {
        expect(register).toContain('| ' + ref.srcId + ' |');
        expect(ref.locator.trim()).not.toBe('');
      }
    }
  }
  expect(RULE_SET_IDS_BY_COUNTRY.es).toEqual(['es.current-law']);
  expect(evaluateSpainFull({ simulationDate: day }).policyAsOf).toBe(
    PARAMETERS_BY_COUNTRY.es['es.current-law'].asOf,
  );
});

test('keeps both pilot time candidates distinct from eligibility, and distinguishes missing from explicitly empty records', () => {
  const req: EsRequest = {
    simulationDate: day,
    route: 'general',
    permits: [{ from: '2022-11-24' }],
    trips: [],
  };
  const old = evaluateSpain(req);
  const [l, n] = full({ ...req, targets: ['L', 'N', 'L'] });
  expect([l.pathwayCompletionDate, n.pathwayCompletionDate]).toEqual(
    old.pathways.map((p) => p.earliestDate),
  );
  expect([l.earliestDate, n.earliestDate]).toEqual([undefined, undefined]);
  expect(full({ targets: ['N'], trips: [] })[0].checks[0].status).toBe(
    'UNKNOWN',
  );
  expect(
    full({ targets: ['N'], route: 'general', permits: [], trips: [] })[0]
      .checks[0].status,
  ).toBe('NOT_MET');
});

test('the same detailed Spanish permit and travel record feeds N, L and E without entering it twice', () => {
  const paths = full({
    targets: ['N', 'L', 'E'],
    residence: {
      periods: [{ from: '2016-11-23', territory: 'spain', kind: 'residence' }],
      tripDetails: [],
    },
  });
  for (const [i, id] of ['ES-N01', 'ES-L01', 'ES-E01'].entries()) {
    expect(paths[i].checks.find((c) => c.id === id)?.status).toBe('MET');
  }
});

test('historical applications use the filing date for the transition and fee schedule', () => {
  const [l, m] = full({
    targets: ['L', 'M'],
    simulationDate: '2025-06-15',
    mobility: { holder: { filedOn: '2025-05-19' } },
    residence: {
      fee: {
        exemptPublicGuardian: false,
        paid: true,
        amount: 21.87,
        workingDaysAfterAdmission: 0,
      },
    },
  });
  expect(m.status).toBe('UNKNOWN');
  expect(m.checks.map((c) => c.id)).toEqual(['ES-TRANSITION']);
  expect(l.checks.find((c) => c.id === 'ES-L14')?.status).toBe('UNKNOWN');
});

test('a disputed shortened nationality route exposes a separate general-period assessment', () => {
  const [reduced, general] = full({
    targets: ['N'],
    route: 'ibero',
    nationality: { originalNationalityForPermit: 'authority-review' },
    permits: [{ from: '2022-01-01' }],
    trips: [],
  });
  expect(reduced.id).toBe('ES-NATIONALITY');
  expect(
    reduced.checks.find((c) => c.id === 'ES-N03')?.pendingDetails,
  ).toContain('PD-280');
  expect(general.id).toBe('ES-NATIONALITY-GENERAL');
  expect(general.checks.find((c) => c.id === 'ES-N01')?.status).toBe('NOT_MET');
});

test('an unanswered nationality category does not rule out a shortened residence period', () => {
  const input: EsFullInput = {
    simulationDate: day,
    targets: ['N'],
    permits: [{ from: '2023-01-01' }],
    trips: [],
  };
  expect(full(input)[0].checks[0].status).toBe('UNKNOWN');
  expect(full({ ...input, route: 'general' })[0].checks[0].status).toBe(
    'NOT_MET',
  );
});
