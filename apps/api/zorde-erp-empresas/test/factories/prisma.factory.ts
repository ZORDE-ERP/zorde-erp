import { createMockUser } from './user.factory';
import { createMockPedido } from './pedido.factory';

export const createMockPrismaService = () => ({
  // Users
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  // Pedidos
  pedido: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  // Produtos
  produto: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  // Fornecedores
  fornecedor: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  // Estoque
  estoque: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  // Roles
  role: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  // Permissions
  permission: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  // Pipeline Stages
  pipelineStage: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  // Order Status History
  orderStatusHistory: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
});

export const setupMockPrismaForLogin = (prismaService) => {
  prismaService.user.findUnique.mockResolvedValue(
    createMockUser({
      email: 'test@example.com',
    }),
  );
};

export const setupMockPrismaForPedidoCreate = (prismaService) => {
  prismaService.pedido.create.mockResolvedValue(createMockPedido());
  prismaService.produto.findUnique.mockResolvedValue({
    id: 'produto-1',
    descricao: 'Lente',
  });
};
