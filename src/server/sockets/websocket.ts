import { Server } from 'http';
import { Socket, Server as SocketServer } from 'socket.io';
import initializeGameHandlers from './handlers/gameHandler';

export default class WebSocket {

  public io!: SocketServer;

  public init(server: Server) {
    this.io = new SocketServer(server, {
      cors: {
        origin: '*',
      },
    });

    this.io.on('connection', (socket: Socket) => {
      initializeGameHandlers(this.io, socket);
    });
  }
}