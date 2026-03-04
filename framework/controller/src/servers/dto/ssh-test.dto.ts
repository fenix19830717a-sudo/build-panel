import { IsString, IsOptional } from 'class-validator';

export class SshTestDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  privateKey?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
