import { IsString, IsOptional, IsEnum, IsObject, IsInt, IsArray } from 'class-validator';
import { AlertRuleOperator, AlertRuleStatus, AlertSeverity } from '../entities/alert-rule.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlertRuleDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  field: string;

  @ApiProperty({ enum: AlertRuleOperator })
  @IsEnum(AlertRuleOperator)
  operator: AlertRuleOperator;

  @ApiProperty()
  @IsString()
  value: string;

  @ApiProperty({ enum: AlertSeverity, default: AlertSeverity.MEDIUM })
  @IsEnum(AlertSeverity)
  @IsOptional()
  severity?: AlertSeverity;

  @ApiProperty({ default: 1 })
  @IsInt()
  @IsOptional()
  threshold?: number;

  @ApiProperty({ default: 60 })
  @IsInt()
  @IsOptional()
  timeWindow?: number;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  notifications?: {
    email?: string[];
    webhook?: string;
    slack?: string;
  };
}

export class UpdateAlertRuleDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false, enum: AlertRuleStatus })
  @IsEnum(AlertRuleStatus)
  @IsOptional()
  status?: AlertRuleStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  value?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  threshold?: number;
}
