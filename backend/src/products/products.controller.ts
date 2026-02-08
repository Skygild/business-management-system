import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  create(@CurrentUser() user: JwtPayload, @Body() createProductDto: CreateProductDto) {
    return this.productsService.create(user.org, createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'List products with pagination and filters' })
  findAll(@CurrentUser() user: JwtPayload, @Query() query: QueryProductDto) {
    return this.productsService.findAll(user.org, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.productsService.findById(user.org, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(user.org, id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a product' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.productsService.remove(user.org, id);
  }
}
