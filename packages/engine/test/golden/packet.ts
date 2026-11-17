import { readFileSync } from 'node:fs';
import type {
  PersonTimeline,
  SimulationRequest,
  SimulationResult,
} from '../../src/types';

// Renders docs/review/adviser-packet.md: an English review packet for a
// regulated immigration adviser, built from the golden cases so the packet and
// the regression snapshot always show the same conclusions.

interface Evaluated {
  id: string;
  title: string;
  request: SimulationRequest;
  result: SimulationResult;
}

const COLUMN_NAMES: Record<string, string> = {
  'current-law-2026-11': 'Current Immigration Rules',
  'earned-settlement-2026-11':
    'Earned Settlement (announced in CP 1707, not yet in force)',
};

const money = (n: number) => `£${n.toLocaleString('en-GB')}`;

/** Every field of an input record, so the adviser sees exactly what the engine saw. */
const describe = (o: object) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k} ${typeof v === 'object' ? JSON.stringify(v) : v}`)
    .join(', ');

function ageOn(dob: string, date: string) {
  const [y, m, d] = dob.split('-').map(Number);
  const [Y, M, D] = date.split('-').map(Number);
  return Y - y - (M < m || (M === m && D < d) ? 1 : 0);
}

function facts(t: PersonTimeline, date: string): string[] {
  const {
    dateOfBirth,
    nationality,
    episodes,
    absences,
    incomeYears,
    cashSavings,
    english,
    lifeInTheUk,
    ...rest
  } = t;
  const out = [
    `Born ${dateOfBirth} (aged ${ageOn(dateOfBirth, date)} on the application date), nationality ${nationality}.`,
  ];
  for (const { route, validFrom, validTo, salary, ...e } of episodes)
    out.push(
      `Permission: ${route} from ${validFrom} to ${validTo}${salary === undefined ? '' : `, salary ${money(salary)}`}${Object.keys(e).length ? ` — ${describe(e)}` : ''}.`,
    );
  if (!episodes.length) out.push('No permission history entered.');
  out.push(
    absences.length
      ? `Absences: ${absences.map((a) => `${a.from} to ${a.to}`).join('; ')}.`
      : 'No absences from the UK.',
  );
  const known = incomeYears.filter(
    (y) => y.earnings !== undefined || y.partnerEarnings !== undefined,
  );
  if (known.length)
    out.push(
      `Income: ${known
        .map(
          (y) =>
            `${y.taxYear} ${y.earnings === undefined ? 'unknown' : money(y.earnings)}${y.partnerEarnings !== undefined ? ` (+ partner ${money(y.partnerEarnings)})` : ''}`,
        )
        .join('; ')}. Tax years not listed: not provided.`,
    );
  if (cashSavings !== undefined)
    out.push(`Cash savings: ${money(cashSavings)}.`);
  out.push(
    `English: ${english ? describe(english) : 'not provided'}. Life in the UK test: ${lifeInTheUk ? describe(lifeInTheUk) : 'not provided'}.`,
  );
  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined || (Array.isArray(value) && !value.length))
      continue;
    out.push(
      `${key}: ${Array.isArray(value) ? value.map((v) => describe(v)).join('; ') : typeof value === 'object' ? describe(value) : value}.`,
    );
  }
  return out;
}

function sourceIndex(ids: Set<string>): string[] {
  const register = readFileSync(
    new URL('../../../../docs/SOURCES.md', import.meta.url),
    'utf8',
  );
  const rows = new Map<string, string>();
  for (const line of register.split('\n')) {
    const cells = line.split('|').map((c) => c.trim());
    if (/^SRC-\d+$/.test(cells[1] ?? ''))
      rows.set(cells[1], `${cells[3]} — ${cells[4]}`);
  }
  return [...ids]
    .sort()
    .map((id) => `- **${id}**: ${rows.get(id) ?? '(not in register)'}`);
}

export function reviewPacket(cases: Evaluated[]): string {
  const cited = new Set<string>();
  const outcomes = [
    ...new Set(
      cases.flatMap((c) =>
        Object.values(c.result.byRuleSet).map((a) => a!.outcome),
      ),
    ),
  ].sort();
  const lines = [
    '# Settlement simulator — review packet for a regulated adviser',
    '',
    `Generated from the engine's golden cases. Policy checked up to ${cases[0].result.policyAsOf}. ${cases.length} cases.`,
    '',
    'This is an educational simulator, not advice. We would like a regulated adviser (OISC or a solicitor) to check whether its conclusions are right. For each case below please mark **Agree** or **Disagree**; when you disagree, give the outcome you expect and the paragraph of the Immigration Rules (or the CP 1707 page for the Earned Settlement column) that decides it.',
    '',
    'How to read a result:',
    `- **Outcome** is the simulator’s overall view for that rule set. Outcomes used in this packet: ${outcomes.join(', ')}.`,
    '- **Pathway** is the qualifying period the simulator thinks applies. **Earliest date** is the application date itself when the person already qualifies; otherwise it is the first later date the simulator projects for that pathway, assuming nothing else changes.',
    '- **Decisive rules** are the checks the outcome rests on. Every failing or unknown check is then listed in full, except when the person is likely eligible: the failures left are other pathways not taken, listed by id only. Each check cites the source register id (SRC-xxx) and paragraph.',
    '- The Earned Settlement column models policy announced on 2 November 2026 (CP 1707). It is **not law yet**; please only flag it where it misreads the published policy.',
    '',
    '## Summary',
    '',
    '| Case | Scenario | Current rules | Earned Settlement |',
    '|---|---|---|---|',
  ];
  const cell = (r: SimulationResult, id: string) => {
    const a = r.byRuleSet[id as keyof typeof r.byRuleSet];
    if (!a)
      return r.shortCircuit ? `short circuit: ${r.shortCircuit.reason}` : '—';
    return `${a.outcome}${a.pathwayYears ? `, ${a.pathwayYears}y` : ''}${a.earliestDate ? `, ${a.earliestDate}` : ''}`;
  };
  for (const c of cases)
    lines.push(
      `| [${c.id}](#${c.id.toLowerCase()}) | ${c.title} | ${cell(c.result, 'current-law-2026-11')} | ${cell(c.result, 'earned-settlement-2026-11')} |`,
    );
  for (const c of cases) {
    const { request, result } = c;
    lines.push(
      '',
      `## ${c.id}`,
      '',
      `**${c.title}**`,
      '',
      `Application date: ${request.simulationDate}.`,
      '',
      ...facts(request.timeline, request.simulationDate).map((f) => `- ${f}`),
    );
    if (request.principal)
      lines.push(
        '',
        'Principal (the person they are a dependant of):',
        '',
        ...facts(request.principal, request.simulationDate).map(
          (f) => `- ${f}`,
        ),
      );
    if (result.shortCircuit)
      lines.push(
        '',
        `**Short circuit — ${result.shortCircuit.reason}:** ${result.shortCircuit.message}`,
      );
    for (const [id, a] of Object.entries(result.byRuleSet)) {
      if (!a) continue;
      lines.push(
        '',
        `### ${COLUMN_NAMES[id] ?? id}`,
        '',
        `Outcome **${a.outcome}**${a.pathwayYears ? `; pathway ${a.pathwayYears} years` : ''}${a.earliestDate ? `; earliest date ${a.earliestDate}` : ''}${a.routeGroup ? `; route group ${a.routeGroup}` : ''}.`,
      );
      const decisive = a.rules.filter((r) => a.decidedBy?.includes(r.id));
      const others = a.rules.filter((r) => !a.decidedBy?.includes(r.id));
      // Once eligible, the remaining failures are pathways not taken;
      // otherwise any failure may be what blocks the person.
      const eligible = a.outcome === 'LIKELY_ELIGIBLE';
      const flagged = others.filter(
        (r) => r.status === 'UNKNOWN' || (!eligible && r.status === 'FAIL'),
      );
      for (const [label, rules] of [
        ['Decisive rules', decisive],
        ['Failing or unknown checks', flagged],
      ] as const) {
        if (!rules.length) continue;
        lines.push('', `${label}:`, '');
        for (const r of rules) {
          r.sources.forEach((s) => cited.add(s.srcId));
          lines.push(
            `- \`${r.id}\` ${r.title} — **${r.status}**. ${r.explanation} _(${r.sources.map((s) => `${s.srcId} ${s.locator}`).join('; ')})_`,
          );
        }
      }
      const notTaken = eligible
        ? others.filter((r) => r.status === 'FAIL')
        : [];
      if (notTaken.length)
        lines.push(
          '',
          `Other pathways not taken: ${notTaken.map((r) => `\`${r.id}\``).join(', ')}.`,
        );
      if (a.assumptions.length) {
        a.assumptions.forEach((x) =>
          x.match(/SRC-\d+/g)?.forEach((s) => cited.add(s)),
        );
        lines.push(
          '',
          'Assumptions:',
          '',
          ...a.assumptions.map((x) => `- ${x}`),
        );
      }
    }
    lines.push(
      '',
      '> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________',
    );
  }
  lines.push('', '## Sources cited', '', ...sourceIndex(cited), '');
  return lines.join('\n');
}
