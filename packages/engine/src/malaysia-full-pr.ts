import type { SourceRef } from '@uk-immigration/policy-data';
import { addDays, addMonths, addYears, daysBetween } from './dates';
import {
  age,
  all,
  assemble,
  birthday,
  check,
  heldRun,
  inapplicable,
  info,
  latest,
  ref,
  timing,
  v,
  withFee,
  type MyCheck,
  type MyContext,
  type MyPassKind,
  type MyPathway,
} from './malaysia-full-shared';
import type { IsoDate } from './types';

const guide = (locator: string) => ref('SRC-505', locator);
const repGuide = (locator: string) => ref('SRC-506', locator);
const act = (locator: string) => ref('SRC-503', locator);

type PrRoute = 'wife' | 'husband' | 'child' | 'was' | 'rep';

const SPOUSE_BARRED: MyPassKind[] = ['plks', 'unhcr', 'imm13'];
const WAS_BARRED: MyPassKind[] = ['mm2h', 'pvip', ...SPOUSE_BARRED];
const CHILD_PASSES: MyPassKind[] = [
  'ltsvp-other',
  'student',
  'professional-visit',
  'residence',
];
const WAS_PASSES: MyPassKind[] = [
  'employment',
  'student',
  'professional-visit',
  'residence',
];
const LONG_TERM: MyPassKind[] = [
  'ltsvp-spouse',
  'ltsvp-other',
  'employment',
  'student',
  'professional-visit',
  'residence',
  'dependant',
  'mm2h',
  'pvip',
  'plks',
];

const sponsorParagraph = {
  wife: '§5.1(f) p18',
  husband: '§5.2(f) p19',
  child: '§5.3(e) p20',
  was: '§5.4 p21',
} as const;
const blacklistParagraph = {
  wife: '§5.1(e) p18',
  husband: '§5.2(e) p19',
  was: '§5.4(d) p21',
} as const;

function levelText(ctx: MyContext) {
  const { req, L } = ctx;
  const names = {
    weak: L('弱', 'weak'),
    moderate: L('一般', 'moderate'),
    good: L('良好', 'good'),
    'very-good': L('很好', 'very good'),
  };
  const { malay, english } = req.language ?? {};
  return [
    malay &&
      L(`马来语自评${names[malay]}。`, ` Malay self-rated ${names[malay]}.`),
    english &&
      L(
        `英语自评${names[english]}。`,
        ` English self-rated ${names[english]}.`,
      ),
  ]
    .filter(Boolean)
    .join('');
}

/** Marriage registered in Malaysia, shared with citizenship and the LTSVP. */
export function marriageRegistration(
  ctx: MyContext,
  id: string,
  sources: readonly SourceRef[],
): MyCheck {
  const { req, L } = ctx;
  const registration = req.family?.marriageRegistration;
  return check(
    id,
    L('婚姻在马来西亚登记', 'Marriage registered in Malaysia'),
    registration === 'malaysia' ? true : undefined,
    sources,
    L(
      '结婚证须由国民登记局（JPN）、州伊斯兰宗教局或原住民法庭签发或登记。',
      'The marriage certificate must be issued or registered by the National Registration Department (JPN), a state Islamic religious department or a native court.',
    ) +
      (registration === 'foreign-only'
        ? L(
            '所填婚姻只在外国登记，是否须先在马来西亚补登记待确认。',
            ' The marriage is registered only abroad; whether it must first be registered in Malaysia needs confirmation.',
          )
        : ''),
    ['PD-405'],
  );
}

/** `noSeparation`: the Permit Masuk guideline adds "tanpa berpisah atau bercerai". */
function marriageDuration(
  ctx: MyContext,
  years: number,
  sources: readonly SourceRef[],
  noSeparation: boolean,
) {
  const { req, date, L } = ctx;
  const married = req.family?.marriedOn;
  const separated = noSeparation ? req.family?.separatedOrDivorced : false;
  const due = married && addYears(married, years);
  const c = check(
    'my.pr.marriage-duration',
    L('婚姻存续年数', 'Years of marriage'),
    all(
      separated === undefined ? undefined : !separated,
      due === undefined ? undefined : date >= due,
    ),
    sources,
    (noSeparation
      ? L(
          `须已结婚至少 ${years} 年，且未分居、未离婚。`,
          `The couple must have been married for at least ${years} years without separating or divorcing.`,
        )
      : L(
          `递交前须已结婚至少 ${years} 年。`,
          `The couple must have been married for at least ${years} years before applying.`,
        )) +
      (separated
        ? L('所填已分居或离婚。', ' A separation or divorce is reported.')
        : due
          ? L(
              `按结婚日，${due} 满 ${years} 年。`,
              ` On the marriage date, ${years} years are completed on ${due}.`,
            )
          : ''),
    noSeparation ? ['PD-405'] : [],
  );
  return { check: c, earliest: separated ? null : due };
}

/** A citizen's spouse who moved to a Residence Pass since `from` (PD-428). */
function spouseResidencePass(ctx: MyContext, spouse: boolean, from: IsoDate) {
  return (
    spouse &&
    (ctx.req.passes?.some(
      (p) => p.kind === 'residence' && p.from <= ctx.date && p.to >= from,
    ) ??
      false)
  );
}

const residencePassText = (ctx: MyContext) =>
  ctx.L(
    '近期改持 Residence Pass 的期间能否算作持公民配偶准证待确认。',
    ' Whether recent time on a Residence Pass counts as holding the spouse-of-citizen pass needs confirmation.',
  );

function earlyPassCheck(
  ctx: MyContext,
  id: string,
  title: string,
  kinds: MyPassKind[],
  months: number,
  sources: readonly SourceRef[],
  description: string,
  spouse = false,
) {
  const { req, date, L } = ctx;
  const run = heldRun(req.passes, kinds, date);
  const lastMonths = daysBetween(addMonths(date, -months), date);
  const residencePass = spouseResidencePass(
    ctx,
    spouse,
    addMonths(date, -months),
  );
  const strict = !run
    ? undefined
    : !run.valid
      ? false
      : date > addMonths(run.start, months)
        ? true
        : run.total > lastMonths
          ? undefined
          : false;
  const met = strict === false && residencePass ? undefined : strict;
  const c = check(
    id,
    title,
    met,
    sources,
    description +
      (run && !run.valid
        ? L(
            '申请日没有这类有效准证。',
            ' No such pass is valid on the application date.',
          )
        : run?.valid
          ? L(
              `当前连续持有自 ${run.start} 起。`,
              ` The current unbroken holding began on ${run.start}.`,
            )
          : '') +
      (strict === undefined && run
        ? L(
            '只有把中断前的期间合并计算才超过所需月数，是否须连续待确认。',
            ' The required months are exceeded only by adding periods before a break; whether they must be continuous needs confirmation.',
          )
        : met === undefined && residencePass
          ? residencePassText(ctx)
          : ''),
    residencePass ? ['PD-406', 'PD-428'] : ['PD-406'],
  );
  const earliest = !run
    ? undefined
    : run.valid
      ? addDays(addMonths(run.start, months), 1)
      : residencePass
        ? undefined
        : null;
  return { check: c, earliest };
}

function longPassCheck(
  ctx: MyContext,
  id: string,
  title: string,
  kinds: MyPassKind[],
  years: number,
  maxGapMonths: number,
  sources: readonly SourceRef[],
  description: string,
  spouse = false,
) {
  const { req, date, L } = ctx;
  const run = heldRun(req.passes, kinds, date, maxGapMonths);
  const residencePass = spouseResidencePass(
    ctx,
    spouse,
    addYears(date, -years),
  );
  // Breaks of up to `maxGapMonths` do not restart the count. Without counting
  // them, `years` are held once the days held since the bridged start reach
  // the days in the `years` before `d` (PD-407, PD-429); holding is assumed
  // to continue after `date`.
  const heldEnough = (d: IsoDate) =>
    run?.valid === true &&
    daysBetween(run.tolerantStart, d) - run.gapDays >=
      daysBetween(addYears(d, -years), d);
  const strict = !run
    ? undefined
    : run.valid && (date >= addYears(run.start, years) || heldEnough(date))
      ? true
      : run.valid && date >= addYears(run.tolerantStart, years)
        ? undefined
        : false;
  const met = strict === false && residencePass ? undefined : strict;
  const c = check(
    id,
    title,
    met,
    sources,
    description +
      (run && !run.valid
        ? L(
            '申请日没有这类有效准证。',
            ' No such pass is valid on the application date.',
          )
        : run?.valid
          ? L(
              `当前不间断持有自 ${run.start} 起。`,
              ` The current unbroken holding began on ${run.start}.`,
            ) +
            (run.gapDays
              ? L(
                  `连同 ${maxGapMonths} 个月以内的中断，自 ${run.tolerantStart} 起持有，中断共 ${run.gapDays} 日，不计中断的持有日数与 ${years} 年的日数比较。`,
                  ` Bridging breaks of up to ${maxGapMonths} months, holding began on ${run.tolerantStart} with ${run.gapDays} days of breaks, which are left out when comparing the days held with ${years} years.`,
                )
              : '')
          : '') +
      (strict === undefined && run?.valid
        ? L(
            `只有把 ${maxGapMonths} 个月以内的中断也算作持有才满 ${years} 年，中断如何计算待确认。`,
            ` ${years} years are reached only if breaks of up to ${maxGapMonths} months also count as holding; how breaks count needs confirmation.`,
          )
        : met === undefined && residencePass
          ? residencePassText(ctx)
          : ''),
    residencePass ? ['PD-407', 'PD-428'] : ['PD-407'],
  );
  let earliest: IsoDate | null | undefined = !run
    ? undefined
    : residencePass && !run.valid
      ? undefined
      : null;
  if (run?.valid) {
    const unbroken = addYears(run.start, years);
    earliest = addYears(run.tolerantStart, years);
    while (earliest < unbroken && !heldEnough(earliest))
      earliest = addDays(earliest, 1);
  }
  return { check: c, earliest };
}

function barredPass(ctx: MyContext, barred: MyPassKind[], source: SourceRef) {
  const { req, date, L } = ctx;
  const holding = req.passes?.some(
    (p) => p.from <= date && date <= p.to && barred.includes(p.kind),
  );
  return check(
    'my.pr.barred-pass',
    L('申请时所持准证种类', 'Pass held when applying'),
    holding === undefined ? undefined : !holding,
    [source],
    barred.includes('mm2h')
      ? L(
          '持 MM2H、PVIP、临时工作准证（PLKS）、UNHCR 卡或 IMM.13 者不得申请此类别，持有期间也不计入。',
          'Holders of MM2H, PVIP, a temporary employment visit pass (PLKS), a UNHCR card or IMM.13 may not apply in this category, and time on them does not count.',
        )
      : L(
          '持临时工作准证（PLKS）、UNHCR 卡或 IMM.13 者不得申请配偶类别，持有期间也不计入。',
          'Holders of a temporary employment visit pass (PLKS), a UNHCR card or IMM.13 may not apply as a spouse, and time on them does not count.',
        ),
  );
}

function commonChecks(ctx: MyContext, route: PrRoute): MyCheck[] {
  const { req, date, L } = ctx;
  const months =
    route === 'rep' ? v.rep.value.passportMonths : v.prPassportMonths.value;
  const passport = check(
    'my.pr.passport',
    L('护照有效期', 'Passport validity'),
    req.passportExpiry === undefined
      ? undefined
      : req.passportExpiry >= addMonths(date, months),
    route === 'rep'
      ? [repGuide('§5.6 p17')]
      : [...v.prPassportMonths.sources, guide('§10.1 p28')],
    L(
      `递交日护照须至少还有 ${months} 个月有效，领证时同样须超过 ${months} 个月。`,
      `The passport must have at least ${months} months left on the filing date, and more than ${months} months when the permit is collected.`,
    ),
  );

  const sponsorWho = {
    wife: L('公民丈夫', 'the citizen husband'),
    husband: L('公民妻子', 'the citizen wife'),
    child: L('公民父亲或母亲', 'the citizen father or mother'),
    was: L('一名马来西亚公民', 'a Malaysian citizen'),
    rep: L(
      '同为 REP 参与者的配偶或父母',
      'the spouse or parent who is the REP participant',
    ),
  }[route];
  const sponsor = check(
    'my.pr.sponsor',
    L('担保人', 'Sponsor'),
    req.citizenSponsor,
    route === 'rep'
      ? [repGuide('§5.5 p17')]
      : [guide(sponsorParagraph[route]), guide('§2.6 p12'), guide('§3.10 p14')],
    L(
      `由${sponsorWho}担保；递交申请时申请人与担保人须一同到场并带齐原件。`,
      `Sponsored by ${sponsorWho}. The applicant and sponsor must attend together with all original documents.`,
    ),
    ['PD-410'],
  );

  const refereesNeeded =
    route === 'rep' ? v.rep.value.referees : v.prReferees.value;
  const refereeCount =
    route === 'rep' ? req.rep?.referees : req.citizenReferees;
  let referees = check(
    'my.pr.referees',
    L('公民推荐人', 'Citizen referees'),
    refereeCount === undefined ? undefined : refereeCount >= refereesNeeded,
    route === 'rep' ? [repGuide('§5.7 p17')] : v.prReferees.sources,
    route === 'rep'
      ? L(
          `须提名 ${refereesNeeded} 名年满 ${v.rep.value.refereeMinAge} 岁的马来西亚公民为推荐人。`,
          `${refereesNeeded} Malaysian citizens aged ${v.rep.value.refereeMinAge} or over must be named as referees.`,
        )
      : L(
          `须附 ${refereesNeeded} 名马来西亚公民推荐人的身份证（MyKad）副本；指南未列其他资格。`,
          `Copies of the identity cards (MyKad) of ${refereesNeeded} Malaysian citizen referees are required; the guideline lists no other qualification.`,
        ),
    ['PD-410'],
  );
  if (route === 'child')
    referees = inapplicable(
      referees,
      L(
        '子女类的申请清单没有推荐人一项。',
        'The child checklist does not ask for referees.',
      ),
    );

  const record = req.immigrationRecord;
  const prohibited = check(
    'my.pr.prohibited-classes',
    L(
      '移民黑名单与禁止入境类别',
      'Immigration blacklist and prohibited classes',
    ),
    record === 'listed' ? false : undefined,
    [
      ...(route === 'child' || route === 'rep'
        ? []
        : [guide(blacklistParagraph[route])]),
      act('s.8(3) p12–14'),
    ],
    L(
      '不得在移民局可疑名单或黑名单上，也不得属于法定禁止入境类别（含曾在任何国家被判监禁并被认定为不受欢迎者），须经移民局与警方审查确认。',
      'The applicant must not be on the Immigration suspect list or blacklist or in a prohibited class, which includes anyone imprisoned in any country and deemed undesirable. Immigration and police screening decides this.',
    ) +
      (record === 'listed'
        ? L('所填已被列入名单。', ' A listing is reported.')
        : record === 'other-adverse' || req.criminalRecord === 'convicted'
          ? L(
              '所填有拒绝入境、遣返或刑事判决记录，须个案审查。',
              ' A refusal of entry, removal or conviction is reported and will be reviewed case by case.',
            )
          : record === 'clear'
            ? L('所填无此类记录。', ' No such record is reported.')
            : ''),
    ['PD-415'],
  );

  const refusal = req.previousPrRefusalOn;
  const reapply = refusal && addYears(refusal, v.prReapplyYears.value);
  const previous = check(
    'my.pr.previous-refusal',
    L('此前被拒后的等待期', 'Waiting period after a refusal'),
    refusal === undefined
      ? undefined
      : refusal === null || date >= (reapply as IsoDate),
    [...v.prAppealDays.sources, ...v.prReapplyYears.sources],
    L(
      `被拒后可在 ${v.prAppealDays.value} 日内向内政部长书面上诉，部长决定为终局；或在决定日起满 ${v.prReapplyYears.value} 年后重新申请。`,
      `After a refusal the applicant may appeal in writing to the Minister of Home Affairs within ${v.prAppealDays.value} days, whose decision is final, or apply again ${v.prReapplyYears.value} year after the decision.`,
    ) +
      (reapply
        ? L(
            `按所填拒绝日，${reapply} 起可重新申请。`,
            ` On the refusal date entered, a new application can be made from ${reapply}.`,
          )
        : ''),
  );

  const interview = check(
    'my.pr.interview-security',
    L('面谈与警方安全审查', 'Interview and police screening'),
    undefined,
    [guide('§6.3–6.5 p22')],
    route === 'child'
      ? L(
          '子女类免面谈，但每宗申请都经皇家警察（PDRM）安全审查，结果无法预判。',
          'Child applications are exempt from the interview, but every application goes through Royal Malaysia Police (PDRM) screening, whose result cannot be predicted.',
        )
      : L(
          '申请人与担保人须到移民局面谈，申请并经皇家警察（PDRM）安全审查，结果无法预判。',
          'The applicant and sponsor attend an Immigration interview, and the application goes through Royal Malaysia Police (PDRM) screening, whose result cannot be predicted.',
        ),
    [],
    'factor',
  );

  const e = req.evidence;
  const means = check(
    'my.pr.means',
    L('收入、资产与纳税证明', 'Income, assets and tax evidence'),
    e?.applicantIncome || e?.sponsorIncome || e?.malaysianTaxReturns
      ? true
      : undefined,
    [
      guide('附录 C1 辅助文件第 3 项 p59'),
      guide('附录 C3 辅助文件第 7 项 p61'),
      act('s.8(3)(a) p12'),
    ],
    L(
      '官方没有公布收入或资产门槛，只要求证明文件；不能证明可维持自己与受养人生活、或可能成为公共负担者属禁止入境类别。',
      'No income or asset threshold is published; only evidence is required. Anyone unable to show the means to support themselves and their dependants, or likely to become a charge on the public, is in a prohibited class.',
    ) +
      (e?.applicantIncome || e?.sponsorIncome || e?.malaysianTaxReturns
        ? L('所填已有相关证明。', ' Evidence is reported.')
        : ''),
    ['PD-401'],
    'factor',
  );

  const language = check(
    'my.pr.language',
    L('马来语与英语能力', 'Malay and English'),
    undefined,
    [guide('附录 A2 第 3 节 p44')],
    L(
      '申请表要求自评马来语、英语水平，未规定最低等级，也没有考试。',
      'The form asks for a self-rating of Malay and English with no minimum level and no test.',
    ) + levelText(ctx),
    ['PD-402'],
    'factor',
  );

  const health = info(
    'my.pr.health',
    L('健康与体检', 'Health and medical examination'),
    [act('s.8(3)(b)–(c) p13'), guide('附录 C1、C3 p59、p61')],
    L(
      '法定禁止类别包括特定疾病和拒绝体检，申请清单未列体检报告；本工具不收集健康资料。',
      'Prohibited classes include certain illnesses and refusing a medical examination, but the checklists do not list a medical report. This tool collects no health details.',
    ),
    false,
    ['PD-403'],
  );

  const discretion = check(
    'my.pr.discretion',
    L('移民总监批准', 'Director General’s approval'),
    undefined,
    route === 'rep'
      ? [act('s.10(2) p18'), ref('SRC-526', '权益第 04 项')]
      : [act('s.10(2) p18'), ref('SRC-507', '页面正文')],
    L(
      '移民法写移民总监"可以"签发，移民局称永久居留是政府给外国人的最高待遇；审批标准未公开，结果无法预判。',
      'The Immigration Act says the Director General "may" issue the permit, and the Department calls it the highest privilege granted to a foreign national. The criteria are not published, so the result cannot be predicted.',
    ),
    ['PD-400'],
  );

  const processing = info(
    'my.pr.processing',
    L('受理与处理时间', 'Receipt and processing time'),
    [guide('§6.4 p22'), ...v.prProcessingMonths.sources, guide('§7.3 p24')],
    L(
      `材料齐全才发收件确认（AP）；可在 AP 发出 ${v.prProcessingMonths.value} 个月后查询结果，决定书寄到担保人地址。这是目标时间，不是法定期限。`,
      `An acknowledgement of receipt (AP) is issued only for complete applications. The result can be checked ${v.prProcessingMonths.value} months after the AP and the decision is posted to the sponsor. This is a target, not a legal time limit.`,
    ),
  );

  const fee = withFee(
    info(
      'my.pr.fee',
      L('Permit Masuk 费用', 'Permit Masuk fee'),
      v.prFeeRm.sources,
      L(
        `RM${v.prFeeRm.value}，非现金支付，领证前缴付。REP 指南写作每年 RM${v.prFeeRm.value}，与一般指南的一次性写法不同。`,
        `RM${v.prFeeRm.value}, paid by card before the permit is issued. The REP guideline says RM${v.prFeeRm.value} a year, unlike the one-off wording of the general guideline.`,
      ),
      false,
      ['PD-404'],
    ),
    v.prFeeRm.value,
  );

  const c = v.prCollection.value;
  const afterApproval = info(
    'my.pr.after-approval',
    L('获批后领证与维持', 'Collection and keeping the permit'),
    [
      ...v.prCollection.sources,
      ...v.prAbsenceMonths.sources,
      guide('§§13–15 p32–34'),
    ],
    L(
      `批准信 ${c.approvalValidMonths} 个月内有效：先改现持准证效期，再于 ${c.collectionDays} 日内到总部缴费领证。Permit Masuk 无到期日，每次换护照须重新盖通知印章；在境外超过 ${v.prAbsenceMonths.value} 个月的，新印章暂缓并调查。持有人可居住、工作、读书、经商，不得投票、参政或担任公务员，危害公共秩序或属禁止类别可被注销。`,
      `The approval letter is valid for ${c.approvalValidMonths} months: first amend the current pass, then pay and collect at headquarters within ${c.collectionDays} days. The permit has no expiry; a new notice stamp is needed with each passport, and after more than ${v.prAbsenceMonths.value} months abroad the new stamp is deferred pending inquiry. Holders may live, work, study and run a business but may not vote, take part in politics or join the public service, and the permit can be cancelled on public order grounds or for a prohibited class.`,
    ),
    false,
    ['PD-412'],
  );

  const region =
    route === 'rep'
      ? info(
          'my.pr.region',
          L('有效地区', 'Where the permit is valid'),
          [ref('SRC-526', '权益第 04 项')],
          L(
            'REP 家属的永久居留只适用于半岛马来西亚。',
            'Permanent residence for REP family members applies only in Peninsular Malaysia.',
          ),
        )
      : info(
          'my.pr.region',
          L('有效地区', 'Where the permit is valid'),
          [guide('免责声明 p15'), guide('§13.4 p32'), guide('§14.5 p33')],
          L(
            '在半岛或纳闽登记的只在半岛有效，不能在沙巴、砂拉越居留；沙巴、砂拉越的申请须州政府支持。指南对沙巴、砂拉越登记者能否在半岛居留前后说法不一。',
            'A permit registered in the Peninsula or Labuan is valid only in the Peninsula, not Sabah or Sarawak; applications there need state support. The guideline is inconsistent on whether Sabah or Sarawak permits are valid in the Peninsula.',
          ),
          false,
          ['PD-413'],
        );

  return [
    passport,
    sponsor,
    referees,
    prohibited,
    ...(route === 'rep' ? [] : [previous, interview, means, language, health]),
    discretion,
    ...(route === 'rep' ? [] : [processing]),
    fee,
    afterApproval,
    region,
  ];
}

function category(
  ctx: MyContext,
  met: boolean | undefined,
  sources: readonly SourceRef[],
  explanation: string,
  pending: string[] = [],
) {
  return check(
    'my.pr.category',
    ctx.L('申请类别', 'Application category'),
    met,
    sources,
    explanation,
    pending,
  );
}

const titles = {
  wife: [
    '永久居留（Permit Masuk）：公民之妻',
    'Permanent residence (Permit Masuk): wife of a citizen',
  ],
  husband: [
    '永久居留（Permit Masuk）：公民之夫',
    'Permanent residence (Permit Masuk): husband of a citizen',
  ],
  child: [
    '永久居留（Permit Masuk）：公民的 18 岁以下子女',
    'Permanent residence (Permit Masuk): child of a citizen under 18',
  ],
  was: [
    '永久居留（Permit Masuk）：完全外国人（投资者、专家、专业人士）',
    'Permanent residence (Permit Masuk): fully foreign national (investor, expert, professional)',
  ],
  rep: [
    '永久居留（Permit Masuk）：回国专家计划（REP）参与者家属',
    'Permanent residence (Permit Masuk): family of a Returning Expert Programme participant',
  ],
} as const;

export function assessPrSpouse(
  ctx: MyContext,
  route: 'wife' | 'husband',
): MyPathway {
  const { req, L } = ctx;
  const tie = req.family?.tie;
  const wife = route === 'wife';
  const p = wife ? v.prWife : v.prHusband;
  const cat = category(
    ctx,
    tie === undefined
      ? undefined
      : tie === (wife ? 'wife-of-citizen' : 'husband-of-citizen'),
    [guide('§4 p17'), guide(wife ? '§5.1(b) p18' : '§5.2(b) p19')],
    wife
      ? L(
          '外籍女性，依法与马来西亚公民男性结婚。',
          'A foreign woman lawfully married to a Malaysian man.',
        )
      : L(
          '外籍男性，依法与马来西亚公民女性结婚。',
          'A foreign man lawfully married to a Malaysian woman.',
        ),
  );
  const registration = marriageRegistration(
    ctx,
    'my.pr.marriage-registration',
    [guide(wife ? '§5.1(b) p18' : '§5.2(b) p19')],
  );
  const marriage = marriageDuration(
    ctx,
    p.value.marriageYears,
    p.sources,
    true,
  );
  const pass = wife
    ? earlyPassCheck(
        ctx,
        'my.pr.spouse-pass',
        L(
          '公民配偶长期社交访问准证',
          'Spouse-of-citizen long-term social visit pass',
        ),
        ['ltsvp-spouse'],
        v.prWife.value.ltsvpMonths,
        v.prWife.sources,
        L(
          `须持"公民之妻"社交访问准证超过 ${v.prWife.value.ltsvpMonths} 个月，且递交时仍有效。`,
          `The wife-of-citizen social visit pass must have been held for more than ${v.prWife.value.ltsvpMonths} months and still be valid when applying.`,
        ),
        true,
      )
    : longPassCheck(
        ctx,
        'my.pr.spouse-pass',
        L(
          '公民配偶长期社交访问准证',
          'Spouse-of-citizen long-term social visit pass',
        ),
        ['ltsvp-spouse'],
        v.prHusband.value.ltsvpYears,
        v.prHusband.value.maxGapMonths,
        v.prHusband.sources,
        L(
          `须持"公民之夫"社交访问准证连续 ${v.prHusband.value.ltsvpYears} 年，中断不得超过 ${v.prHusband.value.maxGapMonths} 个月。`,
          `The husband-of-citizen social visit pass must have been held for ${v.prHusband.value.ltsvpYears} continuous years with no break longer than ${v.prHusband.value.maxGapMonths} months.`,
        ),
        true,
      );
  const checks = [
    cat,
    registration,
    marriage.check,
    pass.check,
    barredPass(ctx, SPOUSE_BARRED, guide('§2.4 p12')),
    ...commonChecks(ctx, route),
  ];
  const [zh, en] = titles[route];
  return assemble(ctx, `my.pr.${route}`, L(zh, en), checks, {
    discretionary: true,
    time: timing(latest(marriage.earliest, pass.earliest), ctx.date),
  });
}

/** "Anak kandung": a stepchild is not one; adoption is not addressed (PD-409). */
const biologicalChild = (
  relation: 'biological' | 'step' | 'adopted' | undefined,
) =>
  relation === 'biological' ? true : relation === 'step' ? false : undefined;

function childRelationText(
  ctx: MyContext,
  relation: 'biological' | 'step' | 'adopted' | undefined,
) {
  const { L } = ctx;
  return relation === 'step'
    ? L(
        '继子女不是亲生子女，不属此类别，可考虑 Residence Pass 第 3 类。',
        ' A stepchild is not a biological child and does not qualify; Residence Pass Category 3 is an alternative.',
      )
    : relation === 'adopted'
      ? L(
          '依法收养的子女是否视同亲生，指南未写明，待确认；可考虑 Residence Pass 第 3 类。',
          ' The guideline does not say whether a legally adopted child counts as a biological child; Residence Pass Category 3 is an alternative.',
        )
      : '';
}

export function assessPrChild(ctx: MyContext): MyPathway {
  const { req, date, L } = ctx;
  const tie = req.family?.tie;
  const relation = req.family?.childRelation;
  const cat = category(
    ctx,
    tie === undefined
      ? undefined
      : tie !== 'child-of-citizen'
        ? false
        : biologicalChild(relation),
    [guide('§4 p17'), guide('§5.3(c) p20'), guide('附录 C2 p60')],
    L(
      '马来西亚公民的亲生子女；境外出生证须经原籍国使馆与马来西亚外交部认证。',
      'A biological child of a Malaysian citizen; a foreign birth certificate must be certified by the home country’s embassy and the Malaysian Ministry of Foreign Affairs.',
    ) + childRelationText(ctx, relation),
    relation === 'adopted' ? ['PD-409'] : [],
  );
  const underAge = v.prChild.value.underAge;
  const years = age(req.dateOfBirth, date);
  const deadline = req.dateOfBirth && birthday(req.dateOfBirth, underAge);
  const ageCheck = check(
    'my.pr.child-age',
    L('申请时年龄', 'Age when applying'),
    years === undefined ? undefined : years < underAge,
    v.prChild.sources,
    L(
      `递交时须未满 ${underAge} 岁。`,
      `The child must be under ${underAge} on the filing date.`,
    ) +
      (deadline
        ? L(`须在 ${deadline} 之前递交。`, ` Apply before ${deadline}.`)
        : ''),
  );
  const pass = earlyPassCheck(
    ctx,
    'my.pr.qualifying-pass',
    L('所持长期准证', 'Long-term pass held'),
    CHILD_PASSES,
    v.prChild.value.passMonths,
    v.prChild.sources,
    L(
      `须持社交访问、学生、专业访问或 Residence Pass 超过 ${v.prChild.value.passMonths} 个月，且递交时仍有效。`,
      `A social visit, student, professional visit or Residence Pass must have been held for more than ${v.prChild.value.passMonths} months and still be valid when applying.`,
    ),
  );
  const earliest = latest(pass.earliest);
  return assemble(
    ctx,
    'my.pr.child',
    L(...titles.child),
    [cat, ageCheck, pass.check, ...commonChecks(ctx, 'child')],
    {
      discretionary: true,
      time: timing(
        earliest && deadline && earliest >= deadline ? null : earliest,
        date,
      ),
    },
  );
}

/** Permit Masuk deposit by nationality, for WAS and REP family. */
function depositCheck(ctx: MyContext, sources: readonly SourceRef[]) {
  const { req, L } = ctx;
  const d = v.prDepositRm.value;
  const amount =
    req.nationality === undefined
      ? undefined
      : (d.byNationality[req.nationality] ?? d.otherCountries);
  return withFee(
    info(
      'my.pr.deposit',
      L('押金（Wang Cagaran）', 'Deposit (Wang Cagaran)'),
      sources,
      L(
        `按国籍缴纳，其他国家为 RM${d.otherCountries}；持永久居留满 ${d.refundYears} 年后可申请退还。`,
        `Set by nationality, RM${d.otherCountries} for countries not listed, and refundable after holding the permit for ${d.refundYears} years.`,
      ) +
        (amount === undefined
          ? ''
          : L(
              `按所填国籍为 RM${amount}。`,
              ` For the nationality entered it is RM${amount}.`,
            )),
      amount !== undefined,
    ),
    amount,
  );
}

const WAS_TIES = ['none', 'spouse-of-pr', 'child-of-pr', 'former-citizen'];

export function assessPrWas(ctx: MyContext): MyPathway {
  const { req, L } = ctx;
  const tie = req.family?.tie;
  const p = v.prWas.value;
  const cat = category(
    ctx,
    tie === undefined ? undefined : WAS_TIES.includes(tie),
    [guide('§3.11 p14'), guide('§4 p17')],
    L(
      '与马来西亚公民没有亲属关系的外国人。',
      'A foreign national with no family relationship to a Malaysian citizen.',
    ),
  );
  const pass = longPassCheck(
    ctx,
    'my.pr.qualifying-pass',
    L('所持长期准证', 'Long-term pass held'),
    WAS_PASSES,
    p.passYears,
    p.maxGapMonths,
    v.prWas.sources,
    L(
      `须持就业、学生、专业访问或 Residence Pass（含 RP-T）连续 ${p.passYears} 年，中断不得超过 ${p.maxGapMonths} 个月；MM2H、PVIP、PLKS 期间不计。`,
      `An Employment, Student, Professional Visit or Residence Pass (including RP-T) must have been held for ${p.passYears} continuous years with no break longer than ${p.maxGapMonths} months; MM2H, PVIP and PLKS time does not count.`,
    ),
  );
  const recognised = req.was?.regulatorRecognition;
  const field = check(
    'my.pr.field-recognition',
    L(
      '投资者、专家或专业人士认可',
      'Recognition as an investor, expert or professional',
    ),
    recognised ? true : undefined,
    [guide('§5.4(c) p21'), guide('附录 B1–B2 p53–56')],
    L(
      '只限经马来西亚监管机构认可领域的投资者、专家和专业人士；附录列 10 个监管机构和关键职业清单，所需证明形式未公开。',
      'Only investors, experts and professionals in fields recognised by a Malaysian regulatory agency qualify. The appendices list 10 agencies and critical occupations; the form of proof is not published.',
    ) +
      (recognised
        ? L(
            '所填已有监管机构认可证明。',
            ' Recognition from a regulatory agency is reported.',
          )
        : '') +
      (req.was?.criticalOccupation
        ? L(
            '所填职业在关键职业清单内。',
            ' The occupation is reported to be on the critical occupation list.',
          )
        : ''),
    ['PD-408'],
  );
  const deposit = depositCheck(ctx, [
    guide('附录 B3 p57'),
    guide('§9.2–9.3 p26'),
  ]);
  const dependants = info(
    'my.pr.dependants',
    L('配偶与子女同时申请', 'Spouse and children applying together'),
    [guide('§5.4(e)–(f) p21')],
    L(
      `可与配偶及亲生子女一同申请；配偶和未满 ${p.childUnderAge} 岁的子女须持社交访问、学生、就业、受养人或 Residence Pass 超过 ${p.dependantPassMonths} 个月，且仍有效。`,
      `The spouse and biological children may apply together. The spouse and children under ${p.childUnderAge} must have held a Social Visit, Student, Employment, Dependant or Residence Pass for more than ${p.dependantPassMonths} months, still valid.`,
    ),
  );
  const checks = [
    cat,
    pass.check,
    barredPass(ctx, WAS_BARRED, guide('§2.5 p12')),
    field,
    ...commonChecks(ctx, 'was'),
  ];
  checks.splice(
    checks.findIndex((c) => c.id === 'my.pr.fee') + 1,
    0,
    deposit,
    dependants,
  );
  return assemble(ctx, 'my.pr.was', L(...titles.was), checks, {
    discretionary: true,
    time: timing(latest(pass.earliest), ctx.date),
  });
}

export function assessPrRep(ctx: MyContext): MyPathway {
  const { req, date, L } = ctx;
  const r = req.rep;
  const p = v.rep.value;
  const relation = r?.relation;
  const childRelation = req.family?.childRelation;
  const separated =
    relation !== 'child' && req.family?.separatedOrDivorced === true;
  const cat = category(
    ctx,
    relation === undefined
      ? undefined
      : relation === 'none'
        ? false
        : all(
            r?.participantHasSatk,
            relation === 'child'
              ? biologicalChild(childRelation)
              : separated
                ? undefined
                : true,
          ),
    [repGuide('§4 p16'), repGuide('§5.1 p16')],
    L(
      `REP 参与者（马来西亚公民）的外籍配偶或未满 ${p.childUnderAge} 岁的亲生子女，参与者须已获 TalentCorp 发出的 SATK。`,
      `The foreign spouse or biological child under ${p.childUnderAge} of an REP participant (a Malaysian citizen) who has received the SATK from TalentCorp.`,
    ) +
      (relation === 'child' ? childRelationText(ctx, childRelation) : '') +
      (separated
        ? L(
            '所填已分居或离婚：离婚后不再是参与者的配偶，只分居则仍是；此项未区分两者，待确认。',
            ' A separation or divorce is reported: after a divorce the applicant is no longer the participant’s spouse, while a separated spouse still is; the answer does not say which.',
          )
        : ''),
    relation === 'child' && childRelation === 'adopted'
      ? ['PD-409']
      : separated
        ? ['PD-405']
        : [],
  );
  const checks: MyCheck[] = [cat];
  let earliest: IsoDate | null | undefined;
  if (relation === 'child') {
    const years = age(req.dateOfBirth, date);
    checks.push(
      check(
        'my.pr.child-age',
        L('申请时年龄', 'Age when applying'),
        years === undefined ? undefined : years < p.childUnderAge,
        [repGuide('§4(b) p16')],
        L(
          `递交时须未满 ${p.childUnderAge} 岁。`,
          `The child must be under ${p.childUnderAge} on the filing date.`,
        ),
      ),
    );
    earliest =
      years === undefined ? undefined : years < p.childUnderAge ? date : null;
  } else {
    const years =
      relation === 'husband' ? p.husbandMarriageYears : p.wifeMarriageYears;
    const marriage = marriageDuration(
      ctx,
      years,
      [repGuide('§5.3 p16')],
      false,
    );
    checks.push(
      marriage.check,
      check(
        'my.pr.rep-marriage-timing',
        L('结婚时间早于 REP 申请', 'Married before the REP application'),
        r?.marriedBeforeRepApplication,
        [ref('SRC-526', '权益第 04 项')],
        L(
          '参与者与外籍配偶须在递交 REP 申请之前已结婚。',
          'The participant and the foreign spouse must have married before the REP application was submitted.',
        ),
      ),
    );
    earliest = marriage.earliest;
  }
  checks.push(
    check(
      'my.pr.rep-approval-letter',
      L('REP 批准信有效期', 'REP approval letter validity'),
      r?.approvalLetterValidUntil === undefined
        ? undefined
        : date <= r.approvalLetterValidUntil,
      [repGuide('§5.4 p17')],
      L(
        '须在 REP 批准信有效期内递交。',
        'The application must be made while the REP approval letter is valid.',
      ),
    ),
    ...commonChecks(ctx, 'rep'),
  );
  checks.splice(
    checks.findIndex((c) => c.id === 'my.pr.fee'),
    0,
    withFee(
      info(
        'my.pr.rep-ltsvp-fee',
        L('长期社交访问准证费用', 'Long-term social visit pass fee'),
        [repGuide('§11.1–11.2 p25')],
        L(
          `每年 RM${p.ltsvpFeePerYearRm}，以信用卡或借记卡支付。`,
          `RM${p.ltsvpFeePerYearRm} a year, paid by credit or debit card.`,
        ),
      ),
      p.ltsvpFeePerYearRm,
    ),
  );
  checks.splice(
    checks.findIndex((c) => c.id === 'my.pr.fee') + 1,
    0,
    depositCheck(ctx, [repGuide('§11.3–11.4 p25'), repGuide('Lampiran 9 p36')]),
  );
  const deadline = r?.approvalLetterValidUntil;
  return assemble(ctx, 'my.pr.rep-family', L(...titles.rep), checks, {
    discretionary: true,
    time: timing(
      earliest && deadline && earliest > deadline ? null : earliest,
      date,
    ),
  });
}

const RP_CATEGORY = {
  'wife-of-citizen': 3,
  'husband-of-citizen': 3,
  'child-of-citizen': 3,
  'parent-of-citizen': 3,
  'spouse-of-pr': 4,
  'child-of-pr': 4,
  'former-citizen': 5,
  none: undefined,
} as const;

export function assessResidencePass(ctx: MyContext): MyPathway {
  const { req, date, L } = ctx;
  const p = v.residencePass.value;
  const src = v.residencePass.sources;
  const tie = req.family?.tie;
  const cat = tie && RP_CATEGORY[tie];
  const checks: MyCheck[] = [
    check(
      'my.rp.category',
      L('Residence Pass 类别', 'Residence Pass category'),
      tie === undefined
        ? undefined
        : cat !== undefined &&
            !(
              tie === 'child-of-pr' &&
              req.family?.childRelation !== undefined &&
              req.family.childRelation !== 'biological'
            ),
      src,
      L(
        '第 3 类为公民的配偶、子女、父母、公婆及有公民子女监护权的离婚或丧偶者；第 4 类为永久居民的配偶及亲生子女；第 5 类为自愿放弃或被褫夺公民身份的前公民。',
        'Category 3 covers a citizen’s spouse, children, parents, parents-in-law and a divorced or widowed parent with custody of a citizen child; Category 4 a permanent resident’s spouse and biological children; Category 5 former citizens who renounced or were deprived of citizenship.',
      ) +
        (cat
          ? L(
              `按所填关系属第 ${cat} 类。`,
              ` The relationship entered falls in Category ${cat}.`,
            )
          : ''),
    ),
  ];
  if (tie === 'child-of-citizen' || tie === 'child-of-pr') {
    const years = age(req.dateOfBirth, date);
    checks.push(
      check(
        'my.rp.child-age',
        L('子女年龄', 'Child’s age'),
        years === undefined ? undefined : years <= p.childMaxAge,
        src,
        L(
          `子女须为 ${p.childMaxAge} 岁及以下。`,
          `The child must be aged ${p.childMaxAge} or under.`,
        ),
      ),
    );
  }
  checks.push(
    check(
      'my.rp.passport',
      L('护照有效期', 'Passport validity'),
      req.passportExpiry === undefined
        ? undefined
        : req.passportExpiry >= addMonths(date, p.passportMonths),
      src,
      L(
        `护照须至少还有 ${p.passportMonths} 个月有效。`,
        `The passport must have at least ${p.passportMonths} months left.`,
      ),
    ),
  );
  const years =
    cat === 3 ? p.citizenFamilyYears : cat === 4 ? p.prFamilyYears : undefined;
  const run = heldRun(req.passes, LONG_TERM, date);
  let earliest: IsoDate | null | undefined;
  if (years === undefined) {
    checks.push(
      check(
        'my.rp.long-term-pass',
        L('有效长期准证', 'Valid long-term pass'),
        run?.valid,
        src,
        L(
          '须正持有效的长期准证在马来西亚居住。',
          'The applicant must be living in Malaysia on a valid long-term pass.',
        ),
      ),
    );
    earliest = run ? (run.valid ? date : null) : undefined;
  } else {
    const met = !run
      ? undefined
      : !run.valid
        ? false
        : date >= addYears(run.start, years)
          ? true
          : run.total >= daysBetween(addYears(date, -years), date)
            ? undefined
            : false;
    checks.push(
      check(
        'my.rp.long-term-pass',
        L('持长期准证居住年数', 'Years on a long-term pass'),
        met,
        src,
        L(
          `第 ${cat} 类须持有效长期准证在马来西亚居住至少 ${years} 年，申请时准证仍有效。`,
          `Category ${cat} requires at least ${years} years in Malaysia on a valid long-term pass, still valid when applying.`,
        ) +
          (run?.valid
            ? L(
                `当前不间断持有自 ${run.start} 起。`,
                ` The current unbroken holding began on ${run.start}.`,
              )
            : run
              ? L(
                  '申请日没有有效的长期准证。',
                  ' No long-term pass is valid on the application date.',
                )
              : '') +
          (met === undefined && run
            ? L(
                '只有合并中断前的期间才满年数，是否须连续未写明。',
                ' The years are reached only by adding periods before a break; the page does not say whether they must be continuous.',
              )
            : ''),
        ['PD-429'],
      ),
    );
    earliest = run
      ? run.valid
        ? addYears(run.start, years)
        : null
      : undefined;
  }
  checks.push(
    check(
      'my.rp.sponsor',
      L('担保人', 'Sponsor'),
      req.citizenSponsor,
      src,
      L(
        `由年满 ${p.sponsorMinAge} 岁的马来西亚公民担保（沙巴、砂拉越须由当地籍公民担保），递交时双方须到场。`,
        `Sponsored by a Malaysian citizen aged ${p.sponsorMinAge} or over (of Sabah or Sarawak origin for applications there); both must attend when documents are submitted.`,
      ),
    ),
    withFee(
      info(
        'my.rp.fee',
        L('准证费用', 'Pass fee'),
        src,
        L(
          `每 ${p.feeYears} 年 RM${p.feeRm}，另加按国籍的多次入境签证费。`,
          `RM${p.feeRm} for ${p.feeYears} years, plus a multiple-entry visa fee by nationality.`,
        ),
      ),
      p.feeRm,
    ),
    info(
      'my.rp.rights',
      L('持有人权利', 'What holders may do'),
      src,
      L(
        '可工作、读书、经商，无须改换其他准证，但须遵守相关机关的条件。',
        'Holders may work, study and set up a business without changing passes, subject to the conditions of other authorities.',
      ),
    ),
  );
  if (tie === 'husband-of-citizen' || tie === 'wife-of-citizen')
    checks.push(
      info(
        'my.rp.pr-link',
        L(
          '与永久居留申请的关系',
          'Effect on a permanent residence application',
        ),
        [
          guide(tie === 'wife-of-citizen' ? '§5.1(d) p18' : '§5.2(d) p19'),
          ...src,
        ],
        (tie === 'wife-of-citizen'
          ? L(
              `公民之妻申请永久居留须持"公民之妻"社交访问准证超过 ${v.prWife.value.ltsvpMonths} 个月且递交时有效；`,
              `A wife applying for permanent residence needs more than ${v.prWife.value.ltsvpMonths} months on the wife-of-citizen social visit pass, still valid when applying;`,
            )
          : L(
              `公民之夫申请永久居留须持"公民之夫"社交访问准证连续 ${v.prHusband.value.ltsvpYears} 年；`,
              `A husband applying for permanent residence needs ${v.prHusband.value.ltsvpYears} continuous years on the husband-of-citizen social visit pass;`,
            )) +
          L(
            '改持 Residence Pass 的期间能否计入待确认。',
            ' whether time on a Residence Pass counts needs confirmation.',
          ),
        false,
        ['PD-428'],
      ),
    );
  return assemble(
    ctx,
    'my.rp.family',
    L('Residence Pass（第 3–5 类）', 'Residence Pass (Categories 3–5)'),
    checks,
    {
      time: timing(earliest, date),
    },
  );
}
