import { apiClient } from '@/lib/api-client';

import type {
  CreateTaskDto,
  PaginatedResponse,
  PaginationParams,
  Task,
  UpdateTaskDto,
} from '@/types';

export const tasksService = {
  async getAll(
    params?: PaginationParams & { status?: string; priority?: string; assigneeId?: string },
  ): Promise<PaginatedResponse<Task>> {
    const { data } = await apiClient.get<PaginatedResponse<Task>>('/tasks', { params });
    return data;
  },

  async getById(id: string): Promise<Task> {
    const { data } = await apiClient.get<Task>(`/tasks/${id}`);
    return data;
  },

  async create(dto: CreateTaskDto): Promise<Task> {
    const { assigneeIds, ...rest } = dto;
    const payload = { ...rest, assignees: assigneeIds };
    const { data } = await apiClient.post<Task>('/tasks', payload);
    return data;
  },

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const { assigneeIds, ...rest } = dto;
    const payload: Record<string, unknown> = { ...rest };
    if (assigneeIds !== undefined) payload.assignees = assigneeIds;
    const { data } = await apiClient.patch<Task>(`/tasks/${id}`, payload);
    return data;
  },
};
