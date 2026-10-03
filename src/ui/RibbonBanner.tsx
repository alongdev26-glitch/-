import './RibbonBanner.css';

/** A screen title: serif lettering over a thin gold rule. */
export function RibbonBanner({ text, sub }: { text: string; sub?: string }) {
  return (
    <div className="ribbon">
      <b>{text}</b>
      {sub && <small>{sub}</small>}
    </div>
  );
}
