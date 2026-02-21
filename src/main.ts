import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggingInterceptor } from './interceptor/log.interceptor';
import { ExceptionsFilter } from './filter/exception.filter';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'debug', 'log'],
  });

  const config = new DocumentBuilder()
    .setTitle('Blog Api')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs/api-docs', app, document);

  app.set('query parse', 'extended');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(cookieParser());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new ExceptionsFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
