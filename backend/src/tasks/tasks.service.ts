import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument, TaskStatus } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>) {}

  async create(orgId: string, userId: string, createDto: CreateTaskDto): Promise<TaskDocument> {
    return this.taskModel.create({
      ...createDto,
      dueDate: createDto.dueDate ? new Date(createDto.dueDate) : undefined,
      assignees: createDto.assignees?.map((id) => new Types.ObjectId(id)) ?? [],
      org: new Types.ObjectId(orgId),
      createdBy: new Types.ObjectId(userId),
    } as any);
  }

  async findAll(
    orgId: string,
    query: QueryTaskDto,
  ): Promise<PaginatedResponseDto<TaskDocument>> {
    const filter: any = { org: new Types.ObjectId(orgId) };

    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.assignee) (filter as any).assignees = new Types.ObjectId(query.assignee);

    if (query.dueDateStart || query.dueDateEnd) {
      const dateFilter: Record<string, Date> = {};
      if (query.dueDateStart) dateFilter.$gte = new Date(query.dueDateStart);
      if (query.dueDateEnd) dateFilter.$lte = new Date(query.dueDateEnd);
      (filter as any).dueDate = dateFilter;
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.taskModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('assignees')
        .exec(),
      this.taskModel.countDocuments(filter).exec(),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findById(orgId: string, id: string): Promise<TaskDocument> {
    const task = await this.taskModel
      .findOne({
        _id: new Types.ObjectId(id),
        org: new Types.ObjectId(orgId),
      } as any)
      .populate('assignees')
      .exec();
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(
    orgId: string,
    id: string,
    updateDto: UpdateTaskDto,
  ): Promise<TaskDocument> {
    const updateData: Record<string, unknown> = { ...updateDto };
    if (updateDto.dueDate) {
      updateData.dueDate = new Date(updateDto.dueDate);
    }
    if (updateDto.assignees) {
      updateData.assignees = updateDto.assignees.map((aid) => new Types.ObjectId(aid));
    }

    const task = await this.taskModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          org: new Types.ObjectId(orgId),
        } as any,
        updateData,
        { new: true },
      )
      .populate('assignees')
      .exec();
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async remove(orgId: string, id: string): Promise<void> {
    const result = await this.taskModel
      .findOneAndDelete({
        _id: new Types.ObjectId(id),
        org: new Types.ObjectId(orgId),
      } as any)
      .exec();
    if (!result) {
      throw new NotFoundException('Task not found');
    }
  }

  async countActive(orgId: string): Promise<number> {
    return this.taskModel
      .countDocuments({
        org: new Types.ObjectId(orgId),
        status: { $in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] },
      } as any)
      .exec();
  }

  async countOverdue(orgId: string): Promise<number> {
    return this.taskModel
      .countDocuments({
        org: new Types.ObjectId(orgId),
        status: { $in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] },
        dueDate: { $lt: new Date() },
      } as any)
      .exec();
  }
}
