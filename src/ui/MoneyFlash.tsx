import { BOARD } from '../data/board';
import type { GameState, Payment } from '../engine/types';
import { Token } from './Token';
import './MoneyFlash.css';

const BILLS = 6;

/** A short on-screen card for a payment between two players: red and falling for the payer, green and rising for the owner. */
export function MoneyFlash({ game, payment }: { game: GameState; payment: Payment }) {
  const from = game.players[payment.from];
  const to = game.players[payment.to];
  const title = payment.space !== null ? `שכירות: ${BOARD[payment.space].name}` : 'תשלום';
  const row = (p: typeof from, dir: 'loss' | 'gain') => (
    <div className={`mf-row ${dir}`} style={{ ['--pc' as string]: p.color }}>
      <Token token={p.token} color={p.color} size="26px" />
      <span className="mf-name">{p.name}</span>
      <b className="mf-amount" dir="ltr">
        {dir === 'loss' ? '−' : '+'}
        {payment.amount} ₪
      </b>
      <span className="mf-bills" aria-hidden="true">
        {Array.from({ length: BILLS }, (_, i) => (
          <i key={i} style={{ left: `${8 + i * 15}%`, animationDelay: `${i * 0.12}s` }}>
            ₪
          </i>
        ))}
      </span>
    </div>
  );
  return (
    <div className="money-flash" role="status" aria-live="polite">
      <div className="mf-title">{title}</div>
      {row(from, 'loss')}
      {row(to, 'gain')}
    </div>
  );
}
