'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { RuleSetId } from '@uk-immigration/engine';
import { withCount } from '../../i18n';
import { useTranslation } from '../../i18n/locale';
import {
  activities,
  approachSurprise,
  characters,
  loadCharacter,
  newGame,
  currentEvent,
  enter,
  fastForward,
  isOver,
  hearts,
  mailbox,
  npcs,
  places,
  sleep,
  shop,
  talk,
  tick,
  type GameState,
  type PlaceId,
  type Text,
} from '@uk-immigration/game';
import {
  CharacterSelect,
  ControlHint,
  Ending,
  EventCard,
  GameIcon,
  InteractButton,
  localText,
  LocationMenu,
  Modal,
  ProgressBars,
  ProgressDetail,
  QuarterSummary,
  StatusBar,
  type StateChange,
} from './game-view';
import {
  Dialogue,
  Fishing,
  Inventory,
  Kitchen,
  Mailbox,
  MorningCard,
  OutcomeText,
  PlotMenu,
  Shop,
  TravelCard,
} from './life-overlays';
import {
  gameStorage,
  hasKnownEvents,
  previewGameSave,
  type GameSave,
  withGameLocale,
  visaExpiresThisSeason,
  visaStatus,
  isPlaceOpen,
} from './session';
import {
  hideSound,
  playSound,
  readMuted,
  setMuted as saveMuted,
  setSoundSeason,
  stopSound,
  unlockSound,
} from './sound';
import type { Interaction, SceneFeedback } from './scene';
import {
  recordMemories,
  resolvedOutcomeText,
  type DayMemory,
  type ChangeSource,
} from './diary';
import { WelcomeLoading } from './welcome';
import styles from './game.module.css';
import canvasStyles from './town-canvas.module.css';

// Phaser is most of the game's JavaScript; load it only once a town is on
// screen, so the welcome screen and character select appear without it.
const TownCanvas = dynamic(() => import('./town-canvas'), {
  ssr: false,
  loading: CanvasPlaceholder,
});
// The placeholder takes the canvas's size, which differs indoors.
const InteriorContext = createContext(false);
function CanvasPlaceholder() {
  const interior = useContext(InteriorContext);
  return (
    <div
      className={`${canvasStyles.canvas} ${interior ? canvasStyles.interior : ''}`}
    />
  );
}
type Overlay =
  | { kind: 'place'; id: PlaceId }
  | { kind: 'dialogue'; id: string }
  | { kind: 'plot'; id: number }
  | { kind: 'bag' }
  | { kind: 'collection' }
  | { kind: 'destinations' }
  | { kind: 'kitchen' }
  | { kind: 'mailbox' }
  | { kind: 'fishing' }
  | { kind: 'detail'; id: RuleSetId };
export default function GameClient() {
  const { t, locale } = useTranslation();
  const [state, setState] = useState<GameState>();
  const [saves, setSaves] = useState<Record<string, GameSave>>({});
  const [loadError, setLoadError] = useState<Error>();
  const loadingCharacter = useRef(false);
  const [ready, setReady] = useState(false),
    [sceneReady, setSceneReady] = useState(false),
    [available, setAvailable] = useState(true);
  const [overlay, setOverlay] = useState<Overlay>();
  const conversation = useRef<
    { npc: string; menu?: Extract<Overlay, { kind: 'place' }> } | undefined
  >(undefined);
  const [outcomeText, setOutcomeText] = useState<Text>();
  const [immediateResult, setImmediateResult] = useState<Text>();
  const [festivalResult, setFestivalResult] = useState<Text>();
  const [feedback, setFeedback] = useState<SceneFeedback>();
  const [returned, setReturned] = useState<GameState['trip']>();
  const diary = useRef<DayMemory[]>([]);
  const quarterStart = useRef<GameState['stats'] | undefined>(undefined);
  const openOverlay = (next?: Overlay) => {
    setOutcomeText(undefined);
    setOverlay(next);
  };
  const [morning, setMorning] = useState(false),
    [summary, setSummary] = useState<StateChange>();
  const [confirmation, setConfirmation] = useState<'sleep' | 'fast'>();
  const [routine, setRoutine] = useState<'sleep' | 'fast'>();
  const [fading, setFading] = useState(false),
    [interior, setInterior] = useState(true),
    [hidden, setHidden] = useState(false),
    [muted, setMuted] = useState(true);
  const [destination, setDestination] = useState<{
    location: PlaceId;
    request: number;
  }>();
  const [interaction, setInteraction] = useState<Interaction>();
  const [approachNpc, setApproachNpc] = useState<{
    id: string;
    request: number;
  }>();
  const [interactRequest, setInteractRequest] = useState(0);
  const latest = useRef(state);
  latest.current = state;
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => {
    const loaded = characters.map(
      (c) => [c.id, previewGameSave(c.id)] as const,
    );
    setSaves(Object.fromEntries(loaded));
    setAvailable(loaded.every(([, s]) => s.available));
    setMuted(readMuted());
    saveMuted(readMuted());
    setReady(true);
    const visibility = () => {
      setHidden(document.hidden);
      hideSound(document.hidden);
    };
    document.addEventListener('visibilitychange', visibility);
    visibility();
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      clearTimeout(fadeTimer.current);
      stopSound();
    };
  }, []);
  useEffect(() => {
    if (state && state.locale !== locale)
      setState(withGameLocale(state, locale));
  }, [state, locale]);
  useEffect(() => {
    if (!ready || !state || state.locale !== locale) return;
    const saved = gameStorage(
      state.characterId,
      state,
      diary.current,
      quarterStart.current,
    );
    setAvailable(saved.available);
    const slot = {
      ...saved,
      diary: diary.current,
      quarterStart: quarterStart.current,
    };
    setSaves((prev) => ({ ...prev, [state.characterId]: slot }));
  }, [state, ready, locale]);
  useEffect(() => {
    if (state && !isOver(state))
      setSoundSeason(state.quarter, !!state.day.festival);
    else stopSound();
  }, [state?.quarter, state?.day.festival, state?.ending, !!state]);
  const current = state && withGameLocale(state, locale),
    event = current && currentEvent(current);
  const eventResult = immediateResult ?? (event ? undefined : festivalResult);
  const closeEventResult = () => {
    if (immediateResult) setImmediateResult(undefined);
    else setFestivalResult(undefined);
  };
  const paused = !!(
    !sceneReady ||
    hidden ||
    overlay ||
    morning ||
    summary ||
    event ||
    eventResult ||
    confirmation ||
    fading ||
    routine ||
    returned ||
    current?.trip ||
    (current && isOver(current))
  );
  function apply(next: GameState, source: ChangeSource = 'action') {
    const before = latest.current!;
    latest.current = next;
    setState(next);
    if (next === before) return;
    diary.current = recordMemories(diary.current, before, next, source);
    if (source === 'resolve' && routine !== 'fast')
      setImmediateResult(resolvedOutcomeText(before, next));
    const changedHearts = Object.fromEntries(
      Object.keys(next.friendship)
        .filter((id) => hearts(before, id) !== hearts(next, id))
        .map((id) => [
          id,
          { before: hearts(before, id), after: hearts(next, id) },
        ]),
    );
    const promotion = next.flags.some(
      (f) => f.startsWith('promotion-') && !before.flags.includes(f),
    );
    if (source === 'action' || source === 'resolve' || promotion) {
      const outcome =
        source === 'action'
          ? next.outcome
          : {
              kind: 'activity' as const,
              statDeltas: Object.fromEntries(
                Object.keys(next.stats).map((key) => [
                  key,
                  next.stats[key as keyof GameState['stats']] -
                    before.stats[key as keyof GameState['stats']],
                ]),
              ),
            };
      setFeedback((prev) => ({
        token: (prev?.token ?? 0) + 1,
        outcome,
        hearts: changedHearts,
        promotion,
      }));
      setOutcomeText(
        source === 'action'
          ? (next.outcome?.text ??
              (next.outcome?.items ? diary.current.at(-1)?.text : undefined))
          : undefined,
      );
    }
    if (source === 'action' || next.log.length > before.log.length) {
      playSound(
        next.achievements.length > before.achievements.length
          ? 'achievement'
          : next.outcome?.kind === 'buy'
            ? 'coin'
            : next.outcome?.kind === 'harvest'
              ? 'achievement'
              : 'menu',
      );
    }
    if (next.dayNumber !== before.dayNumber) {
      setInterior(true);
      setOverlay(undefined);
      setMorning(
        source !== 'fast' && routine !== 'fast' && !isOver(next) && !next.trip,
      );
      setDestination(undefined);
    }
    if (next.log.slice(before.log.length).some((e) => e.kind === 'quarter')) {
      setSummary({
        before,
        after: next,
        diary: diary.current,
        startStats: quarterStart.current,
      });
      quarterStart.current = { ...next.stats };
      setRoutine(undefined);
    }
    const absence = next.timeline.absences.at(-1);
    if (
      absence &&
      next.timeline.absences.length > before.timeline.absences.length &&
      (before.trip || source === 'action')
    )
      setReturned(absence);
    if (next.trip) {
      setMorning(false);
      setDestination(undefined);
    }
    if (next.pendingEvent || next.trip) openOverlay();
    else if (source === 'resolve' && conversation.current)
      openOverlay({ kind: 'dialogue', id: conversation.current.npc });
  }
  useEffect(() => {
    if (!current || paused || interior) return;
    const timer = setInterval(() => {
      const s = latest.current;
      if (s) apply(tick(s, 10), 'observe');
    }, 2000);
    return () => clearInterval(timer);
  }, [paused, interior, current?.characterId]);
  useEffect(() => {
    if (
      !state ||
      !routine ||
      state.pendingEvent ||
      eventResult ||
      summary ||
      fading
    )
      return;
    const next = routine === 'fast' ? fastForward(state) : sleep(state);
    if (next === state) {
      setRoutine(undefined);
      return;
    }
    apply(next, routine === 'fast' ? 'fast' : 'observe');
    if (routine === 'sleep' && next.dayNumber !== state.dayNumber)
      setRoutine(undefined);
  }, [state, routine, eventResult, summary, fading]);
  useEffect(() => {
    if (
      !state ||
      state.day.minute < 1440 ||
      state.pendingEvent ||
      eventResult ||
      summary ||
      routine ||
      fading
    )
      return;
    setInterior(true);
    setOverlay(undefined);
    setRoutine('sleep');
  }, [
    state?.day.minute,
    state?.pendingEvent,
    eventResult,
    summary,
    routine,
    fading,
  ]);
  const choose = (next?: GameState, saved?: GameSave) => {
    latest.current = next;
    diary.current = saved?.diary ?? [];
    quarterStart.current = saved?.quarterStart ?? (next && { ...next.stats });
    setState(next);
    openOverlay();
    conversation.current = undefined;
    setFeedback(undefined);
    setImmediateResult(undefined);
    // A save made while a call interrupts a New Year activity keeps that
    // activity's result to show after the call (50 review risk).
    setFestivalResult(
      next?.pendingEvent &&
        next.day.festival === 'lunar-new-year' &&
        (next.outcome?.actionId === 'festival' ||
          next.outcome?.actionId === 'lunar-dumplings')
        ? next.outcome.text
        : undefined,
    );
    setReturned(undefined);
    setSummary(undefined);
    setRoutine(undefined);
    setDestination(undefined);
    setSceneReady(false);
    setMorning(!!next && !next.trip && next.day.minute === 420);
    setInterior(next?.day.place === 'home');
  };
  const selectCharacter = async (id: string, action: 'new' | 'continue') => {
    if (loadingCharacter.current) return;
    loadingCharacter.current = true;
    setReady(false);
    try {
      await loadCharacter(id);
      if (action === 'new') {
        choose(newGame(id, Date.now() % 2 ** 31, locale));
      } else {
        const saved = saves[id];
        if (saved?.state && hasKnownEvents(saved.state)) {
          choose(withGameLocale(saved.state, locale), saved);
        } else {
          setAvailable(false);
          setSaves((prev) => ({
            ...prev,
            [id]: { state: undefined, available: false },
          }));
        }
      }
    } catch (error) {
      setLoadError(error as Error);
    } finally {
      loadingCharacter.current = false;
      setReady(true);
    }
  };
  const startTalk = (npc: string) => {
    conversation.current = {
      npc,
      menu: overlay?.kind === 'place' ? overlay : conversation.current?.menu,
    };
    try {
      const next = talk(latest.current!, npc);
      openOverlay();
      apply(next);
      if (!next.pendingEvent) setOverlay({ kind: 'dialogue', id: npc });
    } catch {
      openOverlay({ kind: 'dialogue', id: npc });
      setOutcomeText({
        zhCN: '今天太晚了，明天再聊吧。',
        en: 'It is too late today. Let’s talk tomorrow.',
      });
    }
  };
  const visit = (id: PlaceId) => {
    const next = enter(latest.current!, id);
    apply(next, 'observe');
    if (id === 'home') {
      setInterior(true);
      setOverlay(undefined);
    } else if (!next.pendingEvent) openOverlay({ kind: 'place', id });
  };
  const walkTo = (location: PlaceId) => {
    setOverlay(undefined);
    setDestination((prev) => ({ location, request: (prev?.request ?? 0) + 1 }));
  };
  const interact = (target: Interaction) => {
    playSound('menu');
    switch (target.kind) {
      case 'surprise':
        apply(approachSurprise(latest.current!, target.id), 'observe');
        break;
      case 'place':
        visit(target.id);
        break;
      case 'npc':
        startTalk(target.id);
        break;
      case 'plot':
        apply(enter(latest.current!, 'allotment'), 'observe');
        openOverlay({ kind: 'plot', id: target.id });
        break;
      case 'home':
        if (target.id === 'exit') {
          setInterior(false);
          setState((s) => s && { ...s, day: { ...s.day, place: undefined } });
        } else if (target.id === 'bed') setConfirmation('sleep');
        else if (target.id === 'desk')
          openOverlay({ kind: 'place', id: 'home' });
        else openOverlay({ kind: target.id });
    }
  };
  const beginRoutine = () => {
    const which = confirmation!;
    setConfirmation(undefined);
    setOverlay(undefined);
    setFading(true);
    fadeTimer.current = setTimeout(() => {
      setInterior(true);
      setFading(false);
      setRoutine(which);
    }, 280);
  };
  const title = () => {
    if (!overlay) return '';
    if (overlay.kind === 'place')
      return localText(places.find((p) => p.id === overlay.id)!.name, locale);
    if (overlay.kind === 'plot')
      return t('game.plot').replace('{count}', String(overlay.id + 1));
    if (overlay.kind === 'detail') return t('game.progressChanges');
    if (overlay.kind === 'destinations') return t('game.destinations');
    if (overlay.kind === 'collection') return t('game.collection');
    if (overlay.kind === 'dialogue')
      return localText(npcs.find((n) => n.id === overlay.id)!.name, locale);
    return t(
      overlay.kind === 'bag'
        ? 'game.bag'
        : overlay.kind === 'kitchen'
          ? 'game.kitchen'
          : overlay.kind === 'mailbox'
            ? 'game.mailbox'
            : overlay.kind === 'fishing'
              ? 'game.fish'
              : 'game.talk',
    );
  };
  const close = () => {
    const menu =
      overlay?.kind === 'dialogue' ? conversation.current?.menu : undefined;
    conversation.current = undefined;
    openOverlay(menu);
  };
  const destinations = (drawer: boolean) => (
    <nav
      className={`${styles.destinations} ${drawer ? '' : styles.desktopDestinations}`}
      aria-label={t('game.destinations')}
      inert={!drawer && paused}
    >
      {[...places]
        .sort(
          (a, b) =>
            Number(isPlaceOpen(current!, b)) - Number(isPlaceOpen(current!, a)),
        )
        .map((p) => (
          <button
            key={p.id}
            aria-current={current!.day.place === p.id ? 'location' : undefined}
            disabled={!drawer && paused}
            className={
              !isPlaceOpen(current!, p) ? styles.closedPlace : undefined
            }
            aria-label={
              !isPlaceOpen(current!, p)
                ? `${localText(p.name, locale)} · ${t('game.closedLabel')}`
                : undefined
            }
            onClick={() => walkTo(p.id)}
          >
            {localText(p.name, locale)}
            {!isPlaceOpen(current!, p) && (
              <span className={styles.closedMarker} aria-hidden="true">
                <GameIcon name="lock" />
              </span>
            )}
          </button>
        ))}
    </nav>
  );
  if (loadError) throw loadError;
  return (
    <div
      className={styles.game}
      onPointerDownCapture={unlockSound}
      onKeyDownCapture={unlockSound}
    >
      {!ready ? (
        <WelcomeLoading />
      ) : !current ? (
        <CharacterSelect saves={saves} onSelect={selectCharacter} />
      ) : (
        <>
          {isOver(current) && !summary ? (
            <Ending state={current} onChange={choose} />
          ) : (
            <>
              <StatusBar state={current}>
                <button
                  className={styles.music}
                  aria-label={t(muted ? 'game.muted' : 'game.unmuted')}
                  title={t(muted ? 'game.muted' : 'game.unmuted')}
                  aria-pressed={!muted}
                  onClick={() => {
                    setMuted(!muted);
                    saveMuted(!muted);
                  }}
                >
                  <span className={styles.srOnly}>
                    {t(muted ? 'game.muted' : 'game.unmuted')}
                  </span>
                  <span className={styles.desktopOnly} aria-hidden="true">
                    {t(muted ? 'game.muted' : 'game.unmuted')}
                  </span>
                  <span className={styles.mobileOnly} aria-hidden="true">
                    <GameIcon name={muted ? 'muted' : 'sound'} />
                  </span>
                </button>
                <button
                  className={styles.music}
                  disabled={paused}
                  aria-label={t('game.fastShort')}
                  title={t('game.fastForward')}
                  onClick={() => setConfirmation('fast')}
                >
                  <span className={styles.srOnly}>{t('game.fastForward')}</span>
                  <span className={styles.desktopOnly} aria-hidden="true">
                    {t('game.fastShort')}
                  </span>
                  <span className={styles.mobileOnly} aria-hidden="true">
                    <GameIcon name="fast" />
                  </span>
                </button>
                <button
                  className={styles.music}
                  disabled={paused}
                  aria-label={t('game.endDayShort')}
                  title={t('game.endDay')}
                  onClick={() => setConfirmation('sleep')}
                >
                  <span className={styles.srOnly}>{t('game.endDay')}</span>
                  <span className={styles.desktopOnly} aria-hidden="true">
                    {t('game.endDayShort')}
                  </span>
                  <span className={styles.mobileOnly} aria-hidden="true">
                    <GameIcon name="moon" />
                  </span>
                </button>
              </StatusBar>
              <div className={styles.townLayout}>
                <div className={`${styles.map} ${fading ? styles.fading : ''}`}>
                  {current.trip || returned ? (
                    <TravelCard
                      state={current}
                      returned={returned}
                      onContinue={() => {
                        if (returned) setReturned(undefined);
                        else apply(fastForward(current), 'fast');
                      }}
                    />
                  ) : (
                    <InteriorContext value={interior}>
                      <TownCanvas
                        key={`${current.characterId}:${current.seed}`}
                        state={current}
                        feedback={feedback}
                        approachNpc={approachNpc}
                        focusNpc={
                          event?.heart?.npc ??
                          (overlay?.kind === 'dialogue'
                            ? overlay.id
                            : undefined)
                        }
                        locale={locale}
                        paused={paused}
                        interior={interior}
                        onReady={() => setSceneReady(true)}
                        onInteract={interact}
                        onNearby={setInteraction}
                        destination={destination}
                        interactRequest={interactRequest}
                        onStep={() => playSound('step')}
                      />
                    </InteriorContext>
                  )}
                  {!sceneReady && !current.trip && !returned && (
                    <p className={styles.loading} role="status">
                      {t('game.loading')}
                    </p>
                  )}
                  {!current.trip && !returned && (
                    <div className={styles.interactionBar}>
                      {!!interaction && !paused && (
                        <InteractButton
                          interaction={interaction}
                          onInteract={() => setInteractRequest((n) => n + 1)}
                        />
                      )}
                    </div>
                  )}
                  {!!mailbox(current).length && (
                    <span
                      className={styles.mailBadge}
                      aria-label={withCount(
                        t('game.mailCount'),
                        'count',
                        mailbox(current).length,
                      )}
                    >
                      <GameIcon name="mail" /> {mailbox(current).length}
                    </span>
                  )}
                </div>
                {destinations(false)}
              </div>
              <ProgressBars
                state={current}
                onOpen={(id) => {
                  if (!paused) openOverlay({ kind: 'detail', id });
                }}
              />
              <ControlHint />
              <div className={styles.toolbar}>
                <button
                  className={`${styles.secondary} ${styles.destinationTrigger}`}
                  disabled={paused}
                  aria-haspopup="dialog"
                  aria-expanded={overlay?.kind === 'destinations'}
                  aria-controls="game-destinations"
                  onClick={() => openOverlay({ kind: 'destinations' })}
                >
                  {t('game.places')}
                </button>
                <button
                  className={styles.secondary}
                  disabled={paused}
                  onClick={() => openOverlay({ kind: 'bag' })}
                >
                  {t('game.bag')}
                  <span className={styles.desktopOnly}>
                    {'\u00a0/ '}
                    {t('game.friends')}
                  </span>
                </button>
                <button
                  className={styles.secondary}
                  disabled={paused}
                  onClick={() => openOverlay({ kind: 'collection' })}
                >
                  {t('game.collection')}
                </button>
                <button
                  className={styles.secondary}
                  disabled={paused}
                  onClick={() => choose(undefined)}
                >
                  {t('game.changeCharacter')}
                </button>
              </div>
            </>
          )}
          {(sceneReady || current.trip || returned) &&
            (eventResult ? (
              <Modal
                key="event-result"
                title={t('game.eventResult')}
                onClose={closeEventResult}
              >
                <OutcomeText text={eventResult} />
                <button className={styles.button} onClick={closeEventResult}>
                  {t('game.continuePlaying')}
                </button>
              </Modal>
            ) : summary ? (
              <Modal key="summary" title={t('game.quarterSummary')}>
                <QuarterSummary
                  diary={summary.diary}
                  startStats={summary.startStats}
                  before={withGameLocale(summary.before, locale)}
                  after={withGameLocale(summary.after, locale)}
                  onContinue={() => setSummary(undefined)}
                  onVisa={() => {
                    setSummary(undefined);
                    setMorning(false);
                    walkTo('visa');
                  }}
                  onVisit={() => {
                    setSummary(undefined);
                    setMorning(false);
                    walkTo('council');
                  }}
                />
              </Modal>
            ) : morning ? (
              <Modal
                key={`morning-${current.dayNumber}`}
                title={t('game.morning')}
              >
                <MorningCard
                  state={current}
                  onContinue={() => setMorning(false)}
                  onVisit={() => {
                    setMorning(false);
                    walkTo('visa');
                  }}
                />
              </Modal>
            ) : event ? (
              <Modal
                key={`event-${event.id}`}
                title={localText(event.title, locale)}
                dialogue={!!(event.speaker || event.heart)}
              >
                {event.speaker || event.heart ? (
                  <Dialogue
                    state={current}
                    npc={event.speaker ?? event.heart!.npc}
                    heartChange={
                      feedback?.hearts?.[event.speaker ?? event.heart!.npc]
                    }
                    onChange={(next) => apply(next, 'resolve')}
                    onClose={close}
                  />
                ) : (
                  <EventCard
                    state={current}
                    onChange={(next) => apply(next, 'resolve')}
                  />
                )}{' '}
                {routine === 'fast' && (
                  <p className={styles.continueFast}>
                    {t('game.continueFast')}
                  </p>
                )}
              </Modal>
            ) : confirmation ? (
              <Modal
                key="confirm"
                title={t(
                  confirmation === 'sleep' ? 'game.sleep' : 'game.fastForward',
                )}
                onClose={() => setConfirmation(undefined)}
              >
                <p>
                  {t(
                    confirmation === 'sleep'
                      ? 'game.sleepConfirm'
                      : 'game.fastConfirm',
                  )}
                </p>
                {confirmation === 'fast' && visaExpiresThisSeason(current) && (
                  <>
                    <p role="status" className={styles.urgent}>
                      {visaStatus(current).validTo
                        ? t('game.fastVisaWarning').replace(
                            '{date}',
                            visaStatus(current).validTo!,
                          )
                        : t('game.fastVisaWarningNone')}
                    </p>
                    <button
                      className={styles.secondary}
                      onClick={() => {
                        setConfirmation(undefined);
                        walkTo('visa');
                      }}
                    >
                      {t('game.visaVisit')}
                    </button>
                  </>
                )}
                <div className={styles.buttons}>
                  <button className={styles.button} onClick={beginRoutine}>
                    {t('game.confirm')}
                  </button>
                  <button
                    className={styles.secondary}
                    onClick={() => setConfirmation(undefined)}
                  >
                    {t('game.cancel')}
                  </button>
                </div>
              </Modal>
            ) : overlay ? (
              <Modal
                key={overlay.kind + ('id' in overlay ? overlay.id : '')}
                title={title()}
                onClose={close}
                dialogue={overlay.kind === 'dialogue'}
                sheet={overlay.kind === 'destinations'}
                wide={overlay.kind === 'place' && overlay.id === 'council'}
              >
                {overlay.kind === 'destinations' ? (
                  destinations(true)
                ) : overlay.kind === 'place' ? (
                  <LocationMenu
                    state={current}
                    location={overlay.id}
                    onChange={(next) => {
                      apply(next);
                      if (next.pendingEvent) {
                        const action = next.log
                          .slice(current.log.length)
                          .find((entry) => entry.kind === 'action');
                        if (
                          action?.id === 'exam' &&
                          next.pendingEvent !== 'system-exam-failed'
                        )
                          setImmediateResult(next.outcome?.text);
                        if (
                          current.day.festival === 'lunar-new-year' &&
                          (action?.id === 'festival' ||
                            action?.id === 'lunar-dumplings')
                        )
                          setFestivalResult(next.outcome?.text);
                      }
                      // Board notices and show results come back as text of
                      // their own; keep the menu open so they can be read.
                      const ownText = !activities(current, overlay.id).some(
                        (a) => a.label.zhCN === next.outcome?.text?.zhCN,
                      );
                      if (!next.pendingEvent && !ownText) setOverlay(undefined);
                    }}
                    onTalk={(id) => {
                      conversation.current = { npc: id, menu: overlay };
                      if (interior) {
                        openOverlay();
                        setApproachNpc((prev) => ({
                          id,
                          request: (prev?.request ?? 0) + 1,
                        }));
                      } else startTalk(id);
                    }}
                  >
                    {(overlay.id === 'shop' || overlay.id === 'green') &&
                      shop(current, overlay.id).length > 0 && (
                        <Shop
                          state={current}
                          place={overlay.id}
                          onChange={apply}
                        />
                      )}
                    {overlay.id === 'pond' && (
                      <button
                        className={styles.button}
                        onClick={() => openOverlay({ kind: 'fishing' })}
                      >
                        {t('game.fish')}
                      </button>
                    )}
                    {overlay.id === 'home' && (
                      <div className={styles.buttons}>
                        <button
                          className={styles.secondary}
                          onClick={() => openOverlay({ kind: 'kitchen' })}
                        >
                          {t('game.kitchen')}
                        </button>
                        <button
                          className={styles.secondary}
                          onClick={() => openOverlay({ kind: 'mailbox' })}
                        >
                          {t('game.mailbox')}
                        </button>
                        <button
                          className={styles.secondary}
                          onClick={() => setConfirmation('sleep')}
                        >
                          {t('game.sleep')}
                        </button>
                      </div>
                    )}
                  </LocationMenu>
                ) : overlay.kind === 'dialogue' ? (
                  <Dialogue
                    state={current}
                    npc={overlay.id}
                    feedbackText={outcomeText}
                    heartChange={feedback?.hearts?.[overlay.id]}
                    onChange={apply}
                    onClose={close}
                  />
                ) : overlay.kind === 'bag' || overlay.kind === 'collection' ? (
                  <Inventory
                    state={current}
                    initialTab={
                      overlay.kind === 'collection' ? 'collection' : 'bag'
                    }
                    onChange={apply}
                    onKitchen={() => {
                      if (interior) openOverlay({ kind: 'kitchen' });
                      else walkTo('home');
                    }}
                  />
                ) : overlay.kind === 'kitchen' ? (
                  <Kitchen state={current} onChange={apply} />
                ) : overlay.kind === 'mailbox' ? (
                  <Mailbox
                    state={current}
                    onChange={(next) => apply(next, 'observe')}
                  />
                ) : overlay.kind === 'plot' ? (
                  <PlotMenu
                    state={current}
                    plot={overlay.id}
                    onChange={apply}
                  />
                ) : overlay.kind === 'fishing' ? (
                  <Fishing state={current} onChange={apply} />
                ) : (
                  <ProgressDetail
                    state={current}
                    id={overlay.id}
                    onVisit={() => walkTo('council')}
                  />
                )}
                {overlay.kind !== 'dialogue' && (
                  <OutcomeText text={outcomeText} />
                )}
              </Modal>
            ) : null)}
        </>
      )}
      <p className={styles.saveStatus} role="status">
        {ready && t(available ? 'game.saved' : 'game.storageUnavailable')}
      </p>
      {ready && <p className={styles.disclaimer}>{t('game.disclaimer')}</p>}
    </div>
  );
}
