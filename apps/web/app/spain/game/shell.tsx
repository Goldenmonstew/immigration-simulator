import type { CountryResult } from '@uk-immigration/engine';
import * as esGame from '@uk-immigration/game/es';
import type {
  EsColumn,
  EsEffect,
  EsFestival,
  EsOutcome,
  EsState,
  EsTimeline,
} from '@uk-immigration/game/es';
import { spainFull2026_11 } from '@uk-immigration/policy-data';
import { CountryAssessmentColumns } from '../../../components/result-view';
import { isDecisionOutcome, pathwayTitle } from '../../../lib/country-module';
import { encodeDraft } from '../../../lib/share';
import { countryPath } from '../../../lib/site-countries';
import {
  activeSpainAnswers,
  createSpainDraft,
  spainSteps,
  type SpainDraft,
} from '../../../lib/spain-draft';
import { presentSpainResult, spainModule } from '../../../lib/spain-module';
import { createGameShell } from '../../game-shell/shell';
import type { GameCountry } from '../../game-shell/types';
import styles from '../../uk/game/game.module.css';
import { esArt, esAsset, esStorageKey } from './country';
import * as sound from './sound';

export type EsKinds = {
  timeline: EsTimeline;
  result: CountryResult;
  effect: EsEffect;
  rule: EsColumn;
  decision: EsOutcome;
  festival: EsFestival;
};

const fish = '/assets/meadow-town/fish';
const dishes = '/assets/meadow-town/dishes';
const files: Record<string, string> = {
  llobarro: `${fish}/perch.svg`,
  orada: `${fish}/bream.svg`,
  mujol: `${fish}/roach.svg`,
  sard: `${fish}/tench.svg`,
  anguila: `${fish}/pike.svg`,
  'old-boot': '/assets/meadow-town/junk/old-boot.svg',
  'shopping-trolley': '/assets/meadow-town/junk/shopping-trolley.svg',
  rice: '/assets/items/meal.png',
  oranges: '/assets/items/biscuits.png',
  fartons: '/assets/items/cake.png',
  turron: `${dishes}/dumplings.svg`,
  flowers: '/assets/items/flowers.png',
  roscon: '/assets/items/cake.png',
  bunyols: '/assets/items/biscuits.png',
  'coca-sant-joan': `${dishes}/summer-corn.svg`,
  massapa: '/assets/items/biscuits.png',
  'all-i-pebre': `${dishes}/fish-and-potatoes.svg`,
  'tortilla-de-patatas': `${dishes}/baked-potato.svg`,
  gazpacho: `${dishes}/turnip-soup.svg`,
  'arros-a-banda': `${dishes}/corn-soup.svg`,
  'maduixes-amb-nata': `${dishes}/strawberry-jam.svg`,
};
/** Spain's items drawn with the shared CC0 icons. */
export function itemIcon(id: string) {
  const crop = id.replace(/^seed-/, '');
  if (esArt.crops.includes(crop)) return esAsset(`/assets/crops/${crop}.png`);
  return esAsset(files[id] ?? '/assets/indoor/item.png');
}

/**
 * The game timeline as a completed questionnaire for the result page, with
 * only the answers the chosen routes' questions ask for, as a share link keeps.
 */
export function gameDraft(state: EsState): SpainDraft {
  const date = esGame.assessmentDate(state);
  const draft: SpainDraft = {
    ...createSpainDraft(),
    ...structuredClone(esGame.filingAnswers(state.timeline, date)),
    simulationDate: date,
    completed: true,
  };
  return activeSpainAnswers({ ...draft, step: spainSteps(draft).at(-1)!.step });
}

/** The game's assessment as the result page shows it. */
export const shownResult = (state: EsState) =>
  presentSpainResult(structuredClone(state.result), state.locale);

const lateMonths = spainFull2026_11.values.longTermLateMonths;

export const esCountry: GameCountry<EsKinds> = {
  id: 'es',
  game: esGame,
  evaluate: (input) => esGame.esRules.evaluate(input),
  sound,
  art: esArt,
  asset: esAsset,
  storageKey: esStorageKey,
  money: (value) =>
    `€${value.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`,
  moneySymbol: '€',
  moneyMeter: 20_000,
  stats: ['money', 'mood', 'health', 'spanish', 'career'],
  ruleColumns: [
    { id: 'lt', label: 'es.game.ltColumn' },
    { id: 'nat', label: 'es.game.natColumn' },
  ],
  outcomeLabel: ({ outcome, earliestDate }, t) =>
    isDecisionOutcome(outcome)
      ? t(`outcome.${outcome}`)
      : t(`country.status.${outcome}`).replace(
          '{date}',
          earliestDate ?? t('result.undetermined'),
        ),
  missingRules(state, id) {
    const pathway = esGame.pathwayOf(state.result, id);
    const titles = pathway?.checks
      .filter(
        (check) =>
          pathway.decidedBy?.includes(check.id) && check.status !== 'MET',
      )
      .map((check) => check.title);
    return titles?.length ? [...new Set(titles)] : undefined;
  },
  visaStatus: (state) => ({
    months: esGame.visaMonthsLeft(state),
    renewed: false,
    validTo: esGame.currentPermit(state).to,
  }),
  absences: (state) =>
    state.timeline.trips.map((trip) => ({
      from: trip.departed,
      to: trip.returned,
    })),
  itemIcon,
  furnishingNames: esGame.esFurnishingNames,
  diaryText: {
    harvest: { zhCN: '街区菜园收获', en: 'Allotment harvest' },
    catch: { zhCN: '防波堤钓鱼', en: 'Fishing off the breakwater' },
  },
  resultHref: (state) =>
    `${countryPath('es', 'result')}#s=${encodeDraft(spainModule, gameDraft(state))}`,
  assessment: (state, idPrefix) => (
    <CountryAssessmentColumns
      country={spainModule}
      result={shownResult(state)}
      simulationDate={esGame.assessmentDate(state)}
      idPrefix={idPrefix}
    />
  ),
  endingAssessment: (state) => (
    <CountryAssessmentColumns
      country={spainModule}
      result={shownResult(state)}
      simulationDate={esGame.assessmentDate(state)}
      idPrefix="ending-"
    />
  ),
  progressDetail(state, id, t) {
    const pathway = esGame.pathwayOf(shownResult(state), id);
    if (!pathway)
      return <p className={styles.lead}>{t('result.undetermined')}</p>;
    return (
      <>
        <p className={styles.lead}>
          {pathway.title} · {pathwayTitle(pathway, t)}
        </p>
        <dl className={styles.facts}>
          <div>
            <dt>{t('es.game.timeDate')}</dt>
            <dd>{pathway.pathwayCompletionDate ?? t('result.undetermined')}</dd>
          </div>
          <div>
            <dt>{t('result.earliest')}</dt>
            <dd>{pathway.earliestDate ?? t('result.undetermined')}</dd>
          </div>
        </dl>
      </>
    );
  },
  placeNote(state, place) {
    if (place !== 'visa') return;
    const to = esGame.currentPermit(state).to!;
    const lt = esGame.pathwayOf(state.result, 'lt')?.status;
    const cita =
      lt === 'MET' && !state.flags.includes('cita-booked')
        ? {
            zhCN: '长期居留的条件已满足：先在图书馆抢一个 cita previa。',
            en: 'You meet the long-term residence conditions: book a cita previa at the library first.',
          }
        : undefined;
    const card =
      to < state.date
        ? {
            zhCN: `居留卡已于 ${to} 到期。到期后 ${lateMonths.value} 个月内仍可递交长期居留（SRC-083 art. 184.2）。`,
            en: `Your residence card expired on ${to}. Long-term residence can still be filed within ${lateMonths.value} months of expiry (SRC-083 art. 184.2).`,
          }
        : {
            zhCN: `居留卡有效期至 ${to}。游戏不办理临时居留续期，到期前请递交长期居留或入籍申请。`,
            en: `Your residence card is valid until ${to}. The game does not renew temporary permits, so apply for long-term residence or nationality before then.`,
          };
    return cita
      ? { zhCN: `${card.zhCN}${cita.zhCN}`, en: `${card.en} ${cita.en}` }
      : card;
  },
  loadTownCanvas: () => import('./town-canvas'),
};

export const esShell = createGameShell(esCountry);
