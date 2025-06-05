import { io, Socket } from "socket.io-client";
import { Player } from "@/types/player";

// const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000';
const URL = process.env.NEXT_PUBLIC_API_URL;
let socket: Socket;

export function getSocket() {
    if (!socket) {
        socket = io(URL);
    }

    return socket;
}

export function getPlayerOrder(players: Player[]) {
    for (let i = 0; i < players.length; i++) {
        if (players[i].id == socket.id) {
            let tmp = players[i];
            players[i] = players[0];
            players[0] = tmp;
        }
    }
    return players;
}

export type { Socket };