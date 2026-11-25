import type * as Phaser from 'phaser';

// Pure Phaser drawing for Kererū Bay's harbour, paddock and festivals, in
// town-map pixels (16 per tile); callers own the graphics objects.
type Graphics = Phaser.GameObjects.Graphics;
const timber = 0x8a6440;
const darkTimber = 0x5e4330;
const cream = 0xf4efe1;

/** Tree crowns on the town map (tile cells), for seasonal blossom. */
const treeCrowns = [
  [1, 3],
  [9, 2],
  [12, 2],
  [41, 2],
  [44, 2],
  [54, 3],
  [1, 32],
  [13, 32],
  [18, 32],
  [26, 32],
  [40, 32],
  [35, 20],
  [13, 20],
];
/** Cabbage trees (tī kōuka), each standing in a blocked map cell. */
export const cabbageTrees = [
  [13, 7],
  [40, 7],
  [18, 28],
  [35, 28],
  [55, 19],
];

/** The beach along the promenade and a line of surf. */
export function drawBeach(g: Graphics) {
  g.fillStyle(0xe8d6a2).fillRect(0, 560, 480, 16).fillRect(512, 560, 384, 16);
  for (let x = 3; x < 896; x += 11) {
    if (x >= 476 && x <= 514) continue;
    g.fillStyle(x % 3 ? 0xd6c08a : 0xf3e7c4).fillRect(x, 563 + (x % 7), 2, 1);
  }
  // Pāua and pebbles near the tide line.
  for (const [x, y] of [
    [70, 571],
    [228, 569],
    [612, 570],
    [790, 572],
  ])
    g.fillStyle(0x3f8f8a).fillRect(x, y, 3, 2);
}

/** Surf rolling onto the beach; it drifts slowly unless motion is reduced. */
export function drawSurf(g: Graphics, time: number, reduced: boolean) {
  const shift = reduced ? 0 : Math.round(time / 260) % 12;
  for (let x = -12 + shift; x < 896; x += 12) {
    if (x >= 470 && x <= 514) continue;
    g.fillStyle(0xffffff, 0.75).fillRect(x, 576, 7, 2);
    g.fillStyle(0xffffff, 0.35).fillRect(x + 4, 580, 5, 1);
  }
}

/** Planks, piles and a bollard on the harbour wharf, with a moored dinghy. */
export function drawWharf(g: Graphics) {
  g.fillStyle(0xa77b4f).fillRect(480, 576, 32, 64);
  for (let y = 578; y < 640; y += 5)
    g.fillStyle(darkTimber).fillRect(480, y, 32, 1);
  for (const y of [586, 610, 634])
    g.fillStyle(0x4a3a2c).fillRect(477, y, 3, 6).fillRect(512, y, 3, 6);
  g.fillStyle(0x3c3a3f).fillRect(506, 628, 4, 4);
  // A dinghy tied to the west side.
  g.fillStyle(0xd8432f).fillTriangle(452, 600, 470, 600, 470, 606);
  g.fillStyle(0xd8432f).fillRect(452, 600, 18, 3);
  g.fillStyle(0xf4efe1).fillRect(455, 600, 13, 1);
  g.lineStyle(1, 0xe8dcc4).lineBetween(470, 601, 480, 596);
}

/** The noticeboard at the domain's west gate. */
export function drawBoard(g: Graphics) {
  g.fillStyle(darkTimber).fillRect(434, 518, 2, 12).fillRect(444, 518, 2, 12);
  g.fillStyle(timber).fillRect(431, 510, 18, 10);
  g.fillStyle(cream).fillRect(433, 512, 6, 6).fillRect(441, 512, 6, 6);
  g.fillStyle(0xd8432f).fillRect(435, 512, 2, 1);
}

/** Touchlines and goalposts on the domain's grass. */
export function drawRugbyField(g: Graphics) {
  g.fillStyle(0xffffff, 0.55)
    .fillRect(452, 448, 104, 1)
    .fillRect(452, 500, 104, 1)
    .fillRect(452, 448, 1, 104)
    .fillRect(555, 448, 1, 104);
  g.fillStyle(0xffffff)
    .fillRect(496, 424, 2, 25)
    .fillRect(510, 424, 2, 25)
    .fillRect(496, 440, 16, 2);
  g.fillStyle(0xd8432f).fillRect(496, 444, 2, 4).fillRect(510, 444, 2, 4);
}

/** A Kiwi letterbox on a post by the front gate. */
export function drawLetterbox(g: Graphics) {
  g.fillStyle(darkTimber).fillRect(119, 182, 2, 10);
  g.fillStyle(0x2f6f5f).fillRect(114, 174, 12, 9);
  g.fillStyle(0x24584b).fillRect(114, 174, 12, 2);
  g.fillStyle(cream).fillRect(117, 178, 6, 1);
}

/** The dairy's sandwich board with an ice-cream cone. */
export function drawDairySign(g: Graphics) {
  g.fillStyle(darkTimber).fillTriangle(17, 350, 23, 336, 29, 350);
  g.fillStyle(cream).fillRect(18, 337, 10, 11);
  g.fillStyle(0xd9a25a).fillTriangle(20, 342, 26, 342, 23, 347);
  g.fillStyle(0xf2c8a0).fillCircle(23, 341, 3);
  g.fillStyle(0xe0b84a).fillRect(22, 339, 1, 1).fillRect(24, 340, 1, 1);
}

/** The chip shop's fish sign over its awning. */
export function drawChippySign(g: Graphics) {
  g.fillStyle(0x2f4f7f).fillRect(492, 305, 24, 11);
  g.fillStyle(0xf0c24a)
    .fillEllipse(502, 310, 12, 6)
    .fillTriangle(508, 310, 513, 306, 513, 314);
  g.fillStyle(0x2f4f7f).fillRect(498, 309, 1, 1);
}

/** A café table and umbrella beside Tide Café. */
export function drawCafeTable(g: Graphics) {
  g.fillStyle(0x6b6b6b).fillRect(199, 348, 2, 12);
  g.fillStyle(0x3f8f8a).fillTriangle(190, 350, 210, 350, 200, 341);
  g.fillStyle(cream).fillRect(193, 358, 14, 3);
  g.fillStyle(darkTimber).fillRect(195, 361, 1, 4).fillRect(205, 361, 1, 4);
}

/** A cabbage tree: a slim trunk and a spiky tuft of leaves. */
export function drawCabbageTree(g: Graphics, [cx, cy]: number[]) {
  const x = cx * 16 + 8;
  const y = cy * 16 + 14;
  g.fillStyle(0x8c7a62).fillRect(x - 1, y - 16, 2, 16);
  g.fillStyle(0x6e8c3a);
  for (const [dx, dy] of [
    [-7, -4],
    [-5, -8],
    [0, -9],
    [5, -8],
    [7, -4],
    [-3, -2],
    [3, -2],
  ])
    g.fillTriangle(x, y - 16, x + dx - 1, y - 16 + dy, x + dx + 1, y - 16 + dy);
  g.fillStyle(0x8fae52).fillRect(x - 1, y - 21, 2, 4);
}

/**
 * Pōhutukawa flowering red in summer and kōwhai yellow in spring, as dots
 * over the tree crowns.
 */
export function drawBlossom(g: Graphics, quarter: number) {
  if (quarter !== 1 && quarter !== 4) return;
  const colours = quarter === 1 ? [0xd8262f, 0xf0505a] : [0xf2c832, 0xe8a82a];
  for (const [cx, cy] of treeCrowns) {
    const x = cx * 16 + 8;
    const y = cy * 16 + 7;
    for (let i = 0; i < 9; i++) {
      const angle = (i * 2.4 + cx) % (Math.PI * 2);
      const r = 2 + ((i * 3 + cy) % 4);
      g.fillStyle(colours[i % 2]).fillRect(
        Math.round(x + Math.cos(angle) * r),
        Math.round(y + Math.sin(angle) * r),
        2,
        2,
      );
    }
  }
}

/** Sheep grazing the paddock on the hill; lambs join them in spring. */
export function drawSheep(
  g: Graphics,
  time: number,
  quarter: number,
  reduced: boolean,
) {
  const flock = [
    [338, 18],
    [372, 30],
    [410, 14],
    [452, 28],
    [496, 16],
    [526, 32],
    ...(quarter === 4
      ? [
          [384, 36],
          [464, 18],
          [508, 34],
        ]
      : []),
  ];
  flock.forEach(([x0, y0], i) => {
    const lamb = i >= 6;
    const step = reduced ? 0 : Math.sin(time / 1700 + i * 1.3) * 4;
    const x = Math.round(x0 + step);
    const y = y0 + (reduced ? 0 : Math.round(Math.sin(time / 900 + i) * 0.6));
    const w = lamb ? 7 : 11;
    const facing = Math.cos(time / 1700 + i * 1.3) >= 0 || reduced ? 1 : -1;
    g.fillStyle(0x2b2b2b)
      .fillRect(x - 3, y + 2, 1, 3)
      .fillRect(x + 2, y + 2, 1, 3);
    g.fillStyle(0xf2efe6).fillEllipse(x, y, w, lamb ? 5 : 7);
    g.fillStyle(0x2b2b2b).fillRect(
      x + facing * (w / 2) - (facing > 0 ? 0 : 3),
      y - 2,
      3,
      3,
    );
  });
}

/** Festival stalls, bunting and decorations on the domain. */
export function drawFestival(g: Graphics, festival: string, lit: boolean) {
  const awning: Record<string, number[]> = {
    waitangi: [0xd8432f, 0xffffff],
    pasifika: [0x8a5a2b, 0xf0c24a],
    matariki: [0x2f3f6f, 0xf0c24a],
    'ap-show': [0x2f6f3f, 0xffffff],
  };
  const [stripe, base] = awning[festival] ?? [0xd8432f, 0xffffff];
  for (const x of [462, 546]) {
    g.fillStyle(timber).fillRect(x - 11, 530, 22, 10);
    g.fillStyle(base).fillRect(x - 13, 520, 26, 8);
    for (let i = 0; i < 4; i++)
      g.fillStyle(stripe).fillRect(x - 13 + i * 7, 520, 3, 8);
    g.fillStyle(darkTimber)
      .fillRect(x - 12, 528, 2, 12)
      .fillRect(x + 10, 528, 2, 12);
  }
  // Bunting across the domain.
  g.lineStyle(1, 0x5c4a3a).lineBetween(452, 470, 556, 470);
  const flags = [0xd8432f, 0xf0c24a, 0x3f8f8a, 0xffffff, 0x2f4f7f];
  for (let i = 0; i < 13; i++) {
    const x = 454 + i * 8;
    if (festival === 'matariki') {
      if (lit) g.fillStyle(0xffd27a, 0.18).fillCircle(x + 2, 476, 7);
      g.fillStyle(i % 2 ? 0xf6e7c1 : 0xf0a63a).fillRect(x, 472, 5, 7);
    } else
      g.fillStyle(flags[i % flags.length]).fillTriangle(
        x,
        471,
        x + 6,
        471,
        x + 3,
        477,
      );
  }
  if (festival === 'waitangi') {
    // A low stage and two picnic blankets.
    g.fillStyle(0xa77b4f).fillRect(476, 452, 56, 12);
    g.fillStyle(darkTimber).fillRect(476, 464, 56, 2);
    g.fillStyle(0xd8432f).fillRect(462, 490, 20, 12).fillRect(526, 494, 20, 12);
    g.fillStyle(0xffffff);
    for (const [x, y] of [
      [462, 490],
      [526, 494],
    ])
      for (let i = 0; i < 20; i += 4)
        for (let j = 0; j < 12; j += 4)
          if ((i + j) % 8 === 0) g.fillRect(x + i, y + j, 2, 2);
  } else if (festival === 'pasifika') {
    // Tapa cloth on the stalls, a log drum and flower garlands.
    for (const x of [451, 535])
      for (let i = 0; i < 22; i += 4)
        g.fillStyle(0x2b2b2b)
          .fillRect(x + i, 531, 2, 1)
          .fillRect(x + i + 1, 534, 2, 1);
    g.fillStyle(0x7c4a24).fillRect(490, 486, 28, 10);
    g.fillStyle(0x4a2a14).fillRect(494, 489, 20, 2);
    g.fillStyle(darkTimber).fillRect(488, 496, 4, 4).fillRect(516, 496, 4, 4);
    for (let i = 0; i < 12; i++)
      g.fillStyle([0xd8262f, 0xf0c24a, 0xffffff][i % 3]).fillCircle(
        460 + i * 8,
        512,
        1.5,
      );
  } else if (festival === 'matariki') {
    // Nine stars hung on a frame, and two kites by day.
    g.fillStyle(darkTimber).fillRect(476, 452, 2, 24).fillRect(530, 452, 2, 24);
    g.lineStyle(1, darkTimber).lineBetween(476, 452, 532, 452);
    for (const [x, y] of [
      [488, 458],
      [494, 455],
      [500, 460],
      [505, 456],
      [511, 461],
      [497, 466],
      [508, 467],
      [516, 457],
      [520, 464],
    ]) {
      if (lit) g.fillStyle(0xfff2b0, 0.25).fillCircle(x, y, 4);
      g.fillStyle(lit ? 0xfff6cc : 0xe8dcc4).fillRect(x - 1, y - 1, 3, 3);
    }
    if (!lit)
      for (const [x, y, colour] of [
        [470, 488, 0xd8432f],
        [540, 494, 0x3f8f8a],
      ]) {
        g.fillStyle(colour).fillTriangle(x, y - 6, x - 5, y, x + 5, y);
        g.fillStyle(colour).fillTriangle(x - 5, y, x + 5, y, x, y + 7);
        g.lineStyle(1, 0x5c4a3a).lineBetween(x, y + 7, x - 4, y + 16);
      }
  } else if (festival === 'ap-show') {
    // A marquee, a sheep pen and a little Ferris wheel.
    g.fillStyle(0xffffff).fillRect(454, 452, 32, 14);
    g.fillStyle(0xffffff).fillTriangle(452, 452, 488, 452, 470, 442);
    for (let i = 0; i < 5; i++)
      g.fillStyle(0xd8432f).fillRect(456 + i * 6, 452, 3, 14);
    g.lineStyle(1, timber).strokeRect(466, 486, 34, 18);
    for (const [x, y] of [
      [474, 494],
      [484, 498],
      [494, 492],
    ]) {
      g.fillStyle(0xf2efe6).fillEllipse(x, y, 9, 6);
      g.fillStyle(0x2b2b2b).fillRect(x + 4, y - 2, 2, 2);
    }
    g.lineStyle(1, 0x6b6b6b).strokeCircle(534, 470, 12);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      g.lineBetween(534, 470, 534 + Math.cos(a) * 12, 470 + Math.sin(a) * 12);
      g.fillStyle(flags[i % flags.length]).fillRect(
        533 + Math.cos(a) * 12 - 2,
        470 + Math.sin(a) * 12 - 1,
        4,
        3,
      );
    }
    g.fillStyle(0x6b6b6b).fillRect(527, 470, 2, 16).fillRect(539, 470, 2, 16);
  }
}

/** A warm glow at the chip shop and tavern doors after dusk. */
export function drawNightGlow(g: Graphics, lit: boolean) {
  if (!lit) return;
  for (const [x, y] of [
    [504, 340],
    [360, 340],
  ])
    g.fillStyle(0xffc46b, 0.16).fillCircle(x, y, 14);
}
