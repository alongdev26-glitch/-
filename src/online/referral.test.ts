import { beforeEach, describe, expect, it, vi } from 'vitest';
import { captureRef, collectRewards, config, reportPending } from './referral';
import { getWallet, REFERRAL_REWARD } from '../ui/shop';

let store: Map<string, string>;
let db: Record<string, Record<string, unknown>>;

beforeEach(() => {
  store = new Map();
  (globalThis as Record<string, unknown>).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  (globalThis as Record<string, unknown>).location = { hostname: 'alongdev26-glitch.github.io' };
  (globalThis as Record<string, unknown>).history = { replaceState: () => {} };
  config.db = 'https://test-db';
  db = {};
  // a tiny Firebase: write-once children, shallow reads
  globalThis.fetch = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const path = String(url).replace('https://test-db/referrals/', '').replace(/\.json.*$/, '');
    const [code, device] = path.split('/');
    if (init?.method === 'PUT') {
      if (db[code]?.[device]) return new Response('denied', { status: 401 });
      db[code] = { ...db[code], [device]: JSON.parse(String(init.body)) };
      return new Response('{}');
    }
    return new Response(JSON.stringify(db[code] ?? null));
  }) as typeof fetch;
});

/** switch to another phone (a separate storage) */
const phone = (s: Map<string, string>) => {
  (globalThis as { localStorage: { getItem: unknown } }).localStorage = {
    getItem: (k: string) => s.get(k) ?? null,
    setItem: (k: string, v: string) => void s.set(k, v),
    removeItem: (k: string) => void s.delete(k),
  } as never;
};

describe('share with a friend', () => {
  it('pays the sharer once for each new friend', async () => {
    const me = new Map<string, string>();
    phone(me);
    const myCode = getWallet().refCode;
    const coins = getWallet().coins;

    // a friend opens my link on a new phone
    const friend = new Map<string, string>();
    phone(friend);
    captureRef(`https://alongdev26-glitch.github.io/-1/?ref=${myCode}`);
    expect(getWallet().pendingRef).toBe(myCode);
    expect(await reportPending()).toBe(true);
    expect(getWallet().pendingRef).toBeUndefined();

    // back on my phone
    phone(me);
    expect(await collectRewards()).toBe(1);
    expect(getWallet().coins).toBe(coins + REFERRAL_REWARD);
    expect(await collectRewards()).toBe(0); // never twice
    expect(getWallet().coins).toBe(coins + REFERRAL_REWARD);
  });

  it('ignores the link for players who already played on this phone, and my own link', () => {
    const old = new Map<string, string>([['tycoon-save', '{}']]);
    phone(old);
    captureRef('https://x/-1/?ref=ABCDEF');
    expect(getWallet().pendingRef).toBeUndefined();

    const me = new Map<string, string>();
    phone(me);
    const myCode = getWallet().refCode;
    const fresh = new Map<string, string>();
    phone(fresh);
    captureRef('https://x/-1/?ref=bad!');
    expect(getWallet().pendingRef).toBeUndefined();
    expect(myCode).toMatch(/^[A-Z2-9]{6}$/);
  });

  it('does nothing when the database is not set', async () => {
    config.db = '';
    expect(await collectRewards()).toBe(0);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
