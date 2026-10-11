/** A friendly police officer (bust with peaked cap), for the "מעצר" corner. */
export function PoliceIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id="cop-shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f6fd6" />
          <stop offset="1" stopColor="#173c87" />
        </linearGradient>
        <linearGradient id="cop-cap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#24346b" />
          <stop offset="1" stopColor="#0f1838" />
        </linearGradient>
      </defs>
      {/* shoulders and shirt */}
      <path d="M5 40 C5 31 11 27 20 27 C29 27 35 31 35 40 Z" fill="url(#cop-shirt)" stroke="#0f1838" strokeWidth="1" />
      <path d="M16 27.4 L20 33 L24 27.4" fill="#dfe9ff" stroke="#0f1838" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M19 31 L20 33 L21 31 L20.6 39 L19.4 39 Z" fill="#0f1838" />
      {/* badge */}
      <path d="M27 31.5 l1.3 0.7 1.4-0.4 0.4 1.4 1 1-0.9 1.1 0.1 1.4-1.4 0.2-1.1 0.9-1-1-1.4-0.2 0.1-1.4-0.8-1.2 1.1-0.9 0.3-1.4z" fill="#ffd23f" stroke="#a86b00" strokeWidth="0.5" />
      {/* neck and face */}
      <rect x="17" y="22" width="6" height="6" rx="2" fill="#e9a77a" />
      <ellipse cx="20" cy="17.5" rx="7.2" ry="7.6" fill="#f6c095" stroke="#b9774b" strokeWidth="0.7" />
      <ellipse cx="12.9" cy="18" rx="1.4" ry="2" fill="#f0b083" />
      <ellipse cx="27.1" cy="18" rx="1.4" ry="2" fill="#f0b083" />
      <circle cx="17.3" cy="17.6" r="1.05" fill="#2a1a10" />
      <circle cx="22.7" cy="17.6" r="1.05" fill="#2a1a10" />
      <circle cx="17.7" cy="17.2" r="0.35" fill="#fff" />
      <circle cx="23.1" cy="17.2" r="0.35" fill="#fff" />
      <path d="M17 21.4 C18.6 23 21.4 23 23 21.4" stroke="#8a3b22" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <circle cx="15.6" cy="20.6" r="1.1" fill="#ff8f8f" opacity="0.45" />
      <circle cx="24.4" cy="20.6" r="1.1" fill="#ff8f8f" opacity="0.45" />
      {/* peaked cap */}
      <path d="M10.5 13 C10.5 6 14.5 3.5 20 3.5 C25.5 3.5 29.5 6 29.5 13 Z" fill="url(#cop-cap)" stroke="#0a1028" strokeWidth="0.9" />
      <rect x="10.5" y="11" width="19" height="2.4" fill="#ffd23f" stroke="#a86b00" strokeWidth="0.4" />
      <path d="M11.5 13.3 C15 15.4 25 15.4 28.5 13.3 L28 14.8 C24.5 16.6 15.5 16.6 12 14.8 Z" fill="#0a1028" />
      <path d="M20 5.6 l1.1 2.2 2.4 0.3-1.8 1.6 0.5 2.4-2.2-1.2-2.2 1.2 0.5-2.4-1.8-1.6 2.4-0.3z" fill="#ffd23f" stroke="#a86b00" strokeWidth="0.4" />
    </svg>
  );
}
