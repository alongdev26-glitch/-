import { BOARD, MORTGAGE_ROUNDS } from '../data/board';
import {
  canBuild,
  canMortgage,
  canSell,
  canUnmortgage,
  mortgageValue,
  ownsGroup,
  rentFor,
  sellValue,
  unmortgageCost,
} from '../engine/rules';
import type { Action, GameState } from '../engine/types';
import { SETS } from './groups';
import './tabs.css';

interface Props {
  game: GameState;
  me: number;
  myTurn: boolean;
  act: (a: Action) => void;
  onSpace: (id: number) => void;
}

/** Page 2: my cash and everything I own, with build / mortgage controls. */
export function MyPropsTab({ game, me, myTurn, act, onSpace }: Props) {
  const player = game.players[me];
  const sets = SETS.map((set) => ({ ...set, mine: set.ids.filter((id) => game.props[id].owner === me) })).filter(
    (s) => s.mine.length > 0,
  );
  const ph = game.phase;
  const debt = ph.t === 'debt' && game.current === me ? ph.owed.reduce((a, o) => a + o.amount, 0) : 0;

  return (
    <div className="page">
      <div className="page-head">
        <h2 className="page-title">הנכסים שלי</h2>
        <div className="stat">
          <small>מזומן</small>
          <b>ש"ח {player.money}</b>
        </div>
        <div className="stat">
          <small>נכסים</small>
          <b>{sets.reduce((n, s) => n + s.mine.length, 0)}</b>
        </div>
        {player.jailCards.length > 0 && (
          <div className="stat">
            <small>כרטיסי יציאה מהכלא</small>
            <b>{player.jailCards.length}</b>
          </div>
        )}
      </div>

      {debt > 0 && (
        <div className="confirm">
          <span>
            חוב פתוח: ש"ח {debt}. יש לך ש"ח {player.money}.
          </span>
          <button className="btn btn-red btn-sm" disabled={player.money < debt} onClick={() => act({ type: 'PAY_DEBT' })}>
            שלם
          </button>
          <button className="btn btn-black btn-sm" onClick={() => act({ type: 'BANKRUPT' })}>
            פשיטת רגל
          </button>
        </div>
      )}

      {sets.length === 0 && <div className="empty">עוד לא קנית נכסים. נחת על נכס פנוי בלוח כדי לקנות אותו.</div>}

      {sets.map((set) => {
        const full = set.mine.length === set.ids.length;
        return (
          <section className="group" key={set.key}>
            <div className="group-head" style={{ background: set.color }}>
              <span>{set.title}</span>
              <span>
                {set.mine.length}/{set.ids.length}
                {full && set.key !== 'railroad' && set.key !== 'utility' ? ' · סדרה מלאה!' : ''}
              </span>
            </div>
            {set.mine.map((id) => {
              const sp = BOARD[id];
              const st = game.props[id];
              const rent =
                sp.kind === 'utility'
                  ? `פי ${game.props[12].owner === me && game.props[28].owner === me ? 10 : 4} מהקוביות`
                  : `ש"ח ${rentFor(game, id, 7)}`;
              return (
                <div className="row" key={id}>
                  <button className="row-main" onClick={() => onSpace(id)}>
                    <b>{sp.name}</b>
                    <small>שכירות עכשיו: {st.mortgaged ? 'אין (ממושכן)' : rent}</small>
                  </button>
                  <div className="row-tags">
                    {st.houses > 0 && st.houses < 5 && <span className="tag green">🏠 ×{st.houses}</span>}
                    {st.houses === 5 && <span className="tag red">🏨 מלון</span>}
                    {st.mortgaged && (
                      <span className={`tag ${(st.mortgageLeft ?? MORTGAGE_ROUNDS) <= 2 ? 'red' : 'gold'}`}>
                        ממושכן · נשארו {st.mortgageLeft ?? MORTGAGE_ROUNDS} סבבים
                      </span>
                    )}
                    {sp.kind === 'property' && !ownsGroup(game, me, sp.group!) && <span className="tag">חסר לסדרה</span>}
                  </div>
                  {myTurn && (
                    <div className="row-btns">
                      {sp.kind === 'property' && (
                        <>
                          <button className="btn btn-red" disabled={!canBuild(game, me, id)} onClick={() => act({ type: 'BUILD', space: id })}>
                            בנה ({sp.houseCost})
                          </button>
                          <button className="btn btn-white" disabled={!canSell(game, me, id)} onClick={() => act({ type: 'SELL', space: id })}>
                            מכור מבנה (+{sellValue(id)})
                          </button>
                        </>
                      )}
                      {st.mortgaged ? (
                        <button className="btn btn-gold" disabled={!canUnmortgage(game, me, id)} onClick={() => act({ type: 'UNMORTGAGE', space: id })}>
                          פדה ({unmortgageCost(id)})
                        </button>
                      ) : (
                        <button className="btn btn-black" disabled={!canMortgage(game, me, id)} onClick={() => act({ type: 'MORTGAGE', space: id })}>
                          משכן (+{mortgageValue(id)})
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        );
      })}
      {sets.length > 0 && (
        <div className="note">
          משכנתא היא ל-{MORTGAGE_ROUNDS} סבבים. נכס שלא נפדה בזמן חוזר לבנק.
          {!myTurn && ' בנייה ומשכנתא אפשריות רק בתור שלך.'}
        </div>
      )}
    </div>
  );
}
