import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type InventoryAdjustmentDocument = HydratedDocument<InventoryAdjustment>;

export enum AdjustmentType {
  ADD = 'add',
  REMOVE = 'remove',
  SET = 'set',
}

@Schema({ timestamps: true })
export class InventoryAdjustment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'InventoryItem', required: true })
  inventoryItem!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: AdjustmentType })
  adjustmentType!: AdjustmentType;

  @Prop({ required: true })
  quantity!: number;

  @Prop({ required: true })
  previousQuantity!: number;

  @Prop({ required: true })
  newQuantity!: number;

  @Prop({ trim: true })
  reason?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  adjustedBy!: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Org', required: true })
  org!: MongooseSchema.Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const InventoryAdjustmentSchema = SchemaFactory.createForClass(InventoryAdjustment);

InventoryAdjustmentSchema.index({ org: 1, inventoryItem: 1 });
