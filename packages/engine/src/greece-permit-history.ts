import type { GrPermit } from './greece';
import type { GrFullRequest } from './greece-full';
import type { IsoDate } from './types';

interface ApplicantPermit {
  purpose: 'family' | 'other' | 'unconfirmed';
  issuedOn?: IsoDate;
  validity?: GrPermit;
}

/** Applicant grants as of the assessment day. A validity period does not date the grant. */
export function applicantPermitHistory(req: GrFullRequest): ApplicantPermit[] {
  const history: ApplicantPermit[] = [];
  const family = req.familyTcn;
  const today = req.simulationDate;
  for (const permit of req.permits ?? []) {
    if (
      permit.kind === 'temporary' ||
      (permit.issuedOn ? permit.issuedOn > today : permit.from > today)
    )
      continue;
    const purpose =
      permit.kind !== 'regular' || permit.purpose === 'other'
        ? 'other'
        : permit.purpose === 'family-reunification' ||
            family?.otherResidencePermitGranted === false
          ? 'family'
          : 'unconfirmed';
    history.push({ purpose, issuedOn: permit.issuedOn, validity: permit });
  }
  for (const renewal of req.backlogRenewals ?? []) {
    if (renewal.permitEffectiveOn <= today)
      history.push({
        purpose: renewal.category === 'family' ? 'family' : 'other',
      });
  }
  const mobility = req.blueCardMobility;
  if (mobility?.greekBlueCardFrom) {
    if (mobility.greekBlueCardFrom <= today)
      history.push({
        purpose: 'other',
        validity: {
          kind: 'regular',
          from: mobility.greekBlueCardFrom,
          to: mobility.greekBlueCardThrough,
        },
      });
  } else if (mobility?.greekBlueCardThrough)
    history.push({
      purpose: mobility.greekBlueCardThrough <= today ? 'other' : 'unconfirmed',
    });
  for (const period of mobility?.priorMemberPeriods ?? []) {
    if (period.from > today || period.issuer === 'other-member-state') continue;
    history.push({
      purpose: period.issuer === 'greece' ? 'other' : 'unconfirmed',
    });
  }

  if (
    family?.firstFamilyPermitIssuedOn &&
    family.firstFamilyPermitIssuedOn <= today
  )
    history.push({
      purpose: 'family',
      issuedOn: family.firstFamilyPermitIssuedOn,
    });
  else if (
    family?.previousFamilyCard ||
    family?.yearsSinceFirstFamilyPermit !== undefined ||
    family?.stage === 'renewal'
  )
    history.push({ purpose: 'family' });

  const {
    work,
    goldenVisa,
    tenYear,
    longTerm,
    greekFamily,
    euFamily,
    nationality,
  } = req;
  // A renewal identifies an already issued card. An application for initial
  // issue, a sponsor's card and an EU right without a card do not identify one.
  if (
    family?.otherResidencePermitGranted ||
    family?.previousAutonomousChildCard
  )
    history.push({ purpose: 'other' });
  if (
    work?.stage === 'renewal' ||
    work?.sameJobOnGreekHighlyQualifiedPermit ||
    (work?.blueCardYears !== undefined && work.blueCardYears > 0)
  )
    history.push({ purpose: 'other' });
  if (
    goldenVisa?.stage === 'renewal' ||
    goldenVisa?.regime === 'legacy-card' ||
    goldenVisa?.originalGrantTier ||
    goldenVisa?.registrationProofSubmittedAtGrant === true ||
    goldenVisa?.worksInGreeceUnderThisPermit === true
  )
    history.push({ purpose: 'other' });
  if (
    tenYear?.hasPriorCard ||
    (tenYear?.stage === 'renewal' && tenYear.hasPriorCard !== false) ||
    tenYear?.cardExpiresOn
  )
    history.push({ purpose: 'other' });
  if (
    longTerm?.stage === 'renewal' ||
    longTerm?.stage === 'reacquisition' ||
    longTerm?.convertingTenYearCard ||
    longTerm?.formerBlueCardEndorsement ||
    longTerm?.lossReason ||
    longTerm?.category === 'investor' ||
    longTerm?.category === 'study'
  )
    history.push({ purpose: 'other' });
  if (nationality?.permit === 'investor') history.push({ purpose: 'other' });
  if (
    greekFamily?.initialCardGrantedOn &&
    greekFamily.initialCardGrantedOn <= today
  )
    history.push({
      purpose: 'other',
      issuedOn: greekFamily.initialCardGrantedOn,
    });
  if (
    greekFamily?.stage === 'renewal' ||
    greekFamily?.priorCardExpiry ||
    greekFamily?.ordinaryRenewalDocumentsReady ||
    greekFamily?.retainedRightDocumentsReady ||
    greekFamily?.historicalConversionDocumentsReady ||
    greekFamily?.siblingExtensionAlreadyGranted ||
    greekFamily?.stage === 'maintain'
  )
    history.push({ purpose: 'other' });
  if (
    euFamily?.priorCardIssued ||
    euFamily?.priorCardExpiry ||
    ((euFamily?.stage === 'renewal' ||
      euFamily?.stage === 'permanent-renewal') &&
      euFamily.priorCardIssued !== false)
  )
    history.push({ purpose: 'other' });
  if (req.integration?.basis === 'family-pr')
    history.push({ purpose: 'other' });
  // A status decision or an unspecified ordinary title does not establish
  // the purpose of the applicant's residence permit.
  if (
    longTerm?.category === 'ordinary' ||
    longTerm?.category === 'protected' ||
    nationality?.permit === 'listed' ||
    nationality?.permit === 'other-definitive' ||
    (req.grantedProtection && req.grantedProtection.grantedOn <= today)
  )
    history.push({ purpose: 'unconfirmed' });
  return history;
}
