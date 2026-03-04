import { IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
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
}

export class LoginDto {
  @ApiProperty({ description: '邮箱' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: '访问令牌' })
  accessToken: string;

  @ApiProperty({ description: '用户信息' })
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}
