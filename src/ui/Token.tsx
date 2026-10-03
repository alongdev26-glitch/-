import type { TokenId } from '../engine/types';
import { TOKENS, tokenColor } from '../data/tokens';
import './Token.css';
import './Skins.css';

export { TOKENS, tokenColor };

export const tokenEmoji = (id: TokenId) => TOKENS.find((t) => t.id === id)!.emoji;

interface Props {
  token: TokenId;
  color?: string;
  size?: string;
  active?: boolean;
  /** a shop skin, e.g. "skin-gold" */
  skin?: string;
}

/** A colorful game piece: the token's own color inside, the player's color as the ring. */
export function Token({ token, color, size = '1em', active, skin }: Props) {
  return (
    <span
      className={`token${active ? ' token-active' : ''}${skin && skin !== 'skin-none' ? ` ${skin}` : ''}`}
      style={{ fontSize: size, ['--ring' as string]: color ?? '#fff', ['--tint' as string]: tokenColor(token) }}
    >
      <span className="token-glyph">{tokenEmoji(token)}</span>
    </span>
  );
}
