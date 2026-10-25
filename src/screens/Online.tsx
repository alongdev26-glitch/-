import { useEffect, useRef, useState, type ReactNode } from 'react';
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
import '../ui/Tier.css';
import { getLang, t, type Key } from '../i18n';
import { EDITIONS } from '../data/editions';
import { tokenName } from '../data/tokens';
import { getName } from '../ui/profile';
import { findMatch, slotsFor } from '../online/match';
import { STAKES, TIERS, skinOf, winPrize } from '../ui/shop';
import { useSkinPress } from '../ui/SkinPicker';
import { GemTransfer } from '../ui/GemTransfer';
import { ModeBadge } from '../ui/ModeIcons';

const MAX = MAX_SEATS;

type View = 'loading' | 'unavailable' | 'profile' | 'join' | 'lobby';

/** Online play: pick a name and token, then create a room code or type a friend's code. */
export function Online({ onBack, quick, onBotGame }: { onBack: () => void; quick?: boolean; onBotGame?: () => void }) {
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
  const skinPress = useSkinPress();
  const [stakeIdx, setStakeIdx] = useState<number | null>(null);

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

  const me = (): Seat => ({ uid: link!.uid, name: name.trim() || getName() || t('player'), token, gems: wallet.gems });

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

  if (quick) {
    if (view === 'loading') return <QuickShell onBack={onBack} text={t('connectingServer')} />;
    if (!link) return <QuickShell onBack={onBack} text={t('noOnline')} />;
    if (stakeIdx === null) return <StakePicker onBack={onBack} onPick={setStakeIdx} />;
    return <QuickMatch link={link} stakeIdx={stakeIdx} onBack={() => setStakeIdx(null)} onBotGame={onBotGame} />;
  }

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
      {skinPress.sheet}
      <div className="color-band top" aria-hidden="true" />
      <div className="setup-banner">
        <RibbonBanner text={titles[view]} />
      </div>

      {view === 'loading' && <div className="setup-summary">{t('connectingServer')}</div>}

      {view !== 'loading' && <LinkKind link={link} />}

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
                {...skinPress.bind(tk.id)}
                className={`setup-tile skin-hold${tk.id === token ? ' selected' : ''}`}
                style={{ ['--tc' as string]: tk.color }}
                onClick={() => setToken(tk.id)}
              >
                <Token token={tk.id} size="clamp(20px, 6vw, 40px)" skin={skinOf(wallet, tk.id)} />
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
                <ModeBadge kind="people" color="#7b3fe4" />
                <b>{t('createCode')}</b>
                <small>{t('createCodeNote')}</small>
              </button>
              <button className="choice" disabled={busy} onClick={() => setView('join')}>
                <ModeBadge kind="key" color="#1f6fe0" />
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
  // 💎 a diamond table: nobody pays to play; the game pays the winner the table's prize
  const stakeKey = `${code}:${room.createdAt}`;
  const stake = room.stake ?? 0;
  const [showGems, setShowGems] = useState(false);
  const [paid, setPaid] = useState(0);
  const phase = room.state?.phase;
  const over = !!stake && !!room.state && phase?.t === 'gameover';
  useEffect(() => {
    if (!over || !room.state || phase?.t !== 'gameover') return;
    const winner = room.state.players[phase.winner];
    const id = window.setTimeout(() => setShowGems(true), 2500);
    if (winner?.uid === link.uid && !winner.isBot) setPaid(winPrize(stakeKey, stake));
    return () => window.clearTimeout(id);
  }, [over]); // eslint-disable-line react-hooks/exhaustive-deps
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
      {link.kind !== 'claude' && (
        <div className={`net-status${connected ? ' on' : ''}`} role="status">
          {connected ? t('connected', { code }) : t('disconnected')}
        </div>
      )}
      {showGems && room.state && phase?.t === 'gameover' && !room.state.players[phase.winner].isBot && (
        <GemTransfer
          winner={room.state.players[phase.winner]}
          prize={stake}
          paid={paid}
          me={link.uid}
          onClose={() => setShowGems(false)}
        />
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

/** Which way we're connected: the server works from anywhere, direct only nearby. */
function LinkKind({ link }: { link: RoomLink | null }) {
  if (!link || link.kind === 'claude') return null;
  return <div className={`link-kind ${link.kind}`}>{link.kind === 'fire' ? t('viaServer') : t('viaDirect')}</div>;
}

function QuickShell({ onBack, text, children }: { onBack: () => void; text?: string; children?: ReactNode }) {
  return (
    <div className="setup">
      <div className="color-band top" aria-hidden="true" />
      <div className="setup-banner">
        <RibbonBanner text={t('quickMatch')} />
      </div>
      {text && <div className="setup-summary">{text}</div>}
      {children}
      <div className="setup-nav">
        <button className="btn-back" onClick={onBack}>
          {t('cancelSearch')}
        </button>
      </div>
    </div>
  );
}

const WAIT_S = 30;
/** a matched game that hasn't begun after this long is abandoned (guest) or started again (host) */
const START_WAIT_MS = 12_000;

/** Before a 1v1: pick a table. Both players put its entry on the table; the winner takes both. */
function StakePicker({ onBack, onPick }: { onBack: () => void; onPick: (i: number) => void }) {
  const wallet = useWallet();
  // the richest table I can sit at gets a ribbon
  const best = STAKES.reduce((b, n, i) => (wallet.gems >= n ? i : b), -1);
  return (
    <QuickShell onBack={onBack} text={t('pickStake')}>
      <div className="tier-balance">
        <span className="tier-balance-gem" aria-hidden="true">💎</span>
        <b>{wallet.gems.toLocaleString()}</b>
      </div>
      <div className="tier-list">
        {STAKES.map((n, i) => {
          const open = wallet.gems >= n;
          const [c1, c2, c3] = TIERS[i].c;
          return (
            <button
              key={n}
              className={`tier${open ? '' : ' locked'}${i === best ? ' best' : ''}${i === STAKES.length - 1 ? ' legend' : ''}`}
              style={{ ['--c1' as string]: c1, ['--c2' as string]: c2, ['--c3' as string]: c3 }}
              disabled={!open}
              onClick={() => onPick(i)}
            >
              {i === best && <span className="tier-ribbon">{t('recommended')}</span>}
              <span className="tier-medal" aria-hidden="true">
                {open ? TIERS[i].icon : '🔒'}
              </span>
              <span className="tier-text">
                <b>{t(`tier${i}` as Key)}</b>
                <small>{t('entry', { n: n.toLocaleString() })}</small>
              </span>
              <span className="tier-prize">
                {open ? (
                  <>
                    <small>🏆</small>
                    <b>+{n.toLocaleString()}</b>
                  </>
                ) : (
                  <>
                    <small>{t('missingGems')}</small>
                    <b>💎 {(n - wallet.gems).toLocaleString()}</b>
                  </>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </QuickShell>
  );
}

/** Characters spinning past in a window, like a roulette, while we look for someone. Only for show. */
function TokenReel() {
  const strip = [...TOKENS, TOKENS[0]];
  return (
    <span className="quick-reel" aria-hidden="true">
      <span className="quick-reel-strip" style={{ ['--n' as string]: TOKENS.length }}>
        {strip.map((tk, i) => (
          <span key={i} className="quick-reel-row">
            <Token token={tk.id} size="34px" />
          </span>
        ))}
      </span>
    </span>
  );
}

/** 1v1 with a random player: search the waiting spots, then play; after 30 seconds offer a bot. */
function QuickMatch({
  link,
  stakeIdx,
  onBack,
  onBotGame,
}: {
  link: RoomLink;
  stakeIdx: number;
  onBack: () => void;
  onBotGame?: () => void;
}) {
  const wallet = useWallet();
  const stake = STAKES[stakeIdx];
  const seat = useRef<Seat>({ uid: link.uid, name: getName() || t('player'), token: wallet.char, gems: wallet.gems });
  const [code, setCode] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState('');
  const [secs, setSecs] = useState(0);
  const [limit, setLimit] = useState(WAIT_S);
  const [attempt, setAttempt] = useState(0);
  const ctl = useRef<AbortController | null>(null);

  // search (again after an error)
  useEffect(() => {
    const c = new AbortController();
    ctl.current = c;
    findMatch(link, seat.current, c.signal, slotsFor(stakeIdx))
      .then((m) => setCode(m.code))
      .catch((e) => {
        if ((e as Error).name !== 'AbortError') setError(e instanceof Error ? e.message : t('somethingWrong'));
      });
    return () => c.abort();
  }, [link, attempt, stakeIdx]);

  // the waiting clock
  useEffect(() => {
    const id = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!code) return;
    return link.subscribe(code, setRoom, () => {
      // the other player left before the game began: look again
      setRoom(null);
      setCode(null);
      setAttempt((a) => a + 1);
    });
  }, [link, code]);

  // the host starts as soon as the second player sits down
  const started = useRef(false);
  const latestRoom = useRef(room);
  latestRoom.current = room;
  const [kick, setKick] = useState(0);
  useEffect(() => {
    if (!room || !code || started.current) return;
    if (room.host !== link.uid || room.status !== 'lobby' || room.seats.length < 2) return;
    started.current = true;
    // not cancelled when the room changes meanwhile: the start uses the latest room
    window.setTimeout(() => {
      const r = latestRoom.current;
      if (!r || r.status !== 'lobby' || r.host !== link.uid || r.seats.length < 2) {
        started.current = false;
        return;
      }
      const state = newGame(
        r.seats.map((s) => ({ uid: s.uid, name: s.name, token: s.token, isBot: false })),
        Math.random,
        r.rules,
        getLang(),
      );
      link.patch(code, r, { status: 'playing', state, stake });
    }, 1200);
  }, [room, code, link, stake, kick]);

  const quit = () => {
    ctl.current?.abort();
    if (code) link.leave(code, room);
  };

  // look again from scratch (leaving this spot)
  const again = () => {
    if (code) link.leave(code, room);
    started.current = false;
    setRoom(null);
    setCode(null);
    setAttempt((a) => a + 1);
  };
  // someone else took over this spot (I was away too long): look again
  useEffect(() => {
    if (code && room && room.status === 'lobby' && !room.seats.some((s) => s.uid === link.uid)) again();
  }); // eslint-disable-line react-hooks/exhaustive-deps
  // matched but the game doesn't begin: the host retries the start, a guest gives up and looks again
  const full = !!room && room.status === 'lobby' && room.seats.length >= 2;
  useEffect(() => {
    if (!full) return;
    const id = window.setTimeout(() => {
      if (room?.host === link.uid) {
        started.current = false;
        setKick((k) => k + 1);
      } else again();
    }, START_WAIT_MS);
    return () => window.clearTimeout(id);
  }, [full, room?.host, kick]); // eslint-disable-line react-hooks/exhaustive-deps

  if (code && room?.status === 'playing' && room.state && room.seats.some((s) => s.uid === link.uid)) {
    return <OnlineGame link={link} code={code} room={room} onExit={() => { quit(); onBack(); }} />;
  }

  const found = !!room && room.seats.length >= 2;
  const other = room?.seats.find((s) => s.uid !== link.uid);
  const nobody = !found && secs >= limit;
  return (
    <QuickShell
      onBack={() => {
        quit();
        onBack();
      }}
    >
      <div className="quick-card">
        <div className="quick-versus">
          <span className="quick-me">
            <Token token={seat.current.token} size="44px" skin={skinOf(wallet, seat.current.token)} />
            <b>{seat.current.name}</b>
          </span>
          <span className="quick-vs">VS</span>
          <span className={`quick-them${found ? '' : ' is-waiting'}`}>
            {other ? (
              <span className="quick-land">
                <Token token={other.token} size="44px" />
              </span>
            ) : (
              <TokenReel />
            )}
            <b>{other ? other.name : t('searching')}</b>
          </span>
        </div>
        <div className="quick-stake">{t('onTable', { n: stake.toLocaleString() })}</div>
        {found ? (
          <div className="quick-status">{t('foundOpponent')} ⚔️</div>
        ) : nobody ? (
          <>
            <div className="quick-status">{t('noOpponent')}</div>
            <div className="quick-actions">
              {onBotGame && (
                <button
                  className="btn btn-red"
                  onClick={() => {
                    quit();
                    onBotGame();
                  }}
                >
                  🤖 {t('playBotInstead')} <small>({t('botNoGems')})</small>
                </button>
              )}
              <button className="btn btn-white" onClick={() => setLimit(secs + WAIT_S)}>
                {t('keepSearching')}
              </button>
            </div>
          </>
        ) : (
          <div className="quick-status">
            <span className="quick-glass" aria-hidden="true">🔍</span> {t('searchingFor', { n: secs })}
          </div>
        )}
      </div>
      {error && <div className="setup-error">{error}</div>}
      <LinkKind link={link} />
    </QuickShell>
  );
}
