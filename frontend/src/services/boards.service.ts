import { apiClient } from '@/lib/api-client';

import type {
  Board,
  Card,
  Column,
  CreateBoardDto,
  CreateCardDto,
  CreateColumnDto,
  MoveCardDto,
  UpdateCardDto,
} from '@/types';

interface RawCard {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  assignees?: Array<{ _id: string; firstName: string; lastName: string }>;
  order: number;
}

interface RawColumn {
  _id: string;
  name: string;
  order: number;
  cards: RawCard[];
}

interface RawBoard {
  _id: string;
  name: string;
  columns: RawColumn[];
  createdAt?: string;
  updatedAt?: string;
}

function normalizeCard(card: RawCard, columnId: string): Card {
  return {
    id: card._id,
    title: card.title,
    description: card.description,
    dueDate: card.dueDate,
    assignees: (card.assignees ?? []).map((a) => ({
      id: a._id,
      firstName: a.firstName,
      lastName: a.lastName,
      email: '',
      position: '',
      department: '',
      status: 'active' as const,
    })),
    order: card.order,
    columnId,
  };
}

function normalizeColumn(col: RawColumn): Column {
  return {
    id: col._id,
    title: col.name,
    order: col.order,
    cards: col.cards.map((c) => normalizeCard(c, col._id)),
  };
}

function normalizeBoard(board: RawBoard): Board {
  return {
    id: board._id,
    title: board.name,
    columns: board.columns.map(normalizeColumn),
    createdAt: board.createdAt,
    updatedAt: board.updatedAt,
  };
}

export const boardsService = {
  async getAll(): Promise<Board[]> {
    const { data } = await apiClient.get<RawBoard[]>('/boards');
    return data.map(normalizeBoard);
  },

  async getById(id: string): Promise<Board> {
    const { data } = await apiClient.get<RawBoard>(`/boards/${id}`);
    return normalizeBoard(data);
  },

  async create(dto: CreateBoardDto): Promise<Board> {
    const { data } = await apiClient.post<RawBoard>('/boards', { name: dto.title });
    return normalizeBoard(data);
  },

  async createColumn(boardId: string, dto: CreateColumnDto): Promise<Board> {
    const { data } = await apiClient.post<RawBoard>(`/boards/${boardId}/columns`, { name: dto.title });
    return normalizeBoard(data);
  },

  async deleteColumn(boardId: string, columnId: string): Promise<void> {
    await apiClient.delete(`/boards/${boardId}/columns/${columnId}`);
  },

  async renameColumn(boardId: string, columnId: string, title: string): Promise<Board> {
    const { data } = await apiClient.patch<RawBoard>(`/boards/${boardId}/columns/${columnId}`, { name: title });
    return normalizeBoard(data);
  },

  async createCard(boardId: string, columnId: string, dto: CreateCardDto): Promise<Board> {
    const payload: Record<string, unknown> = { title: dto.title };
    if (dto.description) payload.description = dto.description;
    if (dto.dueDate) payload.dueDate = dto.dueDate;
    if (dto.assigneeIds) payload.assignees = dto.assigneeIds;
    const { data } = await apiClient.post<RawBoard>(
      `/boards/${boardId}/columns/${columnId}/cards`,
      payload,
    );
    return normalizeBoard(data);
  },

  async updateCard(boardId: string, columnId: string, cardId: string, dto: UpdateCardDto): Promise<Board> {
    const payload: Record<string, unknown> = {};
    if (dto.title !== undefined) payload.title = dto.title;
    if (dto.description !== undefined) payload.description = dto.description;
    if (dto.dueDate !== undefined) payload.dueDate = dto.dueDate;
    if (dto.assigneeIds !== undefined) payload.assignees = dto.assigneeIds;
    if (dto.order !== undefined) payload.order = dto.order;
    const { data } = await apiClient.patch<RawBoard>(
      `/boards/${boardId}/columns/${columnId}/cards/${cardId}`,
      payload,
    );
    return normalizeBoard(data);
  },

  async moveCard(boardId: string, cardId: string, dto: MoveCardDto): Promise<Board> {
    const { data } = await apiClient.patch<RawBoard>(`/boards/${boardId}/cards/${cardId}/move`, {
      targetColumnId: dto.columnId,
      newOrder: dto.order,
    });
    return normalizeBoard(data);
  },
};
