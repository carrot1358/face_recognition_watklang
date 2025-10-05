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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const webhook_service_1 = require("./webhook.service");
const storage_service_1 = require("../storage/storage.service");
const webhook_payload_dto_1 = require("./dto/webhook-payload.dto");
let WebhookController = WebhookController_1 = class WebhookController {
    constructor(webhookService, storageService) {
        this.webhookService = webhookService;
        this.storageService = storageService;
        this.logger = new common_1.Logger(WebhookController_1.name);
    }
    async receiveWebhook(body, files, req) {
        this.logger.log('Received Hikvision webhook');
        try {
            const result = await this.webhookService.processHikvisionWebhook(body, files, req.headers);
            this.logger.log(`Webhook processed successfully: Event ID ${result.eventId}, ${result.imageCount} images`);
        }
        catch (error) {
            this.logger.error(`Webhook processing failed: ${error.message}`);
            throw error;
        }
    }
    async clear() {
        this.logger.log('Clear endpoint called');
    }
    async testMapping(body) {
        this.logger.log('Testing data mapping');
        return this.webhookService.testMapping(body);
    }
    async testMinio() {
        this.logger.log('Testing MinIO connection');
        try {
            const result = await this.storageService.checkConnection();
            return {
                ...result,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`MinIO test error: ${error.message}`);
            return {
                connected: false,
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async testUpload(files) {
        this.logger.log('Testing MinIO upload');
        if (!files || files.length === 0) {
            return { error: 'No image file provided' };
        }
        const file = files[0];
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const ext = file.mimetype === 'image/jpeg' ? 'jpg' : 'png';
            const filename = `test_${timestamp}.${ext}`;
            const imageUrl = await this.storageService.uploadFile(filename, file.buffer, file.size, file.mimetype);
            this.logger.log(`Test upload successful: ${filename}`);
            return {
                status: 'success',
                filename,
                size: file.size,
                mimetype: file.mimetype,
                url: imageUrl,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Test upload failed: ${error.message}`);
            return {
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
};
exports.WebhookController = WebhookController;
__decorate([
    (0, common_1.Post)('recieve/httpHosts'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)()),
    (0, swagger_1.ApiOperation)({ summary: 'Receive Hikvision webhook events' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [webhook_payload_dto_1.WebhookPayloadDto, Array, Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "receiveWebhook", null);
__decorate([
    (0, common_1.Post)('recieve/clear'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Clear endpoint for testing' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Clear successful' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "clear", null);
__decorate([
    (0, common_1.Post)('test/mapping'),
    (0, swagger_1.ApiOperation)({ summary: 'Test data mapping from Hikvision format' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mapping test successful' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "testMapping", null);
__decorate([
    (0, common_1.Post)('minio/test'),
    (0, swagger_1.ApiOperation)({ summary: 'Test MinIO connection' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'MinIO test successful' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "testMinio", null);
__decorate([
    (0, common_1.Post)('minio/upload-test'),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)()),
    (0, swagger_1.ApiOperation)({ summary: 'Test MinIO file upload' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Upload test successful' }),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "testUpload", null);
exports.WebhookController = WebhookController = WebhookController_1 = __decorate([
    (0, swagger_1.ApiTags)('webhook'),
    (0, common_1.Controller)('webhook'),
    __metadata("design:paramtypes", [webhook_service_1.WebhookService,
        storage_service_1.StorageService])
], WebhookController);
//# sourceMappingURL=webhook.controller.js.map