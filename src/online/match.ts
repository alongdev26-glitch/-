import type { RoomLink } from './link';
import type { Seat } from './net';
import { t } from '../i18n';

/**
 * Quick match (1v1 with a random player) without a server of its own: a few well-known room
 * codes act as waiting spots. A searcher joins the first spot where someone waits; if a spot is
 * empty it waits there itself, as the host of a 2-seat room.
 */
export const SLOTS = ['QMAA', 'QMAB', 'QMAC', 'QMAD', 'QMAE', 'QMAF', 'QMAG', 'QMAH'];

/** Each diamond stake waits in spots of its own, so players only meet someone who put the same amount. */
export const slotsFor = (stakeIndex: number) =>
  Array.from({ length: 8 }, (_, i) => `QS${'BCDEFGHJKLMN'[stakeIndex]}${'ABCDEFGH'[i]}`);
const PAUSE_MS = 2000;

export interface Match {
  code: string;
  host: boolean;
}

const aborted = (signal: AbortSignal) => {
  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
};
const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const id = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(id);
      resolve();
    });
  });

/** Walk the spots until matched (as guest) or waiting (as host). Rejects with AbortError when cancelled. */
export async function findMatch(link: RoomLink, seat: Seat, signal: AbortSignal, slots = SLOTS, pause = PAUSE_MS): Promise<Match> {
  for (;;) {
    for (const code of slots) {
      aborted(signal);
      try {
        await link.join(code, seat);
        aborted(signal);
        return { code, host: false };
      } catch (e) {
        if ((e as Error).name === 'AbortError') throw e;
        // nobody waits here: wait here ourselves (someone may grab it first, then go on)
        if (e instanceof Error && e.message === t('roomNotFound')) {
          try {
            await link.create(seat, code, 2);
            aborted(signal);
            return { code, host: true };
          } catch (e2) {
            if ((e2 as Error).name === 'AbortError') throw e2;
          }
        }
        // full, started or busy: try the next spot
      }
    }
    await sleep(pause, signal);
  }
}
