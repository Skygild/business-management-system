import { apiClient } from '@/lib/api-client';

import type {
  CreateProductDto,
  PaginatedResponse,
  PaginationParams,
  Product,
  UpdateProductDto,
} from '@/types';

export const productsService = {
  async getAll(params?: PaginationParams & { category?: string }): Promise<PaginatedResponse<Product>> {
    const { data } = await apiClient.get<PaginatedResponse<Product>>('/products', { params });
    return data;
  },

  async getById(id: string): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
  },

  async create(dto: CreateProductDto): Promise<Product> {
    const { data } = await apiClient.post<Product>('/products', dto);
    return data;
  },

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const { data } = await apiClient.patch<Product>(`/products/${id}`, dto);
    return data;
  },
};
