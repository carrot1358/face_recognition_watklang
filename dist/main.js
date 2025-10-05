"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const nest_winston_1 = require("nest-winston");
const winston = require("winston");
const fs = require("fs");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
async function bootstrap() {
    fs.mkdirSync('logs', { recursive: true });
    const winstonLogger = winston.createLogger({
        level: 'debug',
        format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.colorize(), winston.format.printf(({ timestamp, level, message, stack }) => {
            return `${timestamp} [${level}]: ${message}${stack ? '\n' + stack : ''}`;
        })),
        transports: [
            new winston.transports.Console({ level: 'debug' }),
            new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
            new winston.transports.File({ filename: 'logs/debug.log', level: 'debug' }),
            new winston.transports.File({ filename: 'logs/combined.log' }),
        ],
    });
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: nest_winston_1.WinstonModule.createLogger({
            instance: winstonLogger,
        }),
    });
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new transform_interceptor_1.TransformInterceptor());
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        disableErrorMessages: false,
    }));
    app.enableCors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Hikvision Webhook API')
        .setDescription('API for processing Hikvision camera access control events')
        .setVersion('1.0')
        .addTag('webhook', 'Webhook endpoints for receiving events')
        .addTag('events', 'Access event management')
        .addTag('images', 'Image management')
        .addTag('health', 'Health check endpoints')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    const port = process.env.PORT || 8080;
    await app.listen(port);
    winstonLogger.info(`Server running on port ${port}`);
    winstonLogger.info(`Swagger API documentation available at http://localhost:${port}/api`);
    winstonLogger.info(`MinIO Console: ${process.env.MINIO_ENDPOINT || 'Not configured'}`);
    winstonLogger.info(`Images stored in bucket: ${process.env.MINIO_BUCKET || 'hikvision-images'}`);
}
bootstrap();
//# sourceMappingURL=main.js.map