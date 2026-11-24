import type * as Phaser from 'phaser';

// Pure Phaser drawing for Vilamar's streets, seafront and fiestas, in
// town-map pixels (16 per tile); callers own the graphics objects.
type Graphics = Phaser.GameObjects.Graphics;
const T = 16;
const iron = 0x3b3633;
const geranium = 0xd8432f;
const orange = 0xf28c1e;
const yellow = 0xf2c230;
const red = 0xc8102e;
const tile = 0x2f6db5;

/** Wrought-iron balconies with geraniums under the flats' and school's windows. */
export function drawBalconies(g: Graphics) {
  for (const x of [4, 6, 9, 11, 21, 23, 25]) {
    const px = x * T;
    const y = 9 * T + 12;
    g.fillStyle(iron)
      .fillRect(px, y, 16, 1)
      .fillRect(px, y + 3, 16, 1);
    for (let i = 1; i < 16; i += 3) g.fillRect(px + i, y, 1, 4);
    g.fillStyle(0x7a4a2a).fillRect(px + 2, y - 2, 4, 2);
    g.fillStyle(geranium)
      .fillRect(px + 2, y - 4, 2, 2)
      .fillRect(px + 4, y - 3, 2, 1);
    g.fillStyle(0x4c8a3f).fillRect(px + 3, y - 3, 1, 1);
  }
}

/** Blue-and-white azulejo bands on the market, orxateria and health centre. */
export function drawAzulejos(g: Graphics) {
  for (const [from, to, door] of [
    [2, 6, 4],
    [8, 12, 10],
    [28, 33, 31],
  ]) {
    for (let x = from * T; x < (to + 1) * T; x += 2) {
      if (x >= door * T && x < (door + 1) * T) continue;
      g.fillStyle((x / 2) % 2 ? tile : 0xf4f1e6).fillRect(x, 21 * T + 12, 2, 2);
      g.fillStyle((x / 2) % 2 ? 0xf4f1e6 : tile).fillRect(x, 21 * T + 14, 2, 2);
    }
  }
}

/** The Spanish flag and the Valencian Senyera on the district office’s front. */
export function drawFlags(g: Graphics) {
  const y = 8 * T + 2;
  for (const x of [44 * T + 4, 46 * T + 4])
    g.fillStyle(0x8e8b82).fillRect(x, y, 1, 14);
  const spain = 44 * T + 5;
  g.fillStyle(red)
    .fillRect(spain, y, 12, 3)
    .fillRect(spain, y + 8, 12, 2);
  g.fillStyle(0xffc400).fillRect(spain, y + 3, 12, 5);
  const senyera = 46 * T + 5;
  for (let i = 0; i < 9; i++)
    g.fillStyle(i % 2 ? red : yellow).fillRect(senyera, y + i, 12, 1);
  g.fillStyle(0x1f4e9e).fillRect(senyera, y, 3, 9);
  g.fillStyle(yellow).fillRect(senyera + 1, y + 1, 1, 1);
}

/** The residents’ notice board on the grass beside the square. */
export function drawBoard(g: Graphics) {
  const x = 26 * T,
    y = 29 * T;
  g.fillStyle(0x6b4a2e)
    .fillRect(x + 3, y + 6, 2, 10)
    .fillRect(x + 11, y + 6, 2, 10);
  g.fillStyle(0x8a6440).fillRect(x, y - 2, 16, 10);
  g.fillStyle(0xf4efe1)
    .fillRect(x + 2, y, 5, 6)
    .fillRect(x + 9, y, 5, 5);
  g.fillStyle(orange).fillRect(x + 9, y + 1, 5, 1);
}

/** The square's fountain. */
export function drawFountain(g: Graphics) {
  const cx = 31 * T,
    cy = 29 * T + 2;
  g.fillStyle(0xa39c8c).fillCircle(cx, cy, 15);
  g.fillStyle(0xc9c2b2).fillCircle(cx, cy, 13);
  g.fillStyle(0x6fc3df).fillCircle(cx, cy, 10);
  g.fillStyle(0xbfb8a8).fillRect(cx - 2, cy - 14, 4, 14);
  g.fillStyle(0xc9c2b2).fillRect(cx - 6, cy - 16, 12, 3);
  g.fillStyle(0xffffff, 0.8)
    .fillRect(cx - 5, cy - 13, 1, 5)
    .fillRect(cx + 4, cy - 13, 1, 5);
}

/** Palms along the promenade, on blocked cells. */
export function drawPalms(
  g: Graphics,
  cells: readonly { x: number; y: number }[],
) {
  for (const { x, y } of cells) {
    const bx = x * T + 8,
      by = y * T + 15;
    g.fillStyle(0x8b6b43);
    for (let i = 0; i < 26; i += 2)
      g.fillRect(bx - 1 + Math.round(Math.sin(i / 9) * 2), by - i - 2, 3, 2);
    g.fillStyle(0x6e5332);
    for (let i = 1; i < 26; i += 4) g.fillRect(bx - 1, by - i, 3, 1);
    const top = { x: bx + 2, y: by - 27 };
    for (const [dx, dy, color] of [
      [-12, 4, 0x3e8e41],
      [12, 4, 0x3e8e41],
      [-9, -6, 0x5db05a],
      [9, -6, 0x5db05a],
      [0, -10, 0x4a9e4b],
    ] as const) {
      g.fillStyle(color).fillTriangle(
        top.x,
        top.y,
        top.x + dx,
        top.y + dy,
        top.x + dx * 0.6,
        top.y + dy + 3,
      );
    }
    g.fillStyle(0x7a5a2a).fillCircle(top.x, top.y + 1, 2);
  }
}

/** Sand over the beach rows, with a wet edge by the water. */
export function drawBeach(g: Graphics) {
  const top = 34 * T,
    height = 3 * T;
  for (const [from, to] of [
    [0, 46 * T],
    [48 * T, 56 * T],
  ]) {
    g.fillStyle(0xe8d29c).fillRect(from, top, to - from, height);
    g.fillStyle(0xd6bb82).fillRect(from, top + height - 3, to - from, 3);
    g.fillStyle(0xd9c08a);
    for (let x = from + 3; x < to; x += 11)
      g.fillRect(x, top + ((x * 7) % (height - 6)) + 1, 1, 1);
  }
}

/** The lifeguard chair on the sand. */
export function drawLifeguardTower(g: Graphics) {
  const x = 30 * T,
    y = 34 * T;
  g.fillStyle(0xf4f1e6)
    .fillRect(x + 3, y + 2, 2, 14)
    .fillRect(x + 11, y + 2, 2, 14);
  g.fillStyle(0xf4f1e6).fillRect(x + 4, y + 8, 8, 1);
  g.fillStyle(0xd23b2e).fillRect(x + 1, y - 4, 14, 6);
  g.fillStyle(0xf4f1e6).fillRect(x + 3, y - 3, 10, 1);
  g.fillStyle(0x8e8b82).fillRect(x + 14, y - 14, 1, 11);
  g.fillStyle(yellow).fillRect(x + 15, y - 14, 5, 4);
}

/** A small lateen-sail fishing boat moored off the beach. */
export function drawBoat(g: Graphics) {
  const x = 10 * T,
    y = 38 * T + 4;
  g.fillStyle(0xf4f1e6).fillRect(x, y, 22, 4);
  g.fillStyle(0x2f6db5).fillRect(x + 1, y + 4, 20, 2);
  g.fillStyle(0x6b4a2e).fillRect(x + 10, y - 14, 1, 14);
  g.fillStyle(0xfaf7ee).fillTriangle(
    x + 11,
    y - 14,
    x + 11,
    y - 2,
    x + 20,
    y - 3,
  );
}

/** Bar Tonet's terrace tables; string lights after dusk. */
export function drawTerrace(g: Graphics, lit: boolean) {
  for (const x of [20, 23]) {
    const px = x * T,
      y = 23 * T;
    g.fillStyle(0x6b6b6b).fillRect(px + 7, y + 4, 2, 8);
    g.fillStyle(0x9a6b3c).fillRect(px + 3, y + 8, 10, 3);
    g.fillStyle(0x4a4a4a)
      .fillRect(px + 1, y + 9, 2, 3)
      .fillRect(px + 13, y + 9, 2, 3);
    g.fillStyle(0xf4f1e6).fillRect(px, y - 1, 16, 4);
    for (let i = 0; i < 16; i += 4)
      g.fillStyle(geranium).fillRect(px + i, y - 1, 2, 4);
  }
  if (!lit) return;
  for (let x = 19 * T; x < 26 * T; x += 7) {
    g.fillStyle(0xffd889, 0.18).fillCircle(x + 1, 22 * T + 15, 5);
    g.fillStyle(0xffe6a8).fillRect(x, 22 * T + 14, 2, 2);
  }
}

/** The pharmacy’s green cross by the health centre; it glows at night. */
export function drawPharmacyCross(g: Graphics, lit: boolean) {
  const x = 33 * T + 5,
    y = 20 * T + 3;
  if (lit) g.fillStyle(0x3dff6a, 0.2).fillCircle(x + 3, y + 3, 9);
  g.fillStyle(lit ? 0x56f07a : 0x2e9e4f)
    .fillRect(x + 2, y, 3, 7)
    .fillRect(x, y + 2, 7, 3);
}

/** Planter orange trees: fruit in autumn and winter, blossom in spring. */
export const orangeTrees = [
  [5, 15],
  [11, 15],
  [21, 15],
  [31, 15],
  [45, 15],
  [51, 15],
  [27, 27],
  [34, 27],
  [27, 32],
  [34, 32],
] as const;
export function drawOrangeTrees(g: Graphics, quarter: number) {
  if (quarter === 3) return;
  const color = quarter === 2 ? 0xfffaf0 : orange;
  for (const [x, y] of orangeTrees)
    for (const [dx, dy] of [
      [4, 3],
      [10, 2],
      [7, 6],
      [11, 7],
      [5, 8],
    ])
      g.fillStyle(color).fillRect(
        x * T + dx,
        y * T + dy,
        2,
        quarter === 2 ? 1 : 2,
      );
}

/** Beach umbrellas and towels in summer. */
export function drawUmbrellas(g: Graphics) {
  for (const [x, colors] of [
    [6, [0xd23b2e, 0xf4f1e6]],
    [19, [0x2f6db5, 0xf2c230]],
    [36, [0x3e8e41, 0xf4f1e6]],
    [52, [0xf28c1e, 0xf4f1e6]],
  ] as const) {
    const px = x * T + 8,
      y = 35 * T;
    g.fillStyle(colors[0]).fillRect(px - 6, y + 5, 12, 6);
    g.fillStyle(0x6b6b6b).fillRect(px, y - 4, 1, 10);
    for (let i = 0; i < 4; i++)
      g.fillStyle(colors[i % 2]).fillTriangle(
        px,
        y - 6,
        px - 8 + i * 4,
        y - 1,
        px - 4 + i * 4,
        y - 1,
      );
  }
}

const bonfires = [
  [9, 35],
  [20, 35],
  [38, 35],
] as const;

/** Stalls, bunting and each fiesta’s centrepiece in the square or on the beach. */
export function drawFestival(g: Graphics, festival: string, minute: number) {
  for (const x of [28 * T + 8, 33 * T + 8]) {
    const y = 31 * T + 4;
    g.fillStyle(0x8a6440).fillRect(x - 11, y + 2, 22, 9);
    g.fillStyle(0xffffff).fillRect(x - 13, y - 6, 26, 7);
    for (let i = 0; i < 4; i++)
      g.fillStyle(festival === 'nou-octubre' ? red : 0x2f6db5).fillRect(
        x - 13 + i * 7,
        y - 6,
        3,
        7,
      );
    g.fillStyle(0x6b4a2e)
      .fillRect(x - 12, y + 1, 2, 11)
      .fillRect(x + 10, y + 1, 2, 11);
  }
  if (festival === 'falles') drawFalla(g, minute);
  else if (festival === 'reis') drawFloat(g);
  else if (festival === 'nou-octubre') {
    // Handkerchiefs and marzipan fruit on the right-hand stall.
    const x = 33 * T - 2,
      y = 31 * T + 6;
    g.fillStyle(0xf4f1e6)
      .fillRect(x, y, 5, 4)
      .fillRect(x + 7, y, 5, 4);
    g.fillStyle(orange).fillRect(x + 1, y + 1, 2, 2);
    g.fillStyle(0x6fbf4a).fillRect(x + 8, y + 1, 2, 2);
    g.fillStyle(geranium).fillRect(x + 14, y + 1, 2, 2);
  } else if (festival === 'sant-joan')
    for (const [x, y] of bonfires) {
      const px = x * T + 8,
        py = y * T + 12;
      g.fillStyle(0x6b4a2e)
        .fillRect(px - 7, py, 14, 2)
        .fillRect(px - 5, py - 2, 10, 2);
      g.fillStyle(0x9a9a9a)
        .fillCircle(px - 8, py + 1, 2)
        .fillCircle(px + 8, py + 1, 2);
      if (minute < 1200) continue;
      g.fillStyle(0xf28c1e).fillTriangle(px - 6, py, px + 6, py, px, py - 14);
      g.fillStyle(0xffd44a).fillTriangle(px - 3, py, px + 3, py, px, py - 8);
    }
}

/** A falla in the square: a seagull in sunglasses scolding tourists. */
function drawFalla(g: Graphics, minute: number) {
  const cx = 31 * T,
    base = 30 * T;
  g.fillStyle(0x7c5a3a).fillRect(cx - 22, base - 6, 44, 8);
  g.fillStyle(0xe8d7b0).fillRect(cx - 20, base - 8, 40, 3);
  // Little tourists with cameras.
  for (const [dx, color] of [
    [-16, 0xd23b2e],
    [-9, 0x2f6db5],
    [10, 0xf2c230],
    [16, 0x6fbf4a],
  ] as const) {
    g.fillStyle(color).fillRect(cx + dx - 2, base - 16, 5, 8);
    g.fillStyle(0xf1c9a5).fillCircle(cx + dx, base - 18, 3);
  }
  // The seagull.
  g.fillStyle(0xbfc6cc).fillTriangle(
    cx - 18,
    base - 30,
    cx - 4,
    base - 24,
    cx - 6,
    base - 40,
  );
  g.fillStyle(0xbfc6cc).fillTriangle(
    cx + 18,
    base - 30,
    cx + 4,
    base - 24,
    cx + 6,
    base - 40,
  );
  g.fillStyle(0xfafafa).fillEllipse(cx, base - 30, 22, 26);
  g.fillStyle(0xfafafa).fillCircle(cx + 2, base - 48, 9);
  g.fillStyle(0xf2a93b).fillTriangle(
    cx + 9,
    base - 50,
    cx + 9,
    base - 44,
    cx + 18,
    base - 47,
  );
  g.fillStyle(0x1e1e1e).fillRect(cx - 4, base - 52, 13, 4);
  g.fillStyle(0xf2a93b)
    .fillRect(cx - 5, base - 18, 3, 3)
    .fillRect(cx + 3, base - 18, 3, 3);
  if (minute >= 840 && minute < 960) {
    // Smoke from the two o’clock mascletà.
    for (const [dx, dy, r] of [
      [-30, -50, 9],
      [-18, -62, 11],
      [20, -58, 10],
      [32, -46, 8],
    ])
      g.fillStyle(0x9a9a9a, 0.45).fillCircle(cx + dx, base + dy, r);
  }
  if (minute >= 1320) {
    // La cremà: the falla burns before midnight.
    g.fillStyle(0xff8c1a, 0.25).fillCircle(cx, base - 30, 40);
    for (const [dx, h] of [
      [-18, 26],
      [-8, 40],
      [2, 52],
      [12, 38],
      [20, 24],
    ]) {
      g.fillStyle(0xf26b1d).fillTriangle(
        cx + dx - 6,
        base - 6,
        cx + dx + 6,
        base - 6,
        cx + dx,
        base - 6 - h,
      );
      g.fillStyle(0xffd44a).fillTriangle(
        cx + dx - 3,
        base - 6,
        cx + dx + 3,
        base - 6,
        cx + dx,
        base - 6 - h / 2,
      );
    }
  }
}

/** The Three Kings’ float with a golden star. */
function drawFloat(g: Graphics) {
  const x = 32 * T,
    y = 29 * T + 4;
  g.fillStyle(0x23407a).fillRect(x - 6, y, 34, 12);
  g.fillStyle(0xd9b44a)
    .fillRect(x - 6, y, 34, 2)
    .fillRect(x - 6, y + 10, 34, 2);
  g.fillStyle(0x3c3a3f)
    .fillCircle(x, y + 13, 3)
    .fillCircle(x + 22, y + 13, 3);
  for (const dx of [2, 11, 20])
    g.fillStyle(0xd9b44a).fillTriangle(
      x + dx - 3,
      y - 2,
      x + dx + 3,
      y - 2,
      x + dx,
      y - 6,
    );
  g.fillStyle(0xffe066).fillTriangle(
    x + 11,
    y - 22,
    x + 7,
    y - 12,
    x + 15,
    y - 12,
  );
  g.fillStyle(0xffe066).fillTriangle(
    x + 11,
    y - 9,
    x + 7,
    y - 19,
    x + 15,
    y - 19,
  );
  for (const [dx, dy, color] of [
    [-20, 30, 0xd23b2e],
    [-10, 36, 0x2f6db5],
    [4, 32, 0xf2c230],
    [-30, 38, 0x6fbf4a],
  ] as const)
    g.fillStyle(color).fillRect(x + dx, y + dy, 2, 2);
}

/** Bunting across the square in each fiesta’s colours. */
export function drawBunting(g: Graphics, festival: string) {
  const colors =
    festival === 'nou-octubre'
      ? [red, yellow]
      : festival === 'reis'
        ? [0xd9b44a, 0x23407a, 0xf4f1e6]
        : [geranium, 0x2f6db5, yellow, 0x3e8e41];
  const y = 27 * T + 12;
  g.lineStyle(1, 0x5c4a3a).lineBetween(27 * T, y, 35 * T, y);
  for (let i = 0; i < 16; i++) {
    const x = 27 * T + 2 + i * 8;
    g.fillStyle(colors[i % colors.length]).fillTriangle(
      x,
      y,
      x + 6,
      y,
      x + 3,
      y + 6,
    );
  }
}

/** A warm glow over the Sant Joan bonfires after dark. */
export function drawBonfireGlow(g: Graphics, time: number, reduced: boolean) {
  for (const [i, [x, y]] of bonfires.entries()) {
    const flicker = reduced ? 0 : Math.sin(time / 120 + i * 2) * 2;
    g.fillStyle(0xff9a3c, 0.14).fillCircle(x * T + 8, y * T + 4, 20 + flicker);
  }
}
