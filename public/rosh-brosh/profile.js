// פרופיל שחקן: שם, גיל ולוגו. פונקציות טהורות, כדי שאפשר יהיה לבדוק אותן.
// "הלוגו" של השחקן הוא דמות אנימה. מזהים ישנים (סמלים) ממופים לדמויות כדי ששמירות קיימות לא יישברו.
export const LOGOS = ['hana', 'ren', 'kira', 'sora', 'mika', 'yuki'];
export const LEGACY_LOGOS = { flame: 'hana', bolt: 'ren', crown: 'kira', shield: 'sora', star: 'mika', gem: 'yuki' };
export const normLogo = (l) => (LOGOS.includes(l) ? l : LEGACY_LOGOS[l]);
export const MIN_AGE = 5;
export const MAX_AGE = 99;

/** קבוצת גיל לפי הגיל. */
export function ageGroup(age) {
  const a = Number(age);
  if (!Number.isFinite(a) || a < MIN_AGE) return '';
  if (a <= 12) return 'ילד';
  if (a <= 17) return 'נער';
  return 'מבוגר';
}

/** מנקה ומאמת תשובות מהשאלון. מחזיר { value } או { error }. */
export function validateProfile({ name, age, logo }) {
  const n = String(name ?? '').replace(/\s+/g, ' ').trim();
  if (!n) return { error: 'כתוב איך קוראים לך' };
  if (n.length > 14) return { error: 'השם יכול להיות עד 14 תווים' };
  const raw = String(age ?? '').trim();
  const a = Number(raw);
  if (!raw || !Number.isInteger(a) || a < MIN_AGE || a > MAX_AGE) return { error: `כתוב גיל בין ${MIN_AGE} ל-${MAX_AGE}` };
  const lg = normLogo(logo);
  if (!lg) return { error: 'בחר דמות' };
  return { value: { name: n, age: a, logo: lg } };
}
