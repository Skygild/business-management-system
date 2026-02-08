import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userModel.findOne({
      email: createUserDto.email.toLowerCase(),
      org: new Types.ObjectId(createUserDto.org),
    } as any);
    if (existing) {
      throw new ConflictException('User with this email already exists in this organization');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, SALT_ROUNDS);
    return this.userModel.create({
      email: createUserDto.email,
      passwordHash,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      role: createUserDto.role,
      org: new Types.ObjectId(createUserDto.org),
    } as any);
  }

  async findByEmail(email: string, orgId: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        email: email.toLowerCase(),
        org: new Types.ObjectId(orgId),
      } as any)
      .exec();
  }

  async findByEmailAnyOrg(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).select('-passwordHash').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByIdWithPassword(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findAllByOrg(orgId: string): Promise<UserDocument[]> {
    return this.userModel
      .find({ org: new Types.ObjectId(orgId) } as any)
      .select('-passwordHash')
      .exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-passwordHash')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByIdInOrg(id: string, orgId: string): Promise<UserDocument> {
    const user = await this.userModel
      .findOne({ _id: new Types.ObjectId(id), org: new Types.ObjectId(orgId) } as any)
      .select('-passwordHash')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateInOrg(id: string, orgId: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), org: new Types.ObjectId(orgId) } as any,
        updateUserDto,
        { new: true },
      )
      .select('-passwordHash')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async removeFromOrg(id: string, orgId: string): Promise<void> {
    const result = await this.userModel
      .findOneAndDelete({ _id: new Types.ObjectId(id), org: new Types.ObjectId(orgId) } as any)
      .exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async validatePassword(user: UserDocument, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}
