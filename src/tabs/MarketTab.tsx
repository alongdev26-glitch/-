import { BOARD } from '../data/board';
import type { GameState } from '../engine/types';
import { OWNABLE_COUNT, SETS } from './groups';
import './tabs.css';
import { t } from '../i18n';
import { money } from '../data/editions';

/** Page 3: everything nobody bought yet, and the lotto pot. */
export function MarketTab({ game, onSpace }: { game: GameState; onSpace: (id: number) => void }) {
  const sets = SETS.map((set) => ({ ...set, free: set.ids.filter((id) => game.props[id].owner === null) })).filter(
    (s) => s.free.length > 0,
  );
  const freeCount = sets.reduce((n, s) => n + s.free.length, 0);

  return (
    <div className="page">
      <div className="page-head">
        <h2 className="page-title">{t('tabMarket')}</h2>
        <div className="stat gold">
          <small>{t('potIcon')}</small>
          <b>{money(game.pot)}</b>
        </div>
        <div className="stat">
          <small>{t('notBoughtYet')}</small>
          <b>
            {freeCount} / {OWNABLE_COUNT}
          </b>
        </div>
      </div>
      <div className="note">{t('potNote', { parking: BOARD[20].name })}</div>

      {sets.length === 0 && <div className="empty">{t('allBought')}</div>}

      {sets.map((set) => (
        <section className="group" key={set.key}>
          <div className="group-head" style={{ background: set.color }}>
            <span>{set.title}</span>
            <span>
              {t('freeOf', { free: set.free.length, total: set.ids.length })}
            </span>
          </div>
          {set.free.map((id) => {
            const sp = BOARD[id];
            return (
              <div className="row" key={id}>
                <button className="row-main" onClick={() => onSpace(id)}>
                  <b>{sp.name}</b>
                  <small>
                    {sp.kind === 'property'
                      ? t('rentHotel', { base: money(sp.rent![0]), hotel: money(sp.rent![5]) })
                      : sp.kind === 'railroad'
                        ? t('rentRails', { a: money(25), b: money(200) })
                        : t('rentUtil')}
                  </small>
                </button>
                <div className="row-tags">
                  <span className="tag">{t('priceOf', { price: money(sp.price!) })}</span>
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
