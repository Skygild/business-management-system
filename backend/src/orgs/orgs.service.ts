import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Org, OrgDocument } from './schemas/org.schema';
import { CreateOrgDto } from './dto/create-org.dto';
import { UpdateOrgDto } from './dto/update-org.dto';

@Injectable()
export class OrgsService {
  constructor(@InjectModel(Org.name) private readonly orgModel: Model<OrgDocument>) {}

  async create(createOrgDto: CreateOrgDto): Promise<OrgDocument> {
    const existing = await this.orgModel.findOne({ slug: createOrgDto.slug });
    if (existing) {
      throw new ConflictException('Organization with this slug already exists');
    }
    return this.orgModel.create(createOrgDto);
  }

  async findAll(): Promise<OrgDocument[]> {
    return this.orgModel.find().exec();
  }

  async findById(id: string): Promise<OrgDocument> {
    const org = await this.orgModel.findById(id).exec();
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }

  async update(id: string, updateOrgDto: UpdateOrgDto): Promise<OrgDocument> {
    const org = await this.orgModel
      .findByIdAndUpdate(id, updateOrgDto, { new: true })
      .exec();
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }

  async remove(id: string): Promise<void> {
    const result = await this.orgModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Organization not found');
    }
  }
}
