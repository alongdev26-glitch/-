import type { GameState } from '../engine/types';
import { ownedBy } from '../engine/rules';
import { Token } from './Token';
import './PlayerHud.css';

export function PlayerHud({ game }: { game: GameState }) {
  return (
    <div className="hud">
      {game.players.map((p) => {
        const active = p.id === game.current && game.phase.t !== 'gameover';
        return (
          <div key={p.id} className={`hud-card${active ? ' active' : ''}${p.bankrupt ? ' out' : ''}`}>
            <div className="hud-dome">
              <Token token={p.token} color={p.color} size="clamp(14px, 2.2vw, 30px)" />
              {p.inJail && <span className="hud-badge">⛓️</span>}
            </div>
            <div className="hud-ribbon" style={{ background: p.color }}>
              {p.name}
              {p.isBot ? ' 🤖' : ''}
            </div>
            <div className="hud-money">
              {p.bankrupt ? 'פשט רגל' : `ש"ח ${p.money}`}
              {!p.bankrupt && <small>{ownedBy(game, p.id).length} נכסים</small>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
