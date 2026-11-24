import type * as Phaser from 'phaser';

// Pure Phaser drawing for Wattle Bay's seaside and town days, in town-map
// pixels (16 per tile); callers own the graphics objects and their depths.
type Graphics = Phaser.GameObjects.Graphics;
const white = 0xf2efe6;
const iron = 0xa9b0b4;
const ironDark = 0x878f95;
const sand = 0xe9d8a6;

/** Sand over the beach rows, a wet edge and foam on the water. */
export function drawBeach(g: Graphics) {
  g.fillStyle(sand).fillRect(16, 512, 864, 32);
  for (let i = 0; i < 160; i++) {
    const x = 16 + ((i * 53) % 864);
    const y = 513 + ((i * 29) % 30);
    g.fillStyle(i % 3 ? 0xd9c48c : 0xf4e7c2).fillRect(x, y, 1, 1);
  }
  g.fillStyle(0xd2bb84).fillRect(16, 541, 864, 3);
  g.fillStyle(0xffffff, 0.7);
  for (let x = 16; x < 880; x += 12) g.fillRect(x, 544 + ((x / 12) % 2), 8, 1);
}

/** Timber planks, rails and pylons for the jetty (columns 26–27). */
export function drawJetty(g: Graphics) {
  g.fillStyle(0x3f5f6e, 0.6);
  for (const x of [418, 444]) g.fillRect(x, 548, 2, 84);
  g.fillStyle(0x9a7650).fillRect(416, 541, 32, 83);
  g.fillStyle(0x7a5a3a);
  for (let y = 544; y < 624; y += 4) g.fillRect(416, y, 32, 1);
  g.fillStyle(0x6b4a2e);
  for (let y = 548; y < 624; y += 16)
    g.fillRect(415, y - 4, 2, 6).fillRect(447, y - 4, 2, 6);
  g.fillRect(415, 543, 2, 81).fillRect(447, 543, 2, 81);
  g.fillStyle(0x5b3f28).fillRect(416, 622, 32, 3);
}

/** A pelican resting on the jetty's last post. */
export function drawPelican(g: Graphics) {
  g.fillStyle(0x6b4a2e).fillRect(446, 614, 3, 10);
  g.fillStyle(white).fillRect(442, 606, 9, 7).fillRect(448, 601, 3, 6);
  g.fillStyle(0x2b2b2b).fillRect(442, 608, 3, 4).fillRect(449, 602, 1, 1);
  g.fillStyle(0xf0a04b).fillRect(451, 603, 6, 2);
  g.fillStyle(0xe58a3a).fillRect(451, 605, 4, 1);
}

/** Painted bathing boxes along the east beach (row 32). */
export function drawBathingBoxes(g: Graphics) {
  const stripes = [
    [0xd8432f, white],
    [0x2f6fb0, white],
    [0xf0c43a, 0x2f6fb0],
    [0x3f8a5a, white],
    [0xe27a2f, white],
    [0x7a4f9a, 0xf0c43a],
  ];
  stripes.forEach(([a, b], i) => {
    const x = 641 + i * 32;
    for (let s = 0; s < 14; s += 2)
      g.fillStyle(s % 4 ? b : a).fillRect(x + s, 516, 2, 12);
    g.fillStyle(a).fillTriangle(x - 1, 516, x + 15, 516, x + 7, 508);
    g.fillStyle(0x6b4a2e).fillRect(x + 5, 521, 4, 7);
  });
}

/** Red-and-yellow patrol flags and the lifesavers' tower. */
export function drawSurfPatrol(g: Graphics) {
  for (const x of [136, 238]) {
    g.fillStyle(0x6b6b6b).fillRect(x, 508, 1, 22);
    g.fillStyle(0xd8432f).fillRect(x + 1, 509, 8, 3);
    g.fillStyle(0xf0c43a).fillRect(x + 1, 512, 8, 3);
  }
  // The tower on stilts at (17, 32).
  g.fillStyle(0x6b4a2e)
    .fillRect(274, 516, 2, 12)
    .fillRect(284, 516, 2, 12)
    .fillRect(274, 520, 12, 1);
  g.fillStyle(0xd8432f).fillRect(272, 504, 16, 12);
  g.fillStyle(0xf0c43a).fillRect(272, 510, 16, 3);
  g.fillStyle(0x3c3a3f).fillRect(271, 502, 18, 2);
}

/** Corrugated-iron verandah and posts on the weatherboard cottage. */
export function drawCottage(g: Graphics) {
  g.fillStyle(iron).fillRect(30, 140, 116, 6);
  g.fillStyle(ironDark);
  for (let x = 31; x < 146; x += 3) g.fillRect(x, 140, 1, 6);
  g.fillStyle(white);
  for (const x of [33, 64, 112, 142]) g.fillRect(x, 146, 2, 30);
}

/** A rotary clothesline in the backyard, with washing on fine days. */
export function drawClothesline(g: Graphics, washing: boolean) {
  g.fillStyle(0x8e8b82).fillRect(167, 44, 2, 20);
  g.lineStyle(1, 0xb7b4aa)
    .lineBetween(155, 42, 181, 50)
    .lineBetween(155, 50, 181, 42)
    .strokeRect(157, 42, 22, 8);
  if (!washing) return;
  for (const [x, color] of [
    [158, 0xd8432f],
    [164, 0x2f6fb0],
    [172, 0xf2efe6],
    [176, 0xf0c43a],
  ] as const)
    g.fillStyle(color).fillRect(x, 43, 3, 5);
}

/** Cast-iron lace and posts on the Pelican's verandah, and its sign. */
export function drawPub(g: Graphics) {
  g.fillStyle(white);
  for (let x = 288; x < 416; x += 4) g.fillRect(x, 336, 2, 1);
  for (let x = 290; x < 416; x += 4) g.fillRect(x, 337, 1, 2);
  for (const x of [289, 318, 382, 412]) g.fillRect(x, 337, 2, 15);
  // A pelican on a navy board.
  g.fillStyle(0x24385a).fillRect(334, 300, 28, 12);
  g.fillStyle(white).fillRect(342, 304, 8, 5).fillRect(348, 302, 2, 4);
  g.fillStyle(0xf0a04b).fillRect(350, 303, 6, 2);
}

/** Warm verandah lights at the pub after dusk. */
export function drawPubLights(g: Graphics) {
  for (const x of [300, 330, 372, 402]) {
    g.fillStyle(0xffc46b, 0.16).fillCircle(x, 340, 10);
    g.fillStyle(0xffe3a3).fillRect(x - 1, 338, 2, 2);
  }
}

/** Shopfront signs: the milk bar, the café, the hospital and the post office. */
export function drawSigns(g: Graphics) {
  g.fillStyle(0xc8372d).fillRect(40, 306, 64, 10);
  g.fillStyle(white).fillRect(44, 310, 56, 2);
  g.fillStyle(0xf6d0a2).fillTriangle(94, 307, 100, 307, 97, 315);
  g.fillStyle(0xf2a7bb).fillCircle(97, 307, 3);
  g.fillStyle(0x2f6f6f).fillRect(140, 306, 56, 10);
  g.fillStyle(white).fillRect(164, 308, 7, 6).fillRect(171, 309, 2, 3);
  // The hospital's blue H sign.
  g.fillStyle(0x2f6fb0).fillRect(354, 84, 16, 16);
  g.fillStyle(white)
    .fillRect(358, 87, 2, 10)
    .fillRect(364, 87, 2, 10)
    .fillRect(360, 91, 4, 2);
  // A red band across the post office.
  g.fillStyle(0xd2452f).fillRect(768, 138, 96, 4);
  // The station's name board and platform canopy.
  g.fillStyle(iron).fillRect(30, 470, 132, 5);
  g.fillStyle(ironDark);
  for (let x = 31; x < 162; x += 3) g.fillRect(x, 470, 1, 5);
  g.fillStyle(white).fillRect(112, 458, 32, 8);
  g.fillStyle(0x24385a).fillRect(113, 459, 30, 1).fillRect(113, 464, 30, 1);
}

/** The foreshore rotunda at columns 27–29, rows 26–27. */
export function drawRotunda(g: Graphics) {
  g.fillStyle(0xd8d2c2).fillRect(433, 440, 46, 8);
  g.fillStyle(white);
  for (const x of [437, 449, 461, 473]) g.fillRect(x, 424, 3, 16);
  g.fillStyle(0x3f7a5a)
    .fillTriangle(430, 426, 482, 426, 456, 410)
    .fillRect(430, 424, 52, 3);
  g.fillStyle(0xd9b44a).fillRect(455, 406, 2, 5);
}

/** The community noticeboard at (17, 26), above its place cell. */
export function drawNoticeboard(g: Graphics) {
  g.fillStyle(0x6b4a2e).fillRect(275, 428, 2, 12).fillRect(283, 428, 2, 12);
  g.fillStyle(0x8a6440).fillRect(272, 418, 16, 12);
  g.fillStyle(0xf4efe1).fillRect(274, 420, 5, 6).fillRect(281, 421, 5, 5);
  g.fillStyle(0xd2452f).fillRect(276, 420, 1, 1).fillRect(283, 421, 1, 1);
}

/** The war memorial at (21, 27). */
export function drawMemorial(g: Graphics) {
  g.fillStyle(0x9c9a92).fillRect(337, 440, 14, 7);
  g.fillStyle(0xb7b4aa)
    .fillRect(340, 424, 8, 16)
    .fillTriangle(340, 424, 348, 424, 344, 417);
  g.fillStyle(0x8e8b82).fillRect(342, 430, 4, 1);
}

/** The free public barbecue under its shelter at (30–31, 29). */
export function drawBarbecue(g: Graphics) {
  g.fillStyle(0x3f7a5a).fillRect(478, 454, 36, 5);
  g.fillStyle(0x6b4a2e).fillRect(480, 459, 2, 20).fillRect(510, 459, 2, 20);
  g.fillStyle(0x8a8f94).fillRect(486, 467, 20, 9);
  g.fillStyle(0x3c3a3f).fillRect(488, 466, 16, 2);
}

/** Gulls on the sand and over the water; they rest after dusk. */
export function drawGulls(g: Graphics, time: number, reduced: boolean) {
  const t = reduced ? 0 : time;
  for (const [x, y] of [
    [312, 528],
    [356, 534],
    [566, 530],
    [598, 524],
  ]) {
    const hop = reduced ? 0 : Math.max(0, Math.sin(t / 700 + x) * 2);
    g.fillStyle(white).fillRect(x, y - hop, 5, 3);
    g.fillStyle(0x9aa3a8).fillRect(x + 1, y - hop, 3, 1);
    g.fillStyle(0xf0a04b).fillRect(x + 5, y + 1 - hop, 1, 1);
  }
  for (let i = 0; i < 3; i++) {
    const x = (i * 300 + t / (40 + i * 8)) % 896;
    const y = 572 + i * 14 + Math.sin(t / 500 + i) * 4;
    const flap = Math.floor(t / 220 + i) % 2;
    g.fillStyle(white)
      .fillRect(x, y, 2, 1)
      .fillRect(x + 4, y, 2, 1)
      .fillRect(x + 2, y + (flap ? 1 : -1), 2, 1);
  }
}

/** Bunting, stalls and each town day's own props on the foreshore. */
export function drawFestival(g: Graphics, festival: string, lit: boolean) {
  const colours =
    festival === 'footy-final'
      ? [0x2b2b2b, white]
      : festival === 'anzac-day'
        ? [0xb8392f, 0x3f7a5a]
        : festival === 'show-day'
          ? [0xd8432f, 0x2f6fb0, 0xf0c43a]
          : [0x3f8a5a, 0xf0c43a];
  g.lineStyle(1, 0x5c4a3a).lineBetween(290, 418, 426, 418);
  for (let i = 0; i < 11; i++) {
    const x = 294 + i * 12;
    g.fillStyle(colours[i % colours.length]).fillTriangle(
      x,
      419,
      x + 6,
      419,
      x + 3,
      425,
    );
  }
  if (festival !== 'anzac-day')
    for (const x of [338, 378]) {
      g.fillStyle(0x8a6440).fillRect(x - 10, 470, 20, 8);
      g.fillStyle(white).fillRect(x - 12, 458, 24, 8);
      for (let i = 0; i < 4; i++)
        g.fillStyle(colours[i % colours.length]).fillRect(
          x - 12 + i * 6,
          458,
          3,
          8,
        );
      g.fillStyle(0x6b4a2e)
        .fillRect(x - 11, 466, 2, 12)
        .fillRect(x + 9, 466, 2, 12);
    }
  if (festival === 'australia-day') {
    // Ceremony chairs before the rotunda, and beach-cricket stumps.
    g.fillStyle(0x3c3a3f);
    for (let i = 0; i < 6; i++) g.fillRect(436 + i * 7, 452, 4, 3);
    g.fillStyle(0xf2e2b0)
      .fillRect(400, 480, 1, 8)
      .fillRect(403, 480, 1, 8)
      .fillRect(406, 480, 1, 8);
    g.fillStyle(0xb8392f).fillCircle(412, 490, 1.5);
    g.fillStyle(0xd9d9d9, 0.6).fillCircle(494, 448, 4).fillCircle(500, 442, 3);
  } else if (festival === 'anzac-day') {
    // Wreaths of poppies at the memorial and a flag at half-mast.
    for (const x of [332, 356]) {
      g.fillStyle(0x3f7a5a).fillCircle(x, 450, 5);
      g.fillStyle(sand).fillCircle(x, 450, 2);
      for (const [dx, dy] of [
        [-3, -2],
        [3, -2],
        [0, 3],
      ])
        g.fillStyle(0xd2452f).fillRect(x + dx, 450 + dy, 2, 2);
    }
    g.fillStyle(0x8e8b82).fillRect(372, 404, 1, 44);
    g.fillStyle(0x24385a).fillRect(373, 420, 10, 6);
    g.fillStyle(0x3c3a3f);
    for (let i = 0; i < 6; i++) g.fillRect(320 + i * 7, 466, 4, 3);
  } else if (festival === 'footy-final') {
    // Two goal posts and two behind posts.
    g.fillStyle(white);
    for (const [x, h] of [
      [294, 26],
      [302, 40],
      [314, 40],
      [322, 26],
    ])
      g.fillRect(x, 476 - h, 2, h);
    g.fillStyle(0xb8392f).fillEllipse(420, 486, 6, 4);
  } else if (festival === 'show-day') {
    // A Ferris wheel on the lawn; its lights come on after dusk.
    const cx = 376,
      cy = 420,
      r = 20;
    g.fillStyle(0x8e8b82)
      .fillTriangle(cx - 14, 446, cx - 10, 446, cx, cy)
      .fillTriangle(cx + 10, 446, cx + 14, 446, cx, cy);
    g.lineStyle(2, 0xd8d8d8).strokeCircle(cx, cy, r);
    g.lineStyle(1, 0xb7b4aa);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const x = cx + Math.cos(a) * r,
        y = cy + Math.sin(a) * r;
      g.lineBetween(cx, cy, x, y);
      g.fillStyle([0xd8432f, 0x2f6fb0, 0xf0c43a, 0x3f8a5a][i % 4]).fillRect(
        x - 2,
        y,
        4,
        4,
      );
      if (lit) g.fillStyle(0xffe3a3).fillRect(x - 1, y - 2, 2, 2);
    }
    // A prize ribbon on the produce table.
    g.fillStyle(0x2f6fb0).fillCircle(378, 470, 3);
    g.fillStyle(0x2f6fb0).fillTriangle(376, 472, 380, 472, 378, 478);
  }
}

/** Glow for the Ferris wheel lights after dusk. */
export function drawShowLights(g: Graphics) {
  g.fillStyle(0xffc46b, 0.12).fillCircle(376, 420, 28);
}
