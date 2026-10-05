import { BOARD, FEE_ROUNDS, GO_SALARY, JAIL, JAIL_FINE, START_MONEY, isOwnable } from '../data/board';
import { DECKS, type Deck } from '../data/cards';
import { tokenColor } from '../data/tokens';
import {
  buildingCounts,
  bankSaleValue,
  canBuild,
  canSell,
  canSellToBank,
  BLOCK_ROUNDS,
  isBlocked,
  hasAuction,
  canUnmortgage,
  ownedBy,
  rentFor,
  sellValue,
  unmortgageCost,
  feeDue,
  sideIsEmpty,
  validSide,
  type RentMod,
} from './rules';
import type { Action, Announcement, Phase, GameRules, GameState, Owed, Payment, PlayerSetup, TradeOffer, TradeSide } from './types';

const MAX_LOG = 40;

const fmt = (n: number) => `ש"ח ${n}`;

function shuffle(n: number, rng: () => number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const DEFAULT_RULES: GameRules = { mortgage: true };

export function newGame(
  setup: PlayerSetup[],
  rng: () => number = Math.random,
  rules: GameRules = DEFAULT_RULES,
): GameState {
  return {
    rules: { ...rules },
    players: setup.map((p, id) => ({
      id,
      ...(p.uid ? { uid: p.uid } : {}),
      name: p.name,
      token: p.token,
      isBot: p.isBot,
      color: tokenColor(p.token),
      money: START_MONEY,
      pos: 0,
      inJail: false,
      jailTurns: 0,
      jailCards: [],
      owes: [],
      bankrupt: false,
      lapped: false,
    })),
    props: BOARD.map(() => ({ owner: null, houses: 0, mortgaged: false })),
    current: 0,
    phase: { t: 'roll' },
    dice: [1, 1],
    doubles: 0,
    pot: 0,
    round: 1,
    feeStart: null,
    rollSeq: 0,
    payEvents: [],
    paySeq: 0,
    announce: null,
    announceSeq: 0,
    tradesThisTurn: 0,
    blocks: [],
    again: false,
    decks: { chance: shuffle(DECKS.chance.length, rng), chest: shuffle(DECKS.chest.length, rng) },
    log: ['המשחק התחיל! בהצלחה'],
    turn: 1,
  };
}

// ---------- helpers that mutate a draft ----------

function log(s: GameState, msg: string) {
  s.log.unshift(msg);
  if (s.log.length > MAX_LOG) s.log.length = MAX_LOG;
}

const cur = (s: GameState) => s.players[s.current];
const alive = (s: GameState) => s.players.filter((p) => !p.bankrupt);

/** The phase to return to once a trade offer is settled. */
function resumePhase(r: 'roll' | 'end' | Phase): Phase {
  return typeof r === 'string' ? { t: r } : r;
}

/** Called when the current move is fully resolved. */
function finishMove(s: GameState) {
  s.phase = { t: 'end' };
}

/** Try to charge the current player; if short, enter the debt phase. */
function charge(s: GameState, owed: Owed[]) {
  const p = cur(s);
  const total = owed.reduce((a, o) => a + o.amount, 0);
  if (total <= 0) return finishMove(s);
  if (p.money >= total) {
    settle(s, p.id, owed);
    finishMove(s);
  } else {
    s.phase = { t: 'debt', owed, resume: 'end' };
    log(s, `${p.name} חייב ${fmt(total)} ואין לו מספיק מזומן`);
  }
}

/** Record a money movement for the animation (cleared at the start of every action). */
function moneyEvent(s: GameState, e: Payment) {
  s.payEvents.push(e);
}

function settle(s: GameState, from: number, owed: Owed[]) {
  for (const o of owed) {
    s.players[from].money -= o.amount;
    if (o.to !== null) {
      s.players[o.to].money += o.amount;
      if (o.amount > 0)
        moneyEvent(s, { kind: o.space !== undefined ? 'rent' : 'player', from, to: o.to, amount: o.amount, space: o.space ?? null });
    } else {
      s.pot += o.amount;
      if (o.amount > 0) {
        const isTax = o.space !== undefined && BOARD[o.space].kind === 'tax';
        moneyEvent(s, { kind: isTax ? 'tax' : 'pot', from, to: null, amount: o.amount, space: o.space ?? null });
      }
    }
  }
}

/** Sell houses and mortgage until the player has `need` cash (used for non-current payers). */
export function autoRaise(s: GameState, player: number, need: number) {
  const p = s.players[player];
  while (p.money < need) {
    const sell = ownedBy(s, player)
      .filter((id) => canSell(s, player, id))
      .sort((a, b) => sellValue(a) - sellValue(b))[0];
    if (sell !== undefined) {
      s.props[sell].houses--;
      p.money += sellValue(sell);
      continue;
    }
    const sale = ownedBy(s, player)
      .filter((id) => canSellToBank(s, player, id) && bankSaleValue(s, id) > 0)
      .sort((a, b) => bankSaleValue(s, a) - bankSaleValue(s, b))[0];
    if (sale === undefined) return;
    sellToBank(s, player, sale);
  }
}

/** Return a property to the bank for half its price; it becomes free to buy again. */
function sellToBank(s: GameState, player: number, id: number) {
  const value = bankSaleValue(s, id);
  s.players[player].money += value;
  s.props[id] = { owner: null, houses: 0, mortgaged: false };
  if (value > 0) moneyEvent(s, { kind: 'bank', from: null, to: player, amount: value, space: id });
  log(s, `${s.players[player].name} מכר את ${BOARD[id].name} לבנק ב-${fmt(value)}`);
}

function sendToJail(s: GameState, reason: string) {
  const p = cur(s);
  p.pos = JAIL;
  p.inJail = true;
  p.jailTurns = 0;
  s.again = false;
  announce(s, { kind: 'jail', player: p.id, space: null, price: 0, detail: reason });
  log(s, `${p.name} נשלח לכלא!`);
}

function moveTo(s: GameState, target: number, passGo = true) {
  const p = cur(s);
  if (passGo && target < p.pos) {
    // landing exactly on "דרך צלחה" pays double
    const pay = target === 0 ? GO_SALARY * 2 : GO_SALARY;
    p.money += pay;
    p.lapped = true;
    moneyEvent(s, { kind: target === 0 ? 'go-land' : 'go', from: null, to: p.id, amount: pay, space: 0 });
    log(s, target === 0 ? `${p.name} נחת ב"דרך צלחה" וקיבל ${fmt(pay)}!` : `${p.name} עבר ב"דרך צלחה" וקיבל ${fmt(pay)}`);
  }
  p.pos = target;
}

function land(s: GameState, mod?: RentMod) {
  const p = cur(s);
  const sp = BOARD[p.pos];
  const diceTotal = s.dice[0] + s.dice[1];

  if (isOwnable(sp)) {
    const st = s.props[sp.id];
    if (st.owner === null) {
      // the first lap is free: a player may buy only after passing "דרך צלחה" once
      if (!p.lapped) {
        log(s, `${p.name} עוד לא השלים סיבוב – אי אפשר לקנות את ${sp.name}`);
        return finishMove(s);
      }
      s.phase = { t: 'buy', space: sp.id };
      return;
    }
    if (st.owner === p.id) {
      return finishMove(s);
    }
    if (st.mortgaged) {
      log(s, `${sp.name} ממושכן, אין שכירות`);
      return finishMove(s);
    }
    const rent = rentFor(s, sp.id, diceTotal, mod);
    const owner = s.players[st.owner];
    log(s, `${p.name} משלם ${fmt(rent)} ל${owner.name} על ${sp.name}`);
    return charge(s, [{ to: owner.id, amount: rent, space: sp.id }]);
  }

  switch (sp.kind) {
    case 'tax':
      log(s, `${p.name} משלם ${sp.name}: ${fmt(sp.amount!)}`);
      return charge(s, [{ to: null, amount: sp.amount!, space: sp.id }]);
    case 'chance':
    case 'chest': {
      const deck: Deck = sp.kind;
      const card = s.decks[deck].shift()!;
      s.phase = { t: 'card', deck, card };
      return;
    }
    case 'gotojail':
      sendToJail(s, 'נחת על "גש לכלא"');
      return finishMove(s);
    case 'parking':
      if (s.pot > 0) {
        p.money += s.pot;
        moneyEvent(s, { kind: 'lotto', from: null, to: p.id, amount: s.pot, space: 20 });
        log(s, `${p.name} זכה בקופת הלוטו: ${fmt(s.pot)}!`);
        s.pot = 0;
      }
      return finishMove(s);
    default:
      return finishMove(s);
  }
}

function applyCard(s: GameState, deck: Deck, cardIdx: number) {
  const p = cur(s);
  const { effect } = DECKS[deck][cardIdx];
  if (effect.type === 'jailfree') {
    p.jailCards.push(deck);
  } else {
    s.decks[deck].push(cardIdx);
  }

  switch (effect.type) {
    case 'jailfree':
      return finishMove(s);
    case 'move':
      moveTo(s, effect.to);
      return land(s);
    case 'back':
      p.pos = (p.pos - effect.steps + 40) % 40;
      return land(s);
    case 'nearest': {
      let t = p.pos;
      do t = (t + 1) % 40;
      while (BOARD[t].kind !== effect.kind);
      moveTo(s, t);
      return land(s, effect.kind === 'railroad' ? 'rail2' : 'util10');
    }
    case 'money':
      if (effect.amount >= 0) {
        p.money += effect.amount;
        moneyEvent(s, { kind: 'bank', from: null, to: p.id, amount: effect.amount, space: null });
        return finishMove(s);
      }
      return charge(s, [{ to: null, amount: -effect.amount }]);
    case 'payEach':
      return charge(
        s,
        alive(s)
          .filter((o) => o.id !== p.id)
          .map((o) => ({ to: o.id, amount: effect.amount })),
      );
    case 'collectEach':
      for (const o of alive(s)) {
        if (o.id === p.id) continue;
        chargeOffTurn(s, o.id, [{ to: p.id, amount: effect.amount }]);
      }
      return finishMove(s);
    case 'repairs': {
      const { houses, hotels } = buildingCounts(s, p.id);
      return charge(s, [{ to: null, amount: houses * effect.house + hotels * effect.hotel }]);
    }
    case 'gotojail':
      sendToJail(s, 'כרטיס: גש לכלא');
      return finishMove(s);
  }
}

function returnJailCard(s: GameState, deck: Deck) {
  s.decks[deck].push(DECKS[deck].findIndex((c) => c.effect.type === 'jailfree'));
}

function goBankrupt(s: GameState, player: number, creditor: number | null) {
  const p = s.players[player];
  p.bankrupt = true;
  log(s, `${p.name} פשט רגל!`);
  for (const id of ownedBy(s, player)) {
    const st = s.props[id];
    if (creditor !== null) {
      // buildings are sold to the bank, the creditor takes the land as-is
      if (st.houses) s.players[creditor].money += st.houses * sellValue(id);
      s.props[id] = { owner: creditor, houses: 0, mortgaged: st.mortgaged };
    } else {
      s.props[id] = { owner: null, houses: 0, mortgaged: false };
    }
  }
  if (creditor !== null) s.players[creditor].money += Math.max(0, p.money);
  else s.pot += Math.max(0, p.money);
  p.money = 0;
  for (const deck of p.jailCards) returnJailCard(s, deck);
  p.jailCards = [];
  const left = alive(s);
  if (left.length === 1) {
    s.phase = { t: 'gameover', winner: left[0].id };
    log(s, `${left[0].name} ניצח במשחק!`);
  }
}

/** Start the mortgage-payment count at the first purchase of the game. */
function noteFirstPurchase(s: GameState) {
  if (s.feeStart === null && s.rules.mortgage) {
    s.feeStart = s.round;
    log(s, `הנכס הראשון נקנה! כל ${FEE_ROUNDS} סבבים משלמים משכנתא על כל נכס`);
  }
}

function announce(s: GameState, a: Announcement) {
  s.announce = a;
  s.announceSeq++;
}

/**
 * Take money from a player outside their own turn. A bot raises the cash itself;
 * a real player's properties are never sold or mortgaged for them: if they are
 * short, the debt waits for the start of their next turn, where they decide.
 * Returns true if the player went bankrupt.
 */
function chargeOffTurn(s: GameState, pid: number, owed: Owed[]): boolean {
  const p = s.players[pid];
  const total = owed.reduce((a, o) => a + o.amount, 0);
  if (total <= 0) return false;
  if (p.money >= total) {
    settle(s, pid, owed);
    return false;
  }
  if (!p.isBot) {
    p.owes.push(...owed);
    log(s, `${p.name} חייב ${fmt(total)} וישלם בתור הבא`);
    return false;
  }
  autoRaise(s, pid, total);
  if (p.money >= total) {
    settle(s, pid, owed);
    return false;
  }
  // pay what there is, then out of the game
  let left = p.money;
  for (const o of owed) {
    const part = Math.min(left, o.amount);
    left -= part;
    p.money -= part;
    if (o.to !== null) s.players[o.to].money += part;
    else s.pot += part;
  }
  const creditors = owed.filter((o) => o.to !== null);
  goBankrupt(s, pid, owed.length === 1 && creditors.length === 1 ? creditors[0].to : null);
  return true;
}

/** Every FEE_ROUNDS rounds: each owner pays half the price of each unmortgaged property into the pot. */
function collectFees(s: GameState) {
  for (const p of alive(s)) {
    const due = feeDue(s, p.id);
    if (due <= 0) continue;
    log(s, `${p.name} צריך לשלם משכנתא: ${fmt(due)} לקופת הלוטו`);
    chargeOffTurn(s, p.id, [{ to: null, amount: due }]);
  }
}

function nextTurn(s: GameState) {
  const n = s.players.length;
  const prev = s.current;
  let i = s.current;
  do i = (i + 1) % n;
  while (s.players[i].bankrupt);
  s.current = i;
  s.doubles = 0;
  s.again = false;
  s.turn++;
  s.tradesThisTurn = 0;
  s.phase = { t: 'roll' };
  if (i <= prev) {
    s.round++;
    if (s.blocks) s.blocks = s.blocks.filter((b) => b.until > s.round);
    if (s.rules.mortgage && s.feeStart !== null && (s.round - s.feeStart) % FEE_ROUNDS === 0) {
      log(s, `סבב ${s.round}: זמן תשלום המשכנתא!`);
      collectFees(s);
      if (cur(s).bankrupt && (s.phase as GameState['phase']).t !== 'gameover') return nextTurn(s);
    }
  }
  const c = cur(s);
  if (c.owes.length && (s.phase as GameState['phase']).t === 'roll') {
    const owed = c.owes;
    c.owes = [];
    const total = owed.reduce((a, o) => a + o.amount, 0);
    if (c.money >= total) {
      settle(s, c.id, owed);
      log(s, `${c.name} שילם את החוב מהסבב הקודם: ${fmt(total)}`);
    } else {
      s.phase = { t: 'debt', owed, resume: 'roll' };
      log(s, `${c.name} צריך לסגור חוב של ${fmt(total)} לפני שמטילים`);
    }
  }
}

function startAuction(s: GameState, space: number) {
  const n = s.players.length;
  const order: number[] = [];
  // the player who sent the property to auction may not bid on it
  for (let k = 1; k < n; k++) {
    const id = (s.current + k) % n;
    // only players who already went around once may buy, at an auction too
    if (!s.players[id].bankrupt && s.players[id].lapped) order.push(id);
  }
  if (!order.length) {
    log(s, `אף אחד עוד לא יכול לקנות את ${BOARD[space].name}, והנכס נשאר פנוי`);
    return finishMove(s);
  }
  s.phase = { t: 'auction', space, bid: 0, bidder: null, active: order, turn: 0 };
  log(s, `מכירה פומבית על ${BOARD[space].name}`);
  afterAuctionMove(s);
}

function closeAuction(s: GameState) {
  const ph = s.phase;
  if (ph.t !== 'auction') return;
  if (ph.bidder !== null) {
    const w = s.players[ph.bidder];
    w.money -= ph.bid;
    s.props[ph.space].owner = w.id;
    noteFirstPurchase(s);
    announce(s, { kind: 'auction', player: w.id, space: ph.space, price: ph.bid });
    log(s, `${w.name} זכה במכירה הפומבית על ${BOARD[ph.space].name} ב-${fmt(ph.bid)}`);
  } else {
    log(s, `אף אחד לא קנה את ${BOARD[ph.space].name}`);
  }
  finishMove(s);
}

function afterAuctionMove(s: GameState) {
  const ph = s.phase;
  if (ph.t !== 'auction') return;
  if (ph.active.length === 0 || (ph.active.length === 1 && ph.bidder === ph.active[0])) {
    closeAuction(s);
  }
}

/** Whose input the game is waiting for. */
export const MAX_TRADE_ROUNDS = 3;

function describeSide(t: TradeSide): string {
  const parts = t.props.map((id) => BOARD[id].name);
  if (t.money > 0) parts.push(fmt(t.money));
  if (t.jailCards > 0) parts.push(t.jailCards === 1 ? 'כרטיס יציאה מהכלא' : `${t.jailCards} כרטיסי יציאה מהכלא`);
  return parts.length ? parts.join(', ') : 'כלום';
}

/** Move one side of a trade from player `a` to player `b`. */
function transfer(s: GameState, a: number, b: number, t: TradeSide) {
  for (const id of t.props) s.props[id].owner = b;
  s.players[a].money -= t.money;
  s.players[b].money += t.money;
  for (let k = 0; k < t.jailCards; k++) s.players[b].jailCards.push(s.players[a].jailCards.shift()!);
}

function tradeOk(s: GameState, o: TradeOffer): boolean {
  if (o.from === o.to || s.players[o.from].bankrupt || s.players[o.to].bankrupt) return false;
  if (sideIsEmpty(o.give) && sideIsEmpty(o.get)) return false;
  return validSide(s, o.from, o.give) && validSide(s, o.to, o.get);
}

export function actor(s: GameState): number {
  if (s.phase.t === 'auction') return s.phase.active[s.phase.turn];
  if (s.phase.t === 'trade') return s.phase.awaiting;
  return s.current;
}

function manageAllowed(s: GameState) {
  return ['roll', 'end', 'debt', 'buy'].includes(s.phase.t);
}

// ---------- the reducer ----------

export function reduce(prev: GameState, a: Action): GameState {
  if (prev.phase.t === 'gameover') return prev;
  const s: GameState = structuredClone(prev);
  s.payEvents = [];
  const out = step(prev, s, a);
  if (out !== prev && out.payEvents.length) out.paySeq++;
  return out;
}

function step(prev: GameState, s: GameState, a: Action): GameState {
  const p = cur(s);
  const ph = s.phase;

  switch (a.type) {
    case 'ROLL': {
      const canRoll = ph.t === 'roll' || (ph.t === 'end' && s.again);
      if (!canRoll) return prev;
      const [d1, d2] = a.dice;
      const isDouble = d1 === d2;
      s.dice = [d1, d2];
      s.rollSeq++;
      log(s, `${p.name} הטיל ${d1} + ${d2}`);

      if (p.inJail) {
        if (isDouble) {
          p.inJail = false;
          p.jailTurns = 0;
          log(s, `${p.name} יצא מהכלא עם דאבל`);
        } else {
          p.jailTurns++;
          if (p.jailTurns < 3) {
            s.again = false;
            finishMove(s);
            return s;
          }
          if (chargeOffTurn(s, p.id, [{ to: null, amount: JAIL_FINE }])) {
            if ((s.phase as GameState['phase']).t !== 'gameover') nextTurn(s);
            return s;
          }
          p.inJail = false;
          p.jailTurns = 0;
          log(s, `${p.name} שילם ${fmt(JAIL_FINE)} ויצא מהכלא`);
        }
        s.again = false;
      } else {
        s.doubles = isDouble ? s.doubles + 1 : 0;
        if (s.doubles === 3) {
          log(s, 'שלושה דאבלים ברצף!');
          sendToJail(s, 'שלושה דאבלים ברצף');
          finishMove(s);
          return s;
        }
        s.again = isDouble;
      }
      moveTo(s, (p.pos + d1 + d2) % 40);
      land(s);
      return s;
    }

    case 'PAY_JAIL':
      if (ph.t !== 'roll' || !p.inJail || p.money < JAIL_FINE) return prev;
      p.money -= JAIL_FINE;
      s.pot += JAIL_FINE;
      p.inJail = false;
      p.jailTurns = 0;
      log(s, `${p.name} שילם ${fmt(JAIL_FINE)} ויצא מהכלא`);
      return s;

    case 'USE_JAIL_CARD': {
      if (ph.t !== 'roll' || !p.inJail || p.jailCards.length === 0) return prev;
      returnJailCard(s, p.jailCards.shift()!);
      p.inJail = false;
      p.jailTurns = 0;
      log(s, `${p.name} השתמש בכרטיס יציאה מהכלא`);
      return s;
    }

    case 'BUY': {
      if (ph.t !== 'buy') return prev;
      const price = BOARD[ph.space].price!;
      if (p.money < price) return prev;
      p.money -= price;
      s.props[ph.space].owner = p.id;
      noteFirstPurchase(s);
      announce(s, { kind: 'buy', player: p.id, space: ph.space, price });
      log(s, `${p.name} קנה את ${BOARD[ph.space].name} ב-${fmt(price)}`);
      finishMove(s);
      return s;
    }

    case 'DECLINE':
      if (ph.t !== 'buy') return prev;
      if (hasAuction(s)) {
        startAuction(s, ph.space);
      } else {
        // with only two players left, an auction would just hand the property to the other one
        log(s, `${p.name} ויתר על ${BOARD[ph.space].name}, והנכס נשאר פנוי`);
        finishMove(s);
      }
      return s;

    case 'BID': {
      if (ph.t !== 'auction') return prev;
      const bidder = ph.active[ph.turn];
      if (a.amount <= ph.bid || a.amount > s.players[bidder].money) return prev;
      ph.bid = a.amount;
      ph.bidder = bidder;
      ph.turn = (ph.turn + 1) % ph.active.length;
      afterAuctionMove(s);
      return s;
    }

    case 'PASS': {
      if (ph.t !== 'auction') return prev;
      ph.active.splice(ph.turn, 1);
      if (ph.turn >= ph.active.length) ph.turn = 0;
      afterAuctionMove(s);
      return s;
    }

    case 'ACK_CARD':
      if (ph.t !== 'card') return prev;
      log(s, `${p.name}: ${DECKS[ph.deck][ph.card].text}`);
      applyCard(s, ph.deck, ph.card);
      return s;

    case 'BUILD':
      if (!manageAllowed(s) || !canBuild(s, p.id, a.space)) return prev;
      p.money -= BOARD[a.space].houseCost!;
      s.props[a.space].houses++;
      announce(s, {
        kind: s.props[a.space].houses === 5 ? 'hotel' : 'house',
        player: p.id,
        space: a.space,
        price: BOARD[a.space].houseCost!,
      });
      log(s, `${p.name} בנה ${s.props[a.space].houses === 5 ? 'מלון' : 'בית'} ב${BOARD[a.space].name}`);
      return s;

    case 'SELL':
      if (!manageAllowed(s) || !canSell(s, p.id, a.space)) return prev;
      s.props[a.space].houses--;
      p.money += sellValue(a.space);
      log(s, `${p.name} מכר מבנה ב${BOARD[a.space].name}`);
      return s;

    case 'SELL_BANK':
      if (!manageAllowed(s) || !canSellToBank(s, p.id, a.space)) return prev;
      sellToBank(s, p.id, a.space);
      return s;

    case 'UNMORTGAGE':
      if (!manageAllowed(s) || !canUnmortgage(s, p.id, a.space)) return prev;
      s.props[a.space].mortgaged = false;
      p.money -= unmortgageCost(a.space);
      log(s, `${p.name} פדה את ${BOARD[a.space].name}`);
      return s;

    case 'PAY_DEBT': {
      if (ph.t !== 'debt') return prev;
      const total = ph.owed.reduce((x, o) => x + o.amount, 0);
      if (p.money < total) return prev;
      settle(s, p.id, ph.owed);
      log(s, `${p.name} שילם את החוב`);
      if (ph.resume === 'roll') s.phase = { t: 'roll' };
      else finishMove(s);
      return s;
    }

    case 'BANKRUPT': {
      if (ph.t !== 'debt') return prev;
      const creditors = ph.owed.filter((o) => o.to !== null);
      const creditor = ph.owed.length === 1 && creditors.length === 1 ? creditors[0].to : null;
      goBankrupt(s, p.id, creditor);
      if (s.phase.t !== 'gameover') nextTurn(s);
      return s;
    }

    case 'SET_BOT': {
      const target = s.players[a.player];
      if (!target || target.bankrupt || target.isBot === a.isBot) return prev;
      target.isBot = a.isBot;
      log(s, a.isBot ? `המחשב משחק עכשיו במקום ${target.name}` : `${target.name} חזר לשחק`);
      return s;
    }

    case 'PROPOSE_TRADE': {
      if (ph.t !== 'roll' && ph.t !== 'end' && ph.t !== 'debt') return prev;
      const offer: TradeOffer = { from: p.id, to: a.to, give: a.give, get: a.get, round: 1 };
      if (!s.players[a.to] || !tradeOk(s, offer) || isBlocked(s, p.id, a.to)) return prev;
      s.tradesThisTurn++;
      s.phase = { t: 'trade', offer, awaiting: a.to, resume: ph.t === 'debt' ? ph : ph.t };
      log(s, `${p.name} מציע ל${s.players[a.to].name}: נותן ${describeSide(a.give)}, מבקש ${describeSide(a.get)}`);
      return s;
    }

    case 'ACCEPT_TRADE': {
      if (ph.t !== 'trade') return prev;
      const o = ph.offer;
      if (!tradeOk(s, o)) {
        log(s, 'העסקה כבר לא אפשרית');
        s.phase = resumePhase(ph.resume);
        return s;
      }
      transfer(s, o.from, o.to, o.give);
      transfer(s, o.to, o.from, o.get);
      const from = s.players[o.from];
      const to = s.players[o.to];
      log(s, `עסקה נסגרה בין ${from.name} ל${to.name}`);
      announce(s, {
        kind: 'trade',
        player: o.from,
        other: o.to,
        space: o.give.props[0] ?? o.get.props[0] ?? null,
        price: o.give.money + o.get.money,
        detail: `${from.name} נותן: ${describeSide(o.give)} · ${to.name} נותן: ${describeSide(o.get)}`,
      });
      s.phase = resumePhase(ph.resume);
      return s;
    }

    case 'REJECT_TRADE': {
      if (ph.t !== 'trade') return prev;
      log(s, `${s.players[ph.awaiting].name} סירב להצעה`);
      s.phase = resumePhase(ph.resume);
      return s;
    }

    case 'BLOCK_TRADE': {
      if (ph.t !== 'trade') return prev;
      const by = ph.awaiting;
      const from = ph.offer.from === by ? ph.offer.to : ph.offer.from;
      s.blocks = (s.blocks ?? []).filter((b) => !(b.by === by && b.from === from));
      s.blocks.push({ by, from, until: s.round + BLOCK_ROUNDS });
      log(s, `${s.players[by].name} סירב וחסם הצעות מ${s.players[from].name} ל-${BLOCK_ROUNDS} סבבים`);
      s.phase = resumePhase(ph.resume);
      return s;
    }

    case 'COUNTER_TRADE': {
      if (ph.t !== 'trade' || ph.offer.round >= MAX_TRADE_ROUNDS) return prev;
      const me = ph.awaiting;
      const other = ph.offer.from === me ? ph.offer.to : ph.offer.from;
      const offer: TradeOffer = { from: me, to: other, give: a.give, get: a.get, round: ph.offer.round + 1 };
      if (!tradeOk(s, offer)) return prev;
      s.phase = { t: 'trade', offer, awaiting: other, resume: ph.resume };
      log(s, `${s.players[me].name} מציע הצעה נגדית: נותן ${describeSide(a.give)}, מבקש ${describeSide(a.get)}`);
      return s;
    }

    case 'END_TURN':
      if (ph.t !== 'end' || s.again) return prev;
      nextTurn(s);
      return s;
  }
}

export const rollDice = (rng: () => number = Math.random): [number, number] => [
  1 + Math.floor(rng() * 6),
  1 + Math.floor(rng() * 6),
];
