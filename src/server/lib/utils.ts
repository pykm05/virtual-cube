
const movesByAxis = {
  x: ['L', 'R'] as const,
  y: ['U', 'D'] as const,
  z: ['F', 'B'] as const,
} as const;

type Axis = keyof typeof movesByAxis;
type Move = typeof movesByAxis[Axis][number];

const suffixes = ['', "'", '2'] as const;
type Suffix = typeof suffixes[number];


const allMoves = [...movesByAxis.x, ...movesByAxis.y, ...movesByAxis.z] as const;
type AllMove = typeof allMoves[number];


function getAxis(move: AllMove): Axis {
  if (movesByAxis.x.includes(move as any)) return 'x';
  if (movesByAxis.y.includes(move as any)) return 'y';
  return 'z';
}


function getRandom<T extends readonly any[]>(arr: T): T[number] {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generate3x3Scramble(length = 20): string {
  const scramble: string[] = [];
  let lastMove: AllMove | null = null;
  let lastAxis: Axis | null = null;
  let secondLastAxis: Axis | null = null;

  while (scramble.length < length) {
    const move = getRandom(allMoves);
    const axis = getAxis(move);

    
    if (move === lastMove) continue;

    
    if (axis === lastAxis && axis === secondLastAxis) continue;

    const suffix = getRandom(suffixes);

    scramble.push(move + suffix);

    
    secondLastAxis = lastAxis;
    lastAxis = axis;
    lastMove = move;
  }

  return scramble.join(' ');
}
