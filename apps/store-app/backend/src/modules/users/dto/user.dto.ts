import { IsString, IsEmail, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ description: '邮箱' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '密码', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: '名字' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: '姓氏' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ description: '角色', enum: UserRole })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '名字' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ description: '姓氏' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ description: '角色', enum: UserRole })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ description: '是否激活' })
  @IsOptional()
  isActive?: boolean;
}

export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}
