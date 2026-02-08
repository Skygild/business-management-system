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
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  create(@CurrentUser() user: JwtPayload, @Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(user.org, createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'List employees with pagination, search, and filters' })
  findAll(@CurrentUser() user: JwtPayload, @Query() query: QueryEmployeeDto) {
    return this.employeesService.findAll(user.org, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an employee by ID' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.employeesService.findById(user.org, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an employee' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(user.org, id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an employee (set status to inactive)' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.employeesService.remove(user.org, id);
  }
}
