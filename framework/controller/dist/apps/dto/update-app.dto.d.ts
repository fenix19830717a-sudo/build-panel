import { AppStatus } from '../entities/app.entity';
export declare class UpdateAppDto {
    name?: string;
    description?: string;
    version?: string;
    image?: string;
    configSchema?: Record<string, any>;
    defaultConfig?: Record<string, any>;
    status?: AppStatus;
}
