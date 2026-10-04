import { useEffect, useRef, useState } from 'react';
import { FEE_ROUNDS } from '../data/board';
import { newGame } from '../engine/reducer';
import type { GameState, TokenId } from '../engine/types';
import { MAX_SEATS, openLink, savedHostRoom, type RoomLink } from '../online/link';
import { cleanCode, type Room, type Seat } from '../online/net';
import { RibbonBanner } from '../ui/RibbonBanner';
import { TOKENS, Token } from '../ui/Token';
import { useWallet } from '../ui/Cosmetics';
import { Game } from './Game';
import './Setup.css';

const BOT_NAMES = ['הנרי', 'מרק', 'סופיה'];
const MAX = MAX_SEATS;

type View = 'loading' | 'unavailable' | 'profile' | 'join' | 'lobby';

/** Online play: pick a name and token, then create a room code or type a friend's code. */
export function Online({ onBack }: { onBack: () => void }) {
  const [link, setLink] = useState<RoomLink | null>(null);
  const [resumable, setResumable] = useState<Room | null>(null);
  const [view, setView] = useState<View>('loading');
  const [name, setName] = useState('');
  const [token, setToken] = useState<TokenId>('car');
  const wallet = useWallet();
  const [codeInput, setCodeInput] = useState('');
  const [code, setCode] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    openLink().then((l) => {
      if (!live) return;
      setLink(l);
      setView(l ? 'profile' : 'unavailable');
      if (l?.kind === 'peer') setResumable(savedHostRoom());
    });
    return () => {
      live = false;
    };
  }, []);

  // one subscription per room code
  useEffect(() => {
    if (!link || !code) return;
    return link.subscribe(code, setRoom, (msg) => {
      setRoom(null);
      setError(msg);
      setView('profile');
      setCode(null);
    });
  }, [link, code]);

  const me = (): Seat => ({ uid: link!.uid, name: name.trim() || 'שחקן', token });

  const run = async (f: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await f();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'משהו השתבש, נסה שוב');
    } finally {
      setBusy(false);
    }
  };

  const create = () =>
    run(async () => {
      if (!link) return;
      const c = await link.create(me());
      setCode(c);
      setView('lobby');
    });

  const join = () => {
    const c = cleanCode(codeInput);
    if (c.length !== 4) return setError('הקוד הוא 4 אותיות באנגלית');
    return run(async () => {
      if (!link) return;
      await link.join(c, me());
      setCode(c);
      setView('lobby');
    });
  };

  const resume = () =>
    run(async () => {
      if (!link || !resumable || link.kind !== 'peer') return;
      await (link as RoomLink & { resume(r: Room): Promise<void> }).resume(resumable);
      setCode(resumable.code);
      setView('lobby');
    });

  const leave = () => {
    if (link && code) link.leave(code, room);
    setCode(null);
    setRoom(null);
    setResumable(null);
    setView('profile');
  };

  const setRoomField = (patch: Partial<Room>) => {
    if (link && code && room) link.patch(code, room, patch);
  };

  const start = () => {
    if (!room || !link || !code) return;
    const taken = new Set(room.seats.map((s) => s.token));
    const free = TOKENS.filter((t) => !taken.has(t.id));
    const state = newGame(
      [
        ...room.seats.map((s) => ({ uid: s.uid, name: s.name, token: s.token, isBot: false })),
        ...Array.from({ length: room.bots }, (_, i) => ({ name: BOT_NAMES[i], token: free[i].id, isBot: true })),
      ],
      Math.random,
      room.rules,
    );
    setRoomField({ status: 'playing', state });
  };

  // ---------- the game itself ----------
  if (link && code && room?.status === 'playing' && room.state && room.seats.some((s) => s.uid === link.uid)) {
    return <OnlineGame link={link} code={code} room={room} onExit={leave} />;
  }

  const titles: Record<View, string> = {
    loading: 'מתחבר...',
    unavailable: 'משחק בקוד',
    profile: 'משחק בקוד',
    join: 'רשום קוד',
    lobby: 'לובי',
  };

  return (
    <div className="setup">
      <div className="color-band top" aria-hidden="true" />
      <div className="setup-banner">
        <RibbonBanner text={titles[view]} />
      </div>

      {view === 'loading' && <div className="setup-summary">מתחבר לשרת המשחק...</div>}

      {view === 'unavailable' && (
        <div className="setup-summary">
          הדפדפן הזה לא תומך במשחק אונליין. נסה לפתוח את המשחק בכרום.
        </div>
      )}

      {(view === 'profile' || view === 'join') && (
        <div className="setup-pick">
          <label className="setup-field">
            השם שלך
            <input id="online-name" value={name} maxLength={12} placeholder="איך יקראו לך במשחק?" onChange={(e) => setName(e.target.value)} />
          </label>
          <div className="setup-grid">
            {TOKENS.filter((t) => wallet.owned.includes(t.id)).map((t) => (
              <button
                key={t.id}
                className={`setup-tile${t.id === token ? ' selected' : ''}`}
                style={{ ['--tc' as string]: t.color }}
                onClick={() => setToken(t.id)}
              >
                <Token token={t.id} size="clamp(20px, 6vw, 40px)" skin={wallet.skin} />
                <span>{t.name}</span>
              </button>
            ))}
          </div>
          {view === 'profile' && resumable && (
            <button className="btn btn-gold" disabled={busy} onClick={resume}>
              ↩️ חזור לחדר {resumable.code}
            </button>
          )}
          {view === 'profile' ? (
            <div className="choices small">
              <button className="choice" disabled={busy} onClick={create}>
                <span className="choice-icon">✨</span>
                <b>צור קוד</b>
                <small>פותח חדר חדש ומקבל קוד לחברים</small>
              </button>
              <button className="choice" disabled={busy} onClick={() => setView('join')}>
                <span className="choice-icon">🔑</span>
                <b>רשום קוד</b>
                <small>נכנס לחדר של חבר</small>
              </button>
            </div>
          ) : (
            <div className="setup-field">
              הקוד שקיבלת מחבר
              <input
                id="join-code"
                className="code-input"
                dir="ltr"
                inputMode="text"
                autoCapitalize="characters"
                value={codeInput}
                placeholder="ABCD"
                onChange={(e) => setCodeInput(cleanCode(e.target.value))}
              />
              <button className="btn btn-red" disabled={busy || codeInput.length !== 4} onClick={join}>
                כנס לחדר
              </button>
            </div>
          )}
        </div>
      )}

      {view === 'lobby' && room && link && (
        <div className="setup-panel">
          <div className="room-code">
            <small>קוד החדר</small>
            <b dir="ltr">{room.code}</b>
            <small>שלח את הקוד לחברים. הם בוחרים "רשום קוד" ומקלידים אותו.</small>
          </div>
          <div className="lineup lobby-list">
            {room.seats.map((s) => (
              <span key={s.uid}>
                <Token token={s.token} size="22px" />
                {s.name}
                {s.uid === room.host ? ' 👑' : ''}
                {s.uid === link.uid ? ' (אתה)' : ''}
              </span>
            ))}
            {Array.from({ length: room.bots }, (_, i) => (
              <span key={`b${i}`}>🤖 {BOT_NAMES[i]}</span>
            ))}
          </div>
          {room.host === link.uid ? (
            <>
              <div className="setup-field">
                להוסיף בוטים?
                <div className="seg">
                  {Array.from({ length: MAX - room.seats.length + 1 }, (_, i) => i).map((n) => (
                    <button key={n} className={n === room.bots ? 'on' : ''} onClick={() => setRoomField({ bots: n })}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="setup-field">
                לשחק עם משכנתא?
                <div className="seg">
                  <button className={room.rules.mortgage ? 'on' : ''} onClick={() => setRoomField({ rules: { mortgage: true } })}>
                    כן
                  </button>
                  <button className={!room.rules.mortgage ? 'on' : ''} onClick={() => setRoomField({ rules: { mortgage: false } })}>
                    לא
                  </button>
                </div>
                <small className="hint">
                  {room.rules.mortgage
                    ? `כל ${FEE_ROUNDS} סבבים משלמים חצי ממחיר כל נכס לקופת הלוטו.`
                    : 'בלי תשלומי משכנתא ובלי משכון.'}
                </small>
              </div>
              <button className="btn btn-red" disabled={room.seats.length + room.bots < 2} onClick={start}>
                התחל משחק ({room.seats.length + room.bots} שחקנים)
              </button>
            </>
          ) : (
            <div className="setup-summary">
              ממתינים ש-{room.seats.find((s) => s.uid === room.host)?.name ?? 'המארח'} יתחיל את המשחק...
            </div>
          )}
        </div>
      )}

      {error && <div className="setup-error">{error}</div>}

      <div className="setup-nav">
        <button
          className="btn-back"
          onClick={() => (view === 'lobby' ? leave() : view === 'join' ? setView('profile') : onBack())}
        >
          {view === 'lobby' ? 'צא מהחדר' : 'חזרה'}
        </button>
      </div>
    </div>
  );
}

/** Runs the shared game: everyone renders the room's state; whoever is acting sends the next state. */
function OnlineGame({ link, code, room, onExit }: { link: RoomLink; code: string; room: Room; onExit: () => void }) {
  const pending = useRef(false);
  const [writeError, setWriteError] = useState(false);
  const [connected, setConnected] = useState(true);
  useEffect(() => link.onStatus(setConnected), [link]);
  const latest = useRef(room);
  latest.current = room;
  const send = async (next: GameState) => {
    if (pending.current) return;
    pending.current = true;
    try {
      await link.sendState(code, latest.current, next);
      setWriteError(false);
    } catch {
      // the shared state stays as it was
      setWriteError(true);
    } finally {
      pending.current = false;
    }
  };
  return (
    <>
      <Game
        key={code}
        initial={room.state!}
        online={{ myUid: link.uid, isHost: room.host === link.uid, state: room.state!, send }}
        onExit={onExit}
        onNewGame={onExit}
      />
      {link.kind === 'peer' && (
        <div className={`net-status${connected ? ' on' : ''}`} role="status">
          {connected ? `🟢 מחובר · ${code}` : '🔴 מנותק, מתחבר מחדש…'}
        </div>
      )}
      {writeError && (
        <div className="write-error" role="alert">
          {link.kind === 'claude'
            ? 'אין לך הרשאה לשמור מהלכים. בקש מבעל המשחק להזמין אותך כעורך (Editor) בתפריט Share.'
            : 'המהלך לא נשלח – אין חיבור למארח. מתחבר מחדש…'}
        </div>
      )}
    </>
  );
}
