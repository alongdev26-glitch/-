import { useEffect, useState } from 'react';
import { onSoundChange, setSoundOn, sfx, soundOn } from './sound';
import { t } from '../i18n';

/** A speaker button that turns the game sounds on and off (remembered on this device). */
export function SoundToggle({ className = '', label = false }: { className?: string; label?: boolean }) {
  const [on, setOn] = useState(soundOn);
  useEffect(() => onSoundChange(setOn), []);
  return (
    <button
      className={`sound-toggle ${className}`}
      aria-pressed={on}
      aria-label={on ? t('soundTurnOff') : t('soundTurnOn')}
      onClick={() => {
        setSoundOn(!on);
        if (!on) sfx.coin();
      }}
    >
      {on ? '🔊' : '🔇'}
      {label && <span> {on ? t('soundOn') : t('soundOff')}</span>}
    </button>
  );
}
