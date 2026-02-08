import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop()
  dueDate?: Date;

  @Prop({ enum: TaskStatus, default: TaskStatus.TODO })
  status!: TaskStatus;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Employee' }], default: [] })
  assignees!: MongooseSchema.Types.ObjectId[];

  @Prop({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority!: TaskPriority;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Org', required: true })
  org!: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy!: MongooseSchema.Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.index({ org: 1, status: 1 });
TaskSchema.index({ org: 1, priority: 1 });
TaskSchema.index({ org: 1, dueDate: 1 });
