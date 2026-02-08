import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type BoardDocument = HydratedDocument<Board>;

@Schema({ _id: true })
export class Card {
  _id!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop()
  dueDate?: Date;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Employee' }], default: [] })
  assignees!: MongooseSchema.Types.ObjectId[];

  @Prop({ default: 0 })
  order!: number;
}

export const CardSchema = SchemaFactory.createForClass(Card);

@Schema({ _id: true })
export class Column {
  _id!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ default: 0 })
  order!: number;

  @Prop({ type: [CardSchema], default: [] })
  cards!: Card[];
}

export const ColumnSchema = SchemaFactory.createForClass(Column);

@Schema({ timestamps: true })
export class Board {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Task' })
  task?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Org', required: true })
  org!: MongooseSchema.Types.ObjectId;

  @Prop({ type: [ColumnSchema], default: [] })
  columns!: Column[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const BoardSchema = SchemaFactory.createForClass(Board);

BoardSchema.index({ org: 1 });
