import { Test, TestingModule } from '@nestjs/testing';
import { FornecedoresService } from './fornecedores.service';
import { FornecedoresController } from './fornecedores.controller';
import { PrismaService } from '../infra/database/prisma/prisma.service';
import { createMockPrismaService } from '../../test/factories/prisma.factory';
import { EntityNotFoundException } from '../shared/exceptions/app.exception';

describe('Fornecedores (Service + Controller)', () => {
  let service: FornecedoresService;
  let controller: FornecedoresController;
  let prismaService: any;
  let serviceMock: any;

  beforeEach(async () => {
    prismaService = createMockPrismaService();

    // For Service tests
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FornecedoresService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<FornecedoresService>(FornecedoresService);

    // For Controller tests with mocked service
    serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const moduleWithMockedService: TestingModule = await Test.createTestingModule({
      controllers: [FornecedoresController],
      providers: [
        {
          provide: FornecedoresService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = moduleWithMockedService.get<FornecedoresController>(FornecedoresController);
  });

  const mockFornecedor = {
    id: 'fornecedor-1',
    nome: 'Óptica São Paulo',
    email: 'contato@optica-sp.com',
    telefone: '11-3000-0000',
    endereco: 'Av. Paulista, 1000',
    organizationId: 'org-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  describe('FornecedoresService', () => {
    describe('create', () => {
      it('should create fornecedor', async () => {
        prismaService.fornecedor.create.mockResolvedValue(mockFornecedor);

        const result = await service.create({
          nome: 'Óptica SP',
          email: 'contato@optica-sp.com',
          telefone: '11-3000-0000',
          endereco: 'Av. Paulista',
        });

        expect(result).toEqual(mockFornecedor);
      });
    });

    describe('findAll', () => {
      it('should return all fornecedores', async () => {
        const mockFornecedores = [mockFornecedor];
        prismaService.fornecedor.findMany.mockResolvedValue(mockFornecedores);

        const result = await service.findAll();

        expect(result).toEqual(mockFornecedores);
      });
    });

    describe('findOne', () => {
      it('should return fornecedor by id', async () => {
        prismaService.fornecedor.findUnique.mockResolvedValue(mockFornecedor);

        const result = await service.findOne('fornecedor-1');

        expect(result).toEqual(mockFornecedor);
      });

      it('should throw EntityNotFoundException if not found', async () => {
        prismaService.fornecedor.findUnique.mockResolvedValue(null);

        await expect(service.findOne('nonexistent')).rejects.toThrow(EntityNotFoundException);
      });
    });

    describe('update', () => {
      it('should update fornecedor', async () => {
        const updated = { ...mockFornecedor, telefone: '11-9999-9999' };
        prismaService.fornecedor.findUnique.mockResolvedValue(mockFornecedor);
        prismaService.fornecedor.update.mockResolvedValue(updated);

        const result = await service.update('fornecedor-1', { telefone: '11-9999-9999' });

        expect(result).toEqual(updated);
      });
    });

    describe('remove', () => {
      it('should delete fornecedor', async () => {
        prismaService.fornecedor.findUnique.mockResolvedValue(mockFornecedor);
        prismaService.fornecedor.delete.mockResolvedValue(mockFornecedor);

        const result = await service.remove('fornecedor-1');

        expect(result).toEqual(mockFornecedor);
      });
    });
  });

  describe('FornecedoresController', () => {
    describe('create', () => {
      it('should create fornecedor via controller', async () => {
        serviceMock.create.mockResolvedValue(mockFornecedor);

        const result = await controller.create({
          nome: 'Óptica SP',
          email: 'contato@optica-sp.com',
          telefone: '11-3000-0000',
          endereco: 'Av. Paulista',
        });

        expect(result).toEqual(mockFornecedor);
      });
    });

    describe('findAll', () => {
      it('should return all fornecedores via controller', async () => {
        serviceMock.findAll.mockResolvedValue([mockFornecedor]);

        const result = await controller.findAll();

        expect(result).toEqual([mockFornecedor]);
      });
    });

    describe('findOne', () => {
      it('should return fornecedor by id via controller', async () => {
        serviceMock.findOne.mockResolvedValue(mockFornecedor);

        const result = await controller.findOne('fornecedor-1');

        expect(result).toEqual(mockFornecedor);
      });
    });

    describe('update', () => {
      it('should update fornecedor via controller', async () => {
        const updated = { ...mockFornecedor, email: 'novo@email.com' };
        serviceMock.update.mockResolvedValue(updated);

        const result = await controller.update('fornecedor-1', { email: 'novo@email.com' });

        expect(result).toEqual(updated);
      });
    });

    describe('remove', () => {
      it('should delete fornecedor via controller', async () => {
        serviceMock.remove.mockResolvedValue(mockFornecedor);

        const result = await controller.remove('fornecedor-1');

        expect(result).toEqual(mockFornecedor);
      });
    });
  });
});
