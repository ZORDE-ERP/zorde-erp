import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PedidoStatusChangedEvent } from '../events/pedido.events';
import { PedidosGateway } from '../websocket/gateways/pedidos.gateway';

@Injectable()
export class PedidoListener {
  constructor(
    @Inject(PedidosGateway) private pedidosGateway: PedidosGateway,
  ) {}

  @OnEvent('pedido.status-changed')
  handlePedidoStatusChanged(event: PedidoStatusChangedEvent) {
    this.pedidosGateway.broadcastToOrg(event.organizationId, event);
  }
}
