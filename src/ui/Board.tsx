import type { ReactNode } from 'react';
import { BOARD, GROUP_COLORS, gridPos, sideOf, type Space } from '../data/board';
import type { GameState } from '../engine/types';
import { Token } from './Token';
import './Board.css';

const ICONS: Record<NonNullable<Space['icon']>, string> = {
  train: '🚂',
  bulb: '💡',
  tap: '🚰',
  ring: '💍',
  chest: '🧰',
};

function SpaceFace({ sp }: { sp: Space }) {
  if (sp.kind === 'property') {
    return (
      <>
        <div className="strip" style={{ background: GROUP_COLORS[sp.group!] }}>
          {sp.city}
        </div>
        <div className="sp-name">{sp.name}</div>
        <div className="sp-price">מחיר ש"ח {sp.price}</div>
      </>
    );
  }
  if (sp.kind === 'chance') {
    return (
      <>
        <div className="sp-name">{sp.name}</div>
        <div className="sp-q" style={{ color: sp.qColor }}>
          ?
        </div>
      </>
    );
  }
  return (
    <>
      <div className="sp-name">{sp.name}</div>
      {sp.icon && <div className="sp-icon">{ICONS[sp.icon]}</div>}
      {sp.price && <div className="sp-price">מחיר ש"ח {sp.price}</div>}
      {sp.kind === 'tax' && <div className="sp-price">שלם ש"ח {sp.amount}</div>}
    </>
  );
}

function Corner({ sp }: { sp: Space }) {
  switch (sp.kind) {
    case 'go':
      return (
        <div className="corner-inner go">
          <small>כל העובר מקבל ש"ח 200</small>
          <b>דרך צלחה</b>
          <span className="go-arrow" />
        </div>
      );
    case 'jail':
      return (
        <div className="corner-inner">
          <div className="jail-cell">
            <b>בכלא</b>
          </div>
          <b>רק מבקר</b>
        </div>
      );
    case 'parking':
      return (
        <div className="corner-inner">
          <b>חניה</b>
          <span className="corner-icon">🚗</span>
          <b>חופשית</b>
        </div>
      );
    default:
      return (
        <div className="corner-inner">
          <b>גש</b>
          <span className="corner-icon">👮</span>
          <b>לכלא</b>
        </div>
      );
  }
}

interface Props {
  game: GameState;
  /** animated token positions, per player */
  shown: number[];
  onSpace: (id: number) => void;
  center?: ReactNode;
}

export function Board({ game, shown, onSpace, center }: Props) {
  return (
    <div className="board" dir="ltr">
      {BOARD.map((sp) => {
        const [row, col] = gridPos(sp.id);
        const side = sideOf(sp.id);
        const st = game.props[sp.id];
        const owner = st.owner !== null ? game.players[st.owner] : null;
        const here = game.players.filter((p) => !p.bankrupt && shown[p.id] === sp.id);
        return (
          <button
            key={sp.id}
            className={`space side-${side}${sp.id % 10 === 0 ? ` corner corner-${sp.id}` : ''}`}
            style={{ gridRow: row, gridColumn: col }}
            onClick={() => onSpace(sp.id)}
            aria-label={sp.name}
          >
            <div className={`face${st.mortgaged ? ' mortgaged' : ''}`} dir="rtl">
              {side === 'corner' ? <Corner sp={sp} /> : <SpaceFace sp={sp} />}
              {st.houses > 0 && (
                <div className="buildings">
                  {st.houses === 5 ? (
                    <i className="hotel" />
                  ) : (
                    Array.from({ length: st.houses }, (_, i) => <i key={i} className="house" />)
                  )}
                </div>
              )}
              {owner && <i className="owner-flag" style={{ background: owner.color }} />}
              {st.mortgaged && <span className="mort-tag">ממושכן</span>}
            </div>
            {here.length > 0 && (
              <div className="tokens">
                {here.map((p) => (
                  <Token key={p.id} token={p.token} color={p.color} active={p.id === game.current} />
                ))}
              </div>
            )}
          </button>
        );
      })}
      <div className="board-center">
        <div className="plaque" dir="rtl">
          <span>טייקון</span>
          <i className="mascot">🎩</i>
        </div>
        <div className="deck deck-chest">
          <span>תיבת המזל</span>
        </div>
        <div className="deck deck-chance">
          <span>הפתעה</span>
        </div>
        {center}
      </div>
    </div>
  );
}
