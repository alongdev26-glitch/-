import type { TokenId } from '../engine/types';

/**
 * The game pieces. Each has its own color, and a player takes the color of
 * the piece they chose: their ring, their chip and every property they own.
 */
export const TOKENS: { id: TokenId; emoji: string; name: string; color: string }[] = [
  { id: 'cat', emoji: '🐈', name: 'חתול', color: '#FF8A00' },
  { id: 'car', emoji: '🏎️', name: 'מכונית', color: '#D90429' },
  { id: 'dog', emoji: '🐕', name: 'כלב', color: '#8B5A2B' },
  { id: 'trex', emoji: '🦖', name: 'דינוזאור', color: '#16A34A' },
  { id: 'hat', emoji: '🎩', name: 'כובע', color: '#7C3AED' },
  { id: 'duck', emoji: '🦆', name: 'ברווז', color: '#E6B800' },
];

export const tokenColor = (id: TokenId) => TOKENS.find((t) => t.id === id)!.color;
