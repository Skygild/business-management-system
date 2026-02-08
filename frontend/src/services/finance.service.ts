import { apiClient } from '@/lib/api-client';

import type {
  CreateTransactionDto,
  FinanceCharts,
  FinanceSummary,
  PaginatedResponse,
  PaginationParams,
  Transaction,
  UpdateTransactionDto,
} from '@/types';

export interface FinanceFilters {
  startDate?: string;
  endDate?: string;
  type?: string;
  category?: string;
}

interface RevenueVsExpenseItem {
  period: string;
  income: number;
  expenses: number;
}

interface CategoryBreakdownItem {
  category: string;
  total: number;
}

interface ProfitTrendItem {
  period: string;
  profit: number;
}

export const financeService = {
  async getTransactions(
    params?: PaginationParams & FinanceFilters,
  ): Promise<PaginatedResponse<Transaction>> {
    const { data } = await apiClient.get<PaginatedResponse<Transaction>>('/finance/transactions', {
      params,
    });
    return data;
  },

  async getSummary(params?: FinanceFilters): Promise<FinanceSummary> {
    const { data } = await apiClient.get<FinanceSummary>('/finance/summary', { params });
    return data;
  },

  async getCharts(params?: FinanceFilters): Promise<FinanceCharts> {
    const [revenueVsExpenseRes, categoryBreakdownRes, profitTrendRes] = await Promise.all([
      apiClient.get<RevenueVsExpenseItem[]>('/finance/charts/revenue-vs-expense', { params }),
      apiClient.get<CategoryBreakdownItem[]>('/finance/charts/category-breakdown', { params }),
      apiClient.get<ProfitTrendItem[]>('/finance/charts/profit-trend', { params }),
    ]);

    const revenueVsExpense = revenueVsExpenseRes.data.map(
      (d) => ({ label: d.period, revenue: d.income, expenses: d.expenses }),
    );
    const categoryBreakdown = categoryBreakdownRes.data.map(
      (d) => ({ name: d.category, value: d.total }),
    );
    const profitTrend = profitTrendRes.data.map(
      (d) => ({ label: d.period, revenue: 0, expenses: 0, profit: d.profit }),
    );

    return { revenueVsExpense, categoryBreakdown, profitTrend };
  },

  async createTransaction(dto: CreateTransactionDto): Promise<Transaction> {
    const { data } = await apiClient.post<Transaction>('/finance/transactions', dto);
    return data;
  },

  async updateTransaction(id: string, dto: UpdateTransactionDto): Promise<Transaction> {
    const { data } = await apiClient.patch<Transaction>(`/finance/transactions/${id}`, dto);
    return data;
  },
};
