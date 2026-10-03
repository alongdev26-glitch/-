/** Thin line icons for the tab bar (they take the text color). */
const PATHS: Record<string, string> = {
  board: 'M4 4h16v16H4z M4 9h16 M4 15h16 M9 4v16 M15 4v16',
  mine: 'M4 8h16v11H4z M9 8V5h6v3 M4 13h16',
  market: 'M3 12l9-8h8v8l-8 9z M15.5 8.5h.01',
  trade: 'M4 9h13l-3-3 M20 15H7l3 3',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c1-4 4.5-6 8-6s7 2 8 6',
};

export function Icon({ name }: { name: keyof typeof PATHS | string }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
