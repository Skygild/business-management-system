import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  ForbiddenException,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrgsService } from './orgs.service';
import { UpdateOrgDto } from './dto/update-org.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orgs')
export class OrgsController {
  constructor(private readonly orgsService: OrgsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current user organization' })
  findCurrent(@CurrentUser() user: JwtPayload) {
    return this.orgsService.findById(user.org);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update own organization (admin only)' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateOrgDto: UpdateOrgDto,
  ) {
    if (id !== user.org) {
      throw new ForbiddenException('You can only update your own organization');
    }
    return this.orgsService.update(id, updateOrgDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete own organization (admin only)' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    if (id !== user.org) {
      throw new ForbiddenException('You can only delete your own organization');
    }
    return this.orgsService.remove(id);
  }
}
