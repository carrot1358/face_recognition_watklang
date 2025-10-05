import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService, HealthStatus } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get overall health status' })
  @ApiResponse({
    status: 200,
    description: 'Health status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['ok', 'error'] },
        timestamp: { type: 'string' },
        services: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['ok', 'error'] },
                responseTime: { type: 'number' },
                error: { type: 'string' },
              },
            },
            storage: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['ok', 'error'] },
                endpoint: { type: 'string' },
                bucket: { type: 'string' },
                error: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  async getHealth(): Promise<HealthStatus> {
    this.logger.log('Health check requested');
    return this.healthService.checkHealth();
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  async getLiveness() {
    return this.healthService.checkLiveness();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async getReadiness() {
    const result = await this.healthService.checkReadiness();

    if (result.status === 'error') {
      this.logger.warn('Readiness check failed', result.details);
    }

    return result;
  }

  // Legacy health endpoint for compatibility
  @Get('check')
  @ApiOperation({ summary: 'Simple health check (legacy)' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async legacyHealthCheck() {
    return { ok: true };
  }
}