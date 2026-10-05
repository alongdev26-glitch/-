import { useState } from 'react';
import { netWorth, ownedBy } from '../engine/rules';
import type { GameState } from '../engine/types';
import { Token, TOKENS } from '../ui/Token';
import { SoundToggle } from '../ui/SoundToggle';
import './tabs.css';

interface Props {
  game: GameState;
  me: number;
  onExit: () => void;
  onNewGame: () => void;
  /** online host: which seats may be handed to the computer */
  canTakeOver?: (pid: number) => boolean;
  onSetBot?: (pid: number, isBot: boolean) => void;
  /** give up and leave the game ("פשיטת רגל") */
  onResign?: () => void;
  canResign?: boolean;
}

/** Page 4: my profile, the other players, and leaving the game. */
export function ProfileTab({ game, me, onExit, onNewGame, canTakeOver, onSetBot, onResign, canResign }: Props) {
  const [confirm, setConfirm] = useState<'exit' | 'new' | 'resign' | null>(null);
  const p = game.players[me];
  const ranking = [...game.players].sort((a, b) => netWorth(game, b.id) - netWorth(game, a.id));

  return (
    <div className="page">
      <h2 className="page-title">פרופיל</h2>
      <SoundToggle className="btn btn-white" label />
      <div className="profile-card">
        <Token token={p.token} color={p.color} size="44px" />
        <div>
          <h3>{p.name}</h3>
          <div>הכלי שלך: {TOKENS.find((t) => t.id === p.token)!.name}</div>
          {p.inJail && <div>⛓️ אתה בכלא</div>}
        </div>
        <div className="profile-stats">
          <div className="stat">
            <small>מזומן</small>
            <b>ש"ח {p.money}</b>
          </div>
          <div className="stat">
            <small>שווי כולל</small>
            <b>ש"ח {netWorth(game, me)}</b>
          </div>
          <div className="stat">
            <small>נכסים</small>
            <b>{ownedBy(game, me).length}</b>
          </div>
          <div className="stat">
            <small>תור מספר</small>
            <b>{game.turn}</b>
          </div>
        </div>
      </div>

      <section className="group">
        <div className="group-head" style={{ background: 'var(--navy)' }}>
          <span>דירוג השחקנים (לפי שווי)</span>
        </div>
        {ranking.map((o, i) => (
          <div className={`player-row${o.bankrupt ? ' out' : ''}`} key={o.id}>
            <b>{i + 1}.</b>
            <Token token={o.token} color={o.color} size="22px" />
            <span>
              {o.name}
              {o.isBot ? ' 🤖' : o.id === me ? ' (אתה)' : ''}
              {o.inJail ? ' ⛓️' : ''}
              {o.bankrupt ? ' · פשט רגל' : ''}
            </span>
            <span className="money">{o.bankrupt ? '—' : `ש"ח ${o.money} · שווי ${netWorth(game, o.id)}`}</span>
            {canTakeOver?.(o.id) && (
              <button className="btn btn-white btn-sm" onClick={() => onSetBot?.(o.id, !o.isBot)}>
                {o.isBot ? 'החזר לשחקן' : '🤖 לבוט'}
              </button>
            )}
          </div>
        ))}
      </section>

      {p.bankrupt && game.phase.t !== 'gameover' && (
        <div className="resign-note">🏳️ יצאת מהמשחק – אתה צופה בשאר השחקנים</div>
      )}

      {confirm ? (
        <div className={`confirm${confirm === 'resign' ? ' confirm-resign' : ''}`}>
          <span>
            {confirm === 'exit'
              ? 'לצאת לתפריט? המשחק נשמר ותוכל להמשיך אותו אחר כך.'
              : confirm === 'new'
                ? 'להתחיל משחק חדש? המשחק הנוכחי יימחק.'
                : 'לפשוט רגל ולצאת מהמשחק? כל הנכסים שלך יחזרו לבנק והמשחק ימשיך בלעדיך. אי אפשר לבטל.'}
          </span>
          <button
            className="btn btn-red btn-sm"
            onClick={() => {
              if (confirm === 'resign') {
                setConfirm(null);
                onResign?.();
              } else (confirm === 'exit' ? onExit : onNewGame)();
            }}
          >
            {confirm === 'exit' ? 'כן, צא' : confirm === 'new' ? 'כן, משחק חדש' : 'כן, פשטתי רגל'}
          </button>
          <button className="btn btn-white btn-sm" onClick={() => setConfirm(null)}>
            ביטול
          </button>
        </div>
      ) : (
        <>
          <div className="profile-actions">
            <button className="btn btn-black" onClick={() => setConfirm('exit')}>
              צא מהמשחק
            </button>
            <button className="btn btn-white" onClick={() => setConfirm('new')}>
              משחק חדש
            </button>
          </div>
          {onResign && !p.bankrupt && game.phase.t !== 'gameover' && (
            <div className="resign-wrap">
              <button className="btn-resign" disabled={!canResign} onClick={() => setConfirm('resign')}>
                🏳️ פשיטת רגל
              </button>
              <small>
                {canResign
                  ? 'יוצאים מהמשחק והנכסים חוזרים לבנק. המשחק ממשיך בלעדיך.'
                  : 'אפשר לפשוט רגל אחרי שהמכירה הפומבית או העסקה תיגמר'}
              </small>
            </div>
          )}
        </>
      )}
      <div className="version">
        גרסה: {new Date(__BUILD__).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}
      </div>
    </div>
  );
}
