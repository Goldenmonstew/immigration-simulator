import {
  evaluatePortugalFull,
  type CountryCheck,
  type CountryPathway,
  type Locale,
  type PtNationalityRoute,
} from '@uk-immigration/engine';
import { t } from '../i18n';
import type { CountryModule } from './country-module';
import {
  activePortugalAnswers,
  createPortugalDraft,
  decodePortugalDraft,
  restoreStoredPortugalDraft,
  validatePortugalStep,
  type PortugalDraft,
} from './portugal-draft';
import { ptPathwayByTarget } from './portugal-fields';
import { portugalPolicy } from './portugal-policy';
import { portugalWhatIf, type PortugalWhatIf } from './portugal-whatif';

// The engine's fallback sentences quote the condition title, which the result
// already shows above them, and list pending details that also have a badge.
function explanation(check: CountryCheck, locale: Locale) {
  const pending = check.pendingDetails?.length
    ? ` (${check.pendingDetails.join(', ')})`
    : '';
  const text =
    pending && check.explanation.endsWith(pending)
      ? check.explanation.slice(0, -pending.length)
      : check.explanation;
  const title = check.title;
  const generic =
    locale === 'en'
      ? [
          `Pending: evidence or an authority finding for “${title}” is missing.`,
          `The evidence satisfies “${title}”.`,
          `The evidence does not satisfy “${title}”.`,
        ]
      : [
          `待确认：缺少「${title}」所需资料或主管机关结论。`,
          `已满足「${title}」。`,
          `未满足「${title}」。`,
        ];
  return generic.includes(text) ? t(`pt.result.${check.status}`, locale) : text;
}

// Fees are a budget, the obligations listed in an investment decision follow
// approval, the current-law time for a pending old application is an
// alternative, and receipts and absence risks are procedural notes. The engine
// does not count any of these toward the status, so none of them is a gap.
const budget = new Set([
  'PT-A11-EXAM-FEE',
  'PT-A11-FEE',
  'PT-B07-FEE',
  'PT-C09-FEE',
  'PT-D-FEE',
  'PT-E07',
  'PT-F09',
  'PT-G06-FEE',
]);
const notes = new Set([
  'PT-B01-CANCELLATION-RISK',
  'PT-B07-ABSENCE',
  'PT-C10-PILOT-ABSENCE',
  'PT-E01-RECEIPT',
  'PT-E01-RELEASE',
]);
// Residence periods, absences and filing windows.
const time = new Set([
  'PT-A02',
  'PT-B01',
  'PT-C01',
  'PT-C01-SINGLE-ABSENCE',
  'PT-C01-TOTAL-ABSENCE',
  'PT-C03',
  'PT-D07-STAY',
  'PT-D07-WINDOW',
  'PT-E01',
  'PT-F02',
  'PT-F02-EARLY-CONTINUITY',
  'PT-F02-RETENTION',
]);

function checkKind(id: string, pathway: CountryPathway): CountryCheck['kind'] {
  if (budget.has(id)) return 'budget';
  if (id === 'PT-D10-TERMS') return 'afterApproval';
  if (id === 'PT-A02-CURRENT-ALTERNATIVE') return 'alternative';
  // Keeping or replacing a permanent title only notes the temporary period.
  if (
    notes.has(id) ||
    (id === 'PT-B01' && pathway.checks.some((c) => c.id === 'PT-B07'))
  )
    return 'information';
  return time.has(id) ? 'time' : 'requirement';
}

function run(draft: PortugalDraft, locale: Locale) {
  const answers = activePortugalAnswers(draft);
  const result = evaluatePortugalFull({
    ...answers,
    // The first step requires a nationality before any result is shown.
    route: answers.route as PtNationalityRoute,
    permits: answers.permits ?? [],
    trips: answers.trips ?? [],
    locale,
  });
  const selected = new Set(
    answers.targets.map((target) => ptPathwayByTarget[target]),
  );
  for (const column of result.columns) {
    column.pathways = column.pathways.filter((pathway) =>
      selected.has(pathway.id),
    );
    for (const pathway of column.pathways)
      for (const check of pathway.checks) {
        check.explanation = explanation(check, locale);
        check.kind = checkKind(check.id, pathway);
      }
  }
  return result;
}

export const portugalModule: CountryModule<PortugalDraft, PortugalWhatIf> = {
  id: 'pt',
  version: 1,
  scenarioLinks: true,
  createDraft: createPortugalDraft,
  activeAnswers: activePortugalAnswers,
  restoreStoredDraft: restoreStoredPortugalDraft,
  validateStep: validatePortugalStep,
  decodeDraft: decodePortugalDraft,
  incompleteResultMessage(_draft, locale) {
    return t('pt.result.finishQuestionnaire', locale);
  },
  run,
  // Free-movement dates are when the permanent right is acquired.
  earliestLabel: 'pt.result.earliest',
  whatif: portugalWhatIf,
  policy: portugalPolicy,
};
