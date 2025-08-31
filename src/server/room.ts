import { Server, Socket } from 'socket.io';
import { Player, PlayerState } from '@/types/player';
import { RoomState } from '@/types/RoomState';
import { generate3x3Scramble } from './lib/utils';
import { isCubeRotation, notationFromString } from '@/types/cubeTypes';
import { supabase } from './db';

export default class Room {
    public roomID: string;
    public roomStatus = RoomState.NOT_STARTED;

    // NOTE: There is an assumption that **once a game is started, no player can be removed from this array**
    // If they leave, mark them as left using their PlayerState, do not remove them from this list.
    private players: Player[] = [];

    // NOTE: 20 moves scrambles are linked to db structure, mind that if you ever change this
    // public scramble: string = generate3x3Scramble(20);
    private scramble: string = "L'";

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

    public debug(){
        console.log(`[INFO] Room ${this.roomID} with ${this.players.length} players:`);
        for (const player of this.players){
            console.log(`\t${player.id}\n\t${player.username} - ${player.state}`);
        }
    }

    // NOTE: Some code using that function uses the room.players array assumption from above
    public getActivePlayers(): Player[] {
        return this.players.filter((p) => p.state != PlayerState.DISCONNECTED);
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
        console.log("Current players: ", ...this.players);
        this.tryStartGame();
    }

    public playerLeft(socketID: string) {
        const player = this.players.find((p) => p.id == socketID);

        if (!player) {
            console.log(`[WARN] Called room.playerLeft with an invalid socket id: ${socketID}`);
            return;
        }

        // If the game has not started, easy, remove the player
        // NOTE: Check room.players' note in room definition
        if (this.roomStatus != RoomState.PLAYING) {
            this.players = this.players.filter((p) => p.id != player.id);
            return;
        }

        // Else, it's more complicated
        // We need to treat the player as someone that played, but left

        player.state = PlayerState.DISCONNECTED;
        // TODO: re-add this
        // this.io.to(this.roomID).emit('player:state_update', player.id, player.state);

        // Still unsure of that `DISCONNECTED` state, so to be sure we don't fuck up the logic
        // let's put their time as the max so they don't accidentally win :)
        player.solveTime = this.solveTimeLimit;
    }

    public handleInput(socketID: string, notationString: string) {
        let player = this.players.find((p) => p.id == socketID);

        // If the player is not here, there is no point sending the event to the ws room
        if (!player) {
            console.log(`[ERROR] Tried to call room.handleInput with an invalid socket id: '${socketID}'`);
            return;
        }

        console.log(`Player move: ${notationString}`);
        
        this.io.to(this.roomID).emit('keyboard:input', socketID, notationString);

        const notation = notationFromString(notationString);

        if (!notation) {
            console.log(`Failed to handle input '${notationString}': Invalid notation'`);
            return;
        }

        player.moveList += ' ' + notationString;

        console.log(`Player state: ${player.state}`)

        if (player.state != PlayerState.INSPECTION || isCubeRotation(notation)) {
            console.log("player is not in inspection or move is a cube rotation")
            return;
        }

        // If that player is the first one start solving, start the solve timer
        if (this.players.every((p) => p.state == PlayerState.INSPECTION)) {
            this.startSolve();
        }

        player.state = PlayerState.SOLVING;
        this.io.to(this.roomID).emit('player:state_update', player.id, player.state);
    }

    public playerSolveComplete(socketID: string) {
        const player = this.players.find((p) => p.id == socketID);

        if (!player) {
            console.log(`[WARN] Called room.playerSolveComplete with an invalid socket id: ${socketID}`);
            return;
        }

        player.solveTime = Number(player.solveTime.toFixed(2));
        player.state = PlayerState.SOLVED;
        this.io.to(this.roomID).emit('player:state_update', player.id, player.state);

        // // TODO: Make sure this has the same logic as the commented bloc under
        // // (my brain is fried rn)
        // if (
        //     this.players.every(
        //         (player) =>
        //             player.state == PlayerState.SOLVED ||
        //             player.state == PlayerState.DISCONNECTED ||
        //             player.state == PlayerState.DNF
        //     )
        // ) {
        //     console.log('rankings', this.rankings);
        //     this.io.to(socketID).emit('game:complete', this.rankings);
        // }

        // // if (!this.players.some((player) => !player.isDNF || player.status != RoomState.GAME_ENDED)) {
        // //     console.log('rankings', this.rankings);
        // //     this.io.to(socketID).emit('game:complete', this.rankings);
        // // }
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
            this.players.length != this.maxPlayerCount
        ) {
            console.log(
                `[WARN] Called room.startInspection but some players are missing or a player has already started`
            );
            return;
        }

        this.roomStatus = RoomState.PLAYING;

        console.log(`[INFO] Game ${this.roomID} is starting with`, ...this.players);

        // Notify all players that the game has started
        for (const player of this.players) {
            console.log("SENDING GAME:START");
            this.io.to(player.id).emit('game:start', this.players, this.scramble);

            player.state = PlayerState.INSPECTION;
            this.io.to(player.id).emit('player:state_update', player.id, player.state);
        }

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
                    this.io.to(this.roomID).emit('player:state_update', player.id, player.state);
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
                    player.state = PlayerState.DNF;
                    this.io.to(this.roomID).emit('player:state_update', player.id, player.state);
                }
            }

            // If all players are still solving, no need to do all the following end game checks
            if (this.players.every((p) => p.state == PlayerState.SOLVING)) {
                return;
            }

            // TODO: Handle thoses 3 cases more gracefully

            // // A player had left
            // if (this.players.some((player) => player.state == PlayerState.DISCONNECTED)) {
            //     console.log(`[WARN] A player has left during the solve`);
            // }

            // // A player has ran out of time
            // if (this.players.some((player) => player.state == PlayerState.DNF)) {
            //     console.log(`[WARN] A player has left during the solve`);
            // }

            // All players finished their solve, or left
            if (
                this.players.every(
                    (player) =>
                        player.state == PlayerState.SOLVED ||
                        player.state == PlayerState.DNF ||
                        player.state == PlayerState.DISCONNECTED
                )
            ) {
                clearInterval(solve_update_interval);

                for (const player of this.players) {
                    // Round the time to 10^-2
                    player.solveTime = Number(player.solveTime.toFixed(2));

                    this.io.to(this.roomID).emit('player:state_update', player.id, player.state);
                }

                // Wrap up, save score, rematch ?
                this.gameEnd();
            }
        }, 1000 / update_tps);
    }

    // All player have finished their solve, ran out of time or left
    // Write solves to db, cleanup the room, prepare rematch
    private gameEnd() {
        if (
            this.players.some(
                (p) =>
                    p.state != PlayerState.SOLVED &&
                    p.state != PlayerState.DNF &&
                    p.state != PlayerState.DISCONNECTED
            )
        ) {
            console.log(`[WARN] Called room.gameEnd but some player is still playing`);
            return;
        }

        this.roomStatus = RoomState.ENDED;
        
        this.rankings = this.players.slice().sort((pa, pb) => {
            const pts = (p: Player): number => {
                if (p.state == PlayerState.DISCONNECTED) {
                    return Infinity;
                }

                // DNF players should have their time at this.solveTimeLimit
                // (Let's just add something to check that it is the case)
                if (p.state == PlayerState.DNF && p.solveTime != this.solveTimeLimit) {
                    console.log(
                        `[BUG] room.gameEnd found a bug\nA player with the DNF state does not have its solve time equal to this.solveTimeLimit(${this.solveTimeLimit}): ${p.solveTime}`
                    );
                }

                return p.solveTime;
            };

            return pts(pa) - pts(pb);
        });

        this.io.to(this.roomID).emit('game:complete', this.rankings);

        console.log(`[INFO] Game ${this.roomID} has ended`);
        console.log(this.rankings);

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
