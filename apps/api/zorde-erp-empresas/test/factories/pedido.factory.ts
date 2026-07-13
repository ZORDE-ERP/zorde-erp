export const createMockPedido = (overrides = {}) => ({
  id: 'pedido-uuid-1',
  organizationId: 'org-1',
  produtoId: 'produto-1',
  clienteId: 'cliente-1',
  currentStageId: 'stage-1',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

export const createMockPedidoWithRelations = (overrides = {}) => ({
  ...createMockPedido(overrides),
  produto: {
    id: 'produto-1',
    descricao: 'Lente de Contato',
    preco: 150.0,
  },
  currentStage: {
    id: 'stage-1',
    organizationId: 'org-1',
    name: 'Pedido Recebido',
    order: 1,
    isTerminal: false,
  },
});

export const createMockPipelineStage = (overrides = {}) => ({
  id: 'stage-1',
  organizationId: 'org-1',
  name: 'Pedido Recebido',
  order: 1,
  isTerminal: false,
  createdAt: new Date(),
  ...overrides,
});

export const createMockPedidoStatusEvent = (overrides = {}) => ({
  pedidoId: 'pedido-1',
  fromStageId: 'stage-1',
  toStageId: 'stage-2',
  organizationId: 'org-1',
  changedBy: 'user-1',
  timestamp: new Date(),
  ...overrides,
});
