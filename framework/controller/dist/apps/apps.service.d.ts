import { Repository } from 'typeorm';
import { App, AppStatus } from './entities/app.entity';
import { ServerApp } from './entities/server-app.entity';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppDto } from './dto/update-app.dto';
import { DeployAppDto } from './dto/deploy-app.dto';
export declare class AppsService {
    private appsRepository;
    private serverAppsRepository;
    constructor(appsRepository: Repository<App>, serverAppsRepository: Repository<ServerApp>);
    findAll(status?: AppStatus): Promise<App[]>;
    findOne(id: string): Promise<App>;
    create(createAppDto: CreateAppDto, authorId: string): Promise<App>;
    update(id: string, updateAppDto: UpdateAppDto): Promise<App>;
    remove(id: string): Promise<void>;
    deploy(appId: string, deployAppDto: DeployAppDto, userId: string): Promise<ServerApp>;
    findByServer(serverId: string, userId: string): Promise<ServerApp[]>;
}
