import { apiClient } from '@/lib/api-client';

import type {
  CreateEmployeeDto,
  Employee,
  PaginatedResponse,
  PaginationParams,
  UpdateEmployeeDto,
} from '@/types';

export const employeesService = {
  async getAll(params?: PaginationParams & { status?: string }): Promise<PaginatedResponse<Employee>> {
    const { data } = await apiClient.get<PaginatedResponse<Employee>>('/employees', { params });
    return data;
  },

  async getById(id: string): Promise<Employee> {
    const { data } = await apiClient.get<Employee>(`/employees/${id}`);
    return data;
  },

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    const { data } = await apiClient.post<Employee>('/employees', dto);
    return data;
  },

  async update(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    const { data } = await apiClient.patch<Employee>(`/employees/${id}`, dto);
    return data;
  },
};
