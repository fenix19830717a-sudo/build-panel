import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    const token = this.generateToken(user);
    
    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const isPasswordValid = await this.usersService.validatePassword(user, loginDto.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }
    
    const token = this.generateToken(user);
    
    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  private generateToken(user: any): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    
    return this.jwtService.sign(payload);
  }

  async validateUser(userId: string): Promise<any> {
    const user = await this.usersService.findOne(userId);
    if (user && user.isActive) {
      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    }
    return null;
  }
}
