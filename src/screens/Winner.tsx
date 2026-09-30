import type { GameState } from '../engine/types';
import { netWorth } from '../engine/rules';
import { Token } from '../ui/Token';
import './Winner.css';

const BILL_COLORS = ['#fff4a3', '#ffc1dc', '#b8f2c2', '#d9c2ff', '#bfe3ff', '#ffd9a8'];

export function Winner({ game, onNewGame, onMenu }: { game: GameState; onNewGame: () => void; onMenu: () => void }) {
  if (game.phase.t !== 'gameover') return null;
  const w = game.players[game.phase.winner];
  return (
    <div className="winner">
      <div className="spot" />
      <div className="podium">
        <Token token={w.token} color={w.color} size="clamp(40px, 7vw, 90px)" />
      </div>
      <div className="win-band">{w.name} ניצח!</div>
      <div className="win-worth">שווי סופי: ש"ח {netWorth(game, w.id)}</div>
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
            ש"ח
          </span>
        ))}
      </div>
      <div className="modal-actions">
        <button className="btn btn-red" onClick={onNewGame}>
          משחק חדש
        </button>
        <button className="btn btn-white" onClick={onMenu}>
          לתפריט
        </button>
      </div>
    </div>
  );
}
