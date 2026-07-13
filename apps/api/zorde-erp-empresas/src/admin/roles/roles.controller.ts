import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CurrentOrganization } from '../../shared/decorators/current-user.decorator';
import { CheckPermission } from '../../shared/decorators/check-permission.decorator';
import { PermissionGuard } from '../../auth/guards/permission.guard';

@Controller('admin/roles')
@UseGuards(PermissionGuard)
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @CheckPermission('config_admin', 'manage')
  findAll(@CurrentOrganization() organizationId: string) {
    return this.rolesService.findAll(organizationId);
  }

  @Get(':id')
  @CheckPermission('config_admin', 'manage')
  findOne(
    @CurrentOrganization() organizationId: string,
    @Param('id') roleId: string,
  ) {
    return this.rolesService.findOne(organizationId, roleId);
  }

  @Post()
  @CheckPermission('config_admin', 'manage')
  create(
    @CurrentOrganization() organizationId: string,
    @Body() data: { name: string; description?: string },
  ) {
    return this.rolesService.create(organizationId, data);
  }

  @Post(':roleId/permissions/:permissionId')
  @CheckPermission('config_admin', 'manage')
  addPermission(
    @CurrentOrganization() organizationId: string,
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rolesService.addPermission(organizationId, roleId, permissionId);
  }

  @Delete(':roleId/permissions/:permissionId')
  @CheckPermission('config_admin', 'manage')
  removePermission(
    @CurrentOrganization() organizationId: string,
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rolesService.removePermission(organizationId, roleId, permissionId);
  }
}
