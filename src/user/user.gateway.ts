import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class UserGateway {
  @WebSocketServer()
  server: Server;

  broadcastUserUpdate(userId: string, oldData: any, newData: any) {
    this.server.emit('userUpdated', { userId, oldData, newData });
  }
}
