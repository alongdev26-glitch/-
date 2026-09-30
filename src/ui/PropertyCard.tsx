import { BOARD, GROUP_COLORS } from '../data/board';
import './PropertyCard.css';

const RENT_LABELS = ['שכר דירה', 'עם בית 1', 'עם 2 בתים', 'עם 3 בתים', 'עם 4 בתים', 'עם מלון'];

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
        <span className="deed-icon">{sp.kind === 'railroad' ? '🚂' : sp.icon === 'bulb' ? '💡' : '🚰'}</span>
        <b>{sp.name}</b>
      </div>
    );

  return (
    <div className="deed">
      {head}
      <div className="deed-row hl">
        <span>מחיר</span>
        <b>ש"ח {sp.price}</b>
      </div>
      <div className="deed-row hl">
        <span>משכנתא</span>
        <b>ש"ח {sp.price! / 2}</b>
      </div>
      {sp.kind === 'property' && (
        <>
          {sp.rent!.map((r, i) => (
            <div className="deed-row" key={i}>
              <span>
                {RENT_LABELS[i]}
                {i > 0 && i < 5 && <i className="mini-house">{i}</i>}
                {i === 5 && <i className="mini-hotel" />}
              </span>
              <b>ש"ח {r}</b>
            </div>
          ))}
          <div className="deed-row">
            <span>עם כל הצבע (בלי בתים)</span>
            <b>ש"ח {sp.rent![0] * 2}</b>
          </div>
          <div className="deed-foot">
            מחיר בית ש"ח {sp.houseCost} · מחיר מלון ש"ח {sp.houseCost}
          </div>
        </>
      )}
      {sp.kind === 'railroad' &&
        [1, 2, 3, 4].map((n) => (
          <div className="deed-row" key={n}>
            <span>עם {n === 1 ? 'רכבת אחת' : `${n} רכבות`}</span>
            <b>ש"ח {25 * 2 ** (n - 1)}</b>
          </div>
        ))}
      {sp.kind === 'utility' && (
        <>
          <div className="deed-row">
            <span>עם חברה אחת</span>
            <b>פי 4 מהקוביות</b>
          </div>
          <div className="deed-row">
            <span>עם שתי החברות</span>
            <b>פי 10 מהקוביות</b>
          </div>
        </>
      )}
      {ownerName && <div className="deed-owner">בבעלות: {ownerName}</div>}
    </div>
  );
}
