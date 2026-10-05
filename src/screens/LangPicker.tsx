import { LANGS, setLang, t, useLang, type Key } from '../i18n';
import { sfx } from '../ui/sound';

/** Three big flag cards: picking one switches the whole game to that language and board. */
export function LangPicker() {
  const lang = useLang();
  return (
    <div className="lang-cards">
      {LANGS.map((l) => (
        <button
          key={l.id}
          className={`lang-card${l.id === lang ? ' on' : ''}`}
          lang={l.id}
          dir={l.id === 'en' ? 'ltr' : 'rtl'}
          onClick={() => {
            sfx.pop();
            setLang(l.id);
          }}
        >
          <span className="lang-flag">{l.flag}</span>
          <b>{l.name}</b>
          <small>{t(`edition_${l.id}` as Key, {}, l.id)}</small>
        </button>
      ))}
    </div>
  );
}
