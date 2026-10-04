import { useEffect, useState } from 'react';
import { RibbonBanner } from '../ui/RibbonBanner';
import { Token } from '../ui/Token';
import { useWallet } from '../ui/Cosmetics';
import { ALL_ITEMS, GAME_REWARD, RARITY_NAME, buy, equip, rotation, type ShopItem } from '../ui/shop';
import type { TokenId } from '../engine/types';
import { sfx } from '../ui/sound';
import './Shop.css';

/** A tiny board corner to preview a board design. */
function BoardSwatch({ id }: { id: string }) {
  return (
    <div className={`board swatch ${id}`} dir="ltr" aria-hidden="true">
      <div className="sw-row">
        <i style={{ background: 'var(--g-red)' }} />
        <i style={{ background: 'var(--g-yellow)' }} />
        <i style={{ background: 'var(--g-green)' }} />
      </div>
      <div className="board-center sw-center" />
    </div>
  );
}

const KIND_NAME = { char: 'דמות', skin: 'סקין', board: 'לוח' };

function Preview({ item, char, size }: { item: ShopItem; char: TokenId; size: string }) {
  if (item.kind === 'char') return <Token token={item.id as TokenId} color="#fff" size={size} />;
  if (item.kind === 'skin') return <Token token={char} color="#fff" size={size} skin={item.id} />;
  return <BoardSwatch id={item.id} />;
}

/** "2 ימים ו-7 שעות" until the shop changes. */
function timeLeft(ms: number) {
  const h = Math.max(0, Math.floor(ms / 3_600_000));
  const d = Math.floor(h / 24);
  const hh = h % 24;
  if (d === 0) return hh === 0 ? 'פחות משעה' : hh === 1 ? 'שעה' : `${hh} שעות`;
  const days = d === 1 ? 'יום' : d === 2 ? 'יומיים' : `${d} ימים`;
  return hh === 0 ? days : `${days} ו-${hh === 1 ? 'שעה' : `${hh} שעות`}`;
}

/** The shop: 9 items that change every 3 days, bought with the coins you earn by playing. */
export function Shop({ onBack }: { onBack: () => void }) {
  const wallet = useWallet();
  const [note, setNote] = useState('');
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const { items, endsAt } = rotation(now);

  const isOn = (item: ShopItem) =>
    item.kind === 'skin' ? wallet.skin === item.id : item.kind === 'board' ? wallet.board === item.id : false;

  const pick = (item: ShopItem) => {
    if (wallet.owned.includes(item.id)) {
      if (item.kind === 'char') {
        setNote(`${item.name} שלך! בחר אותו כשמתחילים משחק.`);
        return;
      }
      equip(item);
      sfx.pop();
      setNote(`${item.name} נבחר!`);
      return;
    }
    if (buy(item)) {
      equip(item);
      sfx.buy();
      setNote(
        item.kind === 'char' ? `קנית את ${item.name}! תוכל לבחור אותו כשמתחילים משחק.` : `קנית את ${item.name}!`,
      );
    } else {
      setNote(`חסרים לך ${item.price - wallet.coins} מטבעות. שחק עוד משחק כדי להרוויח!`);
    }
  };

  // my collection: what I own beyond the free basics
  const mine = ALL_ITEMS.filter((i) => wallet.owned.includes(i.id) && (i.kind === 'char' || i.price > 0));
  const basics = ALL_ITEMS.filter((i) => i.kind !== 'char' && i.price === 0);

  return (
    <div className="shop">
      <div className="color-band top" aria-hidden="true" />
      <div className="setup-banner">
        <RibbonBanner text="חנות" />
      </div>

      <div className="shop-coins">
        <span>🪙</span>
        <b>{wallet.coins}</b>
        <small>מטבעות</small>
      </div>
      <div className="shop-how">
        על כל משחק שמסיימים מקבלים {GAME_REWARD.played} מטבעות, ועל ניצחון {GAME_REWARD.won}!
      </div>
      <div className="shop-timer">⏳ החנות מתחלפת בעוד {timeLeft(endsAt - now)}</div>

      <div className="shop-grid">
        {items.map((item) => {
          const owned = wallet.owned.includes(item.id);
          const on = isOn(item);
          return (
            <button
              key={item.id}
              className={`shop-item r-${item.rarity}${on ? ' on' : ''}`}
              onClick={() => pick(item)}
            >
              <span className="shop-kind">{KIND_NAME[item.kind]}</span>
              <div className="shop-preview">
                <Preview item={item} char={wallet.char} size="34px" />
              </div>
              <b>{item.name}</b>
              <small className="shop-rarity">{RARITY_NAME[item.rarity]}</small>
              <span className={`shop-price${owned ? ' owned' : ''}`}>
                {on ? '✓ בשימוש' : owned ? (item.kind === 'char' ? '✓ שלך' : 'בחר') : `🪙 ${item.price}`}
              </span>
            </button>
          );
        })}
      </div>

      {note && <div className="setup-summary">{note}</div>}

      <div className="shop-mine">
        <h3>האוסף שלי</h3>
        <div className="shop-mine-row">
          {[...basics, ...mine].map((item) => (
            <button
              key={item.id}
              className={`mine-item r-${item.rarity}${isOn(item) ? ' on' : ''}`}
              onClick={() => pick(item)}
              title={item.name}
            >
              <Preview item={item} char={wallet.char} size="22px" />
              <small>{item.name}</small>
            </button>
          ))}
        </div>
        {mine.length === 0 && <div className="shop-how">עוד לא קנית כלום. כל מה שתקנה יישאר כאן.</div>}
      </div>

      <div className="setup-nav">
        <button className="link" onClick={onBack}>
          חזרה
        </button>
      </div>
    </div>
  );
}
