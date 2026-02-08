import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { queryKeys } from '@/lib/query-keys';
import { employeesService } from '@/services/employees.service';

import type { CreateEmployeeDto, PaginationParams, UpdateEmployeeDto } from '@/types';

export function useEmployees(params?: PaginationParams & { status?: string }) {
  return useQuery({
    queryKey: queryKeys.employees.list(params),
    queryFn: () => employeesService.getAll(params),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateEmployeeDto) => employeesService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      toast.success('Employee created successfully');
    },
    onError: () => {
      toast.error('Failed to create employee');
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateEmployeeDto }) =>
      employeesService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      toast.success('Employee updated successfully');
    },
    onError: () => {
      toast.error('Failed to update employee');
    },
  });
}
