export declare enum UserRole {
    ADMIN = "admin",
    MANAGER = "manager",
    USER = "user"
}
export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended"
}
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
}
