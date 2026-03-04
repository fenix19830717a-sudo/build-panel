import { IsString, IsNumber, IsOptional, MinLength, MaxLength, IsIn } from 'class-validator';

export class CreateServerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  host: string;

  @IsOptional()
  @IsNumber()
  port?: number = 22;

  @IsOptional()
  @IsString()
  username?: string = 'root';

  @IsOptional()
  @IsString()
  sshKey?: string;

  @IsOptional()
  @IsString()
  os?: string;

  @IsOptional()
  @IsString()
  arch?: string;
}
