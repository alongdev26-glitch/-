import type { Deck } from '../data/cards';

export type TokenId = 'cat' | 'car' | 'dog' | 'trex' | 'hat' | 'duck';

export interface Player {
  id: number;
  /** online games: the claude.ai viewer id that controls this seat */
  uid?: string;
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
  /** the property this is rent for, if any */
  space?: number;
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

export interface Payment {
  from: number;
  to: number;
  amount: number;
  space: number | null;
}

export interface GameRules {
  /** the mortgage system: the 7-round payment and voluntary mortgages */
  mortgage: boolean;
}

export interface GameState {
  rules: GameRules;
  players: Player[];
  props: PropState[];
  current: number;
  phase: Phase;
  dice: [number, number];
  doubles: number;
  /** "קופת הלוטו": taxes and fines collect here, "חניה חופשית" takes it all */
  pot: number;
  /** full rounds played (a round ends when play wraps to the first seat) */
  round: number;
  /** round of the first purchase, when the mortgage-payment count starts */
  feeStart: number | null;
  /** increments on every dice roll, so every screen can animate it */
  rollSeq: number;
  /** the latest payment between two players, for the on-screen money animation */
  payment: Payment | null;
  /** increments on every payment between players */
  paySeq: number;
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
  | { type: 'END_TURN' }
  /** online: hand a seat to the computer (or back to its player) */
  | { type: 'SET_BOT'; player: number; isBot: boolean };

export interface PlayerSetup {
  uid?: string;
  name: string;
  token: TokenId;
  isBot: boolean;
}
