import { describe, expect, test } from 'vitest';
import { skilledWorkerApplication } from '../src/rules/current-law/sw-application';
import type { ImmigrationEpisode } from '../src/types';
import { timeline } from './helpers';

// SOC 2136 going rate in SRC-017 Table 1: £41,200 for 37.5 hours a week.
const permit = (
  route: ImmigrationEpisode['route'],
  validFrom: string,
  validTo: string,
): ImmigrationEpisode => ({ route, role: 'MAIN', validFrom, validTo });

const graduate = permit('GRADUATE', '2026-09-01', '2028-08-31');

const apply = ({
  episodes = [graduate],
  date = '2027-09-01',
  decisionDate = date,
  salary = 44200,
  weeklyHours = 37.5,
  cosEnd = '2029-08-16',
}: {
  episodes?: ImmigrationEpisode[];
  date?: string;
  decisionDate?: string | undefined;
  salary?: number;
  weeklyHours?: number;
  cosEnd?: string;
} = {}) =>
  skilledWorkerApplication({
    timeline: timeline({ episodes }),
    applicationDate: date,
    decisionDate,
    cos: { start: date, end: cosEnd, salary, weeklyHours, socCode: '2136' },
  });

describe('SW 4.2 Option E new entrant (task 35)', () => {
  test('eligibility under SW 12.2(f)', () => {
    expect(apply().optionE.status).toBe('PASS');
    expect(
      apply({ episodes: [permit('STUDENT', '2024-09-01', '2027-12-31')] })
        .optionE.status,
    ).toBe('FAIL');
    // Expired Graduate permission: less than 2 years before applying.
    const expired = permit('GRADUATE', '2024-09-01', '2025-09-02');
    expect(
      apply({ episodes: [expired], cosEnd: '2028-08-16' }).optionE.status,
    ).toBe('PASS');
    expect(
      apply({
        episodes: [{ ...expired, validTo: '2025-09-01' }],
        cosEnd: '2028-08-16',
      }).optionE.status,
    ).toBe('FAIL');
    expect(
      apply({
        episodes: [{ ...expired, validTo: '2025-08-31' }],
        cosEnd: '2028-08-16',
      }).optionE.status,
    ).toBe('FAIL');
    // A later visit is disregarded.
    expect(
      apply({
        episodes: [graduate, permit('VISIT', '2027-08-01', '2027-08-20')],
      }).optionE.status,
    ).toBe('PASS');
  });

  test('pay: £33,400 and the Table 1 option E column, pro-rated by hours', () => {
    // SOC 2136's option E column is £33,400 (the hourly minimum).
    expect(apply({ salary: 33400 }).optionE.status).toBe('PASS');
    expect(apply({ salary: 33399 }).optionE.status).toBe('FAIL');
    // 45 hours: £33,400 × 45 / 37.5 = £40,080.
    expect(apply({ salary: 40080, weeklyHours: 45 }).optionE.status).toBe(
      'PASS',
    );
    expect(apply({ salary: 40079, weeklyHours: 45 }).optionE.status).toBe(
      'FAIL',
    );
    // Option A needs £41,700 and the full going rate.
    expect(apply({ salary: 41700 }).optionA.status).toBe('PASS');
    expect(apply({ salary: 41699 }).optionA.status).toBe('FAIL');
    // SOC 2137's going rate of £45,600 is above £41,700.
    const it = (salary: number) =>
      skilledWorkerApplication({
        timeline: timeline({ episodes: [graduate] }),
        applicationDate: '2027-09-01',
        decisionDate: '2027-09-01',
        cos: {
          start: '2027-09-01',
          end: '2029-08-16',
          salary,
          weeklyHours: 37.5,
          socCode: '2137',
        },
      }).optionA.status;
    expect(it(45600)).toBe('PASS');
    expect(it(45599)).toBe('FAIL');
  });

  test('SW 12.3 combined permission of 4 years, gaps excluded', () => {
    // 2026-09-01 to 2030-08-31 is exactly 4 years.
    expect(apply({ cosEnd: '2030-08-17' }).optionE.status).toBe('PASS');
    const over = apply({ cosEnd: '2030-08-18' });
    expect(over.optionE.status).toBe('FAIL');
    expect(over.optionE.explanation).toContain('SW 12.3');
    expect(over.grantedUntil).toBe('2030-09-01');
    // A gap after an expired Graduate permission is not counted.
    const expired = permit('GRADUATE', '2024-09-01', '2026-08-31');
    expect(
      apply({ episodes: [expired], cosEnd: '2028-08-31' }).optionE.status,
    ).toBe('PASS');
    // Earlier Skilled Worker permission counts too.
    expect(
      apply({
        episodes: [
          permit('SKILLED_WORKER', '2024-01-01', '2026-08-31'),
          graduate,
        ],
      }).optionE.status,
    ).toBe('FAIL');
  });

  test('a section 3C extension that changes the result is UNKNOWN (PD-081)', () => {
    const short = permit('GRADUATE', '2026-09-01', '2027-09-10');
    const result = apply({
      episodes: [short],
      date: '2027-09-01',
      decisionDate: '2027-12-01',
      // 375 Graduate days plus the grant to 2030-11-20 make exactly 1,461;
      // the 81 days under section 3C would take the total over.
      cosEnd: '2030-11-06',
    });
    expect(result.optionE).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-081'],
    });
  });

  test('with a gap, a total within a day of 4 years is UNKNOWN (PD-081)', () => {
    // 730 Graduate days, a gap, then 731 days of new permission: 1,461.
    const expired = permit('GRADUATE', '2024-09-01', '2026-08-31');
    const result = apply({
      episodes: [expired],
      date: '2027-09-01',
      cosEnd: '2029-08-18',
    });
    expect(result.optionE).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-081'],
    });
    // One day under the limit stays within it even with a leap day moved.
    expect(
      apply({ episodes: [expired], date: '2027-09-01', cosEnd: '2029-08-17' })
        .optionE.status,
    ).toBe('PASS');
  });

  test('missing input', () => {
    const noDecision = skilledWorkerApplication({
      timeline: timeline({ episodes: [graduate] }),
      applicationDate: '2027-09-01',
      cos: {
        start: '2027-09-01',
        end: '2029-08-16',
        salary: 33400,
        weeklyHours: 37.5,
        socCode: '2136',
      },
    });
    expect(noDecision.optionE.status).toBe('UNKNOWN');
    for (const cos of [
      { end: '2029-08-16', salary: 33400, weeklyHours: 37.5, socCode: '2136' },
      {
        start: '2027-09-01',
        salary: 33400,
        weeklyHours: 37.5,
        socCode: '2136',
      },
    ]) {
      const partial = skilledWorkerApplication({
        timeline: timeline({ episodes: [graduate] }),
        applicationDate: '2027-09-01',
        decisionDate: '2027-09-01',
        cos,
      });
      expect(partial.optionE.status).toBe('UNKNOWN');
      expect(partial.grantedUntil).toBeUndefined();
    }
    const noCos = skilledWorkerApplication({
      timeline: timeline({ episodes: [graduate] }),
      applicationDate: '2027-09-01',
      decisionDate: '2027-09-01',
    });
    expect(noCos.status).toBe('UNKNOWN');
  });
});
