import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Widget A' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'WGT-001' })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiPropertyOptional({ example: 'A high-quality widget' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Widgets' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;
}
