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
  /** debts that arose outside this player's turn; settled at the start of their next turn */
  owes: Owed[];
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
  /** resume: where play continues once the debt is paid (end of this move, or a fresh roll) */
  | { t: 'debt'; owed: Owed[]; resume?: 'roll' | 'end' }
  | { t: 'end' }
  | { t: 'trade'; offer: TradeOffer; awaiting: number; resume: 'roll' | 'end' }
  | { t: 'gameover'; winner: number };

/** One side of a trade. */
export interface TradeSide {
  props: number[];
  money: number;
  jailCards: number;
}

/** `from` gives `give` and asks for `get` from `to`. */
export interface TradeOffer {
  from: number;
  to: number;
  give: TradeSide;
  get: TradeSide;
  /** 1 for the first offer, +1 for every counter-offer */
  round: number;
}

/** A big on-screen announcement: a purchase, an auction win, or a new house or hotel. */
export interface Announcement {
  kind: 'buy' | 'auction' | 'house' | 'hotel' | 'trade';
  player: number;
  space: number | null;
  price: number;
  /** trades: the other player */
  other?: number;
  detail?: string;
}

/**
 * One movement of money, for the on-screen animation.
 * `from: null` is the bank (or the lotto pot for 'lotto'); `to: null` is the lotto pot.
 */
export interface Payment {
  kind: 'rent' | 'go' | 'go-land' | 'tax' | 'pot' | 'bank' | 'lotto' | 'player';
  from: number | null;
  to: number | null;
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
  /** money movements caused by the last action, in order, for the on-screen animation */
  payEvents: Payment[];
  /** increments on every action that moved money */
  paySeq: number;
  announce: Announcement | null;
  announceSeq: number;
  /** trade offers the current player has made this turn */
  tradesThisTurn: number;
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
  | { type: 'SET_BOT'; player: number; isBot: boolean }
  | { type: 'PROPOSE_TRADE'; to: number; give: TradeSide; get: TradeSide }
  | { type: 'ACCEPT_TRADE' }
  | { type: 'REJECT_TRADE' }
  | { type: 'COUNTER_TRADE'; give: TradeSide; get: TradeSide };

export interface PlayerSetup {
  uid?: string;
  name: string;
  token: TokenId;
  isBot: boolean;
}
