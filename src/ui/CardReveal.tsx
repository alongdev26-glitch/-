import type { Deck } from '../data/cards';
import './CardReveal.css';

/** Drawing a card: a treasure chest bursts open for "תיבת המזל", a "?" card spins in for "הפתעה". */
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
          <div className="cr-qcard">?</div>
        )}
        <div className="cr-sparkles">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} style={{ ['--a' as string]: `${i * 30}deg`, animationDelay: `${0.7 + (i % 3) * 0.05}s` }} />
          ))}
        </div>
      </div>
      <div className="card-deck">{deck === 'chance' ? '? הפתעה' : '🧰 תיבת המזל'}</div>
      <div className="card-who">{who} שלף כרטיס:</div>
      <div className="card-text cr-text">{text}</div>
    </div>
  );
}
