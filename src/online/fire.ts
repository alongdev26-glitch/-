import type { GameState } from '../engine/types';
import { freshRoom, seatIn, type RoomLink } from './link';
import { newCode, type Room } from './net';
import { FIREBASE_DB } from './referral';
import { t } from '../i18n';

/**
 * Online rooms kept on the Firebase Realtime Database (REST + a live stream), so phones on any
 * network can play: nobody has to stay close or on the same Wi-Fi, and a dropped phone just
 * reconnects. The room is stored as one JSON string (the database drops empty arrays).
 */

const UID_KEY = 'bigdeal-uid';
/** a waiting quick-match spot with no heartbeat for this long is free again */
const LOBBY_STALE_MS = 30_000;
/** a quick-match game nobody moved in for this long is free again */
const GAME_STALE_MS = 10 * 60_000;
const BEAT_MS = 10_000;

interface Node {
  v: string;
  t: number;
}

function myUid(): string {
  try {
    let id = localStorage.getItem(UID_KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2, 12);
      localStorage.setItem(UID_KEY, id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2, 12);
  }
}

/** `?db=` points at another database (used for testing); otherwise the game's Firebase. */
export function dbUrl(): string {
  try {
    return new URLSearchParams(location.search).get('db') || FIREBASE_DB;
  } catch {
    return FIREBASE_DB;
  }
}

const parse = (n: Node | null): Room | null => {
  if (!n || typeof n.v !== 'string') return null;
  try {
    return JSON.parse(n.v) as Room;
  } catch {
    return null;
  }
};

/** A quick-match spot whose room was closed or left behind counts as empty. */
export function isFree(room: Room | null, at: number, now = Date.now()): boolean {
  if (!room || room.status === 'closed') return true;
  if (!room.cap) return false;
  return now - at > (room.status === 'lobby' ? LOBBY_STALE_MS : GAME_STALE_MS);
}

class Conflict extends Error {}

export function fireLink(db = dbUrl()): RoomLink {
  const uid = myUid();
  const url = (code: string) => `${db}/rooms/${code}.json`;
  const statusListeners = new Set<(on: boolean) => void>();
  let online = true;
  const setOnline = (on: boolean) => {
    if (on === online) return;
    online = on;
    statusListeners.forEach((f) => f(on));
  };
  let beat = 0;

  // Ask for ETags so two phones can't overwrite each other. If the browser refuses those headers
  // (a network error), go on without any extra headers, like the referrals do, and check each
  // write by reading it back.
  let plain = false;
  async function get(code: string): Promise<Response> {
    if (!plain) {
      try {
        return await fetch(url(code), { headers: { 'X-Firebase-ETag': 'true' }, cache: 'no-store' });
      } catch {
        plain = true;
      }
    }
    return fetch(url(code), { cache: 'no-store' });
  }
  async function read(code: string): Promise<{ node: Node | null; etag: string }> {
    const r = await get(code);
    if (!r.ok) throw new Error(t('netFail'));
    return { node: (await r.json()) as Node | null, etag: plain ? '' : (r.headers.get('ETag') ?? '') };
  }
  async function write(code: string, node: Node, etag: string) {
    const body = JSON.stringify(node);
    let r: Response | null = null;
    if (etag && !plain) {
      try {
        r = await fetch(url(code), { method: 'PUT', headers: { 'if-match': etag }, body });
      } catch {
        plain = true;
      }
    }
    // without an ETag the write is last-one-wins (checked by reading it back)
    r ??= await fetch(url(code), { method: 'PUT', body });
    if (r.status === 412) throw new Conflict();
    if (!r.ok) throw new Error(t('netFail'));
  }
  /** read, change, write back; retried when someone else wrote in between */
  async function change(code: string, f: (room: Room | null, at: number) => Room | null): Promise<Room | null> {
    for (let i = 0; i < 8; i++) {
      const { node, etag } = await read(code);
      const next = f(parse(node), node?.t ?? 0);
      if (!next) return null;
      const mine: Node = { v: JSON.stringify(next), t: Date.now() };
      try {
        await write(code, mine, etag);
        if (!etag) {
          // no ETag: wait a moment, then make sure nobody else's write landed on top of ours
          await new Promise((ok) => setTimeout(ok, 400));
          const back = await read(code);
          if (back.node?.v !== mine.v) throw new Conflict();
        }
        setOnline(true);
        return next;
      } catch (e) {
        if (!(e instanceof Conflict)) throw e;
        await new Promise((ok) => setTimeout(ok, 150 + Math.random() * 350));
      }
    }
    throw new Error(t('netFail'));
  }

  const stopBeat = () => window.clearInterval(beat);
  const startBeat = (code: string) => {
    stopBeat();
    beat = window.setInterval(() => {
      change(code, (r) => (r && r.status === 'lobby' && r.host === uid ? r : null)).catch(() => setOnline(false));
    }, BEAT_MS);
  };

  return {
    kind: 'fire',
    uid,
    async create(seat, code, cap) {
      if (code) {
        let busy = false;
        await change(code, (r, at) => {
          if (!isFree(r, at)) {
            busy = true;
            return null;
          }
          return freshRoom(code, seat, cap);
        });
        if (busy) throw new Error(t('codeBusy'));
        if (cap) startBeat(code);
        return code;
      }
      for (let i = 0; i < 6; i++) {
        const c = newCode();
        let taken = false;
        await change(c, (r) => {
          if (r && r.status !== 'closed') {
            taken = true;
            return null;
          }
          return freshRoom(c, seat);
        });
        if (!taken) return c;
      }
      throw new Error(t('roomCreateFail'));
    },
    async join(code, seat) {
      let error = '';
      await change(code, (r, at) => {
        if (!r || r.status === 'closed' || (r.cap && isFree(r, at))) {
          error = t('roomNotFound');
          return null;
        }
        const res = seatIn(r, seat);
        if ('error' in res) {
          error = res.error;
          return null;
        }
        return res.room === r ? null : res.room;
      });
      if (error) throw new Error(error);
    },
    subscribe(code, onRoom, onClosed) {
      const es = new EventSource(url(code));
      let node: Node | null = null;
      const apply = (raw: string, patch: boolean) => {
        const { path, data } = JSON.parse(raw) as { path: string; data: unknown };
        if (path === '/') node = patch ? { ...(node ?? ({} as Node)), ...(data as Partial<Node>) } : (data as Node | null);
        else if (node) node = { ...node, [path.slice(1)]: data } as Node;
        const room = parse(node);
        if (!room || room.status === 'closed') onClosed(t('roomClosed'));
        else onRoom(room);
      };
      es.addEventListener('put', (e) => apply((e as MessageEvent).data, false));
      es.addEventListener('patch', (e) => apply((e as MessageEvent).data, true));
      es.addEventListener('open', () => setOnline(true));
      es.addEventListener('error', () => setOnline(false));
      es.addEventListener('cancel', () => onClosed(t('roomLost')));
      return () => es.close();
    },
    patch(code, _room, p) {
      change(code, (r) => (r ? { ...r, ...p } : null)).catch(() => setOnline(false));
      if (p.status === 'playing') stopBeat();
    },
    async sendState(code, _room, state: GameState) {
      await change(code, (r) => (r && r.status === 'playing' ? { ...r, state } : null));
    },
    leave(code, room) {
      stopBeat();
      change(code, (r) => {
        if (!r) return null;
        // a quick-match spot is handed back when its host leaves
        if (r.cap && r.host === uid) return { ...r, status: 'closed', state: null };
        if (r.status === 'lobby' && r.host !== uid) return { ...r, seats: r.seats.filter((s) => s.uid !== uid) };
        return null;
      }).catch(() => {});
      void room;
    },
    onStatus(cb) {
      statusListeners.add(cb);
      cb(online);
      return () => statusListeners.delete(cb);
    },
  };
}

/** Can this device use the shared database? (False until the database rules allow /rooms.) */
export async function fireAvailable(db = dbUrl()): Promise<boolean> {
  if (!db) return false;
  // twice, so one slow answer on a mobile network doesn't send us to direct connections
  for (let i = 0; i < 2; i++) {
    try {
      const r = await fetch(`${db}/rooms/_probe.json`, { cache: 'no-store', signal: AbortSignal.timeout(10_000) });
      if (r.ok) return true;
    } catch {
      /* try again */
    }
  }
  return false;
}
