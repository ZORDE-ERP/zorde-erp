import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './shared/errors/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
