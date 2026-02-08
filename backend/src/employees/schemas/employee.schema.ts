import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type EmployeeDocument = HydratedDocument<Employee>;

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ required: true, trim: true })
  lastName!: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email!: string;

  @Prop({ required: true, trim: true })
  position!: string;

  @Prop({ required: true, trim: true })
  department!: string;

  @Prop({ enum: EmployeeStatus, default: EmployeeStatus.ACTIVE })
  status!: EmployeeStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Org', required: true })
  org!: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user?: MongooseSchema.Types.ObjectId;

  @Prop({ trim: true })
  phone?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

EmployeeSchema.index({ org: 1, email: 1 }, { unique: true });
EmployeeSchema.index({ org: 1, status: 1 });
EmployeeSchema.index({ org: 1, department: 1 });
