/** Clean, flat icons for the game-mode cards (white glyph on a colored rounded badge). */
import type { ReactElement } from 'react';

type Kind = 'controller' | 'people' | 'key' | 'bolt';

const PATHS: Record<Kind, ReactElement> = {
  // a gamepad: body, d-pad and two buttons
  controller: (
    <>
      <path d="M7.5 8h17a5.5 5.5 0 0 1 5.4 6.5l-1.3 7.2a3.6 3.6 0 0 1-6.3 1.6L20 21h-8l-2.3 2.3a3.6 3.6 0 0 1-6.3-1.6l-1.3-7.2A5.5 5.5 0 0 1 7.5 8Z" fill="currentColor" />
      <path d="M10 12.5v5M7.5 15h5" stroke="var(--badge)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="21.5" cy="13.6" r="1.5" fill="var(--badge)" />
      <circle cx="24.6" cy="16.6" r="1.5" fill="var(--badge)" />
    </>
  ),
  // two people, head and shoulders
  people: (
    <>
      <circle cx="12" cy="10.5" r="4.2" fill="currentColor" />
      <path d="M3.8 25c0-4.8 3.7-8.2 8.2-8.2s8.2 3.4 8.2 8.2Z" fill="currentColor" />
      <circle cx="22" cy="11.5" r="3.6" fill="currentColor" opacity="0.75" />
      <path d="M18.6 17.6A7.3 7.3 0 0 1 28.6 25h-6.4c0-2.8-1.3-5.4-3.6-7.4Z" fill="currentColor" opacity="0.75" />
    </>
  ),
  // a key, for joining with a code
  key: (
    <>
      <circle cx="11" cy="16" r="6.2" fill="currentColor" />
      <circle cx="11" cy="16" r="2.3" fill="var(--badge)" />
      <path d="M16.5 14.4h11.2v3.2h-2.4v3.2h-3.2v-3.2h-5.6Z" fill="currentColor" />
    </>
  ),
  // a lightning bolt, for a fast online match
  bolt: <path d="M18.5 3 7 18h7.5l-2 11L25 13h-7.6Z" fill="currentColor" />,
};

export function ModeBadge({ kind, color }: { kind: Kind; color: string }) {
  return (
    <span className="mode-badge" style={{ ['--badge' as string]: color }} aria-hidden="true">
      <svg viewBox="0 0 32 32">{PATHS[kind]}</svg>
    </span>
  );
}
