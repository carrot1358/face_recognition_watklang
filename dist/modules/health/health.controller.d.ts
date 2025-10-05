import { HealthService, HealthStatus } from './health.service';
export declare class HealthController {
    private readonly healthService;
    private readonly logger;
    constructor(healthService: HealthService);
    getHealth(): Promise<HealthStatus>;
    getLiveness(): Promise<{
        status: "ok";
    }>;
    getReadiness(): Promise<{
        status: "ok" | "error";
        details?: any;
    }>;
    legacyHealthCheck(): Promise<{
        ok: boolean;
    }>;
}
