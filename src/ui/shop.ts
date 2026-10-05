// The shop: coins earned by playing, new characters, character skins and board designs.
// Every 3 days the shop shows a fresh mix of 9 items. Kept on this device.
import { BASE_TOKENS, TOKENS, type Rarity } from '../data/tokens';
import type { TokenId } from '../engine/types';
import { t, type Key } from '../i18n';
import { tokenName } from '../data/tokens';

export type { Rarity };

const KEY = 'bigdeal-wallet';
export const START_COINS = 200;

export interface ShopItem {
  id: string;
  kind: 'char' | 'skin' | 'board';
  price: number;
  rarity: Rarity;
}

/** An item's name and line in the UI language. */
export const itemName = (i: ShopItem) => (i.kind === 'char' ? tokenName(i.id as TokenId) : t(`item.${i.id}` as Key));
export const itemDesc = (i: ShopItem) => (i.kind === 'char' ? t('newChar') : t(`desc.${i.id}` as Key));
export const rarityName = (r: Rarity) => t(`rarity_${r}` as Key);

const CHAR_PRICE: Record<Rarity, number> = { common: 120, rare: 220, epic: 350, legendary: 500 };

export const SKINS: ShopItem[] = [
  { id: 'skin-none', kind: 'skin', price: 0, rarity: 'common' },
  { id: 'skin-gold', kind: 'skin', price: 150, rarity: 'rare' },
  { id: 'skin-neon', kind: 'skin', price: 200, rarity: 'rare' },
  { id: 'skin-fire', kind: 'skin', price: 250, rarity: 'epic' },
  { id: 'skin-ice', kind: 'skin', price: 250, rarity: 'epic' },
  { id: 'skin-rainbow', kind: 'skin', price: 350, rarity: 'epic' },
  { id: 'skin-galaxy', kind: 'skin', price: 450, rarity: 'legendary' },
];

export const BOARDS: ShopItem[] = [
  { id: 'board-classic', kind: 'board', price: 0, rarity: 'common' },
  { id: 'board-ocean', kind: 'board', price: 200, rarity: 'rare' },
  { id: 'board-desert', kind: 'board', price: 250, rarity: 'rare' },
  { id: 'board-night', kind: 'board', price: 300, rarity: 'epic' },
  { id: 'board-candy', kind: 'board', price: 300, rarity: 'epic' },
  { id: 'board-luxury', kind: 'board', price: 500, rarity: 'legendary' },
];

/** The characters you can buy (the six base ones are free). */
export const CHARS: ShopItem[] = TOKENS.filter((t) => t.rarity).map((t) => ({
  id: t.id,
  kind: 'char',
  price: CHAR_PRICE[t.rarity!],
  rarity: t.rarity!,
}));

export const ALL_ITEMS = [...CHARS, ...SKINS, ...BOARDS];

export interface Wallet {
  coins: number;
  owned: string[];
  skin: string;
  board: string;
  /** the character I played last, to preview skins on */
  char: TokenId;
  /** games already paid out, so a reload never pays twice */
  paid: string[];
  /** this device, for the share-with-a-friend rewards */
  deviceId: string;
  /** my personal share code (in my link: ?ref=CODE) */
  refCode: string;
  /** friends' devices already paid for */
  refPaid: string[];
  /** the code of the friend whose link brought me here, until it's reported */
  pendingRef?: string;
}

const randomId = (n: number, abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789') =>
  Array.from({ length: n }, () => abc[Math.floor(Math.random() * abc.length)]).join('');

const fresh = (): Wallet => ({
  coins: START_COINS,
  owned: [...BASE_TOKENS.map((t) => t.id), 'skin-none', 'board-classic'],
  skin: 'skin-none',
  board: 'board-classic',
  char: 'cat',
  paid: [],
  deviceId: '',
  refCode: '',
  refPaid: [],
});

/** Is there anything saved on this device yet? (a brand-new player has nothing) */
export function isNewPlayer(): boolean {
  try {
    return !localStorage.getItem(KEY) && !localStorage.getItem('tycoon-save');
  } catch {
    return false;
  }
}

export function getWallet(): Wallet {
  try {
    const raw = localStorage.getItem(KEY);
    let w = raw ? { ...fresh(), ...(JSON.parse(raw) as Wallet) } : fresh();
    // wallets from before characters were sold: the base pieces are always yours
    const base = BASE_TOKENS.map((t) => t.id).filter((id) => !w.owned.includes(id));
    if (base.length) w = { ...w, owned: [...base, ...w.owned] };
    // the device id and share code are made once and kept
    if (!w.deviceId || !w.refCode) {
      w = { ...w, deviceId: w.deviceId || randomId(16, 'abcdefghijklmnopqrstuvwxyz0123456789'), refCode: w.refCode || randomId(6) };
      localStorage.setItem(KEY, JSON.stringify(w));
    }
    return w;
  } catch {
    return fresh();
  }
}

const listeners = new Set<(w: Wallet) => void>();
function save(w: Wallet) {
  try {
    localStorage.setItem(KEY, JSON.stringify(w));
  } catch {
    /* storage off: the wallet only lasts this visit */
  }
  listeners.forEach((f) => f(w));
}
export function onWallet(f: (w: Wallet) => void) {
  listeners.add(f);
  return () => {
    listeners.delete(f);
  };
}

/** Buy (if affordable and not owned yet). Returns false when there isn't enough money. */
export function buy(item: ShopItem): boolean {
  const w = getWallet();
  if (w.owned.includes(item.id)) return true;
  if (w.coins < item.price) return false;
  save({ ...w, coins: w.coins - item.price, owned: [...w.owned, item.id] });
  return true;
}

/** Put on a skin or board you own. Characters are picked when setting up a game. */
export function equip(item: ShopItem) {
  const w = getWallet();
  if (!w.owned.includes(item.id) || item.kind === 'char') return;
  save(item.kind === 'skin' ? { ...w, skin: item.id } : { ...w, board: item.id });
}

/** Remember the character I play with, for the skin previews. */
export function rememberChar(char: TokenId) {
  const w = getWallet();
  if (w.char !== char) save({ ...w, char });
}

/** Coins for a finished game, once per game. */
export function award(gameKey: string, coins: number): boolean {
  const w = getWallet();
  if (w.paid.includes(gameKey)) return false;
  save({ ...w, coins: w.coins + coins, paid: [...w.paid.slice(-30), gameKey] });
  return true;
}

/** Coins for each friend who joined from my link. */
export const REFERRAL_REWARD = 150;

/** Pay for friends' devices not paid yet. Returns how many new friends. */
export function creditReferrals(deviceIds: string[]): number {
  const w = getWallet();
  const fresh = [...new Set(deviceIds)].filter((id) => id !== w.deviceId && !w.refPaid.includes(id));
  if (!fresh.length) return 0;
  save({ ...w, coins: w.coins + fresh.length * REFERRAL_REWARD, refPaid: [...w.refPaid, ...fresh] });
  return fresh.length;
}

/** Remember (or forget, with undefined) the friend's code that brought me here. */
export function setPendingRef(code: string | undefined) {
  save({ ...getWallet(), pendingRef: code });
}

/** How a finished game pays: everyone who played gets something, the winner much more. */
export const GAME_REWARD = { played: 60, won: 200 };

// ---------- the rotating shop ----------

const DAY = 86_400_000;
export const ROTATION_DAYS = 3;

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(list: T[], n: number, rnd: () => number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

/** Today's 9 items (5 characters, 2 skins, 2 boards), the same for 3 days, and when they change. */
export function rotation(now = Date.now()): { items: ShopItem[]; endsAt: number; period: number } {
  const offset = new Date(now).getTimezoneOffset() * 60_000;
  const day = Math.floor((now - offset) / DAY);
  const period = Math.floor(day / ROTATION_DAYS);
  const rnd = mulberry32(period * 7919 + 17);
  const items = [
    ...pick(CHARS, 5, rnd),
    ...pick(SKINS.filter((s) => s.price > 0), 2, rnd),
    ...pick(BOARDS.filter((b) => b.price > 0), 2, rnd),
  ];
  return { items: pick(items, items.length, rnd), endsAt: (period + 1) * ROTATION_DAYS * DAY + offset, period };
}
