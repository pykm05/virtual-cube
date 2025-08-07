import { Server, Socket } from 'socket.io';
import Player from '@/types/player';
import { RoomState } from '@/types/RoomState';
import { generate3x3Scramble } from './lib/utils';
import { isCubeRotation, notationFromString } from '@/types/cubeTypes';
import { supabase } from './db';

export default class Room {
    public roomID: string;
    public players: Player[] = [];
    public roomStatus = RoomState.GAME_NOT_STARTED;
    public scramble: string = generate3x3Scramble();

    private inspectionTime = 15;
    private solveTime: number = 0;
    private maxPlayerCount = 2;
    private solveTimeLimit: number = 300; // 300
    private rematchQueue: string[] = [];
    private io: Server;
    private rankings: Player[] = [];

    constructor(roomID: string, io: Server) {
        this.io = io;
        this.roomID = roomID;
    }

    public getMaxPlayerCount() {
        return this.maxPlayerCount;
    }

    public startGame() {
        if (this.roomStatus !== RoomState.GAME_NOT_STARTED) return;

        this.updateGameStatus();
    }

    public addPlayer(socket: Socket, player: Player) {
        if (this.players.length >= this.maxPlayerCount || this.findPlayerIndex(socket.id) != -1) {
            socket.to(socket.id).emit('join:invalid');
        } else {
            this.players.push(player);
        }
    }

    public removePlayer(socketID: string) {
        this.players = this.players.filter((p) => p.id !== socketID);
    }

    public playerDNF(socketID: string) {
        const playerIndex = this.findPlayerIndex(socketID);

        if (playerIndex != -1) {
            const player = this.players[playerIndex];
            player.isDNF = true;
            player.status = RoomState.GAME_ENDED;
            this.rankings.push(player);
            this.io.to(socketID).emit('player:completed_solve', player);
        }
    }

    public handleInput(socketID: string, key: string) {
        this.io.to(this.roomID).emit('keyboard:input', socketID, key);
        const playerIndex = this.findPlayerIndex(socketID);

        const notation = notationFromString(key);
        if (!notation) {
            console.log(`Failed to handle input '${key}': Invalid notation'`);
            return;
        }

        if (playerIndex != -1 && this.players[playerIndex].status == RoomState.INSPECTION_TIME) {
            if (!isCubeRotation(notation)) {
                if (this.roomStatus == RoomState.INSPECTION_TIME) {
                    this.roomStatus = RoomState.SOLVE_IN_PROGRESS;
                    this.updateGameStatus();
                }

                this.io.to(socketID).emit('solve:in_progress');
                this.players[this.findPlayerIndex(socketID)].status = RoomState.SOLVE_IN_PROGRESS;
            }
        }
    }

    public playerSolveComplete(socketID: string) {
        if (this.rankings.some((player) => player.id == socketID)) return;

        const player = this.players[this.findPlayerIndex(socketID)];
        player.status = RoomState.GAME_ENDED;
        player.solveTime = Number(player.solveTime.toFixed(2));
        this.io.to(socketID).emit('player:completed_solve', player);

        let inserted = false;

        for (let i = 0; i < this.rankings.length; i++) {
            if (this.rankings[i].solveTime > player.solveTime) {
                inserted = true;
                this.rankings.splice(i, 0, player);
                break;
            }
        }

        if (!inserted) this.rankings.push(player);

        if (!this.players.some((player) => !player.isDNF || player.status != RoomState.GAME_ENDED)) {
            console.log('rankings', this.rankings);
            this.io.to(socketID).emit('game:complete', this.rankings);
        }

        this.updateGameStatus();
    }

    public processRematchRequest(socketID: string) {
        let isQueued = this.rematchQueue.some((playerID) => playerID === socketID);

        // If current player is the last one needed for rematch, intialize rematch
        if (!isQueued && this.rematchQueue.length === this.maxPlayerCount - 1) {
            return true;
        }

        // If player is already queued to rematch and clicks rematch again, remove from queue
        isQueued
            ? (this.rematchQueue = this.rematchQueue.filter((playerID) => playerID != socketID))
            : this.rematchQueue.push(socketID);
        isQueued = !isQueued;

        this.io
            .to(this.roomID)
            .emit(
                'room:rematch_pending',
                socketID,
                { queueSize: this.rematchQueue.length, playerCount: this.players.length },
                isQueued
            );

        return false;
    }

    private updateGameStatus() {
        console.log('current room state: ', this.roomStatus);
        switch (this.roomStatus) {
            case RoomState.GAME_NOT_STARTED:
                if (this.players.length == this.maxPlayerCount) {
                    for (const player of this.players) {
                        if (player.status == RoomState.GAME_NOT_STARTED) {
                            console.log(this.scramble);
                            this.io.to(player.id).emit('game:start', this.players, this.scramble);
                            player.status = RoomState.INSPECTION_TIME;
                        }
                    }

                    console.log('game start');
                    this.roomStatus = RoomState.INSPECTION_TIME;
                    this.updateGameStatus();
                }
                break;
            case RoomState.INSPECTION_TIME:
                this.io.to(this.roomID).emit('inspection:start', RoomState.INSPECTION_TIME);

                const inspectionTimer = setInterval(() => {
                    this.inspectionTime--;

                    for (const player of this.players) {
                        if (player.status == RoomState.INSPECTION_TIME)
                            this.io.to(player.id).emit('timer:update', this.inspectionTime);
                    }

                    if (
                        this.inspectionTime == 0 ||
                        !this.players.some((player) => player.status == RoomState.INSPECTION_TIME)
                    ) {
                        for (const player of this.players) {
                            if (player.status == RoomState.INSPECTION_TIME) {
                                this.io.to(player.id).emit('solve:in_progress');
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

                            this.io.to(player.id).emit('timer:update', player.solveTime.toFixed(2));

                            if (player.solveTime >= this.solveTimeLimit) {
                                this.playerDNF(player.id);
                            }
                        }
                    }

                    if (!this.players.some((player) => player.status != RoomState.GAME_ENDED)) {
                        for (const player of this.players) {
                            this.rankings.push(player);
                            player.status = RoomState.GAME_ENDED;
                            player.solveTime = Number(player.solveTime.toFixed(2));
                            this.io.to(player.id).emit('player:completed_solve', player);
                        }

                        this.io.to(this.roomID).emit('game:complete', this.rankings);

                        if (this.roomStatus == RoomState.SOLVE_IN_PROGRESS) {
                            this.roomStatus = RoomState.GAME_ENDED;
                            this.updateGameStatus();
                        }

                        clearTimeout(solveTimer);
                    }
                }, 10);
                break;
            case RoomState.GAME_ENDED:
                console.log('GAME HAS ENDED');

                const currentDate = new Date(Date.now()).toISOString();

                const upload = async (username: string, time: number) => {
                    let {error} = await supabase.from('leaderboard').insert({ username: username, time: time, date: currentDate });

                    if (error){
                        console.log(`Failed to upload to DB due to ${JSON.stringify(error)}`);
                    }
                };
                for (const player of this.players) {
                    upload(player.username, player.solveTime)
                }

                // if (this.players.some((player) => player.status != RoomState.GAME_ENDED)) return;

                // this.players = [];
                // this.roomStatus = RoomState.GAME_NOT_STARTED;
                // this.inspectionTime = 15;
                // this.solveTime = 0;
                // this.rankings = [];
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
