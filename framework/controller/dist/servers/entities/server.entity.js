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
exports.Server = exports.ServerStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var ServerStatus;
(function (ServerStatus) {
    ServerStatus["ONLINE"] = "online";
    ServerStatus["OFFLINE"] = "offline";
    ServerStatus["ERROR"] = "error";
})(ServerStatus || (exports.ServerStatus = ServerStatus = {}));
let Server = class Server {
};
exports.Server = Server;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Server.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], Server.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Server.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Server.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Server.prototype, "host", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 22 }),
    __metadata("design:type", Number)
], Server.prototype, "port", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'root' }),
    __metadata("design:type", String)
], Server.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ssh_key', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Server.prototype, "sshKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Server.prototype, "os", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Server.prototype, "arch", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'agent_token', nullable: true, unique: true }),
    __metadata("design:type", String)
], Server.prototype, "agentToken", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ServerStatus,
        default: ServerStatus.OFFLINE,
    }),
    __metadata("design:type", String)
], Server.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_heartbeat', nullable: true }),
    __metadata("design:type", Date)
], Server.prototype, "lastHeartbeat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cpu_cores', nullable: true }),
    __metadata("design:type", Number)
], Server.prototype, "cpuCores", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'memory_gb', nullable: true }),
    __metadata("design:type", Number)
], Server.prototype, "memoryGb", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'disk_gb', nullable: true }),
    __metadata("design:type", Number)
], Server.prototype, "diskGb", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], Server.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Server.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Server.prototype, "updatedAt", void 0);
exports.Server = Server = __decorate([
    (0, typeorm_1.Entity)('servers')
], Server);
//# sourceMappingURL=server.entity.js.map