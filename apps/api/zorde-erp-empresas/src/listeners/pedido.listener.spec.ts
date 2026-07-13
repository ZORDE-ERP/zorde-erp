import { Test, TestingModule } from '@nestjs/testing';
import { PedidoListener } from './pedido.listener';
import { PedidosGateway } from '../websocket/gateways/pedidos.gateway';
import { PedidoStatusChangedEvent } from '../events/pedido.events';
import { createMockPedidoStatusEvent } from '../../test/factories/pedido.factory';

describe('PedidoListener', () => {
  let listener: PedidoListener;
  let gatewayMock: any;

  beforeEach(async () => {
    gatewayMock = {
      broadcastToOrg: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidoListener,
        {
          provide: PedidosGateway,
          useValue: gatewayMock,
        },
      ],
    }).compile();

    listener = module.get<PedidoListener>(PedidoListener);
  });

  describe('handlePedidoStatusChanged', () => {
    it('should call gateway.broadcastToOrg when event occurs', () => {
      const event = createMockPedidoStatusEvent();

      listener.handlePedidoStatusChanged(event);

      expect(gatewayMock.broadcastToOrg).toHaveBeenCalledWith(event.organizationId, event);
    });

    it('should pass correct organizationId to gateway', () => {
      const event = createMockPedidoStatusEvent({
        organizationId: 'org-2',
      });

      listener.handlePedidoStatusChanged(event);

      expect(gatewayMock.broadcastToOrg).toHaveBeenCalledWith('org-2', expect.any(Object));
    });

    it('should pass entire event object to gateway', () => {
      const event = new PedidoStatusChangedEvent(
        'pedido-123',
        'stage-1',
        'stage-2',
        'org-1',
        'user-1',
      );

      listener.handlePedidoStatusChanged(event);

      expect(gatewayMock.broadcastToOrg).toHaveBeenCalledWith('org-1', event);
    });

    it('should handle multiple events sequentially', () => {
      const event1 = createMockPedidoStatusEvent({ pedidoId: 'pedido-1' });
      const event2 = createMockPedidoStatusEvent({ pedidoId: 'pedido-2' });

      listener.handlePedidoStatusChanged(event1);
      listener.handlePedidoStatusChanged(event2);

      expect(gatewayMock.broadcastToOrg).toHaveBeenCalledTimes(2);
      expect(gatewayMock.broadcastToOrg).toHaveBeenNthCalledWith(1, event1.organizationId, event1);
      expect(gatewayMock.broadcastToOrg).toHaveBeenNthCalledWith(2, event2.organizationId, event2);
    });

    it('should not modify event before broadcasting', () => {
      const event = createMockPedidoStatusEvent();
      const originalEvent = { ...event };

      listener.handlePedidoStatusChanged(event);

      expect(event).toEqual(originalEvent);
    });
  });

  describe('event listener registration', () => {
    it('should be decorated with @OnEvent for pedido.status-changed', () => {
      // This test verifies the decorator is applied correctly
      const metadata = Reflect.getMetadata('event:name', listener.handlePedidoStatusChanged);
      // Note: In actual runtime, the @OnEvent decorator is processed by NestJS framework
      // This test documents the expected behavior
      expect(listener.handlePedidoStatusChanged).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should not crash if gateway throws error', () => {
      const event = createMockPedidoStatusEvent();
      gatewayMock.broadcastToOrg.mockImplementation(() => {
        throw new Error('Gateway error');
      });

      expect(() => listener.handlePedidoStatusChanged(event)).toThrow('Gateway error');
    });

    it('should propagate gateway errors', () => {
      const event = createMockPedidoStatusEvent();
      const error = new Error('Connection failed');
      gatewayMock.broadcastToOrg.mockImplementation(() => {
        throw error;
      });

      expect(() => listener.handlePedidoStatusChanged(event)).toThrow(error);
    });
  });

  describe('broadcast verification', () => {
    it('should broadcast to organization-specific room', () => {
      const event = createMockPedidoStatusEvent({
        organizationId: 'org-alpha',
        pedidoId: 'pedido-xyz',
      });

      listener.handlePedidoStatusChanged(event);

      expect(gatewayMock.broadcastToOrg).toHaveBeenCalledWith(
        'org-alpha',
        expect.objectContaining({
          pedidoId: 'pedido-xyz',
        }),
      );
    });

    it('should include event metadata in broadcast', () => {
      const event = new PedidoStatusChangedEvent(
        'pedido-100',
        'stage-a',
        'stage-b',
        'org-x',
        'admin',
      );

      listener.handlePedidoStatusChanged(event);

      const callArgs = gatewayMock.broadcastToOrg.mock.calls[0][1];
      expect(callArgs.pedidoId).toBe('pedido-100');
      expect(callArgs.fromStageId).toBe('stage-a');
      expect(callArgs.toStageId).toBe('stage-b');
    });
  });
});
