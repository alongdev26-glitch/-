import { useId } from 'react';
import type { TokenId } from '../engine/types';

/** Silhouettes of the classic cast-metal pieces, drawn in a 64×64 box. */
const SHAPES: Record<TokenId, string> = {
  // sailing ship
  cat: 'M31 6 L31 40 L12 40 Z M35 12 L35 40 L52 40 C48 30 44 20 35 12 Z M8 44 L56 44 L50 56 L14 56 Z',
  // classic roadster
  car: 'M6 42 L8 34 C9 31 12 30 16 30 L24 30 L30 22 L44 22 C47 22 49 24 50 27 L52 31 L56 32 C58 33 59 35 59 38 L59 42 Z M16 46 a6 6 0 1 0 0.1 0 Z M48 46 a6 6 0 1 0 0.1 0 Z',
  // scottie dog
  dog: 'M14 50 L14 36 C10 34 8 30 9 26 L14 27 L16 20 L22 16 L24 10 L28 16 C31 16 33 18 34 21 L48 22 C52 22 55 25 55 30 L56 44 L59 50 L52 50 L49 42 L24 42 L22 50 Z',
  // boot
  trex: 'M22 6 L42 6 L42 34 C42 37 44 39 48 40 C54 42 58 45 58 50 L58 56 L10 56 L10 50 L18 48 L18 26 C18 20 20 12 22 6 Z',
  // top hat
  hat: 'M20 10 L44 10 C46 10 47 11 47 13 L46 42 C52 43 58 45 58 49 C58 53 46 56 32 56 C18 56 6 53 6 49 C6 45 12 43 18 42 L17 13 C17 11 18 10 20 10 Z',
  // thimble
  duck: 'M32 6 C42 6 46 12 46 20 L48 50 C48 53 41 56 32 56 C23 56 16 53 16 50 L18 20 C18 12 22 6 32 6 Z',
};

/** A metal game piece: pewter with a highlight, so it reads as cast metal at any size. */
export function Piece({ token }: { token: TokenId }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className="piece" viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={`m${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f4f2" />
          <stop offset="0.35" stopColor="#c3c6c8" />
          <stop offset="0.6" stopColor="#8c9196" />
          <stop offset="0.85" stopColor="#d6d8da" />
          <stop offset="1" stopColor="#6c7176" />
        </linearGradient>
      </defs>
      <path d={SHAPES[token]} fill={`url(#m${id})`} stroke="#2b2f33" strokeWidth="1.6" strokeLinejoin="round" fillRule="evenodd" />
      {token === 'duck' && (
        <g fill="#5d6267" opacity="0.7">
          {[16, 24, 32, 40].map((y) =>
            [24, 30, 36, 42].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" />),
          )}
        </g>
      )}
      {token === 'hat' && <path d="M17.6 34 L46.4 34 L46.1 40 L17.9 40 Z" fill="#2b2f33" opacity="0.55" />}
    </svg>
  );
}
