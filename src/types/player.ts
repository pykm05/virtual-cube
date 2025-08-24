// import { RoomState } from '@/types/RoomState.ts';

export enum PlayerState{
    // (default) Sychronisation state for when the game hasn't yet started
    NotYetStarted,
    Inspection,
    Solving,

    // Done, waiting for the other player or to the room to react
    Solved,
    DNF,
    Left,

    // Game is done, the player is viewing the scores
    Scores,
}

export class Player {
    public id: string;
    public username: string;
    public state: PlayerState;
    public solveTime: number;
    public moveList: string;

    constructor(id: string, username: string) {
        this.id = id;
        this.username = username;
        this.state = PlayerState.NotYetStarted;
        this.solveTime = 0;
        this.moveList = '';
    }
}
