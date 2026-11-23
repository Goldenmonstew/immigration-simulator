import { japanFull2026_11 } from '@uk-immigration/policy-data';
import { addMonths, addYears } from './dates';
import {
  all,
  assemblePathway,
  check,
  filingContext,
  full,
  inapplicable,
  old,
  ref,
} from './japan-full-shared';
import type {
  JpFullCheck,
  JpFullContext,
  JpFullPathway,
} from './japan-full-shared';
import type { IsoDate } from './types';

interface JpTravelDates {
  departureOn?: IsoDate;
  returnOn?: IsoDate;
  stayExpiresOn?: IsoDate;
  stayIndefinite?: boolean;
  timelyRenewalPending?: boolean;
  renewalDecisionOn?: IsoDate;
  specialPermanentResident?: boolean;
  lawfulStatus?: boolean;
  permitVoided?: boolean;
  travelDocumentLost?: boolean;
  expiryCertificateObtained?: boolean;
  newLandingOn?: IsoDate;
}

interface JpTravelPermit {
  effectiveOn?: IsoDate;
  expiresOn?: IsoDate;
  extendedUntil?: IsoDate;
  extensionApproved?: boolean;
  /** An official limit specified on a refugee travel document. */
  entryDeadline?: IsoDate;
  entryDeadlineNotSpecified?: boolean;
}

export type JpFullReentryRequest = JpTravelDates &
  (
    | {
        route: 'ordinary';
        excludedStatusOrDetention?: boolean;
        inJapanWhenApplying?: boolean;
        intendsReturn?: boolean;
        passportOrApprovedAlternative?: boolean;
        residentCardOrCertificate?: boolean;
        permit?: JpTravelPermit;
        visits?: 'single' | 'multiple';
        channel?: 'counter' | 'online';
        onlineConcurrentEligibleApplication?: boolean;
        previouslyUsedSingleEntry?: boolean;
        consularExtension?: boolean;
        consularArea?: 'china-mainland' | 'other';
        extensionFeeOn?: IsoDate;
      }
    | {
        route: 'deemed';
        temporaryVisitor?: boolean;
        originalStayMonths?: number;
        passportValid?: boolean;
        residentCardOrCertificate?: boolean;
        formalPermitRequired?: boolean;
        declaredIntentAtDeparture?: boolean;
      }
    | {
        route: 'refugee-travel-document';
        refugeeRecognition?: boolean;
        hasJapaneseTravelDocument?: boolean;
        permit?: JpTravelPermit;
        consularExtension?: boolean;
        consularArea?: 'china-mainland' | 'other';
        extensionFeeOn?: IsoDate;
      }
  );

const earlier = (a: IsoDate, b: IsoDate) => (a < b ? a : b);

export function assessJapanReentry(
  req: JpFullContext,
  route: JpFullReentryRequest,
): JpFullPathway {
  const { date, L } = filingContext(req);
  const rr = full.reentry.value;
  const fees = full.fees.value;
  const travel = full.reentry.sources;
  const routeSources = {
    ordinary: [
      ref('SRC-110', '第26条'),
      ref('SRC-116', '再入国許可'),
      ref('SRC-461', '再入国許可申請「審査基準」「必要書類」'),
    ],
    deemed: [
      ref('SRC-110', '第19条の3・第26条の2'),
      ref('SRC-440', '第29条の4'),
      ref('SRC-442', '第23条第2項'),
      ref('SRC-116', 'Q57–61・みなし再入国許可'),
    ],
    'refugee-travel-document': [
      ref('SRC-110', '第61条の2の15'),
      ref('SRC-461', '難民旅行証明書の交付・返納'),
    ],
  }[route.route];
  const title =
    route.route === 'ordinary'
      ? L('普通再入国許可', 'Ordinary re-entry permit')
      : route.route === 'deemed'
        ? L('みなし再入国許可', 'Deemed re-entry')
        : L(
            '難民旅行証明書による往来',
            'Travel with a refugee travel document',
          );
  const checks: JpFullCheck[] = [];
  const r = (
    key: string,
    zh: string,
    en: string,
    met: boolean | undefined,
    sources: Parameters<typeof check>[3],
    detailZh: string,
    detailEn: string,
    pending: string[] = ['PD-379'],
    kind?: JpFullCheck['kind'],
  ) => {
    const item = check(
      `jp.reentry.${key}`,
      L(zh, en),
      met,
      sources,
      L(detailZh, detailEn),
      pending,
      kind,
    );
    checks.push(item);
    return item;
  };
  const excluded = (value: boolean | undefined) =>
    value === undefined ? undefined : !value;
  const departure = route.departureOn;
  const returned = route.returnOn;
  const stay = route.stayExpiresOn;
  const stayLimit =
    stay && route.timelyRenewalPending === true
      ? route.renewalDecisionOn
        ? earlier(
            addMonths(stay, old.renewalPendingMonths.value),
            route.renewalDecisionOn,
          )
        : addMonths(stay, old.renewalPendingMonths.value)
      : stay;
  const knowStay =
    route.specialPermanentResident === true ||
    route.stayIndefinite === true ||
    stayLimit !== undefined;
  let limit: IsoDate | undefined;
  let fee: number | undefined;

  if (route.route === 'ordinary') {
    r(
      'ordinary-eligibility',
      '普通再入国资格与材料',
      'Ordinary permit eligibility and documents',
      all(
        route.lawfulStatus,
        excluded(route.excludedStatusOrDetention),
        route.inJapanWhenApplying,
        route.intendsReturn,
        departure ? date <= departure : undefined,
        route.passportOrApprovedAlternative,
        route.residentCardOrCertificate,
      ),
      routeSources,
      '在日本以适用身份合法在留，赴海外前申请，确认返日意向、证件、获准替代材料及处分限制。',
      'Apply in Japan before departure while lawfully residing under a qualifying status. Confirm return intent, documents or alternatives and any restrictions.',
    );

    const permit = route.permit;
    const start = permit?.effectiveOn;
    const original = permit?.expiresOn;
    const extended =
      permit?.extensionApproved === true ? permit.extendedUntil : undefined;
    const actualEnd = extended ?? original;
    const withinCeiling = (end: IsoDate, normal: number, special: number) => {
      if (!start) return undefined;
      if (end <= addYears(start, normal)) return true;
      if (end > addYears(start, special)) return false;
      return route.specialPermanentResident;
    };
    const originalOK =
      start && original
        ? all(
            original >= start,
            withinCeiling(original, rr.ordinaryYears, rr.specialPermanentYears),
          )
        : undefined;
    const validExtension =
      permit?.extensionApproved === true
        ? extended && original
          ? all(
              extended >= original &&
                extended <= addYears(original, rr.extensionYears),
              withinCeiling(
                extended,
                rr.ordinaryExtendedYears,
                rr.specialPermanentExtendedYears,
              ),
            )
          : undefined
        : true;
    const permitTermMet = all(
      originalOK,
      validExtension,
      start && departure && original
        ? start <= departure && departure <= original
        : undefined,
      stayLimit && actualEnd
        ? actualEnd <= stayLimit
        : knowStay
          ? true
          : undefined,
    );
    limit =
      actualEnd && knowStay
        ? stayLimit
          ? earlier(actualEnd, stayLimit)
          : actualEnd
        : undefined;
    r(
      'ordinary-validity',
      '普通许可期限与延期',
      'Ordinary validity and extension',
      permitTermMet,
      [...routeSources, ...travel],
      `普通最长 ${rr.ordinaryYears} 年、特別永住者 ${rr.specialPermanentYears} 年。境外最长延长 ${rr.extensionYears} 年，合计分别不得超过 ${rr.ordinaryExtendedYears} 或 ${rr.specialPermanentExtendedYears} 年，且受在留期限限制。`,
      `The normal maximum is ${rr.ordinaryYears} years, or ${rr.specialPermanentYears} for special permanent residents. An overseas extension is up to ${rr.extensionYears} year, with total limits of ${rr.ordinaryExtendedYears} and ${rr.specialPermanentExtendedYears} years respectively and the applicable stay limit.`,
      ['PD-136', 'PD-379'],
    );
    if (route.visits && date >= fees.historicalFrom) {
      if (route.channel === 'counter')
        fee = (
          date >= fees.firstChange
            ? fees.reentryCounter
            : fees.reentryHistorical
        )[route.visits];
      if (
        route.channel === 'online' &&
        route.onlineConcurrentEligibleApplication === true
      )
        fee =
          (date >= fees.firstChange
            ? fees.reentryOnline
            : fees.reentryHistorical)[route.visits] +
          (date >= fees.reform ? fees.paymentProcessing : 0);
    }
    const online = r(
      'online-application',
      '再入国在线渠道',
      'Online re-entry application',
      route.channel === 'online'
        ? route.onlineConcurrentEligibleApplication
        : undefined,
      [
        ref('SRC-455', '在留申請オンラインシステムの対象・再入国許可'),
        ref('SRC-461', 'オンライン申請'),
      ],
      '在线须与可在线办理的在留变更、更新或取得同时申请。',
      'Online re-entry applications must accompany an eligible online change, renewal or acquisition application.',
      ['PD-379'],
      route.channel === 'online' ? 'requirement' : 'information',
    );
    if (route.channel === 'counter')
      checks[checks.indexOf(online)] = inapplicable(
        online,
        L('已选择窗口办理。', 'Counter service was selected.'),
      );
  } else if (route.route === 'deemed') {
    const durationAllowed =
      route.specialPermanentResident === true
        ? true
        : route.originalStayMonths === undefined
          ? undefined
          : route.originalStayMonths > rr.deemedExcludedMonths;
    const temporaryAllows =
      route.specialPermanentResident === true
        ? true
        : excluded(route.temporaryVisitor);
    r(
      'deemed-eligibility',
      'みなし再入国资格与出境表明',
      'Deemed re-entry eligibility and departure declaration',
      all(
        route.lawfulStatus,
        durationAllowed,
        temporaryAllows,
        route.passportValid,
        route.residentCardOrCertificate,
        excluded(route.formalPermitRequired),
        route.declaredIntentAtDeparture,
      ),
      routeSources,
      `通常排除原授予期间为 ${rr.deemedExcludedMonths} 个月以下、短期滞在或依法须办普通许可者。出境时用有效证件表明拟再入国。`,
      `Ordinarily excluded are grants of ${rr.deemedExcludedMonths} months or less, temporary visitors and people who require a formal permit. Show valid documents and declare intent at departure.`,
    );
    const years = route.specialPermanentResident
      ? rr.specialPermanentDeemedYears
      : old.deemedReentryYears.value;
    if (departure && knowStay) {
      const ceiling = addYears(departure, years);
      limit = stayLimit ? earlier(ceiling, stayLimit) : ceiling;
    }
    r(
      'deemed-validity',
      'みなし再入国期限',
      'Deemed re-entry period',
      limit && returned && departure
        ? returned < departure
          ? false
          : returned > limit &&
              route.specialPermanentResident === undefined &&
              returned <= addYears(departure, rr.specialPermanentDeemedYears) &&
              (!stayLimit || returned <= stayLimit)
            ? undefined
            : returned <= limit
        : undefined,
      [...routeSources, ...old.renewalPendingMonths.sources],
      `通常从出境起 ${years} 年，若在留到期更早则取较早日。境外不可延长。${limit ? `截止 ${limit}。` : ''}`,
      `Normally ${years} year(s) from departure or the earlier expiry of stay. This cannot be extended abroad.${limit ? ` Return by ${limit}.` : ''}`,
      ['PD-136', 'PD-379'],
    );
    fee = fees.deemed;
  } else {
    r(
      'refugee-document',
      '難民旅行証明書',
      'Refugee travel document',
      all(
        route.refugeeRecognition,
        route.hasJapaneseTravelDocument,
        excluded(route.permitVoided),
      ),
      routeSources,
      '持日本签发且有效的難民旅行証明書可按指定有效期及入境期限往来，免普通再入国许可。',
      'A valid Japanese refugee travel document permits travel within its applicable validity and entry limits without an ordinary re-entry permit.',
    );
    const p = route.permit;
    const start = p?.effectiveOn;
    const expiry = p?.expiresOn;
    const extension =
      p?.extensionApproved === true ? p.extendedUntil : undefined;
    const actualEnd = extension ?? expiry;
    const valid =
      expiry && start
        ? expiry >= addYears(start, rr.refugeeTravelMinYears) &&
          expiry <= addYears(start, rr.refugeeTravelMaxYears)
        : undefined;
    const extended =
      extension && expiry
        ? extension >= expiry &&
          extension <= addYears(expiry, rr.extensionYears)
        : extension
          ? undefined
          : true;
    const entryLimit = p?.entryDeadline;
    const validLimit =
      entryLimit && start && expiry
        ? entryLimit >= addMonths(start, rr.refugeeEntryMinMonths) &&
          entryLimit < addYears(start, rr.refugeeTravelMaxYears) &&
          entryLimit <= expiry
        : entryLimit
          ? undefined
          : p?.entryDeadlineNotSpecified;
    const permitTermMet = all(
      valid,
      extended,
      validLimit,
      start && departure ? departure >= start : undefined,
      expiry && departure ? departure <= expiry : undefined,
    );
    limit =
      actualEnd && entryLimit ? earlier(actualEnd, entryLimit) : actualEnd;
    r(
      'refugee-document-validity',
      '难民旅行证件期限及延期',
      'Validity and extension of refugee travel document',
      permitTermMet,
      routeSources,
      `证件有效期 ${rr.refugeeTravelMinYears}–${rr.refugeeTravelMaxYears} 年；指定入境期限可更早，境外批准延长最多 ${rr.extensionYears} 年。`,
      `Document validity is ${rr.refugeeTravelMinYears}–${rr.refugeeTravelMaxYears} years. A designated entry deadline can be earlier. An approved overseas extension is at most ${rr.extensionYears} year.`,
    );
    if (date >= fees.historicalFrom)
      fee =
        date >= fees.refugeeChange
          ? fees.refugeeTravel
          : fees.refugeeTravelBefore;
  }

  const extensionPending =
    route.route !== 'deemed' &&
    route.consularExtension &&
    route.permit?.extensionApproved === undefined;
  const specialEvidenceMissing =
    route.travelDocumentLost === true &&
    route.expiryCertificateObtained !== true;
  const possibleSpecialDeemedLimit =
    route.route === 'deemed' &&
    route.specialPermanentResident === undefined &&
    departure
      ? addYears(departure, rr.specialPermanentDeemedYears)
      : undefined;
  const dependsOnPendingRenewal =
    route.route !== 'refugee-travel-document' &&
    route.timelyRenewalPending === true &&
    !route.renewalDecisionOn &&
    stay &&
    returned &&
    returned > stay &&
    stayLimit &&
    returned <= stayLimit;
  const beforeEnd =
    returned && departure && limit && !specialEvidenceMissing
      ? returned < departure
        ? false
        : dependsOnPendingRenewal
          ? undefined
          : returned <= limit
            ? true
            : extensionPending ||
                (possibleSpecialDeemedLimit &&
                  returned <= possibleSpecialDeemedLimit &&
                  (!stayLimit || returned <= stayLimit))
              ? undefined
              : false
      : undefined;
  const validity = all(
    beforeEnd,
    excluded(route.permitVoided),
    route.route === 'ordinary' && route.visits === 'single'
      ? excluded(route.previouslyUsedSingleEntry)
      : true,
  );
  r(
    'return-continuity',
    '返日及在留连续性',
    'Return and continuity of status',
    validity,
    [...routeSources, ref('SRC-116', '再入国失效与继续在留')],
    `${limit ? `目前可核对截止日为 ${limit}。 ` : ''}遗失须核对官方期限证明，许可失效后原身份不能靠原许可恢复。${route.newLandingOn ? `已填重新上陆日 ${route.newLandingOn}。` : ''}`,
    `${limit ? `The current verifiable deadline is ${limit}. ` : ''}Check official validity evidence if documents are lost. An expired permit cannot restore the previous status.${route.newLandingOn ? ` New landing reported on ${route.newLandingOn}.` : ''}`,
    ['PD-136', 'PD-379'],
  );

  const cost = r(
    'travel-fee',
    '旅行手续基础费',
    'Base travel procedure fee',
    fee === undefined ? undefined : true,
    full.fees.sources,
    fee === undefined
      ? '费用须核对收件日期、证件类型、次数与所用渠道。'
      : `该手续费为 JPY ${fee}。`,
    fee === undefined
      ? 'Check the filing date, document type, number of entries and channel.'
      : `The procedure fee is JPY ${fee}.`,
    ['PD-379'],
    'information',
  );
  if (fee !== undefined) cost.fee = { currency: 'JPY', amount: fee };

  if (route.route !== 'deemed' && route.consularExtension) {
    const refugee = route.route === 'refugee-travel-document';
    const extensionOn = route.extensionFeeOn;
    const amount =
      route.consularArea === 'china-mainland' &&
      extensionOn &&
      full.fees.value.refugeeChange <= extensionOn &&
      extensionOn <= req.simulationDate &&
      extensionOn <= japanFull2026_11.asOf
        ? refugee
          ? fees.chinaRefugeeExtension
          : fees.chinaReentryExtension
        : undefined;
    const [low, high] = refugee
      ? fees.refugeeExtensionRange
      : fees.reentryExtensionRange;
    const extensionFee = r(
      'consular-extension-fee',
      '境外延期领事费',
      'Overseas consular extension fee',
      amount === undefined ? undefined : true,
      [ref('SRC-462', '政令第1条第1項第5・6号、省令別表第5・6行')],
      amount === undefined
        ? `现行政令折算范围 JPY ${low}–${high}。实际金额取受理领区和当时生效的省令表。`
        : `中国大陆当前适用表列收费 CNY ${amount}。`,
      amount === undefined
        ? `The current order gives a JPY ${low}–${high} equivalent range. Confirm the actual rate for the consular district and date.`
        : `The applicable mainland China table lists CNY ${amount}.`,
      ['PD-379'],
      'information',
    );
    if (amount !== undefined) extensionFee.fee = { currency: 'CNY', amount };
  }

  return assemblePathway(`jp.reentry.${route.route}`, title, date, checks, L);
}
