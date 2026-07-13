import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PipelineStagesService } from './pipeline-stages.service';
import { CurrentOrganization } from '../../shared/decorators/current-user.decorator';
import { CheckPermission } from '../../shared/decorators/check-permission.decorator';
import { PermissionGuard } from '../../auth/guards/permission.guard';

@Controller('admin/pipeline-stages')
@UseGuards(PermissionGuard)
export class PipelineStagesController {
  constructor(private pipelineStagesService: PipelineStagesService) {}

  @Get()
  @CheckPermission('config_admin', 'manage')
  findAll(@CurrentOrganization() organizationId: string) {
    return this.pipelineStagesService.findAll(organizationId);
  }

  @Get(':id')
  @CheckPermission('config_admin', 'manage')
  findOne(
    @CurrentOrganization() organizationId: string,
    @Param('id') stageId: string,
  ) {
    return this.pipelineStagesService.findOne(organizationId, stageId);
  }

  @Post()
  @CheckPermission('config_admin', 'manage')
  create(
    @CurrentOrganization() organizationId: string,
    @Body() data: { name: string; order: number; isTerminal?: boolean },
  ) {
    return this.pipelineStagesService.create(organizationId, data);
  }

  @Patch(':id')
  @CheckPermission('config_admin', 'manage')
  update(
    @CurrentOrganization() organizationId: string,
    @Param('id') stageId: string,
    @Body() data: { name?: string; order?: number; isTerminal?: boolean },
  ) {
    return this.pipelineStagesService.update(organizationId, stageId, data);
  }

  @Delete(':id')
  @CheckPermission('config_admin', 'manage')
  remove(
    @CurrentOrganization() organizationId: string,
    @Param('id') stageId: string,
  ) {
    return this.pipelineStagesService.remove(organizationId, stageId);
  }
}
