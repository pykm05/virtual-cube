import { io, Socket } from 'socket.io-client';
import { Player } from '@/types/player';

const URL = 'http://localhost:4000';

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
            const tmp = players[i];
            players[i] = players[length - 1];
            players[length - 1] = tmp;
            break;
        }
    }
    return players;
}

export type { Socket };
