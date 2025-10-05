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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateImageDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateImageDto {
}
exports.CreateImageDto = CreateImageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event ID this image belongs to' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateImageDto.prototype, "eventId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filename of the image' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateImageDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Original filename from upload', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateImageDto.prototype, "originalName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'MIME type of the image' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateImageDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Size of the image in bytes' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateImageDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'MinIO storage path' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateImageDto.prototype, "minioPath", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Public URL to access the image' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateImageDto.prototype, "publicUrl", void 0);
//# sourceMappingURL=create-image.dto.js.map