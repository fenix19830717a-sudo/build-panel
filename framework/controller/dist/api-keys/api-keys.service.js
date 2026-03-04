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
exports.ApiKeysService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto = require("crypto");
const api_key_entity_1 = require("./entities/api-key.entity");
let ApiKeysService = class ApiKeysService {
    constructor(apiKeysRepository) {
        this.apiKeysRepository = apiKeysRepository;
    }
    async findAll(userId) {
        return this.apiKeysRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id, userId) {
        const apiKey = await this.apiKeysRepository.findOne({
            where: { id, userId },
        });
        if (!apiKey) {
            throw new common_1.NotFoundException('API Key not found');
        }
        return apiKey;
    }
    async create(createApiKeyDto, userId) {
        const plainKey = this.generateApiKey();
        const keyHash = this.hashApiKey(plainKey);
        const apiKey = this.apiKeysRepository.create({
            ...createApiKeyDto,
            userId,
            keyHash,
            status: api_key_entity_1.ApiKeyStatus.ACTIVE,
        });
        const saved = await this.apiKeysRepository.save(apiKey);
        return { apiKey: saved, plainKey };
    }
    async update(id, updateApiKeyDto, userId) {
        const apiKey = await this.findOne(id, userId);
        Object.assign(apiKey, updateApiKeyDto);
        return this.apiKeysRepository.save(apiKey);
    }
    async remove(id, userId) {
        const apiKey = await this.findOne(id, userId);
        await this.apiKeysRepository.remove(apiKey);
    }
    async validateApiKey(plainKey) {
        const keyHash = this.hashApiKey(plainKey);
        const apiKey = await this.apiKeysRepository.findOne({
            where: { keyHash, status: api_key_entity_1.ApiKeyStatus.ACTIVE },
        });
        if (apiKey && apiKey.expiresAt && apiKey.expiresAt < new Date()) {
            apiKey.status = api_key_entity_1.ApiKeyStatus.EXPIRED;
            await this.apiKeysRepository.save(apiKey);
            return null;
        }
        return apiKey;
    }
    async incrementUsage(id) {
        await this.apiKeysRepository.increment({ id }, 'used', 1);
    }
    generateApiKey() {
        return `bak_${crypto.randomBytes(32).toString('hex')}`;
    }
    hashApiKey(key) {
        return crypto.createHash('sha256').update(key).digest('hex');
    }
};
exports.ApiKeysService = ApiKeysService;
exports.ApiKeysService = ApiKeysService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(api_key_entity_1.ApiKey)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ApiKeysService);
//# sourceMappingURL=api-keys.service.js.map