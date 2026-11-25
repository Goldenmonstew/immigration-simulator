import type { CountryResult } from '@uk-immigration/engine';
import * as auGame from '@uk-immigration/game/au';
import type {
  AuColumn,
  AuEffect,
  AuFestival,
  AuOutcome,
  AuState,
  AuTimeline,
} from '@uk-immigration/game/au';
import { CountryAssessmentColumns } from '../../../components/result-view';
import {
  createAustraliaDraft,
  type AustraliaDraft,
} from '../../../lib/australia-draft';
import {
  australiaModule,
  presentAustraliaResult,
} from '../../../lib/australia-module';
import {
  earliestLabelFor,
  isDecisionOutcome,
  pathwayTitle,
} from '../../../lib/country-module';
import { encodeDraft } from '../../../lib/share';
import { countryPath } from '../../../lib/site-countries';
import { createGameShell } from '../../game-shell/shell';
import type { GameCountry } from '../../game-shell/types';
import styles from '../../uk/game/game.module.css';
import { auArt, auAsset, auStorageKey } from './country';
import * as sound from './sound';

export type AuKinds = {
  timeline: AuTimeline;
  result: CountryResult;
  effect: AuEffect;
  rule: AuColumn;
  decision: AuOutcome;
  festival: AuFestival;
};

const files: Record<string, string> = {
  whiting: '/assets/meadow-town/fish/roach.svg',
  flathead: '/assets/meadow-town/fish/pike.svg',
  snapper: '/assets/meadow-town/fish/perch.svg',
  bream: '/assets/meadow-town/fish/bream.svg',
  'old-boot': '/assets/meadow-town/junk/old-boot.svg',
  'shopping-trolley': '/assets/meadow-town/junk/shopping-trolley.svg',
  'flat-white': '/assets/items/tea.png',
  lamington: '/assets/items/cake.png',
  pavlova: '/assets/items/cake.png',
  scone: '/assets/items/cake.png',
  // A golden flower for wattle; the red bloom stands in for a waratah seedling.
  wattle: '/assets/crops/sunflower.png',
  'native-seedling': '/assets/items/flowers.png',
  'sausage-sizzle': '/assets/items/meal.png',
  'meat-pie': '/assets/items/meal.png',
  'anzac-biscuit': '/assets/items/biscuits.png',
  'flathead-and-chips': '/assets/meadow-town/dishes/fish-and-potatoes.svg',
  'roast-spuds': '/assets/meadow-town/dishes/baked-potato.svg',
  'bbq-corn': '/assets/meadow-town/dishes/summer-corn.svg',
  'winter-veg-soup': '/assets/meadow-town/dishes/turnip-soup.svg',
  'scone-jam': '/assets/meadow-town/dishes/strawberry-jam.svg',
  'summer-salad': '/assets/meadow-town/dishes/salad.svg',
};
/** Australia's items drawn with the shared CC0 icons. */
export function itemIcon(id: string) {
  const crop = id.replace(/^seed-/, '');
  if (auArt.crops.includes(crop)) return auAsset(`/assets/crops/${crop}.png`);
  return auAsset(files[id] ?? '/assets/indoor/item.png');
}

/** The game timeline as a completed questionnaire for the result page. */
export function gameDraft(state: AuState): AustraliaDraft {
  return {
    ...createAustraliaDraft(),
    ...structuredClone(state.timeline),
    simulationDate: auGame.assessedOn(state),
    step: 6,
    completed: true,
  };
}

/** The game's assessment as the result page shows it. */
export const shownResult = (state: AuState) =>
  presentAustraliaResult(structuredClone(auGame.currentResult(state)));

export const auCountry: GameCountry<AuKinds> = {
  id: 'au',
  game: auGame,
  evaluate: (input) => auGame.auRules.evaluate(input),
  sound,
  art: auArt,
  asset: auAsset,
  storageKey: auStorageKey,
  money: (value) =>
    `$${value.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`,
  moneySymbol: '$',
  moneyMeter: 30_000,
  stats: ['money', 'mood', 'health', 'english', 'career'],
  ruleColumns: [{ id: 'pr', label: 'au.game.prColumn' }],
  outcomeLabel: ({ outcome, earliestDate }, t) =>
    isDecisionOutcome(outcome)
      ? t(`outcome.${outcome}`)
      : t(`country.status.${outcome}`).replace(
          '{date}',
          earliestDate ?? t('result.undetermined'),
        ),
  // Fees are a budget, not a requirement (see the engine's eligibility checks).
  missingRules(state) {
    const titles = auGame
      .pathwayOf(auGame.currentResult(state))
      ?.checks.filter(
        (check) => check.status !== 'MET' && !check.id.startsWith('AU-FEES-'),
      )
      .map((check) => check.title);
    return titles?.length ? [...new Set(titles)] : undefined;
  },
  visaStatus: (state) => ({
    months: auGame.visaMonthsLeft(state),
    renewed: false,
    validTo: auGame.currentVisa(state).to,
  }),
  absences: (state) =>
    state.timeline.trips.map((trip) => ({
      from: trip.departed,
      to: trip.returned,
    })),
  itemIcon,
  diaryText: {
    harvest: { zhCN: '社区菜园收获', en: 'Community garden harvest' },
    catch: { zhCN: '码头钓鱼', en: 'Fishing off the jetty' },
  },
  furnishingNames: auGame.auFurnishingNames,
  resultHref: (state) =>
    `${countryPath('au', 'result')}#s=${encodeDraft(australiaModule, gameDraft(state))}`,
  assessment: (state, idPrefix) => (
    <CountryAssessmentColumns
      country={australiaModule}
      result={shownResult(state)}
      simulationDate={auGame.assessedOn(state)}
      idPrefix={idPrefix}
    />
  ),
  endingAssessment: (state) => (
    <CountryAssessmentColumns
      country={australiaModule}
      result={shownResult(state)}
      simulationDate={auGame.assessedOn(state)}
      idPrefix="ending-"
    />
  ),
  progressDetail(state, _id, t) {
    const pathway = auGame.pathwayOf(shownResult(state));
    if (!pathway)
      return <p className={styles.lead}>{t('result.undetermined')}</p>;
    return (
      <>
        <p className={styles.lead}>
          {pathway.title} · {pathwayTitle(pathway, t)}
        </p>
        <dl className={styles.facts}>
          <div>
            <dt>{t('au.game.timeDate')}</dt>
            <dd>{auGame.timeDate(state) ?? t('result.undetermined')}</dd>
          </div>
          <div>
            <dt>
              {t(earliestLabelFor(pathway, australiaModule.earliestLabel))}
            </dt>
            <dd>{pathway.earliestDate ?? t('result.undetermined')}</dd>
          </div>
        </dl>
      </>
    );
  },
  loadTownCanvas: () => import('./town-canvas'),
};

export const auShell = createGameShell(auCountry);
