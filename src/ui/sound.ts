// Little synthesized sound effects (Web Audio), so the game needs no audio files.
// Mobile browsers only allow sound after a tap, so the context is unlocked on the first pointer event.

const KEY = 'bigdeal-sound';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = readEnabled();
const listeners = new Set<(on: boolean) => void>();

function readEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

function audio(): AudioContext | null {
  if (!enabled) return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

if (typeof window !== 'undefined') {
  const unlock = () => audio();
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock);
}

export function soundOn(): boolean {
  return enabled;
}

export function setSoundOn(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* private mode: keep it for this visit only */
  }
  if (on) audio();
  listeners.forEach((f) => f(on));
}

export function onSoundChange(f: (on: boolean) => void) {
  listeners.add(f);
  return () => {
    listeners.delete(f);
  };
}

/** One shaped oscillator note. */
function tone(
  freq: number,
  start: number,
  dur: number,
  { type = 'sine', vol = 0.3, to }: { type?: OscillatorType; vol?: number; to?: number } = {},
) {
  const a = audio();
  if (!a || !master) return;
  const t = a.currentTime + start;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

/** A short burst of filtered noise: clicks, rattles, knocks. */
function noise(start: number, dur: number, { vol = 0.25, freq = 2000, q = 1 } = {}) {
  const a = audio();
  if (!a || !master) return;
  const t = a.currentTime + start;
  const len = Math.max(1, Math.floor(a.sampleRate * dur));
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  f.Q.value = q;
  const g = a.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(master);
  src.start(t);
}

export const sfx = {
  /** a soft rattle in a cup, then the dice settle gently on the table */
  dice() {
    // two soft shakes in the cup: muffled "tk-tk", not a crackle
    for (let shake = 0; shake < 2; shake++) {
      for (let k = 0; k < 4; k++) {
        const t = shake * 0.2 + k * 0.035 + Math.random() * 0.01;
        noise(t, 0.025, { vol: 0.08 + Math.random() * 0.04, freq: 600 + Math.random() * 300, q: 2 });
        tone(420 + Math.random() * 60, t, 0.03, { type: 'sine', vol: 0.04 });
      }
    }
    // the dice settle on the table: two gentle wooden "toc"s and two small bounces
    const toc = (t: number, vol: number) => {
      tone(220 + Math.random() * 40, t, 0.08, { type: 'sine', vol });
      noise(t, 0.02, { vol: vol * 0.6, freq: 700, q: 1.5 });
    };
    toc(0.5, 0.12);
    toc(0.56, 0.11);
    toc(0.66, 0.06);
    toc(0.73, 0.03);
  },
  /** a token hopping one space */
  step() {
    tone(660, 0, 0.06, { type: 'triangle', vol: 0.07, to: 880 });
  },
  /** coins in: bright rising "ding ding" */
  gain() {
    [988, 1319, 1568].forEach((f, i) => tone(f, i * 0.08, 0.25, { type: 'triangle', vol: 0.22 }));
    noise(0, 0.12, { vol: 0.12, freq: 6000, q: 0.7 });
  },
  /** money out: a falling "wah-wah" */
  loss() {
    tone(392, 0, 0.22, { type: 'sawtooth', vol: 0.12, to: 330 });
    tone(330, 0.22, 0.4, { type: 'sawtooth', vol: 0.12, to: 220 });
  },
  /** someone else's payment: a neutral coin clink */
  coin() {
    tone(1568, 0, 0.12, { type: 'triangle', vol: 0.16 });
    tone(2093, 0.06, 0.18, { type: 'triangle', vol: 0.12 });
  },
  /** cash register "ka-ching" for a purchase */
  buy() {
    noise(0, 0.06, { vol: 0.35, freq: 3000, q: 2 });
    noise(0.07, 0.05, { vol: 0.3, freq: 2200, q: 2 });
    [2093, 2637].forEach((f, i) => tone(f, 0.12 + i * 0.05, 0.6, { type: 'sine', vol: 0.22 }));
  },
  /** hammer knocks and a chime for a new house or hotel */
  build(hotel = false) {
    for (let i = 0; i < 3; i++) noise(i * 0.14, 0.07, { vol: 0.45, freq: 500, q: 1.5 });
    const notes = hotel ? [784, 988, 1175, 1568] : [784, 1047];
    notes.forEach((f, i) => tone(f, 0.45 + i * 0.09, 0.35, { type: 'triangle', vol: 0.2 }));
  },
  /** a friendly two-note chime for a closed trade */
  trade() {
    tone(880, 0, 0.3, { type: 'sine', vol: 0.22 });
    tone(1319, 0.14, 0.45, { type: 'sine', vol: 0.22 });
  },
  /** police siren, then the cell door slamming */
  jail() {
    for (let i = 0; i < 3; i++) {
      tone(740, i * 0.36, 0.18, { type: 'square', vol: 0.07 });
      tone(988, i * 0.36 + 0.18, 0.18, { type: 'square', vol: 0.07 });
    }
    noise(0.75, 0.25, { vol: 0.6, freq: 300, q: 0.8 });
    tone(110, 0.75, 0.35, { type: 'square', vol: 0.12, to: 70 });
  },
  /** creaky chest lid, then a magic sparkle */
  chest() {
    tone(180, 0, 0.35, { type: 'sawtooth', vol: 0.05, to: 260 });
    [1047, 1319, 1568, 2093, 2637].forEach((f, i) => tone(f, 0.4 + i * 0.07, 0.4, { type: 'sine', vol: 0.15 }));
  },
  /** a whoosh and a "?" ding for a chance card */
  chance() {
    noise(0, 0.3, { vol: 0.2, freq: 1200, q: 0.6 });
    tone(1175, 0.3, 0.35, { type: 'triangle', vol: 0.2 });
    tone(1568, 0.42, 0.4, { type: 'triangle', vol: 0.18 });
  },
  /** a soft button tap */
  tap() {
    tone(1200, 0, 0.05, { type: 'triangle', vol: 0.1, to: 1500 });
  },
  /** picking a character */
  pop() {
    tone(500, 0, 0.12, { type: 'sine', vol: 0.22, to: 1100 });
  },
  /** opening screen: a short cheerful jingle */
  intro() {
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.22, { type: 'triangle', vol: 0.18 }));
    tone(1319, 0.68, 0.5, { type: 'triangle', vol: 0.16 });
  },
  /** "יוצאים לדרך!": a rising start-of-game whoosh and chord */
  start() {
    tone(300, 0, 0.35, { type: 'sawtooth', vol: 0.06, to: 1200 });
    [784, 988, 1175, 1568].forEach((f) => tone(f, 0.32, 0.6, { type: 'triangle', vol: 0.12 }));
  },
  /** victory fanfare */
  win() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.14, 0.3, { type: 'triangle', vol: 0.22 }));
    [523, 659, 784].forEach((f) => tone(f * 2, 0.6, 0.8, { type: 'triangle', vol: 0.14 }));
  },
};
