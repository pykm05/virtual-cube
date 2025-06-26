export type EulerAxis = 'x' | 'y' | 'z';

export type KeybindMap = { [key: string]: Notation };

export enum Notation {
    U = 'U',
    U_PRIME = "U'",
    D = 'D',
    D_PRIME = "D'",
    L = 'L',
    L_PRIME = "L'",
    R = 'R',
    R_PRIME = "R'",
    F = 'F',
    F_PRIME = "F'",
    B = 'B',
    B_PRIME = "B'",
    M = 'M',
    M_PRIME = "M'",
    S = 'S',
    S_PRIME = "S'",
    E = 'E',
    E_PRIME = "E'",
    x = 'X',
    x_PRIME = "X'",
    y = 'Y',
    y_PRIME = "Y'",
    z = 'Z',
    z_PRIME = "Z'",
}

// prettier-ignore
const cubeRotations = [
    Notation.x, Notation.x_PRIME,
    Notation.y, Notation.y_PRIME,
    Notation.z, Notation.z_PRIME,
];
export function isCubeRotation(notation: Notation): boolean {
    return cubeRotations.includes(notation);
}

const notationMap: Record<string, Notation> = Object.values(Notation).reduce(
    (acc, val) => {
        acc[val] = val;
        return acc;
    },
    {} as Record<string, Notation>
);
export function notationFromString(s: string): Notation | null {
    return notationMap[s] ?? null;
}

export enum Direction {
    forward = 1,
    backward = -1,
}

export enum CubeAction {
    turn = 'Cube turn',
    cubeRotation = 'Cube rotation',
}

export enum CubeState {
    NOT_MOVING = 'Not moving',
    MOVE_IN_PROGRESS = 'Move in progress',
}

export const ninetyDegrees = Math.PI / 2;

export function nearlyEqual(a: number, b: number, d = 0.001) {
    return Math.abs(a - b) <= d;
}
