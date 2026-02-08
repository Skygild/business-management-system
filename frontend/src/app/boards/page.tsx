'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useBoards, useCreateBoard } from '@/hooks/useBoards';

function BoardsContent() {
  const { data: boards, isLoading, error } = useBoards();
  const createMutation = useCreateBoard();
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createMutation.mutateAsync({ title: formData.get('title') as string });
    setIsModalOpen(false);
  }

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
        Failed to load boards. Please try again.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Boards</h1>
        <Button onClick={() => setIsModalOpen(true)}>Create Board</Button>
      </div>

      {boards && boards.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <Link key={board.id} href={`/boards/${board.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{board.title}</h3>
                    <p className="text-sm text-gray-500">{board.columns.length} columns</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No boards yet"
          description="Create your first Kanban board to organize work visually."
          actionLabel="Create Board"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Board"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="board-form" isLoading={createMutation.isPending}>
              Create
            </Button>
          </>
        }
      >
        <form id="board-form" onSubmit={handleCreate}>
          <Input label="Board Title" name="title" required placeholder="e.g. Sprint Board" />
        </form>
      </Modal>
    </div>
  );
}

export default function BoardsPage() {
  return (
    <ProtectedRoute>
      <BoardsContent />
    </ProtectedRoute>
  );
}
