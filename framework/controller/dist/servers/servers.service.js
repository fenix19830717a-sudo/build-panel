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
exports.ServersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const server_entity_1 = require("./entities/server.entity");
const ssh_service_1 = require("./ssh.service");
let ServersService = class ServersService {
    constructor(serversRepository, sshService) {
        this.serversRepository = serversRepository;
        this.sshService = sshService;
    }
    async findAll(userId, status) {
        const where = { userId };
        if (status) {
            where.status = status;
        }
        return this.serversRepository.find({ where });
    }
    async findOne(id, userId) {
        const server = await this.serversRepository.findOne({
            where: { id, userId },
        });
        if (!server) {
            throw new common_1.NotFoundException('Server not found');
        }
        return server;
    }
    async create(createServerDto, userId) {
        const server = this.serversRepository.create({
            ...createServerDto,
            userId,
            agentToken: this.generateAgentToken(),
        });
        return this.serversRepository.save(server);
    }
    async update(id, updateServerDto, userId) {
        const server = await this.findOne(id, userId);
        Object.assign(server, updateServerDto);
        return this.serversRepository.save(server);
    }
    async remove(id, userId) {
        const server = await this.findOne(id, userId);
        await this.serversRepository.remove(server);
    }
    async testSshConnection(id, userId, sshTestDto) {
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
                server.status = server_entity_1.ServerStatus.ONLINE;
                await this.serversRepository.save(server);
            }
            return result;
        }
        catch (error) {
            return {
                success: false,
                message: `SSH connection failed: ${error.message}`,
            };
        }
    }
    generateAgentToken() {
        return `agent_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
};
exports.ServersService = ServersService;
exports.ServersService = ServersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(server_entity_1.Server)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        ssh_service_1.SshService])
], ServersService);
//# sourceMappingURL=servers.service.js.map