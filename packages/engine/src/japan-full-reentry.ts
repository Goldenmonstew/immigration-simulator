import { japanFull2026_11 } from '@uk-immigration/policy-data';
import { addMonths, addYears } from './dates';
import { jpOfficeClosed, jpStayLimit } from './japan';
import {
  all,
  assemblePathway,
  check,
  filingContext,
  full,
  inapplicable,
  nextCounterFilingDay,
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
  /** The underlying status has no period of stay, as for permanent residents. */
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
  const { date: requestedDate, L } = filingContext(req);
  let date = requestedDate;
  const rr = full.reentry.value;
  const fees = full.fees.value;
  const travel = full.reentry.sources;
  const routeSources = {
    ordinary: [
      ref('SRC-110', '第26条（境外延長は第5・6項）'),
      ref('SRC-442', '第23条第1項'),
      ref('SRC-116', '再入国許可'),
      ref('SRC-461', '再入国許可申請「審査基準」「必要書類」'),
    ],
    deemed: [
      ref('SRC-110', '第19条の3・第26条の2第1–3項'),
      ref('SRC-440', '第29条の4、別表第2「永住者」'),
      ref('SRC-442', '第23条第2項'),
      ref('SRC-116', 'Q57–61・みなし再入国許可'),
    ],
    'refugee-travel-document': [
      ref('SRC-110', '第61条の2の15第1・3–9項'),
      ref(
        'SRC-461',
        '難民旅行証明書 第3・4節（有効期間・延長）',
        'https://www.moj.go.jp/isa/refugee/procedures/ryokou_00001.html#midashi03',
      ),
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
  const renewedLimit = jpStayLimit(
    { stayExpiry: stay, renewalPending: true },
    route.renewalDecisionOn,
  );
  const indefinite =
    route.specialPermanentResident === true || route.stayIndefinite === true;
  // SRC-110 art. 20(6), SRC-116 Q61. An unanswered renewal matters only
  // when the ordinary and special periods give different answers.
  function renewalAnswer<T>(ordinary: T, renewed: T): T | undefined {
    if (ordinary === renewed || route.timelyRenewalPending === false)
      return ordinary;
    return route.timelyRenewalPending === true && route.renewalDecisionOn
      ? renewed
      : undefined;
  }
  const withinStay = (on?: IsoDate) => {
    if (!on) return undefined;
    if (!stay || !renewedLimit) return indefinite ? true : undefined;
    return renewalAnswer(on <= stay, on <= renewedLimit);
  };
  const limitedByStay = (end?: IsoDate) => {
    if (!end) return undefined;
    if (!stay || !renewedLimit) return indefinite ? end : undefined;
    return renewalAnswer(earlier(end, stay), earlier(end, renewedLimit));
  };
  // Without the decision date the special period supplies an upper bound only.
  const renewalNotice = (latestPermitEnd?: IsoDate) => {
    if (
      !stay ||
      !renewedLimit ||
      route.timelyRenewalPending === false ||
      route.renewalDecisionOn ||
      (latestPermitEnd && latestPermitEnd <= stay)
    )
      return '';
    const cap = latestPermitEnd
      ? earlier(latestPermitEnd, renewedLimit)
      : renewedLimit;
    return L(
      `按期申请续期时，返日上限为 ${cap}，实际截止日待确认。请核对续期申请及处分日。`,
      `With a timely renewal the latest possible return is ${cap}. The actual deadline is unconfirmed. Check the renewal application and decision date.`,
    );
  };
  const possibleSpecialDeemedLimit =
    route.route === 'deemed' &&
    route.specialPermanentResident === undefined &&
    departure
      ? addYears(departure, rr.specialPermanentDeemedYears)
      : undefined;
  const permit = route.route === 'deemed' ? undefined : route.permit;
  const effectiveAtDeparture = all(
    permit?.effectiveOn && departure
      ? permit.effectiveOn <= departure
      : undefined,
    permit?.expiresOn && departure ? departure <= permit.expiresOn : undefined,
  );
  const extensionPending =
    route.route !== 'deemed' && permit?.extensionApproved === undefined;
  const missingExtensionEnd =
    permit?.extensionApproved === true && !permit.extendedUntil;
  const extensionEndUnknown = extensionPending || missingExtensionEnd;
  // SRC-110 art. 26(5), art. 61-2-15(6) and SRC-461 section 4.
  let extensionCeiling =
    extensionEndUnknown && permit?.expiresOn
      ? addYears(permit.expiresOn, rr.extensionYears)
      : undefined;
  let permitEnd: IsoDate | undefined;
  let verifiedLimit: IsoDate | undefined;
  const termStatus = (met: boolean | undefined) =>
    all(met, verifiedLimit ? true : undefined);
  const returnWithinPermit = () => {
    if (!returned || !departure) return undefined;
    if (returned < departure) return false;
    if (!permitEnd) return undefined;
    if (returned <= permitEnd) return true;
    if (
      extensionEndUnknown ||
      (possibleSpecialDeemedLimit && returned <= possibleSpecialDeemedLimit)
    )
      return undefined;
    return false;
  };
  let fee: number | undefined;
  let travelDate: JpFullPathway['travelDate'];
  let documentNotice = '';
  const extensionNotice = () => {
    if (!extensionEndUnknown || !permit?.expiresOn) return '';
    const notice = missingExtensionEnd
      ? L(
          '延期已获批，返日期限待确认。请补录证件上记载的延期截止日。',
          'The extension was approved. Enter the extended expiry date recorded on the document to confirm the return deadline.',
        )
      : L(
          '延期审批待确认。请核对审批结果及获批的延期截止日。',
          'Confirm the extension decision and, if approved, the extended expiry date.',
        );
    return extensionCeiling
      ? notice +
          L(
            `法定延期上限为 ${extensionCeiling}。`,
            ` The statutory extension limit is ${extensionCeiling}.`,
          )
      : notice;
  };
  let eligibility: boolean | undefined;
  let validAtDeparture: boolean | undefined;
  let extensionValid: boolean | undefined = true;
  let withinEntryDeadline: boolean | undefined = true;

  if (route.route === 'ordinary') {
    const onlineEligible = route.onlineConcurrentEligibleApplication;
    const filingChannel =
      route.channel ??
      (onlineEligible === true
        ? 'online'
        : onlineEligible === false || jpOfficeClosed(requestedDate) === 'no'
          ? 'counter'
          : undefined);
    const counterFiling =
      filingChannel === 'counter'
        ? nextCounterFilingDay(requestedDate)
        : undefined;
    date = counterFiling?.date ?? requestedDate;
    const filingAvailable =
      filingChannel === 'online' ? true : counterFiling?.open;
    const sameDayDeparture = date === departure;
    const [filingDateIssueZh, filingDateIssueEn] = sameDayDeparture
      ? [
          '递交候选日与出境日相同，须确认当天能否先递交。',
          ' The proposed filing date is the departure date. Confirm that filing can take place before departure.',
        ]
      : filingChannel === undefined
        ? [
            '在线申请资格待确认，无法确定最早递交日。',
            ' Confirm online eligibility to determine the earliest filing date.',
          ]
        : filingAvailable === undefined
          ? [
              '候选递交日的窗口开放情况待确认。',
              ' Confirm whether the counter opens on the proposed filing date.',
            ]
          : ['', ''];
    eligibility = all(
      route.lawfulStatus,
      excluded(route.excludedStatusOrDetention),
      route.inJapanWhenApplying,
      route.intendsReturn,
      departure && !sameDayDeparture ? date < departure : undefined,
      filingAvailable,
      route.channel === 'online' ? onlineEligible : true,
      route.passportOrApprovedAlternative,
      route.residentCardOrCertificate,
    );
    r(
      'ordinary-eligibility',
      '普通再入国资格与材料',
      'Ordinary permit eligibility and documents',
      eligibility,
      [
        ...routeSources,
        ref('SRC-461', '再入国許可申請「申請期間」'),
        ...(counterFiling || filingChannel === undefined
          ? [
              ref('SRC-461', '再入国許可申請「受付時間」'),
              ref('SRC-112', '行政機関の休日に関する法律第1条第1項'),
            ]
          : []),
        ...(route.channel === undefined
          ? [ref('SRC-461', '再入国許可申請「オンライン申請」')]
          : []),
      ],
      `在日本以适用身份合法在留，赴海外前申请，确认返日意向、证件、获准替代材料及处分限制。${filingDateIssueZh}`,
      `Apply in Japan before departure while lawfully residing under a qualifying status. Confirm return intent, documents or alternatives and any restrictions.${filingDateIssueEn}`,
      filingDateIssueZh ? ['PD-370', 'PD-379'] : ['PD-379'],
    );

    const start = permit?.effectiveOn;
    const original = permit?.expiresOn;
    const extended =
      permit?.extensionApproved === true ? permit.extendedUntil : undefined;
    // An extension of unknown length still covers the original permit period.
    const confirmedThrough = extended ?? original;
    if (extensionEndUnknown && start) {
      // SRC-110 art. 26(5); SRC-442 art. 23(1) substitutes the longer total
      // limit. If special status is unknown, only the latest limit is certain.
      const totalCeiling = addYears(
        start,
        route.specialPermanentResident === false
          ? rr.ordinaryExtendedYears
          : rr.specialPermanentExtendedYears,
      );
      extensionCeiling = extensionCeiling
        ? earlier(extensionCeiling, totalCeiling)
        : totalCeiling;
    }
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
    extensionValid =
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
              withinStay(extended),
            )
          : undefined
        : true;
    validAtDeparture = all(
      originalOK,
      effectiveAtDeparture,
      withinStay(original),
    );
    permitEnd = confirmedThrough;
    const permitTermMet = all(validAtDeparture, extensionValid);
    if (permitTermMet && !extensionEndUnknown)
      verifiedLimit = limitedByStay(permitEnd);
    documentNotice = [
      extensionNotice(),
      renewalNotice(extensionEndUnknown ? extensionCeiling : permitEnd),
    ]
      .filter(Boolean)
      .join(' ');
    r(
      'ordinary-validity',
      '普通许可期限与延期',
      'Ordinary validity and extension',
      termStatus(permitTermMet),
      [...routeSources, ...travel, ...old.renewalPendingMonths.sources],
      `普通最长 ${rr.ordinaryYears} 年、特別永住者 ${rr.specialPermanentYears} 年。境外最长延长 ${rr.extensionYears} 年，合计分别不得超过 ${rr.ordinaryExtendedYears} 或 ${rr.specialPermanentExtendedYears} 年，且受在留期限限制。${documentNotice}`,
      `The normal maximum is ${rr.ordinaryYears} years, or ${rr.specialPermanentYears} for special permanent residents. An overseas extension is up to ${rr.extensionYears} year, with total limits of ${rr.ordinaryExtendedYears} and ${rr.specialPermanentExtendedYears} years respectively and the applicable stay limit.${documentNotice ? ' ' + documentNotice : ''}`,
      ['PD-136', 'PD-379'],
    );
    if (route.visits && date >= fees.historicalFrom) {
      if (route.channel === 'counter')
        fee = (
          date >= fees.firstChange
            ? fees.reentryCounter
            : fees.reentryHistorical
        )[route.visits];
      if (route.channel === 'online' && onlineEligible === true)
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
      onlineEligible,
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
    travelDate = { kind: 'departure', date: departure };
    const durationAllowed =
      route.specialPermanentResident === true || route.stayIndefinite === true
        ? true
        : route.originalStayMonths === undefined
          ? undefined
          : route.originalStayMonths > rr.deemedExcludedMonths;
    const temporaryAllows =
      route.specialPermanentResident === true
        ? true
        : (excluded(route.temporaryVisitor) ??
          (route.stayIndefinite === true ? true : undefined));
    eligibility = all(
      route.lawfulStatus,
      durationAllowed,
      temporaryAllows,
      route.passportValid,
      route.residentCardOrCertificate,
      excluded(route.formalPermitRequired),
      route.declaredIntentAtDeparture,
    );
    validAtDeparture = withinStay(departure);
    r(
      'deemed-eligibility',
      'みなし再入国资格与出境表明',
      'Deemed re-entry eligibility and departure declaration',
      eligibility,
      routeSources,
      `通常排除原授予期间为 ${rr.deemedExcludedMonths} 个月以下、短期滞在或依法须办普通许可者。永住者无在留期限。出境时用有效证件表明拟再入国。`,
      `Ordinarily excluded are grants of ${rr.deemedExcludedMonths} months or less, temporary visitors and people who require a formal permit. Permanent residents have an indefinite period of stay. Show valid documents and declare intent at departure.`,
    );
    const years = route.specialPermanentResident
      ? rr.specialPermanentDeemedYears
      : old.deemedReentryYears.value;
    permitEnd = departure && addYears(departure, years);
    const limit = limitedByStay(permitEnd);
    if (
      !possibleSpecialDeemedLimit ||
      limit === limitedByStay(possibleSpecialDeemedLimit)
    )
      verifiedLimit = limit;
    const term = L(
      `从出境日起，通常为 ${old.deemedReentryYears.value} 年，特別永住者为 ${rr.specialPermanentDeemedYears} 年。`,
      `The term from departure is normally ${old.deemedReentryYears.value} year, or ${rr.specialPermanentDeemedYears} years for special permanent residents.`,
    );
    if (route.specialPermanentResident === undefined && !verifiedLimit)
      documentNotice = L(
        `返日截止日待确认。${term}请核对出境时的身份及适用的在留期限。`,
        `The return deadline is unconfirmed. ${term} Confirm your status at departure and any applicable expiry of stay.`,
      );
    documentNotice = [
      documentNotice,
      renewalNotice(possibleSpecialDeemedLimit ?? permitEnd),
    ]
      .filter(Boolean)
      .join(' ');
    r(
      'deemed-validity',
      'みなし再入国期限',
      'Deemed re-entry period',
      termStatus(all(returnWithinPermit(), withinStay(returned))),
      [...routeSources, ...old.renewalPendingMonths.sources],
      `${documentNotice || term}若在留到期更早则取较早日。境外不可延长。${verifiedLimit ? `截止 ${verifiedLimit}。` : ''}`,
      `${documentNotice || term} An earlier expiry of stay takes precedence. This cannot be extended abroad.${verifiedLimit ? ` Return by ${verifiedLimit}.` : ''}`,
      ['PD-136', 'PD-379'],
    );
    fee = fees.deemed;
  } else {
    eligibility = all(
      route.refugeeRecognition,
      route.hasJapaneseTravelDocument,
      excluded(route.permitVoided),
    );
    r(
      'refugee-document',
      '難民旅行証明書',
      'Refugee travel document',
      eligibility,
      routeSources,
      '持日本签发且有效的難民旅行証明書可按指定有效期及入境期限往来，免普通再入国许可。',
      'A valid Japanese refugee travel document permits travel within its applicable validity and entry limits without an ordinary re-entry permit.',
    );
    const p = route.permit;
    const start = p?.effectiveOn;
    const expiry = p?.expiresOn;
    const actualEnd = p?.extensionApproved ? p.extendedUntil : expiry;
    const valid =
      expiry && start
        ? expiry >= addYears(start, rr.refugeeTravelMinYears) &&
          expiry <= addYears(start, rr.refugeeTravelMaxYears)
        : undefined;
    extensionValid = p?.extensionApproved
      ? actualEnd && expiry
        ? actualEnd >= expiry &&
          actualEnd <= addYears(expiry, rr.extensionYears)
        : undefined
      : true;
    const entryLimit = p?.entryDeadline;
    // SRC-461 section 3: the document's endorsement may limit entry
    // independently of its validity (including an approved extension).
    const validLimit = entryLimit
      ? start && expiry
        ? entryLimit >= addMonths(start, rr.refugeeEntryMinMonths) &&
          entryLimit < addYears(start, rr.refugeeTravelMaxYears) &&
          entryLimit <= expiry
        : undefined
      : p?.entryDeadlineNotSpecified === true || undefined;
    withinEntryDeadline =
      entryLimit && returned ? returned <= entryLimit : validLimit;
    validAtDeparture = all(valid, effectiveAtDeparture, validLimit);
    const permitTermMet = all(
      validAtDeparture,
      extensionValid,
      excluded(route.permitVoided),
    );
    permitEnd = actualEnd ?? expiry;
    if (route.permitVoided) {
      travelDate = null;
      documentNotice = L(
        '该難民旅行証明書已失效。',
        'The refugee travel document is no longer valid.',
      );
    } else {
      if (validAtDeparture && extensionValid !== false)
        verifiedLimit =
          entryLimit ?? (extensionEndUnknown ? undefined : permitEnd);
      travelDate = {
        kind: 'returnDeadline',
        date: eligibility ? verifiedLimit : undefined,
      };
      if (!verifiedLimit) documentNotice = extensionNotice();
      if (!entryLimit && p?.entryDeadlineNotSpecified === false)
        documentNotice = L(
          '请补录证件上另行指定的入境期限，再核对返日日期。',
          'Enter the separate entry deadline recorded on the document to check the return date.',
        );
    }
    r(
      'refugee-document-validity',
      '难民旅行证件期限及延期',
      'Validity and extension of refugee travel document',
      termStatus(permitTermMet),
      routeSources,
      documentNotice ||
        `证件有效期 ${rr.refugeeTravelMinYears}–${rr.refugeeTravelMaxYears} 年；指定入境期限可更早，境外批准延长最多 ${rr.extensionYears} 年。`,
      documentNotice ||
        `Document validity is ${rr.refugeeTravelMinYears}–${rr.refugeeTravelMaxYears} years. A designated entry deadline can be earlier. An approved overseas extension is at most ${rr.extensionYears} year.`,
    );
    if (!route.permitVoided && validLimit && withinEntryDeadline === false) {
      documentNotice = L(
        `返日晚于证件指定的入境期限 ${entryLimit}。`,
        `The return was after the designated entry deadline of ${entryLimit}.`,
      );
    }
    if (date >= fees.historicalFrom)
      fee =
        date >= fees.refugeeChange
          ? fees.refugeeTravel
          : fees.refugeeTravelBefore;
  }

  const specialEvidenceMissing =
    route.travelDocumentLost === true &&
    route.expiryCertificateObtained !== true;
  const usesStay = route.route !== 'refugee-travel-document';
  const missedExtensionLimit =
    extensionCeiling && returned && returned > extensionCeiling
      ? extensionCeiling
      : undefined;
  const entryUnused =
    route.route !== 'ordinary' ||
    route.visits === 'multiple' ||
    route.previouslyUsedSingleEntry === false
      ? true
      : route.visits === 'single'
        ? excluded(route.previouslyUsedSingleEntry)
        : undefined;
  // The date comparison can succeed independently of permission to leave and return.
  const departurePermission = all(
    eligibility,
    validAtDeparture,
    excluded(route.permitVoided),
    entryUnused,
  );
  const validity = all(
    departurePermission,
    returned && permit?.expiresOn && returned <= permit.expiresOn
      ? true
      : extensionValid,
    returnWithinPermit(),
    specialEvidenceMissing ? undefined : true,
    !missedExtensionLimit,
    withinEntryDeadline,
    usesStay ? withinStay(returned) : true,
  );
  if (
    missedExtensionLimit &&
    !route.permitVoided &&
    withinEntryDeadline !== false
  )
    documentNotice = L(
      `返日晚于法定延期上限 ${missedExtensionLimit}。`,
      `The return was after the statutory extension limit of ${missedExtensionLimit}.`,
    );
  if (!documentNotice && verifiedLimit && departurePermission)
    documentNotice = L(
      `目前可核对截止日为 ${verifiedLimit}。`,
      `The current verifiable deadline is ${verifiedLimit}.`,
    );
  if (departurePermission !== true)
    documentNotice +=
      departurePermission === false
        ? L(
            '出境时所需的再入国条件未满足。',
            ' The required re-entry conditions at departure were not met.',
          )
        : L(
            '出境时所需的再入国条件仍待确认。',
            ' The required re-entry conditions at departure are unconfirmed.',
          );
  r(
    'return-continuity',
    '返日及在留连续性',
    'Return and continuity of status',
    validity,
    [
      ...routeSources,
      ref('SRC-116', '再入国失效与继续在留'),
      ...(usesStay ? old.renewalPendingMonths.sources : []),
    ],
    `${documentNotice}${route.route === 'deemed' ? '凭みなし再入国继续原在留身份，须在出境时表明再入国意图。' : ''}遗失须核对官方期限证明，许可失效后原身份不能靠原许可恢复。${route.newLandingOn ? `已填重新上陆日 ${route.newLandingOn}。` : ''}`,
    `${documentNotice ? `${documentNotice} ` : ''}${route.route === 'deemed' ? 'Continuity under deemed re-entry requires declaring your intent to return at departure. ' : ''}Check official validity evidence if documents are lost. An expired permit cannot restore the previous status.${route.newLandingOn ? ` New landing reported on ${route.newLandingOn}.` : ''}`,
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

  const pathway = assemblePathway(
    `jp.reentry.${route.route}`,
    title,
    route.route === 'ordinary' ? date : undefined,
    checks,
    L,
  );
  if (travelDate !== undefined) pathway.travelDate = travelDate;
  return pathway;
}
