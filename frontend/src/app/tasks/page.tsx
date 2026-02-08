'use client';

import { FormEvent, useCallback, useState } from 'react';
import { format } from 'date-fns';

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
import { Avatar } from '@/components/ui/Avatar';
import { useTasks, useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { useEmployees } from '@/hooks/useEmployees';

import type { Task, TaskStatus, TaskPriority } from '@/types';

const statusColorMap: Record<TaskStatus, 'gray' | 'blue' | 'green' | 'red'> = {
  todo: 'gray',
  in_progress: 'blue',
  completed: 'green',
  cancelled: 'red',
};

const statusLabelMap: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const priorityColorMap: Record<TaskPriority, 'gray' | 'blue' | 'yellow'> = {
  low: 'gray',
  medium: 'blue',
  high: 'yellow',
};

function TasksContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  const { data, isLoading, error } = useTasks({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  });

  const { data: employeesData } = useEmployees({ limit: 100 });
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  function openCreateModal() {
    setEditingTask(null);
    setSelectedAssignees([]);
    setIsModalOpen(true);
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setSelectedAssignees(task.assignees.map((a) => a.id));
    setIsModalOpen(true);
  }

  function toggleAssignee(id: string) {
    setSelectedAssignees((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dto = {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || undefined,
      dueDate: (formData.get('dueDate') as string) || undefined,
      status: (formData.get('status') as TaskStatus) || undefined,
      priority: (formData.get('priority') as TaskPriority) || undefined,
      assigneeIds: selectedAssignees.length > 0 ? selectedAssignees : undefined,
    };

    if (editingTask) {
      await updateMutation.mutateAsync({ id: editingTask.id, dto });
    } else {
      await createMutation.mutateAsync(dto);
    }
    setIsModalOpen(false);
    setEditingTask(null);
  }

  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (t: Task) => <span className="font-medium text-gray-900">{t.title}</span>,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (t: Task) => (t.dueDate ? format(new Date(t.dueDate), 'MMM d, yyyy') : '-'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (t: Task) => (
        <Badge color={statusColorMap[t.status]}>{statusLabelMap[t.status]}</Badge>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (t: Task) => (
        <Badge color={priorityColorMap[t.priority]}>{t.priority}</Badge>
      ),
    },
    {
      key: 'assignees',
      header: 'Assignees',
      render: (t: Task) => (
        <div className="flex -space-x-1">
          {t.assignees.slice(0, 3).map((a) => (
            <Avatar key={a.id} name={`${a.firstName} ${a.lastName}`} size="sm" />
          ))}
          {t.assignees.length > 3 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
              +{t.assignees.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (t: Task) => (
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

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center text-red-700">
        Failed to load tasks. Please try again.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <Button onClick={openCreateModal}>Create Task</Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-full sm:w-48">
          <SearchInput value={search} onChange={handleSearch} placeholder="Search tasks..." />
        </div>
        <div className="w-full sm:w-36">
          <Select
            options={[
              { label: 'To Do', value: 'todo' },
              { label: 'In Progress', value: 'in_progress' },
              { label: 'Completed', value: 'completed' },
              { label: 'Cancelled', value: 'cancelled' },
            ]}
            placeholder="All statuses"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full sm:w-36">
          <Select
            options={[
              { label: 'Low', value: 'low' },
              { label: 'Medium', value: 'medium' },
              { label: 'High', value: 'high' },
            ]}
            placeholder="All priorities"
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {data && data.data.length > 0 ? (
        <>
          <Table columns={columns} data={data.data} keyExtractor={(t) => t.id} />
          <div className="mt-4">
            <Pagination currentPage={data.page} totalPages={data.totalPages} onPageChange={setPage} />
          </div>
        </>
      ) : (
        <EmptyState
          title="No tasks found"
          description="Create your first task to start managing work."
          actionLabel="Create Task"
          onAction={openCreateModal}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        title={editingTask ? 'Edit Task' : 'Create Task'}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingTask(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="task-form"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingTask ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" name="title" required defaultValue={editingTask?.title} />
          <Input label="Description" name="description" defaultValue={editingTask?.description} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Due Date"
              name="dueDate"
              type="date"
              defaultValue={editingTask?.dueDate ? format(new Date(editingTask.dueDate), 'yyyy-MM-dd') : ''}
            />
            <Select
              label="Status"
              name="status"
              options={[
                { label: 'To Do', value: 'todo' },
                { label: 'In Progress', value: 'in_progress' },
                { label: 'Completed', value: 'completed' },
                { label: 'Cancelled', value: 'cancelled' },
              ]}
              defaultValue={editingTask?.status ?? 'todo'}
            />
            <Select
              label="Priority"
              name="priority"
              options={[
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' },
              ]}
              defaultValue={editingTask?.priority ?? 'medium'}
            />
          </div>

          {/* Assignee multi-select */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Assignees</label>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-300 p-2">
              {employeesData?.data.map((emp) => (
                <label
                  key={emp.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedAssignees.includes(emp.id)}
                    onChange={() => toggleAssignee(emp.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    {emp.firstName} {emp.lastName}
                  </span>
                </label>
              ))}
              {(!employeesData || employeesData.data.length === 0) && (
                <p className="py-2 text-center text-sm text-gray-400">No employees available</p>
              )}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function TasksPage() {
  return (
    <ProtectedRoute>
      <TasksContent />
    </ProtectedRoute>
  );
}
