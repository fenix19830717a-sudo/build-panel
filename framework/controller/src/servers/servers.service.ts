import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server, ServerStatus } from './entities/server.entity';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { SshTestDto } from './dto/ssh-test.dto';
import { SshService } from './ssh.service';

@Injectable()
export class ServersService {
  constructor(
    @InjectRepository(Server)
    private serversRepository: Repository<Server>,
    private sshService: SshService,
  ) {}

  async findAll(userId: string, status?: ServerStatus): Promise<Server[]> {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }
    return this.serversRepository.find({ where });
  }

  async findOne(id: string, userId: string): Promise<Server> {
    const server = await this.serversRepository.findOne({
      where: { id, userId },
    });
    if (!server) {
      throw new NotFoundException('Server not found');
    }
    return server;
  }

  async create(createServerDto: CreateServerDto, userId: string): Promise<Server> {
    const server = this.serversRepository.create({
      ...createServerDto,
      userId,
      agentToken: this.generateAgentToken(),
    });
    return this.serversRepository.save(server);
  }

  async update(
    id: string,
    updateServerDto: UpdateServerDto,
    userId: string,
  ): Promise<Server> {
    const server = await this.findOne(id, userId);
    Object.assign(server, updateServerDto);
    return this.serversRepository.save(server);
  }

  async remove(id: string, userId: string): Promise<void> {
    const server = await this.findOne(id, userId);
    await this.serversRepository.remove(server);
  }

  async testSshConnection(
    id: string,
    userId: string,
    sshTestDto: SshTestDto,
  ): Promise<{ success: boolean; message: string }&gt; {
    const server = await this.findOne(id, userId);
    
    try {
      const result = await this.sshService.testConnection({
        host: server.host,
        port: server.port,
        username: sshTestDto.username || server.username,
        privateKey: sshTestDto.privateKey || server.sshKey,
        password: sshTestDto.password,
      });

      if (result.success) {
        server.status = ServerStatus.ONLINE;
        await this.serversRepository.save(server);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        message: `SSH connection failed: ${error.message}`,
      };
    }
  }

  private generateAgentToken(): string {
    return `agent_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}
