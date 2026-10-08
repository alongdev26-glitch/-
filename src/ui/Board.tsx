import { House, Hotel } from './Building';
import { memo, useCallback, useRef, type ReactNode } from 'react';
import { BOARD, GROUP_COLORS, gridPos, sideOf, type Space } from '../data/board';
import type { GameState, TokenId } from '../engine/types';
import { Token } from './Token';
import { useCosmetics } from './Cosmetics';
import './Board.css';
import { dir, t, type Lang } from '../i18n';
import { edition, editionLang, money } from '../data/editions';
import { TrainIcon } from './TrainIcon';

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
      ) : sp.icon === 'train' ? (
        <div className="sp-icon sp-chest sp-train">
          <TrainIcon />
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

// The board's grid: corners are 1.55 wide, the other squares 1, in 12.1 in all.
const C = 1.55;
const TOTAL = 2 * C + 9;
/** the center of grid track 1..11, as a share of the board */
const trackCenter = (n: number) => (n === 1 ? C / 2 : n === 11 ? TOTAL - C / 2 : C + n - 1.5) / TOTAL;

/**
 * The tokens ride on their own layer above the squares, so a step glides from one
 * square to the next (transform only, done by the GPU) instead of jumping.
 */
function TokenLayer({ game, shown, skinFor }: { game: GameState; shown: number[]; skinFor: (id: number) => string }) {
  const last = useRef<number[]>(shown);
  const prev = last.current;
  last.current = shown;
  const live = game.players.filter((p) => !p.bankrupt);
  return (
    <div className="token-layer" aria-hidden="true">
      {live.map((p) => {
        const at = shown[p.id];
        const [row, col] = gridPos(at);
        // fan out players who share a square
        const mates = live.filter((q) => shown[q.id] === at);
        const k = mates.indexOf(p);
        const spread = (k - (mates.length - 1) / 2) * 1.4;
        const x = trackCenter(col) * 100 + spread;
        const y = trackCenter(row) * 100 + (mates.length > 2 ? (k % 2 ? 1 : -1) : 0);
        const from = prev[p.id] ?? at;
        const far = ((at - from + 40) % 40) > 1 && at !== from;
        return (
          <div
            key={p.id}
            className={`token-ride${far ? ' far' : ''}`}
            style={{ transform: `translate(${x}%, ${y}%)`, zIndex: p.id === game.current ? 2 : 1 }}
          >
            <span key={at} className="token-hop">
              <Token token={p.token} color={p.color} active={p.id === game.current} skin={skinFor(p.id)} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** One square. Memoized: a token step only redraws the squares it leaves and enters. */
const Square = memo(function Square({
  id,
  label,
  ownerColor,
  ownerToken,
  ownerTitle,
  houses,
  mortgaged,
  glow,
  badge,
  edLang,
  edDir,
  onSpace,
}: {
  id: number;
  label: string;
  ownerColor?: string;
  ownerToken?: TokenId;
  ownerTitle?: string;
  houses: number;
  mortgaged: boolean;
  glow?: 'gain' | 'loss';
  badge?: string;
  edLang: Lang;
  edDir: 'rtl' | 'ltr';
  onSpace: (id: number) => void;
}) {
  const sp = BOARD[id];
  const [row, col] = gridPos(id);
  const side = sideOf(id);
  return (
    <button
      className={`space side-${side}${id % 10 === 0 ? ` corner corner-${id}` : ''}${ownerColor ? ' owned' : ''}${
        glow ? ` glow glow-${glow}` : ''
      }`}
      style={{ gridRow: row, gridColumn: col, ...(ownerColor ? { ['--owner' as string]: ownerColor } : {}) }}
      onClick={() => onSpace(id)}
      aria-label={label}
    >
      <div className={`face${mortgaged ? ' mortgaged' : ''}${houses > 0 ? ' has-bld' : ''}`} dir={edDir}>
        {side === 'corner' ? <Corner sp={sp} /> : <SpaceFace sp={sp} />}
        {houses > 0 && (
          <div className="buildings">
            {houses === 5 ? (
              <Hotel key="hotel" className="pop" />
            ) : (
              Array.from({ length: houses }, (_, i) => <House key={i} className="pop" />)
            )}
          </div>
        )}
        {ownerToken && (
          <span className="owner-badge" title={ownerTitle}>
            <Token token={ownerToken} color="#fff" size="1em" />
          </span>
        )}
        {mortgaged && <span className="mort-tag">{t('mortgaged', {}, edLang)}</span>}
      </div>
      {glow && badge && (
        <span key={badge} dir="ltr" className={`space-badge ${glow}`}>
          {badge}
        </span>
      )}
    </button>
  );
});

/** The middle of the board: the name plaque, the pot and the two decks. */
const Center = memo(function Center({ pot, edLang, edDir }: { pot: number; edLang: Lang; edDir: 'rtl' | 'ltr' }) {
  return (
    <>
      <div className="plaque" dir={edDir}>
        <span className={edLang === 'ja' ? 'long' : undefined}>{t('appName', {}, edLang)}</span>
        <div className="plaque-pot">
          <b className="pot-label">{t('lottoPotIcon', {}, edLang)}</b>
          <b key={pot} className="pot-amount" dir="ltr">
            {money(pot)}
          </b>
        </div>
        <i className="mascot">🏙️</i>
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
    </>
  );
});

export function Board({ game, shown, onSpace, center, highlight }: Props) {
  const { skinFor, board } = useCosmetics();
  // the squares speak the game's edition, whatever the menus' language
  const edLang = editionLang();
  const edDir = dir(edLang);
  // a stable click handler, so the memoized squares are not redrawn for it
  const clickRef = useRef(onSpace);
  clickRef.current = onSpace;
  const click = useCallback((id: number) => clickRef.current(id), []);
  return (
    <div className={`board ${board}`} dir="ltr">
      {BOARD.map((sp) => {
        const st = game.props[sp.id];
        const owner = st.owner !== null ? game.players[st.owner] : null;
        const ownedBy = owner ? t('ownedBy', { name: owner.name }) : '';
        const lit = highlight?.space === sp.id ? highlight : null;
        return (
          <Square
            key={sp.id}
            id={sp.id}
            label={owner ? `${sp.name}, ${ownedBy}` : sp.name}
            ownerColor={owner?.color}
            ownerToken={owner?.token}
            ownerTitle={owner ? ownedBy : undefined}
            houses={st.houses}
            mortgaged={st.mortgaged}
            glow={lit?.tone}
            badge={lit?.badge}
            edLang={edLang}
            edDir={edDir}
            onSpace={click}
          />
        );
      })}
      <TokenLayer game={game} shown={shown} skinFor={skinFor} />
      <div className="board-center">
        <Center pot={game.pot} edLang={edLang} edDir={edDir} />
        {center}
      </div>
    </div>
  );
}
