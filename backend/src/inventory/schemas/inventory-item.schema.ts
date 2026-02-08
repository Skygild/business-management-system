import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type InventoryItemDocument = HydratedDocument<InventoryItem>;

@Schema({ timestamps: true })
export class InventoryItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  product!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, min: 0, default: 0 })
  quantity!: number;

  @Prop({ required: true, min: 0 })
  costPrice!: number;

  @Prop({ required: true, min: 0 })
  sellingPrice!: number;

  @Prop({ trim: true })
  location?: string;

  @Prop({ default: 10, min: 0 })
  lowStockThreshold!: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Org', required: true })
  org!: MongooseSchema.Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);

InventoryItemSchema.index({ org: 1, product: 1 }, { unique: true });
