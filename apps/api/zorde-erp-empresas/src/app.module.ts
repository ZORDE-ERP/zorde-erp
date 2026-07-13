import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { validateEnv } from './config/env.validation';
import { EstoqueModule } from './estoque/estoque.module';
import { DatabaseModule } from './infra/database/database.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { ProdutosModule } from './produtos/produtos.module';
import { FornecedoresModule } from './fornecedores/fornecedores.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { WebsocketModule } from './websocket/websocket.module';
import { PedidoListener } from './listeners/pedido.listener';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      validate: validateEnv,
    }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    AuthModule,
    AdminModule,
    ProdutosModule,
    EstoqueModule,
    PedidosModule,
    FornecedoresModule,
    WebsocketModule,
  ],
  controllers: [AppController],
  providers: [AppService, PedidoListener],
})
export class AppModule {}


