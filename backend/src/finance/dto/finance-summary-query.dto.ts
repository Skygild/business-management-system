import { IsOptional, IsDateString, IsEnum, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '../schemas/transaction.schema';

export class FinanceSummaryQueryDto {
  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class ChartQueryDto extends FinanceSummaryQueryDto {
  @ApiPropertyOptional({ enum: ['daily', 'weekly', 'monthly'], default: 'monthly' })
  @IsOptional()
  @IsIn(['daily', 'weekly', 'monthly'])
  interval?: string;
}

export class CategoryBreakdownQueryDto extends FinanceSummaryQueryDto {
  @ApiPropertyOptional({ enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;
}
