import type { GameState } from '../engine/types';
import { netWorth } from '../engine/rules';
import { Token } from '../ui/Token';
import './Winner.css';
import { t } from '../i18n';
import { edition, money } from '../data/editions';

const BILL_COLORS = ['#fff4a3', '#ffc1dc', '#b8f2c2', '#d9c2ff', '#bfe3ff', '#ffd9a8'];

export function Winner({
  game,
  onNewGame,
  onMenu,
  earned = 0,
}: {
  game: GameState;
  onNewGame: () => void;
  onMenu: () => void;
  earned?: number;
}) {
  if (game.phase.t !== 'gameover') return null;
  const w = game.players[game.phase.winner];
  return (
    <div className="winner">
      <div className="spot" />
      <div className="podium">
        <Token token={w.token} color={w.color} size="clamp(40px, 7vw, 90px)" />
      </div>
      <div className="win-band">{t('winnerIs', { name: w.name })}</div>
      {game.endedBy === 'rounds' && <div className="win-worth">{t('winByRounds', { n: game.rules.maxRounds ?? 0 })}</div>}
      <div className="win-worth">{t('finalWorth', { worth: money(netWorth(game, w.id)) })}</div>
      {earned > 0 && <div className="win-coins">{t('gotCoins', { n: earned })}</div>}
      <div className="bills">
        {Array.from({ length: 28 }, (_, i) => (
          <span
            key={i}
            style={{
              left: `${(i * 37) % 100}%`,
              background: BILL_COLORS[i % BILL_COLORS.length],
              animationDelay: `${(i % 7) * 0.35}s`,
              animationDuration: `${2.6 + (i % 5) * 0.4}s`,
            }}
          >
            {edition().symbol}
          </span>
        ))}
      </div>
      <div className="modal-actions">
        <button className="btn btn-red" onClick={onNewGame}>
          {t('newGame')}
        </button>
        <button className="btn btn-white" onClick={onMenu}>
          {t('toMenu')}
        </button>
      </div>
    </div>
  );
}
