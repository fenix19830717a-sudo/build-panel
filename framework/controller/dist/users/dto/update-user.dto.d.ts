import { UserRole, UserStatus } from '../entities/user.entity';
export declare class UpdateUserDto {
    email?: string;
    password?: string;
    name?: string;
    role?: UserRole;
    status?: UserStatus;
    passwordHash?: string;
}
