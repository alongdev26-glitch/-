import { useState } from 'react';
import { RibbonBanner } from '../ui/RibbonBanner';
import { TOKENS, Token } from '../ui/Token';
import type { TokenId } from '../engine/types';
import { useWallet } from '../ui/Cosmetics';
import { BOARDS, GAME_REWARD, SKINS, buy, equip, type ShopItem } from '../ui/shop';
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

/** The shop: spend the coins you earn by playing on character skins and board designs. */
export function Shop({ onBack }: { onBack: () => void }) {
  const wallet = useWallet();
  const [tab, setTab] = useState<'skin' | 'board'>('skin');
  const [note, setNote] = useState('');
  const [who, setWho] = useState<TokenId>('cat');
  const items = tab === 'skin' ? SKINS : BOARDS;

  const pick = (item: ShopItem) => {
    if (wallet.owned.includes(item.id)) {
      equip(item);
      sfx.pop();
      setNote(`${item.name} נבחר!`);
      return;
    }
    if (buy(item)) {
      equip(item);
      sfx.buy();
      setNote(`קנית את ${item.name}!`);
    } else {
      setNote(`חסרים לך ${item.price - wallet.coins} מטבעות. שחק עוד משחק כדי להרוויח!`);
    }
  };

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

      <div className="shop-tabs">
        <button className={tab === 'skin' ? 'on' : ''} onClick={() => setTab('skin')}>
          סקינים לדמויות
        </button>
        <button className={tab === 'board' ? 'on' : ''} onClick={() => setTab('board')}>
          עיצובי לוח
        </button>
      </div>

      {tab === 'skin' && (
        <>
          <div className="shop-who">
            {TOKENS.map((t) => (
              <button
                key={t.id}
                className={who === t.id ? 'on' : ''}
                onClick={() => setWho(t.id)}
                aria-label={t.name}
              >
                <Token token={t.id} color="#fff" size="22px" skin={wallet.skin} />
              </button>
            ))}
          </div>
          <div className="shop-how">הסקין עובד על כל דמות שתבחר במשחק</div>
        </>
      )}

      <div className="shop-grid">
        {items.map((item) => {
          const owned = wallet.owned.includes(item.id);
          const on = item.kind === 'skin' ? wallet.skin === item.id : wallet.board === item.id;
          return (
            <button key={item.id} className={`shop-item${on ? ' on' : ''}`} onClick={() => pick(item)}>
              <div className="shop-preview">
                {item.kind === 'skin' ? (
                  <Token token={who} color="#fff" size="34px" skin={item.id} />
                ) : (
                  <BoardSwatch id={item.id} />
                )}
              </div>
              <b>{item.name}</b>
              <small>{item.desc}</small>
              <span className={`shop-price${owned ? ' owned' : ''}`}>
                {on ? '✓ בשימוש' : owned ? 'בחר' : `🪙 ${item.price}`}
              </span>
            </button>
          );
        })}
      </div>

      {note && <div className="setup-summary">{note}</div>}

      <div className="setup-nav">
        <button className="link" onClick={onBack}>
          חזרה
        </button>
      </div>
    </div>
  );
}
