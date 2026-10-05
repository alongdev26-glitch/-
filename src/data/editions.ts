// Each language has its own national edition of the board: famous streets of that
// country, its own currency and its own card texts. Prices, rents and rules are the same.
import type { Lang } from '../i18n';
import { BOARD } from './board';
import { CHANCE, CHEST } from './cards';

export interface Edition {
  /** money as shown in this edition */
  money: (n: number) => string;
  /** the currency sign alone (flying bills) */
  symbol: string;
  /** name of every space, by board index (0–39) */
  names: string[];
  /** city of each property (empty for the other spaces) */
  cities: Record<number, string>;
  /** corner squares, split over two lines */
  corners: {
    goNote: string;
    go: string;
    jail: string;
    visiting: string;
    parking1: string;
    parking2: string;
    toJail1: string;
    toJail2: string;
  };
  /** the two card decks */
  chestName: string;
  chanceName: string;
  railsTitle: string;
  utilitiesTitle: string;
  /** texts of the chance and chest cards, in the order of cards.ts */
  chance: string[];
  chest: string[];
  /** the menu subtitle */
  tagline: string;
  /** default names for the computer players */
  bots: string[];
}

const he: Edition = {
  money: (n) => `ש"ח ${n}`,
  symbol: '₪',
  names: [
    'דרך צלחה', "שד' התמרים", 'תיבת המזל', 'דרך הערבה', 'מס הכנסה', 'רכבת דרום',
    "רח' הגליל", 'הפתעה', "רח' הירדן", "רח' הבנים", 'בכלא',
    "שד' שזר", 'חברת החשמל', 'רח\' קק"ל', "שד' רגר", 'רכבת מרכז',
    "שד' בנימין", 'תיבת המזל', "רח' הרצל", 'כיכר העצמאות', 'חניה חופשית',
    'דרך אבא הלל', 'הפתעה', "רח' ז'בוטינסקי", "רח' ביאליק", 'רכבת מזרח',
    "רח' יפו", "רח' בן יהודה", 'חברת המים', "רח' המלך ג'ורג'", 'גש לכלא',
    'דרך העצמאות', "רח' החלוץ", 'תיבת המזל', "שד' מוריה", 'רכבת צפון',
    'הפתעה', "רח' אלנבי", 'מס מותרות', "רח' דיזנגוף",
  ],
  cities: {
    1: 'אילת', 3: 'אילת',
    6: 'טבריה', 8: 'טבריה', 9: 'טבריה',
    11: 'באר-שבע', 13: 'באר-שבע', 14: 'באר-שבע',
    16: 'נתניה', 18: 'נתניה', 19: 'נתניה',
    21: 'רמת-גן', 23: 'רמת-גן', 24: 'רמת-גן',
    26: 'ירושלים', 27: 'ירושלים', 29: 'ירושלים',
    31: 'חיפה', 32: 'חיפה', 34: 'חיפה',
    37: 'תל-אביב', 39: 'תל-אביב',
  },
  corners: {
    goNote: 'כל העובר מקבל ש"ח 200',
    go: 'דרך צלחה',
    jail: 'בכלא',
    visiting: 'רק מבקר',
    parking1: 'חניה',
    parking2: 'חופשית',
    toJail1: 'גש',
    toJail2: 'לכלא',
  },
  chestName: 'תיבת המזל',
  chanceName: 'הפתעה',
  railsTitle: 'רכבות',
  utilitiesTitle: 'חברות',
  chance: [
    'התקדם ל"דרך צלחה" וקבל ש"ח 400',
    "התקדם לרח' ביאליק, רמת-גן",
    "התקדם לשד' שזר, באר-שבע",
    'התקדם לחברה הקרובה. אם היא בבעלות, שלם פי 10 מסכום הקוביות',
    'התקדם לרכבת הקרובה. אם היא בבעלות, שלם כפול',
    'התקדם לרכבת הקרובה. אם היא בבעלות, שלם כפול',
    'הבנק משלם לך דיבידנד של ש"ח 50',
    'צא מהכלא חינם. שמור כרטיס זה',
    'חזור 3 משבצות אחורה',
    'גש לכלא! אל תעבור ב"דרך צלחה"',
    'תיקונים כלליים: שלם ש"ח 25 לכל בית וש"ח 100 לכל מלון',
    'קנס מהירות: שלם ש"ח 15',
    'נסע לרכבת דרום',
    "התקדם לרח' דיזנגוף, תל-אביב",
    'נבחרת ליו"ר הוועד: שלם לכל שחקן ש"ח 50',
    'הלוואת הבנייה שלך הבשילה: קבל ש"ח 150',
  ],
  chest: [
    'התקדם ל"דרך צלחה" וקבל ש"ח 400',
    'טעות של הבנק לטובתך: קבל ש"ח 200',
    'ביקור אצל רופא: שלם ש"ח 50',
    'מכרת מניות: קבל ש"ח 50',
    'צא מהכלא חינם. שמור כרטיס זה',
    'גש לכלא! אל תעבור ב"דרך צלחה"',
    'מענק חג: קבל ש"ח 100',
    'החזר מס הכנסה: קבל ש"ח 20',
    'יום הולדת שמח! קבל ש"ח 10 מכל שחקן',
    'פוליסת ביטוח חיים הבשילה: קבל ש"ח 100',
    'אשפוז בבית חולים: שלם ש"ח 100',
    'שכר לימוד: שלם ש"ח 50',
    'דמי ייעוץ: קבל ש"ח 25',
    'תיקוני רחוב: שלם ש"ח 40 לכל בית וש"ח 115 לכל מלון',
    'זכית במקום שני בתחרות יופי: קבל ש"ח 10',
    'קיבלת ירושה: קבל ש"ח 100',
  ],
  tagline: 'משחק המסחר בנכסים: ירושלים, תל-אביב, חיפה ועוד',
  bots: ['הנרי', 'מרק', 'סופיה'],
};

const en: Edition = {
  money: (n) => `$${n}`,
  symbol: '$',
  names: [
    'GO', 'Bourbon Street', 'Lucky Chest', 'Canal Street', 'Income Tax', 'South Station',
    'Broadway', 'Surprise', 'Music Row', 'Demonbreun Street', 'Jail',
    'Michigan Avenue', 'Electric Company', 'State Street', 'Wacker Drive', 'Union Station',
    'Ocean Drive', 'Lucky Chest', 'Collins Avenue', 'Lincoln Road', 'Free Parking',
    'Lombard Street', 'Surprise', 'Market Street', 'Castro Street', 'Penn Station',
    'The Strip', 'Fremont Street', 'Water Works', 'Paradise Road', 'Go to Jail',
    'Sunset Boulevard', 'Hollywood Boulevard', 'Lucky Chest', 'Rodeo Drive', 'Grand Central',
    'Surprise', 'Wall Street', 'Luxury Tax', 'Fifth Avenue',
  ],
  cities: {
    1: 'New Orleans', 3: 'New Orleans',
    6: 'Nashville', 8: 'Nashville', 9: 'Nashville',
    11: 'Chicago', 13: 'Chicago', 14: 'Chicago',
    16: 'Miami', 18: 'Miami', 19: 'Miami',
    21: 'San Francisco', 23: 'San Francisco', 24: 'San Francisco',
    26: 'Las Vegas', 27: 'Las Vegas', 29: 'Las Vegas',
    31: 'Los Angeles', 32: 'Los Angeles', 34: 'Los Angeles',
    37: 'New York', 39: 'New York',
  },
  corners: {
    goNote: 'Collect $200 as you pass',
    go: 'GO',
    jail: 'In Jail',
    visiting: 'Just Visiting',
    parking1: 'Free',
    parking2: 'Parking',
    toJail1: 'Go to',
    toJail2: 'Jail',
  },
  chestName: 'Lucky Chest',
  chanceName: 'Surprise',
  railsTitle: 'Stations',
  utilitiesTitle: 'Utilities',
  chance: [
    'Advance to GO and collect $400',
    'Advance to Castro Street, San Francisco',
    'Advance to Michigan Avenue, Chicago',
    'Advance to the nearest utility. If it is owned, pay 10 times the dice',
    'Advance to the nearest station. If it is owned, pay double rent',
    'Advance to the nearest station. If it is owned, pay double rent',
    'The bank pays you a dividend of $50',
    'Get out of jail free. Keep this card',
    'Go back 3 spaces',
    'Go to jail! Do not pass GO',
    'General repairs: pay $25 for each house and $100 for each hotel',
    'Speeding fine: pay $15',
    'Take a trip to South Station',
    'Advance to Fifth Avenue, New York',
    'You were elected chairman: pay each player $50',
    'Your building loan matures: collect $150',
  ],
  chest: [
    'Advance to GO and collect $400',
    'Bank error in your favor: collect $200',
    "Doctor's visit: pay $50",
    'You sold some stock: collect $50',
    'Get out of jail free. Keep this card',
    'Go to jail! Do not pass GO',
    'Holiday bonus: collect $100',
    'Income tax refund: collect $20',
    'Happy birthday! Collect $10 from every player',
    'Life insurance matures: collect $100',
    'Hospital stay: pay $100',
    'School fees: pay $50',
    'Consulting fee: collect $25',
    'Street repairs: pay $40 for each house and $115 for each hotel',
    'You won second prize in a beauty contest: collect $10',
    'You inherit $100',
  ],
  tagline: 'The property trading game: New York, Las Vegas, Miami and more',
  bots: ['Henry', 'Mark', 'Sophia'],
};

const ar: Edition = {
  money: (n) => `${n} د.إ`,
  symbol: 'د.إ',
  names: [
    'انطلق', 'كورنيش الفجيرة', 'صندوق الحظ', 'شارع حمد بن عبدالله', 'ضريبة الدخل', 'محطة الاتحاد',
    'كورنيش عجمان', 'مفاجأة', 'شارع الشيخ خليفة', 'شارع الجرف', 'السجن',
    'جزيرة المرجان', 'هيئة الكهرباء', 'شارع النخيل', 'شارع الشيخ محمد بن سالم', 'محطة برج خليفة',
    'القصباء', 'صندوق الحظ', 'المجاز', 'شارع الملك فيصل', 'موقف مجاني',
    'شارع خليفة', 'مفاجأة', 'شارع زايد الأول', 'جبل حفيت', 'محطة المطار',
    'كورنيش أبوظبي', 'جزيرة ياس', 'هيئة المياه', 'جزيرة السعديات', 'اذهب إلى السجن',
    'شارع الشيخ زايد', 'جميرا', 'صندوق الحظ', 'دبي مارينا', 'محطة مول الإمارات',
    'مفاجأة', 'نخلة جميرا', 'ضريبة الرفاهية', 'داون تاون دبي',
  ],
  cities: {
    1: 'الفجيرة', 3: 'الفجيرة',
    6: 'عجمان', 8: 'عجمان', 9: 'عجمان',
    11: 'رأس الخيمة', 13: 'رأس الخيمة', 14: 'رأس الخيمة',
    16: 'الشارقة', 18: 'الشارقة', 19: 'الشارقة',
    21: 'العين', 23: 'العين', 24: 'العين',
    26: 'أبوظبي', 27: 'أبوظبي', 29: 'أبوظبي',
    31: 'دبي', 32: 'دبي', 34: 'دبي',
    37: 'دبي', 39: 'دبي',
  },
  corners: {
    goNote: 'خذ 200 د.إ عند المرور',
    go: 'انطلق',
    jail: 'في السجن',
    visiting: 'زيارة فقط',
    parking1: 'موقف',
    parking2: 'مجاني',
    toJail1: 'اذهب إلى',
    toJail2: 'السجن',
  },
  chestName: 'صندوق الحظ',
  chanceName: 'مفاجأة',
  railsTitle: 'محطات المترو',
  utilitiesTitle: 'الهيئات',
  chance: [
    'تقدّم إلى "انطلق" وخذ 400 د.إ',
    'تقدّم إلى جبل حفيت، العين',
    'تقدّم إلى جزيرة المرجان، رأس الخيمة',
    'تقدّم إلى أقرب هيئة. إذا كانت مملوكة، ادفع 10 أضعاف مجموع النرد',
    'تقدّم إلى أقرب محطة. إذا كانت مملوكة، ادفع الضعف',
    'تقدّم إلى أقرب محطة. إذا كانت مملوكة، ادفع الضعف',
    'البنك يدفع لك أرباحًا بقيمة 50 د.إ',
    'اخرج من السجن مجانًا. احتفظ بهذه البطاقة',
    'ارجع 3 خانات إلى الوراء',
    'اذهب إلى السجن! لا تمر بـ"انطلق"',
    'إصلاحات عامة: ادفع 25 د.إ عن كل بيت و100 د.إ عن كل فندق',
    'مخالفة سرعة: ادفع 15 د.إ',
    'سافر إلى محطة الاتحاد',
    'تقدّم إلى داون تاون دبي',
    'انتُخبت رئيسًا للجنة: ادفع لكل لاعب 50 د.إ',
    'قرض البناء الخاص بك استحق: خذ 150 د.إ',
  ],
  chest: [
    'تقدّم إلى "انطلق" وخذ 400 د.إ',
    'خطأ من البنك لصالحك: خذ 200 د.إ',
    'زيارة الطبيب: ادفع 50 د.إ',
    'بعت أسهمًا: خذ 50 د.إ',
    'اخرج من السجن مجانًا. احتفظ بهذه البطاقة',
    'اذهب إلى السجن! لا تمر بـ"انطلق"',
    'مكافأة العيد: خذ 100 د.إ',
    'استرداد ضريبة الدخل: خذ 20 د.إ',
    'عيد ميلاد سعيد! خذ 10 د.إ من كل لاعب',
    'استحقت بوليصة التأمين على الحياة: خذ 100 د.إ',
    'إقامة في المستشفى: ادفع 100 د.إ',
    'رسوم المدرسة: ادفع 50 د.إ',
    'أتعاب استشارة: خذ 25 د.إ',
    'إصلاح الشوارع: ادفع 40 د.إ عن كل بيت و115 د.إ عن كل فندق',
    'فزت بالمركز الثاني في مسابقة جمال: خذ 10 د.إ',
    'ورثت 100 د.إ',
  ],
  tagline: 'لعبة تجارة العقارات: دبي، أبوظبي، الشارقة والمزيد',
  bots: ['سالم', 'مريم', 'خالد'],
};

export const EDITIONS: Record<Lang, Edition> = { he, en, ar };

// ---------- the edition in play ----------
// One game is on screen at a time, so the board's names and the card texts are swapped
// in place for the game's edition (the engine and every screen read BOARD / DECKS).

let active: Lang = 'he';

export const edition = () => EDITIONS[active];
export const editionLang = () => active;

/** Money in the edition in play: ש"ח 200 / $200 / 200 د.إ */
export const money = (n: number) => EDITIONS[active].money(n);

export function applyEdition(lang: Lang) {
  if (lang === active && BOARD[0].name === EDITIONS[lang].names[0]) return;
  active = lang;
  const e = EDITIONS[lang];
  for (const sp of BOARD) {
    sp.name = e.names[sp.id];
    if (sp.kind === 'property') sp.city = e.cities[sp.id];
  }
  CHANCE.forEach((c, i) => (c.text = e.chance[i]));
  CHEST.forEach((c, i) => (c.text = e.chest[i]));
}
