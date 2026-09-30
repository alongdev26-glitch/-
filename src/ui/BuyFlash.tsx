import { BOARD, GROUP_COLORS } from '../data/board';
import type { Announcement, GameState } from '../engine/types';
import { Token } from './Token';
import './BuyFlash.css';

const HEADLINE: Record<Announcement['kind'], string> = {
  buy: 'קנה נכס!',
  auction: 'זכה במכירה הפומבית!',
  house: 'בנה בית!',
  hotel: 'בנה מלון!',
  trade: 'עסקה נסגרה!',
};

/** A big banner in the player's color whenever someone buys a property or builds. */
export function BuyFlash({ game, a }: { game: GameState; a: Announcement }) {
  const p = game.players[a.player];
  if (a.kind === 'trade') return <TradeFlash game={game} a={a} />;
  const sp = BOARD[a.space!];
  const strip = sp.group ? GROUP_COLORS[sp.group] : '#333';
  const building = a.kind === 'house' || a.kind === 'hotel';
  return (
    <div className="buy-flash" role="status" aria-live="polite" style={{ ['--pc' as string]: p.color }}>
      <div className="bf-confetti" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <i key={i} style={{ left: `${(i * 7.3) % 100}%`, animationDelay: `${(i % 5) * 0.08}s` }} />
        ))}
      </div>
      <div className="bf-who">
        <Token token={p.token} color={p.color} size="40px" />
        <div>
          <div className="bf-name">{p.name}</div>
          <div className="bf-head">{HEADLINE[a.kind]}</div>
        </div>
        {building && <span className="bf-build">{a.kind === 'hotel' ? '🏨' : '🏠'}</span>}
      </div>
      <div className="bf-card">
        <div className="bf-strip" style={{ background: strip }}>
          {sp.city ?? ''}
        </div>
        <div className="bf-prop">{sp.name}</div>
        <div className="bf-price">ש"ח {a.price}</div>
      </div>
    </div>
  );
}

function TradeFlash({ game, a }: { game: GameState; a: Announcement }) {
  const p = game.players[a.player];
  const o = game.players[a.other!];
  return (
    <div className="buy-flash" role="status" aria-live="polite" style={{ ['--pc' as string]: p.color }}>
      <div className="bf-who bf-trade">
        <Token token={p.token} color={p.color} size="40px" />
        <span className="bf-shake">🤝</span>
        <Token token={o.token} color={o.color} size="40px" />
      </div>
      <div className="bf-head" style={{ textAlign: 'center' }}>
        {HEADLINE.trade}
      </div>
      <div className="bf-card">
        <div className="bf-detail">{a.detail}</div>
      </div>
    </div>
  );
}
