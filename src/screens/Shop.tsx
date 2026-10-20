import { useEffect, useState } from 'react';
import { RibbonBanner } from '../ui/RibbonBanner';
import { Token } from '../ui/Token';
import { useWallet } from '../ui/Cosmetics';
import { ALL_ITEMS, DAILY_GEMS, GAME_REWARD, skinOf, buy, equip, itemName, rarityName, rotation, type ShopItem } from '../ui/shop';
import type { TokenId } from '../engine/types';
import { sfx } from '../ui/sound';
import { ShareButton } from '../ui/ShareButton';
import './Shop.css';
import '../ui/Tier.css';
import { GemPackArt } from '../ui/GemPackArt';
import { Checkout } from '../ui/Checkout';
import { PACK_IDS, packPrices } from '../ui/billing';
import { t, type Key } from '../i18n';

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

/** 💎 diamond packs for real money (open once the game is on Google Play) */
const GEM_PACKS = [
  { id: PACK_IDS[0], gems: 5000, price: '₪4.90', c: ['#6fd6ff', '#1f8fe0', '#0b4f8f'] },
  { id: PACK_IDS[1], gems: 15000, price: '₪9.90', c: ['#b78cff', '#7b3fe4', '#4a1f9a'], bonus: '+50%' },
  { id: PACK_IDS[2], gems: 50000, price: '₪24.90', c: ['#ffb36b', '#f05a28', '#8f2a00'], bonus: '+100%', ribbon: 'popular' as const },
  { id: PACK_IDS[3], gems: 150000, price: '₪59.90', c: ['#fff3a8', '#e8a20c', '#8a5a00'], bonus: '+150%', ribbon: 'bestValue' as const },
];

const KIND_NAME: Record<ShopItem['kind'], Key> = { char: 'kindChar', skin: 'kindSkin', board: 'kindBoard' };

function Preview({ item, char, size }: { item: ShopItem; char: TokenId; size: string }) {
  if (item.kind === 'char') return <Token token={item.id as TokenId} color="#fff" size={size} />;
  if (item.kind === 'skin') return <Token token={char} color="#fff" size={size} skin={item.id} />;
  return <BoardSwatch id={item.id} />;
}

/** "2 ימים ו-7 שעות" until the shop changes. */
function timeLeft(ms: number) {
  const h = Math.max(0, Math.floor(ms / 3_600_000));
  return t('timeLeft', { d: Math.floor(h / 24), h: h % 24 });
}

/** The shop: 9 items that change every 3 days, bought with the coins you earn by playing. */
export function Shop({ onBack }: { onBack: () => void }) {
  const wallet = useWallet();
  const [note, setNote] = useState('');
  const [paying, setPaying] = useState<number | null>(null);
  // Google's own prices, in the player's currency, once the app runs from Google Play
  const [prices, setPrices] = useState<Record<string, string>>({});
  useEffect(() => {
    packPrices().then(setPrices);
  }, []);
  const priceOf = (p: (typeof GEM_PACKS)[number]) => prices[p.id] ?? p.price;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const { items, endsAt } = rotation(now);

  const isOn = (item: ShopItem) =>
    item.kind === 'skin' ? skinOf(wallet, wallet.char) === item.id : item.kind === 'board' ? wallet.board === item.id : false;

  const pick = (item: ShopItem) => {
    if (wallet.owned.includes(item.id)) {
      if (item.kind === 'char') {
        setNote(t('charOwned', { name: itemName(item) }));
        return;
      }
      equip(item);
      sfx.pop();
      setNote(t('itemPicked', { name: itemName(item) }));
      return;
    }
    if (buy(item)) {
      equip(item);
      sfx.buy();
      setNote(
        t(item.kind === 'char' ? 'boughtChar' : 'boughtItem', { name: itemName(item) }),
      );
    } else {
      setNote(t('missingCoins', { n: item.price - wallet.coins }));
    }
  };

  // my collection: what I own beyond the free basics
  const mine = ALL_ITEMS.filter((i) => wallet.owned.includes(i.id) && (i.kind === 'char' || i.price > 0));
  const basics = ALL_ITEMS.filter((i) => i.kind !== 'char' && i.price === 0);

  return (
    <div className="shop">
      <div className="color-band top" aria-hidden="true" />
      <div className="setup-banner">
        <RibbonBanner text={t('shop')} />
      </div>

      <div className="shop-coins">
        <span>🪙</span>
        <b>{wallet.coins}</b>
        <small>{t('coins')}</small>
      </div>
      <div className="shop-gems">
        <h3>💎 {t('buyGems')}</h3>
        <div className="tier-balance">
          <span className="tier-balance-gem" aria-hidden="true">💎</span>
          <b>{wallet.gems.toLocaleString()}</b>
        </div>
        <div className="tier-list">
          {GEM_PACKS.map((p, i) => (
            <button
              key={p.gems}
              className={`tier${p.ribbon ? ' best' : ''}${i === GEM_PACKS.length - 1 ? ' legend' : ''}`}
              style={{ ['--c1' as string]: p.c[0], ['--c2' as string]: p.c[1], ['--c3' as string]: p.c[2] }}
              onClick={() => setPaying(i)}
            >
              {p.ribbon && <span className="tier-ribbon">{t(p.ribbon)}</span>}
              <span className="tier-art">
                <GemPackArt kind={i as 0 | 1 | 2 | 3} />
              </span>
              <span className="tier-text">
                <b>{t(`pack${i}` as Key)}</b>
                <small>
                  💎 {p.gems.toLocaleString()}
                  {p.bonus && <span className="tier-bonus">{p.bonus}</span>}
                </small>
              </span>
              <span className="tier-price">{priceOf(p)}</span>
            </button>
          ))}
        </div>
        {paying !== null && (
          <Checkout
            pack={{ ...GEM_PACKS[paying], price: priceOf(GEM_PACKS[paying]) }}
            index={paying}
            onClose={() => setPaying(null)}
          />
        )}
        <small className="shop-how">{t('dailyGemsNote', { n: DAILY_GEMS })}</small>
      </div>
      <div className="shop-how">
        {t('howToEarn', { played: GAME_REWARD.played, won: GAME_REWARD.won })}
      </div>
      <div className="shop-timer">{t('shopChanges', { time: timeLeft(endsAt - now) })}</div>

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
              <span className="shop-kind">{t(KIND_NAME[item.kind])}</span>
              <div className="shop-preview">
                <Preview item={item} char={wallet.char} size="34px" />
              </div>
              <b>{itemName(item)}</b>
              <small className="shop-rarity">{rarityName(item.rarity)}</small>
              <span className={`shop-price${owned ? ' owned' : ''}`}>
                {on ? t('inUse') : owned ? (item.kind === 'char' ? t('yours') : t('pick')) : `🪙 ${item.price}`}
              </span>
            </button>
          );
        })}
      </div>

      {note && <div className="setup-summary">{note}</div>}

      <div className="shop-mine">
        <h3>{t('myCollection')}</h3>
        <div className="shop-mine-row">
          {[...basics, ...mine].map((item) => (
            <button
              key={item.id}
              className={`mine-item r-${item.rarity}${isOn(item) ? ' on' : ''}`}
              onClick={() => pick(item)}
              title={itemName(item)}
            >
              <Preview item={item} char={wallet.char} size="22px" />
              <small>{itemName(item)}</small>
            </button>
          ))}
        </div>
        {mine.length === 0 && <div className="shop-how">{t('nothingBought')}</div>}
      </div>

      <ShareButton />

      <div className="setup-nav">
        <button className="btn-back" onClick={onBack}>
          {t('back')}
        </button>
      </div>
    </div>
  );
}
