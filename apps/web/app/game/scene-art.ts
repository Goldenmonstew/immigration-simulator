import type * as Phaser from 'phaser';
import type { MapSurprise } from '@uk-immigration/game';

// Pure Phaser drawing for town decorations; callers own the graphics objects.
type Graphics = Phaser.GameObjects.Graphics;

/** Festival stalls and bunting on the village green. */
export function drawFestivalStalls(g: Graphics, festival: string) {
  const colors =
    festival === 'christmas-market'
      ? [0xd44b43, 0x418660, 0xffd778]
      : [0xd85d4a, 0xf4c86c, 0x62a6ac];
  for (const x of [500, 572]) {
    g.fillStyle(0x865d3b).fillRect(x - 13, 493, 26, 16);
    g.fillStyle(colors[0]).fillRect(x - 16, 480, 32, 10);
    g.fillStyle(0xffedc2)
      .fillRect(x - 12, 481, 5, 9)
      .fillRect(x, 481, 5, 9)
      .fillRect(x + 11, 481, 4, 9);
    g.fillStyle(0xd69c58)
      .fillRect(x - 15, 507, 3, 12)
      .fillRect(x + 12, 507, 3, 12);
  }
  g.lineStyle(1, 0x604f3b).lineBetween(486, 464, 600, 464);
  for (let i = 0; i < 10; i++) {
    const x = 489 + i * 11;
    g.fillStyle(colors[i % colors.length]).fillTriangle(
      x,
      465,
      x + 8,
      465,
      x + 4,
      474,
    );
    if (festival === 'lunar-new-year') {
      g.fillStyle(0xc73e35).fillRoundedRect(x, 475, 7, 9, 2);
      g.lineStyle(1, 0xffd26d).lineBetween(x + 3, 484, x + 3, 489);
    }
    if (festival === 'christmas-market') {
      g.fillStyle(colors[i % 3], 0.15).fillCircle(x + 4, 469, 8);
      g.fillStyle(0xfff3b3).fillCircle(x + 4, 469, 2);
    }
  }
  if (festival === 'bonfire-night')
    g.lineStyle(4, 0x604333)
      .lineBetween(558, 545, 575, 552)
      .lineBetween(558, 552, 575, 545);
}

/** The long lunch table with plates, south of the festival stalls. */
export function drawLunchTable(table: Graphics) {
  table.fillStyle(0xffedc2).fillRect(512, 545, 48, 8);
  for (const x of [518, 535, 553]) {
    table.fillStyle(0xfffcf1).fillCircle(x, 549, 3);
    table.lineStyle(1, 0xb49d7c).lineBetween(x + 5, 547, x + 5, 551);
  }
}

/** The two-tile community flowerbed at (x, y) for growth stage 0–3. */
export function drawFlowerbed(
  g: Graphics,
  x: number,
  y: number,
  stage: number,
  flags: string[],
) {
  g.fillStyle(stage ? 0x826342 : 0x99aa75).fillRect(x, y + 2, 32, 12);
  if (stage) {
    for (const dx of [1, 30]) {
      g.fillStyle(0xb79159).fillRect(x + dx, y, 2, 15);
      g.lineStyle(1, 0xe6cf9b).lineBetween(x + 2, y + 3, x + 30, y + 3);
    }
    if (stage >= 2) {
      for (const dx of [6, 14, 22]) {
        g.fillStyle(0x496d3c).fillRect(x + dx, y + 5, 2, 7);
        g.fillStyle(0x719355).fillRect(x + dx - 2, y + 6, 6, 2);
        if (stage === 3) g.fillStyle(0x719355).fillRect(x + dx, y + 3, 3, 2);
      }
    } else if (flags.includes('flowerbed-prepared')) {
      g.fillStyle(0x57483a).fillRect(x + 5, y + 6, 20, 6);
      g.fillStyle(0x8eaf68)
        .fillRect(x + 7, y + 5, 3, 3)
        .fillRect(x + 15, y + 5, 3, 3);
    }
    if (stage === 3 || flags.includes('flowerbed-tended')) {
      const signY = y + (stage === 3 ? -6 : 1);
      g.fillStyle(0x5b4731).fillRect(x + 28, signY + 4, 2, 11);
      g.fillStyle(0xf0dbad).fillRect(x + 22, signY, 13, 7);
      g.lineStyle(1, 0x6b583e).lineBetween(
        x + 24,
        signY + 3,
        x + 32,
        signY + 3,
      );
    }
  }
}

/** May Day props: a preparation table or the maypole, drawn around (0, 0). */
export function drawMayDay(
  m: Graphics,
  phase: 'preparation' | 'festival',
  preparation?: string,
) {
  const colors = [0xb85a54, 0xd6b95c, 0x6e9e9b];
  if (phase === 'preparation') {
    m.fillStyle(0x765538)
      .fillRect(-19, -6, 38, 5)
      .fillRect(-15, -1, 3, 6)
      .fillRect(12, -1, 3, 6);
    if (preparation === 'ribbons')
      colors.forEach((color, i) =>
        m.fillStyle(color).fillRect(-12 + i * 7, -13, 4, 10),
      );
    else if (preparation === 'signs')
      for (const dx of [-10, 7]) {
        m.fillStyle(0xf1d99d).fillRect(dx - 5, -15, 11, 8);
        m.fillStyle(0x6f7d49).fillTriangle(
          dx - 1,
          -13,
          dx + 4,
          -11,
          dx - 1,
          -9,
        );
      }
    else m.fillStyle(0xf1d99d).fillRect(-12, -10, 12, 4).fillRect(5, -10, 8, 4);
  } else {
    m.fillStyle(0x805a39).fillRect(-1, -34, 3, 35);
    colors.forEach((color, i) => {
      const dx = (i - 1) * 17;
      m.lineStyle(2, color).lineBetween(0, -31, dx, -9);
      m.fillStyle(color).fillRect(dx - 2, -10, 4, 8);
    });
    for (const dx of [-5, 0, 5])
      m.fillStyle(0x87a26b).fillRect(dx - 2, -36 + Math.abs(dx) / 2, 4, 4);
    if (preparation === 'ribbons')
      m.fillStyle(0xf0ddab).fillRect(-3, -30, 7, 3);
    if (preparation === 'signs') {
      m.fillStyle(0x805a39).fillRect(25, -12, 2, 16);
      m.fillStyle(0xf1d99d).fillRect(18, -16, 15, 8);
      m.fillStyle(0x6f7d49).fillTriangle(25, -15, 31, -12, 25, -9);
    }
  }
}

/** A map-surprise clue, or the trace it leaves once resolved. */
export function drawSurprise(g: Graphics, clue: MapSurprise, choice?: string) {
  if (clue.phase === 'trace') {
    if (clue.id === 'biscuit-cat' && choice === 'wait')
      g.fillStyle(0xbac3b0).fillRect(3, 7, 11, 3).fillRect(5, 5, 7, 2);
    else if (clue.id === 'lost-mitten' && choice === 'owner')
      g.lineStyle(2, 0x82745a)
        .lineBetween(7, 2, 7, 10)
        .lineBetween(7, 10, 11, 10)
        .lineBetween(11, 10, 11, 7);
    else {
      if (clue.id === 'swap-box' && choice === 'pot')
        g.fillStyle(0xb28b59).fillRect(1, 3, 14, 11);
      g.fillStyle(0xf0dcad).fillRect(3, 2, 10, 7);
      g.lineStyle(1, 0x806345).lineBetween(5, 4, 11, 4).lineBetween(5, 6, 9, 6);
    }
    return;
  }
  if (clue.id === 'biscuit-cat') {
    g.fillStyle(0xb78d5d).fillRect(3, 5, 10, 7).fillRect(2, 1, 7, 7);
    g.fillTriangle(2, 2, 2, -2, 5, 1).fillTriangle(6, 1, 9, -2, 9, 3);
    g.lineStyle(3, 0xb78d5d)
      .lineBetween(12, 8, 16, 4)
      .lineBetween(16, 4, 16, 0);
    g.fillStyle(0x68523e)
      .fillRect(9, 5, 2, 5)
      .fillRect(14, 2, 3, 2)
      .fillRect(3, 3, 1, 1)
      .fillRect(7, 3, 1, 1);
  } else if (clue.id === 'swap-box') {
    g.fillStyle(0xb28b59).fillRect(1, 4, 14, 10);
    g.fillStyle(0xd6b780)
      .fillTriangle(0, 4, 5, 4, 2, 0)
      .fillTriangle(11, 4, 16, 4, 14, 0);
    g.fillStyle(0xad6950).fillRect(4, 1, 7, 7);
    g.fillStyle(0xe3b88c).fillRect(3, 0, 9, 2);
  } else {
    g.lineStyle(1, 0xe4d2b2).lineBetween(7, -4, 7, 2);
    g.fillStyle(0xa76260).fillRect(4, 2, 7, 9).fillRect(10, 5, 3, 4);
    g.fillStyle(0xe6c39a).fillRect(4, 2, 7, 2);
  }
}

/** Bonfire flames and, unless motion is reduced, fireworks. */
export function drawBonfire(g: Graphics, time: number, reduced: boolean) {
  const flicker = reduced ? 0 : Math.sin(time / 120) * 2;
  g.fillStyle(0xffa334, 0.13).fillCircle(566, 541, 28);
  g.fillStyle(0xee6c32).fillTriangle(557, 547, 576, 547, 567 + flicker, 520);
  g.fillStyle(0xffd976).fillTriangle(562, 547, 572, 547, 566 - flicker, 530);
  if (reduced) return;
  const phase = (time % 2600) / 2600;
  const radius = phase * 34;
  const cycle = Math.floor(time / 2600);
  const x = cycle % 2 ? 510 : 590;
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    g.fillStyle(
      [0xffd978, 0xe9a4bc, 0xb1e2e9][cycle % 3],
      1 - phase,
    ).fillCircle(
      x + Math.cos(angle) * radius,
      430 + Math.sin(angle) * radius + phase * 8,
      1.5,
    );
  }
}

/** Rain streaks or snowflakes across a w × h screen-space overlay. */
export function drawPrecipitation(
  g: Graphics,
  weather: 'rain' | 'snow',
  time: number,
  w: number,
  h: number,
  count: number,
) {
  for (let i = 0; i < count; i++) {
    const x =
        (i * 47 +
          Math.sin(i) * 18 +
          (weather === 'snow' ? time / 180 : time / 45)) %
        w,
      y = (i * 31 + time / (weather === 'snow' ? 45 : 6)) % h;
    if (weather === 'rain') {
      g.lineStyle(0.6, 0xbad5e6, 0.6);
      g.lineBetween(x, y, x - 2, y + 5);
    } else g.fillStyle(0xffffff, 0.8).fillCircle(x, y, 1);
  }
}
