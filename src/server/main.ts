import express from "express";
import cors from "cors";
import http from "http";
import { Server, Socket } from "socket.io";
import { Room } from "./room.ts";
import { Player } from "@/types/player.ts";
import { RoomState } from "@/types/RoomState.ts";

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.get("/", (_, res) => {
  res.send("server running");
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const rooms: Room[] = [];

io.on("connection", (socket: Socket) => {
  const player: Player = {
    id: socket.id,
    username: "",
    status: RoomState.GAME_NOT_STARTED,
    solveTime: 0,
    isDNF: false,
  };

  let currentRoom: Room | null = null;
  let previousRoomID = "";

  socket.on("player:initialize", (username: string) => {
    player.username = username;
    socket.emit("room:search");
  });

  socket.on("room:search", () => {
    if (currentRoom) {
      currentRoom.removePlayer(player.id);
      socket.leave(currentRoom.roomID);
      previousRoomID = currentRoom.roomID;
      currentRoom = null;
      player.status = RoomState.GAME_NOT_STARTED;
      player.solveTime = 0;
    }

    currentRoom = findOrCreateRoom(previousRoomID);
    socket.emit("room:found", currentRoom.roomID);
  });

  socket.on("user:joined", () => {
    if (!currentRoom) {
      socket.emit("join:invalid");
      return;
    }

    for (const r of rooms) {
      console.log(`${r.roomID}: ${r.players.length}`);
      if (r.players.length > 2) {
        for (const p of r.players) {
          console.log(p.id);
        }
      }
    }

    currentRoom.addPlayer(socket, player);
  });

  socket.on("keyboard:input", (socketID: string, key: string) => {
    if (!currentRoom) {
      socket.emit("join:invalid");
      return;
    }

    currentRoom.handleInput(socketID, key);
  });

  socket.on("player:completed_solve", (socketID: string) => {
    if (currentRoom && socket.id === socketID) {
      currentRoom.playerSolveComplete(socketID);
    }
  });

  socket.on("player:remove", (socketID: string) => {
    if (!currentRoom) return;

    currentRoom.removePlayer(socketID);
    socket.leave(currentRoom.roomID);
  });

  socket.on("disconnect", () => {
    if (currentRoom) {
      currentRoom.removePlayer(player.id);
    }

    console.log("Client disconnected:", socket.id);
  });
});

function generateRoomID(length: number): string {
  return [...Array(length)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}

function findOrCreateRoom(prevRoomID: string): Room {
  for (const r of rooms) {
    if (
      r.players.length < r.getMaxPlayerCount() &&
      r.roomID !== prevRoomID &&
      r.roomStatus === RoomState.GAME_NOT_STARTED
    ) {
      return r;
    }
  }

  const newRoom = new Room(generateRoomID(5), io);
  rooms.push(newRoom);
  console.log("Created new room:", newRoom.roomID);
  return newRoom;
}
