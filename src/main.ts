import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'public'));

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3000;

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global Interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger / OpenAPI Dokümantasyonu
  const swaggerConfig = new DocumentBuilder()
    .setTitle('E-Ticaret Backend API')
    .setDescription(
      'NestJS ile geliştirilmiş e-ticaret backend API dokümantasyonu. ' +
      'Ürün yönetimi, sepet yönetimi, kimlik doğrulama ve sipariş işlemleri içerir.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token giriniz',
      },
      'bearer',
    )
    .addTag('Auth', 'Kimlik doğrulama işlemleri')
    .addTag('Products', 'Ürün yönetimi')
    .addTag('Cart', 'Sepet yönetimi')
    .addTag('Orders', 'Sipariş yönetimi')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Seed default admin
  const usersService = app.get(UsersService);
  await usersService.seedAdmin();
  logger.log('Varsayılan admin kontrol edildi: admin@eticaret.com');

  await app.listen(port);

  logger.log(`Uygulama çalışıyor: http://localhost:${port}`);
  logger.log(`Swagger dokümantasyon: http://localhost:${port}/api/docs`);
}

bootstrap();
