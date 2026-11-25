import type * as Phaser from 'phaser';
import type { PlaceId } from '@uk-immigration/game/core';
import { t, type TranslationKey } from '../../i18n';
import { distance, type Cell } from './pathfinding';
import type { Interaction, SceneFeedback, SceneView } from './scene';
import type { Spot } from './scene-map';
import type { GameKinds, GameModule } from './types';
import styles from '../uk/game/town-canvas.module.css';

type Camera = {
  zoom: number;
  getWorldPoint: (x: number, y: number) => { x: number; y: number };
};

export function textPosition(camera: Camera, x: number, y: number) {
  // These cameras do not rotate. Invert the rendered matrix via the public API;
  // worldView rounds its origin and can drift at fractional zoom.
  const origin = camera.getWorldPoint(0, 0);
  return { x: (x - origin.x) * camera.zoom, y: (y - origin.y) * camera.zoom };
}

/** Screen-sized DOM text with a world-space anchor, also usable by tweens. */
export class SceneText {
  readonly element: HTMLSpanElement;
  alpha = 1;
  visible = true;

  constructor(
    private layer: HTMLDivElement,
    public x: number,
    public y: number,
    text: string,
    private kind: 'label' | 'homeLabel' | 'badge' | 'feedback' | 'bubble',
  ) {
    this.element = layer.ownerDocument.createElement('span');
    this.element.className = `${styles.sceneText} ${styles[kind]}`;
    this.setText(text);
    layer.appendChild(this.element);
  }

  setText(text: string) {
    this.element.textContent = text;
    return this;
  }

  setVisible(visible: boolean) {
    this.visible = visible;
    return this;
  }

  private position(camera: Camera) {
    let { x, y } = textPosition(camera, this.x, this.y);
    let visible = this.visible;
    if (this.kind === 'label' || this.kind === 'homeLabel') {
      const width = this.element.offsetWidth;
      const height = this.element.offsetHeight;
      const top = y - (this.kind === 'homeLabel' ? height : 0);
      // Only pin labels which intersect the viewport; distant anchors stay offscreen.
      visible &&=
        x + width / 2 > 0 &&
        x - width / 2 < this.layer.clientWidth &&
        top + height > 0 &&
        top < this.layer.clientHeight;
      x = Math.max(
        width / 2 + 6,
        Math.min(x, this.layer.clientWidth - width / 2 - 6),
      );
      const clampedTop = Math.max(
        6,
        Math.min(top, this.layer.clientHeight - height - 6),
      );
      y = clampedTop + (this.kind === 'homeLabel' ? height : 0);
    }
    return { x, y, visible };
  }

  avoidLabels(camera: Camera, spots: readonly Spot[], rise: number) {
    if (this.kind !== 'feedback') return;
    const gap = 6;
    const { x, y } = this.position(camera);
    const width = this.element.offsetWidth;
    const sweptHeight = this.element.offsetHeight + rise * camera.zoom;
    const labels = spots.flatMap(({ label }) => {
      if (!label) return [];
      const position = label.position(camera);
      if (
        !position.visible ||
        Math.abs(position.x - x) >= (label.element.offsetWidth + width) / 2
      )
        return [];
      const height = label.element.offsetHeight;
      const top = position.y - (label.kind === 'homeLabel' ? height : 0);
      return [{ top, bottom: top + height }];
    });
    const clearsLabels = (bottom: number) =>
      labels.every(
        (label) =>
          bottom <= label.top - gap ||
          bottom >= label.bottom + gap + sweptHeight,
      );
    if (clearsLabels(y)) return;

    // Prefer raising the float, but leave room for the whole tween on screen.
    const above = labels
      .map(({ top }) => top - gap)
      .filter((bottom) => bottom < y && bottom - sweptHeight >= gap)
      .sort((a, b) => b - a)
      .find(clearsLabels);
    const bottom =
      above ??
      labels
        .map(({ bottom }) => bottom + gap + sweptHeight)
        .filter(
          (bottom) => bottom > y && bottom <= this.layer.clientHeight - gap,
        )
        .sort((a, b) => a - b)
        .find(clearsLabels);
    if (bottom !== undefined) this.y += (bottom - y) / camera.zoom;
  }

  render(camera: Camera) {
    const { x, y, visible } = this.position(camera);
    this.element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, ${this.kind === 'label' ? '0' : '-100%'})`;
    this.element.style.opacity = String(this.alpha);
    this.element.style.visibility = visible ? 'visible' : 'hidden';
  }

  destroy() {
    this.element.remove();
  }
}

/** `placeLabel` can extend a place name with what is happening there. */
export function syncSceneLabels<K extends GameKinds>(
  game: GameModule<K>,
  view: SceneView<K>,
  spots: Spot[],
  postBadge: SceneText | undefined,
  placeLabel: (place: PlaceId, name: string) => string,
) {
  const { mailbox } = game;
  for (const spot of spots) {
    if (spot.interaction.kind === 'place') {
      const p = game.places.find(
        (p) => p.id === (spot.interaction as { id: PlaceId }).id,
      )!;
      const name = view.locale === 'en' ? p.name.en : p.name.zhCN;
      spot.label!.setText(placeLabel(p.id, name));
    } else if (spot.interaction.kind === 'home') {
      spot.label!.setText(
        t(
          spot.interaction.id === 'exit'
            ? 'game.exitHome'
            : `game.${spot.interaction.id}`,
          view.locale,
        ),
      );
    }
  }
  postBadge
    ?.setText(
      mailbox(view.state).length ? String(mailbox(view.state).length) : '',
    )
    .setVisible(mailbox(view.state).length > 0);
}

export function renderSceneLabels(
  camera: Phaser.Cameras.Scene2D.Camera,
  input: Phaser.Input.InputPlugin,
  spots: Spot[],
  cell: Cell,
  nearby: Interaction | undefined,
) {
  const pointer = input.activePointer;
  const hover = input.manager.isOver
    ? camera.getWorldPoint(pointer.x, pointer.y)
    : undefined;
  for (const spot of spots) {
    if (!spot.label) continue;
    spot.label.setVisible(true);
    spot.label.element.dataset.highlighted = String(
      distance(spot, cell) <= 5 ||
        !!(hover && spot.bounds.contains(hover.x, hover.y)),
    );
    spot.label.element.dataset.nearby = String(
      nearby?.kind === spot.interaction.kind &&
        nearby?.id === spot.interaction.id,
    );
  }
}

export function showSceneFeedback<K extends GameKinds>(
  game: GameModule<K>,
  scene: Phaser.Scene,
  feedback: SceneFeedback,
  locale: SceneView<K>['locale'],
  textLayer: HTMLDivElement,
  player: Phaser.GameObjects.Sprite | undefined,
  residents: ReadonlyMap<string, { sprite: Phaser.GameObjects.Sprite }>,
  float: (
    object: SceneText | Phaser.GameObjects.Sprite,
    duration: number,
    rise: number,
  ) => void,
) {
  if (!player) return;
  const out = feedback.outcome;
  if (!out) return;
  const parts: string[] = [];
  if (feedback.promotion) parts.push(t('game.promotion', locale));
  for (const change of Object.values(feedback.hearts ?? {}))
    parts.push(`♥ ${change.before} → ${change.after}`);
  for (const [key, value] of Object.entries(out.statDeltas ?? {}))
    if (value)
      parts.push(
        `${value > 0 ? '+' : ''}${value} ${t(`game.${key}` as TranslationKey, locale)}`,
      );
  for (const [id, n] of Object.entries(out.items ?? {}))
    if (n) {
      const item = game.items.find((i) => i.id === id);
      parts.push(
        `${n > 0 ? '+' : ''}${n} ${item ? (locale === 'en' ? item.name.en : item.name.zhCN) : t('game.itemFallback', locale)}`,
      );
    }
  if (parts.length) {
    const text = new SceneText(
      textLayer,
      player.x,
      player.y - 20,
      parts.join('\n'),
      'feedback',
    );
    float(text, 2200, 24);
  }
  if (out.kind === 'talk' || out.kind === 'gift') {
    const actor = residents.get(out.npc ?? '')?.sprite ?? player;
    const person = game.npcs.find((n) => n.id === out.npc);
    const item = Object.keys(out.items ?? {})[0];
    const expression =
      out.kind === 'talk'
        ? '♪'
        : person?.gifts.loved.includes(item)
          ? '♥ ♥'
          : person?.gifts.liked.includes(item)
            ? '♥'
            : person?.gifts.disliked.includes(item)
              ? '…'
              : '☺';
    const bubble = new SceneText(
      textLayer,
      actor.x,
      actor.y - 25,
      expression,
      'bubble',
    );
    float(bubble, 1800, 8);
  }
  if (
    out.kind === 'harvest' ||
    (out.kind === 'catch' && out.items) ||
    feedback.promotion
  ) {
    const spark = scene.add
      .sprite(player.x, player.y - 8, 'spark')
      .setDepth(1800);
    float(spark, 500, 0);
  }
}
