import { House, Hotel } from './Building';
import type { ReactNode } from 'react';
import { BOARD, GROUP_COLORS, gridPos, sideOf, type Space } from '../data/board';
import type { GameState } from '../engine/types';
import { Token } from './Token';
import { useCosmetics } from './Cosmetics';
import './Board.css';
import { dir, t } from '../i18n';
import { edition, editionLang, money } from '../data/editions';

const ICONS: Record<NonNullable<Space['icon']>, string> = {
  train: '🚂',
  bulb: '💡',
  tap: '🚰',
  ring: '💍',
  chest: '🧰',
};

/** A small wooden treasure chest with gold bands, for the "תיבת המזל" squares. */
function ChestIcon() {
  return (
    <svg viewBox="0 0 32 26" aria-hidden="true">
      <path d="M3 11 C3 4 9 2 16 2 C23 2 29 4 29 11 Z" fill="#b5652f" stroke="#3f1d05" strokeWidth="1.2" />
      <rect x="3" y="11" width="26" height="13" rx="1.5" fill="#8b4513" stroke="#3f1d05" strokeWidth="1.2" />
      <rect x="3" y="10" width="26" height="2.6" fill="#e0a526" stroke="#7a4a00" strokeWidth="0.6" />
      <rect x="6.5" y="2.6" width="3" height="21.4" fill="#e0a526" stroke="#7a4a00" strokeWidth="0.6" />
      <rect x="22.5" y="2.6" width="3" height="21.4" fill="#e0a526" stroke="#7a4a00" strokeWidth="0.6" />
      <rect x="13.5" y="9" width="5" height="6" rx="1" fill="#ffd23f" stroke="#7a4a00" strokeWidth="0.7" />
      <rect x="15.4" y="11.2" width="1.2" height="2.2" rx="0.5" fill="#5c3500" />
    </svg>
  );
}

/** The red car of the free-parking corner, drawn in the game's cartoon style. */
function ParkingCar() {
  return (
    <svg viewBox="0 0 120 70" aria-hidden="true">
      {/* motion lines */}
      <path d="M104 30h12M106 37h10" stroke="#e3001b" strokeWidth="3" strokeLinecap="round" />
      {/* body */}
      <path
        d="M10 44c0-8 4-12 12-13l14-2 12-14c2-2 4-3 7-3h24c3 0 5 1 7 3l11 14 8 1c6 1 9 5 9 11v6c0 2-2 4-4 4H14c-2 0-4-2-4-4z"
        fill="#e3001b"
        stroke="#3a0008"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* roof shine and windows */}
      <path d="M52 17h12v13H41z" fill="#bfe8ff" stroke="#3a0008" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M69 17h10c2 0 3 1 4 2l9 11H69z" fill="#bfe8ff" stroke="#3a0008" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M47 27l6-8M73 27l4-8" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      {/* door line, handle, lights */}
      <path d="M66 31v18" stroke="#3a0008" strokeWidth="2" />
      <rect x="55" y="35" width="7" height="2.5" rx="1.2" fill="#3a0008" />
      <rect x="10" y="37" width="7" height="7" rx="3" fill="#ffd23f" stroke="#3a0008" strokeWidth="2" />
      <rect x="105" y="41" width="5" height="6" rx="1.5" fill="#fff" stroke="#3a0008" strokeWidth="2" />
      {/* wheels */}
      {[33, 89].map((x) => (
        <g key={x}>
          <circle cx={x} cy="52" r="10" fill="#1b1b1b" />
          <circle cx={x} cy="52" r="6" fill="#fff" />
          <circle cx={x} cy="52" r="2.6" fill="#e3001b" />
        </g>
      ))}
      {/* the road */}
      <path d="M4 66h112" stroke="#1b1b1b" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function SpaceFace({ sp }: { sp: Space }) {
  if (sp.kind === 'property') {
    return (
      <>
        <div className={`strip g-${sp.group}`} style={{ background: GROUP_COLORS[sp.group!] }}>
          {sp.city}
        </div>
        <div className="sp-name">{sp.name}</div>
        <div className="sp-price">{money(sp.price!)}</div>
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
      {sp.icon === 'chest' ? (
        <div className="sp-icon sp-chest">
          <ChestIcon />
        </div>
      ) : (
        sp.icon && <div className="sp-icon">{ICONS[sp.icon]}</div>
      )}
      {sp.price && <div className="sp-price">{money(sp.price)}</div>}
      {sp.kind === 'tax' && <div className="sp-price">{money(sp.amount!)}</div>}
    </>
  );
}

function Corner({ sp }: { sp: Space }) {
  switch (sp.kind) {
    case 'go':
      return (
        <div className="corner-inner go">
          <small>{edition().corners.goNote}</small>
          <b>{edition().corners.go}</b>
          <span className="go-arrow" />
        </div>
      );
    case 'jail':
      return (
        <div className="corner-inner">
          <div className="jail-cell">
            <b>{edition().corners.jail}</b>
          </div>
          <b>{edition().corners.visiting}</b>
        </div>
      );
    case 'parking':
      return (
        <div className="corner-inner parking">
          <b>{edition().corners.parking1}</b>
          <b>{edition().corners.parking2}</b>
          <span className="parking-car">
            <ParkingCar />
          </span>
        </div>
      );
    default:
      return (
        <div className="corner-inner">
          <b>{edition().corners.toJail1}</b>
          <span className="corner-icon">👮</span>
          <b>{edition().corners.toJail2}</b>
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
  /** a space to light up while its money animation plays */
  highlight?: { space: number; tone: 'gain' | 'loss'; badge?: string } | null;
}

export function Board({ game, shown, onSpace, center, highlight }: Props) {
  const { skinFor, board } = useCosmetics();
  // the squares speak the game's edition, whatever the menus' language
  const edLang = editionLang();
  const edDir = dir(edLang);
  return (
    <div className={`board ${board}`} dir="ltr">
      {BOARD.map((sp) => {
        const [row, col] = gridPos(sp.id);
        const side = sideOf(sp.id);
        const st = game.props[sp.id];
        const owner = st.owner !== null ? game.players[st.owner] : null;
        const here = game.players.filter((p) => !p.bankrupt && shown[p.id] === sp.id);
        return (
          <button
            key={sp.id}
            className={`space side-${side}${sp.id % 10 === 0 ? ` corner corner-${sp.id}` : ''}${owner ? ' owned' : ''}${
              highlight?.space === sp.id ? ` glow glow-${highlight.tone}` : ''
            }`}
            style={{ gridRow: row, gridColumn: col, ...(owner ? { ['--owner' as string]: owner.color } : {}) }}
            onClick={() => onSpace(sp.id)}
            aria-label={owner ? `${sp.name}, ${t('ownedBy', { name: owner.name })}` : sp.name}
          >
            <div className={`face${st.mortgaged ? ' mortgaged' : ''}${st.houses > 0 ? ' has-bld' : ''}`} dir={edDir}>
              {side === 'corner' ? <Corner sp={sp} /> : <SpaceFace sp={sp} />}
              {st.houses > 0 && (
                <div className="buildings">
                  {st.houses === 5 ? (
                    <Hotel key="hotel" className="pop" />
                  ) : (
                    Array.from({ length: st.houses }, (_, i) => <House key={i} className="pop" />)
                  )}
                </div>
              )}
              {owner && (
                <span className="owner-badge" title={t('ownedBy', { name: owner.name })}>
                  <Token token={owner.token} color="#fff" size="1em" />
                </span>
              )}
              {st.mortgaged && <span className="mort-tag">{t('mortgaged', {}, edLang)}</span>}
            </div>
            {highlight?.space === sp.id && highlight.badge && (
              <span key={highlight.badge} dir="ltr" className={`space-badge ${highlight.tone}`}>
                {highlight.badge}
              </span>
            )}
            {here.length > 0 && (
              <div className="tokens">
                {here.map((p) => (
                  <Token key={p.id} token={p.token} color={p.color} active={p.id === game.current} skin={skinFor(p.id)} />
                ))}
              </div>
            )}
          </button>
        );
      })}
      <div className="board-center">
        <div className="plaque" dir={edDir}>
          <span className={edLang === 'ja' ? 'long' : undefined}>{t('appName', {}, edLang)}</span>
          <div className="plaque-pot">
            <b className="pot-label">{t('lottoPotIcon', {}, edLang)}</b>
            <b key={game.pot} className="pot-amount" dir="ltr">
              {money(game.pot)}
            </b>
          </div>
          <i className="mascot">🎩</i>
        </div>
        {/* the two card decks, as real-looking stacks */}
        <div className="deck deck-chest">
          <i className="deck-under" />
          <i className="deck-under" />
          <div className="deck-card">
            <span className="deck-art">
              <ChestIcon />
            </span>
            <span className="deck-label">{edition().chestName}</span>
          </div>
        </div>
        <div className="deck deck-chance">
          <i className="deck-under" />
          <i className="deck-under" />
          <div className="deck-card">
            <span className="deck-q">?</span>
            <span className="deck-label">{edition().chanceName}</span>
          </div>
        </div>
        {center}
      </div>
    </div>
  );
}
