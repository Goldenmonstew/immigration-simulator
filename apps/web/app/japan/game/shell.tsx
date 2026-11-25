import type { JpFullResult } from '@uk-immigration/engine';
import * as jpGame from '@uk-immigration/game/jp';
import type {
  JpColumn,
  JpEffect,
  JpFestival,
  JpOutcome,
  JpState,
  JpTimeline,
} from '@uk-immigration/game/jp';
import { CountryAssessmentColumns } from '../../../components/result-view';
import { isDecisionOutcome, pathwayTitle } from '../../../lib/country-module';
import { createJapanDraft, type JapanDraft } from '../../../lib/japan-draft';
import { japanModule } from '../../../lib/japan-module';
import { encodeDraft } from '../../../lib/share';
import { countryPath } from '../../../lib/site-countries';
import { createGameShell } from '../../game-shell/shell';
import type { GameCountry } from '../../game-shell/types';
import styles from '../../uk/game/game.module.css';
import { jpArt, jpAsset, jpStorageKey } from './country';
import * as sound from './sound';

export type JpKinds = {
  timeline: JpTimeline;
  result: JpFullResult;
  effect: JpEffect;
  rule: JpColumn;
  decision: JpOutcome;
  festival: JpFestival;
};

const files: Record<string, string> = {
  haze: '/assets/meadow-town/fish/roach.svg',
  suzuki: '/assets/meadow-town/fish/perch.svg',
  koi: '/assets/meadow-town/fish/carp.svg',
  funa: '/assets/meadow-town/fish/bream.svg',
  'old-boot': '/assets/meadow-town/junk/old-boot.svg',
  'shopping-trolley': '/assets/meadow-town/junk/shopping-trolley.svg',
  tea: '/assets/items/tea.png',
  dango: '/assets/items/biscuits.png',
  taiyaki: '/assets/items/biscuits.png',
  castella: '/assets/items/cake.png',
  'sakura-mochi': '/assets/items/cake.png',
  flowers: '/assets/items/flowers.png',
  yakisoba: '/assets/items/meal.png',
  ehomaki: '/assets/items/meal.png',
  'miso-soup': '/assets/meadow-town/dishes/turnip-soup.svg',
  'jaga-butter': '/assets/meadow-town/dishes/baked-potato.svg',
  'yaki-corn': '/assets/meadow-town/dishes/summer-corn.svg',
  shioyaki: '/assets/meadow-town/dishes/fish-and-potatoes.svg',
  'ichigo-jam': '/assets/meadow-town/dishes/strawberry-jam.svg',
  salad: '/assets/meadow-town/dishes/salad.svg',
};
/** Japan's items drawn with the shared CC0 icons. */
export function itemIcon(id: string) {
  const crop = id.replace(/^seed-/, '');
  if (jpArt.crops.includes(crop)) return jpAsset(`/assets/crops/${crop}.png`);
  return jpAsset(files[id] ?? '/assets/indoor/item.png');
}

/** The game timeline as a completed questionnaire for the result page. */
export function gameDraft(state: JpState): JapanDraft {
  return {
    ...createJapanDraft(),
    ...structuredClone(jpGame.timelineOn(state.timeline, state.date)),
    simulationDate: state.date,
    residenceEvidenceOn: jpGame.evidenceDay(state.date),
    step: 5,
    completed: true,
  };
}

export const jpCountry: GameCountry<JpKinds> = {
  id: 'jp',
  game: jpGame,
  evaluate: (input) => jpGame.jpRules.evaluate(input),
  sound,
  art: jpArt,
  asset: jpAsset,
  storageKey: jpStorageKey,
  money: (value) =>
    `¥${value.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`,
  moneySymbol: '¥',
  moneyMeter: 3_000_000,
  stats: ['money', 'mood', 'health', 'japanese', 'career'],
  ruleColumns: [
    { id: 'pr', label: 'jp.game.prColumn' },
    { id: 'nat', label: 'jp.game.natColumn' },
  ],
  // FUTURE only says when the time requirement is met, as the detail does.
  outcomeLabel: ({ outcome, earliestDate }, t) =>
    isDecisionOutcome(outcome)
      ? t(`outcome.${outcome}`)
      : t(
          outcome === 'FUTURE'
            ? 'jp.game.timeFuture'
            : `country.status.${outcome}`,
        ).replace('{date}', earliestDate ?? t('result.undetermined')),
  missingRules(state, id) {
    const titles = jpGame
      .pathwayOf(state.result, id)
      ?.checks.filter(
        (check) =>
          check.kind === 'requirement' &&
          check.applicable !== false &&
          check.status !== 'MET',
      )
      .map((check) => check.title);
    return titles?.length ? [...new Set(titles)] : undefined;
  },
  visaStatus: (state) => ({
    months: jpGame.visaMonthsLeft(state),
    renewed: false,
    validTo: jpGame.status(state).expiresOn,
  }),
  absences: (state) =>
    state.timeline.trips.map((trip) => ({
      from: trip.departed,
      to: trip.returned,
    })),
  itemIcon,
  diaryText: {
    harvest: { zhCN: '市民农园收获', en: 'Community garden harvest' },
    catch: { zhCN: '大冈川钓鱼', en: 'Fishing on the Ōoka' },
  },
  furnishingNames: jpGame.jpFurnishingNames,
  resultHref: (state) =>
    `${countryPath('jp', 'result')}#s=${encodeDraft(japanModule, gameDraft(state))}`,
  assessment: (state, idPrefix) => (
    <CountryAssessmentColumns
      country={japanModule}
      result={state.result}
      simulationDate={state.date}
      idPrefix={idPrefix}
    />
  ),
  endingAssessment: (state) => (
    <CountryAssessmentColumns
      country={japanModule}
      result={state.result}
      simulationDate={state.date}
      idPrefix="ending-"
    />
  ),
  progressDetail(state, id, t) {
    const pathway = jpGame.pathwayOf(state.result, id);
    if (!pathway)
      return <p className={styles.lead}>{t('result.undetermined')}</p>;
    return (
      <>
        <p className={styles.lead}>
          {pathway.title} · {pathwayTitle(pathway, t)}
        </p>
        <dl className={styles.facts}>
          <div>
            <dt>{t('jp.game.timeDate')}</dt>
            <dd>{pathway.timeEarliestDate ?? t('result.undetermined')}</dd>
          </div>
          <div>
            <dt>{t('result.earliest')}</dt>
            <dd>{pathway.earliestDate ?? t('result.undetermined')}</dd>
          </div>
        </dl>
      </>
    );
  },
  loadTownCanvas: () => import('./town-canvas'),
};

export const jpShell = createGameShell(jpCountry);
