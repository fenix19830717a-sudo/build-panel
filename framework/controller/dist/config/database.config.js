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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConfig = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../users/entities/user.entity");
const api_key_entity_1 = require("../api-keys/entities/api-key.entity");
const server_entity_1 = require("../servers/entities/server.entity");
const app_entity_1 = require("../apps/entities/app.entity");
const server_app_entity_1 = require("../apps/entities/server-app.entity");
const task_entity_1 = require("../tasks/entities/task.entity");
const audit_log_entity_1 = require("../audit/entities/audit-log.entity");
let DatabaseConfig = class DatabaseConfig {
    constructor(configService) {
        this.configService = configService;
    }
    createTypeOrmOptions() {
        return {
            type: 'postgres',
            host: this.configService.get('DB_HOST', 'localhost'),
            port: this.configService.get('DB_PORT', 5432),
            username: this.configService.get('DB_USERNAME', 'postgres'),
            password: this.configService.get('DB_PASSWORD', 'postgres'),
            database: this.configService.get('DB_DATABASE', 'buildai'),
            entities: [user_entity_1.User, api_key_entity_1.ApiKey, server_entity_1.Server, app_entity_1.App, server_app_entity_1.ServerApp, task_entity_1.Task, audit_log_entity_1.AuditLog],
            synchronize: process.env.NODE_ENV === 'development',
            logging: process.env.NODE_ENV === 'development',
        };
    }
};
exports.DatabaseConfig = DatabaseConfig;
exports.DatabaseConfig = DatabaseConfig = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DatabaseConfig);
//# sourceMappingURL=database.config.js.map