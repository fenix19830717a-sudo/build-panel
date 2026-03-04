import { IsNumber, IsString, IsOptional, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ description: '产品ID' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: '数量', default: 1 })
  @IsNumber()
  @Min(1)
  quantity: number = 1;

  @ApiPropertyOptional({ description: '属性' })
  @IsOptional()
  attributes?: Record<string, any>;
}

export class UpdateCartItemDto {
  @ApiProperty({ description: '数量' })
  @IsNumber()
  @Min(0)
  quantity: number;
}

export class CartResponseDto {
  id: string;
  items: CartItemResponseDto[];
  total: number;
  itemCount: number;
}

export class CartItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  total: number;
  attributes?: Record<string, any>;
}
