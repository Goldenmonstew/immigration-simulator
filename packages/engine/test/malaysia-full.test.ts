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
          expect(pd).toMatch(/^PD-4[0-2]\d$/);
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

  test('stepchildren are pending rather than excluded', () => {
    const p = path('my.pr.child', {
      ...child,
      family: { tie: 'child-of-citizen', childRelation: 'step' },
    });
    expect(p.status).toBe('UNKNOWN');
    expect(p.checks[0].pendingDetails).toEqual(['PD-409']);
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

  test('a husband is warned about his permanent residence count', () => {
    const c = cond('my.rp.family', 'my.rp.pr-link', {
      ...wife,
      family: { ...wife.family, tie: 'husband-of-citizen' },
    });
    expect(c.pendingDetails).toEqual(['PD-428']);
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
    expect([
      bond('JP').status,
      bond('JP').fee,
      bond('JP').pendingDetails,
    ]).toEqual(['UNKNOWN', undefined, ['PD-411']]);
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
    // From 50 no stay is required; over 60 no insurance.
    expect(
      cond(
        'my.pass.mm2h',
        'my.pass.minimum-stay',
        m({ daysPerYear: 0 }, '1976-11-24'),
      ).status,
    ).toBe('MET');
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
      annualIncomeUsd: 36_000,
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
        n({ annualIncomeUsd: 24_000 }, { applicationDate: '2026-10-31' }),
      ).status,
    ).toBe('MET');
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
    ['my.rp.family', 'my.rp.sponsor', wife, { ...wife, citizenSponsor: false }],
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
      { simulationDate: day, dateOfBirth: '2008-11-24' },
      { simulationDate: day, dateOfBirth: '2008-11-25' },
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
