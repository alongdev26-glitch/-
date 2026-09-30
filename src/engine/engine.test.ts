import { describe, expect, it } from 'vitest';
import { BOARD, JAIL } from '../data/board';
import { CHANCE, CHEST } from '../data/cards';
import { botAction } from './bot';
import { actor, newGame, reduce } from './reducer';
import { canBuild, feeDue, rentFor } from './rules';
import type { Action, GameState } from './types';

const setup = (n = 2) =>
  newGame(
    Array.from({ length: n }, (_, i) => ({ name: `P${i}`, token: 'cat' as const, isBot: false })),
    () => 0.5,
  );

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
    expect(s.players[0].money).toBe(1700);
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
    expect(s.feeStart).toBe(1);
    s.props[5].owner = 1; // railway for the other player
    for (let r = 1; r < 7; r++) s = endRound(s);
    expect(s.round).toBe(7);
    expect(s.pot).toBe(0);
    const before = [s.players[0].money, s.players[1].money];
    s = endRound(s);
    expect(s.round).toBe(8);
    expect(s.players[0].money).toBe(before[0] - 50); // half of 100
    expect(s.players[1].money).toBe(before[1] - 100); // half of 200
    expect(s.pot).toBe(150);
  });

  it('voluntary mortgage pays the full price and skips the payment', () => {
    let s = setup();
    s.props[5].owner = 0;
    s = run(s, { type: 'MORTGAGE', space: 5 });
    expect(s.players[0].money).toBe(1700);
    expect(feeDue(s, 0)).toBe(0);
    s = run(s, { type: 'UNMORTGAGE', space: 5 });
    expect(s.players[0].money).toBe(1480);
  });
});

describe('public auction', () => {
  it('excludes the player who sent the property to auction', () => {
    let s = setup(3);
    s = run(s, { type: 'ROLL', dice: [2, 4] }, { type: 'DECLINE' });
    expect(s.phase).toMatchObject({ t: 'auction', active: [1, 2] });
    expect(actor(s)).toBe(1);
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
  it('blocks mortgages when the mortgage rule is off', () => {
    let s = newGame(
      [
        { name: 'A', token: 'cat', isBot: false },
        { name: 'B', token: 'dog', isBot: false },
      ],
      () => 0.5,
      { mortgage: false },
    );
    s.props[6].owner = 0;
    expect(reduce(s, { type: 'MORTGAGE', space: 6 })).toBe(s);
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
    expect(s.payment).toEqual({ from: 0, to: 1, amount: 6, space: 6 });
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
