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
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { QueryInventoryDto } from './dto/query-inventory.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Add a product to inventory' })
  create(@CurrentUser() user: JwtPayload, @Body() createDto: CreateInventoryItemDto) {
    return this.inventoryService.create(user.org, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'List inventory items with filters and pagination' })
  findAll(@CurrentUser() user: JwtPayload, @Query() query: QueryInventoryDto) {
    return this.inventoryService.findAll(user.org, query);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get all low stock items' })
  findLowStock(@CurrentUser() user: JwtPayload) {
    return this.inventoryService.findLowStock(user.org);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an inventory item by ID' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.inventoryService.findById(user.org, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update inventory item with adjustment tracking' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateDto: UpdateInventoryItemDto,
  ) {
    return this.inventoryService.update(user.org, id, user.sub, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove an inventory item' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.inventoryService.remove(user.org, id);
  }
}
