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
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const minio_1 = require("minio");
const app_config_1 = require("../../config/app.config");
let StorageService = StorageService_1 = class StorageService {
    constructor() {
        this.logger = new common_1.Logger(StorageService_1.name);
        this.minioConfig = (0, app_config_1.getMinioConfig)();
        this.minioClient = new minio_1.Client({
            endPoint: this.minioConfig.endPoint,
            port: this.minioConfig.port,
            useSSL: this.minioConfig.useSSL,
            accessKey: this.minioConfig.accessKey,
            secretKey: this.minioConfig.secretKey,
        });
    }
    async onModuleInit() {
        await this.ensureBucket();
    }
    async ensureBucket() {
        try {
            const exists = await this.minioClient.bucketExists(this.minioConfig.bucket);
            if (!exists) {
                await this.minioClient.makeBucket(this.minioConfig.bucket, 'ap-southeast-1');
                this.logger.log(`Created MinIO bucket: ${this.minioConfig.bucket}`);
            }
            else {
                this.logger.log(`MinIO bucket exists: ${this.minioConfig.bucket}`);
            }
            const policy = {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: { AWS: ['*'] },
                        Action: ['s3:GetObject'],
                        Resource: [`arn:aws:s3:::${this.minioConfig.bucket}/*`],
                    },
                ],
            };
            await this.minioClient.setBucketPolicy(this.minioConfig.bucket, JSON.stringify(policy));
            this.logger.log(`Set public read policy for bucket: ${this.minioConfig.bucket}`);
        }
        catch (error) {
            this.logger.error(`MinIO error: ${error.message}`);
            if (error.message.includes('policy')) {
                this.logger.warn('Cannot set bucket policy - images may not be publicly accessible');
            }
        }
    }
    async uploadFile(filename, buffer, size, contentType) {
        try {
            await this.minioClient.putObject(this.minioConfig.bucket, filename, buffer, size, {
                'Content-Type': contentType,
            });
            const protocol = this.minioConfig.useSSL ? 'https' : 'http';
            const portSuffix = (this.minioConfig.port === 80 || this.minioConfig.port === 443) ? '' : `:${this.minioConfig.port}`;
            const imageUrl = `${protocol}://${this.minioConfig.endPoint}${portSuffix}/${this.minioConfig.bucket}/${filename}`;
            this.logger.log(`Uploaded file to MinIO: ${filename}`);
            return imageUrl;
        }
        catch (error) {
            this.logger.error(`MinIO upload failed: ${error.message}`);
            throw error;
        }
    }
    async deleteFile(filename) {
        try {
            await this.minioClient.removeObject(this.minioConfig.bucket, filename);
            this.logger.log(`Deleted file from MinIO: ${filename}`);
        }
        catch (error) {
            this.logger.error(`MinIO delete failed: ${error.message}`);
            throw error;
        }
    }
    async checkConnection() {
        try {
            const exists = await this.minioClient.bucketExists(this.minioConfig.bucket);
            const protocol = this.minioConfig.useSSL ? 'https' : 'http';
            const endpoint = `${protocol}://${this.minioConfig.endPoint}:${this.minioConfig.port}`;
            return {
                connected: true,
                bucket: this.minioConfig.bucket,
                endpoint,
            };
        }
        catch (error) {
            this.logger.error(`MinIO connection check failed: ${error.message}`);
            return {
                connected: false,
                bucket: this.minioConfig.bucket,
                endpoint: `Error: ${error.message}`,
            };
        }
    }
    getMinioConfig() {
        return this.minioConfig;
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], StorageService);
//# sourceMappingURL=storage.service.js.map