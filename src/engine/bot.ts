import { BOARD, JAIL_FINE, groupMembers, isOwnable } from '../data/board';
import { actor, rollDice } from './reducer';
import { canBuild, canMortgage, canSell, canUnmortgage, mortgageValue, ownedBy, sellValue, unmortgageCost } from './rules';
import type { Action, GameState } from './types';

const RESERVE = 150;

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
  const mine = ownedBy(s, me);
  const unm = mine.find((id) => canUnmortgage(s, me, id) && money - unmortgageCost(id) > 500);
  if (unm !== undefined) return { type: 'UNMORTGAGE', space: unm };
  const build = mine
    .filter((id) => canBuild(s, me, id) && money - BOARD[id].houseCost! > 300)
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
        if (!lateGame(s) && p.money >= JAIL_FINE + RESERVE) return { type: 'PAY_JAIL' };
      }
      return manage(s, me) ?? { type: 'ROLL', dice: rollDice(rng) };
    }
    case 'buy': {
      const price = BOARD[ph.space].price!;
      const want = p.money - price >= RESERVE || (completes(s, me, ph.space) && p.money >= price);
      return want ? { type: 'BUY' } : { type: 'DECLINE' };
    }
    case 'auction': {
      const price = BOARD[ph.space].price!;
      const value = completes(s, me, ph.space) ? price * 1.5 : price;
      const max = Math.min(value, p.money - RESERVE / 2);
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
