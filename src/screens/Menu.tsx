import logo from '../assets/logo.webp';
import { useEffect, useRef, useState } from 'react';
import { collectRewards, reportPending } from '../online/referral';
import { ShareButton } from '../ui/ShareButton';
import { REFERRAL_REWARD } from '../ui/shop';
import { useWallet } from '../ui/Cosmetics';
import { RibbonBanner } from '../ui/RibbonBanner';
import { SoundToggle } from '../ui/SoundToggle';
import { sfx } from '../ui/sound';
import { TOKENS, Token } from '../ui/Token';
import './Menu.css';

export function Menu({ onPlay, onResume, onShop }: { onPlay: () => void; onResume?: () => void; onShop?: () => void }) {
  const wallet = useWallet();
  // friends who joined from my link pay out here
  const [joined, setJoined] = useState(0);
  useEffect(() => {
    let live = true;
    reportPending().finally(() =>
      collectRewards().then((n) => {
        if (!live || !n) return;
        setJoined(n);
        sfx.buy();
        setTimeout(() => live && setJoined(0), 5000);
      }),
    );
    return () => {
      live = false;
    };
  }, []);
  // my characters, the one I play with first (at most 8 so the row stays tidy)
  const parade = TOKENS.filter((t) => wallet.owned.includes(t.id))
    .sort((a, b) => Number(b.id === wallet.char) - Number(a.id === wallet.char))
    .slice(0, 8);
  // browsers only allow sound after the first touch, so the jingle plays on it
  const played = useRef(false);
  const jingle = () => {
    if (played.current) return;
    played.current = true;
    sfx.intro();
  };
  return (
    <div className="menu" onPointerDown={jingle}>
      <SoundToggle className="menu-sound" />
      <div className="color-band top" aria-hidden="true" />
      <div className="color-band bottom" aria-hidden="true" />
      <div className="menu-banner">
        <RibbonBanner text="יוצאים לדרך!" />
      </div>
      <div className="menu-logo">
        <img className="menu-logo-img" src={logo} alt="Big Deal" />
        <div className="menu-plaque">ביג דיל</div>
        <p>משחק המסחר בנכסים: ירושלים, תל-אביב, חיפה ועוד</p>
      </div>
      {onShop && (
        <button className="menu-shop" onClick={onShop} aria-label="חנות">
          <span className="menu-shop-bag">🛍️</span>
          <span className="menu-shop-text">
            <b>חנות</b>
            <small>🪙 {wallet.coins}</small>
          </span>
        </button>
      )}
      {joined > 0 && (
        <div className="reward-pop" onClick={() => setJoined(0)}>
          🎉 {joined === 1 ? 'חבר הצטרף' : `${joined} חברים הצטרפו`} מהקישור שלך! +{joined * REFERRAL_REWARD} 🪙
        </div>
      )}
      <div className="menu-parade" aria-hidden="true">
        {parade.map((t, i) => (
          <span key={t.id} style={{ animationDelay: `${i * 0.15}s` }}>
            <Token token={t.id} size="clamp(22px, 6vw, 40px)" skin={wallet.skin} />
          </span>
        ))}
      </div>
      <div className="menu-actions">
        <button className="btn btn-red menu-play" onClick={onPlay}>
          שחק עכשיו
        </button>
        <ShareButton />
        {onResume && (
          <button className="btn btn-white" onClick={onResume}>
            המשך משחק שמור
          </button>
        )}
      </div>
    </div>
  );
}
