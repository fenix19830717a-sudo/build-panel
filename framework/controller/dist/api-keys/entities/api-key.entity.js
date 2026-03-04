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
exports.ApiKey = exports.ApiKeyStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var ApiKeyStatus;
(function (ApiKeyStatus) {
    ApiKeyStatus["ACTIVE"] = "active";
    ApiKeyStatus["INACTIVE"] = "inactive";
    ApiKeyStatus["EXPIRED"] = "expired";
})(ApiKeyStatus || (exports.ApiKeyStatus = ApiKeyStatus = {}));
let ApiKey = class ApiKey {
};
exports.ApiKey = ApiKey;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ApiKey.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], ApiKey.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], ApiKey.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ApiKey.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'key_hash' }),
    __metadata("design:type", String)
], ApiKey.prototype, "keyHash", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ApiKey.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1000000 }),
    __metadata("design:type", Number)
], ApiKey.prototype, "quota", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ApiKey.prototype, "used", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', nullable: true }),
    __metadata("design:type", Date)
], ApiKey.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ApiKeyStatus,
        default: ApiKeyStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], ApiKey.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ApiKey.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ApiKey.prototype, "updatedAt", void 0);
exports.ApiKey = ApiKey = __decorate([
    (0, typeorm_1.Entity)('api_keys')
], ApiKey);
//# sourceMappingURL=api-key.entity.js.map