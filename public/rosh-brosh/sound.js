// סאונד סינתטי (Web Audio): בלי קבצים. כל אפקט הוא פונקציה (ctx, dest, t) שמתזמנת צלילים
// על AudioContext או OfflineAudioContext, כך שאפשר גם לרנדר ולבדוק אותם בלי רמקול.

// ---------- פונקציות טהורות (נבדקות ב-vitest) ----------
/** עוצמת המתח 0..1 לפי הזמן שנשאר בתור. עולה ככל שהזמן נגמר. */
export function suspenseLevel(msLeft, msTotal) {
  if (!(msTotal > 0)) return 0;
  const f = 1 - Math.max(0, Math.min(1, msLeft / msTotal)); // 0 בתחילת התור, 1 בסופו
  return Math.round((0.15 + 0.85 * f * f) * 1000) / 1000;
}
/** הפרש בין דפיקות הלב בשניות: מהיר יותר עם המתח. */
export const heartbeatGap = (level) => 1.1 - 0.7 * Math.max(0, Math.min(1, level));
/** האם לתקתק עכשיו (5 השניות האחרונות של תור). */
export const shouldTick = (msLeft) => msLeft > 0 && msLeft <= 5000;

// ---------- בניית צלילים ----------
const note = (ctx, dest, { t, f, f2, dur = 0.2, type = 'sine', vol = 0.3, attack = 0.005 }) => {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + dur + 0.02);
};
let noiseBuf = null;
const noise = (ctx, dest, { t, dur = 0.15, vol = 0.2, f = 2000, q = 1, type = 'bandpass', f2 }) => {
  if (!noiseBuf || noiseBuf.sampleRate !== ctx.sampleRate) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf;
  const fl = ctx.createBiquadFilter();
  fl.type = type; fl.Q.value = q;
  fl.frequency.setValueAtTime(f, t);
  if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl).connect(g).connect(dest);
  s.start(t);
  s.stop(t + dur + 0.02);
};
const N = (semi, base = 440) => base * 2 ** (semi / 12); // תו לפי חצאי טונים מ-לה

export const EFFECTS = {
  tap: (c, d, t) => note(c, d, { t, f: 900, f2: 600, dur: 0.06, type: 'triangle', vol: 0.18 }),
  tab: (c, d, t) => { note(c, d, { t, f: N(3), dur: 0.07, type: 'triangle', vol: 0.2 }); note(c, d, { t: t + 0.05, f: N(10), dur: 0.1, type: 'triangle', vol: 0.2 }); },
  beep: (c, d, t) => note(c, d, { t, f: 660, dur: 0.12, type: 'square', vol: 0.12 }),
  start: (c, d, t) => { [0, 4, 7, 12].forEach((s, i) => note(c, d, { t: t + i * 0.07, f: N(s, 523), dur: 0.18, type: 'square', vol: 0.14 })); },
  correct: (c, d, t) => { note(c, d, { t, f: N(3, 523), dur: 0.14, type: 'triangle', vol: 0.3 }); note(c, d, { t: t + 0.09, f: N(10, 523), dur: 0.35, type: 'triangle', vol: 0.3 }); note(c, d, { t: t + 0.09, f: N(15, 523), dur: 0.3, type: 'sine', vol: 0.12 }); },
  wrong: (c, d, t) => { note(c, d, { t, f: 160, f2: 110, dur: 0.38, type: 'sawtooth', vol: 0.22 }); note(c, d, { t, f: 166, f2: 100, dur: 0.38, type: 'square', vol: 0.1 }); },
  life: (c, d, t) => { note(c, d, { t, f: 220, f2: 55, dur: 0.45, type: 'sine', vol: 0.4 }); noise(c, d, { t, dur: 0.2, vol: 0.12, f: 400, type: 'lowpass' }); },
  turn: (c, d, t) => noise(c, d, { t, dur: 0.28, vol: 0.5, f: 500, f2: 3500, q: 2 }),
  roundWin: (c, d, t) => { [0, 4, 7, 12].forEach((s, i) => note(c, d, { t: t + i * 0.1, f: N(s, 440), dur: 0.3, type: 'triangle', vol: 0.28 })); },
  roundLose: (c, d, t) => { [7, 3, 0, -5].forEach((s, i) => note(c, d, { t: t + i * 0.16, f: N(s - 12, 440), dur: 0.4, type: 'sawtooth', vol: 0.16 })); },
  fanfare: (c, d, t) => { [[0, 0], [0, 0.14], [0, 0.28], [4, 0.42], [7, 0.62], [12, 0.9]].forEach(([s, o]) => { note(c, d, { t: t + o, f: N(s, 523), dur: 0.5, type: 'square', vol: 0.12 }); note(c, d, { t: t + o, f: N(s - 12, 523), dur: 0.5, type: 'triangle', vol: 0.2 }); }); },
  defeat: (c, d, t) => { [0, -2, -4, -7].forEach((s, i) => note(c, d, { t: t + i * 0.22, f: N(s - 12, 440), dur: 0.5, type: 'triangle', vol: 0.25 })); },
  coin: (c, d, t) => { note(c, d, { t, f: 1318, dur: 0.07, type: 'square', vol: 0.1 }); note(c, d, { t: t + 0.07, f: 1760, dur: 0.22, type: 'square', vol: 0.1 }); },
  ding: (c, d, t) => { note(c, d, { t, f: 1568, dur: 0.5, type: 'sine', vol: 0.28 }); note(c, d, { t, f: 3136, dur: 0.3, type: 'sine', vol: 0.08 }); },
  rattle: (c, d, t) => { for (let i = 0; i < 9; i++) noise(c, d, { t: t + i * 0.09, dur: 0.06, vol: 0.3, f: 1800 + (i % 3) * 400, q: 4 }); },
  open: (c, d, t) => { noise(c, d, { t, dur: 0.25, vol: 0.12, f: 800, f2: 6000, q: 1.5 }); [0, 5, 9, 12, 16].forEach((s, i) => note(c, d, { t: t + 0.1 + i * 0.06, f: N(s, 880), dur: 0.3, type: 'sine', vol: 0.18 })); },
  tick: (c, d, t) => note(c, d, { t, f: 1800, f2: 1500, dur: 0.03, type: 'square', vol: 0.12 }),
  clock: (c, d, t) => { note(c, d, { t, f: 2200, f2: 1700, dur: 0.04, type: 'square', vol: 0.16 }); },
  levelUp: (c, d, t) => { [0, 4, 7, 12, 16, 19].forEach((s, i) => note(c, d, { t: t + i * 0.07, f: N(s, 523), dur: 0.3, type: 'triangle', vol: 0.22 })); },
  buy: (c, d, t) => { note(c, d, { t, f: 880, dur: 0.08, type: 'triangle', vol: 0.2 }); note(c, d, { t: t + 0.08, f: 1320, dur: 0.18, type: 'triangle', vol: 0.2 }); },
  error: (c, d, t) => { note(c, d, { t, f: 200, dur: 0.12, type: 'square', vol: 0.12 }); note(c, d, { t: t + 0.13, f: 150, dur: 0.16, type: 'square', vol: 0.12 }); },
};
/** כמה זמן (שניות) כל אפקט נמשך בערך, לבדיקות. */
export const EFFECT_SECONDS = { tap: 0.1, tab: 0.2, beep: 0.15, start: 0.5, correct: 0.5, wrong: 0.45, life: 0.5, turn: 0.3, roundWin: 0.8, roundLose: 1, fanfare: 1.5, defeat: 1.3, coin: 0.35, ding: 0.55, rattle: 0.9, open: 0.7, tick: 0.05, clock: 0.06, levelUp: 0.7, buy: 0.3, error: 0.35 };

// ---------- מנוע ----------
let ctx = null;
let master = null;
let fxGain = null;
let musicGain = null;
const state = { sfx: true, music: true, suspense: null, level: 0.15, beatTimer: 0, tickTimer: 0 };

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try {
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 6;
    master = ctx.createGain(); master.gain.value = 0.85;
    fxGain = ctx.createGain(); fxGain.gain.value = 1;
    musicGain = ctx.createGain(); musicGain.gain.value = 0.55;
    fxGain.connect(master); musicGain.connect(master); master.connect(comp).connect(ctx.destination);
  } catch { ctx = null; }
  return ctx;
}
/** לקרוא בתוך לחיצה ראשונה של המשתמש (חוק האוטופליי של הטלפונים). */
export function unlock() {
  const c = ensure();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
  return !!c;
}
export function configure({ sfx, music }) {
  if (sfx !== undefined) state.sfx = !!sfx;
  if (music !== undefined) { state.music = !!music; if (!state.music) stopSuspense(); }
}
export function play(name) {
  if (!state.sfx || !EFFECTS[name]) return;
  const c = ensure();
  if (!c || c.state !== 'running') return;
  try { EFFECTS[name](c, fxGain, c.currentTime + 0.01); } catch { /* שקט */ }
}

// ---------- מוזיקת מתח ----------
function drone(c) {
  const out = c.createGain(); out.gain.value = 0.0001;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220;
  const oscs = [[55, 'sawtooth', 0], [55.7, 'sawtooth', 0], [82.4, 'triangle', 0], [110, 'sine', 0]].map(([f, type]) => {
    const o = c.createOscillator(); o.type = type; o.frequency.value = f;
    const g = c.createGain(); g.gain.value = type === 'sawtooth' ? 0.12 : 0.18;
    o.connect(g).connect(lp); o.start(); return o;
  });
  const lfo = c.createOscillator(); lfo.frequency.value = 0.18;
  const lg = c.createGain(); lg.gain.value = 60; lfo.connect(lg).connect(lp.frequency); lfo.start();
  lp.connect(out).connect(musicGain);
  return { out, lp, oscs, lfo };
}
export function startSuspense() {
  if (!state.music || state.suspense) return;
  const c = ensure();
  if (!c) return;
  const d = drone(c);
  d.out.gain.exponentialRampToValueAtTime(0.5, c.currentTime + 0.8);
  state.suspense = d;
  const beat = () => {
    if (!state.suspense) return;
    const t = c.currentTime + 0.02;
    const v = 0.25 + 0.5 * state.level;
    note(c, musicGain, { t, f: 70, f2: 40, dur: 0.22, type: 'sine', vol: v });
    note(c, musicGain, { t: t + 0.17, f: 62, f2: 38, dur: 0.2, type: 'sine', vol: v * 0.7 });
    state.beatTimer = setTimeout(beat, heartbeatGap(state.level) * 1000);
  };
  beat();
}
/** level 0..1. משפיע על הסינון של הדרון ועל קצב הדפיקות. */
export function setSuspenseLevel(level) {
  state.level = Math.max(0, Math.min(1, level));
  const d = state.suspense;
  if (d && ctx) {
    d.lp.frequency.setTargetAtTime(180 + 900 * state.level, ctx.currentTime, 0.3);
    d.oscs[2].frequency.setTargetAtTime(82.4 * (1 + 0.12 * state.level), ctx.currentTime, 0.4);
  }
}
export function stopSuspense() {
  clearTimeout(state.beatTimer);
  clearInterval(state.tickTimer);
  const d = state.suspense;
  state.suspense = null;
  if (!d || !ctx) return;
  const t = ctx.currentTime;
  d.out.gain.cancelScheduledValues(t);
  d.out.gain.setTargetAtTime(0.0001, t, 0.12);
  setTimeout(() => { try { d.oscs.forEach((o) => o.stop()); d.lfo.stop(); d.out.disconnect(); } catch { /* ignore */ } }, 600);
}
/** תקתוק שעון בשניות האחרונות של תור: קורא לפונקציה כל פעם שעוברת שנייה שלמה. */
export function clockTick() { play('clock'); }

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend().catch(() => {});
    else ctx.resume().catch(() => {});
  });
}

/** לבדיקות: מרנדר אפקט לבופר ומחזיר סטטיסטיקה. */
export async function renderEffect(name, seconds = 2, rate = 22050) {
  const off = new OfflineAudioContext(1, Math.ceil(rate * seconds), rate);
  const g = off.createGain();
  g.connect(off.destination);
  EFFECTS[name](off, g, 0.01);
  const buf = await off.startRendering();
  const d = buf.getChannelData(0);
  let peak = 0; let bad = 0; let last = 0;
  for (let i = 0; i < d.length; i++) { const v = d[i]; if (!Number.isFinite(v)) { bad++; continue; } const a = Math.abs(v); if (a > peak) peak = a; if (a > 0.003) last = i; }
  return { peak, bad, seconds: last / rate };
}
