import type { FederalAnswers, FederalPerson } from '../src/canada-full/federal';

export const filed = {
  filedOn: '2026-11-23',
  signed: true,
  allFamilyDeclared: true,
  changesReported: true,
  validIdentityAndTravelDocuments: true,
  applicationEvidenceComplete: true,
  processingFeesPaid: true,
  biometricPayers: 1,
  amountPaidIncludingBiometrics: 1675,
};
export const person: FederalPerson = {
  dateOfBirth: '1980-01-01',
  safety: {
    security: 'clear',
    humanRights: 'clear',
    sanctions: 'clear',
    organisedCrime: 'clear',
  },
  criminalFinding: 'clear',
  publicHealth: 'clear',
  publicSafety: 'clear',
  excessiveDemand: 'clear',
  exam: { examOn: '2026-11-01', panelExamComplete: true },
  foreignStays: [],
  biometrics: 'provided-for-pr',
  definitiveChecklistSatisfied: true,
};
export const federal: FederalAnswers = {
  principal: person,
  members: [],
  adequateSupportArrangements: true,
  misrepresentation: 'clear',
  protectionAndCompliance: 'clear',
  applications: { 'CA-EE-FSW': filed },
};
