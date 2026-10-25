import { useEffect, useState } from 'react';
import type { Player } from '../engine/types';
import { t } from '../i18n';
import { sfx } from './sound';
import { useWallet } from './Cosmetics';
import { Token } from './Token';
import { DAILY_PRIZE_WINS, skinOf } from './shop';
import { GemPackArt } from './GemPackArt';
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
 * The end of a diamond-table game: the prize flies from the game's vault to the winner. Nobody
 * pays to play, so the loser loses nothing. `paid` is what this device's wallet actually got
 * (0 after the daily prize limit).
 */
export function GemTransfer({ winner, prize, paid, me, onClose }: { winner: Player; prize: number; paid: number; me?: string; onClose: () => void }) {
  const wallet = useWallet();
  const iWon = !!me && winner.uid === me;
  const capped = iWon && paid === 0;
  const winCount = useCount(0, prize, 1600, 600);
  useEffect(() => {
    const id = window.setTimeout(() => (iWon ? sfx.buy() : sfx.coin()), 700);
    return () => window.clearTimeout(id);
  }, [iWon]);

  return (
    <div className="gt" onClick={onClose} role="dialog" aria-label={t('gems')}>
      <div className="gt-card" onClick={(e) => e.stopPropagation()}>
        <div className={`gt-title${iWon ? ' won' : ''}`}>
          {iWon ? t('wonGems', { n: prize.toLocaleString() }) : t('lostGems', { name: winner.name })}
        </div>
        <div className="gt-stage" dir="ltr">
          <div className="gt-side gt-bank">
            <span className="gt-vault">
              <GemPackArt kind={3} />
            </span>
            <span className="gt-count bank">🏆 {prize.toLocaleString()}</span>
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
              <Token token={winner.token} size="38px" skin={winner.uid === me ? skinOf(wallet, winner.token) : undefined} />
              <b>{winner.name}</b>
            </div>
            <span className="gt-count win">+💎 {winCount.toLocaleString()}</span>
          </div>
        </div>
        {capped && <p className="gt-note">{t('prizeCapReached', { n: DAILY_PRIZE_WINS })}</p>}
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
