import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { UserStatus } from '../users/entities/user.entity';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("../users/entities/user.entity").UserRole;
        status: UserStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
