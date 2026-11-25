import type * as Phaser from 'phaser';

// Pure Phaser drawing for Andorinhas's tiles, tram, river and festivals, in
// town-map pixels (16 per tile); callers own the graphics objects.
type Graphics = Phaser.GameObjects.Graphics;
const tile = 16;
const cobalt = 0x2f5fa7;
const tramYellow = 0xf2c12e;

type Facade = {
  x0: number;
  x1: number;
  rows: number[];
  /** Window and door tiles the tiles go around, as `x,y`. */
  skip: string[];
  colors: [number, number];
};
// Azulejo facades: the apartments in blue, the pastelaria in yellow and blue,
// the Portuguese class in green; matches the town map's walls.
const facades: Facade[] = [
  {
    x0: 3,
    x1: 12,
    rows: [9, 10],
    skip: ['4,9', '6,9', '9,9', '11,9', '5,10', '10,10'],
    colors: [0xeef2f6, cobalt],
  },
  {
    x0: 8,
    x1: 12,
    rows: [21],
    skip: ['10,21'],
    colors: [0xfbf1d2, 0x2a6fb0],
  },
  {
    x0: 48,
    x1: 53,
    rows: [20, 21],
    skip: ['49,20', '51,20', '50,21'],
    colors: [0xeef6ee, 0x3c8a5a],
  },
];
// Pastel plaster on the registry and the health centre.
const washes: [number, number, number, number, number][] = [
  [41, 9, 5, 2, 0xf3b6a8],
  [26, 20, 5, 2, 0xf6dd8a],
];

/** Tile-faced walls and pastel plaster, painted over the wall tiles. */
export function drawFacades(g: Graphics) {
  for (const [x, y, w, h, color] of washes) {
    g.fillStyle(color, 0.45).fillRect(x * tile, y * tile, w * tile, h * tile);
  }
  for (const { x0, x1, rows, skip, colors } of facades)
    for (const y of rows)
      for (let x = x0; x <= x1; x++) {
        if (skip.includes(`${x},${y}`)) continue;
        const [base, ink] = colors;
        g.fillStyle(base).fillRect(x * tile, y * tile, tile, tile);
        for (const [dx, dy] of [
          [0, 0],
          [8, 0],
          [0, 8],
          [8, 8],
        ]) {
          const px = x * tile + dx;
          const py = y * tile + dy;
          g.fillStyle(ink)
            .fillRect(px + 3, py, 2, 8)
            .fillRect(px, py + 3, 8, 2);
          g.fillStyle(base).fillRect(px + 3, py + 3, 2, 2);
          g.lineStyle(1, ink, 0.35).strokeRect(px + 0.5, py + 0.5, 7, 7);
        }
      }
  // Frame the windows and doors set into the tiles.
  for (const { rows, skip } of facades)
    for (const y of rows)
      for (const cell of skip)
        if (cell.endsWith(`,${y}`)) {
          const x = Number(cell.split(',')[0]);
          g.lineStyle(1, 0x5b4636, 0.6).strokeRect(
            x * tile + 0.5,
            y * tile + 0.5,
            tile - 1,
            tile - 1,
          );
        }
}

/** Basalt setts and the tram track along the upper street. */
export function drawTramStreet(g: Graphics) {
  const top = 13 * tile;
  g.fillStyle(0x77736c).fillRect(0, top, 56 * tile, 2 * tile);
  for (let y = top; y < top + 2 * tile; y += 4)
    for (let x = (y / 4) % 2 ? 0 : 3; x < 56 * tile; x += 6)
      g.fillStyle(0x86827a).fillRect(x, y + 1, 4, 2);
  for (const y of [top + 10, top + 21]) {
    g.fillStyle(0x4a4744).fillRect(0, y, 56 * tile, 2);
    g.fillStyle(0xbdbab2).fillRect(0, y, 56 * tile, 1);
  }
}

/** The overhead wire, above everyone's heads. */
export function drawTramWire(g: Graphics) {
  g.lineStyle(1, 0x2f2d2b, 0.8).lineBetween(
    0,
    13 * tile - 6,
    56 * tile,
    13 * tile - 6,
  );
  for (let x = 40; x < 56 * tile; x += 160)
    g.lineStyle(1, 0x2f2d2b, 0.6).lineBetween(x, 11 * tile, x, 13 * tile - 6);
}

/** A yellow tram, its left end at `x`; windows glow after dusk. */
export function drawTram(g: Graphics, x: number, lit: boolean) {
  const y = 13 * tile + 2;
  g.fillStyle(0x2f2d2b).fillRect(x + 20, y - 8, 1, 8);
  g.fillStyle(0xd9d2c2).fillRect(x + 2, y, 44, 3);
  g.fillStyle(tramYellow).fillRect(x, y + 3, 48, 22);
  g.fillStyle(0xf4ead2).fillRect(x, y + 5, 48, 9);
  for (let i = 0; i < 5; i++)
    g.fillStyle(lit ? 0xffe6a0 : 0x4d5f6b).fillRect(x + 3 + i * 9, y + 6, 7, 7);
  g.fillStyle(0xb13a2a).fillRect(x, y + 22, 48, 3);
  g.fillStyle(0x2f2d2b)
    .fillRect(x + 6, y + 25, 6, 2)
    .fillRect(x + 36, y + 25, 6, 2);
  if (lit) g.fillStyle(0xffe6a0, 0.15).fillCircle(x + 24, y + 12, 26);
}

/** Black wave calçada on the largo, around its fountain. */
export function drawCalcada(g: Graphics) {
  const [x0, x1, y0, y1] = [26 * tile, 36 * tile, 27 * tile, 34 * tile];
  for (let y = y0 + 8; y < y1; y += 16)
    for (let x = x0; x < x1; x += 2) {
      const wave = Math.round(Math.sin((x - x0) / 10) * 3);
      if (x > 29 * tile && x < 33 * tile && y > 28 * tile && y < 31 * tile)
        continue;
      g.fillStyle(0x4a4744, 0.7).fillRect(x, y + wave, 2, 1);
    }
}

/** The fountain at the centre of the largo. */
export function drawFountain(g: Graphics, time: number, reduced: boolean) {
  const cx = 31 * tile;
  const cy = 30 * tile;
  g.fillStyle(0xcfc6b4).fillEllipse(cx, cy + 6, 34, 18);
  g.fillStyle(0x6fb6d8).fillEllipse(cx, cy + 5, 28, 12);
  g.fillStyle(0xe2dacb).fillRect(cx - 3, cy - 14, 6, 18);
  g.fillStyle(0xcfc6b4).fillEllipse(cx, cy - 14, 14, 5);
  const t = reduced ? 0 : time / 220;
  for (let i = 0; i < 4; i++) {
    const phase = (t + i) % 4;
    g.fillStyle(0xbfe4f5, 0.9).fillRect(
      cx - 6 + i * 4,
      cy - 18 + phase * 4,
      1,
      2,
    );
  }
}

/** The parish notice board beside the largo. */
export function drawBoard(g: Graphics) {
  const x = 26 * tile;
  const y = 32 * tile;
  g.fillStyle(0x6b4a2e)
    .fillRect(x + 3, y + 2, 2, 14)
    .fillRect(x + 11, y + 2, 2, 14);
  g.fillStyle(0x8a6440).fillRect(x, y - 6, 16, 10);
  g.fillStyle(0xf4efe1)
    .fillRect(x + 2, y - 4, 5, 6)
    .fillRect(x + 9, y - 4, 5, 6);
}

/** A stone table with stools, where the old men play cards. */
export function drawCardTable(g: Graphics) {
  const x = 34 * tile;
  const y = 31 * tile;
  g.fillStyle(0xb9b2a4).fillRect(x + 2, y + 2, 12, 7);
  g.fillStyle(0x9c9a92).fillRect(x + 6, y + 9, 4, 5);
  g.fillStyle(0x8e8b82)
    .fillRect(x - 3, y + 6, 4, 4)
    .fillRect(x + 15, y + 6, 4, 4);
  g.fillStyle(0xffffff)
    .fillRect(x + 5, y + 4, 2, 3)
    .fillRect(x + 9, y + 3, 2, 3);
}

/** The miradouro's balustrade, tiled bench backs and coin telescope. */
export function drawMiradouro(g: Graphics) {
  g.fillStyle(0xe8e0d0).fillRect(47 * tile, tile + 10, 8 * tile, 4);
  for (const x of [49, 52]) {
    g.fillStyle(0xeef2f6).fillRect(x * tile - 2, 3 * tile - 6, 20, 7);
    for (let i = 0; i < 5; i++)
      g.fillStyle(cobalt).fillRect(x * tile - 1 + i * 4, 3 * tile - 5, 2, 5);
  }
  const tx = 54 * tile - 6;
  const ty = 3 * tile;
  g.fillStyle(0x4a4a4a).fillRect(tx + 6, ty + 4, 2, 10);
  g.fillStyle(0x6b7d8a).fillRect(tx + 1, ty, 11, 5);
  g.fillStyle(0x2f2d2b).fillRect(tx + 11, ty + 1, 2, 3);
}

/** Washing lines across the lane and under the apartment eaves. */
export function drawLaundry(g: Graphics) {
  const lines: [number, number, number][] = [
    [13 * tile, 19 * tile, 6 * tile],
    [3 * tile + 2, 13 * tile - 2, 9 * tile - 3],
  ];
  const colors = [0xd8432f, 0xf3f0e6, 0x3c7fc2, 0xf2c12e, 0x7fb069];
  for (const [x0, x1, y] of lines) {
    g.lineStyle(1, 0x5c4a3a, 0.8).lineBetween(x0, y, x1, y + 2);
    for (let x = x0 + 6, i = 0; x < x1 - 4; x += 11, i++)
      g.fillStyle(colors[i % colors.length]).fillRect(
        x,
        y + 1,
        6,
        6 + (i % 2) * 2,
      );
  }
}

/** A red Metro sign on the station and a chalkboard at the tasca. */
export function drawSigns(g: Graphics) {
  g.fillStyle(0xd23a2b).fillRect(8 * tile + 2, 31 * tile + 2, 12, 12);
  g.fillStyle(0xffffff)
    .fillRect(8 * tile + 4, 31 * tile + 4, 2, 8)
    .fillRect(8 * tile + 10, 31 * tile + 4, 2, 8)
    .fillRect(8 * tile + 6, 31 * tile + 5, 1, 3)
    .fillRect(8 * tile + 9, 31 * tile + 5, 1, 3)
    .fillRect(8 * tile + 7, 31 * tile + 7, 2, 2);
  const x = 23 * tile;
  const y = 22 * tile;
  g.fillStyle(0x6b4a2e).fillTriangle(
    x + 2,
    y + 15,
    x + 8,
    y + 1,
    x + 14,
    y + 15,
  );
  g.fillStyle(0x2f3b34).fillRect(x + 4, y + 4, 8, 8);
  g.fillStyle(0xf4efe1)
    .fillRect(x + 5, y + 6, 6, 1)
    .fillRect(x + 5, y + 9, 4, 1);
}

/** The tasca's door lantern, lit after dusk. */
export function drawTascaLantern(g: Graphics, lit: boolean) {
  const x = 20 * tile + 4;
  const y = 21 * tile - 2;
  if (lit) g.fillStyle(0xffc46b, 0.2).fillCircle(x + 3, y + 5, 12);
  g.fillStyle(0x2f2d2b).fillRect(x + 1, y - 2, 4, 2);
  g.fillStyle(lit ? 0xffd27a : 0xc9a35a).fillRect(x, y, 6, 8);
}

/** The orange ferry crossing the Tagus and a few gulls. */
export function drawRiver(g: Graphics, time: number, reduced: boolean) {
  const width = 56 * tile;
  const span = width + 80;
  const x = reduced ? 9 * tile : ((time / 60) % span) - 60;
  const y = 37 * tile + 14;
  g.fillStyle(0xe0702c).fillRect(x, y + 8, 56, 8);
  g.fillStyle(0xf4f1ea).fillRect(x + 6, y, 44, 8);
  for (let i = 0; i < 5; i++)
    g.fillStyle(0x4d5f6b).fillRect(x + 9 + i * 8, y + 2, 5, 3);
  g.fillStyle(0x2f2d2b).fillRect(x + 26, y - 5, 4, 5);
  for (let i = 0; i < 3; i++) {
    const gx = reduced
      ? 200 + i * 220
      : (time / (25 + i * 6) + i * 300) % width;
    const gy =
      36 * tile + 4 + i * 9 + (reduced ? 0 : Math.sin(time / 500 + i) * 3);
    g.lineStyle(1, 0xffffff, 0.9)
      .lineBetween(gx - 3, gy - 2, gx, gy)
      .lineBetween(gx, gy, gx + 3, gy - 2);
  }
}

const stalls = [27 * tile + 8, 34 * tile + 8];
/** Festival stalls, garlands and each festival's own corner of the largo. */
export function drawFestival(g: Graphics, festival: string, lit: boolean) {
  const y = 32 * tile;
  for (const x of stalls) {
    g.fillStyle(0x8a6440).fillRect(x - 11, y + 4, 22, 9);
    g.fillStyle(0xffffff).fillRect(x - 13, y - 6, 26, 8);
    for (let i = 0; i < 4; i++)
      g.fillStyle(festival === 'cravos' ? 0xd8432f : 0x2a6fb0).fillRect(
        x - 13 + i * 7,
        y - 6,
        3,
        8,
      );
    g.fillStyle(0x6b4a2e)
      .fillRect(x - 12, y + 2, 2, 12)
      .fillRect(x + 10, y + 2, 2, 12);
  }
  if (festival === 'santos') {
    // Paper garlands zigzagging over the largo, and the sardine grill.
    const colors = [0xd8432f, 0xf2c12e, 0x2a6fb0, 0x7fb069, 0xf3a1c0];
    for (const row of [27 * tile + 10, 29 * tile + 2])
      for (let i = 0, x = 26 * tile; x < 36 * tile; x += 8, i++) {
        g.fillStyle(colors[i % colors.length]).fillTriangle(
          x,
          row,
          x + 7,
          row,
          x + 3,
          row + 6,
        );
        if (lit && i % 3 === 0)
          g.fillStyle(0xffe6a0, 0.25).fillCircle(x + 3, row + 1, 5);
      }
    g.fillStyle(0x2f2d2b).fillRect(32 * tile, y + 2, 14, 6);
    g.fillStyle(0xf07a2a).fillRect(32 * tile + 2, y + 3, 10, 2);
    for (const dx of [3, 7, 11])
      g.fillStyle(0xb7c3cc).fillRect(32 * tile + dx, y + 1, 3, 1);
    for (const [dx, dy] of [
      [4, -6],
      [8, -11],
    ])
      g.fillStyle(0xdddddd, 0.5).fillCircle(32 * tile + dx, y + dy, 3);
    for (const x of [stalls[0] - 8, stalls[0] + 4])
      g.fillStyle(0x3f8f4a).fillCircle(x, y - 9, 3);
  } else if (festival === 'cravos') {
    // Red carnations at the fountain and on the stalls.
    for (const [x, py] of [
      [29 * tile + 4, 29 * tile + 2],
      [32 * tile + 10, 29 * tile + 2],
      [stalls[0], y - 9],
      [stalls[1], y - 9],
    ]) {
      g.fillStyle(0x3f8f4a).fillRect(x + 1, py + 2, 1, 5);
      g.fillStyle(0xd8233a).fillCircle(x + 1, py + 1, 2);
    }
  } else if (festival === 'reis') {
    // A bolo-rei on the stall and a paper star on a pole.
    g.fillStyle(0xc98a3c).fillEllipse(stalls[0], y + 1, 14, 6);
    for (const [dx, c] of [
      [-4, 0xd8432f],
      [0, 0x3f8f4a],
      [4, 0xf2c12e],
    ] as const)
      g.fillStyle(c).fillRect(stalls[0] + dx, y, 2, 2);
    g.fillStyle(0x6b4a2e).fillRect(33 * tile, 27 * tile + 6, 1, 20);
    g.fillStyle(lit ? 0xffe066 : 0xf2c12e).fillTriangle(
      33 * tile - 5,
      27 * tile + 6,
      33 * tile + 6,
      27 * tile + 6,
      33 * tile,
      27 * tile - 3,
    );
  } else if (festival === 'magusto') {
    // A chestnut roaster drum on wheels, smoking.
    const x = 32 * tile;
    g.fillStyle(0x2f2d2b).fillRect(x, y, 16, 8);
    g.fillStyle(0xf07a2a).fillRect(x + 3, y + 2, 10, 2);
    g.fillStyle(0x4a4744)
      .fillCircle(x + 3, y + 10, 2)
      .fillCircle(x + 13, y + 10, 2);
    for (const [dx, dy] of [
      [5, -5],
      [9, -10],
      [6, -15],
    ])
      g.fillStyle(0xdddddd, 0.45).fillCircle(x + dx, y + dy, 3);
  }
}
