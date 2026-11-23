import { irelandFull2026_11 } from '@uk-immigration/policy-data';
import type { CountryResult } from '../country-result';
import { evaluateIreland } from '../ireland';
import type { IeRequest, IeStamp4Route } from '../ireland';
import { textFor } from '../rule';
import type { IsoDate } from '../types';
import { assessment, registration } from './common';
import type { IrelandRegistration } from './common';
import { directFamily, independentFamily } from './family';
import type { IrelandFamily } from './family';
import { longTermResidence } from './ltr';
import type { IrelandLtr } from './ltr';
import { naturalisation } from './naturalisation';
import type { IrelandCitizenship } from './naturalisation';
import { treatyResidence } from './treaty';
import type { IrelandTreatyResidence } from './treaty';
import { wcatt, workUpgrade } from './work';
import type { IrelandWcatt, IrelandWorkUpgrade } from './work';

const titles = {
  'IE-NATURALISATION': ['一般入籍', 'Ordinary naturalisation'],
  'IE-SPOUSE': [
    '爱尔兰公民配偶／民事伴侣入籍',
    'Naturalisation as an Irish citizen’s spouse or civil partner',
  ],
  'IE-MINOR-BORN-IN-STATE': [
    '在共和国出生的未成年人入籍',
    'Naturalisation of a minor born in the State',
  ],
  'IE-MINOR-NATURALISED-PARENT': [
    '已入籍父母为子女申请入籍',
    'Naturalisation of a child of a naturalised parent',
  ],
  'IE-IRISH-ASSOCIATIONS': [
    'Irish descent／Irish associations 入籍',
    'Naturalisation by Irish descent or Irish associations',
  ],
  'IE-PROTECTION': [
    '难民或无国籍人入籍',
    'Naturalisation for refugees or stateless people',
  ],
  'IE-PUBLIC-SERVICE': [
    '境外爱尔兰公共服务人员入籍',
    'Naturalisation for Irish public servants abroad',
  ],
  'IE-STAMP4-21': [
    '就业类 Stamp 4（CSEP、研究员、多地点 GEP 医师）',
    'Work Stamp 4 (CSEP, researchers and multi-site GEP doctors)',
  ],
  'IE-STAMP4-57': ['就业类 Stamp 4（GEP、ICT）', 'Work Stamp 4 (GEP and ICT)'],
  'IE-STAMP4-INDEPENDENT-FAMILY': [
    '家庭团聚转独立 Stamp 4',
    'Independent Stamp 4 after family reunification',
  ],
  'IE-STAMP5': [
    'Stamp 5（Without Condition As To Time）',
    'Stamp 5 (Without Condition As To Time)',
  ],
  'IE-STAMP4-IRISH-FAMILY': [
    '爱尔兰公民伴侣直接家庭 Stamp 4',
    'Direct family Stamp 4 for Irish citizens’ partners',
  ],
  'IE-LTR-PRINCIPAL': [
    'Long Term Residency 主申请人',
    'Long Term Residency for principal applicants',
  ],
  'IE-LTR-FAMILY': [
    'Long Term Residency 家属',
    'Long Term Residency for dependants',
  ],
  'IE-EU-PERMANENT': [
    'EU Treaty Rights 永久居留',
    'EU Treaty Rights permanent residence',
  ],
  'IE-WA-PERMANENT': [
    'Withdrawal Agreement 永久居留',
    'Withdrawal Agreement permanent residence',
  ],
} as const;

export type IrelandFullPathwayId = keyof typeof titles;

export interface IrelandFullRequest extends Omit<IeRequest, 'stamp4Route'> {
  pathways?: readonly IrelandFullPathwayId[];
  dateOfBirth?: IsoDate;
  birthplace?: 'state' | 'northern-ireland' | 'elsewhere';
  currentLocation?: 'state' | 'northern-ireland' | 'elsewhere';
  registration?: IrelandRegistration;
  citizenship?: IrelandCitizenship;
  work?: IrelandWorkUpgrade;
  family?: IrelandFamily;
  stamp5?: IrelandWcatt;
  ltr?: IrelandLtr;
  eu?: IrelandTreatyResidence;
  wa?: IrelandTreatyResidence;
}

/** Selected pathways are independent. Omit pathways to show the full route inventory. */
export function evaluateIrelandFull(
  request: IrelandFullRequest,
): CountryResult {
  const L = textFor(request);
  const {
    simulationDate: day,
    dateOfBirth: dob,
    birthplace,
    currentLocation,
    locale,
  } = request;
  const options =
    request.pathways ?? (Object.keys(titles) as IrelandFullPathwayId[]);
  const family = request.family;
  const renewal = family?.application?.registrationStage === 'renewal';
  const inState =
    currentLocation === undefined ? undefined : currentLocation === 'state';
  const timeline = (stamp4Route: IeStamp4Route) =>
    evaluateIreland({ ...request, stamp4Route });
  const legacyNaturalisation = options.some(
    (id) => id === 'IE-NATURALISATION' || id === 'IE-SPOUSE',
  )
    ? timeline('none')
    : undefined;
  const pathways = options.map((id) => {
    const a = assessment(day, locale);
    const directFamilyPath = id === 'IE-STAMP4-IRISH-FAMILY';
    const familyRenewal = renewal &&
      (directFamilyPath || id === 'IE-STAMP4-INDEPENDENT-FAMILY');
    let applicable: boolean | undefined = true;
    switch (id) {
      case 'IE-STAMP4-21':
      case 'IE-STAMP4-57': {
        const group = id === 'IE-STAMP4-21' ? 'csep' : 'gep';
        workUpgrade(a, group, timeline(group).pathways[2], request.work ?? {});
        break;
      }
      case 'IE-STAMP4-INDEPENDENT-FAMILY':
        independentFamily(
          a,
          timeline('spouse-1g').pathways[2],
          family ?? {},
          dob,
          inState,
        );
        break;
      case 'IE-STAMP5':
        wcatt(a, timeline('wcatt').pathways[2], request.stamp5 ?? {}, inState);
        break;
      case 'IE-STAMP4-IRISH-FAMILY':
        directFamily(a, family ?? {}, dob, inState);
        break;
      case 'IE-LTR-PRINCIPAL':
      case 'IE-LTR-FAMILY':
        longTermResidence(
          a,
          id === 'IE-LTR-FAMILY',
          request.ltr ?? {},
          inState,
        );
        break;
      case 'IE-EU-PERMANENT':
      case 'IE-WA-PERMANENT':
        treatyResidence(
          a,
          (id === 'IE-EU-PERMANENT' ? request.eu : request.wa) ?? {},
          id === 'IE-WA-PERMANENT',
          dob,
        );
        break;
      default:
        applicable = naturalisation(
          a,
          id,
          { ...request, stamp4Route: 'none' },
          request.citizenship ?? {},
          dob,
          birthplace,
          currentLocation,
          request.registration,
          legacyNaturalisation,
        );
    }
    if (id.startsWith('IE-STAMP') || id.startsWith('IE-LTR')) {
      const irishSpouseExemption =
        (directFamilyPath || familyRenewal) &&
        family?.sponsorIrish === true &&
        (family.relationship === 'spouse' || family.relationship === 'civil-partner') &&
        (familyRenewal
          ? family.application?.familyEvidenceComplete === true
          : family.relationshipValidAndGenuine === true);
      registration(
        a,
        request.registration,
        dob,
        birthplace === 'state',
        irishSpouseExemption,
        !directFamilyPath,
      );
    }
    const title = familyRenewal
      ? L('现有家庭许可续期', 'Renewal of existing family permission')
      : L(titles[id][0], titles[id][1]);
    return a.finish(id, title, applicable);
  });
  return {
    policyAsOf: irelandFull2026_11.asOf,
    columns: [
      {
        id: 'ie.current-law-2026-11',
        title: L('现行法律与政策', 'Current law and policy'),
        pathways,
      },
    ],
  };
}

export type {
  IrelandCharacter,
  IrelandRegistration,
  IrelandResidencePeriod,
} from './common';
export type { IrelandFamily } from './family';
export type { IrelandLtr } from './ltr';
export type { IrelandCitizenship } from './naturalisation';
export type { IrelandTreatyActivity, IrelandTreatyResidence } from './treaty';
export type {
  IrelandBurden,
  IrelandWcatt,
  IrelandWorkPermit,
  IrelandWorkUpgrade,
} from './work';
