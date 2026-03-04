import { IsString, IsOptional, IsNumber, IsEnum, IsArray, ValidateNested, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from '../entities/order.entity';

export class OrderItemDto {
  @ApiProperty({ description: '产品ID' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: '数量' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: '属性' })
  @IsOptional()
  attributes?: Record<string, any>;
}

export class ShippingAddressDto {
  @ApiProperty({ description: '名字' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: '姓氏' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: '地址' })
  @IsString()
  address: string;

  @ApiProperty({ description: '城市' })
  @IsString()
  city: string;

  @ApiProperty({ description: '省份/州' })
  @IsString()
  state: string;

  @ApiProperty({ description: '国家' })
  @IsString()
  country: string;

  @ApiProperty({ description: '邮编' })
  @IsString()
  postalCode: string;

  @ApiProperty({ description: '电话' })
  @IsString()
  phone: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: '订单项目', type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ description: '配送地址' })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateOrderDto {
  @ApiPropertyOptional({ description: '订单状态', enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({ description: '支付状态', enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;
}

export class OrderQueryDto {
  @ApiPropertyOptional({ description: '分页 - 页码', default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: '分页 - 每页数量', default: 10 })
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ description: '用户ID' })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: '订单状态', enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
