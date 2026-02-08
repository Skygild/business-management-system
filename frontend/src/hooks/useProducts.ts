import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { queryKeys } from '@/lib/query-keys';
import { productsService } from '@/services/products.service';

import type { CreateProductDto, PaginationParams, UpdateProductDto } from '@/types';

export function useProducts(params?: PaginationParams & { category?: string }) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productsService.getAll(params),
  });
}

export function useAllProducts() {
  return useQuery({
    queryKey: queryKeys.products.list({ limit: 1000 }),
    queryFn: () => productsService.getAll({ limit: 1000 }),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateProductDto) => productsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success('Product created successfully');
    },
    onError: () => {
      toast.error('Failed to create product');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductDto }) =>
      productsService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success('Product updated successfully');
    },
    onError: () => {
      toast.error('Failed to update product');
    },
  });
}
