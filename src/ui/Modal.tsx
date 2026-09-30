import type { ReactNode } from 'react';
import './Modal.css';

interface Props {
  title?: string;
  onClose?: () => void;
  children: ReactNode;
  tone?: 'white' | 'blue';
}

export function Modal({ title, onClose, children, tone = 'white' }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal modal-${tone}`} onClick={(e) => e.stopPropagation()}>
        {title && <div className="modal-head">{title}</div>}
        {onClose && (
          <button className="modal-x" onClick={onClose} aria-label="סגור">
            ✕
          </button>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
