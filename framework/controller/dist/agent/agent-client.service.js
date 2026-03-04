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
var AgentClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentClient = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const https = require("https");
const fs = require("fs");
let AgentClient = AgentClient_1 = class AgentClient {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(AgentClient_1.name);
    }
    async executeCommand(serverId, command, config) {
        try {
            const agent = this.createHttpsAgent(config);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${config.baseURL}/api/v1/exec`, { command }, { httpsAgent: agent, timeout: 30000 }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to execute command on ${serverId}: ${error.message}`);
            throw error;
        }
    }
    async deployContainer(serverId, image, config, options) {
        try {
            const agent = this.createHttpsAgent(config);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${config.baseURL}/api/v1/containers/deploy`, { image, ...options }, { httpsAgent: agent, timeout: 120000 }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to deploy container on ${serverId}: ${error.message}`);
            throw error;
        }
    }
    async getContainerStatus(serverId, containerId, config) {
        try {
            const agent = this.createHttpsAgent(config);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${config.baseURL}/api/v1/containers/${containerId}/status`, { httpsAgent: agent, timeout: 10000 }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get container status from ${serverId}: ${error.message}`);
            throw error;
        }
    }
    async getSystemInfo(serverId, config) {
        try {
            const agent = this.createHttpsAgent(config);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${config.baseURL}/api/v1/system/info`, { httpsAgent: agent, timeout: 10000 }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get system info from ${serverId}: ${error.message}`);
            throw error;
        }
    }
    async streamLogs(serverId, containerId, config, onLog) {
        try {
            const agent = this.createHttpsAgent(config);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${config.baseURL}/api/v1/containers/${containerId}/logs`, { httpsAgent: agent, responseType: 'stream' }));
            response.data.on('data', (chunk) => {
                onLog(chunk.toString());
            });
            return new Promise((resolve, reject) => {
                response.data.on('end', resolve);
                response.data.on('error', reject);
            });
        }
        catch (error) {
            this.logger.error(`Failed to stream logs from ${serverId}: ${error.message}`);
            throw error;
        }
    }
    createHttpsAgent(config) {
        if (!config.certPath || !config.keyPath) {
            return undefined;
        }
        try {
            return new https.Agent({
                cert: fs.readFileSync(config.certPath),
                key: fs.readFileSync(config.keyPath),
                ca: config.caPath ? fs.readFileSync(config.caPath) : undefined,
                rejectUnauthorized: !!config.caPath,
            });
        }
        catch (error) {
            this.logger.warn(`Failed to create HTTPS agent: ${error.message}`);
            return undefined;
        }
    }
};
exports.AgentClient = AgentClient;
exports.AgentClient = AgentClient = AgentClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], AgentClient);
//# sourceMappingURL=agent-client.service.js.map