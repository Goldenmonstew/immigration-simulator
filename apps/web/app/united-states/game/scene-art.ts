import type * as Phaser from 'phaser';

// Pure Phaser drawing for Lakebend's street furniture and festivals, in
// town-map pixels (16 per tile); callers own the graphics objects.
type Graphics = Phaser.GameObjects.Graphics;
const steel = 0x3f4b47;
const steelLight = 0x5d6b66;
const flagRed = 0xb8343a;
const flagBlue = 0x2c3e78;

/**
 * The elevated L above the street's east lane (x 272–288), its shadow and
 * posts, and the covered stairs to the station entrance.
 */
export function drawElevated(g: Graphics) {
  g.fillStyle(0x000000, 0.18).fillRect(282, 0, 14, 640);
  for (let y = 24; y < 640; y += 48) {
    g.fillStyle(steel).fillRect(270, y, 3, 8).fillRect(287, y, 3, 8);
    g.lineStyle(1, steelLight).lineBetween(273, y + 1, 287, y + 7);
  }
  g.fillStyle(steel).fillRect(270, 0, 20, 640);
  g.fillStyle(steelLight).fillRect(270, 0, 2, 640).fillRect(288, 0, 2, 640);
  for (let y = 0; y < 640; y += 5)
    g.fillStyle(0x2c3431).fillRect(273, y, 14, 2);
  g.fillStyle(0x9aa3a7).fillRect(275, 0, 1, 640).fillRect(284, 0, 1, 640);
  // The platform canopy over the tracks and the stairs into the station.
  g.fillStyle(0x6d7f8c).fillRect(266, 98, 28, 52);
  g.fillStyle(0x4f606c).fillRect(266, 98, 28, 3);
  g.fillStyle(0x8c9aa3).fillRect(290, 116, 14, 26);
  for (let y = 120; y < 140; y += 5)
    g.fillStyle(0xb8d4e8).fillRect(293, y, 8, 2);
  // The blue line sign above the station door.
  g.fillStyle(0x1f6fb2).fillRect(326, 132, 28, 6);
  g.fillStyle(0xffffff).fillRect(330, 134, 20, 2);
}

/** A three-car train on the L, seen from above; `y` is the front car's top. */
export function drawTrain(g: Graphics, y: number, lit: boolean) {
  for (let car = 0; car < 3; car++) {
    const top = y - car * 46;
    if (top > 640 || top < -46) continue;
    g.fillStyle(0xc9cdd1).fillRect(273, top, 14, 44);
    g.fillStyle(flagRed).fillRect(273, top, 1, 44);
    g.fillStyle(flagBlue).fillRect(286, top, 1, 44);
    g.fillStyle(0x9aa1a7)
      .fillRect(276, top + 6, 8, 6)
      .fillRect(276, top + 30, 8, 6);
    if (lit && car === 0)
      g.fillStyle(0xfff1b0, 0.4).fillCircle(280, top + 46, 7);
  }
}

/** A blue mailbox at the corner by the three-flats. */
export function drawMailbox(g: Graphics) {
  g.fillStyle(0x23407a).fillRect(194, 197, 12, 10);
  g.fillStyle(0x23407a).fillCircle(200, 197, 6);
  g.fillStyle(0x1a2f5a).fillRect(195, 207, 2, 3).fillRect(203, 207, 2, 3);
  g.fillStyle(0xffffff).fillRect(197, 199, 6, 1);
}

/** The flag and the red steel sculpture beside the Federal Building. */
export function drawFederalPlaza(g: Graphics) {
  g.fillStyle(0xbfc4c8).fillRect(711, 86, 2, 56);
  g.fillStyle(0x8c9196).fillRect(708, 140, 8, 3);
  g.fillStyle(flagBlue).fillRect(713, 88, 6, 5);
  for (let i = 0; i < 4; i++)
    g.fillStyle(i % 2 ? 0xffffff : flagRed).fillRect(719, 88 + i * 2, 8, 2);
  // A tall red stabile with two legs and an arch.
  g.lineStyle(3, 0xd2452f);
  g.lineBetween(704, 176, 712, 146);
  g.lineBetween(712, 146, 720, 176);
  g.lineBetween(708, 160, 718, 152);
  g.lineBetween(712, 146, 716, 150);
}

/** The sand along the lakeshore and the planks of the pier. */
export function drawShore(g: Graphics) {
  g.fillStyle(0xe6d3a0).fillRect(752, 32, 16, 544);
  g.fillStyle(0xd8c48c);
  for (let y = 40; y < 576; y += 22) g.fillRect(755 + (y % 9), y, 2, 1);
  g.fillStyle(0xffffff, 0.6);
  for (let y = 36; y < 576; y += 12) g.fillRect(767, y, 2, 5);
  g.fillStyle(0x9a7148).fillRect(768, 480, 112, 32);
  g.fillStyle(0x7d5a37);
  for (let x = 772; x < 880; x += 8) g.fillRect(x, 480, 1, 32);
  for (let x = 772; x < 880; x += 24) g.fillRect(x, 510, 3, 4);
}

/** The pier light at the end of the pier, lit after dusk. */
export function drawLighthouse(g: Graphics, lit: boolean) {
  g.fillStyle(0x8b8f93).fillRect(880, 494, 14, 6);
  g.fillStyle(0xd2452f).fillRect(882, 466, 10, 28);
  g.fillStyle(0xffffff).fillRect(882, 474, 10, 4).fillRect(882, 484, 10, 4);
  g.fillStyle(0x3c3a3f).fillRect(881, 462, 12, 4);
  if (lit) g.fillStyle(0xfff1b0, 0.25).fillCircle(887, 460, 14);
  g.fillStyle(lit ? 0xfff1b0 : 0xb7c2c8).fillRect(884, 456, 6, 6);
  g.fillStyle(0x3c3a3f).fillTriangle(882, 456, 892, 456, 887, 450);
}

/** The hot dog cart on the beach by the pier. */
export function drawHotDogCart(g: Graphics) {
  g.fillStyle(0xbfc4c8).fillRect(753, 536, 14, 8);
  g.fillStyle(0x3c3a3f).fillCircle(756, 545, 2).fillCircle(764, 545, 2);
  g.fillStyle(0x6b6b6b).fillRect(759, 524, 1, 12);
  for (let i = 0; i < 4; i++)
    g.fillStyle(i % 2 ? 0xf2c84b : flagRed).fillRect(751 + i * 5, 521, 5, 4);
  g.fillStyle(0xe0a04a).fillRect(755, 538, 10, 2);
  g.fillStyle(0x4c8a3c).fillRect(756, 538, 8, 1);
}

/** The bandstand in Lakebend Park. */
export function drawBandstand(g: Graphics) {
  g.fillStyle(0xb9b2a4).fillRect(386, 454, 60, 8);
  g.fillStyle(0xf4efe1).fillRect(390, 436, 52, 18);
  for (const x of [390, 402, 414, 426, 438])
    g.fillStyle(0xffffff).fillRect(x, 436, 3, 18);
  g.fillStyle(0x2f6f5f)
    .fillTriangle(382, 438, 450, 438, 416, 418)
    .fillRect(384, 436, 64, 3);
  g.fillStyle(0xf2c84b).fillRect(414, 414, 4, 5);
}

/** The block club board at the park entrance. */
export function drawBoard(g: Graphics) {
  g.fillStyle(0x6b4a2e).fillRect(306, 470, 2, 10).fillRect(316, 470, 2, 10);
  g.fillStyle(0x8a6440).fillRect(303, 462, 18, 10);
  g.fillStyle(0xf4efe1).fillRect(305, 464, 6, 6).fillRect(313, 464, 6, 6);
  g.fillStyle(0x2f6db5).fillRect(306, 465, 4, 1);
}

const stall = (g: Graphics, x: number, a: number, b: number) => {
  g.fillStyle(0x8a6440).fillRect(x - 11, 506, 22, 10);
  for (let i = 0; i < 4; i++)
    g.fillStyle(i % 2 ? a : b).fillRect(x - 13 + i * 7, 496, 7, 8);
  g.fillStyle(0x6b4a2e)
    .fillRect(x - 12, 504, 2, 12)
    .fillRect(x + 10, 504, 2, 12);
};

/** Stalls and decorations for each festival; lanterns glow when `lit`. */
export function drawFestival(g: Graphics, festival: string, lit: boolean) {
  if (festival === 'polar-plunge') {
    stall(g, 344, 0xffffff, 0x2f6db5);
    stall(g, 472, 0xffffff, 0xd2452f);
    // Towels on the sand and a warming fire.
    for (const [y, c] of [
      [300, 0xd2452f],
      [330, 0x2f6db5],
      [360, 0xf2c84b],
    ] as const)
      g.fillStyle(c).fillRect(753, y, 13, 6);
    g.fillStyle(0x6b4a2e).fillRect(754, 430, 12, 3);
    g.fillStyle(0xf08a2e).fillTriangle(754, 430, 766, 430, 760, 418);
    g.fillStyle(0xffd36b).fillTriangle(757, 430, 763, 430, 760, 423);
  } else if (festival === 'cinco-de-mayo') {
    stall(g, 344, 0x2f9e5b, 0xffffff);
    stall(g, 472, 0xd2452f, 0xffffff);
    const colors = [0xe94f8a, 0xf2c84b, 0x2f9e5b, 0x2f6db5, 0xf08a2e];
    for (const y of [478, 488]) {
      g.lineStyle(1, 0x5c4a3a).lineBetween(368, y, 432, y);
      for (let i = 0; i < 10; i++)
        g.fillStyle(colors[i % 5]).fillRect(369 + i * 6, y + 1, 5, 4);
    }
  } else if (festival === 'fourth-of-july') {
    stall(g, 344, flagRed, 0xffffff);
    stall(g, 472, flagBlue, 0xffffff);
    // Bunting on the bandstand rail.
    for (let i = 0; i < 6; i++) {
      const c = [flagRed, 0xffffff, flagBlue][i % 3];
      g.fillStyle(c).fillTriangle(
        390 + i * 9,
        440,
        399 + i * 9,
        440,
        394 + i * 9,
        446,
      );
    }
    for (const x of [370, 430]) {
      g.fillStyle(0xbfc4c8).fillRect(x, 470, 1, 14);
      g.fillStyle(flagBlue).fillRect(x + 1, 470, 3, 3);
      g.fillStyle(flagRed)
        .fillRect(x + 4, 470, 5, 1)
        .fillRect(x + 1, 474, 8, 1);
    }
  } else if (festival === 'halloween') {
    stall(g, 344, 0xf08a2e, 0x3c3a3f);
    stall(g, 472, 0x7a3fa0, 0x3c3a3f);
    for (const [x, y] of [
      [380, 462],
      [450, 462],
      [372, 492],
      [458, 492],
      [74, 168],
      [100, 168],
    ]) {
      if (lit) g.fillStyle(0xffb347, 0.22).fillCircle(x + 3, y + 3, 9);
      g.fillStyle(0xe8761e).fillCircle(x + 3, y + 3, 4);
      g.fillStyle(0x4c8a3c).fillRect(x + 2, y - 2, 2, 2);
      g.fillStyle(lit ? 0xffe39a : 0x5a2d0c)
        .fillRect(x + 1, y + 2, 1, 1)
        .fillRect(x + 4, y + 2, 1, 1)
        .fillRect(x + 1, y + 4, 4, 1);
    }
    g.lineStyle(1, 0xe8e8e8, 0.7)
      .lineBetween(390, 438, 398, 446)
      .lineBetween(394, 438, 390, 446);
  }
}

/** Fireworks over the lake on the Fourth of July night. */
export function drawFireworks(g: Graphics, time: number, reduced: boolean) {
  const colors = [0xff5a5a, 0xffffff, 0x6aa8ff, 0xffd36b];
  for (let i = 0; i < 4; i++) {
    const phase = reduced ? 0.6 : (((time / 1600 + i * 0.27) % 1) + 1) % 1;
    const cx = 790 + ((i * 37) % 80);
    const cy = 280 + ((i * 53) % 150);
    const r = 5 + phase * 26;
    g.fillStyle(colors[i], 0.25 * (1 - phase)).fillCircle(cx, cy, r);
    g.fillStyle(colors[i], 1 - phase * 0.7);
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      g.fillRect(cx + Math.cos(a) * r - 1, cy + Math.sin(a) * r - 1, 3, 3);
    }
  }
}
