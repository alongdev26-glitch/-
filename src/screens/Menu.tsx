import logo from '../assets/logo.webp';
import { useEffect, useRef, useState } from 'react';
import { collectRewards, reportPending } from '../online/referral';
import { ShareButton } from '../ui/ShareButton';
import { REFERRAL_REWARD } from '../ui/shop';
import { useWallet } from '../ui/Cosmetics';
import { SoundToggle } from '../ui/SoundToggle';
import { sfx } from '../ui/sound';
import { Token } from '../ui/Token';
import { tokenName } from '../data/tokens';
import { getName } from '../ui/profile';
import './Menu.css';
import { t, type Key } from '../i18n';

export type PlayMode = 'bots' | 'people' | 'online';

const MODES: { id: PlayMode; icon: string; name: Key; note: Key }[] = [
  { id: 'bots', icon: '🤖', name: 'vsComputer', note: 'vsComputerNote' },
  { id: 'people', icon: '👫', name: 'samePhone', note: 'samePhoneNote' },
  { id: 'online', icon: '🌐', name: 'withCode', note: 'withCodeNote' },
];
const MODE_KEY = 'dealcity-mode';
function savedMode(): PlayMode {
  try {
    const m = localStorage.getItem(MODE_KEY);
    return MODES.some((x) => x.id === m) ? (m as PlayMode) : 'bots';
  } catch {
    return 'bots';
  }
}

/** The lobby: my character in the middle, the mode picker and a big play button at the bottom. */
export function Menu({
  onPlay,
  onResume,
  onShop,
  onSettings,
}: {
  onPlay: (mode: PlayMode) => void;
  onResume?: () => void;
  onShop?: () => void;
  onSettings?: () => void;
}) {
  const wallet = useWallet();
  const [mode, setModeState] = useState<PlayMode>(savedMode);
  const [picking, setPicking] = useState(false);
  const setMode = (m: PlayMode) => {
    setModeState(m);
    setPicking(false);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      /* storage off */
    }
  };
  const cur = MODES.find((m) => m.id === mode)!;
  // friends who joined from my link pay out here
  const [joined, setJoined] = useState(0);
  useEffect(() => {
    let live = true;
    const check = () =>
      reportPending().finally(() =>
        collectRewards().then((n) => {
          if (!live || !n) return;
          setJoined(n);
          sfx.buy();
          setTimeout(() => live && setJoined(0), 6000);
        }),
      );
    check();
    // check again when coming back to the app (after sharing) and every little while on the menu
    const onShow = () => document.visibilityState === 'visible' && check();
    document.addEventListener('visibilitychange', onShow);
    window.addEventListener('focus', onShow);
    const timer = setInterval(check, 20_000);
    return () => {
      live = false;
      document.removeEventListener('visibilitychange', onShow);
      window.removeEventListener('focus', onShow);
      clearInterval(timer);
    };
  }, []);
  // browsers only allow sound after the first touch, so the jingle plays on it
  const played = useRef(false);
  const jingle = () => {
    if (played.current) return;
    played.current = true;
    sfx.intro();
  };
  return (
    <div className="lobby" onPointerDown={jingle}>
      <div className="lobby-rays" aria-hidden="true" />
      <div className="color-band top" aria-hidden="true" />
      <div className="color-band bottom" aria-hidden="true" />

      {/* top bar */}
      <button className="lobby-player" onClick={onSettings}>
        <Token token={wallet.char} size="var(--avatar)" skin={wallet.skin} />
        <b>{getName() || t('playerN', { n: 1 })}</b>
      </button>
      <img className="lobby-logo" src={logo} alt={t('appName')} />
      <div className="lobby-top-end">
        <button className="lobby-coins" onClick={onShop} aria-label={t('shop')}>
          <span>🪙</span>
          <b>{wallet.coins}</b>
          <i>+</i>
        </button>
        <SoundToggle className="lobby-round" />
        {onSettings && (
          <button className="lobby-round" onClick={onSettings} aria-label={t('settings')}>
            ⚙️
          </button>
        )}
      </div>

      {/* my character on a stage */}
      <button className="lobby-hero" onClick={onShop} aria-label={tokenName(wallet.char)}>
        <span className="lobby-glow" aria-hidden="true" />
        <span className="lobby-stage" aria-hidden="true" />
        <span className="lobby-char">
          <Token token={wallet.char} size="var(--hero)" skin={wallet.skin} />
        </span>
        <span className="lobby-name">{tokenName(wallet.char)}</span>
      </button>

      {/* bottom: shop and sharing, the mode, play */}
      <div className="lobby-bottom-start">
        {onShop && (
          <button className="lobby-tile" onClick={onShop}>
            <span className="lobby-tile-icon">🛍️</span>
            <b>{t('shop')}</b>
          </button>
        )}
        <ShareButton className="lobby-share" />
      </div>

      <button className="lobby-mode" onClick={() => setPicking(true)}>
        <span className="lobby-mode-icon">{cur.icon}</span>
        <span className="lobby-mode-text">
          <small>{t('chooseMode')}</small>
          <b>{t(cur.name)}</b>
          <em>{t(cur.note)}</em>
        </span>
        <span className="lobby-mode-more" aria-hidden="true">
          ▾
        </span>
      </button>

      <div className="lobby-bottom-end">
        {onResume && (
          <button className="lobby-resume" onClick={onResume}>
            ▶ {t('resumeGame')}
          </button>
        )}
        <button className="lobby-play" onClick={() => onPlay(mode)}>
          {t('playNow')}
        </button>
      </div>

      {picking && (
        <div className="lobby-sheet" onClick={() => setPicking(false)}>
          <div className="lobby-sheet-card" onClick={(e) => e.stopPropagation()}>
            <h2>{t('chooseMode')}</h2>
            <div className="lobby-sheet-modes">
              {MODES.map((m) => (
                <button key={m.id} className={`choice${m.id === mode ? ' on' : ''}`} onClick={() => setMode(m.id)}>
                  <span className="choice-icon">{m.icon}</span>
                  <b>{t(m.name)}</b>
                  <small>{t(m.note)}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {joined > 0 && (
        <div className="reward-pop" onClick={() => setJoined(0)}>
          {t('friendJoined', { n: joined, coins: joined * REFERRAL_REWARD })}
        </div>
      )}
    </div>
  );
}
