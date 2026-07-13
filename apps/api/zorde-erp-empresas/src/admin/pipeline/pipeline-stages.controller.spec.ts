import { Test, TestingModule } from '@nestjs/testing';
import { PipelineStagesController } from './pipeline-stages.controller';
import { PipelineStagesService } from './pipeline-stages.service';

describe('PipelineStagesController', () => {
  let controller: PipelineStagesController;
  let serviceMock: any;

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
    serviceMock = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PipelineStagesController],
      providers: [
        {
          provide: PipelineStagesService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<PipelineStagesController>(PipelineStagesController);
  });

  describe('findAll', () => {
    it('should return all stages', async () => {
      const stages = [mockStage];
      serviceMock.findAll.mockResolvedValue(stages);

      const result = await controller.findAll('org-1');

      expect(result).toEqual(stages);
      expect(serviceMock.findAll).toHaveBeenCalledWith('org-1');
    });
  });

  describe('findOne', () => {
    it('should return stage by id', async () => {
      serviceMock.findOne.mockResolvedValue(mockStage);

      const result = await controller.findOne('org-1', 'stage-1');

      expect(result).toEqual(mockStage);
      expect(serviceMock.findOne).toHaveBeenCalledWith('org-1', 'stage-1');
    });
  });

  describe('create', () => {
    it('should create pipeline stage', async () => {
      serviceMock.create.mockResolvedValue(mockStage);

      const result = await controller.create('org-1', {
        name: 'Lente Pedida',
        order: 1,
      });

      expect(result).toEqual(mockStage);
      expect(serviceMock.create).toHaveBeenCalledWith('org-1', {
        name: 'Lente Pedida',
        order: 1,
      });
    });
  });

  describe('update', () => {
    it('should update stage', async () => {
      const updated = { ...mockStage, order: 2 };
      serviceMock.update.mockResolvedValue(updated);

      const result = await controller.update('org-1', 'stage-1', { order: 2 });

      expect(result.order).toBe(2);
      expect(serviceMock.update).toHaveBeenCalledWith('org-1', 'stage-1', { order: 2 });
    });
  });

  describe('remove', () => {
    it('should delete stage', async () => {
      serviceMock.remove.mockResolvedValue(mockStage);

      const result = await controller.remove('org-1', 'stage-1');

      expect(result).toEqual(mockStage);
      expect(serviceMock.remove).toHaveBeenCalledWith('org-1', 'stage-1');
    });
  });
});
