import { useState } from 'react';
import { locale, t } from '../i18n';
import { APP_URL } from '../online/referral';
import { RibbonBanner } from '../ui/RibbonBanner';
import { getName, setName } from '../ui/profile';
import { SoundToggle } from '../ui/SoundToggle';
import { LangPicker } from './LangPicker';
import './Setup.css';

/** ⚙️ Settings: language & board, my name, sounds. */
export function Settings({ onBack }: { onBack: () => void }) {
  const [name, setNameInput] = useState(getName);
  return (
    <div className="setup settings">
      <div className="color-band top" aria-hidden="true" />
      <div className="setup-banner">
        <RibbonBanner text={t('settings')} />
      </div>

      <div className="setup-panel">
        <h2 className="welcome-q">🌍 {t('settingsLang')}</h2>
        <LangPicker />
      </div>

      <div className="setup-panel">
        <h2 className="welcome-q">👤 {t('settingsName')}</h2>
        <input
          id="settings-name"
          className="welcome-name"
          value={name}
          maxLength={12}
          placeholder={t('welcomeNamePh')}
          onChange={(e) => {
            setNameInput(e.target.value);
            setName(e.target.value);
          }}
        />
      </div>

      <div className="setup-panel">
        <h2 className="welcome-q">🔊 {t('settingsSound')}</h2>
        <SoundToggle className="btn btn-white" label />
      </div>

      <a className="settings-privacy" href={`${APP_URL}privacy.html`} target="_blank" rel="noopener">
        🔒 {t('privacy')}
      </a>

      <div className="settings-version">
        {t('version')}: {new Date(__BUILD__).toLocaleString(locale(), { dateStyle: 'short', timeStyle: 'short' })}
      </div>

      <div className="setup-nav">
        <button className="btn-back" onClick={onBack}>
          {t('back')}
        </button>
      </div>
    </div>
  );
}
