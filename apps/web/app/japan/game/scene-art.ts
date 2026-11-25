import type * as Phaser from 'phaser';

// Pure Phaser drawing for Minatozaka's street furniture and festivals, in
// town-map pixels (16 per tile); callers own the graphics objects.
type Graphics = Phaser.GameObjects.Graphics;
const vermilion = 0xd2452f;
const charcoal = 0x3c3a3f;
const lanternRed = 0xd8432f;

/** The shrine hall above the square, with its offering box. */
export function drawShrine(g: Graphics) {
  g.fillStyle(0xb9b2a4).fillRect(462, 470, 68, 10);
  g.fillStyle(0xe8dcc4).fillRect(470, 452, 52, 18);
  g.fillStyle(vermilion)
    .fillRect(468, 452, 4, 20)
    .fillRect(520, 452, 4, 20)
    .fillRect(494, 452, 4, 20);
  g.fillStyle(charcoal)
    .fillRect(462, 444, 68, 9)
    .fillTriangle(456, 444, 466, 444, 466, 452)
    .fillTriangle(536, 444, 526, 444, 526, 452)
    .fillRect(474, 436, 44, 9)
    .fillRect(492, 431, 8, 6);
  g.fillStyle(0x7c5a3a).fillRect(486, 462, 20, 8);
  g.lineStyle(1, 0xc9a35a).lineBetween(488, 465, 504, 465);
  // Shimenawa rope with paper streamers.
  g.lineStyle(2, 0xd8c69a).lineBetween(470, 455, 522, 455);
  g.fillStyle(0xffffff)
    .fillRect(482, 456, 2, 5)
    .fillRect(495, 456, 2, 5)
    .fillRect(508, 456, 2, 5);
}

/** The torii at the square's river entrance. */
export function drawTorii(g: Graphics) {
  g.fillStyle(vermilion).fillRect(474, 528, 5, 30).fillRect(513, 528, 5, 30);
  g.fillStyle(vermilion).fillRect(470, 535, 52, 3);
  g.fillStyle(charcoal).fillRect(466, 522, 60, 4);
  g.fillStyle(vermilion).fillRect(468, 526, 56, 3);
  g.fillStyle(charcoal).fillRect(474, 556, 5, 2).fillRect(513, 556, 5, 2);
}

/** Two stone lanterns beside the hall. */
export function drawStoneLanterns(g: Graphics) {
  for (const x of [448, 528]) {
    g.fillStyle(0x9c9a92).fillRect(x + 6, 484, 4, 11);
    g.fillStyle(0xb7b4aa).fillRect(x + 3, 494, 10, 3);
    g.fillStyle(0xb7b4aa).fillRect(x + 3, 476, 10, 8);
    g.fillStyle(0xf3d98c).fillRect(x + 6, 478, 4, 4);
    g.fillStyle(0x8e8b82).fillTriangle(x + 1, 477, x + 15, 477, x + 8, 470);
  }
}

export function drawBoard(g: Graphics) {
  g.fillStyle(0x6b4a2e).fillRect(434, 506, 2, 12).fillRect(444, 506, 2, 12);
  g.fillStyle(0x8a6440).fillRect(431, 498, 18, 10);
  g.fillStyle(0xf4efe1).fillRect(433, 500, 6, 6).fillRect(441, 500, 6, 6);
}

/** Red paper lanterns at the izakaya door; `lit` after dusk. */
export function drawIzakaya(g: Graphics, lit: boolean) {
  for (const x of [342, 374]) {
    if (lit) g.fillStyle(0xffb36b, 0.18).fillCircle(x + 4, 330, 12);
    g.fillStyle(charcoal)
      .fillRect(x + 1, 322, 6, 2)
      .fillRect(x + 1, 335, 6, 2);
    g.fillStyle(lit ? 0xf0623f : lanternRed).fillRect(x, 324, 8, 11);
    g.fillStyle(0xffffff, 0.8).fillRect(x + 3, 326, 2, 6);
  }
}

/** Shop curtains (noren) over the café and store doors. */
export function drawNoren(g: Graphics) {
  for (const [x, color] of [
    [160, 0x2f4f7f],
    [64, 0x7c3b3b],
  ] as const) {
    g.fillStyle(color).fillRect(x + 1, 337, 14, 7);
    g.fillStyle(0xf4efe1)
      .fillRect(x + 5, 337, 1, 7)
      .fillRect(x + 10, 337, 1, 7);
  }
}

/** Vertical shop banners (nobori) along the shopping street. */
export function drawNobori(g: Graphics) {
  for (const [x, color] of [
    [116, 0xc8463a],
    [420, 0x2f6f5f],
  ] as const) {
    g.fillStyle(0x6b6b6b).fillRect(x, 318, 1, 26);
    g.fillStyle(color).fillRect(x + 1, 320, 5, 18);
    g.fillStyle(0xf4efe1).fillRect(x + 3, 323, 1, 12);
  }
}

/** Drink vending machines; their panels glow at night. */
export function drawVendingMachines(g: Graphics, lit: boolean) {
  for (const [x, y] of [
    [208, 176],
    [640, 352],
  ]) {
    if (lit) g.fillStyle(0xe8f4ff, 0.14).fillCircle(x + 8, y + 6, 13);
    g.fillStyle(0xf1f1ee).fillRect(x + 2, y - 6, 12, 20);
    g.fillStyle(0xc8463a).fillRect(x + 2, y - 6, 12, 3);
    g.fillStyle(lit ? 0xdff1ff : 0x9fb8c8).fillRect(x + 4, y - 2, 8, 6);
    g.fillStyle(0x4a4a4a).fillRect(x + 4, y + 6, 8, 2);
    for (const dx of [4, 7, 10])
      g.fillStyle(0xe0a43a).fillRect(x + dx, y + 5, 2, 1);
  }
}

/** Festival stalls and lantern strings around the shrine square. */
export function drawFestival(g: Graphics, festival: string, lit: boolean) {
  for (const x of [452, 540]) {
    g.fillStyle(0x8a6440).fillRect(x - 11, 532, 22, 10);
    g.fillStyle(0xffffff).fillRect(x - 13, 522, 26, 8);
    for (let i = 0; i < 4; i++)
      g.fillStyle(0xd2452f).fillRect(x - 13 + i * 7, 522, 3, 8);
    g.fillStyle(0x6b4a2e)
      .fillRect(x - 12, 530, 2, 12)
      .fillRect(x + 10, 530, 2, 12);
  }
  g.lineStyle(1, 0x5c4a3a).lineBetween(436, 488, 556, 488);
  for (let i = 0; i < 9; i++) {
    const x = 442 + i * 14;
    if (lit) g.fillStyle(0xffc46b, 0.16).fillCircle(x + 3, 494, 7);
    g.fillStyle(i % 2 ? 0xf6e7c1 : lanternRed).fillRect(x, 489, 6, 8);
  }
  if (festival === 'bon-odori') {
    // A two-level yagura with a taiko on top.
    g.fillStyle(0x7c5a3a).fillRect(484, 498, 24, 22);
    g.fillStyle(0xffffff).fillRect(484, 506, 24, 6);
    for (let i = 0; i < 4; i++)
      g.fillStyle(0xd2452f).fillRect(484 + i * 6, 506, 3, 6);
    g.fillStyle(0x6b4a2e).fillRect(482, 496, 28, 3);
    g.fillStyle(0x9a6b3c).fillCircle(496, 492, 5);
    g.fillStyle(0xe8d7b0).fillCircle(496, 492, 3);
  } else if (festival === 'aki-matsuri') {
    // The portable shrine resting on its poles.
    g.fillStyle(0x6b4a2e).fillRect(474, 512, 44, 3);
    g.fillStyle(0x3c3a3f).fillRect(486, 502, 20, 10);
    g.fillStyle(0xd9b44a)
      .fillRect(484, 498, 24, 4)
      .fillTriangle(484, 498, 508, 498, 496, 490);
    g.fillStyle(0xd9b44a).fillRect(494, 486, 4, 4);
  } else if (festival === 'hanami') {
    // Picnic sheets on the square.
    g.fillStyle(0x4c7fc2).fillRect(456, 508, 22, 14).fillRect(514, 508, 22, 14);
    g.fillStyle(0xf2a7bb).fillRect(462, 512, 6, 4).fillRect(520, 513, 6, 4);
    g.fillStyle(0xffffff).fillRect(470, 514, 4, 3).fillRect(528, 512, 4, 3);
  } else if (festival === 'setsubun') {
    // A red demon mask on a stand, and spilled beans.
    g.fillStyle(0x6b4a2e).fillRect(495, 506, 2, 14);
    g.fillStyle(0xd2452f).fillCircle(496, 502, 6);
    g.fillStyle(0xf6e7c1)
      .fillTriangle(491, 497, 493, 492, 494, 497)
      .fillTriangle(498, 497, 499, 492, 501, 497);
    g.fillStyle(0x2b2b2b).fillRect(493, 501, 2, 1).fillRect(498, 501, 2, 1);
    for (const [x, y] of [
      [480, 520],
      [486, 524],
      [506, 518],
      [512, 526],
      [500, 528],
    ])
      g.fillStyle(0xe8cf8f).fillRect(x, y, 2, 2);
  }
}

/** Cherry petals drifting over the river in spring. */
export function drawPetals(g: Graphics, time: number, reduced: boolean) {
  for (let i = 0; i < 28; i++) {
    const drift = reduced ? 0 : time / (70 + (i % 5) * 9);
    const x = (i * 97 + drift) % 896;
    const y = 520 + ((i * 37 + (reduced ? 0 : time / 160)) % 84);
    g.fillStyle(i % 3 ? 0xf6c1cf : 0xfbe1e8).fillRect(x, y, 2, 1);
  }
}
