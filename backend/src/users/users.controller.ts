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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new user (admin only)' })
  create(@CurrentUser() user: JwtPayload, @Body() createUserDto: CreateUserDto) {
    return this.usersService.create({ ...createUserDto, org: user.org });
  }

  @Get()
  @ApiOperation({ summary: 'List all users in the organization' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.usersService.findAllByOrg(user.org);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.findById(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.usersService.findByIdInOrg(id, user.org);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a user (admin only)' })
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateInOrg(id, user.org, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a user (admin only)' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.usersService.removeFromOrg(id, user.org);
  }
}
