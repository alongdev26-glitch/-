import { useCallback, useEffect, useReducer, useState } from 'react';
import { BOARD, JAIL_FINE, isOwnable } from '../data/board';
import { DECKS } from '../data/cards';
import { botAction } from '../engine/bot';
import { actor, reduce, rollDice } from '../engine/reducer';
import {
  canBuild,
  canMortgage,
  canSell,
  canUnmortgage,
  mortgageValue,
  ownedBy,
  sellValue,
  unmortgageCost,
} from '../engine/rules';
import type { Action, GameState } from '../engine/types';
import { Board } from '../ui/Board';
import { Dice } from '../ui/Dice';
import { Modal } from '../ui/Modal';
import { PlayerHud } from '../ui/PlayerHud';
import { PropertyCard } from '../ui/PropertyCard';
import { RibbonBanner } from '../ui/RibbonBanner';
import { Winner } from './Winner';
import './Game.css';

const STEP_MS = 130;
const SAVE_KEY = 'tycoon-save';

export function saveGame(g: GameState | null) {
  try {
    if (g && g.phase.t !== 'gameover') localStorage.setItem(SAVE_KEY, JSON.stringify(g));
    else localStorage.removeItem(SAVE_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? (JSON.parse(raw) as GameState) : null;
  } catch {
    return null;
  }
}

function bannerText(g: GameState): string {
  switch (g.phase.t) {
    case 'roll':
      return 'הטל!';
    case 'buy':
      return 'קנה!';
    case 'auction':
      return 'מכרז!';
    case 'card':
      return g.phase.deck === 'chance' ? 'הפתעה!' : 'תיבת המזל!';
    case 'debt':
      return 'חוב!';
    case 'end':
      return g.again ? 'דאבל!' : 'תכנן!';
    case 'gameover':
      return 'ניצחון!';
  }
}

interface Props {
  initial: GameState;
  onExit: () => void;
  onNewGame: () => void;
}

export function Game({ initial, onExit, onNewGame }: Props) {
  const [game, dispatch] = useReducer(reduce, initial);
  const [shown, setShown] = useState(() => initial.players.map((p) => p.pos));
  const [rolling, setRolling] = useState(false);
  const [info, setInfo] = useState<number | null>(null);
  const [managing, setManaging] = useState(false);

  const moving = shown.some((pos, i) => pos !== game.players[i].pos);
  const busy = rolling || moving;
  const me = game.players.find((p) => !p.isBot)!;
  const acting = actor(game);
  const myTurn = game.current === me.id && game.phase.t !== 'gameover';
  const myInput = acting === me.id && !busy;
  const cur = game.players[game.current];

  const act = useCallback((a: Action) => {
    if (a.type === 'ROLL') {
      setRolling(true);
      setTimeout(() => setRolling(false), 650);
    }
    dispatch(a);
  }, []);

  useEffect(() => saveGame(game), [game]);

  // walk tokens one space at a time
  useEffect(() => {
    if (rolling || !moving) return;
    const t = setTimeout(
      () =>
        setShown((sh) =>
          sh.map((pos, i) => {
            const target = game.players[i].pos;
            if (pos === target) return pos;
            return (target - pos + 40) % 40 <= 12 ? (pos + 1) % 40 : target;
          }),
        ),
      STEP_MS,
    );
    return () => clearTimeout(t);
  }, [shown, game, rolling, moving]);

  // computer players
  useEffect(() => {
    if (busy) return;
    const a = botAction(game);
    if (!a) return;
    const delay = game.phase.t === 'card' ? 1600 : game.phase.t === 'auction' ? 500 : 800;
    const t = setTimeout(() => act(a), delay);
    return () => clearTimeout(t);
  }, [game, busy, act]);

  const ph = game.phase;
  const debtTotal = ph.t === 'debt' ? ph.owed.reduce((a, o) => a + o.amount, 0) : 0;

  const controls = () => {
    if (!myTurn || busy) {
      return <div className="waiting">{busy ? '...' : `${cur.name} משחק...`}</div>;
    }
    const manageBtn = (
      <button className="btn btn-white btn-sm" onClick={() => setManaging(true)} disabled={ownedBy(game, me.id).length === 0}>
        נהל נכסים
      </button>
    );
    if (ph.t === 'roll') {
      return (
        <>
          <button className="btn btn-red big" onClick={() => act({ type: 'ROLL', dice: rollDice() })}>
            {me.inJail ? 'נסה דאבל' : 'הטל קוביות'}
          </button>
          {me.inJail && (
            <button className="btn btn-gold btn-sm" disabled={me.money < JAIL_FINE} onClick={() => act({ type: 'PAY_JAIL' })}>
              שלם ש"ח {JAIL_FINE} וצא
            </button>
          )}
          {me.inJail && me.jailCards.length > 0 && (
            <button className="btn btn-gold btn-sm" onClick={() => act({ type: 'USE_JAIL_CARD' })}>
              השתמש בכרטיס יציאה
            </button>
          )}
          {manageBtn}
        </>
      );
    }
    if (ph.t === 'end') {
      return (
        <>
          {game.again ? (
            <button className="btn btn-red big" onClick={() => act({ type: 'ROLL', dice: rollDice() })}>
              הטל שוב
            </button>
          ) : (
            <button className="btn btn-red big" onClick={() => act({ type: 'END_TURN' })}>
              סיים תור
            </button>
          )}
          {manageBtn}
        </>
      );
    }
    return null;
  };

  const auctionModal = () => {
    if (ph.t !== 'auction') return null;
    const bidder = ph.bidder !== null ? game.players[ph.bidder] : null;
    const inIt = ph.active.includes(me.id);
    const step = (n: number) => ph.bid + n;
    return (
      <Modal title={`מכרז: ${BOARD[ph.space].name}`}>
        <div className="auction">
          <PropertyCard id={ph.space} />
          <div className="auction-side">
            <div className="auction-bid">
              <small>הצעה נוכחית</small>
              <b>ש"ח {ph.bid}</b>
              <span>{bidder ? bidder.name : 'אין הצעות'}</span>
            </div>
            <div className="auction-list">
              {game.players
                .filter((p) => !p.bankrupt)
                .map((p) => (
                  <span key={p.id} className={ph.active.includes(p.id) ? '' : 'passed'} style={{ borderColor: p.color }}>
                    {p.name}
                  </span>
                ))}
            </div>
            {myInput && inIt ? (
              <div className="auction-btns">
                {[10, 50, 100].map((n) => (
                  <button key={n} className="btn btn-red btn-sm" disabled={step(n) > me.money} onClick={() => act({ type: 'BID', amount: step(n) })}>
                    +{n}
                  </button>
                ))}
                <button className="btn btn-black btn-sm" onClick={() => act({ type: 'PASS' })}>
                  פרוש
                </button>
              </div>
            ) : (
              <div className="waiting">{inIt ? `${game.players[acting].name} חושב...` : 'פרשת מהמכרז'}</div>
            )}
          </div>
        </div>
      </Modal>
    );
  };

  const manageModal = () => {
    if (!managing || !myTurn) return null;
    const mine = ownedBy(game, me.id);
    return (
      <Modal title="הנכסים שלי" onClose={() => setManaging(false)}>
        <div className="manage-money">מזומן: ש"ח {me.money}</div>
        <div className="manage-list">
          {mine.map((id) => {
            const sp = BOARD[id];
            const st = game.props[id];
            return (
              <div className="manage-row" key={id}>
                <span className="manage-name">
                  <i style={{ background: sp.group ? `var(--g-${sp.group})` : '#999' }} />
                  {sp.name}
                  {st.houses > 0 && <em>{st.houses === 5 ? ' 🏨' : ` 🏠×${st.houses}`}</em>}
                  {st.mortgaged && <em> (ממושכן)</em>}
                </span>
                <span className="manage-btns">
                  {sp.kind === 'property' && (
                    <>
                      <button className="btn btn-red btn-sm" disabled={!canBuild(game, me.id, id)} onClick={() => act({ type: 'BUILD', space: id })}>
                        בנה {sp.houseCost}
                      </button>
                      <button className="btn btn-white btn-sm" disabled={!canSell(game, me.id, id)} onClick={() => act({ type: 'SELL', space: id })}>
                        מכור +{sellValue(id)}
                      </button>
                    </>
                  )}
                  {st.mortgaged ? (
                    <button className="btn btn-gold btn-sm" disabled={!canUnmortgage(game, me.id, id)} onClick={() => act({ type: 'UNMORTGAGE', space: id })}>
                      פדה {unmortgageCost(id)}
                    </button>
                  ) : (
                    <button className="btn btn-black btn-sm" disabled={!canMortgage(game, me.id, id)} onClick={() => act({ type: 'MORTGAGE', space: id })}>
                      משכן +{mortgageValue(id)}
                    </button>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </Modal>
    );
  };

  const phaseModal = () => {
    if (busy || managing) return null;
    if (ph.t === 'buy' && myTurn) {
      const price = BOARD[ph.space].price!;
      return (
        <Modal title="נכס פנוי!">
          <PropertyCard id={ph.space} />
          <div className="modal-actions">
            <button className="btn btn-red" disabled={me.money < price} onClick={() => act({ type: 'BUY' })}>
              קנה ב-ש"ח {price}
            </button>
            <button className="btn btn-black" onClick={() => act({ type: 'DECLINE' })}>
              למכרז
            </button>
          </div>
          {me.money < price && (
            <div className="modal-note">
              אין מספיק כסף.{' '}
              <button className="link" onClick={() => setManaging(true)}>
                נהל נכסים
              </button>
            </div>
          )}
        </Modal>
      );
    }
    if (ph.t === 'auction') return auctionModal();
    if (ph.t === 'card') {
      const card = DECKS[ph.deck][ph.card];
      return (
        <Modal tone="blue">
          <div className="card-pop">
            <div className="card-deck">{ph.deck === 'chance' ? '? הפתעה' : '🧰 תיבת המזל'}</div>
            <div className="card-who">{cur.name} שלף כרטיס:</div>
            <div className="card-text">{card.text}</div>
            {myTurn && (
              <button className="btn btn-red" onClick={() => act({ type: 'ACK_CARD' })}>
                אישור
              </button>
            )}
          </div>
        </Modal>
      );
    }
    if (ph.t === 'debt' && myTurn) {
      return (
        <Modal title="חוב!">
          <div className="debt">
            <p>
              עליך לשלם <b>ש"ח {debtTotal}</b> אבל יש לך רק <b>ש"ח {me.money}</b>.
            </p>
            <p>מכור בתים או משכן נכסים כדי לגייס כסף.</p>
            <div className="modal-actions">
              <button className="btn btn-red" disabled={me.money < debtTotal} onClick={() => act({ type: 'PAY_DEBT' })}>
                שלם
              </button>
              <button className="btn btn-white" onClick={() => setManaging(true)}>
                נהל נכסים
              </button>
              <button className="btn btn-black" onClick={() => act({ type: 'BANKRUPT' })}>
                פשיטת רגל
              </button>
            </div>
          </div>
        </Modal>
      );
    }
    return null;
  };

  return (
    <div className="game">
      <aside className="game-left" dir="rtl">
        <PlayerHud game={game} />
      </aside>

      <main className="game-board">
        <Board
          game={game}
          shown={shown}
          onSpace={(id) => isOwnable(BOARD[id]) && setInfo(id)}
          center={
            <div className="board-dice">
              <Dice dice={game.dice} rolling={rolling} />
            </div>
          }
        />
      </main>

      <aside className="game-right" dir="rtl">
        <RibbonBanner text={bannerText(game)} sub={`התור של ${cur.name}`} />
        <div className="controls">{controls()}</div>
        <ul className="log">
          {game.log.slice(0, 8).map((l, i) => (
            <li key={game.log.length - i}>{l}</li>
          ))}
        </ul>
        <button className="btn btn-white btn-sm exit" onClick={onExit}>
          ☰ תפריט
        </button>
      </aside>

      {phaseModal()}
      {manageModal()}
      {info !== null && (
        <Modal onClose={() => setInfo(null)}>
          <PropertyCard
            id={info}
            ownerName={game.props[info].owner !== null ? game.players[game.props[info].owner!].name : undefined}
          />
        </Modal>
      )}
      {ph.t === 'gameover' && !busy && <Winner game={game} onNewGame={onNewGame} onMenu={onExit} />}
    </div>
  );
}
