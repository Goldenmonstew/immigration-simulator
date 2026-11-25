import type { UsFullResult } from '@uk-immigration/engine';
import * as usGame from '@uk-immigration/game/us';
import type {
  UsColumn,
  UsEffect,
  UsFestival,
  UsOutcome,
  UsState,
  UsTimeline,
} from '@uk-immigration/game/us';
import { CountryAssessmentColumns } from '../../../components/result-view';
import {
  earliestLabelFor,
  isDecisionOutcome,
  pathwayTitle,
} from '../../../lib/country-module';
import { encodeDraft } from '../../../lib/share';
import { countryPath } from '../../../lib/site-countries';
import {
  activeUnitedStatesAnswers,
  type UsDraft,
} from '../../../lib/united-states-draft';
import {
  presentUnitedStatesResult,
  unitedStatesModule,
} from '../../../lib/united-states-module';
import { createGameShell } from '../../game-shell/shell';
import type { GameCountry } from '../../game-shell/types';
import styles from '../../uk/game/game.module.css';
import { usArt, usAsset, usStorageKey } from './country';
import * as sound from './sound';

export type UsKinds = {
  timeline: UsTimeline;
  result: UsFullResult;
  effect: UsEffect;
  rule: UsColumn;
  decision: UsOutcome;
  festival: UsFestival;
};

const files: Record<string, string> = {
  perch: '/assets/meadow-town/fish/perch.svg',
  bluegill: '/assets/meadow-town/fish/bream.svg',
  coho: '/assets/meadow-town/fish/pike.svg',
  carp: '/assets/meadow-town/fish/carp.svg',
  'old-boot': '/assets/meadow-town/junk/old-boot.svg',
  'shopping-trolley': '/assets/meadow-town/junk/shopping-trolley.svg',
  coffee: '/assets/items/tea.png',
  cocoa: '/assets/items/tea.png',
  cookies: '/assets/items/biscuits.png',
  'apple-pie': '/assets/items/cake.png',
  'caramel-apple': '/assets/items/cake.png',
  flowers: '/assets/items/flowers.png',
  'hot-dog': '/assets/items/meal.png',
  'bbq-plate': '/assets/items/meal.png',
  elote: '/assets/meadow-town/dishes/summer-corn.svg',
  'mashed-potatoes': '/assets/meadow-town/dishes/baked-potato.svg',
  'corn-chowder': '/assets/meadow-town/dishes/corn-soup.svg',
  'fish-fry': '/assets/meadow-town/dishes/fish-and-potatoes.svg',
  'strawberry-shortcake': '/assets/meadow-town/dishes/strawberry-jam.svg',
  'garden-salad': '/assets/meadow-town/dishes/salad.svg',
  potstickers: '/assets/meadow-town/dishes/dumplings.svg',
};
/** US items drawn with the shared CC0 icons. */
export function itemIcon(id: string) {
  const crop = id.replace(/^seed-/, '');
  if (usArt.crops.includes(crop)) return usAsset(`/assets/crops/${crop}.png`);
  return usAsset(files[id] ?? '/assets/indoor/item.png');
}

/**
 * The game timeline as a completed questionnaire for the result page: the
 * citizenship pathway, or the green card one if conditional residence lapsed.
 * Only the answers that pathway's questions ask for, as a share link keeps.
 */
export function gameDraft(state: UsState): UsDraft {
  const pathway =
    state.ending === 'overstayed'
      ? usGame.greenCardPathway(state.timeline, usGame.filingDay(state.date))
      : usGame.citizenshipPathway(state.timeline);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { locale, ...request } = usGame.usRequest(
    structuredClone(state.timeline),
    pathway,
    usGame.filingDay(state.date),
    state.locale,
  );
  // The game never sets the month or ground tables the draft keeps as rows.
  return activeUnitedStatesAnswers({
    ...request,
    version: 1,
    step: 13,
    completed: true,
  } as UsDraft);
}

/** The game's assessment as the result page shows it. */
export const shownResult = (state: UsState) =>
  presentUnitedStatesResult(structuredClone(state.result), state.locale);

const t = (zhCN: string, en: string) => ({ zhCN, en });
/** The next step at the Federal Building, from the engine's dates. */
function federalBuildingNote(state: UsState) {
  const card = usGame.pathwayOf(state.result, 'gc');
  const citizenship = usGame.pathwayOf(state.result, 'cit');
  if (card?.id === 'US-CONDITIONS' && card.status === 'FUTURE')
    return t(
      `I-751 最早 ${card.earliestDate} 可以递交。`,
      `The I-751 can be filed from ${card.earliestDate}.`,
    );
  const { interview } = state.timeline.filed;
  if (interview && interview > usGame.filingDay(state.date))
    return t(
      '面谈已通过，宣誓通知下一季才会到。',
      'Interview passed. The oath notice comes next quarter.',
    );
  if (state.flags.includes('interview-passed'))
    return citizenship?.approvalStatus === 'FUTURE'
      ? t(
          `面谈已通过，入籍核准条件最早 ${citizenship.approvalEarliestDate} 满足，之后才能宣誓。`,
          `Interview passed. Approval requirements can be met from ${citizenship.approvalEarliestDate}; the oath follows.`,
        )
      : undefined;
  if (state.flags.includes('quarter-n400-filed'))
    return t(
      'N-400 已经寄出，面谈通知下一季才会到。',
      'The N-400 is in the mail. The interview notice comes next quarter.',
    );
  if (citizenship?.status === 'FUTURE')
    return t(
      `N-400 最早 ${citizenship.earliestDate} 可以递交。`,
      `The N-400 can be filed from ${citizenship.earliestDate}.`,
    );
}

export const usCountry: GameCountry<UsKinds> = {
  id: 'us',
  game: usGame,
  evaluate: (input) => usGame.usRules.evaluate(input),
  sound,
  art: usArt,
  asset: usAsset,
  storageKey: usStorageKey,
  money: (value) =>
    `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
  moneySymbol: '$',
  moneyMeter: 30_000,
  stats: ['money', 'mood', 'health', 'english', 'career'],
  ruleColumns: [
    { id: 'gc', label: 'us.game.gcColumn' },
    { id: 'cit', label: 'us.game.citColumn' },
  ],
  outcomeLabel: ({ outcome, earliestDate }, t) =>
    isDecisionOutcome(outcome)
      ? t(`outcome.${outcome}`)
      : t(`country.status.${outcome}`).replace(
          '{date}',
          earliestDate ?? t('result.undetermined'),
        ),
  missingRules(state, id) {
    // Requirements still open; fees (C44, C45) are listed separately.
    const titles = usGame
      .pathwayOf(state.result, id)
      ?.checks.filter(
        (check) =>
          check.status !== 'MET' &&
          !check.informational &&
          !/^US-C4[45]-/.test(check.id),
      )
      .map((check) => check.title);
    return titles?.length ? [...new Set(titles)] : undefined;
  },
  visaStatus: (state) => ({
    months: usGame.visaMonthsLeft(state),
    renewed: state.flags.includes('quarter-visa-renewed'),
    // USCIS decides a filed I-751 or I-90 after the game; the receipt
    // notice's extension of the card is not in policy-data (PD-432).
    pending: !!(state.timeline.filed.i751 || state.timeline.filed.i90),
    validTo: state.timeline.travel.cardExpiresOn,
  }),
  absences: (state) =>
    state.timeline.trips.map((trip) => ({
      from: trip.departed,
      to: trip.returned,
    })),
  itemIcon,
  diaryText: {
    harvest: { zhCN: '社区菜园收获', en: 'Community garden harvest' },
    catch: { zhCN: '防波堤钓鱼', en: 'Fishing off the pier' },
  },
  resultHref: (state) =>
    `${countryPath('us', 'result')}#s=${encodeDraft(unitedStatesModule, gameDraft(state))}`,
  assessment: (state, idPrefix) => (
    <CountryAssessmentColumns
      country={unitedStatesModule}
      result={shownResult(state)}
      simulationDate={usGame.filingDay(state.date)}
      idPrefix={idPrefix}
    />
  ),
  endingAssessment: (state) => (
    <CountryAssessmentColumns
      country={unitedStatesModule}
      result={shownResult(state)}
      simulationDate={usGame.filingDay(state.date)}
      idPrefix="ending-"
    />
  ),
  progressDetail(state, id, t) {
    const pathway = usGame.pathwayOf(shownResult(state), id);
    if (!pathway)
      return <p className={styles.lead}>{t('result.undetermined')}</p>;
    return (
      <>
        <p className={styles.lead}>
          {pathway.title} · {pathwayTitle(pathway, t)}
        </p>
        <dl className={styles.facts}>
          <div>
            <dt>
              {t(earliestLabelFor(pathway, unitedStatesModule.earliestLabel))}
            </dt>
            <dd>{pathway.earliestDate ?? t('result.undetermined')}</dd>
          </div>
          {pathway.approvalStatus && (
            <div>
              <dt>{t('us.game.approval')}</dt>
              <dd>
                {t(`country.status.${pathway.approvalStatus}`).replace(
                  '{date}',
                  pathway.approvalEarliestDate ?? t('result.undetermined'),
                )}
              </dd>
            </div>
          )}
        </dl>
      </>
    );
  },
  placeNote: (state, place) =>
    place === 'visa'
      ? federalBuildingNote(state)
      : // The station's trips home last 1, 3 or 6 months (town.ts).
        place === 'station' &&
          [1, 3, 6].some((months) => usGame.tripSkipsI751(state, months))
        ? t(
            'I-751 还没寄：会错过所有还能寄 I-751 的工作日的行程，这里不提供。',
            'The I-751 is not mailed yet: trips that would miss every workday it can still go in are not offered here.',
          )
        : undefined,
  furnishingNames: usGame.usFurnishingNames,
  endingActionText: (_state, actionId) =>
    actionId === 'oath'
      ? { label: 'us.game.oath', confirm: 'us.game.oathConfirm' }
      : undefined,
  loadTownCanvas: () => import('./town-canvas'),
};

export const usShell = createGameShell(usCountry);
