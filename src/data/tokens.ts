import type { TokenId } from '../engine/types';
import { t, type Key } from '../i18n';

/**
 * The game pieces. Each has its own color, and a player takes the color of
 * the piece they chose: their ring, their chip and every property they own.
 */
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export const TOKENS: { id: TokenId; emoji: string; name: string; color: string; rarity?: Rarity }[] = [
  { id: 'cat', emoji: '🐈', name: 'חתול', color: '#FF8A00' },
  { id: 'car', emoji: '🏎️', name: 'מכונית', color: '#D90429' },
  { id: 'dog', emoji: '🐕', name: 'כלב', color: '#8B5A2B' },
  { id: 'trex', emoji: '🦖', name: 'דינוזאור', color: '#16A34A' },
  { id: 'hat', emoji: '🎩', name: 'כובע', color: '#7C3AED' },
  { id: 'duck', emoji: '🦆', name: 'ברווז', color: '#E6B800' },
  // bought in the shop
  { id: 'lion', emoji: '🦁', name: 'אריה', color: '#E0A100', rarity: 'epic' },
  { id: 'tiger', emoji: '🐯', name: 'נמר', color: '#F57C00', rarity: 'rare' },
  { id: 'panda', emoji: '🐼', name: 'פנדה', color: '#455A64', rarity: 'rare' },
  { id: 'fox', emoji: '🦊', name: 'שועל', color: '#E65100', rarity: 'common' },
  { id: 'frog', emoji: '🐸', name: 'צפרדע', color: '#4CAF50', rarity: 'common' },
  { id: 'monkey', emoji: '🐵', name: 'קוף', color: '#795548', rarity: 'common' },
  { id: 'unicorn', emoji: '🦄', name: 'חד-קרן', color: '#E040FB', rarity: 'legendary' },
  { id: 'dragon', emoji: '🐉', name: 'דרקון', color: '#2E7D32', rarity: 'legendary' },
  { id: 'shark', emoji: '🦈', name: 'כריש', color: '#0277BD', rarity: 'epic' },
  { id: 'octopus', emoji: '🐙', name: 'תמנון', color: '#D81B60', rarity: 'rare' },
  { id: 'penguin', emoji: '🐧', name: 'פינגווין', color: '#263238', rarity: 'common' },
  { id: 'owl', emoji: '🦉', name: 'ינשוף', color: '#8D6E63', rarity: 'common' },
  { id: 'turtle', emoji: '🐢', name: 'צב', color: '#689F38', rarity: 'common' },
  { id: 'bunny', emoji: '🐰', name: 'ארנב', color: '#F48FB1', rarity: 'common' },
  { id: 'bear', emoji: '🐻', name: 'דוב', color: '#6D4C41', rarity: 'common' },
  { id: 'koala', emoji: '🐨', name: 'קואלה', color: '#90A4AE', rarity: 'common' },
  { id: 'giraffe', emoji: '🦒', name: "ג'ירפה", color: '#FFB300', rarity: 'rare' },
  { id: 'elephant', emoji: '🐘', name: 'פיל', color: '#78909C', rarity: 'rare' },
  { id: 'zebra', emoji: '🦓', name: 'זברה', color: '#424242', rarity: 'common' },
  { id: 'flamingo', emoji: '🦩', name: 'פלמינגו', color: '#FF4081', rarity: 'rare' },
  { id: 'dolphin', emoji: '🐬', name: 'דולפין', color: '#29B6F6', rarity: 'rare' },
  { id: 'butterfly', emoji: '🦋', name: 'פרפר', color: '#2979FF', rarity: 'common' },
  { id: 'bee', emoji: '🐝', name: 'דבורה', color: '#FBC02D', rarity: 'common' },
  { id: 'rocket', emoji: '🚀', name: 'טיל', color: '#C62828', rarity: 'epic' },
  { id: 'heli', emoji: '🚁', name: 'מסוק', color: '#00897B', rarity: 'rare' },
  { id: 'ufo', emoji: '🛸', name: 'חללית', color: '#7E57C2', rarity: 'epic' },
  { id: 'robot', emoji: '🤖', name: 'רובוט', color: '#546E7A', rarity: 'epic' },
  { id: 'ghost', emoji: '👻', name: 'רוח רפאים', color: '#B0BEC5', rarity: 'rare' },
  { id: 'crown', emoji: '👑', name: 'כתר', color: '#FFC400', rarity: 'legendary' },
  { id: 'ball', emoji: '⚽', name: 'כדור', color: '#37474F', rarity: 'common' },
];

/** The six free pieces everyone starts with. */
export const BASE_TOKENS = TOKENS.slice(0, 6);

export const tokenColor = (id: TokenId) => TOKENS.find((t) => t.id === id)!.color;

/** A piece's name in the UI language. */
export const tokenName = (id: TokenId) => t(`tok.${id}` as Key);
