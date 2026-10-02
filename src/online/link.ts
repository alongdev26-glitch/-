import type { GameState } from '../engine/types';
import { connect, newCode, roomRef, type Net, type Room, type Seat } from './net';
import { TOKENS } from '../ui/Token';

export const MAX_SEATS = 4;
/** the host's phone keeps its room here, so a reload can reopen it */
export const HOST_KEY = 'bigdeal-hostroom';

export function savedHostRoom(): Room | null {
  try {
    const raw = localStorage.getItem(HOST_KEY);
    return raw ? (JSON.parse(raw) as Room) : null;
  } catch {
    return null;
  }
}

/**
 * How the online screens talk to a room, whatever carries it: the claude.ai Artifact db
 * (inside the Claude link) or a direct phone-to-phone connection (the website and app).
 */
export interface RoomLink {
  readonly kind: 'claude' | 'peer';
  readonly uid: string;
  /** open a new room with me in the first seat; resolves to its code */
  create(seat: Seat): Promise<string>;
  /** take a seat in a friend's room (or get my seat back); rejects with a Hebrew message */
  join(code: string, seat: Seat): Promise<void>;
  /** room updates; `onClosed` when the room is gone for good */
  subscribe(code: string, onRoom: (r: Room) => void, onClosed: (msg: string) => void): () => void;
  /** host only: lobby settings, or starting the game */
  patch(code: string, room: Room, p: Partial<Room>): void;
  /** a move: the next shared game state */
  sendState(code: string, room: Room, state: GameState): Promise<void>;
  leave(code: string, room: Room | null): void;
  /** connection state, for the little status line */
  onStatus(cb: (online: boolean) => void): () => void;
}

/** A seat joins a lobby (or comes back to its own seat). Shared by both backends. */
export function seatIn(room: Room, seat: Seat): { room: Room } | { error: string } {
  if (room.seats.some((s) => s.uid === seat.uid)) return { room };
  if (room.status !== 'lobby') return { error: 'המשחק בחדר הזה כבר התחיל' };
  if (room.seats.length + room.bots >= MAX_SEATS) return { error: 'החדר מלא' };
  const taken = new Set(room.seats.map((s) => s.token));
  const mine = { ...seat };
  if (taken.has(mine.token)) mine.token = TOKENS.find((t) => !taken.has(t.id))!.id;
  return { room: { ...room, seats: [...room.seats, mine] } };
}

export const freshRoom = (code: string, host: Seat): Room => ({
  code,
  host: host.uid,
  status: 'lobby',
  seats: [host],
  bots: 0,
  rules: { mortgage: true },
  state: null,
  createdAt: Date.now(),
});

/** The claude.ai Artifact db, as it worked before. */
export function claudeLink(net: Net): RoomLink {
  return {
    kind: 'claude',
    uid: net.uid,
    async create(seat) {
      let c = newCode();
      try {
        for (let i = 0; i < 5 && (await roomRef(net, c).get()).exists; i++) c = newCode();
        await roomRef(net, c).set(freshRoom(c, seat) as unknown as Record<string, unknown>);
      } catch {
        throw new Error('לא הצלחתי ליצור חדר. בדוק שיש לך הרשאת עריכה בקישור ונסה שוב.');
      }
      return c;
    },
    async join(code, seat) {
      let result: { room: Room } | { error: string };
      try {
        const ref = roomRef(net, code);
        await ref.acquire({ holder: net.uid, ttlMs: 5000 });
        const snap = await ref.get();
        if (!snap.exists) throw new Error('לא מצאתי חדר עם הקוד הזה');
        const r = snap.data() as unknown as Room;
        result = seatIn(r, seat);
        if ('room' in result && result.room !== r) await ref.update({ seats: result.room.seats });
      } catch (e) {
        throw e instanceof Error && e.message.startsWith('לא מצאתי')
          ? e
          : new Error('לא הצלחתי להיכנס לחדר. בדוק שיש לך הרשאת עריכה בקישור.');
      }
      if ('error' in result) throw new Error(result.error);
    },
    subscribe(code, onRoom, onClosed) {
      return roomRef(net, code).onSnapshot(
        (snap) => (snap.exists ? onRoom(snap.data() as unknown as Room) : onClosed('החדר נסגר')),
        () => onClosed('החיבור לחדר נותק. נסה להיכנס שוב עם הקוד.'),
      );
    },
    patch(code, _room, p) {
      roomRef(net, code).update(p as Record<string, unknown>).catch(() => {});
    },
    async sendState(code, room, state) {
      // a full replace: update() would merge the old phase object into the new one
      await roomRef(net, code).set({ ...room, state } as unknown as Record<string, unknown>);
    },
    leave(code, room) {
      if (room && room.status === 'lobby' && room.host !== net.uid) {
        roomRef(net, code)
          .update({ seats: room.seats.filter((s) => s.uid !== net.uid) })
          .catch(() => {});
      }
    },
    onStatus() {
      return () => {};
    },
  };
}

/** The Claude link when the page runs inside claude.ai, otherwise the direct connection. */
export async function openLink(): Promise<RoomLink | null> {
  const net = await connect();
  if (net) return claudeLink(net);
  if (typeof RTCPeerConnection === 'undefined') return null;
  try {
    const { peerLink } = await import('./peer');
    return peerLink();
  } catch {
    return null;
  }
}
