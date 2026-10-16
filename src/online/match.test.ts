import { describe, expect, it } from 'vitest';
import { findMatch } from './match';
import { freshRoom, seatIn, type RoomLink } from './link';
import type { Room, Seat } from './net';
import { t } from '../i18n';

/** An in-memory stand-in for the room store, shared by every player in a test. */
function fakeStore() {
  const rooms = new Map<string, Room>();
  const link = (uid: string): RoomLink => ({
    kind: 'claude',
    uid,
    async create(seat, code, cap) {
      if (!code) throw new Error('code needed');
      const r = rooms.get(code);
      if (r && r.status !== 'closed') throw new Error(t('codeBusy'));
      rooms.set(code, freshRoom(code, seat, cap));
      return code;
    },
    async join(code, seat) {
      const r = rooms.get(code);
      if (!r || r.status === 'closed') throw new Error(t('roomNotFound'));
      const res = seatIn(r, seat);
      if ('error' in res) throw new Error(res.error);
      rooms.set(code, res.room);
    },
    subscribe: () => () => {},
    patch() {},
    async sendState() {},
    leave() {},
    onStatus: () => () => {},
  });
  return { rooms, link };
}
const seat = (uid: string): Seat => ({ uid, name: uid, token: 'cat' });

describe('quick match', () => {
  it('the first searcher waits, the second joins the same spot', async () => {
    const s = fakeStore();
    const a = await findMatch(s.link('a'), seat('a'), new AbortController().signal, ['Q1', 'Q2'], 1);
    expect(a).toEqual({ code: 'Q1', host: true });
    const b = await findMatch(s.link('b'), seat('b'), new AbortController().signal, ['Q1', 'Q2'], 1);
    expect(b).toEqual({ code: 'Q1', host: false });
    expect(s.rooms.get('Q1')!.seats.map((x) => x.uid)).toEqual(['a', 'b']);
  });

  it('a third player is refused by the 2-seat room and waits in the next spot', async () => {
    const s = fakeStore();
    await findMatch(s.link('a'), seat('a'), new AbortController().signal, ['Q1', 'Q2'], 1);
    await findMatch(s.link('b'), seat('b'), new AbortController().signal, ['Q1', 'Q2'], 1);
    const c = await findMatch(s.link('c'), seat('c'), new AbortController().signal, ['Q1', 'Q2'], 1);
    expect(c).toEqual({ code: 'Q2', host: true });
  });

  it('skips a spot whose game already started', async () => {
    const s = fakeStore();
    s.rooms.set('Q1', { ...freshRoom('Q1', seat('x'), 2), status: 'playing' });
    const a = await findMatch(s.link('a'), seat('a'), new AbortController().signal, ['Q1', 'Q2'], 1);
    expect(a).toEqual({ code: 'Q2', host: true });
  });

  it('a closed spot is free again', async () => {
    const s = fakeStore();
    s.rooms.set('Q1', { ...freshRoom('Q1', seat('x'), 2), status: 'closed' });
    const a = await findMatch(s.link('a'), seat('a'), new AbortController().signal, ['Q1'], 1);
    expect(a).toEqual({ code: 'Q1', host: true });
  });

  it('stops when cancelled', async () => {
    const s = fakeStore();
    // every spot is busy, so the walk keeps going until it is cancelled
    for (const c of ['Q1', 'Q2']) s.rooms.set(c, { ...freshRoom(c, seat('x'), 2), status: 'playing' });
    const ctl = new AbortController();
    const p = findMatch(s.link('a'), seat('a'), ctl.signal, ['Q1', 'Q2'], 5);
    setTimeout(() => ctl.abort(), 20);
    await expect(p).rejects.toThrow('cancelled');
  });
});
