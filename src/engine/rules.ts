import { BOARD, FEE_ROUNDS, groupMembers, isOwnable, type Group } from '../data/board';
import type { GameState, TradeSide } from './types';

export const ownsGroup = (s: GameState, player: number, g: Group) =>
  groupMembers(g).every((id) => s.props[id].owner === player);

/** A public auction needs at least two bidders besides the player who declined. */
export const hasAuction = (s: GameState) => s.players.filter((p) => !p.bankrupt).length > 2;

export const ownedBy = (s: GameState, player: number) =>
  BOARD.filter((sp) => isOwnable(sp) && s.props[sp.id].owner === player).map((sp) => sp.id);

const countOwned = (s: GameState, player: number, kind: 'railroad' | 'utility') =>
  BOARD.filter((sp) => sp.kind === kind && s.props[sp.id].owner === player).length;

export type RentMod = 'rail2' | 'util10' | undefined;

/** Rent owed for landing on `id` with the given dice total. */
export function rentFor(s: GameState, id: number, diceTotal: number, mod?: RentMod): number {
  const sp = BOARD[id];
  const st = s.props[id];
  if (st.owner === null || st.mortgaged) return 0;
  if (sp.kind === 'property') {
    if (st.houses > 0) return sp.rent![st.houses];
    const base = sp.rent![0];
    return ownsGroup(s, st.owner, sp.group!) ? base * 2 : base;
  }
  if (sp.kind === 'railroad') {
    const r = 25 * 2 ** (countOwned(s, st.owner, 'railroad') - 1);
    return mod === 'rail2' ? r * 2 : r;
  }
  if (sp.kind === 'utility') {
    if (mod === 'util10') return diceTotal * 10;
    return diceTotal * (countOwned(s, st.owner, 'utility') === 2 ? 10 : 4);
  }
  return 0;
}

export function canBuild(s: GameState, player: number, id: number): boolean {
  const sp = BOARD[id];
  const st = s.props[id];
  if (sp.kind !== 'property' || st.owner !== player || st.houses >= 5) return false;
  if (!ownsGroup(s, player, sp.group!)) return false;
  const group = groupMembers(sp.group!);
  if (group.some((g) => s.props[g].mortgaged)) return false;
  const min = Math.min(...group.map((g) => s.props[g].houses));
  return st.houses === min && s.players[player].money >= sp.houseCost!;
}

export function canSell(s: GameState, player: number, id: number): boolean {
  const sp = BOARD[id];
  const st = s.props[id];
  if (sp.kind !== 'property' || st.owner !== player || st.houses === 0) return false;
  const max = Math.max(...groupMembers(sp.group!).map((g) => s.props[g].houses));
  return st.houses === max;
}

/** What redeeming an old mortgaged property is based on (mortgaging itself was removed). */
export const mortgageValue = (id: number) => BOARD[id].price!;
export const unmortgageCost = (id: number) => Math.round(mortgageValue(id) * 1.1);
/** The payment due every FEE_ROUNDS rounds on an owned, unmortgaged property. */
export const feeFor = (id: number) => BOARD[id].price! / 2;

export function feeDue(s: GameState, player: number): number {
  return ownedBy(s, player)
    .filter((id) => !s.props[id].mortgaged)
    .reduce((sum, id) => sum + feeFor(id), 0);
}

/** Rounds until the next mortgage payment, or null when the count hasn't started. */
export function roundsToFee(s: GameState): number | null {
  if (!s.rules?.mortgage || s.feeStart == null) return null;
  const done = (s.round - s.feeStart) % FEE_ROUNDS;
  return FEE_ROUNDS - done;
}
export const sellValue = (id: number) => BOARD[id].houseCost! / 2;

/** Selling a property back to the bank pays half its price (nothing if it is mortgaged). */
export const bankSaleValue = (s: GameState, id: number) =>
  s.props[id].mortgaged ? 0 : Math.round(BOARD[id].price! / 2);

export function canSellToBank(s: GameState, player: number, id: number): boolean {
  const sp = BOARD[id];
  if (!isOwnable(sp) || s.props[id].owner !== player) return false;
  if (sp.kind === 'property') return groupMembers(sp.group!).every((g) => s.props[g].houses === 0);
  return true;
}

export function canUnmortgage(s: GameState, player: number, id: number): boolean {
  const st = s.props[id];
  return st.owner === player && st.mortgaged && s.players[player].money >= unmortgageCost(id);
}

/** Cash a player could raise by selling every building and mortgaging everything. */
export function liquidationValue(s: GameState, player: number): number {
  return ownedBy(s, player).reduce((sum, id) => {
    const st = s.props[id];
    const houses = BOARD[id].kind === 'property' ? st.houses * sellValue(id) : 0;
    return sum + houses + bankSaleValue(s, id);
  }, 0);
}

export function netWorth(s: GameState, player: number): number {
  const p = s.players[player];
  return ownedBy(s, player).reduce((sum, id) => {
    const st = s.props[id];
    const houses = BOARD[id].kind === 'property' ? st.houses * BOARD[id].houseCost! : 0;
    return sum + houses + (st.mortgaged ? 0 : BOARD[id].price!);
  }, p.money);
}

export function buildingCounts(s: GameState, player: number) {
  let houses = 0;
  let hotels = 0;
  for (const id of ownedBy(s, player)) {
    const h = s.props[id].houses;
    if (h === 5) hotels++;
    else houses += h;
  }
  return { houses, hotels };
}

/** A property can change hands only if no house stands anywhere in its color set. */
export function canTradeProp(s: GameState, pid: number, id: number): boolean {
  const sp = BOARD[id];
  if (!isOwnable(sp) || s.props[id].owner !== pid) return false;
  if (sp.kind !== 'property') return true;
  return groupMembers(sp.group!).every((g) => s.props[g].houses === 0);
}

export const emptySide = (): TradeSide => ({ props: [], money: 0, jailCards: 0 });

export const sideIsEmpty = (t: TradeSide) => t.props.length === 0 && t.money <= 0 && t.jailCards <= 0;

/** Can player `pid` hand over everything in `side`? */
export function validSide(s: GameState, pid: number, side: TradeSide): boolean {
  const p = s.players[pid];
  return (
    Number.isInteger(side.money) &&
    side.money >= 0 &&
    side.money <= p.money &&
    side.jailCards >= 0 &&
    side.jailCards <= p.jailCards.length &&
    new Set(side.props).size === side.props.length &&
    side.props.every((id) => canTradeProp(s, pid, id))
  );
}
