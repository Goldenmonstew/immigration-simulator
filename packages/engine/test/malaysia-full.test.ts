/// <reference types="node" />

import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import {
  PARAMETERS_BY_COUNTRY,
  RULE_SET_IDS_BY_COUNTRY,
} from '@uk-immigration/policy-data';
import { MY_FULL_PATHWAYS, evaluateMalaysiaFull } from '../src';
import { addDays } from '../src/dates';
import type { MyFullRequest, MyPathwayId } from '../src';

const day = '2026-11-24';

// A citizen's wife who meets every answerable threshold on `day`.
const wife = {
  simulationDate: day,
  dateOfBirth: '1990-05-01',
  nationality: 'CN',
  passportExpiry: '2030-01-01',
  family: {
    tie: 'wife-of-citizen',
    marriedOn: '2022-01-10',
    marriageRegistration: 'malaysia',
    separatedOrDivorced: false,
  },
  passes: [{ kind: 'ltsvp-spouse', from: '2022-03-01', to: '2027-02-28' }],
  citizenSponsor: true,
  citizenReferees: 2,
  immigrationRecord: 'clear',
  previousPrRefusalOn: null,
  trips: [],
} satisfies MyFullRequest;

function path(id: MyPathwayId, req: MyFullRequest) {
  return evaluateMalaysiaFull({ ...req, pathways: [id] }).columns[0]
    .pathways[0];
}
function cond(id: MyPathwayId, key: string, req: MyFullRequest) {
  const c = path(id, req).checks.find((x) => x.id === key);
  expect(c, key).toBeDefined();
  return c!;
}

describe('result shape', () => {
  test('one registered column with every pathway in both languages', () => {
    const run = (locale: 'en' | 'zh-CN') =>
      evaluateMalaysiaFull({ ...wife, locale });
    const [zh, en] = [run('zh-CN'), run('en')];
    expect(RULE_SET_IDS_BY_COUNTRY.my).toEqual([en.columns[0].id]);
    expect(en.policyAsOf).toBe(
      PARAMETERS_BY_COUNTRY.my['my.current-law-2026-11'].asOf,
    );
    expect(en.columns[0].pathways.map((p) => p.id)).toEqual(MY_FULL_PATHWAYS);
    expect(MY_FULL_PATHWAYS).toHaveLength(15);
    const shape = (r: typeof en) =>
      r.columns[0].pathways.map((p) => [
        p.id,
        p.status,
        p.checks.map((c) => [c.id, c.status, c.kind]),
      ]);
    expect(shape(zh)).toEqual(shape(en));
    const CJK = /[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]/;
    for (const p of en.columns[0].pathways) {
      expect(p.title).not.toMatch(CJK);
      expect(p.summary).not.toMatch(CJK);
      for (const c of p.checks) {
        expect(`${c.title} ${c.explanation}`, c.id).not.toMatch(CJK);
        expect(c.explanation, c.id).not.toBe(c.title);
        expect(c.sources.length, c.id).toBeGreaterThan(0);
      }
    }
  });

  test('cites only registered sources and pending details', () => {
    const register = readFileSync(
      new URL('../../../docs/SOURCES.md', import.meta.url),
      'utf8',
    );
    const pending = readFileSync(
      new URL('../../../docs/pending-details.md', import.meta.url),
      'utf8',
    );
    const result = evaluateMalaysiaFull({ simulationDate: day });
    for (const p of result.columns[0].pathways)
      for (const c of p.checks) {
        for (const s of c.sources)
          expect(register, s.srcId).toContain(`| ${s.srcId} |`);
        for (const pd of c.pendingDetails ?? []) {
          expect(pd).toMatch(/^PD-4[0-3]\d$/);
          expect(pending).toContain(`| ${pd} |`);
        }
      }
  });

  test('the pathways filter keeps the display order', () => {
    const ids = evaluateMalaysiaFull({
      simulationDate: day,
      pathways: ['my.pass.mm2h', 'my.pr.wife'],
    }).columns[0].pathways.map((p) => p.id);
    expect(ids).toEqual(['my.pr.wife', 'my.pass.mm2h']);
  });
});

describe('permanent residence: wife of a citizen', () => {
  test('thresholds met leave only discretion and screening open', () => {
    const p = path('my.pr.wife', wife);
    expect(p.status).toBe('UNKNOWN');
    expect(p.timeStatus).toBe('MET');
    // Married 2022-01-10 + 3 years; pass from 2022-03-01 + 12 months + 1 day.
    expect(p.timeEarliestDate).toBe('2025-01-10');
    const required = p.checks.filter((c) => c.kind === 'requirement');
    expect(required.filter((c) => c.status !== 'MET').map((c) => c.id)).toEqual(
      ['my.pr.prohibited-classes', 'my.pr.discretion'],
    );
    expect(cond('my.pr.wife', 'my.pr.discretion', wife).pendingDetails).toEqual(
      ['PD-400'],
    );
    expect(p.summary).toContain('裁量');
    expect(cond('my.pr.wife', 'my.pr.fee', wife).fee).toEqual({
      currency: 'MYR',
      amount: 120,
    });
  });

  test('three years of marriage are complete on the anniversary', () => {
    const on = { ...wife, family: { ...wife.family, marriedOn: '2023-11-24' } };
    const late = {
      ...wife,
      family: { ...wife.family, marriedOn: '2023-11-25' },
    };
    expect(cond('my.pr.wife', 'my.pr.marriage-duration', on).status).toBe(
      'MET',
    );
    expect(cond('my.pr.wife', 'my.pr.marriage-duration', late).status).toBe(
      'NOT_MET',
    );
    const p = path('my.pr.wife', late);
    expect(p.status).toBe('NOT_MET');
    expect([p.timeStatus, p.timeEarliestDate]).toEqual([
      'FUTURE',
      '2026-11-25',
    ]);
  });

  test('separation fails the marriage and the timeline', () => {
    const req = {
      ...wife,
      family: { ...wife.family, separatedOrDivorced: true },
    };
    expect(cond('my.pr.wife', 'my.pr.marriage-duration', req).status).toBe(
      'NOT_MET',
    );
    expect(path('my.pr.wife', req).timeStatus).toBe('NOT_MET');
  });

  test('a marriage registered only abroad needs confirmation', () => {
    const c = cond('my.pr.wife', 'my.pr.marriage-registration', {
      ...wife,
      family: { ...wife.family, marriageRegistration: 'foreign-only' },
    });
    expect([c.status, c.pendingDetails]).toEqual(['UNKNOWN', ['PD-405']]);
  });

  test('the spouse pass must be held for more than 12 months and still be valid', () => {
    const held = (from: string, to = '2027-12-31') =>
      cond('my.pr.wife', 'my.pr.spouse-pass', {
        ...wife,
        passes: [{ kind: 'ltsvp-spouse', from, to }],
      }).status;
    expect(held('2025-11-23')).toBe('MET');
    expect(held('2025-11-24')).toBe('NOT_MET');
    expect(held('2022-03-01', '2026-11-23')).toBe('NOT_MET');
    const p = path('my.pr.wife', {
      ...wife,
      passes: [{ kind: 'ltsvp-spouse', from: '2025-11-24', to: '2027-12-31' }],
    });
    expect(p.timeEarliestDate).toBe('2026-11-25');
  });

  test('more than 12 months only across a break needs confirmation', () => {
    const c = cond('my.pr.wife', 'my.pr.spouse-pass', {
      ...wife,
      passes: [
        { kind: 'ltsvp-spouse', from: '2024-01-01', to: '2024-12-31' },
        { kind: 'ltsvp-spouse', from: '2026-06-01', to: '2027-05-31' },
      ],
    });
    expect([c.status, c.pendingDetails]).toEqual(['UNKNOWN', ['PD-406']]);
  });

  test('a temporary employment pass bars the spouse categories', () => {
    const req = {
      ...wife,
      passes: [
        ...wife.passes,
        { kind: 'plks' as const, from: '2026-11-01', to: '2027-10-31' },
      ],
    };
    expect(cond('my.pr.wife', 'my.pr.barred-pass', req).status).toBe('NOT_MET');
  });

  test('passport, referees, blacklist and the refusal waiting period', () => {
    expect(
      cond('my.pr.wife', 'my.pr.passport', {
        ...wife,
        passportExpiry: '2027-11-24',
      }).status,
    ).toBe('MET');
    expect(
      cond('my.pr.wife', 'my.pr.passport', {
        ...wife,
        passportExpiry: '2027-11-23',
      }).status,
    ).toBe('NOT_MET');
    expect(
      cond('my.pr.wife', 'my.pr.referees', { ...wife, citizenReferees: 1 })
        .status,
    ).toBe('NOT_MET');
    const listed = path('my.pr.wife', { ...wife, immigrationRecord: 'listed' });
    expect(listed.status).toBe('NOT_MET');
    expect(
      cond('my.pr.wife', 'my.pr.previous-refusal', {
        ...wife,
        previousPrRefusalOn: '2025-11-25',
      }).status,
    ).toBe('NOT_MET');
    expect(
      cond('my.pr.wife', 'my.pr.previous-refusal', {
        ...wife,
        previousPrRefusalOn: '2025-11-24',
      }).status,
    ).toBe('MET');
  });

  test('a husband does not use the wife category', () => {
    const p = path('my.pr.wife', {
      ...wife,
      family: { ...wife.family, tie: 'husband-of-citizen' },
    });
    expect(p.status).toBe('NOT_APPLICABLE');
    expect(p.timeStatus).toBeUndefined();
  });
});

describe('permanent residence: husband of a citizen', () => {
  const husband = {
    ...wife,
    family: {
      ...wife.family,
      tie: 'husband-of-citizen',
      marriedOn: '2020-01-01',
    },
    passes: [{ kind: 'ltsvp-spouse', from: '2021-11-24', to: '2027-12-31' }],
  } satisfies MyFullRequest;

  test('five continuous years end on the anniversary', () => {
    expect(cond('my.pr.husband', 'my.pr.spouse-pass', husband).status).toBe(
      'MET',
    );
    const late = {
      ...husband,
      passes: [
        { kind: 'ltsvp-spouse' as const, from: '2021-11-25', to: '2027-12-31' },
      ],
    };
    expect(cond('my.pr.husband', 'my.pr.spouse-pass', late).status).toBe(
      'NOT_MET',
    );
    expect(path('my.pr.husband', late).timeEarliestDate).toBe('2026-11-25');
  });

  test('a break of up to six months is bridged only as pending', () => {
    const c = cond('my.pr.husband', 'my.pr.spouse-pass', {
      ...husband,
      passes: [
        { kind: 'ltsvp-spouse', from: '2021-06-01', to: '2023-12-31' },
        // The break runs 2024-01-01 to 2024-06-30: exactly six months.
        { kind: 'ltsvp-spouse', from: '2024-07-01', to: '2027-12-31' },
      ],
    });
    expect([c.status, c.pendingDetails]).toEqual(['UNKNOWN', ['PD-407']]);
    // The count does not restart at the break (review113-1 #1): 1826 days
    // from 2021-06-01 to 2026-06-01 less the 182-day break reach the 1826
    // days of five years 182 days later, on 2026-11-30.
    const p = path('my.pr.husband', {
      ...husband,
      passes: [
        { kind: 'ltsvp-spouse', from: '2021-06-01', to: '2023-12-31' },
        { kind: 'ltsvp-spouse', from: '2024-07-01', to: '2027-12-31' },
      ],
    });
    expect([p.timeStatus, p.timeEarliestDate]).toEqual([
      'FUTURE',
      '2026-11-30',
    ]);
  });

  test('a bridged break that still leaves five years held is met (review113-1 #1)', () => {
    // 2019-01-01 to 2021-12-31 is 1096 days and 2022-04-01 to 2024-03-31 is
    // 731: 1827 days, the days from 2019-04-01 to 2024-04-01.
    const req = {
      ...husband,
      simulationDate: '2024-04-01',
      family: { ...husband.family, marriedOn: '2015-01-01' },
      passes: [
        { kind: 'ltsvp-spouse', from: '2019-01-01', to: '2021-12-31' },
        { kind: 'ltsvp-spouse', from: '2022-04-01', to: '2027-12-31' },
      ],
    } satisfies MyFullRequest;
    expect(cond('my.pr.husband', 'my.pr.spouse-pass', req).status).toBe('MET');
    const p = path('my.pr.husband', req);
    expect([p.timeStatus, p.timeEarliestDate]).toEqual(['MET', '2024-04-01']);
    // A day earlier five years are reached only by counting the break.
    const before = { ...req, simulationDate: '2024-03-31' };
    const c = cond('my.pr.husband', 'my.pr.spouse-pass', before);
    expect([c.status, c.pendingDetails]).toEqual(['UNKNOWN', ['PD-407']]);
    const q = path('my.pr.husband', before);
    expect([q.timeStatus, q.timeEarliestDate]).toEqual([
      'FUTURE',
      '2024-04-01',
    ]);
  });

  test('several short breaks adding up to more than six months are pending (review113-2 risk 2)', () => {
    // Breaks 2022-01-01..2022-05-31 (151 days) and 2024-01-01..2024-05-31
    // (152 days): each is within six months, together 303 days are not.
    const req = {
      ...husband,
      passes: [
        { kind: 'ltsvp-spouse', from: '2020-01-01', to: '2021-12-31' },
        { kind: 'ltsvp-spouse', from: '2022-06-01', to: '2023-12-31' },
        { kind: 'ltsvp-spouse', from: '2024-06-01', to: '2029-12-31' },
      ],
    } satisfies MyFullRequest;
    // Per break: 2519 days since 2020-01-01 less 303 exceed 1826. In total:
    // only the run from 2022-06-01 with its 152-day break is within six
    // months, and 1978 days less 152 first reach 1826 on 2027-10-31.
    const c = cond('my.pr.husband', 'my.pr.spouse-pass', req);
    expect([c.status, c.pendingDetails]).toEqual(['UNKNOWN', ['PD-407']]);
    expect(c.explanation).toContain('单次还是累计');
    const p = path('my.pr.husband', req);
    expect([p.timeStatus, p.timeEarliestDate]).toEqual([
      'FUTURE',
      '2027-10-31',
    ]);
    // Breaks of 59 and 60 days add up to under six months: met either way.
    const short = {
      ...husband,
      passes: [
        { kind: 'ltsvp-spouse', from: '2020-01-01', to: '2021-12-31' },
        { kind: 'ltsvp-spouse', from: '2022-03-01', to: '2023-12-31' },
        { kind: 'ltsvp-spouse', from: '2024-03-01', to: '2029-12-31' },
      ],
    } satisfies MyFullRequest;
    expect(cond('my.pr.husband', 'my.pr.spouse-pass', short).status).toBe(
      'MET',
    );
    // The same breaks on employment passes leave the WAS category pending.
    const was = cond('my.pr.was', 'my.pr.qualifying-pass', {
      ...req,
      family: { tie: 'none' },
      passes: req.passes.map((x) => ({ ...x, kind: 'employment' as const })),
    });
    expect([was.status, was.pendingDetails]).toEqual(['UNKNOWN', ['PD-407']]);
  });

  test('planned breaks in the passes entered move the earliest date (review113-2 risk 5)', () => {
    const at = (passes: MyFullRequest['passes']) => {
      const p = path('my.pr.husband', { ...husband, passes });
      return [p.timeStatus, p.timeEarliestDate];
    };
    const spouse = (from: string, to: string) => ({
      kind: 'ltsvp-spouse' as const,
      from,
      to,
    });
    // Unbroken from 2023-01-01, five years end on 2028-01-01.
    expect(at([spouse('2023-01-01', '2035-12-31')])).toEqual([
      'FUTURE',
      '2028-01-01',
    ]);
    // A planned break of 2027-07-01..2027-08-31 (62 days) is bridged and
    // left out: 1889 days less 62 reach the 1827 days of five years on
    // 2028-03-04.
    expect(
      at([
        spouse('2023-01-01', '2027-06-30'),
        spouse('2027-09-01', '2035-12-31'),
      ]),
    ).toEqual(['FUTURE', '2028-03-04']);
    // A planned break of eight months restarts the count on 2028-03-01.
    expect(
      at([
        spouse('2023-01-01', '2027-06-30'),
        spouse('2028-03-01', '2035-12-31'),
      ]),
    ).toEqual(['FUTURE', '2033-03-01']);
    // A wife's pass ending 2027-01-31 before a new one from 2027-09-01:
    // more than 12 months from 2027-09-01 is 2028-09-02.
    const w = path('my.pr.wife', {
      ...wife,
      passes: [
        spouse('2026-06-01', '2027-01-31'),
        spouse('2027-09-01', '2030-12-31'),
      ],
    });
    expect([w.timeStatus, w.timeEarliestDate]).toEqual([
      'FUTURE',
      '2028-09-02',
    ]);
    expect(w.assumptions).toEqual([]);
    // Past the last pass entered, renewal is an assumption.
    const renewed = path('my.pr.wife', {
      ...wife,
      passes: [spouse('2026-06-01', '2026-12-31')],
    });
    expect([renewed.timeStatus, renewed.timeEarliestDate]).toEqual([
      'FUTURE',
      '2027-06-02',
    ]);
    expect(renewed.assumptions.join('')).toContain('续签');
    // No date, no assumption: 12 months from 2026-06-01 end after the 18th
    // birthday on 2027-06-01.
    const late = path('my.pr.child', {
      simulationDate: day,
      dateOfBirth: '2009-06-01',
      family: { tie: 'child-of-citizen', childRelation: 'biological' },
      passes: [{ kind: 'student', from: '2026-06-01', to: '2026-12-31' }],
    });
    expect([late.timeStatus, late.assumptions]).toEqual(['NOT_MET', []]);
    // Residence Pass category 3: three years restart after a planned break.
    const rp = path('my.rp.family', {
      ...wife,
      passes: [
        spouse('2025-01-01', '2026-12-31'),
        spouse('2027-03-01', '2031-12-31'),
      ],
    });
    expect([rp.timeStatus, rp.timeEarliestDate]).toEqual([
      'FUTURE',
      '2030-03-01',
    ]);
    // RP-T: three years of Employment Pass restart after a planned break.
    const rpt = path('my.pass.rpt', {
      simulationDate: day,
      passes: [
        { kind: 'employment', from: '2025-01-01', to: '2026-12-31' },
        { kind: 'employment', from: '2027-06-01', to: '2031-12-31' },
      ],
    });
    expect([rpt.timeStatus, rpt.timeEarliestDate]).toEqual([
      'FUTURE',
      '2030-06-01',
    ]);
  });

  test('a longer break restarts the count', () => {
    const req = {
      ...husband,
      passes: [
        { kind: 'ltsvp-spouse' as const, from: '2021-06-01', to: '2023-12-31' },
        { kind: 'ltsvp-spouse' as const, from: '2024-07-02', to: '2029-12-31' },
      ],
    };
    expect(cond('my.pr.husband', 'my.pr.spouse-pass', req).status).toBe(
      'NOT_MET',
    );
    expect(path('my.pr.husband', req).timeEarliestDate).toBe('2029-07-02');
  });

  test('recent Residence Pass time leaves the spouse pass pending', () => {
    const c = cond('my.pr.husband', 'my.pr.spouse-pass', {
      ...husband,
      passes: [
        { kind: 'ltsvp-spouse', from: '2021-06-01', to: '2024-05-31' },
        { kind: 'residence', from: '2024-06-01', to: '2029-05-31' },
      ],
    });
    // Five years are held with the Residence Pass and no break, so only
    // PD-428 is open (review113-2 #1).
    expect([c.status, c.pendingDetails]).toEqual(['UNKNOWN', ['PD-428']]);
  });

  test('five years of marriage are required', () => {
    const c = cond('my.pr.husband', 'my.pr.marriage-duration', {
      ...husband,
      family: { ...husband.family, marriedOn: '2021-11-25' },
    });
    expect(c.status).toBe('NOT_MET');
  });
});

describe('permanent residence: child of a citizen', () => {
  const child = {
    ...wife,
    dateOfBirth: '2009-11-25',
    family: { tie: 'child-of-citizen', childRelation: 'biological' },
    passes: [{ kind: 'student', from: '2024-01-01', to: '2027-12-31' }],
  } satisfies MyFullRequest;

  test('the child must still be under 18', () => {
    expect(cond('my.pr.child', 'my.pr.child-age', child).status).toBe('MET');
    const adult = { ...child, dateOfBirth: '2008-11-24' };
    expect(cond('my.pr.child', 'my.pr.child-age', adult).status).toBe(
      'NOT_MET',
    );
  });

  test('stepchildren are excluded, adopted children pending (review113-1 suggestion 4)', () => {
    // SRC-505 §4 p17 and §5.3(c) p20: "anak kandung" (biological child).
    const as = (childRelation: 'step' | 'adopted') =>
      path('my.pr.child', {
        ...child,
        family: { tie: 'child-of-citizen', childRelation },
      });
    expect(as('step').status).toBe('NOT_APPLICABLE');
    expect(as('step').checks[0].status).toBe('NOT_MET');
    expect(as('adopted').status).toBe('UNKNOWN');
    expect(as('adopted').checks[0].pendingDetails).toEqual(['PD-409']);
  });

  test('no referees and no interview, but police screening remains', () => {
    const referees = cond('my.pr.child', 'my.pr.referees', child);
    expect([referees.applicable, referees.kind]).toEqual([
      false,
      'information',
    ]);
    const interview = cond('my.pr.child', 'my.pr.interview-security', child);
    expect([interview.status, interview.kind]).toEqual(['UNKNOWN', 'factor']);
    expect(interview.explanation).toContain('PDRM');
  });

  test('the pass must reach 12 months before the 18th birthday', () => {
    const p = path('my.pr.child', {
      ...child,
      dateOfBirth: '2009-06-01',
      passes: [{ kind: 'student', from: '2026-06-01', to: '2028-12-31' }],
    });
    // 2026-06-01 + 12 months + 1 day is after 2027-06-01.
    expect(p.timeStatus).toBe('NOT_MET');
  });
});

describe('permanent residence: fully foreign national', () => {
  const was = {
    ...wife,
    nationality: 'US',
    family: { tie: 'none' },
    passes: [{ kind: 'employment', from: '2021-11-24', to: '2027-12-31' }],
    was: { regulatorRecognition: true },
  } satisfies MyFullRequest;

  test('five years on qualifying passes, with recognition, leaves discretion', () => {
    const p = path('my.pr.was', was);
    expect(cond('my.pr.was', 'my.pr.qualifying-pass', was).status).toBe('MET');
    expect(cond('my.pr.was', 'my.pr.field-recognition', was).status).toBe(
      'MET',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(cond('my.pr.was', 'my.pr.deposit', was).fee).toEqual({
      currency: 'MYR',
      amount: 2000,
    });
  });

  test('MM2H time neither counts nor allows an application', () => {
    const req = {
      ...was,
      passes: [
        { kind: 'mm2h' as const, from: '2021-01-01', to: '2024-12-31' },
        { kind: 'employment' as const, from: '2025-01-01', to: '2027-12-31' },
      ],
    };
    expect(cond('my.pr.was', 'my.pr.qualifying-pass', req).status).toBe(
      'NOT_MET',
    );
    const holding = {
      ...was,
      passes: [{ kind: 'mm2h' as const, from: '2021-01-01', to: '2030-12-31' }],
    };
    expect(cond('my.pr.was', 'my.pr.barred-pass', holding).status).toBe(
      'NOT_MET',
    );
  });

  test('deposit by nationality and family ties', () => {
    const deposit = (nationality?: string) =>
      cond('my.pr.was', 'my.pr.deposit', { ...was, nationality }).fee?.amount;
    expect([deposit('SG'), deposit('FR'), deposit('stateless')]).toEqual([
      200, 1500, 1500,
    ]);
    expect(
      cond('my.pr.was', 'my.pr.deposit', { ...was, nationality: undefined })
        .status,
    ).toBe('UNKNOWN');
    expect(
      path('my.pr.was', { ...was, family: { tie: 'wife-of-citizen' } }).status,
    ).toBe('NOT_APPLICABLE');
    expect(
      path('my.pr.was', { ...was, family: { tie: 'spouse-of-pr' } }).status,
    ).toBe('UNKNOWN');
  });

  test('a short break between passes does not restart the five years (review113-1 #1)', () => {
    const req = {
      ...was,
      simulationDate: '2024-04-01',
      passes: [
        { kind: 'employment', from: '2019-01-01', to: '2021-12-31' },
        { kind: 'employment', from: '2022-04-01', to: '2027-12-31' },
      ],
    } satisfies MyFullRequest;
    expect(cond('my.pr.was', 'my.pr.qualifying-pass', req).status).toBe('MET');
    const p = path('my.pr.was', req);
    expect([p.timeStatus, p.timeEarliestDate]).toEqual(['MET', '2024-04-01']);
  });

  test('the sponsor cites the WAS checklist (review113-1 suggestion 2)', () => {
    expect(cond('my.pr.was', 'my.pr.sponsor', was).sources).toEqual([
      { srcId: 'SRC-505', locator: '附录 C3 第 4–5 项 p61' },
      { srcId: 'SRC-505', locator: '§2.6 p12' },
      { srcId: 'SRC-505', locator: '§3.10 p14' },
    ]);
  });

  test('recognition evidence is pending when absent', () => {
    const c = cond('my.pr.was', 'my.pr.field-recognition', { ...was, was: {} });
    expect([c.status, c.pendingDetails]).toEqual(['UNKNOWN', ['PD-408']]);
  });
});

describe('permanent residence: REP family', () => {
  const rep = {
    ...wife,
    rep: {
      relation: 'husband',
      participantHasSatk: true,
      approvalLetterValidUntil: '2027-06-30',
      marriedBeforeRepApplication: true,
      referees: 2,
    },
    family: { ...wife.family, marriedOn: '2021-11-24' },
  } satisfies MyFullRequest;

  test('a husband needs five years of marriage and a valid approval letter', () => {
    const p = path('my.pr.rep-family', rep);
    expect(p.status).toBe('UNKNOWN');
    expect(
      cond('my.pr.rep-family', 'my.pr.marriage-duration', rep).status,
    ).toBe('MET');
    const short = {
      ...rep,
      family: { ...rep.family, marriedOn: '2021-11-25' },
    };
    expect(
      cond('my.pr.rep-family', 'my.pr.marriage-duration', short).status,
    ).toBe('NOT_MET');
    expect(
      cond('my.pr.rep-family', 'my.pr.rep-approval-letter', {
        ...rep,
        rep: { ...rep.rep, approvalLetterValidUntil: '2026-11-23' },
      }).status,
    ).toBe('NOT_MET');
    expect(
      cond('my.pr.rep-family', 'my.pr.rep-ltsvp-fee', rep).fee?.amount,
    ).toBe(90);
  });

  test('REP family pay the Permit Masuk deposit by nationality (review113-1 #7)', () => {
    const deposit = (nationality: string) =>
      cond('my.pr.rep-family', 'my.pr.deposit', {
        ...rep,
        nationality,
      });
    // SRC-506 §11.3 and Lampiran 9: United States RM2,000, Singapore RM200.
    expect([deposit('US').fee?.amount, deposit('SG').fee?.amount]).toEqual([
      2000, 200,
    ]);
    expect(deposit('US').sources).toEqual([
      { srcId: 'SRC-506', locator: '§11.3–11.4 p25' },
      { srcId: 'SRC-506', locator: 'Lampiran 9 p36' },
    ]);
    expect(deposit('US').explanation).toContain('满 2 年后可申请退还');
  });

  test('a REP child must be a biological child (review113-1 #9)', () => {
    // SRC-506 §4(b) p16: "Anak kandung kepada peserta REP".
    const child = (childRelation: 'biological' | 'step' | 'adopted') =>
      cond('my.pr.rep-family', 'my.pr.category', {
        simulationDate: day,
        dateOfBirth: '2015-01-01',
        rep: { relation: 'child', participantHasSatk: true },
        family: { childRelation },
      });
    expect(child('biological').status).toBe('MET');
    expect(child('step').status).toBe('NOT_MET');
    expect([child('adopted').status, child('adopted').pendingDetails]).toEqual([
      'UNKNOWN',
      ['PD-409'],
    ]);
  });

  test('REP marriage years carry no separation condition (review113-1 suggestion 5)', () => {
    // SRC-506 §5.3 p16 sets only the years of marriage.
    const separated = {
      ...rep,
      family: { ...rep.family, separatedOrDivorced: true },
    };
    const c = cond('my.pr.rep-family', 'my.pr.marriage-duration', separated);
    expect(c.status).toBe('MET');
    expect(c.explanation).not.toContain('未分居');
    expect(path('my.pr.rep-family', separated).timeStatus).toBe('MET');
    // A divorce would end the spouse relationship; the answer does not say which.
    const cat = cond('my.pr.rep-family', 'my.pr.category', separated);
    expect([cat.status, cat.pendingDetails]).toEqual(['UNKNOWN', ['PD-405']]);
  });

  test('not a REP family', () => {
    expect(
      path('my.pr.rep-family', { ...rep, rep: { relation: 'none' } }).status,
    ).toBe('NOT_APPLICABLE');
  });

  test('marriage years need the relation to the participant (review113-2 #2)', () => {
    // SRC-506 §5.3 p16: a wife needs three years of marriage, a husband five.
    for (const marriedOn of ['2023-01-01', '2024-06-01']) {
      const req = {
        simulationDate: day,
        family: { tie: 'husband-of-citizen', marriedOn },
      } satisfies MyFullRequest;
      const c = cond('my.pr.rep-family', 'my.pr.marriage-duration', req);
      expect(c.status, marriedOn).toBe('UNKNOWN');
      const p = path('my.pr.rep-family', req);
      expect([p.timeStatus, p.timeEarliestDate], marriedOn).toEqual([
        'UNKNOWN',
        undefined,
      ]);
    }
    // Married 2023-01-01, a husband completes five years on 2028-01-01.
    const husband = path('my.pr.rep-family', {
      simulationDate: day,
      family: { marriedOn: '2023-01-01', separatedOrDivorced: false },
      rep: { relation: 'husband', approvalLetterValidUntil: '2030-12-31' },
    });
    expect([husband.timeStatus, husband.timeEarliestDate]).toEqual([
      'FUTURE',
      '2028-01-01',
    ]);
  });

  test('separation text only for a spouse (review113-2 suggestion 3)', () => {
    for (const relation of [undefined, 'none', 'child'] as const) {
      const c = cond('my.pr.rep-family', 'my.pr.category', {
        simulationDate: day,
        rep: { relation },
        family: { separatedOrDivorced: true },
      });
      expect(c.explanation, relation).not.toContain('分居');
      expect(c.pendingDetails ?? [], relation).not.toContain('PD-405');
    }
  });
});

describe('Residence Pass', () => {
  test('category 3 needs three years on a long-term pass', () => {
    const met = path('my.rp.family', {
      ...wife,
      residencePassSponsor: true,
      passes: [{ kind: 'ltsvp-spouse', from: '2023-11-24', to: '2027-12-31' }],
    });
    expect(met.status).toBe('MET');
    expect(met.earliestDate).toBe(day);
    const late = path('my.rp.family', {
      ...wife,
      passes: [{ kind: 'ltsvp-spouse', from: '2023-11-25', to: '2027-12-31' }],
    });
    expect(late.status).toBe('NOT_MET');
    expect(late.timeEarliestDate).toBe('2026-11-25');
  });

  test('category 4 needs five years and cumulative time is pending', () => {
    const pr = { ...wife, family: { tie: 'spouse-of-pr' as const } };
    expect(
      cond('my.rp.family', 'my.rp.long-term-pass', {
        ...pr,
        passes: [{ kind: 'dependant', from: '2021-11-24', to: '2027-12-31' }],
      }).status,
    ).toBe('MET');
    const c = cond('my.rp.family', 'my.rp.long-term-pass', {
      ...pr,
      passes: [
        { kind: 'dependant', from: '2018-01-01', to: '2022-12-31' },
        { kind: 'dependant', from: '2024-01-01', to: '2027-12-31' },
      ],
    });
    expect([c.status, c.pendingDetails]).toEqual(['UNKNOWN', ['PD-429']]);
  });

  test('a permanent resident’s child must be a biological child (review113-2 #3)', () => {
    // SRC-508 Category 4: "Biological child to a Permanent Resident aged 18
    // and below"; only Category 3 adds step and adopted children.
    const req = (childRelation?: 'biological') =>
      ({
        simulationDate: day,
        dateOfBirth: '2015-01-01',
        passportExpiry: '2028-01-01',
        family: { tie: 'child-of-pr', childRelation },
        passes: [{ kind: 'dependant', from: '2020-01-01', to: '2027-12-31' }],
        residencePassSponsor: true,
      }) satisfies MyFullRequest;
    expect(cond('my.rp.family', 'my.rp.category', req()).status).toBe(
      'UNKNOWN',
    );
    const open = path('my.rp.family', req());
    expect([open.status, open.earliestDate]).toEqual(['UNKNOWN', undefined]);
    const met = path('my.rp.family', req('biological'));
    expect([met.status, met.earliestDate]).toEqual(['MET', day]);
  });

  test('children are eligible up to and including age 18', () => {
    const child = (dateOfBirth: string) =>
      cond('my.rp.family', 'my.rp.child-age', {
        ...wife,
        dateOfBirth,
        family: { tie: 'child-of-citizen', childRelation: 'adopted' },
      }).status;
    expect(child('2007-11-25')).toBe('MET');
    expect(child('2007-11-24')).toBe('NOT_MET');
    expect(
      path('my.rp.family', {
        ...wife,
        family: { tie: 'child-of-pr', childRelation: 'adopted' },
      }).status,
    ).toBe('NOT_APPLICABLE');
  });

  test('a husband or wife is warned about the permanent residence count', () => {
    for (const tie of ['husband-of-citizen', 'wife-of-citizen'] as const) {
      const c = cond('my.rp.family', 'my.rp.pr-link', {
        ...wife,
        family: { ...wife.family, tie },
      });
      expect(c.pendingDetails, tie).toEqual(['PD-428']);
    }
  });

  test('a wife or husband now on a Residence Pass is treated alike (review113-1 risk 2)', () => {
    const passes = [
      { kind: 'ltsvp-spouse', from: '2019-01-01', to: '2024-12-31' },
      { kind: 'residence', from: '2025-01-01', to: '2029-12-31' },
    ] satisfies MyFullRequest['passes'];
    const w = cond('my.pr.wife', 'my.pr.spouse-pass', { ...wife, passes });
    expect([w.status, w.pendingDetails]).toEqual(['UNKNOWN', ['PD-428']]);
    const h = cond('my.pr.husband', 'my.pr.spouse-pass', {
      ...wife,
      family: { ...wife.family, tie: 'husband-of-citizen' },
      passes,
    });
    expect([h.status, h.pendingDetails]).toEqual(['UNKNOWN', ['PD-428']]);
    expect(path('my.pr.wife', { ...wife, passes }).timeStatus).toBe('UNKNOWN');
  });

  test('Residence Pass time is pending only when the combined holding is valid and long enough (review113-2 #1)', () => {
    // SRC-505 §5.2(d) p19: five continuous years. 2021-11-24 to 2026-11-24 is
    // exactly five years with the Residence Pass; from 2021-11-25 it is not.
    const husband = (from: string, rpFrom = '2025-11-24') =>
      ({
        ...wife,
        family: {
          ...wife.family,
          tie: 'husband-of-citizen',
          marriedOn: '2020-01-01',
        },
        passes: [
          { kind: 'ltsvp-spouse', from, to: addDays(rpFrom, -1) },
          { kind: 'residence', from: rpFrom, to: '2030-11-23' },
        ],
      }) satisfies MyFullRequest;
    const five = cond(
      'my.pr.husband',
      'my.pr.spouse-pass',
      husband('2021-11-24'),
    );
    expect([five.status, five.pendingDetails]).toEqual(['UNKNOWN', ['PD-428']]);
    // Review example A: three years on the spouse pass and one on a Residence
    // Pass are four years even if both count.
    for (const from of ['2021-11-25', '2022-11-24']) {
      const c = cond('my.pr.husband', 'my.pr.spouse-pass', husband(from));
      expect([c.status, c.pendingDetails], from).toEqual([
        'NOT_MET',
        undefined,
      ]);
      const p = path('my.pr.husband', husband(from));
      expect(p.status, from).toBe('NOT_MET');
      // Whether the Residence Pass counts decides the date (PD-428).
      expect([p.timeStatus, p.timeEarliestDate], from).toEqual([
        'UNKNOWN',
        undefined,
      ]);
    }
    // SRC-505 §5.1(d) p18: more than 12 months and still valid when applying.
    // A Residence Pass from 2025-11-23 exceeds 12 months on 2026-11-24; one
    // from 2025-11-24 does not.
    const wifeOn = (passes: MyFullRequest['passes']) =>
      cond('my.pr.wife', 'my.pr.spouse-pass', { ...wife, passes });
    const rp = (from: string, to: string) => [
      { kind: 'residence' as const, from, to },
    ];
    const over = wifeOn(rp('2025-11-23', '2030-11-22'));
    expect([over.status, over.pendingDetails]).toEqual(['UNKNOWN', ['PD-428']]);
    // Review example B: no valid pass on the application date, or under 12 months.
    for (const passes of [
      rp('2025-01-01', '2025-12-31'),
      rp('2026-06-01', '2031-05-31'),
      rp('2025-11-24', '2030-11-23'),
    ]) {
      const c = wifeOn(passes);
      expect([c.status, c.pendingDetails], passes[0].from).toEqual([
        'NOT_MET',
        undefined,
      ]);
    }
    expect(
      path('my.pr.wife', { ...wife, passes: rp('2025-01-01', '2025-12-31') })
        .timeStatus,
    ).toBe('NOT_MET');
  });
});

describe('citizenship by naturalisation', () => {
  const nat = {
    ...wife,
    passes: [],
    dateOfBirth: '1980-01-01',
    family: { tie: 'none' },
    citizenship: {
      permanentResidentSince: '2016-11-24',
      intendsToResidePermanently: 'yes',
      qualifyingReferees: 2,
      renounceOtherNationality: 'yes',
      completeTravelRecords: true,
      taxReturnsFiveYears: true,
      inFederationOnMerdekaDay: false,
    },
  } satisfies MyFullRequest;
  const residence = (req: MyFullRequest) =>
    cond('my.cit.naturalisation', 'my.cit.residence', req);

  test('ten years of permanent residence meet the residence period', () => {
    expect(residence(nat).status).toBe('MET');
    const p = path('my.cit.naturalisation', nat);
    // Character, Malay and the Government's decision stay open.
    expect(p.status).toBe('UNKNOWN');
    expect(
      p.checks
        .filter((c) => c.kind === 'requirement' && c.status !== 'MET')
        .map((c) => c.id),
    ).toEqual([
      'my.cit.character',
      'my.cit.malay-language',
      'my.cit.discretion',
    ]);
    const late = {
      ...nat,
      citizenship: { ...nat.citizenship, permanentResidentSince: '2016-11-25' },
    };
    expect(residence(late).status).toBe('NOT_MET');
    expect(path('my.cit.naturalisation', late).timeEarliestDate).toBe(
      '2026-11-25',
    );
  });

  test('ten of twelve years: a two-year absence is the most that fits', () => {
    // 2014-11-24 to 2026-11-24 is 4383 days; [2016-01-01, 2018-01-01) is 731
    // days away, leaving 3652, the length of the 10 years before 2026-11-24.
    const away = (returned: string) => ({
      ...nat,
      citizenship: { ...nat.citizenship, permanentResidentSince: '2014-11-24' },
      trips: [{ departed: '2016-01-01', returned }],
    });
    expect(residence(away('2018-01-01')).status).toBe('MET');
    // One day more is met only if the Minister prescribes the reason (s.20(1)(e)).
    expect(residence(away('2018-01-02')).status).toBe('UNKNOWN');
    // One day short until the absence begins to leave the 12-year window.
    expect(
      path('my.cit.naturalisation', away('2018-01-02')).timeEarliestDate,
    ).toBe('2028-01-02');
  });

  test('absences under six months and for health count', () => {
    const trip = (departed: string, returned: string, reason?: 'health') => ({
      ...nat,
      trips: [{ departed, returned, reason }],
    });
    expect(residence(trip('2025-01-01', '2025-06-30')).status).toBe('MET');
    // Exactly six months is not "less than six months" and falls in the last
    // 12 months: without a counted reason it needs the Minister.
    expect(residence(trip('2026-01-01', '2026-07-01')).status).toBe('UNKNOWN');
    expect(residence(trip('2026-01-01', '2026-07-01', 'health')).status).toBe(
      'MET',
    );
  });

  test('time on passes needs the Minister, missing answers stay open', () => {
    const passOnly = residence({
      ...nat,
      citizenship: { ...nat.citizenship, permanentResidentSince: null },
      passes: [{ kind: 'employment', from: '2012-01-01', to: '2027-12-31' }],
    });
    expect([passOnly.status, passOnly.pendingDetails]).toEqual([
      'UNKNOWN',
      ['PD-413', 'PD-429'],
    ]);
    const unanswered = residence({
      ...nat,
      citizenship: { ...nat.citizenship, permanentResidentSince: undefined },
    });
    expect([unanswered.status, unanswered.pendingDetails]).toEqual([
      'UNKNOWN',
      undefined,
    ]);
  });

  test('unanswered absences or passes are not confirmed as none (review113-1 #2, #3)', () => {
    // #2: residence is only met once absences are answered, even as none.
    const noTrips = { ...nat, trips: undefined };
    const open = residence(noTrips);
    expect([open.status, open.pendingDetails]).toEqual(['UNKNOWN', undefined]);
    expect(open.explanation).toContain('未填出境记录');
    expect(path('my.cit.naturalisation', noTrips).timeStatus).toBe('UNKNOWN');
    // Absences can only shorten residence: too little without any is still unmet.
    expect(
      residence({
        ...noTrips,
        citizenship: {
          ...nat.citizenship,
          permanentResidentSince: '2020-01-01',
        },
      }).status,
    ).toBe('NOT_MET');
    // #3: without permanent residence, unanswered passes may hold time the
    // Minister can count (s.20(2)(c)); only confirmed "no passes" fails.
    const noPr = {
      ...nat,
      citizenship: { ...nat.citizenship, permanentResidentSince: null },
    };
    expect(residence({ ...noPr, passes: undefined }).status).toBe('UNKNOWN');
    expect(
      path('my.cit.naturalisation', { ...noPr, passes: undefined }).status,
    ).toBe('UNKNOWN');
    expect(residence(noPr).status).toBe('NOT_MET');
  });

  test('long absences for any other reason need the Minister, as for study (review113-1 #5)', () => {
    // s.20(1)(e): absences for any other reason the Minister prescribes count.
    const away = (reason?: 'other' | 'education') =>
      residence({
        ...nat,
        citizenship: {
          ...nat.citizenship,
          permanentResidentSince: '2016-01-01',
        },
        trips: [{ departed: '2020-01-01', returned: '2021-01-01', reason }],
      });
    for (const reason of ['other', 'education', undefined] as const)
      expect([away(reason).status, away(reason).pendingDetails]).toEqual([
        'UNKNOWN',
        ['PD-413', 'PD-429'],
      ]);
    expect(away('other').explanation).toContain(
      '教育或其他原因须部长批准或指定',
    );
    // Counting the absence does not help when permanent residence is too short.
    expect(
      residence({
        ...nat,
        citizenship: {
          ...nat.citizenship,
          permanentResidentSince: '2020-01-01',
        },
        trips: [
          { departed: '2021-01-01', returned: '2022-01-01', reason: 'other' },
        ],
      }).status,
    ).toBe('NOT_MET');
  });

  test('age 21, intention, referees and renunciation', () => {
    const at = (dateOfBirth: string) =>
      cond('my.cit.naturalisation', 'my.cit.age', { ...nat, dateOfBirth })
        .status;
    expect([at('2005-11-24'), at('2005-11-25')]).toEqual(['MET', 'NOT_MET']);
    const answer = (
      citizenship: Partial<NonNullable<MyFullRequest['citizenship']>>,
    ) => ({
      ...nat,
      citizenship: { ...nat.citizenship, ...citizenship },
    });
    expect(
      cond(
        'my.cit.naturalisation',
        'my.cit.intent',
        answer({ intendsToResidePermanently: 'no' }),
      ).status,
    ).toBe('NOT_MET');
    expect(
      cond(
        'my.cit.naturalisation',
        'my.cit.referees',
        answer({ qualifyingReferees: 1 }),
      ).status,
    ).toBe('NOT_MET');
    expect(
      cond(
        'my.cit.naturalisation',
        'my.cit.renunciation-oath',
        answer({ renounceOtherNationality: 'no' }),
      ).status,
    ).toBe('NOT_MET');
    const unsure = cond(
      'my.cit.naturalisation',
      'my.cit.renunciation-oath',
      answer({ renounceOtherNationality: 'unsure' }),
    );
    expect(unsure.pendingDetails).toEqual(['PD-418']);
  });

  test('fees and the unenforced amendment', () => {
    const fee = (inFederationOnMerdekaDay?: boolean) =>
      cond('my.cit.naturalisation', 'my.cit.certificate-fee', {
        ...nat,
        citizenship: { ...nat.citizenship, inFederationOnMerdekaDay },
      });
    expect(fee(true).fee?.amount).toBe(200);
    expect(fee(false).fee?.amount).toBe(300);
    expect([fee(undefined).fee?.amount, fee(undefined).pendingDetails]).toEqual(
      [300, ['PD-419']],
    );
    const amendment = cond(
      'my.cit.naturalisation',
      'my.cit.constitution-amendment',
      nat,
    );
    expect(amendment.pendingDetails).toEqual(['PD-417']);
    expect(amendment.explanation).toContain('2025-03-20');
  });
});

describe('citizenship by registration', () => {
  const reg = {
    ...wife,
    passes: [],
    citizenship: {
      permanentResidentSince: '2024-11-24',
      intendsToResidePermanently: 'yes',
      renounceOtherNationality: 'yes',
    },
  } satisfies MyFullRequest;

  test('a wife needs two years of residence before applying', () => {
    expect(
      cond('my.cit.wife-registration', 'my.cit.residence', reg).status,
    ).toBe('MET');
    const late = {
      ...reg,
      citizenship: { ...reg.citizenship, permanentResidentSince: '2024-11-25' },
    };
    expect(
      cond('my.cit.wife-registration', 'my.cit.residence', late).status,
    ).toBe('NOT_MET');
    expect(path('my.cit.wife-registration', late).timeEarliestDate).toBe(
      '2026-11-25',
    );
    // Only character remains open: registration is an entitlement.
    const p = path('my.cit.wife-registration', reg);
    expect(
      p.checks
        .filter((c) => c.kind === 'requirement' && c.status !== 'MET')
        .map((c) => c.id),
    ).toEqual(['my.cit.character']);
    expect(p.summary).not.toContain('裁量');
    expect(
      cond('my.cit.wife-registration', 'my.cit.certificate-fee', reg).fee
        ?.amount,
    ).toBe(300);
  });

  test('a reported separation or divorce leaves the marriage open (review113-1 #8)', () => {
    // Art. 15(1) p39: a married woman whose husband is a citizen; SRC-513:
    // "That the marriage is still subsisting".
    const c = cond('my.cit.wife-registration', 'my.cit.category', {
      ...reg,
      family: { ...reg.family, separatedOrDivorced: true },
    });
    expect([c.status, c.pendingDetails]).toEqual(['UNKNOWN', ['PD-405']]);
    expect(c.explanation).toContain('所填已分居或离婚');
    expect(
      cond('my.cit.wife-registration', 'my.cit.category', reg).status,
    ).toBe('MET');
  });

  test('unanswered absences leave the two years open (review113-1 #2)', () => {
    const c = cond('my.cit.wife-registration', 'my.cit.residence', {
      ...reg,
      trips: undefined,
      citizenship: { ...reg.citizenship, permanentResidentSince: '2020-01-01' },
    });
    expect(c.status).toBe('UNKNOWN');
  });

  test('permanent residence runs from the Permit Masuk issue date (review113-1 #4)', () => {
    // Approved 2024-11-24, issued 2025-05-01: until then she was on the
    // spouse pass, which counts only with the Minister's consent.
    const issued = {
      ...reg,
      passes: [{ kind: 'ltsvp-spouse', from: '2022-03-01', to: '2025-04-30' }],
      citizenship: { ...reg.citizenship, permanentResidentSince: '2025-05-01' },
    } satisfies MyFullRequest;
    const c = cond('my.cit.wife-registration', 'my.cit.residence', issued);
    expect([c.status, c.pendingDetails]).toEqual([
      'UNKNOWN',
      ['PD-413', 'PD-418', 'PD-429'],
    ]);
    expect(c.explanation).toContain('Permit Masuk 签发日 2025-05-01');
    const p = path('my.cit.wife-registration', issued);
    expect([p.timeStatus, p.timeEarliestDate]).toEqual([
      'FUTURE',
      '2027-05-01',
    ]);
  });

  test('a long absence needs the Minister; a husband must naturalise', () => {
    expect(
      cond('my.cit.wife-registration', 'my.cit.residence', {
        ...reg,
        trips: [{ departed: '2025-03-01', returned: '2025-09-01' }],
      }).status,
    ).toBe('UNKNOWN');
    expect(
      path('my.cit.wife-registration', {
        ...reg,
        family: { ...reg.family, tie: 'husband-of-citizen' },
      }).status,
    ).toBe('NOT_APPLICABLE');
  });

  test('a citizen’s child registers before 21', () => {
    const child = (dateOfBirth: string) =>
      path('my.cit.child-registration', {
        simulationDate: day,
        dateOfBirth,
        family: { tie: 'child-of-citizen' },
      });
    const young = child('2005-11-25');
    expect(young.status).toBe('UNKNOWN');
    expect(young.checks.find((c) => c.id === 'my.cit.age')?.status).toBe('MET');
    expect(child('2005-11-24').status).toBe('NOT_MET');
    expect(
      young.checks.find((c) => c.id === 'my.cit.certificate-fee')?.fee?.amount,
    ).toBe(100);
  });

  test('registration oaths cite Article 18(1); a child of 18 to 20 takes it (review113-1 suggestion 1)', () => {
    const oath = (id: MyPathwayId, req: MyFullRequest) =>
      cond(id, 'my.cit.renunciation-oath', req);
    expect(oath('my.cit.wife-registration', reg).sources[0]).toEqual({
      srcId: 'SRC-500',
      locator: 'Art. 18(1) p42',
    });
    expect(
      oath('my.cit.naturalisation', { ...reg, family: { tie: 'none' } })
        .sources[0],
    ).toEqual({ srcId: 'SRC-500', locator: 'Art. 19(9) p46' });
    // SRC-500 Art. 18(1) p42: no one aged 18 or over is registered before the oath.
    const child = (dateOfBirth: string, renounceOtherNationality?: 'no') =>
      oath('my.cit.child-registration', {
        simulationDate: day,
        dateOfBirth,
        family: { tie: 'child-of-citizen' },
        citizenship: { renounceOtherNationality },
      });
    expect(child('2008-11-24', 'no').status).toBe('NOT_MET');
    expect(child('2008-11-25').applicable).toBe(false);
  });

  test('wife registration explains the MyPR "mandatori" note (review113-1 suggestion 7)', () => {
    expect(
      cond('my.cit.wife-registration', 'my.cit.residence', reg).explanation,
    ).toContain('注 5');
  });

  test('the amendment notes the 48-month oath and Article 25(2) has both limbs (review113-1 suggestions 8, 9)', () => {
    const amendment = cond(
      'my.cit.child-registration',
      'my.cit.constitution-amendment',
      { simulationDate: day },
    );
    expect(amendment.explanation).toContain('48 个月');
    expect(amendment.sources[0].locator).toContain('s.5 p4');
    expect(
      cond('my.cit.naturalisation', 'my.cit.after-grant', {
        simulationDate: day,
      }).explanation,
    ).toContain('国际组织');
  });
});

describe('deadlines and missing birth dates in the timeline (review113-2 #4)', () => {
  const timeOf = (id: MyPathwayId, req: MyFullRequest) => {
    const p = path(id, req);
    return [p.timeStatus, p.timeEarliestDate];
  };

  test('a citizen’s child past 18 or without a birth date', () => {
    const child = {
      simulationDate: day,
      dateOfBirth: '2008-11-25',
      family: { tie: 'child-of-citizen', childRelation: 'biological' },
      passes: [{ kind: 'student', from: '2024-01-01', to: '2027-12-31' }],
    } satisfies MyFullRequest;
    // Under 18 until 2026-11-24; the pass passed 12 months on 2025-01-02.
    expect(timeOf('my.pr.child', child)).toEqual(['MET', '2025-01-02']);
    // Born 2008-11-24: 18 on the application date, so too late.
    expect(
      timeOf('my.pr.child', { ...child, dateOfBirth: '2008-11-24' }),
    ).toEqual(['NOT_MET', undefined]);
    expect(timeOf('my.pr.child', { ...child, dateOfBirth: undefined })).toEqual(
      ['UNKNOWN', undefined],
    );
  });

  test('a Residence Pass child is 18 or under until the 19th birthday', () => {
    // SRC-508: "aged 18 and below"; Category 3 needs three years on a pass.
    const child = (dateOfBirth: string | undefined, from = '2020-01-01') =>
      ({
        simulationDate: day,
        dateOfBirth,
        family: { tie: 'child-of-citizen' },
        passes: [{ kind: 'ltsvp-other', from, to: '2029-12-31' }],
      }) satisfies MyFullRequest;
    expect(timeOf('my.rp.family', child('2007-11-25'))).toEqual([
      'MET',
      '2023-01-01',
    ]);
    // 19 on 2026-11-24, and 25 years old.
    for (const dob of ['2007-11-24', '2001-01-01'])
      expect(timeOf('my.rp.family', child(dob)), dob).toEqual([
        'NOT_MET',
        undefined,
      ]);
    // Born 2009-01-01, 19 on 2028-01-01: three years from 2024-12-31 end the
    // day before, from 2025-01-01 on the birthday itself.
    expect(timeOf('my.rp.family', child('2009-01-01', '2024-12-31'))).toEqual([
      'FUTURE',
      '2027-12-31',
    ]);
    expect(timeOf('my.rp.family', child('2009-01-01', '2025-01-01'))).toEqual([
      'NOT_MET',
      undefined,
    ]);
    expect(timeOf('my.rp.family', child(undefined))).toEqual([
      'UNKNOWN',
      undefined,
    ]);
  });

  test('a REP approval letter that has expired or is not entered', () => {
    // SRC-506 §5.4 p17: apply while the approval letter is valid.
    const rep = (approvalLetterValidUntil?: string) =>
      ({
        simulationDate: day,
        family: { marriedOn: '2020-01-01', separatedOrDivorced: false },
        rep: {
          relation: 'wife',
          participantHasSatk: true,
          approvalLetterValidUntil,
        },
      }) satisfies MyFullRequest;
    expect(timeOf('my.pr.rep-family', rep(day))).toEqual(['MET', '2023-01-01']);
    for (const until of ['2026-11-23', '2025-01-01'])
      expect(timeOf('my.pr.rep-family', rep(until)), until).toEqual([
        'NOT_MET',
        undefined,
      ]);
    expect(timeOf('my.pr.rep-family', rep())).toEqual(['UNKNOWN', undefined]);
  });

  test('naturalisation without a birth date has no earliest date', () => {
    const nat = (permanentResidentSince: string | null) =>
      ({
        simulationDate: day,
        passes: [],
        trips: [],
        citizenship: { permanentResidentSince },
      }) satisfies MyFullRequest;
    for (const since of ['2016-11-24', '2020-01-01'])
      expect(timeOf('my.cit.naturalisation', nat(since)), since).toEqual([
        'UNKNOWN',
        undefined,
      ]);
    // Residence can never be met without permanent residence or passes.
    expect(timeOf('my.cit.naturalisation', nat(null))).toEqual([
      'NOT_MET',
      undefined,
    ]);
  });
});

describe('citizenship timelines and oaths (review113-2 risks 1, 3)', () => {
  const timeOf = (id: MyPathwayId, req: MyFullRequest) => {
    const p = path(id, req);
    return [p.timeStatus, p.timeEarliestDate];
  };

  test('the search reaches a late 21st birthday or a planned permanent residence', () => {
    // Born 2018-01-01, 21 on 2039-01-01, with permanent residence since 2020.
    expect(
      timeOf('my.cit.naturalisation', {
        simulationDate: day,
        dateOfBirth: '2018-01-01',
        passes: [],
        trips: [],
        citizenship: { permanentResidentSince: '2020-01-01' },
      }),
    ).toEqual(['FUTURE', '2039-01-01']);
    const wifeReg = (
      permanentResidentSince: string,
      trips: MyFullRequest['trips'] = [],
    ) =>
      timeOf('my.cit.wife-registration', {
        ...wife,
        passes: [],
        trips,
        citizenship: { permanentResidentSince },
      });
    // Issued 2027-06-01: two years throughout on 2029-06-01.
    expect(wifeReg('2027-06-01')).toEqual(['FUTURE', '2029-06-01']);
    expect(
      timeOf('my.cit.naturalisation', {
        simulationDate: day,
        dateOfBirth: '1980-01-01',
        passes: [],
        trips: [],
        citizenship: { permanentResidentSince: '2027-06-01' },
      }),
    ).toEqual(['FUTURE', '2037-06-01']);
    // Abroad for another reason from 2026-06-01 until 2027-12-01: two years
    // throughout again from 2029-12-01, past the old two-year window.
    expect(
      wifeReg('2020-01-01', [
        { departed: '2026-06-01', returned: '2027-12-01', reason: 'other' },
      ]),
    ).toEqual(['FUTURE', '2029-12-01']);
  });

  test('without a birth date a registration oath is not known to be needed', () => {
    // SRC-500 Art. 18(1) p42: only those aged 18 or over take the oath.
    const oath = (id: MyPathwayId, family: MyFullRequest['family']) =>
      cond(id, 'my.cit.renunciation-oath', {
        simulationDate: day,
        family,
        citizenship: { renounceOtherNationality: 'no' },
      });
    for (const [id, tie] of [
      ['my.cit.child-registration', 'child-of-citizen'],
      ['my.cit.wife-registration', 'wife-of-citizen'],
    ] as const) {
      const c = oath(id, { tie });
      expect([c.status, c.pendingDetails], id).toEqual(['UNKNOWN', undefined]);
      expect(c.explanation, id).toContain('未填生日');
    }
    // Naturalisation always needs the oath (Art. 19(9)).
    expect(oath('my.cit.naturalisation', { tie: 'none' }).status).toBe(
      'NOT_MET',
    );
  });
});

describe('a subsisting marriage across the spouse pathways (review113-2 risk 4)', () => {
  const as = (separatedOrDivorced?: boolean) => ({
    ...wife,
    family: { ...wife.family, separatedOrDivorced },
  });

  test('registration, the spouse pass, REP and the Residence Pass need the answer', () => {
    // A divorce ends the marriage, a separation does not (SRC-500 Art. 15(1)
    // p39; SRC-509 "Husband / Wife to Citizen" affidavit; SRC-506 §4(a) p16;
    // SRC-508 Category 3).
    const cases: [MyPathwayId, string, Partial<MyFullRequest>][] = [
      ['my.cit.wife-registration', 'my.cit.category', {}],
      ['my.pass.spouse-ltsvp', 'my.pass.category', {}],
      [
        'my.pr.rep-family',
        'my.pr.category',
        { rep: { relation: 'wife', participantHasSatk: true } },
      ],
      ['my.rp.family', 'my.rp.category', {}],
    ];
    for (const [id, key, extra] of cases) {
      const at = (s?: boolean) => cond(id, key, { ...as(s), ...extra });
      expect(at(false).status, id).toBe('MET');
      expect([at(true).status, at(true).pendingDetails], id).toEqual([
        'UNKNOWN',
        ['PD-405'],
      ]);
      expect([at().status, at().pendingDetails], id).toEqual([
        'UNKNOWN',
        undefined,
      ]);
      expect(at().explanation, id).toContain('未填是否已分居或离婚');
    }
  });

  test('permanent residence as a spouse has no date without the answer', () => {
    // SRC-505 §5.1(c) p18: three years "tanpa berpisah atau bercerai".
    const p = path('my.pr.wife', as());
    expect(
      p.checks.find((c) => c.id === 'my.pr.marriage-duration')?.status,
    ).toBe('UNKNOWN');
    expect([p.timeStatus, p.timeEarliestDate]).toEqual(['UNKNOWN', undefined]);
    expect(path('my.pr.wife', as(false)).timeStatus).toBe('MET');
    expect(path('my.pr.wife', as(true)).timeStatus).toBe('NOT_MET');
  });
});

describe('boundary pending details only on the boundary (review113-2 suggestion 2)', () => {
  test('PD-405 and PD-430 are not attached to missing answers', () => {
    const category = cond('my.cit.wife-registration', 'my.cit.category', {
      simulationDate: day,
    });
    expect([category.status, category.pendingDetails]).toEqual([
      'UNKNOWN',
      undefined,
    ]);
    const registration = (marriageRegistration?: 'foreign-only') =>
      cond('my.pr.wife', 'my.pr.marriage-registration', {
        simulationDate: day,
        family: { marriageRegistration },
      }).pendingDetails;
    expect([registration(), registration('foreign-only')]).toEqual([
      undefined,
      ['PD-405'],
    ]);
    const age = (dateOfBirth?: string) =>
      cond('my.pass.de-rantau', 'my.pass.age', {
        simulationDate: day,
        dateOfBirth,
      }).pendingDetails;
    expect([age(), age('2008-11-24')]).toEqual([undefined, ['PD-430']]);
  });
});

describe('no earliest date while no pass is held (review113-3 #1, risk 4)', () => {
  // Break 2026-01-01..2026-05-31 (151 days, within six months) before a pass
  // entered from 2026-06-01. From 2020-10-01 to 2026-06-01 is 2069 days;
  // less the break, 1918 exceed the 1826 days from 2021-06-01, so five years
  // are held on 2026-06-01 and on no day of the break (SRC-505 §5.2(d) p19,
  // §5.4(b) p21: a valid pass on the application date).
  const passes = (kind: 'employment' | 'ltsvp-spouse', from = '2020-10-01') => [
    { kind, from, to: '2025-12-31' },
    { kind, from: '2026-06-01', to: '2028-12-31' },
  ];
  const was = (simulationDate: string, from?: string) =>
    ({
      simulationDate,
      family: { tie: 'none' },
      passes: passes('employment', from),
    }) satisfies MyFullRequest;
  const husband = (simulationDate: string, from?: string) =>
    ({
      simulationDate,
      family: {
        tie: 'husband-of-citizen',
        marriedOn: '2015-01-01',
        marriageRegistration: 'malaysia',
        separatedOrDivorced: false,
      },
      passes: passes('ltsvp-spouse', from),
    }) satisfies MyFullRequest;
  const at = (id: MyPathwayId, key: string, req: MyFullRequest) => {
    const p = path(id, req);
    return [
      p.checks.find((c) => c.id === key)?.status,
      p.timeStatus,
      p.timeEarliestDate,
    ];
  };

  test('inside the break the date is the next pass, not a day of the break', () => {
    for (const [date, from] of [
      ['2026-02-01', undefined],
      ['2026-03-01', undefined],
      ['2026-02-01', '2020-01-01'],
    ] as const) {
      expect(
        at('my.pr.was', 'my.pr.qualifying-pass', was(date, from)),
        date,
      ).toEqual(['NOT_MET', 'FUTURE', '2026-06-01']);
      expect(
        at('my.pr.husband', 'my.pr.spouse-pass', husband(date, from)),
        date,
      ).toEqual(['NOT_MET', 'FUTURE', '2026-06-01']);
    }
  });

  test('back on a pass after the break, the date is when holding resumed', () => {
    expect(at('my.pr.was', 'my.pr.qualifying-pass', was('2026-06-15'))).toEqual(
      ['MET', 'MET', '2026-06-01'],
    );
    expect(
      at('my.pr.husband', 'my.pr.spouse-pass', husband('2026-06-15')),
    ).toEqual(['MET', 'MET', '2026-06-01']);
  });
});

describe('Residence Pass years need the category (review113-3 #2)', () => {
  // SRC-508: Category 3 needs three years on a long-term pass, Category 4
  // five, Category 5 no stated period; all need a valid pass when applying.
  const rp = (passes: MyFullRequest['passes'], tie?: 'former-citizen') => {
    const p = path('my.rp.family', {
      simulationDate: day,
      family: { tie },
      passes,
    });
    const c = p.checks.find((x) => x.id === 'my.rp.long-term-pass');
    return [c?.status, p.timeStatus, p.timeEarliestDate];
  };

  test('without the relationship there is no date', () => {
    expect(
      rp([{ kind: 'ltsvp-spouse', from: '2026-06-01', to: '2028-12-31' }]),
    ).toEqual(['UNKNOWN', 'UNKNOWN', undefined]);
    // No pass valid on the date fails every category; the date of the later
    // pass depends on the category.
    expect(
      rp([{ kind: 'employment', from: '2027-01-01', to: '2029-12-31' }]),
    ).toEqual(['NOT_MET', 'UNKNOWN', undefined]);
    expect(rp([])).toEqual(['NOT_MET', 'NOT_MET', undefined]);
    expect(rp(undefined)).toEqual(['UNKNOWN', 'UNKNOWN', undefined]);
  });

  test('a former citizen still needs only a valid pass', () => {
    expect(
      rp(
        [{ kind: 'ltsvp-spouse', from: '2026-06-01', to: '2028-12-31' }],
        'former-citizen',
      ),
    ).toEqual(['MET', 'MET', day]);
    expect(
      rp(
        [{ kind: 'employment', from: '2027-01-01', to: '2029-12-31' }],
        'former-citizen',
      ),
    ).toEqual(['NOT_MET', 'FUTURE', '2027-01-01']);
  });
});

describe('timing agrees with the pass held on every date (review113-3)', () => {
  // Seeded pass histories with breaks under, at and over six months, passes
  // entered for later, and dates before, inside and after each pass and
  // inside each break.
  let seed = 113;
  const rand = (n: number) => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return Math.floor((seed / 2147483648) * n);
  };
  const histories = Array.from({ length: 60 }, () => {
    let from = addDays('2016-01-01', rand(3650));
    return Array.from({ length: 1 + rand(3) }, () => {
      const to = addDays(from, 60 + rand(2400));
      const gap = [0, 1 + rand(200), 182, 183, 184, 200 + rand(700)][rand(6)];
      const span = { from, to, next: addDays(to, 1 + gap) };
      from = span.next;
      return span;
    });
  });
  // A marriage date anywhere around the passes, for the spouse categories.
  const married = histories.map(() => addDays('2014-01-01', rand(5000)));
  const datesFor = (h: { from: string; to: string; next: string }[]) => [
    addDays(h[0].from, -30),
    ...h.flatMap((s) => [
      s.from,
      addDays(s.to, -1),
      s.to,
      addDays(s.to, 1),
      addDays(
        s.to,
        Math.floor((Date.parse(s.next) - Date.parse(s.to)) / 2 / 864e5),
      ),
    ]),
    addDays(h[0].from, rand(4000)),
  ];
  const routes: {
    id: MyPathwayId;
    key: string;
    kind: 'employment' | 'ltsvp-spouse';
    req: Partial<MyFullRequest>;
    years?: boolean;
    /** The marriage date is also a time condition. */
    married?: boolean;
  }[] = [
    {
      id: 'my.pr.was',
      key: 'my.pr.qualifying-pass',
      kind: 'employment',
      req: { family: { tie: 'none' } },
    },
    ...(['husband', 'wife'] as const).flatMap((s) =>
      [false, true].map((married) => ({
        id: `my.pr.${s}` as const,
        key: 'my.pr.spouse-pass',
        kind: 'ltsvp-spouse' as const,
        req: {
          family: {
            tie: `${s}-of-citizen` as const,
            marriedOn: '2000-01-01',
            marriageRegistration: 'malaysia' as const,
            separatedOrDivorced: false,
          },
        },
        married,
      })),
    ),
    ...(['parent-of-citizen', 'spouse-of-pr', 'former-citizen'] as const).map(
      (tie) => ({
        id: 'my.rp.family' as const,
        key: 'my.rp.long-term-pass',
        kind: 'employment' as const,
        req: { family: { tie, separatedOrDivorced: false } },
        years: tie !== 'former-citizen',
      }),
    ),
    {
      id: 'my.pass.rpt',
      key: 'my.pass.work-years',
      kind: 'employment',
      req: {},
    },
  ];
  const run = (
    r: (typeof routes)[number],
    passes: MyFullRequest['passes'],
    simulationDate: string,
    marriedOn = '2000-01-01',
  ) => {
    const p = path(r.id, {
      simulationDate,
      passes,
      ...r.req,
      family: { ...r.req.family, marriedOn },
    });
    const status = (id: string) => p.checks.find((c) => c.id === id)!.status;
    return {
      check:
        r.married && status('my.pr.marriage-duration') !== 'MET'
          ? 'NOT_MET'
          : status(r.key),
      time: p.timeStatus,
      date: p.timeEarliestDate,
      assumptions: p.assumptions,
    };
  };

  test('met only when the pass condition is met, and no date without a pass', () => {
    histories.forEach((h, i) => {
      for (const r of routes) {
        const passes = h.map((s) => ({ kind: r.kind, from: s.from, to: s.to }));
        const end = h[h.length - 1].to;
        const held = (d: string) => h.some((s) => s.from <= d && d <= s.to);
        const on = r.married ? married[i] : undefined;
        for (const d of datesFor(h)) {
          const at = run(r, passes, d, on);
          const label = `${r.id} ${r.req.family?.tie ?? ''} ${on ?? ''} ${d} ${JSON.stringify(h)}`;
          expect(at.time === 'MET', label).toBe(at.check === 'MET');
          if (at.date === undefined) continue;
          if (!held(at.date)) {
            // Only past the last pass, and then renewal is assumed.
            expect(
              [at.time, at.date > end, at.assumptions.length],
              label,
            ).toEqual(['FUTURE', true, 1]);
            continue;
          }
          const then = run(r, passes, at.date, on);
          expect([then.check, then.time, then.date], label).toEqual([
            'MET',
            'MET',
            at.date,
          ]);
          if (r.years !== false) {
            const before = run(r, passes, addDays(at.date, -1), on);
            expect([before.time, before.date], label).toEqual([
              'FUTURE',
              at.date,
            ]);
          }
        }
      }
    });
  });

  test('without the Residence Pass category only "no pass now or later" is certain', () => {
    const r = {
      id: 'my.rp.family',
      key: 'my.rp.long-term-pass',
      kind: 'employment',
      req: {},
    } as const;
    for (const h of histories) {
      const passes = h.map((s) => ({ kind: r.kind, from: s.from, to: s.to }));
      for (const d of datesFor(h)) {
        const at = run(r, passes, d);
        const now = h.some((s) => s.from <= d && d <= s.to);
        const later = h.some((s) => d <= s.to);
        expect(
          [at.check, at.time, at.date],
          `${d} ${JSON.stringify(h)}`,
        ).toEqual([
          now ? 'UNKNOWN' : 'NOT_MET',
          later ? 'UNKNOWN' : 'NOT_MET',
          undefined,
        ]);
      }
    }
  });
});

describe('review113-3 risks and suggestions', () => {
  const spouse = (from: string, to: string) => ({
    kind: 'ltsvp-spouse' as const,
    from,
    to,
  });

  test('a later marriage anniversary is checked against the passes entered (risk 2)', () => {
    const at = (
      route: 'wife' | 'husband',
      marriedOn: string,
      passes: MyFullRequest['passes'],
    ) => {
      const p = path(`my.pr.${route}`, {
        simulationDate: day,
        family: {
          tie: `${route}-of-citizen`,
          marriedOn,
          marriageRegistration: 'malaysia',
          separatedOrDivorced: false,
        },
        passes,
      });
      return [p.timeStatus, p.timeEarliestDate, p.assumptions.length];
    };
    // Three years from 2025-01-01 end on 2028-01-01, after the pass ends on
    // 2027-06-30, so renewal is assumed (SRC-505 §5.1(c)–(d) p18).
    expect(
      at('wife', '2025-01-01', [spouse('2025-01-01', '2027-06-30')]),
    ).toEqual(['FUTURE', '2028-01-01', 1]);
    // A pass entered from 2027-10-01 instead: more than 12 months on it from
    // 2028-10-02.
    expect(
      at('wife', '2025-01-01', [
        spouse('2025-01-01', '2027-06-30'),
        spouse('2027-10-01', '2030-12-31'),
      ]),
    ).toEqual(['FUTURE', '2028-10-02', 0]);
    // Five years from 2023-01-01 end on 2028-01-01, inside the 123-day break
    // 2027-10-01..2028-01-31 (SRC-505 §5.2(c)–(d) p19). Holding resumes on
    // 2028-02-01: 2953 days since 2020-01-01 less 123 exceed 1826.
    expect(
      at('husband', '2023-01-01', [
        spouse('2020-01-01', '2027-09-30'),
        spouse('2028-02-01', '2032-12-31'),
      ]),
    ).toEqual(['FUTURE', '2028-02-01', 0]);
  });

  test('MM2H insurance without a birth date is open (risk 1)', () => {
    // SRC-520 p12: insurance "for applicants aged 60 and below".
    const insurance = (dateOfBirth?: string) =>
      cond('my.pass.mm2h', 'my.pass.medical-insurance', {
        simulationDate: day,
        dateOfBirth,
        mm2h: { healthInsurance: false },
      });
    expect(insurance().status).toBe('UNKNOWN');
    expect(insurance().explanation).toContain('未填生日');
    expect(
      [insurance('1966-11-24'), insurance('1965-11-24')].map((c) => c.status),
    ).toEqual(['NOT_MET', 'MET']);
  });

  test('no permanent residence and no passes fail the timeline whatever the absences (risk 3)', () => {
    for (const id of [
      'my.cit.naturalisation',
      'my.cit.wife-registration',
    ] as const) {
      const at = (permanentResidentSince: string | null) => {
        const p = path(id, {
          simulationDate: day,
          dateOfBirth: '1980-01-01',
          family: { tie: 'wife-of-citizen', marriageRegistration: 'malaysia' },
          citizenship: { permanentResidentSince },
          passes: [],
        });
        return [
          p.checks.find((c) => c.id === 'my.cit.residence')?.status,
          p.timeStatus,
        ];
      };
      expect(at(null), id).toEqual(['NOT_MET', 'NOT_MET']);
      // With permanent residence the absences decide.
      expect(at('2010-01-01'), id).toEqual(['UNKNOWN', 'UNKNOWN']);
    }
  });
});

describe('29 February birthdays (review113-1 #10)', () => {
  test('earliest dates and deadlines follow the age in full years', () => {
    // Born 2004-02-29: 20 on 2025-02-28, 21 on 2025-03-01.
    const nat = {
      simulationDate: '2025-01-01',
      dateOfBirth: '2004-02-29',
      passes: [],
      trips: [],
      citizenship: { permanentResidentSince: '2010-01-01' },
    } satisfies MyFullRequest;
    const p = path('my.cit.naturalisation', nat);
    expect([p.timeStatus, p.timeEarliestDate]).toEqual([
      'FUTURE',
      '2025-03-01',
    ]);
    const feb28 = path('my.cit.naturalisation', {
      ...nat,
      simulationDate: '2025-02-28',
    });
    expect(feb28.checks.find((c) => c.id === 'my.cit.age')?.status).toBe(
      'NOT_MET',
    );
    expect(feb28.timeStatus).toBe('FUTURE');
    const mar1 = path('my.cit.naturalisation', {
      ...nat,
      simulationDate: '2025-03-01',
    });
    expect(mar1.checks.find((c) => c.id === 'my.cit.age')?.status).toBe('MET');
    expect(mar1.timeStatus).toBe('MET');
    // Under 18 up to 2026-02-28, so the deadline is 2026-03-01.
    const child = cond('my.pr.child', 'my.pr.child-age', {
      simulationDate: '2026-02-28',
      dateOfBirth: '2008-02-29',
      family: { tie: 'child-of-citizen' },
    });
    expect(child.status).toBe('MET');
    expect(child.explanation).toContain('须在 2026-03-01 之前递交');
    const registration = cond('my.cit.child-registration', 'my.cit.age', {
      simulationDate: '2025-02-28',
      dateOfBirth: '2004-02-29',
      family: { tie: 'child-of-citizen' },
    });
    expect(registration.status).toBe('MET');
    expect(registration.explanation).toContain('须在 2025-03-01 之前递交');
  });
});

describe('long-term passes', () => {
  test('spouse LTSVP and its security bond', () => {
    expect(path('my.pass.spouse-ltsvp', wife).status).toBe('MET');
    const bond = (nationality: string) =>
      cond('my.pass.spouse-ltsvp', 'my.pass.security-bond', {
        ...wife,
        nationality,
      });
    expect(bond('US').fee?.amount).toBe(2000);
    expect(bond('DE').fee?.amount).toBe(1500);
    expect(bond('ID').fee?.amount).toBe(500);
    // The Immigration page lists Japan, South Korea, Macao and Hong Kong under
    // RM1,000 and RM750 and omits the seven countries MDEC's table puts at
    // RM750 (review113-1 #6).
    for (const n of ['JP', 'HK', 'IN', 'BD', 'PK', 'PH', 'MM', 'LK', 'NP'])
      expect([bond(n).status, bond(n).fee, bond(n).pendingDetails], n).toEqual([
        'UNKNOWN',
        undefined,
        ['PD-411'],
      ]);
    expect(bond('IN').explanation).toContain('MDEC');
    expect(
      cond('my.pass.spouse-ltsvp', 'my.pass.security-bond', {
        ...wife,
        nationality: 'IN',
        locale: 'en',
      }).explanation,
    ).toContain('the amount needs confirmation');
    expect(
      path('my.pass.spouse-ltsvp', { ...wife, family: { tie: 'none' } }).status,
    ).toBe('NOT_APPLICABLE');
  });

  const mm2h = {
    simulationDate: day,
    dateOfBirth: '1985-01-01',
    mm2h: {
      category: 'platinum',
      fromCountryWithDiplomaticRelations: true,
      viaLicensedOperator: true,
      fixedDepositUsd: 1_000_000,
      propertyValueRm: 2_000_000,
      daysPerYear: 90,
      goodConductCertificates: true,
      healthInsurance: true,
      dependants: 2,
    },
  } satisfies MyFullRequest;
  const m = (
    patch: Partial<NonNullable<MyFullRequest['mm2h']>>,
    dateOfBirth: string = mm2h.dateOfBirth,
  ) => ({
    ...mm2h,
    dateOfBirth,
    mm2h: { ...mm2h.mm2h, ...patch },
  });

  test('MM2H Platinum at each threshold', () => {
    expect(path('my.pass.mm2h', mm2h).status).toBe('MET');
    expect(
      cond(
        'my.pass.mm2h',
        'my.pass.fixed-deposit',
        m({ fixedDepositUsd: 999_999 }),
      ).status,
    ).toBe('NOT_MET');
    expect(
      cond(
        'my.pass.mm2h',
        'my.pass.property',
        m({ propertyValueRm: 1_999_999 }),
      ).status,
    ).toBe('NOT_MET');
    expect(
      cond('my.pass.mm2h', 'my.pass.minimum-stay', m({ daysPerYear: 89 }))
        .status,
    ).toBe('NOT_MET');
    expect(
      cond('my.pass.mm2h', 'my.pass.age', m({}, '2001-11-25')).status,
    ).toBe('NOT_MET');
    expect(
      cond('my.pass.mm2h', 'my.pass.participation-fee', mm2h).fee?.amount,
    ).toBe(200_000);
    expect(cond('my.pass.mm2h', 'my.pass.pass-fees', mm2h).fee?.amount).toBe(
      10_000,
    );
    expect(cond('my.pass.mm2h', 'my.pass.system-fee', mm2h).fee?.amount).toBe(
      500,
    );
  });

  test('MM2H SEZ deposits by age, open property price and older applicants', () => {
    const sez = (dateOfBirth: string, fixedDepositUsd: number) =>
      cond(
        'my.pass.mm2h',
        'my.pass.fixed-deposit',
        m({ category: 'sez', fixedDepositUsd }, dateOfBirth),
      ).status;
    expect(sez('1976-11-24', 32_000)).toBe('MET');
    expect(sez('1976-11-25', 32_000)).toBe('NOT_MET');
    expect(sez('1976-11-25', 65_000)).toBe('MET');
    expect(sez('2005-11-25', 65_000)).toBe('MET');
    const property = cond(
      'my.pass.mm2h',
      'my.pass.property',
      m({ category: 'sez' }),
    );
    expect([property.status, property.pendingDetails]).toEqual([
      'UNKNOWN',
      ['PD-423'],
    ]);
    // From 50 only the website waives the stay (review113-1 risk 5); over
    // 60 no insurance.
    const stay = (daysPerYear?: number) =>
      cond(
        'my.pass.mm2h',
        'my.pass.minimum-stay',
        m({ daysPerYear }, '1976-11-24'),
      );
    expect([stay(0).status, stay(0).pendingDetails]).toEqual([
      'UNKNOWN',
      ['PD-420'],
    ]);
    expect(stay(undefined).status).toBe('UNKNOWN');
    expect(stay(90).status).toBe('MET');
    expect(
      cond(
        'my.pass.mm2h',
        'my.pass.medical-insurance',
        m({ healthInsurance: false }, '1965-11-23'),
      ).status,
    ).toBe('MET');
    expect(
      cond(
        'my.pass.mm2h',
        'my.pass.medical-insurance',
        m({ healthInsurance: false }),
      ).status,
    ).toBe('NOT_MET');
  });

  test('MM2H issue and annual pass fees are separate (review113-1 suggestions 3, 6)', () => {
    const issue = cond('my.pass.mm2h', 'my.pass.pass-fees', mm2h);
    // P.U. (A) 56/2022: RM5,000 + 2 × RM2,500 per issue.
    expect([issue.title, issue.fee?.amount]).toEqual(['签发处理费', 10_000]);
    // RM500 a year each for the main applicant and two dependants.
    expect(cond('my.pass.mm2h', 'my.pass.annual-fee', mm2h).fee?.amount).toBe(
      1_500,
    );
    expect(
      cond('my.pass.mm2h', 'my.pass.dependants', mm2h).explanation,
    ).toContain('tidak bekerja atau tidak berkahwin di Malaysia');
  });

  test('MM2H PD-422 sits on the renewal fee only (review113-2 suggestion 4)', () => {
    // P.U. (A) 56/2022 fixes the issue and annual fees per person; SRC-517
    // p6 gives the renewal fee "untuk prinsipal dan tanggungan".
    for (const key of ['my.pass.pass-fees', 'my.pass.annual-fee']) {
      expect(cond('my.pass.mm2h', key, mm2h).status, key).toBe('MET');
      const open = cond('my.pass.mm2h', key, m({ dependants: undefined }));
      expect([open.status, open.pendingDetails], key).toEqual([
        'UNKNOWN',
        undefined,
      ]);
      expect(open.explanation, key).toContain('未填受养人人数');
    }
    const term = cond('my.pass.mm2h', 'my.pass.term', mm2h);
    expect([term.status, term.pendingDetails]).toEqual(['UNKNOWN', ['PD-422']]);
    expect(term.explanation).toContain('untuk prinsipal dan tanggungan');
    // SRC-520 p12 asks only for worldwide cover, with no minimum written.
    const insurance = cond('my.pass.mm2h', 'my.pass.medical-insurance', mm2h);
    expect(insurance.status).toBe('MET');
    expect(insurance.explanation).toContain('未写最低保额');
  });

  test('MM2H 90 days a year meet the stay at any age (review113-2 risk 6)', () => {
    // SRC-517 p3: 90 days a year; only the exemption from 50 is in doubt.
    const stay = (daysPerYear: number) =>
      cond('my.pass.mm2h', 'my.pass.minimum-stay', {
        ...m({ daysPerYear }),
        dateOfBirth: undefined,
      }).status;
    expect([stay(90), stay(89)]).toEqual(['MET', 'UNKNOWN']);
  });

  test('MM2H system fee only from August 2025', () => {
    expect(
      cond('my.pass.mm2h', 'my.pass.system-fee', {
        ...mm2h,
        applicationDate: '2025-07-31',
      }).fee,
    ).toBeUndefined();
  });

  const rpt = {
    simulationDate: day,
    passes: [{ kind: 'employment', from: '2023-11-24', to: '2027-02-25' }],
    work: { basicMonthlySalaryRm: 15_000 },
    rpt: { taxYearsPaid: 2, qualification: true, totalExperienceYears: 5 },
  } satisfies MyFullRequest;

  test('RP-T at each threshold', () => {
    expect(path('my.pass.rpt', rpt).status).toBe('MET');
    expect(
      cond('my.pass.rpt', 'my.pass.salary', {
        ...rpt,
        work: { basicMonthlySalaryRm: 14_999 },
      }).status,
    ).toBe('NOT_MET');
    const pass = (from: string, to: string) =>
      path('my.pass.rpt', {
        ...rpt,
        passes: [{ kind: 'employment', from, to }],
      });
    expect(pass('2023-11-25', '2027-02-25').status).toBe('NOT_MET');
    // More than three months of validity left: 2027-02-24 is exactly three.
    expect(
      pass('2023-11-24', '2027-02-24').checks.find(
        (c) => c.id === 'my.pass.ep-validity',
      )?.status,
    ).toBe('NOT_MET');
    expect(cond('my.pass.rpt', 'my.pass.fee', rpt).pendingDetails).toEqual([
      'PD-425',
    ]);
  });

  test('the Employment Pass is found among overlapping passes (review113-1 risk 1)', () => {
    const req = {
      ...rpt,
      passes: [
        { kind: 'dependant', from: '2020-01-01', to: '2028-12-31' },
        { kind: 'employment', from: '2021-01-01', to: '2028-12-31' },
      ],
    } satisfies MyFullRequest;
    expect(cond('my.pass.rpt', 'my.pass.ep-validity', req).status).toBe('MET');
    expect(path('my.pass.rpt', req).status).toBe('MET');
  });

  test('three years of work on other passes are pending (review113-1 risk 3)', () => {
    // SRC-525 says "worked in Malaysia", not "held an Employment Pass".
    const before = (from: string) =>
      cond('my.pass.rpt', 'my.pass.work-years', {
        ...rpt,
        passes: [
          { kind: 'ltsvp-spouse', from, to: '2024-06-30' },
          { kind: 'employment', from: '2024-07-01', to: '2028-12-31' },
        ],
      });
    expect([
      before('2023-11-24').status,
      before('2023-11-24').pendingDetails,
    ]).toEqual(['UNKNOWN', ['PD-431']]);
    expect(before('2023-11-25').status).toBe('NOT_MET');
  });

  test('RP-T met on the Employment Pass alone has no pending note (review113-2 suggestion 1)', () => {
    const c = cond('my.pass.rpt', 'my.pass.work-years', {
      ...rpt,
      passes: [
        { kind: 'dependant', from: '2018-01-01', to: '2021-06-30' },
        { kind: 'employment', from: '2021-07-01', to: '2028-12-31' },
      ],
    });
    expect(c.status).toBe('MET');
    expect(c.explanation).not.toContain('待确认');
  });

  test('PVIP has no official parameters', () => {
    const p = path('my.pass.pvip', { simulationDate: day });
    expect(p.status).toBe('UNKNOWN');
    expect(p.pendingDetails).toEqual(['PD-424']);
  });

  const nomad = {
    simulationDate: day,
    dateOfBirth: '2000-01-01',
    nationality: 'GB',
    passportExpiry: '2028-01-25',
    deRantau: {
      talent: 'tech',
      annualIncomeUsd: 36_001,
      workType: 'remote-employee',
      employerRegisteredInMalaysia: false,
      contractStart: '2026-08-24',
      dependants: 1,
    },
  } satisfies MyFullRequest;
  const n = (
    patch: Partial<NonNullable<MyFullRequest['deRantau']>>,
    extra: Partial<MyFullRequest> = {},
  ) => ({
    ...nomad,
    ...extra,
    deRantau: { ...nomad.deRantau, ...patch },
  });

  test('DE Rantau at each threshold', () => {
    expect(path('my.pass.de-rantau', nomad).status).toBe('MET');
    expect(
      cond(
        'my.pass.de-rantau',
        'my.pass.income',
        n({ annualIncomeUsd: 35_999 }),
      ).status,
    ).toBe('NOT_MET');
    // Before version 11 the tech threshold was lower.
    expect(
      cond(
        'my.pass.de-rantau',
        'my.pass.income',
        n({ annualIncomeUsd: 24_001 }, { applicationDate: '2026-10-31' }),
      ).status,
    ).toBe('MET');
    // Exactly the threshold: "minimum" in Section A, ">" in Section B
    // (review113-1 risk 6).
    for (const [talent, annualIncomeUsd, applicationDate] of [
      ['tech', 36_000, day],
      ['non-tech', 60_000, day],
      ['tech', 24_000, '2026-10-31'],
    ] as const) {
      const c = cond(
        'my.pass.de-rantau',
        'my.pass.income',
        n({ talent, annualIncomeUsd }, { applicationDate }),
      );
      expect([c.status, c.pendingDetails], `${annualIncomeUsd}`).toEqual([
        'UNKNOWN',
        ['PD-430'],
      ]);
    }
    expect(
      cond(
        'my.pass.de-rantau',
        'my.pass.income',
        n({ talent: 'non-tech', annualIncomeUsd: 59_999 }),
      ).status,
    ).toBe('NOT_MET');
    expect(
      cond(
        'my.pass.de-rantau',
        'my.pass.remote-employer',
        n({ contractStart: '2026-08-25' }),
      ).status,
    ).toBe('NOT_MET');
    expect(
      cond(
        'my.pass.de-rantau',
        'my.pass.passport',
        n({}, { passportExpiry: '2028-01-24' }),
      ).status,
    ).toBe('NOT_MET');
    expect(
      cond(
        'my.pass.de-rantau',
        'my.pass.nationality',
        n({}, { nationality: 'IL' }),
      ).status,
    ).toBe('NOT_MET');
    expect(cond('my.pass.de-rantau', 'my.pass.fees', nomad).fee?.amount).toBe(
      1_620,
    );
  });

  test('DE Rantau freelancers need foreign clients and contracts three months old (review113-2 risk 7)', () => {
    // SRC-528 v11 Section B Q3 p4–5: contracts with foreign clients, and
    // every contract started at least three months before applying.
    const freelancer = (
      patch: Partial<NonNullable<MyFullRequest['deRantau']>>,
    ) =>
      cond(
        'my.pass.de-rantau',
        'my.pass.remote-employer',
        n({
          workType: 'freelancer',
          employerRegisteredInMalaysia: undefined,
          foreignClients: true,
          ...patch,
        }),
      );
    const met = freelancer({});
    expect([met.status, met.applicable]).toEqual(['MET', undefined]);
    expect(met.explanation).toContain('境外客户');
    expect(met.explanation).toContain('内容创作者');
    expect(freelancer({ contractStart: '2026-08-25' }).status).toBe('NOT_MET');
    expect(freelancer({ foreignClients: false }).status).toBe('NOT_MET');
    expect(freelancer({ foreignClients: undefined }).status).toBe('UNKNOWN');
  });

  test('DE Rantau security bond when MDEC sponsors (review113-1 suggestion 11)', () => {
    const bond = (nationality?: string) =>
      cond('my.pass.de-rantau', 'my.pass.security-bond', {
        ...nomad,
        nationality,
      });
    // SRC-528 v11 Section D Q2 p15.
    expect(
      ['US', 'GB', 'JP', 'IN', 'ID', 'TH', 'SG'].map(
        (n) => bond(n).fee?.amount,
      ),
    ).toEqual([2000, 1500, 1000, 750, 500, 300, 200]);
    expect(bond('IN').sources).toEqual([
      { srcId: 'SRC-528', locator: 'v11 Section D Q2 p15' },
    ]);
    expect(bond(undefined).status).toBe('UNKNOWN');
  });

  test('Employment Pass categories by filing date', () => {
    const category = (basicMonthlySalaryRm: number, applicationDate = day) =>
      cond('my.pass.employment', 'my.pass.salary-category', {
        simulationDate: day,
        applicationDate,
        work: { basicMonthlySalaryRm },
      });
    expect(category(20_000).explanation).toContain('Category I。');
    expect(category(19_999).explanation).toContain('Category II。');
    expect(category(5_000).status).toBe('MET');
    expect(category(4_999).status).toBe('NOT_MET');
    expect(category(10_000, '2026-05-31').explanation).toContain(
      'Category I。',
    );
    expect(category(2_999, '2026-05-31').status).toBe('NOT_MET');
  });
});

describe('direct answers', () => {
  const rep = {
    ...wife,
    rep: {
      relation: 'child',
      participantHasSatk: true,
      approvalLetterValidUntil: '2027-06-30',
      referees: 2,
    },
    dateOfBirth: '2009-11-25',
  } satisfies MyFullRequest;
  const mm2h = {
    simulationDate: day,
    dateOfBirth: '1985-01-01',
    mm2h: {
      category: 'gold',
      fromCountryWithDiplomaticRelations: true,
      viaLicensedOperator: true,
      goodConductCertificates: true,
    },
  } satisfies MyFullRequest;
  const rpt = {
    simulationDate: day,
    rpt: { taxYearsPaid: 2, qualification: true, totalExperienceYears: 5 },
  } satisfies MyFullRequest;
  const cases: [
    MyPathwayId,
    string,
    MyFullRequest,
    MyFullRequest,
    MyFullRequest?,
  ][] = [
    ['my.pr.wife', 'my.pr.sponsor', wife, { ...wife, citizenSponsor: false }],
    [
      'my.pr.child',
      'my.pr.qualifying-pass',
      {
        ...wife,
        family: { tie: 'child-of-citizen', childRelation: 'biological' },
        passes: [{ kind: 'ltsvp-other', from: '2024-01-01', to: '2027-12-31' }],
      },
      {
        ...wife,
        family: { tie: 'child-of-citizen', childRelation: 'biological' },
        passes: [
          { kind: 'ltsvp-spouse', from: '2024-01-01', to: '2027-12-31' },
        ],
      },
    ],
    [
      'my.pr.rep-family',
      'my.pr.child-age',
      rep,
      { ...rep, dateOfBirth: '2008-11-24' },
      { simulationDate: day, rep: { relation: 'child' } },
    ],
    [
      'my.pr.rep-family',
      'my.pr.referees',
      rep,
      { ...rep, rep: { ...rep.rep, referees: 1 } },
    ],
    [
      'my.pr.rep-family',
      'my.pr.rep-marriage-timing',
      { ...wife, rep: { relation: 'wife', marriedBeforeRepApplication: true } },
      {
        ...wife,
        rep: { relation: 'wife', marriedBeforeRepApplication: false },
      },
    ],
    [
      'my.rp.family',
      'my.rp.passport',
      { ...wife, passportExpiry: '2027-05-24' },
      { ...wife, passportExpiry: '2027-05-23' },
    ],
    [
      'my.rp.family',
      'my.rp.sponsor',
      { ...wife, residencePassSponsor: true },
      { ...wife, residencePassSponsor: false },
      wife,
    ],
    [
      'my.pr.was',
      'my.pr.sponsor',
      { ...wife, was: { citizenSponsor: true } },
      { ...wife, was: { citizenSponsor: false } },
      wife,
    ],
    [
      'my.pr.rep-family',
      'my.pr.sponsor',
      { ...rep, rep: { ...rep.rep, participantSponsor: true } },
      { ...rep, rep: { ...rep.rep, participantSponsor: false } },
      rep,
    ],
    [
      'my.pass.spouse-ltsvp',
      'my.pass.sponsor',
      wife,
      { ...wife, citizenSponsor: false },
    ],
    [
      'my.pass.mm2h',
      'my.pass.diplomatic-relations',
      mm2h,
      {
        ...mm2h,
        mm2h: { ...mm2h.mm2h, fromCountryWithDiplomaticRelations: false },
      },
    ],
    [
      'my.pass.mm2h',
      'my.pass.licensed-operator',
      mm2h,
      { ...mm2h, mm2h: { ...mm2h.mm2h, viaLicensedOperator: false } },
    ],
    [
      'my.pass.mm2h',
      'my.pass.good-conduct',
      mm2h,
      { ...mm2h, mm2h: { ...mm2h.mm2h, goodConductCertificates: false } },
    ],
    [
      'my.pass.rpt',
      'my.pass.tax',
      rpt,
      { ...rpt, rpt: { ...rpt.rpt, taxYearsPaid: 1 } },
    ],
    [
      'my.pass.rpt',
      'my.pass.qualification',
      rpt,
      { ...rpt, rpt: { ...rpt.rpt, qualification: false } },
    ],
    [
      'my.pass.rpt',
      'my.pass.experience',
      rpt,
      { ...rpt, rpt: { ...rpt.rpt, totalExperienceYears: 4 } },
    ],
    [
      'my.pass.de-rantau',
      'my.pass.age',
      // "Over eighteen": met the day after the 18th birthday.
      { simulationDate: day, dateOfBirth: '2008-11-23' },
      { simulationDate: day, dateOfBirth: '2008-11-25' },
      // On the 18th birthday itself (review113-1 risk 6).
      { simulationDate: day, dateOfBirth: '2008-11-24' },
    ],
  ];
  test.each(cases)('%s %s', (id, key, yes, no, unknown) => {
    expect(cond(id, key, yes).status).toBe('MET');
    expect(cond(id, key, no).status).toBe('NOT_MET');
    expect(cond(id, key, unknown ?? { simulationDate: day }).status).toBe(
      'UNKNOWN',
    );
  });

  test('consent cases stay open: earlier pass time and study abroad', () => {
    const reg = {
      ...wife,
      citizenship: { permanentResidentSince: '2025-06-01' },
    } satisfies MyFullRequest;
    const c = cond('my.cit.wife-registration', 'my.cit.residence', reg);
    expect([c.status, c.pendingDetails]).toEqual([
      'UNKNOWN',
      ['PD-413', 'PD-418', 'PD-429'],
    ]);
    const study = (reason: 'education' | 'other') =>
      cond('my.cit.wife-registration', 'my.cit.residence', {
        ...wife,
        passes: [],
        citizenship: { permanentResidentSince: '2020-01-01' },
        trips: [{ departed: '2025-01-01', returned: '2025-09-01', reason }],
      }).status;
    expect([study('education'), study('other')]).toEqual([
      'UNKNOWN',
      'UNKNOWN',
    ]);
  });
});
