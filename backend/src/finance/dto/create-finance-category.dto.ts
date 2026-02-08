import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from '../schemas/finance-category.schema';

export class CreateFinanceCategoryDto {
  @ApiProperty({ example: 'Office Supplies' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: CategoryType })
  @IsEnum(CategoryType)
  type!: CategoryType;
}
