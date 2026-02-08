import { apiClient } from '@/lib/api-client';

import type {
  CreateInventoryDto,
  InventoryItem,
  PaginatedResponse,
  PaginationParams,
  UpdateInventoryDto,
} from '@/types';

export const inventoryService = {
  async getAll(params?: PaginationParams & { lowStock?: boolean }): Promise<PaginatedResponse<InventoryItem>> {
    const { data } = await apiClient.get<PaginatedResponse<InventoryItem>>('/inventory', { params });
    return data;
  },

  async getById(id: string): Promise<InventoryItem> {
    const { data } = await apiClient.get<InventoryItem>(`/inventory/${id}`);
    return data;
  },

  async create(dto: CreateInventoryDto): Promise<InventoryItem> {
    const { productId, ...rest } = dto;
    const { data } = await apiClient.post<InventoryItem>('/inventory', { ...rest, product: productId });
    return data;
  },

  async update(id: string, dto: UpdateInventoryDto): Promise<InventoryItem> {
    const { data } = await apiClient.patch<InventoryItem>(`/inventory/${id}`, dto);
    return data;
  },
};
