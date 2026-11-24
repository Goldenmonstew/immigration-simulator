import type { Weather } from '@uk-immigration/game/core';

const files = {
  step: '1',
  voice: 'voice-1',
  menu: 'menu-1',
  coin: 'gold-1',
  achievement: 'succes',
};
export type SoundKind = keyof typeof files;
type Ambience = 'rain' | 'birds' | 'water' | 'room';
export type SoundEnvironment = {
  weather: Weather;
  minute: number;
  interior: boolean;
  nearPond: boolean;
};
export function selectAmbience({
  weather,
  minute,
  interior,
  nearPond,
}: SoundEnvironment): Ambience[] {
  if (interior) return ['room'];
  const layers: Ambience[] = [];
  if (weather === 'rain') layers.push('rain');
  else if (weather !== 'snow' && minute >= 420 && minute < 1080)
    layers.push('birds');
  if (nearPond) layers.push('water');
  return layers;
}
const ambienceVolumes = { rain: 0.12, birds: 0.18, water: 0.12, room: 0.07 };

/**
 * One country's music, effects and ambience. `voices` lists townsfolk in the
 * order that sets each voice's pitch.
 */
export function createSound({
  asset,
  storageKey,
  voices,
}: {
  asset: (path: string) => string;
  storageKey: (key: string) => string;
  voices: string[];
}) {
  // Audio is created only after a real pointer/key gesture in the game client.
  let unlocked = false;
  let muted = true;
  let music: HTMLAudioElement | undefined;
  let track = '';
  let desired = '';
  let hidden = false;
  const sounds = new Map<string, HTMLAudioElement>();
  function playSound(kind: SoundKind, npc = '') {
    if (!unlocked || muted || hidden) return;
    let audio = sounds.get(kind);
    if (!audio) {
      audio = new Audio(
        asset(`/assets/ninja-adventure/sounds/${files[kind]}.ogg`),
      );
      audio.volume = kind === 'step' ? 0.12 : 0.23;
      sounds.set(kind, audio);
    }
    audio.pause();
    audio.currentTime = 0;
    if (kind === 'voice') {
      audio.preservesPitch = false;
      audio.playbackRate = 0.8 + voices.indexOf(npc) / 20;
    }
    void audio.play().catch(() => {});
  }
  function syncMusic() {
    if (!unlocked || muted || hidden || !desired) {
      music?.pause();
      return;
    }
    if (track !== desired) {
      music?.pause();
      music = new Audio(desired);
      music.loop = true;
      music.volume = 0.17;
      track = desired;
    }
    void music?.play().catch(() => {});
  }
  function unlockSound() {
    unlocked = true;
    syncMusic();
    syncAmbience();
  }
  function setMuted(value: boolean) {
    muted = value;
    if (value) for (const audio of sounds.values()) audio.pause();
    syncMusic();
    syncAmbience();
    try {
      localStorage.setItem(storageKey('muted'), String(value));
    } catch {
      /* Storage may be unavailable. */
    }
  }
  function readMuted() {
    try {
      return localStorage.getItem(storageKey('muted')) !== 'false';
    } catch {
      return true;
    }
  }
  function setSoundSeason(quarter: number, festival: boolean) {
    desired = asset(
      `/assets/ninja-adventure/musics/theme-${festival ? 5 : [9, 2, 3, 4][quarter - 1]}.ogg`,
    );
    syncMusic();
    syncAmbience();
  }
  function hideSound(value: boolean) {
    hidden = value;
    if (value) for (const audio of sounds.values()) audio.pause();
    syncMusic();
    syncAmbience();
  }
  function stopSound() {
    desired = '';
    environment = [];
    for (const layer of ambience.values()) {
      layer.source.stop();
      layer.source.disconnect();
      layer.gain.disconnect();
    }
    ambience.clear();
    if (context) void context.suspend().catch(() => {});
    music?.pause();
    for (const audio of sounds.values()) audio.pause();
  }

  let context: AudioContext | undefined;
  let environment: Ambience[] = [];
  const ambience = new Map<
    Ambience,
    { source: AudioBufferSourceNode; gain: GainNode }
  >();
  const buffers = new Map<Ambience, Promise<AudioBuffer | undefined>>();
  const loading = new Set<Ambience>();
  function syncAmbience() {
    if (!unlocked || muted || hidden || !environment.length) {
      if (context) void context.suspend().catch(() => {});
      return;
    }
    if (!context) {
      if (typeof AudioContext === 'undefined') return;
      context = new AudioContext();
    }
    const ctx = context;
    void ctx.resume().catch(() => {});
    for (const kind of environment) {
      if (ambience.has(kind) || loading.has(kind)) continue;
      if (!buffers.has(kind)) {
        buffers.set(
          kind,
          fetch(asset(`/assets/ambience/${kind}.ogg`))
            .then((response) => {
              if (!response.ok) throw new Error('Audio unavailable');
              return response.arrayBuffer();
            })
            .then((data) => ctx.decodeAudioData(data))
            .catch(() => {
              buffers.delete(kind);
              return undefined;
            }),
        );
      }
      loading.add(kind);
      void buffers.get(kind)!.then((buffer) => {
        loading.delete(kind);
        if (
          !buffer ||
          muted ||
          hidden ||
          !environment.includes(kind) ||
          ambience.has(kind)
        )
          return;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(
          ambienceVolumes[kind],
          ctx.currentTime + 0.35,
        );
        source.connect(gain);
        gain.connect(ctx.destination);
        source.onended = () => {
          source.disconnect();
          gain.disconnect();
        };
        source.start();
        ambience.set(kind, { source, gain });
      });
    }
  }
  function setSoundEnvironment(value: SoundEnvironment) {
    const next = selectAmbience(value);
    if (next.join() === environment.join()) return;
    environment = next;
    for (const [kind, layer] of ambience) {
      if (next.includes(kind)) continue;
      const now = context!.currentTime;
      layer.gain.gain.cancelScheduledValues(now);
      layer.gain.gain.setValueAtTime(layer.gain.gain.value, now);
      layer.gain.gain.linearRampToValueAtTime(0, now + 0.35);
      layer.source.stop(now + 0.35);
      ambience.delete(kind);
    }
    syncAmbience();
  }
  return {
    playSound,
    unlockSound,
    setMuted,
    readMuted,
    setSoundSeason,
    hideSound,
    stopSound,
    selectAmbience,
    setSoundEnvironment,
  };
}
