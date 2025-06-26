const movesByAxis = {
  x: ['L', 'R'],
  y: ['U', 'D'],
  z: ['F', 'B'],
};

const suffixes = ['', "'", '2'];
const allMoves = [...movesByAxis.x, ...movesByAxis.y, ...movesByAxis.z];

function getAxis(move: string): keyof typeof movesByAxis {
  if (movesByAxis.x.includes(move)) return 'x';
  if (movesByAxis.y.includes(move)) return 'y';
  return 'z';
}

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generate3x3Scramble(length = 20): string {
  const scramble: string[] = [];
  let lastAxis: string | null = null;
  let lastMove: string | null = null;

  while (scramble.length < length) {
    const move = getRandom(allMoves);
    const axis = getAxis(move);

    if (move === lastMove || axis === lastAxis) continue;

    scramble.push(move + getRandom(suffixes));
    lastMove = move;
    lastAxis = axis;
  }

  return scramble.join(' ');
}
