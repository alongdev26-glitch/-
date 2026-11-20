import { describe, it, expect } from 'vitest';
import { suspenseLevel, heartbeatGap, shouldTick } from './sound.js';

describe('מתח', () => {
  it('עולה ככל שהזמן נגמר ולא יוצא מהטווח', () => {
    expect(suspenseLevel(10000, 10000)).toBeCloseTo(0.15, 2);
    expect(suspenseLevel(0, 10000)).toBe(1);
    expect(suspenseLevel(5000, 10000)).toBeGreaterThan(suspenseLevel(8000, 10000));
    expect(suspenseLevel(-5, 10000)).toBe(1);
    expect(suspenseLevel(20000, 10000)).toBeCloseTo(0.15, 2);
    expect(suspenseLevel(5, 0)).toBe(0);
  });
  it('הלב דופק מהר יותר עם מתח, וטיק רק ב-5 השניות האחרונות', () => {
    expect(heartbeatGap(0)).toBeGreaterThan(heartbeatGap(1));
    expect(heartbeatGap(1)).toBeCloseTo(0.4, 2);
    expect(heartbeatGap(5)).toBeCloseTo(0.4, 2);
    expect(shouldTick(6000)).toBe(false);
    expect(shouldTick(4999)).toBe(true);
    expect(shouldTick(0)).toBe(false);
  });
});
