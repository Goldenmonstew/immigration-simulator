import {
  evaluateMalaysiaFull,
  type CountryCheck,
  type Locale,
} from '@uk-immigration/engine';
import { t } from '../i18n';
import type { CountryModule } from './country-module';
import {
  activeMalaysiaAnswers,
  createMalaysiaDraft,
  decodeMalaysiaDraft,
  malaysiaRequest,
  restoreStoredMalaysiaDraft,
  validateMalaysiaStep,
  type MalaysiaDraft,
} from './malaysia-draft';
import { malaysiaPolicy } from './malaysia-policy';
import { malaysiaWhatIf, type MalaysiaWhatIf } from './malaysia-whatif';

// The engine marks fees, what follows approval and procedural notes as
// information, which never decides a route. Fees are a budget and the terms
// of a granted permit or pass follow approval; neither is a gap.
const budget = new Set([
  'my.pr.fee',
  'my.pr.deposit',
  'my.pr.rep-ltsvp-fee',
  'my.rp.fee',
  'my.cit.application-fee',
  'my.cit.certificate-fee',
  'my.pass.fee',
  'my.pass.fees',
  'my.pass.security-bond',
  'my.pass.participation-fee',
  'my.pass.pass-fees',
  'my.pass.annual-fee',
  'my.pass.system-fee',
]);
const afterApproval = new Set([
  'my.pr.after-approval',
  'my.cit.after-grant',
  'my.rp.rights',
  'my.pass.duration',
  'my.pass.work',
  'my.pass.term',
  'my.pass.benefits',
  'my.pass.terms',
]);
// Years married, on a pass or resident, from which the route's date follows.
const time = new Set([
  'my.pr.marriage-duration',
  'my.pr.spouse-pass',
  'my.pr.qualifying-pass',
  'my.rp.long-term-pass',
  'my.cit.residence',
  'my.pass.work-years',
]);

function checkKind(check: CountryCheck): CountryCheck['kind'] {
  if (check.kind === 'information' && check.applicable !== false)
    return budget.has(check.id)
      ? 'budget'
      : afterApproval.has(check.id)
        ? 'afterApproval'
        : 'information';
  return check.kind === 'requirement' && time.has(check.id)
    ? 'time'
    : check.kind;
}

function run(draft: MalaysiaDraft, locale: Locale) {
  const result = evaluateMalaysiaFull(malaysiaRequest(draft, locale));
  const amount = new Intl.NumberFormat(locale);
  const separator = locale === 'en' ? ' ' : '';
  for (const pathway of result.columns[0].pathways) {
    for (const check of pathway.checks) {
      check.kind = checkKind(check);
      check.explanation = check.explanation.replace(
        /\b(RM|USD)(\d{4,})\b/g,
        (_, currency: string, digits: string) =>
          `${currency}${amount.format(Number(digits))}`,
      );
    }
    // A met time requirement is dated from when the current unbroken period
    // of meeting it began, which can be before the application date.
    if (
      pathway.timeStatus === 'MET' &&
      pathway.timeEarliestDate &&
      pathway.timeEarliestDate < draft.simulationDate
    )
      pathway.summary +=
        separator +
        t('my.result.timeMetSince', locale).replace(
          '{date}',
          pathway.timeEarliestDate,
        );
    // The engine joins its summary sentences with a space in both languages.
    if (locale === 'zh-CN')
      pathway.summary = pathway.summary?.replaceAll('。 ', '。');
  }
  return result;
}

// Routes whose time requirements are dated from the start of the current
// unbroken period: their result date is the application date checked, not
// the first date the route could have been applied for.
const metOn = 'my.result.metOn' as const;

export const malaysiaModule: CountryModule<MalaysiaDraft, MalaysiaWhatIf> = {
  id: 'my',
  version: 1,
  scenarioLinks: true,
  createDraft: createMalaysiaDraft,
  activeAnswers: activeMalaysiaAnswers,
  restoreStoredDraft: restoreStoredMalaysiaDraft,
  validateStep: validateMalaysiaStep,
  decodeDraft: decodeMalaysiaDraft,
  incompleteResultMessage(_draft, locale) {
    return t('my.result.finishQuestionnaire', locale);
  },
  run,
  resultNotes: () => ({ notices: ['my.result.notice'] }),
  earliestLabel: {
    'my.pr.wife': metOn,
    'my.pr.husband': metOn,
    'my.pr.child': metOn,
    'my.pr.was': metOn,
    'my.pr.rep-family': metOn,
    'my.rp.family': metOn,
    'my.cit.naturalisation': metOn,
    'my.cit.wife-registration': metOn,
    'my.pass.rpt': metOn,
  },
  whatif: malaysiaWhatIf,
  policy: malaysiaPolicy,
};
