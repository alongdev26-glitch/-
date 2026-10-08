import type { Deck } from '../data/cards';
import './CardReveal.css';
import { t } from '../i18n';
import { edition } from '../data/editions';

/** Drawing a card: a plain card with the deck name and its text, shown at once (no animation). */
export function CardReveal({ deck, who, text }: { deck: Deck; who: string; text: string }) {
  return (
    <div className={`cr cr-${deck}`}>
      <div className="card-deck">{deck === 'chance' ? `? ${edition().chanceName}` : `🧰 ${edition().chestName}`}</div>
      <div className="card-who">{t('drewCard', { name: who })}</div>
      <div className="card-text">{text}</div>
    </div>
  );
}
