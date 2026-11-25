import type { CaFullResult } from '@uk-immigration/engine';
import * as caGame from '@uk-immigration/game/ca';
import type {
  CaColumn,
  CaEffect,
  CaFestival,
  CaOutcome,
  CaState,
  CaTimeline,
} from '@uk-immigration/game/ca';
import { CountryAssessmentColumns } from '../../../components/result-view';
import {
  activeCanadaAnswers,
  createCanadaDraft,
  type CanadaDraft,
} from '../../../lib/canada-draft';
import { canadaGoals, canadaStepsFor } from '../../../lib/canada-fields';
import { canadaModule, presentCanadaResult } from '../../../lib/canada-module';
import {
  isDecisionOutcome,
  pathwayDate,
  pathwayTitle,
} from '../../../lib/country-module';
import { encodeDraft } from '../../../lib/share';
import { countryPath } from '../../../lib/site-countries';
import { createGameShell } from '../../game-shell/shell';
import type { GameCountry } from '../../game-shell/types';
import styles from '../../uk/game/game.module.css';
import { caArt, caAsset, caStorageKey } from './country';
import * as sound from './sound';

export type CaKinds = {
  timeline: CaTimeline;
  result: CaFullResult;
  effect: CaEffect;
  rule: CaColumn;
  decision: CaOutcome;
  festival: CaFestival;
};

const files: Record<string, string> = {
  mackerel: '/assets/meadow-town/fish/perch.svg',
  pollock: '/assets/meadow-town/fish/roach.svg',
  flounder: '/assets/meadow-town/fish/bream.svg',
  'striped-bass': '/assets/meadow-town/fish/pike.svg',
  'old-boot': '/assets/meadow-town/junk/old-boot.svg',
  'shopping-trolley': '/assets/meadow-town/junk/shopping-trolley.svg',
  'double-double': '/assets/items/tea.png',
  'maple-doughnut': '/assets/items/biscuits.png',
  oatcakes: '/assets/items/biscuits.png',
  blueberries: '/assets/indoor/item.png',
  'maple-syrup': '/assets/items/cake.png',
  flowers: '/assets/items/flowers.png',
  'maple-taffy': '/assets/items/cake.png',
  'lobster-roll': '/assets/items/meal.png',
  'nanaimo-bar': '/assets/items/cake.png',
  'pumpkin-pie': '/assets/items/cake.png',
  poutine: '/assets/meadow-town/dishes/baked-potato.svg',
  'fish-cakes': '/assets/meadow-town/dishes/fish-and-potatoes.svg',
  chowder: '/assets/meadow-town/dishes/corn-soup.svg',
  'corn-boil': '/assets/meadow-town/dishes/summer-corn.svg',
  'strawberry-jam': '/assets/meadow-town/dishes/strawberry-jam.svg',
  'garden-salad': '/assets/meadow-town/dishes/salad.svg',
  'turnip-mash': '/assets/meadow-town/dishes/turnip-soup.svg',
};
/** Canada's items drawn with the shared CC0 icons. */
export function itemIcon(id: string) {
  const crop = id.replace(/^seed-/, '');
  if (caArt.crops.includes(crop)) return caAsset(`/assets/crops/${crop}.png`);
  return caAsset(files[id] ?? '/assets/indoor/item.png');
}

// The questionnaire lists routes in its own order.
const goalsOf = (state: CaState) =>
  canadaGoals.filter((goal) => state.timeline.goals.includes(goal));

/**
 * The game timeline as a completed questionnaire for the result page, with
 * only the answers its steps ask for the character's routes.
 */
export function gameDraft(state: CaState): CanadaDraft {
  const { simulationDate, ...answers } = caGame.caRequest(
    state.timeline,
    caGame.assessedOn(state),
  );
  const draft: CanadaDraft = {
    ...createCanadaDraft(),
    simulationDate,
    goals: goalsOf(state),
    answers: structuredClone(answers),
    completed: true,
  };
  return activeCanadaAnswers({
    ...draft,
    step: canadaStepsFor(draft).at(-1)!.step,
  });
}

/** The game's assessment as the result page shows it. */
export const shownResult = (state: CaState) =>
  presentCanadaResult(state.result, goalsOf(state));
const shownPathway = (state: CaState, column: CaColumn) =>
  shownResult(state).columns[0]?.pathways.find(
    (pathway) => pathway.id === caGame.columnPathway(state.timeline, column),
  );

/** The character's two routes, as the Canada result page shows them. */
const assessment = (state: CaState, idPrefix: string) => (
  <CountryAssessmentColumns
    country={canadaModule}
    result={shownResult(state)}
    simulationDate={caGame.assessedOn(state)}
    idPrefix={idPrefix}
  />
);

export const caCountry: GameCountry<CaKinds> = {
  id: 'ca',
  game: caGame,
  evaluate: (input) => caGame.caRules.evaluate(input),
  sound,
  art: caArt,
  asset: caAsset,
  storageKey: caStorageKey,
  money: (value) =>
    `CA$${value.toLocaleString('en-CA', { maximumFractionDigits: 0 })}`,
  moneySymbol: 'CA$',
  moneyMeter: 40_000,
  stats: ['money', 'mood', 'health', 'english', 'career'],
  ruleColumns: [
    { id: 'pr', label: 'ca.game.prColumn' },
    { id: 'cit', label: 'ca.game.citColumn' },
  ],
  outcomeLabel: ({ outcome, earliestDate }, t) =>
    isDecisionOutcome(outcome)
      ? t(`outcome.${outcome}`)
      : t(`country.status.${outcome}`).replace(
          '{date}',
          earliestDate ?? t('result.undetermined'),
        ),
  missingRules(state, id) {
    const titles = caGame
      .pathwayOf(state.result, caGame.columnPathway(state.timeline, id))
      ?.checks.filter((check) => !check.advisory && check.status !== 'MET')
      .map((check) => check.title);
    return titles?.length ? [...new Set(titles)] : undefined;
  },
  visaStatus: (state) => ({
    months: caGame.visaMonthsLeft(state),
    renewed: false,
    validTo: state.timeline.document.expires,
  }),
  furnishingNames: caGame.caFurnishingNames,
  absences: (state) =>
    (state.timeline.trips ?? []).map((trip) => ({
      from: trip.departed,
      to: trip.returned,
    })),
  itemIcon,
  diaryText: {
    harvest: { zhCN: '社区菜园收获', en: 'Community garden harvest' },
    catch: { zhCN: '码头钓鱼', en: 'Fishing off the wharf' },
  },
  resultHref: (state) =>
    `${countryPath('ca', 'result')}#s=${encodeDraft(canadaModule, gameDraft(state))}`,
  assessment,
  endingAssessment: (state) => assessment(state, 'ending-'),
  // The result page's outcome, time condition and date rows.
  progressDetail(state, id, t) {
    const pathway = shownPathway(state, id);
    if (!pathway)
      return <p className={styles.lead}>{t('result.undetermined')}</p>;
    const date = pathwayDate(pathway, canadaModule.earliestLabel);
    return (
      <>
        <p className={styles.lead}>
          {pathway.title} · {pathwayTitle(pathway, t)}
        </p>
        <dl className={styles.facts}>
          {pathway.timeStatus && (
            <div>
              <dt>{t('country.timeConditions')}</dt>
              <dd>
                {t(`country.status.${pathway.timeStatus}`).replace(
                  '{date}',
                  pathway.timeEarliestDate ?? t('result.undetermined'),
                )}
              </dd>
            </div>
          )}
          {date && (
            <div>
              <dt>{t(date.label)}</dt>
              <dd>{date.date ?? t('result.undetermined')}</dd>
            </div>
          )}
        </dl>
      </>
    );
  },
  placeNote: (state, place) =>
    place === 'visa' ? caGame.nextStep(state) : undefined,
  endingActionText: (_state, actionId) =>
    actionId === 'oath'
      ? { label: 'ca.game.oathLabel', confirm: 'ca.game.oathConfirm' }
      : undefined,
  loadTownCanvas: () => import('./town-canvas'),
};

export const caShell = createGameShell(caCountry);
