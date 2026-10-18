/** A station shelter (roof, glass panels, timetable board, bench, curb), for the rail squares and deeds. */
export function TrainIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id="st-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b9c9d6" />
          <stop offset="1" stopColor="#6f8597" />
        </linearGradient>
        <linearGradient id="st-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9edf1" />
          <stop offset="1" stopColor="#aeb7c0" />
        </linearGradient>
      </defs>
      {/* roof */}
      <path d="M3 8.2 L37 8.2 L35.6 10.8 L4.4 10.8 Z" fill="url(#st-roof)" stroke="#5d6873" strokeWidth="0.5" />
      <rect x="31.5" y="4" width="2.2" height="4.4" rx="0.4" fill="#e0a526" stroke="#7a5a10" strokeWidth="0.35" />
      {/* frame and back panels */}
      <rect x="5.2" y="10.8" width="29.6" height="17.4" fill="#cfd6dc" stroke="#5d6873" strokeWidth="0.6" />
      <rect x="6.2" y="12" width="5.6" height="14.6" fill="#e8ecef" stroke="#8a96a1" strokeWidth="0.4" />
      <rect x="12.4" y="12" width="5.8" height="14.6" fill="url(#st-glass)" stroke="#5d6873" strokeWidth="0.4" />
      <rect x="26.6" y="12" width="7.2" height="14.6" fill="url(#st-glass)" stroke="#5d6873" strokeWidth="0.4" />
      <path d="M13.4 13 L16.2 25.6 M27.6 13 L30.8 25.6" stroke="#ffffff" strokeWidth="0.5" opacity="0.5" />
      {/* timetable board */}
      <rect x="18.8" y="12.4" width="7.2" height="9.4" fill="#f7f8fa" stroke="#5d6873" strokeWidth="0.4" />
      <rect x="18.8" y="12.4" width="7.2" height="1.6" fill="#2f5fa8" />
      <path d="M19.8 15.4h5.2M19.8 16.8h5.2M19.8 18.2h5.2M19.8 19.6h3.6" stroke="#8a96a1" strokeWidth="0.5" />
      <rect x="27.6" y="13" width="2.4" height="2.4" fill="#2f5fa8" />
      {/* bench */}
      <rect x="14" y="23.4" width="12.6" height="1.2" rx="0.3" fill="#4a5560" />
      <path d="M15.4 24.6v2.8M25.2 24.6v2.8" stroke="#4a5560" strokeWidth="0.8" />
      {/* posts */}
      <path d="M5.2 10.8v18M34.8 10.8v18" stroke="#5d6873" strokeWidth="1.1" />
      {/* pavement and red/yellow curb */}
      <rect x="1.5" y="28.6" width="37" height="3.2" fill="#c9c3b6" />
      <rect x="1.5" y="31.8" width="7.4" height="2.4" fill="#d23a33" />
      <rect x="8.9" y="31.8" width="7.4" height="2.4" fill="#e8c22c" />
      <rect x="16.3" y="31.8" width="7.4" height="2.4" fill="#d23a33" />
      <rect x="23.7" y="31.8" width="7.4" height="2.4" fill="#e8c22c" />
      <rect x="31.1" y="31.8" width="7.4" height="2.4" fill="#d23a33" />
    </svg>
  );
}
