'use client';

import { FormEvent, useState } from 'react';
import { useParams } from 'next/navigation';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { format } from 'date-fns';

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import {
  useBoard,
  useCreateColumn,
  useDeleteColumn,
  useRenameColumn,
  useCreateCard,
  useUpdateCard,
  useMoveCard,
} from '@/hooks/useBoards';
import { useEmployees } from '@/hooks/useEmployees';

import type { Card as CardType } from '@/types';

function BoardDetailContent() {
  const params = useParams();
  const boardId = params.id as string;
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const { data: board, isLoading, error } = useBoard(boardId);
  const createColumnMutation = useCreateColumn(boardId);
  const deleteColumnMutation = useDeleteColumn(boardId);
  const renameColumnMutation = useRenameColumn(boardId);
  const createCardMutation = useCreateCard(boardId);
  const updateCardMutation = useUpdateCard(boardId);
  const moveCardMutation = useMoveCard(boardId);
  const { data: employeesData } = useEmployees({ limit: 100 });

  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [addCardColumnId, setAddCardColumnId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [editColumnId, setEditColumnId] = useState<string | null>(null);
  const [editColumnTitle, setEditColumnTitle] = useState('');
  const [cardAssignees, setCardAssignees] = useState<string[]>([]);

  function handleDragEnd(result: DropResult) {
    if (!result.destination || !board) return;

    const { draggableId, destination } = result;
    moveCardMutation.mutate({
      cardId: draggableId,
      dto: {
        columnId: destination.droppableId,
        order: destination.index,
      },
    });
  }

  async function handleAddColumn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createColumnMutation.mutateAsync({ title: formData.get('title') as string });
    setIsAddColumnOpen(false);
  }

  async function handleAddCard(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!addCardColumnId) return;
    const formData = new FormData(e.currentTarget);
    await createCardMutation.mutateAsync({
      columnId: addCardColumnId,
      dto: {
        title: formData.get('title') as string,
        description: (formData.get('description') as string) || undefined,
        dueDate: (formData.get('dueDate') as string) || undefined,
      },
    });
    setAddCardColumnId(null);
  }

  async function handleUpdateCard(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingCard) return;
    const formData = new FormData(e.currentTarget);
    await updateCardMutation.mutateAsync({
      columnId: editingCard.columnId,
      cardId: editingCard.id,
      dto: {
        title: formData.get('title') as string,
        description: (formData.get('description') as string) || undefined,
        dueDate: (formData.get('dueDate') as string) || undefined,
        assigneeIds: cardAssignees.length > 0 ? cardAssignees : undefined,
      },
    });
    setEditingCard(null);
  }

  function startEditColumn(columnId: string, currentTitle: string) {
    setEditColumnId(columnId);
    setEditColumnTitle(currentTitle);
  }

  function saveColumnTitle() {
    if (editColumnId && editColumnTitle.trim()) {
      renameColumnMutation.mutate({ columnId: editColumnId, title: editColumnTitle.trim() });
    }
    setEditColumnId(null);
  }

  function openCardDetail(card: CardType) {
    setEditingCard(card);
    setCardAssignees(card.assignees.map((a) => a.id));
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center text-red-700">
        Failed to load board. Please try again.
      </div>
    );
  }

  const sortedColumns = [...board.columns].sort((a, b) => a.order - b.order);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{board.title}</h1>
        {isAdmin && (
          <Button size="sm" onClick={() => setIsAddColumnOpen(true)}>
            Add Column
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4" style={{ minHeight: 400 }}>
            {sortedColumns.map((column) => {
              const sortedCards = [...column.cards].sort((a, b) => a.order - b.order);
              return (
                <div
                  key={column.id}
                  className="flex w-72 flex-shrink-0 flex-col rounded-xl bg-gray-100"
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between px-3 py-2.5">
                    {editColumnId === column.id ? (
                      <input
                        autoFocus
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm font-semibold"
                        value={editColumnTitle}
                        onChange={(e) => setEditColumnTitle(e.target.value)}
                        onBlur={saveColumnTitle}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveColumnTitle();
                          if (e.key === 'Escape') setEditColumnId(null);
                        }}
                      />
                    ) : (
                      <h3
                        className={`text-sm font-semibold text-gray-700 ${isAdmin ? 'cursor-pointer' : ''}`}
                        onDoubleClick={() =>
                          isAdmin && startEditColumn(column.id, column.title)
                        }
                      >
                        {column.title}{' '}
                        <span className="font-normal text-gray-400">({sortedCards.length})</span>
                      </h3>
                    )}
                    {isAdmin && editColumnId !== column.id && (
                      <button
                        onClick={() => {
                          if (confirm('Delete this column and all its cards?')) {
                            deleteColumnMutation.mutate(column.id);
                          }
                        }}
                        className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-red-500"
                        aria-label="Delete column"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Cards droppable area */}
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 space-y-2 px-2 pb-2 ${
                          snapshot.isDraggingOver ? 'bg-blue-50' : ''
                        }`}
                        style={{ minHeight: 40 }}
                      >
                        {sortedCards.map((card, index) => (
                          <Draggable key={card.id} draggableId={card.id} index={index}>
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                className={`cursor-pointer rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow ${
                                  dragSnapshot.isDragging ? 'shadow-lg ring-2 ring-blue-300' : 'border-gray-200'
                                }`}
                                onClick={() => openCardDetail(card)}
                              >
                                <p className="text-sm font-medium text-gray-900">{card.title}</p>
                                <div className="mt-2 flex items-center justify-between">
                                  {card.dueDate && (
                                    <span className="text-xs text-gray-500">
                                      {format(new Date(card.dueDate), 'MMM d')}
                                    </span>
                                  )}
                                  {card.assignees.length > 0 && (
                                    <div className="flex -space-x-1">
                                      {card.assignees.slice(0, 2).map((a) => (
                                        <Avatar
                                          key={a.id}
                                          name={`${a.firstName} ${a.lastName}`}
                                          size="sm"
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  {/* Add card button */}
                  <button
                    onClick={() => setAddCardColumnId(column.id)}
                    className="m-2 rounded-lg py-1.5 text-sm text-gray-500 hover:bg-gray-200"
                  >
                    + Add Card
                  </button>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Add Column Modal */}
      <Modal
        isOpen={isAddColumnOpen}
        onClose={() => setIsAddColumnOpen(false)}
        title="Add Column"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddColumnOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="add-column-form" isLoading={createColumnMutation.isPending}>
              Add
            </Button>
          </>
        }
      >
        <form id="add-column-form" onSubmit={handleAddColumn}>
          <Input label="Column Title" name="title" required placeholder="e.g. In Review" />
        </form>
      </Modal>

      {/* Add Card Modal */}
      <Modal
        isOpen={!!addCardColumnId}
        onClose={() => setAddCardColumnId(null)}
        title="Add Card"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddCardColumnId(null)}>
              Cancel
            </Button>
            <Button type="submit" form="add-card-form" isLoading={createCardMutation.isPending}>
              Add
            </Button>
          </>
        }
      >
        <form id="add-card-form" onSubmit={handleAddCard} className="space-y-4">
          <Input label="Title" name="title" required />
          <Input label="Description" name="description" />
          <Input label="Due Date" name="dueDate" type="date" />
        </form>
      </Modal>

      {/* Edit Card Detail Modal */}
      <Modal
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        title="Card Details"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingCard(null)}>
              Cancel
            </Button>
            <Button type="submit" form="edit-card-form" isLoading={updateCardMutation.isPending}>
              Save
            </Button>
          </>
        }
      >
        <form id="edit-card-form" onSubmit={handleUpdateCard} className="space-y-4">
          <Input label="Title" name="title" required defaultValue={editingCard?.title} />
          <Input label="Description" name="description" defaultValue={editingCard?.description} />
          <Input
            label="Due Date"
            name="dueDate"
            type="date"
            defaultValue={editingCard?.dueDate ? format(new Date(editingCard.dueDate), 'yyyy-MM-dd') : ''}
          />
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
                    checked={cardAssignees.includes(emp.id)}
                    onChange={() =>
                      setCardAssignees((prev) =>
                        prev.includes(emp.id)
                          ? prev.filter((id) => id !== emp.id)
                          : [...prev, emp.id],
                      )
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    {emp.firstName} {emp.lastName}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function BoardDetailPage() {
  return (
    <ProtectedRoute>
      <BoardDetailContent />
    </ProtectedRoute>
  );
}
