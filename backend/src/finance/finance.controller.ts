import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { CreateFinanceCategoryDto } from './dto/create-finance-category.dto';
import { UpdateFinanceCategoryDto } from './dto/update-finance-category.dto';
import { FinanceSummaryQueryDto } from './dto/finance-summary-query.dto';
import { ChartQueryDto } from './dto/finance-summary-query.dto';
import { CategoryBreakdownQueryDto } from './dto/finance-summary-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // --- Transaction endpoints ---

  @Post('transactions')
  @ApiOperation({ summary: 'Create a new transaction' })
  createTransaction(
    @CurrentUser() user: JwtPayload,
    @Body() createDto: CreateTransactionDto,
  ) {
    return this.financeService.createTransaction(user.org, user.sub, createDto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'List transactions with pagination and filters' })
  findAllTransactions(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryTransactionDto,
  ) {
    return this.financeService.findAllTransactions(user.org, query);
  }

  @Get('transactions/:id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  findTransaction(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.financeService.findTransactionById(user.org, id);
  }

  @Patch('transactions/:id')
  @ApiOperation({ summary: 'Update a transaction' })
  updateTransaction(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateDto: UpdateTransactionDto,
  ) {
    return this.financeService.updateTransaction(user.org, id, updateDto);
  }

  @Delete('transactions/:id')
  @ApiOperation({ summary: 'Delete a transaction' })
  removeTransaction(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.financeService.removeTransaction(user.org, id);
  }

  // --- Category endpoints ---

  @Post('categories')
  @ApiOperation({ summary: 'Create a finance category' })
  createCategory(
    @CurrentUser() user: JwtPayload,
    @Body() createDto: CreateFinanceCategoryDto,
  ) {
    return this.financeService.createCategory(user.org, createDto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all finance categories' })
  findAllCategories(@CurrentUser() user: JwtPayload) {
    return this.financeService.findAllCategories(user.org);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update a finance category' })
  updateCategory(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateDto: UpdateFinanceCategoryDto,
  ) {
    return this.financeService.updateCategory(user.org, id, updateDto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete a finance category' })
  removeCategory(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.financeService.removeCategory(user.org, id);
  }

  // --- Aggregation / chart endpoints ---

  @Get('summary')
  @ApiOperation({ summary: 'Get financial summary (totals and profit)' })
  getSummary(@CurrentUser() user: JwtPayload, @Query() query: FinanceSummaryQueryDto) {
    return this.financeService.getSummary(user.org, query);
  }

  @Get('charts/revenue-vs-expense')
  @ApiOperation({ summary: 'Revenue vs expense time series' })
  getRevenueVsExpense(@CurrentUser() user: JwtPayload, @Query() query: ChartQueryDto) {
    return this.financeService.getRevenueVsExpense(user.org, query);
  }

  @Get('charts/category-breakdown')
  @ApiOperation({ summary: 'Category breakdown of transactions' })
  getCategoryBreakdown(
    @CurrentUser() user: JwtPayload,
    @Query() query: CategoryBreakdownQueryDto,
  ) {
    return this.financeService.getCategoryBreakdown(user.org, query);
  }

  @Get('charts/profit-trend')
  @ApiOperation({ summary: 'Profit trend over time' })
  getProfitTrend(@CurrentUser() user: JwtPayload, @Query() query: ChartQueryDto) {
    return this.financeService.getProfitTrend(user.org, query);
  }
}
