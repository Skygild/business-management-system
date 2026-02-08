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
import { useEmployees, useCreateEmployee, useUpdateEmployee } from '@/hooks/useEmployees';

import type { Employee, CreateEmployeeDto } from '@/types';

function EmployeesContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const { data, isLoading, error } = useEmployees({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  function openCreateModal() {
    setEditingEmployee(null);
    setIsModalOpen(true);
  }

  function openEditModal(employee: Employee) {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  }

  function handleToggleStatus(employee: Employee) {
    updateMutation.mutate({
      id: employee.id,
      dto: { status: employee.status === 'active' ? 'inactive' : 'active' },
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dto: CreateEmployeeDto = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      position: formData.get('position') as string,
      department: formData.get('department') as string,
      phone: (formData.get('phone') as string) || undefined,
    };

    if (editingEmployee) {
      await updateMutation.mutateAsync({ id: editingEmployee.id, dto });
    } else {
      await createMutation.mutateAsync(dto);
    }
    setIsModalOpen(false);
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (emp: Employee) => (
        <span className="font-medium text-gray-900">{emp.firstName} {emp.lastName}</span>
      ),
    },
    { key: 'email', header: 'Email' },
    { key: 'position', header: 'Position' },
    { key: 'department', header: 'Department' },
    {
      key: 'status',
      header: 'Status',
      render: (emp: Employee) => (
        <Badge color={emp.status === 'active' ? 'green' : 'gray'}>
          {emp.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (emp: Employee) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEditModal(emp)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(emp)}
          >
            {emp.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
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
        Failed to load employees. Please try again.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <Button onClick={openCreateModal}>Add Employee</Button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-xs">
          <SearchInput value={search} onChange={handleSearch} placeholder="Search employees..." />
        </div>
        <div className="w-full sm:w-40">
          <Select
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
            placeholder="All statuses"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {data && data.data.length > 0 ? (
        <>
          <Table columns={columns} data={data.data} keyExtractor={(e) => e.id} />
          <div className="mt-4">
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      ) : (
        <EmptyState
          title="No employees found"
          description="Get started by adding your first employee."
          actionLabel="Add Employee"
          onAction={openCreateModal}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="employee-form"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingEmployee ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form id="employee-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First Name"
              name="firstName"
              required
              defaultValue={editingEmployee?.firstName}
            />
            <Input
              label="Last Name"
              name="lastName"
              required
              defaultValue={editingEmployee?.lastName}
            />
          </div>
          <Input
            label="Email"
            name="email"
            type="email"
            required
            defaultValue={editingEmployee?.email}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Position"
              name="position"
              required
              defaultValue={editingEmployee?.position}
            />
            <Input
              label="Department"
              name="department"
              required
              defaultValue={editingEmployee?.department}
            />
          </div>
          <Input
            label="Phone"
            name="phone"
            type="tel"
            defaultValue={editingEmployee?.phone}
          />
        </form>
      </Modal>
    </div>
  );
}

export default function EmployeesPage() {
  return (
    <ProtectedRoute>
      <EmployeesContent />
    </ProtectedRoute>
  );
}
