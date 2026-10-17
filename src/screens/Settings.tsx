import { useEffect, useState, type ReactNode } from 'react';
import { LANGS, locale, t, useLang } from '../i18n';
import { APP_URL } from '../online/referral';
import { getName, setName } from '../ui/profile';
import { onSoundChange, setVolume, sfx, volume } from '../ui/sound';
import { setSmooth, smoothOn } from '../ui/smooth';
import { setVibrate, vibrateOn } from '../ui/haptic';
import { Modal } from '../ui/Modal';
import { LangPicker } from './LangPicker';
import './Setup.css';
import './Settings.css';

const HELP_URL = 'https://github.com/alongdev26-glitch/-1/issues';

/** An on/off switch: two halves, the chosen one lit green. */
function Toggle({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  return (
    <div className="st-toggle" role="group">
      <button className={!on ? 'lit' : ''} aria-pressed={!on} onClick={() => onChange(false)}>
        {t('offWord')}
      </button>
      <button className={on ? 'lit' : ''} aria-pressed={on} onClick={() => onChange(true)}>
        {t('onWord')}
      </button>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="st-row">
      <span className="st-label">{label}</span>
      {children}
    </div>
  );
}

/** ⚙️ Settings, laid out like a game's settings page: sound, switches, then a grid of buttons. */
export function Settings({ onBack }: { onBack: () => void }) {
  const lang = useLang();
  const [vol, setVol] = useState(volume);
  useEffect(() => onSoundChange(() => setVol(volume())), []);
  const [smooth, setSmoothState] = useState(smoothOn);
  const [vibe, setVibe] = useState(vibrateOn);
  const [open, setOpen] = useState<null | 'lang' | 'name' | 'rules' | 'credits'>(null);
  const [name, setNameInput] = useState(getName);

  const changeVol = (n: number) => {
    setVolume(n);
    setVol(volume());
    if (n > 0) sfx.coin();
  };

  return (
    <div className="st">
      <div className="st-top">
        <button className="st-corner" onClick={onBack} aria-label={t('back')}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 4 7 12l8 8" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1>{t('settings')}</h1>
        <button className="st-corner" onClick={onBack} aria-label={t('back')}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1Z" fill="currentColor" />
          </svg>
        </button>
      </div>

      <div className="st-body">
        <div className="st-group">
          <Row label={t('soundFx')}>
            <div className="st-volume">
              <span className="st-vol-icon" aria-hidden="true">
                {vol ? '🔊' : '🔇'}
              </span>
              <div className="st-bar" aria-label={`${vol}/4`}>
                {[1, 2, 3, 4].map((i) => (
                  <i key={i} className={i <= vol ? 'full' : ''} />
                ))}
              </div>
              <div className="st-steps">
                <button onClick={() => changeVol(vol - 1)} disabled={vol === 0} aria-label="−">
                  ‹
                </button>
                <button onClick={() => changeVol(vol + 1)} disabled={vol === 4} aria-label="+">
                  ›
                </button>
              </div>
            </div>
          </Row>
          <Row label={t('smoothMode')}>
            <Toggle
              on={smooth}
              onChange={(v) => {
                setSmooth(v);
                setSmoothState(v);
              }}
            />
          </Row>
          <Row label={t('vibration')}>
            <Toggle
              on={vibe}
              onChange={(v) => {
                setVibrate(v);
                setVibe(v);
              }}
            />
          </Row>
        </div>

        <div className="st-grid">
          <div className="st-cell">
            <span className="st-label">{t('settingsLang')}</span>
            <button className="st-btn" onClick={() => setOpen('lang')}>
              {LANGS.find((l) => l.id === lang)?.flag} {LANGS.find((l) => l.id === lang)?.name}
            </button>
          </div>
          <div className="st-cell">
            <span className="st-label">{t('settingsName')}</span>
            <button className="st-btn" onClick={() => setOpen('name')}>
              {getName() || '—'}
            </button>
          </div>
          <button className="st-btn" onClick={() => setOpen('rules')}>
            {t('howToPlay')}
          </button>
          <button className="st-btn" onClick={() => setOpen('credits')}>
            {t('credits')}
          </button>
          <a className="st-btn" href={HELP_URL} target="_blank" rel="noopener">
            {t('helpSupport')}
          </a>
          <a className="st-btn" href={`${APP_URL}privacy.html`} target="_blank" rel="noopener">
            {t('privacy')}
          </a>
          <a className="st-btn" href={`${APP_URL}terms.html`} target="_blank" rel="noopener">
            {t('terms')}
          </a>
        </div>

        <div className="st-version">
          {t('version')}: {new Date(__BUILD__).toLocaleString(locale(), { dateStyle: 'short', timeStyle: 'short' })}
        </div>
      </div>

      {open === 'lang' && (
        <Modal title={t('settingsLang')} onClose={() => setOpen(null)}>
          <LangPicker />
        </Modal>
      )}
      {open === 'name' && (
        <Modal title={t('settingsName')} onClose={() => setOpen(null)}>
          <input
            id="settings-name"
            className="welcome-name"
            value={name}
            maxLength={12}
            placeholder={t('welcomeNamePh')}
            autoFocus
            onChange={(e) => {
              setNameInput(e.target.value);
              setName(e.target.value);
            }}
          />
        </Modal>
      )}
      {open === 'rules' && (
        <Modal title={t('howToPlay')} onClose={() => setOpen(null)}>
          <ul className="st-text">
            {t('rulesText')
              .split('\n')
              .map((line) => (
                <li key={line}>{line}</li>
              ))}
          </ul>
        </Modal>
      )}
      {open === 'credits' && (
        <Modal title={t('credits')} onClose={() => setOpen(null)}>
          <div className="st-text">
            {t('creditsText')
              .split('\n')
              .map((line) => (
                <p key={line}>{line}</p>
              ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
