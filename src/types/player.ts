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
    public userId: string; // '' on default unless logged in
    public loggedIn: boolean;
    public socketId: string;
    public username: string;

    public state = PlayerState.NOT_YET_STARTED;
    public solveTime = 0;
    public moveHistory = '';

    constructor(userId: string = '', socketId: string, username: string, loggedIn: boolean) {
        this.userId = userId;
        this.loggedIn = loggedIn;
        this.socketId = socketId;
        this.username = username;
    }
}
