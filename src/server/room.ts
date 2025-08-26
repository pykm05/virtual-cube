import { Server, Socket } from 'socket.io';
import { Player, PlayerState } from '@/types/player';
import { RoomState } from '@/types/RoomState';
import { generate3x3Scramble } from './lib/utils';
import { isCubeRotation, notationFromString } from '@/types/cubeTypes';
import { supabase } from './db';

export default class Room {
    public roomID: string;
    public players: Player[] = [];
    public roomStatus = RoomState.NOT_STARTED;

    // 20 moves scrambles are linked to db structure, mind that if you ever change this
    public scramble: string = generate3x3Scramble(20);

    private maxPlayerCount = 2;

    private inspectionTime = 15;
    private solveTimeLimit: number = 300; // 300

    private rematchQueue: string[] = [];
    private io: Server;
    private rankings: Player[] = [];

    constructor(roomID: string, io: Server) {
        console.log(`New room initialized with:\n  Id: ${roomID}\n  Scramble: ${this.scramble}`);
        this.io = io;
        this.roomID = roomID;
    }

    public getMaxPlayerCount() {
        return this.maxPlayerCount;
    }

    public tryStartGame() {
        // If we're still waiting for players or if a player is not waiting for the game to start
        if (
            this.players.length != this.maxPlayerCount ||
            this.players.some((p) => p.state != PlayerState.NOT_YET_STARTED)
        ) {
            return;
        }

        this.startInspection();
    }

    public addPlayer(socket: Socket, player: Player) {
        if (this.players.length >= this.maxPlayerCount || this.players.some((p) => p.id == socket.id)) {
            socket.to(socket.id).emit('join:invalid');
            return;
        }

        this.players.push(player);
        this.tryStartGame();
    }

    // FIXME: Can't this break if the game has already started ?
    public removePlayer(socketID: string) {
        this.players = this.players.filter((p) => p.id !== socketID);
    }

    public playerLeft(socketID: string) {
        const player = this.players.find((p) => p.id == socketID);

        if (!player) {
            console.log(`[WARN] Called room.playerLeft with an invalid socket id: ${socketID}`);
            return;
        }

        player.state = PlayerState.LEFT;
        // Still unsure of that `LEFT` state, so to be sure we don't fuck up the logic
        // let's put their time as the max so they don't accidentally win :)
        player.solveTime = this.solveTimeLimit;
        this.rankings.push(player);
        this.io.to(socketID).emit('player:completed_solve', player);
    }

    public handleInput(socketID: string, notationString: string) {
        let player = this.players.find((p) => p.id == socketID);

        // If the player is not here, there is no point sending the event to the ws room
        if (!player) {
            return;
        }

        this.io.to(this.roomID).emit('keyboard:input', socketID, notationString);

        const notation = notationFromString(notationString);

        if (!notation) {
            console.log(`Failed to handle input '${notationString}': Invalid notation'`);
            return;
        }

        player.moveList += ' ' + notationString;

        if (player.state != PlayerState.INSPECTION || isCubeRotation(notation)) {
            return;
        }

        // If that player is the first one start solving, start the solve timer
        if (this.players.every((p) => p.state == PlayerState.INSPECTION)) {
            this.startSolve();
        }

        player.state = PlayerState.SOLVING;
        this.io.to(socketID).emit('solve:in_progress');
    }

    public playerSolveComplete(socketID: string) {
        const player = this.players.find((p) => p.id == socketID);

        if (!player) {
            console.log(`[WARN] Called room.playerSolveComplete with an invalid socket id: ${socketID}`);
            return;
        }

        player.solveTime = Number(player.solveTime.toFixed(2));
        player.state = PlayerState.SOLVED;

        this.io.to(socketID).emit('player:completed_solve', player);

        // TODO: Rethink that
        // Rank players by their solve time
        let inserted = false;
        for (let i = 0; i < this.rankings.length; i++) {
            if (this.rankings[i].solveTime > player.solveTime) {
                inserted = true;
                this.rankings.splice(i, 0, player);
                break;
            }
        }
        if (!inserted) this.rankings.push(player);

        // TODO: Make sure this has the same logic as the commented bloc under
        // (my brain is fried rn)
        if (
            this.players.every(
                (player) =>
                    player.state == PlayerState.SOLVED ||
                    player.state == PlayerState.LEFT ||
                    player.state == PlayerState.DNF
            )
        ) {
            console.log('rankings', this.rankings);
            this.io.to(socketID).emit('game:complete', this.rankings);
        }

        // if (!this.players.some((player) => !player.isDNF || player.status != RoomState.GAME_ENDED)) {
        //     console.log('rankings', this.rankings);
        //     this.io.to(socketID).emit('game:complete', this.rankings);
        // }
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

    // Switches the game state to PLAYING, informs the players and kickstarts the inspection loop
    private startInspection() {
        if (
            this.players.length != this.maxPlayerCount ||
            !this.players.every((p) => p.state == PlayerState.NOT_YET_STARTED) // needed ?
        ) {
            console.log(
                `[WARN] Called room.startInspection but some players are missing or a player has already started`
            );
            return;
        }

        this.roomStatus = RoomState.PLAYING;

        // Notify all players that the game has started
        for (const player of this.players) {
            if (player.state != PlayerState.NOT_YET_STARTED) continue;

            this.io.to(player.id).emit('game:start', this.players, this.scramble);
            player.state = PlayerState.INSPECTION;
        }

        console.log(`[INFO] Game ${this.roomID} is starting`);

        // Sync up the clients to start their inspection (probably could be removed if clients reacted to the game:start)
        this.io.to(this.roomID).emit('inspection:start');

        // Since we switched to PLAYING, let's kickstart the inspection
        // TODO: Rework this callback to use only one loop
        const inspection_update_interval = setInterval(() => {
            console.log('[DEBUG] Inspection loop');
            this.inspectionTime--;

            // Send timer updates to players that are still in inspection
            for (const player of this.players) {
                if (player.state != PlayerState.INSPECTION) continue;

                this.io.to(player.id).emit('timer:update', this.inspectionTime);
            }

            // Inspection time's up
            if (this.inspectionTime == 0) {
                // Notifies players that are still in inspection that time is up
                for (const player of this.players) {
                    if (player.state != PlayerState.INSPECTION) continue;

                    player.state = PlayerState.SOLVING;
                    this.io.to(player.id).emit('solve:in_progress');
                }
            }

            // Make sure to clear the interval if all players left the inspection state
            if (this.players.every((p) => p.state != PlayerState.INSPECTION)) {
                clearInterval(inspection_update_interval);
            }
        }, 1000);
    }

    // At least one player is solving
    private startSolve() {
        // I wanted to add a player state condition here, but it might be overkill
        if (this.players.length != this.maxPlayerCount) {
            console.log('[WARN] Called room.startSolve but a player is missing');
            return;
        }

        console.log(`[INFO] Game ${this.roomID} is starting its solve update loop`);

        const update_tps = 100;

        const solve_update_interval = setInterval(() => {
            // Update player's time and notify them
            for (const player of this.players) {
                if (player.state != PlayerState.SOLVING) continue;

                player.solveTime += 1 / update_tps;

                this.io.to(player.id).emit('timer:update', player.solveTime.toFixed(2));

                // If they ran out of time, call this neat function
                if (player.solveTime >= this.solveTimeLimit) {
                    // TODO: Check that please
                    player.state = PlayerState.DNF;
                }
            }

            // TODO: Handle thoses 3 cases more gracefully

            // A player had left
            if (this.players.some((player) => player.state == PlayerState.LEFT)) {
                console.log(`[WARN] A player has left during the solve`);
            }

            // A player has ran out of time
            if (this.players.some((player) => player.state == PlayerState.DNF)) {
                console.log(`[WARN] A player has left during the solve`);
            }

            // All players finished their solve
            if (this.players.every((player) => player.state == PlayerState.SOLVED)) {
                clearInterval(solve_update_interval);

                for (const player of this.players) {
                    // Round the time to 10^-2
                    player.solveTime = Number(player.solveTime.toFixed(2));

                    // Notify the player that their solve has been registered
                    this.io.to(player.id).emit('player:completed_solve', player);
                }

                // Wrap up, save score, rematch ?
                this.gameEnd();
            }
        }, 1000 / update_tps);
    }

    // All player have finished their solve, ran out of time or left
    // Write solves to db, cleanup the room, prepare rematch
    private gameEnd() {
        if (this.players.some((p) => p.state != PlayerState.SCORES)) {
            console.log(`[WARN] Called room.gameEnd but some player is still playing`);
            return;
        }

        for (const player of this.players) {
            this.rankings.push(player);
        }

        console.log(`[INFO] Game ${this.roomID} has ended`);

        const currentDate = new Date(Date.now()).toISOString();

        const upload = async (username: string, solve_duration: number, move_list: string) => {
            let { error } = await supabase.from('leaderboard').insert({
                username: username,
                solve_duration: solve_duration,
                solved_at: currentDate,
                scramble: this.scramble,
                move_list: move_list,
            });

            if (error) {
                console.log(`[ERROR] Failed to upload to DB due to ${JSON.stringify(error)}`);
            }
        };

        for (const player of this.players) {
            if (player.state != PlayerState.SOLVED) continue;

            upload(player.username, player.solveTime, player.moveList);
        }
    }
}
