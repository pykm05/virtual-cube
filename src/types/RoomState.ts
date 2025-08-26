export enum RoomState {
    NOT_STARTED,
    PLAYING,
    // Maybe add some kind of state for the transition from playing to ended, for a check & db write etc
    ENDED,
    CANCELLED,
}
