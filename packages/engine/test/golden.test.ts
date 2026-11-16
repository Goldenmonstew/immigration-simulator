import { writeFileSync } from 'node:fs';
import { fixtures } from '@uk-immigration/policy-data/fixtures';
import { expect, test } from 'vitest';
import { evaluate } from '../src/evaluate';
import type { SimulationRequest, SimulationResult } from '../src/types';
import { goldenCases } from './golden/cases';
import { reviewPacket } from './golden/packet';

// Golden master: the engine's current conclusion for every fixture and typical
// case under every rule set. Wording changes do not matter here; any change in
// an outcome, pathway, earliest date or rule status shows up as a diff in
// __snapshots__/golden-cases.json and has to be reviewed on purpose.
// `WRITE_PACKET=1 pnpm --filter @uk-immigration/engine test golden` also
// rewrites docs/review/adviser-packet.md from the same results.

const cases: { id: string; title: string; request: SimulationRequest }[] = [
  ...goldenCases,
  ...fixtures.map(({ id, title, request }) => ({ id, title, request })),
];

function summary(result: SimulationResult) {
  return {
    shortCircuit: result.shortCircuit?.reason,
    columns: Object.fromEntries(
      Object.entries(result.byRuleSet).map(([id, a]) => [
        id,
        {
          outcome: a!.outcome,
          routeGroup: a!.routeGroup,
          pathwayYears: a!.pathwayYears,
          earliestDate: a!.earliestDate,
          rules: Object.fromEntries(a!.rules.map((r) => [r.id, r.status])),
        },
      ]),
    ),
  };
}

test('every golden case keeps its conclusion under both rule sets', async () => {
  const results = cases.map((c) => ({
    ...c,
    result: evaluate({ ...c.request, locale: 'en' }),
  }));
  const snapshot = Object.fromEntries(
    results.map(({ id, title, result }) => [id, { title, ...summary(result) }]),
  );
  await expect(JSON.stringify(snapshot, null, 2) + '\n').toMatchFileSnapshot(
    './__snapshots__/golden-cases.json',
  );
  if (process.env.WRITE_PACKET)
    writeFileSync(
      new URL('../../../docs/review/adviser-packet.md', import.meta.url),
      reviewPacket(results),
    );
});
