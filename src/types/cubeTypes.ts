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

export function notationFromString(s: string): Notation | null {
    // Why is there no simple way to convert from an enum value to the enum.
    // I know I can just make another big switch but it's ugly too
    // This creates a heap allocation of all the enum variant, it's sooo bad
    // FIXME: Find a way to take a string "u'" and convert it to Notation.U_PRIME without all this work
    return (Object.values(Notation) as unknown as string[]).includes(s) ? (s as unknown as Notation) : null;
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
