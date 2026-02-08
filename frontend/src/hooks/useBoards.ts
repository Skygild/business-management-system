import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { queryKeys } from '@/lib/query-keys';
import { boardsService } from '@/services/boards.service';

import type {
  Board,
  CreateBoardDto,
  CreateCardDto,
  CreateColumnDto,
  MoveCardDto,
  UpdateCardDto,
} from '@/types';

export function useBoards() {
  return useQuery({
    queryKey: queryKeys.boards.list,
    queryFn: () => boardsService.getAll(),
  });
}

export function useBoard(id: string) {
  return useQuery({
    queryKey: queryKeys.boards.detail(id),
    queryFn: () => boardsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateBoardDto) => boardsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.all });
      toast.success('Board created successfully');
    },
    onError: () => {
      toast.error('Failed to create board');
    },
  });
}

export function useCreateColumn(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateColumnDto) => boardsService.createColumn(boardId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.detail(boardId) });
      toast.success('Column created');
    },
    onError: () => {
      toast.error('Failed to create column');
    },
  });
}

export function useDeleteColumn(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (columnId: string) => boardsService.deleteColumn(boardId, columnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.detail(boardId) });
      toast.success('Column deleted');
    },
    onError: () => {
      toast.error('Failed to delete column');
    },
  });
}

export function useRenameColumn(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ columnId, title }: { columnId: string; title: string }) =>
      boardsService.renameColumn(boardId, columnId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.detail(boardId) });
    },
    onError: () => {
      toast.error('Failed to rename column');
    },
  });
}

export function useCreateCard(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ columnId, dto }: { columnId: string; dto: CreateCardDto }) =>
      boardsService.createCard(boardId, columnId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.detail(boardId) });
      toast.success('Card created');
    },
    onError: () => {
      toast.error('Failed to create card');
    },
  });
}

export function useUpdateCard(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ columnId, cardId, dto }: { columnId: string; cardId: string; dto: UpdateCardDto }) =>
      boardsService.updateCard(boardId, columnId, cardId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.detail(boardId) });
    },
    onError: () => {
      toast.error('Failed to update card');
    },
  });
}

export function useMoveCard(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, dto }: { cardId: string; dto: MoveCardDto }) =>
      boardsService.moveCard(boardId, cardId, dto),
    onMutate: async ({ cardId, dto }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.boards.detail(boardId) });
      const previousBoard = queryClient.getQueryData<Board>(queryKeys.boards.detail(boardId));

      if (previousBoard) {
        const newBoard = structuredClone(previousBoard);

        // Find and remove card from source column
        let movedCard = null;
        for (const col of newBoard.columns) {
          const cardIndex = col.cards.findIndex((c) => c.id === cardId);
          if (cardIndex !== -1) {
            movedCard = col.cards.splice(cardIndex, 1)[0];
            break;
          }
        }

        // Add card to target column
        if (movedCard) {
          const targetCol = newBoard.columns.find((c) => c.id === dto.columnId);
          if (targetCol) {
            movedCard.columnId = dto.columnId;
            movedCard.order = dto.order;
            targetCol.cards.splice(dto.order, 0, movedCard);
          }
        }

        queryClient.setQueryData(queryKeys.boards.detail(boardId), newBoard);
      }

      return { previousBoard };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(queryKeys.boards.detail(boardId), context.previousBoard);
      }
      toast.error('Failed to move card');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.detail(boardId) });
    },
  });
}
