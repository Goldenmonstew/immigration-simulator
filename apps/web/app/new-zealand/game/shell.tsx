import type { CountryResult } from '@uk-immigration/engine';
import * as nzGame from '@uk-immigration/game/nz';
import type {
  NzColumn,
  NzEffect,
  NzFestival,
  NzOutcome,
  NzState,
  NzTimeline,
} from '@uk-immigration/game/nz';
import type { Text } from '@uk-immigration/game/core';
import { CountryAssessmentColumns } from '../../../components/result-view';
import { nzGameEn, nzGameZh } from '../../../i18n/countries/new-zealand-game';
import { isDecisionOutcome, pathwayTitle } from '../../../lib/country-module';
import {
  createNzDraft,
  nzSteps,
  type NzDraft,
} from '../../../lib/new-zealand-draft';
import { newZealandModule } from '../../../lib/new-zealand-module';
import { encodeDraft } from '../../../lib/share';
import { countryPath } from '../../../lib/site-countries';
import { createGameShell } from '../../game-shell/shell';
import type { GameCountry } from '../../game-shell/types';
import styles from '../../uk/game/game.module.css';
import { nzArt, nzAsset, nzStorageKey } from './country';
import * as sound from './sound';

export type NzKinds = {
  timeline: NzTimeline;
  result: CountryResult;
  effect: NzEffect;
  rule: NzColumn;
  decision: NzOutcome;
  festival: NzFestival;
};

const files: Record<string, string> = {
  snapper: '/assets/meadow-town/fish/bream.svg',
  kahawai: '/assets/meadow-town/fish/pike.svg',
  trevally: '/assets/meadow-town/fish/perch.svg',
  flounder: '/assets/meadow-town/fish/tench.svg',
  'old-boot': '/assets/meadow-town/junk/old-boot.svg',
  'shopping-trolley': '/assets/meadow-town/junk/shopping-trolley.svg',
  tea: '/assets/items/tea.png',
  pie: '/assets/items/meal.png',
  'anzac-biscuits': '/assets/items/biscuits.png',
  lamingtons: '/assets/items/cake.png',
  flowers: '/assets/items/flowers.png',
  'sausage-sizzle': '/assets/items/meal.png',
  panikeke: '/assets/items/biscuits.png',
  hangi: '/assets/items/meal.png',
  candyfloss: '/assets/items/cake.png',
  'fish-and-chips': '/assets/meadow-town/dishes/fish-and-potatoes.svg',
  'corn-fritters': '/assets/meadow-town/dishes/summer-corn.svg',
  'roast-veg': '/assets/meadow-town/dishes/baked-potato.svg',
  'vege-soup': '/assets/meadow-town/dishes/turnip-soup.svg',
  pavlova: '/assets/items/cake.png',
  salad: '/assets/meadow-town/dishes/salad.svg',
};
/** New Zealand's items drawn with the shared CC0 icons. */
export function itemIcon(id: string) {
  const crop = id.replace(/^seed-/, '');
  if (nzArt.crops.includes(crop)) return nzAsset(`/assets/crops/${crop}.png`);
  return nzAsset(files[id] ?? '/assets/indoor/item.png');
}

/** The game timeline as a completed questionnaire for the result page. */
export function gameDraft(state: NzState): NzDraft {
  const goals: NzDraft['goals'] = ['prv', 'citizenship'];
  return {
    ...createNzDraft(),
    goals,
    answers: structuredClone(state.timeline),
    simulationDate: state.date,
    step: nzSteps({ goals }).at(-1)!.step,
    completed: true,
  };
}

const say = (
  key: keyof typeof nzGameZh,
  values: Record<string, string> = {},
): Text => {
  const fill = (text: string) =>
    Object.entries(values).reduce(
      (out, [name, value]) => out.replace(`{${name}}`, value),
      text,
    );
  return { zhCN: fill(nzGameZh[key]), en: fill(nzGameEn[key]) };
};
const joined = (...texts: Text[]): Text => ({
  zhCN: texts.map((text) => text.zhCN).join(''),
  en: texts.map((text) => text.en).join(' '),
});

export const nzCountry: GameCountry<NzKinds> = {
  id: 'nz',
  game: nzGame,
  evaluate: (input) => nzGame.nzRules.evaluate(input),
  sound,
  art: nzArt,
  asset: nzAsset,
  storageKey: nzStorageKey,
  money: (value) =>
    `NZ$${value.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`,
  moneySymbol: '$',
  moneyMeter: 30_000,
  stats: ['money', 'mood', 'health', 'tereo', 'career'],
  ruleColumns: [
    { id: 'prv', label: 'nz.game.prvColumn' },
    { id: 'cit', label: 'nz.game.citColumn' },
  ],
  outcomeLabel: ({ outcome, earliestDate }, t) =>
    isDecisionOutcome(outcome)
      ? t(`outcome.${outcome}`)
      : t(`country.status.${outcome}`).replace(
          '{date}',
          earliestDate ?? t('result.undetermined'),
        ),
  missingRules(state, id) {
    const pathway = nzGame.pathwayOf(state.result, id);
    const titles = pathway?.checks
      .filter(
        (check) =>
          pathway.decidedBy?.includes(check.id) && check.status !== 'MET',
      )
      .map((check) => check.title);
    return titles?.length ? [...new Set(titles)] : undefined;
  },
  // Valid or ended as of the day being played, not the quarter's start.
  visaStatus: (state) => {
    const end = nzGame.travelEnd(state);
    return {
      months: nzGame.visaMonthsLeft(state),
      renewed: false,
      ...(end >= state.day.date && { validTo: end }),
    };
  },
  absences: (state) =>
    state.timeline.trips.map((trip) => ({
      from: trip.departed,
      to: trip.returned,
    })),
  itemIcon,
  diaryText: {
    harvest: { zhCN: '社区菜园收获', en: 'Community garden harvest' },
    catch: { zhCN: '码头钓鱼', en: 'Fishing off the wharf' },
  },
  resultHref: (state) =>
    `${countryPath('nz', 'result')}#s=${encodeDraft(newZealandModule, gameDraft(state))}`,
  assessment: (state, idPrefix) => (
    <CountryAssessmentColumns
      country={newZealandModule}
      result={state.result}
      simulationDate={state.date}
      idPrefix={idPrefix}
    />
  ),
  endingAssessment: (state) => (
    <CountryAssessmentColumns
      country={newZealandModule}
      result={state.result}
      simulationDate={state.date}
      idPrefix="ending-"
    />
  ),
  progressDetail(state, id, t) {
    const pathway = nzGame.pathwayOf(state.result, id);
    if (!pathway)
      return <p className={styles.lead}>{t('result.undetermined')}</p>;
    const presence = nzGame
      .timeProjection(state)
      .find(({ id: pathwayId }) => pathwayId === pathway.id);
    return (
      <>
        <p className={styles.lead}>
          {pathway.title} · {pathwayTitle(pathway, t)}
        </p>
        <dl className={styles.facts}>
          <div>
            <dt>{t('nz.game.presenceDate')}</dt>
            <dd>{presence?.earliestDate ?? t('result.undetermined')}</dd>
          </div>
          <div>
            <dt>{t('result.earliest')}</dt>
            <dd>{pathway.earliestDate ?? t('result.undetermined')}</dd>
          </div>
        </dl>
      </>
    );
  },
  // The travel conditions and the permanent resident visa date, from the
  // visa and the engine's assessment.
  placeNote(state, place) {
    if (place !== 'visa') return;
    const end = nzGame.travelEnd(state);
    const travel =
      end >= state.day.date
        ? say('nz.game.travelUntil', { date: end })
        : say('nz.game.travelEnded', { date: end });
    const prv = nzGame.progress(state).prv;
    if (prv.outcome === 'MET') return joined(travel, say('nz.game.prvNow'));
    return prv.outcome === 'FUTURE' && prv.earliestDate
      ? joined(travel, say('nz.game.prvFrom', { date: prv.earliestDate }))
      : travel;
  },
  loadTownCanvas: () => import('./town-canvas'),
};

export const nzShell = createGameShell(nzCountry);
