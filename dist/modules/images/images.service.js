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
var ImagesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
const storage_service_1 = require("../storage/storage.service");
const fs = require("fs");
const path = require("path");
let ImagesService = ImagesService_1 = class ImagesService {
    constructor(prisma, storageService) {
        this.prisma = prisma;
        this.storageService = storageService;
        this.logger = new common_1.Logger(ImagesService_1.name);
    }
    async create(createImageDto) {
        try {
            this.logger.debug('Creating image record:', JSON.stringify(createImageDto, null, 2));
            const image = await this.prisma.accessImage.create({
                data: createImageDto,
            });
            this.logger.log(`Created image record with ID: ${image.id}`);
            return image;
        }
        catch (error) {
            this.logger.error(`Failed to create image record: ${error.message}`);
            throw error;
        }
    }
    async processUploadedFile(file, eventId, index = 0) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const ext = file.mimetype === 'image/jpeg' ? 'jpg' : 'png';
            const filename = `${timestamp}_${index}.${ext}`;
            this.logger.debug('Processing uploaded file:', JSON.stringify({
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                filename,
                eventId,
            }, null, 2));
            try {
                const imageUrl = await this.storageService.uploadFile(filename, file.buffer, file.size, file.mimetype);
                const imageData = {
                    eventId,
                    filename,
                    originalName: file.originalname || null,
                    mimeType: file.mimetype,
                    size: file.size,
                    minioPath: `${this.storageService.getMinioConfig().bucket}/${filename}`,
                    publicUrl: imageUrl,
                };
                const savedImage = await this.create(imageData);
                this.logger.log(`Successfully saved image to MinIO and DB: ${filename}`);
                this.logger.log(`Image URL: ${imageUrl}`);
                return savedImage;
            }
            catch (minioError) {
                this.logger.error(`MinIO upload failed: ${minioError.message}`);
                const imgDir = 'data/imgs';
                fs.mkdirSync(imgDir, { recursive: true });
                const filepath = path.join(imgDir, filename);
                fs.writeFileSync(filepath, file.buffer);
                const localImageData = {
                    eventId,
                    filename,
                    originalName: file.originalname || null,
                    mimeType: file.mimetype,
                    size: file.size,
                    minioPath: `local/${filename}`,
                    publicUrl: `/data/imgs/${filename}`,
                };
                const savedImage = await this.create(localImageData);
                this.logger.warn(`Fallback to local storage: ${filename}`);
                return savedImage;
            }
        }
        catch (error) {
            this.logger.error(`Failed to process uploaded file: ${error.message}`);
            throw error;
        }
    }
    async findByEventId(eventId) {
        try {
            const images = await this.prisma.accessImage.findMany({
                where: { eventId },
                orderBy: { createdAt: 'asc' },
            });
            this.logger.debug(`Found ${images.length} images for event ${eventId}`);
            return images;
        }
        catch (error) {
            this.logger.error(`Failed to find images for event ${eventId}: ${error.message}`);
            throw error;
        }
    }
    async deleteByEventId(eventId) {
        try {
            const images = await this.findByEventId(eventId);
            for (const image of images) {
                try {
                    if (image.minioPath.startsWith('local/')) {
                        const filepath = path.join('data/imgs', image.filename);
                        if (fs.existsSync(filepath)) {
                            fs.unlinkSync(filepath);
                        }
                    }
                    else {
                        await this.storageService.deleteFile(image.filename);
                    }
                }
                catch (fileError) {
                    this.logger.error(`Failed to delete file ${image.filename}: ${fileError.message}`);
                }
            }
            await this.prisma.accessImage.deleteMany({
                where: { eventId },
            });
            this.logger.log(`Deleted ${images.length} images for event ${eventId}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete images for event ${eventId}: ${error.message}`);
            throw error;
        }
    }
};
exports.ImagesService = ImagesService;
exports.ImagesService = ImagesService = ImagesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService])
], ImagesService);
//# sourceMappingURL=images.service.js.map