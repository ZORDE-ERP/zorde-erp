import { Test, TestingModule } from '@nestjs/testing';
import { PipelineStagesService } from './pipeline-stages.service';
import { PrismaService } from '../../infra/database/prisma/prisma.service';
import { createMockPrismaService } from '../../../test/factories/prisma.factory';
import { ConflictException, EntityNotFoundException } from '../../shared/exceptions/app.exception';

describe('PipelineStagesService', () => {
  let service: PipelineStagesService;
  let prismaService: any;

  const mockStage = {
    id: 'stage-1',
    organizationId: 'org-1',
    name: 'Lente Pedida',
    order: 1,
    isTerminal: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prismaService = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineStagesService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<PipelineStagesService>(PipelineStagesService);
  });

  describe('create', () => {
    it('should create pipeline stage', async () => {
      prismaService.pipelineStage.findFirst.mockResolvedValue(null);
      prismaService.pipelineStage.create.mockResolvedValue(mockStage);

      const result = await service.create('org-1', {
        name: 'Lente Pedida',
        order: 1,
      });

      expect(result).toEqual(mockStage);
      expect(prismaService.pipelineStage.findFirst).toHaveBeenCalledWith({
        where: { organizationId: 'org-1', name: 'Lente Pedida' },
      });
    });

    it('should throw ConflictException if stage name exists', async () => {
      prismaService.pipelineStage.findFirst.mockResolvedValue(mockStage);

      await expect(
        service.create('org-1', { name: 'Lente Pedida', order: 1 }),
      ).rejects.toThrow(ConflictException);
    });

    it('should set isTerminal to false by default', async () => {
      prismaService.pipelineStage.findFirst.mockResolvedValue(null);
      prismaService.pipelineStage.create.mockResolvedValue(mockStage);

      await service.create('org-1', { name: 'Lente Pedida', order: 1 });

      expect(prismaService.pipelineStage.create).toHaveBeenCalledWith({
        data: {
          organizationId: 'org-1',
          name: 'Lente Pedida',
          order: 1,
          isTerminal: false,
        },
      });
    });

    it('should set isTerminal when provided', async () => {
      prismaService.pipelineStage.findFirst.mockResolvedValue(null);
      prismaService.pipelineStage.create.mockResolvedValue({
        ...mockStage,
        isTerminal: true,
      });

      await service.create('org-1', { name: 'Completo', order: 5, isTerminal: true });

      expect(prismaService.pipelineStage.create).toHaveBeenCalledWith({
        data: {
          organizationId: 'org-1',
          name: 'Completo',
          order: 5,
          isTerminal: true,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all stages sorted by order', async () => {
      const stages = [
        { ...mockStage, order: 1 },
        { ...mockStage, id: 'stage-2', name: 'Em Montagem', order: 2 },
        { ...mockStage, id: 'stage-3', name: 'Completo', order: 3 },
      ];
      prismaService.pipelineStage.findMany.mockResolvedValue(stages);

      const result = await service.findAll('org-1');

      expect(result).toEqual(stages);
      expect(prismaService.pipelineStage.findMany).toHaveBeenCalledWith({
        where: { organizationId: 'org-1' },
        orderBy: { order: 'asc' },
      });
    });

    it('should return empty array when no stages exist', async () => {
      prismaService.pipelineStage.findMany.mockResolvedValue([]);

      const result = await service.findAll('org-1');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return stage by id', async () => {
      prismaService.pipelineStage.findFirst.mockResolvedValue(mockStage);

      const result = await service.findOne('org-1', 'stage-1');

      expect(result).toEqual(mockStage);
    });

    it('should throw EntityNotFoundException if not found', async () => {
      prismaService.pipelineStage.findFirst.mockResolvedValue(null);

      await expect(service.findOne('org-1', 'nonexistent')).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update stage order', async () => {
      const updated = { ...mockStage, order: 2 };
      prismaService.pipelineStage.findFirst.mockResolvedValue(mockStage);
      prismaService.pipelineStage.update.mockResolvedValue(updated);

      const result = await service.update('org-1', 'stage-1', { order: 2 });

      expect(result.order).toBe(2);
      expect(prismaService.pipelineStage.update).toHaveBeenCalledWith({
        where: { id: 'stage-1' },
        data: { order: 2 },
      });
    });

    it('should update stage name', async () => {
      const updated = { ...mockStage, name: 'Novo Nome' };
      prismaService.pipelineStage.findFirst.mockResolvedValue(mockStage);
      prismaService.pipelineStage.update.mockResolvedValue(updated);

      const result = await service.update('org-1', 'stage-1', { name: 'Novo Nome' });

      expect(result.name).toBe('Novo Nome');
    });

    it('should update isTerminal flag', async () => {
      const updated = { ...mockStage, isTerminal: true };
      prismaService.pipelineStage.findFirst.mockResolvedValue(mockStage);
      prismaService.pipelineStage.update.mockResolvedValue(updated);

      const result = await service.update('org-1', 'stage-1', { isTerminal: true });

      expect(result.isTerminal).toBe(true);
    });

    it('should throw EntityNotFoundException if stage not found', async () => {
      prismaService.pipelineStage.findFirst.mockResolvedValue(null);

      await expect(service.update('org-1', 'nonexistent', { order: 2 })).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete stage', async () => {
      prismaService.pipelineStage.findFirst.mockResolvedValue(mockStage);
      prismaService.pipelineStage.delete.mockResolvedValue(mockStage);

      const result = await service.remove('org-1', 'stage-1');

      expect(result).toEqual(mockStage);
      expect(prismaService.pipelineStage.delete).toHaveBeenCalledWith({
        where: { id: 'stage-1' },
      });
    });

    it('should throw EntityNotFoundException if not found', async () => {
      prismaService.pipelineStage.findFirst.mockResolvedValue(null);

      await expect(service.remove('org-1', 'nonexistent')).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });
});
