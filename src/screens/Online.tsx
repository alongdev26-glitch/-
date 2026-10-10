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
import { getLang, t } from '../i18n';
import { EDITIONS } from '../data/editions';
import { tokenName } from '../data/tokens';
import { getName } from '../ui/profile';

const MAX = MAX_SEATS;

type View = 'loading' | 'unavailable' | 'profile' | 'join' | 'lobby';

/** Online play: pick a name and token, then create a room code or type a friend's code. */
export function Online({ onBack }: { onBack: () => void }) {
  const [link, setLink] = useState<RoomLink | null>(null);
  const [resumable, setResumable] = useState<Room | null>(null);
  const [view, setView] = useState<View>('loading');
  const [name, setName] = useState(getName);
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

  const me = (): Seat => ({ uid: link!.uid, name: name.trim() || getName() || t('player'), token });

  const run = async (f: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await f();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('somethingWrong'));
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
    if (c.length !== 4) return setError(t('codeIs4'));
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
    const free = TOKENS.filter((tk) => !taken.has(tk.id));
    const state = newGame(
      [
        ...room.seats.map((s) => ({ uid: s.uid, name: s.name, token: s.token, isBot: false })),
        ...Array.from({ length: room.bots }, (_, i) => ({ name: EDITIONS[getLang()].bots[i], token: free[i].id, isBot: true })),
      ],
      Math.random,
      room.rules,
      // everyone plays the host's edition
      getLang(),
    );
    setRoomField({ status: 'playing', state });
  };

  // ---------- the game itself ----------
  if (link && code && room?.status === 'playing' && room.state && room.seats.some((s) => s.uid === link.uid)) {
    return <OnlineGame link={link} code={code} room={room} onExit={leave} />;
  }

  const titles: Record<View, string> = {
    loading: t('connecting'),
    unavailable: t('codeGame'),
    profile: t('codeGame'),
    join: t('enterCode'),
    lobby: t('lobby'),
  };

  return (
    <div className="setup">
      <div className="color-band top" aria-hidden="true" />
      <div className="setup-banner">
        <RibbonBanner text={titles[view]} />
      </div>

      {view === 'loading' && <div className="setup-summary">{t('connectingServer')}</div>}

      {view === 'unavailable' && (
        <div className="setup-summary">
          {t('noOnline')}
        </div>
      )}

      {(view === 'profile' || view === 'join') && (
        <div className="setup-pick">
          <label className="setup-field">
            {t('yourName')}
            <input id="online-name" value={name} maxLength={12} placeholder={t('namePh')} onChange={(e) => setName(e.target.value)} />
          </label>
          <div className="setup-grid">
            {TOKENS.filter((tk) => wallet.owned.includes(tk.id)).map((tk) => (
              <button
                key={tk.id}
                className={`setup-tile${tk.id === token ? ' selected' : ''}`}
                style={{ ['--tc' as string]: tk.color }}
                onClick={() => setToken(tk.id)}
              >
                <Token token={tk.id} size="clamp(20px, 6vw, 40px)" skin={wallet.skin} />
                <span>{tokenName(tk.id)}</span>
              </button>
            ))}
          </div>
          {view === 'profile' && resumable && (
            <button className="btn btn-gold" disabled={busy} onClick={resume}>
              {t('backToRoom', { code: resumable.code })}
            </button>
          )}
          {view === 'profile' ? (
            <div className="choices small">
              <button className="choice" disabled={busy} onClick={create}>
                <span className="choice-icon">✨</span>
                <b>{t('createCode')}</b>
                <small>{t('createCodeNote')}</small>
              </button>
              <button className="choice" disabled={busy} onClick={() => setView('join')}>
                <span className="choice-icon">🔑</span>
                <b>{t('enterCode')}</b>
                <small>{t('enterCodeNote')}</small>
              </button>
            </div>
          ) : (
            <div className="setup-field">
              {t('codeFromFriend')}
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
                {t('joinRoom')}
              </button>
            </div>
          )}
        </div>
      )}

      {view === 'lobby' && room && link && (
        <div className="setup-panel">
          <div className="room-code">
            <small>{t('roomCode')}</small>
            <b dir="ltr">{room.code}</b>
            <small>{t('sendCode')}</small>
          </div>
          <div className="lineup lobby-list">
            {room.seats.map((s) => (
              <span key={s.uid}>
                <Token token={s.token} size="22px" />
                {s.name}
                {s.uid === room.host ? ' 👑' : ''}
                {s.uid === link.uid ? t('youMark') : ''}
              </span>
            ))}
            {Array.from({ length: room.bots }, (_, i) => (
              <span key={`b${i}`}>🤖 {EDITIONS[getLang()].bots[i]}</span>
            ))}
          </div>
          {room.host === link.uid ? (
            <>
              <div className="setup-field">
                {t('addBotsQ')}
                <div className="seg">
                  {Array.from({ length: MAX - room.seats.length + 1 }, (_, i) => i).map((n) => (
                    <button key={n} className={n === room.bots ? 'on' : ''} onClick={() => setRoomField({ bots: n })}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="setup-field">
                {t('mortgageQ')}
                <div className="seg">
                  <button className={room.rules.mortgage ? 'on' : ''} onClick={() => setRoomField({ rules: { ...room.rules, mortgage: true } })}>
                    {t('yes')}
                  </button>
                  <button className={!room.rules.mortgage ? 'on' : ''} onClick={() => setRoomField({ rules: { ...room.rules, mortgage: false } })}>
                    {t('no')}
                  </button>
                </div>
                <small className="hint">
                  {room.rules.mortgage
                    ? t('mortgageYes', { n: FEE_ROUNDS })
                    : t('mortgageOff')}
                </small>
              </div>
              <button className="btn btn-red" disabled={room.seats.length + room.bots < 2} onClick={start}>
                {t('startGameN', { n: room.seats.length + room.bots })}
              </button>
            </>
          ) : (
            <div className="setup-summary">
              {t('waitingHost', { name: room.seats.find((s) => s.uid === room.host)?.name ?? t('host') })}
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
          {view === 'lobby' ? t('leaveRoom') : t('back')}
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
          {connected ? t('connected', { code }) : t('disconnected')}
        </div>
      )}
      {writeError && (
        <div className="write-error" role="alert">
          {link.kind === 'claude'
            ? t('noPermission')
            : t('moveNotSent')}
        </div>
      )}
    </>
  );
}
