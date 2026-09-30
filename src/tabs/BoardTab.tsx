import { BOARD, JAIL_FINE, isOwnable } from '../data/board';
import { rollDice } from '../engine/reducer';
import type { Action, GameState } from '../engine/types';
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
}

/** Page 1: the board, as large as the screen allows, with a floating action button. */
export function BoardTab({ game, shown, rolling, busy, myTurn, act, onSpace }: Props) {
  const me = game.players[game.current];
  const ph = game.phase;
  const ready = myTurn && !busy;

  let main: { label: string; action: Action } | null = null;
  if (ready && (ph.t === 'roll' || (ph.t === 'end' && game.again))) {
    main = { label: me.inJail ? 'נסה דאבל' : game.again ? 'הטל שוב' : 'הטל', action: { type: 'ROLL', dice: rollDice() } };
  } else if (ready && ph.t === 'end') {
    main = { label: 'סיים תור', action: { type: 'END_TURN' } };
  }

  return (
    <div className="tab-board">
      <div className="players-strip">
        {game.players.map((p) => (
          <div
            key={p.id}
            className={`pchip${p.id === game.current ? ' on' : ''}${p.bankrupt ? ' out' : ''}`}
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
      <Board
        game={game}
        shown={shown}
        onSpace={(id) => isOwnable(BOARD[id]) && onSpace(id)}
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
