import type { TokenId } from '../engine/types';
import { TOKENS, tokenColor } from '../data/tokens';
import { Piece } from './Pieces';
import './Token.css';

export { TOKENS, tokenColor };

interface Props {
  token: TokenId;
  color?: string;
  size?: string;
  active?: boolean;
}

/** A metal game piece on a dark disc, ringed in the player's color. */
export function Token({ token, color, size = '1em', active }: Props) {
  return (
    <span
      className={`token${active ? ' token-active' : ''}`}
      style={{ fontSize: size, ['--ring' as string]: color ?? tokenColor(token), ['--tint' as string]: tokenColor(token) }}
    >
      <Piece token={token} />
    </span>
  );
}
