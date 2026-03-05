import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketsService } from './tickets.service';
import { Ticket } from '../../common/entities/ticket.entity';
import { NotFoundException } from '@nestjs/common';

const createMockRepository = <T>(): jest.Mocked<Repository<T>> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
} as any);

describe('TicketsService', () => {
  let service: TicketsService;
  let repository: jest.Mocked<Repository<Ticket>>;

  const mockTicket = {
    id: 'ticket-1',
    ticketNumber: 'TKT-ABC123',
    subject: 'Test Ticket',
    description: 'Test description',
    status: 'open',
    priority: 'medium',
    customerId: 'customer-1',
    customerEmail: 'customer@example.com',
    assignedTo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: getRepositoryToken(Ticket),
          useValue: createMockRepository<Ticket>(),
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    repository = module.get(getRepositoryToken(Ticket));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new ticket', async () => {
      const createDto = {
        subject: 'Test Ticket',
        description: 'Description',
        customerId: 'customer-1',
        customerEmail: 'customer@example.com',
      };

      repository.create.mockReturnValue(mockTicket as Ticket);
      repository.save.mockResolvedValue(mockTicket as Ticket);

      const result = await service.create(createDto as any);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createDto,
          status: 'open',
          priority: 'medium',
          ticketNumber: expect.stringMatching(/TKT-/),
        }),
      );
      expect(result).toEqual(mockTicket);
    });

    it('should use provided priority', async () => {
      const createDto = {
        subject: 'Urgent Ticket',
        priority: 'high',
      };

      repository.create.mockImplementation((data: any) => data as Ticket);
      repository.save.mockResolvedValue({ ...mockTicket, priority: 'high' } as Ticket);

      const result = await service.create(createDto as any);

      expect(result.priority).toBe('high');
    });

    it('should generate unique ticket number', async () => {
      repository.create.mockImplementation((data: any) => data as Ticket);
      repository.save.mockResolvedValue(mockTicket as Ticket);

      const result = await service.create({ subject: 'Test' } as any);

      expect(result.ticketNumber).toMatch(/^TKT-[A-Z0-9]+-[A-Z0-9]+$/);
    });
  });

  describe('findAll', () => {
    it('should return all tickets ordered by createdAt', async () => {
      const mockTickets = [mockTicket];
      repository.find.mockResolvedValue(mockTickets as Ticket[]);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockTickets);
    });
  });

  describe('findOne', () => {
    it('should return a ticket by id', async () => {
      repository.findOne.mockResolvedValue(mockTicket as Ticket);

      const result = await service.findOne('ticket-1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'ticket-1' },
      });
      expect(result).toEqual(mockTicket);
    });

    it('should throw NotFoundException if ticket not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a ticket', async () => {
      const updateDto = { subject: 'Updated Subject' };

      repository.findOne.mockResolvedValue(mockTicket as Ticket);
      repository.save.mockResolvedValue({ ...mockTicket, ...updateDto } as Ticket);

      const result = await service.update('ticket-1', updateDto as any);

      expect(result.subject).toBe('Updated Subject');
    });

    it('should throw NotFoundException if ticket not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('assign', () => {
    it('should assign ticket to agent', async () => {
      repository.findOne.mockResolvedValue(mockTicket as Ticket);
      repository.save.mockResolvedValue({
        ...mockTicket,
        assignedTo: 'agent-1',
        status: 'in_progress',
      } as Ticket);

      const result = await service.assign('ticket-1', 'agent-1');

      expect(result.assignedTo).toBe('agent-1');
      expect(result.status).toBe('in_progress');
    });

    it('should throw NotFoundException if ticket not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.assign('non-existent', 'agent-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a ticket', async () => {
      repository.findOne.mockResolvedValue(mockTicket as Ticket);
      repository.remove.mockResolvedValue(mockTicket as Ticket);

      await service.remove('ticket-1');

      expect(repository.remove).toHaveBeenCalledWith(mockTicket);
    });

    it('should throw NotFoundException if ticket not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
