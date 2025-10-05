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
var ImagesController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const images_service_1 = require("./images.service");
const image_entity_1 = require("./entities/image.entity");
let ImagesController = ImagesController_1 = class ImagesController {
    constructor(imagesService) {
        this.imagesService = imagesService;
        this.logger = new common_1.Logger(ImagesController_1.name);
    }
    async findByEventId(eventId) {
        this.logger.log(`Finding images for event: ${eventId}`);
        return this.imagesService.findByEventId(eventId);
    }
    async deleteByEventId(eventId) {
        this.logger.log(`Deleting images for event: ${eventId}`);
        await this.imagesService.deleteByEventId(eventId);
        return { message: `Images for event ${eventId} deleted successfully` };
    }
};
exports.ImagesController = ImagesController;
__decorate([
    (0, common_1.Get)('event/:eventId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all images for a specific event' }),
    (0, swagger_1.ApiParam)({ name: 'eventId', description: 'Event ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Images retrieved successfully', type: [image_entity_1.ImageEntity] }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('eventId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "findByEventId", null);
__decorate([
    (0, common_1.Delete)('event/:eventId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete all images for a specific event' }),
    (0, swagger_1.ApiParam)({ name: 'eventId', description: 'Event ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Images deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('eventId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "deleteByEventId", null);
exports.ImagesController = ImagesController = ImagesController_1 = __decorate([
    (0, swagger_1.ApiTags)('images'),
    (0, common_1.Controller)('api/images'),
    __metadata("design:paramtypes", [images_service_1.ImagesService])
], ImagesController);
//# sourceMappingURL=images.controller.js.map