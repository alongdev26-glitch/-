/** A sleek high-speed train, front view, for the rail squares and deeds. */
export function TrainIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id="train-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4a5f9e" />
          <stop offset="1" stopColor="#1b264a" />
        </linearGradient>
      </defs>
      {/* the track */}
      <path d="M15 33 L10 39 M25 33 L30 39" stroke="#6b5a45" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12.5 36h15M11 38.3h18" stroke="#9c8a73" strokeWidth="1.2" strokeLinecap="round" />
      {/* body */}
      <path d="M9 31 V14 C9 7 14 3 20 3 C26 3 31 7 31 14 V31 Z" fill="url(#train-body)" stroke="#121a33" strokeWidth="1.2" />
      {/* windscreen */}
      <path d="M12 12.5 C14 8.5 26 8.5 28 12.5 L27 18 C23 16.6 17 16.6 13 18 Z" fill="#bfe8ff" stroke="#121a33" strokeWidth="0.9" />
      <path d="M15 11.5 L18 15.5" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
      {/* gold stripe and lights */}
      <rect x="9" y="21" width="22" height="2.6" fill="#e0b13a" />
      <circle cx="13.5" cy="27" r="1.9" fill="#fff6c8" stroke="#121a33" strokeWidth="0.6" />
      <circle cx="26.5" cy="27" r="1.9" fill="#fff6c8" stroke="#121a33" strokeWidth="0.6" />
      <rect x="17" y="26" width="6" height="2" rx="1" fill="#0d1430" />
    </svg>
  );
}
