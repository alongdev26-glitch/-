import './Dice.css';

const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/** the cube's faces: the value each shows and where it sits */
const FACES: { v: number; at: string }[] = [
  { v: 1, at: 'rotateY(0deg)' },
  { v: 6, at: 'rotateY(180deg)' },
  { v: 3, at: 'rotateY(90deg)' },
  { v: 4, at: 'rotateY(-90deg)' },
  { v: 2, at: 'rotateX(90deg)' },
  { v: 5, at: 'rotateX(-90deg)' },
];

/** the turn that brings each value to the front */
const SHOW: Record<number, string> = {
  1: 'rotateX(0deg) rotateY(0deg)',
  6: 'rotateX(0deg) rotateY(180deg)',
  3: 'rotateX(0deg) rotateY(-90deg)',
  4: 'rotateX(0deg) rotateY(90deg)',
  2: 'rotateX(-90deg) rotateY(0deg)',
  5: 'rotateX(90deg) rotateY(0deg)',
};

/** A real cube: it tumbles while the dice roll, then lands with the rolled value facing up. */
function Die({ value, rolling }: { value: number; rolling: boolean }) {
  return (
    <div className={`die3${rolling ? ' rolling' : ''}`}>
      <div className="die3-turn">
        <div className="die3-cube" style={{ transform: SHOW[value] }}>
          {FACES.map((f) => (
            <div key={f.v} className="die3-face" style={{ transform: `${f.at} translateZ(0.5em)` }}>
              {Array.from({ length: 9 }, (_, i) => (
                <i key={i} className={PIPS[f.v].includes(i) ? 'pip' : ''} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Dice({ dice, rolling }: { dice: [number, number]; rolling: boolean; showSum?: boolean }) {
  return (
    <div className="dice-wrap">
      <div className="dice">
        <Die value={dice[0]} rolling={rolling} />
        <Die value={dice[1]} rolling={rolling} />
      </div>
    </div>
  );
}
