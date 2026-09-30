import { useCallback, useEffect, useReducer, useState } from 'react';
import { BOARD } from '../data/board';
import { DECKS } from '../data/cards';
import { botAction } from '../engine/bot';
import { actor, reduce } from '../engine/reducer';
import type { Action, GameState } from '../engine/types';
import { BoardTab } from '../tabs/BoardTab';
import { MarketTab } from '../tabs/MarketTab';
import { MyPropsTab } from '../tabs/MyPropsTab';
import { ProfileTab } from '../tabs/ProfileTab';
import { Modal } from '../ui/Modal';
import { PropertyCard } from '../ui/PropertyCard';
import { Token } from '../ui/Token';
import { Winner } from './Winner';
import './Game.css';

/** Time per board space while a token walks: slow enough to follow on a phone. */
const STEP_MS = 340;
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
    if (!raw) return null;
    const g = JSON.parse(raw) as GameState;
    g.pot ??= 0;
    for (const st of g.props) if (st.mortgaged) st.mortgageLeft ??= 7;
    return g;
  } catch {
    return null;
  }
}

type Tab = 'board' | 'mine' | 'market' | 'profile';

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'board', icon: '🎲', label: 'לוח' },
  { id: 'mine', icon: '💼', label: 'הנכסים שלי' },
  { id: 'market', icon: '🏷️', label: 'נכסים פנויים' },
  { id: 'profile', icon: '👤', label: 'פרופיל' },
];

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
  const [tab, setTab] = useState<Tab>('board');

  const moving = shown.some((pos, i) => pos !== game.players[i].pos);
  const busy = rolling || moving;
  const me = game.players.find((p) => !p.isBot)!;
  const acting = actor(game);
  const myTurn = game.current === me.id && game.phase.t !== 'gameover';
  const myInput = acting === me.id && !busy;
  const cur = game.players[game.current];
  const needsBoard = myTurn && !busy && (game.phase.t === 'roll' || game.phase.t === 'end');

  const act = useCallback((a: Action) => {
    if (a.type === 'ROLL') {
      setRolling(true);
      setTimeout(() => setRolling(false), 900);
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
    const delay = game.phase.t === 'card' ? 1600 : game.phase.t === 'auction' ? 500 : 1000;
    const t = setTimeout(() => act(a), delay);
    return () => clearTimeout(t);
  }, [game, busy, act]);

  const ph = game.phase;

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
                  <button
                    key={n}
                    className="btn btn-red btn-sm"
                    disabled={step(n) > me.money}
                    onClick={() => act({ type: 'BID', amount: step(n) })}
                  >
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

  const phaseModal = () => {
    if (busy) return null;
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
              אין מספיק כסף. אפשר למשכן נכסים בעמוד "הנכסים שלי" ולחזור, או להוציא למכרז.
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
    if (ph.t === 'debt' && myTurn && tab !== 'mine') {
      const total = ph.owed.reduce((a, o) => a + o.amount, 0);
      return (
        <Modal title="חוב!">
          <div className="debt">
            <p>
              עליך לשלם <b>ש"ח {total}</b> אבל יש לך רק <b>ש"ח {me.money}</b>.
            </p>
            <p>מכור בתים או משכן נכסים בעמוד "הנכסים שלי".</p>
            <div className="modal-actions">
              <button className="btn btn-red" disabled={me.money < total} onClick={() => act({ type: 'PAY_DEBT' })}>
                שלם
              </button>
              <button className="btn btn-white" onClick={() => setTab('mine')}>
                לנכסים שלי
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
    <div className="game" dir="rtl">
      <nav className="tabbar" aria-label="עמודי המשחק">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab${tab === t.id ? ' on' : ''}${t.id === 'board' && needsBoard && tab !== 'board' ? ' ping' : ''}`}
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
          >
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
            {t.id === 'mine' && <span className="tab-sub">ש"ח {me.money}</span>}
            {t.id === 'market' && game.pot > 0 && <span className="tab-sub gold">קופה {game.pot}</span>}
          </button>
        ))}
      </nav>

      <main className="tab-page">
          <div className="turn-pill" style={{ borderColor: cur.color }} title={`התור של ${cur.name}`}>
            <Token token={cur.token} color={cur.color} size="18px" />
            <span>{cur.id === me.id ? 'התור שלך' : cur.name}</span>
          </div>
        {tab === 'board' && (
          <BoardTab game={game} shown={shown} rolling={rolling} busy={busy} myTurn={myTurn} act={act} onSpace={setInfo} />
        )}
        {tab === 'mine' && <MyPropsTab game={game} me={me.id} myTurn={myTurn && !busy} act={act} onSpace={setInfo} />}
        {tab === 'market' && <MarketTab game={game} onSpace={setInfo} />}
        {tab === 'profile' && <ProfileTab game={game} me={me.id} onExit={onExit} onNewGame={onNewGame} />}
        <div className="toast" key={game.log.length + game.log[0]}>
          {game.log[0]}
        </div>
      </main>

      {phaseModal()}
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
