import { io, Socket } from 'socket.io-client';
import { Player } from '@/types/player';

const NEXT_PUBLIC_API_URL = 'http://localhost:4000/';

// const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000';
const URL = NEXT_PUBLIC_API_URL;
let socket: Socket;

export function getSocket() {
    if (!socket) {
        socket = io(URL);
    }

    return socket;
}

export function getPlayerOrder(players: Player[]) {
    const length = players.length;
    for (let i = 0; i < length - 1; i++) {
        if (players[i].socketId == socket.id) {
            let tmp = players[i];
            players[i] = players[length - 1];
            players[length - 1] = tmp;
            break;
        }
    }
    return players;
}

export type { Socket };
