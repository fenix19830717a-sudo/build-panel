import { User } from '../../users/entities/user.entity';
export declare enum AppStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    DEPRECATED = "deprecated"
}
export declare class App {
    id: string;
    name: string;
    description: string;
    version: string;
    image: string;
    configSchema: Record<string, any>;
    defaultConfig: Record<string, any>;
    authorId: string;
    author: User;
    status: AppStatus;
    createdAt: Date;
    updatedAt: Date;
}
