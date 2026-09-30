import type { TokenId } from '../engine/types';
import './Token.css';

export const TOKENS: { id: TokenId; emoji: string; name: string }[] = [
  { id: 'cat', emoji: '🐈', name: 'חתול' },
  { id: 'car', emoji: '🏎️', name: 'מכונית' },
  { id: 'dog', emoji: '🐕', name: 'כלב' },
  { id: 'trex', emoji: '🦖', name: 'דינוזאור' },
  { id: 'hat', emoji: '🎩', name: 'כובע' },
  { id: 'duck', emoji: '🦆', name: 'ברווז' },
];

export const tokenEmoji = (id: TokenId) => TOKENS.find((t) => t.id === id)!.emoji;

interface Props {
  token: TokenId;
  color?: string;
  size?: string;
  active?: boolean;
}

/** A chrome-silver game piece. */
export function Token({ token, color, size = '1em', active }: Props) {
  return (
    <span
      className={`token${active ? ' token-active' : ''}`}
      style={{ fontSize: size, ['--ring' as string]: color ?? '#9aa3ad' }}
    >
      <span className="token-glyph">{tokenEmoji(token)}</span>
    </span>
  );
}
