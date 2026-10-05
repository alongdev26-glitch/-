import { useState } from 'react';
import { netWorth, ownedBy } from '../engine/rules';
import type { GameState } from '../engine/types';
import { Token } from '../ui/Token';
import { tokenName } from '../data/tokens';
import { SoundToggle } from '../ui/SoundToggle';
import './tabs.css';
import { locale, t } from '../i18n';
import { money } from '../data/editions';

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
      <h2 className="page-title">{t('tabProfile')}</h2>
      <SoundToggle className="btn btn-white" label />
      <div className="profile-card">
        <Token token={p.token} color={p.color} size="44px" />
        <div>
          <h3>{p.name}</h3>
          <div>{t('yourToken', { name: tokenName(p.token) })}</div>
          {p.inJail && <div>{t('inJail')}</div>}
        </div>
        <div className="profile-stats">
          <div className="stat">
            <small>{t('cash')}</small>
            <b>{money(p.money)}</b>
          </div>
          <div className="stat">
            <small>{t('netWorth')}</small>
            <b>{money(netWorth(game, me))}</b>
          </div>
          <div className="stat">
            <small>{t('properties')}</small>
            <b>{ownedBy(game, me).length}</b>
          </div>
          <div className="stat">
            <small>{t('turnNo')}</small>
            <b>{game.turn}</b>
          </div>
        </div>
      </div>

      <section className="group">
        <div className="group-head" style={{ background: 'var(--navy)' }}>
          <span>{t('ranking')}</span>
        </div>
        {ranking.map((o, i) => (
          <div className={`player-row${o.bankrupt ? ' out' : ''}`} key={o.id}>
            <b>{i + 1}.</b>
            <Token token={o.token} color={o.color} size="22px" />
            <span>
              {o.name}
              {o.isBot ? ' 🤖' : o.id === me ? t('youMark') : ''}
              {o.inJail ? ' ⛓️' : ''}
              {o.bankrupt ? ` · ${t('wentBankrupt')}` : ''}
            </span>
            <span className="money">{o.bankrupt ? '—' : t('moneyWorth', { money: money(o.money), worth: netWorth(game, o.id) })}</span>
            {canTakeOver?.(o.id) && (
              <button className="btn btn-white btn-sm" onClick={() => onSetBot?.(o.id, !o.isBot)}>
                {o.isBot ? t('backToHuman') : t('toBotShort')}
              </button>
            )}
          </div>
        ))}
      </section>

      {p.bankrupt && game.phase.t !== 'gameover' && (
        <div className="resign-note">{t('youAreOut')}</div>
      )}

      {confirm ? (
        <div className={`confirm${confirm === 'resign' ? ' confirm-resign' : ''}`}>
          <span>
            {confirm === 'exit'
              ? t('confirmExit')
              : confirm === 'new'
                ? t('confirmNew')
                : t('confirmResign')}
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
            {confirm === 'exit' ? t('yesExit') : confirm === 'new' ? t('yesNew') : t('yesResign')}
          </button>
          <button className="btn btn-white btn-sm" onClick={() => setConfirm(null)}>
            {t('cancel')}
          </button>
        </div>
      ) : (
        <>
          <div className="profile-actions">
            <button className="btn btn-black" onClick={() => setConfirm('exit')}>
              {t('exitGame')}
            </button>
            <button className="btn btn-white" onClick={() => setConfirm('new')}>
              {t('newGame')}
            </button>
          </div>
          {onResign && !p.bankrupt && game.phase.t !== 'gameover' && (
            <div className="resign-wrap">
              <button className="btn-resign" disabled={!canResign} onClick={() => setConfirm('resign')}>
                {t('resignBtn')}
              </button>
              <small>
                {canResign
                  ? t('resignNote')
                  : t('resignLater')}
              </small>
            </div>
          )}
        </>
      )}
      <div className="version">
        {t('version')}: {new Date(__BUILD__).toLocaleString(locale(), { dateStyle: 'short', timeStyle: 'short' })}
      </div>
    </div>
  );
}
