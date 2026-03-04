import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from '../../common/entities/agent.entity';
import { CreateAgentDto, UpdateAgentDto } from './dto/agent.dto';
@Injectable()
export class AgentsService {
  constructor(@InjectRepository(Agent) private agentRepository: Repository<Agent>) {}
  async create(dto: CreateAgentDto): Promise<Agent> {
    const existing = await this.agentRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already exists');
    const agent = this.agentRepository.create({ ...dto, status: 'offline', roles: ['agent'] });
    return this.agentRepository.save(agent);
  }
  async findAll(): Promise<Agent[]> {
    return this.agentRepository.find();
  }
  async findOnline(): Promise<Agent[]> {
    return this.agentRepository.find({ where: { isActive: true, status: 'online' } });
  }
  async findOne(id: string): Promise<Agent> {
    const agent = await this.agentRepository.findOne({ where: { id } });
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }
  async updateStatus(id: string, status: string): Promise<Agent> {
    const agent = await this.findOne(id);
    agent.status = status as any;
    agent.lastActiveAt = new Date();
    return this.agentRepository.save(agent);
  }
  async validateLogin(email: string, password: string): Promise<Agent | null> {
    return this.agentRepository.findOne({ where: { email, password, isActive: true } });
  }
}
