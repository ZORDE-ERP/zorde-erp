import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/errors/http-exception.filter';

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix('v1');

	// Ativar cookie-parser para leitura do cookie HttpOnly de fingerprint
	app.use(cookieParser());

	// Registrar filtro global de tratamento de erros
	app.useGlobalFilters(new HttpExceptionFilter());

	// Habilitar CORS
	app.enableCors({
		origin: true,
		credentials: true,
	});

	const port = process.env.API_PORT || 3000;
	await app.listen(port, () => {
		Logger.log(`Servidor iniciado com sucesso na porta ${port}`);
	});
}
bootstrap();
