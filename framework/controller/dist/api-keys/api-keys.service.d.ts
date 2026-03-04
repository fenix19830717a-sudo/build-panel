import { Repository } from 'typeorm';
import { ApiKey } from './entities/api-key.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
export declare class ApiKeysService {
    private apiKeysRepository;
    constructor(apiKeysRepository: Repository<ApiKey>);
    findAll(userId: string): Promise<ApiKey[]>;
    findOne(id: string, userId: string): Promise<ApiKey>;
    create(createApiKeyDto: CreateApiKeyDto, userId: string): Promise<{
        apiKey: ApiKey;
        plainKey: string;
    }>;
    update(id: string, updateApiKeyDto: UpdateApiKeyDto, userId: string): Promise<ApiKey>;
    remove(id: string, userId: string): Promise<void>;
    validateApiKey(plainKey: string): Promise<ApiKey | null>;
    incrementUsage(id: string): Promise<void>;
    private generateApiKey;
    private hashApiKey;
}
