import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  sku!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  category?: string;

  @Prop({ required: true, min: 0 })
  unitPrice!: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Org', required: true })
  org!: MongooseSchema.Types.ObjectId;

  @Prop({ default: true })
  isActive!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ org: 1, sku: 1 }, { unique: true });
ProductSchema.index({ org: 1, category: 1 });
ProductSchema.index({ org: 1, name: 'text' });
