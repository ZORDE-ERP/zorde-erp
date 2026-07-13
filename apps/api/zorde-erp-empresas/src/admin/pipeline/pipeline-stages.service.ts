import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma/prisma.service';
import {
  EntityNotFoundException,
  ConflictException,
} from '../../shared/exceptions/app.exception';

@Injectable()
export class PipelineStagesService {
  constructor(private prisma: PrismaService) {}

  async create(
    organizationId: string,
    data: { name: string; order: number; isTerminal?: boolean },
  ) {
    const existing = await this.prisma.pipelineStage.findFirst({
      where: { organizationId, name: data.name },
    });

    if (existing) {
      throw new ConflictException(
        `Stage '${data.name}' já existe nesta organização`,
      );
    }

    return this.prisma.pipelineStage.create({
      data: {
        organizationId,
        name: data.name,
        order: data.order,
        isTerminal: data.isTerminal ?? false,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.pipelineStage.findMany({
      where: { organizationId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(organizationId: string, stageId: string) {
    const stage = await this.prisma.pipelineStage.findFirst({
      where: { id: stageId, organizationId },
    });

    if (!stage) {
      throw new EntityNotFoundException('Pipeline Stage', stageId);
    }

    return stage;
  }

  async update(
    organizationId: string,
    stageId: string,
    data: { name?: string; order?: number; isTerminal?: boolean },
  ) {
    await this.findOne(organizationId, stageId);

    return this.prisma.pipelineStage.update({
      where: { id: stageId },
      data,
    });
  }

  async remove(organizationId: string, stageId: string) {
    await this.findOne(organizationId, stageId);

    return this.prisma.pipelineStage.delete({
      where: { id: stageId },
    });
  }
}
