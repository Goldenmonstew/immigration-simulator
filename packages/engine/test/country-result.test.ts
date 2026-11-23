import { describe, expect, test } from 'vitest';
import { esIndividualD } from '../../policy-data/fixtures/es-individual-d-public-funds';
import { esP31IndividualAPartnerArrivesTogether } from '../../policy-data/fixtures/es-p31-individual-a-partner-arrives-together';
import { adaptUkResult, evaluate, type SimulationRequest } from '../src';
import { SIMULATION_DATE, timeline } from './helpers';

const examples: { name: string; request: SimulationRequest }[] = [
  {
    name: 'Skilled Worker',
    request: { simulationDate: SIMULATION_DATE, timeline: timeline() },
  },
  { name: 'public funds', request: esIndividualD.request },
  {
    name: 'dependant with principal',
    request: esP31IndividualAPartnerArrivesTogether.request,
  },
  {
    name: 'regulated review',
    request: {
      simulationDate: SIMULATION_DATE,
      timeline: timeline({ criminalRecord: [{ date: '2021-05-01' }] }),
    },
  },
];

describe.each(['en', 'zh-CN'] as const)('UK result adapter (%s)', (locale) => {
  test.each(examples)(
    '$name preserves every assessed field and its order',
    ({ request }) => {
      const original = evaluate({ ...request, locale });
      const { columns, ...header } = adaptUkResult(original, locale);
      const { byRuleSet, ...originalHeader } = original;
      expect(header).toStrictEqual(originalHeader);
      expect(columns.map(({ id }) => id)).toEqual(Object.keys(byRuleSet));
      expect(columns.map(({ title }) => title)).toEqual(
        locale === 'en'
          ? ['Current law', 'Announced reforms']
          : ['现行法律', '已公布改革'],
      );
      for (const [index, column] of columns.entries()) {
        expect(column.pathways).toHaveLength(1);
        const { id, title, status, checks, ...details } = column.pathways[0];
        expect([id, title]).toEqual([column.id, column.title]);
        const statuses = { MET: 'PASS', NOT_MET: 'FAIL', UNKNOWN: 'UNKNOWN' };
        const rules = checks.map((check) => ({
          ...check,
          status: statuses[check.status],
        }));
        expect({ outcome: status, rules, ...details }).toStrictEqual(
          Object.values(byRuleSet)[index],
        );
      }
    },
  );
});
