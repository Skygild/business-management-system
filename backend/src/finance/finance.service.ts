import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { escapeRegex } from '../common/utils/escape-regex';
import { Transaction, TransactionDocument, TransactionType } from './schemas/transaction.schema';
import {
  FinanceCategory,
  FinanceCategoryDocument,
} from './schemas/finance-category.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { CreateFinanceCategoryDto } from './dto/create-finance-category.dto';
import { UpdateFinanceCategoryDto } from './dto/update-finance-category.dto';
import {
  FinanceSummaryQueryDto,
  ChartQueryDto,
  CategoryBreakdownQueryDto,
} from './dto/finance-summary-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

export interface FinanceSummary {
  totalExpenses: number;
  totalIncome: number;
  profit: number;
}

export interface TimeSeriesPoint {
  period: string;
  expenses: number;
  income: number;
}

export interface CategoryBreakdownItem {
  category: string;
  total: number;
}

export interface ProfitTrendPoint {
  period: string;
  profit: number;
}

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(FinanceCategory.name)
    private readonly categoryModel: Model<FinanceCategoryDocument>,
  ) {}

  // --- Transaction CRUD ---

  async createTransaction(
    orgId: string,
    userId: string,
    createDto: CreateTransactionDto,
  ): Promise<TransactionDocument> {
    return this.transactionModel.create({
      ...createDto,
      date: new Date(createDto.date),
      employee: createDto.employee ? new Types.ObjectId(createDto.employee) : undefined,
      org: new Types.ObjectId(orgId),
      createdBy: new Types.ObjectId(userId),
    } as any);
  }

  async findAllTransactions(
    orgId: string,
    query: QueryTransactionDto,
  ): Promise<PaginatedResponseDto<TransactionDocument>> {
    const filter: any = { org: new Types.ObjectId(orgId) };

    if (query.type) filter.type = query.type;
    if (query.category) (filter as any).category = { $regex: escapeRegex(query.category), $options: 'i' };
    if (query.employee) (filter as any).employee = new Types.ObjectId(query.employee);
    if (query.tags && query.tags.length > 0) (filter as any).tags = { $in: query.tags };

    if (query.startDate || query.endDate) {
      const dateFilter: Record<string, Date> = {};
      if (query.startDate) dateFilter.$gte = new Date(query.startDate);
      if (query.endDate) dateFilter.$lte = new Date(query.endDate);
      (filter as any).date = dateFilter;
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.transactionModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ date: -1 })
        .populate('employee')
        .exec(),
      this.transactionModel.countDocuments(filter).exec(),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findTransactionById(orgId: string, id: string): Promise<TransactionDocument> {
    const transaction = await this.transactionModel
      .findOne({
        _id: new Types.ObjectId(id),
        org: new Types.ObjectId(orgId),
      } as any)
      .populate('employee')
      .exec();
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async updateTransaction(
    orgId: string,
    id: string,
    updateDto: UpdateTransactionDto,
  ): Promise<TransactionDocument> {
    const transaction = await this.transactionModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          org: new Types.ObjectId(orgId),
        } as any,
        updateDto,
        { new: true },
      )
      .exec();
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async removeTransaction(orgId: string, id: string): Promise<void> {
    const result = await this.transactionModel
      .findOneAndDelete({
        _id: new Types.ObjectId(id),
        org: new Types.ObjectId(orgId),
      } as any)
      .exec();
    if (!result) {
      throw new NotFoundException('Transaction not found');
    }
  }

  // --- Category CRUD ---

  async createCategory(
    orgId: string,
    createDto: CreateFinanceCategoryDto,
  ): Promise<FinanceCategoryDocument> {
    return this.categoryModel.create({
      ...createDto,
      org: new Types.ObjectId(orgId),
    } as any);
  }

  async findAllCategories(orgId: string): Promise<FinanceCategoryDocument[]> {
    return this.categoryModel
      .find({
        org: new Types.ObjectId(orgId),
        isActive: true,
      } as any)
      .exec();
  }

  async updateCategory(
    orgId: string,
    id: string,
    updateDto: UpdateFinanceCategoryDto,
  ): Promise<FinanceCategoryDocument> {
    const category = await this.categoryModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          org: new Types.ObjectId(orgId),
        } as any,
        updateDto,
        { new: true },
      )
      .exec();
    if (!category) {
      throw new NotFoundException('Finance category not found');
    }
    return category;
  }

  async removeCategory(orgId: string, id: string): Promise<void> {
    const result = await this.categoryModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          org: new Types.ObjectId(orgId),
        } as any,
        { isActive: false },
      )
      .exec();
    if (!result) {
      throw new NotFoundException('Finance category not found');
    }
  }

  // --- Aggregation endpoints ---

  async getSummary(orgId: string, query: FinanceSummaryQueryDto): Promise<FinanceSummary> {
    const match = this.buildDateMatch(orgId, query.startDate, query.endDate);

    const result = await this.transactionModel
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
          },
        },
      ])
      .exec();

    let totalExpenses = 0;
    let totalIncome = 0;

    for (const item of result) {
      const row = item as { _id: string; total: number };
      if (row._id === TransactionType.EXPENSE) {
        totalExpenses = row.total;
      } else if (
        row._id === TransactionType.INCOME ||
        row._id === TransactionType.SALE
      ) {
        totalIncome += row.total;
      }
    }

    return {
      totalExpenses,
      totalIncome,
      profit: totalIncome - totalExpenses,
    };
  }

  async getRevenueVsExpense(
    orgId: string,
    query: ChartQueryDto,
  ): Promise<TimeSeriesPoint[]> {
    const match = this.buildDateMatch(orgId, query.startDate, query.endDate);
    const dateFormat = this.getDateFormat(query.interval ?? 'monthly');

    const result = await this.transactionModel
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              period: { $dateToString: { format: dateFormat, date: '$date' } },
              type: '$type',
            },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.period': 1 } },
      ])
      .exec();

    const periodMap = new Map<string, { expenses: number; income: number }>();
    for (const item of result) {
      const row = item as { _id: { period: string; type: string }; total: number };
      const period = row._id.period;
      if (!periodMap.has(period)) {
        periodMap.set(period, { expenses: 0, income: 0 });
      }
      const entry = periodMap.get(period)!;
      if (row._id.type === TransactionType.EXPENSE) {
        entry.expenses += row.total;
      } else {
        entry.income += row.total;
      }
    }

    return Array.from(periodMap.entries()).map(([period, data]) => ({
      period,
      ...data,
    }));
  }

  async getCategoryBreakdown(
    orgId: string,
    query: CategoryBreakdownQueryDto,
  ): Promise<CategoryBreakdownItem[]> {
    const match = this.buildDateMatch(orgId, query.startDate, query.endDate);
    if (query.type) {
      match.type = query.type;
    }

    const result = await this.transactionModel
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
          },
        },
        { $sort: { total: -1 } },
      ])
      .exec();

    return result.map((item) => {
      const row = item as { _id: string; total: number };
      return { category: row._id, total: row.total };
    });
  }

  async getProfitTrend(
    orgId: string,
    query: ChartQueryDto,
  ): Promise<ProfitTrendPoint[]> {
    const match = this.buildDateMatch(orgId, query.startDate, query.endDate);
    const dateFormat = this.getDateFormat(query.interval ?? 'monthly');

    const result = await this.transactionModel
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              period: { $dateToString: { format: dateFormat, date: '$date' } },
              type: '$type',
            },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.period': 1 } },
      ])
      .exec();

    const periodMap = new Map<string, number>();
    for (const item of result) {
      const row = item as { _id: { period: string; type: string }; total: number };
      const period = row._id.period;
      if (!periodMap.has(period)) {
        periodMap.set(period, 0);
      }
      if (row._id.type === TransactionType.EXPENSE) {
        periodMap.set(period, periodMap.get(period)! - row.total);
      } else {
        periodMap.set(period, periodMap.get(period)! + row.total);
      }
    }

    return Array.from(periodMap.entries()).map(([period, profit]) => ({
      period,
      profit,
    }));
  }

  async getMonthlyExpenses(orgId: string): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const result = await this.transactionModel
      .aggregate([
        {
          $match: {
            org: new Types.ObjectId(orgId),
            type: TransactionType.EXPENSE,
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ])
      .exec();

    return result.length > 0 ? (result[0] as { total: number }).total : 0;
  }

  async getMonthlyIncome(orgId: string): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const result = await this.transactionModel
      .aggregate([
        {
          $match: {
            org: new Types.ObjectId(orgId),
            type: { $in: [TransactionType.INCOME, TransactionType.SALE] },
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ])
      .exec();

    return result.length > 0 ? (result[0] as { total: number }).total : 0;
  }

  private buildDateMatch(
    orgId: string,
    startDate?: string,
    endDate?: string,
  ): Record<string, unknown> {
    const match: Record<string, unknown> = { org: new Types.ObjectId(orgId) };
    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      match.date = dateFilter;
    }
    return match;
  }

  private getDateFormat(interval: string): string {
    switch (interval) {
      case 'daily':
        return '%Y-%m-%d';
      case 'weekly':
        return '%Y-W%V';
      case 'monthly':
      default:
        return '%Y-%m';
    }
  }
}
