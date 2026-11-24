import type { CountryResult } from '@uk-immigration/engine';
import * as grGame from '@uk-immigration/game/gr';
import type {
  GrColumn,
  GrEffect,
  GrFestival,
  GrOutcome,
  GrState,
  GrTimeline,
} from '@uk-immigration/game/gr';
import { CountryAssessmentColumns } from '../../../components/result-view';
import { isDecisionOutcome, pathwayTitle } from '../../../lib/country-module';
import {
  createGreeceDraft,
  greeceSteps,
  type GreeceDraft,
} from '../../../lib/greece-draft';
import { greeceModule } from '../../../lib/greece-module';
import { encodeDraft } from '../../../lib/share';
import { countryPath } from '../../../lib/site-countries';
import { createGameShell } from '../../game-shell/shell';
import type { GameCountry } from '../../game-shell/types';
import styles from '../../uk/game/game.module.css';
import { grArt, grAsset, grStorageKey } from './country';
import * as sound from './sound';

export type GrKinds = {
  timeline: GrTimeline;
  result: CountryResult;
  effect: GrEffect;
  rule: GrColumn;
  decision: GrOutcome;
  festival: GrFestival;
};

const files: Record<string, string> = {
  sardine: '/assets/meadow-town/fish/roach.svg',
  'red-mullet': '/assets/meadow-town/fish/carp.svg',
  'sea-bream': '/assets/meadow-town/fish/bream.svg',
  mackerel: '/assets/meadow-town/fish/pike.svg',
  'old-boot': '/assets/meadow-town/junk/old-boot.svg',
  'shopping-trolley': '/assets/meadow-town/junk/shopping-trolley.svg',
  'mountain-tea': '/assets/items/tea.png',
  koulouri: '/assets/items/biscuits.png',
  loukoumades: '/assets/items/biscuits.png',
  baklava: '/assets/items/cake.png',
  vasilopita: '/assets/items/cake.png',
  tsoureki: '/assets/items/cake.png',
  flowers: '/assets/items/flowers.png',
  souvlaki: '/assets/items/meal.png',
  gemista: '/assets/items/meal.png',
  horiatiki: '/assets/meadow-town/dishes/salad.svg',
  'lemon-potatoes': '/assets/meadow-town/dishes/baked-potato.svg',
  'grilled-sardines': '/assets/meadow-town/dishes/fish-and-potatoes.svg',
  kakavia: '/assets/meadow-town/dishes/turnip-soup.svg',
  'spoon-sweet': '/assets/meadow-town/dishes/strawberry-jam.svg',
  'grilled-corn': '/assets/meadow-town/dishes/summer-corn.svg',
};
/** Greece's items drawn with the shared CC0 icons. */
export function itemIcon(id: string) {
  const crop = id.replace(/^seed-/, '');
  if (grArt.crops.includes(crop)) return grAsset(`/assets/crops/${crop}.png`);
  return grAsset(files[id] ?? '/assets/indoor/item.png');
}

/** The game timeline as a completed questionnaire for the result page. */
export function gameDraft(state: GrState): GreeceDraft {
  const { nationality, ...timeline } = structuredClone(state.timeline);
  const { incomeByTaxYear, ...rest } = nationality;
  const draft: GreeceDraft = {
    ...createGreeceDraft(),
    ...timeline,
    nationality: {
      ...rest,
      incomeYears: Object.entries(incomeByTaxYear).map(([year, row]) => ({
        year: Number(year),
        ...row,
      })),
    },
    simulationDate: state.date,
    // The game records every trip.
    tripsComplete: true,
    completed: true,
  };
  return { ...draft, step: greeceSteps(draft).at(-1)!.step };
}

export const grCountry: GameCountry<GrKinds> = {
  id: 'gr',
  game: grGame,
  evaluate: (input) => grGame.grRules.evaluate(input),
  sound,
  art: grArt,
  asset: grAsset,
  storageKey: grStorageKey,
  money: (value) =>
    `€${value.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`,
  moneySymbol: '€',
  moneyMeter: 20_000,
  stats: ['money', 'mood', 'health', 'greek', 'career'],
  ruleColumns: [
    { id: 'pr', label: 'gr.game.prColumn' },
    { id: 'nat', label: 'gr.game.natColumn' },
  ],
  outcomeLabel: ({ outcome, earliestDate }, t) =>
    isDecisionOutcome(outcome)
      ? t(`outcome.${outcome}`)
      : t(`country.status.${outcome}`).replace(
          '{date}',
          earliestDate ?? t('result.undetermined'),
        ),
  missingRules(state, id) {
    // Timing shows in the bar itself. A FUTURE route only waits for dates.
    const pathway = grGame.pathwayOf(state.result, id);
    if (pathway?.status === 'FUTURE') return undefined;
    const titles = pathway?.checks
      .filter((check) => check.status !== 'MET' && !check.id.includes('TIME'))
      .map((check) => check.title);
    return titles?.length ? [...new Set(titles)] : undefined;
  },
  visaStatus: (state) => ({
    months: grGame.visaMonthsLeft(state),
    renewed: state.flags.includes('quarter-visa-renewed'),
    validTo: state.timeline.currentCardExpiresOn,
  }),
  absences: (state) =>
    state.timeline.trips.map((trip) => ({
      from: trip.departed,
      to: trip.returned,
    })),
  itemIcon,
  diaryText: {
    harvest: { zhCN: '市立菜园收获', en: 'Garden plot harvest' },
    catch: { zhCN: '防波堤钓鱼', en: 'Fishing off the breakwater' },
  },
  resultHref: (state) =>
    `${countryPath('gr', 'result')}#s=${encodeDraft(greeceModule, gameDraft(state))}`,
  assessment: (state, idPrefix) => (
    <CountryAssessmentColumns
      country={greeceModule}
      result={state.result}
      simulationDate={state.date}
      idPrefix={idPrefix}
    />
  ),
  endingAssessment: (state) => (
    <CountryAssessmentColumns
      country={greeceModule}
      result={state.result}
      simulationDate={state.date}
      idPrefix="ending-"
    />
  ),
  progressDetail(state, id, t) {
    const pathway = grGame.pathwayOf(state.result, id);
    if (!pathway)
      return <p className={styles.lead}>{t('result.undetermined')}</p>;
    return (
      <>
        <p className={styles.lead}>
          {pathway.title} · {pathwayTitle(pathway, t)}
        </p>
        <dl className={styles.facts}>
          <div>
            <dt>{t('gr.game.cardValidTo')}</dt>
            <dd>{state.timeline.currentCardExpiresOn}</dd>
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

export const grShell = createGameShell(grCountry);
