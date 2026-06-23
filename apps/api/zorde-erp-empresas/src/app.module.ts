import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { validateEnv } from './config/env.validation';
import { EstoqueModule } from './estoque/estoque.module';
import { DatabaseModule } from './infra/database/database.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { ProdutosModule } from './produtos/produtos.module';
import { FornecedoresModule } from './fornecedores/fornecedores.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      validate: validateEnv,
    }),
    DatabaseModule,
    ProdutosModule,
    EstoqueModule,
    PedidosModule,
    FornecedoresModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
