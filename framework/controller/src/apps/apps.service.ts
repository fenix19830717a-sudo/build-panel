import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { App, AppStatus } from './entities/app.entity';
import { ServerApp, ServerAppStatus } from './entities/server-app.entity';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppDto } from './dto/update-app.dto';
import { DeployAppDto } from './dto/deploy-app.dto';

@Injectable()
export class AppsService {
  constructor(
    @InjectRepository(App)
    private appsRepository: Repository<App>,
    @InjectRepository(ServerApp)
    private serverAppsRepository: Repository<ServerApp>,
  ) {}

  async findAll(status?: AppStatus): Promise<App[]> {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    return this.appsRepository.find({
      where,
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<App> {
    const app = await this.appsRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!app) {
      throw new NotFoundException('App not found');
    }
    return app;
  }

  async create(createAppDto: CreateAppDto, authorId: string): Promise<App> {
    const app = this.appsRepository.create({
      ...createAppDto,
      authorId,
    });
    return this.appsRepository.save(app);
  }

  async update(id: string, updateAppDto: UpdateAppDto): Promise<App> {
    const app = await this.findOne(id);
    Object.assign(app, updateAppDto);
    return this.appsRepository.save(app);
  }

  async remove(id: string): Promise<void> {
    const app = await this.findOne(id);
    await this.appsRepository.remove(app);
  }

  async deploy(
    appId: string,
    deployAppDto: DeployAppDto,
    userId: string,
  ): Promise<ServerApp> {
    await this.findOne(appId);

    const serverApp = this.serverAppsRepository.create({
      appId,
      serverId: deployAppDto.serverId,
      config: deployAppDto.config || {},
      portMappings: deployAppDto.portMappings || [],
      status: ServerAppStatus.PENDING,
    });

    return this.serverAppsRepository.save(serverApp);
  }

  async findByServer(serverId: string, userId: string): Promise<ServerApp[]> {
    return this.serverAppsRepository.find({
      where: { serverId },
      relations: ['app', 'server'],
    });
  }
}
