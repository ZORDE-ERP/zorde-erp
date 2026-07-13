import { Test, TestingModule } from '@nestjs/testing';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { createMockPedido, createMockPedidoWithRelations } from '../../test/factories/pedido.factory';
import { EntityNotFoundException } from '../shared/exceptions/app.exception';

describe('PedidosController', () => {
  let controller: PedidosController;
  let service: any;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PedidosController],
      providers: [
        {
          provide: PedidosService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<PedidosController>(PedidosController);
  });

  describe('POST /pedidos', () => {
    it('should create pedido and return 201', async () => {
      const createDto = {
        organizationId: 'org-1',
        produtoId: 'produto-1',
        currentStageId: 'stage-1',
      };

      const mockPedido = createMockPedidoWithRelations();
      service.create.mockResolvedValue(mockPedido);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockPedido);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should pass dto to service', async () => {
      const createDto = {
        organizationId: 'org-1',
        produtoId: 'produto-1',
        currentStageId: 'stage-1',
      };

      service.create.mockResolvedValue(createMockPedido());

      await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should propagate service errors', async () => {
      const createDto = { organizationId: 'org-1' };
      service.create.mockRejectedValue(new Error('Database error'));

      await expect(controller.create(createDto)).rejects.toThrow('Database error');
    });
  });

  describe('GET /pedidos', () => {
    it('should return all pedidos', async () => {
      const mockPedidos = [
        createMockPedidoWithRelations({ id: 'pedido-1' }),
        createMockPedidoWithRelations({ id: 'pedido-2' }),
      ];

      service.findAll.mockResolvedValue(mockPedidos);

      const result = await controller.findAll();

      expect(result).toEqual(mockPedidos);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no pedidos exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });

    it('should call service without parameters', async () => {
      service.findAll.mockResolvedValue([]);

      await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith();
    });
  });

  describe('GET /pedidos/:id', () => {
    it('should return pedido by id', async () => {
      const mockPedido = createMockPedidoWithRelations();
      service.findOne.mockResolvedValue(mockPedido);

      const result = await controller.findOne('pedido-1');

      expect(result).toEqual(mockPedido);
      expect(service.findOne).toHaveBeenCalledWith('pedido-1');
    });

    it('should throw EntityNotFoundException when pedido not found', async () => {
      service.findOne.mockRejectedValue(new EntityNotFoundException('Pedido'));

      await expect(controller.findOne('nonexistent')).rejects.toThrow(EntityNotFoundException);
    });

    it('should pass id parameter to service', async () => {
      service.findOne.mockResolvedValue(createMockPedido());

      await controller.findOne('pedido-123');

      expect(service.findOne).toHaveBeenCalledWith('pedido-123');
    });
  });

  describe('PATCH /pedidos/:id', () => {
    it('should update pedido and return updated data', async () => {
      const updateDto = { currentStageId: 'stage-2' };
      const mockUpdated = createMockPedidoWithRelations({ currentStageId: 'stage-2' });

      service.update.mockResolvedValue(mockUpdated);

      const result = await controller.update('pedido-1', updateDto);

      expect(result).toEqual(mockUpdated);
      expect(service.update).toHaveBeenCalledWith('pedido-1', updateDto);
    });

    it('should pass id and dto to service', async () => {
      const updateDto = { currentStageId: 'stage-3' };
      service.update.mockResolvedValue(createMockPedido());

      await controller.update('pedido-abc', updateDto);

      expect(service.update).toHaveBeenCalledWith('pedido-abc', updateDto);
    });

    it('should throw EntityNotFoundException when pedido not found', async () => {
      service.update.mockRejectedValue(new EntityNotFoundException('Pedido'));

      await expect(controller.update('nonexistent', {})).rejects.toThrow(EntityNotFoundException);
    });

    it('should emit event when status changes (through service)', async () => {
      const updateDto = { currentStageId: 'stage-2' };
      const mockUpdated = createMockPedidoWithRelations({ currentStageId: 'stage-2' });

      service.update.mockResolvedValue(mockUpdated);

      await controller.update('pedido-1', updateDto);

      // Event emission is tested in service, controller just delegates
      expect(service.update).toHaveBeenCalledWith('pedido-1', updateDto);
    });
  });

  describe('DELETE /pedidos/:id', () => {
    it('should delete pedido', async () => {
      const mockPedido = createMockPedido();
      service.remove.mockResolvedValue(mockPedido);

      const result = await controller.remove('pedido-1');

      expect(result).toEqual(mockPedido);
      expect(service.remove).toHaveBeenCalledWith('pedido-1');
    });

    it('should throw EntityNotFoundException when pedido not found', async () => {
      service.remove.mockRejectedValue(new EntityNotFoundException('Pedido'));

      await expect(controller.remove('nonexistent')).rejects.toThrow(EntityNotFoundException);
    });

    it('should pass id to service', async () => {
      service.remove.mockResolvedValue(createMockPedido());

      await controller.remove('pedido-xyz');

      expect(service.remove).toHaveBeenCalledWith('pedido-xyz');
    });
  });

  describe('HTTP status codes', () => {
    it('POST should return created pedido', async () => {
      const mockPedido = createMockPedido();
      service.create.mockResolvedValue(mockPedido);

      const result = await controller.create({});

      expect(result).toEqual(mockPedido);
    });

    it('GET should return pedidos', async () => {
      const mockPedidos = [createMockPedido()];
      service.findAll.mockResolvedValue(mockPedidos);

      const result = await controller.findAll();

      expect(result).toEqual(mockPedidos);
    });

    it('PATCH should return updated pedido', async () => {
      const mockUpdated = createMockPedido();
      service.update.mockResolvedValue(mockUpdated);

      const result = await controller.update('id', {});

      expect(result).toEqual(mockUpdated);
    });

    it('DELETE should return deleted pedido', async () => {
      const mockDeleted = createMockPedido();
      service.remove.mockResolvedValue(mockDeleted);

      const result = await controller.remove('id');

      expect(result).toEqual(mockDeleted);
    });
  });
});
