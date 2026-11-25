import type * as Phaser from 'phaser';

// Pure Phaser drawing for Lindenufer's street furniture and festivals, in
// town-map pixels (16 per tile); callers own the graphics objects.
type Graphics = Phaser.GameObjects.Graphics;
const ironGreen = 0x3f5f4f;
const stone = 0x9c978b;
const timber = 0x7a5536;
const warmLight = 0xffd27a;
const bridges = [
  [224, 288],
  [576, 640],
] as const;

/** Tram rails along Lindenstraße and the yellow stop sign. */
export function drawTram(g: Graphics) {
  for (const y of [227, 234]) {
    g.fillStyle(0x56575c).fillRect(0, y, 896, 2);
    g.fillStyle(0x9a9ca3).fillRect(0, y, 896, 1);
  }
  g.fillStyle(0x6b6b6b).fillRect(533, 196, 2, 18);
  g.fillStyle(0xf2c230).fillCircle(534, 193, 5);
  g.fillStyle(0x2f7d4f)
    .fillRect(531, 190, 1, 6)
    .fillRect(536, 190, 1, 6)
    .fillRect(532, 192, 4, 1);
}

/** Stone embankments, iron bridge railings and the lock gates. */
export function drawCanal(g: Graphics) {
  let x = 0;
  for (const [from, to] of bridges) {
    g.fillStyle(stone)
      .fillRect(x, 398, from - x, 3)
      .fillRect(x, 447, from - x, 3);
    x = to;
  }
  g.fillStyle(stone)
    .fillRect(x, 398, 896 - x, 3)
    .fillRect(x, 447, 896 - x, 3);
  for (const [from, to] of bridges) {
    g.fillStyle(0xb9b2a4).fillRect(from, 400, to - from, 48);
    for (let y = 404; y < 448; y += 8)
      g.fillStyle(0xa39c8e).fillRect(from, y, to - from, 1);
    for (const rail of [from, to - 3]) {
      g.fillStyle(ironGreen).fillRect(rail, 396, 3, 56);
      for (let y = 400; y < 448; y += 6)
        g.fillStyle(0x5f8270).fillRect(rail, y, 3, 1);
    }
  }
  // Lock gates with a walkway, as the Kneipe's name remembers.
  g.fillStyle(timber).fillRect(522, 400, 5, 48).fillRect(540, 400, 5, 48);
  g.fillStyle(0x5c3d26).fillRect(522, 422, 23, 3);
  g.fillStyle(0xd8d0c0).fillRect(520, 398, 2, 4).fillRect(545, 398, 2, 4);
}

/** A houseboat moored on the canal, lit at night. */
export function drawHouseboat(g: Graphics, lit: boolean) {
  g.fillStyle(0x2f5d50).fillRect(706, 420, 84, 12);
  g.fillStyle(0x24463d).fillTriangle(790, 420, 798, 420, 790, 432);
  g.fillStyle(0xf1ead8).fillRect(716, 408, 54, 13);
  g.fillStyle(0xc8463a).fillRect(714, 405, 58, 4);
  for (const x of [722, 738, 754])
    g.fillStyle(lit ? warmLight : 0x8fb3c4).fillRect(x, 412, 8, 5);
  g.fillStyle(0x6fae5f).fillRect(774, 414, 6, 6);
}

/** A yellow post box by the flats and a bike rack at the VHS. */
export function drawStreet(g: Graphics) {
  g.fillStyle(0x6b6b6b).fillRect(199, 186, 2, 8);
  g.fillStyle(0xf2c230).fillRect(194, 176, 12, 11);
  g.fillStyle(0x2b2b2b).fillRect(196, 179, 8, 1);
  g.fillStyle(0xd9a91c).fillRect(194, 186, 12, 1);
  for (const x of [452, 470]) {
    g.lineStyle(1, 0x2b2b2b)
      .strokeCircle(x, 186, 4)
      .strokeCircle(x + 10, 186, 4);
    g.lineStyle(1, x === 452 ? 0xc8463a : 0x2f6f9f).lineBetween(
      x,
      186,
      x + 10,
      186,
    );
    g.lineBetween(x + 5, 180, x + 10, 186);
  }
  g.fillStyle(0x8a8a8a).fillRect(448, 191, 36, 1);
}

/** The Litfaß column by the market square, papered with posters. */
export function drawColumn(g: Graphics) {
  g.fillStyle(0x2f4f3f).fillRect(561, 497, 14, 4);
  g.fillStyle(0xe9e2cf).fillRect(562, 470, 12, 27);
  const posters = [0xc8463a, 0x2f6f9f, 0xf2c230, 0x6fae5f, 0x8a4f9e];
  posters.forEach((color, i) =>
    g.fillStyle(color).fillRect(562 + (i % 2) * 6, 472 + i * 5, 6, 4),
  );
  g.fillStyle(0x2f4f3f).fillRect(560, 466, 16, 4).fillRect(564, 462, 8, 4);
}

/** The bakery's pretzel sign and the Späti's crates and night glow. */
export function drawShopfronts(g: Graphics, lit: boolean) {
  g.fillStyle(0x3c3a3f).fillRect(178, 337, 12, 1);
  g.lineStyle(2, 0xc98b3a)
    .strokeCircle(182, 342, 3)
    .strokeCircle(188, 342, 3)
    .lineBetween(180, 347, 190, 347);
  g.fillStyle(0x4f6f9f).fillRect(82, 344, 10, 6);
  g.fillStyle(0x6fae5f).fillRect(82, 341, 10, 3);
  for (const x of [83, 86, 89]) g.fillStyle(0xe8f4ff).fillRect(x, 338, 1, 3);
  if (lit) {
    g.fillStyle(0xff5fa2, 0.18).fillCircle(64, 314, 14);
    g.fillStyle(0xff7fb8).fillRect(48, 312, 32, 3);
    g.fillStyle(0x7fe0ff).fillRect(52, 316, 24, 1);
  }
}

/** Beer-garden tables by the Kneipe, and string lights after dusk. */
export function drawBeerGarden(g: Graphics, lit: boolean) {
  for (const x of [362, 394]) {
    g.fillStyle(0x8a6440).fillRect(x, 374, 20, 4);
    g.fillStyle(0x6b4a2e)
      .fillRect(x, 370, 20, 2)
      .fillRect(x, 381, 20, 2)
      .fillRect(x + 2, 378, 2, 4)
      .fillRect(x + 16, 378, 2, 4);
  }
  if (!lit) return;
  g.lineStyle(1, 0x5c4a3a).lineBetween(304, 358, 432, 358);
  for (let x = 308; x < 432; x += 10) {
    g.fillStyle(warmLight, 0.18).fillCircle(x, 361, 5);
    g.fillStyle(warmLight).fillRect(x - 1, 359, 2, 3);
  }
}

/** The S-Bahn roundel over the station door. */
export function drawStation(g: Graphics) {
  g.fillStyle(0x2f8f4f).fillCircle(112, 548, 6);
  g.fillStyle(0xffffff)
    .fillRect(110, 544, 4, 1)
    .fillRect(114, 545, 1, 1)
    .fillRect(109, 545, 1, 2)
    .fillRect(110, 547, 3, 1)
    .fillRect(113, 548, 1, 2)
    .fillRect(109, 550, 1, 1)
    .fillRect(110, 551, 3, 1);
}

/** The market fountain on the square. */
export function drawFountain(g: Graphics) {
  g.fillStyle(0x8e8b82).fillRect(482, 500, 28, 12);
  g.fillStyle(0x6fb6d6).fillRect(485, 502, 22, 7);
  g.fillStyle(0xb7b4aa).fillRect(494, 492, 4, 12);
  g.fillStyle(0xd8f1fb).fillRect(492, 490, 8, 2);
}

/** Garden sheds, a gnome and summer sunflowers in the allotment colony. */
export function drawAllotment(g: Graphics, summer: boolean) {
  for (const x of [706, 834]) {
    g.fillStyle(0xd9c7a0).fillRect(x, 504, 16, 11);
    g.fillStyle(0x8a3b32).fillTriangle(x - 2, 504, x + 18, 504, x + 8, 496);
    g.fillStyle(0x5c3d26).fillRect(x + 6, 508, 4, 7);
  }
  g.fillStyle(0xd2452f).fillTriangle(846, 556, 852, 556, 849, 549);
  g.fillStyle(0xf0d2b4).fillRect(847, 556, 4, 3);
  g.fillStyle(0x4c7fc2).fillRect(847, 559, 4, 4);
  if (!summer) return;
  for (let x = 692; x < 860; x += 14) {
    g.fillStyle(0x4f8f3f).fillRect(x, 568, 1, 8);
    g.fillStyle(0xf2c230).fillCircle(x, 566, 3);
    g.fillStyle(0x6b4a2e).fillRect(x - 1, 565, 2, 2);
  }
}

/** Weekend market stalls with striped canopies and crates of produce. */
export function drawWeekendMarket(g: Graphics) {
  for (const [x, y, canopy] of [
    [444, 548, 0x2f6f9f],
    [516, 520, 0xc8463a],
  ] as const) {
    g.fillStyle(0x8a6440).fillRect(x, y + 8, 24, 8);
    for (let i = 0; i < 4; i++)
      g.fillStyle(i % 2 ? 0xf4efe1 : canopy).fillRect(x - 2 + i * 7, y, 7, 6);
    g.fillStyle(0x6b4a2e)
      .fillRect(x - 1, y + 6, 2, 12)
      .fillRect(x + 23, y + 6, 2, 12);
    g.fillStyle(0xd2452f).fillRect(x + 2, y + 8, 6, 3);
    g.fillStyle(0x6fae5f).fillRect(x + 9, y + 8, 6, 3);
    g.fillStyle(0xe8cf8f).fillRect(x + 16, y + 8, 6, 3);
  }
}

/** Festival props on the market square; `lit` after dusk. */
export function drawFestival(g: Graphics, festival: string, lit: boolean) {
  if (festival === 'weihnachtsmarkt') {
    for (const x of [436, 520]) {
      g.fillStyle(0x8a6440).fillRect(x, 548, 26, 14);
      g.fillStyle(0xa83a32).fillTriangle(x - 3, 548, x + 29, 548, x + 13, 538);
      g.fillStyle(lit ? warmLight : 0xd9c7a0).fillRect(x + 4, 552, 18, 5);
      for (let i = 0; i < 6; i++)
        g.fillStyle(i % 2 ? 0xffe08a : 0xff8f6b, lit ? 1 : 0.6).fillRect(
          x + i * 5,
          546,
          2,
          2,
        );
    }
    // The square's Christmas tree.
    g.fillStyle(0x5c3d26).fillRect(534, 524, 4, 6);
    g.fillStyle(0x2f6f3f)
      .fillTriangle(524, 524, 548, 524, 536, 506)
      .fillTriangle(527, 512, 545, 512, 536, 496);
    g.fillStyle(0xf2c230).fillRect(535, 493, 3, 3);
    for (const [x, y] of [
      [530, 520],
      [541, 518],
      [536, 510],
      [532, 506],
      [539, 503],
    ])
      g.fillStyle(lit ? 0xfff2b0 : 0xd2452f).fillRect(x, y, 2, 2);
  } else if (festival === 'maifest') {
    // The maypole with its wreath and ribbons, and a beer bench.
    g.fillStyle(0xe8e0cc).fillRect(530, 468, 3, 62);
    g.fillStyle(0x4f8f3f).fillCircle(531, 476, 6);
    g.fillStyle(0xe8e0cc).fillCircle(531, 476, 3);
    const ribbons = [0xc8463a, 0x2f6f9f, 0xf2c230, 0x6fae5f];
    ribbons.forEach((color, i) =>
      g
        .lineStyle(1, color)
        .lineBetween(531, 480, 518 + i * 9, 500 + (i % 2) * 6),
    );
    g.fillStyle(0x8a6440).fillRect(440, 528, 28, 4);
    g.fillStyle(0x6b4a2e).fillRect(440, 534, 28, 2).fillRect(440, 522, 28, 2);
    g.fillStyle(0x3c3a3f).fillRect(470, 536, 12, 6);
    g.fillStyle(lit ? 0xff8f3a : 0xd2452f).fillRect(472, 534, 8, 2);
  } else if (festival === 'fete-de-la-musique') {
    // A small stage with speakers and bunting by the Litfaß column.
    g.fillStyle(0x5c3d26).fillRect(512, 528, 36, 8);
    g.fillStyle(0x2b2b2b).fillRect(512, 514, 6, 14).fillRect(542, 514, 6, 14);
    g.fillStyle(0x6b6b6b).fillCircle(515, 520, 2).fillCircle(545, 520, 2);
    g.lineStyle(1, 0x5c4a3a).lineBetween(508, 506, 552, 506);
    for (let i = 0; i < 7; i++)
      g.fillStyle([0xc8463a, 0xf2c230, 0x2f6f9f][i % 3]).fillTriangle(
        510 + i * 6,
        506,
        514 + i * 6,
        506,
        512 + i * 6,
        511,
      );
    for (const [x, y] of [
      [500, 516],
      [528, 498],
      [554, 500],
    ]) {
      g.fillStyle(0x2b2b2b).fillCircle(x, y, 2);
      g.fillRect(x + 1, y - 6, 1, 6);
    }
  } else if (festival === 'st-martin') {
    // Paper lanterns on sticks and the St Martin's fire.
    const colors = [0xff8f3a, 0xf2c230, 0xd2452f, 0x6fb6d6, 0x8a4f9e];
    for (let i = 0; i < 10; i++) {
      const x = 444 + i * 9;
      const y = 520 + (i % 2) * 8;
      g.fillStyle(0x6b4a2e).fillRect(x, y, 1, 8);
      if (lit) g.fillStyle(colors[i % 5], 0.22).fillCircle(x, y - 2, 6);
      g.fillStyle(colors[i % 5]).fillCircle(x, y - 2, 3);
    }
    g.fillStyle(0x5c3d26).fillRect(524, 540, 16, 3);
    g.fillStyle(lit ? 0xffb33a : 0xd2452f).fillTriangle(
      524,
      540,
      540,
      540,
      532,
      526,
    );
    g.fillStyle(0xffe08a).fillTriangle(528, 540, 536, 540, 532, 532);
  }
}
