import { addDays } from '../dates';
import { afterYears } from '../pilot';
import type { IsoDate } from '../types';
import { all, any, atMost, checksFor, poverty, reviewed, s, v } from './check';
import type { Answer } from './check';
import { supportExemption } from './immigration';
import { isFamilyCategory } from './petition';
import type { AdjustmentCategory } from './petition';
import type { UsFullRequest } from './types';

export function feeChecks(
  request: UsFullRequest,
  category: AdjustmentCategory,
  receipt: IsoDate,
  filingOn?: IsoDate,
  filedI485On?: IsoDate,
) {
  const check = checksFor(request);
  const a = request.fees;
  const date = filingOn ?? receipt;
  const channel = a?.channel;
  const law = v.fees.value;
  const consular = v.consularFees.value;
  const eb5 = v.eb5Fees.value;
  const rates = date < eb5.effective ? eb5.old : eb5.current;
  const immigrantApplication =
    request.pathway === 'US-FAMILY' ||
    request.pathway === 'US-EMPLOYMENT' ||
    request.pathway === 'US-ADJUSTMENT';
  const immigration = immigrantApplication
    ? request.admission?.process
    : undefined;
  const military = request.pathway === 'US-MILITARY';
  const refugee =
    request.pathway === 'US-HUMANITARIAN' &&
    request.humanitarian?.status === 'refugee';

  const fee = (
    id: string,
    form: string,
    cost: number | undefined,
    sources = s.fee,
    pending = 'PD-276',
    detail?: [string, string],
  ) =>
    check(
      `C44-${id}`,
      `${form} 费用`,
      `${form} fee`,
      cost === undefined ? undefined : true,
      sources,
      pending,
      detail ??
        (cost === undefined
          ? [
              '金额取决于所选类别、递交渠道或减免，尚待确认。',
              'The amount depends on the category, filing channel or fee relief and is still to be confirmed.',
            ]
          : [`应计表格费用 USD ${cost}。`, `Scheduled form fee: USD ${cost}.`]),
    );
  const paperOnly = (amount: number) =>
    channel === 'online' ? undefined : amount;
  const lookup = (amounts: { online: number; paper: number }) =>
    channel
      ? amounts[channel]
      : amounts.online === amounts.paper
        ? amounts.paper
        : undefined;
  const baseline = poverty(a?.household);
  const povertyLaw = v.poverty.value;
  const currentPoverty =
    date >= povertyLaw.effective && date.startsWith(String(povertyLaw.year));
  const income = a?.household?.incomeUsd;
  const waiverQualified = any(
    a?.receivesMeansTestedBenefit,
    reviewed(a?.extremeFinancialHardship),
    currentPoverty && baseline !== undefined
      ? atMost(income, baseline * law.waiverRatio)
      : undefined,
  );
  const reducedQualified =
    currentPoverty && baseline !== undefined
      ? atMost(income, baseline * law.reducedRatio)
      : undefined;

  const relief = (allowsWaiver: boolean, allowsReduction = false): Answer => {
    if (a?.relief === undefined)
      return allowsWaiver || allowsReduction ? undefined : true;
    if (a.relief === 'none') return true;
    if (a.relief === 'reduced')
      return all(
        allowsReduction,
        channel === undefined ? undefined : channel === 'paper',
        reducedQualified,
      );
    return all(
      allowsWaiver,
      channel === undefined ? undefined : channel === 'paper',
      waiverQualified,
    );
  };
  const relievedFee = (
    base: number | undefined,
    allowed: Answer,
    reduced: number | undefined = undefined,
  ) => {
    if (!a?.relief || a.relief === 'none') return base;
    if (allowed === false) return base;
    if (allowed === undefined) return undefined;
    return a.relief === 'waiver' ? law.none : reduced;
  };

  const checks = [];
  let reliefStatus: Answer = true;
  switch (request.pathway) {
    case 'US-NATURALIZATION':
    case 'US-SPOUSE':
    case 'US-MILITARY':
      reliefStatus = military ? true : relief(true, true);
      checks.push(
        fee(
          'N400',
          'N-400',
          military
            ? law.none
            : relievedFee(lookup(law.n400), reliefStatus, law.n400Reduced),
        ),
      );
      checks.push(
        fee(
          'N336',
          'N-336',
          military ? law.none : relievedFee(lookup(law.n336), relief(true)),
          s.n336Fee,
        ),
      );
      break;
    case 'US-CONDITIONS':
      if (request.conditional === 'investor') {
        reliefStatus = relief(false);
        checks.push(
          fee(
            'I829',
            'I-829',
            paperOnly(rates.i829),
            [...s.fee, ...s.eb5Fee],
            'PD-265',
          ),
        );
      } else if (request.conditional === 'marriage') {
        const abuse = request.conditions?.marriage?.filing === 'abuse';
        const exemption = reviewed(request.conditions?.marriage?.waiverBasis);
        reliefStatus = abuse && exemption === true ? true : relief(true);
        checks.push(
          fee(
            'I751',
            'I-751',
            abuse && exemption !== false
              ? exemption === true
                ? law.none
                : undefined
              : relievedFee(lookup(law.i751), reliefStatus),
          ),
        );
      }
      break;
    case 'US-TRAVEL': {
      const travel = request.travel;
      switch (travel?.feeForm) {
        case 'i90': {
          const birth = request.dateOfBirth;
          const birthday = birth
            ? afterYears(birth, v.registration.value.renewAge)
            : undefined;
          const ageExempt = !!(
            birthday &&
            birth &&
            travel.cardExpiresOn &&
            travel.cardExpiresOn >
              afterYears(birth, v.address.value.expiresBeforeAge) &&
            date >= birthday &&
            date <= addDays(birthday, v.registration.value.reRegisterDays)
          );
          const exempt =
            travel.replacementReason === 'error-or-not-delivered' ||
            (travel.replacementReason === 'age-14' && ageExempt);
          reliefStatus = exempt ? true : relief(true);
          checks.push(
            fee(
              'I90',
              'I-90',
              exempt ? law.none : relievedFee(lookup(law.i90), reliefStatus),
            ),
          );
          break;
        }
        case 'i131':
          reliefStatus = relief(false);
          checks.push(fee('I131', 'I-131', paperOnly(law.reentryPermit)));
          break;
        case 'ds117':
          checks.push(fee('DS117', 'DS-117', consular.ds117, s.ds117Fee));
          checks.push(fee('SB1-IV', 'SB-1', consular.other, s.consularFee));
          break;
        case 'i131a':
          checks.push(fee('I131A', 'I-131A', law.i131a));
          break;
        case 'ar11':
          checks.push(fee('AR11', 'AR-11', law.address, s.address));
          break;
        case 'g325r':
          checks.push(
            fee(
              'G325R',
              'G-325R',
              channel === 'paper' ? undefined : law.registration,
              s.registration,
              'PD-268',
            ),
          );
          break;
        case undefined:
          checks.push(
            fee(
              'TRAVEL-FORM',
              'I-90 / I-131 / DS-117 / I-131A / AR-11 / G-325R',
              undefined,
            ),
          );
          break;
      }
      break;
    }
    case 'US-FAMILY': {
      if (!isFamilyCategory(category)) break;
      reliefStatus = relief(false);
      checks.push(fee('I130', 'I-130', lookup(law.i130)));
      break;
    }
    case 'US-EMPLOYMENT': {
      if (category !== 'employment') break;
      reliefStatus = relief(false);
      const e = request.employment;
      if (e?.category === 'eb5') {
        const regional = e.investment?.regionalCenter;
        const amendment = a?.eb5Amendment;
        const amount =
          regional === false
            ? rates.i526
            : regional === true && amendment === false
              ? rates.i526e + rates.integrity
              : regional === true && amendment === true
                ? rates.amendment
                : undefined;
        checks.push(
          fee(
            'EB5-PETITION',
            regional === false
              ? 'I-526'
              : regional
                ? 'I-526E'
                : 'I-526 / I-526E',
            amount === undefined ? undefined : paperOnly(amount),
            [...s.fee, ...s.eb5Fee],
            'PD-265',
          ),
        );
      } else if (e?.category === 'gold-card') {
        const people = e.gold?.includedPeople;
        checks.push(
          fee(
            'I140G',
            'I-140G',
            people && channel !== 'paper'
              ? people * v.gold.value.feePerPersonUsd
              : undefined,
            s.gold,
            'PD-276',
          ),
        );
      } else {
        const base = lookup(law.i140);
        const self =
          e?.i140SelfPetition ??
          (e?.category === 'eb1a' || e?.category === 'eb2-niw');
        const surcharge = self
          ? law.i140AsylumProgram.small
          : e?.employerNonprofit
            ? law.i140AsylumProgram.nonprofit
            : e?.employerEmployees === undefined ||
                e.employerNonprofit === undefined
              ? undefined
              : e.employerEmployees <= law.smallEmployerMax
                ? law.i140AsylumProgram.small
                : law.i140AsylumProgram.regular;
        checks.push(
          fee(
            'I140',
            'I-140',
            e?.category && base !== undefined && surcharge !== undefined
              ? base + surcharge
              : undefined,
          ),
        );
        if (a?.premiumProcessing) checks.push(fee('I907', 'I-907', law.i907));
      }
      break;
    }
    case 'US-ADJUSTMENT':
    case 'US-HUMANITARIAN':
      break;
  }
  if (isFamilyCategory(category) || category === 'employment') {
    const exempt = supportExemption(request, category);
    if (exempt !== true)
      checks.push(
        fee(
          'I864',
          'I-864',
          immigration === 'consular' && exempt === false
            ? consular.i864
            : immigration === 'adjustment'
              ? law.i864
              : undefined,
          [...s.fee, ...s.consularFee],
        ),
      );
  }
  if (
    !filedI485On &&
    (immigration === 'adjustment' || request.pathway === 'US-HUMANITARIAN')
  ) {
    const child =
      request.dateOfBirth !== undefined &&
      receipt < afterYears(request.dateOfBirth, law.i485ChildAge);
    const fees = !request.dateOfBirth
      ? undefined
      : child && a?.applyingWithParent
        ? law.i485Child
        : child && a?.applyingWithParent === undefined
          ? undefined
          : law.i485;
    const free = refugee || a?.specialFeeExemption === true;
    const onlineAvailable =
      channel !== 'online' || reviewed(a?.onlineCategoryAvailable) === true;
    const amount = free
      ? law.none
      : fees && onlineAvailable
        ? lookup(fees)
        : undefined;
    reliefStatus = free
      ? true
      : relief(request.humanitarian?.status === 'asylee');
    checks.push(
      fee(
        'I485',
        'I-485',
        relievedFee(amount, reliefStatus),
        s.fee,
        'PD-267',
        amount === undefined && channel === 'online'
          ? [
              `参考网申 USD ${law.i485.online}／纸申 USD ${law.i485.paper}，请核实该类别网申是否开放及儿童费率。`,
              `Listed general fees are USD ${law.i485.online} online or USD ${law.i485.paper} on paper. Confirm online access for the category and any child rate.`,
            ]
          : undefined,
      ),
    );
    if (a?.adjustmentSupplementA)
      checks.push(fee('I485A', 'I-485 Supplement A', law.supplementAUsd));
  } else if (immigration === 'consular') {
    const amount = isFamilyCategory(category)
      ? consular.family
      : category === 'employment'
        ? consular.employment
        : a?.consularFeeCategory
          ? consular[a.consularFeeCategory]
          : undefined;
    checks.push(fee('IMMIGRANT-VISA', 'DS-260 / IV', amount, s.consularFee));
    checks.push(
      fee(
        'IMMIGRANT-FEE',
        'USCIS Immigrant Fee',
        a?.specialFeeExemption ? law.none : law.immigrantFee,
      ),
    );
  }
  if (a?.travelForm === 'advance-parole') {
    checks.push(
      fee('ADVANCE-PAROLE', 'I-131 Advance Parole', lookup(law.advanceParole)),
    );
  }
  if (a?.travelForm === 'refugee-document') {
    const adult = request.dateOfBirth
      ? date >= afterYears(request.dateOfBirth, law.refugeeTravel.adultAge)
      : undefined;
    checks.push(
      fee(
        'REFUGEE-TRAVEL',
        'I-131 Refugee Travel Document',
        refugee
          ? law.none
          : adult === undefined
            ? undefined
            : adult
              ? law.refugeeTravel.adult
              : law.refugeeTravel.minor,
      ),
    );
  }

  const hr1 = v.hr1Fees.value;
  const period = date < hr1.effective ? 0 : 1;
  const feesByType = {
    'asylum-initial': hr1.asylumInitial,
    'asylum-annual': hr1.asylumAnnual[period],
    'work-initial': hr1.workInitial[period],
    'work-renewal-asylum': hr1.asylumWorkRenewal,
    'work-renewal-other': hr1.otherWorkRenewal,
    tps: hr1.tps[period],
    sij: hr1.sij,
    parole:
      a?.pendingI485AdvanceParole === true
        ? law.none
        : a?.pendingI485AdvanceParole === false
          ? hr1.parole[period]
          : undefined,
    i94: hr1.i94[period],
  };
  if (a?.hr1) checks.push(fee('HR1', 'H.R. 1', feesByType[a.hr1], s.hr1Fee));
  if (!filedI485On)
    checks.push(
      check(
        'C45-FEE-RELIEF',
        '费用减免及 H.R. 1 附加费',
        'Fee relief and H.R. 1 additional fees',
        reliefStatus,
        [...s.feeRelief, ...s.hr1Fee],
        'PD-276',
        [
          `适用表格的 I-912 可按资检福利、家庭收入不超过贫困线 ${law.waiverRatio * 100}% 或极端经济困难申请。N-400 纸申减费门槛为 ${law.reducedRatio * 100}%。H.R. 1 费用另核对法定豁免。`,
          `For eligible forms, I-912 can use means-tested benefits, household income at or below ${law.waiverRatio * 100}% of the poverty guideline, or extreme financial hardship. The paper N-400 reduced fee uses ${law.reducedRatio * 100}%. Check statutory exceptions separately for H.R. 1 fees.`,
        ],
      ),
    );
  return checks;
}
