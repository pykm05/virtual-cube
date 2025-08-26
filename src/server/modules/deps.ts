import { Player } from '@/types/player';
import Room from '@/server/room';
import WebSocket from '@/server/sockets/websocket';

export interface Deps {
    players: Player[];
    rooms: Room[];
    webSocket: WebSocket;
}

const deps: Deps = {
    players: [],
    rooms: [],
    webSocket: new WebSocket(),
};

globalThis.deps = deps;
