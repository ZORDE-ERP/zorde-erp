import { Module } from '@nestjs/common';
import { PedidosGateway } from './gateways/pedidos.gateway';

@Module({
  providers: [PedidosGateway],
  exports: [PedidosGateway],
})
export class WebsocketModule {}
