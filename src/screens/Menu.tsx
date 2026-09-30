import { RibbonBanner } from '../ui/RibbonBanner';
import './Menu.css';

export function Menu({ onPlay, onResume }: { onPlay: () => void; onResume?: () => void }) {
  return (
    <div className="menu">
      <div className="menu-banner">
        <RibbonBanner text="יוצאים לדרך!" />
      </div>
      <div className="menu-logo">
        <span className="menu-mascot">🎩</span>
        <div className="menu-plaque">טייקון</div>
        <p>משחק המסחר בנכסים — ירושלים, תל-אביב, חיפה ועוד</p>
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
