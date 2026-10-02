import Peer, { type DataConnection, type PeerOptions } from 'peerjs';
import type { GameState } from '../engine/types';
import { HOST_KEY, freshRoom, seatIn, type RoomLink } from './link';
import { newCode, type Room, type Seat } from './net';

/**
 * Direct phone-to-phone rooms (WebRTC through PeerJS). The player who creates the code is the
 * host: their phone keeps the room, everyone else sends changes to it and gets the whole room
 * back after every change.
 */

const UID_KEY = 'bigdeal-uid';
const PREFIX = 'bigdeal-';
const CONNECT_MS = 12000;
const RETRY_MS = 3000;
const GIVE_UP_MS = 60000;

/** Messages between the phones. */
export type Msg =
  | { t: 'join'; seat: Seat }
  | { t: 'leave'; uid: string }
  | { t: 'state'; uid: string; state: GameState }
  | { t: 'room'; room: Room }
  | { t: 'error'; msg: string };

/** The host applies a guest's message to the room. Pure, so it can be tested. */
export function hostApply(room: Room, msg: Msg): { room: Room; error?: string } {
  switch (msg.t) {
    case 'join': {
      const r = seatIn(room, msg.seat);
      return 'error' in r ? { room, error: r.error } : { room: r.room };
    }
    case 'leave':
      if (room.status !== 'lobby' || msg.uid === room.host) return { room };
      return { room: { ...room, seats: room.seats.filter((s) => s.uid !== msg.uid) } };
    case 'state':
      if (room.status !== 'playing' || !room.seats.some((s) => s.uid === msg.uid)) return { room };
      return { room: { ...room, state: msg.state } };
    default:
      return { room };
  }
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

/** `?peer=host:port` points at a private PeerJS server (used for testing); otherwise the free public one. */
function peerOptions(): PeerOptions {
  const custom = new URLSearchParams(location.search).get('peer');
  if (!custom) return { debug: 0 };
  const [host, port] = custom.split(':');
  return { host, port: Number(port) || 9000, path: '/', secure: location.protocol === 'https:' && host !== 'localhost', debug: 0 };
}

function saveHostRoom(room: Room | null) {
  try {
    if (room) localStorage.setItem(HOST_KEY, JSON.stringify(room));
    else localStorage.removeItem(HOST_KEY);
  } catch {
    /* storage off: the room just won't survive a reload */
  }
}

/** Open a peer with an id (or a random one); rejects with PeerJS's error type. */
function openPeer(id?: string): Promise<Peer> {
  return new Promise((resolve, reject) => {
    const p = id ? new Peer(id, peerOptions()) : new Peer(peerOptions());
    const t = window.setTimeout(() => {
      p.destroy();
      reject(new Error('timeout'));
    }, CONNECT_MS);
    p.once('open', () => {
      window.clearTimeout(t);
      resolve(p);
    });
    p.once('error', (e: Error & { type?: string }) => {
      window.clearTimeout(t);
      p.destroy();
      reject(Object.assign(new Error(e.type ?? 'error'), { type: e.type }));
    });
  });
}

const NO_NET = 'החיבור נכשל – נסו שוב או עברו לוויי-פיי';

export function peerLink(): RoomLink & { resume(room: Room): Promise<void> } {
  const uid = myUid();
  let peer: Peer | null = null;
  let room: Room | null = null;
  let isHost = false;
  const guests = new Set<DataConnection>();
  let toHost: DataConnection | null = null;
  let joinedSeat: Seat | null = null;
  let joinedCode: string | null = null;
  const roomListeners = new Set<(r: Room) => void>();
  const closedListeners = new Set<(m: string) => void>();
  const statusListeners = new Set<(on: boolean) => void>();
  let online = false;
  let retryTimer = 0;
  let lostAt = 0;

  const setOnline = (on: boolean) => {
    online = on;
    statusListeners.forEach((f) => f(on));
  };
  const emit = (r: Room) => {
    room = r;
    roomListeners.forEach((f) => f(r));
  };
  const closed = (msg: string) => closedListeners.forEach((f) => f(msg));

  // ---------- host ----------
  const broadcast = () => {
    if (!room) return;
    saveHostRoom(room);
    for (const c of guests) if (c.open) c.send({ t: 'room', room } satisfies Msg);
    emit(room);
  };
  const hostUpdate = (r: Room) => {
    room = r;
    broadcast();
  };
  const listenAsHost = (p: Peer) => {
    isHost = true;
    setOnline(true);
    p.on('connection', (c) => {
      guests.add(c);
      c.on('data', (data) => {
        if (!room) return;
        const res = hostApply(room, data as Msg);
        if (res.error) c.send({ t: 'error', msg: res.error } satisfies Msg);
        if (res.room !== room) hostUpdate(res.room);
        else if ((data as Msg).t === 'join') c.send({ t: 'room', room } satisfies Msg);
      });
      c.on('close', () => guests.delete(c));
      c.on('error', () => guests.delete(c));
    });
    p.on('disconnected', () => {
      setOnline(false);
      // lost the signaling server: try to get the same id back; guests already connected keep playing
      window.setTimeout(() => !p.destroyed && p.reconnect(), RETRY_MS);
    });
    p.on('open', () => setOnline(true));
  };

  // ---------- guest ----------
  const connectToHost = (code: string, seat: Seat): Promise<void> =>
    new Promise((resolve, reject) => {
      if (!peer) return reject(new Error(NO_NET));
      const c = peer.connect(PREFIX + code, { reliable: true });
      let settled = false;
      const t = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        c.close();
        reject(new Error(NO_NET));
      }, CONNECT_MS);
      const onPeerError = (e: Error & { type?: string }) => {
        if (settled || e.type !== 'peer-unavailable') return;
        settled = true;
        window.clearTimeout(t);
        reject(new Error('לא מצאתי חדר עם הקוד הזה'));
      };
      peer.on('error', onPeerError);
      c.on('open', () => c.send({ t: 'join', seat } satisfies Msg));
      c.on('data', (data) => {
        const m = data as Msg;
        if (m.t === 'room') {
          if (!settled) {
            settled = true;
            window.clearTimeout(t);
            peer?.off('error', onPeerError);
            toHost = c;
            lostAt = 0;
            setOnline(true);
            resolve();
          }
          emit(m.room);
        } else if (m.t === 'error' && !settled) {
          settled = true;
          window.clearTimeout(t);
          c.close();
          reject(new Error(m.msg));
        }
      });
      c.on('close', () => {
        if (toHost === c) lost();
      });
    });

  const lost = () => {
    toHost = null;
    setOnline(false);
    if (!lostAt) lostAt = Date.now();
    window.clearTimeout(retryTimer);
    if (Date.now() - lostAt > GIVE_UP_MS) return closed('המארח יצא מהמשחק');
    retryTimer = window.setTimeout(async () => {
      if (!joinedCode || !joinedSeat) return;
      try {
        if (!peer || peer.destroyed) peer = await openPeer();
        else if (peer.disconnected) peer.reconnect();
        await connectToHost(joinedCode, joinedSeat);
      } catch {
        lost();
      }
    }, RETRY_MS);
  };

  const shutdown = () => {
    window.clearTimeout(retryTimer);
    joinedCode = null;
    toHost?.close();
    toHost = null;
    guests.forEach((c) => c.close());
    guests.clear();
    peer?.destroy();
    peer = null;
    room = null;
    isHost = false;
    setOnline(false);
  };

  return {
    kind: 'peer',
    uid,
    async create(seat) {
      shutdown();
      for (let i = 0; i < 5; i++) {
        const code = newCode();
        try {
          peer = await openPeer(PREFIX + code);
        } catch (e) {
          if ((e as { type?: string }).type === 'unavailable-id') continue;
          throw new Error(NO_NET);
        }
        listenAsHost(peer);
        hostUpdate(freshRoom(code, seat));
        return code;
      }
      throw new Error(NO_NET);
    },
    async resume(saved) {
      shutdown();
      // the server may still hold our old id for a few seconds after a reload
      for (let i = 0; i < 6; i++) {
        try {
          peer = await openPeer(PREFIX + saved.code);
          listenAsHost(peer);
          hostUpdate(saved);
          return;
        } catch (e) {
          if ((e as { type?: string }).type !== 'unavailable-id') throw new Error(NO_NET);
          await new Promise((r) => window.setTimeout(r, 2500));
        }
      }
      throw new Error('הקוד עדיין תפוס. נסה שוב בעוד דקה.');
    },
    async join(code, seat) {
      shutdown();
      try {
        peer = await openPeer();
      } catch {
        throw new Error(NO_NET);
      }
      joinedCode = code;
      joinedSeat = seat;
      try {
        await connectToHost(code, seat);
      } catch (e) {
        shutdown();
        throw e;
      }
    },
    subscribe(_code, onRoom, onClosed) {
      roomListeners.add(onRoom);
      closedListeners.add(onClosed);
      if (room) onRoom(room);
      return () => {
        roomListeners.delete(onRoom);
        closedListeners.delete(onClosed);
      };
    },
    patch(_code, current, p) {
      if (isHost) hostUpdate({ ...(room ?? current), ...p });
    },
    async sendState(_code, current, state) {
      if (isHost) return hostUpdate({ ...(room ?? current), state });
      if (!toHost?.open) throw new Error(NO_NET);
      toHost.send({ t: 'state', uid, state } satisfies Msg);
    },
    leave(_code, current) {
      if (isHost) saveHostRoom(null);
      else if (toHost?.open && current?.status === 'lobby') toHost.send({ t: 'leave', uid } satisfies Msg);
      window.setTimeout(shutdown, 200);
    },
    onStatus(cb) {
      statusListeners.add(cb);
      cb(online);
      return () => statusListeners.delete(cb);
    },
  };
}
