export type CardEffect =
  | { type: 'move'; to: number }
  | { type: 'back'; steps: number }
  | { type: 'nearest'; kind: 'railroad' | 'utility' }
  | { type: 'money'; amount: number }
  | { type: 'payEach'; amount: number }
  | { type: 'collectEach'; amount: number }
  | { type: 'repairs'; house: number; hotel: number }
  | { type: 'gotojail' }
  | { type: 'jailfree' };

export type Deck = 'chance' | 'chest';

export interface Card {
  text: string;
  effect: CardEffect;
}

export const CHANCE: Card[] = [
  { text: 'התקדם ל"דרך צלחה" וקבל ש"ח 400', effect: { type: 'move', to: 0 } },
  { text: "התקדם לרח' ביאליק, רמת-גן", effect: { type: 'move', to: 24 } },
  { text: "התקדם לשד' שזר, באר-שבע", effect: { type: 'move', to: 11 } },
  {
    text: 'התקדם לחברה הקרובה. אם היא בבעלות, שלם פי 10 מסכום הקוביות',
    effect: { type: 'nearest', kind: 'utility' },
  },
  {
    text: 'התקדם לרכבת הקרובה. אם היא בבעלות, שלם כפול',
    effect: { type: 'nearest', kind: 'railroad' },
  },
  {
    text: 'התקדם לרכבת הקרובה. אם היא בבעלות, שלם כפול',
    effect: { type: 'nearest', kind: 'railroad' },
  },
  { text: 'הבנק משלם לך דיבידנד של ש"ח 50', effect: { type: 'money', amount: 50 } },
  { text: 'צא מהכלא חינם. שמור כרטיס זה', effect: { type: 'jailfree' } },
  { text: 'חזור 3 משבצות אחורה', effect: { type: 'back', steps: 3 } },
  { text: 'גש לכלא! אל תעבור ב"דרך צלחה"', effect: { type: 'gotojail' } },
  {
    text: 'תיקונים כלליים: שלם ש"ח 25 לכל בית וש"ח 100 לכל מלון',
    effect: { type: 'repairs', house: 25, hotel: 100 },
  },
  { text: 'קנס מהירות: שלם ש"ח 15', effect: { type: 'money', amount: -15 } },
  { text: 'נסע לרכבת דרום', effect: { type: 'move', to: 5 } },
  { text: "התקדם לרח' דיזנגוף, תל-אביב", effect: { type: 'move', to: 39 } },
  { text: 'נבחרת ליו"ר הוועד: שלם לכל שחקן ש"ח 50', effect: { type: 'payEach', amount: 50 } },
  { text: 'הלוואת הבנייה שלך הבשילה: קבל ש"ח 150', effect: { type: 'money', amount: 150 } },
];

export const CHEST: Card[] = [
  { text: 'התקדם ל"דרך צלחה" וקבל ש"ח 400', effect: { type: 'move', to: 0 } },
  { text: 'טעות של הבנק לטובתך: קבל ש"ח 200', effect: { type: 'money', amount: 200 } },
  { text: 'ביקור אצל רופא: שלם ש"ח 50', effect: { type: 'money', amount: -50 } },
  { text: 'מכרת מניות: קבל ש"ח 50', effect: { type: 'money', amount: 50 } },
  { text: 'צא מהכלא חינם. שמור כרטיס זה', effect: { type: 'jailfree' } },
  { text: 'גש לכלא! אל תעבור ב"דרך צלחה"', effect: { type: 'gotojail' } },
  { text: 'מענק חג: קבל ש"ח 100', effect: { type: 'money', amount: 100 } },
  { text: 'החזר מס הכנסה: קבל ש"ח 20', effect: { type: 'money', amount: 20 } },
  { text: 'יום הולדת שמח! קבל ש"ח 10 מכל שחקן', effect: { type: 'collectEach', amount: 10 } },
  { text: 'פוליסת ביטוח חיים הבשילה: קבל ש"ח 100', effect: { type: 'money', amount: 100 } },
  { text: 'אשפוז בבית חולים: שלם ש"ח 100', effect: { type: 'money', amount: -100 } },
  { text: 'שכר לימוד: שלם ש"ח 50', effect: { type: 'money', amount: -50 } },
  { text: 'דמי ייעוץ: קבל ש"ח 25', effect: { type: 'money', amount: 25 } },
  {
    text: 'תיקוני רחוב: שלם ש"ח 40 לכל בית וש"ח 115 לכל מלון',
    effect: { type: 'repairs', house: 40, hotel: 115 },
  },
  { text: 'זכית במקום שני בתחרות יופי: קבל ש"ח 10', effect: { type: 'money', amount: 10 } },
  { text: 'קיבלת ירושה: קבל ש"ח 100', effect: { type: 'money', amount: 100 } },
];

export const DECKS: Record<Deck, Card[]> = { chance: CHANCE, chest: CHEST };
