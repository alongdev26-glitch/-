import { useEffect, useState } from 'react';
import { BOARD, GROUP_COLORS } from '../data/board';
import { blockRoundsLeft, canTradeProp, emptySide, ownedBy, sideIsEmpty } from '../engine/rules';
import type { Action, GameState, TradeSide } from '../engine/types';
import { Token } from '../ui/Token';
import './tabs.css';
import { t } from '../i18n';
import { money } from '../data/editions';

/** A counter-offer being written: who it goes to and the starting terms. */
export interface TradeDraft {
  to: number;
  give: TradeSide;
  get: TradeSide;
  counter: boolean;
}

interface Props {
  game: GameState;
  me: number;
  /** may propose now (my turn, before or after rolling) */
  canPropose: boolean;
  act: (a: Action) => void;
  draft: TradeDraft | null;
  onSent: () => void;
}

function Stepper({ value, max, onChange }: { value: number; max: number; onChange: (v: number) => void }) {
  const set = (v: number) => onChange(Math.max(0, Math.min(max, Math.round(v))));
  return (
    <div className="stepper">
      <button className="btn btn-white btn-sm" onClick={() => set(value - 50)}>
        −50
      </button>
      <button className="btn btn-white btn-sm" onClick={() => set(value - 10)}>
        −10
      </button>
      <input
        inputMode="numeric"
        aria-label={t('amount')}
        value={value}
        onChange={(e) => set(Number(e.target.value.replace(/\D/g, '')) || 0)}
      />
      <button className="btn btn-white btn-sm" onClick={() => set(value + 10)}>
        +10
      </button>
      <button className="btn btn-white btn-sm" onClick={() => set(value + 50)}>
        +50
      </button>
    </div>
  );
}

function SidePicker({
  game,
  owner,
  side,
  onChange,
}: {
  game: GameState;
  owner: number;
  side: TradeSide;
  onChange: (s: TradeSide) => void;
}) {
  const p = game.players[owner];
  const props = ownedBy(game, owner);
  const toggle = (id: number) =>
    onChange({ ...side, props: side.props.includes(id) ? side.props.filter((x) => x !== id) : [...side.props, id] });
  return (
    <div className="trade-side">
      {props.length === 0 && <div className="trade-empty">{t('noProps')}</div>}
      {props.map((id) => {
        const sp = BOARD[id];
        const ok = canTradeProp(game, owner, id);
        const on = side.props.includes(id);
        return (
          <button key={id} className={`trade-prop${on ? ' on' : ''}`} disabled={!ok} onClick={() => toggle(id)}>
            <i style={{ background: sp.group ? GROUP_COLORS[sp.group] : '#555' }} />
            <span className="tp-name">
              {sp.name}
              {game.props[id].mortgaged && <em>{t('mortgagedTag')}</em>}
              {!ok && <em>{t('housesInSet')}</em>}
            </span>
            <span className="tp-price">{money(sp.price!)}</span>
            <span className="tp-check">{on ? '✓' : ''}</span>
          </button>
        );
      })}
      <div className="trade-money">
        <span>{t('moneyHave', { money: money(p.money) })}</span>
        <Stepper value={side.money} max={p.money} onChange={(money) => onChange({ ...side, money })} />
      </div>
      {p.jailCards.length > 0 && (
        <div className="trade-money">
          <span>{t('jailCardsHave', { n: p.jailCards.length })}</span>
          <div className="seg">
            {Array.from({ length: p.jailCards.length + 1 }, (_, n) => (
              <button key={n} className={n === side.jailCards ? 'on' : ''} onClick={() => onChange({ ...side, jailCards: n })}>
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const summary = (side: TradeSide) => {
  const parts = side.props.map((id) => BOARD[id].name);
  if (side.money > 0) parts.push(money(side.money));
  if (side.jailCards > 0) parts.push(t('jailCardShort', { n: side.jailCards }));
  return parts.length ? parts.join(', ') : t('nothing');
};

/** Page 5: offer a deal to another player. */
export function TradeTab({ game, me, canPropose, act, draft, onSent }: Props) {
  const others = game.players.filter((p) => p.id !== me && !p.bankrupt);
  const [to, setTo] = useState<number>(draft?.to ?? others[0]?.id ?? -1);
  const [give, setGive] = useState<TradeSide>(draft?.give ?? emptySide());
  const [get, setGet] = useState<TradeSide>(draft?.get ?? emptySide());

  useEffect(() => {
    if (!draft) return;
    setTo(draft.to);
    setGive(draft.give);
    setGet(draft.get);
  }, [draft]);

  const counter = !!draft?.counter;
  const blockedFor = counter ? 0 : blockRoundsLeft(game, me, to);
  const allowed = counter || (canPropose && blockedFor === 0);
  const target = game.players[to];
  const inDebt = game.phase.t === 'debt' && game.current === me;
  const empty = sideIsEmpty(give) && sideIsEmpty(get);

  const pick = (id: number) => {
    setTo(id);
    setGet(emptySide());
  };

  const send = () => {
    act(counter ? { type: 'COUNTER_TRADE', give, get } : { type: 'PROPOSE_TRADE', to, give, get });
    setGive(emptySide());
    setGet(emptySide());
    onSent();
  };

  return (
    <div className="page">
      <h2 className="page-title">{counter ? t('counterOffer') : t('tabTrade')}</h2>
      {!canPropose && !counter && <div className="note">{t('tradeOnlyTurn')}</div>}
      {inDebt && <div className="note">{t('tradeInDebt')}</div>}

      {!counter && (
        <div className="trade-players">
          {others.map((p) => (
            <button
              key={p.id}
              className={`pchip trade-pick${p.id === to ? ' on' : ''}`}
              style={{ ['--pc' as string]: p.color }}
              onClick={() => pick(p.id)}
            >
              <Token token={p.token} color={p.color} size="20px" />
              <span className="pchip-name">{p.name}</span>
              <b className="pchip-money">
                {blockRoundsLeft(game, me, p.id) > 0 ? t('blockedYou', { n: blockRoundsLeft(game, me, p.id) }) : money(p.money)}
              </b>
            </button>
          ))}
        </div>
      )}

      {target && (
        <>
          <section className="group">
            <div className="group-head" style={{ background: game.players[me].color }}>
              <span>{t('iGive')}</span>
            </div>
            <SidePicker game={game} owner={me} side={give} onChange={setGive} />
          </section>
          <section className="group">
            <div className="group-head" style={{ background: target.color }}>
              <span>{t('iAskFrom', { name: target.name })}</span>
            </div>
            <SidePicker game={game} owner={to} side={get} onChange={setGet} />
          </section>
          <div className="trade-summary">
            <div>
              {t('youGiveX')} <b>{summary(give)}</b>
            </div>
            <div>
              {t('youGetX')} <b>{summary(get)}</b>
            </div>
            {blockedFor > 0 && (
              <div className="trade-blocked">
                {t('blockedTry', { name: target.name, n: blockedFor })}
              </div>
            )}
            <button className="btn btn-red" disabled={!allowed || empty} onClick={send}>
              {counter ? t('sendCounter', { name: target.name }) : t('sendOffer', { name: target.name })}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
