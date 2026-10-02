import { BOARD, JAIL_FINE, isOwnable } from '../data/board';
import { rollDice } from '../engine/reducer';
import { canBuild, ownedBy } from '../engine/rules';
import type { Action, GameState, Payment } from '../engine/types';
import { Board } from '../ui/Board';
import { Dice } from '../ui/Dice';
import { Token } from '../ui/Token';
import './tabs.css';

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
  const me = game.players[game.current];
  const ph = game.phase;
  const ready = myTurn && !busy;
  const canBuildAny =
    ready && (ph.t === 'roll' || ph.t === 'end') && ownedBy(game, me.id).some((id) => canBuild(game, me.id, id));

  let main: { label: string; action: Action } | null = null;
  if (ready && (ph.t === 'roll' || (ph.t === 'end' && game.again))) {
    main = { label: me.inJail ? 'נסה דאבל' : game.again ? 'הטל שוב' : 'הטל', action: { type: 'ROLL', dice: rollDice() } };
  } else if (ready && ph.t === 'end') {
    main = { label: 'סיים תור', action: { type: 'END_TURN' } };
  }

  return (
    <div className={`tab-board${game.round === 1 ? ' r1' : ''}`}>
      <div className="players-strip">
        {game.players.map((p) => (
          <div
            key={p.id}
            className={`pchip${p.id === game.current ? ' on' : ''}${p.bankrupt ? ' out' : ''}${
              flash?.from === p.id ? ' paid' : flash?.to === p.id ? ' earned' : ''
            }`}
            style={{ ['--pc' as string]: p.color }}
          >
            <Token token={p.token} color={p.color} size="20px" />
            <span className="pchip-name">
              {p.name}
              {p.inJail ? ' ⛓️' : ''}
            </span>
            <b className="pchip-money">{p.bankrupt ? 'פשט רגל' : `ש"ח ${p.money}`}</b>
          </div>
        ))}
      </div>
      {game.round === 1 && <div className="round-one">🚫 סבב ראשון: עוד אי אפשר לקנות נכסים</div>}
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
              <Dice dice={game.dice} rolling={rolling} />
            </div>
            <div className="board-fab">
              {main ? (
                <button className="fab" onClick={() => act(main.action)}>
                  {main.label}
                </button>
              ) : (
                <div className="fab fab-wait">{busy ? '...' : `${me.name} משחק`}</div>
              )}
              {!main && !busy && onTakeover && (
                <button className="btn btn-black btn-sm" onClick={onTakeover}>
                  🤖 העבר לבוט
                </button>
              )}
              {canBuildAny && (
                <button className="btn btn-gold btn-sm" onClick={onBuild}>
                  🏠 בנה בתים
                </button>
              )}
              {ready && ph.t === 'roll' && me.inJail && (
                <div className="fab-extra">
                  <button className="btn btn-gold btn-sm" disabled={me.money < JAIL_FINE} onClick={() => act({ type: 'PAY_JAIL' })}>
                    שלם {JAIL_FINE} וצא
                  </button>
                  {me.jailCards.length > 0 && (
                    <button className="btn btn-gold btn-sm" onClick={() => act({ type: 'USE_JAIL_CARD' })}>
                      כרטיס יציאה
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        }
      />
    </div>
  );
}
