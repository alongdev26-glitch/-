import { useState } from 'react';
import { FEE_ROUNDS } from '../data/board';
import type { GameRules, PlayerSetup, TokenId } from '../engine/types';
import { RibbonBanner } from '../ui/RibbonBanner';
import { TOKENS, Token } from '../ui/Token';
import './Setup.css';

const BOT_NAMES = ['הנרי', 'מרק', 'סופיה'];
const MAX_PLAYERS = 4;

type Mode = 'bots' | 'people';

interface Human {
  name: string;
  token: TokenId;
}

const defaultHumans = (): Human[] =>
  TOKENS.slice(0, MAX_PLAYERS).map((t, i) => ({ name: i === 0 ? 'אני' : `שחקן ${i + 1}`, token: t.id }));

interface Props {
  onStart: (players: PlayerSetup[], rules: GameRules) => void;
  onOnline: () => void;
  onBack: () => void;
}

/**
 * Game setup wizard:
 * 1. against the computer or real people
 * 2. how many players (and bot names)
 * 3. name + token for each real player
 * 4. rules (mortgage yes/no)
 */
export function Setup({ onStart, onOnline, onBack }: Props) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<Mode>('bots');
  const [humanCount, setHumanCount] = useState(1);
  const [botCount, setBotCount] = useState(3);
  const [humans, setHumans] = useState<Human[]>(defaultHumans);
  const [botNames, setBotNames] = useState(BOT_NAMES);
  const [who, setWho] = useState(0);
  const [mortgage, setMortgage] = useState(true);

  const chooseMode = (m: Mode) => {
    setMode(m);
    if (m === 'bots') {
      setHumanCount(1);
      setBotCount(3);
    } else {
      setHumanCount(2);
      setBotCount(0);
    }
    setStep(1);
  };

  const setHuman = (i: number, patch: Partial<Human>) =>
    setHumans((hs) => hs.map((h, j) => (j === i ? { ...h, ...patch } : h)));

  const takenByOthers = (i: number) => new Set(humans.slice(0, humanCount).filter((_, j) => j !== i).map((h) => h.token));

  const start = () => {
    const chosen = humans.slice(0, humanCount).map((h, i) => ({
      name: h.name.trim() || `שחקן ${i + 1}`,
      token: h.token,
      isBot: false,
    }));
    const free = TOKENS.filter((t) => !chosen.some((c) => c.token === t.id));
    const bots = Array.from({ length: botCount }, (_, i) => ({
      name: botNames[i].trim() || BOT_NAMES[i],
      token: free[i].id,
      isBot: true,
    }));
    onStart([...chosen, ...bots], { mortgage });
  };

  const back = () => {
    if (step === 2 && who > 0) return setWho(who - 1);
    if (step === 0) return onBack();
    if (step === 3) setWho(humanCount - 1);
    setStep(step - 1);
  };

  const next = () => {
    if (step === 1) setWho(0);
    if (step === 2 && who < humanCount - 1) return setWho(who + 1);
    setStep(step + 1);
  };

  const total = humanCount + botCount;
  const titles = ['מול מי משחקים?', 'כמה משתתפים?', 'בחר דמות!', 'חוקי המשחק'];

  return (
    <div className="setup">
      <div className="color-band top" aria-hidden="true" />
      <div className="setup-banner">
        <RibbonBanner text={titles[step]} />
      </div>
      <div className="steps" aria-label={`שלב ${step + 1} מתוך 4`}>
        {titles.map((_, i) => (
          <i key={i} className={i === step ? 'on' : i < step ? 'done' : ''} />
        ))}
      </div>

      {step === 0 && (
        <div className="choices">
          <button className={`choice${mode === 'bots' ? ' on' : ''}`} onClick={() => chooseMode('bots')}>
            <span className="choice-icon">🤖</span>
            <b>נגד המחשב</b>
            <small>אתה נגד 1 עד 3 בוטים</small>
          </button>
          <button className={`choice${mode === 'people' ? ' on' : ''}`} onClick={() => chooseMode('people')}>
            <span className="choice-icon">👫</span>
            <b>עם חברים על הטלפון הזה</b>
            <small>2 עד 4 שחקנים, מעבירים את הטלפון ביניכם</small>
          </button>
          <button className="choice" onClick={onOnline}>
            <span className="choice-icon">🌐</span>
            <b>עם חברים בקוד</b>
            <small>כל אחד מהטלפון שלו: צור קוד או רשום קוד</small>
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="setup-panel">
          {mode === 'people' && (
            <div className="setup-field">
              כמה שחקנים אמיתיים?
              <div className="seg">
                {[2, 3, 4].map((n) => (
                  <button
                    key={n}
                    className={n === humanCount ? 'on' : ''}
                    onClick={() => {
                      setHumanCount(n);
                      setBotCount((b) => Math.min(b, MAX_PLAYERS - n));
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="setup-field">
            {mode === 'bots' ? 'כמה בוטים?' : 'להוסיף גם בוטים?'}
            <div className="seg">
              {(mode === 'bots' ? [1, 2, 3] : Array.from({ length: MAX_PLAYERS - humanCount + 1 }, (_, i) => i)).map((n) => (
                <button key={n} className={n === botCount ? 'on' : ''} onClick={() => setBotCount(n)}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          {botCount > 0 && (
            <div className="setup-field">
              שמות הבוטים
              <div className="bot-names">
                {botNames.slice(0, botCount).map((n, i) => (
                  <input
                    key={i}
                    id={`bot-${i}`}
                    aria-label={`שם בוט ${i + 1}`}
                    value={n}
                    maxLength={10}
                    onChange={(e) => setBotNames((b) => b.map((x, j) => (j === i ? e.target.value : x)))}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="setup-summary">
            סה"כ {total} שחקנים: {humanCount} {humanCount === 1 ? 'אמיתי' : 'אמיתיים'}
            {botCount > 0 && ` ו-${botCount} ${botCount === 1 ? 'בוט' : 'בוטים'}`}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="setup-pick">
          {humanCount > 1 && (
            <div className="who">
              {humans.slice(0, humanCount).map((h, i) => (
                <button key={i} className={i === who ? 'on' : ''} onClick={() => setWho(i)}>
                  <Token token={h.token} size="16px" />
                  {h.name || `שחקן ${i + 1}`}
                </button>
              ))}
            </div>
          )}
          <label className="setup-field">
            {humanCount > 1 ? `השם של שחקן ${who + 1}` : 'השם שלך'}
            <input
              id={`player-name-${who}`}
              value={humans[who].name}
              maxLength={12}
              onChange={(e) => setHuman(who, { name: e.target.value })}
            />
          </label>
          <div className="setup-grid">
            {TOKENS.map((t) => {
              const taken = takenByOthers(who).has(t.id);
              return (
                <button
                  key={t.id}
                  className={`setup-tile${t.id === humans[who].token ? ' selected' : ''}`}
                  style={{ ['--tc' as string]: t.color }}
                  disabled={taken}
                  onClick={() => setHuman(who, { token: t.id })}
                >
                  <Token token={t.id} size="clamp(22px, 7vw, 44px)" />
                  <span>{taken ? 'תפוס' : t.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="setup-panel">
          <div className="setup-field">
            לשחק עם משכנתא?
            <div className="choices small">
              <button className={`choice${mortgage ? ' on' : ''}`} onClick={() => setMortgage(true)}>
                <span className="choice-icon">🏦</span>
                <b>כן</b>
                <small>כל {FEE_ROUNDS} סבבים משלמים חצי ממחיר כל נכס לקופת הלוטו</small>
              </button>
              <button className={`choice${!mortgage ? ' on' : ''}`} onClick={() => setMortgage(false)}>
                <span className="choice-icon">🚫</span>
                <b>לא</b>
                <small>בלי תשלומי משכנתא ובלי משכון</small>
              </button>
            </div>
          </div>
          <div className="lineup">
            {humans.slice(0, humanCount).map((h, i) => (
              <span key={`h${i}`}>
                <Token token={h.token} size="22px" />
                {h.name || `שחקן ${i + 1}`}
              </span>
            ))}
            {Array.from({ length: botCount }, (_, i) => (
              <span key={`b${i}`}>🤖 {botNames[i]}</span>
            ))}
          </div>
        </div>
      )}

      <div className="setup-nav">
        {step === 3 ? (
          <button className="btn btn-red" onClick={start}>
            יוצאים לדרך!
          </button>
        ) : (
          step > 0 && (
            <button className="btn btn-red" onClick={next}>
              {step === 2 && who < humanCount - 1 ? `הבא: שחקן ${who + 2}` : 'המשך'}
            </button>
          )
        )}
        <button className="link" onClick={back}>
          חזרה
        </button>
      </div>
    </div>
  );
}
