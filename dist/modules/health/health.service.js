"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var HealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
const storage_service_1 = require("../storage/storage.service");
let HealthService = HealthService_1 = class HealthService {
    constructor(prisma, storageService) {
        this.prisma = prisma;
        this.storageService = storageService;
        this.logger = new common_1.Logger(HealthService_1.name);
    }
    async checkHealth() {
        const timestamp = new Date().toISOString();
        const health = {
            status: 'ok',
            timestamp,
            services: {
                database: { status: 'ok' },
                storage: { status: 'ok' },
            },
        };
        try {
            const startTime = Date.now();
            await this.prisma.$queryRaw `SELECT 1`;
            const responseTime = Date.now() - startTime;
            health.services.database = {
                status: 'ok',
                responseTime,
            };
            this.logger.debug(`Database health check: OK (${responseTime}ms)`);
        }
        catch (error) {
            health.services.database = {
                status: 'error',
                error: error.message,
            };
            health.status = 'error';
            this.logger.error(`Database health check failed: ${error.message}`);
        }
        try {
            const storageStatus = await this.storageService.checkConnection();
            if (storageStatus.connected) {
                health.services.storage = {
                    status: 'ok',
                    endpoint: storageStatus.endpoint,
                    bucket: storageStatus.bucket,
                };
                this.logger.debug('Storage health check: OK');
            }
            else {
                health.services.storage = {
                    status: 'error',
                    endpoint: storageStatus.endpoint,
                    bucket: storageStatus.bucket,
                    error: 'Connection failed',
                };
                health.status = 'error';
                this.logger.error('Storage health check failed: Connection failed');
            }
        }
        catch (error) {
            health.services.storage = {
                status: 'error',
                error: error.message,
            };
            health.status = 'error';
            this.logger.error(`Storage health check failed: ${error.message}`);
        }
        return health;
    }
    async checkLiveness() {
        return { status: 'ok' };
    }
    async checkReadiness() {
        try {
            const health = await this.checkHealth();
            if (health.status === 'ok') {
                return { status: 'ok' };
            }
            else {
                return {
                    status: 'error',
                    details: health.services,
                };
            }
        }
        catch (error) {
            this.logger.error(`Readiness check failed: ${error.message}`);
            return {
                status: 'error',
                details: { error: error.message },
            };
        }
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = HealthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService])
], HealthService);
//# sourceMappingURL=health.service.js.map