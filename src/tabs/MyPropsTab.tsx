import { useEffect, useState } from 'react';
import { House, Hotel } from '../ui/Building';
import { BOARD, FEE_ROUNDS } from '../data/board';
import {
  bankSaleValue,
  canSellToBank,
  canBuild,
  canMortgage,
  canSell,
  canUnmortgage,
  mortgageValue,
  ownsGroup,
  feeDue,
  feeFor,
  rentFor,
  roundsToFee,
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
  // Selling to the bank can't be undone, so it takes a second tap to confirm.
  const [confirmId, setConfirmId] = useState<number | null>(null);
  useEffect(() => {
    if (confirmId === null) return;
    const t = setTimeout(() => setConfirmId(null), 3000);
    return () => clearTimeout(t);
  }, [confirmId]);
  const sellToBank = (id: number) => {
    if (confirmId !== id) return setConfirmId(id);
    setConfirmId(null);
    act({ type: 'SELL_BANK', space: id });
  };

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
        {game.rules.mortgage && (
          <div className="stat gold">
            <small>תשלום המשכנתא הבא</small>
            <b>ש"ח {feeDue(game, me)}</b>
            <small>
              {roundsToFee(game) === null ? 'מתחיל אחרי הקנייה הראשונה' : `בעוד ${roundsToFee(game)} סבבים`}
            </small>
          </div>
        )}
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
          {player.money < debt && (
            <small className="debt-hint">
              אפשר למכור בתים{game.rules.mortgage ? ', למשכן' : ''} או למכור נכסים לבנק בחצי מחיר.
            </small>
          )}
        </div>
      )}

      <div className="note">
        🏠 בתים ומלון: כשיש לך את כל הרחובות באותה עיר, מופיע כאן כפתור "בנה". 4 בתים ואחריהם מלון, והבנייה חייבת להיות שווה בין הרחובות.
      </div>

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
                    <small>
                      שכירות עכשיו: {st.mortgaged ? 'אין (ממושכן)' : rent}
                      {game.rules.mortgage && !st.mortgaged && ` · משכנתא: ש"ח ${feeFor(id)}`}
                    </small>
                  </button>
                  <div className="row-tags">
                    {st.houses > 0 && st.houses < 5 && (
                      <span className="tag green tag-bld">
                        {Array.from({ length: st.houses }, (_, k) => (
                          <House key={k} />
                        ))}
                        {st.houses} {st.houses === 1 ? 'בית' : 'בתים'}
                      </span>
                    )}
                    {st.houses === 5 && (
                      <span className="tag red tag-bld">
                        <Hotel />
                        מלון
                      </span>
                    )}
                    {st.mortgaged && (
                      <span className="tag red">ממושכן · בלי שכירות</span>
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
                      <button
                        className={`btn ${confirmId === id ? 'btn-red' : 'btn-white'}`}
                        disabled={!canSellToBank(game, me, id)}
                        title={canSellToBank(game, me, id) ? undefined : 'קודם מכור את הבתים'}
                        onClick={() => sellToBank(id)}
                      >
                        {confirmId === id ? 'בטוח? מכור' : `מכור לבנק (+${bankSaleValue(game, id)})`}
                      </button>
                      {!game.rules.mortgage ? null : st.mortgaged ? (
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
          {game.rules.mortgage
            ? `כל ${FEE_ROUNDS} סבבים משלמים לקופת הלוטו חצי ממחיר כל נכס. נכס ממושכן לא משלם, אבל גם לא גובה שכירות.`
            : 'במשחק הזה אין משכנתא.'}
          {' אפשר למכור נכס בלי בתים לבנק בחצי ממחירו (נכס ממושכן תמורת 0), והוא חוזר להיות פנוי.'}
          {!myTurn && ' בנייה ומכירה אפשריות רק בתור שלך.'}
        </div>
      )}
    </div>
  );
}
