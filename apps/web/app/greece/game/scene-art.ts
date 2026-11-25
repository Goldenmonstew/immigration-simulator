import type * as Phaser from 'phaser';

// Pure Phaser drawing for Limanaki's harbour, church and festivals, in
// town-map pixels (16 per tile); callers own the graphics objects.
type Graphics = Phaser.GameObjects.Graphics;
const white = 0xf6f3ec;
const shade = 0xd9d4c8;
const aegean = 0x2a60aa;
const sky = 0x4a8fd0;
const gold = 0xe0b84a;
const bougainvillea = [0xc8348e, 0xe0509f, 0xa82a78];

/** The church of Agios Nikolaos at the top of the square. */
export function drawChurch(g: Graphics) {
  // Nave, drum and dome.
  g.fillStyle(shade).fillRect(450, 476, 80, 4);
  g.fillStyle(white).fillRect(452, 446, 76, 30);
  g.fillStyle(white).fillRect(474, 432, 32, 16);
  g.fillStyle(aegean).fillCircle(490, 432, 16);
  g.fillStyle(white).fillRect(472, 432, 36, 2);
  g.fillStyle(gold).fillRect(489, 408, 3, 10).fillRect(485, 411, 11, 2);
  // Arched door and windows.
  g.fillStyle(aegean).fillRect(484, 464, 12, 16).fillCircle(490, 464, 6);
  for (const x of [462, 514]) g.fillStyle(sky).fillRect(x, 454, 5, 8);
  // Bell tower with its bell.
  g.fillStyle(white).fillRect(530, 430, 12, 50);
  g.fillStyle(aegean).fillCircle(536, 430, 6);
  g.fillStyle(0x5a5a5a).fillRect(533, 438, 6, 9);
  g.fillStyle(gold).fillRect(534, 440, 4, 5);
  g.fillStyle(gold).fillRect(535, 418, 2, 6).fillRect(533, 420, 6, 2);
}

/** The periptero kiosk beside the square, papers on display. */
export function drawKiosk(g: Graphics) {
  g.fillStyle(0xc8463a).fillRect(558, 494, 20, 4);
  g.fillStyle(0xf0c43c).fillRect(560, 498, 16, 28);
  g.fillStyle(0xfaf6ec).fillRect(562, 502, 12, 10);
  for (const [x, color] of [
    [563, 0x5a8cc8],
    [567, 0xd8574a],
    [571, 0x6aa85a],
  ] as const)
    g.fillStyle(color).fillRect(x, 503, 3, 8);
  g.fillStyle(0x8a6440).fillRect(560, 514, 16, 2);
  g.fillStyle(0xfaf6ec).fillRect(562, 518, 5, 6).fillRect(569, 518, 5, 6);
}

/** Balcony rails and flowerpots across the apartment block. */
export function drawBalconies(g: Graphics) {
  for (const y of [94, 110, 126, 142, 158]) {
    g.fillStyle(0x8c8c8c).fillRect(52, y, 136, 2);
    for (const x of [58, 90, 122, 154, 180])
      g.fillStyle(bougainvillea[(x + y) % 3]).fillRect(x, y - 3, 4, 3);
  }
}

/** Bougainvillea over the taverna and the tram stop, flags on public offices. */
export function drawStreetLife(g: Graphics) {
  for (const [x, y] of [
    [410, 324],
    [413, 331],
    [408, 338],
    [412, 345],
    [34, 324],
    [37, 331],
    [33, 338],
    [184, 500],
    [188, 507],
    [183, 514],
  ])
    g.fillStyle(bougainvillea[(x + y) % 3]).fillCircle(x, y, 3);
  for (const [x, y] of [
    [816, 56],
    [400, 456],
  ])
    drawFlag(g, x, y);
}

/** A Greek flag: nine stripes and a cross in the canton. */
export function drawFlag(g: Graphics, x: number, y: number) {
  g.fillStyle(0x7a7a7a).fillRect(x, y, 1, 22);
  for (let i = 0; i < 9; i++)
    g.fillStyle(i % 2 ? 0xffffff : 0x1f5fae).fillRect(x + 1, y + i, 13, 1);
  g.fillStyle(0x1f5fae).fillRect(x + 1, y, 5, 5);
  g.fillStyle(0xffffff)
    .fillRect(x + 3, y, 1, 5)
    .fillRect(x + 1, y + 2, 5, 1);
}

/** Taverna tables against the wall and the kafeneio's chairs and tavli. */
export function drawTerraces(g: Graphics) {
  for (const x of [308, 324, 372, 388]) {
    g.fillStyle(0xffffff).fillRect(x, 354, 10, 5);
    g.fillStyle(sky)
      .fillRect(x + 1, 355, 2, 1)
      .fillRect(x + 5, 357, 2, 1);
    g.fillStyle(0x6b4a2e).fillRect(x + 4, 359, 2, 5);
  }
  for (const x of [138, 178]) {
    g.fillStyle(0x6b4a2e)
      .fillRect(x, 356, 9, 2)
      .fillRect(x + 3, 358, 2, 6);
    g.fillStyle(0x3c6ea8)
      .fillRect(x - 4, 356, 3, 7)
      .fillRect(x + 10, 356, 3, 7);
  }
  g.fillStyle(0x8a5a32).fillRect(140, 354, 5, 2);
}

/** Painted caiques moored in the harbour and the beacon off the breakwater. */
export function drawHarbour(g: Graphics) {
  for (const [x, y, stripe] of [
    [88, 590, 0xd8574a],
    [196, 600, 0x2a60aa],
    [560, 594, 0x3f9a5a],
    [700, 604, 0xd8574a],
    [820, 588, 0x2a60aa],
  ] as const) {
    g.fillStyle(0xf6f3ec).fillTriangle(x, y, x + 24, y, x + 20, y + 7);
    g.fillStyle(0xf6f3ec).fillTriangle(x, y, x + 4, y + 7, x + 20, y + 7);
    g.fillStyle(stripe).fillRect(x + 1, y, 23, 2);
    g.fillStyle(0x8a5a32).fillRect(x + 8, y - 4, 8, 4);
  }
  g.fillStyle(0x8c8a84).fillRect(386, 612, 12, 10);
  g.fillStyle(0xf6f3ec).fillRect(389, 594, 6, 18);
  g.fillStyle(0x3f9a5a).fillRect(388, 590, 8, 5);
}

/** Lights on the taverna's vine trellis, warm after dusk. */
export function drawTavernaLights(g: Graphics, lit: boolean) {
  g.lineStyle(1, 0x5c4a3a).lineBetween(304, 338, 404, 338);
  for (let x = 308; x < 404; x += 12) {
    if (lit) g.fillStyle(0xffd88b, 0.2).fillCircle(x + 1, 340, 6);
    g.fillStyle(lit ? 0xffe6a6 : 0xd8d0b8).fillRect(x, 339, 2, 2);
  }
}

/** Saturday street-market stalls along the closed street. */
export function drawMarket(g: Graphics) {
  const goods = [0xf08a24, 0xd8402e, 0x6aa84a, 0xf2c84a, 0x6a3a6a];
  for (const [x, flip] of [
    [578, false],
    [626, true],
  ] as const)
    for (let i = 0; i < 4; i++) {
      const y = 438 + i * 22;
      g.fillStyle(i % 2 ? 0xd8402e : 0x2a60aa).fillRect(x - 2, y, 16, 4);
      g.fillStyle(0xffffff)
        .fillRect(x + 2, y, 3, 4)
        .fillRect(x + 9, y, 3, 4);
      g.fillStyle(0x8a6440).fillRect(x, y + 6, 12, 8);
      g.fillStyle(goods[(i + (flip ? 2 : 0)) % goods.length])
        .fillRect(x + 1, y + 6, 4, 3)
        .fillRect(x + 7, y + 6, 4, 3);
    }
}

/** Festival stalls, bulbs and the day's own props on Agios Nikolaos square. */
export function drawFestival(
  g: Graphics,
  glow: Graphics,
  festival: string,
  lit: boolean,
) {
  for (const x of [442, 550]) {
    g.fillStyle(0x8a6440).fillRect(x - 9, 504, 18, 9);
    g.fillStyle(0xffffff).fillRect(x - 11, 496, 22, 6);
    for (let i = 0; i < 4; i++)
      g.fillStyle(aegean).fillRect(x - 11 + i * 6, 496, 3, 6);
  }
  g.lineStyle(1, 0x5c4a3a).lineBetween(440, 486, 556, 486);
  for (let x = 444; x < 556; x += 10) {
    if (lit) glow.fillStyle(0xffd88b, 0.22).fillCircle(x + 1, 488, 6);
    g.fillStyle(lit ? 0xffe6a6 : 0xe8e0c8).fillRect(x, 487, 2, 2);
  }
  if (festival === 'theophany') {
    // The cross on its blue ribbon at the quay, and a splash in the sea.
    g.fillStyle(0x8a6440).fillRect(510, 540, 4, 16);
    g.fillStyle(gold).fillRect(509, 528, 6, 2).fillRect(511, 524, 2, 12);
    g.fillStyle(aegean).fillRect(513, 530, 8, 2);
    g.fillStyle(0xffffff, 0.8).fillCircle(512, 586, 4).fillCircle(520, 590, 3);
  } else if (festival === 'easter') {
    // A lamb on the spit over charcoal, red eggs and candles.
    g.fillStyle(0x5a5a5a).fillRect(482, 506, 28, 6);
    g.fillStyle(0xe0602a).fillRect(484, 505, 24, 2);
    g.fillStyle(0x6b4a2e).fillRect(478, 500, 36, 1);
    g.fillStyle(0xc89a6a).fillRect(488, 497, 16, 5);
    g.fillStyle(0xffffff).fillRect(520, 504, 10, 6);
    for (const x of [521, 524, 527])
      g.fillStyle(0xc8241e).fillRect(x, 502, 2, 2);
    for (const x of [462, 468, 474]) {
      g.fillStyle(0xf6f0d8).fillRect(x, 510, 1, 6);
      g.fillStyle(0xffc84a).fillRect(x, 508, 1, 2);
    }
  } else if (festival === 'panigyri') {
    // Long tables with white cloths and a bouzouki player's stage.
    for (const y of [506, 520]) {
      g.fillStyle(0xffffff).fillRect(458, y, 76, 4);
      g.fillStyle(0x6b4a2e)
        .fillRect(460, y + 4, 2, 4)
        .fillRect(530, y + 4, 2, 4);
    }
    g.fillStyle(0x8a6440).fillRect(486, 490, 20, 8);
    g.fillStyle(0xc8964a).fillCircle(496, 490, 3);
    g.fillStyle(0x6b4a2e).fillRect(498, 487, 6, 1);
  } else if (festival === 'ochi') {
    for (const x of [448, 476, 516, 544]) drawFlag(g, x, 490);
  }
}
