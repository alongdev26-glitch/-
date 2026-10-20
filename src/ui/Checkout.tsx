import { useEffect, useState } from 'react';
import { t, type Key } from '../i18n';
import { GemPackArt } from './GemPackArt';
import { Modal } from './Modal';
import { billing, buyPack } from './billing';
import { sfx } from './sound';
import './Checkout.css';

export interface Pack {
  id: string;
  gems: number;
  price: string;
  bonus?: string;
}

type Step = 'review' | 'paying' | 'done' | 'failed';

/**
 * Checkout for a diamond pack: what you get and what it costs, then Google Play's own payment
 * sheet. Only the app installed from Google Play can pay; anywhere else the button says so.
 */
export function Checkout({ pack, index, onClose }: { pack: Pack; index: number; onClose: () => void }) {
  const [can, setCan] = useState<boolean | null>(null);
  const [step, setStep] = useState<Step>('review');
  const [got, setGot] = useState(0);
  useEffect(() => {
    billing().then((s) => setCan(!!s));
  }, []);

  const pay = async () => {
    setStep('paying');
    const r = await buyPack(pack.id);
    if (r.ok) {
      setGot(r.gems);
      setStep('done');
      sfx.buy();
    } else setStep(r.cancelled ? 'review' : 'failed');
  };

  return (
    <Modal title={step === 'done' ? t('paidTitle') : t('checkout')} onClose={step === 'paying' ? undefined : onClose}>
      <div className={`co co-${step}`}>
        <div className="co-art">
          <GemPackArt kind={index as 0 | 1 | 2 | 3} />
          {step === 'done' && (
            <div className="co-burst" aria-hidden="true">
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i} style={{ ['--a' as string]: `${i * 36}deg` }}>
                  💎
                </span>
              ))}
            </div>
          )}
        </div>

        {step === 'done' ? (
          <>
            <div className="co-got">+{got.toLocaleString()} 💎</div>
            <p className="co-note">{t('paidNote')}</p>
            <button className="btn btn-red co-btn" onClick={onClose}>
              {t('continue')}
            </button>
          </>
        ) : (
          <>
            <div className="co-name">{t(`pack${index}` as Key)}</div>
            <div className="co-rows">
              <div className="co-row">
                <span>{t('youGet')}</span>
                <b>
                  💎 {pack.gems.toLocaleString()}
                  {pack.bonus && <em className="tier-bonus">{pack.bonus}</em>}
                </b>
              </div>
              <div className="co-row co-total">
                <span>{t('toPay')}</span>
                <b>{pack.price}</b>
              </div>
            </div>
            {step === 'failed' && <div className="setup-error">{t('payFailed')}</div>}
            <button className="co-pay" disabled={!can || step === 'paying'} onClick={pay}>
              {step === 'paying' ? (
                <span className="co-spin" aria-hidden="true" />
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true" className="co-play">
                  <path d="M4 2.5 14.5 12 4 21.5c-.4-.2-.6-.6-.6-1.1V3.6c0-.5.2-.9.6-1.1Z" fill="#00d26a" />
                  <path d="M14.5 12 18 8.6l3.6 2c1 .6 1 1.4 0 2l-3.6 2Z" fill="#ffd400" />
                  <path d="M4 2.5c.3-.2.8-.2 1.3.1L18 8.6 14.5 12Z" fill="#00a1ff" />
                  <path d="M4 21.5 14.5 12 18 15.4l-12.7 6c-.5.3-1 .3-1.3.1Z" fill="#ff3b44" />
                </svg>
              )}
              {step === 'paying' ? t('opening') : t('payWithPlay')}
            </button>
            <p className="co-note">{can === false ? t('playOnly') : t('paySafe')}</p>
          </>
        )}
      </div>
    </Modal>
  );
}
