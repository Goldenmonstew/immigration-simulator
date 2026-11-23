import { describe, expect, test } from 'vitest';
import type { EsRequest } from '../src/spain';
import { evaluateSpainFull } from '../src/spain-full';
import type { EsNationalityFacts } from '../src/spain-nationality';

const base: EsRequest = {
  simulationDate: '2026-11-23',
  permits: [{ from: '2015-01-01' }],
  trips: [],
  route: 'general',
};
const complete: EsNationalityFacts = {
  birthDate: '1990-04-03',
  applicantSignature: 'self',
  necessarySupportProvided: true,
  conductAndSecurityDecision: true,
  criminalRecords: {
    spanishRecordOrQuery: true,
    originRecordOrLawfulAlternative: true,
    militaryProcedureIfApplicable: true,
  },
  documentedNationalities: ['CN'],
  examRelief: 'none',
  deleEvidence: 'dele',
  deleLevel: 'A2',
  ccse: { correct: 15, issued: '2025-01-01' },
  integrationDecision: true,
  documents: {
    applicationForm: true,
    identity: true,
    birthRecord: true,
    residence: true,
    address: true,
    foreignDocumentFormalities: true,
    previousPassportsIfRequired: true,
  },
  feePaidOn: '2026-11-23',
};

function assess(
  facts: Partial<EsNationalityFacts> = {},
  request: Partial<EsRequest> & { timeRecordsComplete?: boolean } = {},
) {
  return evaluateSpainFull({
    ...base,
    ...request,
    nationality: { ...complete, ...facts },
    targets: ['N'],
  }).columns[0].pathways[0];
}
function row(
  id: string,
  facts: Partial<EsNationalityFacts>,
  request?: Partial<EsRequest> & { timeRecordsComplete?: boolean },
) {
  return assess(facts, request).checks.find((c) => c.id === 'ES-' + id)!;
}
describe('Spanish nationality by residence', () => {
  test('separates filing eligibility, time candidate, exam budget, grant formalities and registration', () => {
    const accepted = assess();
    expect(accepted.status).toBe('MET');
    expect(accepted.earliestDate).toBe(base.simulationDate);
    expect(accepted.decidedBy).not.toContain('ES-N17');
    expect(accepted.decidedBy).not.toContain('ES-N18');
    expect(row('N18', {}).status).toBe('UNKNOWN');
    const incomplete = assess({ conductAndSecurityDecision: undefined });
    expect(incomplete.status).toBe('UNKNOWN');
    expect(incomplete.earliestDate).toBeUndefined();
    expect(incomplete.pathwayCompletionDate).toBe(base.simulationDate);
    expect(
      assess({ feePaid: false, conductAndSecurityDecision: undefined }).status,
    ).toBe('NOT_MET');
  });
  test('N projects the residence anniversary only when the remaining filing conditions are met', () => {
    const req = { permits: [{ from: '2017-01-01' }] };
    const future = assess({}, req);
    expect(future.checks.find((c) => c.id === 'ES-N01')?.status).toBe(
      'NOT_MET',
    );
    expect(future.status).toBe('FUTURE');
    expect(future.earliestDate).toBe('2027-01-01');
    expect(future.pathwayCompletionDate).toBe('2027-01-01');
    for (const conduct of [undefined, false]) {
      const pending = assess({ conductAndSecurityDecision: conduct }, req);
      const status = conduct === false ? 'NOT_MET' : 'UNKNOWN';
      expect(pending.checks.find((c) => c.id === 'ES-N10')?.status).toBe(
        status,
      );
      expect(pending.status).toBe(status);
      expect(pending.earliestDate).toBeUndefined();
      expect(pending.pathwayCompletionDate).toBe('2027-01-01');
    }
    const expires = assess(
      {
        ccse: {
          verifiedPass: true,
          issued: '2023-01-01',
          validThrough: '2026-12-31',
        },
      },
      req,
    );
    expect(expires.checks.find((c) => c.id === 'ES-N12')?.status).toBe('MET');
    expect(expires.status).toBe('NOT_MET');
    expect(expires.earliestDate).toBeUndefined();
    expect(expires.pathwayCompletionDate).toBe('2027-01-01');
    expect(expires.summary).toContain('ES-N12');
  });
  test('N01 handles missing history, qualifying permits, absences and the diplomatic fiction', () => {
    expect(row('N01', {}, { timeRecordsComplete: false }).status).toBe(
      'UNKNOWN',
    );
    expect(row('N01', {}, { permits: [{ from: '2016-11-23' }] }).status).toBe(
      'MET',
    );
    expect(row('N01', {}, { permits: [{ from: '2016-11-24' }] }).status).toBe(
      'NOT_MET',
    );
    const trip = { departed: '2026-10-23', returned: '2026-10-24' };
    expect(row('N01', {}, { trips: [trip] }).pendingDetails).toContain(
      'PD-100',
    );
    expect(
      row('N01', { continuityDecision: true }, { trips: [trip] }).status,
    ).toBe('MET');
    const diplomaticPosting = [{ from: '2025-11-23' }];
    const req = {
      route: 'marriage' as const,
      marriedToSpaniard: '2020-01-01',
      permits: [],
      trips: [trip],
    };
    expect(row('N01', { diplomaticPosting }, req).status).toBe('MET');
    expect(
      row('N01', { diplomaticPosting }, { ...req, route: 'general' }).status,
    ).toBe('NOT_MET');
  });
  test('N02 distinguishes recognised refugees and dates the Interior certificate', () => {
    const evidence: EsNationalityFacts = {
      refugeeStatus: 'recognised-in-spain',
      refugeeEvidenceIssued: '2026-05-23',
    };
    const request = { route: 'refugee' as const };
    expect(row('N02', evidence, request).status).toBe('MET');
    expect(
      row('N02', { ...evidence, refugeeEvidenceIssued: '2026-05-22' }, request)
        .status,
    ).toBe('NOT_MET');
    expect(
      row(
        'N02',
        { ...evidence, refugeeStatus: 'subsidiary-protection' },
        request,
      ).status,
    ).toBe('NOT_MET');
    expect(
      row(
        'N02',
        { ...evidence, refugeeStatus: 'foreign-recognition-under-review' },
        request,
      ).status,
    ).toBe('UNKNOWN');
  });
  test('N03 origin on permit, Sephardic evidence and DELE nationality are independent', () => {
    const req = { route: 'ibero' as const };
    expect(
      row('N03', { originalNationalityForPermit: 'philippines' }, req).status,
    ).toBe('MET');
    expect(row('N03', { sephardicEvidenceAccepted: true }, req).status).toBe(
      'MET',
    );
    const dual: EsNationalityFacts = {
      originalNationalityForPermit: 'other',
      documentedNationalities: ['CN', 'MX'],
      sephardicEvidenceAccepted: false,
      deleEvidence: 'none',
    };
    expect(row('N03', dual, req).status).toBe('NOT_MET');
    expect(row('N11', dual, req).status).toBe('MET');
    expect(
      row('N03', { originalNationalityForPermit: 'authority-review' }, req)
        .pendingDetails,
    ).toContain('PD-280');
  });
  test('N04 eligibility by birth or a missed option requires the applicable ground and expiry', () => {
    const req = { route: 'one-year' as const };
    expect(
      row('N04', { oneYearGround: 'birth', spanishCivilBirthRecord: true }, req)
        .status,
    ).toBe('MET');
    const missed: EsNationalityFacts = {
      oneYearGround: 'missed-option',
      optionUnexercisedAndDocumented: true,
      optionBasis: 'ordinary',
      birthDate: '2006-11-23',
    };
    expect(row('N04', missed, req).status).toBe('MET');
    expect(row('N04', { ...missed, birthDate: '2006-11-24' }, req).status).toBe(
      'NOT_MET',
    );
    expect(
      row('N04', { ...missed, optionBasis: 'never-expires' }, req).status,
    ).toBe('NOT_MET');
    expect(
      row(
        'N04',
        {
          ...missed,
          optionBasis: 'late-emancipation',
          optionEventDate: '2024-11-22',
        },
        req,
      ).status,
    ).toBe('MET');
    expect(
      row(
        'N04',
        {
          ...missed,
          optionBasis: 'support-ended',
          optionEventDate: '2024-11-23',
        },
        req,
      ).status,
    ).toBe('NOT_MET');
    expect(row('N-ONE-YEAR', {}, req).status).toBe('UNKNOWN');
  });
  test('N05 and N06 measure guardianship and marriage separately', () => {
    const req = { route: 'one-year' as const };
    const guardian: EsNationalityFacts = {
      oneYearGround: 'guardianship',
      qualifyingGuardianshipDocumented: true,
      guardianshipFrom: '2024-11-23',
    };
    expect(row('N05', guardian, req).status).toBe('MET');
    expect(
      row('N05', { ...guardian, guardianshipTo: '2026-11-22' }, req).status,
    ).toBe('NOT_MET');
    const marriage = {
      route: 'marriage' as const,
      marriedToSpaniard: '2025-11-23',
    };
    const spouse = {
      spouseSpanishFrom: '2025-11-23',
      unseparatedAndCohabitationDocumented: true,
    };
    expect(row('N06', spouse, marriage).status).toBe('MET');
    expect(
      row('N06', { ...spouse, spouseSpanishFrom: '2025-11-24' }, marriage)
        .pendingDetails,
    ).toContain('PD-281');
    expect(
      row(
        'N06',
        { ...spouse, unseparatedAndCohabitationDocumented: false },
        marriage,
      ).status,
    ).toBe('NOT_MET');
  });
  test('N07, N08 verify widowhood and original-nationality descent', () => {
    const req = { route: 'one-year' as const };
    const widow: EsNationalityFacts = {
      oneYearGround: 'widowed',
      widowSpanishSpouseDied: '2026-11-23',
      widowUnseparatedAtDeath: true,
      widowCertificatesAndCohabitation: true,
    };
    expect(row('N07', widow, req).status).toBe('MET');
    expect(
      row('N07', { ...widow, widowUnseparatedAtDeath: false }, req).status,
    ).toBe('NOT_MET');
    const descent: EsNationalityFacts = {
      oneYearGround: 'descent',
      bornOutsideSpain: true,
      spanishByOriginAncestor: 'grandparent',
      descentChainDocumented: true,
    };
    expect(row('N08', descent, req).status).toBe('MET');
    expect(
      row('N08', { ...descent, descentChainDocumented: undefined }, req).status,
    ).toBe('UNKNOWN');
    expect(
      row('N08', { ...descent, bornOutsideSpain: false }, req).status,
    ).toBe('NOT_MET');
  });
  test('N09 covers representation, supported or independent applicants, and the disputed birthday', () => {
    const minor: EsNationalityFacts = {
      birthDate: '2012-11-24',
      emancipated: false,
      applicantSignature: 'representative',
      representationDocumented: true,
    };
    expect(row('N09', minor).status).toBe('MET');
    expect(
      row('N09', { ...minor, birthDate: '2012-11-23' }).pendingDetails,
    ).toContain('PD-282');
    expect(row('N09', { ...minor, birthDate: '2012-11-22' }).status).toBe(
      'NOT_MET',
    );
    expect(
      row('N09', {
        ...minor,
        birthDate: '2012-11-22',
        applicantSignature: 'assisted',
      }).status,
    ).toBe('MET');
    expect(
      row('N09', {
        ...minor,
        birthDate: '2009-11-23',
        applicantSignature: 'self',
        emancipated: true,
      }).status,
    ).toBe('MET');
    expect(row('N09', { birthDate: '2008-11-23' }).status).toBe('MET');
  });
  test('N10 distinguishes criminal records from conduct, N14 requires documents, N15 dates the receipt', () => {
    expect(row('N10-RECORDS', {}).status).toBe('MET');
    expect(
      row('N10-RECORDS', {
        criminalRecords: {
          ...complete.criminalRecords,
          originRecordOrLawfulAlternative: false,
        },
      }).status,
    ).toBe('NOT_MET');
    expect(
      row('N10', { conductAndSecurityDecision: undefined }).pendingDetails,
    ).toContain('PD-283');
    expect(row('N10', { conductAndSecurityDecision: false }).status).toBe(
      'NOT_MET',
    );
    expect(
      row('N14', { documents: { ...complete.documents, address: false } })
        .status,
    ).toBe('NOT_MET');
    expect(row('N15', {}).title).toContain('104.05');
    expect(row('N15', { feePaidOn: '2026-11-24' }).status).toBe('NOT_MET');
  });
  test('N11–N13 separate language, civic exam, dispensations and judicial integration', () => {
    expect(row('N11', { deleLevel: 'A1' }).status).toBe('NOT_MET');
    expect(row('N11', { deleLevel: 'A2' }).status).toBe('MET');
    expect(
      row('N11', {
        deleEvidence: 'registered-official-equivalent',
        deleLevel: undefined,
      }).status,
    ).toBe('MET');
    const noExams: EsNationalityFacts = {
      deleEvidence: 'none',
      ccse: { verifiedPass: false },
    };
    expect(
      row('N11', { ...noExams, documentedNationalities: ['PH'] }).status,
    ).toBe('NOT_MET');
    expect(
      row('N11', { ...noExams, documentedNationalities: ['GQ'] }).status,
    ).toBe('MET');
    expect(
      row('N12', { ...noExams, documentedNationalities: ['GQ'] }).status,
    ).toBe('NOT_MET');
    expect(
      row('N12', { ccse: { correct: 14, issued: '2022-11-23' } }).status,
    ).toBe('NOT_MET');
    expect(
      row('N12', { ccse: { correct: 15, issued: '2022-11-23' } }).status,
    ).toBe('MET');
    expect(
      row('N12', { ccse: { correct: 15, issued: '2022-11-22' } }).status,
    ).toBe('NOT_MET');
    expect(
      row('N12', {
        ccse: {
          verifiedPass: true,
          validThrough: '2026-11-22',
          issued: '2023-01-01',
        },
      }).status,
    ).toBe('NOT_MET');
    expect(row('N12', { ccse: { correct: 25 } }).pendingDetails).toContain(
      'PD-284',
    );
    expect(row('N12', { ...noExams, birthDate: '2008-11-24' }).status).toBe(
      'MET',
    );
    expect(row('N12', { ...noExams, birthDate: '2008-11-23' }).status).toBe(
      'NOT_MET',
    );
    expect(
      row('N11', { ...noExams, examRelief: 'spanish-eso-diploma' }).status,
    ).toBe('MET');
    expect(
      row('N12', { ...noExams, examRelief: 'full-dispensation' }).status,
    ).toBe('MET');
    expect(
      row('N13', { examRelief: 'pending', dispensaRequestedOn: '2026-11-23' })
        .status,
    ).toBe('NOT_MET');
    expect(
      row('N12', {
        ...noExams,
        examRelief: 'pending',
        dispensaRequestedOn: '2026-10-01',
      }).status,
    ).toBe('UNKNOWN');
    expect(
      row('N12', {
        ...noExams,
        examRelief: 'pending',
        dispensaRequestedOn: '2026-05-22',
      }).status,
    ).toBe('NOT_MET');
    expect(
      row('N13', {
        birthDate: '2013-01-01',
        schoolOrCareCertificateIfRequired: false,
      }).status,
    ).toBe('NOT_MET');
    expect(row('N13', { integrationDecision: undefined }).status).toBe(
      'UNKNOWN',
    );
  });
  test('N13 applies the centre certificate to minors of compulsory school age or registered with a covered centre', () => {
    const req = {
      route: 'one-year' as const,
      permits: [{ from: '2023-11-23' }],
    };
    const child: EsNationalityFacts = {
      birthDate: '2023-11-23',
      oneYearGround: 'birth',
      spanishCivilBirthRecord: true,
      applicantSignature: 'representative',
      representationDocumented: true,
      emancipated: false,
      deleEvidence: 'none',
      ccse: { verifiedPass: false },
      registeredWithSchoolOrCareCentre: false,
      schoolOrCareCertificateIfRequired: false,
    };
    const preschool = assess(child, req);
    for (const id of ['ES-N11', 'ES-N12', 'ES-N13'])
      expect(preschool.checks.find((c) => c.id === id)?.status).toBe('MET');
    expect(preschool.status).toBe('MET');
    expect(preschool.earliestDate).toBe(base.simulationDate);
    expect(preschool.pathwayCompletionDate).toBe(base.simulationDate);
    for (const [facts, status] of [
      [{ registeredWithSchoolOrCareCentre: true }, 'NOT_MET'],
      [{ registeredWithSchoolOrCareCentre: undefined }, 'UNKNOWN'],
      [{ birthDate: '2020-11-23' }, 'NOT_MET'],
    ] as const) {
      const other = assess({ ...child, ...facts }, req);
      expect(other.checks.find((c) => c.id === 'ES-N13')?.status).toBe(status);
      expect(other.status).toBe(status);
      expect(other.earliestDate).toBeUndefined();
      expect(other.pathwayCompletionDate).toBe(base.simulationDate);
    }
  });
  test('N16 fee estimate uses only the outstanding sittings and their price table', () => {
    const unpaid: EsNationalityFacts = {
      deleEvidence: 'none',
      ccse: { verifiedPass: false },
      examBooking: { date: '2026-12-01', deleCountry: 'ES', deleLevel: 'A2' },
    };
    expect(row('N16', unpaid).title).toContain('223 EUR');
    expect(
      row('N16', {
        ...unpaid,
        examBooking: { ...unpaid.examBooking, ccseRetakeFrom: '2026-06-01' },
      }).title,
    ).toContain('138 EUR');
    expect(
      row('N16', {
        ...unpaid,
        examBooking: { ...unpaid.examBooking, ccseRetakeFrom: '2026-05-31' },
      }).title,
    ).toContain('223 EUR');
    expect(
      row('N16', { ...unpaid, deleEvidence: 'dele', deleLevel: 'B1' }).title,
    ).toContain('85 EUR');
    expect(
      row('N16', {
        ...unpaid,
        examBooking: { ...unpaid.examBooking, date: '2027-01-01' },
      }).status,
    ).toBe('UNKNOWN');
    expect(
      row('N16', {
        ...unpaid,
        examBooking: { ...unpaid.examBooking, deleCountry: 'CN' },
      }).status,
    ).toBe('UNKNOWN');
    expect(row('N16', {}).title).toContain('0 EUR');
  });
  test('N17 uses the 180th day after notification and the actual declaration exception; N18 requires registration', () => {
    const granted: EsNationalityFacts = {
      grantNotifiedOn: '2026-05-27',
      declarationOn: '2026-11-23',
      oathOrMilitaryEvidence: true,
      canDeclareInPerson: true,
      renunciationBasis: 'french',
      declaredRenunciation: false,
      competentRegistryOrNotary: true,
      civilNeighbourhoodChosen: true,
    };
    expect(row('N17', granted).title).toContain('2026-11-23');
    expect(row('N17', granted).status).toBe('MET');
    expect(row('N17', { ...granted, renunciationBasis: 'other' }).status).toBe(
      'NOT_MET',
    );
    expect(
      row('N17', { ...granted, grantNotifiedOn: '2026-05-26' }).status,
    ).toBe('NOT_MET');
    expect(
      row('N17', {
        ...granted,
        grantNotifiedOn: '2026-05-26',
        notarialSuspensionAwaitingConfirmation: true,
      }).status,
    ).toBe('UNKNOWN');
    expect(
      row('N17', {
        ...granted,
        grantNotifiedOn: '2026-05-26',
        confirmedDeclarationDeadline: '2026-11-24',
      }).status,
    ).toBe('MET');
    expect(
      row('N17', {
        ...granted,
        grantNotifiedOn: '2026-05-26',
        declarationOn: undefined,
      }).status,
    ).toBe('UNKNOWN');
    expect(
      row('N18', { ...granted, registrationCompleted: false }).status,
    ).toBe('NOT_MET');
    expect(row('N18', { ...granted, registeredOn: '2026-11-23' }).status).toBe(
      'MET',
    );
  });
  test('an authorised voluntary agent and post-grant observation preserve the original filing evidence', () => {
    expect(
      row('N09', {
        applicantSignature: 'authorised-agent',
        representationDocumented: true,
      }).status,
    ).toBe('MET');
    expect(
      row('N09', {
        applicantSignature: 'authorised-agent',
        representationDocumented: undefined,
      }).status,
    ).toBe('UNKNOWN');
    const facts: EsNationalityFacts = {
      ccse: { verifiedPass: true, issued: '2022-11-23' },
      followUpDate: '2027-06-21',
      grantNotifiedOn: '2027-01-01',
      declarationOn: '2027-06-20',
      canDeclareInPerson: true,
      oathOrMilitaryEvidence: true,
      declaredRenunciation: true,
      competentRegistryOrNotary: true,
      civilNeighbourhoodChosen: true,
      registeredOn: '2027-06-21',
    };
    expect(row('N12', facts).status).toBe('MET');
    expect(row('N17', facts).status).toBe('MET');
    expect(row('N18', facts).status).toBe('MET');
  });
  test('changes language without changing IDs, sources or statuses', () => {
    const zh = assess(),
      en = assess({}, { locale: 'en' });
    expect(zh.checks.map((c) => [c.id, c.sources, c.status])).toEqual(
      en.checks.map((c) => [c.id, c.sources, c.status]),
    );
    expect(
      zh.checks.every(
        (c, i) => c.title !== en.checks[i].title && c.sources.length > 0,
      ),
    ).toBe(true);
  });
});
