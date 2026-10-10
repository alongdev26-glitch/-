import { sfx } from '../ui/sound';
import { useState } from 'react';
import { FEE_ROUNDS } from '../data/board';
import type { GameRules, PlayerSetup, TokenId } from '../engine/types';
import { RibbonBanner } from '../ui/RibbonBanner';
import { TOKENS, Token } from '../ui/Token';
import { useWallet } from '../ui/Cosmetics';
import { rememberChar } from '../ui/shop';
import './Setup.css';
import { getLang, t } from '../i18n';
import { EDITIONS } from '../data/editions';
import { getName } from '../ui/profile';
import { tokenName } from '../data/tokens';

// the computer players' default names come from the edition of the chosen language
const botNamesNow = () => EDITIONS[getLang()].bots;
const MAX_PLAYERS = 4;

type Mode = 'bots' | 'people';

interface Human {
  name: string;
  token: TokenId;
}

const defaultHumans = (): Human[] =>
  TOKENS.slice(0, MAX_PLAYERS).map((tk, i) => ({
    name: i === 0 ? getName() || t('me') : t('playerN', { n: i + 1 }),
    token: tk.id,
  }));

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
  const [botNames, setBotNames] = useState(botNamesNow);
  const [who, setWho] = useState(0);
  const [mortgage, setMortgage] = useState(true);
  const [maxRounds, setMaxRounds] = useState(0);
  const [auction, setAuction] = useState(true);
  const [goDouble, setGoDouble] = useState(true);
  const wallet = useWallet();
  const myTokens = TOKENS.filter((t) => wallet.owned.includes(t.id));

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
      name: h.name.trim() || t('playerN', { n: i + 1 }),
      token: h.token,
      isBot: false,
    }));
    const free = TOKENS.filter((tk) => !chosen.some((c) => c.token === tk.id));
    const bots = Array.from({ length: botCount }, (_, i) => ({
      name: botNames[i].trim() || botNamesNow()[i],
      token: free[i].id,
      isBot: true,
    }));
    rememberChar(chosen[0].token);
    onStart([...chosen, ...bots], { mortgage, maxRounds, auction, goDouble });
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
  const titles = [t('setupWho'), t('setupHowMany'), t('setupPick'), t('setupRules')];

  return (
    <div className="setup">
      <div className="color-band top" aria-hidden="true" />
      <div className="setup-banner">
        <RibbonBanner text={titles[step]} />
      </div>
      <div className="steps" aria-label={t('stepOf', { n: step + 1 })}>
        {titles.map((_, i) => (
          <i key={i} className={i === step ? 'on' : i < step ? 'done' : ''} />
        ))}
      </div>

      {step === 0 && (
        <div className="choices">
          <button className={`choice${mode === 'bots' ? ' on' : ''}`} onClick={() => chooseMode('bots')}>
            <span className="choice-icon">🤖</span>
            <b>{t('vsComputer')}</b>
            <small>{t('vsComputerNote')}</small>
          </button>
          <button className={`choice${mode === 'people' ? ' on' : ''}`} onClick={() => chooseMode('people')}>
            <span className="choice-icon">👫</span>
            <b>{t('samePhone')}</b>
            <small>{t('samePhoneNote')}</small>
          </button>
          <button className="choice" onClick={onOnline}>
            <span className="choice-icon">🌐</span>
            <b>{t('withCode')}</b>
            <small>{t('withCodeNote')}</small>
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="setup-panel">
          {mode === 'people' && (
            <div className="setup-field">
              {t('howManyHumans')}
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
            {mode === 'bots' ? t('howManyBots') : t('addBots')}
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
              {t('botNames')}
              <div className="bot-names">
                {botNames.slice(0, botCount).map((n, i) => (
                  <input
                    key={i}
                    id={`bot-${i}`}
                    aria-label={t('botNameN', { n: i + 1 })}
                    value={n}
                    maxLength={10}
                    onChange={(e) => setBotNames((b) => b.map((x, j) => (j === i ? e.target.value : x)))}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="setup-summary">
            {t('totalPlayers', { total, humans: humanCount, bots: botCount })}
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
                  {h.name || t('playerN', { n: i + 1 })}
                </button>
              ))}
            </div>
          )}
          <label className="setup-field">
            {humanCount > 1 ? t('nameOfPlayer', { n: who + 1 }) : t('yourName')}
            <input
              id={`player-name-${who}`}
              value={humans[who].name}
              maxLength={12}
              onChange={(e) => setHuman(who, { name: e.target.value })}
            />
          </label>
          <div className="setup-grid">
            {myTokens.map((tk) => {
              const taken = takenByOthers(who).has(tk.id);
              return (
                <button
                  key={tk.id}
                  className={`setup-tile${tk.id === humans[who].token ? ' selected' : ''}`}
                  style={{ ['--tc' as string]: tk.color }}
                  disabled={taken}
                  onClick={() => {
                    sfx.pop();
                    setHuman(who, { token: tk.id });
                  }}
                >
                  <Token token={tk.id} size="clamp(22px, 7vw, 44px)" skin={wallet.skin} />
                  <span>{taken ? t('taken') : tokenName(tk.id)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="setup-panel">
          <div className="setup-field">
            {t('mortgageQ')}
            <div className="choices small">
              <button className={`choice${mortgage ? ' on' : ''}`} onClick={() => setMortgage(true)}>
                <span className="choice-icon">🏦</span>
                <b>{t('yes')}</b>
                <small>{t('mortgageYes', { n: FEE_ROUNDS })}</small>
              </button>
              <button className={`choice${!mortgage ? ' on' : ''}`} onClick={() => setMortgage(false)}>
                <span className="choice-icon">🚫</span>
                <b>{t('no')}</b>
                <small>{t('mortgageNo')}</small>
              </button>
            </div>
          </div>
          <div className="setup-field">
            {t('gameLength')}
            <div className="seg seg-wide">
              {[0, 15, 20, 30].map((n) => (
                <button key={n} className={maxRounds === n ? 'on' : ''} onClick={() => setMaxRounds(n)}>
                  {n ? t('roundsN', { n }) : t('lengthNormal')}
                </button>
              ))}
            </div>
          </div>
          <div className="setup-field">
            {t('auctionQ')}
            <div className="seg seg-wide">
              <button className={auction ? 'on' : ''} onClick={() => setAuction(true)}>
                {t('yes')}
              </button>
              <button className={!auction ? 'on' : ''} onClick={() => setAuction(false)}>
                {t('no')}
              </button>
            </div>
          </div>
          <div className="setup-field">
            {t('goDoubleQ')}
            <div className="seg seg-wide">
              <button className={goDouble ? 'on' : ''} onClick={() => setGoDouble(true)}>
                {t('yes')}
              </button>
              <button className={!goDouble ? 'on' : ''} onClick={() => setGoDouble(false)}>
                {t('no')}
              </button>
            </div>
          </div>
          <div className="lineup">
            {humans.slice(0, humanCount).map((h, i) => (
              <span key={`h${i}`}>
                <Token token={h.token} size="22px" />
                {h.name || t('playerN', { n: i + 1 })}
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
            {t('letsGo')}
          </button>
        ) : (
          step > 0 && (
            <button className="btn btn-red" onClick={next}>
              {step === 2 && who < humanCount - 1 ? t('nextPlayer', { n: who + 2 }) : t('continue')}
            </button>
          )
        )}
        <button className="btn-back" onClick={back}>
          {t('back')}
        </button>
      </div>
    </div>
  );
}
