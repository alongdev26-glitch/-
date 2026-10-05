// Languages: the UI language is this device's choice; each game also has an edition
// (its board, cards and currency), see data/editions.ts.
import { useEffect, useState } from 'react';
import { he } from './he';
import { en } from './en';
import { ar } from './ar';

export type Lang = 'he' | 'en' | 'ar';
export const LANGS: { id: Lang; flag: string; name: string }[] = [
  { id: 'he', flag: '🇮🇱', name: 'עברית' },
  { id: 'en', flag: '🇺🇸', name: 'English' },
  { id: 'ar', flag: '🇦🇪', name: 'العربية' },
];

export type Params = Record<string, string | number>;
export type Entry = string | ((p: Params) => string);
export type Key = keyof typeof he;
export type Dict = Record<Key, Entry>;

const DICTS: Record<Lang, Dict> = { he, en, ar };

const KEY = 'bigdeal-lang';
const isLang = (x: unknown): x is Lang => x === 'he' || x === 'en' || x === 'ar';

/** The phone's own language, if we have it; Hebrew otherwise. */
export function deviceLang(): Lang {
  try {
    for (const l of navigator.languages ?? [navigator.language]) {
      const code = l.slice(0, 2).toLowerCase();
      if (code === 'he' || code === 'iw') return 'he';
      if (code === 'ar') return 'ar';
      if (code === 'en') return 'en';
    }
  } catch {
    /* no navigator (tests) */
  }
  return 'he';
}

/** Has this device picked a language yet? (the first-time questionnaire asks) */
export function hasChosenLang(): boolean {
  try {
    return isLang(localStorage.getItem(KEY));
  } catch {
    return true;
  }
}

let current: Lang = (() => {
  try {
    const s = localStorage.getItem(KEY);
    return isLang(s) ? s : deviceLang();
  } catch {
    return 'he';
  }
})();

const listeners = new Set<(l: Lang) => void>();

export const getLang = () => current;
export const dir = (l: Lang = current) => (l === 'en' ? 'ltr' : 'rtl');

export function setLang(l: Lang) {
  current = l;
  try {
    localStorage.setItem(KEY, l);
  } catch {
    /* storage off */
  }
  applyDocLang();
  listeners.forEach((f) => f(l));
}

export function applyDocLang() {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = current;
  document.documentElement.dir = dir(current);
}

export function useLang(): Lang {
  const [l, setL] = useState(current);
  useEffect(() => {
    listeners.add(setL);
    return () => {
      listeners.delete(setL);
    };
  }, []);
  return l;
}

/** Translate: t('key', {name: 'Dana'}) in the UI language, or in `lang` (the engine logs in the game's). */
export function t(key: Key, p: Params = {}, lang: Lang = current): string {
  const e = DICTS[lang][key] ?? DICTS.he[key];
  if (typeof e === 'function') return e(p);
  return e.replace(/\{(\w+)\}/g, (_, k) => (k in p ? String(p[k]) : `{${k}}`));
}

/** Date/time in the UI language's own format. */
export const locale = (l: Lang = current) => (l === 'he' ? 'he-IL' : l === 'ar' ? 'ar-AE' : 'en-US');
