import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { TokenId } from '../engine/types';
import { tokenName } from '../data/tokens';
import { t } from '../i18n';
import { useWallet } from './Cosmetics';
import { Modal } from './Modal';
import { SKINS, itemName, setSkin, skinOf } from './shop';
import { sfx } from './sound';
import { Token } from './Token';
import './SkinPicker.css';

const HOLD_MS = 450;

/**
 * Press and hold on a character to change its skin: spread the returned handlers on the
 * character's button. A long press doesn't also count as a tap.
 */
export function useSkinPress() {
  const [open, setOpen] = useState<TokenId | null>(null);
  const timer = useRef(0);
  const held = useRef(false);
  const bind = (char: TokenId) => ({
    onPointerDown: (e: ReactPointerEvent) => {
      if (e.button > 0) return;
      held.current = false;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        held.current = true;
        navigator.vibrate?.(20);
        sfx.pop();
        setOpen(char);
      }, HOLD_MS);
    },
    onPointerUp: () => window.clearTimeout(timer.current),
    onPointerLeave: () => window.clearTimeout(timer.current),
    onPointerCancel: () => window.clearTimeout(timer.current),
    onContextMenu: (e: { preventDefault: () => void }) => e.preventDefault(),
    onClickCapture: (e: { preventDefault: () => void; stopPropagation: () => void }) => {
      if (held.current) {
        held.current = false;
        e.preventDefault();
        e.stopPropagation();
      }
    },
  });
  const sheet = open ? <SkinPicker char={open} onClose={() => setOpen(null)} /> : null;
  return { bind, sheet };
}

/** The skins I own, to put on one character. */
export function SkinPicker({ char, onClose }: { char: TokenId; onClose: () => void }) {
  const wallet = useWallet();
  const on = skinOf(wallet, char);
  const mine = SKINS.filter((s) => wallet.owned.includes(s.id));
  return (
    <Modal title={t('skinFor', { name: tokenName(char) })} onClose={onClose}>
      <div className="sp-preview">
        <Token token={char} size="60px" skin={on} />
      </div>
      <div className="sp-grid">
        {mine.map((s) => (
          <button
            key={s.id}
            className={`sp-skin${s.id === on ? ' on' : ''}`}
            onClick={() => {
              setSkin(char, s.id);
              sfx.pop();
            }}
          >
            <Token token={char} size="30px" skin={s.id} />
            <small>{itemName(s)}</small>
          </button>
        ))}
      </div>
      {mine.length < 2 && <p className="sp-hint">{t('noSkinsYet')}</p>}
    </Modal>
  );
}
