import { BOARD } from '../data/board';
import type { GameState } from '../engine/types';
import { OWNABLE_COUNT, SETS } from './groups';
import './tabs.css';

/** Page 3: everything nobody bought yet, and the lotto pot. */
export function MarketTab({ game, onSpace }: { game: GameState; onSpace: (id: number) => void }) {
  const sets = SETS.map((set) => ({ ...set, free: set.ids.filter((id) => game.props[id].owner === null) })).filter(
    (s) => s.free.length > 0,
  );
  const freeCount = sets.reduce((n, s) => n + s.free.length, 0);

  return (
    <div className="page">
      <div className="page-head">
        <h2 className="page-title">נכסים פנויים</h2>
        <div className="stat gold">
          <small>💰 קופת הלוטו</small>
          <b>ש"ח {game.pot}</b>
        </div>
        <div className="stat">
          <small>עוד לא נקנו</small>
          <b>
            {freeCount} / {OWNABLE_COUNT}
          </b>
        </div>
      </div>
      <div className="note">מסים, קנסות וכרטיסי תשלום נכנסים לקופה. מי שנוחת על "חניה חופשית" לוקח את כולה.</div>

      {sets.length === 0 && <div className="empty">כל הנכסים כבר נקנו.</div>}

      {sets.map((set) => (
        <section className="group" key={set.key}>
          <div className="group-head" style={{ background: set.color }}>
            <span>{set.title}</span>
            <span>
              {set.free.length} פנויים מתוך {set.ids.length}
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
                      ? `שכירות ש"ח ${sp.rent![0]} · עם מלון ש"ח ${sp.rent![5]}`
                      : sp.kind === 'railroad'
                        ? 'שכירות ש"ח 25 עד 200'
                        : 'פי 4 או פי 10 מהקוביות'}
                  </small>
                </button>
                <div className="row-tags">
                  <span className="tag">מחיר ש"ח {sp.price}</span>
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
