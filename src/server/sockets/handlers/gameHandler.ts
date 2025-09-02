import { Server, Socket } from 'socket.io';
import Room from '@/server/room.ts';
import { Player, PlayerState } from '@/types/player.ts';
import { RoomState } from '@/types/RoomState.ts';
import { genRanHex } from '@/server/lib/utils.ts';
export default function initializeGameHandlers(io: Server, socket: Socket) {
    /*
    Setup event listeners for the socket
    */
    socket.on('player:initialize', (username: string) => initializePlayer(username));
    socket.on('room:join_random', () => joinRandomRoom());
    socket.on('room:join_rematch', () => joinRematchRoom());
    socket.on('room:joined', (roomID: string) => roomJoined(roomID));
    socket.on('keyboard:input', (socketID: string, key: string) => handleKeyboardInput(socketID, key));
    socket.on('player:completed_solve', (socketID) => handleSolveComplete(socketID));
    socket.on('disconnect', () => disconnectPlayer());

    /*
    Initialize player and add to global players list if uninitialized
    Update username as needed
    */
    function initializePlayer(username: string) {
        const player = deps['players'].find((p) => p.id === socket.id);
        const newUsername = username === '' ? 'an unnamed cuber' : username;

        if (player) player.username = newUsername;
        else {
            const player = new Player(socket.id, newUsername);

            if (!player) {
                console.log('Failed to create player');
                io.to(socket.id).emit('join:invalid');
                return;
            }

            deps['players'].push(player);
        }

        socket.emit('player:initialized', socket.id);
    }

    /*
    Search for a room to join and return its roomID
    Does not add the player to the room yet, that is done in roomJoined function
    */
    function joinRandomRoom() {
        // FIXME: Do this cleanly
        deps['rooms'] = deps['rooms'].filter((g) => g.getActivePlayers().length != 0);

        const player = deps['players'].find((p) => p.id === socket.id);

        if (!player) {
            console.log('No player found');
            io.to(socket.id).emit('join:invalid');
            return;
        }

        // Join a room that has space and hasn't started yet
        let room = deps['rooms'].find(
            (r) => r.roomStatus == RoomState.NOT_STARTED && r.getActivePlayers().length <= r.getMaxPlayerCount() - 1
        );

        // If no room found, create a new one
        if (!room) {
            let newRoomID = genRanHex(5);

            while (deps['rooms'].some((r) => r.roomID === newRoomID)) {
                newRoomID = genRanHex(5);
            }

            room = new Room(newRoomID, io);
        }

        deps['rooms'].push(room);

        // Push players to room route
        io.to(socket.id).emit('room:found', room.roomID);
    }

    /*
    Send all players in the room to a new room if all players accept the rematch
    */
    function joinRematchRoom() {
        // FIXME: Do this cleanly
        deps['rooms'] = deps['rooms'].filter((g) => g.getActivePlayers().length != 0);

        const room = deps['rooms'].find((r) => r.getActivePlayers().some((p) => p.id === socket.id));
        const player = deps['players'].find((p) => p.id === socket.id);

        if (!room) {
            console.log(`[WARN] Failed to send players to rematch room: Room not found (player id: ${socket.id})`);
            io.to(socket.id).emit('join:invalid');
            return;
        }

        if (!player) {
            console.log(`[WARN] Failed to send player from game ${room.roomID} to rematch room: Player not found`);
            io.to(socket.id).emit('join:invalid');
            return;
        }

        const allPlayersAccepted = room.processRematchRequest(socket.id);

        if (allPlayersAccepted) {
            console.log('Rematch accepted by all players, creating new room');
            // FIXME: This is flawed, we only check for a room that has at least one empty space, which if found
            // won't be able to receive all the players from the last game.
            let newRoom = deps['rooms'].find(
                (r) => r.roomStatus == RoomState.NOT_STARTED && r.getActivePlayers().length <= r.getMaxPlayerCount() - 1
            );

            // If no room found, create a new one
            if (!newRoom) {
                let newRoomID = genRanHex(5);

                while (deps['rooms'].some((r) => r.roomID === newRoomID)) {
                    newRoomID = genRanHex(5);
                }

                newRoom = new Room(newRoomID, io);
            }

            deps['rooms'].push(newRoom);

            // Push players to room route
            io.to(room.roomID).emit('room:found', newRoom.roomID);
        }
    }

    /*
    Attempts to start the game when a player successfully joins the room
    Removes player from any previous room they were in
    */
    function roomJoined(roomID: string) {
        console.log('------------------- ROOM DEBUG -------------------');
        for (const room of deps['rooms']) {
            room.debug();
        }
        console.log('-------------------            -------------------');

        const room = deps['rooms'].find((r) => r.roomID === roomID);
        const player = deps['players'].find((p) => p.id === socket.id);

        if (!player) {
            console.log('Player not found');
            io.to(socket.id).emit('join:invalid');
            return;
        }

        if (!room) {
            console.log('Room not found');
            io.to(socket.id).emit('join:invalid');
            return;
        }

        // if user is already in a room, leave that room first
        let currentRoom = deps['rooms'].find((r) => r.getActivePlayers().some((p) => p.id === socket.id));

        if (currentRoom) {
            currentRoom.playerLeft(player.id);
            socket.leave(currentRoom.roomID);

            player.state = PlayerState.NOT_YET_STARTED;
            player.solveTime = 0;
            player.moveList = '';
        }

        socket.join(room.roomID);
        room.addPlayer(socket, player);

        for (const room of deps['rooms']) {
            room.debug();
        }

        console.log(`All rooms: ${deps['rooms'].length}`);

        room.tryStartGame();
    }

    /*
    Recieve keyboard input (AS CUBE NOTATION string) from a player and forward it to the room they are in
    */
    function handleKeyboardInput(senderID: string, notationString: string) {
        let room = deps['rooms'].find((r) => r.getActivePlayers().some((p) => p.id === senderID));

        if (!room) {
            console.log('Misdirected input, no room found');
            io.to(socket.id).emit('join:invalid');
            return;
        }

        room.handleInput(senderID, notationString);
    }

    /*
    Alert the room that a player has completed their solve
    */
    function handleSolveComplete(socketID: string) {
        let room = deps['rooms'].find((r) => r.getActivePlayers().some((p) => p.id === socket.id));
        if (!room) return;

        console.log('A player sent solveComplete');
        if (socket.id == socketID) room.playerSolveComplete(socketID);
    }

    /*
    Handle player disconnection, mark them as DISCONNECTED in their room
    */
    function disconnectPlayer() {
        let room = deps['rooms'].find((r) => r.getActivePlayers().some((p) => p.id === socket.id));
        const player = deps['players'].find((p) => p.id === socket.id);

        if (!player) {
            io.to(socket.id).emit('join:invalid');
            return;
        }
        if (room) room.playerLeft(player.id);

        console.log(`[INFO] Player ${player.id} has disconnected`);
    }
}
