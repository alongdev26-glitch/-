import { LANGS, dir, setLang, t, useLang, type Key, type Lang } from '../i18n';
import { sfx } from '../ui/sound';

/** Three big flag cards: picking one switches the whole game to that language and board. */
export function LangPicker({ value, onPick }: { value?: Lang; onPick?: (l: Lang) => void } = {}) {
  const current = useLang();
  const lang = value ?? current;
  return (
    <div className="lang-cards">
      {LANGS.map((l) => (
        <button
          key={l.id}
          className={`lang-card${l.id === lang ? ' on' : ''}`}
          lang={l.id}
          dir={dir(l.id)}
          onClick={() => {
            sfx.pop();
            if (onPick) onPick(l.id);
            else setLang(l.id);
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
