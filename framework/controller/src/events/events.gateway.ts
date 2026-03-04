import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/ws',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, payload: { channel: string }) {
    client.join(payload.channel);
    return { event: 'subscribed', data: payload.channel };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, payload: { channel: string }) {
    client.leave(payload.channel);
    return { event: 'unsubscribed', data: payload.channel };
  }

  // Broadcast server status update
  broadcastServerStatus(serverId: string, status: any) {
    this.server.to(`server:${serverId}`).emit('server:status', status);
  }

  // Broadcast task update
  broadcastTaskUpdate(userId: string, task: any) {
    this.server.to(`user:${userId}`).emit('task:update', task);
  }

  // Broadcast agent heartbeat
  broadcastAgentHeartbeat(serverId: string, data: any) {
    this.server.to(`server:${serverId}`).emit('agent:heartbeat', data);
  }

  // Send notification to specific user
  sendNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }
}
