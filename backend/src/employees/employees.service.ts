import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Employee, EmployeeDocument, EmployeeStatus } from './schemas/employee.schema';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { escapeRegex } from '../common/utils/escape-regex';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name) private readonly employeeModel: Model<EmployeeDocument>,
  ) {}

  async create(orgId: string, createEmployeeDto: CreateEmployeeDto): Promise<EmployeeDocument> {
    return this.employeeModel.create({
      ...createEmployeeDto,
      org: new Types.ObjectId(orgId),
      user: createEmployeeDto.user ? new Types.ObjectId(createEmployeeDto.user) : undefined,
    } as any);
  }

  async findAll(
    orgId: string,
    query: QueryEmployeeDto,
  ): Promise<PaginatedResponseDto<EmployeeDocument>> {
    const filter: any = { org: new Types.ObjectId(orgId) };

    if (query.status) {
      filter.status = query.status;
    }
    if (query.position) {
      (filter as any).position = { $regex: escapeRegex(query.position), $options: 'i' };
    }
    if (query.department) {
      (filter as any).department = { $regex: escapeRegex(query.department), $options: 'i' };
    }
    if (query.search) {
      const escaped = escapeRegex(query.search);
      filter.$or = [
        { firstName: { $regex: escaped, $options: 'i' } },
        { lastName: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
      ] as any;
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.employeeModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      this.employeeModel.countDocuments(filter).exec(),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findById(orgId: string, id: string): Promise<EmployeeDocument> {
    const employee = await this.employeeModel
      .findOne({ _id: new Types.ObjectId(id), org: new Types.ObjectId(orgId) } as any)
      .exec();
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  async update(
    orgId: string,
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<EmployeeDocument> {
    const employee = await this.employeeModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), org: new Types.ObjectId(orgId) } as any,
        updateEmployeeDto,
        { new: true },
      )
      .exec();
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  async remove(orgId: string, id: string): Promise<EmployeeDocument> {
    const employee = await this.employeeModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), org: new Types.ObjectId(orgId) } as any,
        { status: EmployeeStatus.INACTIVE },
        { new: true },
      )
      .exec();
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  async countActiveByOrg(orgId: string): Promise<number> {
    return this.employeeModel
      .countDocuments({
        org: new Types.ObjectId(orgId),
        status: EmployeeStatus.ACTIVE,
      } as any)
      .exec();
  }
}
