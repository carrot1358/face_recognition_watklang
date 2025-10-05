import { PrismaService } from '../../config/prisma.service';
import { StorageService } from '../storage/storage.service';
export interface HealthStatus {
    status: 'ok' | 'error';
    timestamp: string;
    services: {
        database: {
            status: 'ok' | 'error';
            responseTime?: number;
            error?: string;
        };
        storage: {
            status: 'ok' | 'error';
            endpoint?: string;
            bucket?: string;
            error?: string;
        };
    };
}
export declare class HealthService {
    private prisma;
    private storageService;
    private readonly logger;
    constructor(prisma: PrismaService, storageService: StorageService);
    checkHealth(): Promise<HealthStatus>;
    checkLiveness(): Promise<{
        status: 'ok';
    }>;
    checkReadiness(): Promise<{
        status: 'ok' | 'error';
        details?: any;
    }>;
}
