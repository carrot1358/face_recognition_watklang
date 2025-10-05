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
var WebhookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const common_1 = require("@nestjs/common");
const events_service_1 = require("../events/events.service");
const images_service_1 = require("../images/images.service");
const storage_service_1 = require("../storage/storage.service");
let WebhookService = WebhookService_1 = class WebhookService {
    constructor(eventsService, imagesService, storageService) {
        this.eventsService = eventsService;
        this.imagesService = imagesService;
        this.storageService = storageService;
        this.logger = new common_1.Logger(WebhookService_1.name);
    }
    async processHikvisionWebhook(body, files, headers) {
        let eventData = null;
        let savedImages = [];
        try {
            this.logger.debug('Raw Request Headers:', JSON.stringify(headers, null, 2));
            this.logger.debug('Raw Request Body:', JSON.stringify(body, null, 2));
            this.logger.debug('Raw Request Files:', files ? files.map(f => ({
                fieldname: f.fieldname,
                originalname: f.originalname,
                mimetype: f.mimetype,
                size: f.size,
            })) : 'No files');
            if (body && body.event_log) {
                try {
                    eventData = JSON.parse(body.event_log);
                    this.logger.log('Received event data:', JSON.stringify(eventData, null, 2));
                }
                catch (e) {
                    this.logger.error(`Failed to parse event_log: ${e.message}`);
                    this.logger.warn(`Raw event_log: ${body.event_log}`);
                }
            }
            else if (body) {
                this.logger.log('Received body data:', JSON.stringify(body, null, 2));
            }
            const accessControlEvent = eventData?.AccessControllerEvent;
            const mappedEventData = await this.eventsService.mapHikvisionData(eventData, accessControlEvent);
            const accessEvent = await this.eventsService.create(mappedEventData);
            this.logger.log(`Saved event to database with ID: ${accessEvent.id}`);
            if (files && files.length > 0) {
                for (const [index, file] of files.entries()) {
                    if (file.mimetype?.startsWith('image/')) {
                        try {
                            const savedImage = await this.imagesService.processUploadedFile(file, accessEvent.id, index);
                            savedImages.push(savedImage);
                            this.logger.log(`Processed image: ${savedImage.filename}`);
                        }
                        catch (error) {
                            this.logger.error(`Failed to process image ${index}: ${error.message}`);
                        }
                    }
                    else {
                        const content = file.buffer.toString('utf8');
                        this.logger.log(`Field ${file.fieldname}: ${content.substring(0, 100)}...`);
                    }
                }
            }
            this.logger.log(`Processing complete - Event ID: ${accessEvent.id}, Images: ${savedImages.length}`);
            return {
                eventId: accessEvent.id,
                imageCount: savedImages.length,
            };
        }
        catch (error) {
            this.logger.error(`Webhook processing error: ${error.message}`, error);
            throw error;
        }
    }
    async testMapping(body) {
        try {
            const eventData = body;
            const accessControlEvent = eventData?.AccessControllerEvent;
            const mappedData = await this.eventsService.mapHikvisionData(eventData, accessControlEvent);
            this.logger.debug('Test mapping result:', JSON.stringify({
                original: eventData,
                mapped: mappedData,
                accessControlEvent: accessControlEvent,
            }, null, 2));
            return {
                status: 'success',
                original: eventData,
                mapped: mappedData,
                accessControlEvent: accessControlEvent,
            };
        }
        catch (error) {
            this.logger.error(`Test mapping error: ${error.message}`);
            throw error;
        }
    }
};
exports.WebhookService = WebhookService;
exports.WebhookService = WebhookService = WebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [events_service_1.EventsService,
        images_service_1.ImagesService,
        storage_service_1.StorageService])
], WebhookService);
//# sourceMappingURL=webhook.service.js.map