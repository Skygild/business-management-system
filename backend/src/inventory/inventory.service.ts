import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { escapeRegex } from '../common/utils/escape-regex';
import { InventoryItem, InventoryItemDocument } from './schemas/inventory-item.schema';
import {
  InventoryAdjustment,
  InventoryAdjustmentDocument,
  AdjustmentType,
} from './schemas/inventory-adjustment.schema';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { QueryInventoryDto } from './dto/query-inventory.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(InventoryItem.name)
    private readonly inventoryItemModel: Model<InventoryItemDocument>,
    @InjectModel(InventoryAdjustment.name)
    private readonly adjustmentModel: Model<InventoryAdjustmentDocument>,
  ) {}

  async create(
    orgId: string,
    createDto: CreateInventoryItemDto,
  ): Promise<InventoryItemDocument> {
    return this.inventoryItemModel.create({
      ...createDto,
      product: new Types.ObjectId(createDto.product),
      org: new Types.ObjectId(orgId),
    } as any);
  }

  async findAll(
    orgId: string,
    query: QueryInventoryDto,
  ): Promise<PaginatedResponseDto<InventoryItemDocument>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      { $match: { org: new Types.ObjectId(orgId) } },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
    ];

    if (query.productName) {
      pipeline.push({
        $match: { 'productDetails.name': { $regex: escapeRegex(query.productName), $options: 'i' } },
      });
    }
    if (query.category) {
      pipeline.push({
        $match: { 'productDetails.category': { $regex: escapeRegex(query.category), $options: 'i' } },
      });
    }
    if (query.lowStock) {
      pipeline.push({
        $match: { $expr: { $lte: ['$quantity', '$lowStockThreshold'] } },
      });
    }

    const countPipeline = [...pipeline, { $count: 'total' }];
    const dataPipeline = [
      ...pipeline,
      { $sort: { createdAt: -1 as const } },
      { $skip: skip },
      { $limit: limit },
      { $addFields: { id: { $toString: '$_id' }, 'productDetails.id': { $toString: '$productDetails._id' } } },
    ];

    const [countResult, data] = await Promise.all([
      this.inventoryItemModel.aggregate(countPipeline).exec(),
      this.inventoryItemModel.aggregate(dataPipeline).exec(),
    ]);

    const total = countResult.length > 0 ? (countResult[0] as { total: number }).total : 0;
    return new PaginatedResponseDto(data as InventoryItemDocument[], total, page, limit);
  }

  async findById(orgId: string, id: string): Promise<InventoryItemDocument> {
    const item = await this.inventoryItemModel
      .findOne({
        _id: new Types.ObjectId(id),
        org: new Types.ObjectId(orgId),
      } as any)
      .populate('product')
      .exec();
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }
    return item;
  }

  async update(
    orgId: string,
    id: string,
    userId: string,
    updateDto: UpdateInventoryItemDto,
  ): Promise<InventoryItemDocument> {
    const item = await this.inventoryItemModel
      .findOne({
        _id: new Types.ObjectId(id),
        org: new Types.ObjectId(orgId),
      } as any)
      .exec();
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    if (updateDto.quantity !== undefined && updateDto.adjustmentType) {
      const previousQuantity = item.quantity;
      let newQuantity: number;

      switch (updateDto.adjustmentType) {
        case AdjustmentType.ADD:
          newQuantity = previousQuantity + updateDto.quantity;
          break;
        case AdjustmentType.REMOVE:
          newQuantity = previousQuantity - updateDto.quantity;
          if (newQuantity < 0) {
            throw new BadRequestException('Cannot reduce quantity below zero');
          }
          break;
        case AdjustmentType.SET:
          newQuantity = updateDto.quantity;
          break;
      }

      await this.adjustmentModel.create({
        inventoryItem: item._id,
        adjustmentType: updateDto.adjustmentType,
        quantity: updateDto.quantity,
        previousQuantity,
        newQuantity,
        reason: updateDto.reason,
        adjustedBy: new Types.ObjectId(userId),
        org: new Types.ObjectId(orgId),
      } as any);

      item.quantity = newQuantity;
    }

    if (updateDto.costPrice !== undefined) item.costPrice = updateDto.costPrice;
    if (updateDto.sellingPrice !== undefined) item.sellingPrice = updateDto.sellingPrice;
    if (updateDto.location !== undefined) item.location = updateDto.location;
    if (updateDto.lowStockThreshold !== undefined)
      item.lowStockThreshold = updateDto.lowStockThreshold;

    return item.save();
  }

  async remove(orgId: string, id: string): Promise<void> {
    const result = await this.inventoryItemModel
      .findOneAndDelete({
        _id: new Types.ObjectId(id),
        org: new Types.ObjectId(orgId),
      } as any)
      .exec();
    if (!result) {
      throw new NotFoundException('Inventory item not found');
    }
  }

  async findLowStock(orgId: string): Promise<InventoryItemDocument[]> {
    return this.inventoryItemModel
      .find({
        org: new Types.ObjectId(orgId),
        $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
      } as any)
      .populate('product')
      .exec();
  }

  async getTotalInventoryValue(orgId: string): Promise<number> {
    const result = await this.inventoryItemModel
      .aggregate([
        { $match: { org: new Types.ObjectId(orgId) } },
        {
          $group: {
            _id: null,
            totalValue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } },
          },
        },
      ])
      .exec();
    return result.length > 0 ? (result[0] as { totalValue: number }).totalValue : 0;
  }

  async getLowStockCount(orgId: string): Promise<number> {
    return this.inventoryItemModel
      .countDocuments({
        org: new Types.ObjectId(orgId),
        $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
      } as any)
      .exec();
  }
}
