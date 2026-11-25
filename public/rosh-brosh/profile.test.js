import { describe, it, expect } from 'vitest';
import { ageGroup, validateProfile } from './profile.js';

describe('פרופיל', () => {
  it('קבוצת גיל', () => {
    expect(ageGroup(5)).toBe('ילד');
    expect(ageGroup(12)).toBe('ילד');
    expect(ageGroup(13)).toBe('נער');
    expect(ageGroup(17)).toBe('נער');
    expect(ageGroup(18)).toBe('מבוגר');
    expect(ageGroup(99)).toBe('מבוגר');
    expect(ageGroup(3)).toBe('');
    expect(ageGroup('abc')).toBe('');
  });
  it('מאמת שם וגיל', () => {
    expect(validateProfile({ name: '  דנה   כהן ', age: '25'})).toEqual({ value: { name: 'דנה כהן', age: 25 } });
    expect(validateProfile({ name: '', age: 20 }).error).toBeTruthy();
    expect(validateProfile({ name: 'א'.repeat(15), age: 20 }).error).toBeTruthy();
    expect(validateProfile({ name: 'דנה', age: '4' }).error).toBeTruthy();
    expect(validateProfile({ name: 'דנה', age: '100' }).error).toBeTruthy();
    expect(validateProfile({ name: 'דנה', age: '12.5' }).error).toBeTruthy();
    expect(validateProfile({ name: 'דנה', age: '' }).error).toBeTruthy();
  });
});
