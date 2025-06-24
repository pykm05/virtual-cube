export type EulerAxis = 'x' | 'y' | 'z';

export type KeybindMap = { [key: string]: Notation };

// Wide moves ?
export enum Notation {
    U = 'u',
    U_PRIME = "u'",
    D = 'd',
    D_PRIME = "d'",
    L = 'l',
    L_PRIME = "l'",
    R = 'r',
    R_PRIME = "r'",
    F = 'f',
    F_PRIME = "f'",
    B = 'b',
    B_PRIME = "b'",
    M = 'm',
    M_PRIME = "m'",
    S = 's',
    S_PRIME = "s'",
    E = 'e',
    E_PRIME = "e'",
    x = 'x',
    x_PRIME = "x'",
    y = 'y',
    y_PRIME = "y'",
    z = 'z',
    z_PRIME = "z'",
}

export function notationFromString(s: string): Notation | null {
    // Why is there no simple way to convert from an enum value to the enum.
    // I know I can just make another big switch but it's ugly too
    // This creates a heap allocation of all the enum variant, it's sooo bad
    // FIXME: Find a way to take a string "u'" and convert it to Notation.L_PRIME without all this work
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
