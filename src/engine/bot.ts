import { BOARD, JAIL_FINE, groupMembers, isOwnable } from '../data/board';
import { actor, rollDice } from './reducer';
import {
  canBuild,
  canMortgage,
  canSell,
  canUnmortgage,
  feeDue,
  mortgageValue,
  ownedBy,
  rentFor,
  roundsToFee,
  sellValue,
  unmortgageCost,
} from './rules';
import type { Action, GameState } from './types';

/**
 * How much cash a bot wants to keep: a base amount, plus the worst rent an
 * opponent could charge right now, plus a mortgage payment that is coming soon.
 */
export function cushion(s: GameState, me: number): number {
  let worstRent = 0;
  for (const sp of BOARD) {
    const owner = s.props[sp.id].owner;
    if (isOwnable(sp) && owner !== null && owner !== me) worstRent = Math.max(worstRent, rentFor(s, sp.id, 7));
  }
  const soon = roundsToFee(s);
  const fee = soon !== null && soon <= 2 ? feeDue(s, me) : 0;
  return 150 + Math.min(worstRent, 600) + fee;
}

/** Would owning `space` give `player` a full color set (or another railroad)? */
function completes(s: GameState, player: number, space: number): boolean {
  const sp = BOARD[space];
  if (sp.kind === 'railroad') return true;
  if (sp.kind !== 'property') return false;
  return groupMembers(sp.group!).every((id) => id === space || s.props[id].owner === player);
}

function lateGame(s: GameState) {
  return BOARD.filter((sp) => isOwnable(sp) && s.props[sp.id].owner === null).length < 5;
}

/** Build / unmortgage when comfortably rich. */
function manage(s: GameState, me: number): Action | null {
  const money = s.players[me].money;
  const keep = cushion(s, me);
  const mine = ownedBy(s, me);
  const unm = mine.find((id) => canUnmortgage(s, me, id) && money - unmortgageCost(id) >= keep + 300);
  if (unm !== undefined) return { type: 'UNMORTGAGE', space: unm };
  const build = mine
    .filter((id) => canBuild(s, me, id) && money - BOARD[id].houseCost! >= keep + 150)
    .sort((a, b) => BOARD[b].price! - BOARD[a].price!)[0];
  if (build !== undefined) return { type: 'BUILD', space: build };
  return null;
}

/** The next action for a bot, or null when a human has to act. */
export function botAction(s: GameState, rng: () => number = Math.random): Action | null {
  const ph = s.phase;
  if (ph.t === 'gameover') return null;
  const me = actor(s);
  const p = s.players[me];
  if (!p.isBot) return null;

  switch (ph.t) {
    case 'roll': {
      if (p.inJail) {
        if (p.jailCards.length) return { type: 'USE_JAIL_CARD' };
        if (!lateGame(s) && p.money >= JAIL_FINE + cushion(s, me)) return { type: 'PAY_JAIL' };
      }
      return manage(s, me) ?? { type: 'ROLL', dice: rollDice(rng) };
    }
    case 'buy': {
      const price = BOARD[ph.space].price!;
      const keep = cushion(s, me);
      const left = p.money - price;
      const want =
        BOARD[ph.space].kind === 'utility'
          ? left >= keep + 200
          : left >= keep || (completes(s, me, ph.space) && left >= keep / 2);
      return want ? { type: 'BUY' } : { type: 'DECLINE' };
    }
    case 'auction': {
      const price = BOARD[ph.space].price!;
      const keep = cushion(s, me);
      let value = completes(s, me, ph.space) ? price * 1.5 : price;
      if (p.money < 2 * keep) value *= 0.6;
      const max = Math.min(value, p.money - keep);
      const next = ph.bid + (ph.bid < 100 ? 10 : 20);
      return ph.bidder !== me && next <= max ? { type: 'BID', amount: next } : { type: 'PASS' };
    }
    case 'card':
      return { type: 'ACK_CARD' };
    case 'debt': {
      const total = ph.owed.reduce((a, o) => a + o.amount, 0);
      if (p.money >= total) return { type: 'PAY_DEBT' };
      const mine = ownedBy(s, me);
      const sell = mine.filter((id) => canSell(s, me, id)).sort((a, b) => sellValue(a) - sellValue(b))[0];
      if (sell !== undefined) return { type: 'SELL', space: sell };
      const mort = mine
        .filter((id) => canMortgage(s, me, id))
        .sort((a, b) => mortgageValue(a) - mortgageValue(b))[0];
      if (mort !== undefined) return { type: 'MORTGAGE', space: mort };
      return { type: 'BANKRUPT' };
    }
    case 'end':
      return manage(s, me) ?? (s.again ? { type: 'ROLL', dice: rollDice(rng) } : { type: 'END_TURN' });
  }
}
