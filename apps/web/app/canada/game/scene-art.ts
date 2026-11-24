import type * as Phaser from 'phaser';

// Pure Phaser drawing for Maple Harbour's harbourfront and festivals, in
// town-map pixels (16 per tile); callers own the graphics objects.
type Graphics = Phaser.GameObjects.Graphics;
type Rect = { x: number; y: number; width: number; height: number };
const red = 0xd52b1e;
const white = 0xf7f4ee;
const wood = 0x8a6440;
const darkWood = 0x5e4630;

/** A small Canadian flag with its maple leaf, top-left at (x, y). */
function flag(g: Graphics, x: number, y: number, size = 1) {
  const px = (dx: number, dy: number, w = 1, h = 1) =>
    g.fillRect(x + dx * size, y + dy * size, w * size, h * size);
  g.fillStyle(white);
  px(3, 0, 6, 7);
  g.fillStyle(red);
  px(0, 0, 3, 7);
  px(9, 0, 3, 7);
  // The leaf: a top point, two side lobes, a body and the stem.
  px(5.5, 1, 1, 1);
  px(5, 2, 2, 1);
  px(4, 3, 4, 1);
  px(3.5, 2.5, 1, 1);
  px(7.5, 2.5, 1, 1);
  px(4.5, 4, 3, 1);
  px(5.5, 5, 1, 1.5);
}

/** A flagpole whose base is at (x, base). */
export function drawFlagpole(
  g: Graphics,
  x: number,
  base: number,
  top: number,
) {
  g.fillStyle(0xbfc4c8).fillRect(x, top, 2, base - top);
  g.fillStyle(0x8e949a).fillRect(x - 1, base - 2, 4, 2);
  flag(g, x + 2, top + 1, 1.5);
}

/** Jellybean row houses: painted clapboard and roofs over the home block. */
export function drawRowHouses(g: Graphics) {
  const houses = [
    { from: 3, to: 5, wall: 0xf2c84b, roof: 0x2f4b6e },
    { from: 6, to: 9, wall: 0x3fb3b0, roof: 0x6b3a5e },
    { from: 10, to: 12, wall: 0xe2604f, roof: 0x2f5f4a },
  ];
  for (const { from, to, wall, roof } of houses) {
    const x = from * 16;
    const width = (to - from + 1) * 16;
    g.fillStyle(roof, 0.55).fillRect(x, 82, width, 60);
    // Clapboard on the wall tiles only, leaving windows and the door.
    for (let col = from; col <= to; col++)
      for (const row of [9, 10]) {
        const window = row === 9 && (col - 3) % 2 === 1;
        if (window || (row === 10 && col === 5)) continue;
        g.fillStyle(wall).fillRect(col * 16, row * 16, 16, 16);
        g.fillStyle(0x000000, 0.12);
        for (let line = 3; line < 16; line += 4)
          g.fillRect(col * 16, row * 16 + line, 16, 1);
      }
    g.fillStyle(0xffffff, 0.7).fillRect(x, 142, 1, 34);
  }
}

/** The blue hospital H by the entrance. */
export function drawHospitalSign(g: Graphics) {
  g.fillStyle(0x1f5fae).fillRect(402, 130, 12, 12);
  g.fillStyle(white)
    .fillRect(405, 132, 2, 8)
    .fillRect(409, 132, 2, 8)
    .fillRect(405, 135, 6, 2);
}

/** Pennant bunting under the newcomer centre's awning. */
export function drawWelcomeBunting(g: Graphics) {
  const colors = [red, 0xf2c84b, 0x3fb3b0, 0x6bbf59, 0x7b5ea7];
  g.lineStyle(1, 0x6b6b6b).lineBetween(770, 318, 862, 318);
  for (let i = 0; i < 12; i++)
    g.fillStyle(colors[i % colors.length]).fillTriangle(
      772 + i * 7,
      318,
      778 + i * 7,
      318,
      775 + i * 7,
      324,
    );
}

/** Plank lines on the boardwalk, the fishing wharf and the ferry pier. */
export function drawPlanks(g: Graphics) {
  g.fillStyle(0x5e4630, 0.25);
  for (let y = 563; y < 576; y += 4) g.fillRect(0, y, 896, 1);
  for (const [x0, x1, y0, y1] of [
    [352, 432, 576, 624],
    [80, 160, 576, 608],
  ])
    for (let x = x0 + 3; x < x1; x += 4) g.fillRect(x, y0, 1, y1 - y0);
}

/** Lobster traps stacked on the wharf, with buoys. */
export function drawLobsterTraps(g: Graphics) {
  for (const x of [352, 416]) {
    for (const [dx, dy] of [
      [1, 9],
      [8, 9],
      [4, 2],
    ]) {
      g.fillStyle(0x4f6b4a).fillRect(x + dx, 576 + dy, 8, 6);
      g.lineStyle(1, 0x2f3f2c).strokeRect(x + dx, 576 + dy, 8, 6);
    }
    g.fillStyle(0xf28c28).fillCircle(x + 14, 580, 2);
    g.fillStyle(0xf2c84b).fillCircle(x + 2, 580, 2);
  }
}

/** Two Muskoka chairs on the boardwalk. */
export function drawMuskokaChairs(g: Graphics) {
  for (const [x, color] of [
    [146, red],
    [162, 0xf2c84b],
  ] as const) {
    g.fillStyle(color)
      .fillRect(x + 3, 540, 10, 8)
      .fillRect(x + 2, 548, 12, 3)
      .fillRect(x + 3, 551, 2, 4)
      .fillRect(x + 11, 551, 2, 4);
    g.fillStyle(0x000000, 0.18).fillRect(x + 3, 543, 10, 1);
  }
}

/** A lobster boat moored east of the wharf. */
export function drawLobsterBoat(g: Graphics) {
  g.fillStyle(white).fillRect(440, 596, 40, 9);
  g.fillStyle(red).fillRect(440, 602, 40, 3);
  g.fillStyle(white).fillRect(462, 586, 12, 10);
  g.fillStyle(0x3d5a73).fillRect(464, 588, 8, 4);
  g.fillStyle(0x6b6b6b).fillRect(470, 578, 1, 8);
}

/** The lighthouse on its rock; the lantern glows after dusk. */
export function drawLighthouse(g: Graphics, lit: boolean) {
  for (let i = 0; i < 6; i++)
    g.fillStyle(i % 2 ? white : red).fillRect(800, 566 + i * 8, 12, 8);
  g.fillStyle(0x2b2b2b).fillRect(798, 558, 16, 3).fillRect(802, 554, 8, 4);
  g.fillStyle(lit ? 0xfff1a8 : 0xd8e4ea).fillRect(801, 561, 10, 5);
  if (lit) g.fillStyle(0xfff1a8, 0.2).fillCircle(806, 563, 14);
}

/** A sweeping lighthouse beam at night. */
export function drawBeam(g: Graphics, time: number, reduced: boolean) {
  const angle = reduced ? Math.PI : (time / 900) % (2 * Math.PI);
  const reach = 110;
  const x = 806 + Math.cos(angle) * reach;
  const y = 563 + Math.sin(angle) * reach * 0.35;
  const side = reach * 0.18;
  const nx = Math.cos(angle + Math.PI / 2) * side;
  const ny = Math.sin(angle + Math.PI / 2) * side;
  g.fillStyle(0xfff1a8, 0.13).fillTriangle(
    806,
    563,
    x + nx,
    y + ny,
    x - nx,
    y - ny,
  );
}

/** The harbour ferry crossing below the wharf, or docked at the pier. */
export function drawFerry(g: Graphics, time: number, reduced: boolean) {
  const span = 640;
  const phase = reduced ? 0 : (time / 60) % (2 * span);
  const x = 96 + (phase < span ? phase : 2 * span - phase);
  g.fillStyle(0x1f3f66).fillRect(x, 628, 44, 8);
  g.fillStyle(white).fillRect(x + 4, 621, 34, 7);
  g.fillStyle(0x86b7d8)
    .fillRect(x + 7, 623, 5, 3)
    .fillRect(x + 15, 623, 5, 3)
    .fillRect(x + 23, 623, 5, 3)
    .fillRect(x + 31, 623, 4, 3);
  g.fillStyle(0xf2c84b).fillRect(x + 18, 616, 6, 5);
}

/** Snow along the roof ridges in winter. */
export function drawRoofSnow(g: Graphics, buildings: Rect[]) {
  g.fillStyle(0xf7fbff);
  for (const { x, y, width } of buildings) {
    g.fillRect(x + 1, y + 1, width - 2, 4);
    for (let dx = 6; dx < width - 4; dx += 11) g.fillRect(x + dx, y + 5, 4, 2);
  }
}

/** The notice board at the green's corner. */
export function drawBoard(g: Graphics) {
  g.fillStyle(darkWood).fillRect(434, 514, 2, 14).fillRect(444, 514, 2, 14);
  g.fillStyle(wood).fillRect(431, 506, 18, 10);
  g.fillStyle(0xf4efe1).fillRect(433, 508, 6, 6).fillRect(441, 508, 6, 6);
  g.fillStyle(red).fillRect(435, 509, 2, 2);
}

/** Festival stalls, bunting and each holiday's set piece on the green. */
export function drawFestival(g: Graphics, festival: string, lit: boolean) {
  // A striped stall by the green-stall anchor.
  g.fillStyle(wood).fillRect(452, 512, 22, 10);
  g.fillStyle(white).fillRect(450, 502, 26, 8);
  for (let i = 0; i < 4; i++) g.fillStyle(red).fillRect(450 + i * 7, 502, 3, 8);
  g.fillStyle(darkWood).fillRect(451, 510, 2, 12).fillRect(473, 510, 2, 12);
  // Red and white bunting with bulbs.
  g.lineStyle(1, 0x5c4a3a).lineBetween(436, 470, 572, 470);
  for (let i = 0; i < 10; i++) {
    const x = 440 + i * 13;
    if (lit) g.fillStyle(0xffe6a0, 0.25).fillCircle(x + 3, 473, 5);
    g.fillStyle(i % 2 ? white : red).fillTriangle(
      x,
      470,
      x + 6,
      470,
      x + 3,
      476,
    );
  }
  if (festival === 'heritage-day') {
    // An outdoor rink, snowbanks and the maple taffy trough.
    g.fillStyle(white).fillEllipse(512, 492, 76, 30);
    g.fillStyle(0xbfe3f2).fillEllipse(512, 492, 70, 25);
    g.fillStyle(0xffffff, 0.6)
      .fillRect(490, 488, 18, 1)
      .fillRect(515, 495, 14, 1);
    g.fillStyle(wood).fillRect(528, 516, 30, 8);
    g.fillStyle(white).fillRect(530, 514, 26, 4);
    g.fillStyle(0xc9822a)
      .fillRect(533, 515, 5, 2)
      .fillRect(541, 515, 5, 2)
      .fillRect(549, 515, 5, 2);
  } else if (festival === 'victoria-day') {
    // Kites over the green, each with a tail.
    for (const [x, y, color] of [
      [476, 448, red],
      [512, 436, 0x3fb3b0],
      [548, 452, 0xf2c84b],
    ] as const) {
      g.fillStyle(color)
        .fillTriangle(x, y - 6, x - 5, y, x + 5, y)
        .fillTriangle(x, y + 8, x - 5, y, x + 5, y);
      g.lineStyle(1, 0x6b6b6b).lineBetween(x, y + 8, x - 4, y + 22);
      g.fillStyle(color)
        .fillRect(x - 3, y + 13, 2, 2)
        .fillRect(x - 4, y + 18, 2, 2);
    }
  } else if (festival === 'canada-day') {
    // A big maple-leaf flag banner and face-paint table.
    flag(g, 492, 478, 3);
    g.fillStyle(wood).fillRect(528, 516, 24, 8);
    g.fillStyle(red).fillRect(532, 514, 4, 2).fillRect(540, 514, 4, 2);
  } else if (festival === 'thanksgiving') {
    // A long potluck table, pumpkins and hay bales.
    g.fillStyle(darkWood).fillRect(484, 506, 2, 8).fillRect(546, 506, 2, 8);
    g.fillStyle(white).fillRect(480, 498, 72, 9);
    for (const [x, color] of [
      [488, 0xc9822a],
      [500, 0x6bbf59],
      [512, 0xe2604f],
      [524, 0xf2c84b],
      [536, 0x8a6440],
    ] as const)
      g.fillStyle(color).fillCircle(x, 500, 3);
    for (const [x, y] of [
      [472, 520],
      [560, 516],
      [566, 524],
    ])
      g.fillStyle(0xe8862a)
        .fillCircle(x, y, 4)
        .fillStyle(0x4f6b4a)
        .fillRect(x, y - 5, 1, 2);
    g.fillStyle(0xe2c15c).fillRect(536, 520, 14, 8).fillRect(500, 522, 14, 8);
    g.fillStyle(0xc9a24a).fillRect(536, 523, 14, 1).fillRect(500, 525, 14, 1);
  }
}

/** Canada Day fireworks above the waterfront. */
export function drawFireworks(g: Graphics, time: number, reduced: boolean) {
  const bursts = [
    [380, 520, red],
    [620, 488, white],
    [760, 532, 0xf2c84b],
  ] as const;
  bursts.forEach(([x, y, color], i) => {
    const t = reduced ? 0.6 : (time / 1400 + i / 3) % 1;
    const radius = 6 + t * 22;
    g.fillStyle(color, 1 - t * 0.8);
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * 2 * Math.PI;
      g.fillRect(x + Math.cos(a) * radius, y + Math.sin(a) * radius, 2, 2);
    }
  });
}
