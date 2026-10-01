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
  brown: '#8B3A2B',
  lightblue: '#1E9BD7',
  pink: '#E0218A',
  orange: '#F28C1E',
  red: '#E3001B',
  yellow: '#F7D117',
  green: '#1FA24A',
  darkblue: '#1C4FA0',
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
  price: 200,
  icon: 'train',
});

export const BOARD: Space[] = [
  { id: 0, kind: 'go', name: 'דרך צלחה' },
  // Left column, bottom → top
  prop(1, 'brown', 'אילת', "שד' התמרים", 60, [2, 10, 30, 90, 160, 250], 50),
  { id: 2, kind: 'chest', name: 'תיבת המזל', icon: 'chest' },
  prop(3, 'brown', 'אילת', 'דרך הערבה', 60, [4, 20, 60, 180, 320, 450], 50),
  { id: 4, kind: 'tax', name: 'מס הכנסה', amount: 200 },
  rail(5, 'רכבת דרום'),
  prop(6, 'lightblue', 'טבריה', "רח' הגליל", 100, [6, 30, 90, 270, 400, 550], 50),
  { id: 7, kind: 'chance', name: 'הפתעה', qColor: '#E0218A' },
  prop(8, 'lightblue', 'טבריה', "רח' הירדן", 100, [6, 30, 90, 270, 400, 550], 50),
  prop(9, 'lightblue', 'טבריה', "רח' הבנים", 120, [8, 40, 100, 300, 450, 600], 50),
  { id: 10, kind: 'jail', name: 'בכלא' },
  // Top row, left → right
  prop(11, 'pink', 'באר-שבע', "שד' שזר", 140, [10, 50, 150, 450, 625, 750], 100),
  { id: 12, kind: 'utility', name: 'חברת החשמל', price: 150, icon: 'bulb' },
  prop(13, 'pink', 'באר-שבע', 'רח\' קק"ל', 140, [10, 50, 150, 450, 625, 750], 100),
  prop(14, 'pink', 'באר-שבע', "שד' רגר", 160, [12, 60, 180, 500, 700, 900], 100),
  rail(15, 'רכבת מרכז'),
  prop(16, 'orange', 'נתניה', "שד' בנימין", 180, [14, 70, 200, 550, 750, 950], 100),
  { id: 17, kind: 'chest', name: 'תיבת המזל', icon: 'chest' },
  prop(18, 'orange', 'נתניה', "רח' הרצל", 180, [14, 70, 200, 550, 750, 950], 100),
  prop(19, 'orange', 'נתניה', 'כיכר העצמאות', 200, [16, 80, 220, 600, 800, 1000], 100),
  { id: 20, kind: 'parking', name: 'חניה חופשית' },
  // Right column, top → bottom
  prop(21, 'red', 'רמת-גן', 'דרך אבא הלל', 220, [18, 90, 250, 700, 875, 1050], 150),
  { id: 22, kind: 'chance', name: 'הפתעה', qColor: '#1E6FD9' },
  prop(23, 'red', 'רמת-גן', "רח' ז'בוטינסקי", 220, [18, 90, 250, 700, 875, 1050], 150),
  prop(24, 'red', 'רמת-גן', "רח' ביאליק", 240, [20, 100, 300, 750, 925, 1100], 150),
  rail(25, 'רכבת מזרח'),
  prop(26, 'yellow', 'ירושלים', "רח' יפו", 260, [22, 110, 330, 800, 975, 1150], 150),
  prop(27, 'yellow', 'ירושלים', "רח' בן יהודה", 260, [22, 110, 330, 800, 975, 1150], 150),
  { id: 28, kind: 'utility', name: 'חברת המים', price: 150, icon: 'tap' },
  prop(29, 'yellow', 'ירושלים', "רח' המלך ג'ורג'", 280, [24, 120, 360, 850, 1025, 1200], 150),
  { id: 30, kind: 'gotojail', name: 'גש לכלא' },
  // Bottom row, right → left
  prop(31, 'green', 'חיפה', "דרך העצמאות", 300, [26, 130, 390, 900, 1100, 1275], 200),
  prop(32, 'green', 'חיפה', "רח' החלוץ", 300, [26, 130, 390, 900, 1100, 1275], 200),
  { id: 33, kind: 'chest', name: 'תיבת המזל', icon: 'chest' },
  prop(34, 'green', 'חיפה', "שד' מוריה", 320, [28, 150, 450, 1000, 1200, 1400], 200),
  rail(35, 'רכבת צפון'),
  { id: 36, kind: 'chance', name: 'הפתעה', qColor: '#E3001B' },
  prop(37, 'darkblue', 'תל-אביב', "רח' אלנבי", 350, [35, 175, 500, 1100, 1300, 1500], 200),
  { id: 38, kind: 'tax', name: 'מס מותרות', amount: 100, icon: 'ring' },
  prop(39, 'darkblue', 'תל-אביב', "רח' דיזנגוף", 400, [50, 200, 600, 1400, 1700, 2000], 200),
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
