import { describe, expect, it } from 'vitest';
import { newGame } from '../engine/reducer';
import { freshRoom } from './link';
import { hostApply } from './peer';

const host = { uid: 'h', name: 'מארח', token: 'car' as const };
const guest = { uid: 'g', name: 'אורח', token: 'car' as const };

describe('host room logic', () => {
  it('seats a guest and gives them a free token on a clash', () => {
    const r = hostApply(freshRoom('ABCD', host), { t: 'join', seat: guest }).room;
    expect(r.seats.map((s) => s.uid)).toEqual(['h', 'g']);
    expect(r.seats[1].token).not.toBe('car');
  });

  it('lets a returning player back into their seat, even mid-game', () => {
    let r = hostApply(freshRoom('ABCD', host), { t: 'join', seat: guest }).room;
    r = { ...r, status: 'playing' };
    const again = hostApply(r, { t: 'join', seat: guest });
    expect(again.error).toBeUndefined();
    expect(again.room).toBe(r);
    expect(hostApply(r, { t: 'join', seat: { ...guest, uid: 'x' } }).error).toBe('המשחק בחדר הזה כבר התחיל');
  });

  it('refuses a fifth player', () => {
    let r = freshRoom('ABCD', host);
    for (const id of ['a', 'b', 'c']) r = hostApply(r, { t: 'join', seat: { ...guest, uid: id } }).room;
    expect(hostApply(r, { t: 'join', seat: { ...guest, uid: 'd' } }).error).toBe('החדר מלא');
  });

  it('removes a guest who leaves the lobby, never the host', () => {
    let r = hostApply(freshRoom('ABCD', host), { t: 'join', seat: guest }).room;
    r = hostApply(r, { t: 'leave', uid: 'g' }).room;
    expect(r.seats.map((s) => s.uid)).toEqual(['h']);
    expect(hostApply(r, { t: 'leave', uid: 'h' }).room.seats).toHaveLength(1);
  });

  it('takes a new game state only from a seated player during the game', () => {
    let r = hostApply(freshRoom('ABCD', host), { t: 'join', seat: guest }).room;
    const state = newGame([{ name: 'a', token: 'car', isBot: false }, { name: 'b', token: 'cat', isBot: false }], () => 0.5);
    expect(hostApply(r, { t: 'state', uid: 'g', state }).room.state).toBeNull();
    r = { ...r, status: 'playing' };
    expect(hostApply(r, { t: 'state', uid: 'g', state }).room.state).toBe(state);
    expect(hostApply(r, { t: 'state', uid: 'stranger', state }).room.state).toBeNull();
  });
});
