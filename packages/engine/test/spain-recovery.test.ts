import { describe, expect, it } from 'vitest';
import type { EsFullRequest } from '../src/spain-full';
import { longTermDocuments, recoveryPath } from '../src/spain-recovery';
import type {
  EsLongTermCardFacts,
  EsRecoveryFacts,
} from '../src/spain-recovery';

const req: EsFullRequest = {
  simulationDate: '2026-11-23',
  route: 'general',
  permits: [],
  trips: [],
};
const national: EsRecoveryFacts = {
  previousStatus: 'national',
  officeHolidays: [],
  ground: 'another-eu-status',
  lossDecision: 'confirmed',
  derivedFromReunification: false,
  place: 'spain',
  correctOfficeAndSignedForm: true,
  lawfulStay: true,
  noEntryAlert: true,
  recognizedTravelDocument: true,
  passportExpires: '2027-11-23',
  subjectToCriminalRecordRequirement: true,
  clearRecordsInAllCountries: true,
  publicOrderAndSecurityCleared: true,
};
const eu: EsRecoveryFacts = {
  ...national,
  previousStatus: 'eu',
  publicHealthCleared: true,
  regularResourcesDocumented: true,
  resourcesAcceptedAsSufficient: true,
  insurance: {
    kind: 'public',
    entitledOrAuthorized: true,
    validFrom: '2025-01-01',
    proof: true,
  },
};
function run(type: 'R-E' | 'R-N', overrides: Partial<EsRecoveryFacts> = {}) {
  const facts = { ...(type === 'R-E' ? eu : national), ...overrides };
  const result = recoveryPath({ ...req, recovery: facts }, type);
  const check = (id: string) => result.checks.find((c) => c.id === id);
  return { result, check, status: (id: string) => check(id)?.status };
}
const card: EsLongTermCardFacts = {
  operation: 'first',
  officeHolidays: [],
  triggerDate: '2026-09-20',
  applied: '2026-10-20',
  validIdAndPhoto: true,
  cardFeePaid: 21.87,
  publicWard: false,
  otherLossGround: false,
  absences: [],
  outsideSpainPeriods: [],
  formerBlueCardOrQualifyingFamily: false,
  qualifyingCooperation: false,
  shortReturnDisputed: false,
};
function docs(
  kind: 'L' | 'E' | 'M',
  overrides: Partial<EsLongTermCardFacts> = {},
) {
  const [tie, retained] = longTermDocuments(
    { ...req, locale: 'en', longTermCard: { ...card, ...overrides } },
    kind,
  );
  expect(tie.id).toBe('ES-T01');
  expect(retained.id).toBe('ES-T02');
  return { tie, retained };
}

describe('Recovery of national and EU long-term residence (RD 1155/2024 arts. 186–189)', () => {
  it('requires the matching original status and a statutory loss ground; expired TIE alone is renewed', () => {
    for (const type of ['R-N', 'R-E'] as const) {
      expect(run(type).result.status).toBe('MET');
      expect(run(type).status('ES-R01')).toBe('MET');
      for (const ground of ['other', 'expired-card'] as const) {
        expect(run(type, { ground }).status('ES-R01')).toBe('NOT_MET');
      }
      expect(
        run(type, { ground: 'outside-eu', lossDecision: 'pending' }).status(
          'ES-R01',
        ),
      ).toBe('UNKNOWN');
      expect(
        run(type, { ground: 'outside-eu', lossDecision: 'retained' }).status(
          'ES-R01',
        ),
      ).toBe('NOT_MET');
      expect(
        run(type, { ground: 'outside-eu', lossDecision: 'confirmed' }).status(
          'ES-R01',
        ),
      ).toBe('MET');
      expect(run(type, { previousStatus: 'neither' }).result.status).toBe(
        'NOT_MET',
      );
    }
    expect(run('R-N', { previousStatus: 'eu' }).result.status).toBe('NOT_MET');
    expect(run('R-E', { previousStatus: 'national' }).result.status).toBe(
      'NOT_MET',
    );
    expect(run('R-E', { ground: 'voluntary-return' }).status('ES-R01')).toBe(
      'NOT_MET',
    );
    expect(run('R-N', { ground: 'outside-spain' }).status('ES-R01')).toBe(
      'NOT_MET',
    );
  });
  it('keeps the sixth anniversary and a pending decision distinct from confirmed loss after six years', () => {
    const sixYears = (
      since: string,
      lossDecision: EsRecoveryFacts['lossDecision'],
    ) =>
      run('R-E', {
        ground: 'outside-spain',
        outsideSpainSince: since,
        lossDecision,
      }).check('ES-R01');
    expect(sixYears('2020-11-24', 'pending')?.status).toBe('NOT_MET');
    expect(sixYears('2020-11-23', 'pending')?.pendingDetails).toContain(
      'PD-295',
    );
    expect(sixYears('2020-11-22', 'pending')?.status).toBe('UNKNOWN');
    expect(sixYears('2020-11-22', 'confirmed')?.status).toBe('MET');
    expect(sixYears('2020-11-22', 'retained')?.status).toBe('NOT_MET');
  });
  it('only national recovery admits a formerly regrouped family member who is still a minor', () => {
    for (const type of ['R-N', 'R-E'] as const) {
      const child = run(type, {
        derivedFromReunification: true,
        birthDate: '2008-11-24',
      });
      expect(child.status('ES-R02')).toBe(type === 'R-N' ? 'MET' : 'NOT_MET');
      expect(
        run(type, {
          derivedFromReunification: true,
          birthDate: '2008-11-23',
        }).status('ES-R02'),
      ).toBe('NOT_MET');
      expect(
        run(type, { derivedFromReunification: false }).status('ES-R02'),
      ).toBe('MET');
    }
    expect(
      run('R-N', { derivedFromReunification: true }).status('ES-R02'),
    ).toBe('UNKNOWN');
  });
  it('checks a completed three-year voluntary-return undertaking and lawful visits up to three calendar months', () => {
    const recovery: Partial<EsRecoveryFacts> = {
      ground: 'voluntary-return',
      returnCommitmentFrom: '2023-11-23',
      visitsDuringCommitment: [
        { enteredSpain: '2024-01-31', leftSpain: '2024-04-30' },
      ],
      visitsLawful: true,
    };
    const go = (changes: Partial<EsRecoveryFacts>) =>
      run('R-N', { ...recovery, ...changes });
    expect(go({}).result.status).toBe('MET');
    expect(go({}).status('ES-R03')).toBe('MET');
    expect(go({ returnCommitmentFrom: '2023-11-24' }).status('ES-R03')).toBe(
      'NOT_MET',
    );
    expect(
      go({
        visitsDuringCommitment: [
          { enteredSpain: '2024-01-31', leftSpain: '2024-05-01' },
        ],
      }).status('ES-R03'),
    ).toBe('NOT_MET');
    expect(go({ visitsLawful: false }).status('ES-R03')).toBe('NOT_MET');
    // The commitment ended on 1 September. Only two months of the four-month visit fell inside it.
    expect(
      go({
        returnCommitmentFrom: '2023-09-01',
        visitsDuringCommitment: [
          { enteredSpain: '2026-07-01', leftSpain: '2026-11-01' },
        ],
      }).status('ES-R03'),
    ).toBe('MET');
    expect(go({ visitsDuringCommitment: undefined }).status('ES-R03')).toBe(
      'UNKNOWN',
    );
    expect(run('R-N').status('ES-R03')).toBeUndefined();
  });
  it('requires the signed form, correct office, a passport with a year left and the relevant residence-country certificates', () => {
    expect(run('R-N').status('ES-R04')).toBe('MET');
    expect(run('R-N', { passportExpires: '2027-11-22' }).status('ES-R04')).toBe(
      'NOT_MET',
    );
    expect(run('R-N', { lawfulStay: false }).status('ES-R04')).toBe('NOT_MET');
    expect(
      run('R-E', { clearRecordsInAllCountries: undefined }).status('ES-R04'),
    ).toBe('UNKNOWN');
    expect(
      run('R-E', {
        subjectToCriminalRecordRequirement: false,
        clearRecordsInAllCountries: undefined,
      }).status('ES-R04'),
    ).toBe('MET');
    expect(
      run('R-N', { place: 'consulate', lawfulStay: undefined }).status(
        'ES-R04',
      ),
    ).toBe('MET');
    expect(
      run('R-E', {
        place: 'consulate',
        consularRequirementsConflict: true,
      }).check('ES-R04')?.pendingDetails,
    ).toContain('PD-296');
  });
  it('requires the official security finding and only applies the EU branch health, means and insurance checks there', () => {
    expect(
      run('R-N', {
        publicHealthCleared: false,
        regularResourcesDocumented: false,
        insurance: { kind: 'none' },
      }).result.status,
    ).toBe('MET');
    expect(run('R-N').status('ES-R05')).toBe('MET');
    expect(run('R-N').status('ES-R06')).toBeUndefined();
    expect(run('R-N').status('ES-R07')).toBeUndefined();
    expect(run('R-E').status('ES-R05')).toBe('MET');
    expect(run('R-E', { publicHealthCleared: false }).status('ES-R05')).toBe(
      'NOT_MET',
    );
    expect(
      run('R-N', { publicOrderAndSecurityCleared: undefined }).check('ES-R05')
        ?.pendingDetails,
    ).toContain('PD-283');
    expect(run('R-E').status('ES-R06')).toBe('MET');
    expect(
      run('R-E', { resourcesAcceptedAsSufficient: undefined }).check('ES-R06')
        ?.pendingDetails,
    ).toContain('PD-286');
    expect(
      run('R-E', { regularResourcesDocumented: false }).status('ES-R06'),
    ).toBe('NOT_MET');
    expect(run('R-E').status('ES-R07')).toBe('MET');
    expect(
      run('R-E', {
        insurance: { ...eu.insurance, validFrom: '2026-11-24' },
      }).status('ES-R07'),
    ).toBe('NOT_MET');
    expect(
      run('R-E', { insurance: { kind: 'other' } }).check('ES-R07')
        ?.pendingDetails,
    ).toContain('PD-291');
  });
  it('checks the section 2.7 receipt for EUR 21.87 within ten working days and treats consular visa charges separately', () => {
    const onTime = {
      exemptPublicGuardian: false,
      paid: true,
      amount: 21.87,
      workingDaysAfterAdmission: 10,
    };
    expect(run('R-N', { fee: onTime }).status('ES-R08')).toBe('MET');
    expect(
      run('R-N', { fee: { ...onTime, amount: 21.86 } }).status('ES-R08'),
    ).toBe('NOT_MET');
    expect(
      run('R-E', { fee: { ...onTime, workingDaysAfterAdmission: 11 } }).status(
        'ES-R08',
      ),
    ).toBe('NOT_MET');
    expect(
      run('R-E', { fee: { exemptPublicGuardian: true } }).status('ES-R08'),
    ).toBe('MET');
    expect(run('R-N').status('ES-R08-visa')).toBeUndefined();
    const abroad: Partial<EsRecoveryFacts> = {
      place: 'consulate',
      consularVisa: 'unconfirmed',
      grantNotification: '2026-08-15',
      lawfulEntry: '2026-09-01',
    };
    expect(run('R-E', abroad).check('ES-R08-visa')?.pendingDetails).toContain(
      'PD-296',
    );
    expect(
      run('R-E', { ...abroad, consularVisa: 'confirmed-exempt' }).status(
        'ES-R08-visa',
      ),
    ).toBe('MET');
    expect(
      run('R-N', { ...abroad, consularVisa: 'issued-and-paid' }).status(
        'ES-R08-visa',
      ),
    ).toBe('MET');
    expect(
      run('R-N', { ...abroad, consularVisa: 'refused' }).status('ES-R08-visa'),
    ).toBe('NOT_MET');
  });
  it('starts the five-year TIE filing clock at notification in Spain or lawful entry from abroad', () => {
    const home: Partial<EsRecoveryFacts> = {
      grantNotification: '2026-09-20',
      cardApplied: '2026-10-20',
    };
    expect(run('R-E', home).status('ES-R09')).toBe('MET');
    expect(
      run('R-E', { ...home, cardApplied: '2026-10-21' }).status('ES-R09'),
    ).toBe('NOT_MET');
    // 22 November 2026 is a Sunday: the next working day is 23 November.
    expect(
      run('R-N', {
        grantNotification: '2026-10-22',
        cardApplied: '2026-11-23',
      }).status('ES-R09'),
    ).toBe('MET');
    expect(
      run('R-N', {
        grantNotification: '2026-10-20',
        cardApplied: '2026-11-23',
        officeHolidays: undefined,
      }).check('ES-R09')?.pendingDetails,
    ).toContain('PD-099');
    expect(
      run('R-N', {
        grantNotification: '2026-10-20',
        cardApplied: '2026-11-23',
        officeHolidays: ['2026-11-20'],
      }).status('ES-R09'),
    ).toBe('MET');
    const abroad: Partial<EsRecoveryFacts> = {
      ...home,
      place: 'consulate',
      lawfulEntry: '2026-10-20',
      cardApplied: '2026-11-20',
    };
    expect(run('R-E', abroad).status('ES-R09')).toBe('MET');
    expect(
      run('R-E', { ...abroad, cardApplied: '2026-10-19' }).status('ES-R09'),
    ).toBe('NOT_MET');
    expect(
      run('R-E', { ...abroad, lawfulEntry: undefined }).status('ES-R09'),
    ).toBe('UNKNOWN');
    expect(run('R-E').result.decidedBy).not.toContain('ES-R09');
  });
});
describe('Long-term TIE and status retention are separate (arts. 178, 185, 201–203)', () => {
  it('checks first and renewal windows, receipts and domestic continued conditions', () => {
    for (const kind of ['L', 'E', 'M'] as const) {
      expect(docs(kind).tie.status).toBe('MET');
      expect(docs(kind, { applied: '2026-10-21' }).tie.status).toBe('NOT_MET');
      expect(docs(kind, { cardFeePaid: 21.86 }).tie.status).toBe('NOT_MET');
      expect(docs(kind, { publicWard: true, cardFeePaid: 0 }).tie.status).toBe(
        'MET',
      );
      const renew: Partial<EsLongTermCardFacts> = {
        operation: 'renew',
        birthDate: '1990-01-01',
        expiry: '2026-08-20',
        applied: '2026-06-20',
        nationalConditionsRetained: true,
      };
      expect(docs(kind, renew).tie.status).toBe('MET');
      expect(docs(kind, { ...renew, applied: '2026-06-19' }).tie.status).toBe(
        'NOT_MET',
      );
      expect(docs(kind, { ...renew, applied: '2026-11-20' }).tie.status).toBe(
        'MET',
      );
      expect(
        docs(kind, { ...renew, expiry: '2026-08-22', applied: '2026-11-23' })
          .tie.status,
      ).toBe('MET');
      expect(
        docs(kind, {
          ...renew,
          expiry: '2026-08-20',
          applied: '2026-11-23',
          officeHolidays: undefined,
        }).tie.pendingDetails,
      ).toContain('PD-099');
      const late = docs(kind, { ...renew, applied: '2026-11-23' });
      expect(late.tie.status).toBe('NOT_MET');
      expect(late.retained.status).toBe('MET');
      expect(
        docs(kind, { ...renew, nationalConditionsRetained: false }).tie.status,
      ).toBe(kind === 'L' ? 'NOT_MET' : 'MET');
    }
  });
  it('applies five then ten years and flags an unconfirmed age boundary for a subsequent renewal', () => {
    const renew: Partial<EsLongTermCardFacts> = {
      operation: 'renew',

      expiry: '2026-11-23',
      applied: '2026-11-23',
    };
    expect(
      docs('E', { ...renew, birthDate: '1996-11-24' }).tie.explanation,
    ).toContain('5 years');
    expect(
      docs('E', { ...renew, birthDate: '1996-11-22' }).tie.explanation,
    ).toContain('10 years');
    expect(
      docs('E', { ...renew, birthDate: '1990-11-23' }).tie.explanation,
    ).toContain('10 years');
    const birthday = { ...renew, birthDate: '1996-11-23' };
    expect(docs('E', birthday).tie.pendingDetails).toContain('PD-294');
    const confirmed = docs('E', {
      ...birthday,
      validityConfirmedAtAgeBoundary: true,
    }).tie;
    expect(confirmed.status).toBe('MET');
    expect(confirmed.explanation).toContain('10 years');
  });
  it('identifies ordinary twelve-month and blue-card twenty-four-month EU absences as risks pending an official decision', () => {
    const trip = (departed: string) => [
      { departed, area: 'outside-eu' as const },
    ];
    expect(docs('L', { absences: trip('2025-11-24') }).retained.status).toBe(
      'MET',
    );
    expect(
      docs('L', { absences: trip('2025-11-23') }).retained.pendingDetails,
    ).toContain('PD-295');
    expect(
      docs('E', {
        absences: trip('2024-11-24'),
        formerBlueCardOrQualifyingFamily: true,
      }).retained.status,
    ).toBe('MET');
    expect(
      docs('E', {
        absences: trip('2024-11-23'),
        formerBlueCardOrQualifyingFamily: true,
      }).retained.status,
    ).toBe('UNKNOWN');
    expect(
      docs('E', { absences: trip('2024-11-23'), decision: 'held' }).retained
        .status,
    ).toBe('MET');
    expect(docs('L', { decision: 'lost', absences: [] }).retained.status).toBe(
      'NOT_MET',
    );
    expect(docs('E', { otherLossGround: true }).retained.status).toBe(
      'UNKNOWN',
    );
  });
  it('joins overlapping absences, preserves proven physical returns and still tests geographical scope for cooperants', () => {
    const absences = [
      {
        departed: '2025-02-01',
        returned: '2025-10-01',
        area: 'outside-eu' as const,
      },
      {
        departed: '2025-09-01',
        returned: '2026-02-10',
        area: 'outside-eu' as const,
      },
    ];
    expect(docs('E', { absences }).retained.status).toBe('UNKNOWN');
    // Two shorter absences with a documented return in between do not make twelve consecutive months.
    expect(
      docs('E', {
        absences: [absences[0], { ...absences[1], departed: '2025-10-02' }],
      }).retained.status,
    ).toBe('MET');
    expect(
      docs('E', {
        absences: [absences[0], { ...absences[1], departed: '2025-10-02' }],
        shortReturnDisputed: true,
      }).retained.pendingDetails,
    ).toContain('PD-295');
    const six = docs('E', {
      absences: [{ departed: '2020-11-23', area: 'outside-eu' }],
      qualifyingCooperation: true,
    });
    expect(six.retained.status).toBe('UNKNOWN');
    const singleYear = docs('E', {
      absences: [{ departed: '2025-11-23', area: 'outside-eu' }],
      qualifyingCooperation: true,
    });
    expect(singleYear.retained.status).toBe('MET');
    const inEu = { departed: '2020-11-23', area: 'outside-spain' as const };
    expect(docs('E', { outsideSpainPeriods: [inEu] }).retained.status).toBe(
      'UNKNOWN',
    );
    expect(docs('L', { outsideSpainPeriods: [inEu] }).retained.status).toBe(
      'MET',
    );
  });
});
