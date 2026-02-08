import { IsString, IsOptional, IsNumber, Min, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AdjustmentType } from '../schemas/inventory-adjustment.schema';

export class UpdateInventoryItemDto {
  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ enum: AdjustmentType })
  @IsOptional()
  @IsEnum(AdjustmentType)
  adjustmentType?: AdjustmentType;

  @ApiPropertyOptional({ example: 'Restocking from supplier' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: 16.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({ example: 32.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @ApiPropertyOptional({ example: 'Warehouse B' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;
}
