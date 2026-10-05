import { useState } from 'react';
import { setLang, t, useLang } from '../i18n';
import { RibbonBanner } from '../ui/RibbonBanner';
import { getName, setName } from '../ui/profile';
import { sfx } from '../ui/sound';
import { LangPicker } from './LangPicker';
import './Setup.css';

/** The short questionnaire the very first time the game opens: language, then name. */
export function Welcome({ onDone }: { onDone: () => void }) {
  const lang = useLang();
  const [step, setStep] = useState(0);
  const [name, setNameInput] = useState(getName);

  const finish = () => {
    setLang(lang); // remember the choice, even if it is the preselected one
    setName(name);
    sfx.start();
    onDone();
  };

  return (
    <div className="setup welcome">
      <div className="color-band top" aria-hidden="true" />
      <div className="setup-banner">
        <RibbonBanner text={t('welcomeTitle')} />
      </div>
      <div className="steps">
        {[0, 1].map((i) => (
          <i key={i} className={i === step ? 'on' : i < step ? 'done' : ''} />
        ))}
      </div>

      {step === 0 ? (
        <div className="setup-panel">
          <h2 className="welcome-q">🌍 {t('welcomeLang')}</h2>
          <LangPicker />
          <small className="hint">{t('welcomeLangNote')}</small>
        </div>
      ) : (
        <div className="setup-panel">
          <h2 className="welcome-q">👋 {t('welcomeName')}</h2>
          <input
            id="welcome-name"
            className="welcome-name"
            value={name}
            maxLength={12}
            placeholder={t('welcomeNamePh')}
            autoFocus
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && finish()}
          />
        </div>
      )}

      <div className="setup-nav">
        {step === 0 ? (
          <button className="btn btn-red" onClick={() => setStep(1)}>
            {t('next')}
          </button>
        ) : (
          <>
            <button className="btn btn-red" onClick={finish}>
              {t('welcomeStart')}
            </button>
            <button className="btn-back" onClick={() => setStep(0)}>
              {t('back')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
