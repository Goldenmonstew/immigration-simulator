import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

test('sound waits for a gesture, changes seasonal tracks, and persists mute', async () => {
  const made: FakeAudio[] = [];
  class FakeAudio {
    loop = false;
    volume = 1;
    currentTime = 0;
    preservesPitch = true;
    playbackRate = 1;
    play = vi.fn(async () => {});
    pause = vi.fn();
    constructor(public src: string) {
      made.push(this);
    }
  }
  const saved = new Map<string, string>();
  vi.stubGlobal('Audio', FakeAudio);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => saved.get(key) ?? null,
    setItem: (key: string, value: string) => saved.set(key, value),
  });
  const sound = await import('../app/uk/game/sound');
  expect(sound.readMuted()).toBe(true);
  sound.setMuted(false);
  sound.setSoundSeason(1, false);
  sound.playSound('step');
  expect(made).toHaveLength(0);
  sound.unlockSound();
  expect(made[0].src).toContain('theme-9.ogg');
  expect(made[0].play).toHaveBeenCalledOnce();
  sound.setSoundSeason(2, false);
  expect(made[0].pause).toHaveBeenCalled();
  expect(made[1].src).toContain('theme-2.ogg');
  sound.setSoundSeason(3, true);
  expect(made[2].src).toContain('theme-5.ogg');
  sound.playSound('voice', 'margaret');
  const voice = made.at(-1)!;
  const firstPitch = voice.playbackRate;
  sound.playSound('voice', 'ade');
  expect(voice.playbackRate).not.toBe(firstPitch);
  sound.playSound('voice', 'yao-flatmate');
  expect(voice.playbackRate).toBeCloseTo(1.35);
  expect(voice.preservesPitch).toBe(false);
  sound.setMuted(true);
  expect(sound.readMuted()).toBe(true);
  const calls = voice.play.mock.calls.length;
  sound.playSound('voice', 'ade');
  expect(voice.play).toHaveBeenCalledTimes(calls);
  sound.setMuted(false);
  sound.hideSound(true);
  const music = made.find((a) => a.src.includes('theme-5'))!;
  expect(music.pause).toHaveBeenCalled();
  sound.stopSound();
});

test.each([
  ['sunny', 600, false, false, ['birds']],
  ['cloudy', 600, false, true, ['birds', 'water']],
  ['rain', 600, false, true, ['rain', 'water']],
  ['rain', 1300, false, false, ['rain']],
  ['snow', 600, false, true, ['water']],
  ['sunny', 419, false, false, []],
  ['sunny', 420, false, false, ['birds']],
  ['sunny', 1080, false, true, ['water']],
  ['rain', 600, true, true, ['room']],
  ['snow', 1300, true, false, ['room']],
] as const)(
  'ambience for %s at %i indoors=%s pond=%s',
  async (weather, minute, interior, nearPond, expected) => {
    const { selectAmbience } = await import('../app/uk/game/sound');
    expect(selectAmbience({ weather, minute, interior, nearPond })).toEqual(
      expected,
    );
  },
);

function audioContext() {
  vi.stubGlobal('localStorage', { getItem: () => null, setItem: vi.fn() });
  const nodes: {
    loop: boolean;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    connect: ReturnType<typeof vi.fn>;
    buffer?: unknown;
  }[] = [];
  const gains: {
    gain: {
      value: number;
      setValueAtTime: ReturnType<typeof vi.fn>;
      linearRampToValueAtTime: ReturnType<typeof vi.fn>;
      cancelScheduledValues: ReturnType<typeof vi.fn>;
    };
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  }[] = [];
  const context = {
    currentTime: 5,
    destination: {},
    resume: vi.fn(async () => {}),
    suspend: vi.fn(async () => {}),
    decodeAudioData: vi.fn(async (data) => data),
    createBufferSource: () => {
      const node = {
        loop: false,
        start: vi.fn(),
        stop: vi.fn(),
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
      nodes.push(node);
      return node;
    },
    createGain: () => {
      const gain = {
        gain: {
          value: 0.1,
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          cancelScheduledValues: vi.fn(),
        },
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
      gains.push(gain);
      return gain;
    },
  };
  const construct = vi.fn();
  vi.stubGlobal(
    'AudioContext',
    class {
      constructor() {
        construct();
        return context;
      }
    },
  );
  const fetch = vi.fn<
    (
      url: string,
    ) => Promise<{ ok: boolean; arrayBuffer: () => Promise<ArrayBuffer> }>
  >(async () => ({
    ok: true,
    arrayBuffer: async () => new ArrayBuffer(8),
  }));
  vi.stubGlobal('fetch', fetch);
  return { context, nodes, gains, construct, fetch };
}
const settleAudio = async () => {
  for (let i = 0; i < 10; i++) await Promise.resolve();
};

test('ambient loops wait for gesture and mute, deduplicate, fade on location change, suspend and stop', async () => {
  const { context, nodes, gains, construct, fetch } = audioContext();
  const sound = await import('../app/uk/game/sound');
  const outside = {
    weather: 'sunny' as const,
    minute: 600,
    interior: false,
    nearPond: true,
  };
  sound.setSoundEnvironment(outside);
  sound.unlockSound();
  expect(construct).not.toHaveBeenCalled();
  sound.setMuted(false);
  await settleAudio();
  expect(fetch.mock.calls.map((call) => call[0])).toEqual([
    '/game/assets/ambience/birds.ogg',
    '/game/assets/ambience/water.ogg',
  ]);
  expect(nodes).toHaveLength(2);
  for (const node of nodes) {
    expect(node.loop).toBe(true);
    expect(node.start).toHaveBeenCalledOnce();
  }
  for (const gain of gains)
    expect(
      gain.gain.linearRampToValueAtTime.mock.calls[0][0],
    ).toBeLessThanOrEqual(0.18);
  sound.setSoundEnvironment(outside);
  sound.unlockSound();
  await settleAudio();
  expect(nodes).toHaveLength(2);
  sound.setMuted(true);
  expect(context.suspend).toHaveBeenCalled();
  const resumes = context.resume.mock.calls.length;
  sound.hideSound(true);
  sound.setMuted(false);
  expect(context.resume).toHaveBeenCalledTimes(resumes);
  sound.hideSound(false);
  expect(context.resume).toHaveBeenCalledTimes(resumes + 1);
  sound.setSoundEnvironment({ ...outside, interior: true });
  await settleAudio();
  expect(nodes[0].stop).toHaveBeenCalledWith(5.35);
  expect(nodes[1].stop).toHaveBeenCalledWith(5.35);
  expect(fetch.mock.calls.at(-1)![0]).toContain('room.ogg');
  expect(nodes).toHaveLength(3);
  sound.stopSound();
  expect(nodes[2].stop).toHaveBeenCalledOnce();
  expect(nodes[2].disconnect).toHaveBeenCalled();
  expect(context.suspend).toHaveBeenCalled();
});

test.each(['hidden', 'muted', 'stopped', 'moved'] as const)(
  'a late audio download cannot start after %s',
  async (action) => {
    const { fetch, nodes } = audioContext();
    let resolve!: (value: {
      ok: boolean;
      arrayBuffer: () => Promise<ArrayBuffer>;
    }) => void;
    fetch.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const sound = await import('../app/uk/game/sound');
    sound.setMuted(false);
    sound.setSoundEnvironment({
      weather: 'rain',
      minute: 600,
      interior: false,
      nearPond: false,
    });
    sound.unlockSound();
    if (action === 'hidden') sound.hideSound(true);
    if (action === 'muted') sound.setMuted(true);
    if (action === 'stopped') sound.stopSound();
    if (action === 'moved')
      sound.setSoundEnvironment({
        weather: 'snow',
        minute: 1300,
        interior: false,
        nearPond: false,
      });
    resolve({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) });
    await settleAudio();
    expect(nodes).toHaveLength(0);
    if (action === 'hidden' || action === 'muted') {
      if (action === 'hidden') sound.hideSound(false);
      else sound.setMuted(false);
      await settleAudio();
      expect(nodes).toHaveLength(1);
      expect(fetch).toHaveBeenCalledOnce();
    }
  },
);

test('failed ambient downloads remain silent and can retry on the next gesture', async () => {
  const { fetch, nodes } = audioContext();
  fetch.mockRejectedValueOnce(new Error('offline'));
  const sound = await import('../app/uk/game/sound');
  sound.setMuted(false);
  sound.setSoundEnvironment({
    weather: 'rain',
    minute: 600,
    interior: false,
    nearPond: false,
  });
  sound.unlockSound();
  await settleAudio();
  expect(nodes).toHaveLength(0);
  sound.unlockSound();
  await settleAudio();
  expect(nodes).toHaveLength(1);
});
