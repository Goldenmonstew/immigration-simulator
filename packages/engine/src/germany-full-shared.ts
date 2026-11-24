import type { SourceRef } from '@uk-immigration/policy-data';
import type { CountryCheck } from './country-result';
import type { Locale } from './types';

export function src(number: number, locator: string): SourceRef {
  return { srcId: `SRC-${number}`, locator };
}

export function all(...facts: (boolean | undefined)[]): boolean | undefined {
  if (facts.includes(false)) return false;
  return facts.includes(undefined) ? undefined : true;
}

export function any(...facts: (boolean | undefined)[]): boolean | undefined {
  if (facts.includes(true)) return true;
  return facts.includes(undefined) ? undefined : false;
}

// The register distinguishes a missing fact from an unresolved individual decision.
const missingEvidence: Record<string, readonly [string, string]> = {
  'PD-340': [
    '需核实身份、可接受的证件或申请代理文书。',
    'Identity, accepted documents or representation still need verification.',
  ],
  'PD-341': [
    '仍需核实家庭范围、可计金额或收入能否持续。',
    'Household scope, qualifying amounts or continuing support still need verification.',
  ],
  'PD-343': [
    '本人或家属的承保范围和保险等效性尚未确认。',
    'Coverage or equivalence for the applicant or a family member is unconfirmed.',
  ],
  'PD-344': [
    '缺少可计养老月份、等值保障或已获准豁免的证明。',
    'Creditable pension months, equivalent provision or an accepted exemption have not been established.',
  ],
  'PD-345': [
    '尚缺安全核查资料，或案件、法定排除事由仍待决定。',
    'Security information is missing, or proceedings or exclusion grounds await a decision.',
  ],
  'PD-346': [
    '仍需核实岗位、认可资质、执业许可或就业批准。',
    'The job, recognised qualification, professional licence or employment approval still needs verification.',
  ],
  'PD-347': [
    '缺少认可的语言、知识证明或本档豁免决定。',
    'Accepted language or knowledge evidence or a waiver for this tier is missing.',
  ],
  'PD-348': [
    '须核实当地住房标准、主要住址或登记证明。',
    'Local housing standards, the main address or registration evidence need verification.',
  ],
  'PD-349': [
    '旧证件的法条、取得日期或适用的过渡规定尚未核清。',
    'The legal basis or date of an older document, or the applicable transition, is unresolved.',
  ],
  'PD-351': [
    '家庭生计比例、保护决定或 BAMF 通知尚未核实。',
    'The household support share, protection decision or BAMF notification is unconfirmed.',
  ],
  'PD-352': [
    '家庭关系、实际共同生活或供养范围仍需查明。',
    'The family relationship, shared household or scope of maintenance still needs establishing.',
  ],
  'PD-353': [
    '仍需核实这份许可的有效期间、境外记录及适用例外。',
    'The period of validity, absences and exceptions for this title still need verification.',
  ],
  'PD-354': [
    '尚缺相关人道或经营文书、可计期间，或机关个案决定。',
    'The relevant humanitarian or business record, credited period or discretionary decision is missing.',
  ],
  'PD-355': [
    '尚缺家庭居留、教育、实际工时或扶养方面的适用事实。',
    'Applicable facts about family residence, education, actual working hours or maintenance are missing.',
  ],
  'PD-356': [
    '任用文书、岗位资格或所需机关认定尚未核实。',
    'The appointment, qualifying post or required official assessment is unconfirmed.',
  ],
  'PD-359': [
    '缺少适用的申请阶段、收费资料或机关个案决定。',
    'The applicable application stage, charge or individual decision is unknown.',
  ],
};

export function check(
  locale: Locale | undefined,
  id: string,
  zh: string,
  en: string,
  met: boolean | undefined,
  sources: SourceRef[],
  pd: string,
  detail?: readonly [string, string],
): CountryCheck {
  const english = locale === 'en';
  const title = english ? en : zh;
  const pending = pd.match(/PD-\d+/g) ?? [];
  const reason =
    detail?.[english ? 1 : 0] ??
    (met === undefined
      ? missingEvidence[pending[0] ?? '']?.[english ? 1 : 0]
      : undefined) ??
    (met === undefined
      ? english
        ? 'The answers or the authority’s assessment are incomplete.'
        : '尚缺相关回答、证明或主管机关认定。'
      : met
        ? english
          ? 'The stated circumstances meet this condition.'
          : '所填情况符合此条件。'
        : english
          ? 'The stated circumstances do not meet this condition.'
          : '所填情况未达到此条件。');
  return {
    id,
    title,
    sources,
    status: met === undefined ? 'UNKNOWN' : met ? 'MET' : 'NOT_MET',
    explanation: reason,
    ...(met === undefined ? { pendingDetails: pending } : {}),
  };
}
