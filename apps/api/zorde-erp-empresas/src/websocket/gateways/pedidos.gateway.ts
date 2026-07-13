import { WebSocketGateway, SubscribeMessage, ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { PedidoStatusChangedEvent } from '../events/pedido.events';

@WebSocketGateway({
  namespace: '/pedidos',
  cors: { origin: 'http://localhost:4200', credentials: true },
})
export class PedidosGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-org')
  handleJoinOrg(@MessageBody() data: { organizationId: string }, @ConnectedSocket() socket: Socket) {
    const room = `org-${data.organizationId}`;
    socket.join(room);
    console.log(`Client ${socket.id} joined room: ${room}`);
  }

  broadcastToOrg(organizationId: string, event: PedidoStatusChangedEvent) {
    const room = `org-${organizationId}`;
    this.server?.to(room).emit('pedido:status-changed', {
      pedidoId: event.pedidoId,
      fromStageId: event.fromStageId,
      toStageId: event.toStageId,
      changedBy: event.changedBy,
      timestamp: new Date(),
    });
  }
}
