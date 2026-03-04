export declare class CreateAppDto {
    name: string;
    description?: string;
    version: string;
    image: string;
    configSchema?: Record<string, any>;
    defaultConfig?: Record<string, any>;
}
