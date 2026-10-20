import { useId } from 'react';

/** One cut diamond, centred on (x, y). */
function Gem({ x, y, s = 1, r = 0 }: { x: number; y: number; s?: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <polygon points="-8,-3 8,-3 0,9" fill="#1f8fe0" />
      <polygon points="-8,-3 -3,-3 0,9" fill="#2aa8f0" />
      <polygon points="3,-3 8,-3 0,9" fill="#0b6fc4" />
      <polygon points="-4,-8 4,-8 8,-3 -8,-3" fill="#8fe3ff" />
      <polygon points="-4,-8 4,-8 3,-3 -3,-3" fill="#e6fbff" />
      <polygon points="-4,-8 -3,-3 -8,-3" fill="#bff3ff" />
      <polygon points="4,-8 8,-3 3,-3" fill="#6fd6ff" />
      <polygon points="-8,-3 8,-3 0,9" fill="none" stroke="#0b4f8f" strokeWidth="0.8" strokeLinejoin="round" />
      <polygon points="-4,-8 4,-8 8,-3 -8,-3" fill="none" stroke="#0b4f8f" strokeWidth="0.8" strokeLinejoin="round" />
    </g>
  );
}

/** Drawings for the diamond packs: a pouch, a bag, a crate and a vault, each fuller than the last. */
export function GemPackArt({ kind }: { kind: 0 | 1 | 2 | 3 }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 64 64" className="gem-art" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}p`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c48bff" />
          <stop offset="1" stopColor="#6a2fc4" />
        </linearGradient>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c47a3a" />
          <stop offset="1" stopColor="#7a3f14" />
        </linearGradient>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8a95a" />
          <stop offset="1" stopColor="#a8642a" />
        </linearGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e3e8f0" />
          <stop offset="0.5" stopColor="#9aa6b8" />
          <stop offset="1" stopColor="#5d6878" />
        </linearGradient>
        <radialGradient id={`${id}g`}>
          <stop offset="0" stopColor="#fff3a8" />
          <stop offset="1" stopColor="#fff3a8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {kind === 0 && (
        // a small drawstring pouch with two diamonds peeking out
        <g>
          <Gem x={27} y={17} s={0.8} r={-12} />
          <Gem x={37} y={16} s={0.85} r={10} />
          <path d="M20 31 Q12 54 32 57 Q52 54 44 31 Z" fill={`url(#${id}p)`} stroke="#3d1580" strokeWidth="1.6" />
          <path d="M21 30 Q24 21 32 25 Q40 21 43 30 Z" fill="#a46bf0" stroke="#3d1580" strokeWidth="1.6" strokeLinejoin="round" />
          <rect x="19" y="28.5" width="26" height="4" rx="2" fill="#ffd23f" stroke="#8a5a00" strokeWidth="1" />
          <path d="M44 31 q6 2 4 8" fill="none" stroke="#ffd23f" strokeWidth="2" strokeLinecap="round" />
          <path d="M25 40 Q24 48 29 52" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="2.4" strokeLinecap="round" />
          <Gem x={33} y={44} s={0.55} />
        </g>
      )}

      {kind === 1 && (
        // an open leather bag full of diamonds
        <g>
          <path d="M22 28 Q22 11 32 11 Q42 11 42 28" fill="none" stroke="#5a2a0a" strokeWidth="4" strokeLinecap="round" />
          <Gem x={21} y={26} s={0.8} r={-15} />
          <Gem x={43} y={26} s={0.8} r={15} />
          <Gem x={32} y={23} s={0.9} />
          <Gem x={26.5} y={28} s={0.75} r={8} />
          <Gem x={37.5} y={28} s={0.75} r={-8} />
          <rect x="9" y="29" width="46" height="27" rx="8" fill={`url(#${id}l)`} stroke="#4a2008" strokeWidth="1.6" />
          <path d="M9 37 H55" stroke="#4a2008" strokeWidth="1.4" />
          <path d="M14 33 h36" stroke="#fff" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
          <rect x="27" y="34" width="10" height="8" rx="2" fill="#ffd23f" stroke="#8a5a00" strokeWidth="1.2" />
          <circle cx="32" cy="38" r="1.6" fill="#8a5a00" />
        </g>
      )}

      {kind === 2 && (
        // a wooden crate overflowing with diamonds
        <g>
          <Gem x={16} y={24} s={0.8} r={-20} />
          <Gem x={48} y={23} s={0.8} r={18} />
          <Gem x={25} y={21} s={0.9} r={-6} />
          <Gem x={39} y={20} s={0.9} r={8} />
          <Gem x={32} y={16} s={1} />
          <Gem x={20} y={28} s={0.75} />
          <Gem x={32} y={27} s={0.8} />
          <Gem x={44} y={28} s={0.75} />
          <rect x="8" y="30" width="48" height="27" rx="2" fill={`url(#${id}w)`} stroke="#5a3010" strokeWidth="1.6" />
          <path d="M8 39 H56 M8 48 H56" stroke="#7a4518" strokeWidth="1.4" />
          <path d="M10 32 L54 55 M54 32 L10 55" stroke="#7a4518" strokeWidth="2.4" strokeOpacity="0.8" />
          <rect x="8" y="30" width="5" height="27" fill="#8a5220" />
          <rect x="51" y="30" width="5" height="27" fill="#8a5220" />
          <g fill="#c9ced8" stroke="#5d6878" strokeWidth="0.8">
            <rect x="7" y="29" width="7" height="5" rx="1" />
            <rect x="50" y="29" width="7" height="5" rx="1" />
            <rect x="7" y="53" width="7" height="5" rx="1" />
            <rect x="50" y="53" width="7" height="5" rx="1" />
          </g>
        </g>
      )}

      {kind === 3 && (
        // an open steel vault glowing with diamonds
        <g>
          <rect x="6" y="9" width="44" height="47" rx="5" fill={`url(#${id}s)`} stroke="#3a4352" strokeWidth="1.6" />
          <rect x="11" y="14" width="34" height="37" rx="3" fill="#1d2433" />
          <circle cx="28" cy="34" r="20" fill={`url(#${id}g)`} />
          <path d="M11 33 H45" stroke="#3a4352" strokeWidth="1.4" />
          <Gem x={19} y={27} s={0.7} />
          <Gem x={28} y={26} s={0.8} />
          <Gem x={37} y={27} s={0.7} />
          <Gem x={23.5} y={22} s={0.6} />
          <Gem x={32.5} y={22} s={0.6} />
          <Gem x={18} y={45} s={0.75} />
          <Gem x={28} y={44} s={0.85} />
          <Gem x={38} y={45} s={0.75} />
          <Gem x={23} y={39} s={0.65} />
          <Gem x={33} y={39} s={0.65} />
          <path d="M50 13 L60 8 L60 57 L50 52 Z" fill={`url(#${id}s)`} stroke="#3a4352" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="55" cy="32" r="3.6" fill="#ffd23f" stroke="#8a5a00" strokeWidth="1.2" />
          <path d="M55 28.4 V35.6 M51.4 32 H58.6" stroke="#8a5a00" strokeWidth="1" />
          <rect x="10" y="56" width="7" height="4" rx="1" fill="#3a4352" />
          <rect x="39" y="56" width="7" height="4" rx="1" fill="#3a4352" />
        </g>
      )}
    </svg>
  );
}
