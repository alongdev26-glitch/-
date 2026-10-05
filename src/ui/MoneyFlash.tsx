import { BOARD } from '../data/board';
import type { GameState, Payment } from '../engine/types';
import { Token } from './Token';
import './MoneyFlash.css';
import { t } from '../i18n';
import { edition, money } from '../data/editions';

const BILLS = 6;

function title(p: Payment): string {
  switch (p.kind) {
    case 'go':
      return t('passedGo', { go: BOARD[0].name });
    case 'go-land':
      return t('landedGo', { go: BOARD[0].name });
    case 'tax':
      return t('taxOf', { space: BOARD[p.space!].name });
    case 'rent':
      return t('rentOf', { space: BOARD[p.space!].name });
    case 'pot':
      return t('payToPot');
    case 'bank':
      return t('bankPays');
    case 'lotto':
      return t('wonPot');
    default:
      return t('payment');
  }
}

function Bills() {
  return (
    <span className="mf-bills" aria-hidden="true">
      {Array.from({ length: BILLS }, (_, i) => (
        <i key={i} style={{ left: `${8 + i * 15}%`, animationDelay: `${i * 0.12}s` }}>
          {edition().symbol}
        </i>
      ))}
    </span>
  );
}

/**
 * A short on-screen card for one movement of money: red and falling for whoever pays,
 * green and rising for whoever receives, gold for the lotto pot, and the bank as a source.
 */
export function MoneyFlash({ game, payment }: { game: GameState; payment: Payment }) {
  const amount = (sign: '+' | '−') => (
    <b className="mf-amount" dir="ltr">
      {sign}
      {money(payment.amount)}
    </b>
  );

  const playerRow = (pid: number, dir: 'loss' | 'gain') => {
    const p = game.players[pid];
    return (
      <div className={`mf-row ${dir}`} style={{ ['--pc' as string]: p.color }}>
        <Token token={p.token} color={p.color} size="26px" />
        <span className="mf-name">{p.name}</span>
        {amount(dir === 'loss' ? '−' : '+')}
        <Bills />
      </div>
    );
  };

  const fromRow =
    payment.from !== null ? (
      playerRow(payment.from, 'loss')
    ) : (
      <div className="mf-row source">
        <span className="mf-icon">{payment.kind === 'lotto' ? '💰' : payment.kind.startsWith('go') ? '🏁' : '🏦'}</span>
        <span className="mf-name">{payment.kind === 'lotto' ? t('lottoPot') : payment.kind.startsWith('go') ? BOARD[0].name : t('bank')}</span>
      </div>
    );

  const toRow =
    payment.to !== null ? (
      playerRow(payment.to, 'gain')
    ) : (
      <div className="mf-row pot">
        <span className="mf-icon">💰</span>
        <span className="mf-name">{t('lottoPot')}</span>
        {amount('+')}
        <Bills />
      </div>
    );

  return (
    <div className={`money-flash k-${payment.kind}`} role="status" aria-live="polite">
      <div className="mf-title">{title(payment)}</div>
      {fromRow}
      {toRow}
    </div>
  );
}
