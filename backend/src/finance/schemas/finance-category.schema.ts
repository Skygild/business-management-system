import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type FinanceCategoryDocument = HydratedDocument<FinanceCategory>;

export enum CategoryType {
  EXPENSE = 'expense',
  INCOME = 'income',
}

@Schema({ timestamps: true })
export class FinanceCategory {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, enum: CategoryType })
  type!: CategoryType;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Org', required: true })
  org!: MongooseSchema.Types.ObjectId;

  @Prop({ default: true })
  isActive!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const FinanceCategorySchema = SchemaFactory.createForClass(FinanceCategory);

FinanceCategorySchema.index({ org: 1, name: 1, type: 1 }, { unique: true });
