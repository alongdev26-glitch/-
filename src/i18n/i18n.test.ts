import { describe, expect, it } from 'vitest';
import { BOARD, rents } from '../data/board';
import { CHANCE, CHEST } from '../data/cards';
import { EDITIONS, applyEdition, money } from '../data/editions';
import type { Lang } from './index';
import { newGame, reduce } from '../engine/reducer';
import { en } from './en';
import { ar } from './ar';
import { fr } from './fr';
import { ru } from './ru';
import { ja } from './ja';
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

  it('every other language has every key and no Hebrew left in it', () => {
    for (const d of [en, ar, fr, ru, ja]) {
      expect(Object.keys(d).sort()).toEqual(Object.keys(he).sort());
      for (const [k, v] of Object.entries(d)) {
        const s = typeof v === 'function' ? v({ n: 2, d: 1, h: 3, total: 3, humans: 1, bots: 2, coins: 300, auction: 1 }) : v;
        expect(HEBREW.test(s), `${k}: ${s}`).toBe(false);
      }
      for (const e of [EDITIONS.en, EDITIONS.ar, EDITIONS.fr, EDITIONS.ru, EDITIONS.ja]) {
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
    expect(BOARD[38].name).toBe('Fifth Avenue');
    expect(money(200)).toBe('$200');
    for (const p of s.players) p.lapped = true;
    s = reduce(s, { type: 'ROLL', dice: [1, 3] });
    s = reduce(s, { type: 'BUY' });
    expect(s.log[0]).toBe('Ann bought Broadway for $90');
    expect(s.log.some((l) => HEBREW.test(l))).toBe(false);
  });

  it('French, Russian and Japanese games use their own boards and money', () => {
    const players = [
      { name: 'A', token: 'cat' as const, isBot: false },
      { name: 'B', token: 'car' as const, isBot: false },
    ];
    const cases = [
      ['fr', 'Champs-Élysées', '200 €', 'A achète La Canebière pour 90 €'],
      ['ru', 'Красная площадь', '200 ₽', 'A купил ул. Светланская за 90 ₽'],
      ['ja', '銀座', '¥200', 'Aが本通りを¥90で買った'],
    ] as const;
    for (const [lang, street, cash, line] of cases) {
      let s = newGame(players, () => 0.5, { mortgage: true }, lang);
      expect(BOARD[38].name).toBe(street);
      expect(money(200)).toBe(cash);
      for (const p of s.players) p.lapped = true;
      s = reduce(s, { type: 'ROLL', dice: [1, 3] });
      s = reduce(s, { type: 'BUY' });
      expect(s.log[0]).toBe(line);
    }
  });

  it('Russian plurals', () => {
    expect(t('houses', { n: 1 }, 'ru')).toBe('1 дом');
    expect(t('houses', { n: 3 }, 'ru')).toBe('3 дома');
    expect(t('houses', { n: 5 }, 'ru')).toBe('5 домов');
  });

  it('the Hebrew edition comes back for a Hebrew game', () => {
    applyEdition('ar');
    expect(BOARD[0].name).toBe('انطلق');
    const s = newGame([{ name: 'א', token: 'cat', isBot: false }, { name: 'ב', token: 'car', isBot: false }]);
    expect(s.lang).toBe('he');
    expect(BOARD[0].name).toBe('התחלה');
    expect(money(50)).toBe('ש"ח 50');
  });

  it('every card in every edition is fully filled in, with the right amounts', () => {
    for (const lang of Object.keys(EDITIONS) as Lang[]) {
      applyEdition(lang);
      for (const c of [...CHANCE, ...CHEST]) {
        expect(c.text, `${lang}: ${c.text}`).not.toMatch(/\{\w+\}/);
        const fx = c.effect;
        if (fx.type === 'money' || fx.type === 'payEach' || fx.type === 'collectEach')
          expect(c.text).toContain(money(Math.abs(fx.amount)));
        if (fx.type === 'repairs') {
          expect(c.text).toContain(money(fx.house));
          expect(c.text).toContain(money(fx.hotel));
        }
        if (fx.type === 'move' && fx.to !== 0) expect(c.text).toContain(BOARD[fx.to].name);
      }
    }
    applyEdition('he');
  });

  it('the board has our own prices and rents', () => {
    expect(BOARD[38].price).toBe(380);
    for (const sp of BOARD) if (sp.kind === 'property') expect(sp.rent).toEqual(rents(sp.price!));
  });

  it('none of the classic board-game phrases are left', () => {
    const CLASSIC = /bank error|beauty contest|advance to go|free parking|just visiting|community chest|elected chairman/i;
    for (const lang of Object.keys(EDITIONS) as Lang[]) {
      applyEdition(lang);
      for (const text of [...CHANCE.map((c) => c.text), ...CHEST.map((c) => c.text), ...EDITIONS[lang].names])
        expect(CLASSIC.test(text), `${lang}: ${text}`).toBe(false);
    }
    applyEdition('he');
  });

  it('every color group is its own city, and no street repeats', () => {
    const groups = new Map<string, number[]>();
    for (const sp of BOARD) if (sp.kind === 'property') groups.set(sp.group!, [...(groups.get(sp.group!) ?? []), sp.id]);
    for (const [lang, e] of Object.entries(EDITIONS)) {
      const cities = [...groups.values()].map((ids) => {
        const set = new Set(ids.map((id) => e.cities[id]));
        expect(set.size, `${lang}: one city per group`).toBe(1);
        return [...set][0];
      });
      expect(new Set(cities).size, `${lang}: ${cities.join(', ')}`).toBe(cities.length);
      const streets = BOARD.filter((sp) => sp.kind === 'property').map((sp) => e.names[sp.id]);
      expect(new Set(streets).size, `${lang}: streets`).toBe(streets.length);
    }
  });
});
