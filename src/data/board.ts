// The 40 spaces, 1:1 with the classic Hebrew board.
// Index 0 is "דרך צלחה" (bottom-left); play goes up the left column,
// across the top, down the right column and back along the bottom.

export type Group =
  | 'brown'
  | 'lightblue'
  | 'pink'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'green'
  | 'darkblue';

export type SpaceKind =
  | 'go'
  | 'property'
  | 'railroad'
  | 'utility'
  | 'tax'
  | 'chance'
  | 'chest'
  | 'jail'
  | 'parking'
  | 'gotojail';

export type Side = 'bottom' | 'left' | 'top' | 'right' | 'corner';

export interface Space {
  id: number;
  kind: SpaceKind;
  name: string;
  city?: string;
  group?: Group;
  price?: number;
  /** [base, 1 house, 2, 3, 4, hotel] */
  rent?: number[];
  houseCost?: number;
  /** Tax amount. */
  amount?: number;
  icon?: 'train' | 'bulb' | 'tap' | 'ring' | 'chest';
  /** Question-mark color on "הפתעה" spaces. */
  qColor?: string;
}

export const GROUP_COLORS: Record<Group, string> = {
  brown: '#0fa3a3',
  lightblue: '#e2337f',
  pink: '#2e86de',
  orange: '#8e44ad',
  red: '#f08a00',
  yellow: '#6fae12',
  green: '#c0392b',
  darkblue: '#c99a06',
};

const prop = (
  id: number,
  group: Group,
  city: string,
  name: string,
  price: number,
  rent: number[],
  houseCost: number,
): Space => ({ id, kind: 'property', group, city, name, price, rent, houseCost });

const rail = (id: number, name: string): Space => ({
  id,
  kind: 'railroad',
  name,
  price: 180,
  icon: 'train',
});

/** Rent with 0–4 houses and a hotel, from the price: our own curve. */
export function rents(price: number): number[] {
  const b = Math.round(price / 10);
  const r5 = (n: number) => Math.round(n / 5) * 5;
  return [b, r5(4 * b), r5(11 * b), r5(28 * b), r5(38 * b), r5(48 * b)];
}

export const BOARD: Space[] = [
  { id: 0, kind: 'go', name: 'דרך צלחה' },
  // Left column, bottom → top
  prop(1, 'brown', 'אילת', "שד' התמרים", 50, rents(50), 40),
  { id: 2, kind: 'chance', name: 'הפתעה', qColor: '#e0218a' },
  prop(3, 'brown', 'אילת', 'דרך הערבה', 70, rents(70), 40),
  rail(4, 'רכבת דרום'),
  prop(5, 'lightblue', 'טבריה', "רח' הגליל", 90, rents(90), 40),
  prop(6, 'lightblue', 'טבריה', "רח' הירדן", 90, rents(90), 40),
  { id: 7, kind: 'chest', name: 'תיבת המזל', icon: 'chest' },
  prop(8, 'lightblue', 'טבריה', "רח' הבנים", 110, rents(110), 40),
  { id: 9, kind: 'tax', name: 'מס הכנסה', amount: 180 },
  { id: 10, kind: 'jail', name: 'בכלא' },
  // Top row, left → right
  prop(11, 'pink', 'באר-שבע', "שד' שזר", 130, rents(130), 90),
  prop(12, 'pink', 'באר-שבע', 'רח\' קק"ל', 130, rents(130), 90),
  { id: 13, kind: 'chance', name: 'הפתעה', qColor: '#1c4fa0' },
  prop(14, 'pink', 'באר-שבע', "שד' רגר", 150, rents(150), 90),
  { id: 15, kind: 'utility', name: 'חברת החשמל', price: 140, icon: 'bulb' },
  prop(16, 'orange', 'נתניה', "שד' בנימין", 170, rents(170), 90),
  rail(17, 'רכבת מרכז'),
  prop(18, 'orange', 'נתניה', "רח' הרצל", 170, rents(170), 90),
  prop(19, 'orange', 'נתניה', 'כיכר העצמאות', 190, rents(190), 90),
  { id: 20, kind: 'parking', name: 'חניה חינם' },
  // Right column, top → bottom
  { id: 21, kind: 'chest', name: 'תיבת המזל', icon: 'chest' },
  prop(22, 'red', 'רמת-גן', 'דרך אבא הלל', 210, rents(210), 140),
  prop(23, 'red', 'רמת-גן', "רח' ז'בוטינסקי", 210, rents(210), 140),
  rail(24, 'רכבת מזרח'),
  prop(25, 'red', 'רמת-גן', "רח' ביאליק", 230, rents(230), 140),
  prop(26, 'yellow', 'חיפה', "דרך העצמאות", 250, rents(250), 140),
  { id: 27, kind: 'utility', name: 'חברת המים', price: 140, icon: 'tap' },
  prop(28, 'yellow', 'חיפה', "רח' החלוץ", 250, rents(250), 140),
  prop(29, 'yellow', 'חיפה', "שד' מוריה", 270, rents(270), 140),
  { id: 30, kind: 'gotojail', name: 'גש לכלא' },
  // Bottom row, right → left
  prop(31, 'green', 'ירושלים', "רח' יפו", 290, rents(290), 190),
  { id: 32, kind: 'chance', name: 'הפתעה', qColor: '#e3001b' },
  prop(33, 'green', 'ירושלים', "רח' בן יהודה", 290, rents(290), 190),
  prop(34, 'green', 'ירושלים', "רח' המלך ג'ורג'", 310, rents(310), 190),
  { id: 35, kind: 'chest', name: 'תיבת המזל', icon: 'chest' },
  prop(36, 'darkblue', 'תל-אביב', "רח' אלנבי", 340, rents(340), 190),
  rail(37, 'רכבת צפון'),
  prop(38, 'darkblue', 'תל-אביב', "רח' דיזנגוף", 380, rents(380), 190),
  { id: 39, kind: 'tax', name: 'מס מותרות', amount: 90, icon: 'ring' },
];

export const JAIL = 10;
export const GO_SALARY = 200;
export const JAIL_FINE = 50;
export const START_MONEY = 1500;
/** Every this many rounds (counted from the first purchase) owners pay the mortgage price of each property. */
export const FEE_ROUNDS = 7;

export const isOwnable = (s: Space) =>
  s.kind === 'property' || s.kind === 'railroad' || s.kind === 'utility';

export const groupMembers = (g: Group) =>
  BOARD.filter((s) => s.group === g).map((s) => s.id);

export function sideOf(id: number): Side {
  if (id % 10 === 0) return 'corner';
  if (id < 10) return 'left';
  if (id < 20) return 'top';
  if (id < 30) return 'right';
  return 'bottom';
}

/** 1-based [row, col] in an 11×11 grid, left-to-right geometry. */
export function gridPos(id: number): [number, number] {
  if (id === 0) return [11, 1];
  if (id < 10) return [11 - id, 1];
  if (id === 10) return [1, 1];
  if (id < 20) return [1, id - 9];
  if (id === 20) return [1, 11];
  if (id < 30) return [id - 19, 11];
  if (id === 30) return [11, 11];
  return [11, 41 - id];
}
