import type { Deck } from '../data/cards';
import './CardReveal.css';

/** Drawing a card: the card turns over from its gold-trimmed back, a short glint, then the text. */
export function CardReveal({ deck, who, text }: { deck: Deck; who: string; text: string }) {
  const title = deck === 'chance' ? 'הפתעה' : 'תיבת המזל';
  return (
    <div className={`cr cr-${deck}`}>
      <div className="cr-stage" aria-hidden="true">
        <div className="cr-card">
          <div className="cr-back">
            <span>{deck === 'chance' ? '?' : '◆'}</span>
          </div>
          <div className="cr-front">
            <small>ביג דיל</small>
            <b>{title}</b>
            <i className="cr-glint" />
          </div>
        </div>
      </div>
      <div className="card-deck">{title}</div>
      <div className="card-who">{who} שלף כרטיס:</div>
      <div className="card-text cr-text">{text}</div>
    </div>
  );
}
