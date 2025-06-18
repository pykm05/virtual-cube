import express from "express";
import cors from "cors";
import { Response } from "express";
import { Server, Socket } from "socket.io";
import http from "http";
import { Room } from "./room.ts";
import { Player } from "@/types/player.ts";
import { RoomState } from "@/types/RoomState.ts";

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

app.get('/', (res: Response) => {
    res.send('server running');
});

server.listen(port, () => {
    console.log('connected')
});

const Rooms: Room[] = [];

io.on("connection", (socket: Socket) => {
    let player: Player = { id: socket.id, username: "", status: RoomState.GAME_NOT_STARTED, solveTime: 0, isDNF: false };
    let room: Room | null;
    let prevRoomID: string = "";

    socket.on("initialize player", (username: string) => {
        player.username = username;

        socket.emit("search room");
    });

    socket.on("search room", () => {
        if (room) {
            room.removePlayer(player.id);
            socket.leave(room.roomID);

            prevRoomID = room.roomID;
            room = null;
            player.status = RoomState.GAME_NOT_STARTED;
            player.solveTime = 0;
        }

        room = findRoom(room, prevRoomID);
        io.to(socket.id).emit("room found", room.roomID);
    })

    socket.on("keyboard input", (socketID, key) => {
        if (!room) {
            io.to(socket.id).emit("invalid join");
            return;
        };

        room.handleInput(socketID, key);
    });

    socket.on("user joined", () => {
        if (!room) {
            io.to(socket.id).emit("invalid join");
            return;
        };

        // debugging
        for (const room of Rooms) {
            console.log(`${room.roomID}: ${room.players.length}`)
            if (room.players.length > 2) {
                for (const player of room.players) {
                    console.log(player.id);
                }
            }
        }

        room.addPlayer(socket, player);
    });

    socket.on("new game", (socketID) => {
        if (!room) return;

        room.removePlayer(socketID);
    });

    socket.on("solve complete", (socketID) => {
        if (!room) return;

        if (socket.id == socketID) room.playerSolveComplete(socketID);
    });

    socket.on("remove player", (socketID: string) => {
        if (!room) return;

        room.removePlayer(socketID);
        socket.leave(room.roomID);
    });

    socket.on("disconnect", () => {
        if (room) room.removePlayer(player.id);

        console.log('disconnect');
    });
});

const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

function findRoom(room: Room | null, prevRoomID: string) {
    for (const curr of Rooms) {
        if (curr.players.length <= curr.getMaxPlayerCount() - 1
            && prevRoomID != curr.roomID
            && curr.roomStatus == RoomState.GAME_NOT_STARTED) {
            room = curr;
        }
    }

    if (!room) {
        room = new Room(genRanHex(5), io);
        Rooms.push(room);
        console.log("room could not be found")
    }

    return room;
}
