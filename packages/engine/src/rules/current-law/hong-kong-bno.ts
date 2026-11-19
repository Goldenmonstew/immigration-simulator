import {
  currentLaw2026_11 as cl,
  routeNames,
} from '@uk-immigration/policy-data';
import { addYears } from '../../dates';
import { episodeOn, currentResidence, settledBy } from '../../residence';
import type { CurrentResidence } from '../../residence';
import { defineRule, nameIn, textFor } from '../../rule';
import type { IsoDate, RuleContext } from '../../types';
import {
  crResidenceSources,
  residenceAssumptions,
  residenceCompleted,
  residencePending,
  RULE_SET,
  absenceAssumption,
  hongKongBnoDependant,
  onHongKongBno,
} from './shared';
import { principalApplicationDate } from './skilled-worker';
import {
  DependantPathway,
  jointApplication,
  noJointApplication,
  needsPrincipal,
  notYetSettledAssumption,
  principalNotReady,
} from './dependants';

/**
 * Start of the continuous Hong Kong BN(O) permission (any role) ending on the
 * simulation date, while a main applicant on that route (HK 62.1, HK 63.1).
 * Only BN(O) time is counted (PD-069); `before` is the adjoining earlier
 * permission on another route, if any.
 */
export function hongKongBnoResidence(
  { timeline, simulationDate }: RuleContext,
  notBefore?: IsoDate,
): CurrentResidence | undefined {
  // Dependants other than a child under 18 also need the 5 years (HK 62.1(b)).
  const kind = hongKongBnoDependant(timeline, simulationDate);
  if (
    !onHongKongBno(timeline, simulationDate) &&
    (kind === undefined || kind === 'CHILD')
  ) {
    return undefined;
  }
  const current = episodeOn(timeline, simulationDate)!;
  return currentResidence(
    timeline,
    simulationDate,
    (e) => e.route === 'HONG_KONG_BNO',
    cl.values.hongKongBnoQualifyingYears.value,
    {
      appliesOn: (e) =>
        e.route === 'HONG_KONG_BNO' &&
        e.role === current.role &&
        e.dependantOf === current.dependantOf,
      notBefore,
    },
  );
}

export const clHkbnoResidence5Y = defineRule(
  {
    id: 'CL-HKBNO-RESIDENCE-5Y',
    ruleSetId: RULE_SET,
    title: 'Hong Kong BN(O) 连续 5 年',
    titleEn: `${cl.values.hongKongBnoQualifyingYears.value} continuous years on the Hong Kong BN(O) route`,
    sources: [
      { srcId: 'SRC-020', locator: 'HK 62.1' },
      { srcId: 'SRC-020', locator: 'HK 63.1' },
      ...crResidenceSources,
    ],
    pendingDetails: ['PD-069'],
  },
  (ctx) => {
    const L = textFor(ctx);
    const years = cl.values.hongKongBnoQualifyingYears.value;
    const run = hongKongBnoResidence(ctx);
    if (!run) {
      return {
        status: 'FAIL',
        explanation: L(
          '当前不是须满 5 年的 Hong Kong BN(O) 许可（主申请人、伴侣、已满 18 岁的子女或 adult dependant relative）。',
          'Current permission is not Hong Kong BN(O) permission that needs the 5 years (main applicant, partner, child aged 18 or over, or adult dependant relative).',
        ),
      };
    }
    const { start, before } = run;
    const assumptions = [
      ...(before
        ? [
            L(
              `HK 62.1(b) 也计入其他可定居路线（a route under which a person can settle）的许可；本工具只计 Hong Kong BN(O) 段，紧接其前的${nameIn(L, routeNames[before.route])}许可未计入，若该路线可定居，实际日期可能更早（PD-069）。`,
              `HK 62.1(b) also counts permission on any other route under which a person can settle; this tool counts only the Hong Kong BN(O) period, so the ${nameIn(L, routeNames[before.route])} permission just before it is not counted, and the actual date may be earlier if that route can lead to settlement (PD-069).`,
            ),
          ]
        : []),
      ...(ctx.timeline.absences.length > 0 ? [absenceAssumption(L)] : []),
    ];
    assumptions.push(
      ...residenceAssumptions(ctx.timeline, ctx.simulationDate, run, L),
    );
    return run.applicationDate === ctx.simulationDate
      ? {
          status: 'PASS',
          explanation: L(
            `自 ${start} 起连续持 Hong Kong BN(O) 许可，${residenceCompleted(run, ctx.simulationDate, years, L)}（HK 62.1(b)）。`,
            `Continuous Hong Kong BN(O) permission since ${start}: ${residenceCompleted(run, ctx.simulationDate, years, L)} (HK 62.1(b)).`,
          ),
          assumptions,
        }
      : {
          status: 'FAIL',
          explanation: L(
            `自 ${start} 起连续持 Hong Kong BN(O) 许可，${residencePending(run, years, L)}（HK 62.1(b)）。`,
            `Continuous Hong Kong BN(O) permission since ${start}: ${residencePending(run, years, L)} (HK 62.1(b)).`,
          ),
          assumptions,
        };
  },
);

/** HK 57.1–57.3, HK 59.1: a child under 18 or an adult dependant relative. */
export function hongKongBnoDependantPathway(
  ctx: RuleContext,
): DependantPathway | undefined {
  const { timeline, simulationDate, principal } = ctx;
  const kind = hongKongBnoDependant(timeline, simulationDate);
  if (kind !== 'CHILD' && kind !== 'RELATIVE') return undefined;
  const L = textFor(ctx);
  const years = cl.values.hongKongBnoQualifyingYears.value;
  const settled = principal && settledBy(principal.timeline, simulationDate);
  const assumptions = [
    kind === 'CHILD'
      ? L(
          '另一位父母须同时获批定居、已定居或为英国公民，除非主申请人是唯一在世的父母或负唯一抚养责任等（HK 57.4）；照护安排（HK 58.1、CHI 2.1）按满足处理。按申请日年龄判断：若到预计日期时已满 18 岁，届时须本人满 5 年（HK 62.1(b)）。',
          'The other parent must be granted settlement at the same time, already be settled or be a British citizen, unless the principal applicant is the sole surviving parent, has sole responsibility or similar (HK 57.4); the care arrangements (HK 58.1, CHI 2.1) are assumed to be met. Age is taken on the date of application: if the child is 18 or over by the projected date, they will need 5 years of their own then (HK 62.1(b)).',
        )
      : L(
          '与主申请人的亲属关系（父母、祖父母、兄弟姐妹或子女，HK 59.1）按申报处理。',
          'The family relationship with the principal applicant (parent, grandparent, brother, sister, son or daughter, HK 59.1) is taken as declared.',
        ),
    ...(settled ? [] : [notYetSettledAssumption(L)]),
  ];
  if (!principal) return { years, result: needsPrincipal(L, assumptions) };
  const ownFrom = (notBefore?: IsoDate) =>
    kind === 'RELATIVE'
      ? hongKongBnoResidence(ctx, notBefore)
      : currentResidence(
          timeline,
          simulationDate,
          (e) =>
            e.route === 'HONG_KONG_BNO' &&
            e.role === 'DEPENDANT' &&
            e.dependantOf === 'PARENT',
          0,
          { notBefore },
        );
  if (settled) {
    if (kind === 'CHILD') {
      return {
        years,
        start: addYears(simulationDate, -years),
        result: {
          status: 'PASS',
          explanation: L(
            `未满 ${cl.values.settlementMinorAge.value} 岁（HK 57.1）；主申请人已于 ${settled.date} 定居（或已成为英国公民），可申请定居（HK 57.3(b)）；子女本人没有居留年限要求（HK 62.1(b)）。`,
            `Under ${cl.values.settlementMinorAge.value} (HK 57.1); the principal applicant settled (or became a British citizen) on ${settled.date}, so they can apply for settlement (HK 57.3(b)); the child has no residence requirement of their own (HK 62.1(b)).`,
          ),
          assumptions,
        },
      };
    }
    const own = ownFrom();
    if (settled.route === 'HONG_KONG_BNO' && !own?.applicationDate) {
      return {
        years,
        result: {
          status: 'FAIL',
          explanation: residencePending(own!, years, L),
          assumptions,
        },
      };
    }
    return settled.route === 'HONG_KONG_BNO'
      ? {
          years,
          start: own?.start,
          applicationDate: own?.applicationDate,
          result: {
            status: 'PASS',
            explanation: L(
              `主申请人已于 ${settled.date} 以 Hong Kong BN(O) 路线定居（HK 59.1(b)）；本人的 BN(O) 许可须满 ${years} 年（HK 62.1(b)），${own!.applicationDate} 起可申请。`,
              `The principal applicant settled on the Hong Kong BN(O) route on ${settled.date} (HK 59.1(b)); this person’s own BN(O) permission must reach ${years} years (HK 62.1(b)), so they can apply from ${own!.applicationDate}.`,
            ),
            assumptions,
          },
        }
      : {
          years,
          result: {
            status: 'UNKNOWN',
            explanation: L(
              `主申请人 ${settled.date} 定居时持有的不是 Hong Kong BN(O) 许可；只有其已成为英国公民时才满足 HK 59.1(c)，本工具无法区分已定居与英国公民。`,
              `The principal applicant did not hold Hong Kong BN(O) permission when they settled on ${settled.date}; HK 59.1(c) is met only if they have become a British citizen, which this tool cannot tell apart from being settled.`,
            ),
            assumptions,
          },
        };
  }
  // P must be the BN(O) main applicant or their partner (HK 57.3, HK 59.1(a)).
  const current = episodeOn(principal.timeline, simulationDate);
  const onRoute =
    current?.route === 'HONG_KONG_BNO' &&
    (current.role === 'MAIN' || current.dependantOf === 'PARTNER');
  const due = onRoute
    ? principalApplicationDate(ctx, 'CL-HKBNO-RESIDENCE-5Y')
    : undefined;
  if (!due) {
    return {
      years,
      result: principalNotReady(ctx, onRoute, 'Hong Kong BN(O)', assumptions),
    };
  }
  const joint = jointApplication(
    due,
    ownFrom,
    (notBefore) =>
      hongKongBnoResidence(
        { timeline: principal.timeline, simulationDate },
        notBefore,
      )?.applicationDate,
  );
  if (!joint?.applicationDate) {
    return { years, result: noJointApplication(L, assumptions) };
  }
  const { applicationDate } = joint;
  if (kind === 'CHILD') {
    return {
      years,
      start: addYears(applicationDate, -years),
      applicationDate,
      result: {
        status: 'PASS',
        explanation: L(
          `未满 ${cl.values.settlementMinorAge.value} 岁（HK 57.1）；随主申请人定居：主申请人可于 ${applicationDate} 申请，届时可一同申请（HK 57.3(a)）；子女本人没有居留年限要求（HK 62.1(b)）。`,
          `Under ${cl.values.settlementMinorAge.value} (HK 57.1); settling with the principal applicant, who can apply on ${applicationDate}, when they can apply together (HK 57.3(a)); the child has no residence requirement of their own (HK 62.1(b)).`,
        ),
        assumptions,
      },
    };
  }
  return {
    years,
    start: joint.start,
    applicationDate,
    result: {
      status: 'PASS',
      explanation: L(
        `随主申请人同时获批定居（HK 59.1(a)）：主申请人与本人最早可于 ${applicationDate} 一同申请，本人的 BN(O) 许可也须满 ${years} 年（HK 62.1(b)）。`,
        `Settling at the same time as the principal applicant (HK 59.1(a)): the earliest joint application date is ${applicationDate}, when this person also meets the ${years}-year BN(O) residence requirement (HK 62.1(b)).`,
      ),
      assumptions,
    },
  };
}

export const clHkbnoDependant = defineRule(
  {
    id: 'CL-HKBNO-DEPENDANT',
    ruleSetId: RULE_SET,
    title: 'Hong Kong BN(O) 子女或 adult dependant relative 随主申请人定居',
    titleEn:
      'Hong Kong BN(O) child or adult dependant relative settling with the principal applicant',
    sources: [
      { srcId: 'SRC-020', locator: 'HK 57.1' },
      { srcId: 'SRC-020', locator: 'HK 57.2' },
      { srcId: 'SRC-020', locator: 'HK 57.3' },
      { srcId: 'SRC-020', locator: 'HK 57.4' },
      { srcId: 'SRC-020', locator: 'HK 58.1' },
      { srcId: 'SRC-020', locator: 'HK 59.1' },
      { srcId: 'SRC-020', locator: 'HK 62.1' },
    ],
    pendingDetails: [],
  },
  (ctx) =>
    hongKongBnoDependantPathway(ctx)?.result ?? {
      status: 'FAIL',
      explanation: textFor(ctx)(
        '当前不是 Hong Kong BN(O) 未满 18 岁子女或 adult dependant relative 的 dependant 许可。',
        'Current permission is not as a Hong Kong BN(O) dependent child under 18 or adult dependant relative.',
      ),
    },
);
