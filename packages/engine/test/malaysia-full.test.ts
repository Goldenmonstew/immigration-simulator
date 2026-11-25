/// <reference types="node" />

import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import {
  PARAMETERS_BY_COUNTRY,
  RULE_SET_IDS_BY_COUNTRY,
} from '@uk-immigration/policy-data';
import { MY_FULL_PATHWAYS, evaluateMalaysiaFull } from '../src';
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
    expect([c.status, c.pendingDetails]).toEqual([
      'UNKNOWN',
      ['PD-407', 'PD-428'],
    ]);
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
    expect([w.status, w.pendingDetails]).toEqual([
      'UNKNOWN',
      ['PD-406', 'PD-428'],
    ]);
    const h = cond('my.pr.husband', 'my.pr.spouse-pass', {
      ...wife,
      family: { ...wife.family, tie: 'husband-of-citizen' },
      passes,
    });
    expect([h.status, h.pendingDetails]).toEqual([
      'UNKNOWN',
      ['PD-407', 'PD-428'],
    ]);
    expect(path('my.pr.wife', { ...wife, passes }).timeStatus).toBe('UNKNOWN');
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
        'my.pass.remote-employer',
        n({ workType: 'freelancer' }),
      ).applicable,
    ).toBe(false);
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
