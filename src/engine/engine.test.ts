import { describe, expect, it } from 'vitest';
import { BOARD, JAIL } from '../data/board';
import { CHANCE, CHEST } from '../data/cards';
import { botAction } from './bot';
import { actor, newGame, reduce } from './reducer';
import { canBuild, feeDue, rentFor } from './rules';
import type { Action, GameState } from './types';

/** A fresh game where everyone already went around once (before that, buying is not allowed). */
const setup = (n = 2) => {
  const s = newGame(
    Array.from({ length: n }, (_, i) => ({ name: `P${i}`, token: 'cat' as const, isBot: false })),
    () => 0.5,
  );
  s.round = 2;
  for (const p of s.players) p.lapped = true;
  return s;
};

const run = (s: GameState, ...actions: Action[]) => actions.reduce(reduce, s);

function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

describe('board', () => {
  it('has 40 spaces with the classic composition', () => {
    expect(BOARD).toHaveLength(40);
    const count = (k: string) => BOARD.filter((s) => s.kind === k).length;
    expect(count('property')).toBe(22);
    expect(count('railroad')).toBe(4);
    expect(count('utility')).toBe(2);
    expect(count('tax')).toBe(2);
    expect(count('chance')).toBe(3);
    expect(count('chest')).toBe(3);
    BOARD.forEach((s, i) => expect(s.id).toBe(i));
  });
  it('has 16 cards per deck', () => {
    expect(CHANCE).toHaveLength(16);
    expect(CHEST).toHaveLength(16);
  });
});

describe('movement and buying', () => {
  it('moves by the dice and offers the property', () => {
    const s = run(setup(), { type: 'ROLL', dice: [2, 4] });
    expect(s.players[0].pos).toBe(6);
    expect(s.phase).toEqual({ t: 'buy', space: 6 });
    const b = reduce(s, { type: 'BUY' });
    expect(b.props[6].owner).toBe(0);
    expect(b.players[0].money).toBe(1400);
    expect(b.phase.t).toBe('end');
  });

  it('pays GO salary when passing', () => {
    let s = setup();
    s.players[0].pos = 38;
    s = run(s, { type: 'ROLL', dice: [2, 3] });
    expect(s.players[0].pos).toBe(3);
    expect(s.players[0].money).toBe(1700);
  });

  it('a double lets you roll again, three doubles send you to jail', () => {
    let s = run(setup(), { type: 'ROLL', dice: [3, 3] }, { type: 'BUY' });
    expect(s.again).toBe(true);
    expect(reduce(s, { type: 'END_TURN' })).toBe(s);
    s = run(s, { type: 'ROLL', dice: [2, 2] }, { type: 'ROLL', dice: [4, 4] });
    expect(s.players[0].pos).toBe(JAIL);
    expect(s.players[0].inJail).toBe(true);
    expect(s.again).toBe(false);
  });
});

describe('rent', () => {
  it('doubles base rent with a full set and uses house rent', () => {
    const s = setup();
    s.props[1].owner = 0;
    expect(rentFor(s, 1, 7)).toBe(2);
    s.props[3].owner = 0;
    expect(rentFor(s, 1, 7)).toBe(4);
    s.props[1].houses = 3;
    expect(rentFor(s, 1, 7)).toBe(90);
    s.props[1].houses = 5;
    expect(rentFor(s, 1, 7)).toBe(250);
  });

  it('railroads and utilities scale with count', () => {
    const s = setup();
    s.props[5].owner = 0;
    s.props[15].owner = 0;
    expect(rentFor(s, 5, 7)).toBe(50);
    expect(rentFor(s, 5, 7, 'rail2')).toBe(100);
    s.props[12].owner = 0;
    expect(rentFor(s, 12, 7)).toBe(28);
    s.props[28].owner = 0;
    expect(rentFor(s, 12, 7)).toBe(70);
  });

  it('transfers rent to the owner', () => {
    let s = setup();
    s.props[6].owner = 1;
    s = run(s, { type: 'ROLL', dice: [2, 4] });
    expect(s.players[0].money).toBe(1494);
    expect(s.players[1].money).toBe(1506);
  });
});

describe('building', () => {
  it('requires a full set and even building', () => {
    const s = setup();
    s.props[1].owner = 0;
    expect(canBuild(s, 0, 1)).toBe(false);
    s.props[3].owner = 0;
    expect(canBuild(s, 0, 1)).toBe(true);
    s.props[1].houses = 1;
    expect(canBuild(s, 0, 1)).toBe(false);
    expect(canBuild(s, 0, 3)).toBe(true);
  });
});

describe('jail', () => {
  it('leaves jail after the third failed roll by paying the fine', () => {
    let s = setup();
    s.players[0].inJail = true;
    s.players[0].pos = JAIL;
    s.players[0].jailTurns = 2;
    s = run(s, { type: 'ROLL', dice: [1, 2] });
    expect(s.players[0].inJail).toBe(false);
    expect(s.players[0].pos).toBe(13);
  });
  it('pays to leave jail', () => {
    let s = setup();
    s.players[0].inJail = true;
    s = run(s, { type: 'PAY_JAIL' });
    expect(s.players[0].inJail).toBe(false);
    expect(s.players[0].money).toBe(1450);
  });
});

describe('debt and bankruptcy', () => {
  it('enters debt when short and hands everything to the creditor on bankruptcy', () => {
    let s = setup();
    s.props[39].owner = 1;
    s.props[39].houses = 5;
    s.props[1].owner = 0;
    s.players[0].pos = 30 + 0;
    s.players[0].pos = 33;
    s = run(s, { type: 'ROLL', dice: [3, 3] });
    expect(s.phase.t).toBe('debt');
    s = reduce(s, { type: 'BANKRUPT' });
    expect(s.phase).toEqual({ t: 'gameover', winner: 1 });
    expect(s.props[1].owner).toBe(1);
  });
});

describe('cards', () => {
  it('applies a drawn card on acknowledge', () => {
    let s = setup();
    const goCard = CHANCE.findIndex((c) => c.effect.type === 'move' && c.effect.to === 0);
    s.decks.chance = [goCard, ...s.decks.chance.filter((c) => c !== goCard)];
    s = run(s, { type: 'ROLL', dice: [3, 4] });
    expect(s.phase).toEqual({ t: 'card', deck: 'chance', card: goCard });
    s = reduce(s, { type: 'ACK_CARD' });
    expect(s.players[0].pos).toBe(0);
    expect(s.players[0].money).toBe(1900);
    expect(s.decks.chance.at(-1)).toBe(goCard);
  });
});

describe('bots', () => {
  it('four bots can play a long game without breaking the rules', () => {
    let finished = 0;
    for (let seed = 1; seed <= 8; seed++) {
      const rng = seeded(seed);
      let s = newGame(
        Array.from({ length: 4 }, (_, i) => ({ name: `B${i}`, token: 'car' as const, isBot: true })),
        rng,
      );
      for (let step = 0; step < 6000 && s.phase.t !== 'gameover'; step++) {
        const a = botAction(s, rng);
        expect(a).not.toBeNull();
        const next = reduce(s, a!);
        // every bot action must be legal (change the state)
        expect(next, `seed ${seed} step ${step} ${JSON.stringify(a)} phase ${s.phase.t}`).not.toBe(s);
        s = next;
        for (const p of s.players) expect(p.money).toBeGreaterThanOrEqual(0);
        const decks = s.decks.chance.length + s.decks.chest.length;
        const held = s.players.reduce((n, p) => n + p.jailCards.length, 0);
        const drawn = s.phase.t === 'card' ? 1 : 0;
        expect(decks + held + drawn).toBe(32);
        expect(actor(s)).toBeGreaterThanOrEqual(0);
      }
      if (s.phase.t === 'gameover') finished++;
    }
    console.log(`bot games finished: ${finished}/8`);
  }, 60_000);
});

describe('lotto pot', () => {
  it('collects taxes and pays out on free parking', () => {
    let s = run(setup(), { type: 'ROLL', dice: [1, 3] });
    expect(s.players[0].money).toBe(1300);
    expect(s.pot).toBe(200);
    s = run(s, { type: 'END_TURN' });
    s.players[1].pos = 15;
    s = run(s, { type: 'ROLL', dice: [2, 3] });
    expect(s.players[1].money).toBe(1700);
    expect(s.pot).toBe(0);
  });
  it('collects the jail fine', () => {
    let s = setup();
    s.players[0].inJail = true;
    s = run(s, { type: 'PAY_JAIL' });
    expect(s.pot).toBe(50);
  });
});

describe('mortgage payments', () => {
  const endRound = (s: GameState) => {
    for (let k = 0; k < s.players.length; k++) {
      s.phase = { t: 'end' };
      s = reduce(s, { type: 'END_TURN' });
    }
    return s;
  };

  it('starts counting at the first purchase and charges every 7 rounds into the pot', () => {
    let s = run(setup(), { type: 'ROLL', dice: [2, 4] }, { type: 'BUY' });
    expect(s.feeStart).toBe(2);
    s.props[5].owner = 1; // railway for the other player
    for (let r = 2; r < 8; r++) s = endRound(s);
    expect(s.round).toBe(8);
    expect(s.pot).toBe(0);
    const before = [s.players[0].money, s.players[1].money];
    s = endRound(s);
    expect(s.round).toBe(9);
    expect(s.players[0].money).toBe(before[0] - 50); // half of 100
    expect(s.players[1].money).toBe(before[1] - 100); // half of 200
    expect(s.pot).toBe(150);
  });

  it('an old mortgaged property skips the payment and can still be redeemed', () => {
    let s = setup();
    s.props[5].owner = 0;
    s.props[5].mortgaged = true;
    expect(feeDue(s, 0)).toBe(0);
    s = run(s, { type: 'UNMORTGAGE', space: 5 });
    expect(s.players[0].money).toBe(1280);
    expect(s.props[5].mortgaged).toBe(false);
  });
});

describe('public auction', () => {
  it('excludes the player who sent the property to auction', () => {
    let s = setup(3);
    s = run(s, { type: 'ROLL', dice: [2, 4] }, { type: 'DECLINE' });
    expect(s.phase).toMatchObject({ t: 'auction', active: [1, 2] });
    expect(actor(s)).toBe(1);
  });
  it('with two players, declining leaves the property free instead of auctioning it', () => {
    let s = setup(2);
    s = run(s, { type: 'ROLL', dice: [2, 4] }, { type: 'DECLINE' });
    expect(s.phase.t).toBe('end');
    expect(s.props[6].owner).toBeNull();
    expect(s.players[1].money).toBe(1500);
  });
  it('goes unsold when nobody else is left to bid', () => {
    let s = setup(2);
    s.players[1].bankrupt = true;
    s = run(s, { type: 'ROLL', dice: [2, 4] }, { type: 'DECLINE' });
    expect(s.phase.t).toBe('end');
    expect(s.props[6].owner).toBeNull();
  });
});

describe('game options', () => {
  it('selling to the bank works even when the mortgage rule is off', () => {
    let s = newGame(
      [
        { name: 'A', token: 'cat', isBot: false },
        { name: 'B', token: 'dog', isBot: false },
      ],
      () => 0.5,
      { mortgage: false },
    );
    s.props[6].owner = 0;
    expect(reduce(s, { type: 'SELL_BANK', space: 6 }).props[6].owner).toBeNull();
  });
});

describe('seat takeover', () => {
  it('hands a seat to the computer and back', () => {
    let s = setup(2);
    expect(botAction(s)).toBeNull();
    s = reduce(s, { type: 'SET_BOT', player: 0, isBot: true });
    expect(s.players[0].isBot).toBe(true);
    expect(botAction(s)).not.toBeNull();
    s = reduce(s, { type: 'SET_BOT', player: 0, isBot: false });
    expect(s.players[0].isBot).toBe(false);
  });
});

describe('payment events', () => {
  it('records rent paid to the owner', () => {
    let s = setup();
    s.props[6].owner = 1;
    s = run(s, { type: 'ROLL', dice: [2, 4] });
    expect(s.paySeq).toBe(1);
    expect(s.payEvents).toEqual([{ kind: 'rent', from: 0, to: 1, amount: 6, space: 6 }]);
  });
});

describe('announcements', () => {
  it('announces a purchase and a new house', () => {
    let s = run(setup(), { type: 'ROLL', dice: [2, 4] }, { type: 'BUY' });
    expect(s.announceSeq).toBe(1);
    expect(s.announce).toEqual({ kind: 'buy', player: 0, space: 6, price: 100 });
    s.props[8].owner = 0;
    s.props[9].owner = 0;
    s = reduce(s, { type: 'BUILD', space: 6 });
    expect(s.announce).toMatchObject({ kind: 'house', player: 0, space: 6 });
  });
});

describe('no mortgaging without permission', () => {
  it('defers a real player\'s unpaid mortgage payment to their next turn', () => {
    let s = run(setup(), { type: 'ROLL', dice: [2, 4] }, { type: 'BUY' });
    s.players[0].money = 10;
    for (let r = 1; r <= 7; r++) {
      for (let k = 0; k < 2; k++) {
        s.phase = { t: 'end' };
        s = reduce(s, { type: 'END_TURN' });
      }
    }
    expect(s.props[6].mortgaged).toBe(false);
    expect(s.current).toBe(0);
    expect(s.phase).toMatchObject({ t: 'debt', resume: 'roll' });
    s.players[0].money = 100;
    s = reduce(s, { type: 'PAY_DEBT' });
    expect(s.phase.t).toBe('roll');
    expect(s.players[0].money).toBe(50);
  });
});

describe('careful bots', () => {
  it('keeps cash when an opponent has a hotel', () => {
    let s = newGame(
      [
        { name: 'B', token: 'cat', isBot: true },
        { name: 'H', token: 'dog', isBot: false },
      ],
      () => 0.5,
    );
    s.props[37].owner = 1;
    s.props[39].owner = 1;
    s.props[39].houses = 5;
    s.players[0].money = 300;
    s.phase = { t: 'buy', space: 29 };
    expect(botAction(s)).toEqual({ type: 'DECLINE' });
    s.players[0].money = 1500;
    expect(botAction(s)).toEqual({ type: 'BUY' });
  });
});

describe('trades', () => {
  const side = (props: number[] = [], money = 0, jailCards = 0) => ({ props, money, jailCards });

  it('moves properties, money and jail cards when accepted', () => {
    let s = setup();
    s.props[6].owner = 0;
    s.props[8].owner = 1;
    s.players[0].jailCards = ['chance'];
    s = reduce(s, { type: 'PROPOSE_TRADE', to: 1, give: side([6], 50, 1), get: side([8]) });
    expect(s.phase).toMatchObject({ t: 'trade', awaiting: 1, resume: 'roll' });
    expect(actor(s)).toBe(1);
    s = reduce(s, { type: 'ACCEPT_TRADE' });
    expect(s.props[6].owner).toBe(1);
    expect(s.props[8].owner).toBe(0);
    expect(s.players[0].money).toBe(1450);
    expect(s.players[1].money).toBe(1550);
    expect(s.players[1].jailCards).toEqual(['chance']);
    expect(s.phase.t).toBe('roll');
    expect(s.announce).toMatchObject({ kind: 'trade', player: 0, other: 1 });
  });

  it('reject changes nothing', () => {
    let s = setup();
    s.props[6].owner = 0;
    s = run(s, { type: 'PROPOSE_TRADE', to: 1, give: side([6]), get: side([], 100) }, { type: 'REJECT_TRADE' });
    expect(s.props[6].owner).toBe(0);
    expect(s.players[1].money).toBe(1500);
    expect(s.phase.t).toBe('roll');
  });

  it('refuses properties with houses in the set and money you do not have', () => {
    const s = setup();
    s.props[1].owner = 0;
    s.props[3].owner = 0;
    s.props[3].houses = 1;
    expect(reduce(s, { type: 'PROPOSE_TRADE', to: 1, give: side([1]), get: side([], 10) })).toBe(s);
    expect(reduce(s, { type: 'PROPOSE_TRADE', to: 1, give: side([], 5000), get: side([], 0, 0) })).toBe(s);
  });

  it('counter-offers swap roles and stop after 3 rounds', () => {
    let s = setup();
    s.props[6].owner = 1;
    s = reduce(s, { type: 'PROPOSE_TRADE', to: 1, give: side([], 100), get: side([6]) });
    s = reduce(s, { type: 'COUNTER_TRADE', give: side([6]), get: side([], 150) });
    expect(s.phase).toMatchObject({ t: 'trade', awaiting: 0, offer: { from: 1, round: 2 } });
    s = reduce(s, { type: 'COUNTER_TRADE', give: side([], 120), get: side([6]) });
    expect(s.phase).toMatchObject({ awaiting: 1, offer: { round: 3 } });
    expect(reduce(s, { type: 'COUNTER_TRADE', give: side([6]), get: side([], 130) })).toBe(s);
  });

  it('bots accept good deals, refuse bad ones, and ask for a missing street', () => {
    let s = newGame(
      [
        { name: 'H', token: 'cat', isBot: false },
        { name: 'B', token: 'dog', isBot: true },
      ],
      () => 0.5,
    );
    s.props[6].owner = 1;
    const good = reduce(s, { type: 'PROPOSE_TRADE', to: 1, give: side([], 200), get: side([6]) });
    expect(botAction(good)).toEqual({ type: 'ACCEPT_TRADE' });
    const bad = reduce(s, { type: 'PROPOSE_TRADE', to: 1, give: side([], 10), get: side([6]) });
    expect(botAction(bad)).toEqual({ type: 'REJECT_TRADE' });

    s.props[6].owner = 0;
    s.props[8].owner = 1;
    s.props[9].owner = 1;
    s.current = 1;
    expect(botAction(s)).toMatchObject({ type: 'PROPOSE_TRADE', to: 0, get: { props: [6] } });
  });
});

describe('דרך צלחה and taxes', () => {
  it('pays 200 for passing and 400 for landing exactly', () => {
    let s = setup();
    s.players[0].pos = 38;
    s = run(s, { type: 'ROLL', dice: [2, 3] });
    expect(s.players[0].money).toBe(1700);
    expect(s.payEvents[0]).toEqual({ kind: 'go', from: null, to: 0, amount: 200, space: 0 });

    let t = setup();
    t.players[0].pos = 36;
    t = run(t, { type: 'ROLL', dice: [1, 3] });
    expect(t.players[0].pos).toBe(0);
    expect(t.players[0].money).toBe(1900);
    expect(t.payEvents).toEqual([{ kind: 'go-land', from: null, to: 0, amount: 400, space: 0 }]);
  });

  it('the card to GO pays 400', () => {
    let s = setup();
    const goCard = CHANCE.findIndex((c) => c.effect.type === 'move' && c.effect.to === 0);
    s.decks.chance = [goCard, ...s.decks.chance.filter((c) => c !== goCard)];
    s = run(s, { type: 'ROLL', dice: [3, 4] }, { type: 'ACK_CARD' });
    expect(s.players[0].money).toBe(1900);
  });

  it('records passing GO and then a tax, in order', () => {
    let s = setup();
    s.players[0].pos = 38;
    s = run(s, { type: 'ROLL', dice: [2, 4] });
    expect(s.players[0].pos).toBe(4);
    expect(s.payEvents.map((e) => e.kind)).toEqual(['go', 'tax']);
    expect(s.payEvents[1]).toEqual({ kind: 'tax', from: 0, to: null, amount: 200, space: 4 });
    expect(s.pot).toBe(200);
  });
});

describe('selling to the bank', () => {
  it('pays half the price and frees the property, so a debt can be paid', () => {
    let s = setup();
    s.props[39].owner = 0; // דיזנגוף, price 400
    s.players[0].money = 600;
    s.phase = { t: 'debt', owed: [{ to: 1, amount: 800 }], resume: 'end' };
    s = reduce(s, { type: 'PAY_DEBT' });
    expect(s.phase.t).toBe('debt');
    s = reduce(s, { type: 'SELL_BANK', space: 39 });
    expect(s.players[0].money).toBe(800);
    expect(s.props[39]).toEqual({ owner: null, houses: 0, mortgaged: false });
    s = reduce(s, { type: 'PAY_DEBT' });
    expect(s.phase.t).toBe('end');
    expect(s.players[0].money).toBe(0);
    expect(s.players[1].money).toBe(2300);
  });

  it('a mortgaged property goes back for nothing', () => {
    let s = setup();
    s.props[5].owner = 0;
    s.props[5].mortgaged = true;
    s = reduce(s, { type: 'SELL_BANK', space: 5 });
    expect(s.players[0].money).toBe(1500);
    expect(s.props[5]).toEqual({ owner: null, houses: 0, mortgaged: false });
  });

  it('needs the color group to have no houses, and only on your turn', () => {
    let s = setup();
    for (const id of [37, 39]) s.props[id].owner = 0;
    s.props[39].houses = 1;
    expect(reduce(s, { type: 'SELL_BANK', space: 37 })).toBe(s);
    s.props[39].houses = 0;
    s.props[1].owner = 1;
    expect(reduce(s, { type: 'SELL_BANK', space: 1 })).toBe(s); // not player 1's turn
  });

  it('a bot in debt with mortgage off sells to the bank instead of going bankrupt', () => {
    let s = newGame(
      [
        { name: 'B', token: 'cat', isBot: true },
        { name: 'H', token: 'dog', isBot: false },
      ],
      () => 0.5,
      { mortgage: false },
    );
    s.props[39].owner = 0;
    s.players[0].money = 100;
    s.phase = { t: 'debt', owed: [{ to: 1, amount: 250 }], resume: 'end' };
    expect(botAction(s, () => 0.5)).toEqual({ type: 'SELL_BANK', space: 39 });
    s = reduce(s, botAction(s, () => 0.5)!);
    expect(botAction(s, () => 0.5)).toEqual({ type: 'PAY_DEBT' });
  });
});

describe('first lap', () => {
  const fresh = (n = 2) => {
    const s = setup(n);
    for (const p of s.players) p.lapped = false;
    return s;
  };

  it('nothing can be bought before going around once', () => {
    let s = fresh();
    s = run(s, { type: 'ROLL', dice: [2, 4] });
    expect(s.phase.t).toBe('end');
    expect(s.props[6].owner).toBeNull();
  });

  it('passing "דרך צלחה" opens buying for that player only', () => {
    let s = fresh();
    s.players[0].pos = 37;
    s = run(s, { type: 'ROLL', dice: [2, 4] }); // 37 → 3, past GO
    expect(s.players[0].lapped).toBe(true);
    expect(s.phase).toEqual({ t: 'buy', space: 3 });
    s = run(s, { type: 'BUY' }, { type: 'END_TURN' });
    // player 1 has not gone around yet
    s = run(s, { type: 'ROLL', dice: [2, 4] });
    expect(s.players[1].lapped).toBe(false);
    expect(s.phase.t).toBe('end');
    expect(s.props[6].owner).toBeNull();
  });

  it('landing exactly on "דרך צלחה" counts as a lap', () => {
    let s = fresh();
    s.players[0].pos = 34;
    s = run(s, { type: 'ROLL', dice: [2, 4] }); // 34 → 0
    expect(s.players[0].pos).toBe(0);
    expect(s.players[0].lapped).toBe(true);
  });

  it('going to jail is not a lap', () => {
    let s = fresh();
    s.players[0].pos = 24;
    s = run(s, { type: 'ROLL', dice: [2, 4] }); // 24 → 30 "go to jail"
    expect(s.players[0].pos).toBe(JAIL);
    expect(s.players[0].lapped).toBe(false);
  });

  it('only players who went around may bid at an auction', () => {
    let s = fresh(3);
    s.players[0].lapped = true;
    s.players[2].lapped = true;
    s = run(s, { type: 'ROLL', dice: [2, 4] }, { type: 'DECLINE' });
    expect(s.phase).toMatchObject({ t: 'auction', active: [2] });
  });

  it('with no one allowed to bid, the property just stays free', () => {
    let s = fresh(3);
    s.players[0].lapped = true;
    s = run(s, { type: 'ROLL', dice: [2, 4] }, { type: 'DECLINE' });
    expect(s.phase.t).toBe('end');
    expect(s.props[6].owner).toBeNull();
  });
});

describe('blocking trade offers', () => {
  const offer = (to: number): Action => ({
    type: 'PROPOSE_TRADE',
    to,
    give: { props: [], money: 50, jailCards: 0 },
    get: { props: [], money: 0, jailCards: 1 },
  });

  it('rejects and blocks the sender for 3 rounds', () => {
    let s = setup(2);
    s.players[1].jailCards = ['chance'];
    s = run(s, offer(1));
    expect(s.phase.t).toBe('trade');
    s = reduce(s, { type: 'BLOCK_TRADE' });
    expect(s.phase).toEqual({ t: 'roll' });
    expect(s.blocks).toEqual([{ by: 1, from: 0, until: 5 }]);
    expect(reduce(s, offer(1))).toBe(s);
    s.round = 5;
    expect(reduce(s, offer(1)).phase.t).toBe('trade');
  });

  it('a bot does not offer to a player who blocked it', () => {
    let s = newGame(
      [
        { name: 'B', token: 'cat', isBot: true },
        { name: 'H', token: 'dog', isBot: false },
      ],
      () => 0.5,
    );
    s.round = 2;
    s.props[37].owner = 0;
    s.props[39].owner = 1;
    expect(botAction(s, () => 0.5)).toMatchObject({ type: 'PROPOSE_TRADE', to: 1 });
    s.blocks = [{ by: 1, from: 0, until: 5 }];
    expect(botAction(s, () => 0.5)).toMatchObject({ type: 'ROLL' });
  });
});

describe('trading while in debt', () => {
  it('sells a property to another player and goes back to paying the debt', () => {
    let s = setup(2);
    s.props[39].owner = 0;
    s.players[0].money = 100;
    const debt = { t: 'debt' as const, owed: [{ to: null, amount: 300 }], resume: 'end' as const };
    s.phase = debt;
    s = reduce(s, {
      type: 'PROPOSE_TRADE',
      to: 1,
      give: { props: [39], money: 0, jailCards: 0 },
      get: { props: [], money: 350, jailCards: 0 },
    });
    expect(s.phase.t).toBe('trade');
    s = reduce(s, { type: 'ACCEPT_TRADE' });
    expect(s.phase).toEqual(debt);
    expect(s.props[39].owner).toBe(1);
    s = reduce(s, { type: 'PAY_DEBT' });
    expect(s.phase.t).toBe('end');
    expect(s.players[0].money).toBe(150);
  });

  it('a rejected offer returns to the debt', () => {
    let s = setup(2);
    s.props[39].owner = 0;
    s.phase = { t: 'debt', owed: [{ to: 1, amount: 2000 }], resume: 'roll' };
    s = reduce(s, {
      type: 'PROPOSE_TRADE',
      to: 1,
      give: { props: [39], money: 0, jailCards: 0 },
      get: { props: [], money: 900, jailCards: 0 },
    });
    s = reduce(s, { type: 'REJECT_TRADE' });
    expect(s.phase).toMatchObject({ t: 'debt', resume: 'roll' });
  });
});

describe('go to jail announcement', () => {
  it('announces landing on "גש לכלא"', () => {
    let s = setup();
    s.players[0].pos = 25;
    const seq = s.announceSeq;
    s = run(s, { type: 'ROLL', dice: [2, 3] });
    expect(s.players[0].inJail).toBe(true);
    expect(s.announceSeq).toBe(seq + 1);
    expect(s.announce).toMatchObject({ kind: 'jail', player: 0, detail: 'נחת על "גש לכלא"' });
  });

  it('announces three doubles in a row', () => {
    let s = setup();
    s.doubles = 2;
    s = run(s, { type: 'ROLL', dice: [1, 1] });
    expect(s.players[0].inJail).toBe(true);
    expect(s.announce).toMatchObject({ kind: 'jail', detail: 'שלושה דאבלים ברצף' });
  });
});

describe('resigning (פשיטת רגל from the profile)', () => {
  it('on my turn: I am out, my properties are free, my cash is gone, the turn passes', () => {
    const s0 = setup(3);
    s0.props[1].owner = 0;
    s0.props[3] = { owner: 0, houses: 2, mortgaged: false };
    const pot = s0.pot;
    const s = reduce(s0, { type: 'RESIGN', player: 0 });
    expect(s.players[0].bankrupt).toBe(true);
    expect(s.players[0].money).toBe(0);
    expect(s.props[1].owner).toBeNull();
    expect(s.props[3]).toEqual({ owner: null, houses: 0, mortgaged: false });
    expect(s.pot).toBe(pot);
    expect(s.current).toBe(1);
    expect(s.phase).toEqual({ t: 'roll' });
  });

  it("on someone else's turn: their turn goes on", () => {
    let s = setup(3);
    s = run(s, { type: 'ROLL', dice: [2, 4] });
    expect(s.phase).toEqual({ t: 'buy', space: 6 });
    s = reduce(s, { type: 'RESIGN', player: 2 });
    expect(s.players[2].bankrupt).toBe(true);
    expect(s.current).toBe(0);
    expect(s.phase).toEqual({ t: 'buy', space: 6 });
  });

  it('with two players, the other one wins', () => {
    const s = reduce(setup(2), { type: 'RESIGN', player: 1 });
    expect(s.phase).toEqual({ t: 'gameover', winner: 0 });
  });

  it('when only bots are left, the richest bot wins', () => {
    const s0 = setup(3);
    s0.players[1].isBot = true;
    s0.players[2].isBot = true;
    s0.players[2].money = 3000;
    const s = reduce(s0, { type: 'RESIGN', player: 0 });
    expect(s.phase).toEqual({ t: 'gameover', winner: 2 });
  });

  it("is refused while I'm bidding in another player's auction", () => {
    let s = setup(3);
    s = run(s, { type: 'ROLL', dice: [2, 4] }, { type: 'DECLINE' });
    expect(s.phase.t).toBe('auction');
    expect(reduce(s, { type: 'RESIGN', player: 1 })).toBe(s);
  });
});
