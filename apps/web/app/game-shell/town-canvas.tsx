'use client';

import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { useTranslation } from '../../i18n/locale';
import type { PlaceId } from '@uk-immigration/game/core';
import type { Interaction, SceneFeedback, TownScene } from './scene';
import type { GameKinds, State } from './types';
import styles from '../uk/game/town-canvas.module.css';

export interface TownCanvasProps<K extends GameKinds = GameKinds> {
  locale: 'zh-CN' | 'en';
  state: State<K>;
  interior: boolean;
  paused: boolean;
  feedback?: SceneFeedback;
  focusNpc?: string;
  approachNpc?: { id: string; request: number };
  onReady: () => void;
  onInteract: (interaction: Interaction) => void;
  onNearby: (interaction?: Interaction) => void;
  onStep: () => void;
  interactRequest: number;
  destination?: { location: PlaceId; request: number };
}

function observeTownSize(
  element: HTMLDivElement,
  createGame: (type: number) => Phaser.Game,
) {
  let game: Phaser.Game | undefined;
  let started = false;
  const resize = () => {
    const { clientWidth: width, clientHeight: height } = element;
    if (width <= 0 || height <= 0) return;
    if (game) {
      game.scale.resize(width, height);
    } else if (!started) {
      started = true;
      try {
        game = createGame(Phaser.AUTO);
      } catch {
        game = createGame(Phaser.CANVAS);
      }
    }
  };
  const observer = new ResizeObserver(resize);
  observer.observe(element);
  resize();
  const frame = requestAnimationFrame(resize);
  return () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
    started = true;
    game?.destroy(true);
    game = undefined;
  };
}

type SceneClass<K extends GameKinds> = new (
  view: TownCanvasProps<K>,
  onInteract: (interaction: Interaction) => void,
  onNearby: (interaction?: Interaction) => void,
  onReady: () => void,
  onStep: () => void,
  textLayer: HTMLDivElement,
) => TownScene<K>;

/** The Phaser canvas for one country's town scene. */
export function createTownCanvas<K extends GameKinds>(Scene: SceneClass<K>) {
  return function TownCanvas(props: TownCanvasProps<K>) {
    const { t } = useTranslation();
    const host = useRef<HTMLDivElement>(null);
    const scene = useRef<TownScene<K> | undefined>(undefined);
    const latest = useRef(props);
    const textLayer = useRef<HTMLDivElement>(null);
    latest.current = props;

    useEffect(() => {
      const element = host.current!;
      const stop = observeTownSize(element, (type) => {
        const town = new Scene(
          latest.current,
          (interaction) => latest.current.onInteract(interaction),
          (interaction) => latest.current.onNearby(interaction),
          () => latest.current.onReady(),
          () => latest.current.onStep(),
          textLayer.current!,
        );
        scene.current = town;
        if (latest.current.destination)
          town.walkToLocation(latest.current.destination.location);
        return new Phaser.Game({
          type,
          parent: element,
          backgroundColor: latest.current.interior ? '#2a1f18' : '#a8c580',
          pixelArt: true,
          roundPixels: true,
          input: { keyboard: { target: element } },
          scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
          scene: town,
          banner: false,
          audio: { noAudio: true },
        });
      });
      return () => {
        stop();
        scene.current = undefined;
      };
    }, [props.state.characterId]);

    useEffect(() => {
      scene.current?.sync(props);
    }, [
      props.locale,
      props.state,
      props.paused,
      props.interior,
      props.feedback,
      props.focusNpc,
    ]);

    useEffect(() => {
      if (props.approachNpc) scene.current?.walkToNpc(props.approachNpc.id);
    }, [props.approachNpc]);

    useEffect(() => {
      if (props.interactRequest) scene.current?.interact();
    }, [props.interactRequest]);

    useEffect(() => {
      if (props.destination) {
        host.current?.focus({ preventScroll: true });
        scene.current?.walkToLocation(props.destination.location);
      }
    }, [props.destination]);

    return (
      <div
        ref={host}
        className={`${styles.canvas} ${props.interior ? styles.interior : ''}`}
        role="application"
        aria-label={t('game.town')}
        tabIndex={props.paused ? -1 : 0}
        onPointerDown={() => host.current?.focus({ preventScroll: true })}
        onBlur={() => scene.current?.halt()}
      >
        <div ref={textLayer} className={styles.textLayer} aria-hidden="true" />
      </div>
    );
  };
}
