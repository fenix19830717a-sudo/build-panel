import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
export declare class ApiKeysController {
    private readonly apiKeysService;
    constructor(apiKeysService: ApiKeysService);
    findAll(req: any): Promise<import("./entities/api-key.entity").ApiKey[]>;
    findOne(id: string, req: any): Promise<import("./entities/api-key.entity").ApiKey>;
    create(createApiKeyDto: CreateApiKeyDto, req: any): Promise<{
        apiKey: import("./entities/api-key.entity").ApiKey;
        plainKey: string;
    }>;
    update(id: string, updateApiKeyDto: UpdateApiKeyDto, req: any): Promise<import("./entities/api-key.entity").ApiKey>;
    remove(id: string, req: any): Promise<void>;
}
