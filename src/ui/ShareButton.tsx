import { useState } from 'react';
import { rewardsOn, share } from '../online/referral';
import { REFERRAL_REWARD } from './shop';
import { sfx } from './sound';
import './ShareButton.css';

/** "Share with a friend": opens the phone's share sheet with my personal link. */
export function ShareButton({ className = '' }: { className?: string }) {
  const [msg, setMsg] = useState('');
  const paid = rewardsOn();
  const go = async () => {
    sfx.pop();
    const r = await share();
    if (r !== 'cancelled')
      setMsg(paid ? `כשחבר חדש יפתח את הקישור שלך תקבל ${REFERRAL_REWARD} מטבעות!` : 'תודה ששיתפת!');
  };
  return (
    <div className={`share-wrap ${className}`}>
      <button className="share-btn" onClick={go}>
        <span className="share-icon">📣</span>
        <span>
          <b>שתף לחבר</b>
          {paid && <small>וקבל 🪙{REFERRAL_REWARD}</small>}
        </span>
      </button>
      {msg && <div className="share-msg">{msg}</div>}
    </div>
  );
}
