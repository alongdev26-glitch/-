import { useEffect, useState } from 'react';
import { House, Hotel } from '../ui/Building';
import { BOARD, FEE_ROUNDS } from '../data/board';
import {
  bankSaleValue,
  canSellToBank,
  canBuild,
  canSell,
  canUnmortgage,
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
import { t } from '../i18n';
import { money } from '../data/editions';

interface Props {
  game: GameState;
  me: number;
  myTurn: boolean;
  act: (a: Action) => void;
  onSpace: (id: number) => void;
  /** open the trades tab (to sell to another player while in debt) */
  onTrade?: () => void;
  /** a free property is waiting to be bought: go back to the buy dialog */
  onBackToBuy?: () => void;
}

/** Page 2: my cash and everything I own, with build / mortgage controls. */
export function MyPropsTab({ game, me, myTurn, act, onSpace, onTrade, onBackToBuy }: Props) {
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
        <h2 className="page-title">{t('tabMine')}</h2>
        <div className="stat">
          <small>{t('cash')}</small>
          <b>{money(player.money)}</b>
        </div>
        <div className="stat">
          <small>{t('properties')}</small>
          <b>{sets.reduce((n, s) => n + s.mine.length, 0)}</b>
        </div>
        {game.rules.mortgage && (
          <div className="stat gold">
            <small>{t('nextFee')}</small>
            <b>{money(feeDue(game, me))}</b>
            <small>
              {roundsToFee(game) === null ? t('feeStartsAfter') : t('inRounds', { n: roundsToFee(game)! })}
            </small>
          </div>
        )}
        {player.jailCards.length > 0 && (
          <div className="stat">
            <small>{t('jailCardsTitle')}</small>
            <b>{player.jailCards.length}</b>
          </div>
        )}
      </div>

      {onBackToBuy && ph.t === 'buy' && (
        <div className="confirm">
          <span>
            {t('waitsToBuy', { space: BOARD[ph.space].name, price: money(BOARD[ph.space].price!), money: money(player.money) })}
          </span>
          <button className="btn btn-red btn-sm" onClick={onBackToBuy}>
            {t('backToBuy')}
          </button>
        </div>
      )}

      {debt > 0 && (
        <div className="confirm">
          <span>
            {t('openDebt', { debt: money(debt), money: money(player.money) })}
          </span>
          <button className="btn btn-red btn-sm" disabled={player.money < debt} onClick={() => act({ type: 'PAY_DEBT' })}>
            {t('pay')}
          </button>
          {onTrade && (
            <button className="btn btn-gold btn-sm" onClick={onTrade}>
              {t('sellToPlayer')}
            </button>
          )}
          <button className="btn btn-black btn-sm" onClick={() => act({ type: 'BANKRUPT' })}>
            {t('bankrupt')}
          </button>
          {player.money < debt && (
            <small className="debt-hint">
              {t('debtTip')}
            </small>
          )}
        </div>
      )}

      <div className="note">
        {t('buildTip')}
      </div>

      {sets.length === 0 && <div className="empty">{t('noPropsYet')}</div>}

      {sets.map((set) => {
        const full = set.mine.length === set.ids.length;
        return (
          <section className="group" key={set.key}>
            <div className="group-head" style={{ background: set.color }}>
              <span>{set.title}</span>
              <span>
                {set.mine.length}/{set.ids.length}
                {full && set.key !== 'railroad' && set.key !== 'utility' ? t('fullSet') : ''}
              </span>
            </div>
            {set.mine.map((id) => {
              const sp = BOARD[id];
              const st = game.props[id];
              const rent =
                sp.kind === 'utility'
                  ? t('timesDice', { n: game.props[12].owner === me && game.props[28].owner === me ? 10 : 4 })
                  : money(rentFor(game, id, 7));
              return (
                <div className="row" key={id}>
                  <button className="row-main" onClick={() => onSpace(id)}>
                    <b>{sp.name}</b>
                    <small>
                      {t('rentNow', { rent: st.mortgaged ? t('noneMortgaged') : rent })}
                      {game.rules.mortgage && !st.mortgaged && t('mortgageFee', { amount: money(feeFor(id)) })}
                    </small>
                  </button>
                  <div className="row-tags">
                    {st.houses > 0 && st.houses < 5 && (
                      <span className="tag green tag-bld">
                        {Array.from({ length: st.houses }, (_, k) => (
                          <House key={k} />
                        ))}
                        {t('houses', { n: st.houses })}
                      </span>
                    )}
                    {st.houses === 5 && (
                      <span className="tag red tag-bld">
                        <Hotel />
                        {t('hotel')}
                      </span>
                    )}
                    {st.mortgaged && (
                      <span className="tag red">{t('mortgagedNoRent')}</span>
                    )}
                    {sp.kind === 'property' && !ownsGroup(game, me, sp.group!) && <span className="tag">{t('missingForSet')}</span>}
                  </div>
                  {myTurn && (
                    <div className="row-btns">
                      {sp.kind === 'property' && (
                        <>
                          <button className="btn btn-red" disabled={!canBuild(game, me, id)} onClick={() => act({ type: 'BUILD', space: id })}>
                            {t('build', { n: money(sp.houseCost!) })}
                          </button>
                          <button className="btn btn-white" disabled={!canSell(game, me, id)} onClick={() => act({ type: 'SELL', space: id })}>
                            {t('sellBuilding', { n: money(sellValue(id)) })}
                          </button>
                        </>
                      )}
                      <button
                        className={`btn ${confirmId === id ? 'btn-red' : 'btn-white'}`}
                        disabled={!canSellToBank(game, me, id)}
                        title={canSellToBank(game, me, id) ? undefined : t('sellHousesFirst')}
                        onClick={() => sellToBank(id)}
                      >
                        {confirmId === id ? t('sureSell') : t('sellToBank', { n: money(bankSaleValue(game, id)) })}
                      </button>
                      {st.mortgaged && (
                        <button className="btn btn-gold" disabled={!canUnmortgage(game, me, id)} onClick={() => act({ type: 'UNMORTGAGE', space: id })}>
                          {t('redeem', { n: money(unmortgageCost(id)) })}
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
            ? t('feeRule', { n: FEE_ROUNDS })
            : t('noMortgageGame')}
          {t('bankSaleRule')}
          {!myTurn && t('onlyYourTurn')}
        </div>
      )}
    </div>
  );
}
