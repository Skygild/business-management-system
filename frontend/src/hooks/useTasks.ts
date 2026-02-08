import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { queryKeys } from '@/lib/query-keys';
import { tasksService } from '@/services/tasks.service';

import type { CreateTaskDto, PaginationParams, UpdateTaskDto } from '@/types';

export function useTasks(
  params?: PaginationParams & { status?: string; priority?: string; assigneeId?: string },
) {
  return useQuery({
    queryKey: queryKeys.tasks.list(params),
    queryFn: () => tasksService.getAll(params),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateTaskDto) => tasksService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      toast.success('Task created successfully');
    },
    onError: () => {
      toast.error('Failed to create task');
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaskDto }) =>
      tasksService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      toast.success('Task updated successfully');
    },
    onError: () => {
      toast.error('Failed to update task');
    },
  });
}
