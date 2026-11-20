import { describe, it, expect } from 'vitest';
import { animeFace, CHARACTER_IDS, charByName } from './anime.js';
import { LOGOS } from './profile.js';

describe('דמויות אנימה', () => {
  it('לכל לוגו יש דמות, ו-SVG תקין בלי כתובות חיצוניות', () => {
    expect(CHARACTER_IDS.sort()).toEqual([...LOGOS].sort());
    for (const id of CHARACTER_IDS) {
      const svg = animeFace(id, 'w-10 h-10');
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg.endsWith('</svg>')).toBe(true);
      expect(svg).not.toMatch(/https?:|<script|onerror/i);
      expect((svg.match(/<svg/g) || []).length).toBe(1);
    }
  });
  it('דמויות שונות נראות שונה, ואותו מזהה נראה אותו דבר (חוץ ממזהי הגרדיאנט)', () => {
    const strip = (s) => s.replace(/af\d+/g, 'af');
    expect(strip(animeFace('hana'))).toBe(strip(animeFace('hana')));
    const all = new Set(CHARACTER_IDS.map((id) => strip(animeFace(id))));
    expect(all.size).toBe(CHARACTER_IDS.length);
  });
  it('דמות לפי שם: קבועה, והחברים הידועים מקבלים דמות קבועה', () => {
    expect(charByName('דנה')).toBe(charByName('דנה'));
    expect(CHARACTER_IDS).toContain(charByName('שם כלשהו'));
    expect(charByName('שמרית')).toBe('kira');
  });
});
