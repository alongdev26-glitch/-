import logo from '../assets/logo.webp';
import { useRef } from 'react';
import { SoundToggle } from '../ui/SoundToggle';
import { sfx } from '../ui/sound';
import { TOKENS, Token } from '../ui/Token';
import './Menu.css';

export function Menu({ onPlay, onResume }: { onPlay: () => void; onResume?: () => void }) {
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
      <div className="menu-logo">
        <img className="menu-logo-img" src={logo} alt="Big Deal" />
        <div className="menu-plaque">ביג דיל</div>
        <p>משחק המסחר בנכסים: ירושלים, תל-אביב, חיפה ועוד</p>
      </div>
      <div className="menu-parade" aria-hidden="true">
        {TOKENS.map((t, i) => (
          <span key={t.id} style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
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
