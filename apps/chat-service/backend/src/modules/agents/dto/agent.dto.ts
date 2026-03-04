import { IsString, IsOptional, IsEmail } from 'class-validator';
export class CreateAgentDto {
  @IsString()
  name: string;
  @IsEmail()
  email: string;
  @IsString()
  password: string;
}
export class UpdateAgentDto {
  @IsOptional()
  @IsString()
  status?: string;
}
export class LoginDto {
  @IsEmail()
  email: string;
  @IsString()
  password: string;
}
