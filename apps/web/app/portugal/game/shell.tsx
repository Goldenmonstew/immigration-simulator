import type { CountryResult, Locale } from '@uk-immigration/engine';
import * as ptGame from '@uk-immigration/game/pt';
import type {
  PtColumn,
  PtEffect,
  PtFestival,
  PtOutcome,
  PtState,
  PtTimeline,
} from '@uk-immigration/game/pt';
import { CountryAssessmentColumns } from '../../../components/result-view';
import { useTranslation } from '../../../i18n/locale';
import { isDecisionOutcome, pathwayTitle } from '../../../lib/country-module';
import {
  createPortugalDraft,
  portugalStepList,
  type PortugalDraft,
} from '../../../lib/portugal-draft';
import {
  portugalModule,
  portugalPathwayView,
} from '../../../lib/portugal-module';
import { encodeDraft } from '../../../lib/share';
import { countryPath } from '../../../lib/site-countries';
import { createGameShell } from '../../game-shell/shell';
import type { GameCountry } from '../../game-shell/types';
import styles from '../../uk/game/game.module.css';
import { ptArt, ptAsset, ptStorageKey } from './country';
import * as sound from './sound';

export type PtKinds = {
  timeline: PtTimeline;
  result: CountryResult;
  effect: PtEffect;
  rule: PtColumn;
  decision: PtOutcome;
  festival: PtFestival;
};

const files: Record<string, string> = {
  tainha: '/assets/meadow-town/fish/roach.svg',
  robalo: '/assets/meadow-town/fish/perch.svg',
  dourada: '/assets/meadow-town/fish/bream.svg',
  carapau: '/assets/meadow-town/fish/pike.svg',
  'old-boot': '/assets/meadow-town/junk/old-boot.svg',
  'shopping-trolley': '/assets/meadow-town/junk/shopping-trolley.svg',
  bica: '/assets/items/tea.png',
  'pastel-de-nata': '/assets/items/biscuits.png',
  'pao-de-lo': '/assets/items/cake.png',
  'bolo-rei': '/assets/items/cake.png',
  flowers: '/assets/items/flowers.png',
  cravo: '/assets/items/flowers.png',
  sardinha: '/assets/items/fish.png',
  castanhas: '/assets/items/meal.png',
  'caldo-verde': '/assets/meadow-town/dishes/turnip-soup.svg',
  'batatas-murro': '/assets/meadow-town/dishes/baked-potato.svg',
  broa: '/assets/meadow-town/dishes/summer-corn.svg',
  'peixe-grelhado': '/assets/meadow-town/dishes/fish-and-potatoes.svg',
  'doce-morango': '/assets/meadow-town/dishes/strawberry-jam.svg',
  salada: '/assets/meadow-town/dishes/salad.svg',
};
/** Portugal's items drawn with the shared CC0 icons. */
export function itemIcon(id: string) {
  const crop = id.replace(/^seed-/, '');
  if (ptArt.crops.includes(crop)) return ptAsset(`/assets/crops/${crop}.png`);
  return ptAsset(files[id] ?? '/assets/indoor/item.png');
}

/** The game timeline as a completed questionnaire for the result page. */
export function gameDraft(state: PtState): PortugalDraft {
  const draft: PortugalDraft = {
    ...createPortugalDraft(),
    ...structuredClone(ptGame.answersOn(state.timeline, state.date)),
    simulationDate: state.date,
    completed: true,
  };
  return { ...draft, step: portugalStepList(draft).at(-1)!.step };
}

/** The game's two routes, worded and grouped as on the result page. */
function resultView(result: CountryResult, locale: Locale): CountryResult {
  return {
    ...result,
    columns: result.columns.map((column) => ({
      ...column,
      pathways: column.pathways.map((pathway) =>
        portugalPathwayView(pathway, locale),
      ),
    })),
  };
}
export function PortugalAssessment({
  state,
  idPrefix,
}: {
  state: PtState;
  idPrefix: string;
}) {
  const { locale } = useTranslation();
  return (
    <CountryAssessmentColumns
      country={portugalModule}
      result={resultView(state.result, locale)}
      simulationDate={state.date}
      idPrefix={idPrefix}
    />
  );
}

export const ptCountry: GameCountry<PtKinds> = {
  id: 'pt',
  game: ptGame,
  evaluate: (input) => ptGame.ptRules.evaluate(input),
  sound,
  art: ptArt,
  asset: ptAsset,
  storageKey: ptStorageKey,
  money: (value) =>
    `€${value.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`,
  moneySymbol: '€',
  moneyMeter: 20_000,
  stats: ['money', 'mood', 'health', 'portuguese', 'career'],
  ruleColumns: [
    { id: 'pr', label: 'pt.game.prColumn' },
    { id: 'nat', label: 'pt.game.natColumn' },
  ],
  // FUTURE only says when the time requirement is met.
  outcomeLabel: ({ outcome, earliestDate }, t) =>
    isDecisionOutcome(outcome)
      ? t(`outcome.${outcome}`)
      : t(
          outcome === 'FUTURE'
            ? 'pt.game.timeFuture'
            : `country.status.${outcome}`,
        ).replace('{date}', earliestDate ?? t('result.undetermined')),
  missingRules(state, id) {
    const pathway = ptGame.pathwayOf(state, id);
    const titles =
      pathway &&
      portugalPathwayView(pathway, state.locale)
        .checks.filter(
          (check) =>
            check.kind === 'requirement' &&
            check.applicable !== false &&
            check.status !== 'MET',
        )
        .map((check) => check.title);
    return titles?.length ? [...new Set(titles)] : undefined;
  },
  visaStatus: (state) => ({
    months: ptGame.visaMonthsLeft(state),
    renewed: false,
    validTo: ptGame.currentCard(state).to,
  }),
  absences: (state) =>
    state.timeline.trips.map((trip) => ({
      from: trip.departed,
      to: trip.returned,
    })),
  itemIcon,
  diaryText: {
    harvest: { zhCN: '社区菜园收获', en: 'Community garden harvest' },
    catch: { zhCN: '特茹河岸钓鱼', en: 'Fishing on the Tagus' },
  },
  furnishingNames: ptGame.ptFurnishingNames,
  resultHref: (state) =>
    `${countryPath('pt', 'result')}#s=${encodeDraft(portugalModule, gameDraft(state))}`,
  assessment: (state, idPrefix) => (
    <PortugalAssessment state={state} idPrefix={idPrefix} />
  ),
  endingAssessment: (state) => (
    <PortugalAssessment state={state} idPrefix="ending-" />
  ),
  progressDetail(state, id, t) {
    const pathway = ptGame.pathwayOf(state, id);
    if (!pathway)
      return <p className={styles.lead}>{t('result.undetermined')}</p>;
    const { outcome, earliestDate } = ptGame.progress(state)[id];
    return (
      <>
        <p className={styles.lead}>
          {pathway.title} · {pathwayTitle(pathway, t)}
        </p>
        <dl className={styles.facts}>
          {outcome === 'FUTURE' && (
            <div>
              <dt>{t('pt.game.timeDate')}</dt>
              <dd>{earliestDate}</dd>
            </div>
          )}
          <div>
            <dt>{t('result.earliest')}</dt>
            <dd>{pathway.earliestDate ?? t('result.undetermined')}</dd>
          </div>
        </dl>
      </>
    );
  },
  placeNote: (state, place) => (place === 'visa' ? ptGame.cardNote : undefined),
  loadTownCanvas: () => import('./town-canvas'),
};

export const ptShell = createGameShell(ptCountry);
