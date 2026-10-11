/** A serious police officer (bust: peaked cap, aviator sunglasses, dark uniform), for the "מעצר" corner. */
export function PoliceIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id="cop-shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#24365c" />
          <stop offset="1" stopColor="#101a30" />
        </linearGradient>
        <linearGradient id="cop-cap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f2c4c" />
          <stop offset="1" stopColor="#0c1326" />
        </linearGradient>
        <linearGradient id="cop-lens" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a4250" />
          <stop offset="1" stopColor="#0b0d12" />
        </linearGradient>
      </defs>
      {/* broad shoulders and uniform */}
      <path d="M2.5 40 C3 31.5 8 28.6 14.5 27.4 L20 30 L25.5 27.4 C32 28.6 37 31.5 37.5 40 Z" fill="url(#cop-shirt)" stroke="#070c18" strokeWidth="0.8" />
      {/* epaulettes */}
      <path d="M5.5 31.2 L12.8 28.4 L13.6 30 L6.6 33 Z" fill="#0c1326" stroke="#8f9bb3" strokeWidth="0.4" />
      <path d="M34.5 31.2 L27.2 28.4 L26.4 30 L33.4 33 Z" fill="#0c1326" stroke="#8f9bb3" strokeWidth="0.4" />
      {/* collar, shirt and tie */}
      <path d="M15.2 27.3 L20 33.5 L24.8 27.3 L23 26.6 L20 29.6 L17 26.6 Z" fill="#c9d1de" />
      <path d="M19.1 30.2 L20.9 30.2 L21.5 39.5 L20 40 L18.5 39.5 Z" fill="#05070c" />
      {/* chest badge */}
      <path d="M28.5 31.2 C29.7 31.9 31 31.9 32 31.4 C32.2 34.2 31.2 36 30.2 36.8 C29.2 36 28.2 34.2 28.5 31.2 Z" fill="#d9b44a" stroke="#7a5a10" strokeWidth="0.45" />
      <circle cx="30.25" cy="33.6" r="0.75" fill="#7a5a10" />
      {/* shoulder radio */}
      <rect x="8.3" y="31.6" width="2.6" height="3.6" rx="0.6" fill="#0a0a0a" transform="rotate(-20 9.6 33.4)" />
      <path d="M10.4 31 C12 29.6 13.2 30.6 13.4 32.4" stroke="#0a0a0a" strokeWidth="0.6" fill="none" />
      {/* neck */}
      <path d="M16.8 22 L23.2 22 L23.6 27.6 C21.8 28.6 18.2 28.6 16.4 27.6 Z" fill="#c98e66" />
      {/* face: oval with a firm jaw */}
      <path d="M13.6 14.5 C13.6 10.5 16.4 9 20 9 C23.6 9 26.4 10.5 26.4 14.5 C26.4 19.4 24.4 23.6 20 24 C15.6 23.6 13.6 19.4 13.6 14.5 Z" fill="#d9a07a" stroke="#8d5b3c" strokeWidth="0.6" />
      <path d="M13.2 15.2 C12.2 15 12 17.4 13.6 18" fill="#c98e66" />
      <path d="M26.8 15.2 C27.8 15 28 17.4 26.4 18" fill="#c98e66" />
      {/* aviator sunglasses */}
      <path d="M14.4 15.2 L19.2 15.2 C19.2 17.6 18.2 18.6 16.6 18.6 C15 18.6 14.4 17.4 14.4 15.2 Z" fill="url(#cop-lens)" stroke="#050608" strokeWidth="0.45" />
      <path d="M20.8 15.2 L25.6 15.2 C25.6 17.4 25 18.6 23.4 18.6 C21.8 18.6 20.8 17.6 20.8 15.2 Z" fill="url(#cop-lens)" stroke="#050608" strokeWidth="0.45" />
      <path d="M19.2 15.4 L20.8 15.4" stroke="#050608" strokeWidth="0.6" />
      <path d="M15.2 15.9 L17.4 15.9" stroke="#6f7888" strokeWidth="0.45" strokeLinecap="round" />
      {/* nose and firm mouth */}
      <path d="M20 18.2 L19.4 20.4 L20.6 20.4" stroke="#8d5b3c" strokeWidth="0.5" fill="none" strokeLinejoin="round" />
      <path d="M18.1 21.9 L21.9 21.9" stroke="#5e3420" strokeWidth="0.75" strokeLinecap="round" />
      {/* peaked cap */}
      <path d="M12.2 12.2 C11.8 6.4 15 3.4 20 3.4 C25 3.4 28.2 6.4 27.8 12.2 Z" fill="url(#cop-cap)" stroke="#05080f" strokeWidth="0.7" />
      <rect x="12.3" y="10.4" width="15.4" height="1.9" fill="#05080f" />
      <path d="M12.2 12.2 C15.2 14 24.8 14 27.8 12.2 L28.6 13.4 C25 15.6 15 15.6 11.4 13.4 Z" fill="#05070c" />
      <path d="M13.6 14.6 C16.6 15.6 23.4 15.6 26.4 14.6" stroke="#7a4a30" strokeWidth="0.8" opacity="0.5" fill="none" />
      {/* cap badge */}
      <path d="M18.6 5.8 C19.5 6.3 20.5 6.3 21.4 5.8 C21.6 8 20.8 9.2 20 9.7 C19.2 9.2 18.4 8 18.6 5.8 Z" fill="#cfd5df" stroke="#5b6475" strokeWidth="0.4" />
      <circle cx="20" cy="7.6" r="0.55" fill="#d9b44a" />
    </svg>
  );
}
