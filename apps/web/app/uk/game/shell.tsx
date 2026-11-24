import type {
  DecisionOutcome,
  PersonTimeline,
  RuleSetId,
  SimulationResult,
} from '@uk-immigration/engine';
import * as ukGame from '@uk-immigration/game';
import type {
  Effect,
  FestivalId,
  GameState,
  TownEffect,
} from '@uk-immigration/game';
import { AssessmentColumns } from '../../../components/result-view';
import { createGameShell } from '../../game-shell/shell';
import type { GameCountry } from '../../game-shell/types';
import { createDraft, type Draft } from '../../../lib/questionnaire';
import { encodeDraft } from '../../../lib/share';
import { countryPath } from '../../../lib/site-countries';
import { ukModule } from '../../../lib/uk-module';
import { ukArt, ukAsset, ukStorageKey } from './country';
import * as sound from './sound';
import styles from './game.module.css';

export type UkKinds = {
  timeline: PersonTimeline;
  result: SimulationResult;
  effect: Exclude<Effect, TownEffect>;
  rule: RuleSetId;
  decision: DecisionOutcome;
  festival: FestivalId;
};

export function visaStatus(state: GameState) {
  const active = state.timeline.episodes
    .filter(
      (episode) =>
        episode.validFrom <= state.date && episode.validTo >= state.date,
    )
    .sort((a, b) => b.validFrom.localeCompare(a.validFrom))[0];
  if (!active) return { months: 0, renewed: false, validTo: undefined };
  let validTo = active.validTo;
  for (const episode of [...state.timeline.episodes].sort((a, b) =>
    a.validFrom.localeCompare(b.validFrom),
  )) {
    if (
      Date.parse(episode.validFrom) <= Date.parse(validTo) + 86_400_000 &&
      episode.validTo > validTo
    )
      validTo = episode.validTo;
  }
  return {
    validTo,
    renewed: validTo > active.validTo,
    months: ukGame.visaMonthsLeft({
      ...state,
      timeline: { ...state.timeline, episodes: [{ ...active, validTo }] },
    }),
  };
}

export const itemIcon = (id: string) => {
  if (id === 'community-lunch-photo')
    return ukAsset('/assets/items/community-lunch-photo.svg');
  const crop = id.replace(/^seed-/, '');
  if (ukArt.crops.includes(crop)) return ukAsset(`/assets/crops/${crop}.png`);
  if (['tea', 'biscuits', 'flowers', 'cake'].includes(id))
    return ukAsset(`/assets/items/${id}.png`);
  const item = ukGame.items.find((item) => item.id === id);
  if (item?.kind === 'fish')
    return ukAsset(`/assets/meadow-town/fish/${id}.svg`);
  if (item?.kind === 'junk')
    return ukAsset(`/assets/meadow-town/junk/${id}.svg`);
  if (ukGame.recipes.some((recipe) => recipe.makes === id))
    return ukAsset(`/assets/meadow-town/dishes/${id}.svg`);
  if (item?.kind === 'food') return ukAsset('/assets/items/meal.png');
  return ukAsset('/assets/indoor/item.png');
};

export function gameDraft(state: GameState): Draft {
  return {
    ...createDraft(),
    ...ukGame.ukGameDraft(state),
  };
}

// SRC-001 Ch. 2 (British connection) is modeled under the PD-003 assumption.
const reformOnly = (state: GameState) =>
  state.result.byRuleSet['current-law-2026-11']?.outcome !==
    'LIKELY_ELIGIBLE' &&
  state.result.byRuleSet['earned-settlement-2026-11']?.outcome ===
    'LIKELY_ELIGIBLE';

export const ukCountry: GameCountry<UkKinds> = {
  id: 'uk',
  game: ukGame,
  evaluate: (input) => ukGame.ukGameContent.rules.evaluate(input),
  sound,
  art: ukArt,
  asset: ukAsset,
  storageKey: ukStorageKey,
  money: (value) =>
    `£${value.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`,
  moneySymbol: '£',
  moneyMeter: 10000,
  stats: ['money', 'mood', 'health', 'english', 'career'],
  ruleColumns: ukGame.ukGameRuleColumns,
  outcomeLabel: (outcome, t) => t(`outcome.${outcome}`),
  missingRules: (state, id) =>
    ukGame.progress(state)[id].outcome === 'INSUFFICIENT_INFORMATION'
      ? state.result.byRuleSet[id]!.rules.filter(
          (rule) => rule.status === 'UNKNOWN',
        ).map((rule) => rule.title)
      : undefined,
  visaStatus,
  absences: (state) => state.timeline.absences,
  itemIcon,
  diaryText: {
    harvest: { zhCN: '菜地收获', en: 'Allotment harvest' },
    catch: { zhCN: '池塘钓鱼', en: 'Fishing at the pond' },
  },
  resultHref: (state) =>
    `${countryPath('uk', 'result')}#s=${encodeDraft(ukModule, gameDraft(state))}`,
  assessment: (state, idPrefix) => (
    <AssessmentColumns
      result={state.result}
      simulationDate={state.date}
      idPrefix={idPrefix}
    />
  ),
  endingAssessment(state, t, locale) {
    const result = ukGame.ukEndingAssessment(state, locale);
    return (
      <>
        {state.settlementApplication && (
          <p>{t('game.settlementAssessmentAtSubmission')}</p>
        )}
        {result.shortCircuit && (
          <p className={styles.notice}>{result.shortCircuit.message}</p>
        )}
        <AssessmentColumns
          ruleSets={ukGame.ukGameRuleColumns}
          result={result}
          simulationDate={state.date}
          idPrefix="ending-"
        />
      </>
    );
  },
  progressDetail(state, id, t) {
    const assessment = state.result.byRuleSet[id]!;
    return (
      <>
        <p className={styles.lead}>{t(`outcome.${assessment.outcome}`)}</p>
        <dl className={styles.facts}>
          <div>
            <dt>{t('result.pathway')}</dt>
            <dd>
              {assessment.pathwayYears === undefined
                ? t('result.undetermined')
                : `${assessment.pathwayYears} ${t('result.years')}`}
            </dd>
          </div>
          <div>
            <dt>{t('result.earliest')}</dt>
            <dd>{assessment.earliestDate ?? t('result.undetermined')}</dd>
          </div>
        </dl>
      </>
    );
  },
  placeNote: (state, place) =>
    place === 'work' || place === 'visa'
      ? ukGame.graduateNextStep(state)
      : undefined,
  endingActionText: (state, actionId) =>
    actionId === 'settle' && reformOnly(state)
      ? {
          label: 'game.reformSettlement',
          confirm: 'game.reformSettlementConfirm',
        }
      : undefined,
  festivalCallResult: {
    festival: 'lunar-new-year',
    actions: ['festival', 'lunar-dumplings'],
  },
  loadTownCanvas: () => import('./town-canvas'),
};

export const ukShell = createGameShell(ukCountry);
