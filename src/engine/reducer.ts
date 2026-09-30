import { BOARD, GO_SALARY, JAIL, JAIL_FINE, MORTGAGE_ROUNDS, START_MONEY, isOwnable } from '../data/board';
import { DECKS, type Deck } from '../data/cards';
import {
  buildingCounts,
  canBuild,
  canMortgage,
  canSell,
  canUnmortgage,
  mortgageValue,
  ownedBy,
  rentFor,
  sellValue,
  unmortgageCost,
  type RentMod,
} from './rules';
import type { Action, GameRules, GameState, Owed, PlayerSetup } from './types';

export const PLAYER_COLORS = ['#8E2DE2', '#7ED321', '#FF2D78', '#19D3C5'];
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
      name: p.name,
      token: p.token,
      isBot: p.isBot,
      color: PLAYER_COLORS[id % PLAYER_COLORS.length],
      money: START_MONEY,
      pos: 0,
      inJail: false,
      jailTurns: 0,
      jailCards: [],
      bankrupt: false,
    })),
    props: BOARD.map(() => ({ owner: null, houses: 0, mortgaged: false })),
    current: 0,
    phase: { t: 'roll' },
    dice: [1, 1],
    doubles: 0,
    pot: 0,
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
    s.phase = { t: 'debt', owed };
    log(s, `${p.name} חייב ${fmt(total)} ואין לו מספיק מזומן`);
  }
}

function settle(s: GameState, from: number, owed: Owed[]) {
  for (const o of owed) {
    s.players[from].money -= o.amount;
    if (o.to !== null) s.players[o.to].money += o.amount;
    else s.pot += o.amount;
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
    const mort = ownedBy(s, player)
      .filter((id) => canMortgage(s, player, id))
      .sort((a, b) => mortgageValue(a) - mortgageValue(b))[0];
    if (mort === undefined) return;
    s.props[mort].mortgaged = true;
    s.props[mort].mortgageLeft = MORTGAGE_ROUNDS;
    p.money += mortgageValue(mort);
  }
}

function sendToJail(s: GameState) {
  const p = cur(s);
  p.pos = JAIL;
  p.inJail = true;
  p.jailTurns = 0;
  s.again = false;
  log(s, `${p.name} נשלח לכלא!`);
}

function moveTo(s: GameState, target: number, passGo = true) {
  const p = cur(s);
  if (passGo && target < p.pos) {
    p.money += GO_SALARY;
    log(s, `${p.name} עבר ב"דרך צלחה" וקיבל ${fmt(GO_SALARY)}`);
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
    return charge(s, [{ to: owner.id, amount: rent }]);
  }

  switch (sp.kind) {
    case 'tax':
      log(s, `${p.name} משלם ${sp.name}: ${fmt(sp.amount!)}`);
      return charge(s, [{ to: null, amount: sp.amount! }]);
    case 'chance':
    case 'chest': {
      const deck: Deck = sp.kind;
      const card = s.decks[deck].shift()!;
      s.phase = { t: 'card', deck, card };
      return;
    }
    case 'gotojail':
      sendToJail(s);
      return finishMove(s);
    case 'parking':
      if (s.pot > 0) {
        p.money += s.pot;
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
        autoRaise(s, o.id, effect.amount);
        const paid = Math.min(o.money, effect.amount);
        o.money -= paid;
        p.money += paid;
        if (paid < effect.amount) goBankrupt(s, o.id, p.id);
      }
      return finishMove(s);
    case 'repairs': {
      const { houses, hotels } = buildingCounts(s, p.id);
      return charge(s, [{ to: null, amount: houses * effect.house + hotels * effect.hotel }]);
    }
    case 'gotojail':
      sendToJail(s);
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
      s.props[id] = { owner: creditor, houses: 0, mortgaged: st.mortgaged, mortgageLeft: st.mortgageLeft };
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

/** A new turn for the current player uses up one round on each of their mortgages. */
function tickMortgages(s: GameState) {
  const p = cur(s);
  for (const id of ownedBy(s, p.id)) {
    const st = s.props[id];
    if (!st.mortgaged) continue;
    st.mortgageLeft = (st.mortgageLeft ?? MORTGAGE_ROUNDS) - 1;
    if (st.mortgageLeft <= 0) {
      s.props[id] = { owner: null, houses: 0, mortgaged: false };
      log(s, `המשכנתא על ${BOARD[id].name} פגה. הנכס חזר לבנק`);
    } else if (st.mortgageLeft <= 2) {
      log(s, `${p.name}: נשארו ${st.mortgageLeft} סבבים לפדות את ${BOARD[id].name}`);
    }
  }
}

function nextTurn(s: GameState) {
  const n = s.players.length;
  let i = s.current;
  do i = (i + 1) % n;
  while (s.players[i].bankrupt);
  s.current = i;
  s.doubles = 0;
  s.again = false;
  s.turn++;
  s.phase = { t: 'roll' };
  tickMortgages(s);
}

function startAuction(s: GameState, space: number) {
  const n = s.players.length;
  const order: number[] = [];
  // the player who sent the property to auction may not bid on it
  for (let k = 1; k < n; k++) {
    const id = (s.current + k) % n;
    if (!s.players[id].bankrupt) order.push(id);
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
export function actor(s: GameState): number {
  if (s.phase.t === 'auction') return s.phase.active[s.phase.turn];
  return s.current;
}

function manageAllowed(s: GameState) {
  return ['roll', 'end', 'debt', 'buy'].includes(s.phase.t);
}

// ---------- the reducer ----------

export function reduce(prev: GameState, a: Action): GameState {
  if (prev.phase.t === 'gameover') return prev;
  const s: GameState = structuredClone(prev);
  const p = cur(s);
  const ph = s.phase;

  switch (a.type) {
    case 'ROLL': {
      const canRoll = ph.t === 'roll' || (ph.t === 'end' && s.again);
      if (!canRoll) return prev;
      const [d1, d2] = a.dice;
      const isDouble = d1 === d2;
      s.dice = [d1, d2];
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
          autoRaise(s, p.id, JAIL_FINE);
          if (p.money < JAIL_FINE) {
            goBankrupt(s, p.id, null);
            if (s.phase.t !== 'gameover') nextTurn(s);
            return s;
          }
          p.money -= JAIL_FINE;
          s.pot += JAIL_FINE;
          p.inJail = false;
          p.jailTurns = 0;
          log(s, `${p.name} שילם ${fmt(JAIL_FINE)} ויצא מהכלא`);
        }
        s.again = false;
      } else {
        s.doubles = isDouble ? s.doubles + 1 : 0;
        if (s.doubles === 3) {
          log(s, 'שלושה דאבלים ברצף!');
          sendToJail(s);
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
      log(s, `${p.name} קנה את ${BOARD[ph.space].name} ב-${fmt(price)}`);
      finishMove(s);
      return s;
    }

    case 'DECLINE':
      if (ph.t !== 'buy') return prev;
      startAuction(s, ph.space);
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
      log(s, `${p.name} בנה ${s.props[a.space].houses === 5 ? 'מלון' : 'בית'} ב${BOARD[a.space].name}`);
      return s;

    case 'SELL':
      if (!manageAllowed(s) || !canSell(s, p.id, a.space)) return prev;
      s.props[a.space].houses--;
      p.money += sellValue(a.space);
      log(s, `${p.name} מכר מבנה ב${BOARD[a.space].name}`);
      return s;

    case 'MORTGAGE':
      if (!manageAllowed(s) || !canMortgage(s, p.id, a.space)) return prev;
      s.props[a.space].mortgaged = true;
      s.props[a.space].mortgageLeft = MORTGAGE_ROUNDS;
      p.money += mortgageValue(a.space);
      log(s, `${p.name} משכן את ${BOARD[a.space].name}`);
      return s;

    case 'UNMORTGAGE':
      if (!manageAllowed(s) || !canUnmortgage(s, p.id, a.space)) return prev;
      s.props[a.space].mortgaged = false;
      delete s.props[a.space].mortgageLeft;
      p.money -= unmortgageCost(a.space);
      log(s, `${p.name} פדה את ${BOARD[a.space].name}`);
      return s;

    case 'PAY_DEBT': {
      if (ph.t !== 'debt') return prev;
      const total = ph.owed.reduce((x, o) => x + o.amount, 0);
      if (p.money < total) return prev;
      settle(s, p.id, ph.owed);
      log(s, `${p.name} שילם את החוב`);
      finishMove(s);
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
