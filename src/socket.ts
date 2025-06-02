import { io, Socket } from "socket.io-client";

// const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000';
const URL = process.env.NEXT_PUBLIC_API_URL;
let socket: Socket | null = null;

export function getSocket() {
    if (!socket) {
        socket = io(URL);
    }

    return socket;
}

export type { Socket };