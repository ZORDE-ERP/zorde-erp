import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './infra/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClienteModule } from './modules/cliente/cliente.module';
import { FornecedorModule } from './modules/fornecedor/fornecedor.module';
import { OrdemDeServicoModule } from './modules/ordemDeServico/ordemDeServico.module';
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
		OrdemDeServicoModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
