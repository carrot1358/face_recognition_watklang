import { Request } from 'express';
import { WebhookService } from './webhook.service';
import { StorageService } from '../storage/storage.service';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';
export declare class WebhookController {
    private readonly webhookService;
    private readonly storageService;
    private readonly logger;
    constructor(webhookService: WebhookService, storageService: StorageService);
    receiveWebhook(body: WebhookPayloadDto, files: Express.Multer.File[], req: Request): Promise<void>;
    clear(): Promise<void>;
    testMapping(body: any): Promise<{
        status: string;
        original: any;
        mapped: any;
        accessControlEvent: any;
    }>;
    testMinio(): Promise<{
        timestamp: string;
        connected: boolean;
        bucket: string;
        endpoint: string;
        error?: undefined;
    } | {
        connected: boolean;
        error: any;
        timestamp: string;
    }>;
    testUpload(files: Express.Multer.File[]): Promise<{
        error: string;
        status?: undefined;
        filename?: undefined;
        size?: undefined;
        mimetype?: undefined;
        url?: undefined;
        timestamp?: undefined;
    } | {
        status: string;
        filename: string;
        size: number;
        mimetype: string;
        url: string;
        timestamp: string;
        error?: undefined;
    } | {
        status: string;
        error: any;
        timestamp: string;
        filename?: undefined;
        size?: undefined;
        mimetype?: undefined;
        url?: undefined;
    }>;
}
