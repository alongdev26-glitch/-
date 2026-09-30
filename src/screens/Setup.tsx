import { useState } from 'react';
import type { PlayerSetup, TokenId } from '../engine/types';
import { RibbonBanner } from '../ui/RibbonBanner';
import { TOKENS, Token } from '../ui/Token';
import './Setup.css';

const BOT_NAMES = ['הנרי', 'מרק', 'סופיה', "ג'וזי"];

export function Setup({ onStart, onBack }: { onStart: (p: PlayerSetup[]) => void; onBack: () => void }) {
  const [token, setToken] = useState<TokenId>('car');
  const [bots, setBots] = useState(3);
  const [name, setName] = useState('אני');
  const [botNames, setBotNames] = useState(BOT_NAMES.slice(0, 3));

  const start = () => {
    const others = TOKENS.filter((t) => t.id !== token);
    onStart([
      { name: name.trim() || 'אני', token, isBot: false },
      ...Array.from({ length: bots }, (_, i) => ({ name: botNames[i].trim() || BOT_NAMES[i], token: others[i].id, isBot: true })),
    ]);
  };

  return (
    <div className="setup">
      <div className="color-band top" aria-hidden="true" />
      <div className="setup-banner">
        <RibbonBanner text="בחר כלי!" />
      </div>
      <div className="setup-grid">
        {TOKENS.map((t) => (
          <button
            key={t.id}
            className={`setup-tile${t.id === token ? ' selected' : ''}`}
            style={{ ['--tc' as string]: t.color }}
            onClick={() => setToken(t.id)}
          >
            <Token token={t.id} size="clamp(22px, 4vw, 48px)" />
            <span>{t.name}</span>
          </button>
        ))}
      </div>
      <div className="setup-side">
        <div className="setup-preview">
          <Token token={token} size="clamp(34px, 7vw, 100px)" />
        </div>
        <label className="setup-field">
          השם שלך
          <input id="player-name" value={name} maxLength={12} onChange={(e) => setName(e.target.value)} />
        </label>
        <div className="setup-field">
          שחקני מחשב
          <div className="seg">
            {[1, 2, 3].map((n) => (
              <button key={n} className={n === bots ? 'on' : ''} onClick={() => setBots(n)}>
                {n}
              </button>
            ))}
          </div>
          <div className="bot-names">
            {botNames.slice(0, bots).map((n, i) => (
              <input
                key={i}
                id={`bot-${i}`}
                aria-label={`שם שחקן מחשב ${i + 1}`}
                value={n}
                maxLength={10}
                onChange={(e) => setBotNames((b) => b.map((x, j) => (j === i ? e.target.value : x)))}
              />
            ))}
          </div>
        </div>
        <button className="btn btn-red" onClick={start}>
          בחר ושחק
        </button>
        <button className="link" onClick={onBack}>
          חזרה
        </button>
      </div>
    </div>
  );
}
