import { PedidosGateway } from './pedidos.gateway';
import { createMockPedidoStatusEvent } from '../../../test/factories/pedido.factory';
import { PedidoStatusChangedEvent } from '../../events/pedido.events';

describe('PedidosGateway', () => {
  let gateway: PedidosGateway;
  let serverMock: any;
  let socketMock: any;

  beforeEach(() => {
    gateway = new PedidosGateway();

    socketMock = {
      id: 'socket-1',
      join: jest.fn(),
      emit: jest.fn(),
      on: jest.fn(),
    };

    serverMock = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
      on: jest.fn(),
    };

    // Inject server mock into gateway (normally done by NestJS)
    gateway['server'] = serverMock;
  });

  describe('handleConnection', () => {
    it('should handle client connection', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      gateway.handleConnection(socketMock);

      expect(consoleSpy).toHaveBeenCalledWith(`Client connected: ${socketMock.id}`);
      consoleSpy.mockRestore();
    });

    it('should log connection with socket id', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const customSocket = { ...socketMock, id: 'custom-id-123' };

      gateway.handleConnection(customSocket);

      expect(consoleSpy).toHaveBeenCalledWith('Client connected: custom-id-123');
      consoleSpy.mockRestore();
    });
  });

  describe('handleDisconnect', () => {
    it('should handle client disconnection', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      gateway.handleDisconnect(socketMock);

      expect(consoleSpy).toHaveBeenCalledWith(`Client disconnected: ${socketMock.id}`);
      consoleSpy.mockRestore();
    });

    it('should log disconnection with socket id', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const customSocket = { ...socketMock, id: 'leaving-client' };

      gateway.handleDisconnect(customSocket);

      expect(consoleSpy).toHaveBeenCalledWith('Client disconnected: leaving-client');
      consoleSpy.mockRestore();
    });
  });

  describe('handleJoinOrg', () => {
    it('should join client to org room', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      gateway.handleJoinOrg({ organizationId: 'org-1' }, socketMock);

      expect(socketMock.join).toHaveBeenCalledWith('org-org-1');
      expect(consoleSpy).toHaveBeenCalledWith(`Client ${socketMock.id} joined room: org-org-1`);
      consoleSpy.mockRestore();
    });

    it('should use correct room naming convention', () => {
      gateway.handleJoinOrg({ organizationId: 'org-123' }, socketMock);

      expect(socketMock.join).toHaveBeenCalledWith('org-org-123');
    });

    it('should handle different organization ids', () => {
      const orgIds = ['org-1', 'org-2', 'org-alpha', 'org-xyz'];

      orgIds.forEach((orgId) => {
        socketMock.join.mockClear();
        gateway.handleJoinOrg({ organizationId: orgId }, socketMock);
        expect(socketMock.join).toHaveBeenCalledWith(`org-${orgId}`);
      });
    });

    it('should log room join with correct format', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      gateway.handleJoinOrg({ organizationId: 'org-test' }, socketMock);

      expect(consoleSpy).toHaveBeenCalledWith('Client socket-1 joined room: org-org-test');
      consoleSpy.mockRestore();
    });
  });

  describe('broadcastToOrg', () => {
    it('should broadcast status change event to organization room', () => {
      const event = createMockPedidoStatusEvent({ organizationId: 'org-1' });

      gateway.broadcastToOrg('org-1', event);

      expect(serverMock.to).toHaveBeenCalledWith('org-org-1');
      expect(serverMock.emit).toHaveBeenCalledWith('pedido:status-changed', expect.any(Object));
    });

    it('should include event data in broadcast message', () => {
      const event = createMockPedidoStatusEvent({
        pedidoId: 'pedido-123',
        fromStageId: 'stage-1',
        toStageId: 'stage-2',
        changedBy: 'user-1',
      });

      gateway.broadcastToOrg('org-1', event);

      const emitCall = serverMock.emit.mock.calls[0];
      expect(emitCall[0]).toBe('pedido:status-changed');
      expect(emitCall[1]).toMatchObject({
        pedidoId: 'pedido-123',
        fromStageId: 'stage-1',
        toStageId: 'stage-2',
        changedBy: 'user-1',
      });
    });

    it('should include timestamp in broadcast', () => {
      const event = createMockPedidoStatusEvent();

      gateway.broadcastToOrg('org-1', event);

      const emitCall = serverMock.emit.mock.calls[0][1];
      expect(emitCall.timestamp).toBeInstanceOf(Date);
    });

    it('should use correct room naming for broadcast', () => {
      const event = createMockPedidoStatusEvent();

      gateway.broadcastToOrg('org-2', event);

      expect(serverMock.to).toHaveBeenCalledWith('org-org-2');
    });

    it('should not broadcast if server is not initialized', () => {
      gateway['server'] = null;
      const event = createMockPedidoStatusEvent();

      // Should not throw
      gateway.broadcastToOrg('org-1', event);
    });

    it('should use emit method on server', () => {
      const event = createMockPedidoStatusEvent();

      gateway.broadcastToOrg('org-1', event);

      expect(serverMock.emit).toHaveBeenCalled();
    });
  });

  describe('multi-org isolation', () => {
    it('should broadcast only to correct organization room', () => {
      const event1 = createMockPedidoStatusEvent({ organizationId: 'org-1' });
      const event2 = createMockPedidoStatusEvent({ organizationId: 'org-2' });

      gateway.broadcastToOrg('org-1', event1);
      expect(serverMock.to).toHaveBeenCalledWith('org-org-1');

      serverMock.to.mockClear();

      gateway.broadcastToOrg('org-2', event2);
      expect(serverMock.to).toHaveBeenCalledWith('org-org-2');
    });

    it('should prevent cross-organization message leakage', () => {
      const event = createMockPedidoStatusEvent({ organizationId: 'org-1' });

      gateway.broadcastToOrg('org-1', event);

      // Should only broadcast to org-1 room, not org-2
      const toCall = serverMock.to.mock.calls[0][0];
      expect(toCall).toBe('org-org-1');
      expect(toCall).not.toBe('org-org-2');
    });
  });

  describe('Socket.IO event emission', () => {
    it('should emit with event name pedido:status-changed', () => {
      const event = createMockPedidoStatusEvent();

      gateway.broadcastToOrg('org-1', event);

      expect(serverMock.emit).toHaveBeenCalledWith('pedido:status-changed', expect.any(Object));
    });

    it('should chain to() and emit() correctly', () => {
      const event = createMockPedidoStatusEvent();

      gateway.broadcastToOrg('org-1', event);

      expect(serverMock.to).toHaveBeenCalled();
      expect(serverMock.emit).toHaveBeenCalled();
    });

    it('should pass all event details to broadcast', () => {
      const event = new PedidoStatusChangedEvent(
        'pedido-test',
        'stage-from',
        'stage-to',
        'org-test',
        'changed-by-user',
      );

      gateway.broadcastToOrg('org-test', event);

      const broadcastData = serverMock.emit.mock.calls[0][1];
      expect(broadcastData.pedidoId).toBe('pedido-test');
      expect(broadcastData.fromStageId).toBe('stage-from');
      expect(broadcastData.toStageId).toBe('stage-to');
      expect(broadcastData.changedBy).toBe('changed-by-user');
    });
  });
});
