import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInventoryItemDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  product!: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  quantity!: number;

  @ApiProperty({ example: 15.0 })
  @IsNumber()
  @Min(0)
  costPrice!: number;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  @Min(0)
  sellingPrice!: number;

  @ApiPropertyOptional({ example: 'Warehouse A, Shelf 3' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;
}
