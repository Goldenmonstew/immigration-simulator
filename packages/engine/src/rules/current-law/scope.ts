import { routeNames } from '@uk-immigration/policy-data';
import { episodeOn } from '../../residence';
import { defineRule, nameIn, textFor } from '../../rule';
import type { Route } from '@uk-immigration/policy-data';
import {
  MAIN_ONLY_ROUTES,
  RULE_SET,
  applicationPresence,
  globalTalentDependant,
  hongKongBnoDependant,
  isSkilledWorkerDependant,
  onFamilyChild,
  onFamilyPartner,
  onFamilyPartnerFiveYear,
  onFamilyPartnerTenYear,
  onGlobalTalent,
  onHongKongBno,
  onInnovatorFounder,
  onPrivateLife,
  onProtection,
  onSkilledWorker,
  onSkilledWorkerChild,
  onSkilledWorkerPartner,
  onUkAncestry,
} from './shared';
import { ukAncestryResidence } from './ancestry';
import { onFiveYearFamilyChild } from './family';
import { longResidenceMet } from './long-residence';

export const clScope = defineRule(
  {
    id: 'CL-SCOPE',
    ruleSetId: RULE_SET,
    title: '在现行规则的建模范围内',
    titleEn: 'Within the scope of the modelled current rules',
    sources: [
      { srcId: 'SRC-004', locator: 'SW 21.1' },
      { srcId: 'SRC-004', locator: 'SW 39.1' },
      { srcId: 'SRC-004', locator: 'SW 41A.1' },
      { srcId: 'SRC-005', locator: 'LR 11.1' },
      { srcId: 'SRC-020', locator: 'HK 62.1' },
      { srcId: 'SRC-021', locator: 'GT 11.1' },
      { srcId: 'SRC-022', locator: 'SETF 1.3' },
      { srcId: 'SRC-023', locator: 'STP 1.3' },
      { srcId: 'SRC-026', locator: 'UKA 13.1' },
      { srcId: 'SRC-027', locator: 'INNF 18.1' },
      { srcId: 'SRC-028', locator: 'PL 14.1' },
      { srcId: 'SRC-020', locator: 'HK 57.1' },
      { srcId: 'SRC-021', locator: 'GT 27.1' },
      { srcId: 'SRC-022', locator: 'SETF 12.1' },
      { srcId: 'SRC-024', locator: 'D-LTRC.1.1' },
      { srcId: 'SRC-029', locator: 'para 298' },
    ],
    pendingDetails: [],
  },
  (ctx) => {
    const { timeline, simulationDate } = ctx;
    const L = textFor(ctx);
    const rn = (r: Route) => nameIn(L, routeNames[r]);
    const current = episodeOn(timeline, simulationDate);
    const presence = applicationPresence(timeline, simulationDate, L);
    if (presence && current?.route === 'SKILLED_WORKER') {
      return {
        ...presence,
        sources: [
          {
            srcId: 'SRC-004',
            locator: current.role === 'MAIN' ? 'SW 19.2(d)' : 'SW 37.2(d)',
          },
        ],
      };
    }
    if (presence && onFamilyPartnerFiveYear(timeline, simulationDate)) {
      return {
        ...presence,
        sources: [{ srcId: 'SRC-024', locator: 'R-ILRP.1.1(a), E-ILRP.1.2' }],
      };
    }
    if (presence && current) {
      const source =
        current.route === 'HONG_KONG_BNO'
          ? { srcId: 'SRC-020', locator: 'HK 55.2(e)' }
          : current.route === 'GLOBAL_TALENT'
            ? {
                srcId: 'SRC-021',
                locator: current.role === 'MAIN' ? 'GT 8.2(d)' : 'GT 25.2(d)',
              }
            : onInnovatorFounder(timeline, simulationDate)
              ? { srcId: 'SRC-027', locator: 'INNF 15.2(d)' }
              : onPrivateLife(timeline, simulationDate)
                ? { srcId: 'SRC-028', locator: 'PL 11.2(d)' }
                : onFamilyPartnerTenYear(timeline, simulationDate)
                  ? { srcId: 'SRC-022', locator: 'SETF 1.2(d)' }
                  : ctx.principal &&
                      onFamilyChild(timeline, simulationDate) &&
                      !onFiveYearFamilyChild(ctx)
                    ? { srcId: 'SRC-022', locator: 'SETF 10.2(d)' }
                    : undefined;
      if (source) return { ...presence, sources: [source] };
    }
    if (onHongKongBno(timeline, simulationDate)) {
      return {
        status: 'PASS',
        explanation: L(
          '当前持 Hong Kong BN(O) 主申请人许可（BN(O) Status Holder 或 BN(O) Adult Child），按 Appendix Hong Kong British National (Overseas) 与 Appendix Long Residence 评估。',
          'Currently holds Hong Kong BN(O) permission as the main applicant (BN(O) Status Holder or BN(O) Adult Child); assessed under Appendix Hong Kong British National (Overseas) and Appendix Long Residence.',
        ),
      };
    }
    if (onGlobalTalent(timeline, simulationDate)) {
      return {
        status: 'PASS',
        explanation: L(
          '当前持 Global Talent 主申请人许可，按 Appendix Global Talent 与 Appendix Long Residence 评估。',
          'Currently holds Global Talent permission as the main applicant; assessed under Appendix Global Talent and Appendix Long Residence.',
        ),
      };
    }
    if (onProtection(timeline, simulationDate)) {
      return {
        status: 'PASS',
        explanation: current
          ? L(
              '当前以主申请人身份持 refugee status 或 humanitarian protection 的许可，按 Appendix Settlement Protection 与 Appendix Long Residence 评估。',
              'Currently holds permission with refugee status or humanitarian protection as the main applicant; assessed under Appendix Settlement Protection and Appendix Long Residence.',
            )
          : L(
              '最后获批的是主申请人保护许可，按 STP 1.3 纳入 Appendix Settlement Protection 评估。',
              'The last grant was protection permission as a main applicant and is assessed under Appendix Settlement Protection (STP 1.3).',
            ),
      };
    }
    if (onUkAncestry(timeline, simulationDate)) {
      return {
        status: 'PASS',
        explanation: L(
          '当前持 UK Ancestry 主申请人许可，按 Appendix UK Ancestry 与 Appendix Long Residence 评估。',
          'Currently holds UK Ancestry permission as the main applicant; assessed under Appendix UK Ancestry and Appendix Long Residence.',
        ),
      };
    }
    if (ukAncestryResidence(ctx)) {
      if (presence) {
        return {
          ...presence,
          sources: [{ srcId: 'SRC-026', locator: 'UKA 10.2(d)' }],
        };
      }
      return {
        status: 'PASS',
        explanation: L(
          '曾持有可计入定居的 UK Ancestry 主申请人许可，按 Appendix UK Ancestry 与 Appendix Long Residence 评估（CR 1.1(d)）。',
          'Previous UK Ancestry main applicant permission qualifies for assessment under Appendix UK Ancestry and Appendix Long Residence (CR 1.1(d)).',
        ),
      };
    }
    if (onInnovatorFounder(timeline, simulationDate)) {
      return {
        status: 'PASS',
        explanation: L(
          '当前持 Innovator Founder 主申请人许可，按 Appendix Innovator Founder 与 Appendix Long Residence 评估。',
          'Currently holds Innovator Founder permission as the main applicant; assessed under Appendix Innovator Founder and Appendix Long Residence.',
        ),
      };
    }
    if (onPrivateLife(timeline, simulationDate)) {
      return {
        status: 'PASS',
        explanation: L(
          '当前持 Appendix Private Life 主申请人许可，按 Appendix Private Life 与 Appendix Long Residence 评估。',
          'Currently holds Appendix Private Life permission as the main applicant; assessed under Appendix Private Life and Appendix Long Residence.',
        ),
      };
    }
    if (onFamilyPartner(timeline, simulationDate)) {
      return {
        status: 'PASS',
        explanation: L(
          '当前持 Appendix FM 的伴侣许可，按伴侣的定居要求与 Appendix Long Residence 评估。',
          'Currently holds permission as a partner under Appendix FM; assessed under the partner settlement requirements and Appendix Long Residence.',
        ),
      };
    }
    if (onSkilledWorker(timeline, simulationDate)) {
      return {
        status: 'PASS',
        explanation: L(
          '当前持 Skilled Worker 主申请人许可，按 Appendix Skilled Worker 与 Appendix Long Residence 评估。',
          'Currently holds Skilled Worker permission as the main applicant; assessed under Appendix Skilled Worker and Appendix Long Residence.',
        ),
      };
    }
    const partner = onSkilledWorkerPartner(timeline, simulationDate);
    if (partner && ctx.principal) {
      return {
        status: 'PASS',
        explanation: L(
          '当前持 Skilled Worker 的 dependent partner 许可，按 Appendix Skilled Worker 的伴侣定居要求（SW 38–SW 46）与 Appendix Long Residence 评估。',
          'Currently holds Skilled Worker permission as a dependent partner; assessed under the partner settlement requirements of Appendix Skilled Worker (SW 38–SW 46) and Appendix Long Residence.',
        ),
      };
    }
    const child = onSkilledWorkerChild(timeline, simulationDate);
    if (child && ctx.principal) {
      return {
        status: 'PASS',
        explanation: L(
          '当前持 Skilled Worker 的 dependent child 许可，按 Appendix Skilled Worker 的子女定居要求（SW 38–SW 46、Appendix Children）与 Appendix Long Residence 评估。',
          'Currently holds Skilled Worker permission as a dependent child; assessed under the child settlement requirements of Appendix Skilled Worker (SW 38–SW 46, Appendix Children) and Appendix Long Residence.',
        ),
      };
    }
    // Dependants of contracts §15; only a Hong Kong BN(O) partner or adult
    // child is assessed without the principal.
    const hkDependant = hongKongBnoDependant(timeline, simulationDate);
    if (hkDependant === 'OWN') {
      return {
        status: 'PASS',
        explanation: L(
          '当前持 Hong Kong BN(O) 的 dependant 许可（伴侣或已满 18 岁的子女），按本人在 Appendix Hong Kong BN(O) 的定居要求（HK 55–HK 64）与 Appendix Long Residence 评估。',
          'Currently holds Hong Kong BN(O) permission as a dependant (partner, or child aged 18 or over); assessed on their own under the settlement requirements of Appendix Hong Kong BN(O) (HK 55–HK 64) and Appendix Long Residence.',
        ),
      };
    }
    if (hkDependant && ctx.principal) {
      return {
        status: 'PASS',
        explanation: L(
          `当前持 Hong Kong BN(O) 的 dependant 许可（${hkDependant === 'CHILD' ? '未满 18 岁的子女，HK 57' : 'adult dependant relative，HK 59.1'}），按 Appendix Hong Kong BN(O) 与 Appendix Long Residence 评估。`,
          `Currently holds Hong Kong BN(O) permission as a dependant (${hkDependant === 'CHILD' ? 'child under 18, HK 57' : 'adult dependant relative, HK 59.1'}); assessed under Appendix Hong Kong BN(O) and Appendix Long Residence.`,
        ),
      };
    }
    const gtDependant = globalTalentDependant(timeline, simulationDate);
    if (gtDependant && ctx.principal) {
      return {
        status: 'PASS',
        explanation: L(
          `当前持 Global Talent 的 dependent ${gtDependant === 'PARTNER' ? 'partner' : 'child'} 许可，按 Appendix Global Talent 的 dependant 定居要求（GT 25–GT 34）与 Appendix Long Residence 评估。`,
          `Currently holds Global Talent permission as a dependent ${gtDependant === 'PARTNER' ? 'partner' : 'child'}; assessed under the dependant settlement requirements of Appendix Global Talent (GT 25–GT 34) and Appendix Long Residence.`,
        ),
      };
    }
    if (ctx.principal && onFamilyChild(timeline, simulationDate)) {
      return {
        status: 'PASS',
        explanation: onFiveYearFamilyChild(ctx)
          ? L(
              '当前持 Appendix FM 5 年路线伴侣的 dependent child 许可，按 Immigration Rules Part 8 第 298 段的子女定居要求（D-LTRC.1.1 末句）与 Appendix Long Residence 评估。',
              'Currently holds permission as the dependent child of a partner on the 5-year Appendix FM route; assessed under the child settlement requirements of paragraph 298 of Part 8 of the Immigration Rules (last sentence of D-LTRC.1.1) and Appendix Long Residence.',
            )
          : L(
              '当前持 Appendix FM 伴侣或父母的 dependent child 许可，按 Appendix Settlement Family Life 的子女定居要求（SETF 10–SETF 17）与 Appendix Long Residence 评估。',
              'Currently holds permission as the dependent child of an Appendix FM partner or parent; assessed under the child settlement requirements of Appendix Settlement Family Life (SETF 10–SETF 17) and Appendix Long Residence.',
            ),
      };
    }
    if (longResidenceMet(ctx)) {
      if (presence)
        return {
          ...presence,
          sources: [{ srcId: 'SRC-005', locator: 'LR 9.3' }],
        };
      return {
        status: 'PASS',
        explanation: L(
          '按 CR 1.1 核对已满足 Long Residence 的连续合法居留年限，按 Appendix Long Residence 评估。',
          'Meets the continuous lawful residence period under CR 1.1 and is assessed under Appendix Long Residence.',
        ),
      };
    }
    if (
      current?.route === 'FAMILY_PARTNER_OR_PARENT' &&
      current.role === 'MAIN'
    ) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          '当前持 Appendix FM 的 parent 许可；现行法律栏只建模伴侣，父母路线未建模，也不满足 Long Residence 的 10 年。',
          'Currently holds permission as a parent under Appendix FM; the current rules are modelled only for partners, not the parent route, and the 10 years for Long Residence are not met.',
        ),
      };
    }
    if (
      current?.role === 'DEPENDANT' &&
      MAIN_ONLY_ROUTES.includes(current.route)
    ) {
      const modelled =
        hkDependant !== undefined ||
        gtDependant !== undefined ||
        onFamilyChild(timeline, simulationDate);
      // Routes whose dependants are modelled (contracts §15).
      const withDependants =
        current.route === 'HONG_KONG_BNO' ||
        current.route === 'GLOBAL_TALENT' ||
        current.route === 'FAMILY_PARTNER_OR_PARENT';
      if (modelled || (withDependants && !current.dependantOf)) {
        return {
          status: 'UNKNOWN',
          explanation: modelled
            ? L(
                `当前持${rn(current.route)}的 dependant 许可；填写主申请人信息后可判断。`,
                `Currently holds ${rn(current.route)} permission as a dependant; this can be assessed once the principal applicant’s details are provided.`,
              )
            : L(
                `当前持${rn(current.route)}的 dependant 许可，未填写是作为主申请人的伴侣、子女还是亲属随行。`,
                `Currently holds ${rn(current.route)} permission as a dependant; not provided whether this is as the principal applicant’s partner, child or relative.`,
              ),
        };
      }
      return {
        status: 'UNKNOWN',
        explanation: L(
          `当前持${rn(current.route)}的 dependant 许可；现行法律栏只建模该路线的主申请人，dependant 的定居条件无法判断。`,
          `Currently holds ${rn(current.route)} permission as a dependant; the current rules are modelled only for the main applicants of this route, so a dependant’s settlement requirements cannot be assessed.`,
        ),
      };
    }
    const explanation =
      current && isSkilledWorkerDependant(current)
        ? partner || child
          ? L(
              `当前持 Skilled Worker 的 dependent ${partner ? 'partner' : 'child'} 许可；填写主申请人信息后可按 SW 38–SW 46 判断。`,
              `Currently holds Skilled Worker permission as a dependent ${partner ? 'partner' : 'child'}; this can be assessed under SW 38–SW 46 once the principal applicant’s details are provided.`,
            )
          : L(
              '当前持 Skilled Worker 的 dependant 许可，未填写是作为主申请人的伴侣还是子女随行。',
              'Currently holds Skilled Worker permission as a dependant; not provided whether this is as the principal applicant’s partner or child.',
            )
        : L(
            '现行规则只建模了 Skilled Worker（主申请人及其 dependent partner / child）、Hong Kong BN(O) 与 Global Talent 主申请人及其 dependant、Appendix FM 伴侣及其子女（10 年路线按 Appendix Settlement Family Life，5 年路线的子女按 Immigration Rules Part 8 第 298 段）、持 refugee status 或 humanitarian protection 的主申请人、UK Ancestry、Innovator Founder 与 Private Life 主申请人、Long Residence；当前路线不在其中，也不满足 Long Residence 的 10 年，无法判断其他路线的定居条件。',
            'The current rules are modelled only for Skilled Worker (main applicants and their dependent partners / children), Hong Kong BN(O) and Global Talent main applicants and their dependants, Appendix FM partners and their children (Appendix Settlement Family Life on the 10-year route; paragraph 298 of Part 8 of the Immigration Rules for the children of 5-year route partners), main applicants with refugee status or humanitarian protection, UK Ancestry, Innovator Founder and Private Life main applicants, and Long Residence; the current route is none of these, and the 10 years for Long Residence are not met, so the settlement requirements of other routes cannot be assessed.',
          );
    return { status: 'UNKNOWN', explanation };
  },
);
