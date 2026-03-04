import { Repository } from 'typeorm';
import { Server, ServerStatus } from './entities/server.entity';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { SshTestDto } from './dto/ssh-test.dto';
import { SshService } from './ssh.service';
export declare class ServersService {
    private serversRepository;
    private sshService;
    constructor(serversRepository: Repository<Server>, sshService: SshService);
    findAll(userId: string, status?: ServerStatus): Promise<Server[]>;
    findOne(id: string, userId: string): Promise<Server>;
    create(createServerDto: CreateServerDto, userId: string): Promise<Server>;
    update(id: string, updateServerDto: UpdateServerDto, userId: string): Promise<Server>;
    remove(id: string, userId: string): Promise<void>;
    testSshConnection(id: string, userId: string, sshTestDto: SshTestDto): Promise<{
        success: boolean;
        message: string;
    }>;
    private generateAgentToken;
}
