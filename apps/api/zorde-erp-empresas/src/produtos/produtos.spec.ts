import { Test, TestingModule } from '@nestjs/testing';
import { ProdutosService } from './produtos.service';
import { ProdutosController } from './produtos.controller';
import { PrismaService } from '../infra/database/prisma/prisma.service';
import { createMockPrismaService } from '../../test/factories/prisma.factory';
import { EntityNotFoundException } from '../shared/exceptions/app.exception';

describe('Produtos (Service + Controller)', () => {
  let service: ProdutosService;
  let controller: ProdutosController;
  let prismaService: any;
  let serviceMock: any;

  const mockProduto = {
    id: 'produto-1',
    descricao: 'Lente de Contato',
    preco: 150.0,
    organizationId: 'org-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prismaService = createMockPrismaService();

    // For Service tests
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutosService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<ProdutosService>(ProdutosService);

    // For Controller tests with mocked service
    serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const moduleWithMockedService: TestingModule = await Test.createTestingModule({
      controllers: [ProdutosController],
      providers: [
        {
          provide: ProdutosService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = moduleWithMockedService.get<ProdutosController>(ProdutosController);
  });

  describe('ProdutosService', () => {
    describe('create', () => {
      it('should create produto', async () => {
        prismaService.produto.create.mockResolvedValue(mockProduto);

        const result = await service.create({ descricao: 'Lente', preco: 150.0 });

        expect(result).toEqual(mockProduto);
        expect(prismaService.produto.create).toHaveBeenCalled();
      });
    });

    describe('findAll', () => {
      it('should return all produtos', async () => {
        const mockProdutos = [mockProduto, { ...mockProduto, id: 'produto-2' }];
        prismaService.produto.findMany.mockResolvedValue(mockProdutos);

        const result = await service.findAll();

        expect(result).toEqual(mockProdutos);
      });
    });

    describe('findOne', () => {
      it('should return produto by id', async () => {
        prismaService.produto.findUnique.mockResolvedValue(mockProduto);

        const result = await service.findOne('produto-1');

        expect(result).toEqual(mockProduto);
      });

      it('should throw EntityNotFoundException if not found', async () => {
        prismaService.produto.findUnique.mockResolvedValue(null);

        await expect(service.findOne('nonexistent')).rejects.toThrow(EntityNotFoundException);
      });
    });

    describe('update', () => {
      it('should update produto', async () => {
        const updated = { ...mockProduto, preco: 200.0 };
        prismaService.produto.findUnique.mockResolvedValue(mockProduto);
        prismaService.produto.update.mockResolvedValue(updated);

        const result = await service.update('produto-1', { preco: 200.0 });

        expect(result).toEqual(updated);
      });
    });

    describe('remove', () => {
      it('should delete produto', async () => {
        prismaService.produto.findUnique.mockResolvedValue(mockProduto);
        prismaService.produto.delete.mockResolvedValue(mockProduto);

        const result = await service.remove('produto-1');

        expect(result).toEqual(mockProduto);
      });
    });
  });

  describe('ProdutosController', () => {
    describe('create', () => {
      it('should create produto via controller', async () => {
        serviceMock.create.mockResolvedValue(mockProduto);

        const result = await controller.create({ descricao: 'Lente', preco: 150.0 });

        expect(result).toEqual(mockProduto);
      });
    });

    describe('findAll', () => {
      it('should return all produtos via controller', async () => {
        serviceMock.findAll.mockResolvedValue([mockProduto]);

        const result = await controller.findAll();

        expect(result).toEqual([mockProduto]);
      });
    });

    describe('findOne', () => {
      it('should return produto by id via controller', async () => {
        serviceMock.findOne.mockResolvedValue(mockProduto);

        const result = await controller.findOne('produto-1');

        expect(result).toEqual(mockProduto);
      });
    });

    describe('update', () => {
      it('should update produto via controller', async () => {
        const updated = { ...mockProduto, preco: 250.0 };
        serviceMock.update.mockResolvedValue(updated);

        const result = await controller.update('produto-1', { preco: 250.0 });

        expect(result).toEqual(updated);
      });
    });

    describe('remove', () => {
      it('should delete produto via controller', async () => {
        serviceMock.remove.mockResolvedValue(mockProduto);

        const result = await controller.remove('produto-1');

        expect(result).toEqual(mockProduto);
      });
    });
  });
});
