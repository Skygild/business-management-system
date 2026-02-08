'use client';

import { FormEvent, useCallback, useState } from 'react';

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Spinner } from '@/components/ui/Spinner';
import { Table } from '@/components/ui/Table';
import { useProducts, useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';

import { formatCurrency } from '@/lib/format';

import type { Product, CreateProductDto } from '@/types';

function ProductsContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data, isLoading, error } = useProducts({
    page,
    limit: 10,
    search: search || undefined,
  });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  function openCreateModal() {
    setEditingProduct(null);
    setIsModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dto: CreateProductDto = {
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      description: (formData.get('description') as string) || undefined,
      category: formData.get('category') as string,
      unitPrice: parseFloat(formData.get('unitPrice') as string),
    };

    if (editingProduct) {
      await updateMutation.mutateAsync({ id: editingProduct.id, dto });
    } else {
      await createMutation.mutateAsync(dto);
    }
    setIsModalOpen(false);
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (p: Product) => <span className="font-medium text-gray-900">{p.name}</span>,
    },
    { key: 'sku', header: 'SKU' },
    { key: 'category', header: 'Category' },
    {
      key: 'unitPrice',
      header: 'Unit Price',
      render: (p: Product) => formatCurrency(p.unitPrice),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (p: Product) => (
        <Button variant="ghost" size="sm" onClick={() => openEditModal(p)}>
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
        Failed to load products. Please try again.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button onClick={openCreateModal}>Add Product</Button>
      </div>

      <div className="mb-4">
        <div className="w-full sm:max-w-xs">
          <SearchInput value={search} onChange={handleSearch} placeholder="Search by name, SKU..." />
        </div>
      </div>

      {data && data.data.length > 0 ? (
        <>
          <Table columns={columns} data={data.data} keyExtractor={(p) => p.id} />
          <div className="mt-4">
            <Pagination currentPage={data.page} totalPages={data.totalPages} onPageChange={setPage} />
          </div>
        </>
      ) : (
        <EmptyState
          title="No products found"
          description="Get started by adding your first product."
          actionLabel="Add Product"
          onAction={openCreateModal}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="product-form"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" name="name" required defaultValue={editingProduct?.name} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="SKU" name="sku" required defaultValue={editingProduct?.sku} />
            <Input label="Category" name="category" required defaultValue={editingProduct?.category} />
          </div>
          <Input
            label="Unit Price"
            name="unitPrice"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={editingProduct?.unitPrice?.toString()}
          />
          <Input label="Description" name="description" defaultValue={editingProduct?.description} />
        </form>
      </Modal>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <ProtectedRoute>
      <ProductsContent />
    </ProtectedRoute>
  );
}
