import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as fs from 'fs';

// Import global middleware
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  // Create logs directory
  fs.mkdirSync('logs', { recursive: true });

  // Create Winston logger
  const winstonLogger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level}]: ${message}${stack ? '\n' + stack : ''}`;
      }),
    ),
    transports: [
      new winston.transports.Console({ level: 'debug' }),
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/debug.log', level: 'debug' }),
      new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
  });

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: winstonLogger,
    }),
  });

  // Global exception filter for error handling
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: false,
    }),
  );

  // Enable CORS if needed
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Hikvision Webhook API')
    .setDescription('API for processing Hikvision camera access control events')
    .setVersion('1.0')
    .addTag('webhook', 'Webhook endpoints for receiving events')
    .addTag('events', 'Access event management')
    .addTag('images', 'Image management')
    .addTag('health', 'Health check endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 8080;
  await app.listen(port);

  winstonLogger.info(`Server running on port ${port}`);
  winstonLogger.info(`Swagger API documentation available at http://localhost:${port}/api`);
  winstonLogger.info(`MinIO Console: ${process.env.MINIO_ENDPOINT || 'Not configured'}`);
  winstonLogger.info(`Images stored in bucket: ${process.env.MINIO_BUCKET || 'hikvision-images'}`);
}

bootstrap();