import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { queryKeys } from '@/lib/query-keys';
import { inventoryService } from '@/services/inventory.service';

import type { CreateInventoryDto, PaginationParams, UpdateInventoryDto } from '@/types';

export function useInventory(params?: PaginationParams & { lowStock?: boolean }) {
  return useQuery({
    queryKey: queryKeys.inventory.list(params),
    queryFn: () => inventoryService.getAll(params),
  });
}

export function useAddInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateInventoryDto) => inventoryService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      toast.success('Inventory item added successfully');
    },
    onError: () => {
      toast.error('Failed to add inventory item');
    },
  });
}

export function useUpdateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateInventoryDto }) =>
      inventoryService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      toast.success('Inventory updated successfully');
    },
    onError: () => {
      toast.error('Failed to update inventory');
    },
  });
}
