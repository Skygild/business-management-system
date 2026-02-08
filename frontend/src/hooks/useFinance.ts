import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { queryKeys } from '@/lib/query-keys';
import { financeService } from '@/services/finance.service';
import type { FinanceFilters } from '@/services/finance.service';

import type { CreateTransactionDto, PaginationParams, UpdateTransactionDto } from '@/types';

export function useTransactions(params?: PaginationParams & FinanceFilters) {
  return useQuery({
    queryKey: queryKeys.finance.transactions(params),
    queryFn: () => financeService.getTransactions(params),
  });
}

export function useFinanceSummary(params?: FinanceFilters) {
  return useQuery({
    queryKey: queryKeys.finance.summary(params),
    queryFn: () => financeService.getSummary(params),
  });
}

export function useFinanceCharts(params?: FinanceFilters) {
  return useQuery({
    queryKey: queryKeys.finance.charts(params),
    queryFn: () => financeService.getCharts(params),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateTransactionDto) => financeService.createTransaction(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
      toast.success('Transaction created successfully');
    },
    onError: () => {
      toast.error('Failed to create transaction');
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTransactionDto }) =>
      financeService.updateTransaction(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
      toast.success('Transaction updated successfully');
    },
    onError: () => {
      toast.error('Failed to update transaction');
    },
  });
}
