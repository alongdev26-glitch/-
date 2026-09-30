import { useEffect, useRef, useState } from 'react';
import { FEE_ROUNDS } from '../data/board';
import { newGame } from '../engine/reducer';
import type { GameState, TokenId } from '../engine/types';
import { cleanCode, connect, newCode, roomRef, type Net, type Room, type Seat } from '../online/net';
import { RibbonBanner } from '../ui/RibbonBanner';
import { TOKENS, Token } from '../ui/Token';
import { Game } from './Game';
import './Setup.css';

const BOT_NAMES = ['הנרי', 'מרק', 'סופיה'];
const MAX = 4;

type View = 'loading' | 'unavailable' | 'profile' | 'join' | 'lobby';

/** Online play: pick a name and token, then create a room code or type a friend's code. */
export function Online({ onBack }: { onBack: () => void }) {
  const [net, setNet] = useState<Net | null>(null);
  const [view, setView] = useState<View>('loading');
  const [name, setName] = useState('');
  const [token, setToken] = useState<TokenId>('car');
  const [codeInput, setCodeInput] = useState('');
  const [code, setCode] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    connect().then((n) => {
      if (!live) return;
      setNet(n);
      setView(n ? 'profile' : 'unavailable');
    });
    return () => {
      live = false;
    };
  }, []);

  // one subscription per room code
  useEffect(() => {
    if (!net || !code) return;
    return roomRef(net, code).onSnapshot(
      (snap) => {
        if (!snap.exists) {
          setRoom(null);
          setError('החדר נסגר');
          setView('profile');
          setCode(null);
          return;
        }
        setRoom(snap.data() as unknown as Room);
      },
      () => setError('החיבור לחדר נותק. נסה להיכנס שוב עם הקוד.'),
    );
  }, [net, code]);

  const me = (): Seat => ({ uid: net!.uid, name: name.trim() || 'שחקן', token });

  const create = async () => {
    if (!net) return;
    setBusy(true);
    setError('');
    try {
      let c = newCode();
      for (let i = 0; i < 5 && (await roomRef(net, c).get()).exists; i++) c = newCode();
      const r: Room = {
        code: c,
        host: net.uid,
        status: 'lobby',
        seats: [me()],
        bots: 0,
        rules: { mortgage: true },
        state: null,
        createdAt: Date.now(),
      };
      await roomRef(net, c).set(r as unknown as Record<string, unknown>);
      setCode(c);
      setView('lobby');
    } catch {
      setError('לא הצלחתי ליצור חדר. בדוק שיש לך הרשאת עריכה בקישור ונסה שוב.');
    } finally {
      setBusy(false);
    }
  };

  const join = async () => {
    if (!net) return;
    const c = cleanCode(codeInput);
    if (c.length !== 4) return setError('הקוד הוא 4 אותיות באנגלית');
    setBusy(true);
    setError('');
    try {
      const ref = roomRef(net, c);
      await ref.acquire({ holder: net.uid, ttlMs: 5000 });
      const snap = await ref.get();
      if (!snap.exists) return setError('לא מצאתי חדר עם הקוד הזה');
      const r = snap.data() as unknown as Room;
      const mine = r.seats.find((s) => s.uid === net.uid);
      if (!mine) {
        if (r.status !== 'lobby') return setError('המשחק בחדר הזה כבר התחיל');
        if (r.seats.length + r.bots >= MAX) return setError('החדר מלא');
        const taken = new Set(r.seats.map((s) => s.token));
        const seat = me();
        if (taken.has(seat.token)) seat.token = TOKENS.find((t) => !taken.has(t.id))!.id;
        await ref.update({ seats: [...r.seats, seat] });
      }
      setCode(c);
      setView('lobby');
    } catch {
      setError('לא הצלחתי להיכנס לחדר. בדוק שיש לך הרשאת עריכה בקישור.');
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    if (net && code && room && room.status === 'lobby' && room.host !== net.uid) {
      await roomRef(net, code)
        .update({ seats: room.seats.filter((s) => s.uid !== net.uid) })
        .catch(() => {});
    }
    setCode(null);
    setRoom(null);
    setView('profile');
  };

  const setRoomField = (patch: Partial<Room>) => {
    if (net && code) roomRef(net, code).update(patch as Record<string, unknown>).catch(() => {});
  };

  const start = () => {
    if (!room || !net || !code) return;
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
  if (net && code && room?.status === 'playing' && room.state && room.seats.some((s) => s.uid === net.uid)) {
    return <OnlineGame net={net} code={code} room={room} onExit={leave} />;
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
          משחק בקוד עובד רק כשפותחים את המשחק מהקישור של Claude, מחוברים לחשבון, ועם הרשאת עריכה בקישור.
        </div>
      )}

      {(view === 'profile' || view === 'join') && (
        <div className="setup-pick">
          <label className="setup-field">
            השם שלך
            <input id="online-name" value={name} maxLength={12} placeholder="איך יקראו לך במשחק?" onChange={(e) => setName(e.target.value)} />
          </label>
          <div className="setup-grid">
            {TOKENS.map((t) => (
              <button
                key={t.id}
                className={`setup-tile${t.id === token ? ' selected' : ''}`}
                style={{ ['--tc' as string]: t.color }}
                onClick={() => setToken(t.id)}
              >
                <Token token={t.id} size="clamp(20px, 6vw, 40px)" />
                <span>{t.name}</span>
              </button>
            ))}
          </div>
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

      {view === 'lobby' && room && net && (
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
                {s.uid === net.uid ? ' (אתה)' : ''}
              </span>
            ))}
            {Array.from({ length: room.bots }, (_, i) => (
              <span key={`b${i}`}>🤖 {BOT_NAMES[i]}</span>
            ))}
          </div>
          {room.host === net.uid ? (
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
                    ? `כל ${FEE_ROUNDS} סבבים משלמים חצי ממחיר כל נכס. אפשר למשכן נכס ולקבל את מחירו המלא.`
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
          className="link"
          onClick={() => (view === 'lobby' ? leave() : view === 'join' ? setView('profile') : onBack())}
        >
          {view === 'lobby' ? 'צא מהחדר' : 'חזרה'}
        </button>
      </div>
    </div>
  );
}

/** Runs the shared game: everyone renders the room's state; whoever is acting writes the next state. */
function OnlineGame({ net, code, room, onExit }: { net: Net; code: string; room: Room; onExit: () => void }) {
  const pending = useRef(false);
  const latest = useRef(room);
  latest.current = room;
  const send = async (next: GameState) => {
    if (pending.current) return;
    pending.current = true;
    try {
      // a full replace: update() would merge the old phase object into the new one
      await roomRef(net, code).set({ ...latest.current, state: next } as unknown as Record<string, unknown>);
    } catch {
      /* a failed write leaves the shared state as it was; the player can act again */
    } finally {
      pending.current = false;
    }
  };
  return (
    <Game
      key={code}
      initial={room.state!}
      online={{ myUid: net.uid, isHost: room.host === net.uid, state: room.state!, send }}
      onExit={onExit}
      onNewGame={onExit}
    />
  );
}
