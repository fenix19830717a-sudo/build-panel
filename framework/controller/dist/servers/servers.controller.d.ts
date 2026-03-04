import { ServersService } from './servers.service';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { SshTestDto } from './dto/ssh-test.dto';
import { ServerStatus } from './entities/server.entity';
export declare class ServersController {
    private readonly serversService;
    constructor(serversService: ServersService);
    findAll(req: any, status?: ServerStatus): Promise<import("./entities/server.entity").Server[]>;
    findOne(id: string, req: any): Promise<import("./entities/server.entity").Server>;
    create(createServerDto: CreateServerDto, req: any): Promise<import("./entities/server.entity").Server>;
    update(id: string, updateServerDto: UpdateServerDto, req: any): Promise<import("./entities/server.entity").Server>;
    remove(id: string, req: any): Promise<void>;
    testSsh(id: string, sshTestDto: SshTestDto, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
