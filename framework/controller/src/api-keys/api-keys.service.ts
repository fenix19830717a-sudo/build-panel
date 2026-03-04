import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ApiKey, ApiKeyStatus } from './entities/api-key.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeysRepository: Repository<ApiKey>,
  ) {}

  async findAll(userId: string): Promise<ApiKey[]> {
    return this.apiKeysRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<ApiKey> {
    const apiKey = await this.apiKeysRepository.findOne({
      where: { id, userId },
    });
    if (!apiKey) {
      throw new NotFoundException('API Key not found');
    }
    return apiKey;
  }

  async create(createApiKeyDto: CreateApiKeyDto, userId: string): Promise<{ apiKey: ApiKey; plainKey: string }&gt; {
    const plainKey = this.generateApiKey();
    const keyHash = this.hashApiKey(plainKey);

    const apiKey = this.apiKeysRepository.create({
      ...createApiKeyDto,
      userId,
      keyHash,
      status: ApiKeyStatus.ACTIVE,
    });

    const saved = await this.apiKeysRepository.save(apiKey);
    return { apiKey: saved, plainKey };
  }

  async update(
    id: string,
    updateApiKeyDto: UpdateApiKeyDto,
    userId: string,
  ): Promise<ApiKey> {
    const apiKey = await this.findOne(id, userId);
    Object.assign(apiKey, updateApiKeyDto);
    return this.apiKeysRepository.save(apiKey);
  }

  async remove(id: string, userId: string): Promise<void> {
    const apiKey = await this.findOne(id, userId);
    await this.apiKeysRepository.remove(apiKey);
  }

  async validateApiKey(plainKey: string): Promise<ApiKey | null> {
    const keyHash = this.hashApiKey(plainKey);
    const apiKey = await this.apiKeysRepository.findOne({
      where: { keyHash, status: ApiKeyStatus.ACTIVE },
    });

    if (apiKey && apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      apiKey.status = ApiKeyStatus.EXPIRED;
      await this.apiKeysRepository.save(apiKey);
      return null;
    }

    return apiKey;
  }

  async incrementUsage(id: string): Promise<void> {
    await this.apiKeysRepository.increment({ id }, 'used', 1);
  }

  private generateApiKey(): string {
    return `bak_${crypto.randomBytes(32).toString('hex')}`;
  }

  private hashApiKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }
}
