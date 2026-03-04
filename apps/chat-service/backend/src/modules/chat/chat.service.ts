import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from '../../common/entities/chat-session.entity';
import { ChatMessage } from '../../common/entities/chat-message.entity';
import { CreateSessionDto, SendMessageDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private sessionRepository: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private messageRepository: Repository<ChatMessage>,
  ) {}

  async createSession(dto: CreateSessionDto): Promise<ChatSession> {
    const session = this.sessionRepository.create({ ...dto, status: 'waiting' });
    return this.sessionRepository.save(session);
  }

  async findSessionById(id: string): Promise<ChatSession> {
    const session = await this.sessionRepository.findOne({ where: { id }, relations: ['messages'] });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async findActiveSessions(): Promise<ChatSession[]> {
    return this.sessionRepository.find({
      where: [{ status: 'active' }, { status: 'waiting' }],
      order: { createdAt: 'DESC' },
    });
  }

  async findSessionsByAgent(agentId: string): Promise<ChatSession[]> {
    return this.sessionRepository.find({
      where: { agentId, status: 'active' },
      order: { updatedAt: 'DESC' },
    });
  }

  async sendMessage(dto: SendMessageDto): Promise<ChatMessage> {
    const message = this.messageRepository.create({
      sessionId: dto.sessionId,
      content: dto.content,
      messageType: dto.messageType || 'text',
      senderType: 'visitor',
      read: false,
    });
    await this.sessionRepository.update(dto.sessionId, { updatedAt: new Date() });
    return this.messageRepository.save(message);
  }

  async sendAgentMessage(sessionId: string, agentId: string, agentName: string, content: string): Promise<ChatMessage> {
    const message = this.messageRepository.create({
      sessionId,
      content,
      messageType: 'text',
      senderType: 'agent',
      senderId: agentId,
      senderName: agentName,
      read: true,
    });
    await this.sessionRepository.update(sessionId, { updatedAt: new Date() });
    return this.messageRepository.save(message);
  }

  async sendSystemMessage(sessionId: string, content: string): Promise<ChatMessage> {
    const message = this.messageRepository.create({
      sessionId,
      content,
      messageType: 'system',
      senderType: 'system',
      read: true,
    });
    return this.messageRepository.save(message);
  }

  async assignAgent(sessionId: string, agentId: string): Promise<ChatSession> {
    await this.sessionRepository.update(sessionId, { agentId, status: 'active' });
    return this.findSessionById(sessionId);
  }

  async closeSession(sessionId: string): Promise<ChatSession> {
    await this.sessionRepository.update(sessionId, { status: 'closed', closedAt: new Date() });
    return this.findSessionById(sessionId);
  }

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    return this.messageRepository.find({ where: { sessionId }, order: { createdAt: 'ASC' } });
  }

  async markMessagesAsRead(sessionId: string, senderType: string): Promise<void> {
    await this.messageRepository.update(
      { sessionId, senderType, read: false },
      { read: true, readAt: new Date() },
    );
  }
}
