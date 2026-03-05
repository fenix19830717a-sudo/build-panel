import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatService } from './chat.service';
import { ChatSession } from '../../common/entities/chat-session.entity';
import { ChatMessage } from '../../common/entities/chat-message.entity';
import { NotFoundException } from '@nestjs/common';

const createMockRepository = <T>(): jest.Mocked<Repository<T>> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
} as any);

describe('ChatService', () => {
  let service: ChatService;
  let sessionRepository: jest.Mocked<Repository<ChatSession>>;
  let messageRepository: jest.Mocked<Repository<ChatMessage>>;

  const mockSession = {
    id: 'session-1',
    visitorId: 'visitor-1',
    visitorName: 'Test Visitor',
    status: 'waiting',
    agentId: null,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMessage = {
    id: 'message-1',
    sessionId: 'session-1',
    content: 'Hello',
    messageType: 'text',
    senderType: 'visitor',
    senderId: null,
    senderName: null,
    read: false,
    readAt: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getRepositoryToken(ChatSession),
          useValue: createMockRepository<ChatSession>(),
        },
        {
          provide: getRepositoryToken(ChatMessage),
          useValue: createMockRepository<ChatMessage>(),
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    sessionRepository = module.get(getRepositoryToken(ChatSession));
    messageRepository = module.get(getRepositoryToken(ChatMessage));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a new chat session', async () => {
      const createDto = {
        visitorId: 'visitor-1',
        visitorName: 'Test Visitor',
      };

      sessionRepository.create.mockReturnValue(mockSession as ChatSession);
      sessionRepository.save.mockResolvedValue(mockSession as ChatSession);

      const result = await service.createSession(createDto as any);

      expect(sessionRepository.create).toHaveBeenCalledWith({
        ...createDto,
        status: 'waiting',
      });
      expect(result).toEqual(mockSession);
    });
  });

  describe('findSessionById', () => {
    it('should return a session by id', async () => {
      sessionRepository.findOne.mockResolvedValue(mockSession as ChatSession);

      const result = await service.findSessionById('session-1');

      expect(sessionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        relations: ['messages'],
      });
      expect(result).toEqual(mockSession);
    });

    it('should throw NotFoundException if session not found', async () => {
      sessionRepository.findOne.mockResolvedValue(null);

      await expect(service.findSessionById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findActiveSessions', () => {
    it('should return active and waiting sessions', async () => {
      const mockSessions = [mockSession];
      sessionRepository.find.mockResolvedValue(mockSessions as ChatSession[]);

      const result = await service.findActiveSessions();

      expect(sessionRepository.find).toHaveBeenCalledWith({
        where: [{ status: 'active' }, { status: 'waiting' }],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockSessions);
    });
  });

  describe('findSessionsByAgent', () => {
    it('should return sessions assigned to agent', async () => {
      const mockSessions = [{ ...mockSession, agentId: 'agent-1', status: 'active' }];
      sessionRepository.find.mockResolvedValue(mockSessions as ChatSession[]);

      const result = await service.findSessionsByAgent('agent-1');

      expect(sessionRepository.find).toHaveBeenCalledWith({
        where: { agentId: 'agent-1', status: 'active' },
        order: { updatedAt: 'DESC' },
      });
      expect(result).toEqual(mockSessions);
    });
  });

  describe('sendMessage', () => {
    it('should send visitor message', async () => {
      const sendDto = {
        sessionId: 'session-1',
        content: 'Hello',
        messageType: 'text',
      };

      messageRepository.create.mockReturnValue(mockMessage as ChatMessage);
      messageRepository.save.mockResolvedValue(mockMessage as ChatMessage);

      const result = await service.sendMessage(sendDto as any);

      expect(messageRepository.create).toHaveBeenCalledWith({
        sessionId: 'session-1',
        content: 'Hello',
        messageType: 'text',
        senderType: 'visitor',
        read: false,
      });
      expect(sessionRepository.update).toHaveBeenCalledWith('session-1', {
        updatedAt: expect.any(Date),
      });
      expect(result).toEqual(mockMessage);
    });

    it('should use default message type if not provided', async () => {
      const sendDto = {
        sessionId: 'session-1',
        content: 'Hello',
      };

      messageRepository.create.mockReturnValue(mockMessage as ChatMessage);
      messageRepository.save.mockResolvedValue(mockMessage as ChatMessage);

      await service.sendMessage(sendDto as any);

      expect(messageRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ messageType: 'text' }),
      );
    });
  });

  describe('sendAgentMessage', () => {
    it('should send agent message', async () => {
      const agentMessage = {
        ...mockMessage,
        senderType: 'agent',
        senderId: 'agent-1',
        senderName: 'Agent Name',
        read: true,
      };

      messageRepository.create.mockReturnValue(agentMessage as ChatMessage);
      messageRepository.save.mockResolvedValue(agentMessage as ChatMessage);

      const result = await service.sendAgentMessage('session-1', 'agent-1', 'Agent Name', 'Hello');

      expect(messageRepository.create).toHaveBeenCalledWith({
        sessionId: 'session-1',
        content: 'Hello',
        messageType: 'text',
        senderType: 'agent',
        senderId: 'agent-1',
        senderName: 'Agent Name',
        read: true,
      });
      expect(result.senderType).toBe('agent');
      expect(result.read).toBe(true);
    });
  });

  describe('sendSystemMessage', () => {
    it('should send system message', async () => {
      const systemMessage = {
        ...mockMessage,
        senderType: 'system',
        messageType: 'system',
        read: true,
      };

      messageRepository.create.mockReturnValue(systemMessage as ChatMessage);
      messageRepository.save.mockResolvedValue(systemMessage as ChatMessage);

      const result = await service.sendSystemMessage('session-1', 'System notification');

      expect(messageRepository.create).toHaveBeenCalledWith({
        sessionId: 'session-1',
        content: 'System notification',
        messageType: 'system',
        senderType: 'system',
        read: true,
      });
      expect(result.senderType).toBe('system');
    });
  });

  describe('assignAgent', () => {
    it('should assign agent to session', async () => {
      const updatedSession = { ...mockSession, agentId: 'agent-1', status: 'active' };

      sessionRepository.update.mockResolvedValue({ affected: 1 } as any);
      sessionRepository.findOne.mockResolvedValue(updatedSession as ChatSession);

      const result = await service.assignAgent('session-1', 'agent-1');

      expect(sessionRepository.update).toHaveBeenCalledWith('session-1', {
        agentId: 'agent-1',
        status: 'active',
      });
      expect(result.agentId).toBe('agent-1');
      expect(result.status).toBe('active');
    });
  });

  describe('closeSession', () => {
    it('should close a session', async () => {
      const closedSession = { ...mockSession, status: 'closed', closedAt: new Date() };

      sessionRepository.update.mockResolvedValue({ affected: 1 } as any);
      sessionRepository.findOne.mockResolvedValue(closedSession as ChatSession);

      const result = await service.closeSession('session-1');

      expect(sessionRepository.update).toHaveBeenCalledWith('session-1', {
        status: 'closed',
        closedAt: expect.any(Date),
      });
      expect(result.status).toBe('closed');
    });
  });

  describe('getMessages', () => {
    it('should return messages for a session', async () => {
      const mockMessages = [mockMessage];
      messageRepository.find.mockResolvedValue(mockMessages as ChatMessage[]);

      const result = await service.getMessages('session-1');

      expect(messageRepository.find).toHaveBeenCalledWith({
        where: { sessionId: 'session-1' },
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual(mockMessages);
    });
  });

  describe('markMessagesAsRead', () => {
    it('should mark messages as read', async () => {
      messageRepository.update.mockResolvedValue({ affected: 5 } as any);

      await service.markMessagesAsRead('session-1', 'visitor');

      expect(messageRepository.update).toHaveBeenCalledWith(
        { sessionId: 'session-1', senderType: 'visitor', read: false },
        { read: true, readAt: expect.any(Date) },
      );
    });
  });
});
