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
exports.ServerApp = exports.ServerAppStatus = void 0;
const typeorm_1 = require("typeorm");
const server_entity_1 = require("../../servers/entities/server.entity");
const app_entity_1 = require("./app.entity");
var ServerAppStatus;
(function (ServerAppStatus) {
    ServerAppStatus["RUNNING"] = "running";
    ServerAppStatus["STOPPED"] = "stopped";
    ServerAppStatus["ERROR"] = "error";
    ServerAppStatus["PENDING"] = "pending";
})(ServerAppStatus || (exports.ServerAppStatus = ServerAppStatus = {}));
let ServerApp = class ServerApp {
};
exports.ServerApp = ServerApp;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ServerApp.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'server_id' }),
    __metadata("design:type", String)
], ServerApp.prototype, "serverId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => server_entity_1.Server),
    (0, typeorm_1.JoinColumn)({ name: 'server_id' }),
    __metadata("design:type", server_entity_1.Server)
], ServerApp.prototype, "server", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'app_id' }),
    __metadata("design:type", String)
], ServerApp.prototype, "appId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => app_entity_1.App),
    (0, typeorm_1.JoinColumn)({ name: 'app_id' }),
    __metadata("design:type", app_entity_1.App)
], ServerApp.prototype, "app", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'container_id', nullable: true }),
    __metadata("design:type", String)
], ServerApp.prototype, "containerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], ServerApp.prototype, "config", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ServerAppStatus,
        default: ServerAppStatus.STOPPED,
    }),
    __metadata("design:type", String)
], ServerApp.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'port_mappings', type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], ServerApp.prototype, "portMappings", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ServerApp.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ServerApp.prototype, "updatedAt", void 0);
exports.ServerApp = ServerApp = __decorate([
    (0, typeorm_1.Entity)('server_apps')
], ServerApp);
//# sourceMappingURL=server-app.entity.js.map