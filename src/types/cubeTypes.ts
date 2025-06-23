export type EulerAxis = 'x' | 'y' | 'z';

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
