"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const app_entity_1 = require("./entities/app.entity");
const server_app_entity_1 = require("./entities/server-app.entity");
let AppsService = class AppsService {
    constructor(appsRepository, serverAppsRepository) {
        this.appsRepository = appsRepository;
        this.serverAppsRepository = serverAppsRepository;
    }
    async findAll(status) {
        const where = {};
        if (status) {
            where.status = status;
        }
        return this.appsRepository.find({
            where,
            relations: ['author'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const app = await this.appsRepository.findOne({
            where: { id },
            relations: ['author'],
        });
        if (!app) {
            throw new common_1.NotFoundException('App not found');
        }
        return app;
    }
    async create(createAppDto, authorId) {
        const app = this.appsRepository.create({
            ...createAppDto,
            authorId,
        });
        return this.appsRepository.save(app);
    }
    async update(id, updateAppDto) {
        const app = await this.findOne(id);
        Object.assign(app, updateAppDto);
        return this.appsRepository.save(app);
    }
    async remove(id) {
        const app = await this.findOne(id);
        await this.appsRepository.remove(app);
    }
    async deploy(appId, deployAppDto, userId) {
        await this.findOne(appId);
        const serverApp = this.serverAppsRepository.create({
            appId,
            serverId: deployAppDto.serverId,
            config: deployAppDto.config || {},
            portMappings: deployAppDto.portMappings || [],
            status: server_app_entity_1.ServerAppStatus.PENDING,
        });
        return this.serverAppsRepository.save(serverApp);
    }
    async findByServer(serverId, userId) {
        return this.serverAppsRepository.find({
            where: { serverId },
            relations: ['app', 'server'],
        });
    }
};
exports.AppsService = AppsService;
exports.AppsService = AppsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(app_entity_1.App)),
    __param(1, (0, typeorm_1.InjectRepository)(server_app_entity_1.ServerApp)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AppsService);
//# sourceMappingURL=apps.service.js.map