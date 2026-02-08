import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  create(@CurrentUser() user: JwtPayload, @Body() createDto: CreateTaskDto) {
    return this.tasksService.create(user.org, user.sub, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'List tasks with pagination and filters' })
  findAll(@CurrentUser() user: JwtPayload, @Query() query: QueryTaskDto) {
    return this.tasksService.findAll(user.org, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.tasksService.findById(user.org, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(user.org, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.tasksService.remove(user.org, id);
  }
}
