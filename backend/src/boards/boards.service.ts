import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Board, BoardDocument } from './schemas/board.schema';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { CreateColumnDto } from './dto/column.dto';
import { UpdateColumnDto } from './dto/column.dto';
import { CreateCardDto } from './dto/card.dto';
import { UpdateCardDto } from './dto/card.dto';
import { MoveCardDto } from './dto/card.dto';

@Injectable()
export class BoardsService {
  constructor(
    @InjectModel(Board.name) private readonly boardModel: Model<BoardDocument>,
  ) {}

  // --- Board CRUD ---

  async create(orgId: string, createDto: CreateBoardDto): Promise<BoardDocument> {
    return this.boardModel.create({
      ...createDto,
      task: createDto.task ? new Types.ObjectId(createDto.task) : undefined,
      org: new Types.ObjectId(orgId),
    } as any);
  }

  async findAll(orgId: string): Promise<BoardDocument[]> {
    return this.boardModel
      .find({ org: new Types.ObjectId(orgId) } as any)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(orgId: string, id: string): Promise<BoardDocument> {
    const board = await this.boardModel
      .findOne({
        _id: new Types.ObjectId(id),
        org: new Types.ObjectId(orgId),
      } as any)
      .exec();
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    return board;
  }

  async update(
    orgId: string,
    id: string,
    updateDto: UpdateBoardDto,
  ): Promise<BoardDocument> {
    const board = await this.boardModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          org: new Types.ObjectId(orgId),
        } as any,
        updateDto,
        { new: true },
      )
      .exec();
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    return board;
  }

  async remove(orgId: string, id: string): Promise<void> {
    const result = await this.boardModel
      .findOneAndDelete({
        _id: new Types.ObjectId(id),
        org: new Types.ObjectId(orgId),
      } as any)
      .exec();
    if (!result) {
      throw new NotFoundException('Board not found');
    }
  }

  // --- Column operations ---

  async addColumn(
    orgId: string,
    boardId: string,
    createColumnDto: CreateColumnDto,
  ): Promise<BoardDocument> {
    const board = await this.findById(orgId, boardId);
    const column = {
      _id: new Types.ObjectId(),
      name: createColumnDto.name,
      order: createColumnDto.order ?? board.columns.length,
      cards: [],
    };
    board.columns.push(column as any);
    return board.save();
  }

  async updateColumn(
    orgId: string,
    boardId: string,
    columnId: string,
    updateColumnDto: UpdateColumnDto,
  ): Promise<BoardDocument> {
    const board = await this.findById(orgId, boardId);
    const column = board.columns.find((c) => c._id.toString() === columnId);
    if (!column) {
      throw new NotFoundException('Column not found');
    }
    if (updateColumnDto.name !== undefined) column.name = updateColumnDto.name;
    if (updateColumnDto.order !== undefined) column.order = updateColumnDto.order;
    return board.save();
  }

  async removeColumn(
    orgId: string,
    boardId: string,
    columnId: string,
  ): Promise<BoardDocument> {
    const board = await this.findById(orgId, boardId);
    const index = board.columns.findIndex((c) => c._id.toString() === columnId);
    if (index === -1) {
      throw new NotFoundException('Column not found');
    }
    board.columns.splice(index, 1);
    return board.save();
  }

  // --- Card operations ---

  async addCard(
    orgId: string,
    boardId: string,
    columnId: string,
    createCardDto: CreateCardDto,
  ): Promise<BoardDocument> {
    const board = await this.findById(orgId, boardId);
    const column = board.columns.find((c) => c._id.toString() === columnId);
    if (!column) {
      throw new NotFoundException('Column not found');
    }
    const card = {
      _id: new Types.ObjectId(),
      title: createCardDto.title,
      description: createCardDto.description,
      dueDate: createCardDto.dueDate ? new Date(createCardDto.dueDate) : undefined,
      assignees: createCardDto.assignees?.map((a) => new Types.ObjectId(a)) ?? [],
      order: createCardDto.order ?? column.cards.length,
    };
    column.cards.push(card as any);
    return board.save();
  }

  async updateCard(
    orgId: string,
    boardId: string,
    columnId: string,
    cardId: string,
    updateCardDto: UpdateCardDto,
  ): Promise<BoardDocument> {
    const board = await this.findById(orgId, boardId);
    const column = board.columns.find((c) => c._id.toString() === columnId);
    if (!column) {
      throw new NotFoundException('Column not found');
    }
    const card = column.cards.find((c) => c._id.toString() === cardId);
    if (!card) {
      throw new NotFoundException('Card not found');
    }
    if (updateCardDto.title !== undefined) card.title = updateCardDto.title;
    if (updateCardDto.description !== undefined) card.description = updateCardDto.description;
    if (updateCardDto.dueDate !== undefined) card.dueDate = new Date(updateCardDto.dueDate);
    if (updateCardDto.assignees !== undefined)
      card.assignees = updateCardDto.assignees.map((a) => new Types.ObjectId(a)) as any;
    if (updateCardDto.order !== undefined) card.order = updateCardDto.order;
    return board.save();
  }

  async removeCard(
    orgId: string,
    boardId: string,
    columnId: string,
    cardId: string,
  ): Promise<BoardDocument> {
    const board = await this.findById(orgId, boardId);
    const column = board.columns.find((c) => c._id.toString() === columnId);
    if (!column) {
      throw new NotFoundException('Column not found');
    }
    const cardIndex = column.cards.findIndex((c) => c._id.toString() === cardId);
    if (cardIndex === -1) {
      throw new NotFoundException('Card not found');
    }
    column.cards.splice(cardIndex, 1);
    return board.save();
  }

  async moveCard(
    orgId: string,
    boardId: string,
    cardId: string,
    moveCardDto: MoveCardDto,
  ): Promise<BoardDocument> {
    const board = await this.findById(orgId, boardId);

    let sourceColumn = null;
    let card = null;
    let sourceCardIndex = -1;

    for (const col of board.columns) {
      const idx = col.cards.findIndex((c) => c._id.toString() === cardId);
      if (idx !== -1) {
        sourceColumn = col;
        card = col.cards[idx];
        sourceCardIndex = idx;
        break;
      }
    }

    if (!sourceColumn || !card) {
      throw new NotFoundException('Card not found on this board');
    }

    const targetColumn = board.columns.find(
      (c) => c._id.toString() === moveCardDto.targetColumnId,
    );
    if (!targetColumn) {
      throw new NotFoundException('Target column not found');
    }

    sourceColumn.cards.splice(sourceCardIndex, 1);
    card.order = moveCardDto.newOrder;
    targetColumn.cards.splice(moveCardDto.newOrder, 0, card);

    return board.save();
  }
}
