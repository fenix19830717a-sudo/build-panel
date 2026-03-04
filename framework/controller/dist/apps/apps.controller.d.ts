import { AppsService } from './apps.service';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppDto } from './dto/update-app.dto';
import { DeployAppDto } from './dto/deploy-app.dto';
import { AppStatus } from './entities/app.entity';
export declare class AppsController {
    private readonly appsService;
    constructor(appsService: AppsService);
    findAll(status?: AppStatus): Promise<import("./entities/app.entity").App[]>;
    findOne(id: string): Promise<import("./entities/app.entity").App>;
    create(createAppDto: CreateAppDto, req: any): Promise<import("./entities/app.entity").App>;
    update(id: string, updateAppDto: UpdateAppDto): Promise<import("./entities/app.entity").App>;
    remove(id: string): Promise<void>;
    deploy(id: string, deployAppDto: DeployAppDto, req: any): Promise<import("./entities/server-app.entity").ServerApp>;
    findByServer(serverId: string, req: any): Promise<import("./entities/server-app.entity").ServerApp[]>;
}
