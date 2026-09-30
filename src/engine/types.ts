import type { Deck } from '../data/cards';

export type TokenId = 'cat' | 'car' | 'dog' | 'trex' | 'hat' | 'duck';

export interface Player {
  id: number;
  name: string;
  token: TokenId;
  color: string;
  isBot: boolean;
  money: number;
  pos: number;
  inJail: boolean;
  jailTurns: number;
  jailCards: Deck[];
  bankrupt: boolean;
}

export interface PropState {
  owner: number | null;
  /** 0–4 houses, 5 = hotel */
  houses: number;
  mortgaged: boolean;
}

export interface Owed {
  to: number | null;
  amount: number;
}

export type Phase =
  | { t: 'roll' }
  | { t: 'buy'; space: number }
  | {
      t: 'auction';
      space: number;
      bid: number;
      bidder: number | null;
      /** players still in the auction, in bidding order */
      active: number[];
      turn: number;
    }
  | { t: 'card'; deck: Deck; card: number }
  | { t: 'debt'; owed: Owed[] }
  | { t: 'end' }
  | { t: 'gameover'; winner: number };

export interface GameState {
  players: Player[];
  props: PropState[];
  current: number;
  phase: Phase;
  dice: [number, number];
  doubles: number;
  /** current player may roll again after finishing this move */
  again: boolean;
  decks: Record<Deck, number[]>;
  log: string[];
  turn: number;
}

export type Action =
  | { type: 'ROLL'; dice: [number, number] }
  | { type: 'PAY_JAIL' }
  | { type: 'USE_JAIL_CARD' }
  | { type: 'BUY' }
  | { type: 'DECLINE' }
  | { type: 'BID'; amount: number }
  | { type: 'PASS' }
  | { type: 'ACK_CARD' }
  | { type: 'BUILD'; space: number }
  | { type: 'SELL'; space: number }
  | { type: 'MORTGAGE'; space: number }
  | { type: 'UNMORTGAGE'; space: number }
  | { type: 'PAY_DEBT' }
  | { type: 'BANKRUPT' }
  | { type: 'END_TURN' };

export interface PlayerSetup {
  name: string;
  token: TokenId;
  isBot: boolean;
}
