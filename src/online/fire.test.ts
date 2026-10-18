import { describe, expect, it } from 'vitest';
import { isFree } from './fire';
import { freshRoom } from './link';

const seat = { uid: 'a', name: 'a', token: 'cat' as const };

describe('quick-match spots on the shared database', () => {
  it('a waiting spot with a fresh heartbeat is taken, a silent one is free', () => {
    const r = freshRoom('QMAA', seat, 2);
    expect(isFree(r, 1000, 1000 + 5_000)).toBe(false);
    expect(isFree(r, 1000, 1000 + 60_000)).toBe(true);
  });
  it('a quick game is free again only after a long silence', () => {
    const r = { ...freshRoom('QMAA', seat, 2), status: 'playing' as const };
    expect(isFree(r, 0, 5 * 60_000)).toBe(false);
    expect(isFree(r, 0, 11 * 60_000)).toBe(true);
  });
  it('a closed or missing room is free; a friends room never goes stale', () => {
    expect(isFree(null, 0)).toBe(true);
    expect(isFree({ ...freshRoom('ABCD', seat), status: 'closed' }, 0)).toBe(true);
    expect(isFree(freshRoom('ABCD', seat), 0, 99 * 60_000)).toBe(false);
  });
});
