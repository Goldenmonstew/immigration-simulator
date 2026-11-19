import type * as Phaser from 'phaser';
import type { Cell } from './pathfinding';
import type { SceneView } from './scene';
import { drawBonfire, drawPrecipitation } from './scene-art';

type Graphics = Phaser.GameObjects.Graphics;

export function paintLight(
  scene: Phaser.Scene,
  view: SceneView,
  sky: Graphics | undefined,
  rain: Graphics | undefined,
  lampLights: Graphics[],
  windows: Graphics | undefined,
) {
  if (!sky) return;
  const minute = view.state.day.minute,
    weather = view.state.day.weather;
  sky.clear();
  const w = scene.scale.width / scene.cameras.main.zoom,
    h = scene.scale.height / scene.cameras.main.zoom;
  // Scroll-factor zero still uses the camera's centred zoom transform.
  sky.setPosition((scene.scale.width - w) / 2, (scene.scale.height - h) / 2);
  rain?.setPosition((scene.scale.width - w) / 2, (scene.scale.height - h) / 2);
  if (view.interior) {
    sky.setScrollFactor(1).setPosition(0, 0);
    if (view.state.flags.includes('brighter-home')) {
      // Window and optional desk lamp, in home-map coordinates.
      const lights = [{ x: 40, y: 48 }];
      if (view.state.flags.includes('furnished-desk-lamp'))
        lights.push({ x: 136, y: 64 });
      for (const { x, y } of lights)
        for (const radius of [48, 36, 24])
          sky
            .fillStyle(0xffd88b, minute >= 1080 ? 0.02 : 0.035)
            .fillCircle(x, y, radius);
    }
  } else {
    sky.setScrollFactor(0);
    const color =
      minute >= 1260 ? 0x162750 : minute >= 1080 ? 0xdc9651 : 0x2c415b;
    const alpha =
      (minute >= 1260 ? 0.48 : minute >= 1080 ? 0.18 : 0) +
      (weather === 'rain' ? 0.13 : weather === 'cloudy' ? 0.07 : 0);
    sky.fillStyle(color, alpha).fillRect(0, 0, w, h);
  }
  lampLights.forEach((l) => l.setVisible(minute >= 1080));
  windows?.setVisible(minute >= 1080);
}

export function paintWeather(
  scene: Phaser.Scene,
  view: SceneView,
  rain: Graphics | undefined,
  time: number,
) {
  if (!rain) return;
  rain.clear();
  if (view.interior) return;
  const weather = view.state.day.weather;
  if (weather !== 'rain' && weather !== 'snow') return;
  const w = scene.scale.width / scene.cameras.main.zoom,
    h = scene.scale.height / scene.cameras.main.zoom;
  drawPrecipitation(
    rain,
    weather,
    time,
    w,
    h,
    scene.scale.width < 600 ? 36 : 70,
  );
}

export function festivalEffects(
  g: Graphics | undefined,
  minute: number,
  time: number,
) {
  if (!g) return;
  g.clear();
  if (minute < 1080) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  drawBonfire(g, time, reduced);
}

export function updateWater(
  water: Graphics | undefined,
  waterTiles: Cell[],
  waterPhase: number,
  time: number,
) {
  if (!water) return waterPhase;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  water.setVisible(!reduced);
  if (reduced) return waterPhase;
  const phase = Math.floor(time / 1800) % 3;
  if (phase === waterPhase) return waterPhase;
  water.clear();
  // Sparse integer-pixel glints sit below bridges, scenery and actors.
  waterTiles.forEach(({ x, y }, index) => {
    const step = (phase + index) % 3;
    water.fillStyle(0xc4ded2, step === 1 ? 0.28 : 0.16);
    water.fillRect(x + 4 + step, y + 6, 5, 1);
    water.fillRect(x + 3 + step, y + 7, 2, 1);
  });
  return phase;
}
