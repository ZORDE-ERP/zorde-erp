import { Module } from '@nestjs/common';
import { DatabaseModule } from '../infra/database/database.module';
import { RolesController } from './roles/roles.controller';
import { RolesService } from './roles/roles.service';
import { PipelineStagesController } from './pipeline/pipeline-stages.controller';
import { PipelineStagesService } from './pipeline/pipeline-stages.service';

@Module({
  imports: [DatabaseModule],
  controllers: [RolesController, PipelineStagesController],
  providers: [RolesService, PipelineStagesService],
  exports: [RolesService, PipelineStagesService],
})
export class AdminModule {}

