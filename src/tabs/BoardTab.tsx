import { lazy, Suspense, useEffect, useState } from 'react';
import { SoundToggle } from '../ui/SoundToggle';
import { onView3dChange, setView3d, view3dOn } from '../ui/view3d';
import { BOARD, JAIL_FINE, isOwnable } from '../data/board';
import { rollDice } from '../engine/reducer';
import { canBuild, ownedBy } from '../engine/rules';
import type { Action, GameState, Payment } from '../engine/types';
import { Board } from '../ui/Board';
import { Dice } from '../ui/Dice';
import { Token } from '../ui/Token';
import { useCosmetics } from '../ui/Cosmetics';
import './tabs.css';
import { t } from '../i18n';
import { money } from '../data/editions';

// three.js only loads when someone turns the 3D board on
const Stage3D = lazy(() => import('../ui/Board3D'));

interface Props {
  game: GameState;
  shown: number[];
  rolling: boolean;
  busy: boolean;
  myTurn: boolean;
  act: (a: Action) => void;
  onSpace: (id: number) => void;
  onBuild: () => void;
  /** online host: take over a remote player who stopped responding */
  onTakeover?: () => void;
  /** a payment being shown right now: the payer's and owner's chips pulse */
  flash?: Payment | null;
}

/** Page 1: the board, as large as the screen allows, with a floating action button. */
export function BoardTab({ game, shown, rolling, busy, myTurn, act, onSpace, onBuild, onTakeover, flash }: Props) {
  const { skinFor } = useCosmetics();
  const [is3d, set3d] = useState(view3dOn);
  useEffect(() => onView3dChange(set3d), []);
  const me = game.players[game.current];
  const ph = game.phase;
  const ready = myTurn && !busy;
  const canBuildAny =
    ready && (ph.t === 'roll' || ph.t === 'end') && ownedBy(game, me.id).some((id) => canBuild(game, me.id, id));

  let main: { label: string; action: Action } | null = null;
  if (ready && (ph.t === 'roll' || (ph.t === 'end' && game.again))) {
    main = { label: me.inJail ? t('tryDouble') : game.again ? t('rollAgain') : t('roll'), action: { type: 'ROLL', dice: rollDice() } };
  } else if (ready && ph.t === 'end') {
    main = { label: t('endTurn'), action: { type: 'END_TURN' } };
  }

  const board = (
    <Board
      game={game}
      shown={shown}
      onSpace={(id) => isOwnable(BOARD[id]) && onSpace(id)}
      highlight={
        flash && flash.space !== null
          ? {
              space: flash.space,
              tone: flash.from === null || flash.kind === 'lotto' ? 'gain' : 'loss',
              badge:
                flash.kind === 'go' || flash.kind === 'go-land'
                  ? `+${flash.amount}`
                  : flash.kind === 'tax'
                    ? `−${flash.amount}`
                    : undefined,
            }
          : null
      }
      center={
        <>
          <div className="board-dice">
            <Dice dice={game.dice} rolling={rolling} showSum={game.rollSeq > 0} />
          </div>
          <div className="board-fab">
            {main ? (
              <button className="fab" onClick={() => act(main.action)}>
                {main.label}
              </button>
            ) : (
              <div className="fab fab-wait">{busy ? '...' : t('plays', { name: me.name })}</div>
            )}
            {!main && !busy && onTakeover && (
              <button className="btn btn-black btn-sm" onClick={onTakeover}>
                {t('toBot')}
              </button>
            )}
            {canBuildAny && (
              <button className="btn btn-gold btn-sm" onClick={onBuild}>
                {t('buildHouses')}
              </button>
            )}
            {ready && ph.t === 'roll' && me.inJail && (
              <div className="fab-extra">
                <button className="btn btn-gold btn-sm" disabled={me.money < JAIL_FINE} onClick={() => act({ type: 'PAY_JAIL' })}>
                  {t('payFineOut', { n: money(JAIL_FINE) })}
                </button>
                {me.jailCards.length > 0 && (
                  <button className="btn btn-gold btn-sm" onClick={() => act({ type: 'USE_JAIL_CARD' })}>
                    {t('jailCard')}
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      }
    />
  );

  return (
    <div className={`tab-board${!me.lapped ? ' r1' : ''}`}>
      <div className="players-strip">
        {game.players.map((p) => (
          <div
            key={p.id}
            className={`pchip${p.id === game.current ? ' on' : ''}${p.bankrupt ? ' out' : ''}${
              flash?.from === p.id ? ' paid' : flash?.to === p.id ? ' earned' : ''
            }`}
            style={{ ['--pc' as string]: p.color }}
          >
            <Token token={p.token} color={p.color} size="20px" skin={skinFor(p.id)} />
            <span className="pchip-name">
              {p.name}
              {p.inJail ? ' ⛓️' : ''}
            </span>
            <b className="pchip-money">{p.bankrupt ? t('wentBankrupt') : money(p.money)}</b>
          </div>
        ))}
      </div>
      <SoundToggle className="board-sound" />
      <button className="board-3d" aria-pressed={is3d} onClick={() => setView3d(!is3d)}>
        {is3d ? '2D' : '3D'}
      </button>
      {!me.lapped && !me.bankrupt && (
        <div className="round-one">{t('firstLap', { name: me.name, go: BOARD[0].name })}</div>
      )}
      {is3d ? (
        <Suspense fallback={board}>
          <Stage3D game={game} shown={shown}>
            {board}
          </Stage3D>
        </Suspense>
      ) : (
        board
      )}
    </div>
  );
}
