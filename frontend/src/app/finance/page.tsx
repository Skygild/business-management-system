'use client';

import { FormEvent, Suspense, useCallback, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Table } from '@/components/ui/Table';
import {
  useTransactions,
  useFinanceSummary,
  useFinanceCharts,
  useCreateTransaction,
  useUpdateTransaction,
} from '@/hooks/useFinance';

import { formatCurrency } from '@/lib/format';

import type { Transaction, CreateTransactionDto, TransactionType } from '@/types';

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

const typeColorMap: Record<TransactionType, 'red' | 'green' | 'blue'> = {
  expense: 'red',
  sale: 'green',
  income: 'blue',
};

function FinanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') ?? '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') ?? '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') ?? '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') ?? '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const filterParams = {
    search: search || undefined,
    type: typeFilter || undefined,
    category: categoryFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  const { data, isLoading } = useTransactions({ page, limit: 10, ...filterParams });
  const { data: summary } = useFinanceSummary(filterParams);
  const { data: charts } = useFinanceCharts(filterParams);
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setPage(1);
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set('search', value);
      else params.delete('search');
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  function updateUrlParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`?${params.toString()}`);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dto: CreateTransactionDto = {
      type: formData.get('type') as TransactionType,
      amount: parseFloat(formData.get('amount') as string),
      category: formData.get('category') as string,
      description: (formData.get('description') as string) || undefined,
      date: formData.get('date') as string,
    };

    if (editingTransaction) {
      await updateMutation.mutateAsync({ id: editingTransaction.id, dto });
    } else {
      await createMutation.mutateAsync(dto);
    }
    setIsModalOpen(false);
    setEditingTransaction(null);
  }

  function openCreateModal() {
    setEditingTransaction(null);
    setIsModalOpen(true);
  }

  function openEditModal(txn: Transaction) {
    setEditingTransaction(txn);
    setIsModalOpen(true);
  }

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (t: Transaction) => format(new Date(t.date), 'MMM d, yyyy'),
    },
    {
      key: 'type',
      header: 'Type',
      render: (t: Transaction) => (
        <Badge color={typeColorMap[t.type]}>{t.type}</Badge>
      ),
    },
    { key: 'category', header: 'Category' },
    { key: 'description', header: 'Description' },
    {
      key: 'amount',
      header: 'Amount',
      render: (t: Transaction) => (
        <span className={t.type === 'expense' ? 'text-red-600' : 'text-green-600'}>
          {formatCurrency(t.amount)}
        </span>
      ),
    },
    {
      key: 'employee',
      header: 'Employee',
      render: (t: Transaction) =>
        t.employee ? `${t.employee.firstName} ${t.employee.lastName}` : '-',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (t: Transaction) => (
        <Button variant="ghost" size="sm" onClick={() => openEditModal(t)}>
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

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
        <Button onClick={openCreateModal}>Add Transaction</Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-sm text-gray-500">Total Income</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalIncome)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Profit</p>
            <p className={`text-2xl font-bold ${summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.profit)}
            </p>
          </Card>
        </div>
      )}

      {/* Filter Bar */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-48">
          <SearchInput value={search} onChange={handleSearch} placeholder="Search..." />
        </div>
        <div className="w-full sm:w-36">
          <Select
            options={[
              { label: 'Expense', value: 'expense' },
              { label: 'Sale', value: 'sale' },
              { label: 'Income', value: 'income' },
            ]}
            placeholder="All types"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
              updateUrlParam('type', e.target.value);
            }}
          />
        </div>
        <div className="w-full sm:w-44">
          <Input
            placeholder="Category"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
              updateUrlParam('category', e.target.value);
            }}
          />
        </div>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={(v) => {
            setStartDate(v);
            updateUrlParam('startDate', v);
          }}
          onEndDateChange={(v) => {
            setEndDate(v);
            updateUrlParam('endDate', v);
          }}
        />
      </div>

      {/* Transactions Table */}
      {data && data.data.length > 0 ? (
        <>
          <Table columns={columns} data={data.data} keyExtractor={(t) => t.id} />
          <div className="mt-4">
            <Pagination currentPage={data.page} totalPages={data.totalPages} onPageChange={setPage} />
          </div>
        </>
      ) : (
        <EmptyState
          title="No transactions found"
          description="Add your first transaction to start tracking finances."
          actionLabel="Add Transaction"
          onAction={openCreateModal}
        />
      )}

      {/* Charts Section */}
      {charts && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Revenue vs Expense Bar Chart */}
          {charts.revenueVsExpense.length > 0 && (
            <Card title="Revenue vs Expenses">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.revenueVsExpense}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                    <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Category Breakdown Pie Chart */}
          {charts.categoryBreakdown.length > 0 && (
            <Card title="Category Breakdown">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }: { name?: string; percent?: number }) =>
                        `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                    >
                      {charts.categoryBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Profit Trend Line Chart */}
          {charts.profitTrend.length > 0 && (
            <Card title="Profit Trend" className="lg:col-span-2">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.profitTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="profit" stroke="#3B82F6" name="Profit" strokeWidth={2} />
                    <Line type="monotone" dataKey="revenue" stroke="#10B981" name="Revenue" />
                    <Line type="monotone" dataKey="expenses" stroke="#EF4444" name="Expenses" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Create/Edit Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingTransaction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="transaction-form"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingTransaction ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Type"
            name="type"
            required
            options={[
              { label: 'Expense', value: 'expense' },
              { label: 'Sale', value: 'sale' },
              { label: 'Income', value: 'income' },
            ]}
            defaultValue={editingTransaction?.type}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={editingTransaction?.amount?.toString()}
            />
            <Input
              label="Category"
              name="category"
              required
              defaultValue={editingTransaction?.category}
            />
          </div>
          <Input
            label="Date"
            name="date"
            type="date"
            required
            defaultValue={editingTransaction?.date ? format(new Date(editingTransaction.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
          />
          <Input label="Description" name="description" defaultValue={editingTransaction?.description} />
        </form>
      </Modal>
    </div>
  );
}

export default function FinancePage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<Spinner size="lg" />}>
        <FinanceContent />
      </Suspense>
    </ProtectedRoute>
  );
}
