import { Test, TestingModule } from '@nestjs/testing';
import { EstoqueService } from './estoque.service';
import { EstoqueController } from './estoque.controller';
import { PrismaService } from '../infra/database/prisma/prisma.service';
import { createMockPrismaService } from '../../test/factories/prisma.factory';
import { EntityNotFoundException } from '../shared/exceptions/app.exception';

describe('Estoque (Service + Controller)', () => {
  let service: EstoqueService;
  let controller: EstoqueController;
  let prismaService: any;
  let serviceMock: any;

  beforeEach(async () => {
    prismaService = createMockPrismaService();

    // For Service tests
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstoqueService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<EstoqueService>(EstoqueService);

    // For Controller tests with mocked service
    serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const moduleWithMockedService: TestingModule = await Test.createTestingModule({
      controllers: [EstoqueController],
      providers: [
        {
          provide: EstoqueService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = moduleWithMockedService.get<EstoqueController>(EstoqueController);
  });

  const mockEstoque = {
    id: 'estoque-1',
    produtoId: 'produto-1',
    quantidade: 100,
    organizationId: 'org-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('EstoqueService', () => {
    describe('create', () => {
      it('should create estoque', async () => {
        prismaService.estoque.create.mockResolvedValue(mockEstoque);

        const result = await service.create({
          produtoId: 'produto-1',
          quantidade: 100,
        });

        expect(result).toEqual(mockEstoque);
      });
    });

    describe('findAll', () => {
      it('should return all estoque items', async () => {
        const mockEstoques = [mockEstoque, { ...mockEstoque, id: 'estoque-2', quantidade: 50 }];
        prismaService.estoque.findMany.mockResolvedValue(mockEstoques);

        const result = await service.findAll();

        expect(result).toEqual(mockEstoques);
      });
    });

    describe('findOne', () => {
      it('should return estoque by id', async () => {
        prismaService.estoque.findUnique.mockResolvedValue(mockEstoque);

        const result = await service.findOne('estoque-1');

        expect(result).toEqual(mockEstoque);
      });

      it('should throw EntityNotFoundException if not found', async () => {
        prismaService.estoque.findUnique.mockResolvedValue(null);

        await expect(service.findOne('nonexistent')).rejects.toThrow(EntityNotFoundException);
      });
    });

    describe('update', () => {
      it('should update estoque quantity', async () => {
        const updated = { ...mockEstoque, quantidade: 150 };
        prismaService.estoque.findUnique.mockResolvedValue(mockEstoque);
        prismaService.estoque.update.mockResolvedValue(updated);

        const result = await service.update('estoque-1', { quantidade: 150 });

        expect(result).toEqual(updated);
      });
    });

    describe('remove', () => {
      it('should delete estoque', async () => {
        prismaService.estoque.findUnique.mockResolvedValue(mockEstoque);
        prismaService.estoque.delete.mockResolvedValue(mockEstoque);

        const result = await service.remove('estoque-1');

        expect(result).toEqual(mockEstoque);
      });
    });
  });

  describe('EstoqueController', () => {
    describe('create', () => {
      it('should create estoque via controller', async () => {
        serviceMock.create.mockResolvedValue(mockEstoque);

        const result = await controller.create({
          produtoId: 'produto-1',
          quantidade: 100,
        });

        expect(result).toEqual(mockEstoque);
      });
    });

    describe('findAll', () => {
      it('should return all estoque via controller', async () => {
        serviceMock.findAll.mockResolvedValue([mockEstoque]);

        const result = await controller.findAll();

        expect(result).toEqual([mockEstoque]);
      });
    });

    describe('findOne', () => {
      it('should return estoque by id via controller', async () => {
        serviceMock.findOne.mockResolvedValue(mockEstoque);

        const result = await controller.findOne('estoque-1');

        expect(result).toEqual(mockEstoque);
      });
    });

    describe('update', () => {
      it('should update estoque via controller', async () => {
        const updated = { ...mockEstoque, quantidade: 200 };
        serviceMock.update.mockResolvedValue(updated);

        const result = await controller.update('estoque-1', { quantidade: 200 });

        expect(result).toEqual(updated);
      });
    });

    describe('remove', () => {
      it('should delete estoque via controller', async () => {
        serviceMock.remove.mockResolvedValue(mockEstoque);

        const result = await controller.remove('estoque-1');

        expect(result).toEqual(mockEstoque);
      });
    });
  });
});
