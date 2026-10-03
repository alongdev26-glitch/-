import './Dice.css';

const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function Die({ value, rolling }: { value: number; rolling: boolean }) {
  return (
    <div className={`die${rolling ? ' rolling' : ''}`}>
      {Array.from({ length: 9 }, (_, i) => (
        <i key={i} className={PIPS[value].includes(i) ? 'pip' : ''} />
      ))}
    </div>
  );
}

export function Dice({ dice, rolling, showSum = true }: { dice: [number, number]; rolling: boolean; showSum?: boolean }) {
  const double = dice[0] === dice[1];
  return (
    <div className="dice-wrap">
      <div className="dice">
        <Die value={dice[0]} rolling={rolling} />
        <Die value={dice[1]} rolling={rolling} />
      </div>
      {/* the total, so it's clear how far the token walks */}
      <div className={`dice-sum${rolling || !showSum ? ' hidden' : ''}`} dir="ltr">
        {dice[0]} + {dice[1]} = <b>{dice[0] + dice[1]}</b>
        {double && (
          <span className="dice-double" dir="rtl">
            דאבל!
          </span>
        )}
      </div>
    </div>
  );
}
