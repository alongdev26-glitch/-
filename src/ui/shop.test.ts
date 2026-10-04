import { beforeEach, describe, expect, it } from 'vitest';
import { BASE_TOKENS, TOKENS } from '../data/tokens';
import { CHARS, award, buy, getWallet, rotation, ROTATION_DAYS } from './shop';

const DAY = 86_400_000;

// a tiny in-memory localStorage for the wallet
beforeEach(() => {
  const store = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
});

describe('rotating shop', () => {
  const t0 = new Date(2026, 9, 4, 12).getTime();

  it('shows 9 different items: 5 characters, 2 skins, 2 boards', () => {
    for (let d = 0; d < 60; d += ROTATION_DAYS) {
      const { items } = rotation(t0 + d * DAY);
      expect(items).toHaveLength(9);
      expect(new Set(items.map((i) => i.id)).size).toBe(9);
      expect(items.filter((i) => i.kind === 'char')).toHaveLength(5);
      expect(items.filter((i) => i.kind === 'skin')).toHaveLength(2);
      expect(items.filter((i) => i.kind === 'board')).toHaveLength(2);
      expect(items.every((i) => i.price > 0)).toBe(true);
    }
  });

  it('stays the same for 3 days, then changes', () => {
    const r = rotation(t0);
    expect(r.endsAt).toBeGreaterThan(t0);
    expect(r.endsAt - t0).toBeLessThanOrEqual(ROTATION_DAYS * DAY);
    expect(rotation(r.endsAt - 60_000).items).toEqual(r.items);
    const next = rotation(r.endsAt + 60_000);
    expect(next.period).toBe(r.period + 1);
    expect(next.items.map((i) => i.id)).not.toEqual(r.items.map((i) => i.id));
  });

  it('sells all 30 new characters, never the 6 free ones', () => {
    expect(CHARS).toHaveLength(30);
    expect(TOKENS).toHaveLength(36);
    expect(CHARS.some((c) => BASE_TOKENS.some((b) => b.id === c.id))).toBe(false);
  });
});

describe('wallet', () => {
  it('starts with the 6 free characters and 200 coins', () => {
    const w = getWallet();
    expect(w.coins).toBe(200);
    for (const t of BASE_TOKENS) expect(w.owned).toContain(t.id);
  });

  it('buys a character only when there is enough money', () => {
    const lion = CHARS.find((c) => c.id === 'lion')!; // 350
    expect(buy(lion)).toBe(false);
    expect(getWallet().owned).not.toContain('lion');
    award('g1', 200);
    award('g1', 200); // paid once only
    expect(getWallet().coins).toBe(400);
    expect(buy(lion)).toBe(true);
    expect(getWallet().coins).toBe(50);
    expect(getWallet().owned).toContain('lion');
  });
});
