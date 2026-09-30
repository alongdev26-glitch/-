import type { TokenId } from '../engine/types';
import './Token.css';

export const TOKENS: { id: TokenId; emoji: string; name: string; color: string }[] = [
  { id: 'cat', emoji: '🐈', name: 'חתול', color: '#FF9F1C' },
  { id: 'car', emoji: '🏎️', name: 'מכונית', color: '#E3001B' },
  { id: 'dog', emoji: '🐕', name: 'כלב', color: '#8E5A2B' },
  { id: 'trex', emoji: '🦖', name: 'דינוזאור', color: '#1FA24A' },
  { id: 'hat', emoji: '🎩', name: 'כובע', color: '#5B3FD9' },
  { id: 'duck', emoji: '🦆', name: 'ברווז', color: '#F7C600' },
];

export const tokenColor = (id: TokenId) => TOKENS.find((t) => t.id === id)!.color;

export const tokenEmoji = (id: TokenId) => TOKENS.find((t) => t.id === id)!.emoji;

interface Props {
  token: TokenId;
  color?: string;
  size?: string;
  active?: boolean;
}

/** A colorful game piece: the token's own color inside, the player's color as the ring. */
export function Token({ token, color, size = '1em', active }: Props) {
  return (
    <span
      className={`token${active ? ' token-active' : ''}`}
      style={{ fontSize: size, ['--ring' as string]: color ?? '#fff', ['--tint' as string]: tokenColor(token) }}
    >
      <span className="token-glyph">{tokenEmoji(token)}</span>
    </span>
  );
}
