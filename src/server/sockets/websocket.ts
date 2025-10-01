import { Server } from 'http';
import { Socket, Server as SocketServer } from 'socket.io';
import GameController from '../game/GameController';

export default class WebSocket {
    public io!: SocketServer;

    public init(server: Server) {
        this.io = new SocketServer(server, {
            cors: {
                origin: '*',
            },
        });

        this.io.on('connection', (socket: Socket) => {
            GameController(this.io, socket);
        });
    }
}
