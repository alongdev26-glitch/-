import type { Deck } from '../data/cards';
import './CardReveal.css';
import { t } from '../i18n';
import { edition } from '../data/editions';

const CONFETTI = ['#ff4fa3', '#ffd23f', '#1fa24a', '#1e9bd7', '#f28c1e', '#7c3aed'];

/** Drawing a card: a treasure chest bursts open for "תיבת המזל", a gift box pops open with a "?" card for "הפתעה". */
export function CardReveal({ deck, who, text }: { deck: Deck; who: string; text: string }) {
  return (
    <div className={`cr cr-${deck}`}>
      <div className="cr-stage" aria-hidden="true">
        <div className="cr-rays" />
        {deck === 'chest' ? (
          <>
            <div className="chest">
              <div className="chest-lid">
                <i className="chest-band" />
              </div>
              <div className="chest-inside" />
              <div className="chest-body">
                <i className="chest-band" />
                <i className="chest-lock" />
              </div>
            </div>
            <div className="cr-paper">📜</div>
          </>
        ) : (
          <>
            <div className="gift">
              <div className="gift-lid">
                <i className="gift-bow" />
              </div>
              <div className="gift-box" />
            </div>
            <div className="cr-qcard">?</div>
            <div className="cr-confetti">
              {Array.from({ length: 16 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    ['--x' as string]: `${((i * 37) % 160) - 80}px`,
                    ['--r' as string]: `${(i * 67) % 360}deg`,
                    background: CONFETTI[i % CONFETTI.length],
                    animationDelay: `${0.75 + (i % 4) * 0.04}s`,
                  }}
                />
              ))}
            </div>
          </>
        )}
        <div className="cr-sparkles">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} style={{ ['--a' as string]: `${i * 30}deg`, animationDelay: `${0.7 + (i % 3) * 0.05}s` }} />
          ))}
        </div>
      </div>
      <div className="card-deck">{deck === 'chance' ? `? ${edition().chanceName}` : `🧰 ${edition().chestName}`}</div>
      <div className="card-who">{t('drewCard', { name: who })}</div>
      <div className="card-text cr-text">{text}</div>
    </div>
  );
}
