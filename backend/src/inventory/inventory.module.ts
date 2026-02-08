import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryItem, InventoryItemSchema } from './schemas/inventory-item.schema';
import {
  InventoryAdjustment,
  InventoryAdjustmentSchema,
} from './schemas/inventory-adjustment.schema';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InventoryItem.name, schema: InventoryItemSchema },
      { name: InventoryAdjustment.name, schema: InventoryAdjustmentSchema },
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
