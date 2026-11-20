// אייקונים כקוד SVG, במקום אימוג'י. כל פונקציה מקבלת מחלקות CSS (גודל וצבע).
const svg = (cls, body, vb = '0 0 24 24') => `<svg class="${cls} inline-block shrink-0 align-middle" viewBox="${vb}" aria-hidden="true">${body}</svg>`;

export const I = {
  coin: (c = 'w-4 h-4') => svg(c, '<circle cx="12" cy="12" r="10" fill="#ffd23f" stroke="#2a0a12" stroke-width="2"/><path d="M12 2a10 10 0 0 1 0 20 7 10 0 0 0 0-20z" fill="#f5a30a"/><circle cx="12" cy="12" r="6.200" fill="none" stroke="#2a0a12" stroke-width="1.100" opacity=".55"/><path d="M12 8.200v7.600M9.800 10.400c.5-1.400 4.400-1.500 4.400.2 0 1.900-4.400.9-4.400 2.800 0 1.700 3.900 1.600 4.500.2" fill="none" stroke="#2a0a12" stroke-width="1.300" stroke-linecap="round"/><path d="M5.200 9.200Q6.600 5.800 10 4.400" fill="none" stroke="#fff" stroke-width="1.800" stroke-linecap="round"/>'),
  gem: (c = 'w-4 h-4') => svg(c, '<g stroke="#2a0a12" stroke-width=".9" stroke-linejoin="round" stroke-opacity=".7"><path d="M2 9 6 3 9.500 9z" fill="#b4f7ff"/><path d="M6 3h6L9.500 9z" fill="#7cecfa"/><path d="M12 3h6l-3.500 6z" fill="#49cce6"/><path d="M9.500 9 12 3l2.500 6z" fill="#d6fcff"/><path d="M18 3l4 6h-7.500z" fill="#2aa7cf"/><path d="M2 9h7.500L12 21.500z" fill="#3fd2ec"/><path d="M9.500 9h5L12 21.500z" fill="#19a6d2"/><path d="M14.500 9H22L12 21.500z" fill="#1280ad"/></g><path d="M6 3h12l4 6-10 12.500L2 9z" fill="none" stroke="#2a0a12" stroke-width="1.700" stroke-linejoin="round"/><path d="M5.200 7.600 7 4.800" fill="none" stroke="#fff" stroke-width="1.100" stroke-linecap="round"/><path d="M20 .8l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" fill="#fff" stroke="#2a0a12" stroke-width=".5"/>'),
  bolt: (c = 'w-4 h-4') => svg(c, '<defs><linearGradient id="blA" x1="0" y1="0" x2="0" y2="1"><stop offset=".5" stop-color="#ffe94d"/><stop offset=".5" stop-color="#ffb300"/></linearGradient></defs><path d="M13.500 1.500 5.500 13.200H11L9.500 22.500 18.500 10H13z" fill="url(#blA)" stroke="#2a0a12" stroke-width="1.700" stroke-linejoin="round"/><path d="M12.600 4.200 8.800 10.400" fill="none" stroke="#fff" stroke-width="1.200" stroke-linecap="round"/>'),
  trophy: (c = 'w-4 h-4') => svg(c, '<g stroke="#2a0a12" stroke-width="1.600" stroke-linejoin="round" stroke-linecap="round"><path d="M7 4h10v5.500a5 5 0 0 1-10 0z" fill="#ffd23f"/><path d="M12 4h5v5.500a5 5 0 0 1-5 5z" fill="#f5a30a" stroke="none"/><path d="M7 5.500H3.500c0 3.200 1.600 4.800 3.800 5M17 5.500h3.500c0 3.200-1.600 4.800-3.800 5" fill="none"/><path d="M10.500 14.500h3V18h-3z" fill="#f5a30a"/><path d="M7.500 21h9v-2.200a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1z" fill="#ffd23f"/></g><path d="M9 6.200V9" stroke="#fff" stroke-width="1.300" stroke-linecap="round"/>'),
  heart: (c = 'w-4 h-4') => svg(c, '<path d="M12 21s-8.500-5.200-8.500-11.200A4.800 4.800 0 0 1 12 7.200a4.800 4.800 0 0 1 8.500 2.600C20.500 15.800 12 21 12 21z" fill="currentColor" stroke="#2a0a12" stroke-width="1.700" stroke-linejoin="round"/><path d="M6.200 9.500c.2-1.800 1.500-2.700 2.900-2.600" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="1.500" stroke-linecap="round"/>'),
  check: (c = 'w-4 h-4') => svg(c, '<path d="M4.5 12.8 9.5 18 19.5 6.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>'),
  cross: (c = 'w-4 h-4') => svg(c, '<path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>'),
  gift: (c = 'w-8 h-8') => svg(c, '<g stroke="#2a0a12" stroke-width="1.500" stroke-linejoin="round"><rect x="3" y="9" width="18" height="12" rx="1.500" fill="#ff5d8f"/><rect x="2" y="6" width="20" height="4.500" rx="1.500" fill="#ff8fb5"/><path d="M12 6v15" stroke-width="2.600" stroke="#ffd23f"/><path d="M12 6C9 6 7 4.800 7.600 3.400 8.600 1.600 11.400 3.200 12 6zm0 0c3 0 5-1.200 4.400-2.600C15.400 1.600 12.600 3.200 12 6z" fill="#ffd23f"/></g><path d="M5 12v6" stroke="#fff" stroke-opacity=".7" stroke-width="1.300" stroke-linecap="round"/>'),
  spark: (c = 'w-4 h-4') => svg(c, '<path d="M12 1.5c.7 5.2 3.3 7.8 8.5 10.5-5.2 2.7-7.8 5.3-8.5 10.5C11.3 17.3 8.700 14.700 3.500 12 8.700 9.300 11.300 6.700 12 1.500z" fill="currentColor"/>'),
  lock: (c = 'w-4 h-4') => svg(c, '<rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round"/>'),
  sound: (c = 'w-5 h-5') => svg(c, '<path d="M4 9.500h4L13 5v14l-5-4.500H4z" fill="currentColor"/><path d="M16 9a4.500 4.500 0 0 1 0 6M18.500 6.500a8 8 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
  mute: (c = 'w-5 h-5') => svg(c, '<path d="M4 9.500h4L13 5v14l-5-4.500H4z" fill="currentColor"/><path d="M16 9.500l5 5M21 9.500l-5 5" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round"/>'),
  home: (c = 'w-6 h-6') => svg(c, '<path d="M3 11.5 12 4l9 7.500V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>'),
  bag: (c = 'w-6 h-6') => svg(c, '<path d="M5 8h14l-1.200 12.200a1 1 0 0 1-1 .8H7.200a1 1 0 0 1-1-.8z" fill="currentColor"/><path d="M9 8V6.500a3 3 0 0 1 6 0V8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
  users: (c = 'w-6 h-6') => svg(c, '<circle cx="9" cy="8" r="3.500" fill="currentColor"/><path d="M2.500 20c0-3.600 2.900-6 6.500-6s6.500 2.400 6.500 6z" fill="currentColor"/><circle cx="17" cy="9" r="2.800" fill="currentColor" opacity=".7"/><path d="M16.500 14.200c3 .1 5 2 5 5.800h-4.200c0-2.200-.4-4.200-.8-5.800z" fill="currentColor" opacity=".7"/>'),
  user: (c = 'w-6 h-6') => svg(c, '<circle cx="12" cy="8" r="4.200" fill="currentColor"/><path d="M4 21c0-4.400 3.600-7 8-7s8 2.600 8 7z" fill="currentColor"/>'),
  smile: (c = 'w-6 h-6') => svg(c, '<circle cx="12" cy="12" r="9.5" fill="#ffd34d" stroke="#c98a00" stroke-width="1.4"/><circle cx="8.8" cy="10" r="1.4" fill="#5a2a00"/><circle cx="15.2" cy="10" r="1.4" fill="#5a2a00"/><path d="M7.8 14.2c1 2.2 7.400 2.200 8.400 0" fill="none" stroke="#5a2a00" stroke-width="1.6" stroke-linecap="round"/>'),
};

// ---------- לוגואים לשחקנים (במקום תמונות) ----------
const PALETTES = [['#ff5a4d', '#a80f1d'], ['#ffd23f', '#d98200'], ['#ff9a3d', '#b83a0a'], ['#e8303f', '#6e0612'], ['#ffe27a', '#e0a000']];
const SYMBOLS = {
  crown: '<path d="M26 66 22 34l16 13 12-20 12 20 16-13-4 32z" /><rect x="26" y="68" width="48" height="8" rx="2"/>',
  bolt: '<path d="M56 18 30 56h18l-6 26 28-40H52z" />',
  star: '<path d="m50 20 8.600 19.400 21 2-15.800 14 4.700 20.600L50 64.700 31.500 76 36.200 55.400 20.400 41.400l21-2z" />',
  shield: '<path d="M50 20 74 28v20c0 15-10 25-24 32C36 73 26 63 26 48V28z" />',
  flame: '<path d="M52 18c2 12 16 18 16 36a18 18 0 0 1-36 0c0-8 4-13 8-17 0 6 3 9 6 9 -1-10 2-20 6-28z" />',
  gem: '<path d="M32 28h36l12 16-30 36L20 44z" />',
};
const SYMBOL_NAMES = Object.keys(SYMBOLS);
const KNOWN = { 'שמרית': 'crown', 'יוני הררי': 'star', 'שימי ביטון': 'bolt', 'אופיר שאול': 'flame' };
let emblemId = 0;
const hash = (str) => [...str].reduce((a, ch) => (a * 31 + ch.codePointAt(0)) >>> 0, 7);

/** לוגו עגול לשחקן: צבע וסמל לפי השם. */
export function emblem(name, cls = 'w-12 h-12', symbol) {
  const h = hash(name);
  const [c1, c2] = PALETTES[h % PALETTES.length];
  const sym = SYMBOLS[symbol] ? symbol : KNOWN[name] || SYMBOL_NAMES[(h >> 3) % SYMBOL_NAMES.length];
  const id = `em${emblemId++}`;
  return `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="${id}" cx="35%" cy="28%" r="85%"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs><circle cx="50" cy="50" r="48" fill="url(#${id})"/><circle cx="50" cy="50" r="42" fill="none" stroke="#fff6d6" stroke-opacity=".55" stroke-width="2.5"/><g fill="#fff6d6" stroke="#5a0710" stroke-opacity=".45" stroke-width="2.5" stroke-linejoin="round">${SYMBOLS[sym]}</g></svg>`;
}
