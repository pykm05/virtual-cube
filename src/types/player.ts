export enum PlayerState {
    // (default) Sychronisation state for when the player is waiting for the game to start
    NOT_YET_STARTED,

    // Playing
    INSPECTION,
    SOLVING,

    // Done, waiting for the other player or to the room to react
    SOLVED,
    DNF,

    // This only includes players that left while they were supposed to be playing
    DISCONNECTED,
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
        this.state = PlayerState.NOT_YET_STARTED;
        this.solveTime = 0;
        this.moveList = '';
    }
}
