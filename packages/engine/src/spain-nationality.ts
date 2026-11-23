import { spain2026_11, spainFull2026_11 } from '@uk-immigration/policy-data';
import type { CefrLevel, SourceRef } from '@uk-immigration/policy-data';
import { addDays, addMonths, addYears, fullYears } from './dates';
import { evaluateSpain } from './spain';
import type { EsPathway } from './spain';
import type { CountryCheck, CountryPathway } from './country-result';
import type { EsFullRequest } from './spain-full';
import { all, any, check, pathway } from './spain-full-common';
import { textFor } from './rule';
import { meetsCefr } from './rules/es-requirements';
import type { IsoDate } from './types';

type Finding = boolean | undefined;
type Origin =
  | 'ibero-american'
  | 'andorra'
  | 'philippines'
  | 'equatorial-guinea'
  | 'portugal'
  | 'other';
type DeclarationBasis = Origin | 'french' | 'spanish-sephardic';
type NationalityDocument =
  | 'applicationForm'
  | 'identity'
  | 'birthRecord'
  | 'residence'
  | 'address'
  | 'foreignDocumentFormalities'
  | 'previousPassportsIfRequired';
type OptionBasis =
  | 'ordinary'
  | 'never-expires'
  | 'late-emancipation'
  | 'support-ended'
  | 'official-expiry'
  | 'none';
type ExamRelief =
  | 'none'
  | 'spanish-eso-diploma'
  | 'full-dispensation'
  | 'judicial-exemption-confirmed'
  | 'adapted-exams'
  | 'denied'
  | 'pending';

export interface EsNationalityFacts {
  birthDate?: IsoDate;
  emancipated?: boolean;
  applicantSignature?:
    'self' | 'assisted' | 'representative' | 'authorised-agent';
  /** Covers all required signatures, sole parental authority, notarial authorisation or a court resolution. */
  representationDocumented?: boolean;
  necessarySupportProvided?: boolean;
  oneYearGround?:
    'birth' | 'missed-option' | 'guardianship' | 'widowed' | 'descent';
  refugeeStatus?:
    | 'recognised-in-spain'
    | 'foreign-recognition-under-review'
    | 'asylum-applicant'
    | 'subsidiary-protection'
    | 'stateless'
    | 'none';
  refugeeEvidenceIssued?: IsoDate;
  /** Country of nationality by origin, as declared for the Spanish residence permit. */
  originalNationalityForPermit?: Origin | 'authority-review';
  sephardicEvidenceAccepted?: boolean;
  spanishCivilBirthRecord?: boolean;
  optionBasis?: OptionBasis;
  optionUnexercisedAndDocumented?: boolean;
  optionEventDate?: IsoDate;
  qualifyingGuardianshipDocumented?: boolean;
  guardianshipFrom?: IsoDate;
  /** A single uninterrupted formal placement under art. 22.2.c. */
  guardianshipTo?: IsoDate;
  spouseSpanishFrom?: IsoDate;
  unseparatedAndCohabitationDocumented?: boolean;
  /** Documented periods living with an accredited Spanish diplomatic or consular spouse abroad. */
  diplomaticPosting?: { from: IsoDate; to?: IsoDate }[];
  continuityDecision?: boolean;
  widowSpanishSpouseDied?: IsoDate;
  widowUnseparatedAtDeath?: boolean;
  widowCertificatesAndCohabitation?: boolean;
  bornOutsideSpain?: boolean;
  spanishByOriginAncestor?: 'parent' | 'grandparent' | 'none';
  descentChainDocumented?: boolean;
  criminalRecords?: {
    spanishRecordOrQuery?: boolean;
    originRecordOrLawfulAlternative?: boolean;
    /** Includes the special Defence report and procedure where applicable. */
    militaryProcedureIfApplicable?: boolean;
  };
  conductAndSecurityDecision?: boolean;
  deleEvidence?:
    'dele' | 'registered-official-equivalent' | 'equivalence-pending' | 'none';
  deleLevel?: CefrLevel;
  /** ISO country codes for nationalities evidenced by valid documents, including a second nationality. */
  documentedNationalities?: string[];
  examRelief?: ExamRelief;
  dispensaRequestedOn?: IsoDate;
  ccse?: {
    correct?: number;
    verifiedPass?: boolean;
    issued?: IsoDate;
    validThrough?: IsoDate;
  };
  /** Registration with a centre covered by Orden JUS/1625/2016 art. 10.6. */
  registeredWithSchoolOrCareCentre?: boolean;
  /** First teaching day on the local calendar for the applicant's primary entry cohort. */
  primarySchoolStartsOn?: IsoDate;
  schoolOrCareCertificateIfRequired?: boolean;
  integrationDecision?: boolean;
  documents?: Partial<Record<NationalityDocument, boolean>>;
  feePaid?: boolean;
  feePaidOn?: IsoDate;
  examBooking?: {
    date?: IsoDate;
    deleCountry?: string;
    deleLevel?: CefrLevel;
    /** Only a documented unused second sitting after a failed or missed first sitting. */
    ccseRetakeFrom?: IsoDate;
  };
  /** Date of observation for post-grant acts; the simulation date remains the filing date. */
  followUpDate?: IsoDate;
  grantNotifiedOn?: IsoDate;
  declarationOn?: IsoDate;
  declarationCompleted?: boolean;
  /** Deadline confirmed by the authority after a documented suspension. */
  confirmedDeclarationDeadline?: IsoDate;
  notarialSuspensionAwaitingConfirmation?: boolean;
  canDeclareInPerson?: boolean;
  oathOrMilitaryEvidence?: boolean;
  renunciationBasis?: DeclarationBasis;
  declaredRenunciation?: boolean;
  civilNeighbourhoodChosen?: boolean;
  competentRegistryOrNotary?: boolean;
  registeredOn?: IsoDate;
  registrationCompleted?: boolean;
}

const v = spainFull2026_11.values;
const old = spain2026_11.values;
const src = (srcId: string, locator: string): SourceRef => ({ srcId, locator });

function optionMissed(n: EsNationalityFacts, date: IsoDate): Finding {
  if (n.optionBasis === 'never-expires' || n.optionBasis === 'none')
    return false;
  let expires: IsoDate | undefined;
  if (n.optionBasis === 'ordinary' && n.birthDate)
    expires = addYears(n.birthDate, v.nationalityOptionExpiryAge.value);
  if (
    (n.optionBasis === 'support-ended' ||
      n.optionBasis === 'late-emancipation') &&
    n.optionEventDate
  )
    expires = addYears(
      n.optionEventDate,
      v.nationalityOptionExtensionYears.value,
    );
  if (n.optionBasis === 'official-expiry') expires = n.optionEventDate;
  // The date printed as the last exercise date remains available; an ordinary option expires at age twenty.
  return all(
    n.optionUnexercisedAndDocumented,
    expires === undefined
      ? undefined
      : n.optionBasis === 'ordinary'
        ? date >= expires
        : date > expires,
  );
}

function inForce(
  issue: IsoDate | undefined,
  end: IsoDate | undefined,
  date: IsoDate,
): Finding {
  if (issue && issue > date) return false;
  return end === undefined ? undefined : date <= end;
}

function ofCompulsorySchoolAge(
  n: EsNationalityFacts,
  date: IsoDate,
  age?: number,
): Finding {
  if (age === undefined || !n.birthDate) return undefined;
  const [year, month] = date.split('-').map(Number);
  const entryYear = Number(n.birthDate.split('-')[0]) + v.schoolAgeFrom.value;
  if (year !== entryYear)
    return year > entryYear && age < v.schoolAgeUntil.value;
  if (n.primarySchoolStartsOn) return date >= n.primarySchoolStartsOn;
  const openingMonth = v.primarySchoolStartMonth.value;
  return month === openingMonth ? undefined : month > openingMonth;
}

function examFindings(n: EsNationalityFacts, date: IsoDate, age?: number) {
  const minor =
    age === undefined ? undefined : age < v.nationalityAdultAge.value;
  const dispensaDeadline =
    n.dispensaRequestedOn &&
    addMonths(n.dispensaRequestedOn, v.nationalityDispensaMonths.value);
  const pending =
    n.examRelief === 'pending' &&
    (!dispensaDeadline || date <= dispensaDeadline);
  const relief =
    n.examRelief === undefined || pending
      ? undefined
      : [
          'spanish-eso-diploma',
          'full-dispensation',
          'judicial-exemption-confirmed',
        ].includes(n.examRelief);
  const exempt = any(minor, relief);
  const countryExempt = n.documentedNationalities?.some((country) =>
    v.nationalityDeleExemptCountries.value.includes(country),
  );
  let language: Finding;
  if (n.deleEvidence === 'dele' && n.deleLevel)
    language = meetsCefr(n.deleLevel, v.nationalityDeleMinimum.value);
  if (n.deleEvidence === 'registered-official-equivalent') language = true;
  if (n.deleEvidence === 'none') language = false;

  const ccse = n.ccse;
  const score = ccse?.correct;
  const passed =
    ccse?.verifiedPass ??
    (score === undefined
      ? undefined
      : score >= v.nationalityCcsePass.value &&
        score <= v.nationalityCcseQuestions.value);
  const end =
    ccse?.validThrough ??
    (ccse?.issued && addYears(ccse.issued, v.nationalityCcseYears.value));
  const civic = all(passed, inForce(ccse?.issued, end, date));
  return {
    minor,
    pending,
    simultaneous: n.examRelief === 'pending' && n.dispensaRequestedOn === date,
    language: any(exempt, countryExempt, language),
    civic: any(exempt, civic),
  };
}

function examBudget(
  n: EsNationalityFacts,
  date: IsoDate,
  language: Finding,
  civic: Finding,
): number | undefined {
  if (language === true && civic === true) return 0;
  const booking = n.examBooking;
  if (
    !booking?.date ||
    booking.date < date ||
    !booking.date.startsWith(v.nationalityExamPriceYear.value)
  )
    return undefined;
  if (language === undefined || civic === undefined) return undefined;
  if (
    !language &&
    (booking.deleCountry !== 'ES' ||
      booking.deleLevel !== v.nationalityDeleMinimum.value)
  )
    return undefined;
  const freeRetake =
    booking.ccseRetakeFrom &&
    booking.date >= booking.ccseRetakeFrom &&
    booking.date <=
      addMonths(booking.ccseRetakeFrom, v.nationalityCcseRetakeMonths.value);
  return (
    (language ? 0 : v.nationalityDeleSpainFee.value) +
    (civic || freeRetake ? 0 : v.nationalityCcseFee.value)
  );
}

// A documented diplomatic posting is deemed Spanish residence only for art. 22.2.d.
function residenceRecord(
  req: EsFullRequest,
  n: EsNationalityFacts,
  pilot: EsPathway,
) {
  const spans = req.route === 'marriage' ? (n.diplomaticPosting ?? []) : [];
  const continuityAccepted = n.continuityDecision === true;
  if (!spans.length && !(continuityAccepted && pilot.status === 'UNKNOWN'))
    return { time: pilot, trips: req.trips };
  let trips = req.trips;
  for (const span of spans) {
    trips = trips.flatMap((t) => {
      if (span.from > t.returned || (span.to && span.to < t.departed))
        return [t];
      const outside = [];
      if (t.departed < span.from)
        outside.push({
          departed: t.departed,
          returned: addDays(span.from, -1),
        });
      if (span.to && t.returned > span.to)
        outside.push({ departed: addDays(span.to, 1), returned: t.returned });
      return outside;
    });
  }
  const time = evaluateSpain({
    ...req,
    permits: [...req.permits, ...spans],
    // The authority has already settled continuity. Use the permit anniversary
    // for the candidate date and retain the trip record for the N01 finding.
    trips: continuityAccepted ? [] : trips,
  }).pathways.find((p) => p.id === 'ES-NATIONALITY')!;
  return { time, trips };
}

export function nationalityPath(
  req: EsFullRequest,
  pilot: EsPathway,
  routeConfirmed = true,
): CountryPathway {
  const L = textFor(req);
  const n = req.nationality ?? {};
  const date = req.simulationDate;
  const age =
    n.birthDate && n.birthDate <= date
      ? fullYears(n.birthDate, date)
      : undefined;
  const { time, trips } = residenceRecord(req, n, pilot);
  const checks: CountryCheck[] = [];
  const info: CountryCheck[] = [];
  const rule = (
    id: string,
    zh: string,
    en: string,
    met: Finding,
    sources: SourceRef[],
    pd?: string[],
  ) => check(L, 'ES-' + id, zh, en, met, sources, pd);
  const residence =
    req.timeRecordsComplete === false ? undefined : time.checks[0].met;
  const years = old.nationalityYears.value[req.route];
  const hasAbsences = trips.some(
    (t) => t.departed < date && t.returned >= addYears(date, -years),
  );
  const continuity =
    req.timeRecordsComplete === false
      ? undefined
      : hasAbsences
        ? n.continuityDecision
        : true;
  const ordinaryTime = all(residence, continuity);
  const needsRoute = !routeConfirmed && ordinaryTime !== true;
  checks.push(
    rule(
      'N01',
      needsRoute
        ? '请确认入籍年限类别。普通年限尚未证实，难民、原籍或家庭事由可能缩短所需居留。'
        : '申请前连续合法居留满 ' +
            years +
            ' 年，覆盖申请当天；有离境时须核实连续性。',
      needsRoute
        ? 'Confirm the applicable residence period. The general period is unproven and refugee status, origin or family circumstances may shorten it.'
        : 'Continuous legal residence for ' +
            years +
            ' years immediately before filing, including the filing day. Absences require a continuity assessment.',
      needsRoute ? undefined : ordinaryTime,
      [
        ...time.checks[0].sources,
        src('SRC-339', 'AN, estancia por estudios'),
        src('SRC-084', 'art. 22.3, diplomatic spouse'),
      ],
      hasAbsences ? ['PD-100'] : ['PD-099'],
    ),
  );

  if (req.route === 'refugee') {
    const status =
      n.refugeeStatus === undefined ||
      n.refugeeStatus === 'foreign-recognition-under-review'
        ? undefined
        : n.refugeeStatus === 'recognised-in-spain';
    const issue = n.refugeeEvidenceIssued;
    checks.push(
      rule(
        'N02',
        '正式难民身份仍有效，内政部证明签发未超过 ' +
          v.nationalityRefugeeCertificateMonths.value +
          ' 个月。',
        'Current recognised refugee status with an Interior Ministry certificate issued within ' +
          v.nationalityRefugeeCertificateMonths.value +
          ' months.',
        all(
          status,
          inForce(
            issue,
            issue &&
              addMonths(issue, v.nationalityRefugeeCertificateMonths.value),
            date,
          ),
        ),
        [
          src('SRC-084', 'art. 22.1'),
          ...v.nationalityRefugeeCertificateMonths.sources,
        ],
      ),
    );
  }
  if (req.route === 'ibero') {
    const origin = n.originalNationalityForPermit;
    const qualifying =
      !origin || origin === 'authority-review' ? undefined : origin !== 'other';
    checks.push(
      rule(
        'N03',
        '取得西班牙居留时申报的法定原始国籍，或有获认可的塞法迪证明。',
        'Qualifying nationality by origin used for Spanish residence, or accepted Sephardic evidence.',
        any(qualifying, n.sephardicEvidenceAccepted),
        [
          src('SRC-084', 'art. 22.1'),
          src('SRC-322', 'Orden JUS/1625/2016 art. 10.2, anexo §2.g'),
        ],
        ['PD-280'],
      ),
    );
  }
  if (req.route === 'one-year') {
    switch (n.oneYearGround) {
      case 'birth':
      case 'missed-option':
        checks.push(
          rule(
            'N04',
            '西班牙出生登记，或具备选择权且有证据证明已错过法定期限。',
            'Spanish civil birth record or evidence of an unexercised option whose statutory period expired.',
            n.oneYearGround === 'birth'
              ? n.spanishCivilBirthRecord
              : optionMissed(n, date),
            [
              src('SRC-084', 'arts. 20, 22.2.a–b'),
              src('SRC-322', 'Orden JUS/1625/2016 anexo §2.a–b'),
            ],
            ['PD-280'],
          ),
        );
        break;
      case 'guardianship': {
        const from = n.guardianshipFrom;
        const to =
          n.guardianshipTo && n.guardianshipTo < date ? n.guardianshipTo : date;
        checks.push(
          rule(
            'N05',
            '西班牙人或机构的法定监护、全权代表或非临时安置连续满 ' +
              v.nationalityGuardianshipYears.value +
              ' 年。',
            'Documented qualifying Spanish guardianship, full representation or placement for ' +
              v.nationalityGuardianshipYears.value +
              ' consecutive years.',
            all(
              n.qualifyingGuardianshipDocumented,
              from === undefined
                ? undefined
                : to >= addYears(from, v.nationalityGuardianshipYears.value),
            ),
            [
              ...v.nationalityGuardianshipYears.sources,
              src('SRC-322', 'Orden JUS/1625/2016 anexo §2.c'),
              src('SRC-342', 'Ley 8/2021 art. 2.6'),
            ],
          ),
        );
        break;
      }
      case 'widowed':
        checks.push(
          rule(
            'N07',
            '有西籍配偶死亡证明，死亡时无分居，并有出生、婚姻和同住证明。',
            'Spanish spouse’s death by the filing date, no separation at death and evidence of birth, marriage and cohabitation.',
            all(
              n.widowSpanishSpouseDied === undefined
                ? undefined
                : n.widowSpanishSpouseDied <= date,
              n.widowUnseparatedAtDeath,
              n.widowCertificatesAndCohabitation,
            ),
            [
              src('SRC-084', 'art. 22.2.e'),
              src('SRC-322', 'Orden JUS/1625/2016 anexo §2.e'),
            ],
          ),
        );
        break;
      case 'descent':
        checks.push(
          rule(
            'N08',
            '出生在西班牙境外，父母或祖父母有原始西籍，出生登记证明完整亲属链。',
            'Born outside Spain to a parent or grandparent originally Spanish, with the chain of birth records.',
            all(
              n.bornOutsideSpain,
              n.spanishByOriginAncestor === undefined
                ? undefined
                : n.spanishByOriginAncestor !== 'none',
              n.descentChainDocumented,
            ),
            [
              src('SRC-084', 'art. 22.2.f'),
              src('SRC-322', 'Orden JUS/1625/2016 anexo §2.f'),
            ],
          ),
        );
        break;
      default:
        checks.push(
          rule(
            'N-ONE-YEAR',
            '须选择并证明一年居留组的一项法定身份。',
            'Select and document one statutory ground for the one-year residence period.',
            undefined,
            [src('SRC-084', 'art. 22.2.a–f')],
            ['PD-280'],
          ),
        );
    }
  }
  if (req.route === 'marriage') {
    const since = n.spouseSpanishFrom;
    const spanish =
      since === undefined
        ? undefined
        : since > date
          ? false
          : date >= addYears(since, old.marriageYears.value)
            ? true
            : undefined;
    checks.push(
      rule(
        'N06',
        '婚姻满法定年限，配偶有西籍，未依法或事实上分居，具备婚姻、出生登记及共同居住证明。',
        'Qualifying marriage duration, Spanish spouse, no legal or factual separation, with marriage, birth and cohabitation evidence.',
        all(
          pilot.checks[1]?.met,
          spanish,
          n.unseparatedAndCohabitationDocumented,
        ),
        [
          ...old.marriageYears.sources,
          src('SRC-322', 'Orden JUS/1625/2016 anexo §2.d'),
        ],
        ['PD-281'],
      ),
    );
  }

  const assistedBirthday =
    n.birthDate && addYears(n.birthDate, v.nationalityAssistedAge.value);
  const adult =
    age === undefined ? undefined : age >= v.nationalityAdultAge.value;
  const independent = any(adult, n.emancipated);
  let signed: Finding;
  if (n.applicantSignature && independent === true)
    signed =
      n.applicantSignature === 'authorised-agent'
        ? n.representationDocumented
        : n.applicantSignature === 'self';
  else if (
    n.applicantSignature &&
    independent === false &&
    assistedBirthday &&
    date !== assistedBirthday
  ) {
    const expected = date > assistedBirthday ? 'assisted' : 'representative';
    signed = all(n.applicantSignature === expected, n.representationDocumented);
  }
  checks.push(
    rule(
      'N09',
      '按年龄和解放状态由本人、本人在代表协助下或法定代表签署；具备适用的代表文书及支持措施。',
      'Applicant, assisted applicant or legal representative signed according to age and emancipation, with applicable authority and support.',
      all(signed, n.necessarySupportProvided),
      [
        src('SRC-084', 'arts. 20.2, 21.3'),
        src('SRC-321', 'arts. 4–5'),
        src('SRC-323', 'Nota Ley 8/2021, menores p1'),
        src('SRC-342', 'Ley 8/2021 art. 2.4–5'),
      ],
      ['PD-282'],
    ),
  );
  const records = n.criminalRecords;
  const evidenceIfRequired = (needed: Finding, evidence: Finding) =>
    any(needed === undefined ? undefined : !needed, evidence);
  checks.push(
    rule(
      'N10-RECORDS',
      '具备适用的原籍刑事记录或法定替代、西班牙记录查询或证明；军人须符合国防部门程序。',
      'Applicable foreign records or lawful substitutes, Spanish record or query authorisation, and the Defence procedure where applicable.',
      all(
        evidenceIfRequired(
          independent,
          records?.originRecordOrLawfulAlternative,
        ),
        evidenceIfRequired(adult, records?.spanishRecordOrQuery),
        records?.militaryProcedureIfApplicable,
      ),
      [
        src('SRC-321', 'arts. 5.3, 8–9'),
        src('SRC-322', 'Orden JUS/1625/2016 arts. 7–8, anexo §§1–3'),
      ],
    ),
  );
  checks.push(
    rule(
      'N10',
      '机关已认可公民品格，且无基于公共秩序或国家利益的否定决定。',
      'The authority accepted civic conduct and raised no public-order or national-interest objection.',
      n.conductAndSecurityDecision,
      [src('SRC-084', 'arts. 21.2, 22.4'), src('SRC-321', 'arts. 8, 11')],
      ['PD-283'],
    ),
  );

  const exams = examFindings(n, date, age);
  checks.push(
    rule(
      'N11',
      'DELE ' +
        v.nationalityDeleMinimum.value +
        ' 或以上、可核验的法定等效证书或有凭据的免试。',
      'DELE ' +
        v.nationalityDeleMinimum.value +
        ' or higher, a verifiable official equivalent or documented exemption.',
      exams.language,
      [
        ...v.nationalityDeleMinimum.sources,
        ...v.nationalityDeleExemptCountries.sources,
        src('SRC-322', 'Orden JUS/1625/2016 art. 10.2–6'),
      ],
    ),
  );
  checks.push(
    rule(
      'N12',
      'CCSE 有正式、有效的合格证明（' +
        v.nationalityCcseQuestions.value +
        ' 题至少答对 ' +
        v.nationalityCcsePass.value +
        ' 题，自证书日起 ' +
        v.nationalityCcseYears.value +
        ' 年）或有适用豁免。',
      'Verified and current CCSE pass (' +
        v.nationalityCcsePass.value +
        ' of ' +
        v.nationalityCcseQuestions.value +
        ', valid for ' +
        v.nationalityCcseYears.value +
        ' years from certification) or applicable exemption.',
      exams.civic,
      [
        ...v.nationalityCcseYears.sources,
        ...v.nationalityCcsePass.sources,
        src('SRC-321', 'art. 6.1, 6.3–4'),
      ],
      ['PD-284'],
    ),
  );
  const minorOrJudiciallyExempt = any(
    exams.minor,
    n.examRelief === undefined
      ? undefined
      : n.examRelief === 'judicial-exemption-confirmed',
  );
  const centreRequired = any(
    ofCompulsorySchoolAge(n, date, age),
    all(minorOrJudiciallyExempt, n.registeredWithSchoolOrCareCentre),
  );
  checks.push(
    rule(
      'N13',
      '免试程序已解决，机关已认可社会融合。义务教育学龄的未成年人，以及已在适用机构登记的未成年人或获司法豁免者，须提供机构证明。小学入学按出生年份分届，开学月份内递交时须核当地开学日。',
      'Any dispensation proceeding is resolved and the authority accepted integration. A centre certificate is required for minors of compulsory school age and for minors or judicially exempt applicants registered with a covered centre. Primary entry is by birth year. For applications in the opening month of the entry year, check the local first teaching day.',
      all(
        exams.simultaneous ? false : exams.pending ? undefined : true,
        evidenceIfRequired(centreRequired, n.schoolOrCareCertificateIfRequired),
        n.integrationDecision,
      ),
      [
        src('SRC-084', 'art. 22.4'),
        src(
          'SRC-322',
          'Orden JUS/1625/2016 art. 10.5–6; Resolución 7-11-2022 anexo',
        ),
        ...v.schoolAgeFrom.sources,
        ...v.primarySchoolStartMonth.sources,
      ],
      ['PD-282'],
    ),
  );
  const docs = n.documents;
  checks.push(
    rule(
      'N14',
      '有申请表、有效完整身份证件、出生证明或合规替代、居留及住址证明或查询授权、适用的旧护照、认证与翻译。',
      'Application form, full valid identity and birth documents or lawful substitutes, residence and address evidence or queries, applicable previous passports, legalisation and translations.',
      all(
        docs?.applicationForm,
        docs?.identity,
        docs?.birthRecord,
        docs?.residence,
        docs?.address,
        docs?.foreignDocumentFormalities,
        docs?.previousPassportsIfRequired,
      ),
      [
        src('SRC-321', 'art. 5.1.a–f'),
        src('SRC-322', 'Orden JUS/1625/2016 anexo §§1–4'),
        src('SRC-323', 'Información Nacionalidad, Documentos; Sede, trámite'),
      ],
    ),
  );
  const paid =
    n.feePaidOn === undefined
      ? n.feePaid
      : all(n.feePaid !== false, n.feePaidOn <= date);
  checks.push(
    rule(
      'N15',
      '申请人已在提交前缴付 790-026 申请费（已公布 ' +
        v.nationalityApplicationFee.value +
        ' EUR）并有凭据。',
      'Payment receipt for form 790-026 before filing (published fee EUR ' +
        v.nationalityApplicationFee.value +
        ').',
      paid,
      [
        ...v.nationalityApplicationFee.sources,
        src('SRC-321', 'DA 1'),
        src('SRC-322', 'Orden JUS/1625/2016 art. 6'),
      ],
    ),
  );
  const budget = examBudget(n, date, exams.language, exams.civic);
  info.push(
    rule(
      'N16',
      budget === undefined
        ? '考试预算待确认，需核实考试时间、地点、级别及是否免试。'
        : '尚需报名的考试预算为 ' + budget + ' EUR。',
      budget === undefined
        ? 'Exam budget requires the sitting date, location, level and exemption status.'
        : 'Remaining exam registration budget is EUR ' + budget + '.',
      budget === undefined ? undefined : true,
      [
        ...v.nationalityCcseFee.sources,
        ...v.nationalityDeleSpainFee.sources,
        ...v.nationalityCcseRetakeMonths.sources,
      ],
    ),
  );

  const asOf = n.followUpDate ?? date;
  const notice = n.grantNotifiedOn;
  const declaration = n.declarationOn;
  const deadline =
    n.confirmedDeclarationDeadline ??
    (notice && addDays(notice, v.nationalityDeclarationDays.value));
  const timely =
    !deadline || !notice || notice > asOf
      ? undefined
      : n.declarationCompleted === false &&
          !n.notarialSuspensionAwaitingConfirmation &&
          asOf > deadline
        ? false
        : declaration && declaration <= asOf && declaration < notice
          ? false
          : declaration && declaration <= asOf && declaration <= deadline
            ? true
            : declaration &&
                declaration <= asOf &&
                !n.notarialSuspensionAwaitingConfirmation
              ? false
              : undefined;
  const oathAge =
    n.birthDate &&
    declaration &&
    addYears(n.birthDate, v.nationalityAssistedAge.value);
  const requiresOath = all(
    oathAge && declaration && declaration !== oathAge
      ? declaration > oathAge
      : undefined,
    n.canDeclareInPerson,
  );
  const exemptRenunciation =
    n.renunciationBasis === undefined
      ? undefined
      : n.renunciationBasis === 'french'
        ? declaration === undefined
          ? undefined
          : declaration >= v.nationalityFrenchTreatyFrom.value
        : n.renunciationBasis !== 'other';
  const oath = evidenceIfRequired(requiresOath, n.oathOrMilitaryEvidence);
  const renunciation = evidenceIfRequired(
    requiresOath,
    any(exemptRenunciation, n.declaredRenunciation),
  );
  info.push(
    rule(
      'N17',
      '获批后须按期向有权机构声明、选定 vecindad civil，并在适用时宣誓和声明放弃原籍。' +
        (deadline ? ' 办理期限 ' + deadline + '。' : ''),
      'After grant, make timely declarations before a competent official, choose civil neighbourhood and, where applicable, take the oath and declare renunciation.' +
        (deadline ? ' Deadline ' + deadline + '.' : ''),
      all(
        timely,
        oath,
        renunciation,
        n.civilNeighbourhoodChosen,
        n.competentRegistryOrNotary,
      ),
      [
        ...v.nationalityDeclarationDays.sources,
        src('SRC-084', 'arts. 15.1, 23, 24.1'),
        src('SRC-321', 'arts. 9, 12–13'),
        src('SRC-343', 'Ley 20/2011 art. 68.3; Instrucción DGSJFP pp. 2–4'),
        ...v.nationalityFrenchTreatyFrom.sources,
      ],
      ['PD-282', 'PD-284'],
    ),
  );
  const registration = n.registeredOn
    ? all(n.registrationCompleted !== false, n.registeredOn <= asOf)
    : n.registrationCompleted;
  info.push(
    rule(
      'N18',
      '国籍取得已载入西班牙民事登记，授予决定与登记生效分别核实。',
      'Acquisition entered in the Spanish Civil Register. Grant and effective registration are recorded separately.',
      registration,
      [
        src('SRC-084', 'art. 23.c'),
        src('SRC-321', 'arts. 12.2, 13.1'),
        src('SRC-342', 'STS 15-07-2024, fallo'),
      ],
    ),
  );
  const assumptions =
    req.timeRecordsComplete === false
      ? []
      : [...time.assumptions, time.summary];
  if (req.route === 'marriage' && n.diplomaticPosting?.length)
    assumptions.push(
      L(
        '有证明的外交或领事人员配偶外驻期间按合法居留计。',
        'Documented diplomatic or consular spouse postings count as legal residence for this route.',
      ),
    );
  const futureResidence =
    !needsRoute &&
    residence === false &&
    continuity === true &&
    time.status === 'FUTURE' &&
    time.earliestDate
      ? { checkId: 'ES-N01', date: time.earliestDate }
      : undefined;
  const result = pathway(
    pilot.id,
    pilot.title,
    checks,
    info,
    assumptions,
    futureResidence,
  );
  if (req.timeRecordsComplete !== false)
    result.pathwayCompletionDate = time.earliestDate;
  if (result.status === 'MET') result.earliestDate = date;
  return result;
}
