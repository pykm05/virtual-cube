import { RoomState } from '@/types/RoomState.ts';

export default class Player {
    public id: string;
    public username: string;
    public status: string;
    public solveTime: number;
    public isDNF: boolean;

    constructor(id: string, username: string) {
        this.id = id;
        this.username = username;
        this.status = RoomState.GAME_NOT_STARTED;
        this.solveTime = 0;
        this.isDNF = false;
    }
}
