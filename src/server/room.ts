import { Server, Socket } from "socket.io";
import { Player } from "./player";

enum RoomState {
    GAME_NOT_STARTED = "Game not started",
    INSPECTION_TIME = "Cube inspection",
    SOLVE_IN_PROGRESS = "Solve in progress",
    GAME_ENDED = "Game complete"
}

class Room {

    public roomID: string;
    public players: Player[] = [];
    private inspectionTime = 15;
    private io: Server;
    private roomStatus = RoomState.GAME_NOT_STARTED;

    constructor(roomID: string, io: Server) {
        this.io = io;
        this.roomID = roomID;
    }

    addPlayer(socket: Socket) {
        if (this.players.length >= 2 || this.findPlayerIndex(socket.id) != -1) {
            socket.to(socket.id).emit("invalid join");
        } else {
            socket.join(this.roomID);
            this.players.push({ id: socket.id, status: RoomState.GAME_NOT_STARTED });
            this.updateGameStatus();
        }
    }

    removePlayer(socket: Socket) {
        this.players = this.players.filter(player => player.id !== socket.id);
        this.io.to(this.roomID).emit("remove player", socket.id);
    }

    handleInput(socketID: string, key: string) {
        this.io.to(this.roomID).emit("keyboard input", socketID, key);

        if (this.roomStatus == RoomState.INSPECTION_TIME) {
            if (key != ';' && key != 'a' && key != 'y' && key != 'b' && key != 'p' && key != 'q') { // change this to check cubeturn type
                this.io.to(socketID).emit("solve in progress");
                this.players[this.findPlayerIndex(socketID)].status = RoomState.SOLVE_IN_PROGRESS;
                this.roomStatus = RoomState.SOLVE_IN_PROGRESS;
                this.updateGameStatus();
            }
        }
    }

    private updateGameStatus() {
        console.log("current room state: ", this.roomStatus);
        switch (this.roomStatus) {
            case RoomState.GAME_NOT_STARTED:
                if (this.players.length == 2) {
                    this.io.to(this.roomID).emit("start game", this.players[0], this.players[1]);
                    this.updateAllStatuses(RoomState.INSPECTION_TIME);
                    this.updateGameStatus();
                }
                break;
            case RoomState.INSPECTION_TIME: // async
                this.io.to(this.roomID).emit("start inspection", RoomState.INSPECTION_TIME);

                const inspectionTimer = setInterval(() => {
                    this.inspectionTime--;
                    this.io.to(this.roomID).emit("timer update", this.inspectionTime);
    
                    if (this.inspectionTime == 0 || !this.players.some(player => player.status == RoomState.INSPECTION_TIME)) {
                        clearTimeout(inspectionTimer);
                        
                        for (const player of this.players) {
                            if (player.status == RoomState.INSPECTION_TIME) this.io.to(this.roomID).emit("solve in progress", RoomState.SOLVE_IN_PROGRESS);
                        }

                        if (this.roomStatus == RoomState.INSPECTION_TIME) {
                            this.roomStatus = RoomState.SOLVE_IN_PROGRESS;
                            this.updateGameStatus();
                        }
                    }
                  }, 1000);
                break;
            case RoomState.SOLVE_IN_PROGRESS: // async
                const solveTimer = setInterval(() => {
                    this.inspectionTime--;
                    this.io.to(this.roomID).emit("timer update", this.inspectionTime);

                    if (this.inspectionTime == 0 || !this.players.some(player => player.status == RoomState.INSPECTION_TIME)) {
                        for (const player of this.players) {
                            if (player.status == RoomState.INSPECTION_TIME) this.io.to(this.roomID).emit("solve in progress", RoomState.SOLVE_IN_PROGRESS);
                        }

                        if (this.roomStatus == RoomState.INSPECTION_TIME) this.roomStatus = RoomState.SOLVE_IN_PROGRESS;
                        clearTimeout(solveTimer);
                        this.updateGameStatus();
                    }
                }, 10);
                    break;
            case RoomState.GAME_ENDED:
                this.io.to(this.roomID).emit("next state", RoomState.GAME_ENDED);
                break;
            default:
                break;
        }
    }

    private updateAllStatuses(newState: RoomState) {
        this.roomStatus = newState;

        for (const player of this.players) {
            player.status = newState;
        }
    }

    private findPlayerIndex(socketID: string) {
        for (let i = 0; i < this.players.length; i++) {
            if (socketID == this.players[i].id) return i;
        }

        return -1;
    }
}

export { Room };