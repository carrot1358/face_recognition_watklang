import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async checkHealth(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();
    const health: HealthStatus = {
      status: 'ok',
      timestamp,
      services: {
        database: { status: 'ok' },
        storage: { status: 'ok' },
      },
    };

    // Check database health
    try {
      const startTime = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;

      health.services.database = {
        status: 'ok',
        responseTime,
      };

      this.logger.debug(`Database health check: OK (${responseTime}ms)`);
    } catch (error) {
      health.services.database = {
        status: 'error',
        error: error.message,
      };
      health.status = 'error';
      this.logger.error(`Database health check failed: ${error.message}`);
    }

    // Check MinIO/storage health
    try {
      const storageStatus = await this.storageService.checkConnection();

      if (storageStatus.connected) {
        health.services.storage = {
          status: 'ok',
          endpoint: storageStatus.endpoint,
          bucket: storageStatus.bucket,
        };
        this.logger.debug('Storage health check: OK');
      } else {
        health.services.storage = {
          status: 'error',
          endpoint: storageStatus.endpoint,
          bucket: storageStatus.bucket,
          error: 'Connection failed',
        };
        health.status = 'error';
        this.logger.error('Storage health check failed: Connection failed');
      }
    } catch (error) {
      health.services.storage = {
        status: 'error',
        error: error.message,
      };
      health.status = 'error';
      this.logger.error(`Storage health check failed: ${error.message}`);
    }

    return health;
  }

  async checkLiveness(): Promise<{ status: 'ok' }> {
    // Simple liveness check - just return OK if the service is running
    return { status: 'ok' };
  }

  async checkReadiness(): Promise<{ status: 'ok' | 'error'; details?: any }> {
    try {
      const health = await this.checkHealth();

      if (health.status === 'ok') {
        return { status: 'ok' };
      } else {
        return {
          status: 'error',
          details: health.services,
        };
      }
    } catch (error) {
      this.logger.error(`Readiness check failed: ${error.message}`);
      return {
        status: 'error',
        details: { error: error.message },
      };
    }
  }
}