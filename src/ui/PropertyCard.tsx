import { House, Hotel } from './Building';
import { BOARD, GROUP_COLORS } from '../data/board';
import { TrainIcon } from './TrainIcon';
import './PropertyCard.css';
import { t, type Key } from '../i18n';
import { money } from '../data/editions';
import { RAIL_RENT } from '../engine/rules';

const RENT_LABELS: Key[] = ['rentLabels0', 'rentLabels1', 'rentLabels2', 'rentLabels3', 'rentLabels4', 'rentLabels5'];

/** Title-deed card for any ownable space. */
export function PropertyCard({ id, ownerName }: { id: number; ownerName?: string }) {
  const sp = BOARD[id];
  const head =
    sp.kind === 'property' ? (
      <div className="deed-head" style={{ background: GROUP_COLORS[sp.group!] }}>
        <small>{sp.city}</small>
        <b>{sp.name}</b>
      </div>
    ) : (
      <div className="deed-head deed-plain">
        <span className="deed-icon">{sp.kind === 'railroad' ? <TrainIcon /> : sp.icon === 'bulb' ? '💡' : '🚰'}</span>
        <b>{sp.name}</b>
      </div>
    );

  return (
    <div className="deed">
      {head}
      <div className="deed-row hl">
        <span>{t('price')}</span>
        <b>{money(sp.price!)}</b>
      </div>
      <div className="deed-row hl">
        <span>{t('mortgage')}</span>
        <b>{money(sp.price! / 2)}</b>
      </div>
      {sp.kind === 'property' && (
        <>
          {sp.rent!.map((r, i) => (
            <div className="deed-row" key={i}>
              <span>
                {t(RENT_LABELS[i])}
                {i > 0 && i < 5 && (
                  <span className="mini-blds">
                    {Array.from({ length: i }, (_, k) => (
                      <House key={k} />
                    ))}
                  </span>
                )}
                {i === 5 && (
                  <span className="mini-blds">
                    <Hotel />
                  </span>
                )}
              </span>
              <b>{money(r)}</b>
            </div>
          ))}
          <div className="deed-row">
            <span>{t('fullColor')}</span>
            <b>{money(sp.rent![0] * 2)}</b>
          </div>
          <div className="deed-foot">
            {t('houseHotelCost', { house: money(sp.houseCost!), hotel: money(sp.houseCost!) })}
          </div>
        </>
      )}
      {sp.kind === 'railroad' &&
        [1, 2, 3, 4].map((n) => (
          <div className="deed-row" key={n}>
            <span>{t('withRails', { n })}</span>
            <b>{money(RAIL_RENT * 2 ** (n - 1))}</b>
          </div>
        ))}
      {sp.kind === 'utility' && (
        <>
          <div className="deed-row">
            <span>{t('withOneUtil')}</span>
            <b>{t('times4')}</b>
          </div>
          <div className="deed-row">
            <span>{t('withBothUtil')}</span>
            <b>{t('times10')}</b>
          </div>
        </>
      )}
      {ownerName && <div className="deed-owner">{t('ownerX', { name: ownerName })}</div>}
    </div>
  );
}
