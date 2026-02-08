import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

export enum TransactionType {
  EXPENSE = 'expense',
  SALE = 'sale',
  INCOME = 'income',
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true, enum: TransactionType })
  type!: TransactionType;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true, trim: true })
  category!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true })
  date!: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee' })
  employee?: MongooseSchema.Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Org', required: true })
  org!: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy!: MongooseSchema.Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.index({ org: 1, date: -1 });
TransactionSchema.index({ org: 1, type: 1 });
TransactionSchema.index({ org: 1, category: 1 });
