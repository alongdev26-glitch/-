import { describe, expect, it } from 'vitest';
import { BOARD } from '../data/board';
import { CHANCE, CHEST } from '../data/cards';
import { EDITIONS, applyEdition, money } from '../data/editions';
import { newGame, reduce } from '../engine/reducer';
import { en } from './en';
import { ar } from './ar';
import { he } from './he';
import { t } from './index';

const HEBREW = /[֐-׿]/;

describe('languages', () => {
  it('every edition names all 40 spaces, every property city and every card', () => {
    for (const e of Object.values(EDITIONS)) {
      expect(e.names).toHaveLength(40);
      expect(e.chance).toHaveLength(CHANCE.length);
      expect(e.chest).toHaveLength(CHEST.length);
      for (const sp of BOARD) if (sp.kind === 'property') expect(e.cities[sp.id]).toBeTruthy();
    }
  });

  it('English and Arabic have every key and no Hebrew left in them', () => {
    for (const d of [en, ar]) {
      expect(Object.keys(d).sort()).toEqual(Object.keys(he).sort());
      for (const [k, v] of Object.entries(d)) {
        const s = typeof v === 'function' ? v({ n: 2, d: 1, h: 3, total: 3, humans: 1, bots: 2, coins: 300, auction: 1 }) : v;
        expect(HEBREW.test(s), `${k}: ${s}`).toBe(false);
      }
      for (const e of [EDITIONS.en, EDITIONS.ar]) {
        for (const s of [...e.names, ...Object.values(e.cities), ...e.chance, ...e.chest]) expect(HEBREW.test(s)).toBe(false);
      }
    }
  });

  it('fills in parameters and plurals', () => {
    expect(t('turnOf', { name: 'Dana' }, 'en')).toBe("Dana's turn");
    expect(t('houses', { n: 1 }, 'en')).toBe('1 house');
    expect(t('houses', { n: 3 }, 'en')).toBe('3 houses');
  });

  it('an American game uses the American board, dollars and English log lines', () => {
    const players = [
      { name: 'Ann', token: 'cat' as const, isBot: false },
      { name: 'Bob', token: 'car' as const, isBot: false },
    ];
    let s = newGame(players, () => 0.5, { mortgage: true }, 'en');
    expect(s.lang).toBe('en');
    expect(BOARD[39].name).toBe('Fifth Avenue');
    expect(money(200)).toBe('$200');
    for (const p of s.players) p.lapped = true;
    s = reduce(s, { type: 'ROLL', dice: [2, 4] });
    s = reduce(s, { type: 'BUY' });
    expect(s.log[0]).toBe('Ann bought Broadway for $100');
    expect(s.log.some((l) => HEBREW.test(l))).toBe(false);
  });

  it('the Hebrew edition comes back for a Hebrew game', () => {
    applyEdition('ar');
    expect(BOARD[0].name).toBe('انطلق');
    const s = newGame([{ name: 'א', token: 'cat', isBot: false }, { name: 'ב', token: 'car', isBot: false }]);
    expect(s.lang).toBe('he');
    expect(BOARD[0].name).toBe('דרך צלחה');
    expect(money(50)).toBe('ש"ח 50');
  });
});
