import { useState } from 'react';
import { t } from '../i18n';
import { tokenName } from '../data/tokens';
import { getName, setName } from '../ui/profile';
import { rememberChar } from '../ui/shop';
import { useWallet } from '../ui/Cosmetics';
import { sfx } from '../ui/sound';
import { TOKENS, Token } from '../ui/Token';
import './Setup.css';
import './Settings.css';
import './Profile.css';

/** 👤 My profile: my character, my name, my coins and the characters I have. Nothing applies until Save. */
export function Profile({ onBack }: { onBack: () => void }) {
  const wallet = useWallet();
  const [base, setBase] = useState(() => ({ name: getName(), char: wallet.char }));
  const [draft, setDraft] = useState(base);
  const dirty = draft.name !== base.name || draft.char !== base.char;
  const [justSaved, setJustSaved] = useState(false);
  const owned = TOKENS.filter((tk) => wallet.owned.includes(tk.id));

  const save = () => {
    setName(draft.name);
    rememberChar(draft.char);
    setBase({ ...draft });
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1500);
    sfx.coin();
  };

  return (
    <div className="st">
      <div className="st-top">
        <button className="st-corner" onClick={onBack} aria-label={t('back')}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 4 7 12l8 8" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1>{t('tabProfile')}</h1>
        <span className="st-corner pf-spacer" aria-hidden="true" />
      </div>

      <div className="st-body">
        <div className="pf-card">
          <span className="pf-avatar">
            <Token token={draft.char} size="62px" skin={wallet.skin} />
          </span>
          <input
            id="profile-name"
            className="welcome-name pf-name"
            value={draft.name}
            maxLength={12}
            placeholder={t('welcomeNamePh')}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value.slice(0, 12) }))}
          />
          <div className="pf-stats">
            <span>
              🪙 <b>{wallet.coins}</b> {t('coins')}
            </span>
            <span>
              🎭 <b>
                {owned.length}/{TOKENS.length}
              </b>
            </span>
          </div>
        </div>

        <div className="st-group">
          <span className="st-label">{t('myChars')}</span>
          <div className="pf-grid">
            {TOKENS.map((tk) => {
              const mine = wallet.owned.includes(tk.id);
              return (
                <button
                  key={tk.id}
                  className={`pf-char${draft.char === tk.id ? ' is-on' : ''}${mine ? '' : ' is-locked'}`}
                  disabled={!mine}
                  aria-pressed={draft.char === tk.id}
                  onClick={() => setDraft((d) => ({ ...d, char: tk.id }))}
                >
                  <Token token={tk.id} size="44px" skin={mine ? wallet.skin : undefined} />
                  <small>{mine ? tokenName(tk.id) : '🔒'}</small>
                </button>
              );
            })}
          </div>
        </div>

        <div className="st-save-bar">
          <button className="st-save" disabled={!dirty} onClick={save}>
            {justSaved ? t('saved') : t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
