import './RibbonBanner.css';

/** The signature red ribbon with a chevron cut. */
export function RibbonBanner({ text, sub }: { text: string; sub?: string }) {
  return (
    <div className="ribbon">
      <b>{text}</b>
      {sub && <small>{sub}</small>}
    </div>
  );
}
