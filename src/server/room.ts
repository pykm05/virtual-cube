import { Server, Socket } from "socket.io";

enum RoomState {
    GAME_NOT_STARTED = "Game not started",
    INSPECTION_TIME = "Cube inspection",
    SOLVE_IN_PROGRESS = "Solve in progress",
    GAME_ENDED = "Game complete"
}

class Room {
    
    public roomID: string;
    public players: Socket[] = [];

    private io: Server;
    private gameStatus = RoomState.GAME_NOT_STARTED;

    constructor(roomID: string, io: Server) {
        this.io = io;
        this.roomID = roomID;
    }
    
    addPlayer(socket: Socket) {
        if (this.players.length >= 2 || this.players.includes(socket)) {
            socket.to(socket.id).emit("invalid join");
        } else {
            socket.join(this.roomID);
            this.players.push(socket);
            this.updateGameState();
        }
    }

    removePlayer(socket: Socket) {
        this.players = this.players.filter(player => player.id !== socket.id);
        this.io.to(this.roomID).emit("remove player", socket.id);
    }

    private updateGameState() {
        console.log("current room state: ", this.gameStatus);
        switch(this.gameStatus) {
            case RoomState.GAME_NOT_STARTED:
                if (this.players.length == 2) {
                    this.gameStatus = RoomState.INSPECTION_TIME;
                    this.updateGameState();
                }
                break;
            case RoomState.INSPECTION_TIME:
                this.io.to(this.roomID).emit("start game", this.players[0].id, this.players[1].id);
                this.io.to(this.roomID).emit("inspection time");
                this.cubeInspection();
                break;
            case RoomState.SOLVE_IN_PROGRESS:
                this.io.to(this.roomID).emit("begin solve");
                this.solve();
                break;
            case RoomState.GAME_ENDED:
                this.io.to(this.roomID).emit("game ended");
                this.gameEnded();
                break;
            default:
                break;
        }
    }

    private cubeInspection() {
        this.io.to(this.roomID).emit("cube inspection");
        const inspectionTimeLimit = setTimeout(() => {
            this.gameStatus = RoomState.SOLVE_IN_PROGRESS;
            this.updateGameState();
        }, 3000);

        // clearTimeout(inspectionTimeLimit);
    }

    private solve() {
        this.io.to(this.roomID).emit("now solving");
        setTimeout(() => {
            this.gameStatus = RoomState.GAME_ENDED;
            this.updateGameState();
        }, 10000)
    }

    private gameEnded() {
        this.io.to(this.roomID).emit("game ended");
    }
}

export { Room };