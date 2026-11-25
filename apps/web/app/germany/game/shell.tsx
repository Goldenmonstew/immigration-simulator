import type { CountryResult } from '@uk-immigration/engine';
import * as deGame from '@uk-immigration/game/de';
import type {
  DeColumn,
  DeEffect,
  DeFestival,
  DeOutcome,
  DeState,
  DeTimeline,
} from '@uk-immigration/game/de';
import { CountryAssessmentColumns } from '../../../components/result-view';
import { isDecisionOutcome, pathwayTitle } from '../../../lib/country-module';
import {
  createGermanyDraft,
  type GermanyDraft,
} from '../../../lib/germany-draft';
import {
  classifyGermanyChecks,
  germanyModule,
} from '../../../lib/germany-module';
import { encodeDraft } from '../../../lib/share';
import { countryPath } from '../../../lib/site-countries';
import { createGameShell } from '../../game-shell/shell';
import type { GameCountry } from '../../game-shell/types';
import styles from '../../uk/game/game.module.css';
import { deArt, deAsset, deStorageKey } from './country';
import * as sound from './sound';

export type DeKinds = {
  timeline: DeTimeline;
  result: CountryResult;
  effect: DeEffect;
  rule: DeColumn;
  decision: DeOutcome;
  festival: DeFestival;
};

const files: Record<string, string> = {
  barsch: '/assets/meadow-town/fish/perch.svg',
  hecht: '/assets/meadow-town/fish/pike.svg',
  ploetze: '/assets/meadow-town/fish/roach.svg',
  brasse: '/assets/meadow-town/fish/bream.svg',
  'old-boot': '/assets/meadow-town/junk/old-boot.svg',
  'shopping-trolley': '/assets/meadow-town/junk/shopping-trolley.svg',
  apfelschorle: '/assets/items/tea.png',
  brezel: '/assets/items/biscuits.png',
  'gebrannte-mandeln': '/assets/items/biscuits.png',
  kuchen: '/assets/items/cake.png',
  weckmann: '/assets/items/cake.png',
  flowers: '/assets/items/flowers.png',
  bratwurst: '/assets/items/meal.png',
  currywurst: '/assets/items/meal.png',
  kartoffelsalat: '/assets/meadow-town/dishes/salad.svg',
  bratkartoffeln: '/assets/meadow-town/dishes/baked-potato.svg',
  eintopf: '/assets/meadow-town/dishes/turnip-soup.svg',
  'barsch-kartoffeln': '/assets/meadow-town/dishes/fish-and-potatoes.svg',
  erdbeermarmelade: '/assets/meadow-town/dishes/strawberry-jam.svg',
  tomatensuppe: '/assets/meadow-town/dishes/corn-soup.svg',
};
/** Germany's items drawn with the shared CC0 icons. */
export function itemIcon(id: string) {
  const crop = id.replace(/^seed-/, '');
  if (deArt.crops.includes(crop)) return deAsset(`/assets/crops/${crop}.png`);
  return deAsset(files[id] ?? '/assets/indoor/item.png');
}

/** The game timeline as a completed questionnaire for the result page. */
export function gameDraft(state: DeState): GermanyDraft {
  return {
    ...createGermanyDraft(),
    ...structuredClone(deGame.timelineOn(state.timeline, state.date)),
    simulationDate: state.date,
    step: 5,
    completed: true,
  };
}

/** The assessment with the result page's display groups. */
const classified = (state: DeState) =>
  classifyGermanyChecks(structuredClone(state.result), true);

export const deCountry: GameCountry<DeKinds> = {
  id: 'de',
  game: deGame,
  evaluate: (input) => deGame.deRules.evaluate(input),
  sound,
  art: deArt,
  asset: deAsset,
  storageKey: deStorageKey,
  money: (value) =>
    `€${value.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`,
  moneySymbol: '€',
  moneyMeter: 30_000,
  stats: ['money', 'mood', 'health', 'german', 'career'],
  ruleColumns: [
    { id: 'settle', label: 'de.game.settleColumn' },
    { id: 'nat', label: 'de.game.natColumn' },
  ],
  // FUTURE only says when the time requirement is met, as the detail does.
  outcomeLabel: ({ outcome, earliestDate }, t) =>
    isDecisionOutcome(outcome)
      ? t(`outcome.${outcome}`)
      : t(
          outcome === 'FUTURE'
            ? 'de.game.timeFuture'
            : `country.status.${outcome}`,
        ).replace('{date}', earliestDate ?? t('result.undetermined')),
  missingRules(state, id) {
    const titles = deGame
      .pathwayOf(classified(state), state.timeline, id)
      ?.checks.filter(
        (check) => check.kind === 'requirement' && check.status !== 'MET',
      )
      .map((check) => check.title);
    return titles?.length ? [...new Set(titles)] : undefined;
  },
  // A pending extension has no new date: no countdown warning or reminder,
  // and the fast-forward notice says the card continues (de.game.*).
  visaStatus: (state) =>
    deGame.extensionPending(state)
      ? { months: deGame.visaMonthsLeft(state), renewed: true }
      : {
          months: deGame.visaMonthsLeft(state),
          renewed: false,
          validTo: deGame.currentPermit(state).to,
        },
  placeNote: (state, place) =>
    place === 'visa' && deGame.extensionPending(state)
      ? {
          zhCN: `蓝卡延期申请已于 ${state.timeline.mobility.blueCard!.applicationOn} 递交，外管局决定前原卡视为继续有效（AufenthG § 81 Abs. 4）。`,
          en: `Your Blue Card extension was filed on ${state.timeline.mobility.blueCard!.applicationOn}; the card is deemed to continue until the Ausländerbehörde decides (AufenthG § 81 Abs. 4).`,
        }
      : undefined,
  absences: (state) =>
    state.timeline.trips.map((trip) => ({
      from: trip.departed,
      to: trip.returned,
    })),
  itemIcon,
  diaryText: {
    harvest: { zhCN: '小菜园收获', en: 'Allotment harvest' },
    catch: { zhCN: '林登运河钓鱼', en: 'Fishing on the Lindenkanal' },
  },
  furnishingNames: deGame.deFurnishingNames,
  resultHref: (state) =>
    `${countryPath('de', 'result')}#s=${encodeDraft(germanyModule, gameDraft(state))}`,
  assessment: (state, idPrefix) => (
    <CountryAssessmentColumns
      country={germanyModule}
      result={classified(state)}
      simulationDate={state.date}
      idPrefix={idPrefix}
    />
  ),
  endingAssessment: (state) => (
    <CountryAssessmentColumns
      country={germanyModule}
      result={classified(state)}
      simulationDate={state.date}
      idPrefix="ending-"
    />
  ),
  progressDetail(state, id, t) {
    const pathway = deGame.pathwayOf(state.result, state.timeline, id);
    if (!pathway)
      return <p className={styles.lead}>{t('result.undetermined')}</p>;
    return (
      <>
        <p className={styles.lead}>
          {pathway.title} · {pathwayTitle(pathway, t)}
        </p>
        <dl className={styles.facts}>
          <div>
            <dt>{t('de.game.timeDate')}</dt>
            <dd>{deGame.timeDate(pathway) ?? t('result.undetermined')}</dd>
          </div>
          <div>
            <dt>{t('de.result.earliest')}</dt>
            <dd>{pathway.earliestDate ?? t('result.undetermined')}</dd>
          </div>
        </dl>
      </>
    );
  },
  loadTownCanvas: () => import('./town-canvas'),
};

export const deShell = createGameShell(deCountry);
