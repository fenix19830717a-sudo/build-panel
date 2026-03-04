import { IsString, IsNumber, IsOptional, MinLength, MaxLength, IsDateString } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  provider: string;

  @IsOptional()
  @IsNumber()
  quota?: number = 1000000;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
