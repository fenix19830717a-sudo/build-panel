import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../../common/entities/ticket.entity';
import { CreateTicketDto, UpdateTicketDto } from './dto/ticket.dto';
@Injectable()
export class TicketsService {
  constructor(@InjectRepository(Ticket) private ticketRepository: Repository<Ticket>) {}
  private generateTicketNumber(): string {
    return `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2,5).toUpperCase()}`;
  }
  async create(dto: CreateTicketDto): Promise<Ticket> {
    const ticket = this.ticketRepository.create({ ...dto, ticketNumber: this.generateTicketNumber(), status: 'open', priority: dto.priority || 'medium' });
    return this.ticketRepository.save(ticket);
  }
  async findAll(): Promise<Ticket[]> {
    return this.ticketRepository.find({ order: { createdAt: 'DESC' } });
  }
  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }
  async update(id: string, dto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findOne(id);
    Object.assign(ticket, dto);
    return this.ticketRepository.save(ticket);
  }
  async assign(id: string, agentId: string): Promise<Ticket> {
    const ticket = await this.findOne(id);
    ticket.assignedTo = agentId;
    ticket.status = 'in_progress';
    return this.ticketRepository.save(ticket);
  }
  async remove(id: string): Promise<void> {
    const ticket = await this.findOne(id);
    await this.ticketRepository.remove(ticket);
  }
}
