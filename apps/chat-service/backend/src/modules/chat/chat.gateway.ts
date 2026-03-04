import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_session')
  async handleJoinSession(@MessageBody() data: { sessionId: string }, @ConnectedSocket() client: Socket) {
    client.join(data.sessionId);
    client.emit('joined_session', { sessionId: data.sessionId });
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(@MessageBody() data: { sessionId: string; content: string; senderType: 'visitor' | 'agent'; senderId?: string; senderName?: string }) {
    let message;
    if (data.senderType === 'agent') {
      message = await this.chatService.sendAgentMessage(data.sessionId, data.senderId, data.senderName, data.content);
    } else {
      message = await this.chatService.sendMessage({ sessionId: data.sessionId, content: data.content, messageType: 'text' });
    }
    this.server.to(data.sessionId).emit('new_message', message);
    return message;
  }

  @SubscribeMessage('typing')
  async handleTyping(@MessageBody() data: { sessionId: string; user: string; isTyping: boolean }, @ConnectedSocket() client: Socket) {
    client.to(data.sessionId).emit('typing', { user: data.user, isTyping: data.isTyping });
  }

  @SubscribeMessage('agent_join')
  async handleAgentJoin(@MessageBody() data: { sessionId: string; agentId: string; agentName: string }) {
    await this.chatService.assignAgent(data.sessionId, data.agentId);
    const systemMessage = await this.chatService.sendSystemMessage(data.sessionId, `${data.agentName} 已加入对话`);
    this.server.to(data.sessionId).emit('agent_joined', { agentId: data.agentId, agentName: data.agentName });
    this.server.to(data.sessionId).emit('new_message', systemMessage);
  }

  @SubscribeMessage('close_session')
  async handleCloseSession(@MessageBody() data: { sessionId: string }) {
    await this.chatService.closeSession(data.sessionId);
    const systemMessage = await this.chatService.sendSystemMessage(data.sessionId, '对话已结束');
    this.server.to(data.sessionId).emit('session_closed', { sessionId: data.sessionId });
    this.server.to(data.sessionId).emit('new_message', systemMessage);
  }
}
