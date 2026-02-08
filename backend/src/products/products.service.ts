import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { escapeRegex } from '../common/utils/escape-regex';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(orgId: string, createProductDto: CreateProductDto): Promise<ProductDocument> {
    const existing = await this.productModel.findOne({
      org: new Types.ObjectId(orgId),
      sku: createProductDto.sku,
    } as any);
    if (existing) {
      throw new ConflictException('Product with this SKU already exists');
    }
    return this.productModel.create({
      ...createProductDto,
      org: new Types.ObjectId(orgId),
    } as any);
  }

  async findAll(
    orgId: string,
    query: QueryProductDto,
  ): Promise<PaginatedResponseDto<ProductDocument>> {
    const filter: any = {
      org: new Types.ObjectId(orgId),
      isActive: true,
    };

    if (query.name) {
      (filter as any).name = { $regex: escapeRegex(query.name), $options: 'i' };
    }
    if (query.sku) {
      (filter as any).sku = { $regex: escapeRegex(query.sku), $options: 'i' };
    }
    if (query.category) {
      (filter as any).category = { $regex: escapeRegex(query.category), $options: 'i' };
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.productModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findById(orgId: string, id: string): Promise<ProductDocument> {
    const product = await this.productModel
      .findOne({
        _id: new Types.ObjectId(id),
        org: new Types.ObjectId(orgId),
      } as any)
      .exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(
    orgId: string,
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductDocument> {
    const product = await this.productModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), org: new Types.ObjectId(orgId) } as any,
        updateProductDto,
        { new: true },
      )
      .exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async remove(orgId: string, id: string): Promise<void> {
    const result = await this.productModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), org: new Types.ObjectId(orgId) } as any,
        { isActive: false },
        { new: true },
      )
      .exec();
    if (!result) {
      throw new NotFoundException('Product not found');
    }
  }
}
