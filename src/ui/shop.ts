// The shop: coins earned by playing, character skins and board designs. Kept on this device.

const KEY = 'bigdeal-wallet';
export const START_COINS = 200;

export interface ShopItem {
  id: string;
  kind: 'skin' | 'board';
  name: string;
  price: number;
  desc: string;
}

export const SKINS: ShopItem[] = [
  { id: 'skin-none', kind: 'skin', name: 'רגיל', price: 0, desc: 'הדמות כמו שהיא' },
  { id: 'skin-gold', kind: 'skin', name: 'זהב', price: 150, desc: 'טבעת זהב נוצצת' },
  { id: 'skin-neon', kind: 'skin', name: 'ניאון', price: 200, desc: 'זוהר ניאון ורוד-תכלת' },
  { id: 'skin-fire', kind: 'skin', name: 'אש', price: 250, desc: 'להבות כתומות סביב הדמות' },
  { id: 'skin-ice', kind: 'skin', name: 'קרח', price: 250, desc: 'קרח כחול וקריר' },
  { id: 'skin-rainbow', kind: 'skin', name: 'קשת', price: 350, desc: 'טבעת קשת מסתובבת' },
  { id: 'skin-galaxy', kind: 'skin', name: 'גלקסיה', price: 450, desc: 'חלל עם כוכבים' },
];

export const BOARDS: ShopItem[] = [
  { id: 'board-classic', kind: 'board', name: 'קלאסי', price: 0, desc: 'הלוח הרגיל' },
  { id: 'board-ocean', kind: 'board', name: 'ים', price: 200, desc: 'כחול של חוף הים' },
  { id: 'board-desert', kind: 'board', name: 'מדבר', price: 250, desc: 'חול חם וזהוב' },
  { id: 'board-night', kind: 'board', name: 'לילה', price: 300, desc: 'לוח כהה עם אורות' },
  { id: 'board-candy', kind: 'board', name: 'ממתקים', price: 300, desc: 'ורוד ומתוק' },
  { id: 'board-luxury', kind: 'board', name: 'יוקרה', price: 500, desc: 'לבד ירוק וזהב' },
];

export interface Wallet {
  coins: number;
  owned: string[];
  skin: string;
  board: string;
  /** games already paid out, so a reload never pays twice */
  paid: string[];
}

const fresh = (): Wallet => ({
  coins: START_COINS,
  owned: ['skin-none', 'board-classic'],
  skin: 'skin-none',
  board: 'board-classic',
  paid: [],
});

export function getWallet(): Wallet {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...fresh(), ...(JSON.parse(raw) as Wallet) } : fresh();
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

export function equip(item: ShopItem) {
  const w = getWallet();
  if (!w.owned.includes(item.id)) return;
  save(item.kind === 'skin' ? { ...w, skin: item.id } : { ...w, board: item.id });
}

/** Coins for a finished game, once per game. */
export function award(gameKey: string, coins: number): boolean {
  const w = getWallet();
  if (w.paid.includes(gameKey)) return false;
  save({ ...w, coins: w.coins + coins, paid: [...w.paid.slice(-30), gameKey] });
  return true;
}

/** How a finished game pays: everyone who played gets something, the winner much more. */
export const GAME_REWARD = { played: 60, won: 200 };
