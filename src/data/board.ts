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
  brown: '#8b3a2b',
  lightblue: '#1e9bd7',
  pink: '#e0218a',
  orange: '#f28c1e',
  red: '#e3001b',
  yellow: '#f7d117',
  green: '#1fa24a',
  darkblue: '#1c4fa0',
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
  { id: 2, kind: 'chest', name: 'תיבת המזל', icon: 'chest' },
  prop(3, 'brown', 'אילת', 'דרך הערבה', 70, rents(70), 40),
  { id: 4, kind: 'tax', name: 'מס הכנסה', amount: 180 },
  rail(5, 'רכבת דרום'),
  prop(6, 'lightblue', 'טבריה', "רח' הגליל", 90, rents(90), 40),
  { id: 7, kind: 'chance', name: 'הפתעה', qColor: '#e0218a' },
  prop(8, 'lightblue', 'טבריה', "רח' הירדן", 90, rents(90), 40),
  prop(9, 'lightblue', 'טבריה', "רח' הבנים", 110, rents(110), 40),
  { id: 10, kind: 'jail', name: 'בכלא' },
  // Top row, left → right
  prop(11, 'pink', 'באר-שבע', "שד' שזר", 130, rents(130), 90),
  { id: 12, kind: 'utility', name: 'חברת החשמל', price: 140, icon: 'bulb' },
  prop(13, 'pink', 'באר-שבע', 'רח\' קק"ל', 130, rents(130), 90),
  prop(14, 'pink', 'באר-שבע', "שד' רגר", 150, rents(150), 90),
  rail(15, 'רכבת מרכז'),
  prop(16, 'orange', 'נתניה', "שד' בנימין", 170, rents(170), 90),
  { id: 17, kind: 'chest', name: 'תיבת המזל', icon: 'chest' },
  prop(18, 'orange', 'נתניה', "רח' הרצל", 170, rents(170), 90),
  prop(19, 'orange', 'נתניה', 'כיכר העצמאות', 190, rents(190), 90),
  { id: 20, kind: 'parking', name: 'פינת הלוטו' },
  // Right column, top → bottom
  prop(21, 'red', 'רמת-גן', 'דרך אבא הלל', 210, rents(210), 140),
  { id: 22, kind: 'chance', name: 'הפתעה', qColor: '#1c4fa0' },
  prop(23, 'red', 'רמת-גן', "רח' ז'בוטינסקי", 210, rents(210), 140),
  prop(24, 'red', 'רמת-גן', "רח' ביאליק", 230, rents(230), 140),
  rail(25, 'רכבת מזרח'),
  prop(26, 'yellow', 'ירושלים', "רח' יפו", 250, rents(250), 140),
  prop(27, 'yellow', 'ירושלים', "רח' בן יהודה", 250, rents(250), 140),
  { id: 28, kind: 'utility', name: 'חברת המים', price: 140, icon: 'tap' },
  prop(29, 'yellow', 'ירושלים', "רח' המלך ג'ורג'", 270, rents(270), 140),
  { id: 30, kind: 'gotojail', name: 'גש לכלא' },
  // Bottom row, right → left
  prop(31, 'green', 'חיפה', "דרך העצמאות", 290, rents(290), 190),
  prop(32, 'green', 'חיפה', "רח' החלוץ", 290, rents(290), 190),
  { id: 33, kind: 'chest', name: 'תיבת המזל', icon: 'chest' },
  prop(34, 'green', 'חיפה', "שד' מוריה", 310, rents(310), 190),
  rail(35, 'רכבת צפון'),
  { id: 36, kind: 'chance', name: 'הפתעה', qColor: '#e3001b' },
  prop(37, 'darkblue', 'תל-אביב', "רח' אלנבי", 340, rents(340), 190),
  { id: 38, kind: 'tax', name: 'מס מותרות', amount: 90, icon: 'ring' },
  prop(39, 'darkblue', 'תל-אביב', "רח' דיזנגוף", 380, rents(380), 190),
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
