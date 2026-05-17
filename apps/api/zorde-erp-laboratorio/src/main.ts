import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.SERVER_PORT!, () => {
    Logger.log(`Servidor iniciado com sucesso na porta ${process.env.SERVER_PORT}`);

  });
}
bootstrap();
