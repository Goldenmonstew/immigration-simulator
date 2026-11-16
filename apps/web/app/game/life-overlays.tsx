'use client';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useTranslation } from '../../i18n/locale';
import type { TranslationKey } from '../../i18n';
import {
  buy,
  cook,
  currentEvent,
  eat,
  festivals,
  fish,
  gift,
  harvest,
  hearts,
  items,
  mailbox,
  npcs,
  npcAt,
  plant,
  readMail,
  recipes,
  resolve,
  shop,
  townsfolk,
  water,
  type GameState,
  type PlaceId,
  type Text,
} from '@uk-immigration/game';
import {
  dayDate,
  localText,
  money,
  GameIcon,
  EffectHints,
  EventNotes,
  VisaReminder,
} from './game-view';
import { itemIcon, needsVisaReminder } from './session';
import { dialogueExpression, portraitPath } from './art';
import { playSound } from './sound';
import styles from './game.module.css';
type Change = { state: GameState; onChange: (state: GameState) => void };
// Core availability is authoritative, including the remaining minutes today.
function useLifeAction(onChange: Change['onChange']) {
  const { t } = useTranslation();
  const [error, setError] = useState(false);
  return {
    run(action: () => GameState) {
      let next: GameState;
      try {
        next = action();
      } catch {
        setError(true);
        return false;
      }
      setError(false);
      onChange(next);
      return true;
    },
    message: error ? <p role="status">{t('game.actionUnavailable')}</p> : null,
  };
}

export function TravelCard({
  state,
  returned,
  onContinue,
}: {
  state: GameState;
  returned?: GameState['trip'];
  onContinue: () => void;
}) {
  const { t, locale } = useTranslation();
  const trip = returned ?? state.trip!;
  return (
    <section
      className={styles.travel}
      aria-label={t(returned ? 'game.returned' : 'game.abroad')}
    >
      <span className={styles.travelIcon} aria-hidden="true">
        {returned ? '⌂' : '✈'}
      </span>
      <h2>{t(returned ? 'game.returned' : 'game.abroad')}</h2>
      <p>
        {dayDate(trip.from, locale)} → {dayDate(trip.to, locale)}
      </p>
      <time dateTime={state.day.date}>{dayDate(state.day.date, locale)}</time>
      <p>{t(returned ? 'game.returnedText' : 'game.abroadText')}</p>
      <button
        className={styles.button}
        disabled={!!state.pendingEvent && !returned}
        onClick={onContinue}
      >
        {t(returned ? 'game.continuePlaying' : 'game.continueJourney')}
      </button>
    </section>
  );
}
export function MorningCard({
  state,
  onContinue,
  onVisit,
}: {
  state: GameState;
  onContinue: () => void;
  onVisit?: () => void;
}) {
  const { t, locale } = useTranslation();
  const festival = festivals.find((f) => f.id === state.day.festival);
  return (
    <div className={styles.morning}>
      <div className={styles.weatherIcon} aria-hidden="true">
        <GameIcon name={state.day.weather} />
      </div>
      <h3>
        {dayDate(state.day.date, locale)} · {t(`game.${state.day.kind}`)}
      </h3>
      <p>
        {t(`game.${state.day.weather}`)} · 07:00 ·{' '}
        {t('game.day').replace('{day}', String(state.day.index + 1))}
      </p>
      <p>
        {t('game.mailCount').replace('{count}', String(mailbox(state).length))}
      </p>
      <p>
        {festival ? localText(festival.name, locale) : t('game.noFestival')}
      </p>
      {festival && <p>{localText(festival.text, locale)}</p>}
      {state.day.index === 0 && needsVisaReminder(state) && (
        <VisaReminder state={state} onVisit={onVisit} />
      )}
      <button className={styles.button} onClick={onContinue}>
        {t('game.beginDay')}
      </button>
    </div>
  );
}
export function ItemIcon({ id }: { id: string }) {
  return (
    <span
      aria-hidden="true"
      className={styles.itemIcon}
      style={{
        backgroundImage: `url("${itemIcon(id)}")`,
        backgroundPosition: itemIcon(id).includes('/crops/')
          ? '-160px 0'
          : '0 0',
        backgroundSize: itemIcon(id).includes('/crops/')
          ? '192px 32px'
          : '32px 32px',
      }}
    />
  );
}
export function ItemName({ id }: { id: string }) {
  const { locale, t } = useTranslation();
  const item = items.find((i) => i.id === id);
  return <>{item ? localText(item.name, locale) : t('game.itemFallback')}</>;
}
function HeartProgress({ state, npc }: { state: GameState; npc: string }) {
  const { t } = useTranslation();
  return (
    <>
      <span className={styles.hearts} aria-label={`${hearts(state, npc)} / 10`}>
        {'♥'.repeat(hearts(state, npc))}
        {'♡'.repeat(10 - hearts(state, npc))}
      </span>
      <small>
        {t(
          hearts(state, npc) === 10 ? 'game.fullHearts' : 'game.nextHeart',
        ).replace('{count}', String((state.friendship[npc] ?? 0) % 100))}
      </small>
    </>
  );
}

export function Dialogue({
  state,
  npc,
  onChange,
  onClose,
  feedbackText,
  heartChange,
}: Change & {
  npc: string;
  onClose: () => void;
  feedbackText?: Text;
  heartChange?: { before: number; after: number };
}) {
  const { t, locale } = useTranslation();
  const person = npcs.find((n) => n.id === npc)!;
  const meetingPlace = useRef(npcAt(state, npc));
  const stillHere = npcAt(state, npc) === meetingPlace.current;
  const event = currentEvent(state);
  const spokenText =
    event?.text ??
    feedbackText ??
    (state.outcome?.npc === npc ? state.outcome?.text : undefined) ??
    person.lines[0].text;
  const text = localText(spokenText, locale);
  const expression = dialogueExpression(person, spokenText, event);
  const [paragraph, setParagraph] = useState(0);
  const paragraphs = event ? text.split('\n') : [text];
  const line = paragraphs[paragraph] ?? paragraphs[0];
  const lastParagraph = paragraph === paragraphs.length - 1;
  const [letters, setLetters] = useState(0);
  const [gifting, setGifting] = useState(false);
  const action = useLifeAction(onChange);
  useEffect(() => {
    setParagraph(0);
  }, [text, event?.id, npc]);
  useEffect(() => {
    setLetters(0);
    const timer = setInterval(
      () => setLetters((n) => Math.min(n + 1, line.length)),
      28,
    );
    return () => clearInterval(timer);
  }, [line, paragraph, event?.id, npc]);
  useEffect(() => {
    if (letters && letters < line.length && letters % 3 === 0)
      playSound('voice', npc);
  }, [letters, line, npc]);
  return (
    <>
      <h2 className={styles.nameplate}>
        {localText(person.name, locale)}
        <small>{localText(person.role, locale)}</small>
      </h2>
      {action.message}
      {heartChange && (
        <p role="status" className={styles.heartChange}>
          ♥ {heartChange.before} → {heartChange.after}
        </p>
      )}
      <div className={styles.dialogueBody}>
        <span className={styles.portraitFrame}>
          <span
            className={styles.portrait}
            style={{
              backgroundImage: `url("${portraitPath(npc, expression)}")`,
            }}
            aria-hidden="true"
          />
        </span>
        <div>
          <HeartProgress state={state} npc={npc} />
          <button
            className={styles.dialogueText}
            aria-label={t('game.reveal')}
            aria-describedby="game-dialogue-line"
            disabled={letters >= line.length}
            onClick={() => setLetters(line.length)}
          >
            <span
              id="game-dialogue-line"
              className={styles.srOnly}
              aria-label={line}
            >
              {line}
            </span>
            <span className={styles.dialogueLine} aria-hidden="true">
              <span className={styles.lineMeasure}>{line}</span>
              <span className={styles.lineTyped}>
                {line.slice(0, letters)}
                <span aria-hidden="true">
                  {letters < line.length ? '▍' : ''}
                </span>
              </span>
            </span>
            <span className={styles.revealHint}>{t('game.tapToReveal')}</span>
          </button>
        </div>
      </div>
      {event && !lastParagraph && letters >= line.length && (
        <button
          className={styles.button}
          onClick={() => {
            setLetters(0);
            setParagraph((n) => n + 1);
          }}
        >
          {t('game.continuePlaying')}
        </button>
      )}
      {event ? (
        (paragraphs.length === 1 ||
          (lastParagraph && letters >= line.length)) && (
          <div className={styles.choices}>
            {event.choices.map((c) => (
              <button
                key={c.id}
                className={styles.choice}
                onClick={() => onChange(resolve(state, c.id))}
              >
                {localText(c.label, locale)}
                <EffectHints effects={c.effects} />
              </button>
            ))}
          </div>
        )
      ) : (
        <>
          {gifting ? (
            <div className={styles.itemGrid}>
              {Object.entries(state.inventory)
                .filter(([, n]) => n > 0)
                .map(([id, n]) => (
                  <button
                    key={id}
                    className={styles.choice}
                    disabled={!stillHere}
                    onClick={() => {
                      action.run(() => gift(state, npc, id));
                      setGifting(false);
                    }}
                  >
                    <ItemIcon id={id} />
                    <span>
                      <ItemName id={id} /> × {n}
                    </span>
                  </button>
                ))}
            </div>
          ) : null}
          <div className={styles.dialogueActions}>
            {!gifting && (
              <button
                className={styles.secondary}
                disabled={state.day.gifted.includes(npc) || !stillHere}
                onClick={() => setGifting(true)}
              >
                {t(
                  state.day.gifted.includes(npc)
                    ? 'game.giftDone'
                    : 'game.gift',
                )}
              </button>
            )}
            <button className={styles.button} onClick={onClose}>
              {t('game.finishedTalking')}
            </button>
          </div>
        </>
      )}
      {event && <EventNotes choices={event.choices} />}
    </>
  );
}
export function Inventory({
  state,
  onChange,
  onKitchen,
  initialTab = 'bag',
}: Change & {
  onKitchen: () => void;
  initialTab?: 'bag' | 'collection' | 'friends';
}) {
  const { t, locale } = useTranslation();
  const [tab, setTab] = useState(initialTab);
  const action = useLifeAction(onChange);
  const inventory = Object.entries(state.inventory).filter(([, n]) => n > 0);
  return (
    <>
      {action.message}
      <div className={styles.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'bag'}
          onClick={() => setTab('bag')}
        >
          {t('game.bag')}
        </button>
        <button
          role="tab"
          aria-selected={tab === 'collection'}
          onClick={() => setTab('collection')}
        >
          {t('game.collection')}
        </button>
        <button
          role="tab"
          aria-selected={tab === 'friends'}
          onClick={() => setTab('friends')}
        >
          {t('game.friends')}
        </button>
      </div>
      {tab === 'collection' ? (
        <LifeCollection state={state} />
      ) : tab === 'friends' ? (
        <ul className={styles.friendList}>
          {townsfolk(state).map((n) => (
            <li key={n.id}>
              <span
                className={styles.smallPortrait}
                style={{ backgroundImage: `url("${portraitPath(n.id)}")` }}
                aria-hidden="true"
              />
              <span>
                {localText(n.name, locale)}
                <small>{localText(n.role, locale)}</small>
              </span>
              <span>
                <HeartProgress state={state} npc={n.id} />
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <>
          {!inventory.length && <p>{t('game.emptyBag')}</p>}
          <div className={styles.itemGrid}>
            {inventory.map(([id, n]) => (
              <article className={styles.itemCard} key={id}>
                <ItemIcon id={id} />
                <strong>
                  <ItemName id={id} /> × {n}
                </strong>
                {items.find((i) => i.id === id)?.edible && (
                  <button
                    className={styles.secondary}
                    onClick={() => action.run(() => eat(state, id))}
                  >
                    {t('game.eat')}
                  </button>
                )}
              </article>
            ))}
          </div>
          <p>{t('game.kitchenHint')}</p>
          <button className={styles.secondary} onClick={onKitchen}>
            {t('game.cook')}
          </button>
        </>
      )}
    </>
  );
}
export function LifeCollection({ state }: { state: GameState }) {
  const { t } = useTranslation();
  const groups = [
    {
      id: 'fish',
      title: t('game.collectionFish'),
      entries: items.filter((item) => item.kind === 'fish'),
      records: state.lifeRecords?.fish ?? [],
    },
    {
      id: 'dishes',
      title: t('game.collectionDishes'),
      entries: recipes.map((recipe) =>
        items.find((item) => item.id === recipe.makes)!,
      ),
      records: state.lifeRecords?.dishes ?? [],
    },
  ];
  const harvests = state.lifeRecords?.harvests ?? [];
  return (
    <section aria-label={t('game.collection')}>
      <p>{t('game.collectionHint')}</p>
      {groups.map((group) => (
        <section key={group.id} aria-labelledby={`collection-${group.id}`}>
          <h3 id={`collection-${group.id}`}>
            {group.title} · {group.records.length} / {group.entries.length}
          </h3>
          <div className={styles.itemGrid}>
            {group.entries.map((item) => {
              const record = group.records.find((r) => r.itemId === item.id);
              return (
                <article className={styles.itemCard} key={item.id}>
                  {record ? (
                    <>
                      <ItemIcon id={item.id} />
                      <strong>
                        <ItemName id={item.id} />
                      </strong>
                      <small className={styles.collectionDate}>
                        {t('game.collectionFirst')
                          .replace('{year}', String(record.year))
                          .replace(
                            '{season}',
                            t(`game.season${record.quarter}`),
                          )}
                      </small>
                    </>
                  ) : (
                    <>
                      <span
                        className={styles.collectionUnknown}
                        aria-hidden="true"
                      >
                        ?
                      </span>
                      <strong>{t('game.collectionUnknown')}</strong>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ))}
      <p className={styles.collectionHarvests}>
        {t('game.collectionHarvests')
          .replace('{count}', String(harvests.length))
          .replace(
            '{kinds}',
            String(new Set(harvests.map((r) => r.itemId)).size),
          )}
      </p>
    </section>
  );
}
export function Kitchen({ state, onChange }: Change) {
  const { t, locale } = useTranslation();
  const action = useLifeAction(onChange);
  const [recipeId, setRecipeId] = useState<string>();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const settled = useRef(false);
  const recipe = recipes.find((r) => r.id === recipeId);
  const finish = () => {
    if (!recipe || settled.current) return;
    settled.current = true;
    const accepted = action.run(() => cook(state, recipe.id));
    setDone(accepted);
    if (!accepted) settled.current = false;
  };
  if (recipe) {
    const ingredients = Object.entries(recipe.needs);
    const steps = [
      ...ingredients.map(([id, qty]) =>
        t('game.kitchenAdd')
          .replace(
            '{item}',
            localText(items.find((i) => i.id === id)!.name, locale),
          )
          .replace('{count}', String(qty)),
      ),
      t(`game.prepare-${recipe.id}` as TranslationKey),
      t('game.kitchenServe'),
    ];
    return (
      <div className={styles.kitchen}>
        <h3>{localText(recipe.label, locale)}</h3>
        {action.message}
        {done ? (
          <div className={styles.catchCard} role="status">
            <ItemIcon id={recipe.makes} />
            <strong>
              <ItemName id={recipe.makes} />
            </strong>
            <p>{t('game.kitchenComment')}</p>
          </div>
        ) : (
          <>
            <ol className={styles.kitchenSteps}>
              {steps.map((label, index) => (
                <li
                  key={label}
                  aria-current={index === step ? 'step' : undefined}
                  data-done={index < step}
                >
                  {label}
                </li>
              ))}
            </ol>
            <div className={styles.prepBoard} aria-hidden="true">
              {ingredients.map(([id], index) => (
                <span key={id} data-added={index < step}>
                  <ItemIcon id={id} />
                </span>
              ))}
            </div>
            <p role="status">
              {t('game.kitchenStep')
                .replace('{step}', String(step + 1))
                .replace('{total}', String(steps.length))}
            </p>
            <button
              className={styles.button}
              onClick={() =>
                step === steps.length - 1 ? finish() : setStep(step + 1)
              }
            >
              {steps[step]}
            </button>
            <button className={styles.button} onClick={finish}>
              {t('game.kitchenSkip')}
            </button>
          </>
        )}
        <button
          className={styles.button}
          onClick={() => setRecipeId(undefined)}
        >
          {t('game.kitchenRecipes')}
        </button>
      </div>
    );
  }
  return (
    <div className={styles.choices}>
      {action.message}
      {recipes.map((r) => (
        <button
          key={r.id}
          className={styles.choice}
          disabled={
            state.day.minute + r.minutes > 1440 ||
            Object.entries(r.needs).some(
              ([id, n]) => (state.inventory[id] ?? 0) < n,
            )
          }
          onClick={() => {
            settled.current = false;
            setDone(false);
            setStep(0);
            setRecipeId(r.id);
          }}
        >
          <strong>{localText(r.label, locale)}</strong>
          <span>
            {t('game.recipeNeeds')}:{' '}
            {Object.entries(r.needs).map(([id, n]) => (
              <span key={id}>
                <ItemName id={id} /> × {n}{' '}
              </span>
            ))}
          </span>
          <small>
            {t('game.minutes').replace('{count}', String(r.minutes))}
          </small>
        </button>
      ))}
    </div>
  );
}
export function Shop({ state, place, onChange }: Change & { place: PlaceId }) {
  const { t, locale } = useTranslation();
  const [qty, setQty] = useState(1);
  return (
    <>
      <label className={styles.quantity}>
        {t('game.quantity')}
        <input
          aria-label={t('game.quantity')}
          type="number"
          min={1}
          max={99}
          value={qty}
          onChange={(e) =>
            setQty(
              Math.max(
                1,
                Math.min(99, Math.floor(Number(e.target.value)) || 1),
              ),
            )
          }
        />
      </label>
      <div className={styles.itemGrid}>
        {shop(state, place).map((i) => (
          <article key={i.id} className={styles.itemCard}>
            <ItemIcon id={i.id} />
            <strong>{localText(i.name, locale)}</strong>
            <span>
              {money(i.price!)} × {qty}
            </span>
            <button
              className={styles.secondary}
              disabled={state.stats.money < i.price! * qty}
              onClick={() => onChange(buy(state, i.id, qty))}
            >
              {t('game.buy')} · {money(i.price! * qty)}
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
export function PlotMenu({ state, plot, onChange }: Change & { plot: number }) {
  const { t, locale } = useTranslation();
  const action = useLifeAction(onChange);
  const p = state.plots[plot];
  if (!p) return <p>{t('game.rentFirst')}</p>;
  const seed = items.find((i) => i.id === p.seed);
  const seeds = items.filter(
    (i) =>
      i.grows?.seasons.includes(state.quarter) &&
      (state.inventory[i.id] ?? 0) > 0,
  );
  return p.seed ? (
    <>
      {action.message}
      <p>
        <ItemName id={seed?.grows?.crop ?? p.seed} /> ·{' '}
        {t('game.growth')
          .replace('{count}', String(p.growth))
          .replace('{days}', String(seed!.grows!.days))}
      </p>
      <div className={styles.buttons}>
        <button
          className={styles.secondary}
          disabled={p.wateredOn === state.dayNumber}
          onClick={() => action.run(() => water(state, plot))}
        >
          {t(p.wateredOn === state.dayNumber ? 'game.watered' : 'game.water')}
        </button>
        <button
          className={styles.button}
          disabled={p.growth < seed!.grows!.days}
          onClick={() => action.run(() => harvest(state, plot))}
        >
          {t('game.harvest')}
        </button>
      </div>
    </>
  ) : (
    <>
      {action.message}
      <p>{t('game.plant')}</p>
      {!seeds.length && <p>{t('game.noSeeds')}</p>}
      <div className={styles.choices}>
        {seeds.map((i) => (
          <button
            key={i.id}
            className={styles.choice}
            onClick={() => action.run(() => plant(state, plot, i.id))}
          >
            {localText(i.name, locale)} × {state.inventory[i.id]}
          </button>
        ))}
      </div>
    </>
  );
}
export function Mailbox({ state, onChange }: Change) {
  const { t } = useTranslation();
  return (
    <>
      <p>
        {t('game.mailCount').replace('{count}', String(mailbox(state).length))}
      </p>
      {mailbox(state).length ? (
        <button
          className={styles.button}
          onClick={() => onChange(readMail(state))}
        >
          {t('game.readMail')}
        </button>
      ) : (
        <p>{t('game.noMail')}</p>
      )}
    </>
  );
}
type FishingPhase =
  'idle' | 'casting' | 'waiting' | 'bite' | 'reeling' | 'win' | 'miss';
export function Fishing({ state, onChange }: Change) {
  const { t } = useTranslation();
  const action = useLifeAction(onChange);
  const [phase, setPhase] = useState<FishingPhase>('idle');
  const [easy, setEasy] = useState(false);
  const [caught, setCaught] = useState<{ id: string; first: boolean }>();
  const stage = useRef<FishingPhase>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const deadline = useRef(0);
  const latest = useRef({ state, run: action.run });
  latest.current = { state, run: action.run };
  const show = (next: FishingPhase) => {
    stage.current = next;
    setPhase(next);
  };
  const finish = (success: boolean) => {
    if (!['waiting', 'bite'].includes(stage.current)) return;
    clearTimeout(timer.current);
    show('reeling');
    timer.current = setTimeout(() => {
      // A missed bite is a local retry: no clock, RNG, inventory or life-record changes.
      if (!success) {
        show('miss');
        return;
      }
      const before = latest.current.state;
      const accepted = latest.current.run(() => {
        const next = fish(before, true);
        const id = Object.keys(next.outcome?.items ?? {})[0];
        setCaught({
          id,
          first:
            !!next.lifeRecords?.fish.some((r) => r.itemId === id) &&
            !before.lifeRecords?.fish.some((r) => r.itemId === id),
        });
        return next;
      });
      show(accepted ? 'win' : 'idle');
    }, 500);
  };
  const cast = () => {
    if (!['idle', 'win', 'miss'].includes(stage.current)) return;
    setCaught(undefined);
    show('casting');
    timer.current = setTimeout(() => {
      show('waiting');
      timer.current = setTimeout(
        () => {
          show('bite');
          const windowMs = easy ? 2000 : 600;
          deadline.current = Date.now() + windowMs;
          timer.current = setTimeout(() => finish(false), windowMs);
        },
        1000 + Math.random() * 3000,
      );
    }, 450);
  };
  const activate = () => {
    if (['waiting', 'bite'].includes(stage.current))
      finish(stage.current === 'bite' && Date.now() < deadline.current);
    else cast();
  };
  const input = useRef(activate);
  input.current = activate;
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tag ?? '')) return;
      // Native buttons already support Space/Enter, including the mode switch.
      if (e.key === ' ' && tag === 'BUTTON') return;
      if ([' ', 'e', 'E'].includes(e.key) && !e.repeat) {
        e.preventDefault();
        input.current();
      }
    };
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('keydown', key);
      clearTimeout(timer.current);
    };
  }, []);
  const busy = ['casting', 'waiting', 'bite', 'reeling'].includes(phase);
  const status = {
    idle: 'game.fish',
    casting: 'game.castingFish',
    waiting: 'game.waitingFish',
    bite: 'game.bite',
    reeling: 'game.reelingFish',
    win: 'game.fishWin',
    miss: 'game.fishMiss',
  } as const;
  return (
    <div className={styles.fishing}>
      {action.message}
      <button
        className={styles.button}
        aria-pressed={easy}
        disabled={busy}
        onClick={() => setEasy(!easy)}
      >
        {t('game.fishEasy')}
      </button>
      <p>{t(easy ? 'game.fishEasyHint' : 'game.fishHint')}</p>
      <div className={styles.floatWater} data-phase={phase} aria-hidden="true">
        <span className={styles.fishingRod} />
        <span className={styles.fishingLine} />
        <span className={styles.fishingFloat} />
        <span className={styles.fishingRipple} />
      </div>
      <p role="status">{t(status[phase])}</p>
      {caught && phase === 'win' && (
        <div className={styles.catchCard}>
          <ItemIcon id={caught.id} />
          <strong>
            <ItemName id={caught.id} />
          </strong>
          <p>
            {t(
              caught.first
                ? 'game.fishFirst'
                : items.find((i) => i.id === caught.id)?.kind === 'fish'
                  ? 'game.fishCollected'
                  : 'game.fishJunk',
            )}
          </p>
        </div>
      )}
      {phase === 'miss' && <p>{t('game.fishRetry')}</p>}
      <button
        className={styles.button}
        disabled={phase === 'casting' || phase === 'reeling'}
        onClick={activate}
      >
        {t(busy ? 'game.reel' : 'game.cast')}
      </button>
    </div>
  );
}
export function OutcomeText({ text }: { text?: Text }) {
  const { locale } = useTranslation();
  return text ? (
    <p role="status" className={styles.outcomeToast}>
      {localText(text, locale)
        .split('\n')
        .map((line, index) => (
          <Fragment key={index}>
            {index > 0 && <br />}
            {line}
          </Fragment>
        ))}
    </p>
  ) : null;
}
