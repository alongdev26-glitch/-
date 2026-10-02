import { BOARD, JAIL_FINE, groupMembers, isOwnable } from '../data/board';
import { MAX_TRADE_ROUNDS, actor, rollDice } from './reducer';
import {
  bankSaleValue,
  canSellToBank,
  canBuild,
  canTradeProp,
  isBlocked,
  canSell,
  canUnmortgage,
  feeDue,
  ownedBy,
  rentFor,
  roundsToFee,
  sellValue,
  unmortgageCost,
} from './rules';
import type { Action, GameState, TradeSide } from './types';

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

/** How much a property is worth to `me` in a trade, receiving or giving it away. */
export function tradeValue(s: GameState, me: number, id: number): number {
  const sp = BOARD[id];
  let v = sp.price!;
  if (s.props[id].mortgaged) v = v / 2;
  if (sp.kind === 'property') {
    const group = groupMembers(sp.group!);
    const others = group.filter((g) => g !== id);
    const mineOthers = others.filter((g) => s.props[g].owner === me).length;
    if (mineOthers === others.length) v *= 2; // completes (or holds) a full set
    else if (mineOthers > 0) v *= 1.5; // part of a set I'm building
  } else if (sp.kind === 'railroad') {
    const rails = BOARD.filter((b) => b.kind === 'railroad' && b.id !== id && s.props[b.id].owner === me).length;
    v *= 1 + rails * 0.25;
  }
  return v;
}

const sideValue = (s: GameState, me: number, side: TradeSide) =>
  side.props.reduce((a, id) => a + tradeValue(s, me, id), 0) + side.money + side.jailCards * 50;

/** Should bot `me` accept: I receive `get`, I hand over `give`. Returns 'accept' | 'counter' | 'reject'. */
function judge(s: GameState, me: number, receive: TradeSide, hand: TradeSide) {
  const inValue = sideValue(s, me, receive);
  const outValue = sideValue(s, me, hand);
  const cashAfter = s.players[me].money - hand.money + receive.money;
  if (cashAfter < cushion(s, me) / 2) return { verdict: 'reject' as const, shortBy: 0 };
  if (inValue >= outValue * 1.1) return { verdict: 'accept' as const, shortBy: 0 };
  const shortBy = outValue * 1.1 - inValue;
  if (shortBy <= outValue * 0.4) return { verdict: 'counter' as const, shortBy };
  return { verdict: 'reject' as const, shortBy };
}

/** A bot looks for one street it is missing from a color set and offers cash for it. */
function proposeTrade(s: GameState, me: number): Action | null {
  const p = s.players[me];
  const keep = cushion(s, me);
  const groups = [...new Set(BOARD.filter((b) => b.kind === 'property').map((b) => b.group!))];
  for (const g of groups) {
    const members = groupMembers(g);
    const missing = members.filter((id) => s.props[id].owner !== me);
    if (missing.length !== 1) continue;
    const id = missing[0];
    const owner = s.props[id].owner;
    if (owner === null || s.players[owner].bankrupt || !canTradeProp(s, owner, id) || isBlocked(s, me, owner)) continue;
    const offer = Math.round((BOARD[id].price! * 1.5) / 10) * 10;
    if (p.money - offer < keep) continue;
    return {
      type: 'PROPOSE_TRADE',
      to: owner,
      give: { props: [], money: offer, jailCards: 0 },
      get: { props: [id], money: 0, jailCards: 0 },
    };
  }
  return null;
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
      return (
        manage(s, me) ??
        (s.tradesThisTurn === 0 ? proposeTrade(s, me) : null) ?? { type: 'ROLL', dice: rollDice(rng) }
      );
    }
    case 'trade': {
      const o = ph.offer;
      // I am `awaiting`; if I made the offer (a counter came back) `from` is me
      const receive = o.to === me ? o.give : o.get;
      const hand = o.to === me ? o.get : o.give;
      const { verdict, shortBy } = judge(s, me, receive, hand);
      if (verdict === 'accept') return { type: 'ACCEPT_TRADE' };
      const other = o.from === me ? o.to : o.from;
      const ask = Math.round((shortBy * 1.2) / 10) * 10;
      if (verdict === 'counter' && o.round < MAX_TRADE_ROUNDS && o.round === 1 && s.players[other].money >= receive.money + ask) {
        // same deal, but they add cash
        return {
          type: 'COUNTER_TRADE',
          give: hand,
          get: { ...receive, money: receive.money + ask },
        };
      }
      return { type: 'REJECT_TRADE' };
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
      const sale = mine
        .filter((id) => canSellToBank(s, me, id) && bankSaleValue(s, id) > 0)
        .sort((a, b) => bankSaleValue(s, a) - bankSaleValue(s, b))[0];
      if (sale !== undefined) return { type: 'SELL_BANK', space: sale };
      return { type: 'BANKRUPT' };
    }
    case 'end':
      return manage(s, me) ?? (s.again ? { type: 'ROLL', dice: rollDice(rng) } : { type: 'END_TURN' });
  }
}
