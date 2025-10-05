"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nest_winston_1 = require("nest-winston");
const winston = require("winston");
const fs = require("fs");
const database_module_1 = require("./config/database.module");
const events_module_1 = require("./modules/events/events.module");
const images_module_1 = require("./modules/images/images.module");
const webhook_module_1 = require("./modules/webhook/webhook.module");
const health_module_1 = require("./modules/health/health.module");
const storage_module_1 = require("./modules/storage/storage.module");
fs.mkdirSync('logs', { recursive: true });
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            nest_winston_1.WinstonModule.forRoot({
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
            }),
            database_module_1.DatabaseModule,
            storage_module_1.StorageModule,
            events_module_1.EventsModule,
            images_module_1.ImagesModule,
            webhook_module_1.WebhookModule,
            health_module_1.HealthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map