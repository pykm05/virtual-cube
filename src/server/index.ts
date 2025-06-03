import express from "express";
import cors from "cors";
import { Request, Response } from "express";
import { Server, Socket } from "socket.io";
import http from "http";
import { Room } from "./room.ts";

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

app.get('/', (req: Request, res: Response) => {
    res.send('server running');
});

server.listen(port, () => {
    console.log('connected')
});

const Rooms: Room[] = [];

io.on("connection", (socket: Socket) => {
    let room: Room;

    socket.on("join room", () => {
        room = findRoom(room);
        io.to(socket.id).emit("join room", room.roomID);
    });

    socket.on("keyboard input", (socketID, key) => {
        if (!room) {
            io.to(socket.id).emit("invalid join");
            return;
        };

        room.handleInput(socketID, key)
    })

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

        room.addPlayer(socket);
    })

    socket.on("remove player", (socketID: string) => {
        if (socketID == socket.id) socket.disconnect();
    })

    socket.on("disconnect", () => {
        if (room) room.removePlayer(socket);
        console.log('disconnect');
    })
});

const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

function findRoom(room: Room) {
    for (const curr of Rooms) {
        if (curr.players.length == 1) room = curr;
    }

    if (!room) {
        room = new Room(genRanHex(5), io);
        Rooms.push(room);
        console.log("room could not be found")
    }

    return room;
}
