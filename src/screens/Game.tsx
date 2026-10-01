import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { BOARD } from '../data/board';
import { DECKS } from '../data/cards';
import { tokenColor } from '../data/tokens';
import { botAction } from '../engine/bot';
import { actor, reduce } from '../engine/reducer';
import type { Action, Announcement, GameState, Payment } from '../engine/types';
import { MoneyFlash } from '../ui/MoneyFlash';
import { BuyFlash } from '../ui/BuyFlash';
import { BoardTab } from '../tabs/BoardTab';
import { MarketTab } from '../tabs/MarketTab';
import { MyPropsTab } from '../tabs/MyPropsTab';
import { ProfileTab } from '../tabs/ProfileTab';
import { TradeTab, type TradeDraft } from '../tabs/TradeTab';
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
    for (const p of g.players) p.color = tokenColor(p.token);
    g.rules ??= { mortgage: true };
    g.round ??= 1;
    g.feeStart ??= null;
    g.rollSeq ??= 0;
    g.payEvents ??= [];
    g.paySeq ??= 0;
    g.announce ??= null;
    g.announceSeq ??= 0;
    for (const p of g.players) p.owes ??= [];
    return g;
  } catch {
    return null;
  }
}

type Tab = 'board' | 'mine' | 'market' | 'trade' | 'profile';

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'board', icon: '🎲', label: 'לוח' },
  { id: 'mine', icon: '💼', label: 'הנכסים שלי' },
  { id: 'market', icon: '🏷️', label: 'נכסים פנויים' },
  { id: 'trade', icon: '🤝', label: 'העברות' },
  { id: 'profile', icon: '👤', label: 'פרופיל' },
];

/** An online game: the shared state comes from the room, and moves are sent back to it. */
export interface OnlineLink {
  myUid: string;
  isHost: boolean;
  state: GameState;
  send: (next: GameState) => void;
}

interface Props {
  initial: GameState;
  online?: OnlineLink;
  onExit: () => void;
  onNewGame: () => void;
}

export function Game({ initial, online, onExit, onNewGame }: Props) {
  const [localGame, dispatch] = useReducer(reduce, initial);
  const game = online ? online.state : localGame;
  const gameRef = useRef(game);
  gameRef.current = game;
  const onlineRef = useRef(online);
  onlineRef.current = online;
  const [shown, setShown] = useState(() => initial.players.map((p) => p.pos));
  const [rolling, setRolling] = useState(false);
  const [info, setInfo] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>('board');

  // The "viewer" is the real player the screens belong to: fixed online, handed around on one phone.
  const humans = game.players.filter((p) => !p.isBot);
  const mySeat = online ? game.players.findIndex((p) => p.uid === online.myUid) : -1;
  const firstViewer = initial.players[initial.current].isBot ? humans[0].id : initial.current;
  const [localViewer, setViewer] = useState(firstViewer);
  const viewer = online ? Math.max(0, mySeat) : localViewer;
  /** May this screen make the move for player `pid`? */
  const controls = (pid: number) =>
    online ? game.players[pid].uid === online.myUid && !game.players[pid].isBot : !game.players[pid].isBot;
  /** Online host only: a remote player's seat can be handed to the computer (and back). */
  const canTakeOver = (pid: number) => {
    const p = game.players[pid];
    return !!online?.isHost && !!p.uid && p.uid !== online.myUid && !p.bankrupt && game.phase.t !== 'gameover';
  };
  const setBot = (pid: number, isBot: boolean) => act({ type: 'SET_BOT', player: pid, isBot });

  // offer the takeover only after a remote player has been silent for a while
  const [stalled, setStalled] = useState(false);
  useEffect(() => {
    setStalled(false);
    if (!online?.isHost) return;
    const t = window.setTimeout(() => setStalled(true), 15000);
    return () => window.clearTimeout(t);
  }, [game, online?.isHost]);

  const moving = shown.some((pos, i) => pos !== game.players[i].pos);
  const busy = rolling || moving;
  const me = game.players[viewer];
  const acting = actor(game);
  const actingPlayer = game.players[acting];
  const cur = game.players[game.current];
  const handoff =
    !online && !busy && !actingPlayer.isBot && acting !== viewer && game.phase.t !== 'gameover';
  const [tradeDraft, setTradeDraft] = useState<TradeDraft | null>(null);
  const myTurn = game.current === viewer && controls(viewer) && game.phase.t !== 'gameover';
  const needsBoard = myTurn && !busy && (game.phase.t === 'roll' || game.phase.t === 'end');

  const act = useCallback((a: Action) => {
    const link = onlineRef.current;
    if (!link) return dispatch(a);
    const now = gameRef.current;
    const next = reduce(now, a);
    if (next !== now) link.send(next);
  }, []);

  // animate the dice on every roll, whoever rolled (rollSeq travels with the shared state)
  const lastRoll = useRef(game.rollSeq);
  const rollTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (game.rollSeq === lastRoll.current) return;
    lastRoll.current = game.rollSeq;
    setRolling(true);
    window.clearTimeout(rollTimer.current);
    rollTimer.current = window.setTimeout(() => setRolling(false), 900);
  }, [game.rollSeq]);

  // show each payment between players once the token has landed
  const lastPay = useRef(game.paySeq);
  const [payQueue, setPayQueue] = useState<{ payment: Payment; key: string }[]>([]);
  useEffect(() => {
    if (busy || game.paySeq === lastPay.current) return;
    lastPay.current = game.paySeq;
    const fresh = game.payEvents.map((payment, i) => ({ payment, key: `${game.paySeq}-${i}` }));
    if (fresh.length) setPayQueue((q) => [...q, ...fresh].slice(-6));
  }, [game.paySeq, game.payEvents, busy]);
  const flash = payQueue[0] ?? null;
  // big banner for purchases, auction wins and new buildings
  const lastAnnounce = useRef(game.announceSeq);
  const [banner, setBanner] = useState<{ a: Announcement; key: number } | null>(null);
  useEffect(() => {
    if (busy || game.announceSeq === lastAnnounce.current) return;
    lastAnnounce.current = game.announceSeq;
    if (game.announce) setBanner({ a: game.announce, key: game.announceSeq });
  }, [game.announceSeq, game.announce, busy]);
  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(null), 2400);
    return () => window.clearTimeout(t);
  }, [banner]);

  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setPayQueue((q) => q.slice(1)), 1850);
    return () => window.clearTimeout(t);
  }, [flash]);

  useEffect(() => {
    if (!online) saveGame(game);
  }, [game, online]);

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
    if (busy || (online && !online.isHost)) return;
    const a = botAction(game);
    if (!a) return;
    const delay = game.phase.t === 'card' ? 1600 : game.phase.t === 'auction' ? 500 : 1000;
    const t = setTimeout(() => act(a), delay);
    return () => clearTimeout(t);
  }, [game, busy, act, online]);

  const ph = game.phase;

  const auctionModal = () => {
    if (ph.t !== 'auction') return null;
    const bidder = ph.bidder !== null ? game.players[ph.bidder] : null;
    const step = (n: number) => ph.bid + n;
    const humanBids = controls(acting) && !busy;
    return (
      <Modal title={`מכירה פומבית: ${BOARD[ph.space].name}`}>
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
                .filter((p) => !p.bankrupt && p.id !== game.current)
                .map((p) => (
                  <span key={p.id} className={ph.active.includes(p.id) ? '' : 'passed'} style={{ borderColor: p.color }}>
                    {p.name}
                  </span>
                ))}
            </div>
            <div className="auction-seller">{cur.name} הוציא את הנכס למכירה ולא יכול להציע עליו</div>
            {humanBids ? (
              <div className="auction-btns">
                <div className="auction-turn">התור של {actingPlayer.name} להציע</div>
                {[5, 10, 25, 50, 100, 150, 200].map((n) => (
                  <button
                    key={n}
                    className="btn btn-red btn-sm"
                    disabled={step(n) > actingPlayer.money}
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
              <div className="waiting">
                {actingPlayer.name} {actingPlayer.isBot ? 'חושב...' : 'מחליט...'}
                {stalled && canTakeOver(acting) && !actingPlayer.isBot && (
                  <button className="btn btn-black btn-sm takeover" onClick={() => setBot(acting, true)}>
                    🤖 העבר לבוט
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
    );
  };

  const phaseModal = () => {
    if (busy) return null;
    if (handoff) {
      return (
        <Modal title="העבירו את הטלפון">
          <div className="handoff">
            <Token token={actingPlayer.token} color={actingPlayer.color} size="56px" />
            <b>{ph.t === 'trade' ? `הצעת עסקה ל${actingPlayer.name}` : `התור של ${actingPlayer.name}`}</b>
            <button className="btn btn-red" onClick={() => setViewer(acting)}>
              אני {actingPlayer.name}, בוא נשחק
            </button>
          </div>
        </Modal>
      );
    }
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
              למכירה פומבית
            </button>
          </div>
          {me.money < price && (
            <div className="modal-note">
              אין מספיק כסף. אפשר למשכן נכסים בעמוד "הנכסים שלי" ולחזור, או להוציא למכירה פומבית.
            </div>
          )}
        </Modal>
      );
    }
    if (ph.t === 'auction') return auctionModal();
    if (ph.t === 'trade') {
      const o = ph.offer;
      const from = game.players[o.from];
      const list = (t: typeof o.give) => {
        const parts = t.props.map((id) => BOARD[id].name);
        if (t.money > 0) parts.push(`ש"ח ${t.money}`);
        if (t.jailCards > 0) parts.push(`${t.jailCards} כרטיס יציאה מהכלא`);
        return parts.length ? parts : ['כלום'];
      };
      if (!controls(ph.awaiting)) {
        return (
          <div className="trade-wait" role="status">
            <Token token={actingPlayer.token} color={actingPlayer.color} size="20px" />
            {actingPlayer.name} חושב על ההצעה...
          </div>
        );
      }
      if (tab === 'trade' && tradeDraft?.counter) return null;
      return (
        <Modal title={o.round > 1 ? `הצעה נגדית מ${from.name}` : `הצעת עסקה מ${from.name}`}>
          <div className="trade-offer">
            <div className="to-col gain">
              <b>אתה מקבל</b>
              {list(o.give).map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
            <div className="to-col loss">
              <b>אתה נותן</b>
              {list(o.get).map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-red" onClick={() => act({ type: 'ACCEPT_TRADE' })}>
              אשר
            </button>
            <button className="btn btn-black" onClick={() => act({ type: 'REJECT_TRADE' })}>
              סרב
            </button>
            {o.round < 3 && (
              <button
                className="btn btn-white"
                onClick={() => {
                  setTradeDraft({ to: o.from, give: o.get, get: o.give, counter: true });
                  setTab('trade');
                }}
              >
                הצעה נגדית
              </button>
            )}
          </div>
        </Modal>
      );
    }
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
            {ph.resume === 'roll' && <p>נשאר לך חוב מהסבב הקודם. צריך לסגור אותו לפני שמטילים.</p>}
            <p>
              עליך לשלם <b>ש"ח {total}</b> ויש לך <b>ש"ח {me.money}</b>.
            </p>
            <p>בעמוד "הנכסים שלי" אפשר למכור בתים, למשכן, או למכור נכס לבנק בחצי ממחירו. המשחק לא ימכור ולא ימשכן כלום בשבילך.</p>
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
            <span>{cur.id === me.id ? (humans.length > 1 ? `התור שלך, ${me.name}` : 'התור שלך') : cur.name}</span>
          </div>
        {tab === 'board' && (
          <BoardTab game={game} shown={shown} rolling={rolling} busy={busy} myTurn={myTurn}
            act={act}
            onSpace={setInfo}
            onBuild={() => setTab('mine')}
            flash={flash?.payment ?? null}
            onTakeover={stalled && canTakeOver(game.current) && !cur.isBot ? () => setBot(game.current, true) : undefined}
          />
        )}
        {tab === 'mine' && <MyPropsTab game={game} me={me.id} myTurn={myTurn && !busy} act={act} onSpace={setInfo} />}
        {tab === 'market' && <MarketTab game={game} onSpace={setInfo} />}
        {tab === 'trade' && (
          <TradeTab
            game={game}
            me={me.id}
            canPropose={myTurn && !busy && (ph.t === 'roll' || ph.t === 'end')}
            act={act}
            draft={tradeDraft?.counter && ph.t === 'trade' && controls(ph.awaiting) ? tradeDraft : null}
            onSent={() => {
              setTradeDraft(null);
              setTab('board');
            }}
          />
        )}
        {tab === 'profile' && (
          <ProfileTab
            game={game}
            me={me.id}
            onExit={onExit}
            onNewGame={onNewGame}
            canTakeOver={canTakeOver}
            onSetBot={setBot}
          />
        )}
        <div className="toast" key={game.log.length + game.log[0]}>
          {game.log[0]}
        </div>
      </main>

      {banner ? (
        <BuyFlash key={`b${banner.key}`} game={game} a={banner.a} />
      ) : (
        flash && <MoneyFlash key={flash.key} game={game} payment={flash.payment} />
      )}
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
