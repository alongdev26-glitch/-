// דמויות בסגנון אנימה, מצוירות בקוד (SVG): עיניים גדולות עם ברק, שיער עם פוני, לחיים ורודות, קו מתאר עבה.
const INK = '#2a0a12';

export const CHARACTERS = {
  hana: { bg: ['#ffd2e4', '#ff8fb8'], skin: '#ffe3d3', shade: '#f6bfa6', hair: '#ff8fc0', hairDark: '#d9558f', eye: '#3fd9a0', eyeDark: '#0b7a55', clothes: '#e8303f', style: 'long', acc: 'bow' },
  ren: { bg: ['#ffe9a8', '#ffb340'], skin: '#fbd8c0', shade: '#eeb394', hair: '#2b2442', hairDark: '#15101f', eye: '#ff5c5c', eyeDark: '#a31620', clothes: '#2c2f6b', style: 'spiky', acc: 'band' },
  kira: { bg: ['#d8ecff', '#7fb8ff'], skin: '#ffe6d6', shade: '#f4c4aa', hair: '#ffd85a', hairDark: '#e0a21a', eye: '#4aa6ff', eyeDark: '#124c9a', clothes: '#ff6a3d', style: 'twin', acc: 'none' },
  sora: { bg: ['#d7f6ff', '#52d6e8'], skin: '#fbdcc6', shade: '#efb99c', hair: '#4aa4ff', hairDark: '#2468c9', eye: '#ffd23f', eyeDark: '#b57a00', clothes: '#f5f5f5', style: 'short', acc: 'none' },
  mika: { bg: ['#ffe0c8', '#ff8a5c'], skin: '#fddcc8', shade: '#f0b99d', hair: '#e8532f', hairDark: '#a8301a', eye: '#8a4b2a', eyeDark: '#4d2412', clothes: '#7b3fe0', style: 'bob', acc: 'clip' },
  yuki: { bg: ['#ece4ff', '#a98bff'], skin: '#fff0e6', shade: '#f2cdbb', hair: '#eef2ff', hairDark: '#aab4e6', eye: '#a35bff', eyeDark: '#5a1fb0', clothes: '#14142e', style: 'long', acc: 'none' },
};
export const CHARACTER_IDS = Object.keys(CHARACTERS);

const KNOWN = { 'שמרית': 'kira', 'יוני הררי': 'ren', 'שימי ביטון': 'sora', 'אופיר שאול': 'hana' };
const hash = (str) => [...String(str)].reduce((a, ch) => (a * 31 + ch.codePointAt(0)) >>> 0, 7);
/** דמות קבועה לפי שם (לחברים ולבוטים). */
export const charByName = (name) => KNOWN[name] || CHARACTER_IDS[hash(name) % CHARACTER_IDS.length];

let uid = 0;
const mirror = (d) => `<g transform="translate(100 0) scale(-1 1)">${d}</g>`;

function backHair(c) {
  const p = (d) => `<path d="${d}" fill="${c.hair}"/>`;
  if (c.style === 'long') return p('M20 56 Q16 18 50 14 Q84 18 80 56 L86 96 Q74 102 64 94 L62 68 L38 68 L36 94 Q26 102 14 96 Z') + `<path d="M20 70 L16 96 Q26 102 36 94 L38 76 Z" fill="${c.hairDark}" opacity=".5"/>` + mirror(`<path d="M20 70 L16 96 Q26 102 36 94 L38 76 Z" fill="${c.hairDark}" opacity=".5"/>`);
  if (c.style === 'twin') return p('M22 50 Q20 18 50 15 Q80 18 78 50 Z') + p('M24 36 Q4 46 8 84 Q20 90 24 76 Q28 58 30 42 Z') + p(mirror('M24 36 Q4 46 8 84 Q20 90 24 76 Q28 58 30 42 Z').replace(/<\/?g[^>]*>/g, '')) .replace('<path d="', '<path transform="translate(100 0) scale(-1 1)" d="');
  if (c.style === 'bob') return p('M18 60 Q14 16 50 13 Q86 16 82 60 Q80 80 70 80 L30 80 Q20 80 18 60 Z');
  if (c.style === 'spiky') return p('M22 52 L14 36 L26 38 L22 22 L36 30 L38 12 L50 24 L62 12 L64 30 L78 22 L74 38 L86 36 L78 52 Z');
  return p('M22 52 Q20 18 50 15 Q80 18 78 52 Z'); // short
}
function frontHair(c) {
  const f = c.hair; const d = c.hairDark;
  const bangs = {
    long: 'M22 52 Q22 22 50 20 Q78 22 78 52 Q74 38 66 32 Q62 46 54 36 Q50 48 44 36 Q38 46 34 32 Q26 38 22 52 Z',
    twin: 'M22 50 Q22 22 50 20 Q78 22 78 50 Q72 34 64 30 Q60 44 52 34 Q46 44 40 32 Q30 36 22 50 Z',
    bob: 'M20 56 Q20 20 50 18 Q80 20 80 56 Q74 36 62 34 Q56 46 50 34 Q42 46 38 34 Q26 38 20 56 Z',
    spiky: 'M22 50 L24 24 L36 36 L42 16 L52 34 L62 14 L66 34 L78 22 L78 50 Q70 38 60 40 Q50 30 40 40 Q30 38 22 50 Z',
    short: 'M22 52 Q20 20 50 17 Q80 20 78 52 Q70 36 58 34 Q50 46 44 34 Q32 38 22 52 Z',
  }[c.style];
  const sideL = 'M22 50 Q20 66 26 78 Q30 66 30 48 Z';
  const side = c.style === 'spiky' || c.style === 'short' ? '' : `<path d="${sideL}" fill="${f}"/><path transform="translate(100 0) scale(-1 1)" d="${sideL}" fill="${f}"/>`;
  const ahoge = `<path d="M50 20 Q44 6 56 4 Q52 12 56 20 Z" fill="${f}"/>`;
  return `${side}<path d="${bangs}" fill="${f}"/>
    <path d="M30 36 Q34 28 42 26" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2.600" stroke-linecap="round"/>
    <path d="M56 28 Q62 27 66 31" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2" stroke-linecap="round"/>
    <path d="${bangs}" fill="none"/>${c.style === 'short' || c.style === 'long' || c.style === 'bob' ? ahoge : ''}`;
}
const accessory = (c) => ({
  bow: `<g stroke="${INK}" stroke-width="2" stroke-linejoin="round"><path d="M64 22 L78 14 L76 30 Z" fill="#ff3d5a"/><path d="M64 22 L52 12 L54 28 Z" fill="#ff3d5a"/><circle cx="64" cy="22" r="4" fill="#ffd23f"/></g>`,
  band: `<path d="M22 40 Q50 30 78 40 L78 46 Q50 36 22 46 Z" fill="#e8303f" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`,
  clip: `<g stroke="${INK}" stroke-width="1.800"><rect x="62" y="30" width="10" height="4" rx="2" fill="#ffd23f" transform="rotate(-24 67 32)"/><rect x="60" y="35" width="10" height="4" rx="2" fill="#ffd23f" transform="rotate(-24 65 37)"/></g>`,
  none: '',
}[c.acc]);

/** פנים של דמות לפי מזהה. cls = מחלקות CSS (גודל). */
export function animeFace(id, cls = 'w-12 h-12') {
  const c = CHARACTERS[id] || CHARACTERS.hana;
  const k = `af${uid++}`;
  const eye = (x) => `<g>
    <ellipse cx="${x}" cy="57" rx="8" ry="10.200" fill="#fff" stroke="${INK}" stroke-width="1.800"/>
    <ellipse cx="${x}" cy="58.500" rx="6.200" ry="8.200" fill="url(#${k}e)"/>
    <ellipse cx="${x}" cy="59.500" rx="3" ry="4.400" fill="${INK}"/>
    <circle cx="${x - 2.200}" cy="54.600" r="2.600" fill="#fff"/><circle cx="${x + 2.200}" cy="62" r="1.200" fill="#fff"/>
    <path d="M${x - 8.500} 52.500 Q${x} 45.500 ${x + 8.500} 52.500" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
  </g>`;
  return `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true"><defs>
    <linearGradient id="${k}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.bg[0]}"/><stop offset="1" stop-color="${c.bg[1]}"/></linearGradient>
    <linearGradient id="${k}e" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.eyeDark}"/><stop offset=".55" stop-color="${c.eye}"/><stop offset="1" stop-color="#fff" stop-opacity=".9"/></linearGradient>
    <clipPath id="${k}c"><circle cx="50" cy="50" r="49"/></clipPath></defs>
    <g clip-path="url(#${k}c)">
      <rect width="100" height="100" fill="url(#${k}b)"/>
      <g stroke="${INK}" stroke-width="2.200" stroke-linejoin="round" stroke-linecap="round">
        ${backHair(c)}
        <path d="M16 104 Q20 86 50 84 Q80 86 84 104 Z" fill="${c.clothes}"/>
        <path d="M40 84 L50 94 L60 84 Z" fill="#fff"/>
        <rect x="43" y="74" width="14" height="14" rx="4" fill="${c.skin}"/>
        <ellipse cx="50" cy="55" rx="25" ry="28" fill="${c.skin}"/>
        <path d="M27 52 Q50 60 73 52 Q73 36 50 34 Q27 36 27 52 Z" fill="${c.shade}" stroke="none" opacity=".75"/>
        ${frontHair(c)}
        ${accessory(c)}
      </g>
      <ellipse cx="31" cy="69" rx="5.500" ry="3" fill="#ff7b9c" opacity=".55"/><ellipse cx="69" cy="69" rx="5.500" ry="3" fill="#ff7b9c" opacity=".55"/>
      ${eye(38)}${eye(62)}
      <path d="M31 46 Q37 43 43 45M57 45 Q63 43 69 46" fill="none" stroke="${c.hairDark}" stroke-width="2.200" stroke-linecap="round"/>
      <path d="M49 67 q1 1 2 0" fill="none" stroke="${INK}" stroke-width="1.400" stroke-linecap="round"/>
      <path d="M44 73 Q50 78 56 73" fill="#ff6b78" stroke="${INK}" stroke-width="1.800" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <circle cx="50" cy="50" r="48" fill="none" stroke="${INK}" stroke-width="3"/></svg>`;
}
