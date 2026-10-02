import logo from '../assets/logo.webp';
import { RibbonBanner } from '../ui/RibbonBanner';
import { TOKENS, Token } from '../ui/Token';
import './Menu.css';

export function Menu({ onPlay, onResume }: { onPlay: () => void; onResume?: () => void }) {
  return (
    <div className="menu">
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
      <div className="menu-parade" aria-hidden="true">
        {TOKENS.map((t, i) => (
          <span key={t.id} style={{ animationDelay: `${i * 0.15}s` }}>
            <Token token={t.id} size="clamp(22px, 6vw, 40px)" />
          </span>
        ))}
      </div>
      <div className="menu-actions">
        <button className="btn btn-red menu-play" onClick={onPlay}>
          שחק עכשיו
        </button>
        {onResume && (
          <button className="btn btn-white" onClick={onResume}>
            המשך משחק שמור
          </button>
        )}
      </div>
    </div>
  );
}
