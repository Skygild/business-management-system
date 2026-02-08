import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  IsArray,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '../schemas/transaction.schema';

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: 'Office Supplies' })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiPropertyOptional({ example: 'Monthly office supply order' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  @IsOptional()
  @IsString()
  employee?: string;

  @ApiPropertyOptional({ example: ['recurring', 'office'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
