import './Building.css';

interface Props {
  className?: string;
}

/** A little green game-piece house, drawn in 3/4 view. */
export function House({ className = '' }: Props) {
  return (
    <svg className={`bld bld-house ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <g stroke="#16301f" strokeWidth="0.8" strokeLinejoin="round">
        <polygon points="14,11 20,8 20,19 14,22" fill="#2c5e3f" />
        <polygon points="4,11 14,11 14,22 4,22" fill="#3f7d55" />
        <polygon points="4,11 9,4 14,11" fill="#3f7d55" />
        <polygon points="9,4 15,1 20,8 14,11" fill="#24503a" />
      </g>
      <line x1="9" y1="4" x2="15" y2="1" stroke="#8fbf9c" strokeWidth="0.9" strokeLinecap="round" />
      <rect x="7.6" y="16" width="2.8" height="6" rx="0.6" fill="#16301f" />
      <polygon points="15.8,12.6 18.4,11.3 18.4,14 15.8,15.3" fill="#d9d3bf" />
      <rect x="7.8" y="11.6" width="2.4" height="2.4" rx="0.4" fill="#efe9d6" />
    </svg>
  );
}

/** A red hotel with lit windows. */
export function Hotel({ className = '' }: Props) {
  const cols = [5, 10.5, 21.5, 27];
  return (
    <svg className={`bld bld-hotel ${className}`} viewBox="0 0 40 24" aria-hidden="true">
      <g stroke="#2e080b" strokeWidth="0.8" strokeLinejoin="round">
        <polygon points="31,10 38,6 38,19 31,23" fill="#6b1a20" />
        <polygon points="2,10 31,10 31,23 2,23" fill="#8c2730" />
        <polygon points="2,10 9,6 38,6 31,10" fill="#4a1015" />
      </g>
      <line x1="9" y1="6" x2="38" y2="6" stroke="#c98a8f" strokeWidth="0.9" strokeLinecap="round" />
      {cols.map((x) => (
        <g key={x} fill="#e6c97a">
          <rect x={x} y="12.2" width="3" height="3" rx="0.4" />
          <rect x={x} y="17.4" width="3" height="3" rx="0.4" />
        </g>
      ))}
      <rect x="14.6" y="16.2" width="3.8" height="6.8" rx="0.6" fill="#2e080b" />
      <circle cx="16.5" cy="13.4" r="2.3" fill="#e6c97a" stroke="#b86e00" strokeWidth="0.5" />
      <text x="16.5" y="14.6" textAnchor="middle" fontSize="3.4" fontWeight="900" fill="#7a2e00" fontFamily="Rubik, sans-serif">
        H
      </text>
    </svg>
  );
}
