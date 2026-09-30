import type { GameRules, GameState, TokenId } from '../engine/types';

/** Minimal typings for the claude.ai page runtime (window.claude.use). */
export interface DocSnap {
  exists: boolean;
  data(): Record<string, unknown> | undefined;
}
export interface DocRef {
  get(): Promise<DocSnap>;
  set(data: Record<string, unknown>): Promise<void>;
  update(data: Record<string, unknown>): Promise<void>;
  acquire(o: { holder: string; ttlMs?: number }): Promise<{ acquired: boolean }>;
  onSnapshot(next: (s: DocSnap) => void, error?: (e: { code: string }) => void): () => void;
}
interface Db {
  doc(path: string): DocRef;
}
interface User {
  id(): Promise<string | null>;
}
declare global {
  interface Window {
    claude?: { use(name: string): Promise<unknown> };
  }
}

export interface Seat {
  uid: string;
  name: string;
  token: TokenId;
}

export interface Room {
  code: string;
  host: string;
  status: 'lobby' | 'playing';
  seats: Seat[];
  bots: number;
  rules: GameRules;
  state: GameState | null;
  createdAt: number;
}

export interface Net {
  db: Db;
  uid: string;
}

/** Connect to the shared store; null when the page runs outside claude.ai or the viewer has no identity. */
export async function connect(): Promise<Net | null> {
  if (!window.claude?.use) return null;
  try {
    const [db, user] = (await Promise.all([window.claude.use('db'), window.claude.use('user')])) as [
      Db | null,
      User | null,
    ];
    if (!db || !user) return null;
    const uid = await user.id();
    return uid ? { db, uid } : null;
  } catch {
    return null;
  }
}

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
export const newCode = () => Array.from({ length: 4 }, () => LETTERS[Math.floor(Math.random() * LETTERS.length)]).join('');
export const cleanCode = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);

export const roomRef = (net: Net, code: string) => net.db.doc(`games/${code}`);
