import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { CreateColumnDto } from './dto/column.dto';
import { UpdateColumnDto } from './dto/column.dto';
import { CreateCardDto } from './dto/card.dto';
import { UpdateCardDto } from './dto/card.dto';
import { MoveCardDto } from './dto/card.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Boards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  // --- Board CRUD ---

  @Post()
  @ApiOperation({ summary: 'Create a new board' })
  create(@CurrentUser() user: JwtPayload, @Body() createDto: CreateBoardDto) {
    return this.boardsService.create(user.org, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all boards' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.boardsService.findAll(user.org);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a board by ID' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.boardsService.findById(user.org, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a board' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateDto: UpdateBoardDto,
  ) {
    return this.boardsService.update(user.org, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a board' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.boardsService.remove(user.org, id);
  }

  // --- Column operations ---

  @Post(':id/columns')
  @ApiOperation({ summary: 'Add a column to a board' })
  addColumn(
    @CurrentUser() user: JwtPayload,
    @Param('id') boardId: string,
    @Body() createColumnDto: CreateColumnDto,
  ) {
    return this.boardsService.addColumn(user.org, boardId, createColumnDto);
  }

  @Patch(':id/columns/:columnId')
  @ApiOperation({ summary: 'Update a column' })
  updateColumn(
    @CurrentUser() user: JwtPayload,
    @Param('id') boardId: string,
    @Param('columnId') columnId: string,
    @Body() updateColumnDto: UpdateColumnDto,
  ) {
    return this.boardsService.updateColumn(user.org, boardId, columnId, updateColumnDto);
  }

  @Delete(':id/columns/:columnId')
  @ApiOperation({ summary: 'Delete a column' })
  removeColumn(
    @CurrentUser() user: JwtPayload,
    @Param('id') boardId: string,
    @Param('columnId') columnId: string,
  ) {
    return this.boardsService.removeColumn(user.org, boardId, columnId);
  }

  // --- Card operations ---

  @Post(':id/columns/:columnId/cards')
  @ApiOperation({ summary: 'Add a card to a column' })
  addCard(
    @CurrentUser() user: JwtPayload,
    @Param('id') boardId: string,
    @Param('columnId') columnId: string,
    @Body() createCardDto: CreateCardDto,
  ) {
    return this.boardsService.addCard(user.org, boardId, columnId, createCardDto);
  }

  @Patch(':id/columns/:columnId/cards/:cardId')
  @ApiOperation({ summary: 'Update a card' })
  updateCard(
    @CurrentUser() user: JwtPayload,
    @Param('id') boardId: string,
    @Param('columnId') columnId: string,
    @Param('cardId') cardId: string,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    return this.boardsService.updateCard(user.org, boardId, columnId, cardId, updateCardDto);
  }

  @Delete(':id/columns/:columnId/cards/:cardId')
  @ApiOperation({ summary: 'Delete a card' })
  removeCard(
    @CurrentUser() user: JwtPayload,
    @Param('id') boardId: string,
    @Param('columnId') columnId: string,
    @Param('cardId') cardId: string,
  ) {
    return this.boardsService.removeCard(user.org, boardId, columnId, cardId);
  }

  @Patch(':id/cards/:cardId/move')
  @ApiOperation({ summary: 'Move a card between columns' })
  moveCard(
    @CurrentUser() user: JwtPayload,
    @Param('id') boardId: string,
    @Param('cardId') cardId: string,
    @Body() moveCardDto: MoveCardDto,
  ) {
    return this.boardsService.moveCard(user.org, boardId, cardId, moveCardDto);
  }
}
