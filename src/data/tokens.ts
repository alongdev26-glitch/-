import type { TokenId } from '../engine/types';

/**
 * The game pieces: cast-metal classics. The ids stay the same for old saves and online rooms.
 * Each piece has its own deep color, and a player takes it: their ring, their chip and every
 * property they own.
 */
export const TOKENS: { id: TokenId; name: string; color: string }[] = [
  { id: 'cat', name: 'ספינה', color: '#1f3f7a' },
  { id: 'car', name: 'מכונית', color: '#8c1c2b' },
  { id: 'dog', name: 'כלב', color: '#7a5230' },
  { id: 'trex', name: 'מגף', color: '#1e6b47' },
  { id: 'hat', name: 'כובע', color: '#5b2a6e' },
  { id: 'duck', name: 'אצבעון', color: '#b8862b' },
];

export const tokenColor = (id: TokenId) => TOKENS.find((t) => t.id === id)!.color;
