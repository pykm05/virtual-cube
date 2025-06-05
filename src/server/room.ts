import { Server, Socket } from "socket.io";
import { Player } from "@/types/player";

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
    private solveTime: number = 0;
    private maxPlayerCount = 2;
    private solveTimeLimit: number = 50; // 300
    private io: Server;
    private roomStatus = RoomState.GAME_NOT_STARTED;

    constructor(roomID: string, io: Server) {
        this.io = io;
        this.roomID = roomID;
    }

    getMaxPlayerCount() {
        return this.maxPlayerCount;
    }

    addPlayer(socket: Socket, username: string) {
        if (this.players.length >= this.maxPlayerCount || this.findPlayerIndex(socket.id) != -1) {
            socket.to(socket.id).emit("invalid join");
        } else {
            socket.join(this.roomID);
            this.players.push({ id: socket.id, username: username, status: RoomState.GAME_NOT_STARTED, solveTime: 0 });
            this.updateGameStatus();
        }
    }

    removePlayer(socket: Socket) {
        this.players = this.players.filter(player => player.id !== socket.id);
        this.io.to(this.roomID).emit("remove player", socket.id);
    }

    handleInput(socketID: string, key: string) {
        this.io.to(this.roomID).emit("keyboard input", socketID, key);

        if (this.players[this.findPlayerIndex(socketID)].status == RoomState.INSPECTION_TIME) {
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
                if (this.players.length == this.maxPlayerCount) {
                    this.io.to(this.roomID).emit("start game", this.players);
                    this.roomStatus = RoomState.INSPECTION_TIME;

                    for (const player of this.players) {
                        player.status = RoomState.INSPECTION_TIME;
                    }

                    this.updateGameStatus();
                }
                break;
            case RoomState.INSPECTION_TIME:
                this.io.to(this.roomID).emit("start inspection", RoomState.INSPECTION_TIME);

                const inspectionTimer = setInterval(() => {
                    this.inspectionTime--;

                    for (const player of this.players) {
                        if (player.status == RoomState.INSPECTION_TIME) this.io.to(player.id).emit("timer update", this.inspectionTime);
                    }
    
                    if (this.inspectionTime == 0 || !this.players.some(player => player.status == RoomState.INSPECTION_TIME)) {
                        for (const player of this.players) {
                            if (player.status == RoomState.INSPECTION_TIME) {
                                this.io.to(player.id).emit("solve in progress");
                                player.status = RoomState.SOLVE_IN_PROGRESS;
                            }
                        }

                        if (this.roomStatus == RoomState.INSPECTION_TIME) {
                            this.roomStatus = RoomState.SOLVE_IN_PROGRESS;
                            this.updateGameStatus();
                        }

                        clearTimeout(inspectionTimer);
                    }
                  }, 1000);
                break;
            case RoomState.SOLVE_IN_PROGRESS:
                const solveTimer = setInterval(() => {
                    this.solveTime += 0.01;
                    
                    for (const player of this.players) {
                        if (player.status == RoomState.SOLVE_IN_PROGRESS) {
                            player.solveTime += 0.01;
                            this.io.to(player.id).emit("timer update", player.solveTime.toFixed(2));
                        }
                    }

                    if (this.solveTime >= this.solveTimeLimit || !this.players.some(player => player.status == RoomState.SOLVE_IN_PROGRESS)) {
                        for (const player of this.players) {
                            if (player.status == RoomState.SOLVE_IN_PROGRESS) {
                                this.io.to(player.id).emit("game complete");
                                player.status = RoomState.GAME_ENDED;
                            }
                        }

                        if (this.roomStatus == RoomState.SOLVE_IN_PROGRESS) {
                            this.roomStatus = RoomState.GAME_ENDED;
                            this.updateGameStatus();
                        }

                        clearTimeout(solveTimer);
                    }
                }, 10);
                break;
            case RoomState.GAME_ENDED:
                this.io.to(this.roomID).emit("game complete", RoomState.GAME_ENDED);
                break;
            default:
                break;
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