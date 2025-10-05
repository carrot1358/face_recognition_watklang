import { OnModuleInit } from '@nestjs/common';
import { MinioConfig } from '../../config/app.config';
export declare class StorageService implements OnModuleInit {
    private readonly logger;
    private minioClient;
    private minioConfig;
    constructor();
    onModuleInit(): Promise<void>;
    ensureBucket(): Promise<void>;
    uploadFile(filename: string, buffer: Buffer, size: number, contentType: string): Promise<string>;
    deleteFile(filename: string): Promise<void>;
    checkConnection(): Promise<{
        connected: boolean;
        bucket: string;
        endpoint: string;
    }>;
    getMinioConfig(): MinioConfig;
}
