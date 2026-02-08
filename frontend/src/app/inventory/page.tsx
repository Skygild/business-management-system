'use client';

import { FormEvent, useCallback, useState } from 'react';

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Table } from '@/components/ui/Table';
import { useInventory, useAddInventory, useUpdateInventory } from '@/hooks/useInventory';
import { useAllProducts } from '@/hooks/useProducts';

import { formatCurrency } from '@/lib/format';

import type { InventoryItem } from '@/types';

function InventoryContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const { data, isLoading, error } = useInventory({
    page,
    limit: 10,
    search: search || undefined,
  });
  const { data: productsData } = useAllProducts();
  const addMutation = useAddInventory();
  const updateMutation = useUpdateInventory();

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  function handleQuantityAdjust(item: InventoryItem, delta: number) {
    updateMutation.mutate({
      id: item.id,
      dto: { quantity: Math.max(0, item.quantity + delta) },
    });
  }

  async function handleAddSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await addMutation.mutateAsync({
      productId: formData.get('productId') as string,
      quantity: parseInt(formData.get('quantity') as string, 10),
      costPrice: parseFloat(formData.get('costPrice') as string),
      sellingPrice: parseFloat(formData.get('sellingPrice') as string),
      location: (formData.get('location') as string) || undefined,
      lowStockThreshold: parseInt(formData.get('lowStockThreshold') as string, 10) || 10,
    });
    setIsAddModalOpen(false);
  }

  async function handleEditSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingItem) return;
    const formData = new FormData(e.currentTarget);
    await updateMutation.mutateAsync({
      id: editingItem.id,
      dto: {
        quantity: parseInt(formData.get('quantity') as string, 10),
        costPrice: parseFloat(formData.get('costPrice') as string),
        sellingPrice: parseFloat(formData.get('sellingPrice') as string),
        location: (formData.get('location') as string) || undefined,
        lowStockThreshold: parseInt(formData.get('lowStockThreshold') as string, 10) || 10,
      },
    });
    setEditingItem(null);
  }

  const isLowStock = (item: InventoryItem) => item.quantity <= item.lowStockThreshold;

  const columns = [
    {
      key: 'product',
      header: 'Product',
      render: (item: InventoryItem) => (
        <span className="font-medium text-gray-900">{item.product.name}</span>
      ),
    },
    {
      key: 'sku',
      header: 'SKU',
      render: (item: InventoryItem) => item.product.sku,
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (item: InventoryItem) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleQuantityAdjust(item, -1)}>
            -
          </Button>
          <span className="min-w-[2rem] text-center font-medium">{item.quantity}</span>
          <Button variant="ghost" size="sm" onClick={() => handleQuantityAdjust(item, 1)}>
            +
          </Button>
        </div>
      ),
    },
    {
      key: 'costPrice',
      header: 'Cost Price',
      render: (item: InventoryItem) => formatCurrency(item.costPrice),
    },
    {
      key: 'sellingPrice',
      header: 'Selling Price',
      render: (item: InventoryItem) => formatCurrency(item.sellingPrice),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: InventoryItem) =>
        isLowStock(item) ? (
          <Badge color="red">Low Stock</Badge>
        ) : (
          <Badge color="green">In Stock</Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: InventoryItem) => (
        <Button variant="ghost" size="sm" onClick={() => setEditingItem(item)}>
          Edit
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center text-red-700">
        Failed to load inventory. Please try again.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>Add to Inventory</Button>
      </div>

      <div className="mb-4">
        <div className="w-full sm:max-w-xs">
          <SearchInput value={search} onChange={handleSearch} placeholder="Search inventory..." />
        </div>
      </div>

      {data && data.data.length > 0 ? (
        <>
          <Table columns={columns} data={data.data} keyExtractor={(i) => i.id} />
          <div className="mt-4">
            <Pagination currentPage={data.page} totalPages={data.totalPages} onPageChange={setPage} />
          </div>
        </>
      ) : (
        <EmptyState
          title="No inventory items found"
          description="Add products to your inventory to get started."
          actionLabel="Add to Inventory"
          onAction={() => setIsAddModalOpen(true)}
        />
      )}

      {/* Add Inventory Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add to Inventory"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="add-inventory-form" isLoading={addMutation.isPending}>
              Add
            </Button>
          </>
        }
      >
        <form id="add-inventory-form" onSubmit={handleAddSubmit} className="space-y-4">
          <Select
            label="Product"
            name="productId"
            required
            placeholder="Select a product"
            options={
              productsData?.data.map((p) => ({ label: `${p.name} (${p.sku})`, value: p.id })) ?? []
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Quantity" name="quantity" type="number" min="0" required />
            <Input label="Low Stock Threshold" name="lowStockThreshold" type="number" min="0" defaultValue="10" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Cost Price" name="costPrice" type="number" step="0.01" min="0" required />
            <Input label="Selling Price" name="sellingPrice" type="number" step="0.01" min="0" required />
          </div>
          <Input label="Location" name="location" placeholder="Warehouse A, Shelf 3..." />
        </form>
      </Modal>

      {/* Edit Inventory Modal */}
      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Edit Inventory Item"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button type="submit" form="edit-inventory-form" isLoading={updateMutation.isPending}>
              Update
            </Button>
          </>
        }
      >
        <form id="edit-inventory-form" onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Quantity" name="quantity" type="number" min="0" required defaultValue={editingItem?.quantity?.toString()} />
            <Input label="Low Stock Threshold" name="lowStockThreshold" type="number" min="0" defaultValue={editingItem?.lowStockThreshold?.toString()} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Cost Price" name="costPrice" type="number" step="0.01" min="0" required defaultValue={editingItem?.costPrice?.toString()} />
            <Input label="Selling Price" name="sellingPrice" type="number" step="0.01" min="0" required defaultValue={editingItem?.sellingPrice?.toString()} />
          </div>
          <Input label="Location" name="location" defaultValue={editingItem?.location} />
        </form>
      </Modal>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <ProtectedRoute>
      <InventoryContent />
    </ProtectedRoute>
  );
}
