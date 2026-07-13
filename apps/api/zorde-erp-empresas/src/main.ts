import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PermissionGuard } from './auth/guards/permission.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // Global Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Guards
  const reflector = app.get('Reflector');
  app.useGlobalGuards(
    new JwtAuthGuard(reflector),
    new PermissionGuard(reflector),
  );

  await app.listen(process.env.API_PORT ?? 3001);
  console.log(`✅ API rodando em http://localhost:${process.env.API_PORT ?? 3001}`);
}
bootstrap();

