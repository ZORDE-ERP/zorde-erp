import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './infra/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuardStrategy } from './modules/auth/presentation/guards/jwtAuth.guard';
import { ClienteModule } from './modules/cliente/cliente.module';
import { FornecedorModule } from './modules/fornecedor/fornecedor.module';
import { ServiceOrderModule } from './modules/ordemDeServico/ordemDeServico.module';
import { ServicoModule } from './modules/servico/servico.module';
import { SolicitacaoCadastroModule } from './modules/solicitacaoCadastro/solicitacaoCadastro.module';
import { TabelaMontagemModule } from './modules/tabelaMontagem/tabelaMontagem.module';
import { UsuarioModule } from './modules/usuario/usuario.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validate: validateEnv,
			load: [databaseConfig],
		}),
		DatabaseModule,
		AuthModule,
		UsuarioModule,
		SolicitacaoCadastroModule,
		ClienteModule,
		FornecedorModule,
		TabelaMontagemModule,
		ServicoModule,
		ServiceOrderModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuardStrategy,
		},
	],
})
export class AppModule {}
