import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as fs from 'fs';

import { DatabaseModule } from './config/database.module';
import { EventsModule } from './modules/events/events.module';
import { ImagesModule } from './modules/images/images.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { HealthModule } from './modules/health/health.module';
import { StorageModule } from './modules/storage/storage.module';

// Create logs directory
fs.mkdirSync('logs', { recursive: true });

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    WinstonModule.forRoot({
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
    }),
    DatabaseModule,
    StorageModule,
    EventsModule,
    ImagesModule,
    WebhookModule,
    HealthModule,
  ],
})
export class AppModule {}