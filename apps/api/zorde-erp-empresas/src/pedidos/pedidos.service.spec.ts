import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PedidosService } from './pedidos.service';
import { PrismaService } from '../infra/database/prisma/prisma.service';
import { createMockPedido, createMockPedidoWithRelations, createMockPipelineStage } from '../../test/factories/pedido.factory';
import { createMockPrismaService } from '../../test/factories/prisma.factory';
import { EntityNotFoundException } from '../shared/exceptions/app.exception';
import { PedidoStatusChangedEvent } from '../events/pedido.events';

describe('PedidosService', () => {
  let service: PedidosService;
  let prismaService: any;
  let eventEmitter: any;

  beforeEach(async () => {
    prismaService = createMockPrismaService();
    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidosService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitter,
        },
      ],
    }).compile();

    service = module.get<PedidosService>(PedidosService);
  });

  describe('create', () => {
    it('should create a pedido with relations', async () => {
      const createDto = {
        organizationId: 'org-1',
        produtoId: 'produto-1',
        currentStageId: 'stage-1',
      };

      const mockPedido = createMockPedidoWithRelations();
      prismaService.pedido.create.mockResolvedValue(mockPedido);

      const result = await service.create(createDto);

      expect(result).toEqual(mockPedido);
      expect(prismaService.pedido.create).toHaveBeenCalledWith({
        data: createDto,
        include: {
          produto: true,
          currentStage: true,
        },
      });
    });

    it('should include produto and currentStage relations', async () => {
      const createDto = {
        organizationId: 'org-1',
        produtoId: 'produto-1',
        currentStageId: 'stage-1',
      };

      prismaService.pedido.create.mockResolvedValue({
        ...createMockPedido(createDto),
        produto: { id: 'produto-1', descricao: 'Lente' },
        currentStage: { id: 'stage-1', name: 'Pedido Recebido' },
      });

      const result = await service.create(createDto);

      expect(result.produto).toBeDefined();
      expect(result.currentStage).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all pedidos with relations', async () => {
      const mockPedidos = [
        createMockPedidoWithRelations({ id: 'pedido-1' }),
        createMockPedidoWithRelations({ id: 'pedido-2' }),
      ];

      prismaService.pedido.findMany.mockResolvedValue(mockPedidos);

      const result = await service.findAll();

      expect(result).toEqual(mockPedidos);
      expect(prismaService.pedido.findMany).toHaveBeenCalledWith({
        include: {
          produto: true,
          currentStage: true,
        },
      });
    });

    it('should return empty array when no pedidos exist', async () => {
      prismaService.pedido.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return pedido by id with relations', async () => {
      const mockPedido = createMockPedidoWithRelations();
      prismaService.pedido.findUnique.mockResolvedValue(mockPedido);

      const result = await service.findOne('pedido-1');

      expect(result).toEqual(mockPedido);
      expect(prismaService.pedido.findUnique).toHaveBeenCalledWith({
        where: { id: 'pedido-1' },
        include: {
          produto: true,
          currentStage: true,
        },
      });
    });

    it('should throw EntityNotFoundException when pedido not found', async () => {
      prismaService.pedido.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(EntityNotFoundException);
    });

    it('should include produto and currentStage in result', async () => {
      const mockPedido = {
        ...createMockPedido(),
        produto: { id: 'produto-1', descricao: 'Lente' },
        currentStage: { id: 'stage-1', name: 'Pedido Recebido' },
      };

      prismaService.pedido.findUnique.mockResolvedValue(mockPedido);

      const result = await service.findOne('pedido-1');

      expect(result.produto).toBeDefined();
      expect(result.currentStage).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update pedido without emitting event if stage unchanged', async () => {
      const oldPedido = createMockPedidoWithRelations({ currentStageId: 'stage-1' });
      const updateDto = { currentStageId: 'stage-1' }; // same stage
      const updatedPedido = createMockPedidoWithRelations({ currentStageId: 'stage-1' });

      prismaService.pedido.findUnique.mockResolvedValue(oldPedido);
      prismaService.pedido.update.mockResolvedValue(updatedPedido);

      const result = await service.update('pedido-1', updateDto);

      expect(result).toEqual(updatedPedido);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should emit PedidoStatusChangedEvent when stage changes', async () => {
      const oldPedido = createMockPedidoWithRelations({ currentStageId: 'stage-1' });
      const updateDto = { currentStageId: 'stage-2' };
      const updatedPedido = createMockPedidoWithRelations({ currentStageId: 'stage-2' });

      prismaService.pedido.findUnique.mockResolvedValue(oldPedido);
      prismaService.pedido.update.mockResolvedValue(updatedPedido);

      const result = await service.update('pedido-1', updateDto);

      expect(result).toEqual(updatedPedido);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'pedido.status-changed',
        expect.objectContaining({
          pedidoId: 'pedido-1',
          fromStageId: 'stage-1',
          toStageId: 'stage-2',
          organizationId: 'org-1',
        }),
      );
    });

    it('should emit event with correct event data', async () => {
      const oldPedido = createMockPedidoWithRelations({
        id: 'pedido-123',
        organizationId: 'org-2',
        currentStageId: 'stage-1',
      });
      const updateDto = { currentStageId: 'stage-3' };
      const updatedPedido = createMockPedidoWithRelations({
        id: 'pedido-123',
        organizationId: 'org-2',
        currentStageId: 'stage-3',
      });

      prismaService.pedido.findUnique.mockResolvedValue(oldPedido);
      prismaService.pedido.update.mockResolvedValue(updatedPedido);

      await service.update('pedido-123', updateDto);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'pedido.status-changed',
        expect.objectContaining({
          pedidoId: 'pedido-123',
          fromStageId: 'stage-1',
          toStageId: 'stage-3',
          organizationId: 'org-2',
        }),
      );
    });

    it('should return updated pedido with relations', async () => {
      const oldPedido = createMockPedidoWithRelations();
      const updateDto = { currentStageId: 'stage-2' };
      const updatedPedido = createMockPedidoWithRelations({ currentStageId: 'stage-2' });

      prismaService.pedido.findUnique.mockResolvedValue(oldPedido);
      prismaService.pedido.update.mockResolvedValue(updatedPedido);

      const result = await service.update('pedido-1', updateDto);

      expect(result.produto).toBeDefined();
      expect(result.currentStage).toBeDefined();
    });

    it('should throw EntityNotFoundException if pedido not found', async () => {
      prismaService.pedido.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent-id', {})).rejects.toThrow(EntityNotFoundException);
    });

    it('should not emit event if currentStageId not in update dto', async () => {
      const oldPedido = createMockPedidoWithRelations();
      const updateDto = { produtoId: 'produto-2' }; // no stage change
      const updatedPedido = createMockPedidoWithRelations();

      prismaService.pedido.findUnique.mockResolvedValue(oldPedido);
      prismaService.pedido.update.mockResolvedValue(updatedPedido);

      await service.update('pedido-1', updateDto);

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete pedido', async () => {
      const mockPedido = createMockPedido();
      prismaService.pedido.findUnique.mockResolvedValue(mockPedido);
      prismaService.pedido.delete.mockResolvedValue(mockPedido);

      const result = await service.remove('pedido-1');

      expect(result).toEqual(mockPedido);
      expect(prismaService.pedido.delete).toHaveBeenCalledWith({
        where: { id: 'pedido-1' },
      });
    });

    it('should throw EntityNotFoundException if pedido not found', async () => {
      prismaService.pedido.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(EntityNotFoundException);
    });

    it('should verify pedido exists before deleting', async () => {
      const mockPedido = createMockPedido();
      prismaService.pedido.findUnique.mockResolvedValue(mockPedido);
      prismaService.pedido.delete.mockResolvedValue(mockPedido);

      await service.remove('pedido-1');

      // Both should be called
      expect(prismaService.pedido.findUnique).toHaveBeenCalled();
      expect(prismaService.pedido.delete).toHaveBeenCalled();
    });
  });

  describe('event emission', () => {
    it('should emit event on first status change', async () => {
      const oldPedido = createMockPedidoWithRelations({ currentStageId: 'stage-1' });
      const updateDto = { currentStageId: 'stage-2' };
      const updatedPedido = createMockPedidoWithRelations({ currentStageId: 'stage-2' });

      prismaService.pedido.findUnique.mockResolvedValue(oldPedido);
      prismaService.pedido.update.mockResolvedValue(updatedPedido);

      await service.update('pedido-1', updateDto);

      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit multiple events for sequential updates', async () => {
      const mockPedido1 = createMockPedidoWithRelations({ currentStageId: 'stage-1' });
      const mockPedido2 = createMockPedidoWithRelations({ currentStageId: 'stage-2' });
      const mockPedido3 = createMockPedidoWithRelations({ currentStageId: 'stage-3' });

      // First update
      prismaService.pedido.findUnique.mockResolvedValueOnce(mockPedido1);
      prismaService.pedido.update.mockResolvedValueOnce(mockPedido2);

      await service.update('pedido-1', { currentStageId: 'stage-2' });

      // Second update
      prismaService.pedido.findUnique.mockResolvedValueOnce(mockPedido2);
      prismaService.pedido.update.mockResolvedValueOnce(mockPedido3);

      await service.update('pedido-1', { currentStageId: 'stage-3' });

      expect(eventEmitter.emit).toHaveBeenCalledTimes(2);
    });
  });
});
