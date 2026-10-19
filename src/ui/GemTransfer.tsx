import { useEffect, useState } from 'react';
import type { Player } from '../engine/types';
import { t } from '../i18n';
import { sfx } from './sound';
import { useWallet } from './Cosmetics';
import { Token } from './Token';
import './GemTransfer.css';

const FLY = 14;

/** Count a number up (or down) to its target over a moment. */
function useCount(from: number, to: number, ms: number, delay: number) {
  const [n, setN] = useState(from);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now() + delay;
    const step = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - t0) / ms));
      setN(Math.round(from + (to - from) * k));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [from, to, ms, delay]);
  return n;
}

/**
 * The end of a diamond game: the losers' diamonds fly over to the winner, and the counters
 * show how many changed hands.
 */
export function GemTransfer({ winner, losers, stake, me, onClose }: { winner: Player; losers: Player[]; stake: number; me?: string; onClose: () => void }) {
  const wallet = useWallet();
  const pot = stake * (losers.length + 1);
  const iWon = !!me && winner.uid === me;
  const winCount = useCount(stake, pot, 1600, 600);
  const loseCount = useCount(stake, 0, 1600, 600);
  useEffect(() => {
    const id = window.setTimeout(() => (iWon ? sfx.buy() : sfx.coin()), 700);
    return () => window.clearTimeout(id);
  }, [iWon]);

  return (
    <div className="gt" onClick={onClose} role="dialog" aria-label={t('gems')}>
      <div className="gt-card" onClick={(e) => e.stopPropagation()}>
        <div className={`gt-title${iWon ? ' won' : ''}`}>{iWon ? t('wonGems', { n: (pot).toLocaleString() }) : t('lostGems', { n: stake.toLocaleString() })}</div>
        <div className="gt-stage" dir="ltr">
          <div className="gt-side gt-losers">
            {losers.map((p) => (
              <div key={p.id} className="gt-who lose">
                <Token token={p.token} size="30px" skin={p.uid === me ? wallet.skin : undefined} />
                <b>{p.name}</b>
              </div>
            ))}
            <span className="gt-count lose">💎 {loseCount.toLocaleString()}</span>
          </div>
          <div className="gt-air" aria-hidden="true">
            {Array.from({ length: FLY }, (_, i) => (
              <span
                key={i}
                className="gt-gem"
                style={{ ['--d' as string]: `${0.5 + i * 0.09}s`, ['--y' as string]: `${((i * 37) % 60) - 30}px` }}
              >
                💎
              </span>
            ))}
          </div>
          <div className="gt-side gt-winner">
            <div className="gt-who win">
              <span className="gt-crown">👑</span>
              <Token token={winner.token} size="38px" skin={winner.uid === me ? wallet.skin : undefined} />
              <b>{winner.name}</b>
            </div>
            <span className="gt-count win">💎 {winCount.toLocaleString()}</span>
          </div>
        </div>
        <div className="gt-mine">
          {t('gems')}: <b>💎 {wallet.gems.toLocaleString()}</b>
        </div>
        <button className="btn btn-red gt-ok" onClick={onClose}>
          {t('continue')}
        </button>
      </div>
    </div>
  );
}
